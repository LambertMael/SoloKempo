<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gestionnaire_club', function (Blueprint $table) {
            $table->foreignId('id_utilisateur')->constrained('utilisateur')->onDelete('cascade');
            $table->foreignId('id_club')->constrained('club')->onDelete('cascade');
            $table->primary(['id_utilisateur', 'id_club']);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gestionnaire_club');
    }
};