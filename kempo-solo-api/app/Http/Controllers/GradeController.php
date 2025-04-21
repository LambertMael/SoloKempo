<?php

namespace App\Http\Controllers;

use App\Models\Grade;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class GradeController extends Controller
{
    public function index(): JsonResponse
    {
        $grades = Grade::with('competiteurs')->get();
        return response()->json($grades);
    }

    public function show(int $id): JsonResponse
    {
        $grade = Grade::with('competiteurs')->findOrFail($id);
        return response()->json($grade);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'couleur_ceinture' => 'required|string|max:50'
        ]);

        $grade = Grade::create($validated);
        return response()->json($grade, 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $grade = Grade::findOrFail($id);
        
        $validated = $request->validate([
            'nom' => 'sometimes|string|max:255',
            'couleur_ceinture' => 'sometimes|string|max:50'
        ]);

        $grade->update($validated);
        return response()->json($grade);
    }

    public function destroy(int $id): JsonResponse
    {
        $grade = Grade::findOrFail($id);
        $grade->delete();
        return response()->json(null, 204);
    }
}