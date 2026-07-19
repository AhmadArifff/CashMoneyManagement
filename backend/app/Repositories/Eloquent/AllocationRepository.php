<?php

namespace App\Repositories\Eloquent;

use App\Models\Allocation;
use App\Repositories\Contracts\AllocationRepositoryInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class AllocationRepository extends BaseRepository implements AllocationRepositoryInterface
{
    public function __construct(Allocation $model)
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

        return $query->orderByDesc('date')->paginate($perPage);
    }

    public function findForUser(int $userId, int $id)
    {
        $record = $this->model->newQuery()
            ->where('id', $id)
            ->where('user_id', $userId)
            ->first();

        if (! $record) {
            throw new NotFoundHttpException('Data tidak ditemukan.');
        }

        return $record;
    }
}
