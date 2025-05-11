import { use, useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import axios from 'axios'

const UserProfile = () => {
  const { user, setUser } = useAuth()
  console.log("utilisateur",user)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const [clubs, setClubs] = useState<Club[]>([])
  const [clubId, setClubId] = useState(0)

  useEffect(() => {
    const fetchClubs = async () => { const response = await axios.get('/api/clubs')
      setClubs(response.data)
    }
    fetchClubs()}, [])
  console.log("clubs",clubs)

  const [pays, setPays] = useState<Pays[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);

  useEffect(() => {
    axios.get('/api/pays').then(response => setPays(response.data));
    axios.get('/api/grade').then(response => setGrades(response.data));
  }, []);

  useEffect(() => {
    const fetchAllClubsGestionnaires = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/clubs-gestionnaires")
        const allClubs = response.data
  
        // Trouver le club auquel appartient le user actuel
        const monClub = allClubs.find((club: any) =>
          club.gestionnaires.some((g: any) => g.id === user.id)
        )
        console.log("monClub", monClub)
        if (monClub) {
          setClubId(monClub.id)
        } else {
          setError("Aucun club trouvé pour cet utilisateur")
        }
      } catch (error) {
        setError("Erreur lors du chargement des clubs")
      }
    }
  
    if (user?.role === 'gestionnaire') {
      fetchAllClubsGestionnaires()
    }
  }, [user])


  const [formData, setFormData] = useState({
    ancien_mdp: '',
    nouveau_mdp: '',
    confirmation_mdp: ''
  })
  const [userFormData, setUserFormData] = useState({
    nom: user?.nom || '',
    prenom: user?.prenom || '',
    email: user?.email || '',
    club_id: clubId !== 0 ? clubId : user?.competiteur?.club?.id || 0,
    poids: user?.competiteur?.poids || 0,
    pays_id: user?.competiteur?.id_pays || 0,
    grade_id: user?.competiteur?.id_grade || 0,
    date_naissance: user?.competiteur?.date_naissance.split("T")[0] || '',
    sexe: user?.competiteur?.sexe || '',
  })

  
  const [isEditing, setIsEditing] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  useEffect(() => {
    if (clubId !== 0) {
      setUserFormData(prev => ({
        ...prev,
        club_id: clubId
      }))
    }
  }, [clubId])
  

  
  
  
  const handleUserDataChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setUserFormData({
      ...userFormData,
      [e.target.name]: e.target.value
    });
  };
  

  const handleUserDataSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')

    try {
      console.log("userFormData",userFormData)
      const response = await axios.put(`http://localhost:8000/api/utilisateurs/${user?.id}`, userFormData)
      console.log("response",response.data)
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


  // Ajout dans les states :
const [competiteurFormData, setCompetiteurFormData] = useState({
  poids: user?.competiteur?.poids || '',
  pays: user?.competiteur?.id_pays || '',
  grade: user?.competiteur?.id_grade || '',
  club_id: user?.competiteur?.club?.id || '',
})

const handleCompetiteurChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
) => {
  setCompetiteurFormData({
    ...competiteurFormData,
    [e.target.name]: e.target.value
  })
}

const handleCompetiteurDataSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setError('')
  setMessage('')
  try {
    const response = await axios.put(`http://localhost:8000/api/competiteurs/${user?.competiteur?.id}`, competiteurFormData)
    const updatedUser = {
      ...user,
      competiteur: {
        ...user.competiteur,
        ...competiteurFormData,
        club: clubs.find(c => c.id == competiteurFormData.club_id) || null
      }
    }
    setUser(updatedUser)
    setMessage('Informations compétiteur mises à jour avec succès')
    setIsEditing(false)
  } catch (err: any) {
    setError(err.response?.data?.message || 'Erreur lors de la mise à jour compétiteur')
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
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
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
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
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
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                    value={userFormData.email}
                    onChange={handleUserDataChange}
                  />
                </div>

                {user.role === 'competiteur' && (
                  <div>
                    <label htmlFor="club" className="block text-sm font-medium text-gray-700">
                      Club
                    </label>
                    <select
                      name="club_id"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                      value={userFormData.club_id || ""}
                      onChange={handleUserDataChange}
                    >
                      <option value="" disabled>Choisir un club</option>
                      {clubs.map(club => (
                        <option key={club.id} value={club.id}>
                          {club.nom}
                        </option>
                      ))}
                    </select>
                  </div>
                )}


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
                {user.role === 'competiteur' && (<div v-if="user.club_id!=''" className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Club</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {user.competiteur?.club?.nom || 'Aucun club associé'}
                  </dd>
                </div>)}
                {user.role === 'gestionnaire' && (<div v-if="user.club_id!=''" className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Club</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {clubs?.find(e => e.id == clubId)?.nom || 'Aucun club associé'}
                  </dd>
                </div>)}

                
                <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Rôle</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </dd>
                </div>
              </dl>


            )}

