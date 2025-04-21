<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Club extends Model
{
    use HasFactory;

    protected $table = 'club';

    protected $fillable = [
        'nom'
    ];

    public function competiteurs(): HasMany
    {
        return $this->hasMany(Competiteur::class, 'id_club');
    }

    public function gestionnaires(): BelongsToMany
    {
        return $this->belongsToMany(Utilisateur::class, 'gestionnaire_club', 'id_club', 'id_utilisateur')
                    ->where('role', 'gestionnaire');
    }
}