<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategorieController;
use App\Http\Controllers\ClubController;
use App\Http\Controllers\CompetiteurController;
use App\Http\Controllers\PaysController;
use App\Http\Controllers\GradeController;
use App\Http\Controllers\CombatController;
use App\Http\Controllers\PouleController;
use App\Http\Controllers\TournoiController;
use App\Http\Controllers\UtilisateurController;
use App\Http\Controllers\GestionnaireClubController;

// Routes publiques
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// Routes publiques en lecture seule
Route::get('/tournois', [TournoiController::class, 'index']);
Route::get('/tournois/{id}', [TournoiController::class, 'show']);
Route::get('/clubs', [ClubController::class, 'index']);
Route::get('/clubs/{id}', [ClubController::class, 'show']);

// Routes protégées par authentification
Route::middleware('auth:sanctum')->group(function () {
    // Authentification
    Route::post('/logout', [AuthController::class, 'logout']);

    // Gestion des utilisateurs
    Route::middleware(['role:admin'])->group(function () {
        Route::get('/utilisateurs', [UtilisateurController::class, 'index']);
        Route::post('/utilisateurs', [UtilisateurController::class, 'store']);
        Route::delete('/utilisateurs/{id}', [UtilisateurController::class, 'destroy']);
        Route::post('/utilisateurs/{id}/toggle-active', [UtilisateurController::class, 'toggleActive']);
        
        // Gestion des clubs et gestionnaires
        Route::post('/gestionnaires/{id}/clubs/{clubId}', [GestionnaireClubController::class, 'assignClub']);
        Route::delete('/gestionnaires/{id}/clubs/{clubId}', [GestionnaireClubController::class, 'removeFromClub']);
    });
    
    // Routes pour consulter les relations club-gestionnaire
    Route::get('/clubs/{id}/gestionnaires', [GestionnaireClubController::class, 'listClubGestionnaires']);
    Route::get('/gestionnaires/{id}/clubs', [GestionnaireClubController::class, 'listGestionnaireClubs']);
    
    // Routes utilisateur accessibles par l'utilisateur lui-même ou un admin
    //->middleware('can:manage,utilisateur');
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/utilisateurs/{id}', [UtilisateurController::class, 'show']);
        Route::put('/utilisateurs/{id}', [UtilisateurController::class, 'update']);
        Route::post('/utilisateurs/{id}/change-password', [UtilisateurController::class, 'changePassword']);
    });

    // Profil utilisateur
    Route::get('/profile', [UtilisateurController::class, 'profile']);
    Route::put('/profile', [UtilisateurController::class, 'updateProfile']);
    Route::post('/profile/change-password', [UtilisateurController::class, 'changePasswordProfile']);

    // Clubs (routes protégées)
    Route::middleware(['role:admin'])->group(function () {
        Route::post('/clubs', [ClubController::class, 'store']);
        Route::put('/clubs/{id}', [ClubController::class, 'update']);
        Route::delete('/clubs/{id}', [ClubController::class, 'destroy']);
    });

    // Pays
    Route::get('/pays', [PaysController::class, 'index']);
    Route::get('/pays/{id}', [PaysController::class, 'show']);
    Route::middleware(['role:admin'])->group(function () {
        Route::post('/pays', [PaysController::class, 'store']);
        Route::put('/pays/{id}', [PaysController::class, 'update']);
        Route::delete('/pays/{id}', [PaysController::class, 'destroy']);
    });

    // Grades
    Route::get('/grade', [GradeController::class, 'index']);
    Route::get('/grade/{id}', [GradeController::class, 'show']);
    Route::middleware(['role:admin'])->group(function () {
        Route::post('/grade', [GradeController::class, 'store']);
        Route::put('/grade/{id}', [GradeController::class, 'update']);
        Route::delete('/grade/{id}', [GradeController::class, 'destroy']);
    });

    // Catégories
    Route::get('/categories', [CategorieController::class, 'index']);
    Route::get('/categories/{id}', [CategorieController::class, 'show']);
    Route::middleware(['role:admin,gestionnaire'])->group(function () {
        Route::post('/categories', [CategorieController::class, 'store']);
        Route::put('/categories/{id}', [CategorieController::class, 'update']);
        Route::delete('/categories/{id}', [CategorieController::class, 'destroy']);
    });

    // Compétiteurs
    Route::middleware(['role:admin'])->get('/competiteurs', [CompetiteurController::class, 'index']);
    Route::get('/competiteurs/{id}', [CompetiteurController::class, 'show']);
    Route::get('/competiteurs/{id}/resultats', [CompetiteurController::class, 'resultats']);
    Route::post('/competiteurs', [CompetiteurController::class, 'store']);
    Route::put('/competiteurs/{id}', [CompetiteurController::class, 'update']);
    Route::delete('/competiteurs/{id}', [CompetiteurController::class, 'destroy']);

    // Liaison Compétiteur-Catégorie
    Route::post('/competiteurs/{id}/categories/{catId}', [CategorieController::class, 'addCompetiteur']);
    Route::delete('/competiteurs/{id}/categories/{catId}', [CategorieController::class, 'removeCompetiteur']);

    // Tournois et inscriptions (routes protégées)
    Route::get('/tournois/{id}/inscrits', [TournoiController::class, 'listInscrits']);
    Route::post('/tournois/{id}/inscription', [TournoiController::class, 'inscription']);
    Route::delete('/tournois/{id}/desinscription', [TournoiController::class, 'desinscription']);
    Route::post('/tournois/{id}/inscriptions/{compId}', [TournoiController::class, 'inscrireCompetiteur']);
    Route::middleware(['role:admin,gestionnaire'])->group(function () {
        Route::post('/tournois', [TournoiController::class, 'store']);
        Route::put('/tournois/{id}', [TournoiController::class, 'update']);
        Route::delete('/tournois/{id}', [TournoiController::class, 'destroy']);
        Route::post('/tournois/{id}/competiteurs/{compId}', [TournoiController::class, 'addCompetiteur']);
        Route::delete('/tournois/{id}/competiteurs/{compId}', [TournoiController::class, 'removeCompetiteur']);
    });

    // Résultats des combats
    Route::get('/combats/{id}/resultats', [CombatController::class, 'getResultat']);
    Route::middleware(['role:admin,gestionnaire'])->group(function () {
        Route::post('/combats/{id}/resultats', [CombatController::class, 'saveResultat']);
        Route::put('/combats/{id}/resultats', [CombatController::class, 'updateResultat']);
    });

    // Poules
    Route::get('/poules', [PouleController::class, 'index']);
    Route::get('/tournois/{id}/poules', [PouleController::class, 'tournoiPoules']);
    Route::middleware(['auth:sanctum', 'role:admin,gestionnaire'])->group(function () {
        Route::post('/tournois/{id}/poules', [PouleController::class, 'store']);
        Route::delete('/poules/{id}', [PouleController::class, 'destroy']);
    });

    // Affectation aux poules
    Route::middleware(['role:admin,gestionnaire'])->group(function () {
        Route::post('/poules/{id}/competiteurs/{compId}', [PouleController::class, 'addCompetiteur']);
        Route::delete('/poules/{id}/competiteurs/{compId}', [PouleController::class, 'removeCompetiteur']);
    });

    // Combats
    Route::get('/combats', [CombatController::class, 'index']);
    Route::get('/poules/{id}/combats', [CombatController::class, 'pouleMatchs']);
    Route::middleware(['role:admin,gestionnaire'])->group(function () {
        Route::post('/poules/{id}/combats', [CombatController::class, 'store']);
        Route::put('/combats/{id}', [CombatController::class, 'update']);
        Route::delete('/combats/{id}', [CombatController::class, 'destroy']);
    });
});

