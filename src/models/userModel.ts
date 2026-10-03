import db from "../config/db";
import { UserRow } from "../types";
import { RowDataPacket, ResultSetHeader, PoolConnection } from "mysql2/promise";

export const findUserByEmailOrWa = async (identifier: string): Promise<UserRow | null> => {
  const [rows] = await db.query<UserRow[]>(
    `SELECT u.*, r.nama_role, m.nama_usaha 
     FROM users u 
     JOIN roles r ON u.role_id = r.role_id 
     LEFT JOIN merchants m ON u.user_id = m.user_id 
     WHERE u.email = ? OR u.no_whatsapp = ?`,
    [identifier, identifier],
  );
  return rows[0] || null;
};

export const checkExistingUser = async (no_whatsapp: string, email?: string): Promise<boolean> => {
  const [rows] = await db.query<RowDataPacket[]>('SELECT user_id FROM users WHERE no_whatsapp = ? OR (email IS NOT NULL AND email = ? AND email != "")', [no_whatsapp, email || null]);
  return rows.length > 0;
};

export const createUser = async (connection: PoolConnection, roleId: number, nama_lengkap: string, email: string | undefined, no_whatsapp: string, hashedPassword: string): Promise<number> => {
  const [result] = await connection.query<ResultSetHeader>("INSERT INTO users (role_id, nama_lengkap, email, no_whatsapp, password) VALUES (?, ?, ?, ?, ?)", [
    roleId,
    nama_lengkap,
    email || null,
    no_whatsapp,
    hashedPassword,
  ]);
  return result.insertId;
};
