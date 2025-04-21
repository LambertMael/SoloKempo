<?php

namespace App\Http\Controllers;

use App\Models\Club;
use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class GestionnaireClubController extends Controller
{
    public function assignClub(int $gestionnaireId, int $clubId): JsonResponse
    {
        $gestionnaire = Utilisateur::findOrFail($gestionnaireId);
        
        if ($gestionnaire->role !== 'gestionnaire') {
            throw ValidationException::withMessages([
                'role' => ['L\'utilisateur doit être un gestionnaire pour être assigné à un club.']
            ]);
        }

        $club = Club::findOrFail($clubId);
        $gestionnaire->clubs()->syncWithoutDetaching([$clubId]);

        return response()->json(['message' => 'Gestionnaire assigné au club avec succès']);
    }

    public function removeFromClub(int $gestionnaireId, int $clubId): JsonResponse
    {
        $gestionnaire = Utilisateur::findOrFail($gestionnaireId);
        $club = Club::findOrFail($clubId);
        
        $gestionnaire->clubs()->detach($clubId);

        return response()->json(['message' => 'Gestionnaire retiré du club avec succès']);
    }

    public function listClubGestionnaires(int $clubId): JsonResponse
    {
        $club = Club::with('gestionnaires')->findOrFail($clubId);
        return response()->json($club->gestionnaires);
    }

    public function listGestionnaireClubs(int $gestionnaireId): JsonResponse
    {
        $gestionnaire = Utilisateur::findOrFail($gestionnaireId);
        
        if ($gestionnaire->role !== 'gestionnaire') {
            throw ValidationException::withMessages([
                'role' => ['L\'utilisateur n\'est pas un gestionnaire.']
            ]);
        }

        return response()->json($gestionnaire->clubs);
    }
}