# Laporan Implementasi Database & Modul Autentikasi KateringKita

## 1. Ringkasan Eksekutif
Sistem **KateringKita** telah berhasil dihubungkan ke database MySQL lokal (Laragon) dengan nama database **`kateringkita`**. Seluruh tabel relasional, seeder data master, proteksi kata sandi dengan algoritma hashing standar (Bcrypt), otorisasi berbasis peran (Role-Based Access Control / RBAC), serta akun *dummy* untuk evaluasi dosen telah selesai dikonfigurasi dan diuji secara otomatis.

---

## 2. Parameter Koneksi Database (Laragon)
Konfigurasi file `.env` pada folder [backend](file:///d:/Kuliah/Semester%203/Design%20UI-UX/Project-UAS/kateringkita-web/backend/.env):
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=kateringkita
JWT_SECRET=kateringkita_jwt_secret_key_2026_uas
```

---

## 3. Struktur Skema Tabel Database (`kateringkita`)

### Diagram Relasi Entitas (ERD Sederhana)
```
+----------------+          +----------------+
|     roles      |          | merchant_types |
+----------------+          +----------------+
| role_id (PK)   |          | type_id (PK)   |
| nama_role      |          | nama_jenis     |
| deskripsi      |          | deskripsi      |
+-------+--------+          +-------+--------+
        | 1                         | 1
        | N                         | N
+-------v--------+          +-------v--------+
|     users      | 1      1 |   merchants    |
+----------------+----------+----------------+
| user_id (PK)   |<---------| merchant_id(PK)|
| role_id (FK)   |          | user_id (FK/UQ)|
| nama_lengkap   |          | type_id (FK)   |
| email          |          | nama_usaha     |
| no_whatsapp    |          | alamat_usaha   |
| password       |          +----------------+
+----------------+
```

### Detail Spesifikasi Tabel:

#### 1. Tabel `roles`
Menyimpan peran/tingkatan hak akses pengguna dalam sistem (Requirement 3.a).
| Field | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `role_id` | INT AUTO_INCREMENT (PK) | ID unik peran |
| `nama_role` | VARCHAR(50) UNIQUE | Nama peran (`admin`, `merchant`) |
| `deskripsi` | VARCHAR(255) | Keterangan izin peran |
| `created_at` | TIMESTAMP | Waktu pembuatan baris |

#### 2. Tabel `merchant_types`
Menyimpan klasifikasi kategori layanan usaha katering.
| Field | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `type_id` | INT AUTO_INCREMENT (PK) | ID unik jenis usaha |
| `nama_jenis` | VARCHAR(100) | Kategori (misal: Prasmanan, Katering Harian) |
| `deskripsi` | VARCHAR(255) | Keterangan kategori |
| `created_at` | TIMESTAMP | Waktu pembuatan baris |

#### 3. Tabel `users`
Menyimpan identitas kredensial pengguna utama dengan enkripsi kata sandi.
| Field | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `user_id` | INT AUTO_INCREMENT (PK) | ID unik pengguna |
| `role_id` | INT (FK -> `roles.role_id`) | Relasi ke peran pengguna |
| `nama_lengkap` | VARCHAR(150) | Nama lengkap pengguna |
| `email` | VARCHAR(100) UNIQUE | Alamat email pengguna |
| `no_whatsapp` | VARCHAR(25) UNIQUE | Nomor WhatsApp aktif |
| `password` | VARCHAR(255) | Hash kata sandi menggunakan **Bcrypt** |
| `created_at` | TIMESTAMP | Waktu pendaftaran |
| `updated_at` | TIMESTAMP | Waktu pembaruan akun terakhir |

#### 4. Tabel `merchants`
Menyimpan profil stand / usaha katering yang terhubung secara relasional ke akun pemilik (`users`).
| Field | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `merchant_id` | INT AUTO_INCREMENT (PK) | ID unik merchant |
| `user_id` | INT UNIQUE (FK -> `users.user_id`) | Relasi 1-to-1 ke akun pengguna pemilik |
| `type_id` | INT (FK -> `merchant_types.type_id`) | Relasi ke tipe merchant |
| `nama_usaha` | VARCHAR(150) | Nama dapur / katering |
| `alamat_usaha` | TEXT | Alamat dapur / lokasi kantin |
| `created_at` | TIMESTAMP | Waktu pendaftaran stand |
| `updated_at` | TIMESTAMP | Waktu pembaruan profil stand |

---

## 4. Akun Dummy untuk Evaluasi Dosen / Asisten (Requirement 4.a)

Sesuai ketentuan **Requirement 4.a**, sistem telah menyediakan 2 akun siap pakai dengan peran berbeda untuk keperluan pengujian dan penilaian:

### Akun 1: Administrator Sistem
- **Peran (Role)**: `admin` (Level Tertinggi)
- **Email**: `admin@kateringkita.com`
- **No. WhatsApp**: `081111111111`
- **Kata Sandi**: `admin123`
- **Hak Akses Khusus**: Mengakses data seluruh pengguna sistem (`GET /api/auth/admin/users`).

### Akun 2: Merchant / Mitra Katering
- **Peran (Role)**: `merchant`
- **Email**: `merchant@kateringkita.com`
- **No. WhatsApp**: `082222222222`
- **Kata Sandi**: `merchant123`
- **Nama Usaha**: `Dapur Barokah Katering`
- **Alamat Usaha**: `Kantin Gedung Vokasi Lt. 1, Kampus Terpadu`
- **Hak Akses**: Mengelola pesanan, antrean dapur, dan keuangan stand.

---

## 5. Implementasi Persyaratan Tugas (Requirement Checklist)

| No | Poin Requirement Tugas | Status | Detail Implementasi Teknis |
| :--- | :--- | :--- | :--- |
| **1.a** | Endpoint & Halaman Registrasi | **SELESAI** | Frontend: `/register`<br>Backend: `POST /api/auth/register` dengan validasi duplikasi WA/Email dan transaksi SQL. |
| **1.b** | Endpoint & Halaman Login | **SELESAI** | Frontend: `/login`<br>Backend: `POST /api/auth/login` validasi identifier (Email/WA) dan perbandingan kata sandi. |
| **1.c** | Endpoint & Halaman Logout | **SELESAI** | Frontend: Tombol "Keluar" di [Shell.tsx](file:///d:/Kuliah/Semester%203/Design%20UI-UX/Project-UAS/kateringkita-web/frontend/components/Shell.tsx) menghapus token & data user di `localStorage`.<br>Backend: `POST /api/auth/logout`. |
| **2.a** | Proteksi Keamanan Hashing | **SELESAI** | Menggunakan library standar industri **Bcrypt** (`bcrypt.hash(password, 10)` dan `bcrypt.compare`). |
| **3.a** | Minimal 2 Tingkat Peran (Role) | **SELESAI** | Dibuat tabel `roles` berisi peran `admin` dan `merchant`. |
| **3.b** | Middleware / Guard / Sesi | **SELESAI** | **Server Level**: [authMiddleware.ts](file:///d:/Kuliah/Semester%203/Design%20UI-UX/Project-UAS/kateringkita-web/backend/src/middlewares/authMiddleware.ts) menerapkan `authenticateToken` dan `authorizeRoles('admin')`. Percobaan akses role `merchant` ke endpoint admin menghasilkan status `403 Forbidden`.<br>**UI Level**: [layout.tsx](file:///d:/Kuliah/Semester%203/Design%20UI-UX/Project-UAS/kateringkita-web/frontend/app/%28dashboard%29/layout.tsx) menerapkan *Client-side Auth Guard*, jika pengunjung belum login maka otomatis dialihkan ke `/login`. |
| **4.a** | Dokumentasi & Akun Dummy | **SELESAI** | Telah di-seed secara otomatis ke dalam database MySQL dan terdokumentasi lengkap di laporan ini. |

---

## 6. Cara Menjalankan Sistem

### A. Menginisialisasi Ulang Database & Seeder (Jika Diperlukan)
Buka terminal pada folder `backend`:
```powershell
npm run db:init
```

### B. Menjalankan Backend API
```powershell
npm run dev
```
Backend berjalan pada: `http://localhost:5000`

### C. Menjalankan Frontend Web
Buka terminal pada folder `frontend`:
```powershell
npm run dev
```
Aplikasi web berjalan pada: `http://localhost:3000`

### D. Menjalankan Uji Coba Otomatis (Auth & RBAC Test)
```powershell
npm run test:auth
```
Hasil pengujian akan memvalidasi ke-4 requirement dan mencetak status HTTP 200 / 403 / token verifikasi secara instan.
