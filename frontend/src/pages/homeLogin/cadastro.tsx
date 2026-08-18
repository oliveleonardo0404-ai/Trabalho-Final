import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { setStoredUser } from '../../services/auth'
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

  // A ideia aqui é simples: o usuário digita números e a tela vai formatando automaticamente.
  // Isso deixa o campo mais bonito e evita que a pessoa erre na hora de preencher.
  const formatCpf = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11)

    if (digits.length <= 3) return digits
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`

    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
  }

  // A regra do telefone também foi deixada bem simples: só aceitaremos números.
  // Depois a máscara ajuda a deixar no formato mais natural, como (11) 99999-9999.
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

  // Aqui a regra é bem fácil de explicar: o CPF precisa ter 11 números e não pode ser uma sequência repetida.
  // Por exemplo: 111.111.111-11 é inválido, mas 123.456.789-09 pode passar.
  const isValidCpfValue = (value: string) => {
    const digits = value.replace(/\D/g, '')

    if (digits.length !== 11) {
      return false
    }

    if (/^(\d)\1+$/.test(digits)) {
      return false
    }

    return true
  }

  // Esta função funciona como uma "checagem final" antes de enviar o formulário.
  // Se faltar alguma informação ou se algum campo não estiver em um formato aceitável,
  // ela bloqueia o cadastro com uma mensagem simples para o usuário.
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

    // Primeiro, verificamos se o nome foi preenchido corretamente.
    // Se estiver vazio ou tiver menos de 3 letras, o cadastro é bloqueado.
    if (!nome || nome.length < 3) {
      throw new Error('Informe um nome completo válido.')
    }

    // Aqui checamos se o e-mail tem um formato simples e funcional.
    // O que importa é que exista um texto antes do @, um @ e um ponto depois dele.
    // Exemplo válido: nome@email.com
    const emailValido = email.includes('@') && email.includes('.') && !email.startsWith('@') && !email.endsWith('.')

    if (!emailValido) {
      throw new Error('Informe um e-mail válido.')
    }

    // O CPF precisa ter 11 números e não pode ser uma sequência repetida.
    // Isso evita cadastros inválidos e ajuda a manter os dados mais consistentes.
    if (!isValidCpfValue(cpf)) {
      throw new Error('Digite um CPF válido com 11 números.')
    }

    // O telefone também precisa ter DDD e número.
    // A função limpa tudo que não for número e então valida a quantidade mínima.
    if (!isValidPhoneValue(numero)) {
      throw new Error('Digite um telefone válido com DDD e número.')
    }

    // A data de nascimento precisa existir, porque sem ela não temos como confirmar a idade.
    if (!nascimento) {
      throw new Error('Selecione a data de nascimento.')
    }

    // Aqui transformamos a data em objeto Date para confirmar que ela é real e não está no futuro.
    const nascimentoDate = new Date(nascimento)
    if (Number.isNaN(nascimentoDate.getTime()) || nascimentoDate > new Date()) {
      throw new Error('A data de nascimento não pode ser vazia ou futura.')
    }

    // A senha precisa ter uma quantidade mínima de caracteres para oferecer mais segurança.
    // Com 6 caracteres já é um começo aceitável para o sistema de teste.
    if (senha.length < 6) {
      throw new Error('A senha precisa ter pelo menos 6 caracteres.')
    }
  }

  // Quando o usuário clica em "Criar Conta", este bloco prepara os dados e envia para a API.
  // Se a resposta vier ok, salva o usuário localmente e leva para a página de perfil.
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
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
        nascimento: form.nascimento ? new Date(form.nascimento).toISOString() : '',
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
              <input id="cadastro-nascimento" name="nascimento" type="date" value={form.nascimento} onChange={handleChange} required />
            </div>

            <div className="input-group">
              <label htmlFor="cadastro-senha">Senha</label>
              <input id="cadastro-senha" name="senha" type="password" value={form.senha} onChange={handleChange} placeholder="Mínimo de 6 caracteres" required />
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
