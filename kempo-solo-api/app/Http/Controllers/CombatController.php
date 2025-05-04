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

    public function getResultat(int $id): JsonResponse
    {
        $combat = Combat::with(['competiteur1', 'competiteur2'])
            ->findOrFail($id);
        
        return response()->json([
            'combat' => $combat,
            'vainqueur' => $this->determinerVainqueur($combat),
        ]);
    }

    public function saveResultat(Request $request, int $id): JsonResponse
    {
        $combat = Combat::findOrFail($id);
        
        $validated = $request->validate([
            'score_p1' => 'required|integer|min:0',
            'score_p2' => 'required|integer|min:0',
            'penalite_p1' => 'required|integer|min:0',
            'penalite_p2' => 'required|integer|min:0',
            'duree' => 'required|integer|min:0'
        ]);

        $combat->update($validated);
        
        return response()->json([
            'combat' => $combat,
            'vainqueur' => $this->determinerVainqueur($combat),
        ]);
    }

    public function updateResultat(Request $request, int $id): JsonResponse
    {
        $combat = Combat::findOrFail($id);
        
        $validated = $request->validate([
            'score_p1' => 'sometimes|integer|min:0',
            'score_p2' => 'sometimes|integer|min:0',
            'penalite_p1' => 'sometimes|integer|min:0',
            'penalite_p2' => 'sometimes|integer|min:0',
            'duree' => 'sometimes|integer|min:0'
        ]);

        $combat->update($validated);
        
        return response()->json([
            'combat' => $combat,
            'vainqueur' => $this->determinerVainqueur($combat),
        ]);
    }

    private function determinerVainqueur(Combat $combat): ?array
    {
        if ($combat->score_p1 === null || $combat->score_p2 === null) {
            return null;
        }

        $scoreNetP1 = $combat->score_p1 - $combat->penalite_p1;
        $scoreNetP2 = $combat->score_p2 - $combat->penalite_p2;

        if ($scoreNetP1 > $scoreNetP2) {
            return [
                'competiteur' => $combat->competiteur1,
                'score_net' => $scoreNetP1,
                'position' => 1
            ];
        } elseif ($scoreNetP2 > $scoreNetP1) {
            return [
                'competiteur' => $combat->competiteur2,
                'score_net' => $scoreNetP2,
                'position' => 2
            ];
        } else {
            return [
                'egalite' => true,
                'score' => $scoreNetP1
            ];
        }
    }
}