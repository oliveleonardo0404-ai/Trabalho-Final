import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../../components/navbar/navbar'
import { getStoredUser } from '../../services/auth'
import './agendamentos.css'

type Pet = {
  _id: string
  nome: string
  raca: string
  porte: string
  cliente?: string | { _id?: string }
}

type Servico = {
  _id: string
  nome: string
  descricao?: string
  preco_diaria: number
}

type AgendamentoForm = {
  pet: string
  servico: string
  data_entrada: string
  data_saida: string
}

function AgendamentoPage() {
  const navigate = useNavigate()
  const user = getStoredUser()
  const [pets, setPets] = useState<Pet[]>([])
  const [servicos, setServicos] = useState<Servico[]>([])
  const [form, setForm] = useState<AgendamentoForm>({
    pet: '',
    servico: '',
    data_entrada: '',
    data_saida: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  // Quando o usuário entra na página de agendamento, a aplicação checa se ele está logado.
  // Em seguida, busca os pets do tutor e os serviços disponíveis para montar o formulário.
  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    const loadData = async () => {
      try {
        const petsResponse = await fetch('http://localhost:3001/api/pets')
        const servicosResponse = await fetch('http://localhost:3001/api/servicos')

        if (petsResponse.ok) {
          const allPets = await petsResponse.json()
          const ownerPets = allPets.filter((pet: Pet) => {
            const clienteId = typeof pet.cliente === 'string' ? pet.cliente : pet.cliente?._id
            return clienteId === (user._id || user.id)
          })
          setPets(ownerPets)
        }

        if (servicosResponse.ok) {
          const servicesData = await servicosResponse.json()
          setServicos(servicesData)
        }
      } catch {
        setError('Não foi possível carregar pets e serviços no momento.')
      }
    }

    loadData()
  }, [navigate, user])

  const selectedService = useMemo(
    () => servicos.find((servico) => servico._id === form.servico),
    [form.servico, servicos],
  )

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  // Esse bloco é responsável por criar o agendamento final.
  // Ele valida as datas, pega o pet escolhido e o serviço selecionado e envia tudo para a API.
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!user) {
      navigate('/login')
      return
    }

    if (!form.pet || !form.servico || !form.data_entrada || !form.data_saida) {
      setError('Preencha todos os campos do agendamento.')
      return
    }

    const dataEntrada = new Date(form.data_entrada)
    const dataSaida = new Date(form.data_saida)

    if (dataSaida <= dataEntrada) {
      setError('A data de saída precisa ser posterior à data de entrada.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('http://localhost:3001/api/agendamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente: user._id || user.id,
          pet: form.pet,
          servico: form.servico,
          data_entrada: dataEntrada.toISOString(),
          data_saida: dataSaida.toISOString(),
          status: 'PENDENTE',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao criar agendamento')
      }

      setSuccess('Agendamento criado com sucesso!')
      setForm({ pet: '', servico: '', data_entrada: '', data_saida: '' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar agendamento')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="perfil-page">
      <Navbar />

      <main className="perfil-content agendamento-content">
        <h1>Agendar Serviço</h1>
        <p className="subtitle">Selecione sua data, pet e serviço desejado.</p>

        <section className="card perfil-card agendamento-card">
          <div className="card-title-wrap">
            <span className="card-icon">📅</span>
            <h2>Dados do Agendamento</h2>
          </div>

          {error && <p className="form-error">{error}</p>}
          {success && <p className="form-success">{success}</p>}

          <form onSubmit={handleSubmit} className="agendamento-form">
            <div className="field-group">
              <label className="field">
                <span>Pet do tutor</span>
                <select name="pet" value={form.pet} onChange={handleChange} required>
                  <option value="">Selecione o pet</option>
                  {pets.map((pet) => (
                    <option key={pet._id} value={pet._id}>
                      {pet.nome}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Tipo de Serviço</span>
                <select name="servico" value={form.servico} onChange={handleChange} required>
                  <option value="">Selecione o serviço</option>
                  {servicos.map((servico) => (
                    <option key={servico._id} value={servico._id}>
                      {servico.nome}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="field-group">
              <label className="field">
                <span>Data de entrada</span>
                <input type="date" name="data_entrada" value={form.data_entrada} onChange={handleChange} required />
              </label>

              <label className="field">
                <span>Data de saída</span>
                <input type="date" name="data_saida" value={form.data_saida} onChange={handleChange} required />
              </label>
            </div>

            <div className="summary-box">
              <h3>Resumo</h3>
              <p>
                <strong>Dono:</strong> {user?.nome || 'Tutor'}
              </p>
              <p>
                <strong>CPF:</strong> {user?.cpf || 'Não informado'}
              </p>
              <p>
                <strong>Serviço:</strong> {selectedService?.nome || 'Ainda não selecionado'}
              </p>
              <p>
                <strong>Valor:</strong>{' '}
                {selectedService ? `R$ ${selectedService.preco_diaria.toFixed(2)}` : 'A definir'}
              </p>
            </div>

            <div className="action-row">
              <button type="submit" className="save-button" disabled={loading}>
                {loading ? 'Enviando...' : 'Confirmar Agendamento'}
              </button>
              <Link to="/pagamento" className="secondary-link-button">
                Ir para pagamento
              </Link>
            </div>
          </form>
        </section>
      </main>
    </div>
  )
}

export default AgendamentoPage
