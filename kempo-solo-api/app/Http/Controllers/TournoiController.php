<?php

namespace App\Http\Controllers;

use App\Models\Tournoi;
use App\Models\Competiteur;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

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
            'date' => 'required|date',
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
            'date' => 'sometimes|date',
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
}