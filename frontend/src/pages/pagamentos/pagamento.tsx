import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../../components/navbar/navbar'
import { getStoredUser } from '../../services/auth'
import './pagamento.css'

type PagamentoForm = {
  metodo: 'PIX' | 'CARTAO' | 'DINHEIRO'
  valor: string
}

function PagamentoPage() {
  const navigate = useNavigate()
  const user = getStoredUser()
  const [form, setForm] = useState<PagamentoForm>({
    metodo: 'PIX',
    valor: '120.00',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  // Antes do pagamento, a página verifica se existe um usuário autenticado.
  // Se não existir, o sistema redireciona para o login para proteger o fluxo.
  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
  }, [navigate, user])

  const formattedValue = useMemo(() => {
    const value = Number(form.valor || 0)
    return Number.isFinite(value) ? value.toFixed(2) : '0.00'
  }, [form.valor])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  // Este bloco registra o pagamento do cliente.
  // Ele pega o método de pagamento, o valor e envia para a API como comprovante da cobrança.
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!user) {
      navigate('/login')
      return
    }

    const valor = Number(form.valor)
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
          agendamento: 'pending-agendamento',
          valor,
          metodo: form.metodo,
          status: 'PENDENTE',
          data_pagamento: new Date().toISOString(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao registrar pagamento')
      }

      setSuccess('Pagamento registrado com sucesso.')
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
                <strong>Método:</strong> {form.metodo}
              </p>
              <p>
                <strong>Valor total:</strong> R$ {formattedValue}
              </p>
            </div>

            <div className="action-row">
              <button type="submit" className="save-button" disabled={loading}>
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
