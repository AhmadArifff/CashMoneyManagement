# PRD — CashMoneyManagement Backend (Laravel API)

| | |
|---|---|
| **Produk** | CashMoneyManagement — Backend API |
| **Konsumen API** | Frontend Next.js (React) PWA — sudah dibangun |
| **Framework** | Laravel 13.x (PHP 8.3+) |
| **Database** | MySQL 8 (lokal via Laragon) |
| **Arsitektur** | Repository Pattern + Service Layer |
| **Auth** | Laravel Sanctum (token-based, cocok untuk frontend terpisah/PWA) |
| **Status** | Draft v1.0 |

---

## 1. Ringkasan & Tujuan

Dokumen ini mendefinisikan backend API Laravel untuk aplikasi **CashMoneyManagement**, yang akan dikonsumsi oleh frontend Next.js (PWA) yang sudah ada. Backend bertanggung jawab atas:

1. **Autentikasi pengguna** (register, login, logout, session token).
2. **Manajemen profil / personalisasi** — data diri, pekerjaan, dan preferensi pengguna.
3. **CRUD data keuangan** — Pengeluaran (Tetap/Berkala/Dinamis), Pemasukan (Earned/Passive/Portfolio), dan Dana Alokasi (Darurat/Asuransi/Investasi/Cadangan).
4. **Endpoint agregasi** untuk dashboard (ringkasan saldo, tagihan belum dibayar, tren mingguan/bulanan) — menggantikan logika yang sebelumnya berjalan di sisi klien (localStorage) pada versi HTML prototipe.

Struktur data pada tabel migrasi di bawah **mengikuti persis** model data yang sudah dipakai di frontend (kategori pengeluaran, pemasukan, alokasi), supaya integrasi tidak memerlukan perubahan besar pada UI yang sudah jadi.

**Di luar cakupan (out of scope):** implementasi UI Next.js (sudah selesai di sisi kamu), payment gateway, notifikasi push.

---

## 2. Tech Stack

| Layer | Pilihan | Alasan |
|---|---|---|
| Framework | Laravel 13.x, PHP 8.3+ | Versi stabil terbaru, native attribute-based model config, dukungan jangka panjang |
| Database | MySQL 8 (via Laragon) | Sesuai environment lokal yang sudah kamu pakai |
| Auth | Laravel Sanctum (Personal Access Token) | Frontend Next.js berjalan di origin/domain terpisah dan sebagai PWA (bisa standalone tanpa cookie browser) — token Bearer lebih robust dibanding cookie-based SPA auth untuk kasus ini |
| Arsitektur data access | Repository Pattern + Service Layer | Memisahkan logika query (Repository) dari logika bisnis (Service) dan HTTP (Controller) — memudahkan testing & maintenance |
| API response | Laravel API Resource (JSON:API-like, konsisten) | Kontrak response stabil untuk frontend |
| Validasi | Form Request classes | Validasi terpusat, reusable |
| Testing | Pest / PHPUnit (feature test per endpoint) | Menjamin regresi tidak lolos |

> **Catatan soal deployment:** Laravel adalah aplikasi PHP full-stack (bukan serverless function), jadi secara teknis **tidak cocok untuk hosting di Vercel** (Vercel dioptimalkan untuk Next.js/serverless, bukan proses PHP long-running). Untuk production, opsi yang lebih tepat: VPS (DigitalOcean/Contabo), **Laravel Forge**, **Laravel Cloud**, Railway, atau shared hosting cPanel yang mendukung PHP 8.3. Frontend Next.js kamu tetap bisa di-deploy ke Vercel seperti biasa dan memanggil API Laravel ini lewat `NEXT_PUBLIC_API_URL`.

---

## 3. Struktur Folder (Repository Pattern)

```
app/
├── Console/
├── Http/
│   ├── Controllers/
│   │   └── Api/
│   │       ├── AuthController.php
│   │       ├── ProfileController.php
│   │       ├── ExpenseController.php
│   │       ├── IncomeController.php
│   │       ├── AllocationController.php
│   │       └── DashboardController.php
│   ├── Requests/
│   │   ├── Auth/RegisterRequest.php
│   │   ├── Auth/LoginRequest.php
│   │   ├── UpdateProfileRequest.php
│   │   ├── StoreExpenseRequest.php
│   │   ├── StoreIncomeRequest.php
│   │   └── StoreAllocationRequest.php
│   └── Resources/
│       ├── UserResource.php
│       ├── ProfileResource.php
│       ├── ExpenseResource.php
│       ├── IncomeResource.php
│       └── AllocationResource.php
├── Models/
│   ├── User.php
│   ├── Profile.php
│   ├── Expense.php
│   ├── Income.php
│   └── Allocation.php
├── Policies/
│   ├── ExpensePolicy.php
│   ├── IncomePolicy.php
│   └── AllocationPolicy.php
├── Repositories/
│   ├── Contracts/
│   │   ├── BaseRepositoryInterface.php
│   │   ├── ProfileRepositoryInterface.php
│   │   ├── ExpenseRepositoryInterface.php
│   │   ├── IncomeRepositoryInterface.php
│   │   └── AllocationRepositoryInterface.php
│   └── Eloquent/
│       ├── BaseRepository.php
│       ├── ProfileRepository.php
│       ├── ExpenseRepository.php
│       ├── IncomeRepository.php
│       └── AllocationRepository.php
├── Services/
│   ├── ProfileService.php
│   ├── ExpenseService.php
│   ├── IncomeService.php
│   ├── AllocationService.php
│   └── DashboardService.php
└── Providers/
    └── RepositoryServiceProvider.php
```

Alur request: **Route → Controller → Service → Repository (Contract) → Eloquent Model → Database**. Controller tidak pernah memanggil Eloquent langsung; Service tidak pernah tahu detail query — itu tugas Repository.

---

## 4. Skema Database (ERD ringkas)

```
users (1) ────< (1) profiles
users (1) ────< (N) expenses
users (1) ────< (N) incomes
users (1) ────< (N) allocations
users (1) ────< (N) personal_access_tokens   [dari Sanctum]
```

