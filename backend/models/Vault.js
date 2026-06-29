import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const encryptedFieldSchema = new mongoose.Schema(
  {
    encryptedData: {
      type: String,
      required: true,
    },
    iv: {
      type: String,
      required: true,
    },
    authTag: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const vaultEntrySchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4(),
    },
    label: {
      type: String,
      required: [true, "Entry label is required"],
      trim: true,
      minlength: [1, "Label must be at least 1 character"],
      maxlength: [100, "Label cannot exceed 100 characters"],
    },
    type: {
      type: String,
      required: [true, "Entry type is required"],
      enum: {
        values: ["password", "note", "card", "identity", "key", "document"],
        message: "Type must be one of: password, note, card, identity, key, document",
      },
    },
    username: {
      type: encryptedFieldSchema,
      default: null,
    },
    password: {
      type: encryptedFieldSchema,
      default: null,
    },
    url: {
      type: encryptedFieldSchema,
      default: null,
    },
    notes: {
      type: encryptedFieldSchema,
      default: null,
    },
    customFields: [
      {
        _id: false,
        fieldName: {
          type: String,
          required: true,
          trim: true,
          maxlength: [50, "Field name cannot exceed 50 characters"],
        },
        fieldValue: {
          type: encryptedFieldSchema,
          required: true,
        },
        isSecret: {
          type: Boolean,
          default: false,
        },
      },
    ],
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (tags) => tags.length <= 20,
        message: "Cannot have more than 20 tags",
      },
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    lastAccessed: {
      type: Date,
      default: null,
    },
    accessCount: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: String,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: String,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const sharedWithSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      ref: "User",
      required: true,
    },
    accessLevel: {
      type: String,
      enum: {
        values: ["read", "write", "admin"],
        message: "Access level must be one of: read, write, admin",
      },
      default: "read",
    },
    sharedAt: {
      type: Date,
      default: () => new Date(),
    },
    sharedBy: {
      type: String,
      ref: "User",
      required: true,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

const vaultSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4(),
    },
    name: {
      type: String,
      required: [true, "Vault name is required"],
      trim: true,
      minlength: [1, "Vault name must be at least 1 character"],
      maxlength: [100, "Vault name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: "",
    },
    icon: {
      type: String,
      trim: true,
      maxlength: [50, "Icon identifier cannot exceed 50 characters"],
      default: "default",
    },
    color: {
      type: String,
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Color must be a valid hex code"],
      default: "#4F46E5",
    },
    owner: {
      type: String,
      ref: "User",
      required: [true, "Vault owner is required"],
    },
    isShared: {
      type: Boolean,
      default: false,
    },
    sharedWith: {
      type: [sharedWithSchema],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 100,
        message: "Cannot share vault with more than 100 users",
      },
    },
    entries: {
      type: [vaultEntrySchema],
      default: [],
      validate: {
        validator: (entries) => entries.length <= 10000,
        message: "Vault cannot contain more than 10,000 entries",
      },
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    lockReason: {
      type: String,
      default: null,
      maxlength: [255, "Lock reason cannot exceed 255 characters"],
    },
    encryptionVersion: {
      type: Number,
      default: 1,
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (tags) => tags.length <= 20,
        message: "Cannot have more than 20 tags",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastActivityAt: {
      type: Date,
      default: () => new Date(),
    },
    createdBy: {
      type: String,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: String,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform(doc, ret) {
        return ret;
      },
    },
  }
);

vaultSchema.index({ owner: 1 });
vaultSchema.index({ "sharedWith.userId": 1 });
vaultSchema.index({ isActive: 1 });
vaultSchema.index({ createdAt: -1 });
vaultSchema.index({ owner: 1, isActive: 1 });
vaultSchema.index({ "entries.type": 1 });
vaultSchema.index({ "entries.tags": 1 });
vaultSchema.index({ tags: 1 });
vaultSchema.index({ lastActivityAt: -1 });

vaultSchema.virtual("entryCount").get(function () {
  return this.entries ? this.entries.length : 0;
});

vaultSchema.virtual("sharedWithCount").get(function () {
  return this.sharedWith ? this.sharedWith.length : 0;
});

vaultSchema.methods.isOwnedBy = function (userId) {
  return this.owner === userId;
};

vaultSchema.methods.isSharedWith = function (userId) {
  return this.sharedWith.some((s) => s.userId === userId);
};

vaultSchema.methods.getAccessLevel = function (userId) {
  if (this.owner === userId) return "admin";
  const share = this.sharedWith.find((s) => s.userId === userId);
  if (!share) return null;
  if (share.expiresAt && share.expiresAt < new Date()) return null;
  return share.accessLevel;
};

vaultSchema.methods.canRead = function (userId) {
  const level = this.getAccessLevel(userId);
  return ["read", "write", "admin"].includes(level);
};

vaultSchema.methods.canWrite = function (userId) {
  const level = this.getAccessLevel(userId);
  return ["write", "admin"].includes(level);
};

vaultSchema.methods.canAdmin = function (userId) {
  return this.getAccessLevel(userId) === "admin";
};

vaultSchema.methods.getEntryById = function (entryId) {
  return this.entries.find((e) => e._id === entryId) || null;
};

vaultSchema.methods.updateLastActivity = function () {
  this.lastActivityAt = new Date();
  return this.save();
};

vaultSchema.statics.findByOwner = function (ownerId, activeOnly = true) {
  const query = { owner: ownerId };
  if (activeOnly) query.isActive = true;
  return this.find(query).sort({ lastActivityAt: -1 });
};

vaultSchema.statics.findAccessibleByUser = function (userId, activeOnly = true) {
  const query = {
    $or: [{ owner: userId }, { "sharedWith.userId": userId }],
  };
  if (activeOnly) query.isActive = true;
  return this.find(query).sort({ lastActivityAt: -1 });
};

vaultSchema.statics.findSharedWithUser = function (userId, activeOnly = true) {
  const query = { "sharedWith.userId": userId };
  if (activeOnly) query.isActive = true;
  return this.find(query).sort({ lastActivityAt: -1 });
};

const Vault = mongoose.model("Vault", vaultSchema);

export default Vault;