// Global types for the frontend

export interface Club {
  id: number;
  nom: string;
  competiteurs?: Array<any>;
  gestionnaires?: Array<any>;
}

export interface Pays {
  id: number;
  nom: string;
}

export interface Grade {
  id: number;
  nom: string;
}

export interface Competiteur {
  id: number;
  id_utilisateur: number;
  id_club: number;
  id_pays: number;
  id_grade: number;
  poids: number;
  date_naissance: string;
  sexe: string;
  club?: Club;
}

export interface User {
  id: number;
  email: string;
  nom: string;
  prenom: string;
  role: 'admin' | 'competiteur' | 'gestionnaire';
  competiteur?: Competiteur;
}

export interface Tournoi {
  id: number;
  nom: string;
  date_debut: string;
  date_fin: string;
  lieu: string;
  status: string;
  description: string;
  systemeElimination?: string;
  id_categorie?: number;
  categories?: Categorie[];
}

export interface Categorie {
  id: number;
  nom: string;
  description?: string;
  age_min?: number;
  age_max?: number;
  poids_min?: number;
  poids_max?: number;
}
