<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Poule extends Model
{
    use HasFactory;

    protected $table = 'poules';

    protected $fillable = [
        'id_tournoi'
    ];

    public function tournoi(): BelongsTo
    {
        return $this->belongsTo(Tournoi::class, 'id_tournoi');
    }

    public function competiteurs(): BelongsToMany
    {
        return $this->belongsToMany(Competiteur::class, 'poule_competiteur', 'id_poule', 'id_competiteur');
    }

    public function combats(): HasMany
    {
        return $this->hasMany(Combat::class, 'id_poule');
    }
}