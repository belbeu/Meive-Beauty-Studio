import React, { useState } from "react";
import "./App.css";
import BeautyMarquee from "./components/BeautyMarquee";
import AboutSection from "./components/Sobre";
import ProdutosSection from "./components/ProdutosHome";

function App() {

  const [isOpen, setIsOpen] = useState(false);
  const [servicoSelecionado, setServicoSelecionado] = useState("");
  const [nomeServicoLabel, setNomeServicoLabel] = useState("Selecione uma opção");

  const selecionarServico = (valor, label) => {
    setServicoSelecionado(valor);
    setNomeServicoLabel(label);
    setIsOpen(false);
  };

  const servicesData = [
    {
      id: "01",
      tag: "MAIS PEDIDO",
      title: "VOLUME RUSSO",
      description:
        "Fios ultrafinos em leque. Resultado dramático e cheio que dura semanas.",
      price: "R$ 280",
      duration: "3h",
    },
    {
      id: "02",
      tag: null,
      title: "FIO A FIO",
      description:
        "Clássico e natural. Um fio por cílio para quem quer leveza no dia a dia.",
      price: "R$ 180",
      duration: "2h",
    },
    {
      id: "03",
      tag: "FAVORITO",
      title: "HÍBRIDO",
      description: "O melhor dos dois mundos — textura e volume sem exageros.",
      price: "R$ 230",
      duration: "2h30",
    },
    {
      id: "04",
      tag: null,
      title: "MANUTENÇÃO",
      description:
        "Reposição a cada 3-4 semanas para manter o efeito perfeito.",
      price: "A partir de R$ 100",
      duration: "1h",
    },
  ];

  

  return (
    <main className="home">
      <header className="navbar">
        <div className="logo">
          <span className="logo-main">MEIVE</span>
          <span className="logo-sub">BEAUTY STUDIO</span>
        </div>

        <nav className="nav-links">
          <a href="#servicos">SERVIÇOS</a>
          <a href="#produtos">PRODUTOS</a>
          <a href="#sobre">SOBRE</a>
          <a href="#contato">CONTATO</a>
        </nav>

        <div className="nav-actions">
          <button className="cart-button" aria-label="Carrinho">
            <svg
              width="21"
              height="21"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.4L21 8H6" />
              <circle cx="10" cy="20" r="1" />
              <circle cx="18" cy="20" r="1" />
            </svg>
          </button>

          <a href="#contato" className="schedule-button">
            AGENDAR
          </a>
        </div>
      </header>

      <section className="hero">
        <div className="hero-background"></div>
        <div className="hero-overlay"></div>

        <div className="hero-content">
          <div className="hero-title">
            <span>MEIVE</span>
            <span>BEAUTY</span>
            <span>STUDIO</span>
          </div>

          <p className="hero-description">
            Transformando olhares através da Arte.
          </p>

          <div className="hero-buttons">
            <a href="#contato" className="primary-button">
              AGENDAR AGORA
            </a>

            <a href="#servicos" className="secondary-button">
              VER SERVIÇOS
            </a>
          </div>

          <div className="stats">
            <div className="stat">
              <strong>500+</strong>
              <span>CLIENTES</span>
            </div>

            <div className="stat">
              <strong>3 anos</strong>
              <span>EXPERIÊNCIA</span>
            </div>

            <div className="stat">
              <strong>98%</strong>
              <span>5 ESTRELAS</span>
            </div>
          </div>
        </div>

        <div className="featured-card">
          <span className="card-label">MAIS POPULAR</span>

          <h2>VOLUME RUSSO</h2>

          <p>O lash que vira vício — cheio, dramático e perfeito.</p>

          <div className="card-footer">
            <strong>R$ 280</strong>
            <span>3 horas</span>
          </div>
        </div>
      </section>

      <BeautyMarquee />

      <section id="servicos" className="services-section">
        <div className="services-header-container">
          <div className="services-titles">
            <span className="services-subtitle">O QUE A GENTE FAZ</span>
            <h2 className="services-title">SERVIÇOS</h2>
          </div>
          <p className="services-top-note">
            Cada aplicação é feita com técnica refinada e materiais importados
            da Coreia do Sul.
          </p>
        </div>

        <div className="services-grid">
          {servicesData.map((service) => (
            <div key={service.id} className="service-card">
              <div className="service-card-top">
                {service.tag && (
                  <span className="service-tag">{service.tag}</span>
                )}
                <span className="service-number">{service.id}</span>
              </div>

              <div className="service-info">
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </div>

              <div className="service-footer">
                <strong className="service-price">{service.price}</strong>
                <span className="service-duration">{service.duration}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <AboutSection />

      <ProdutosSection />

      <section className="testimonials-section">
 <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', marginBottom: '50px' }}>
  <span style={{ 
    fontFamily: 'Inter, sans-serif', 
    fontSize: '12px', 
    letterSpacing: '4px', 
    color: '#ad1838', /* Altere para a cor que preferir */
    fontWeight: '600', 
    marginBottom: '20px',
    whiteSpace: 'nowrap', /* Garante que fica estritamente numa linha só */
    display: 'inline-block'
  }}>
    DEPOIMENTOS
  </span>
    <h2 style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0', padding: '0', lineHeight: '0.9' }}>
      <span style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '78px', color: '#ffffff', margin: '0 0 -5px 0' }}>
        O QUE AS
      </span>
      
      <span style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '85px', color: '#8a2be2', margin: '0 0 -5px 0', letterSpacing: '1px' }}>
        MEIVE GIRLS
      </span>
      
      <span style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '78px', color: '#ffffff', margin: '0' }}>
        DIZEM
      </span>
    </h2>
  </div>

  <div className="testimonials-grid">
    {/* Card 1 */}
    <div className="testimonial-card">
      <div className="stars">★★★★★</div>
      <p className="testimonial-text">
        "Fiz volume russo e não tem volta. A Meive arrasa demais, tudo perfeito!"
      </p>
      <div className="testimonial-author">
        <span className="author-avatar">A</span>
        <span className="author-name">Ana Paula M.</span>
      </div>
    </div>

    {/* Card 2 */}
    <div className="testimonial-card">
      <div className="stars">★★★★★</div>
      <p className="testimonial-text">
        "Acordei pronta. Melhor decisão da minha vida foi descobrir o Meive Beauty Studio."
      </p>
      <div className="testimonial-author">
        <span className="author-avatar">B</span>
        <span className="author-name">Bruna L.</span>
      </div>
    </div>

    {/* Card 3 */}
    <div className="testimonial-card">
      <div className="stars">★★★★★</div>
      <p className="testimonial-text">
        "Fora o resultado incrível, o espaço é lindo e o atendimento é impecável."
      </p>
      <div className="testimonial-author">
        <span className="author-avatar">L</span>
        <span className="author-name">Larissa C.</span>
      </div>
    </div>
  </div>
