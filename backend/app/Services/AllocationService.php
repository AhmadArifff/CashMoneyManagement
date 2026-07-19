<?php

namespace App\Services;

use App\Repositories\Contracts\AllocationRepositoryInterface;

class AllocationService
{
    public function __construct(protected AllocationRepositoryInterface $allocations)
    {
    }

    public function list(int $userId, string $start, string $end, array $filters = [])
    {
        return $this->allocations->paginateForUser($userId, $start, $end, $filters, 20);
    }

    public function store(int $userId, array $data)
    {
        $data['user_id'] = $userId;

        return $this->allocations->create($data);
    }

    public function update(int $userId, int $id, array $data)
    {
        $allocation = $this->allocations->findForUser($userId, $id);

        unset($data['user_id']);

        return $this->allocations->update($allocation->id, $data);
    }

    public function delete(int $userId, int $id): bool
    {
        $allocation = $this->allocations->findForUser($userId, $id);

        return $this->allocations->delete($allocation->id);
    }
}
