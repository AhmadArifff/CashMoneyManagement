<?php

namespace App\Repositories\Eloquent;

use App\Repositories\Contracts\BaseRepositoryInterface;
use Illuminate\Database\Eloquent\Model;

abstract class BaseRepository implements BaseRepositoryInterface
{
    public function __construct(protected Model $model)
    {
    }

    public function all(array $filters = [])
    {
        return $this->applyFilters($this->model->newQuery(), $filters)->get();
    }

    public function find(int $id)
    {
        return $this->model->findOrFail($id);
    }

    public function create(array $data)
    {
        return $this->model->create($data);
    }

    public function update(int $id, array $data)
    {
        $record = $this->find($id);
        $record->update($data);

        return $record->fresh();
    }

    public function delete(int $id): bool
    {
        return (bool) $this->find($id)->delete();
    }

    protected function applyFilters($query, array $filters)
    {
        return $query;
    }
}
