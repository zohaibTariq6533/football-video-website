<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Video extends Model
{
    protected $guarded = [];

    public function events()
    {
        return $this->hasMany(AnalysisEvent::class);
    }
}