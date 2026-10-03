import db from "../config/db";
import { MerchantTypeRow } from "../types";
import { RowDataPacket, PoolConnection } from "mysql2/promise";

export const getAllMerchantTypes = async (): Promise<MerchantTypeRow[]> => {
  const [rows] = await db.query<MerchantTypeRow[]>("SELECT type_id, nama_jenis FROM merchant_types");
  return rows;
};

export const getRoleIdByName = async (connection: PoolConnection, roleName: string): Promise<number> => {
  const [rows] = await connection.query<RowDataPacket[]>("SELECT role_id FROM roles WHERE nama_role = ?", [roleName]);
  return rows[0]?.role_id || 2;
};

export const createMerchant = async (connection: PoolConnection, userId: number, typeId: number, namaUsaha: string, alamatUsaha: string): Promise<void> => {
  await connection.query("INSERT INTO merchants (user_id, type_id, nama_usaha, alamat_usaha) VALUES (?, ?, ?, ?)", [userId, typeId, namaUsaha, alamatUsaha]);
};
