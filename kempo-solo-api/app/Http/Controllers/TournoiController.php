<?php

namespace App\Http\Controllers;

use App\Models\Tournoi;
use App\Models\Competiteur;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class TournoiController extends Controller
{
    public function index(): JsonResponse
    {
        $tournois = Tournoi::with(['categorie', 'competiteurs'])->get();
        return response()->json($tournois);
    }

    public function show(int $id): JsonResponse
    {
        $tournoi = Tournoi::with(['categorie', 'competiteurs', 'poules'])->findOrFail($id);
        return response()->json($tournoi);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'date_fin' => 'required|date',
            'date_debut' => 'required|date',
            'lieu' => 'required|string',
            'systemeElimination' => 'required|string|max:10',
            'id_categorie' => 'required|exists:categorie,id'
        ]);

        $tournoi = Tournoi::create($validated);
        return response()->json($tournoi, 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $tournoi = Tournoi::findOrFail($id);
        
        $validated = $request->validate([
            'nom' => 'sometimes|string|max:255',
            'date_fin' => 'required|date',
            'date_debut' => 'required|date',
            'lieu' => 'sometimes|string',
            'systemeElimination' => 'sometimes|string|max:10',
            'id_categorie' => 'sometimes|exists:categorie,id'
        ]);

        $tournoi->update($validated);
        return response()->json($tournoi);
    }

    public function destroy(int $id): JsonResponse
    {
        $tournoi = Tournoi::findOrFail($id);
        $tournoi->delete();
        return response()->json(null, 204);
    }

    public function addCompetiteur(int $tournoiId, int $competiteurId): JsonResponse
    {
        $tournoi = Tournoi::findOrFail($tournoiId);
        
        // Vérifier que le compétiteur appartient à la catégorie du tournoi
        $competiteur = Competiteur::findOrFail($competiteurId);
        if (!$competiteur->categories->contains($tournoi->id_categorie)) {
            return response()->json([
                'message' => 'Le compétiteur n\'appartient pas à la catégorie du tournoi'
            ], 422);
        }

        $tournoi->competiteurs()->attach($competiteurId);
        return response()->json(['message' => 'Compétiteur inscrit au tournoi']);
    }

    public function removeCompetiteur(int $tournoiId, int $competiteurId): JsonResponse
    {
        $tournoi = Tournoi::findOrFail($tournoiId);
        $tournoi->competiteurs()->detach($competiteurId);
        return response()->json(['message' => 'Compétiteur désinscrit du tournoi']);
    }

    public function listInscrits(int $id): JsonResponse
    {
        $tournoi = Tournoi::findOrFail($id);
        $inscrits = $tournoi->competiteurs()
            ->with(['club', 'grade', 'categories'])
            ->get();
        return response()->json($inscrits);
    }

    public function inscription(Request $request, int $id): JsonResponse
    {
        $tournoi = Tournoi::findOrFail($id);
        $user = $request->user();
        
        // Vérifier que l'utilisateur est un compétiteur
        if (!$user->competiteur) {
            throw ValidationException::withMessages([
                'inscription' => ['Seuls les compétiteurs peuvent s\'inscrire à un tournoi.']
            ]);
        }

        // // Vérifier que le compétiteur appartient à la catégorie du tournoi
        // if (!$user->competiteur->categories->contains($tournoi->id_categorie)) {
        //     throw ValidationException::withMessages([
        //         'inscription' => ['Vous n\'appartenez pas à la catégorie de ce tournoi.']
        //     ]);
        // }

        // Vérifier que le compétiteur n'est pas déjà inscrit
        if ($tournoi->competiteurs->contains($user->competiteur->id)) {
            throw ValidationException::withMessages([
                'inscription' => ['Vous êtes déjà inscrit à ce tournoi.']
            ]);
        }

        $tournoi->competiteurs()->attach($user->competiteur->id);
        return response()->json(['message' => 'Inscription réussie']);
    }

    public function desinscription(Request $request, int $id): JsonResponse
    {
        $tournoi = Tournoi::findOrFail($id);
        $user = $request->user();
        
        if (!$user->competiteur) {
            throw ValidationException::withMessages([
                'desinscription' => ['Seuls les compétiteurs peuvent se désinscrire d\'un tournoi.']
            ]);
        }

        if (!$tournoi->competiteurs->contains($user->competiteur->id)) {
            throw ValidationException::withMessages([
                'desinscription' => ['Vous n\'êtes pas inscrit à ce tournoi.']
            ]);
        }

        $tournoi->competiteurs()->detach($user->competiteur->id);
        return response()->json(['message' => 'Désinscription réussie']);
    }

    public function inscrireCompetiteur(int $tournoiId, int $competiteurId): JsonResponse
    {
        $tournoi = Tournoi::findOrFail($tournoiId);
        $competiteur = Competiteur::findOrFail($competiteurId);
        
        // Vérifier que le compétiteur appartient à la catégorie du tournoi
        if (!$competiteur->categories->contains($tournoi->id_categorie)) {
            throw ValidationException::withMessages([
                'inscription' => ['Le compétiteur n\'appartient pas à la catégorie de ce tournoi.']
            ]);
        }

        // Vérifier que le compétiteur n'est pas déjà inscrit
        if ($tournoi->competiteurs->contains($competiteurId)) {
            throw ValidationException::withMessages([
                'inscription' => ['Le compétiteur est déjà inscrit à ce tournoi.']
            ]);
        }

        $tournoi->competiteurs()->attach($competiteurId);
        return response()->json(['message' => 'Inscription réussie']);
    }

    public function verifierInscription(int $id, int $userId): JsonResponse
    {
        $tournoi = Tournoi::findOrFail($id);
        
        // Trouver le compétiteur à partir de l'id utilisateur
        $competiteur = Competiteur::where('id_utilisateur', $userId)->firstOrFail();
        
        // Vérifier si le compétiteur est inscrit
        $inscription = $tournoi->competiteurs()
            ->where('competiteur.id', $competiteur->id)
            ->first();
            
        if (!$inscription) {
            return response()->json(null, 404);
        }

        return response()->json([
            'id' => $inscription->pivot->id ?? $inscription->id,
            'id_tournoi' => $id,
            'id_categorie' => $tournoi->id_categorie,
            'statut' => 'inscrit'
        ]);
    }
}