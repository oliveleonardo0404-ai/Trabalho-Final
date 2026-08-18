import { Link, useLocation, useNavigate } from 'react-router-dom'
import { clearStoredUser } from '../../services/auth'
import './navbar.css'

function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()

  const isHome = location.pathname === '/home'
  const isPerfil = location.pathname === '/perfil'
  const isAgendamentos = location.pathname === '/agendamentos'

  const handleLogout = () => {
    clearStoredUser()
    navigate('/login')
  }

  const handleGoHome = () => {
    const user = localStorage.getItem('petcare_user')
    if (user) {
      navigate('/home')
      return
    }

    navigate('/')
  }

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <span className="brand-mark">✦</span>
        <span>PetCare</span>
      </div>

      <nav className="navbar-actions">
        <button  type="button" onClick={handleGoHome} className={`navbar-button ${isHome ? 'active' : ''}`}>
          Início
        </button>
        <Link to="/agendamentos" className={`navbar-button ${isAgendamentos ? 'active' : ''}`}>
          Agendamentos
        </Link>
        <Link to="/perfil" className={`navbar-button accent ${isPerfil ? 'active' : ''}`}>
          Meu Perfil
        </Link>
        <button type="button" onClick={handleLogout} className="navbar-button logout-button">
          Sair
        </button>
      </nav>
    </header>
  )
}

export default Navbar
