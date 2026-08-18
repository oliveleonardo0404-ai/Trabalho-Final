import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/navbar/navbar'
import { getStoredUser, type LoggedUser } from '../../services/auth'
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

function PerfilPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState<LoggedUser | null>(getStoredUser())
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(true)
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

  // Esta função busca todos os pets da API e filtra para mostrar só os do tutor atual.
  // Ou seja, o usuário só vê os animais vinculados ao seu cadastro, e não os pets de outras pessoas.
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

  // Quando a página abre, ela verifica se o usuário está logado.
  // Se estiver, carrega os dados dele e também os pets que pertencem a esse cliente.
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
            localStorage.setItem('petcare_user', JSON.stringify(serverUser))
          }
        }

        await loadPets(loggedUser)
      } catch {
        setUser(loggedUser)
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [navigate])

  const handlePetChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    setPetForm((prev) => ({ ...prev, [name]: value }))
  }

  // Este bloco serve para cadastrar um novo pet.
  // Primeiro ele valida os campos, depois envia os dados para a API com o ID do tutor logado.
  const handlePetSubmit = async (event: FormEvent<HTMLFormElement>) => {
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

    const data = new Date(dataNascimento)
    const hoje = new Date()
    if (Number.isNaN(data.getTime())) {
      setPetError('Informe uma data de nascimento válida.')
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
          data_nascimento: data.toISOString(),
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

          <div className="form-grid">
            <label className="field">
              <span>Nome Completo</span>
              <input type="text" value={user.nome || ''} readOnly />
            </label>

            <label className="field">
              <span>E-mail</span>
              <input type="email" value={user.email || ''} readOnly />
            </label>

            <label className="field">
              <span>CPF</span>
              <input type="text" value={user.cpf || ''} readOnly />
            </label>

            <label className="field">
              <span>Telefone / WhatsApp</span>
              <input type="tel" value={user.numero || ''} readOnly />
            </label>
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
              <span>Porta</span>
              <select name="porte" value={petForm.porte} onChange={handlePetChange} required>
                <option value="">Selecione</option>
                <option value="Pequeno">Pequeno</option>
                <option value="Médio">Médio</option>
                <option value="Grande">Grande</option>
              </select>
            </label>

            <label className="field">
              <span>Data de Nascimento</span>
              <input type="date" name="data_nascimento" value={petForm.data_nascimento} onChange={handlePetChange} required />
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

          {loading ? (
            <p>Carregando pets...</p>
          ) : pets.length > 0 ? (
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
          ) : (
            <p>Nenhum pet encontrado para este tutor.</p>
          )}
        </section>
      </main>
    </div>
  )
}

export default PerfilPage
