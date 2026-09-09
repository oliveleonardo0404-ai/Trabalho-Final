import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getStoredUser } from '../../services/auth'
import './home.css'

type Agendamento = {
  _id?: string
  pet?: string | { nome?: string; cliente?: string | { _id?: string } }
  servico?: string | { nome?: string }
  data_entrada?: string
  data_saida?: string
  status?: string
  cliente?: string | { _id?: string }
}

type RelatedClient = string | { _id?: string } | undefined

const getRelatedClientId = (client: RelatedClient) => (
  typeof client === 'string' ? client : client?._id
)

const getPetClientId = (pet: Agendamento['pet']) => {
  if (!pet || typeof pet === 'string') return undefined
  return getRelatedClientId(pet.cliente)
}

const services = [
  {
    title: 'Área Externa & Playground',
    description: '1.500m² de gramado ao ar livre para brincadeiras e socialização.',
    accent: 'brown',
  },
  {
    title: 'Suites Climatisadas',
    description: 'Dormitórios confortáveis com cama individual e monitoramento.',
    accent: 'cream',
  },
  {
    title: 'Espaço Recreativo',
    description: 'Atividades cognitivas e paixões nas mais diversas brincadeiras.',
    accent: 'gold',
  },
]

const plans = [
  {
    icon: '🏨',
    title: 'Hotel Pet',
    description: 'Hospedagem com acompanhamento 24h, rotina de exercícios e muito carinho.',
    button: 'Reservar Hotel',
    variant: 'classic',
  },
  {
    icon: '🌟',
    title: 'Creche Educativa',
    description: 'Diário com brincadeiras, estimulação e socialização com outros pets.',
    button: 'Agendar Creche',
    variant: 'light',
  },
  {
    icon: '🎓',
    title: 'Escola & Adestramento',
    description: 'Treinamento positivo focado no comportamento e bem-estar do cão.',
    button: 'Matricular',
    variant: 'dark',
  },
]

const mockAgendamentos: Agendamento[] = [
  {
    _id: 'mock-1',
    pet: 'Thor',
    servico: 'Hotel Pet',
    data_entrada: '2026-08-18',
    data_saida: '2026-08-20',
    status: 'CONFIRMADO',
  },
  {
    _id: 'mock-2',
    pet: 'Mel',
    servico: 'Creche Educativa',
    data_entrada: '2026-08-22',
    data_saida: '2026-08-22',
    status: 'PENDENTE',
  },
]

function HomePage() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const user = getStoredUser()
  const userId = user?._id || user?.id
  const isLoggedIn = Boolean(user)

  const getPetName = (pet: Agendamento['pet']) => {
    if (typeof pet === 'string') return pet
    return pet?.nome ?? 'Pet'
  }

  const getServicoName = (servico: Agendamento['servico']) => {
    if (typeof servico === 'string') return servico
    return servico?.nome ?? 'Serviço'
  }

  useEffect(() => {
    const carregarAgendamentos = async () => {
      if (!userId) {
        setAgendamentos([])
        return
      }

      try {
        const response = await fetch('http://localhost:3001/api/agendamentos')

        if (!response.ok) {
          throw new Error('Erro ao carregar agendamentos')
        }

        const dados: Agendamento[] = await response.json()

        const agendamentosDoUsuario = dados.filter((agendamento) => {
          const clienteId = getRelatedClientId(agendamento.cliente)
          const petClienteId = getPetClientId(agendamento.pet)

          return clienteId === userId || petClienteId === userId
        })

        setAgendamentos(agendamentosDoUsuario.length > 0 ? agendamentosDoUsuario : [])
      } catch {
        setAgendamentos(mockAgendamentos)
      }
    }

    carregarAgendamentos()
  }, [userId])

  return (
    <div className="home-page">
      <header className="home-header">
        <div className="home-brand">
          <span className="brand-mark">✦</span>
          <span>PetCare</span>
        </div>

        <nav className="home-actions">
          <Link to="/home" className="mini-button">
            Início
          </Link>
          <Link to="/perfil" className="mini-button accent">
            Meu Perfil
          </Link>
        </nav>
      </header>

      <section className="hero-banner">
        <div className="hero-overlay" />
        <div className="hero-content">
          <span className="eyebrow">NASCEMOS DE UM AMOR VERDADEIRO</span>
          <h1>Onde cada cão recebe o cuidado que merece.</h1>
          <p>
            Estrutura para animais de estimação com ambientes seguros, conforto e carinho
            em um espaço pensado para o seu melhor amigo.
          </p>
          <div className="hero-actions">
            <Link to={isLoggedIn ? '/agendamentos' : '/login'} className="hero-button">
              {isLoggedIn ? 'Agendar Visita' : 'Agendar Visita / Entrar'}
            </Link>
            {!isLoggedIn && (
              <Link to="/cadastro" className="hero-button secondary">
                Criar Conta
              </Link>
            )}
          </div>
        </div>
      </section>

      <main className="home-main">
        <section className="about-section">
          <div className="about-image" aria-label="Cachorro branco correndo" />
          <div className="about-copy">
            <span className="section-tag">Nossa História</span>
            <h2>Mais que uma creche, uma segunda família.</h2>
            <p>
              Nossa equipe combina profissionais apaixonados e cuidados personalizados para
              oferecer um ambiente seguro, alegre e acolhedor para os pets.
            </p>
          </div>
        </section>

        <section className="booking-section">
          <div className="booking-header">
            <h2>Próximos agendamentos</h2>
            <Link to="/perfil" className="booking-link">
              Ver perfil
            </Link>
          </div>
          <div className="booking-grid">
            {agendamentos.map((agendamento) => (
              <article key={agendamento._id ?? getPetName(agendamento.pet)} className="booking-card">
                <div className="booking-pill">{agendamento.status ?? 'PENDENTE'}</div>
                <h3>{getPetName(agendamento.pet)}</h3>
                <p>{getServicoName(agendamento.servico)}</p>
                <span>
                  {agendamento.data_entrada
                    ? new Date(agendamento.data_entrada).toLocaleDateString('pt-BR')
                    : 'Data em breve'}
                </span>
                {agendamento.status === 'PENDENTE'
                  && agendamento._id
                  && !agendamento._id.startsWith('mock-') && (
                    <Link to={`/pagamento?agendamento=${agendamento._id}`} className="booking-payment-link">
                      Pagar agendamento
                    </Link>
                  )}
              </article>
            ))}
          </div>
          
        </section>

        <section className="services-section">
          <h2>Conheça Nossos Espaços</h2>

          <div className="service-grid">
            {services.map((service) => (
              <article key={service.title} className={`service-card ${service.accent}`}>
                <div className="service-photo" aria-hidden="true" />
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="plans-section">
          <h2>O que seu cão precisa em um só lugar</h2>

          <div className="plans-grid">
            {plans.map((plan) => (
              <article key={plan.title} className={`plan-card ${plan.variant}`}>
                <div className="plan-icon">{plan.icon}</div>
                <h3>{plan.title}</h3>
                <p>{plan.description}</p>
                <button>{plan.button}</button>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default HomePage
