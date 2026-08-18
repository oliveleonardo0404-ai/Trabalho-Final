import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { setStoredUser } from '../../services/auth'
import './auth.css'

function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Este bloco é o coração do login:
  // 1. pega e-mail e senha
  // 2. envia para a API
  // 3. verifica se a resposta foi aceita
  // 4. salva o usuário e direciona para a página principal
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    const cleanEmail = email.trim()
    const cleanSenha = senha.trim()

    if (!cleanEmail || !cleanSenha) {
      setError('Informe e-mail e senha para continuar.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('http://localhost:3001/api/clientes/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, senha: cleanSenha }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao fazer login')
      }

      const user = data.data
      if (!user) {
        throw new Error('Dados do usuário não retornados.')
      }

      setStoredUser(user)
      navigate('/home')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <header className="auth-header-bar">
        <Link to="/" className="auth-logo">
          🐾 PetCare
        </Link>
        <nav className="auth-nav">
          <Link to="/">Início</Link>
          <Link to="/cadastro" className="btn-register">
            Criar Conta
          </Link>
        </nav>
      </header>

      <main className="auth-container">
        <div className="auth-card">
          <h2>Acessar sua Conta</h2>
          <p className="subtitle">Bem-vindo de volta! Digite suas credenciais.</p>

          {error && <p className="form-error">{error}</p>}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="login-email">E-mail</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="seu@email.com"
                required
              />
            </div>

            <div className="input-group">
              <div className="label-row">
                <label htmlFor="login-password">Senha</label>
                <a href="#" className="forgot-password">
                  Esqueceu a senha?
                </a>
              </div>
              <input
                id="login-password"
                type="password"
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" className="btn-primary btn-full" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar na Conta'}
            </button>
          </form>

          <p className="switch-page">
            Ainda não tem conta? <Link to="/cadastro">Cadastre-se aqui</Link>
          </p>
        </div>
      </main>
    </div>
  )
}

export default LoginPage
