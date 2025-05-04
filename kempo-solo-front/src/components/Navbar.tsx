import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <nav className="sidebar bg-gray-800 text-white h-screen w-64 fixed top-0 left-0 shadow-lg">
      <div className="p-4">
        <h1 className="text-l font-bold mb-8">Kempo Master</h1>
        
        {/* Public Links */}
        <ul className="space-y-2">
          <li>
            <Link to="/tournois" className="block py-2 px-4 hover:bg-gray-700 rounded">
              Tournois
            </Link>
          </li>
          <li>
            <Link to="/clubs" className="block py-2 px-4 hover:bg-gray-700 rounded">
              Clubs
            </Link>
          </li>
        </ul>

        {user ? (
          <>
            {/* Authenticated User Links */}
            <ul className="space-y-2 mt-4">
              <li>
                <Link to="/dashboard" className="block py-2 px-4 hover:bg-gray-700 rounded">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/profile" className="block py-2 px-4 hover:bg-gray-700 rounded">
                  Mon Profil
                </Link>
              </li>

              {/* Role-specific Links */}
              {user.role === 'competiteur' && (
                <li>
                  <Link to="/competiteur" className="block py-2 px-4 hover:bg-gray-700 rounded">
                    Espace Compétiteur
                  </Link>
                </li>
              )}

              {(user.role === 'gestionnaire' || user.role === 'admin') && (
                <li>
                  <Link to="/clubs/gestion" className="block py-2 px-4 hover:bg-gray-700 rounded">
                    Gestion des Clubs
                  </Link>
                </li>
              )}

              {user.role === 'gestionnaire' && (
                <li>
                  <Link to="/gestionnaire" className="block py-2 px-4 hover:bg-gray-700 rounded">
                    Gestion Tournois
                  </Link>
                </li>
              )}

              {user.role === 'admin' && (
                <li>
                  <Link to="/admin" className="block py-2 px-4 hover:bg-gray-700 rounded">
                    Administration
                  </Link>
                </li>
              )}
            </ul>

            {/* Logout Button */}
            <div className="mt-8">
              <button
                onClick={handleLogout}
                className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 rounded text-white"
              >
                Déconnexion
              </button>
            </div>
          </>
        ) : (
          /* Login/Register Links */
          <ul className="space-y-2 mt-4">
            <li>
              <Link to="/login" className="block py-2 px-4 hover:bg-gray-700 rounded">
                Se connecter
              </Link>
            </li>
            <li>
              <Link to="/register" className="block py-2 px-4 hover:bg-gray-700 rounded">
                S'inscrire
              </Link>
            </li>
          </ul>
        )}
      </div>
    </nav>
  )
}

export default Navbar
