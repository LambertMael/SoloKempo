<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tournoi extends Model
{
    use HasFactory;

    protected $table = 'tournoi';

    protected $fillable = [
        'id_categorie',
        'systemeElimination',
        'lieu',
        'date_debut',
        'date_fin',
        'nom'
    ];

    protected $casts = [
        'date' => 'date'
    ];

    public function categorie(): BelongsTo
    {
        return $this->belongsTo(Categorie::class, 'id_categorie');
    }

    public function competiteurs(): BelongsToMany
    {
        return $this->belongsToMany(Competiteur::class, 'competiteur_tournoi', 'id_tournoi', 'id_competiteur');
    }

    public function poules(): HasMany
    {
        return $this->hasMany(Poule::class, 'id_tournoi');
    }
}