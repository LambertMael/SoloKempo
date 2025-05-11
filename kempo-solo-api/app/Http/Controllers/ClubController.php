<?php

namespace App\Http\Controllers;

use App\Models\Club;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ClubController extends Controller
{
    public function index(): JsonResponse
    {
        $clubs = Club::with('competiteurs')->get();
        return response()->json($clubs);
    }

    public function show(int $id): JsonResponse
    {
        $club = Club::with('competiteurs')->findOrFail($id);
        return response()->json($club);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255'
        ]);

        $club = Club::create($validated);
        return response()->json($club, 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $club = Club::findOrFail($id);
        
        $validated = $request->validate([
            'nom' => 'required|string|max:255'
        ]);

        $club->update($validated);
        return response()->json($club);
    }

    public function destroy(int $id): JsonResponse
    {
        $club = Club::findOrFail($id);
        $club->delete();
        return response()->json(null, 204);
    }

    public function withGestionnaires()
{
    $clubs = Club::with([
        'gestionnaires:id,nom,prenom,email',
        'competiteurs' => function ($query) {
            $query->select('id', 'nom', 'prenom', 'id_club', 'id_grade') // ajoute les colonnes nécessaires
                  ->with('grade:id,nom'); // relation vers grade, ajuste les champs si besoin
        }
    ])->get();

    return response()->json($clubs);
}


}