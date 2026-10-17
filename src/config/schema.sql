-- ========================================================
-- Schema Database KateringKita
-- Database: kateringkita
-- ========================================================

CREATE DATABASE IF NOT EXISTS `kateringkita` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `kateringkita`;

-- 1. Tabel roles (Hak Akses Pengguna)
CREATE TABLE IF NOT EXISTS `roles` (
  `role_id` INT AUTO_INCREMENT PRIMARY KEY,
  `nama_role` VARCHAR(50) NOT NULL UNIQUE,
  `deskripsi` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Tabel merchant_types (Kategori Jenis Usaha Katering)
CREATE TABLE IF NOT EXISTS `merchant_types` (
  `type_id` INT AUTO_INCREMENT PRIMARY KEY,
  `nama_jenis` VARCHAR(100) NOT NULL,
  `deskripsi` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Tabel users (Akun Pengguna: Admin, Merchant, dll)
CREATE TABLE IF NOT EXISTS `users` (
  `user_id` INT AUTO_INCREMENT PRIMARY KEY,
  `role_id` INT NOT NULL,
  `nama_lengkap` VARCHAR(150) NOT NULL,
  `email` VARCHAR(100) NULL UNIQUE,
  `no_whatsapp` VARCHAR(25) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Tabel merchants (Data Profil Stand / Bisnis Katering)
CREATE TABLE IF NOT EXISTS `merchants` (
  `merchant_id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL UNIQUE,
  `type_id` INT NOT NULL,
  `nama_usaha` VARCHAR(150) NOT NULL,
  `alamat_usaha` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_merchants_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_merchants_type` FOREIGN KEY (`type_id`) REFERENCES `merchant_types` (`type_id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
