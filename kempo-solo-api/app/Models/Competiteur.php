<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Competiteur extends Model
{
    use HasFactory;

    protected $table = 'competiteur';

    protected $fillable = [
        'id_utilisateur',
        'id_club',
        'id_pays',
        'id_grade',
        'nom',
        'prenom',
        'date_naissance',
        'sexe',
        'poids'
    ];

    protected $casts = [
        'date_naissance' => 'date',
        'poids' => 'decimal:2'
    ];

    public function utilisateur(): BelongsTo
    {
        return $this->belongsTo(Utilisateur::class, 'id_utilisateur');
    }

    public function club(): BelongsTo
    {
        return $this->belongsTo(Club::class, 'id_club');
    }

    public function pays(): BelongsTo
    {
        return $this->belongsTo(Pays::class, 'id_pays');
    }

    public function grade(): BelongsTo
    {
        return $this->belongsTo(Grade::class, 'id_grade');
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Categorie::class, 'competiteur_categorie', 'id_competiteur', 'id_categorie');
    }

    public function tournois(): BelongsToMany
    {
        return $this->belongsToMany(Tournoi::class, 'competiteur_tournoi', 'id_competiteur', 'id_tournoi');
    }

    public function poules(): BelongsToMany
    {
        return $this->belongsToMany(Poule::class, 'poule_competiteur', 'id_competiteur', 'id_poule');
    }
}