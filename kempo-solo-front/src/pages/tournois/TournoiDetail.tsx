import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../../contexts/AuthContext'

interface Tournoi {
  id: number
  nom: string
  date_debut: string
  date_fin: string
  lieu: string
  status: string
  description: string
  categories: Categorie[]
}

interface Categorie {
  id: number
  nom: string
  description: string
  age_min: number
  age_max: number
  poids_min: number
  poids_max: number
}

interface Inscription {
  id: number
  id_tournoi: number
  id_categorie: number
  statut: string
}

const TournoiDetail = () => {
  const { id } = useParams<{ id: string }>()
  const [tournoi, setTournoi] = useState<Tournoi | null>(null)
  const [inscription, setInscription] = useState<Inscription | null>(null)
  // const [selectedCategorie, setSelectedCategorie] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    const fetchTournoi = async () => {
      try {
        const response = await axios.get(`/api/tournois/${id}`)
        setTournoi(response.data)
        console.error(response.data)
        // Si l'utilisateur est connecté, vérifier s'il est déjà inscrit
        if (user) {
          try {
            const inscriptionResponse = await axios.get(
              `/api/tournois/${id}/inscriptions/${user.id}`
            )
            setInscription(inscriptionResponse.data)
          } catch (err) {
            // Pas d'inscription trouvée, c'est normal
            console.error(err)
          }
        }
      } catch (err) {
        setError('Erreur lors du chargement du tournoi')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchTournoi()
  }, [id, user])

  const handleInscription = async () => {
    // if (!selectedCategorie) {
    //   setError('Veuillez sélectionner une catégorie')
    //   return
    // }

    try {
      const response = await axios.post(`/api/tournois/${id}/inscription`, {
        id_categorie: tournoi?.categories && tournoi.categories[0] ? tournoi.categories[0].id : undefined
      })
      setInscription(response.data)
      setMessage('Inscription réussie !')
      setError('')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription')
    }
  }

  const handleDesinscription = async () => {
    try {
      await axios.delete(`/api/tournois/${id}/desinscription`)
      setInscription(null)
      setMessage('Désinscription effectuée')
      setError('')
    } catch (err) {
      setError('Erreur lors de la désinscription')
    }
  }

  if (loading) return <div>Chargement...</div>
  if (error) return <div className="text-red-600">{error}</div>
  if (!tournoi) return <div>Tournoi non trouvé</div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{tournoi.nom}</h1>
          <p className="text-gray-600">{tournoi.description}</p>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg leading-6 font-medium text-gray-900">
              Informations du tournoi
            </h2>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200">
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Dates</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  Du {new Date(tournoi.date_debut).toLocaleDateString()} au{' '}
                  {new Date(tournoi.date_fin).toLocaleDateString()}
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Lieu</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {tournoi.lieu}
                </dd>
              </div>
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Statut</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      tournoi.status === 'en_cours'
                        ? 'bg-green-100 text-green-800'
                        : tournoi.status === 'a_venir'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {tournoi.status === 'en_cours'
                      ? 'En cours'
                      : tournoi.status === 'a_venir'
                      ? 'À venir'
                      : 'Terminé'}
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {user?.role === 'competiteur' && tournoi.status === 'a_venir' && (
          <div className="bg-white shadow sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {inscription ? 'Gérer mon inscription' : 'S\'inscrire au tournoi'}
              </h3>
              
              {message && (
                <div className="mt-2 rounded-md bg-green-50 p-4">
                  <div className="text-sm text-green-700">{message}</div>
                </div>
              )}
              
              {error && (
                <div className="mt-2 rounded-md bg-red-50 p-4">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}

              {!inscription ? (
                <div className="mt-5">
                  <label htmlFor="categorie" className="block text-sm font-medium text-gray-700">
                    Catégorie
                  </label>
                  {/* <select
                    id="categorie"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={selectedCategorie || ''}
                    onChange={(e) => setSelectedCategorie(Number(e.target.value))}
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {tournoi.categories.map((categorie) => (
                      <option key={categorie.id} value={categorie.id}>
                        {categorie.nom} ({categorie.age_min}-{categorie.age_max} ans, {categorie.poids_min}-{categorie.poids_max} kg)
                      </option>
                    ))}
                  </select> */}
                  
                  <button
                    onClick={handleInscription}
                    className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    S'inscrire
                  </button>
                </div>
              ) : (
                <div className="mt-5">

                  {/* <p className="text-sm text-gray-500">
                    Vous êtes inscrit dans la catégorie:{' '}
                    {tournoi.categories.find(c => c.id === inscription.id_categorie)?.nom}
                  </p> */}
                  <button
                    onClick={handleDesinscription}
                    className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Se désinscrire
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {user?.role === 'gestionnaire' && (
          <div className="mt-6">
            {/* Composant de gestion du tournoi à implémenter */}
          </div>
        )}
      </div>
    </div>
  )
}

export default TournoiDetail