| Tabel | Fungsi |
|---|---|
| `users` | Akun login (email/password) |
| `profiles` | Data personalisasi: pekerjaan, data diri, preferensi |
| `expenses` | Pengeluaran Tetap / Berkala / Dinamis |
| `incomes` | Pemasukan Earned / Passive / Portfolio |
| `allocations` | Dana Alokasi Darurat / Asuransi / Investasi / Cadangan |
| `personal_access_tokens` | Token Sanctum (auto-generated oleh package) |

---

## 5. Migrasi Tabel

### 5.1 `users` (modifikasi default Laravel)

```php
<?php
// database/migrations/0001_01_01_000000_create_users_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->rememberToken();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
```

### 5.2 `profiles` — personalisasi & data diri

```php
<?php
// database/migrations/2026_07_01_000001_create_profiles_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();

            // Data diri
            $table->string('phone_number')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->enum('gender', ['pria', 'wanita', 'lainnya'])->nullable();
            $table->string('address')->nullable();
            $table->string('city')->nullable();
            $table->string('province')->nullable();
            $table->string('postal_code', 10)->nullable();
            $table->string('avatar_path')->nullable();

            // Pekerjaan
            $table->string('job_title')->nullable();       // Pekerjaan / jabatan
            $table->string('company_name')->nullable();     // Tempat kerja
            $table->enum('employment_type', ['karyawan', 'wirausaha', 'freelance', 'pelajar', 'lainnya'])->nullable();
            $table->decimal('monthly_income_estimate', 15, 2)->nullable(); // estimasi gaji/pendapatan bulanan

            // Preferensi aplikasi
            $table->string('currency', 5)->default('IDR');
            $table->string('timezone')->default('Asia/Jakarta');
            $table->json('notification_preferences')->nullable(); // mis. {"unpaid_bill_alert": true}

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('profiles');
    }
};
```

### 5.3 `expenses`

```php
<?php
// database/migrations/2026_07_01_000002_create_expenses_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            $table->enum('category', ['tetap', 'berkala', 'dinamis']);
            $table->string('subcategory');                 // mis. "Sewa Rumah", "Makan & Minum"
            $table->string('frequency')->nullable();        // harian/mingguan/bulanan/3bulan/6bulan/tahunan
            $table->decimal('amount', 15, 2);
            $table->date('date');
            $table->enum('status', ['paid', 'unpaid'])->default('unpaid');
            $table->boolean('is_estimate')->default(false);
            $table->text('note')->nullable();

            $table->timestamps();

            $table->index(['user_id', 'date']);
            $table->index(['user_id', 'category', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
```

### 5.4 `incomes`

```php
<?php
// database/migrations/2026_07_01_000003_create_incomes_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('incomes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            $table->enum('category', ['earned', 'passive', 'portfolio']);
            $table->string('subcategory');                 // mis. "Gaji Bulanan", "Dividen Saham"
            $table->decimal('amount', 15, 2);
            $table->date('date');
            $table->text('note')->nullable();

            $table->timestamps();

            $table->index(['user_id', 'date']);
            $table->index(['user_id', 'category']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('incomes');
    }
};
```

### 5.5 `allocations`

```php
<?php
// database/migrations/2026_07_01_000004_create_allocations_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('allocations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            $table->enum('category', ['darurat', 'asuransi', 'investasi', 'cadangan']);
            $table->string('subcategory');                 // mis. "Reksadana", "Asuransi Jiwa"
            $table->decimal('amount', 15, 2);
            $table->date('date');
            $table->text('note')->nullable();

            $table->timestamps();

            $table->index(['user_id', 'date']);
            $table->index(['user_id', 'category']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('allocations');
    }
};
```

### 5.6 `personal_access_tokens` (Sanctum)

Tabel ini **otomatis dibuat** saat menjalankan `php artisan install:api` (lihat bagian 9). Tidak perlu ditulis manual.

---

## 6. Model (Eloquent)

```php
<?php
// app/Models/User.php
namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = ['name', 'email', 'password'];
    protected $hidden = ['password', 'remember_token'];

    public function profile()
    {
        return $this->hasOne(Profile::class);
    }

    public function expenses() { return $this->hasMany(Expense::class); }
    public function incomes() { return $this->hasMany(Income::class); }
    public function allocations() { return $this->hasMany(Allocation::class); }
}
```

```php
<?php
// app/Models/Profile.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Profile extends Model
{
    protected $fillable = [
        'user_id', 'phone_number', 'date_of_birth', 'gender', 'address', 'city',
        'province', 'postal_code', 'avatar_path', 'job_title', 'company_name',
        'employment_type', 'monthly_income_estimate', 'currency', 'timezone',
        'notification_preferences',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'notification_preferences' => 'array',
        'monthly_income_estimate' => 'decimal:2',
    ];

    public function user() { return $this->belongsTo(User::class); }
}
```

```php
<?php
// app/Models/Expense.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    protected $fillable = [
        'user_id', 'category', 'subcategory', 'frequency', 'amount',
        'date', 'status', 'is_estimate', 'note',
    ];

    protected $casts = [
        'date' => 'date',
        'is_estimate' => 'boolean',
        'amount' => 'decimal:2',
    ];

    public function user() { return $this->belongsTo(User::class); }
}
```

`Income` dan `Allocation` model mengikuti pola yang sama (fillable disesuaikan kolom masing-masing).

---

## 7. Repository Pattern — Implementasi

### 7.1 Base contract & implementation

```php
<?php
// app/Repositories/Contracts/BaseRepositoryInterface.php
namespace App\Repositories\Contracts;

interface BaseRepositoryInterface
{
    public function all(array $filters = []);
    public function find(int $id);
    public function create(array $data);
    public function update(int $id, array $data);
    public function delete(int $id): bool;
}
```

