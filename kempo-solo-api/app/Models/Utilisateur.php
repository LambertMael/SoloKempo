<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Utilisateur extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $table = 'utilisateur';

    protected $fillable = [
        'email',
        'mdp',
        'nom',
        'prenom',
        'role',
        'is_active'
    ];

    protected $hidden = [
        'mdp',
        'remember_token',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function competiteur(): HasOne
    {
        return $this->hasOne(Competiteur::class, 'id_utilisateur');
    }

    public function clubs(): BelongsToMany
    {
        return $this->belongsToMany(Club::class, 'gestionnaire_club', 'id_utilisateur', 'id_club')
                    ->wherePivot('id_utilisateur', $this->id)
                    ->whereHas('users', function($query) {
                        $query->where('role', 'gestionnaire');
                    });
    }

    public function getAuthPassword()
    {
        return $this->mdp;
    }
}
