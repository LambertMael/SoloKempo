<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tournoi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_categorie')->constrained('categorie')->onDelete('restrict');
            $table->string('systemeElimination', 10);
            $table->string('lieu');
            $table->date('date');
            $table->string('nom');
            $table->timestamps();
        });

        Schema::create('competiteur_tournoi', function (Blueprint $table) {
            $table->foreignId('id_competiteur')->constrained('competiteur')->onDelete('cascade');
            $table->foreignId('id_tournoi')->constrained('tournoi')->onDelete('cascade');
            $table->primary(['id_competiteur', 'id_tournoi']);
        });

        Schema::create('poules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_tournoi')->constrained('tournoi')->onDelete('cascade');
            $table->timestamps();
        });

        Schema::create('poule_competiteur', function (Blueprint $table) {
            $table->foreignId('id_poule')->constrained('poules')->onDelete('cascade');
            $table->foreignId('id_competiteur')->constrained('competiteur')->onDelete('cascade');
            $table->primary(['id_poule', 'id_competiteur']);
        });

        Schema::create('combat', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_p1')->constrained('competiteur')->onDelete('restrict');
            $table->foreignId('id_p2')->constrained('competiteur')->onDelete('restrict');
            $table->integer('penalite_p1')->default(0);
            $table->integer('penalite_p2')->default(0);
            $table->integer('score_p1')->default(0);
            $table->integer('score_p2')->default(0);
            $table->integer('duree')->nullable();
            $table->foreignId('id_poule')->constrained('poules')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('combat');
        Schema::dropIfExists('poule_competiteur');
        Schema::dropIfExists('poules');
        Schema::dropIfExists('competiteur_tournoi');
        Schema::dropIfExists('tournoi');
    }
};