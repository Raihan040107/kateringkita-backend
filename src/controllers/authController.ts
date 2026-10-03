import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import db from "../config/db";
import * as userModel from "../models/userModel";
import * as merchantModel from "../models/merchantModel";
import { generateToken } from "../utils/jwt";

export const getMerchantTypes = async (req: Request, res: Response): Promise<void> => {
  try {
    const types = await merchantModel.getAllMerchantTypes();
    res.json(types);
  } catch (err: any) {
    res.status(500).json({ message: "Gagal mengambil jenis usaha", error: err.message });
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  const { nama_lengkap, no_whatsapp, email, nama_usaha, alamat_usaha, type_id, password, confirm_password } = req.body;

  if (!nama_lengkap || !no_whatsapp || !nama_usaha || !alamat_usaha || !type_id || !password) {
    res.status(400).json({ message: "Semua kolom wajib diisi!" });
    return;
  }

  if (password !== confirm_password) {
    res.status(400).json({ message: "Password dan Konfirmasi Password tidak cocok!" });
    return;
  }

  const isExisting = await userModel.checkExistingUser(no_whatsapp, email);
  if (isExisting) {
    res.status(400).json({ message: "Nomor WhatsApp atau Email sudah terdaftar!" });
    return;
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const hashedPassword = await bcrypt.hash(password, 10);
    const roleId = await merchantModel.getRoleIdByName(connection, "merchant");

    const userId = await userModel.createUser(connection, roleId, nama_lengkap, email, no_whatsapp, hashedPassword);

    await merchantModel.createMerchant(connection, userId, Number(type_id), nama_usaha, alamat_usaha);

    await connection.commit();
    res.status(201).json({ message: "Registrasi merchant berhasil! Silakan login." });
  } catch (err: any) {
    await connection.rollback();
    res.status(500).json({ message: "Gagal melakukan registrasi", error: err.message });
  } finally {
    connection.release();
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    res.status(400).json({ message: "Email/WA dan Password wajib diisi!" });
    return;
  }

  try {
    const user = await userModel.findUserByEmailOrWa(identifier);
    if (!user) {
      res.status(401).json({ message: "Akun tidak ditemukan!" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password || "");
    if (!isMatch) {
      res.status(401).json({ message: "Password salah!" });
      return;
    }

    const token = generateToken(user.user_id!, user.nama_role || "merchant");

    res.json({
      message: "Login berhasil!",
      token,
      user: {
        id: user.user_id,
        nama_lengkap: user.nama_lengkap,
        role: user.nama_role,
        nama_usaha: user.nama_usaha,
      },
    });
  } catch (err: any) {
    res.status(500).json({ message: "Gagal proses login", error: err.message });
  }
};
