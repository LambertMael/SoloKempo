<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('competiteur', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_utilisateur')->unique()->constrained('utilisateur')->onDelete('cascade');
            $table->foreignId('id_club')->nullable()->constrained('club')->onDelete('set null');
            $table->foreignId('id_pays')->nullable()->constrained('pays')->onDelete('set null');
            $table->foreignId('id_grade')->nullable()->constrained('grade')->onDelete('set null');
            $table->string('prenom');
            $table->string('nom');
            $table->date('date_naissance')->nullable();
            $table->char('sexe', 1);
            $table->decimal('poids', 5, 2)->nullable();
            $table->timestamps();
        });

        Schema::create('competiteur_categorie', function (Blueprint $table) {
            $table->foreignId('id_competiteur')->constrained('competiteur')->onDelete('cascade');
            $table->foreignId('id_categorie')->constrained('categorie')->onDelete('cascade');
            $table->primary(['id_competiteur', 'id_categorie']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('competiteur_categorie');
        Schema::dropIfExists('competiteur');
    }
};