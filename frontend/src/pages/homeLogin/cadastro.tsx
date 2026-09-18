import { useState, type SubmitEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { setStoredUser } from '../../services/auth'
import { dateInputToIso, formatDateInput, isValidCpf, parseDateInput } from '../../services/validation'
import './auth.css'

function CadastroPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    nome: '',
    email: '',
    cpf: '',
    numero: '',
    nascimento: '',
    senha: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false) 

  const formatCpf = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11)

    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`

    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
  }

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11)

    if (digits.length <= 2) return digits
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`

    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target

    if (name === 'cpf') {
      setForm((prev) => ({ ...prev, cpf: formatCpf(value) }))
      return
    }

    if (name === 'numero') {
      setForm((prev) => ({ ...prev, numero: formatPhone(value) }))
      return
    }

    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const isValidPhoneValue = (value: string) => {
    const digits = value.replace(/\D/g, '')

    return digits.length >= 10 && digits.length <= 11
  }

  const validateCadastro = () => {
    const nome = form.nome.trim()
    const email = form.email.trim()
    const cpf = form.cpf.trim()
    const numero = form.numero.trim()
    const nascimento = form.nascimento
    const senha = form.senha

    if (!nome || nome.length < 3) {
      throw new Error('Informe um nome completo válido.')
    }

    const emailValido = email.includes('@') && email.includes('.') && !email.startsWith('@') && !email.endsWith('.')

    if (!emailValido) {
      throw new Error('Informe um e-mail válido.')
    }

    if (!isValidCpf(cpf)) {
      throw new Error('Digite um CPF válido com 11 dígitos.')
    }

    if (!isValidPhoneValue(numero)) {
      throw new Error('Digite um telefone válido com DDD e número.')
    }

    if (!nascimento) {
      throw new Error('Selecione a data de nascimento.')
    }

    const nascimentoDate = parseDateInput(nascimento)
    if (!nascimentoDate || nascimentoDate > new Date()) {
      throw new Error('Informe uma data válida no formato DD/MM/AAAA e que não seja futura.')
    }

    if (!senha || senha.trim().length === 0) {
      throw new Error('Digite uma senha.')
    }
  }

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      validateCadastro()

      const payload = {
        nome: form.nome.trim(),
        email: form.email.trim(),
        cpf: form.cpf.trim(),
        numero: form.numero.trim(),
        senha: form.senha,
        nascimento: dateInputToIso(form.nascimento),
      }

      const response = await fetch('http://localhost:3001/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao criar conta')
      }

      const user = data.data
      if (!user) {
        throw new Error('Dados do usuário não retornados.')
      }

      setStoredUser(user)
      navigate('/perfil')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta')
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
          <Link to="/login" className="btn-login">
            Entrar
          </Link>
        </nav>
      </header>

      <main className="auth-container">
        <div className="auth-card">
          <h2>Crie sua Conta</h2>
          <p className="subtitle">Cadastre-se para agendar os melhores cuidados ao seu pet.</p>

          {error && <p className="form-error">{error}</p>}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="cadastro-nome">Nome Completo</label>
              <input id="cadastro-nome" name="nome" type="text" value={form.nome} onChange={handleChange} placeholder="Ex: Maria Silva" required />
            </div>

            <div className="input-group">
              <label htmlFor="cadastro-email">E-mail</label>
              <input id="cadastro-email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="seu@email.com" required />
            </div>

            <div className="input-group">
              <label htmlFor="cadastro-cpf">CPF</label>
              <input id="cadastro-cpf" name="cpf" type="text" value={form.cpf} onChange={handleChange} placeholder="000.000.000-00" maxLength={14} inputMode="numeric" required />
            </div>

            <div className="input-group">
              <label htmlFor="cadastro-telefone">Telefone / WhatsApp</label>
              <input id="cadastro-telefone" name="numero" type="text" value={form.numero} onChange={handleChange} placeholder="(00) 00000-0000" maxLength={15} inputMode="numeric" required />
            </div>

            <div className="input-group">
              <label htmlFor="cadastro-nascimento">Data de Nascimento</label>
              <input id="cadastro-nascimento" name="nascimento" type="text" inputMode="numeric" placeholder="DD/MM/AAAA" maxLength={10} value={form.nascimento} onChange={(event) => setForm((prev) => ({ ...prev, nascimento: formatDateInput(event.target.value) }))} required />
            </div>

            <div className="input-group">
              <label htmlFor="cadastro-senha">Senha</label>
              <input id="cadastro-senha" name="senha" type="password" value={form.senha} onChange={handleChange} placeholder="Digite uma senha" required />
            </div>

            <button type="submit" className="btn-primary btn-full" disabled={loading}>
              {loading ? 'Criando conta...' : 'Criar Conta e Continuar'}
            </button>
          </form>

          <p className="switch-page">
            Já possui uma conta? <Link to="/login">Fazer Login</Link>
          </p>
        </div>
      </main>
    </div>
  )
}

export default CadastroPage
