import { useEffect, useState } from 'react'
import type { SubmitEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/navbar/navbar'
import { getStoredUser } from '../../services/auth'
import './admin.css'

type Servico = {
  _id: string
  nome: string
  descricao?: string
  preco_diaria: number
  ativo?: boolean
}

type ServicoForm = {
  nome: string
  descricao: string
  preco_diaria: string
  ativo: boolean
}

type Cliente = {
  _id: string
  nome: string
  email: string
  numero?: string
  role?: 'cliente' | 'admin'
}

const emptyForm: ServicoForm = { nome: '', descricao: '', preco_diaria: '', ativo: true }
const API_URL = 'http://localhost:3001/api/servicos'
const CLIENTES_API_URL = 'http://localhost:3001/api/clientes'

function AdminPage() {
  const navigate = useNavigate()
  const [servicos, setServicos] = useState<Servico[]>([])
  const [form, setForm] = useState<ServicoForm>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [clientesLoading, setClientesLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (getStoredUser()?.role !== 'admin') {
      navigate('/home', { replace: true })
      return  
    }

    const loadAdminData = async () => {
      try {
        const [servicosResponse, clientesResponse] = await Promise.all([
          fetch(API_URL),
          fetch(CLIENTES_API_URL),
        ])
        if (!servicosResponse.ok) throw new Error('Não foi possível carregar os serviços.')
        if (!clientesResponse.ok) throw new Error('Não foi possível carregar os clientes.')

        const [servicosData, clientesData] = await Promise.all([
          servicosResponse.json(),
          clientesResponse.json(),
        ])
        setServicos(servicosData)
        setClientes(clientesData.filter((cliente: Cliente) => cliente.role !== 'admin'))
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Erro ao carregar serviços.')
      } finally {
        setLoading(false)
        setClientesLoading(false)
      }
    }

    void loadAdminData()
  }, [navigate])

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setMessage('')

    const payload = {
      nome: form.nome.trim(),
      descricao: form.descricao.trim(),
      preco_diaria: Number(form.preco_diaria),
      ativo: form.ativo,
    }

    if (!payload.nome || !Number.isFinite(payload.preco_diaria) || payload.preco_diaria < 0) {
      setError('Informe um nome e um preço válido.')
      return
    }

    try {
      const response = await fetch(editingId ? `${API_URL}/${editingId}` : API_URL, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) throw new Error('Não foi possível salvar o serviço.')

      const result = await response.json()
      if (editingId) {
        setServicos((current) => current.map((servico) => servico._id === editingId ? result : servico))
        setMessage('Serviço atualizado.')
      } else {
        setServicos((current) => [...current, result.data])
        setMessage('Serviço criado.')
      }
      setForm(emptyForm)
      setEditingId(null)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Erro ao salvar serviço.')
    }
  }

  const handleEdit = (servico: Servico) => {
    setEditingId(servico._id)
    setForm({
      nome: servico.nome,
      descricao: servico.descricao ?? '',
      preco_diaria: String(servico.preco_diaria),
      ativo: servico.ativo ?? true,
    })
    setMessage('')
    setError('')
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Remover este serviço do catálogo?')) return

    try {
      const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Não foi possível remover o serviço.')
      setServicos((current) => current.filter((servico) => servico._id !== id))
      setMessage('Serviço removido.')
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Erro ao remover serviço.')
    }
  }

  const handleDeleteCliente = async (cliente: Cliente) => {
    const loggedUser = getStoredUser()
    const loggedUserId = loggedUser?._id || loggedUser?.id

    if (cliente._id === loggedUserId) {
      setError('Não é possível remover o usuário administrador conectado.')
      return
    }

    if (!window.confirm(`Remover o acesso de ${cliente.nome}?`)) return

    setError('')
    setMessage('')

    try {
      const response = await fetch(`${CLIENTES_API_URL}/${cliente._id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Não foi possível remover o cliente.')
      setClientes((current) => current.filter((item) => item._id !== cliente._id))
      setMessage('Cliente removido.')
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Erro ao remover cliente.')
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm(emptyForm)
    setError('')
  }

  return (
    <>
      <Navbar />
      <main className="admin-page">
        <section className="admin-heading">
          <p className="eyebrow">Área restrita</p>
          <h1>Administração</h1>
          <p>Base inicial para gerenciar os serviços e os valores do catálogo.</p>
        </section>

        <section className="admin-layout">
          <form className="admin-panel admin-form" onSubmit={handleSubmit}>
            <div className="panel-heading">
              <h2>{editingId ? 'Editar serviço' : 'Novo serviço'}</h2>
              <span>{editingId ? 'Atualize os dados' : 'Adicione ao catálogo'}</span>
            </div>
            <label>
              <span>Nome do produto ou serviço</span>
              <input value={form.nome} onChange={(event) => setForm({ ...form, nome: event.target.value })} placeholder="Ex.: Hotel Pet" />
            </label>
            <label>
              <span>Descrição</span>
              <textarea value={form.descricao} onChange={(event) => setForm({ ...form, descricao: event.target.value })} placeholder="Como esse serviço funciona?" rows={4} />
            </label>
            <label>
              <span>Valor da diária (R$)</span>
              <input type="number" min="0" step="0.01" value={form.preco_diaria} onChange={(event) => setForm({ ...form, preco_diaria: event.target.value })} placeholder="0,00" />
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={form.ativo}
                onChange={(event) => setForm({ ...form, ativo: event.target.checked })}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span>Serviço ativo</span>
            </label>
            <div className="admin-actions">
              <button className="save-button" type="submit">{editingId ? 'Salvar alterações' : 'Criar serviço'}</button>
              {editingId && <button className="cancel-button" type="button" onClick={cancelEdit}>Cancelar</button>}
            </div>
            {message && <p className="feedback success">{message}</p>}
            {error && <p className="feedback error">{error}</p>}
          </form>

          <section className="admin-panel catalog-panel">
            <div className="panel-heading">
              <h2>Catálogo atual</h2>
              <span>{servicos.length} serviço(s)</span>
            </div>
            {loading && <p className="empty-state">Carregando catálogo...</p>}
            {!loading && servicos.length === 0 && <p className="empty-state">Nenhum serviço cadastrado.</p>}
            {!loading && servicos.length > 0 && (
              <div className="catalog-list">
                {servicos.map((servico) => (
                  <article className="catalog-item" key={servico._id}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <h3>{servico.nome}</h3>
                        <span style={{
                          fontSize: '12px',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor: servico.ativo ? '#d4edda' : '#f8d7da',
                          color: servico.ativo ? '#155724' : '#721c24',
                          fontWeight: 'bold'
                        }}>
                          {servico.ativo ? '✓ Ativo' : '✗ Inativo'}
                        </span>
                      </div>
                      <p>{servico.descricao || 'Sem descrição cadastrada.'}</p>
                    </div>
                    <strong>R$ {servico.preco_diaria.toFixed(2)}</strong>
                    <div className="item-actions">
                      <button type="button" onClick={() => handleEdit(servico)}>Editar</button>
                      <button type="button" onClick={() => handleDelete(servico._id)}>Remover</button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </section>

        <section className="admin-panel clients-panel">
          <div className="panel-heading">
            <h2>Clientes com acesso</h2>
            <span>{clientes.length} cliente(s)</span>
          </div>
          {clientesLoading && <p className="empty-state">Carregando clientes...</p>}
          {!clientesLoading && clientes.length === 0 && <p className="empty-state">Nenhum cliente cadastrado.</p>}
          {!clientesLoading && clientes.length > 0 && (
            <div className="clients-list">
              {clientes.map((cliente) => (
                <article className="client-item" key={cliente._id}>
                  <div>
                    <h3>{cliente.nome}</h3>
                    <p>{cliente.email}</p>
                    {cliente.numero && <span>{cliente.numero}</span>}
                  </div>
                  <button type="button" className="remove-client-button" onClick={() => handleDeleteCliente(cliente)}>
                    Remover acesso
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  )
}

export default AdminPage
