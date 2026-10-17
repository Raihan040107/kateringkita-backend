import pool from "./db";
import bcrypt from "bcryptjs";

export const initDatabase = async () => {
  const connection = await pool.getConnection();
  try {
    console.log("Memulai inisialisasi tabel database...");

    // 1. Buat Tabel roles
    await connection.query(`
      CREATE TABLE IF NOT EXISTS roles (
        role_id INT AUTO_INCREMENT PRIMARY KEY,
        nama_role VARCHAR(50) NOT NULL UNIQUE,
        deskripsi VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 2. Buat Tabel merchant_types
    await connection.query(`
      CREATE TABLE IF NOT EXISTS merchant_types (
        type_id INT AUTO_INCREMENT PRIMARY KEY,
        nama_jenis VARCHAR(100) NOT NULL,
        deskripsi VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 3. Buat Tabel users
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id INT AUTO_INCREMENT PRIMARY KEY,
        role_id INT NOT NULL,
        nama_lengkap VARCHAR(150) NOT NULL,
        email VARCHAR(100) NULL UNIQUE,
        no_whatsapp VARCHAR(25) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles (role_id) ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 4. Buat Tabel merchants
    await connection.query(`
      CREATE TABLE IF NOT EXISTS merchants (
        merchant_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        type_id INT NOT NULL,
        nama_usaha VARCHAR(150) NOT NULL,
        alamat_usaha TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_merchants_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT fk_merchants_type FOREIGN KEY (type_id) REFERENCES merchant_types (type_id) ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log("Semua tabel berhasil dibuat / diverifikasi.");

    // Seed Roles
    const [roles]: any = await connection.query("SELECT COUNT(*) as count FROM roles");
    if (roles[0].count === 0) {
      await connection.query(`
        INSERT INTO roles (role_id, nama_role, deskripsi) VALUES
        (1, 'admin', 'Administrator dengan akses penuh sistem'),
        (2, 'merchant', 'Mitra katering penyedia makanan');
      `);
      console.log("Data roles berhasil di-seed (admin & merchant).");
    }

    // Seed Merchant Types
    const [types]: any = await connection.query("SELECT COUNT(*) as count FROM merchant_types");
    if (types[0].count === 0) {
      await connection.query(`
        INSERT INTO merchant_types (type_id, nama_jenis, deskripsi) VALUES
        (1, 'Katering Harian Kampus & Kantor', 'Penyedia menu makan siang terjadwal harian'),
        (2, 'Prasmanan & Acara Spesial', 'Penyedia konsumsi prasmanan hajatan / event kampus'),
        (3, 'Snack Box & Coffee Break', 'Penyedia jajanan box dan coffee break seminar'),
        (4, 'Nasi Kotak Kantin & Bento', 'Penyedia nasi box cepat saji');
      `);
      console.log("Data merchant_types berhasil di-seed.");
    }

    // Seed Dummy User: Admin
    const [existingAdmin]: any = await connection.query("SELECT user_id FROM users WHERE email = 'admin@kateringkita.com' OR no_whatsapp = '081111111111'");
    if (existingAdmin.length === 0) {
      const hashedAdminPassword = await bcrypt.hash("admin123", 10);
      await connection.query(`
        INSERT INTO users (role_id, nama_lengkap, email, no_whatsapp, password)
        VALUES (1, 'Administrator KateringKita', 'admin@kateringkita.com', '081111111111', ?)
      `, [hashedAdminPassword]);
      console.log("Akun dummy Admin berhasil dibuat (admin@kateringkita.com / admin123).");
    }

    // Seed Dummy User: Merchant
    const [existingMerchant]: any = await connection.query("SELECT user_id FROM users WHERE email = 'merchant@kateringkita.com' OR no_whatsapp = '082222222222'");
    if (existingMerchant.length === 0) {
      const hashedMerchantPassword = await bcrypt.hash("merchant123", 10);
      const [userRes]: any = await connection.query(`
        INSERT INTO users (role_id, nama_lengkap, email, no_whatsapp, password)
        VALUES (2, 'Pak Barokah', 'merchant@kateringkita.com', '082222222222', ?)
      `, [hashedMerchantPassword]);

      const merchantUserId = userRes.insertId;
      await connection.query(`
        INSERT INTO merchants (user_id, type_id, nama_usaha, alamat_usaha)
        VALUES (?, 1, 'Dapur Barokah Katering', 'Kantin Gedung Vokasi Lt. 1, Kampus Terpadu')
      `, [merchantUserId]);
      console.log("Akun dummy Merchant berhasil dibuat (merchant@kateringkita.com / merchant123).");
    }

    console.log("Inisialisasi database dan seeder SELESAI!");
  } catch (error) {
    console.error("Gagal inisialisasi database:", error);
    throw error;
  } finally {
    connection.release();
  }
};

// Jalankan langsung jika dipanggil via CLI
if (require.main === module) {
  initDatabase().then(() => {
    console.log("Database siap digunakan.");
    process.exit(0);
  }).catch(() => {
    process.exit(1);
  });
}
