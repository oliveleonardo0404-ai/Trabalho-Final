import { useEffect, useState, type SubmitEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/navbar/navbar'
import { clearStoredUser, getStoredUser, setStoredUser, type LoggedUser } from '../../services/auth'
import { dateInputToIso, formatDateInput, isValidCpf, parseDateInput } from '../../services/validation'
import './perfil.css'

type Pet = {
  _id: string
  nome: string
  raca: string
  porte: string
  data_nascimento?: string
  cliente?: string | { _id?: string }
}

type PetForm = {
  nome: string
  raca: string
  porte: string
  data_nascimento: string
  foto_url: string
}

type ProfileForm = {
  nome: string
  email: string
  cpf: string
  numero: string
  nascimento: string
}

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

const formatStoredBirthDate = (value?: string) => {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return `${String(date.getUTCDate()).padStart(2, '0')}/${String(date.getUTCMonth() + 1).padStart(2, '0')}/${date.getUTCFullYear()}`
}

function PerfilPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState<LoggedUser | null>(getStoredUser())
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(true)
  const [profileForm, setProfileForm] = useState<ProfileForm>({ nome: '', email: '', cpf: '', numero: '', nascimento: '' })
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')
  const [profileLoading, setProfileLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [petForm, setPetForm] = useState<PetForm>({
    nome: '',
    raca: '',
    porte: '',
    data_nascimento: '',
    foto_url: '',
  })
  const [petError, setPetError] = useState('')
  const [petSuccess, setPetSuccess] = useState('')
  const [petLoading, setPetLoading] = useState(false)

  const loadPets = async (loggedUser: LoggedUser) => {
    const userId = loggedUser._id || loggedUser.id
    if (!userId) return

    try {
      const petsResponse = await fetch('http://localhost:3001/api/pets')
      if (petsResponse.ok) {
        const allPets = await petsResponse.json()
        const userPets = allPets.filter((pet: Pet) => {
          const clienteId = typeof pet.cliente === 'string' ? pet.cliente : pet.cliente?._id
          return clienteId === userId
        })
        setPets(userPets)
      }
    } catch {
      setPets([])
    }
  }

  const updateProfileForm = (loggedUser: LoggedUser) => {
    setProfileForm({
      nome: loggedUser.nome || '',
      email: loggedUser.email || '',
      cpf: formatCpf(loggedUser.cpf || ''),
      numero: formatPhone(loggedUser.numero || ''),
      nascimento: formatStoredBirthDate(loggedUser.nascimento),
    })
  }

  useEffect(() => {
    const loggedUser = getStoredUser()

    if (!loggedUser) {
      navigate('/login')
      return
    }

    const loadUserData = async () => {
      try {
        const userId = loggedUser._id || loggedUser.id
        if (userId) {
          const response = await fetch(`http://localhost:3001/api/clientes/${userId}`)
          if (response.ok) {
            const serverUser = await response.json()
            setUser(serverUser)
            setStoredUser(serverUser)
            updateProfileForm(serverUser)
          }
        }

        updateProfileForm(loggedUser)
        await loadPets(loggedUser)
      } catch {
        setUser(loggedUser)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [navigate])

  const handleProfileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target

    if (name === 'cpf') {
      setProfileForm((prev) => ({ ...prev, cpf: formatCpf(value) }))
      return
    }

    if (name === 'numero') {
      setProfileForm((prev) => ({ ...prev, numero: formatPhone(value) }))
      return
    }

    if (name === 'nascimento') {
      setProfileForm((prev) => ({ ...prev, nascimento: formatDateInput(value) }))
      return
    }

    setProfileForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleProfileSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    setProfileError('')
    setProfileSuccess('')

    const loggedUser = getStoredUser()
    const userId = loggedUser?._id || loggedUser?.id
    const nome = profileForm.nome.trim()
    const email = profileForm.email.trim()
    const cpf = profileForm.cpf.trim()
    const numero = profileForm.numero.trim()
    const nascimento = profileForm.nascimento

    if (!userId) {
      navigate('/login')
      return
    }

    if (!nome || nome.length < 3) {
      setProfileError('Informe um nome completo válido.')
      return
    }

    if (!email.includes('@') || !email.includes('.')) {
      setProfileError('Informe um e-mail válido.')
      return
    }

    if (!isValidCpf(cpf)) {
      setProfileError('Digite um CPF válido com 11 dígitos.')
      return
    }

    if (numero.replace(/\D/g, '').length < 10) {
      setProfileError('Digite um telefone válido com DDD e número.')
      return
    }

    const birthDate = parseDateInput(nascimento)
    if (!birthDate || birthDate > new Date()) {
      setProfileError('Informe uma data de nascimento válida.')
      return
    }

    setProfileLoading(true)

    try {
      const response = await fetch(`http://localhost:3001/api/clientes/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, cpf, numero, nascimento: dateInputToIso(nascimento) }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao atualizar seus dados')
      }

      setUser(data)
      setStoredUser(data)
      updateProfileForm(data)
      setProfileSuccess('Dados atualizados com sucesso!')
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Erro ao atualizar seus dados')
    } finally {
      setProfileLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    const loggedUser = getStoredUser()
    const userId = loggedUser?._id || loggedUser?.id

    if (!userId) {
      navigate('/login')
      return
    }

    const confirmed = window.confirm('Tem certeza que deseja excluir sua conta? Essa ação não pode ser desfeita.')
    if (!confirmed) return

    setProfileError('')
    setDeleteLoading(true)

    try {
      const response = await fetch(`http://localhost:3001/api/clientes/${userId}`, { method: 'DELETE' })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao excluir sua conta')
      }

      clearStoredUser()
      navigate('/')
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Erro ao excluir sua conta')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handlePetChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target

    if (name === 'data_nascimento') {
      setPetForm((prev) => ({ ...prev, data_nascimento: formatDateInput(value) }))
      return
    }

    setPetForm((prev) => ({ ...prev, [name]: value }))
  }

  const handlePetSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPetError('')
    setPetSuccess('')

    const loggedUser = getStoredUser()
    if (!loggedUser) {
      navigate('/login')
      return
    }

    const nome = petForm.nome.trim()
    const raca = petForm.raca.trim()
    const porte = petForm.porte.trim()
    const dataNascimento = petForm.data_nascimento

    if (!nome || !raca || !porte || !dataNascimento) {
      setPetError('Preencha nome, raça, porte e data de nascimento do pet.')
      return
    }

    const data = parseDateInput(dataNascimento)
    const hoje = new Date()
    if (!data) {
      setPetError('Informe uma data válida no formato DD/MM/AAAA.')
      return
    }

    if (data > hoje) {
      setPetError('A data de nascimento não pode ser futura.')
      return
    }

    setPetLoading(true)

    try {
      const response = await fetch('http://localhost:3001/api/pets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome,
          raca,
          porte,
          data_nascimento: dateInputToIso(dataNascimento),
          foto_url: petForm.foto_url.trim(),
          cliente: loggedUser._id || loggedUser.id,
        }),
      })

      const dataResponse = await response.json()

      if (!response.ok) {
        throw new Error(dataResponse.message || 'Erro ao cadastrar pet')
      }

      setPetSuccess('Pet cadastrado com sucesso!')
      setPetForm({ nome: '', raca: '', porte: '', data_nascimento: '', foto_url: '' })
      await loadPets(loggedUser)
    } catch (err) {
      setPetError(err instanceof Error ? err.message : 'Erro ao cadastrar pet')
    } finally {
      setPetLoading(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="perfil-page">
      <Navbar />

      <main className="perfil-content">
        <h1>Área do Tutor</h1>
        <p className="subtitle">Gerencie seus dados e cadastre os membros do seu pet.</p>

        <section className="card perfil-card">
          <div className="card-title-wrap">
            <span className="card-icon">👤</span>
            <h2>Meus Dados Pessoais</h2>
          </div>

          {profileError && <p className="form-error">{profileError}</p>}
          {profileSuccess && <p className="form-success">{profileSuccess}</p>}

          <form className="form-grid" onSubmit={handleProfileSubmit}>
            <label className="field">
              <span>Nome Completo</span>
              <input type="text" name="nome" value={profileForm.nome} onChange={handleProfileChange} required />
            </label>

            <label className="field">
              <span>E-mail</span>
              <input type="email" name="email" value={profileForm.email} onChange={handleProfileChange} required />
            </label>

            <label className="field">
              <span>CPF</span>
              <input type="text" name="cpf" value={profileForm.cpf} onChange={handleProfileChange} maxLength={14} inputMode="numeric" required />
            </label>

            <label className="field">
              <span>Telefone / WhatsApp</span>
              <input type="tel" name="numero" value={profileForm.numero} onChange={handleProfileChange} maxLength={15} inputMode="numeric" required />
            </label>

            <label className="field">
              <span>Data de Nascimento</span>
              <input type="text" name="nascimento" value={profileForm.nascimento} onChange={handleProfileChange} placeholder="DD/MM/AAAA" maxLength={10} inputMode="numeric" required />
            </label>

            <div className="profile-submit-row">
              <button type="submit" className="save-button" disabled={profileLoading || deleteLoading}>
                {profileLoading ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </div>
          </form>

          <div className="account-danger-zone">
            <div>
              <strong>Excluir minha conta</strong>
              <p>Todos os seus dados de acesso serão removidos.</p>
            </div>
            <button type="button" className="delete-button" onClick={handleDeleteAccount} disabled={profileLoading || deleteLoading}>
              {deleteLoading ? 'Excluindo...' : 'Excluir conta'}
            </button>
          </div>
        </section>

        <section className="card pet-card">
          <div className="card-title-wrap">
            <span className="card-icon">🐾</span>
            <h2>Cadastrar Novo Pet</h2>
          </div>

          {petError && <p className="form-error">{petError}</p>}
          {petSuccess && <p className="form-success">{petSuccess}</p>}

          <form className="pet-form-grid" onSubmit={handlePetSubmit}>
            <label className="field">
              <span>Nome do Pet</span>
              <input type="text" name="nome" value={petForm.nome} onChange={handlePetChange} placeholder="Ex: Thor" required />
            </label>

            <label className="field">
              <span>Raça</span>
              <input type="text" name="raca" value={petForm.raca} onChange={handlePetChange} placeholder="Ex: Golden Retriever" required />
            </label>

            <label className="field">
              <span>Porte</span>
              <select name="porte" value={petForm.porte} onChange={handlePetChange} required>
                <option value="">Selecione</option>
                <option value="Pequeno">Pequeno</option>
                <option value="Médio">Médio</option>
                <option value="Grande">Grande</option>
              </select>
            </label>

            <label className="field">
              <span>Data de Nascimento</span>
              <input type="text" name="data_nascimento" inputMode="numeric" placeholder="DD/MM/AAAA" maxLength={10} value={petForm.data_nascimento} onChange={handlePetChange} required />
            </label>

            <label className="field full-width">
              <span>URL da Foto (opcional)</span>
              <input type="url" name="foto_url" value={petForm.foto_url} onChange={handlePetChange} placeholder="https://..." />
            </label>

            <div className="pet-submit-row">
              <button type="submit" className="save-button" disabled={petLoading}>
                {petLoading ? 'Salvando...' : 'Salvar Pet'}
              </button>
            </div>
          </form>
        </section>

        <section className="card pet-list-card">
          <div className="card-title-wrap">
            <span className="card-icon">🐾</span>
            <h2>Meus Pets Cadastrados</h2>
          </div>

          {loading && <p>Carregando pets...</p>}
          {!loading && pets.length > 0 && (
            <div className="pet-list">
              {pets.map((pet) => (
                <article key={pet._id} className="pet-item">
                  <div className="pet-avatar">🐶</div>
                  <div className="pet-info">
                    <strong>{pet.nome}</strong>
                    <span>
                      {pet.raca} · Porte {pet.porte}
                      {pet.data_nascimento ? ` · ${new Date(pet.data_nascimento).getFullYear()}` : ''}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
          {!loading && pets.length === 0 && <p>Nenhum pet encontrado para este tutor.</p>}
        </section>
      </main>
    </div>
  )
}

export default PerfilPage
