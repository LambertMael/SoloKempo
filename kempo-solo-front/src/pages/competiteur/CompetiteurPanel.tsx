import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import axios from 'axios'

interface TournoiResultat {
  id: number
  nom: string
  date_debut: string
  date_fin: string
  categorie: string
  points: number
  fautes: number
  placement: number
  statut: string
}

const CompetiteurPanel = () => {
  const { user } = useAuth()
  const [resultats, setResultats] = useState<TournoiResultat[]>([])
  const [tournoiDisponibles, setTournoiDisponibles] = useState<Array<any>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  console.log(user)
  // Vérification de l'utilisateur
  console.log(tournoiDisponibles)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resultatsResponse, tournoiResponse] = await Promise.all([
          axios.get(`/api/competiteurs/${user?.id}/resultats`),
          axios.get('/api/tournois')
        ])
        console.log("redata",resultatsResponse.data.resultats)
        const fetchedResultats = resultatsResponse.data.resultats.map((resultat: any) => ({
          id: resultat.id,
          nom: resultat.tournoi,
          date_debut: resultat.date_debut,
          categorie: resultat.competiteur.categorie,
          points: resultat.score_competiteur,
          fautes: resultat.penalites_competiteur,
          placement: resultat.victoire === true ? 1 : resultat.victoire === false ? 2 : 0,
          statut: resultat.victoire === null ? resultat.status_tournoi : 'termine'
        }))
        
        setResultats(fetchedResultats)
        console.log("resultats",fetchedResultats)
        setTournoiDisponibles(tournoiResponse.data.filter((t: any) => t.status === 'a_venir' && t.competiteurs.some(competiteur => competiteur.id_utilisateur === user?.id)))
      } catch (err) {
        setError('Erreur lors du chargement des données')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchData()
    }
  }, [user])

  if (loading) return <div>Chargement...</div>
  if (error) return <div className="text-red-600">{error}</div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">
          Mon espace compétiteur
        </h1>

        {/* Tournois disponibles */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg leading-6 font-medium text-gray-900">
              Tournois à venir
            </h2>
          </div>
          
          {tournoiDisponibles.length > 0 ? (
            <div className="border-t border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tournoi
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dates
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lieu
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tournoiDisponibles.map((tournoi) => (
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <a
                          href={`/tournois/${tournoi.id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Détails
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Aucun tournoi disponible pour le moment.</p>
            </div>
          )}
        </div>

        {/* Historique des tournois */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg leading-6 font-medium text-gray-900">
              Historique des tournois
            </h2>
          </div>

          {resultats.length > 0 ? (
            <div className="border-t border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tournoi
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Catégorie
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Points
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fautes
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Placement
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {resultats.map((resultat) => (
                    <tr key={resultat.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {resultat.nom}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(resultat.date_debut).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {resultat.categorie}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {resultat.points}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {resultat.fautes}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {resultat.placement === 1 ? '1er' : resultat.placement === 2 ? '2ème' : 'En cours'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          resultat.statut === 'en_cours'
                            ? 'bg-green-100 text-green-800'
                            : resultat.statut === 'a_venir'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {resultat.statut === 'en_cours'
                            ? 'En cours'
                            : resultat.statut === 'a_venir'
                            ? 'À venir'
                            : 'Terminé'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Vous n'avez pas encore participé à des tournois.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CompetiteurPanel