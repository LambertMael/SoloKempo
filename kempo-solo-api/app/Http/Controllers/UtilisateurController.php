<?php

namespace App\Http\Controllers;

use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class UtilisateurController extends Controller
{
    public function index(): JsonResponse
    {
        $utilisateurs = Utilisateur::with('competiteur')->get();
        return response()->json($utilisateurs);
    }

    public function show(int $id): JsonResponse
    {
        $utilisateur = Utilisateur::with('competiteur')->findOrFail($id);
        return response()->json($utilisateur);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email|unique:utilisateur,email',
            'mdp' => 'required|min:8',
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'role' => 'required|in:admin,competiteur,gestionnaire'
        ]);

        $validated['mdp'] = Hash::make($validated['mdp']);
        $validated['is_active'] = true;

        $utilisateur = Utilisateur::create($validated);
        return response()->json($utilisateur, 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $utilisateur = Utilisateur::findOrFail($id);
        
        $validated = $request->validate([
            'email' => 'sometimes|email|unique:utilisateur,email,' . $id,
            'mdp' => 'sometimes|min:8',
            'nom' => 'sometimes|string|max:255',
            'prenom' => 'sometimes|string|max:255',
            'role' => 'sometimes|in:admin,competiteur,gestionnaire',
            'is_active' => 'sometimes|boolean'
        ]);

        if (isset($validated['mdp'])) {
            $validated['mdp'] = Hash::make($validated['mdp']);
        }

        $utilisateur->update($validated);
        return response()->json($utilisateur);
    }

    public function destroy(int $id): JsonResponse
    {
        $utilisateur = Utilisateur::findOrFail($id);
        
        // Vérifier si c'est le dernier admin
        if ($utilisateur->role === 'admin') {
            $adminCount = Utilisateur::where('role', 'admin')->count();
            if ($adminCount <= 1) {
                throw ValidationException::withMessages([
                    'role' => ['Impossible de supprimer le dernier administrateur.']
                ]);
            }
        }

        $utilisateur->delete();
        return response()->json(null, 204);
    }

    public function toggleActive(int $id): JsonResponse
    {
        $utilisateur = Utilisateur::findOrFail($id);
        
        // Vérifier si c'est le dernier admin actif
        if ($utilisateur->role === 'admin' && $utilisateur->is_active) {
            $activeAdminCount = Utilisateur::where('role', 'admin')
                ->where('is_active', true)
                ->count();
            if ($activeAdminCount <= 1) {
                throw ValidationException::withMessages([
                    'is_active' => ['Impossible de désactiver le dernier administrateur actif.']
                ]);
            }
        }

        $utilisateur->is_active = !$utilisateur->is_active;
        $utilisateur->save();

        return response()->json($utilisateur);
    }

    public function changePassword(Request $request, int $id): JsonResponse
    {
        $utilisateur = Utilisateur::findOrFail($id);
        
        $validated = $request->validate([
            'ancien_mdp' => 'required',
            'nouveau_mdp' => 'required|min:8|different:ancien_mdp'
        ]);

        if (!Hash::check($validated['ancien_mdp'], $utilisateur->mdp)) {
            throw ValidationException::withMessages([
                'ancien_mdp' => ['Le mot de passe actuel est incorrect.']
            ]);
        }

        $utilisateur->mdp = Hash::make($validated['nouveau_mdp']);
        $utilisateur->save();

        return response()->json(['message' => 'Mot de passe modifié avec succès']);
    }

    public function profile(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->load('competiteur.club', 'competiteur.categories', 'clubs');
        return response()->json($user);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'email' => 'sometimes|email|unique:utilisateur,email,' . $user->id,
            'nom' => 'sometimes|string|max:255',
            'prenom' => 'sometimes|string|max:255'
        ]);

        $user->update($validated);
        return response()->json($user);
    }

    public function changePasswordProfile(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'ancien_mdp' => 'required',
            'nouveau_mdp' => 'required|min:8|different:ancien_mdp'
        ]);

        if (!Hash::check($validated['ancien_mdp'], $user->mdp)) {
            throw ValidationException::withMessages([
                'ancien_mdp' => ['Le mot de passe actuel est incorrect.']
            ]);
        }

        $user->mdp = Hash::make($validated['nouveau_mdp']);
        $user->save();

        return response()->json(['message' => 'Mot de passe modifié avec succès']);
    }
}