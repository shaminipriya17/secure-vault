import express from 'express';
import { 
  getAllUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  updateUserRole, 
  deactivateUser, 
  activateUser, 
  deleteUser 
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply protect middleware to all routes in this router
router.use(protect);

router.route('/')
  .get(authorize('superadmin', 'admin', 'manager'), getAllUsers)
  .post(authorize('superadmin', 'admin'), createUser);

router.route('/:id')
  .get(authorize('superadmin', 'admin', 'manager'), getUserById)
  .put(authorize('superadmin', 'admin'), updateUser)
  .delete(authorize('superadmin', 'admin'), deleteUser);

router.route('/:id/role')
  .put(authorize('superadmin', 'admin'), updateUserRole);

router.route('/:id/deactivate')
  .put(authorize('superadmin', 'admin'), deactivateUser);

router.route('/:id/activate')
  .put(authorize('superadmin', 'admin'), activateUser);

export default router;