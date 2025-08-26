<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class MatchAnalysis extends Model
{
    use HasFactory;

    protected $fillable = [
        'match_id',
        'event_type',
        'start_time',
        'team',
        'action',
    ];
}
