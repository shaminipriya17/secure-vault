import { Router } from "express";
import {
  register,
  login,
  logout,
  refreshToken,
  getMe,
  changePassword,
} from "../controllers/authController.js";
import {
  protect,
  verifyRefreshToken,
} from "../middleware/authMiddleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", verifyRefreshToken, refreshToken);
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);
router.patch("/change-password", protect, changePassword);

export default router;
