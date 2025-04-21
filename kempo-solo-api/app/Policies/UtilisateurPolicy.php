<?php

namespace App\Policies;

use App\Models\Utilisateur;

class UtilisateurPolicy
{
    public function manage(Utilisateur $userCourant, Utilisateur $utilisateur): bool
    {
        // L'admin peut tout faire
        if ($userCourant->role == 'admin') {
            return true;
        }

        // Un utilisateur peut gérer son propre compte
        return $userCourant->id == $utilisateur->id;
    }
}