```php
<?php
// app/Repositories/Eloquent/BaseRepository.php
namespace App\Repositories\Eloquent;

use App\Repositories\Contracts\BaseRepositoryInterface;
use Illuminate\Database\Eloquent\Model;

abstract class BaseRepository implements BaseRepositoryInterface
{
    public function __construct(protected Model $model) {}

    public function all(array $filters = [])
    {
        return $this->applyFilters($this->model->newQuery(), $filters)->get();
    }

    public function find(int $id)
    {
        return $this->model->findOrFail($id);
    }

    public function create(array $data)
    {
        return $this->model->create($data);
    }

    public function update(int $id, array $data)
    {
        $record = $this->find($id);
        $record->update($data);
        return $record->fresh();
    }

    public function delete(int $id): bool
    {
        return (bool) $this->find($id)->delete();
    }

    protected function applyFilters($query, array $filters)
    {
        return $query;
    }
}
```

### 7.2 Expense repository (contoh lengkap — Income & Allocation mengikuti pola yang sama)

> **Poin kritis (jawaban atas pertanyaan keamanan kamu):** method `find()`/`update()`/`delete()` bawaan `BaseRepository` bekerja murni berdasarkan primary key — **tidak tahu siapa pemilik datanya**. Kalau controller memanggil method itu langsung untuk endpoint `PUT/DELETE /api/expenses/{id}`, seorang user yang login bisa saja mengubah/menghapus data milik user lain hanya dengan menebak-nebak `id` (1, 2, 3, dst) — ini yang disebut **IDOR (Insecure Direct Object Reference)**, dan itu persis kekhawatiran yang kamu sebutkan. Solusinya: setiap operasi pada satu record **wajib** melalui method yang men-scope query dengan `user_id`, bukan cuma `id` — method `findForUser()` di bawah ini.

```php
<?php
// app/Repositories/Contracts/ExpenseRepositoryInterface.php
namespace App\Repositories\Contracts;

interface ExpenseRepositoryInterface extends BaseRepositoryInterface
{
    public function forUserInRange(int $userId, string $start, string $end, array $filters = []);
    public function paginateForUser(int $userId, string $start, string $end, array $filters = [], int $perPage = 20);
    public function findForUser(int $userId, string $id);   // <-- kunci anti-IDOR
    public function unpaidBills(int $userId);
    public function monthlyTotals(int $userId, int $months = 6);
}
```

```php
<?php
// app/Repositories/Eloquent/ExpenseRepository.php
namespace App\Repositories\Eloquent;

use App\Models\Expense;
use App\Repositories\Contracts\ExpenseRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class ExpenseRepository extends BaseRepository implements ExpenseRepositoryInterface
{
    public function __construct(Expense $model)
    {
        parent::__construct($model);
    }

    public function forUserInRange(int $userId, string $start, string $end, array $filters = [])
    {
        return $this->scopedQuery($userId, $start, $end, $filters)->orderByDesc('date')->get();
    }

    // Dipakai untuk endpoint listing produksi — payload dibatasi per halaman,
    // bukan "dump semua data" dalam satu response body.
    public function paginateForUser(int $userId, string $start, string $end, array $filters = [], int $perPage = 20)
    {
        return $this->scopedQuery($userId, $start, $end, $filters)
            ->orderByDesc('date')
            ->paginate($perPage);
    }

    // Satu-satunya cara mengambil 1 record untuk endpoint show/update/delete/mark-paid.
    // Query WHERE id = ? AND user_id = ? sekaligus — kalau id valid tapi bukan
    // milik user ini, hasilnya "tidak ditemukan" (404), BUKAN 403.
    // Ini sengaja: 403 justru membocorkan informasi "ID ini ada, tapi bukan punyamu",
    // sedangkan 404 tidak membocorkan apa pun ke pihak yang tidak berhak.
    public function findForUser(int $userId, string $id)
    {
        $record = $this->model->newQuery()
            ->where('id', $id)
            ->where('user_id', $userId)
            ->first();

        if (!$record) {
            throw new NotFoundHttpException('Data tidak ditemukan.');
        }

        return $record;
    }

    public function unpaidBills(int $userId)
    {
        return $this->model->newQuery()
            ->where('user_id', $userId)
            ->whereIn('category', ['tetap', 'berkala'])
            ->where('status', 'unpaid')
            ->where('is_estimate', false)
            ->orderBy('date')
            ->get();
    }

    public function monthlyTotals(int $userId, int $months = 6)
    {
        return $this->model->newQuery()
            ->where('user_id', $userId)
            ->where('date', '>=', now()->subMonths($months)->startOfMonth())
            ->where('is_estimate', false)
            ->select(DB::raw("DATE_FORMAT(date, '%Y-%m') as month"), DB::raw('SUM(amount) as total'))
            ->groupBy('month')
            ->orderBy('month')
            ->get();
    }

    private function scopedQuery(int $userId, string $start, string $end, array $filters = [])
    {
        $query = $this->model->newQuery()
            ->where('user_id', $userId)
            ->whereBetween('date', [$start, $end]);

        if (!empty($filters['category'])) {
            $query->where('category', $filters['category']);
        }
        if (array_key_exists('include_estimate', $filters) && !$filters['include_estimate']) {
            $query->where('is_estimate', false);
        }

        return $query;
    }
}
```

`IncomeRepository` dan `AllocationRepository` menerapkan `findForUser()` dengan pola identik — ini bukan opsional, method ini wajib ada di ketiganya karena di situlah proteksi IDOR sebenarnya terjadi.

### 7.3 Binding interface ke implementasi

```php
<?php
// app/Providers/RepositoryServiceProvider.php
namespace App\Providers;

use App\Repositories\Contracts\{
    ExpenseRepositoryInterface, IncomeRepositoryInterface,
    AllocationRepositoryInterface, ProfileRepositoryInterface
};
use App\Repositories\Eloquent\{
    ExpenseRepository, IncomeRepository, AllocationRepository, ProfileRepository
};
use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(ExpenseRepositoryInterface::class, ExpenseRepository::class);
        $this->app->bind(IncomeRepositoryInterface::class, IncomeRepository::class);
        $this->app->bind(AllocationRepositoryInterface::class, AllocationRepository::class);
        $this->app->bind(ProfileRepositoryInterface::class, ProfileRepository::class);
    }
}
```

Daftarkan di `bootstrap/providers.php` (skema provider Laravel 11+/13):

