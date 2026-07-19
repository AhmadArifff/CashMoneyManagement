<?php

namespace App\Services;

use App\Repositories\Contracts\ExpenseRepositoryInterface;

class ExpenseService
{
    public function __construct(protected ExpenseRepositoryInterface $expenses)
    {
    }

    public function list(int $userId, string $start, string $end, array $filters = [])
    {
        return $this->expenses->paginateForUser($userId, $start, $end, $filters, 20);
    }

    public function store(int $userId, array $data)
    {
        $data['user_id'] = $userId;
        $data['status'] = $data['category'] === 'dinamis' ? 'paid' : ($data['status'] ?? 'unpaid');

        return $this->expenses->create($data);
    }

    public function update(int $userId, int $id, array $data)
    {
        $expense = $this->expenses->findForUser($userId, $id);

        unset($data['user_id']);

        return $this->expenses->update($expense->id, $data);
    }

    public function markPaid(int $userId, int $id)
    {
        $expense = $this->expenses->findForUser($userId, $id);

        return $this->expenses->update($expense->id, ['status' => 'paid']);
    }

    public function delete(int $userId, int $id): bool
    {
        $expense = $this->expenses->findForUser($userId, $id);

        return $this->expenses->delete($expense->id);
    }

    public function unpaidBills(int $userId)
    {
        return $this->expenses->unpaidBills($userId);
    }
}
