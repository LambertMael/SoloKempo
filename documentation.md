# Documentation du Projet Kempo Solo

## Description Générale
Kempo Solo est une application web de gestion de tournois de kempo, composée d'une API backend (Laravel) et d'une interface frontend (React/TypeScript). L'application permet la gestion complète des tournois, des clubs, des compétiteurs et des combats.

## Architecture Technique

### Backend (kempo-solo-api)
- **Framework**: Laravel (PHP)
- **Base de données**: SQLite
- **Authentication**: Laravel Sanctum
- **Structure**: Architecture MVC

### Frontend (kempo-solo-front)
- **Framework**: React avec TypeScript
- **UI**: Tailwind CSS
- **État**: React Context (AuthContext)
- **Routing**: React Router
- **Client HTTP**: Axios

## Modèles de Données

### Utilisateur
- Gère les comptes utilisateurs
- Rôles : admin, gestionnaire, compétiteur
- Attributs : email, mot de passe, nom, prénom, rôle, statut actif

### Compétiteur
- Lié à un utilisateur
- Appartient à un club
- Attributs : nom, prénom, date de naissance, sexe, poids
- Relations avec : pays, grade, catégories

### Club
- Structure regroupant des compétiteurs
- Géré par des gestionnaires
- Attributs : nom
- Relations : compétiteurs, gestionnaires

### Tournoi
- Événement sportif
- Attributs : nom, dates (début/fin), lieu, système d'élimination
- Lié à une catégorie
- Relations : compétiteurs inscrits, poules

### Catégorie
- Définit les critères d'admission
- Attributs : sexe, poids min/max, âge min/max, nom
- Relations : compétiteurs, tournois

### Combat
- Représente un affrontement entre deux compétiteurs
- Attributs : scores, pénalités, durée
- Appartient à une poule
- Relations : compétiteurs (P1 et P2)

### Poule
- Groupe de compétiteurs dans un tournoi
- Relations : tournoi, compétiteurs, combats

### Grade
- Niveau technique du compétiteur
- Attributs : nom, couleur de ceinture
- Relation : compétiteurs

### Pays
- Information géographique
- Attributs : nom, abréviation, drapeau (emoji)
- Relation : compétiteurs

## Fonctionnalités Principales

### Gestion des Utilisateurs
- Inscription/Connexion
- Gestion des rôles
- Réinitialisation de mot de passe

### Gestion des Clubs
- Création/modification de clubs (admin)
- Attribution de gestionnaires
- Liste des membres

### Gestion des Tournois
- Création et paramétrage (admin/gestionnaire)
- Inscription des compétiteurs
- Organisation en poules
- Gestion des combats

### Espace Compétiteur
- Inscription aux tournois
- Suivi des résultats
- Historique des combats

### Gestion des Combats
- Enregistrement des scores
- Suivi des pénalités
- Calcul des résultats

## Sécurité
- Authentification via Laravel Sanctum
- Autorisation basée sur les rôles
- Protection CSRF
- Configuration CORS

## API Endpoints

### Authentification
- POST /api/register
- POST /api/login
- POST /api/forgot-password
- POST /api/reset-password

### Tournois
- GET /api/tournois
- GET /api/tournois/{id}
- POST /api/tournois
- PUT /api/tournois/{id}
- DELETE /api/tournois/{id}
- GET /api/tournois/{id}/inscrits
- POST /api/tournois/{id}/inscription
- DELETE /api/tournois/{id}/desinscription

### Clubs
- GET /api/clubs
- GET /api/clubs/{id}
- POST /api/clubs
- PUT /api/clubs/{id}
- DELETE /api/clubs/{id}
- GET /api/clubs/{id}/gestionnaires

### Compétiteurs
- GET /api/competiteurs
- GET /api/competiteurs/{id}
- GET /api/competiteurs/{id}/resultats
- POST /api/competiteurs
- PUT /api/competiteurs/{id}

### Combats
- GET /api/combats/{id}/resultats
- POST /api/combats/{id}/resultats
- PUT /api/combats/{id}/resultats

## Installation et Configuration

### Prérequis
- PHP >= 8.0
- Composer
- Node.js >= 14
- NPM ou Yarn

### Installation Backend
1. Cloner le repository
2. cd kempo-solo-api
3. composer install
4. cp .env.example .env
5. php artisan key:generate
6. php artisan migrate
7. php artisan serve
A noter que cette dernière étape

### Installation Frontend
1. cd kempo-solo-front
2. npm install
3. cp .env.example .env
4. npm run dev

## Contribuer
1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commiter vos changements
4. Pousser vers la branche
5. Créer une Pull Request

## License
Ce projet est sous licence MIT.