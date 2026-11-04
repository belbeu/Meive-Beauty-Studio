import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";
import { usuarioAtual, logout as fazerLogout } from "../../auth";
import { cestinhaService } from "../../services/cestinhaService";
import { api } from "../../api";
import "./ClienteDashboard.css";
import ThemeToggle from "../ThemeToggle";
import FontSizeControls from "../../theme/FontSizeControls";

const STATUS_LABEL = {
  confirmed: "CONFIRMADO",
  pending: "PENDENTE",
  concluded: "CONCLUÍDO",
  ongoing: "EM ANDAMENTO",
};

const svgProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

const ClockIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" {...svgProps}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" {...svgProps}>
    <rect x="3" y="4" width="18" height="17" rx="2" />
    <path d="M3 9h18M8 2v4M16 2v4" />
  </svg>
);

function getInitials(fullName) {
  if (!fullName) return "MG";
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function ClientDashboard() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalSairAberto, setModalSairAberto] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [cestinhaItens, setCestinhaItens] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarDados() {
      try {
        const dados = await usuarioAtual();
        setUsuario(dados);

        // Carrega a cestinha e os agendamentos em paralelo
        const [itensAPI, agendamentosAPI] = await Promise.all([
          cestinhaService.getItensAPI().catch(() => cestinhaService.getItensLocais()),
          api("/agendamentos/").catch(() => [])
        ]);

        setCestinhaItens(itensAPI);
        setAgendamentos(Array.isArray(agendamentosAPI) ? agendamentosAPI : agendamentosAPI.results || []);
      } catch (err) {
        console.error("Erro ao carregar dados do dashboard:", err);
      } finally {
        setCarregando(false);
      }
    }

    carregarDados();
  }, [navigate]);

  const confirmarLogout = () => {
    fazerLogout();
    navigate("/login");
  };

  if (carregando) {
    return (
      <div className="client-page" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100%" }}>
        <p>Carregando sua conta...</p>
      </div>
    );
  }

  const fullName = usuario?.nome || "Meive Girl";
  const name = fullName.split(/\s+/)[0];
  const initials = getInitials(fullName);
  const POINTS = { current: 320, goal: 500, reward: "R$ 50 de desconto" };
  const percent = Math.min(100, Math.round((POINTS.current / POINTS.goal) * 100));
  const missing = Math.max(0, POINTS.goal - POINTS.current);

  const agora = new Date();

  // Separa agendamentos futuros (próximo) e históricos
  const agendamentosFuturos = agendamentos
    .filter(a => new Date(a.data_agendamento) >= agora)
    .sort((a, b) => new Date(a.data_agendamento) - new Date(b.data_agendamento));

  const proximoAgendamento = agendamentosFuturos.length > 0 ? agendamentosFuturos[0] : null;
  const historicoAgendamentos = agendamentos.filter(a => a.id_agendamento !== proximoAgendamento?.id_agendamento);

  // Formata os dados do próximo agendamento para exibição
  let proximoFormatado = null;
  if (proximoAgendamento) {
    const dataObj = new Date(proximoAgendamento.data_agendamento);
    const dia = String(dataObj.getDate()).padStart(2, "0");
    const mes = dataObj.toLocaleDateString("pt-BR", { month: "short" }).toUpperCase().replace(".", "");
    const semana = dataObj.toLocaleDateString("pt-BR", { weekday: "long" });
    const semanaCapitalizada = semana.charAt(0).toUpperCase() + semana.slice(1);
    const hora = dataObj.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    proximoFormatado = {
      day: dia,
      month: mes,
      service: proximoAgendamento.servico_nome || "Serviço",
      when: `${semanaCapitalizada}, ${hora}`,
      professional: "Meive", // ou proximoAgendamento.funcionario_nome se disponível
      status: proximoAgendamento.status || "confirmed"
    };
  }

  const ultimoItem = cestinhaItens.length > 0 ? cestinhaItens[cestinhaItens.length - 1] : null;

  return (
    <>
      <main className="client-page">
        <div className="client-wrapper">
          {/* Cabeçalho */}
          <header className="client-header">
            <div>
              <span className="client-tag">
                <i className="client-tag-line" /> MINHA CONTA
              </span>
              <h1 className="client-title">
                OI, <span>{name.toUpperCase()}.</span>
              </h1>
              <p className="client-subtitle">Seu próximo beauty moment está chegando.</p>
            </div>

            <div className="client-user">
              <ThemeToggle />
              <FontSizeControls />
              <button
                type="button"
                className="client-avatar"
                onClick={() => setMenuOpen((o) => !o)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label="Menu da conta"
              >
                {initials}
              </button>
              {menuOpen && (
                <div className="client-menu" role="menu">
                  <Link to="/" role="menuitem" onClick={() => setMenuOpen(false)}>
                    Voltar ao site
                  </Link>
                  <button 
                    type="button" 
                    role="menuitem" 
                    onClick={() => {
                      setMenuOpen(false);
                      setModalSairAberto(true);
                    }}
                  >
                    Sair
                  </button>
                </div>
              )}
            </div>
          </header>

          {/* Próximo agendamento dinâmico */}
          {proximoFormatado ? (
            <section className="client-next" aria-label="Próximo agendamento">
              <div className="client-next-date">
                <strong>{proximoFormatado.day}</strong>
                <span>{proximoFormatado.month}</span>
              </div>

              <div className="client-next-info">
                <span className="client-next-label">PRÓXIMO AGENDAMENTO</span>
                <h2>{proximoFormatado.service.toUpperCase()}</h2>
                <p>
                  <ClockIcon /> {proximoFormatado.when} · com {proximoFormatado.professional}
                </p>
              </div>

              <span className={`client-badge client-badge--${proximoFormatado.status}`}>
                {STATUS_LABEL[proximoFormatado.status] || "CONFIRMADO"}
              </span>

              <button type="button" className="client-outline-btn" onClick={() => alert(`Valor: R$ ${proximoAgendamento.valor || "0,00"}`)}>
                VER DETALHES
              </button>
            </section>
          ) : (
            <section className="client-next" aria-label="Próximo agendamento" style={{ background: "var(--surface)" }}>
              <div className="client-next-info">
                <span className="client-next-label">PRÓXIMO AGENDAMENTO</span>
                <h2>NENHUM AGENDAMENTO FUTURO</h2>
                <p>Que tal agendar seu próximo horário no estúdio?</p>
              </div>
              <button type="button" className="client-primary-btn" onClick={() => navigate("/agendar")}>
                AGENDAR AGORA
              </button>
            </section>
          )}

          {/* Agendamentos + Minha Cestinha */}
          <section className="client-grid">
            <article className="client-panel">
              <div className="client-panel-head">
                <h3>MEUS AGENDAMENTOS</h3>
                <a href="#historico" className="client-link">
                  VER HISTÓRICO
                </a>
              </div>

              {agendamentos.length === 0 ? (
                <div className="client-empty">
                  <span className="client-empty-icon">
                    <CalendarIcon />
                  </span>
                  <div className="client-empty-text">
                    <strong>Pronta para o próximo?</strong>
                    <span>Escolha seu serviço e reserve seu horário.</span>
                  </div>
                  <button
                    type="button"
                    className="client-primary-btn"
                    onClick={() => navigate("/agendar")}
                  >
                    AGENDAR
                  </button>
                </div>
              ) : (
                <ul className="client-list">
                  {historicoAgendamentos.slice(0, 3).map((a) => {
                    const dataObj = new Date(a.data_agendamento);
                    const dataFormatada = dataObj.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
                    return (
                      <li key={a.id_agendamento} className="client-row">
                        <div className="client-row-info">
                          <strong>{a.servico_nome || "Atendimento"}</strong>
                          <span>{dataFormatada}</span>
                        </div>
                        <span className={`client-badge client-badge--${a.status}`}>
                          {STATUS_LABEL[a.status] || "CONFIRMADO"}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </article>

            {/* Minha Cestinha */}
            <article className="client-panel">
              <div className="client-panel-head">
                <h3>MINHA CESTINHA</h3>
                <Link to="/cestinha" className="client-link">
                  VER TODOS
                </Link>
              </div>

              {cestinhaItens.length === 0 ? (
                <div className="client-empty">
                  <div className="client-empty-text">
                    <strong>Sua cestinha está vazia</strong>
                    <span>Explore os produtos e monte sua tierlist.</span>
                  </div>
                  <button
                    type="button"
                    className="client-primary-btn"
                    onClick={() => navigate("/minha-conta/produtos")}
                  >
                    VER PRODUTOS
                  </button>
                </div>
              ) : (
                <div className="client-order">
                  {ultimoItem?.produto?.imagem_url ? (
                    <img src={ultimoItem.produto.imagem_url} alt={ultimoItem.produto.nome} className="client-order-img" style={{ objectFit: "contain", background: "#000" }} />
                  ) : (
                    <div className="client-order-img client-order-img--placeholder" />
                  )}
                  <div className="client-order-info">
                    <span className="client-order-id">QTD: {ultimoItem.quantidade} un.</span>
                    <strong>{ultimoItem?.produto?.nome}</strong>
                    <span className="client-order-date">R$ {ultimoItem?.produto?.preco}</span>
                  </div>
                  <span className="client-badge" style={{ background: "rgba(173, 24, 56, 0.2)", color: "#ad1838" }}>
                    NA CESTA
                  </span>
                </div>
              )}
            </article>
          </section>

          {/* Clube Meive */}
          <section className="client-club" aria-label="Clube Meive">
            <div className="client-club-info">
              <span className="client-club-label">CLUBE MEIVE</span>
              <h2>
                VOCÊ TEM <span>{POINTS.current} PONTOS</span>
              </h2>
              <p>
                Faltam {missing} pontos para desbloquear {POINTS.reward}.
              </p>
            </div>

            <div className="client-progress">
              <div
                className="client-progress-track"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={POINTS.goal}
                aria-valuenow={POINTS.current}
              >
                <div className="client-progress-fill" style={{ width: `${percent}%` }} />
              </div>
              <span>
                {POINTS.current} / {POINTS.goal} PONTOS
              </span>
            </div>

            <button type="button" className="client-outline-btn">
              VER BENEFÍCIOS
            </button>
          </section>
        </div>
      </main>

      {modalSairAberto && (
        <div className="client-modal-overlay">
          <div className="client-modal-content" style={{ background: "#121212", border: "1px solid var(--border)", padding: "36px 32px" }}>
            <h3>DESEJA SAIR?</h3>
            <p>Tem certeza de que deseja encerrar sua sessão atual?</p>
            <div className="client-modal-actions">
              <button
                type="button"
                className="client-outline-btn"
                onClick={() => setModalSairAberto(false)}
              >
                CANCELAR
              </button>
              <button
                type="button"
                className="client-primary-btn"
                onClick={confirmarLogout}
              >
                SIM, SAIR
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}