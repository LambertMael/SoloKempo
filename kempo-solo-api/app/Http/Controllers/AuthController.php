<?php

namespace App\Http\Controllers;

use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use App\Notifications\ResetPasswordNotification;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
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

        $user = Utilisateur::create($validated);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'mdp' => 'required'
        ]);

        $user = Utilisateur::where('email', $validated['email'])->first();

        if (! $user || ! Hash::check($validated['mdp'], $user->mdp)) {
            throw ValidationException::withMessages([
                'email' => ['Les informations de connexion sont incorrectes.'],
            ]);
        }

        if (! $user->is_active) {
            throw ValidationException::withMessages([
                'email' => ['Ce compte a été désactivé.'],
            ]);
        }
        $user->tokens()->delete(); // Supprime les anciens tokens
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Déconnecté avec succès']);
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email']);
        $user = Utilisateur::where('email', $request->email)->first();
        
        if (!$user) {
            return response()->json(['message' => 'Email envoyé si le compte existe.'], 200);
        }

        $token = Str::random(64);
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            ['token' => $token, 'created_at' => now()]
        );

        try {
            $user->notify(new ResetPasswordNotification($token));
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur lors de l\'envoi de l\'email'], 500);
        }

        return response()->json(['message' => 'Email envoyé si le compte existe.']);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'token' => 'required',
            'password' => 'required|min:8'
        ]);

        $reset = DB::table('password_reset_tokens')
            ->where('token', $request->token)
            ->where('created_at', '>', now()->subHours(24))
            ->first();

        if (!$reset) {
            return response()->json(['message' => 'Token invalide ou expiré'], 400);
        }

        $user = Utilisateur::where('email', $reset->email)->first();
        if (!$user) {
            return response()->json(['message' => 'Utilisateur non trouvé'], 404);
        }

        $user->mdp = Hash::make($request->password);
        $user->save();

        DB::table('password_reset_tokens')->where('email', $user->email)->delete();

        return response()->json(['message' => 'Mot de passe réinitialisé avec succès']);
    }
}
