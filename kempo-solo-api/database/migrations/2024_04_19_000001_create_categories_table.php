<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categorie', function (Blueprint $table) {
            $table->id();
            $table->char('sexe', 1);
            $table->decimal('poidsMin', 5, 2);
            $table->decimal('poidsMax', 5, 2);
            $table->integer('ageMin');
            $table->integer('ageMax');
            $table->string('nom');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('categorie');
    }
};