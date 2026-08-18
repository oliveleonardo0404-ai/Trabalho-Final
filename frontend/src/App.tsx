import './App.css'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './pages/home/home'
import HomePublicPage from './pages/homePublic/homePublic'
import PerfilPage from './pages/perfil/perfil'
import LoginPage from './pages/homeLogin/login'
import CadastroPage from './pages/homeLogin/cadastro'
import AgendamentoPage from './pages/agendamentos/agendamentos'
import PagamentoPage from './pages/pagamentos/pagamento'
import { getStoredUser } from './services/auth'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = getStoredUser()
  return user ? <>{children}</> : <Navigate to="/login" replace />
}

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const user = getStoredUser()
  return !user ? <>{children}</> : <Navigate to="/home" replace />
}

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Routes>
          <Route path="/" element={<PublicOnlyRoute><HomePublicPage /></PublicOnlyRoute>} />
          <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/perfil" element={<ProtectedRoute><PerfilPage /></ProtectedRoute>} />
          <Route path="/agendamentos" element={<ProtectedRoute><AgendamentoPage /></ProtectedRoute>} />
          <Route path="/pagamento" element={<ProtectedRoute><PagamentoPage /></ProtectedRoute>} />
          <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
          <Route path="/cadastro" element={<PublicOnlyRoute><CadastroPage /></PublicOnlyRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
