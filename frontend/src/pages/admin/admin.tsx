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
  // Controla a página administrativa, os serviços e os clientes cadastrados.
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
    // Verifica o acesso do usuário antes de carregar os dados administrativos.
    if (getStoredUser()?.role !== 'admin') {
      navigate('/home', { replace: true })
      return  
    }

    // Busca os serviços e os clientes ao abrir a página administrativa.
    const loadAdminData = async () => {
      try {
        // Solicita os dois conjuntos de dados ao mesmo tempo para agilizar o carregamento.
        const [servicosResponse, clientesResponse] = await Promise.all([
          fetch(API_URL),
          fetch(CLIENTES_API_URL),
        ])
        // Interrompe o carregamento quando alguma resposta da API falha.
        if (!servicosResponse.ok) throw new Error('Não foi possível carregar os serviços.')
        if (!clientesResponse.ok) throw new Error('Não foi possível carregar os clientes.')

        // Converte as respostas para objetos JavaScript.
        const [servicosData, clientesData] = await Promise.all([
          servicosResponse.json(),
          clientesResponse.json(),
        ])
        // Atualiza as listas e oculta os administradores da lista de clientes.
        setServicos(servicosData)
        setClientes(clientesData.filter((cliente: Cliente) => cliente.role !== 'admin'))
      } catch (loadError) {
        // Exibe uma mensagem compreensível quando o carregamento não funciona.
        setError(loadError instanceof Error ? loadError.message : 'Erro ao carregar serviços.')
      } finally {
        // Finaliza os estados de carregamento das duas listas.
        setLoading(false)
        setClientesLoading(false)
      }
    }

    void loadAdminData()
  }, [navigate])

  // Cria ou atualiza um serviço usando os dados preenchidos no formulário.
  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    // Evita o recarregamento padrão da página ao enviar o formulário.
    event.preventDefault()
    // Limpa as mensagens exibidas antes de iniciar uma nova operação.
    setError('')
    setMessage('')

    // Prepara os dados para o formato que o back-end espera.
    const payload = {
      nome: form.nome.trim(),
      descricao: form.descricao.trim(),
      preco_diaria: Number(form.preco_diaria),
      ativo: form.ativo,
    }

    // Valida os campos obrigatórios antes de enviar a requisição.
    if (!payload.nome || !Number.isFinite(payload.preco_diaria) || payload.preco_diaria < 0) {
      setError('Informe um nome e um preço válido.')
      return
    }

    try {
      // Usa PUT na edição e POST na criação do serviço.
      const response = await fetch(editingId ? `${API_URL}/${editingId}` : API_URL, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      // Interrompe o fluxo quando a API não consegue salvar o serviço.
      if (!response.ok) throw new Error('Não foi possível salvar o serviço.')

      // Converte a resposta para obter o serviço salvo.
      const result = await response.json()
      if (editingId) {
        // Atualiza o item editado na lista sem recarregar a página.
        setServicos((current) => current.map((servico) => servico._id === editingId ? result : servico))
        setMessage('Serviço atualizado.')
      } else {
        // Adiciona o novo serviço ao final da lista atual.
        setServicos((current) => [...current, result.data])
        setMessage('Serviço criado.')
      }
      // Limpa o formulário e encerra o modo de edição.
      setForm(emptyForm)
      setEditingId(null)
    } catch (saveError) {
      // Exibe o erro retornado pela API ou uma mensagem padrão.
      setError(saveError instanceof Error ? saveError.message : 'Erro ao salvar serviço.')
    }
  }

  // Preenche o formulário com os dados do serviço selecionado para edição.
  const handleEdit = (servico: Servico) => {
    // Guarda o identificador para que o envio use a rota de atualização.
    setEditingId(servico._id)
    // Copia os dados do serviço para os campos editáveis do formulário.
    setForm({
      nome: servico.nome,
      descricao: servico.descricao ?? '',
      preco_diaria: String(servico.preco_diaria),
      ativo: servico.ativo ?? true,
    })
    // Remove mensagens antigas para destacar o novo fluxo de edição.
    setMessage('')
    setError('')
  }

  // Remove um serviço do catálogo após a confirmação do administrador.
  const handleDelete = async (id: string) => {
    // Solicita confirmação antes de excluir o serviço permanentemente.
    if (!window.confirm('Remover este serviço do catálogo?')) return

    try {
      // Envia a solicitação de remoção para a API.
      const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' })
      // Interrompe o fluxo quando a API rejeita a remoção.
      if (!response.ok) throw new Error('Não foi possível remover o serviço.')
      // Retira o serviço removido da lista exibida na tela.
      setServicos((current) => current.filter((servico) => servico._id !== id))
      setMessage('Serviço removido.')
    } catch (deleteError) {
      // Exibe o erro retornado pela API ou uma mensagem padrão.
      setError(deleteError instanceof Error ? deleteError.message : 'Erro ao remover serviço.')
    }
  }

  // Remove o acesso de um cliente, impedindo a exclusão do administrador conectado.
  const handleDeleteCliente = async (cliente: Cliente) => {
    // Obtém o identificador do usuário conectado para proteger sua própria conta.
    const loggedUser = getStoredUser()
    const loggedUserId = loggedUser?._id || loggedUser?.id

    if (cliente._id === loggedUserId) {
      setError('Não é possível remover o usuário administrador conectado.')
      return
    }

    // Solicita confirmação antes de remover o acesso do cliente.
    if (!window.confirm(`Remover o acesso de ${cliente.nome}?`)) return

    // Limpa as mensagens anteriores antes de iniciar a remoção.
    setError('')
    setMessage('')

    try {
      // Envia a solicitação para remover o cliente da API.
      const response = await fetch(`${CLIENTES_API_URL}/${cliente._id}`, { method: 'DELETE' })
      // Interrompe o fluxo quando a API rejeita a remoção.
      if (!response.ok) throw new Error('Não foi possível remover o cliente.')
      // Atualiza a lista local sem recarregar a página.
      setClientes((current) => current.filter((item) => item._id !== cliente._id))
      setMessage('Cliente removido.')
    } catch (deleteError) {
      // Exibe o erro retornado pela API ou uma mensagem padrão.
      setError(deleteError instanceof Error ? deleteError.message : 'Erro ao remover cliente.')
    }
  }

  // Cancela a edição atual e restaura o formulário vazio.
  const cancelEdit = () => {
    // Sai do modo de edição e restaura os valores iniciais.
    setEditingId(null)
    setForm(emptyForm)
    // Remove o erro que poderia estar relacionado à edição cancelada.
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
