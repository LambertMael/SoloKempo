<?php

namespace App\Policies;

use App\Models\Utilisateur;
use App\Models\Club;

class ClubPolicy
{
    public function manage(Utilisateur $user, Club $club): bool
    {
        // L'admin peut tout faire
        if ($user->role === 'admin') {
            return true;
        }

        // Un gestionnaire ne peut gérer que les clubs auxquels il est assigné
        if ($user->role === 'gestionnaire') {
            return $user->clubs->contains($club->id);
        }

        return false;
    }
}