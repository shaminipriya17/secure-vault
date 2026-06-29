import express from 'express';
import { 
  createVault, 
  getVaults, 
  getVaultById, 
  updateVault, 
  deleteVault, 
  shareVault, 
  revokeVaultAccess 
} from '../controllers/vaultController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(createVault)
  .get(getVaults);

router.route('/:id')
  .get(getVaultById)
  .put(updateVault)
  .delete(deleteVault);

router.route('/:id/share')
  .post(shareVault);

router.route('/:id/revoke')
  .post(revokeVaultAccess);

export default router;