import AuditLog from '../models/AuditLog.js';

export const getAuditLogs = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Access denied: Administrator privileges required' });
    }

    const { userId, action, status, startDate, endDate, limit = 50, page = 1 } = req.query;
    const query = {};

    if (userId) query.userId = userId;
    if (action) query.action = action;
    if (status) query.status = status;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const parsedLimit = parseInt(limit, 10);
    const parsedPage = parseInt(page, 10);
    const skip = (parsedPage - 1) * parsedLimit;

    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit);

    const total = await AuditLog.countDocuments(query);

    return res.status(200).json({
      success: true,
      count: logs.length,
      pagination: {
        total,
        page: parsedPage,
        pages: Math.ceil(total / parsedLimit)
      },
      data: logs
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

export const getAuditLogById = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Access denied: Administrator privileges required' });
    }

    const log = await AuditLog.findById(req.params.id);
    if (!log) {
      return res.status(404).json({ success: false, error: 'Audit log entry not found' });
    }

    return res.status(200).json({ success: true, data: log });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

export const getVaultAuditLogs = async (req, res, next) => {
  try {
    const { id: vaultId } = req.params;
    const { limit = 50, page = 1 } = req.query;

    const parsedLimit = parseInt(limit, 10);
    const parsedPage = parseInt(page, 10);
    const skip = (parsedPage - 1) * parsedLimit;

    const logs = await AuditLog.find({ vaultId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit);

    const total = await AuditLog.countDocuments({ vaultId });

    return res.status(200).json({
      success: true,
      count: logs.length,
      pagination: {
        total,
        page: parsedPage,
        pages: Math.ceil(total / parsedLimit)
      },
      data: logs
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};