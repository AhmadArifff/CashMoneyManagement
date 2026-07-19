<?php

namespace App\Repositories\Contracts;

interface ProfileRepositoryInterface extends BaseRepositoryInterface
{
    public function findByUserId(int $userId);

    public function updateByUserId(int $userId, array $data);
}
