<?php

namespace App\Repositories\Contracts;

interface AllocationRepositoryInterface extends BaseRepositoryInterface
{
    public function forUserInRange(int $userId, string $start, string $end, array $filters = []);

    public function paginateForUser(int $userId, string $start, string $end, array $filters = [], int $perPage = 20);

    public function findForUser(int $userId, int $id);
}
