import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
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
}

const TournoiList = () => {
  const [tournois, setTournois] = useState<Tournoi[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    const fetchTournois = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/tournois')
        setTournois(response.data)
      } catch (err) {
        setError('Erreur lors du chargement des tournois')
      } finally {
        setLoading(false)
      }
    }

    fetchTournois()
  }, [])

  if (loading) return <div>Chargement...</div>
  if (error) return <div className="text-red-600">{error}</div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Tournois</h1>
          {user?.role === 'gestionnaire' && (
            <Link
              to="/gestionnaire/tournois/nouveau"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Créer un tournoi
            </Link>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-6">
        {tournois.map((tournoi) => (
          <Link
            key={tournoi.id}
            to={`/tournois/${tournoi.id}`}
            className="w-[300px] bg-gray-50 border border-gray-300 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300"
          >
            <div className="p-5 flex flex-col justify-between h-full">
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">{tournoi.nom}</h2>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {tournoi.description}
                </p>
              </div>

              <div className="text-sm text-gray-700 space-y-1">
                <p>
                  <span className="font-semibold">Dates :</span>{' '}
                  {new Date(tournoi.date_debut).toLocaleDateString()} -{' '}
                  {new Date(tournoi.date_fin).toLocaleDateString()}
                </p>
                <p>
                  <span className="font-semibold">Lieu :</span> {tournoi.lieu}
                </p>
              </div>

              <div className="mt-4">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    tournoi.status === 'en_cours'
                      ? 'bg-green-200 text-green-800'
                      : tournoi.status === 'a_venir'
                      ? 'bg-blue-200 text-blue-800'
                      : 'bg-gray-300 text-gray-800'
                  }`}
                >
                  {tournoi.status === 'en_cours'
                    ? 'En cours'
                    : tournoi.status === 'a_venir'
                    ? 'À venir'
                    : 'Terminé'}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>



        {tournois.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun tournoi n'est disponible pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default TournoiList