<?php

namespace App\Policies;

use App\Models\Allocation;
use App\Models\User;

class AllocationPolicy
{
    public function update(User $user, Allocation $allocation): bool
    {
        return $user->id === $allocation->user_id;
    }

    public function delete(User $user, Allocation $allocation): bool
    {
        return $user->id === $allocation->user_id;
    }
}
