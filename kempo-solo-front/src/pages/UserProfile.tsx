import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'

const UserProfile = () => {
  const { user, setUser } = useAuth()
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    ancien_mdp: '',
    nouveau_mdp: '',
    confirmation_mdp: ''
  })
  const [userFormData, setUserFormData] = useState({
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    email: user?.email || ''
  })
  const [isEditing, setIsEditing] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleUserDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserFormData({
      ...userFormData,
      [e.target.name]: e.target.value
    })
  }

  const handleUserDataSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')

    try {
      const response = await axios.put(`http://localhost:8000/api/utilisateurs/${user?.id}`, userFormData)
      setUser({ ...user, ...userFormData })
      setMessage('Informations personnelles mises à jour avec succès')
      setIsEditing(false)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Une erreur est survenue lors de la mise à jour')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')

    try {
      await axios.post(`http://localhost:8000/api/utilisateurs/${user?.id}/change-password`, formData)
      setMessage('Mot de passe modifié avec succès')
      setFormData({
        ancien_mdp: '',
        nouveau_mdp: '',
        confirmation_mdp: ''
      })
    } catch (err: any) {
      setError(err.response?.data?.message || 'Une erreur est survenue')
    }
  }

  if (!user) return null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Mon profil</h1>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <h2 className="text-lg leading-6 font-medium text-gray-900">
              Informations personnelles
            </h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-sm text-indigo-600 hover:text-indigo-900"
            >
              {isEditing ? 'Annuler' : 'Modifier'}
            </button>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            {isEditing ? (
              <form onSubmit={handleUserDataSubmit} className="space-y-4 p-6">
                {message && (
                  <div className="rounded-md bg-green-50 p-4">
                    <div className="text-sm text-green-700">{message}</div>
                  </div>
                )}
                {error && (
                  <div className="rounded-md bg-red-50 p-4">
                    <div className="text-sm text-red-700">{error}</div>
                  </div>
                )}
                
                <div>
                  <label htmlFor="nom" className="block text-sm font-medium text-gray-700">
                    Nom
                  </label>
                  <input
                    type="text"
                    name="nom"
                    id="nom"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={userFormData.nom}
                    onChange={handleUserDataChange}
                  />
                </div>

                <div>
                  <label htmlFor="prenom" className="block text-sm font-medium text-gray-700">
                    Prénom
                  </label>
                  <input
                    type="text"
                    name="prenom"
                    id="prenom"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={userFormData.prenom}
                    onChange={handleUserDataChange}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={userFormData.email}
                    onChange={handleUserDataChange}
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Sauvegarder les modifications
                  </button>
                </div>
              </form>
            ) : (
              <dl className="sm:divide-y sm:divide-gray-200">
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Nom</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {user.nom}
                  </dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Prénom</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {user.prenom}
                  </dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {user.email}
                  </dd>
                </div>
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Rôle</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </dd>
                </div>
              </dl>
            )}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Changer mon mot de passe
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            {message && (
              <div className="rounded-md bg-green-50 p-4">
                <div className="text-sm text-green-700">{message}</div>
              </div>
            )}
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <div>
              <label htmlFor="ancien_mdp" className="block text-sm font-medium text-gray-700">
                Mot de passe actuel
              </label>
              <input
                type="password"
                name="ancien_mdp"
                id="ancien_mdp"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.ancien_mdp}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="nouveau_mdp" className="block text-sm font-medium text-gray-700">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                name="nouveau_mdp"
                id="nouveau_mdp"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.nouveau_mdp}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="confirmation_mdp" className="block text-sm font-medium text-gray-700">
                Confirmer le nouveau mot de passe
              </label>
              <input
                type="password"
                name="confirmation_mdp"
                id="confirmation_mdp"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={formData.confirmation_mdp}
                onChange={handleChange}
              />
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Changer le mot de passe
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default UserProfile