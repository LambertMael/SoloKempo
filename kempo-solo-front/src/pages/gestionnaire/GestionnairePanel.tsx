import { useState, useEffect } from 'react'
import axios from 'axios'

interface Tournoi {
  id: number
  nom: string
  date_debut: string
  date_fin: string
  lieu: string
  status: string
  description: string
}

interface Categorie {
  id: number
  nom: string
  ageMin: number
  ageMax: number
  poidsMin: number
  poidsMax: number
  sexe: string
}

const GestionnairePanel = () => {
  const [tournois, setTournois] = useState<Tournoi[]>([])
  const [categories, setCategories] = useState<Categorie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [selectedTournoi, setSelectedTournoi] = useState<Tournoi | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [inscrits, setInscrits] = useState<Array<any>>([])

  // Formulaire nouveau tournoi
  const [newTournoi, setNewTournoi] = useState({
    nom: '',
    date_debut: '',
    date_fin: '',
    lieu: '',
    description: '',
    systemeElimination: '',
    id_categorie: 0
  })

  // Formulaire nouvelle catégorie
  const [newCategorie, setNewCategorie] = useState({
    nom: '',
    ageMin: 0,
    ageMax: 0,
    poidsMin: 0,
    poidsMax: 0,
    sexe: ''
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tournoiResponse, categorieResponse] = await Promise.all([
          axios.get('http://localhost:8000/api/tournois'),
          axios.get('http://localhost:8000/api/categories')
        ])
        setTournois(tournoiResponse.data)
        setCategories(categorieResponse.data)
      } catch {
        setError('Erreur lors du chargement des données')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleCreateTournoi = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await axios.post('http://localhost:8000/api/tournois', newTournoi)
      setTournois([...tournois, response.data])
      setMessage('Tournoi créé avec succès')
      setNewTournoi({
        nom: '',
        date_debut: '',
        date_fin: '',
        lieu: '',
        description: '',
        systemeElimination: '',
        id_categorie: 0
      })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la création du tournoi'
      setError(errorMessage)
    }
  }

  const handleCreateCategorie = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await axios.post('http://localhost:8000/api/categories', newCategorie)
      setCategories([...categories, response.data])
      setMessage('Catégorie créée avec succès')
      setNewCategorie({
        nom: '',
        ageMin: 0,
        ageMax: 0,
        poidsMin: 0,
        poidsMax: 0,
        sexe: ''
      })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la création de la catégorie'
      setError(errorMessage)
    }
  }

  const handleModifyTournoi = async (tournoi: Tournoi) => {
    setSelectedTournoi(tournoi)
    setNewTournoi({
      nom: tournoi.nom,
      date_debut: tournoi.date_debut,
      date_fin: tournoi.date_fin,
      lieu: tournoi.lieu,
      description: tournoi.description,
      systemeElimination: tournoi.systemeElimination,
      id_categorie: tournoi.id_categorie
    })
    setIsEditing(true)
  }

  const handleUpdateTournoi = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTournoi) return

    try {
      const response = await axios.put(`http://localhost:8000/api/tournois/${selectedTournoi.id}`, newTournoi)
      setTournois(tournois.map(t => t.id === selectedTournoi.id ? response.data : t))
      setMessage('Tournoi modifié avec succès')
      setIsEditing(false)
      setSelectedTournoi(null)
      setNewTournoi({
        nom: '',
        date_debut: '',
        date_fin: '',
        lieu: '',
        description: '',
        systemeElimination: '',
        id_categorie: 0
      })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la modification du tournoi'
      setError(errorMessage)
    }
  }

  const handleLaunchTournoi = async (tournoiId: number) => {
    try {
      await axios.post(`http://localhost:8000/api/tournois/${tournoiId}/launch`)
      const updatedTournois = tournois.map(t => 
        t.id === tournoiId ? { ...t, status: 'en_cours' } : t
      )
      setTournois(updatedTournois)
      setMessage('Tournoi lancé avec succès')
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du lancement du tournoi'
      setError(errorMessage)
    }
  }

  const fetchInscrits = async (tournoiId: number) => {
    try {
      const response = await axios.get(`http://localhost:8000/api/tournois/${tournoiId}/inscrits`)
      setInscrits(response.data)
    } catch (error) {
      setError('Erreur lors du chargement des inscrits')
    }
  }

  if (loading) return <div>Chargement...</div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">
          Gestion des tournois
        </h1>

        {message && (
          <div className="mb-4 rounded-md bg-green-50 p-4">
            <div className="text-sm text-green-700">{message}</div>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Création de tournoi */}
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">{isEditing ? 'Modifier le tournoi' : 'Créer un nouveau tournoi'}</h2>
              <form onSubmit={isEditing ? handleUpdateTournoi : handleCreateTournoi} className="space-y-4">
                <div>
                  <label htmlFor="nom" className="block text-sm font-medium text-gray-700">
                    Nom
                  </label>
                  <input
                    type="text"
                    id="nom"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
                    value={newTournoi.nom}
                    onChange={e => setNewTournoi({ ...newTournoi, nom: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="date_debut" className="block text-sm font-medium text-gray-700">
                    Date de début
                  </label>
                  <input
                    type="date"
                    id="date_debut"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
                    value={newTournoi.date_debut}
                    onChange={e => setNewTournoi({ ...newTournoi, date_debut: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="date_fin" className="block text-sm font-medium text-gray-700">
                    Date de fin
                  </label>
                  <input
                    type="date"
                    id="date_fin"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
                    value={newTournoi.date_fin}
                    onChange={e => setNewTournoi({ ...newTournoi, date_fin: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="lieu" className="block text-sm font-medium text-gray-700">
                    Lieu
                  </label>
                  <input
                    type="text"
                    id="lieu"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
                    value={newTournoi.lieu}
                    onChange={e => setNewTournoi({ ...newTournoi, lieu: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="systemeElimination" className="block text-sm font-medium text-gray-700">
                    Système d'élimination
                  </label>
                  <select
                    id="systemeElimination"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
                    value={newTournoi.systemeElimination}
                    onChange={e => setNewTournoi({ ...newTournoi, systemeElimination: e.target.value })}
                  >
                    <option value="">Sélectionner</option>
                    <option value="direct">Directe</option>
                    <option value="poule">Poule</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="id_categorie" className="block text-sm font-medium text-gray-700">
                    Catégorie
                  </label>
                  <select
                    id="id_categorie"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
                    value={newTournoi.id_categorie}
                    onChange={e => setNewTournoi({ ...newTournoi, id_categorie: parseInt(e.target.value) })}
                  >
                    <option value="0">Sélectionner une catégorie</option>
                    {categories.map(categorie => (
                      <option key={categorie.id} value={categorie.id}>
                        {categorie.nom}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
                    value={newTournoi.description}
                    onChange={e => setNewTournoi({ ...newTournoi, description: e.target.value })}
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {isEditing ? 'Modifier le tournoi' : 'Créer le tournoi'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Création de catégorie */}
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Créer une nouvelle catégorie</h2>
              <form onSubmit={handleCreateCategorie} className="space-y-4">
                <div>
                  <label htmlFor="cat_nom" className="block text-sm font-medium text-gray-700">
                    Nom
                  </label>
                  <input
                    type="text"
                    id="cat_nom"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
                    value={newCategorie.nom}
                    onChange={e => setNewCategorie({ ...newCategorie, nom: e.target.value })}
                  />
                </div>

                <div>
                  <label htmlFor="cat_sexe" className="block text-sm font-medium text-gray-700">
                    Sexe
                  </label>
                  <select
                    id="cat_sexe"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
                    value={newCategorie.sexe}
                    onChange={e => setNewCategorie({ ...newCategorie, sexe: e.target.value })}
                  >
                    <option value="">Sélectionner</option>
                    <option value="H">Homme</option>
                    <option value="F">Femme</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="ageMin" className="block text-sm font-medium text-gray-700">
                      Âge minimum
                    </label>
                    <input
                      type="number"
                      id="ageMin"
                      required
                      min="0"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
                      value={newCategorie.ageMin}
                      onChange={e => {
                        const newAgeMin = parseInt(e.target.value);
                        setNewCategorie(prev => ({
                          ...prev,
                          ageMin: newAgeMin,
                          // Reset ageMax if it becomes less than or equal to new ageMin
                          ageMax: prev.ageMax <= newAgeMin ? newAgeMin + 1 : prev.ageMax
                        }));
                      }}
                    />
                  </div>

                  <div>
                    <label htmlFor="ageMax" className="block text-sm font-medium text-gray-700">
                      Âge maximum
                    </label>
                    <input
                      type="number"
                      id="ageMax"
                      required
                      min={newCategorie.ageMin + 1}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
                      value={newCategorie.ageMax}
                      onChange={e => setNewCategorie({ ...newCategorie, ageMax: parseInt(e.target.value) })}
                    />
                  </div>

                  <div>
                    <label htmlFor="poidsMin" className="block text-sm font-medium text-gray-700">
                      Poids minimum (kg)
                    </label>
                    <input
                      type="number"
                      id="poidsMin"
                      required
                      min="0"
                      step="0.01"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
                      value={newCategorie.poidsMin}
                      onChange={e => {
                        const newPoidsMin = parseFloat(e.target.value);
                        setNewCategorie(prev => ({
                          ...prev,
                          poidsMin: newPoidsMin,
                          // Reset poidsMax if it becomes less than or equal to new poidsMin
                          poidsMax: prev.poidsMax <= newPoidsMin ? newPoidsMin + 0.01 : prev.poidsMax
                        }));
                      }}
                    />
                  </div>

                  <div>
                    <label htmlFor="poidsMax" className="block text-sm font-medium text-gray-700">
                      Poids maximum (kg)
                    </label>
                    <input
                      type="number"
                      id="poidsMax"
                      required
                      min={newCategorie.poidsMin + 0.01}
                      step="0.01"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
                      value={newCategorie.poidsMax}
                      onChange={e => setNewCategorie({ ...newCategorie, poidsMax: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Créer la catégorie
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Liste des tournois */}
        <div className="mt-8 bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Tournois en cours</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nom
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dates
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lieu
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tournois.map((tournoi) => (
                    <tr key={tournoi.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {tournoi.nom}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(tournoi.date_debut).toLocaleDateString()} - {new Date(tournoi.date_fin).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {tournoi.lieu}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          tournoi.status === 'en_cours'
                            ? 'bg-green-100 text-green-800'
                            : tournoi.status === 'a_venir'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {tournoi.status === 'en_cours'
                            ? 'En cours'
                            : tournoi.status === 'a_venir'
                            ? 'À venir'
                            : 'Terminé'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {tournoi.status === 'a_venir' && (
                          <button
                            onClick={() => handleLaunchTournoi(tournoi.id)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Lancer
                          </button>
                        )}
                        <button
                          onClick={() => handleModifyTournoi(tournoi)}
                          className="text-indigo-600 hover:text-indigo-900 ml-4"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => {
                            setSelectedTournoi(tournoi)
                            fetchInscrits(tournoi.id)
                          }}
                          className="text-indigo-600 hover:text-indigo-900 ml-4"
                        >
                          Voir les inscrits
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Affichage des inscrits */}
        {selectedTournoi && (
          <div className="mt-8 bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Compétiteurs inscrits pour {selectedTournoi.nom}</h2>
              {inscrits.length > 0 ? (
                <ul className="mt-2 divide-y divide-gray-200">
                  {inscrits.map((inscrit) => (
                    <li key={inscrit.id} className="py-2">
                      <p className="text-sm">{inscrit.prenom} {inscrit.nom}</p>
                      <p className="text-xs text-gray-500">
                        Club: {inscrit.club?.nom || 'Non affilié'} | 
                        Grade: {inscrit.grade?.nom || 'Non spécifié'}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-gray-500">Aucun compétiteur inscrit</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default GestionnairePanel