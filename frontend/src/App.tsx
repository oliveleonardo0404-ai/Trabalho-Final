import './App.css'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './pages/home/home'
import HomePublicPage from './pages/homePublic/homePublic'
import PerfilPage from './pages/perfil/perfil'
import LoginPage from './pages/homeLogin/login'
import CadastroPage from './pages/homeLogin/cadastro'
import AgendamentoPage from './pages/agendamentos/agendamentos'
import PagamentoPage from './pages/pagamentos/pagamento'


function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Routes>
          <Route path="/" element={<HomePublicPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/perfil" element={<PerfilPage />} />
          <Route path="/agendamentos" element={<AgendamentoPage />} />
          <Route path="/pagamento" element={<PagamentoPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cadastro" element={<CadastroPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
