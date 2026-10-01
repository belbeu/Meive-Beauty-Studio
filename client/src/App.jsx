import React, { useState } from "react";
import "./App.css";
import BeautyMarquee from "./components/BeautyMarquee";
import AboutSection from "./components/Sobre";
import ProdutosSection from "./components/ProdutosHome";
import imagem from "./assets/icone-test.jpg"; 

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [servicoSelecionado, setServicoSelecionado] = useState("");
  const [nomeServicoLabel, setNomeServicoLabel] = useState(
    "Selecione uma opção",
  );

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
        <div
          style={{
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            marginBottom: "50px",
          }}
        >
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "12px",
              letterSpacing: "4px",
              color: "#ad1838" /* Altere para a cor que preferir */,
              fontWeight: "600",
              marginBottom: "20px",
              whiteSpace:
                "nowrap" /* Garante que fica estritamente numa linha só */,
              display: "inline-block",
            }}
          >
            DEPOIMENTOS
          </span>
          <h2
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              margin: "0",
              padding: "0",
              lineHeight: "0.9",
            }}
          >
            <span
              style={{
                fontFamily: '"Bebas Neue", sans-serif',
                fontSize: "78px",
                color: "#ffffff",
                margin: "0 0 -5px 0",
              }}
            >
              O QUE AS
            </span>

            <span
              style={{
                fontFamily: '"Bebas Neue", sans-serif',
                fontSize: "85px",
                color: "#8a2be2",
                margin: "0 0 -5px 0",
                letterSpacing: "1px",
              }}
            >
              MEIVE GIRLS
            </span>

            <span
              style={{
                fontFamily: '"Bebas Neue", sans-serif',
                fontSize: "78px",
                color: "#ffffff",
                margin: "0",
              }}
            >
              DIZEM
            </span>
          </h2>
        </div>

        <div className="testimonials-grid">
          {/* Card 1 */}
          <div className="testimonial-card">
            <div className="stars">★★★★★</div>
            <p className="testimonial-text">
              "Fiz volume russo e não tem volta. A Meive arrasa demais, tudo
              perfeito!"
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
              "Acordei pronta. Melhor decisão da minha vida foi descobrir o
              Meive Beauty Studio."
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
              "Fora o resultado incrível, o espaço é lindo e o atendimento é
              impecável."
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
            <span
              style={{
                fontFamily: '"DM Sans", sans-serif !important',
                color: "#ada9b1",
                fontSize: "15px",
              }}
            >
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
                <input
                  type="text"
                  id="nome"
                  placeholder="Digite seu nome"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="whatsapp">SEU WHATSAPP</label>
                <input
                  type="text"
                  id="whatsapp"
                  placeholder="(11) 94487-4969"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div className="form-group custom-select-container">
                <label htmlFor="servico">QUAL SERVIÇO VOCÊ DESEJA?</label>

                {/* Caixa que simula o select fechado */}
                <div
                  className={`custom-select-trigger ${servicoSelecionado ? "selected" : ""}`}
                  onClick={() => setIsOpen(!isOpen)}
                >
                  <span>{nomeServicoLabel}</span>
                  <svg
                    className={`select-arrow ${isOpen ? "open" : ""}`}
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>

                {/* Input escondido para manter a obrigatoriedade no form */}
                <input
                  type="hidden"
                  name="servico"
                  value={servicoSelecionado}
                  required
                />

                {/* Lista de opções customizada */}
                {isOpen && (
                  <div className="custom-options-list">
                    <div
                      className="custom-option"
                      onClick={() =>
                        selecionarServico(
                          "volume-russo",
                          "Volume Russo (R$ 280)",
                        )
                      }
                    >
                      Volume Russo (R$ 280)
                    </div>
                    <div
                      className="custom-option"
                      onClick={() =>
                        selecionarServico("fio-a-fio", "Fio a Fio (R$ 180)")
                      }
                    >
                      Fio a Fio (R$ 180)
                    </div>
                    <div
                      className="custom-option"
                      onClick={() =>
                        selecionarServico("hibrido", "Híbrido (R$ 230)")
                      }
                    >
                      Híbrido (R$ 230)
                    </div>
                    <div
                      className="custom-option"
                      onClick={() =>
                        selecionarServico(
                          "manutencao",
                          "Manutenção (A partir de R$ 100)",
                        )
                      }
                    >
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
                <span>Ter - Sex</span>
                <span className="highlight-time">13h às 21h</span>
              </li>
              <li>
                <span>Sábado</span>
                <span className="highlight-time">9h às 1h</span>
              </li>
              <li>
                <span>Dom - Seg</span>
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
      {/* BOTÃO FLUTUANTE DE REDES SOCIAIS / WHATSAPP */}
      <div className="floating-socials-container">
        <div className="floating-socials-menu">
          {/* Ícone TikTok */}
          <a
            href="https://tiktok.com"
            target="_blank"
            rel="noreferrer"
            className="floating-btn tiktok"
            aria-label="TikTok"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-2.09-2.78V9.39a6.34 6.34 0 0 0-1.36.15 6.37 6.37 0 1 0 6.9 6.33V8.83a8.3 8.3 0 0 0 4.17 1.25V6.69z" />
            </svg>
          </a>

          {/* Ícone Instagram */}
          <a
            href="https://www.instagram.com/nineris.studio/"
            target="_blank"
            rel="noreferrer"
            className="floating-btn instagram"
            aria-label="Instagram"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </a>

          {/* Ícone WhatsApp (Ação Secundária) */}
          <a
            href="https://wa.me/+5511944874969"
            target="_blank"
            rel="noreferrer"
            className="floating-btn whatsapp-sub"
            aria-label="WhatsApp Chat"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
            </svg>
          </a>
        </div>

        {/* Botão Principal Flutuante (Gatilho com Imagem) */}
        <button className="floating-main-btn" aria-label="Abrir redes sociais">
          <img
            src={imagem}
            alt="Meive Beauty"
            className="floating-main-img"
          />
        </button>
      </div>
    </main>
  );
}

export default App;
