<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class AllocationResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'category' => $this->category,
            'subcategory' => $this->subcategory,
            'amount' => (float) $this->amount,
            'date' => $this->date->toDateString(),
            'note' => $this->note,
            'created_at' => $this->created_at,
        ];
    }
}
