<?php

namespace App\Services;

use App\Repositories\Contracts\AllocationRepositoryInterface;
use App\Repositories\Contracts\ExpenseRepositoryInterface;
use App\Repositories\Contracts\IncomeRepositoryInterface;

class DashboardService
{
    public function __construct(
        protected ExpenseRepositoryInterface $expenses,
        protected IncomeRepositoryInterface $incomes,
        protected AllocationRepositoryInterface $allocations,
    ) {
    }

    public function summary(int $userId, string $start, string $end): array
    {
        $expenses = $this->expenses->forUserInRange($userId, $start, $end, ['include_estimate' => false]);
        $incomes = $this->incomes->forUserInRange($userId, $start, $end);
        $allocations = $this->allocations->forUserInRange($userId, $start, $end);

        $totalExpense = $expenses->sum('amount');
        $totalIncome = $incomes->sum('amount');
        $totalAllocation = $allocations->sum('amount');

        return [
            'total_income' => (float) $totalIncome,
            'total_expense' => (float) $totalExpense,
            'total_allocation' => (float) $totalAllocation,
            'balance' => (float) ($totalIncome - $totalExpense - $totalAllocation),
            'expense_by_category' => $expenses->groupBy('category')->map->sum('amount')->toArray(),
            'income_by_category' => $incomes->groupBy('category')->map->sum('amount')->toArray(),
            'allocation_by_category' => $allocations->groupBy('category')->map->sum('amount')->toArray(),
        ];
    }

    public function unpaidBills(int $userId)
    {
        return $this->expenses->unpaidBills($userId);
    }
}
