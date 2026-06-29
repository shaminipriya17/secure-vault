import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

const userSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuidv4(),
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [2, "Full name must be at least 2 characters"],
      maxlength: [100, "Full name cannot exceed 100 characters"],
      match: [/^[a-zA-Z\s'-]+$/, "Full name contains invalid characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [254, "Email cannot exceed 254 characters"],
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please provide a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ["superadmin", "admin", "manager", "viewer"],
        message: "Role must be one of: superadmin, admin, manager, viewer",
      },
      default: "viewer",
    },
    permissions: {
      type: [String],
      enum: {
        values: [
          "vault:create",
          "vault:read",
          "vault:update",
          "vault:delete",
          "vault:share",
          "user:create",
          "user:read",
          "user:update",
          "user:delete",
          "audit:read",
          "audit:export",
        ],
        message: "Invalid permission specified",
      },
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    lastLoginIp: {
      type: String,
      default: null,
      select: false,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    lockUntil: {
      type: Date,
      default: null,
      select: false,
    },
    passwordChangedAt: {
      type: Date,
      select: false,
    },
    mfaEnabled: {
      type: Boolean,
      default: false,
    },
    mfaSecret: {
      type: String,
      select: false,
    },
    createdBy: {
      type: String,
      ref: "User",
      default: null,
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
        delete ret.password;
        delete ret.refreshToken;
        delete ret.mfaSecret;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        delete ret.emailVerificationToken;
        delete ret.emailVerificationExpires;
        delete ret.failedLoginAttempts;
        delete ret.lockUntil;
        delete ret.lastLoginIp;
        delete ret.passwordChangedAt;
        return ret;
      },
    },
    toObject: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.refreshToken;
        delete ret.mfaSecret;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        delete ret.emailVerificationToken;
        delete ret.emailVerificationExpires;
        delete ret.failedLoginAttempts;
        delete ret.lockUntil;
        delete ret.lastLoginIp;
        delete ret.passwordChangedAt;
        return ret;
      },
    },
  }
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ lockUntil: 1 }, { sparse: true });

const LOCK_TIME = 2 * 60 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 5;

userSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    if (!this.isNew) {
      this.passwordChangedAt = new Date(Date.now() - 1000);
    }
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.pre("save", function (next) {
  if (this.isNew) {
    switch (this.role) {
      case "superadmin":
        this.permissions = [
          "vault:create","vault:read","vault:update","vault:delete","vault:share",
          "user:create","user:read","user:update","user:delete",
          "audit:read","audit:export",
        ];
        break;
      case "admin":
        this.permissions = [
          "vault:create","vault:read","vault:update","vault:delete","vault:share",
          "user:create","user:read","user:update",
          "audit:read","audit:export",
        ];
        break;
      case "manager":
        this.permissions = [
          "vault:create","vault:read","vault:update","vault:share",
          "user:read","audit:read",
        ];
        break;
      case "viewer":
      default:
        this.permissions = ["vault:read", "user:read"];
        break;
    }
  }
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!candidatePassword || !this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.incrementLoginAttempts = async function () {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { failedLoginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }
  const updates = { $inc: { failedLoginAttempts: 1 } };
  if (this.failedLoginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + LOCK_TIME };
  }
  return this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = async function () {
  return this.updateOne({
    $set: { failedLoginAttempts: 0 },
    $unset: { lockUntil: 1 },
  });
};

userSchema.methods.changedPasswordAfter = function (jwtTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return jwtTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.hasPermission = function (permission) {
  return this.permissions.includes(permission);
};

userSchema.methods.hasAnyPermission = function (permissionsArray) {
  return permissionsArray.some((p) => this.permissions.includes(p));
};

userSchema.methods.hasAllPermissions = function (permissionsArray) {
  return permissionsArray.every((p) => this.permissions.includes(p));
};

userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase().trim() });
};

userSchema.statics.findActiveById = function (id) {
  return this.findOne({ _id: id, isActive: true });
};

const User = mongoose.model("User", userSchema);

export default User;