</section>

      <section id="contato" className="contact-section">
        <div className="contact-header">
          <span className="contact-subtitle">AGENDAMENTO</span>
          <h2 className="contact-title">
            <span>BORA</span> <span>AGENDAR?</span>
            <span style={{ fontFamily: '"DM Sans", sans-serif !important', color: '#ada9b1', fontSize: '15px' }}>
  Entre em contato e retornamos em até 1 hora.
</span>
          </h2>
        </div>

        <div className="contact-grid">
          {/* Formulário Simples de Contato */}
          <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
            <div className="form-row">
               <div className="form-group">
                <label htmlFor="nome">SEU NOME</label>
                <input type="text" id="nome" placeholder="Digite seu nome" required />
            </div>

            <div className="form-group">
                <label htmlFor="whatsapp">SEU WHATSAPP</label>
                <input type="text" id="whatsapp" placeholder="(11) 98888-8888" required />
            </div>
        </div>

            <div className="form-group">
              <div className="form-group custom-select-container">
    <label htmlFor="servico">QUAL SERVIÇO VOCÊ DESEJA?</label>
    
    {/* Caixa que simula o select fechado */}
    <div 
      className={`custom-select-trigger ${servicoSelecionado ? 'selected' : ''}`}
      onClick={() => setIsOpen(!isOpen)}
    >
      <span>{nomeServicoLabel}</span>
      <svg className={`select-arrow ${isOpen ? 'open' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
    </div>

    {/* Input escondido para manter a obrigatoriedade no form */}
    <input type="hidden" name="servico" value={servicoSelecionado} required />

    {/* Lista de opções customizada */}
    {isOpen && (
      <div className="custom-options-list">
        <div className="custom-option" onClick={() => selecionarServico("volume-russo", "Volume Russo (R$ 280)")}>
          Volume Russo (R$ 280)
        </div>
        <div className="custom-option" onClick={() => selecionarServico("fio-a-fio", "Fio a Fio (R$ 180)")}>
          Fio a Fio (R$ 180)
        </div>
        <div className="custom-option" onClick={() => selecionarServico("hibrido", "Híbrido (R$ 230)")}>
          Híbrido (R$ 230)
        </div>
        <div className="custom-option" onClick={() => selecionarServico("manutencao", "Manutenção (A partir de R$ 100)")}>
          Manutenção (A partir de R$ 100)
        </div>
      </div>
    )}
  </div>
            </div>

            <div className="form-group">
              <label htmlFor="mensagem">MENSAGEM</label>
              <textarea
                id="mensagem"
                rows="4"
                placeholder="Como podemos te ajudar?"
                required
              ></textarea>
            </div>

            <button type="submit" className="primary-button submit-btn">
              ENVIAR MENSAGEM
            </button>
          </form>
        </div>
      </section>

      <div className="section-divider"></div>

      <footer className="site-footer">
        <div className="footer-content">
          {/* Coluna 1: Logo, descrição e redes sociais */}
          <div className="footer-col brand-col">
            <div className="footer-logo">
              <span className="logo-main">MEIVE</span>
              <span className="logo-sub">BEAUTY STUDIO</span>
            </div>
            <p className="footer-description">
              Studio de cílios e beleza em São Paulo.
              <br />
              Transformando olhares através da arte.
            </p>
            <div className="footer-socials">
              <a
                href="https://www.instagram.com/nineris.studio/"
                target="_blank"
                rel="noreferrer"
                className="social-btn"
              >
                INSTAGRAM
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noreferrer"
                className="social-btn"
              >
                TIKTOK
              </a>
            </div>
          </div>

          {/* Coluna 2: Horários */}
          <div className="footer-col schedule-col">
            <h4 className="footer-title">HORÁRIOS</h4>
            <ul className="schedule-list">
              <li>
                <span>Seg - Sex</span>
                <span className="highlight-time">9h às 19h</span>
              </li>
              <li>
                <span>Sábado</span>
                <span className="highlight-time">9h às 16h</span>
              </li>
              <li>
                <span>Domingo</span>
                <span className="closed-time">Fechado</span>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Contato */}
          <div className="footer-col contact-col">
            <h4 className="footer-title">CONTATO</h4>
            <ul className="contact-list">
              <li>
                <span className="icon">📍</span>
                <span>R. Giancarlo Palanti, 22 A, 03661-050, Vila Ré</span>
              </li>
              <li>
                <span className="icon">📱</span>
                <span>(11) 94487-4969</span>
              </li>
              <li>
                <span className="icon">📧</span>
                <span>meivestudio@email.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Linha inferior de Copyright */}
        <div className="footer-bottom">
          <p>© 2026 Meive Beauty Studio. Todos os direitos reservados.</p>
          <span className="hashtag">#MeiveBeauty</span>
        </div>
      </footer>
    </main>
  );
}

export default App;
