<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    protected $fillable = [
        'user_id',
        'category',
        'subcategory',
        'frequency',
        'amount',
        'date',
        'status',
        'is_estimate',
        'note',
        'attachment_path',
    ];

    protected $casts = [
        'date' => 'date',
        'is_estimate' => 'boolean',
        'amount' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
