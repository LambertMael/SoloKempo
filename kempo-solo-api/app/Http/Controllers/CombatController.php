<?php

namespace App\Http\Controllers;

use App\Models\Combat;
use App\Models\Poule;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class CombatController extends Controller
{
    public function index(): JsonResponse
    {
        $combats = Combat::with(['poule', 'competiteur1', 'competiteur2'])->get();
        return response()->json($combats);
    }

    public function pouleMatchs(int $pouleId): JsonResponse
    {
        $combats = Combat::where('id_poule', $pouleId)
            ->with(['competiteur1', 'competiteur2'])
            ->get();
        return response()->json($combats);
    }

    public function store(Request $request, int $pouleId): JsonResponse
    {
        $poule = Poule::findOrFail($pouleId);
        
        $validated = $request->validate([
            'id_p1' => 'required|exists:competiteur,id',
            'id_p2' => 'required|exists:competiteur,id|different:id_p1',
            'score_p1' => 'nullable|integer|min:0',
            'score_p2' => 'nullable|integer|min:0',
            'penalite_p1' => 'nullable|integer|min:0',
            'penalite_p2' => 'nullable|integer|min:0',
            'duree' => 'nullable|integer|min:0'
        ]);

        // Vérifier que les deux compétiteurs sont dans la poule
        $competiteursPoule = $poule->competiteurs()->pluck('id')->toArray();
        if (!in_array($validated['id_p1'], $competiteursPoule) || 
            !in_array($validated['id_p2'], $competiteursPoule)) {
            throw ValidationException::withMessages([
                'competiteurs' => ['Les deux compétiteurs doivent être dans la poule']
            ]);
        }

        $validated['id_poule'] = $pouleId;
        $combat = Combat::create($validated);
        
        return response()->json($combat, 201);
    }

    public function update(Request $request, int $combatId): JsonResponse
    {
        $combat = Combat::findOrFail($combatId);
        
        $validated = $request->validate([
            'score_p1' => 'nullable|integer|min:0',
            'score_p2' => 'nullable|integer|min:0',
            'penalite_p1' => 'nullable|integer|min:0',
            'penalite_p2' => 'nullable|integer|min:0',
            'duree' => 'nullable|integer|min:0'
        ]);

        $combat->update($validated);
        
        return response()->json($combat);
    }

    public function destroy(int $combatId): JsonResponse
    {
        $combat = Combat::findOrFail($combatId);
        $combat->delete();
        
        return response()->json(null, 204);
    }
}