<?php

use App\Http\Controllers\Api\AllocationController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ExpenseController;
use App\Http\Controllers\Api\IncomeController;
use App\Http\Controllers\Api\ProfileController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

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