```php
return [
    App\Providers\AppServiceProvider::class,
    App\Providers\RepositoryServiceProvider::class,
];
```

### 7.4 Service layer (logika bisnis, dipakai Controller)

```php
<?php
// app/Services/ExpenseService.php
namespace App\Services;

use App\Repositories\Contracts\ExpenseRepositoryInterface;

class ExpenseService
{
    public function __construct(protected ExpenseRepositoryInterface $expenses) {}

    public function list(int $userId, string $start, string $end, array $filters = [])
    {
        return $this->expenses->paginateForUser($userId, $start, $end, $filters);
    }

    public function store(int $userId, array $data)
    {
        $data['user_id'] = $userId; // selalu dari token yang login, TIDAK PERNAH dari body request
        // Pengeluaran dinamis dianggap otomatis "paid" (sudah terjadi saat dicatat)
        $data['status'] = $data['category'] === 'dinamis' ? 'paid' : ($data['status'] ?? 'unpaid');
        return $this->expenses->create($data);
    }

    public function update(int $userId, string $id, array $data)
    {
        // findForUser melempar 404 kalau id tidak ada ATAU bukan milik $userId —
        // baris ini yang mencegah user A meng-update data user B.
        $expense = $this->expenses->findForUser($userId, $id);
        unset($data['user_id']); // jaga-jaga: field ini tidak boleh bisa diubah lewat body sama sekali
        return $this->expenses->update($expense->id, $data);
    }

    public function markPaid(int $userId, string $id)
    {
        $expense = $this->expenses->findForUser($userId, $id);
        return $this->expenses->update($expense->id, ['status' => 'paid']);
    }

    public function delete(int $userId, string $id): bool
    {
        $expense = $this->expenses->findForUser($userId, $id);
        return $this->expenses->delete($expense->id);
    }

    public function unpaidBills(int $userId)
    {
        return $this->expenses->unpaidBills($userId);
    }
}
```

`IncomeService` dan `AllocationService` mengikuti pola yang sama (tanpa logika status/estimate) — **`update()` dan `delete()` keduanya wajib memanggil `findForUser()` lebih dulu**, bukan langsung `$this->repo->update($id, ...)`.

### 7.5 Controller — cara memasangnya dengan benar (anti-IDOR + validasi terpisah dari update)

Ini bagian yang tadinya hilang dari draf pertama, dan itu yang bikin kekhawatiran kamu valid: kalau controller-nya salah tulis (langsung teruskan `$id` dari URL tanpa lewat `findForUser`), semua proteksi di atas jadi percuma. Jadi controller **tidak boleh** memakai implicit route-model-binding (`Route::apiResource` dengan `{expense}` auto-resolve) untuk endpoint yang sensitif — `$id` di URL cukup dianggap string mentah, lalu diteruskan ke Service yang men-scope by user.

```php
<?php
// app/Http/Controllers/Api/ExpenseController.php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\{StoreExpenseRequest, UpdateExpenseRequest};
use App\Http\Resources\ExpenseResource;
use App\Services\ExpenseService;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    public function __construct(protected ExpenseService $expenseService) {}

    public function index(Request $request)
    {
        $validated = $request->validate([
            'start' => 'required|date',
            'end' => 'required|date|after_or_equal:start',
            'category' => 'nullable|in:tetap,berkala,dinamis',
        ]);

        $expenses = $this->expenseService->list($request->user()->id, $validated['start'], $validated['end'], $validated);

        // paginate() otomatis membungkus hasil dengan meta (current_page, per_page, total, dst)
        // — bukan array mentah semua baris dalam satu body.
        return ExpenseResource::collection($expenses);
    }

    public function store(StoreExpenseRequest $request)
    {
        $expense = $this->expenseService->store($request->user()->id, $request->validated());
        return (new ExpenseResource($expense))->response()->setStatusCode(201);
    }

    public function update(UpdateExpenseRequest $request, string $expense)
    {
        $updated = $this->expenseService->update($request->user()->id, $expense, $request->validated());
        return new ExpenseResource($updated);
    }

    public function markPaid(Request $request, string $expense)
    {
        $updated = $this->expenseService->markPaid($request->user()->id, $expense);
        return new ExpenseResource($updated);
    }

    public function destroy(Request $request, string $expense)
    {
        $this->expenseService->delete($request->user()->id, $expense);
        return response()->json(null, 204);
    }
}
```

```php
<?php
// app/Http/Requests/StoreExpenseRequest.php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreExpenseRequest extends FormRequest
{
    public function authorize(): bool { return true; } // otorisasi kepemilikan ditangani Service, bukan di sini

    public function rules(): array
    {
        return [
            'category' => 'required|in:tetap,berkala,dinamis',
            'subcategory' => 'required|string|max:100',
            'frequency' => 'nullable|string|max:20',
            'amount' => 'required|numeric|min:0',
            'date' => 'required|date',
            'status' => 'nullable|in:paid,unpaid',
            'is_estimate' => 'nullable|boolean',
            'note' => 'nullable|string|max:500',
            // 'user_id' SENGAJA TIDAK ADA di sini — kalau ini ikut divalidasi,
            // client bisa mengirim user_id siapa pun lewat body request.
        ];
    }
}
```

`UpdateExpenseRequest` memakai rules yang sama tapi semua field `sometimes` (opsional per-field untuk partial update), dan **`IncomeController`/`AllocationController` mengikuti pola identik** — `index()` pakai `paginateForUser()`, `update()`/`markPaid()`/`destroy()` selalu resolve via `findForUser()` di Service sebelum menyentuh data.

### 7.6 `DashboardService` — agregasi untuk kartu ringkasan & tren

