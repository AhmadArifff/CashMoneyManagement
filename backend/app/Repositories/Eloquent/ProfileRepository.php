<?php

namespace App\Repositories\Eloquent;

use App\Models\Profile;
use App\Repositories\Contracts\ProfileRepositoryInterface;

class ProfileRepository extends BaseRepository implements ProfileRepositoryInterface
{
    public function __construct(Profile $model)
    {
        parent::__construct($model);
    }

    public function findByUserId(int $userId)
    {
        return $this->model->where('user_id', $userId)->firstOrFail();
    }

    public function updateByUserId(int $userId, array $data)
    {
        $profile = $this->model->where('user_id', $userId)->first();

        if (! $profile) {
            $data['user_id'] = $userId;
            return $this->model->create($data);
        }

        $profile->update($data);

        return $profile->fresh();
    }
}
