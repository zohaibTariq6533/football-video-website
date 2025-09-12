<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('analysis_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('video_id')->constrained()->onDelete('cascade');
            $table->string('event_type');
            $table->integer('time');
            $table->integer('end_time')->nullable();
            $table->foreignId('team_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('player_id')->nullable()->constrained()->onDelete('set null');
            $table->string('action')->nullable();
            $table->foreignId('assist_player_id')->nullable()->constrained('players')->onDelete('set null');
            $table->string('color')->nullable();
            $table->boolean('is_time_based')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('analysis_events');
    }
};
