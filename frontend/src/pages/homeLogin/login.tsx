import { useState, type SubmitEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { setStoredUser, loginAsAdmin, isValidAdminCode } from '../../services/auth'
import './auth.css'

function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [adminCode, setAdminCode] = useState('')
  const [adminError, setAdminError] = useState('')

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
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

  const handleAdminLogin = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    setAdminError('')

    const code = adminCode.trim()

    if (!code) {
      setAdminError('Digite o código de administrador.')
      return
    }

    if (isValidAdminCode(code)) {
      loginAsAdmin()
      navigate('/admin')
    } else {
      setAdminError('Código de administrador incorreto.')
      setAdminCode('')
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
          {!showAdminLogin ? (
            <>
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
                    <button type="button" className="forgot-password">
                      Esqueceu a senha?
                    </button>
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

              <hr style={{ margin: '20px 0', opacity: 0.3 }} />

              <button
                type="button"
                onClick={() => setShowAdminLogin(true)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '10px',
                  background: '#6c5ce7',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                }}
              >
                🔑 Acessar como Administrador
              </button>
            </>
          ) : (
            <>
              <h2>Acesso de Administrador</h2>
              <p className="subtitle">Digite o código de administrador para continuar.</p>

              {adminError && <p className="form-error">{adminError}</p>}

              <form onSubmit={handleAdminLogin}>
                <div className="input-group">
                  <label htmlFor="admin-code">Código de Administrador</label>
                  <input
                    id="admin-code"
                    type="password"
                    value={adminCode}
                    onChange={(event) => setAdminCode(event.target.value)}
                    placeholder="••••"
                    required
                  />
                </div>

                <button type="submit" className="btn-primary btn-full">
                  Entrar como ADM
                </button>
              </form>

              <button
                type="button"
                onClick={() => {
                  setShowAdminLogin(false)
                  setAdminCode('')
                  setAdminError('')
                }}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginTop: '10px',
                  background: '#95a5a6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                Voltar para Login Normal
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default LoginPage
