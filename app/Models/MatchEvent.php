<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MatchEvent extends Model
{
    protected $fillable = [
        'match_id',
        'event_type',
        'start_time',
        'duration',
        'team',
        'metadata'
    ];

    protected $casts = [
        'metadata' => 'array'
    ];
}