import { v4 as uuidv4 } from "uuid";
import User from "../models/User.js";
import AuditLog from "../models/AuditLog.js";

const getIpAddress = (req) =>
  req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
  req.headers["x-real-ip"] ||
  req.socket?.remoteAddress ||
  "unknown";

const sanitizeUser = (user) => ({
  id: user._id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  permissions: user.permissions,
  isActive: user.isActive,
  isEmailVerified: user.isEmailVerified,
  mfaEnabled: user.mfaEnabled,
  lastLogin: user.lastLogin,
  createdBy: user.createdBy,
  updatedBy: user.updatedBy,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const getAllUsers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      role,
      isActive,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const allowedSortFields = ["createdAt", "updatedAt", "fullName", "email", "role", "lastLogin"];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
    const sortDir = sortOrder === "asc" ? 1 : -1;

    const query = {};
    if (role) {
      const validRoles = ["superadmin", "admin", "manager", "viewer"];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ success: false, message: "Invalid role filter." });
      }
      query.role = role;
    }
    if (isActive !== undefined) {
      query.isActive = isActive === "true";
    }
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.$or = [
        { fullName: { $regex: escaped, $options: "i" } },
        { email: { $regex: escaped, $options: "i" } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query).sort({ [sortField]: sortDir }).skip(skip).limit(limitNum),
      User.countDocuments(query),
    ]);

    await AuditLog.log({
      action: "user:read",
      actorUserId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      ipAddress: req.ipAddress || getIpAddress(req),
      userAgent: req.headers["user-agent"] || null,
      resourceType: "user",
      outcome: "success",
      severity: "low",
      details: { filters: { role, isActive, search }, page: pageNum, limit: limitNum },
      method: req.method,
      endpoint: req.originalUrl,
      statusCode: 200,
      requestId: req.requestId || uuidv4(),
    }).catch(() => {});

    res.status(200).json({
      success: true,
      data: {
        users: users.map(sanitizeUser),
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
          hasNextPage: pageNum < Math.ceil(total / limitNum),
          hasPrevPage: pageNum > 1,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    await AuditLog.log({
      action: "user:read",
      actorUserId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      ipAddress: req.ipAddress || getIpAddress(req),
      userAgent: req.headers["user-agent"] || null,
      resourceType: "user",
      resourceId: user._id,
      resourceName: user.email,
      outcome: "success",
      severity: "low",
      method: req.method,
      endpoint: req.originalUrl,
      statusCode: 200,
      requestId: req.requestId || uuidv4(),
    }).catch(() => {});

    res.status(200).json({
      success: true,
      data: { user: sanitizeUser(user) },
    });
  } catch (err) {
    next(err);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { fullName, email, password, role } = req.body;
    const ip = req.ipAddress || getIpAddress(req);

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email, and password are required.",
      });
    }

    const passwordStrength = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordStrength.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
      });
    }

    const validRoles = ["superadmin", "admin", "manager", "viewer"];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role specified." });
    }

    if (role === "superadmin" && req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Only superadmins can create superadmin accounts.",
      });
    }

    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const user = await User.create({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: role || "viewer",
      createdBy: req.user._id,
    });

    await AuditLog.log({
      action: "user:create",
      actorUserId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      ipAddress: ip,
      userAgent: req.headers["user-agent"] || null,
      resourceType: "user",
      resourceId: user._id,
      resourceName: user.email,
      outcome: "success",
      severity: "medium",
      details: { assignedRole: user.role },
      method: req.method,
      endpoint: req.originalUrl,
      statusCode: 201,
      requestId: req.requestId || uuidv4(),
    }).catch(() => {});

    res.status(201).json({
      success: true,
      message: "User created successfully.",
      data: { user: sanitizeUser(user) },
    });
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { fullName, email } = req.body;
    const ip = req.ipAddress || getIpAddress(req);

    const allowedFields = ["fullName", "email"];
    const hasValidField = allowedFields.some((f) => req.body[f] !== undefined);
    if (!hasValidField) {
      return res.status(400).json({
        success: false,
        message: "At least one updatable field (fullName, email) is required.",
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const before = { fullName: user.fullName, email: user.email };

    if (fullName !== undefined) {
      if (typeof fullName !== "string" || fullName.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: "Full name must be at least 2 characters.",
        });
      }
      user.fullName = fullName.trim();
    }

    if (email !== undefined) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: "Invalid email address." });
      }
      const conflict = await User.findByEmail(email);
      if (conflict && conflict._id !== id) {
        return res.status(409).json({
          success: false,
          message: "Email is already in use by another account.",
        });
      }
      user.email = email.toLowerCase().trim();
    }

    user.updatedBy = req.user._id;
    await user.save();

    await AuditLog.log({
      action: "user:update",
      actorUserId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      ipAddress: ip,
      userAgent: req.headers["user-agent"] || null,
      resourceType: "user",
      resourceId: user._id,
      resourceName: user.email,
      outcome: "success",
      severity: "medium",
      changesBefore: before,
      changesAfter: { fullName: user.fullName, email: user.email },
      method: req.method,
      endpoint: req.originalUrl,
      statusCode: 200,
      requestId: req.requestId || uuidv4(),
    }).catch(() => {});

    res.status(200).json({
      success: true,
      message: "User updated successfully.",
      data: { user: sanitizeUser(user) },
    });
  } catch (err) {
    next(err);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const ip = req.ipAddress || getIpAddress(req);

    const validRoles = ["superadmin", "admin", "manager", "viewer"];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: "Valid role is required." });
    }

    if (role === "superadmin" && req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Only superadmins can assign the superadmin role.",
      });
    }

    if (id === req.user._id) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own role.",
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const previousRole = user.role;
    user.role = role;
    user.updatedBy = req.user._id;

    const rolePermissions = {
      superadmin: [
        "vault:create","vault:read","vault:update","vault:delete","vault:share",
        "user:create","user:read","user:update","user:delete",
        "audit:read","audit:export",
      ],
      admin: [
        "vault:create","vault:read","vault:update","vault:delete","vault:share",
        "user:create","user:read","user:update",
        "audit:read","audit:export",
      ],
      manager: ["vault:create","vault:read","vault:update","vault:share","user:read","audit:read"],
      viewer: ["vault:read","user:read"],
    };
    user.permissions = rolePermissions[role];

    await user.save();

    await AuditLog.log({
      action: "user:role_change",
      actorUserId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      ipAddress: ip,
      userAgent: req.headers["user-agent"] || null,
      resourceType: "user",
      resourceId: user._id,
      resourceName: user.email,
      outcome: "success",
      severity: "high",
      changesBefore: { role: previousRole },
      changesAfter: { role: user.role },
      method: req.method,
      endpoint: req.originalUrl,
      statusCode: 200,
      requestId: req.requestId || uuidv4(),
    }).catch(() => {});

    res.status(200).json({
      success: true,
      message: "User role updated successfully.",
      data: { user: sanitizeUser(user) },
    });
  } catch (err) {
    next(err);
  }
};

