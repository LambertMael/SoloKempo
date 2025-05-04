import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'

interface Tournoi {
  id: number
  nom: string
  date_debut: string
  date_fin: string
  lieu: string
  status: string
}

const Dashboard = () => {
  const { user } = useAuth()
  const [tournois, setTournois] = useState<Tournoi[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
        <h1 className="text-2xl font-semibold text-gray-900">
          Bienvenue, {user?.prenom} {user?.nom}
        </h1>
        
        <div className="mt-6">
          <h2 className="text-lg font-medium text-gray-900">Prochains tournois</h2>
          <div className="mt-4 grid gap-5 max-w-lg mx-auto lg:grid-cols-3 lg:max-w-none">
            {tournois.map((tournoi) => (
              <div
                key={tournoi.id}
                className="flex flex-col rounded-lg shadow-lg overflow-hidden"
              >
                <div className="flex-1 bg-white p-6 flex flex-col justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">{tournoi.nom}</h3>
                    <p className="mt-3 text-base text-gray-500">
                      Lieu: {tournoi.lieu}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Du {new Date(tournoi.date_debut).toLocaleDateString()} au{' '}
                      {new Date(tournoi.date_fin).toLocaleDateString()}
                    </p>
                    <span className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      tournoi.status === 'en_cours' ? 'bg-green-100 text-green-800' :
                      tournoi.status === 'a_venir' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {tournoi.status === 'en_cours' ? 'En cours' :
                       tournoi.status === 'a_venir' ? 'À venir' :
                       'Terminé'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {user?.role === 'competiteur' && (
          <div className="mt-8">
            {/* <h2 className="text-lg font-medium text-gray-900">Mes résultats</h2> */}
            {/* Composant des résultats à implémenter */}
          </div>
        )}

        {user?.role === 'gestionnaire' && (
          <div className="mt-8">
            {/* <h2 className="text-lg font-medium text-gray-900">Gestion des tournois</h2> */}
            {/* Composant de gestion à implémenter */}
          </div>
        )}

        {user?.role === 'admin' && (
          <div className="mt-8">
            {/* <h2 className="text-lg font-medium text-gray-900">Administration</h2> */}
            {/* Composant d'administration à implémenter */}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard