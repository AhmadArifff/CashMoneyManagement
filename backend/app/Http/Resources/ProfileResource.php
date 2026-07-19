<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ProfileResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'phone_number' => $this->phone_number,
            'date_of_birth' => $this->date_of_birth?->toDateString(),
            'gender' => $this->gender,
            'address' => $this->address,
            'city' => $this->city,
            'province' => $this->province,
            'postal_code' => $this->postal_code,
            'avatar_path' => $this->avatar_path,
            'job_title' => $this->job_title,
            'company_name' => $this->company_name,
            'employment_type' => $this->employment_type,
            'monthly_income_estimate' => (float) $this->monthly_income_estimate,
            'currency' => $this->currency,
            'timezone' => $this->timezone,
            'notification_preferences' => $this->notification_preferences,
        ];
    }
}
