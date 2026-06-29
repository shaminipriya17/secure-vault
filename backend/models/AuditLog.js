import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const auditLogSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4(),
    },
    action: {
      type: String,
      required: [true, "Audit action is required"],
      enum: {
        values: [
          "auth:login",
          "auth:logout",
          "auth:login_failed",
          "auth:token_refresh",
          "auth:password_change",
          "auth:password_reset_request",
          "auth:password_reset_complete",
          "auth:account_locked",
          "auth:account_unlocked",
          "auth:mfa_enabled",
          "auth:mfa_disabled",
          "user:create",
          "user:read",
          "user:update",
          "user:delete",
          "user:activate",
          "user:deactivate",
          "user:role_change",
          "user:permission_change",
          "vault:create",
          "vault:read",
          "vault:update",
          "vault:delete",
          "vault:lock",
          "vault:unlock",
          "vault:share",
          "vault:unshare",
          "vault:access_granted",
          "vault:access_revoked",
          "vault:export",
          "vault:import",
          "vault.entry:create",
          "vault.entry:read",
          "vault.entry:update",
          "vault.entry:delete",
          "audit:read",
          "audit:export",
          "system:error",
          "system:config_change",
        ],
        message: "Invalid audit action",
      },
    },
    actor: {
      userId: {
        type: String,
        ref: "User",
        default: null,
      },
      email: {
        type: String,
        default: null,
        lowercase: true,
        trim: true,
      },
      role: {
        type: String,
        default: null,
      },
      ipAddress: {
        type: String,
        required: [true, "IP address is required"],
        trim: true,
      },
      userAgent: {
        type: String,
        default: null,
        maxlength: [500, "User agent cannot exceed 500 characters"],
      },
      sessionId: {
        type: String,
        default: null,
      },
    },
    resource: {
      type: {
        type: String,
        enum: {
          values: ["user", "vault", "vault_entry", "audit", "auth", "system"],
          message: "Resource type must be one of: user, vault, vault_entry, audit, auth, system",
        },
        default: null,
      },
      id: {
        type: String,
        default: null,
      },
      name: {
        type: String,
        default: null,
        maxlength: [200, "Resource name cannot exceed 200 characters"],
      },
    },
    outcome: {
      type: String,
      required: [true, "Outcome is required"],
      enum: {
        values: ["success", "failure", "error", "warning"],
        message: "Outcome must be one of: success, failure, error, warning",
      },
    },
    severity: {
      type: String,
      required: [true, "Severity is required"],
      enum: {
        values: ["low", "medium", "high", "critical"],
        message: "Severity must be one of: low, medium, high, critical",
      },
      default: "low",
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
      validate: {
        validator: function (val) {
          if (!val) return true;
          const str = JSON.stringify(val);
          return str.length <= 10240;
        },
        message: "Details payload cannot exceed 10KB",
      },
    },
    changes: {
      before: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
      },
      after: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
      },
    },
    errorDetails: {
      code: {
        type: String,
        default: null,
      },
      message: {
        type: String,
        default: null,
        maxlength: [1000, "Error message cannot exceed 1000 characters"],
      },
      stack: {
        type: String,
        default: null,
        select: false,
      },
    },
    requestMetadata: {
      method: {
        type: String,
        enum: {
          values: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
          message: "Invalid HTTP method",
        },
        default: null,
      },
      endpoint: {
        type: String,
        default: null,
        maxlength: [500, "Endpoint cannot exceed 500 characters"],
      },
      statusCode: {
        type: Number,
        default: null,
        min: [100, "Status code must be at least 100"],
        max: [599, "Status code cannot exceed 599"],
      },
      responseTimeMs: {
        type: Number,
        default: null,
        min: [0, "Response time cannot be negative"],
      },
      requestId: {
        type: String,
        default: null,
      },
    },
    geoLocation: {
      country: {
        type: String,
        default: null,
        maxlength: [100, "Country cannot exceed 100 characters"],
      },
      region: {
        type: String,
        default: null,
        maxlength: [100, "Region cannot exceed 100 characters"],
      },
      city: {
        type: String,
        default: null,
        maxlength: [100, "City cannot exceed 100 characters"],
      },
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (tags) => tags.length <= 10,
        message: "Cannot have more than 10 tags on an audit log",
      },
    },
    retentionExpiresAt: {
      type: Date,
      default: () => {
        const date = new Date();
        date.setFullYear(date.getFullYear() + 2);
        return date;
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform(doc, ret) {
        delete ret.errorDetails?.stack;
        return ret;
      },
    },
  }
);

auditLogSchema.index({ "actor.userId": 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ outcome: 1 });
auditLogSchema.index({ severity: 1 });
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ "resource.type": 1, "resource.id": 1 });
auditLogSchema.index({ "actor.ipAddress": 1 });
auditLogSchema.index({ retentionExpiresAt: 1 }, { expireAfterSeconds: 0 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ "actor.userId": 1, createdAt: -1 });
auditLogSchema.index({ severity: 1, createdAt: -1 });
auditLogSchema.index({ outcome: 1, createdAt: -1 });

auditLogSchema.statics.log = async function (params) {
  const {
    action,
    actorUserId = null,
    actorEmail = null,
    actorRole = null,
    ipAddress,
    userAgent = null,
    sessionId = null,
    resourceType = null,
    resourceId = null,
    resourceName = null,
    outcome,
    severity = "low",
    details = {},
    changesBefore = null,
    changesAfter = null,
    errorCode = null,
    errorMessage = null,
    errorStack = null,
    method = null,
    endpoint = null,
    statusCode = null,
    responseTimeMs = null,
    requestId = null,
    tags = [],
  } = params;

  const entry = new this({
    action,
    actor: {
      userId: actorUserId,
      email: actorEmail,
      role: actorRole,
      ipAddress,
      userAgent,
      sessionId,
    },
    resource: {
      type: resourceType,
      id: resourceId,
      name: resourceName,
    },
    outcome,
    severity,
    details,
    changes: {
      before: changesBefore,
      after: changesAfter,
    },
    errorDetails: {
      code: errorCode,
      message: errorMessage,
      stack: errorStack,
    },
    requestMetadata: {
      method,
      endpoint,
      statusCode,
      responseTimeMs,
      requestId,
    },
    tags,
  });

  return entry.save();
};

auditLogSchema.statics.findByUser = function (userId, limit = 50, skip = 0) {
  return this.find({ "actor.userId": userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

auditLogSchema.statics.findByResource = function (resourceType, resourceId, limit = 50, skip = 0) {
  return this.find({ "resource.type": resourceType, "resource.id": resourceId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

auditLogSchema.statics.findCritical = function (limit = 100, skip = 0) {
  return this.find({ severity: "critical" })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

auditLogSchema.statics.findFailedLogins = function (ipAddress = null, limit = 50, skip = 0) {
  const query = { action: "auth:login_failed", outcome: "failure" };
  if (ipAddress) query["actor.ipAddress"] = ipAddress;
  return this.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
};

auditLogSchema.statics.countByAction = function (action, fromDate = null, toDate = null) {
  const query = { action };
  if (fromDate || toDate) {
    query.createdAt = {};
    if (fromDate) query.createdAt.$gte = fromDate;
    if (toDate) query.createdAt.$lte = toDate;
  }
  return this.countDocuments(query);
};

auditLogSchema.statics.findByDateRange = function (fromDate, toDate, filters = {}, limit = 100, skip = 0) {
  const query = {
    createdAt: { $gte: fromDate, $lte: toDate },
    ...filters,
  };
  return this.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
};

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

export default AuditLog;