{user.role === 'competiteur' && (
  <div className="bg-white shadow overflow-hidden sm:rounded-lg mt-8">
    <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
      <h2 className="text-lg leading-6 font-medium text-gray-900">Informations du compétiteur</h2>
    </div>
    <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
      {isEditing ? (
        <form onSubmit={handleUserDataSubmit} className="space-y-4 p-6">
          {/* Club */}
          <div>
            <label htmlFor="club_id" className="block text-sm font-medium text-gray-700">
              Club
            </label>
            <select
              name="club_id"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
              value={userFormData.club_id}
              onChange={handleUserDataChange}
            >
              <option value="" disabled>Choisir un club</option>
              {clubs.map(club => (
                <option key={club.id} value={club.id}>{club.nom}</option>
              ))}
            </select>
          </div>

          {/* Poids */}
          <div>
            <label htmlFor="poids" className="block text-sm font-medium text-gray-700">
              Poids
            </label>
            <input
              type="number"
              name="poids"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900"
              value={userFormData.poids || ''}
              onChange={handleUserDataChange}
            />
          </div>

          {/* Pays */}
          <div>
            <label htmlFor="pays_id" className="block text-sm font-medium text-gray-700">
              Pays
            </label>
            <select
              name="pays_id"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900"
              value={userFormData.pays_id}
              onChange={handleUserDataChange}
            >
              <option value="" disabled>Choisir un pays</option>
              {pays.map(p => (
                <option key={p.id} value={p.id}>{p.nom}</option>
              ))}
            </select>
          </div>

          {/* Grade */}
          <div>
            <label htmlFor="grade_id" className="block text-sm font-medium text-gray-700">
              Grade
            </label>
            <select
              name="grade_id"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900"
              value={userFormData.grade_id}
              onChange={handleUserDataChange}
            >
              <option value="" disabled>Choisir un grade</option>
              {grades.map(g => (
                <option key={g.id} value={g.id}>{g.nom}</option>
              ))}
            </select>
          </div>



          <div>
            <label htmlFor="date_naissance" className="block text-sm font-medium text-gray-700">
              Date de naissance
            </label>
            <input
              type="date"
              name="date_naissance"
              id="date_naissance"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm text-gray-900"
              value={userFormData.date_naissance}
              onChange={handleUserDataChange}
            />
          </div>

    <div>
      <label htmlFor="sexe" className="block text-sm font-medium text-gray-700">
        Sexe
      </label>
      <select
        name="sexe"
        id="sexe"
        required
        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm text-gray-900"
        value={userFormData.sexe}
        onChange={handleUserDataChange}
      >
        <option value="">Sélectionner</option>
        <option value="H">Homme</option>
        <option value="F">Femme</option>
        <option value="M">Autre</option>
      </select>
    </div>




        </form>
      ) : (
        <dl className="sm:divide-y sm:divide-gray-200 px-6 py-4">
          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-gray-500">Club</dt>
            <dd className="text-sm text-gray-900">
              {user.competiteur?.club?.nom || 'Aucun club'}
            </dd>
          </div>
          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-gray-500">Poids</dt>
            <dd className="text-sm text-gray-900">
              {user.competiteur?.poids ?? 'Non renseigné'}
            </dd>
          </div>
          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-gray-500">Pays</dt>
            <dd className="text-sm text-gray-900">
            {pays.find(el => el.id == user?.competiteur?.id_pays)?.nom || 'Non renseigné'}
            </dd>
          </div>
          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-gray-500">Grade</dt>
            <dd className="text-sm text-gray-900 ">
              {grades.find(el => el.id == user?.competiteur?.id_grade)?.nom || 'Non renseigné'}
            </dd>
          </div>
          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-gray-500">Sexe</dt>
            <dd className="text-sm text-gray-900 ">
              {user?.competiteur?.sexe || 'Non renseigné'}
            </dd>
          </div>
          <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-gray-500">Date de naissance</dt>
            <dd className="text-sm text-gray-900 ">
              {user?.competiteur?.date_naissance.toString().substring(0,10) || 'Non renseigné'}
            </dd>
          </div>
        </dl>
      )}
    </div>
  </div>
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