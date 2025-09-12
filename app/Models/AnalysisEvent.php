<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AnalysisEvent extends Model
{
    protected $guarded = [];

    public function video()
    {
        return $this->belongsTo(Video::class);
    }

    public function team()
    {
        return $this->belongsTo(Team::class);
    }

    public function player()
    {
        return $this->belongsTo(Player::class);
    }

    public function assistPlayer()
    {
        return $this->belongsTo(Player::class, 'assist_player_id');
    }
}
