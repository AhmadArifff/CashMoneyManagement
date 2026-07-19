<?php

namespace App\Services;

use App\Repositories\Contracts\IncomeRepositoryInterface;

class IncomeService
{
    public function __construct(protected IncomeRepositoryInterface $incomes)
    {
    }

    public function list(int $userId, string $start, string $end, array $filters = [])
    {
        return $this->incomes->paginateForUser($userId, $start, $end, $filters, 20);
    }

    public function store(int $userId, array $data)
    {
        $data['user_id'] = $userId;

        return $this->incomes->create($data);
    }

    public function update(int $userId, int $id, array $data)
    {
        $income = $this->incomes->findForUser($userId, $id);

        unset($data['user_id']);

        return $this->incomes->update($income->id, $data);
    }

    public function delete(int $userId, int $id): bool
    {
        $income = $this->incomes->findForUser($userId, $id);

        return $this->incomes->delete($income->id);
    }
}
