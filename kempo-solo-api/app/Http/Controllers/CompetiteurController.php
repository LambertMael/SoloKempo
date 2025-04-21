<?php

namespace App\Http\Controllers;

use App\Models\Competiteur;
use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

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
}