import { v4 as uuidv4 } from "uuid";
import Vault from "../models/Vault.js";
import AuditLog from "../models/AuditLog.js";

const getIpAddress = (req) =>
  req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
  req.headers["x-real-ip"] ||
  req.socket?.remoteAddress ||
  "unknown";

export const createVault = async (req, res, next) => {
  try {
    const { name, description, data } = req.body;
    const ip = req.ipAddress || getIpAddress(req);

    if (!name || !data) {
      return res.status(400).json({ success: false, message: "Vault name and payload data are required." });
    }

    const vault = await Vault.create({
      name: name.trim(),
      description: description?.trim(),
      data,
      owner: req.user._id,
      allowedUsers: [{ user: req.user._id, role: "owner" }]
    });

    await AuditLog.log({
      action: "vault:create",
      actorUserId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      ipAddress: ip,
      userAgent: req.headers["user-agent"] || null,
      resourceType: "vault",
      resourceId: vault._id,
      resourceName: vault.name,
      outcome: "success",
      severity: "medium",
      details: { description: vault.description },
      method: req.method,
      endpoint: req.originalUrl,
      statusCode: 201,
      requestId: req.requestId || uuidv4(),
    }).catch(() => {});

    res.status(201).json({ success: true, message: "Vault created successfully.", data: { vault } });
  } catch (err) {
    next(err);
  }
};

export const getVaults = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const query = { "allowedUsers.user": req.user._id };
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.name = { $regex: escaped, $options: "i" };
    }

    const [vaults, total] = await Promise.all([
      Vault.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Vault.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: {
        vaults,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getVaultById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ip = req.ipAddress || getIpAddress(req);

    const vault = await Vault.findById(id);
    if (!vault) {
      return res.status(404).json({ success: false, message: "Vault not found." });
    }

    const access = vault.allowedUsers.find((u) => u.user.toString() === req.user._id.toString());
    if (!access) {
      await AuditLog.log({
        action: "vault:read",
        actorUserId: req.user._id,
        actorEmail: req.user.email,
        actorRole: req.user.role,
        ipAddress: ip,
        userAgent: req.headers["user-agent"] || null,
        resourceType: "vault",
        resourceId: vault._id,
        outcome: "failure",
        severity: "high",
        details: { error: "Unauthorized read attempt" },
        method: req.method,
        endpoint: req.originalUrl,
        statusCode: 403,
        requestId: req.requestId || uuidv4(),
      }).catch(() => {});
      return res.status(403).json({ success: false, message: "Access denied to this vault." });
    }

    await AuditLog.log({
      action: "vault:read",
      actorUserId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      ipAddress: ip,
      userAgent: req.headers["user-agent"] || null,
      resourceType: "vault",
      resourceId: vault._id,
      resourceName: vault.name,
      outcome: "success",
      severity: "low",
      method: req.method,
      endpoint: req.originalUrl,
      statusCode: 200,
      requestId: req.requestId || uuidv4(),
    }).catch(() => {});

    res.status(200).json({ success: true, data: { vault } });
  } catch (err) {
    next(err);
  }
};

export const updateVault = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, data } = req.body;
    const ip = req.ipAddress || getIpAddress(req);

    const vault = await Vault.findById(id);
    if (!vault) {
      return res.status(404).json({ success: false, message: "Vault not found." });
    }

    if (vault.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Only the vault owner can modify configurations." });
    }

    const before = { name: vault.name, description: vault.description, data: vault.data };

    if (name !== undefined) vault.name = name.trim();
    if (description !== undefined) vault.description = description.trim();
    if (data !== undefined) vault.data = data;

    await vault.save();

    await AuditLog.log({
      action: "vault:update",
      actorUserId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      ipAddress: ip,
      userAgent: req.headers["user-agent"] || null,
      resourceType: "vault",
      resourceId: vault._id,
      resourceName: vault.name,
      outcome: "success",
      severity: "medium",
      changesBefore: before,
      changesAfter: { name: vault.name, description: vault.description, data: vault.data },
      method: req.method,
      endpoint: req.originalUrl,
      statusCode: 200,
      requestId: req.requestId || uuidv4(),
    }).catch(() => {});

    res.status(200).json({ success: true, message: "Vault metadata updated successfully.", data: { vault } });
  } catch (err) {
    next(err);
  }
};