```php
<?php
// app/Services/DashboardService.php
namespace App\Services;

use App\Repositories\Contracts\{ExpenseRepositoryInterface, IncomeRepositoryInterface, AllocationRepositoryInterface};

class DashboardService
{
    public function __construct(
        protected ExpenseRepositoryInterface $expenses,
        protected IncomeRepositoryInterface $incomes,
        protected AllocationRepositoryInterface $allocations,
    ) {}

    public function summary(int $userId, string $start, string $end): array
    {
        $expenses = $this->expenses->forUserInRange($userId, $start, $end, ['include_estimate' => false]);
        $incomes = $this->incomes->forUserInRange($userId, $start, $end);
        $allocations = $this->allocations->forUserInRange($userId, $start, $end);

        $totalExpense = $expenses->sum('amount');
        $totalIncome = $incomes->sum('amount');
        $totalAllocation = $allocations->sum('amount');

        return [
            'total_income' => $totalIncome,
            'total_expense' => $totalExpense,
            'total_allocation' => $totalAllocation,
            'balance' => $totalIncome - $totalExpense - $totalAllocation,
            'expense_by_category' => $expenses->groupBy('category')->map->sum('amount'),
            'income_by_category' => $incomes->groupBy('category')->map->sum('amount'),
            'allocation_by_category' => $allocations->groupBy('category')->map->sum('amount'),
        ];
    }

    public function unpaidBills(int $userId)
    {
        return $this->expenses->unpaidBills($userId);
    }
}
```

---

## 8. Autentikasi (Login)

**Pendekatan:** Laravel Sanctum, mode **token Bearer** (bukan cookie SPA), karena frontend Next.js kemungkinan berjalan sebagai PWA standalone / origin terpisah dari backend — token lebih portable dan tidak bergantung pada cookie pihak ketiga.

### 8.1 Endpoint

| Method | Endpoint | Deskripsi | Auth |
|---|---|---|---|
| POST | `/api/register` | Registrasi akun baru | - |
| POST | `/api/login` | Login, mengembalikan token | - |
| POST | `/api/logout` | Hapus token aktif | ✅ |
| GET | `/api/me` | Data user + profil yang sedang login | ✅ |

### 8.2 Controller

> Draf pertama sempat mengembalikan `$user` mentah (`return response()->json(['user' => $user, ...])`). Itu **bergantung pada blacklist** (`$hidden` di model) untuk menyembunyikan field sensitif — kalau suatu saat ada kolom baru ditambahkan ke tabel `users` dan lupa dimasukkan ke `$hidden`, kolom itu otomatis ikut terkirim ke client. Lebih aman pakai **whitelist eksplisit** lewat API Resource seperti modul lain (`UserResource`) — field yang boleh keluar didefinisikan satu-satu, jadi kolom baru yang lupa di-whitelist justru default-nya **tidak** ikut terkirim.

```php
<?php
// app/Http/Resources/UserResource.php
namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'profile' => new ProfileResource($this->whenLoaded('profile')),
        ];
    }
}
```

```php
<?php
// app/Http/Controllers/Api/AuthController.php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\{LoginRequest, RegisterRequest};
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(RegisterRequest $request)
    {
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);
        $user->profile()->create([]); // profil kosong, diisi belakangan lewat /api/profile

        return response()->json([
            'user' => new UserResource($user),
            'token' => $user->createToken('cashmoney-app')->plainTextToken,
        ], 201);
    }

    public function login(LoginRequest $request)
    {
        $user = User::where('email', $request->email)->first();

        // Pesan error digeneralkan (bukan "email tidak ditemukan" vs "password salah")
        // supaya endpoint ini tidak bisa dipakai untuk mengecek email mana yang terdaftar.
        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages(['email' => ['Email atau password salah.']]);
        }

        return response()->json([
            'user' => new UserResource($user->load('profile')),
            'token' => $user->createToken('cashmoney-app')->plainTextToken,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Berhasil logout']);
    }

    public function me(Request $request)
    {
        return new UserResource($request->user()->load('profile'));
    }
}
```

`/login` dan `/register` juga diberi rate limit khusus yang lebih ketat daripada endpoint lain — lihat Bagian 12.4.

### 8.3 Form Requests

```php
<?php
// app/Http/Requests/Auth/RegisterRequest.php
namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
        ];
    }
}
```

```php
<?php
// app/Http/Requests/Auth/LoginRequest.php
namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'email' => 'required|email',
            'password' => 'required|string',
        ];
    }
}
```

Frontend Next.js menyimpan `token` (mis. di memory + httpOnly-safe storage strategy pilihan kamu) dan mengirimkannya di setiap request lewat header:

```
Authorization: Bearer <token>
Accept: application/json
```

---

## 9. Profil & Personalisasi

Fitur edit data diri (pekerjaan, data pribadi, preferensi) terpisah dari tabel `users` (auth) agar auth tetap ringan dan personalisasi bisa berkembang tanpa menyentuh logika login.

### 9.1 Endpoint

| Method | Endpoint | Deskripsi | Auth |
|---|---|---|---|
| GET | `/api/profile` | Ambil profil user yang login | ✅ |
| PUT | `/api/profile` | Update data diri & pekerjaan | ✅ |
| POST | `/api/profile/avatar` | Upload/ganti foto profil | ✅ |

### 9.2 Field yang bisa diedit

- **Data pribadi:** nama (di tabel `users`), no. telepon, tanggal lahir, jenis kelamin, alamat, kota, provinsi, kode pos, foto profil.
- **Pekerjaan:** jabatan/pekerjaan, nama perusahaan, jenis pekerjaan (karyawan/wirausaha/freelance/pelajar/lainnya), estimasi pendapatan bulanan.
- **Preferensi:** mata uang, timezone, preferensi notifikasi (mis. alert tagihan on/off).

### 9.3 Controller & Service

```php
<?php
// app/Http/Controllers/Api/ProfileController.php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateProfileRequest;
use App\Services\ProfileService;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function __construct(protected ProfileService $profileService) {}

    public function show(Request $request)
    {
        return $this->profileService->getForUser($request->user()->id);
    }

    public function update(UpdateProfileRequest $request)
    {
        return $this->profileService->update($request->user()->id, $request->validated());
    }

    public function uploadAvatar(Request $request)
    {
        $request->validate(['avatar' => 'required|image|max:2048']);
        $path = $request->file('avatar')->store('avatars', 'public');
        return $this->profileService->update($request->user()->id, ['avatar_path' => $path]);
    }
}
```

