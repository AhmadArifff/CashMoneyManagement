<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework.

In addition, [Laracasts](https://laracasts.com) contains thousands of video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

You can also watch bite-sized lessons with real-world projects on [Laravel Learn](https://laravel.com/learn), where you will be guided through building a Laravel application from scratch while learning PHP fundamentals.

## Agentic Development

Laravel's predictable structure and conventions make it ideal for AI coding agents like Claude Code, Cursor, and GitHub Copilot. Install [Laravel Boost](https://laravel.com/docs/ai) to supercharge your AI workflow:

```bash
composer require laravel/boost --dev

php artisan boost:install
```

Boost provides your agent 15+ tools and skills that help agents build Laravel applications while following best practices.

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## Supabase Setup & Configuration

Backend CashMoneyManagement dikonfigurasi untuk terhubung dengan **Supabase PostgreSQL** dan mengelola penyimpanan bukti pengeluaran (gambar JPG/PNG/WEBP atau PDF).

### 1. Konfigurasi Database Supabase (`.env`)

Pastikan file `.env` memiliki variabel berikut (ganti `YOUR_SUPABASE_PASSWORD` dengan password database Supabase milikmu):

```env
DB_CONNECTION=pgsql
DB_HOST=aws-0-ap-southeast-1.pooler.supabase.com
DB_PORT=6543
DB_DATABASE=postgres
DB_USERNAME=postgres.vcwowbvufxhokeefrcdk
DB_PASSWORD=YOUR_SUPABASE_PASSWORD
DB_SSLMODE=require
```

> **Persyaratan PHP CLI:** Pastikan ekstensi `pdo_pgsql` dan `pgsql` telah diaktifkan di `php.ini` environment PHP lokal milikmu.

### 2. Jalankan Migrasi & Seeding Database

Untuk membuat seluruh tabel dan seeding data sampel awal pada database Supabase:

```bash
# Menjalankan migrasi database ke Supabase
php artisan migrate

# Menjalankan seeder sampel data (User, Profile, Expenses, Incomes, Allocations)
php artisan db:seed

# Atau jalankan migrasi fresh + seed sekaligus:
php artisan migrate:fresh --seed
```

### 3. Konfigurasi Storage (Bukti Pengeluaran / Receipts)

Backend mendukung penyimpanan file gambar (`jpg`, `jpeg`, `png`, `webp`) dan dokumen (`pdf`) hingga **10MB** per file.

#### A. Penyimpanan Lokal (Default)
Untuk menggunakan penyimpanan lokal via `storage/app/public/receipts`:
```bash
php artisan storage:link
```
File akan dapat diakses publik di path `/storage/receipts/...`.

#### B. Penyimpanan Cloud (Supabase S3 Storage)
Jika ingin mengaktifkan Supabase Cloud S3 Storage, isi variabel berikut di `.env`:
```env
FILESYSTEM_DISK=supabase
SUPABASE_URL=https://vcwowbvufxhokeefrcdk.supabase.co
SUPABASE_STORAGE_BUCKET=receipts
SUPABASE_STORAGE_KEY=your_supabase_s3_access_key
SUPABASE_STORAGE_SECRET=your_supabase_s3_secret_key
SUPABASE_STORAGE_REGION=ap-southeast-1
```
Jika menggunakan `FILESYSTEM_DISK=supabase`, install paket AWS S3 Flysystem adapter:
```bash
composer require league/flysystem-aws-s3-v3
```

---

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
