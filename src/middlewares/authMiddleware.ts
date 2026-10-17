import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    role: string;
    iat?: number;
    exp?: number;
  };
}

/**
 * Middleware untuk validasi JWT Token (Autentikasi)
 */
export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Akses ditolak, token tidak ditemukan!" });
    return;
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: "Token tidak valid atau telah kadaluarsa!" });
  }
};

/**
 * Middleware untuk membatasi akses berdasarkan peran pengguna (Otorisasi / RBAC)
 */
export const authorizeRoles = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: "Akses ditolak, autentikasi dibutuhkan!" });
      return;
    }

    const userRole = (req.user.role || "").toLowerCase();
    const isAllowed = allowedRoles.some((r) => r.toLowerCase() === userRole);

    if (!isAllowed) {
      res.status(403).json({
        message: `Akses terlarang! Peran '${req.user.role}' tidak memiliki izin mengakses endpoint ini.`,
      });
      return;
    }

    next();
  };
};