```php
<?php
// app/Http/Requests/UpdateProfileRequest.php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'phone_number' => 'nullable|string|max:20',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|in:pria,wanita,lainnya',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'province' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:10',
            'job_title' => 'nullable|string|max:100',
            'company_name' => 'nullable|string|max:150',
            'employment_type' => 'nullable|in:karyawan,wirausaha,freelance,pelajar,lainnya',
            'monthly_income_estimate' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|max:5',
            'timezone' => 'nullable|string|max:50',
            'notification_preferences' => 'nullable|array',
        ];
    }
}
```

```php
<?php
// app/Services/ProfileService.php
namespace App\Services;

use App\Repositories\Contracts\ProfileRepositoryInterface;

class ProfileService
{
    public function __construct(protected ProfileRepositoryInterface $profiles) {}

    public function getForUser(int $userId)
    {
        return $this->profiles->findByUserId($userId);
    }

    public function update(int $userId, array $data)
    {
        return $this->profiles->updateByUserId($userId, $data);
    }
}
```

`ProfileRepository` menambahkan dua method khusus (`findByUserId`, `updateByUserId`) di atas `BaseRepository`, karena relasinya 1-1 dengan `user_id`, bukan primary key `id` langsung.

---

## 10. Ringkasan Seluruh Endpoint API

| Modul | Method & Endpoint | Deskripsi |
|---|---|---|
| Auth | `POST /api/register` | Registrasi |
| | `POST /api/login` | Login |
| | `POST /api/logout` | Logout |
| | `GET /api/me` | Data user + profil aktif |
| Profil | `GET /api/profile` | Lihat profil |
| | `PUT /api/profile` | Update data diri & pekerjaan |
| | `POST /api/profile/avatar` | Upload foto profil |
| Pengeluaran | `GET /api/expenses?start&end&category` | List + filter tanggal/kategori |
| | `POST /api/expenses` | Tambah pengeluaran |
| | `PUT /api/expenses/{id}` | Edit pengeluaran |
| | `DELETE /api/expenses/{id}` | Hapus pengeluaran |
| | `PATCH /api/expenses/{id}/mark-paid` | Tandai tagihan lunas |
| Pemasukan | `GET /api/incomes?start&end&category` | List + filter |
| | `POST /api/incomes` | Tambah pemasukan |
| | `PUT /api/incomes/{id}` | Edit pemasukan |
| | `DELETE /api/incomes/{id}` | Hapus pemasukan |
| Alokasi | `GET /api/allocations?start&end&category` | List + filter |
| | `POST /api/allocations` | Tambah alokasi |
| | `PUT /api/allocations/{id}` | Edit alokasi |
| | `DELETE /api/allocations/{id}` | Hapus alokasi |
| Dashboard | `GET /api/dashboard/summary?start&end` | Total masuk/keluar/alokasi/saldo + breakdown kategori |
| | `GET /api/dashboard/unpaid-bills` | Daftar tagihan belum dibayar (untuk badge lonceng) |

### 10.1 `routes/api.php`

```php
<?php

use App\Http\Controllers\Api\{
    AuthController, ProfileController, ExpenseController,
    IncomeController, AllocationController, DashboardController
};
use Illuminate\Support\Facades\Route;

Route::middleware('throttle:5,1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/profile/avatar', [ProfileController::class, 'uploadAvatar']);

    Route::apiResource('expenses', ExpenseController::class)->except(['show']);
    Route::patch('/expenses/{expense}/mark-paid', [ExpenseController::class, 'markPaid']);

    Route::apiResource('incomes', IncomeController::class)->except(['show']);
    Route::apiResource('allocations', AllocationController::class)->except(['show']);

    Route::get('/dashboard/summary', [DashboardController::class, 'summary']);
    Route::get('/dashboard/unpaid-bills', [DashboardController::class, 'unpaidBills']);
});
```

> Perhatikan controller di Bagian 7.5 men-type-hint parameter route sebagai `string $expense` (bukan `Expense $expense`). Ini **sengaja** — kalau di-type-hint sebagai model, Laravel akan otomatis melakukan *implicit route-model-binding* (`findOrFail($id)` tanpa peduli `user_id`), yang justru membuka lagi celah IDOR di Bagian 12.1. Dengan menerima `string` mentah lalu meneruskannya ke Service yang memanggil `findForUser()`, scoping kepemilikan tidak bisa terlewat.

---

## 11. Format Response (API Resource)

Semua response sukses dibungkus struktur konsisten lewat `Illuminate\Http\Resources\Json\JsonResource`, contoh:

```php
<?php
// app/Http/Resources/ExpenseResource.php
namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ExpenseResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'category' => $this->category,
            'subcategory' => $this->subcategory,
            'frequency' => $this->frequency,
            'amount' => (float) $this->amount,
            'date' => $this->date->toDateString(),
            'status' => $this->status,
            'is_estimate' => $this->is_estimate,
            'note' => $this->note,
            'created_at' => $this->created_at,
        ];
    }
}
```

Contoh response `GET /api/dashboard/summary`:

```json
{
  "total_income": 8650000,
  "total_expense": 2585000,
  "total_allocation": 900000,
  "balance": 5165000,
  "expense_by_category": { "tetap": 1850000, "berkala": 600000, "dinamis": 135000 },
  "income_by_category": { "earned": 8500000, "portfolio": 150000 },
  "allocation_by_category": { "darurat": 500000, "investasi": 400000 }
}
```

---

## 12. Keamanan & Otorisasi

Bagian ini ditulis ulang sebagai jawaban langsung atas satu pertanyaan penting: **apakah data direstrict dengan benar, atau ada risiko "semua data ke body" yang bisa di-crawl?** Jawaban jujurnya — draf pertama dokumen ini punya celah di poin 12.1 di bawah, dan sudah diperbaiki di kode pada Bagian 7.2/7.4/7.5. Ini daftar lengkapnya:

### 12.1 IDOR (Insecure Direct Object Reference) — celah utama yang perlu diperbaiki

