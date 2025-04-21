<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Categorie extends Model
{
    use HasFactory;

    protected $table = 'categorie';

    protected $fillable = [
        'sexe',
        'poidsMin',
        'poidsMax',
        'ageMin',
        'ageMax',
        'nom'
    ];

    protected $casts = [
        'poidsMin' => 'decimal:2',
        'poidsMax' => 'decimal:2',
        'ageMin' => 'integer',
        'ageMax' => 'integer'
    ];

    public function competiteurs(): BelongsToMany
    {
        return $this->belongsToMany(Competiteur::class, 'competiteur_categorie', 'id_categorie', 'id_competiteur');
    }

    public function tournois(): HasMany
    {
        return $this->hasMany(Tournoi::class, 'id_categorie');
    }
}