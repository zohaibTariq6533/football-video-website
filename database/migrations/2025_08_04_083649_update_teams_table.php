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
        Schema::table('teams', function (Blueprint $table) {
            // $table->foreignId('video_id')->constrained('videos')->onDelete('cascade');
            // $table->dropForeign(['user_id']);
            // $table->enum('team_type', ['A', 'B']);

        // Then drop the column
            $table->dropColumn('team_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('teams', function (Blueprint $table) {
            //
        });
    }
};