**Masalahnya:** method bawaan `BaseRepository::update($id, ...)`/`delete($id)` mencari data murni lewat `findOrFail($id)` — **tidak peduli `user_id`-nya siapa**. Kalau controller endpoint seperti `PUT /api/expenses/{id}` meneruskan `$id` dari URL langsung ke method itu, maka *siapa pun* yang punya token valid (akun sendiri) bisa mengubah atau menghapus data milik akun lain, cukup dengan mencoba angka ID 1, 2, 3, dst. Ini persis yang kamu khawatirkan: data "tidak direstrict" dan rawan disalahgunakan lewat percobaan berurutan (crawling ID).

**Perbaikannya** (sudah diterapkan di Bagian 7.2 & 7.4):
- Setiap operasi pada satu record (`show`, `update`, `markPaid`, `delete`) **wajib** lewat `findForUser($userId, $id)` — query-nya `WHERE id = ? AND user_id = ?` sekaligus, bukan `WHERE id = ?` lalu dicek belakangan.
- Kalau ID valid tapi bukan kepunyaan user yang login, response-nya **404 "tidak ditemukan"**, bukan 403 "forbidden". Ini penting: 403 justru mengonfirmasi ke penyerang bahwa "ID ini benar-benar ada, cuma bukan punyamu" — informasi yang tidak seharusnya bocor. 404 tidak membocorkan apa pun.
- Sebagai lapis kedua (defense-in-depth), tetap gunakan Laravel Policy untuk aksi yang melibatkan model yang sudah di-resolve:

```php
<?php
// app/Policies/ExpensePolicy.php
namespace App\Policies;

use App\Models\{Expense, User};

class ExpensePolicy
{
    public function view(User $user, Expense $expense): bool   { return $user->id === $expense->user_id; }
    public function update(User $user, Expense $expense): bool { return $user->id === $expense->user_id; }
    public function delete(User $user, Expense $expense): bool { return $user->id === $expense->user_id; }
}
```

`IncomePolicy` dan `AllocationPolicy` mengikuti pola yang sama. Policy ini otomatis dikenali Laravel (auto-discovery berdasarkan nama model), tapi **jangan mengandalkan Policy saja** — kombinasi `findForUser()` di Repository + Policy adalah standar yang benar.

### 12.2 ID yang bisa ditebak (sequential integer) — rawan di-*crawl*

Selama IDOR sudah ditutup lewat 12.1, mencoba ID 1..N tetap akan selalu gagal (404) untuk data orang lain. Tapi ID auto-increment yang berurutan tetap punya risiko lebih halus: penyerang bisa menyimpulkan **berapa total record yang ada di sistem** hanya dari pola ID, dan tetap bisa melakukan percobaan massal (meski hasilnya 404, itu tetap beban ke server / bisa dipakai untuk fingerprinting). Untuk data finansial pribadi seperti ini, rekomendasi tambahan: pakai **ULID** sebagai primary key untuk tabel `expenses`, `incomes`, `allocations` — nilainya tidak berurutan/tidak bisa ditebak, jadi ID di URL tidak bocorkan informasi apa pun.

```php
// contoh migrasi expenses dengan ULID sebagai primary key
Schema::create('expenses', function (Blueprint $table) {
    $table->ulid('id')->primary();
    $table->foreignUlid('user_id')->nullable(false);
    // ...kolom lain tetap sama
});
```

```php
// app/Models/Expense.php
use Illuminate\Database\Eloquent\Concerns\HasUlids;

class Expense extends Model
{
    use HasUlids;
    // ...
}
```

Dengan ini, `PUT /api/expenses/01hz8f9q2k...` — ID di URL tidak bisa ditebak berurutan sama sekali. (Kombinasikan tetap dengan `findForUser()` — ULID mencegah *tebakan*, bukan pengganti pengecekan kepemilikan.)

### 12.3 Response tidak boleh "dump semua kolom" — whitelist, bukan blacklist

Semua endpoint di dokumen ini **wajib** membungkus output lewat API Resource (`ExpenseResource`, `UserResource`, dst — lihat Bagian 8.2 & 11), bukan `return $model;` mentah. Alasannya bukan cuma soal rapi: Resource itu whitelist eksplisit — field yang boleh keluar didaftarkan satu-satu. Kalau nanti ada kolom baru ditambahkan ke tabel (mis. token API pihak ketiga, catatan internal, dsb), kolom itu **otomatis tidak ikut terkirim** kecuali sengaja ditambahkan ke Resource. Ini kebalikan dari pendekatan `$hidden` di model yang sifatnya blacklist (gampang lupa di-update).

### 12.4 Listing tidak boleh "kirim semua baris sekaligus" — wajib paginasi

`GET /api/expenses` di draf pertama memakai `->get()` — mengembalikan seluruh baris yang cocok filter dalam satu response body. Untuk user dengan data bertahun-tahun, ini payload besar dan juga jadi cara murah untuk "menyedot" seluruh data lewat satu request berulang. Perbaikannya (lihat `paginateForUser()` di Bagian 7.2): gunakan `->paginate($perPage)` dengan default mis. 20–50 baris per halaman, dan frontend memuat data secara bertahap (infinite scroll / tombol "muat lebih banyak"), bukan sekali tarik semua.

### 12.5 Mass assignment — `user_id` tidak boleh datang dari body

`user_id` **tidak pernah** boleh muncul di rules Form Request (`StoreExpenseRequest`, dst). Nilainya selalu diambil dari `$request->user()->id` (dari token yang sudah diverifikasi Sanctum) di level Service, lalu di-*overwrite* ke data sebelum `create()`. Kalau `user_id` ikut divalidasi sebagai field yang diterima dari client, seorang user bisa saja mengirim `user_id` milik orang lain di body request dan membuat data "seolah-olah" milik akun tersebut.

### 12.6 CORS

Izinkan origin frontend Next.js saja — jangan pakai `'*'` untuk `allowed_origins` karena API ini menyimpan data finansial pribadi:

```php
// config/cors.php
'paths' => ['api/*'],
'allowed_methods' => ['*'],
'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:3000')],
'allowed_headers' => ['*'],
'supports_credentials' => false, // token Bearer, bukan cookie — jadi tidak butuh credentials/CSRF
```

