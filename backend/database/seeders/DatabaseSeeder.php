<?php

namespace Database\Seeders;

use App\Models\Allocation;
use App\Models\Expense;
use App\Models\Income;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => Hash::make('password'),
        ]);

        $user->profile()->create([
            'phone_number' => '081234567890',
            'date_of_birth' => '1995-08-17',
            'gender' => 'pria',
            'address' => 'Jalan Mawar No. 12',
            'city' => 'Jakarta',
            'province' => 'DKI Jakarta',
            'postal_code' => '12345',
            'job_title' => 'Software Engineer',
            'company_name' => 'Example Tech',
            'employment_type' => 'karyawan',
            'monthly_income_estimate' => 15000000,
            'currency' => 'IDR',
            'timezone' => 'Asia/Jakarta',
            'notification_preferences' => ['unpaid_bill_alert' => true],
        ]);

        Expense::create([
            'user_id' => $user->id,
            'category' => 'tetap',
            'subcategory' => 'Sewa Rumah',
            'frequency' => 'bulanan',
            'amount' => 3500000,
            'date' => now()->startOfMonth()->toDateString(),
            'status' => 'unpaid',
            'is_estimate' => false,
            'note' => 'Pembayaran sewa bulan ini',
        ]);

        Expense::create([
            'user_id' => $user->id,
            'category' => 'dinamis',
            'subcategory' => 'Makan & Minum',
            'frequency' => 'harian',
            'amount' => 120000,
            'date' => now()->toDateString(),
            'status' => 'paid',
            'is_estimate' => false,
            'note' => 'Pengeluaran harian makan',
        ]);

        Income::create([
            'user_id' => $user->id,
            'category' => 'earned',
            'subcategory' => 'Gaji Bulanan',
            'amount' => 12000000,
            'date' => now()->startOfMonth()->toDateString(),
            'note' => 'Gaji pokok bulan ini',
        ]);

        Income::create([
            'user_id' => $user->id,
            'category' => 'portfolio',
            'subcategory' => 'Dividen Saham',
            'amount' => 500000,
            'date' => now()->subDays(10)->toDateString(),
            'note' => 'Dividen portofolio investasi',
        ]);

        Allocation::create([
            'user_id' => $user->id,
            'category' => 'darurat',
            'subcategory' => 'Dana Darurat',
            'amount' => 1000000,
            'date' => now()->toDateString(),
            'note' => 'Cadangan untuk kebutuhan mendadak',
        ]);
    }
}
