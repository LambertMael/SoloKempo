<?php

namespace App\Http\Controllers;

use App\Models\Poule;
use App\Models\Tournoi;
use App\Models\Competiteur;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PouleController extends Controller
{
    public function index(): JsonResponse
    {
        $poules = Poule::with(['tournoi', 'competiteurs', 'combats'])->get();
        return response()->json($poules);
    }

    public function tournoiPoules(int $tournoiId): JsonResponse
    {
        $poules = Poule::where('id_tournoi', $tournoiId)
            ->with(['competiteurs', 'combats'])
            ->get();
        return response()->json($poules);
    }

    public function store(Request $request, int $tournoiId): JsonResponse
    {
        $tournoi = Tournoi::findOrFail($tournoiId);

        $poule = $tournoi->poules()->create([
            'id_tournoi' => $tournoiId
        ]);

        return response()->json($poule, 201);
    }

    public function destroy(int $id): JsonResponse
    {
        $poule = Poule::findOrFail($id);
        $poule->delete();
        return response()->json(null, 204);
    }

    public function addCompetiteur(int $pouleId, int $competiteurId): JsonResponse
    {
        $poule = Poule::findOrFail($pouleId);
        
        // Vérifier que le compétiteur est inscrit au tournoi
        if (!$poule->tournoi->competiteurs->contains($competiteurId)) {
            return response()->json([
                'message' => 'Le compétiteur doit être inscrit au tournoi pour être ajouté à une poule'
            ], 422);
        }

        $poule->competiteurs()->attach($competiteurId);
        return response()->json(['message' => 'Compétiteur ajouté à la poule']);
    }

    public function removeCompetiteur(int $pouleId, int $competiteurId): JsonResponse
    {
        $poule = Poule::findOrFail($pouleId);
        $poule->competiteurs()->detach($competiteurId);
        return response()->json(['message' => 'Compétiteur retiré de la poule']);
    }
}