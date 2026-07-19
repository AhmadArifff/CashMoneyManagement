<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\Contracts\ProfileRepositoryInterface;

class ProfileService
{
    public function __construct(protected ProfileRepositoryInterface $profiles)
    {
    }

    public function getForUser(int $userId)
    {
        return $this->profiles->findByUserId($userId);
    }

    public function update(int $userId, array $data)
    {
        if (array_key_exists('name', $data)) {
            User::findOrFail($userId)->update(['name' => $data['name']]);
            unset($data['name']);
        }

        return $this->profiles->updateByUserId($userId, $data);
    }
}
