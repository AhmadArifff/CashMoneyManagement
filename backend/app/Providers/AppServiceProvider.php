<?php

namespace App\Providers;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        JsonResource::withoutWrapping();

        Gate::policy(\App\Models\Expense::class, \App\Policies\ExpensePolicy::class);
        Gate::policy(\App\Models\Income::class, \App\Policies\IncomePolicy::class);
        Gate::policy(\App\Models\Allocation::class, \App\Policies\AllocationPolicy::class);
    }
}