export const deleteVault = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ip = req.ipAddress || getIpAddress(req);

    const vault = await Vault.findById(id);
    if (!vault) {
      return res.status(404).json({ success: false, message: "Vault not found." });
    }

    if (vault.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Only the vault owner can purge this repository." });
    }

    await vault.deleteOne();

    await AuditLog.log({
      action: "vault:delete",
      actorUserId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      ipAddress: ip,
      userAgent: req.headers["user-agent"] || null,
      resourceType: "vault",
      resourceId: id,
      resourceName: vault.name,
      outcome: "success",
      severity: "high",
      method: req.method,
      endpoint: req.originalUrl,
      statusCode: 200,
      requestId: req.requestId || uuidv4(),
    }).catch(() => {});

    res.status(200).json({ success: true, message: "Vault resource successfully deleted." });
  } catch (err) {
    next(err);
  }
};

export const shareVault = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.body;
    const ip = req.ipAddress || getIpAddress(req);

    const validRoles = ["editor", "viewer"];
    if (!userId || !role || !validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: "A valid recipient target and permission role are required." });
    }

    const vault = await Vault.findById(id);
    if (!vault) {
      return res.status(404).json({ success: false, message: "Vault target not found." });
    }

    if (vault.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Only resource owners can handle access delegation." });
    }

    const userAccessIndex = vault.allowedUsers.findIndex((u) => u.user.toString() === userId);
    if (userAccessIndex !== -1) {
      vault.allowedUsers[userAccessIndex].role = role;
    } else {
      vault.allowedUsers.push({ user: userId, role });
    }

    await vault.save();

    await AuditLog.log({
      action: "vault:share",
      actorUserId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      ipAddress: ip,
      userAgent: req.headers["user-agent"] || null,
      resourceType: "vault",
      resourceId: vault._id,
      resourceName: vault.name,
      outcome: "success",
      severity: "medium",
      details: { sharedWithUserId: userId, assignedPermission: role },
      method: req.method,
      endpoint: req.originalUrl,
      statusCode: 200,
      requestId: req.requestId || uuidv4(),
    }).catch(() => {});

    res.status(200).json({ success: true, message: "Vault permissions updated.", data: { vault } });
  } catch (err) {
    next(err);
  }
};

export const revokeVaultAccess = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const ip = req.ipAddress || getIpAddress(req);

    if (!userId) {
      return res.status(400).json({ success: false, message: "Target user ID is required to revoke token space permissions." });
    }

    const vault = await Vault.findById(id);
    if (!vault) {
      return res.status(404).json({ success: false, message: "Vault resource not found." });
    }

    if (vault.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Only the resource owner handles credential revocation." });
    }

    if (userId === vault.owner.toString()) {
      return res.status(400).json({ success: false, message: "Owner role cannot break root security mapping inheritance." });
    }

    vault.allowedUsers = vault.allowedUsers.filter((u) => u.user.toString() !== userId);
    await vault.save();

    await AuditLog.log({
      action: "vault:revoke",
      actorUserId: req.user._id,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      ipAddress: ip,
      userAgent: req.headers["user-agent"] || null,
      resourceType: "vault",
      resourceId: vault._id,
      resourceName: vault.name,
      outcome: "success",
      severity: "medium",
      details: { revokedUserTarget: userId },
      method: req.method,
      endpoint: req.originalUrl,
      statusCode: 200,
      requestId: req.requestId || uuidv4(),
    }).catch(() => {});

    res.status(200).json({ success: true, message: "Identity clearance revoked successfully.", data: { vault } });
  } catch (err) {
    next(err);
  }
};