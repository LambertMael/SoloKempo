<?php

namespace App\Http\Controllers;

use App\Models\Competiteur;
use App\Models\Utilisateur;
use App\Models\Combat;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class CompetiteurController extends Controller
{
    public function index(): JsonResponse
    {
        $competiteurs = Competiteur::with(['utilisateur', 'club', 'pays', 'grade', 'categories'])->get();
        return response()->json($competiteurs);
    }

    public function show(int $id): JsonResponse
    {
        $competiteur = Competiteur::with(['utilisateur', 'club', 'pays', 'grade', 'categories', 'tournois', 'poules'])
            ->findOrFail($id);
        return response()->json($competiteur);
    }

    public function detachFromClub(int $id): JsonResponse
    {
        $competiteur = Competiteur::findOrFail($id);
        $competiteur->id_club = null;
        $competiteur->save();
        return response()->json($competiteur);
    }   

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id_utilisateur' => 'required|exists:utilisateur,id|unique:competiteur,id_utilisateur',
            'id_club' => 'nullable|exists:club,id',
            'id_pays' => 'nullable|exists:pays,id',
            'id_grade' => 'nullable|exists:grade,id',
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'date_naissance' => 'nullable|date',
            'sexe' => 'required|string|size:1',
            'poids' => 'nullable|numeric|min:0'
        ]);

        $competiteur = Competiteur::create($validated);
        
        // Mettre à jour le rôle de l'utilisateur si nécessaire
        $utilisateur = Utilisateur::find($validated['id_utilisateur']);
        if ($utilisateur && $utilisateur->role !== 'competiteur') {
            $utilisateur->role = 'competiteur';
            $utilisateur->save();
        }

        return response()->json($competiteur, 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $competiteur = Competiteur::findOrFail($id);
        
        $validated = $request->validate([
            'id_club' => 'sometimes|nullable|exists:club,id',
            'id_pays' => 'sometimes|nullable|exists:pays,id',
            'id_grade' => 'sometimes|nullable|exists:grade,id',
            'nom' => 'sometimes|string|max:255',
            'prenom' => 'sometimes|string|max:255',
            'date_naissance' => 'sometimes|nullable|date',
            'sexe' => 'sometimes|string|size:1',
            'poids' => 'sometimes|nullable|numeric|min:0'
        ]);

        $competiteur->update($validated);
        return response()->json($competiteur);
    }

    public function destroy(int $id): JsonResponse
    {
        $competiteur = Competiteur::findOrFail($id);
        
        // Supprimer l'utilisateur associé si c'est un compte compétiteur
        $utilisateur = $competiteur->utilisateur;
        if ($utilisateur && $utilisateur->role === 'competiteur') {
            $utilisateur->delete();
        }
        
        $competiteur->delete();
        return response()->json(null, 204);
    }

    public function resultats(int $id): JsonResponse
    {
        $competiteur = Competiteur::where('id_utilisateur', $id)->firstOrFail();
        $competiteur->load('categories');
        $id = $competiteur->id;
        
        // Récupérer tous les combats où le compétiteur est participant
        $combats = Combat::where('id_p1', $id)
            ->orWhere('id_p2', $id)
            ->with(['competiteur1', 'competiteur2', 'poule.tournoi'])
            ->get()
            ->map(function ($combat) use ($id, $competiteur) {
                $estP1 = $combat->id_p1 == $id;
                return [
                    'id' => $combat->id,
                    'tournoi' => $combat->poule->tournoi->nom,
                    'date_debut' => $combat->poule->tournoi->date_debut,
                    'competiteur' => [
                        'poids' => $competiteur->poids,
                        'categorie' => $competiteur->categories->first() ? $competiteur->categories->first()->nom : 'Non définie'
                    ],
                    'score_competiteur' => $estP1 ? $combat->score_p1 : $combat->score_p2,
                    'score_adversaire' => $estP1 ? $combat->score_p2 : $combat->score_p1,
                    'penalites_competiteur' => $estP1 ? $combat->penalite_p1 : $combat->penalite_p2,
                    'penalites_adversaire' => $estP1 ? $combat->penalite_p2 : $combat->penalite_p1,
                    'duree' => $combat->duree,
                    'victoire' => $this->determinerVictoire($combat, $id),
                    'status_tournoi' => $combat->poule->tournoi->status,
                ];
            });

        // Statistiques globales
        $stats = [
            'total_combats' => $combats->count(),
            'victoires' => $combats->where('victoire', true)->count(),
            'defaites' => $combats->where('victoire', false)->count(),
            'egalites' => $combats->whereNull('victoire')->count(),
        ];

        return response()->json([
            'competiteur' => $competiteur,
            'resultats' => $combats,
            'statistiques' => $stats
        ]);
    }

    private function determinerVictoire(Combat $combat, int $competiteurId): ?bool
    {
        if ($combat->score_p1 === null || $combat->score_p2 === null) {
            return null;
        }

        $scoreNetP1 = $combat->score_p1 - $combat->penalite_p1;
        $scoreNetP2 = $combat->score_p2 - $combat->penalite_p2;

        if ($scoreNetP1 === $scoreNetP2) {
            return null; // égalité
        }

        // Si le compétiteur est P1
        if ($combat->id_p1 === $competiteurId) {
            return $scoreNetP1 > $scoreNetP2;
        }

        // Si le compétiteur est P2
        return $scoreNetP2 > $scoreNetP1;
    }
}