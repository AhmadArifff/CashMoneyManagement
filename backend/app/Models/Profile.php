<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Profile extends Model
{
    protected $fillable = [
        'user_id',
        'phone_number',
        'date_of_birth',
        'gender',
        'address',
        'city',
        'province',
        'postal_code',
        'avatar_path',
        'job_title',
        'company_name',
        'employment_type',
        'monthly_income_estimate',
        'currency',
        'timezone',
        'notification_preferences',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'notification_preferences' => 'array',
        'monthly_income_estimate' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
