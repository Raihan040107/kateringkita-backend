import { Router } from "express";
import {
  getMerchantTypes,
  register,
  login,
  logout,
  getMe,
  getAllUsers,
} from "../controllers/authController";
import { authenticateToken, authorizeRoles } from "../middlewares/authMiddleware";

const router = Router();

// Public Routes (Autentikasi & Registrasi)
router.get("/types", getMerchantTypes);
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

// Protected Routes (Pengecekan Sesi / Token)
router.get("/me", authenticateToken, getMe);

// Admin-Only Protected Route (Otorisasi RBAC Level Server / API)
router.get("/admin/users", authenticateToken, authorizeRoles("admin"), getAllUsers);

export default router;
