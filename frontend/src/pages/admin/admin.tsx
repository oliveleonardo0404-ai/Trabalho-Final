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

const emptyForm: ServicoForm = { nome: '', descricao: '', preco_diaria: '', ativo: true }
const API_URL = 'http://localhost:3001/api/servicos'

function AdminPage() {
  const navigate = useNavigate()
  const [servicos, setServicos] = useState<Servico[]>([])
  const [form, setForm] = useState<ServicoForm>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (getStoredUser()?.role !== 'admin') {
      navigate('/home', { replace: true })
      return  
    }

    const loadServicos = async () => {
      try {
        const response = await fetch(API_URL)
        if (!response.ok) throw new Error('Não foi possível carregar os serviços.')
        setServicos(await response.json())
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Erro ao carregar serviços.')
      } finally {
        setLoading(false)
      }
    }

    void loadServicos()
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
      </main>
    </>
  )
}

export default AdminPage
