<?php

namespace App\Repositories\Eloquent;

use App\Models\Expense;
use App\Repositories\Contracts\ExpenseRepositoryInterface;
use Illuminate\Support\Facades\DB;

class ExpenseRepository extends BaseRepository implements ExpenseRepositoryInterface
{
    public function __construct(Expense $model)
    {
        parent::__construct($model);
    }

    public function forUserInRange(int $userId, string $start, string $end, array $filters = [])
    {
        $query = $this->model->newQuery()
            ->where('user_id', $userId)
            ->whereBetween('date', [$start, $end]);

        if (! empty($filters['category'])) {
            $query->where('category', $filters['category']);
        }

        if (array_key_exists('include_estimate', $filters) && ! $filters['include_estimate']) {
            $query->where('is_estimate', false);
        }

        return $query->orderByDesc('date')->get();
    }

    public function paginateForUser(int $userId, string $start, string $end, array $filters = [], int $perPage = 20)
    {
        $query = $this->model->newQuery()
            ->where('user_id', $userId)
            ->whereBetween('date', [$start, $end]);

        if (! empty($filters['category'])) {
            $query->where('category', $filters['category']);
        }

        if (array_key_exists('include_estimate', $filters) && ! $filters['include_estimate']) {
            $query->where('is_estimate', false);
        }

        return $query->orderByDesc('date')->paginate($perPage);
    }

    public function findForUser(int $userId, int $id)
    {
        $record = $this->model->newQuery()
            ->where('id', $id)
            ->where('user_id', $userId)
            ->first();

        if (! $record) {
            throw new \Symfony\Component\HttpKernel\Exception\NotFoundHttpException('Data tidak ditemukan.');
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
}
