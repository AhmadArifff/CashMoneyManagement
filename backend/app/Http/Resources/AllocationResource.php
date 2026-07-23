<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

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
            'attachment_path' => $this->attachment_path,
            'attachment_url' => $this->when($this->attachment_path, function () {
                return Storage::disk('supabase')->url($this->attachment_path);
            }),
            'created_at' => $this->created_at,
        ];
    }
}
