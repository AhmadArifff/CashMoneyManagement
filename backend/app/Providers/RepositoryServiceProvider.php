<?php

namespace App\Providers;

use App\Repositories\Contracts\AllocationRepositoryInterface;
use App\Repositories\Contracts\ExpenseRepositoryInterface;
use App\Repositories\Contracts\IncomeRepositoryInterface;
use App\Repositories\Contracts\ProfileRepositoryInterface;
use App\Repositories\Eloquent\AllocationRepository;
use App\Repositories\Eloquent\ExpenseRepository;
use App\Repositories\Eloquent\IncomeRepository;
use App\Repositories\Eloquent\ProfileRepository;
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
