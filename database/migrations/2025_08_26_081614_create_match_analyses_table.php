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
        Schema::create('match_analyses', function (Blueprint $table) {
            $table->id();
            // $table->unsignedBigInteger('match_id');
            $table->string('event_type');
            $table->string('start_time');
            $table->string('team');
            $table->string('action')->nullable();
            $table->timestamps();

            // $table->foreign('match_id')->references('id')->on('matches')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('match_analyses');
    }
};
