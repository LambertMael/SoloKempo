import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../../contexts/AuthContext'

interface Club {
  id: number
  nom: string
  competiteurs: Array<{
    id: number
    nom: string
    prenom: string
  }>
  gestionnaires: Array<{
    id: number
    nom: string
    prenom: string
    email: string
  }>
}

interface Manager {
  id: number
  nom: string
  prenom: string
  email: string
  role: string
}

const ClubManagement = () => {
  const [clubs, setClubs] = useState<Club[]>([])
  const [managers, setManagers] = useState<Manager[]>([])
  const [selectedClub, setSelectedClub] = useState<Club | null>(null)
  const [newClubName, setNewClubName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [clubsResponse, managersResponse] = await Promise.all([
        axios.get('/api/clubs'),
        user?.role === 'admin' ? axios.get('/api/utilisateurs?role=gestionnaire') : null
      ])

      setClubs(clubsResponse.data)
      if (managersResponse) {
        setManagers(managersResponse.data.filter((u: Manager) => u.role === 'gestionnaire'))
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateClub = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await axios.post('/api/clubs', { nom: newClubName })
      setClubs([...clubs, response.data])
      setNewClubName('')
      setMessage('Club créé avec succès')
      setError('')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création du club')
    }
  }

  const handleUpdateClub = async (clubId: number, newName: string) => {
    try {
      const response = await axios.put(`/api/clubs/${clubId}`, { nom: newName })
      setClubs(clubs.map(club => club.id === clubId ? response.data : club))
      setMessage('Club mis à jour avec succès')
      setError('')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour du club')
    }
  }

  const handleDeleteClub = async (clubId: number) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce club ?')) return

    try {
      await axios.delete(`/api/clubs/${clubId}`)
      setClubs(clubs.filter(club => club.id !== clubId))
      setMessage('Club supprimé avec succès')
      setError('')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression du club')
    }
  }

  const handleAssignManager = async (clubId: number, managerId: number) => {
    try {
      await axios.post(`/api/gestionnaires/${managerId}/clubs/${clubId}`)
      await fetchData() // Recharger les données pour mettre à jour la liste
      setMessage('Gestionnaire assigné avec succès')
      setError('')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de l\'assignation du gestionnaire')
    }
  }

  const handleRemoveManager = async (clubId: number, managerId: number) => {
    try {
      await axios.delete(`/api/gestionnaires/${managerId}/clubs/${clubId}`)
      await fetchData() // Recharger les données pour mettre à jour la liste
      setMessage('Gestionnaire retiré avec succès')
      setError('')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors du retrait du gestionnaire')
    }
  }

  if (loading) return <div>Chargement...</div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">
          Gestion des clubs
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

        {/* Création de club (Admin uniquement) */}
        {user?.role === 'admin' && (
          <div className="bg-white shadow sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Créer un nouveau club</h2>
              <form onSubmit={handleCreateClub} className="flex gap-4">
                <input
                  type="text"
                  required
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Nom du club"
                  value={newClubName}
                  onChange={(e) => setNewClubName(e.target.value)}
                />
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Créer
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Liste des clubs */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {clubs.map((club) => (
              <li key={club.id}>
                <div className="px-4 py-5 sm:px-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">{club.nom}</h3>
                    {user?.role === 'admin' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const newName = window.prompt('Nouveau nom du club:', club.nom)
                            if (newName) handleUpdateClub(club.id, newName)
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDeleteClub(club.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Supprimer
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Gestionnaires du club */}
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-500">Gestionnaires</h4>
                    <div className="mt-2 space-y-2">
                      {club.gestionnaires?.map((gestionnaire) => (
                        <div key={gestionnaire.id} className="flex items-center justify-between text-sm">
                          <span>{gestionnaire.prenom} {gestionnaire.nom} ({gestionnaire.email})</span>
                          {user?.role === 'admin' && (
                            <button
                              onClick={() => handleRemoveManager(club.id, gestionnaire.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Retirer
                            </button>
                          )}
                        </div>
                      ))}

                      {user?.role === 'admin' && managers.length > 0 && (
                        <div className="mt-2">
                          <select
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                            onChange={(e) => {
                              const managerId = parseInt(e.target.value)
                              if (managerId) handleAssignManager(club.id, managerId)
                              e.target.value = '' // Reset select
                            }}
                            defaultValue=""
                          >
                            <option value="">Ajouter un gestionnaire...</option>
                            {managers
                              .filter(m => !club.gestionnaires?.some(g => g.id === m.id))
                              .map(manager => (
                                <option key={manager.id} value={manager.id}>
                                  {manager.prenom} {manager.nom} ({manager.email})
                                </option>
                              ))
                            }
                          </select>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Membres du club */}
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-500">
                      Membres ({club.competiteurs?.length || 0})
                    </h4>
                    <div className="mt-2 space-y-2">
                      {club.competiteurs?.map((competiteur) => (
                        <div key={competiteur.id} className="text-sm text-gray-600">
                          {competiteur.prenom} {competiteur.nom}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ClubManagement