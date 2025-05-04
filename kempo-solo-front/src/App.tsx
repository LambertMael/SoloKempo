import { Routes, Route } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import PrivateRoute from './components/PrivateRoute'
import AdminRoute from './components/AdminRoute'
import GestionnaireRoute from './components/GestionnaireRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import AdminPanel from './pages/admin/AdminPanel'
import TournoiList from './pages/tournois/TournoiList'
import TournoiDetail from './pages/tournois/TournoiDetail'
import CompetiteurPanel from './pages/competiteur/CompetiteurPanel'
import GestionnairePanel from './pages/gestionnaire/GestionnairePanel'
import UserProfile from './pages/UserProfile'
import Erreur404 from './pages/Erreur404'
import ClubList from './pages/clubs/ClubList'
import ClubManagement from './pages/clubs/ClubManagement'
import axios from 'axios'
import Accueil from './pages/Accueil'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
axios.defaults.headers.post['Content-Type'] = 'application/json';
const App = () => {
  return (
    <>
      <Navbar />
      <div style={{ marginLeft: "200px", padding: "20px" }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/tournois" element={<TournoiList />} />
          <Route path="/clubs" element={<ClubList />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          
          {/* Protected Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/tournois/:id" element={<TournoiDetail />} />
          </Route>
          
          {/* Competitor Routes */}
          <Route path="/competiteur" element={<PrivateRoute role="competiteur" />}>
            <Route index element={<CompetiteurPanel />} />
          </Route>
          
          {/* Manager Routes */}
          <Route path="/gestionnaire" element={<GestionnaireRoute />}>
            <Route index element={<GestionnairePanel />} />
          </Route>
          
          {/* Club management routes (accessible by managers and admins) */}
          <Route path="/clubs/gestion" element={<PrivateRoute role={['admin', 'gestionnaire']} />}>
            <Route index element={<ClubManagement />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute />}>
            <Route index element={<AdminPanel />} />
          </Route>
          <Route path="/" element={<Accueil />} />
          <Route path="*" element={<Erreur404 />} />
        </Routes>
      </div>
    </>
  )
}

export default App
