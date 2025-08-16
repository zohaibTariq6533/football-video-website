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
            // Add video_id foreign key if it doesn't exist
            if (!Schema::hasColumn('teams', 'video_id')) {
                $table->foreignId('video_id')->constrained('videos')->onDelete('cascade');
            }
            
            // Add team_type enum if it doesn't exist
            if (!Schema::hasColumn('teams', 'team_type')) {
                $table->enum('team_type', ['team1', 'team2']);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('teams', function (Blueprint $table) {
            if (Schema::hasColumn('teams', 'video_id')) {
                $table->dropForeign(['video_id']);
                $table->dropColumn('video_id');
            }
            
            if (Schema::hasColumn('teams', 'team_type')) {
                $table->dropColumn('team_type');
            }
        });
    }
};