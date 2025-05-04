import { useState, useEffect } from 'react'
import axios from 'axios'

interface Club {
  id: number
  nom: string
  competiteurs: Array<{
    id: number
    nom: string
    prenom: string
  }>
}

const ClubList = () => {
  const [clubs, setClubs] = useState<Club[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const response = await axios.get('/api/clubs')
        setClubs(response.data)
      } catch (err: any) {
        setError(err.response?.data?.message || 'Erreur lors du chargement des clubs')
      } finally {
        setLoading(false)
      }
    }

    fetchClubs()
  }, [])

  if (loading) return <div>Chargement...</div>
  if (error) return <div className="text-red-600">{error}</div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">
          Clubs
        </h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {clubs.map((club) => (
            <div
              key={club.id}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300"
            >
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {club.nom}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {club.competiteurs?.length || 0} membres
                </p>
                
                {club.competiteurs && club.competiteurs.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Membres</h4>
                    <ul className="space-y-1">
                      {club.competiteurs.map((competiteur) => (
                        <li key={competiteur.id} className="text-sm text-gray-600">
                          {competiteur.prenom} {competiteur.nom}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {clubs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun club n'est enregistré pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ClubList