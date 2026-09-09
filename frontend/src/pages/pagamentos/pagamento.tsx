import { useEffect, useMemo, useState, type SubmitEvent } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Navbar from '../../components/navbar/navbar'
import { getStoredUser } from '../../services/auth'
import './pagamento.css'

type PagamentoForm = {
  metodo: 'PIX' | 'CARTAO' | 'DINHEIRO'
  valor: string
}

type Agendamento = {
  _id: string
  cliente?: string | { _id?: string }
  pet?: string | { nome?: string }
  servico?: string | { nome?: string; preco_diaria?: number }
  data_entrada: string
  data_saida: string
  status?: string
}

function PagamentoPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const user = getStoredUser()
  const agendamentoId = searchParams.get('agendamento')
  const [agendamento, setAgendamento] = useState<Agendamento | null>(null)
  const [form, setForm] = useState<PagamentoForm>({
    metodo: 'PIX',
    valor: '120.00',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    if (!agendamentoId) {
      return
    }

    const loadAgendamento = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/agendamentos/${agendamentoId}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Agendamento não encontrado.')
        }

        const loadedAgendamento = data as Agendamento
        const cliente = loadedAgendamento.cliente
        const clienteId = typeof cliente === 'string' ? cliente : cliente?._id
        if (clienteId !== (user._id || user.id)) {
          throw new Error('Este agendamento não pertence ao usuário logado.')
        }

        setAgendamento(loadedAgendamento)
        const servicePrice = typeof loadedAgendamento.servico === 'object'
          ? loadedAgendamento.servico.preco_diaria
          : undefined
        if (servicePrice !== undefined) {
          setForm((prev) => ({ ...prev, valor: servicePrice.toFixed(2) }))
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar agendamento.')
      }
    }

    loadAgendamento()
  }, [agendamentoId, navigate, user])

  const formattedValue = useMemo(() => {
    const value = Number(form.valor || 0)
    return Number.isFinite(value) ? value.toFixed(2) : '0.00'
  }, [form.valor])

  const pixQrCodeValue = useMemo(
    () => `PETCARE|PIX|AGENDAMENTO:${agendamentoId ?? ''}|VALOR:${formattedValue}`,
    [agendamentoId, formattedValue],
  )

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target
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

    const valor = Number(form.valor)
    if (!agendamentoId || !agendamento) {
      setError('Selecione um agendamento válido antes de pagar.')
      return
    }

    if (!valor || valor <= 0) {
      setError('Informe um valor válido para o pagamento.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('http://localhost:3001/api/pagamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente: user._id || user.id,
          agendamento: agendamentoId,
          valor,
          metodo: form.metodo,
          status: 'PAGO',
          data_pagamento: new Date().toISOString(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao registrar pagamento')
      }

      navigate('/home')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao registrar pagamento')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="perfil-page">
      <Navbar />

      <main className="perfil-content agendamento-content">
        <h1>Pagamento</h1>
        <p className="subtitle">Finalize a cobrança do agendamento com os dados do cliente.</p>

        <section className="card perfil-card agendamento-card">
          <div className="card-title-wrap">
            <span className="card-icon">💳</span>
            <h2>Forma de Pagamento</h2>
          </div>

          {!agendamentoId && <p className="form-error">Selecione um agendamento pendente para realizar o pagamento.</p>}
          {error && <p className="form-error">{error}</p>}
          {success && <p className="form-success">{success}</p>}

          <form onSubmit={handleSubmit} className="agendamento-form">
            <div className="field-group">
              <label className="field">
                <span>Nome do tutor</span>
                <input type="text" value={user?.nome || ''} readOnly />
              </label>

              <label className="field">
                <span>CPF</span>
                <input type="text" value={user?.cpf || ''} readOnly />
              </label>
            </div>

            <div className="field-group">
              <label className="field">
                <span>Forma de pagamento</span>
                <select name="metodo" value={form.metodo} onChange={handleChange}>
                  <option value="PIX">PIX</option>
                  <option value="CARTAO">Cartão</option>
                  <option value="DINHEIRO">Dinheiro</option>
                </select>
              </label>

              <label className="field">
                <span>Valor</span>
                <input
                  type="number"
                  name="valor"
                  min="0"
                  step="0.01"
                  value={form.valor}
                  onChange={handleChange}
                />
              </label>
            </div>

            <div className="summary-box">
              <h3>Resumo do pagamento</h3>
              <p>
                <strong>Cliente:</strong> {user?.nome || 'Tutor'}
              </p>
              <p>
                <strong>Agendamento:</strong>{' '}
                {agendamento
                  ? `${new Date(agendamento.data_entrada).toLocaleDateString('pt-BR')} até ${new Date(agendamento.data_saida).toLocaleDateString('pt-BR')}`
                  : 'Não selecionado'}
              </p>
              <p>
                <strong>Método:</strong> {form.metodo}
              </p>
              <p>
                <strong>Valor total:</strong> R$ {formattedValue}
              </p>
            </div>

            {form.metodo === 'PIX' && agendamento && (
              <div className="pix-box">
                <div>
                  <h3>Pagamento via PIX</h3>
                  <p>Escaneie o QR Code para pagar este agendamento.</p>
                </div>
                <QRCodeSVG value={pixQrCodeValue} size={190} marginSize={4} />
              </div>
            )}

            <div className="action-row">
              <button type="submit" className="save-button" disabled={loading || !agendamento}>
                {loading ? 'Processando...' : 'Confirmar Pagamento'}
              </button>
              <Link to="/agendamentos" className="secondary-link-button">
                Voltar ao agendamento
              </Link>
            </div>
          </form>
        </section>
      </main>
    </div>
  )
}

export default PagamentoPage