export const deactivateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ip = req.ipAddress || getIpAddress(req);

    if (id === req.user._id) {
      return res.status(400).json({
        success: false,
        message: "You cannot deactivate your own account.",
      });
    }

    const user = await User.findById(id).select("+refreshToken");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    if (!user.isActive) {
      return res.status(400).json({ success: false, message: "User is already deactivated." });
    }

    user.isActive = false;
    user.refreshToken = null;
    user.updatedBy = req.user._id;
    await user.save({ validateBeforeSave: false });

    await AuditLog.log({
      action: "user:deactivate",
      actorUserId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      ipAddress: ip,
      userAgent: req.headers["user-agent"] || null,
      resourceType: "user",
      resourceId: user._id,
      resourceName: user.email,
      outcome: "success",
      severity: "high",
      method: req.method,
      endpoint: req.originalUrl,
      statusCode: 200,
      requestId: req.requestId || uuidv4(),
    }).catch(() => {});

    res.status(200).json({
      success: true,
      message: "User deactivated successfully.",
    });
  } catch (err) {
    next(err);
  }
};

export const activateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ip = req.ipAddress || getIpAddress(req);

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    if (user.isActive) {
      return res.status(400).json({ success: false, message: "User is already active." });
    }

    user.isActive = true;
    user.updatedBy = req.user._id;
    await user.save({ validateBeforeSave: false });

    await AuditLog.log({
      action: "user:activate",
      actorUserId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      ipAddress: ip,
      userAgent: req.headers["user-agent"] || null,
      resourceType: "user",
      resourceId: user._id,
      resourceName: user.email,
      outcome: "success",
      severity: "medium",
      method: req.method,
      endpoint: req.originalUrl,
      statusCode: 200,
      requestId: req.requestId || uuidv4(),
    }).catch(() => {});

    res.status(200).json({
      success: true,
      message: "User activated successfully.",
      data: { user: sanitizeUser(user) },
    });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ip = req.ipAddress || getIpAddress(req);

    if (id === req.user._id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account.",
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    if (user.role === "superadmin" && req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Only superadmins can delete superadmin accounts.",
      });
    }

    await User.findByIdAndDelete(id);

    await AuditLog.log({
      action: "user:delete",
      actorUserId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      ipAddress: ip,
      userAgent: req.headers["user-agent"] || null,
      resourceType: "user",
      resourceId: id,
      resourceName: user.email,
      outcome: "success",
      severity: "critical",
      details: { deletedUserRole: user.role, deletedUserEmail: user.email },
      method: req.method,
      endpoint: req.originalUrl,
      statusCode: 200,
      requestId: req.requestId || uuidv4(),
    }).catch(() => {});

    res.status(200).json({
      success: true,
      message: "User deleted successfully.",
    });
  } catch (err) {
    next(err);
  }
};