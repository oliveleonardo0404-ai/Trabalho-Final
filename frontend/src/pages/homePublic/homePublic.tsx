import { Link } from 'react-router-dom'
import './homePublic.css'

function HomePublicPage() {
  return (
    <div className="home-public-page">
      <nav className="navbar-public">
        <Link to="/" className="logo-public">
          🐾 PetCare
        </Link>

        <div className="nav-public-links">
          <Link to="/">Início</Link>
          <Link to="/login" className="btn-login-public">
            Entrar
          </Link>
          <Link to="/cadastro" className="btn-register-public">
            Criar Conta
          </Link>
        </div>
      </nav>

      <section className="hero-public">
        <div className="hero-overlay-public" />
        <div className="hero-content-public">
          <span className="badge-public">Nascemos de um amor verdadeiro</span>
          <h1>Onde cada cão recebe o cuidado que merece.</h1>
          <p>
            Estrutura pensada nos mínimos detalhes para a saúde, diversão e bem-estar do
            seu melhor amigo.
          </p>
          <Link to="/login" className="btn-primary-public">
            Agendar Visita / Entrar
          </Link>
        </div>
      </section>

      <div className="container-public">
        <div className="banner-cta-public">
          <div className="cta-text-public">
            <h2>Crie sua conta e cadastre seus pets!</h2>
            <p>
              Tenha acesso facilitado a agendamentos de hotel, creche e acompanhamento em
              tempo real.
            </p>
          </div>
          <Link to="/cadastro" className="btn-primary-public">
            Cadastrar Agora ✨
          </Link>
        </div>

        <section className="about-section-public">
          <div className="about-image-public">
            <img
              src="https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&w=800&q=80"
              alt="Tutor e seu cão"
            />
          </div>

          <div className="about-text-public">
            <span className="sub-title-public">Nossa História</span>
            <h2>Mais que uma creche, uma segunda família.</h2>
            <p>
              Nossa equipe conta com profissionais apaixonados e certificados. Entendemos que
              seu pet é parte da sua família, por isso tratamos cada um com o carinho e
              atenção individualizada.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

export default HomePublicPage