### 12.7 Rate limiting

- Endpoint umum: default Laravel `throttle:api` (60 request/menit) cukup untuk MVP.
- `/login` & `/register`: limiter jauh lebih ketat untuk mencegah brute force **dan** untuk memperlambat percobaan crawling ID sekalipun IDOR sudah ditutup (contoh: `throttle:5,1` — 5 percobaan per menit per IP).
- Endpoint data (`/api/expenses`, dst): pertimbangkan limiter tambahan per user (bukan cuma per IP) supaya satu akun yang disusupi tidak bisa menyedot data dalam volume tinggi dalam waktu singkat.

### 12.8 Validasi & mass assignment lain

Semua endpoint tulis (`POST`/`PUT`/`PATCH`) wajib lewat Form Request — tidak ada `$request->all()` langsung ke model manapun.

### 12.9 Password & transport

- Hash dengan `bcrypt` (default `Hash::make`), minimal 8 karakter + konfirmasi saat register.
- Di production, paksa HTTPS (`URL::forceScheme('https')` di `AppServiceProvider`, atau lewat konfigurasi web server) — token Bearer yang dikirim lewat HTTP polos bisa disadap.
- Opsional untuk hardening lanjut: batasi *ability* token Sanctum per keperluan (`$user->createToken('cashmoney-app', ['expenses:read', 'expenses:write'])`) kalau nanti ada kebutuhan integrasi pihak ketiga yang hanya butuh akses baca.

**Ringkasnya:** arsitektur Repository + Service + Resource di dokumen ini sudah tepat sebagai *pola*, tapi keamanan sungguhan ada di detail pelaksanaannya — yaitu poin 12.1 (scoping `user_id` di setiap query single-record) dan 12.3–12.5 (whitelist output + tidak percaya `user_id` dari client). Ketiganya sudah tercermin di kode pada Bagian 7 & 8 setelah revisi ini.

---

## 13. Setup Development Lokal (Laragon)

1. **Buat project** di folder Laragon (mis. `C:\laragon\www\cashmoney-backend`):
   ```bash
   composer create-project laravel/laravel cashmoney-backend "13.*"
   cd cashmoney-backend
   ```
2. **Nyalakan Laragon** → klik **Start All** (Apache/Nginx + MySQL otomatis jalan).
3. **Buat database** — buka HeidiSQL bawaan Laragon (atau `laragon > Database > MySQL`), buat database baru misal `cashmoney`.
4. **Konfigurasi `.env`:**
   ```env
   APP_NAME=CashMoneyManagement
   APP_URL=http://cashmoney-backend.test

   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=cashmoney
   DB_USERNAME=root
   DB_PASSWORD=

   FRONTEND_URL=http://localhost:3000
   ```
   > Laragon otomatis membuatkan virtual host `http://<nama-folder>.test` — tidak perlu setting Apache manual.
5. **Install Sanctum & scaffolding API** (Laravel 13 menyederhanakan ini lewat satu perintah):
   ```bash
   composer require laravel/sanctum
   php artisan install:api
   ```
   Perintah ini otomatis mempublish migrasi `personal_access_tokens`, membuat `routes/api.php`, dan menambahkan middleware Sanctum.
6. **Jalankan migrasi:**
   ```bash
   php artisan migrate
   ```
7. **(Opsional) Buat data uji lewat seeder/factory** — `database/seeders/DatabaseSeeder.php` bisa memanggil `UserFactory` + factory untuk `Expense`/`Income`/`Allocation` supaya frontend punya data saat development, tanpa harus insert manual satu-satu.
8. **Jalankan server** — cukup akses `http://cashmoney-backend.test` (via Laragon), atau alternatif:
   ```bash
   php artisan serve --port=8000
   ```
9. **Hubungkan ke frontend Next.js** — set di `.env.local` frontend:
   ```env
   NEXT_PUBLIC_API_URL=http://cashmoney-backend.test/api
   ```

---

## 14. Testing (ringkas)

Gunakan **Pest** (atau PHPUnit) untuk feature test per endpoint, minimal:

- `AuthTest`: register sukses, login gagal (password salah), akses `/api/me` tanpa token ditolak (401).
- `ExpenseTest`: user A mencoba update/hapus/mark-paid ID milik user B → harus **404**, bukan 403 dan bukan sukses (ini test paling penting — memastikan `findForUser()` benar-benar dipanggil di setiap jalur, bukan cuma diketik di dokumentasi); filter `start`/`end` mengembalikan data yang benar; response listing dalam bentuk terpaginasi.
- `ProfileTest`: update profil menyimpan field pekerjaan & data diri dengan benar, validasi menolak `gender` di luar enum.
- `DashboardTest`: `balance` = income − expense − allocation sesuai data seed.

---

## 15. Roadmap Implementasi

| Fase | Cakupan |
|---|---|
| **Fase 1** | Setup project, migrasi tabel, model, Sanctum auth (register/login/logout/me) |
| **Fase 2** | Repository + Service + Controller untuk Expense/Income/Allocation (CRUD penuh) |
| **Fase 3** | Endpoint Profil (lihat/edit data diri, pekerjaan, upload avatar) |
| **Fase 4** | Endpoint Dashboard (summary, unpaid-bills, monthly trend) + Policy otorisasi |
| **Fase 5** | Testing (Pest), rate limiting, dokumentasi API (Postman collection / OpenAPI) |
| **Fase 6** *(opsional)* | Export laporan PDF di sisi server (`barryvdh/laravel-dompdf` atau tetap generate di frontend seperti versi HTML prototipe) |

---

## 16. Lampiran — Environment Variables

```env
APP_NAME=CashMoneyManagement
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://cashmoney-backend.test

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=cashmoney
DB_USERNAME=root
DB_PASSWORD=

FRONTEND_URL=http://localhost:3000
FILESYSTEM_DISK=public
```

---

*Dokumen ini adalah spesifikasi teknis awal (PRD). Detail kecil seperti nama field atau aturan validasi bisa disesuaikan lagi begitu implementasi dimulai.*