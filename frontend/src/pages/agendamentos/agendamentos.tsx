import { useEffect, useMemo, useState, type SubmitEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../../components/navbar/navbar'
import { getStoredUser } from '../../services/auth'
import { dateInputToIso, formatDateInput, parseDateInput } from '../../services/validation'
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

type Agendamento = {
  _id: string
  cliente?: string | { _id?: string }
  pet?: string | { _id?: string; nome?: string }
  servico?: string | { _id?: string; nome?: string; preco_diaria?: number }
  data_entrada: string
  data_saida: string
  status?: string
}

type Avaliacao = {
  _id: string
  agendamento: string | { _id?: string }
  estrelas: number
  comentario?: string
}

const API_URL = 'http://localhost:3001/api'

const getRelatedId = (value?: string | { _id?: string }) => (
  typeof value === 'string' ? value : value?._id
)

const validateBookingForm = (form: AgendamentoForm) => {
  if (!form.pet || !form.servico || !form.data_entrada || !form.data_saida) {
    return 'Preencha todos os campos do agendamento.'
  }

  const dataEntrada = parseDateInput(form.data_entrada)
  const dataSaida = parseDateInput(form.data_saida)

  if (!dataEntrada || !dataSaida) {
    return 'Informe as datas válidas no formato DD/MM/AAAA.'
  }

  if (dataSaida <= dataEntrada) { 
    return 'A data de saída precisa ser posterior à data de entrada.'
  }

  return ''
}

function AgendamentoPage() {
  const navigate = useNavigate()
  const user = getStoredUser()
  const [pets, setPets] = useState<Pet[]>([])
  const [servicos, setServicos] = useState<Servico[]>([])
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([])
  const [avaliacaoForm, setAvaliacaoForm] = useState({ estrelas: '5', comentario: '' })
  const [avaliandoId, setAvaliandoId] = useState<string | null>(null)
  const [form, setForm] = useState<AgendamentoForm>({
    pet: '',
    servico: '',
    data_entrada: '',
    data_saida: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    const loadData = async () => {
      try {
        const petsResponse = await fetch(`${API_URL}/pets`)
        const servicosResponse = await fetch(`${API_URL}/servicos`)
        const agendamentosResponse = await fetch(`${API_URL}/agendamentos`)
        const avaliacoesResponse = await fetch(`${API_URL}/avaliacoes`)

        if (petsResponse.ok) {
          const allPets = await petsResponse.json()
          const ownerPets = allPets.filter((pet: Pet) => {
            const clienteId = getRelatedId(pet.cliente)
            return clienteId === (user._id || user.id)
          })
          setPets(ownerPets)
        }

        if (servicosResponse.ok) {
          const servicesData = await servicosResponse.json()
          setServicos(servicesData)
        }

        if (agendamentosResponse.ok) {
          const allAgendamentos: Agendamento[] = await agendamentosResponse.json()
          const ownerAgendamentos = allAgendamentos.filter((agendamento) => {
            const cliente = agendamento.cliente
            const clienteId = getRelatedId(cliente)
            return clienteId === (user._id || user.id)
          })
          setAgendamentos(ownerAgendamentos)
        }

        if (avaliacoesResponse.ok) {
          setAvaliacoes(await avaliacoesResponse.json())
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

    if (name === 'data_entrada' || name === 'data_saida') {
      setForm((prev) => ({ ...prev, [name]: formatDateInput(value) }))
      return
    }

    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!user) {
      navigate('/login')
      return
    }

    const validationError = validateBookingForm(form)
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    const isEditing = Boolean(editingId)
    const endpoint = isEditing ? `${API_URL}/agendamentos/${editingId}` : `${API_URL}/agendamentos`
    const method = isEditing ? 'PUT' : 'POST'
    const fallbackError = isEditing ? 'Erro ao editar agendamento' : 'Erro ao criar agendamento'
    const successMessage = isEditing ? 'Agendamento atualizado com sucesso!' : 'Agendamento criado com sucesso!'

    try {
      const requestBody = {
        pet: form.pet,
        servico: form.servico,
        data_entrada: dateInputToIso(form.data_entrada),
        data_saida: dateInputToIso(form.data_saida),
        ...(isEditing ? {} : { cliente: user._id || user.id, status: 'PENDENTE' }),
      }
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao criar agendamento')
      }

      setForm({ pet: '', servico: '', data_entrada: '', data_saida: '' })
      setEditingId(null)
      setSuccess(successMessage)
      const refreshedResponse = await fetch(`${API_URL}/agendamentos`)
      if (refreshedResponse.ok) {
        const allAgendamentos: Agendamento[] = await refreshedResponse.json()
        setAgendamentos(allAgendamentos.filter((agendamento) => {
          const cliente = agendamento.cliente
          const clienteId = getRelatedId(cliente)
          return clienteId === (user._id || user.id)
        }))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : fallbackError)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (agendamento: Agendamento) => {
    const petId = typeof agendamento.pet === 'string' ? agendamento.pet : agendamento.pet?._id
    const servicoId = typeof agendamento.servico === 'string' ? agendamento.servico : agendamento.servico?._id

    if (!petId || !servicoId) {
      setError('Não foi possível identificar o pet ou serviço deste agendamento.')
      return
    }

    setEditingId(agendamento._id)
    setForm({
      pet: petId,
      servico: servicoId,
      data_entrada: formatDateInput(agendamento.data_entrada.slice(0, 10).split('-').reverse().join('/')),
      data_saida: formatDateInput(agendamento.data_saida.slice(0, 10).split('-').reverse().join('/')),
    })
    setError('')
    setSuccess('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm({ pet: '', servico: '', data_entrada: '', data_saida: '' })
    setError('')
    setSuccess('')
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Deseja apagar este agendamento? Essa ação não pode ser desfeita.')) return

    setError('')
    setSuccess('')
    try {
      const response = await fetch(`${API_URL}/agendamentos/${id}`, {
        method: 'DELETE',
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Não foi possível apagar o agendamento.')
      setAgendamentos((current) => current.filter((item) => item._id !== id))
      setSuccess('Agendamento apagado.')
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Erro ao apagar agendamento.')
    }
  }

  const getAvaliacaoId = (avaliacao: Avaliacao) => (
    typeof avaliacao.agendamento === 'string' ? avaliacao.agendamento : avaliacao.agendamento?._id
  )

  const getAvaliacao = (agendamentoId: string) => avaliacoes.find(
    (avaliacao) => getAvaliacaoId(avaliacao) === agendamentoId,
  )

  const handleAvaliacaoChange = (event: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    setAvaliacaoForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleAvaliacaoSubmit = async (event: SubmitEvent<HTMLFormElement>, agendamentoId: string) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    setAvaliandoId(agendamentoId)

    try {
      const response = await fetch(`${API_URL}/avaliacoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente: user?._id || user?.id,
          agendamento: agendamentoId,
          estrelas: Number(avaliacaoForm.estrelas),
          comentario: avaliacaoForm.comentario.trim(),
        }),
      })
      const data = await response.json()

      if (!response.ok) throw new Error(data.message || 'Não foi possível registrar a avaliação.')

      setAvaliacoes((current) => [...current, data.data])
      setAvaliacaoForm({ estrelas: '5', comentario: '' })
      setSuccess('Avaliação registrada com sucesso!')
    } catch (evaluationError) {
      setError(evaluationError instanceof Error ? evaluationError.message : 'Erro ao registrar avaliação.')
    } finally {
      setAvaliandoId(null)
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
            <h2>{editingId ? 'Editar Agendamento' : 'Dados do Agendamento'}</h2>
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
                <input type="text" name="data_entrada" inputMode="numeric" placeholder="DD/MM/AAAA" maxLength={10} value={form.data_entrada} onChange={handleChange} required />
              </label>

              <label className="field">
                <span>Data de saída</span>
                <input type="text" name="data_saida" inputMode="numeric" placeholder="DD/MM/AAAA" maxLength={10} value={form.data_saida} onChange={handleChange} required />
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
                {loading && 'Enviando...'}
                {!loading && editingId && 'Salvar alterações'}
                {!loading && !editingId && 'Confirmar Agendamento'}
              </button>
              {editingId && <button type="button" className="secondary-link-button" onClick={cancelEdit}>Cancelar edição</button>}
              <Link to="/pagamento" className="secondary-link-button">
                Ir para pagamento
              </Link>
            </div>
          </form>
        </section>

        <section className="card perfil-card agendamento-card">
          <div className="card-title-wrap">
            <span className="card-icon">💰</span>
            <h2>Meus Agendamentos</h2>
          </div>

          {agendamentos.length === 0 ? (
            <p className="subtitle">Você ainda não possui agendamentos.</p>
          ) : (
            <div className="booking-grid">
              {agendamentos.map((agendamento) => {
                const petName = typeof agendamento.pet === 'string' ? agendamento.pet : agendamento.pet?.nome
                const serviceName = typeof agendamento.servico === 'string' ? agendamento.servico : agendamento.servico?.nome
                const isPending = agendamento.status === 'PENDENTE'
                const avaliacao = getAvaliacao(agendamento._id)

                return (
                  <article key={agendamento._id} className="booking-card">
                    <div className="booking-pill">{agendamento.status ?? 'PENDENTE'}</div>
                    <h3>{petName || 'Pet'}</h3>
                    <p>{serviceName || 'Serviço'}</p>
                    <span>
                      {new Date(agendamento.data_entrada).toLocaleDateString('pt-BR')}
                      {' até '}
                      {new Date(agendamento.data_saida).toLocaleDateString('pt-BR')}
                    </span>
                    {isPending && (
                      <>
                        <Link to={`/pagamento?agendamento=${agendamento._id}`} className="save-button">
                          Pagar agendamento
                        </Link>
                        <button type="button" className="secondary-link-button" onClick={() => handleEdit(agendamento)}>
                          Editar
                        </button>
                      </>
                    )}
                    {agendamento.status === 'PAGO' && (
                      avaliacao ? (
                        <div className="rating-summary">
                          <strong>{'★'.repeat(avaliacao.estrelas)}{'☆'.repeat(5 - avaliacao.estrelas)}</strong>
                          {avaliacao.comentario && <span>{avaliacao.comentario}</span>}
                        </div>
                      ) : (
                        <form className="rating-form" onSubmit={(event) => handleAvaliacaoSubmit(event, agendamento._id)}>
                          <label className="field">
                            <span>Avalie este serviço</span>
                            <select name="estrelas" value={avaliacaoForm.estrelas} onChange={handleAvaliacaoChange}>
                              <option value="5">5 estrelas</option>
                              <option value="4">4 estrelas</option>
                              <option value="3">3 estrelas</option>
                              <option value="2">2 estrelas</option>
                              <option value="1">1 estrela</option>
                            </select>
                          </label>
                          <textarea name="comentario" value={avaliacaoForm.comentario} onChange={handleAvaliacaoChange} maxLength={500} placeholder="Conte como foi o atendimento (opcional)" />
                          <button type="submit" className="secondary-link-button" disabled={avaliandoId === agendamento._id}>
                            {avaliandoId === agendamento._id ? 'Enviando...' : 'Enviar avaliação'}
                          </button>
                        </form>
                      )
                    )}
                    <button type="button" className="cancel-booking-button" onClick={() => handleDelete(agendamento._id)}>
                      Apagar agendamento
                    </button>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default AgendamentoPage
