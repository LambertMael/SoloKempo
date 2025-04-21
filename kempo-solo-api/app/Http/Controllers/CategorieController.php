<?php

namespace App\Http\Controllers;

use App\Models\Categorie;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CategorieController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = Categorie::with('competiteurs')->get();
        return response()->json($categories);
    }

    public function show(int $id): JsonResponse
    {
        $categorie = Categorie::with('competiteurs', 'tournois')->findOrFail($id);
        return response()->json($categorie);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'sexe' => 'required|string|size:1',
            'poidsMin' => 'required|numeric|min:0',
            'poidsMax' => 'required|numeric|gt:poidsMin',
            'ageMin' => 'required|integer|min:0',
            'ageMax' => 'required|integer|gt:ageMin'
        ]);

        $categorie = Categorie::create($validated);
        return response()->json($categorie, 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $categorie = Categorie::findOrFail($id);
        
        $validated = $request->validate([
            'nom' => 'sometimes|string|max:255',
            'sexe' => 'sometimes|string|size:1',
            'poidsMin' => 'sometimes|numeric|min:0',
            'poidsMax' => 'sometimes|numeric|gt:poidsMin',
            'ageMin' => 'sometimes|integer|min:0',
            'ageMax' => 'sometimes|integer|gt:ageMin'
        ]);

        $categorie->update($validated);
        return response()->json($categorie);
    }

    public function destroy(int $id): JsonResponse
    {
        $categorie = Categorie::findOrFail($id);
        $categorie->delete();
        return response()->json(null, 204);
    }

    public function addCompetiteur(int $categorieId, int $competiteurId): JsonResponse
    {
        $categorie = Categorie::findOrFail($categorieId);
        $categorie->competiteurs()->attach($competiteurId);
        return response()->json(['message' => 'Compétiteur ajouté à la catégorie']);
    }

    public function removeCompetiteur(int $categorieId, int $competiteurId): JsonResponse
    {
        $categorie = Categorie::findOrFail($categorieId);
        $categorie->competiteurs()->detach($competiteurId);
        return response()->json(['message' => 'Compétiteur retiré de la catégorie']);
    }
}