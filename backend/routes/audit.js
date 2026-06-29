import express from 'express';
import { getAuditLogs, getAuditLogById, getVaultAuditLogs } from '../controllers/auditController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getAuditLogs);

router.route('/:id')
  .get(getAuditLogById);

router.route('/vault/:id')
  .get(getVaultAuditLogs);

export default router;