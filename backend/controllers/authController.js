import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import User from "../models/User.js";
import AuditLog from "../models/AuditLog.js";

const getIpAddress = (req) =>
  req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
  req.headers["x-real-ip"] ||
  req.socket?.remoteAddress ||
  "unknown";

const signAccessToken = (userId, role) =>
  jwt.sign({ id: userId, role, requestId: uuidv4() }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    issuer: "securevault",
    audience: "securevault-client",
  });

const signRefreshToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    issuer: "securevault",
    audience: "securevault-client",
  });

const sanitizeUser = (user) => ({
  id: user._id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  permissions: user.permissions,
  isEmailVerified: user.isEmailVerified,
  mfaEnabled: user.mfaEnabled,
  lastLogin: user.lastLogin,
  createdAt: user.createdAt,
});

export const register = async (req, res, next) => {
  try {
    const { fullName, email, password, role } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email, and password are required.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long.",
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

    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const allowedRoles = ["viewer", "manager"];
    const assignedRole =
      role && allowedRoles.includes(role) ? role : "viewer";

    const user = await User.create({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: assignedRole,
      createdBy: null,
    });

    const accessToken = signAccessToken(user._id, user.role);
    const refreshToken = signRefreshToken(user._id);

    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    user.lastLoginIp = getIpAddress(req);
    await user.save({ validateBeforeSave: false });

    await AuditLog.log({
      action: "user:create",
      actorUserId: user._id,
      actorEmail: user.email,
      actorRole: user.role,
      ipAddress: getIpAddress(req),
      userAgent: req.headers["user-agent"] || null,
      resourceType: "user",
      resourceId: user._id,
      resourceName: user.email,
      outcome: "success",
      severity: "low",
      details: { registrationMethod: "email" },
      method: req.method,
      endpoint: req.originalUrl,
      statusCode: 201,
      requestId: req.requestId || uuidv4(),
    }).catch(() => {});

    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      data: {
        user: sanitizeUser(user),
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const ip = getIpAddress(req);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select(
        "+password +failedLoginAttempts +lockUntil +refreshToken +lastLoginIp +passwordChangedAt"
      )
      .lean(false);

    if (!user) {
      await AuditLog.log({
        action: "auth:login_failed",
        ipAddress: ip,
        userAgent: req.headers["user-agent"] || null,
        actorEmail: email.toLowerCase().trim(),
        resourceType: "auth",
        outcome: "failure",
        severity: "medium",
        details: { reason: "User not found" },
        method: req.method,
        endpoint: req.originalUrl,
        statusCode: 401,
        requestId: req.requestId || uuidv4(),
      }).catch(() => {});

      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account has been deactivated. Please contact support.",
        code: "ACCOUNT_DEACTIVATED",
      });
    }

    if (user.isLocked) {
      await AuditLog.log({
        action: "auth:account_locked",
        actorUserId: user._id,
        actorEmail: user.email,
        actorRole: user.role,
        ipAddress: ip,
        userAgent: req.headers["user-agent"] || null,
        resourceType: "auth",
        outcome: "failure",
        severity: "high",
        details: { lockUntil: user.lockUntil },
        method: req.method,
        endpoint: req.originalUrl,
        statusCode: 403,
        requestId: req.requestId || uuidv4(),
      }).catch(() => {});

      return res.status(403).json({
        success: false,
        message: "Account is temporarily locked due to multiple failed login attempts. Try again later.",
        code: "ACCOUNT_LOCKED",
        lockUntil: user.lockUntil,
      });
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      await user.incrementLoginAttempts();

      await AuditLog.log({
        action: "auth:login_failed",
        actorUserId: user._id,
        actorEmail: user.email,
        actorRole: user.role,
        ipAddress: ip,
        userAgent: req.headers["user-agent"] || null,
        resourceType: "auth",
        outcome: "failure",
        severity: "medium",
        details: {
          reason: "Invalid password",
          failedAttempts: user.failedLoginAttempts + 1,
        },
        method: req.method,
        endpoint: req.originalUrl,
        statusCode: 401,
        requestId: req.requestId || uuidv4(),
      }).catch(() => {});

      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    await user.resetLoginAttempts();

    const accessToken = signAccessToken(user._id, user.role);
    const refreshToken = signRefreshToken(user._id);

    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    user.lastLoginIp = ip;
    await user.save({ validateBeforeSave: false });

    await AuditLog.log({
      action: "auth:login",
      actorUserId: user._id,
      actorEmail: user.email,
      actorRole: user.role,
      ipAddress: ip,
      userAgent: req.headers["user-agent"] || null,
      resourceType: "auth",
      outcome: "success",
      severity: "low",
      method: req.method,
      endpoint: req.originalUrl,
      statusCode: 200,
      requestId: req.requestId || uuidv4(),
    }).catch(() => {});

    res.status(200).json({
      success: true,
      message: "Login successful.",
      data: {
        user: sanitizeUser(user),
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("+refreshToken");
    if (user) {
      user.refreshToken = null;
      await user.save({ validateBeforeSave: false });
    }

    await AuditLog.log({
      action: "auth:logout",
      actorUserId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      ipAddress: req.ipAddress || getIpAddress(req),
      userAgent: req.headers["user-agent"] || null,
      resourceType: "auth",
      outcome: "success",
      severity: "low",
      method: req.method,
      endpoint: req.originalUrl,
      statusCode: 200,
      requestId: req.requestId || uuidv4(),
    }).catch(() => {});

    res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (err) {
    next(err);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const user = req.user;
    const ip = req.ipAddress || getIpAddress(req);

    const accessToken = signAccessToken(user._id, user.role);
    const newRefreshToken = signRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    await AuditLog.log({
      action: "auth:token_refresh",
      actorUserId: user._id,
      actorEmail: user.email,
      actorRole: user.role,
      ipAddress: ip,
      userAgent: req.headers["user-agent"] || null,
      resourceType: "auth",
      outcome: "success",
      severity: "low",
      method: req.method,
      endpoint: req.originalUrl,
      statusCode: 200,
      requestId: req.requestId || uuidv4(),
    }).catch(() => {});

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully.",
      data: {
        accessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: { user: sanitizeUser(user) },
    });
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const ip = req.ipAddress || getIpAddress(req);

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required.",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters long.",
      });
    }

    const passwordStrength = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordStrength.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          "New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
      });
    }

    const user = await User.findById(req.user._id).select("+password +refreshToken");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) {
      await AuditLog.log({
        action: "auth:password_change",
        actorUserId: user._id,
        actorEmail: user.email,
        actorRole: user.role,
        ipAddress: ip,
        userAgent: req.headers["user-agent"] || null,
        resourceType: "user",
        resourceId: user._id,
        outcome: "failure",
        severity: "high",
        details: { reason: "Invalid current password" },
        method: req.method,
        endpoint: req.originalUrl,
        statusCode: 401,
        requestId: req.requestId || uuidv4(),
      }).catch(() => {});

      return res.status(401).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    user.password = newPassword;
    user.refreshToken = null;
    await user.save();

    await AuditLog.log({
      action: "auth:password_change",
      actorUserId: user._id,
      actorEmail: user.email,
      actorRole: user.role,
      ipAddress: ip,
      userAgent: req.headers["user-agent"] || null,
      resourceType: "user",
      resourceId: user._id,
      outcome: "success",
      severity: "high",
      method: req.method,
      endpoint: req.originalUrl,
      statusCode: 200,
      requestId: req.requestId || uuidv4(),
    }).catch(() => {});

    res.status(200).json({
      success: true,
      message: "Password changed successfully. Please log in again.",
    });
  } catch (err) {
    next(err);
  }
};
