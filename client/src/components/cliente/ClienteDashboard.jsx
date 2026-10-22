import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";
import { usuarioAtual, logout as fazerLogout } from "../../auth";
import "./ClienteDashboard.css";

/* ---------- Dados mockados (troque pela API/back depois) ---------- */
const NEXT_APPOINTMENT = {
  day: "18",
  month: "JUN",
  service: "Volume Russo",
  when: "Quarta-feira, 14:30",
  professional: "Meive",
  status: "confirmed",
};

const APPOINTMENTS = [];

const ORDERS = [
  {
    id: "MB1024",
    product: "Sérum Lash Power",
    deliveredAt: "02 Jun",
    status: "delivered",
    image: null,
  },
];

const POINTS = { current: 320, goal: 500, reward: "R$ 50 de desconto" };

const STATUS_LABEL = {
  confirmed: "CONFIRMADO",
  delivered: "ENTREGUE",
  pending: "PENDENTE",
};

/* ---------- Ícones ---------- */
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

/* ---------- Helpers ---------- */
function getInitials(fullName) {
  if (!fullName) return "MG";
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/* ---------- Componente ---------- */
export default function ClientDashboard() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalSairAberto, setModalSairAberto] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarDados() {
      try {
        const dados = await usuarioAtual();
        setUsuario(dados);
      } catch (err) {
        fazerLogout();
        navigate("/login");
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
      <div className="client-page" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <p>Carregando sua conta...</p>
      </div>
    );
  }

  const fullName = usuario?.nome || "Meive Girl";
  const name = fullName.split(/\s+/)[0];
  const initials = getInitials(fullName);
  const percent = Math.min(100, Math.round((POINTS.current / POINTS.goal) * 100));
  const missing = Math.max(0, POINTS.goal - POINTS.current);

  return (
    <>
      <main className="client-page">
        <div className="client-wrapper">
          {/* ---------- Cabeçalho ---------- */}
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

          {/* ---------- Próximo agendamento ---------- */}
          <section className="client-next" aria-label="Próximo agendamento">
            <div className="client-next-date">
              <strong>{NEXT_APPOINTMENT.day}</strong>
              <span>{NEXT_APPOINTMENT.month}</span>
            </div>

            <div className="client-next-info">
              <span className="client-next-label">PRÓXIMO AGENDAMENTO</span>
              <h2>{NEXT_APPOINTMENT.service.toUpperCase()}</h2>
              <p>
                <ClockIcon /> {NEXT_APPOINTMENT.when} · com {NEXT_APPOINTMENT.professional}
              </p>
            </div>

            <span className={`client-badge client-badge--${NEXT_APPOINTMENT.status}`}>
              {STATUS_LABEL[NEXT_APPOINTMENT.status]}
            </span>

            <button type="button" className="client-outline-btn">
              VER DETALHES
            </button>
          </section>

          {/* ---------- Agendamentos + Pedidos ---------- */}
          <section className="client-grid">
            <article className="client-panel">
              <div className="client-panel-head">
                <h3>MEUS AGENDAMENTOS</h3>
                <a href="#historico" className="client-link">
                  VER HISTÓRICO
                </a>
              </div>

              {APPOINTMENTS.length === 0 ? (
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
                    onClick={() => navigate("/")}
                  >
                    AGENDAR
                  </button>
                </div>
              ) : (
                <ul className="client-list">
                  {APPOINTMENTS.map((a) => (
                    <li key={a.id} className="client-row">
                      <div className="client-row-info">
                        <strong>{a.service}</strong>
                        <span>{a.when}</span>
                      </div>
                      <span className={`client-badge client-badge--${a.status}`}>
                        {STATUS_LABEL[a.status]}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </article>

            <article className="client-panel">
              <div className="client-panel-head">
                <h3>MEUS PEDIDOS</h3>
                <a href="#pedidos" className="client-link">
                  VER TODOS
                </a>
              </div>

              <ul className="client-list">
                {ORDERS.map((o) => (
                  <li key={o.id} className="client-order">
                    {o.image ? (
                      <img src={o.image} alt={o.product} className="client-order-img" />
                    ) : (
                      <div className="client-order-img client-order-img--placeholder" />
                    )}
                    <div className="client-order-info">
                      <span className="client-order-id">PEDIDO #{o.id}</span>
                      <strong>{o.product}</strong>
                      <span className="client-order-date">Entregue em {o.deliveredAt}</span>
                    </div>
                    <span className="client-badge client-badge--delivered">
                      {STATUS_LABEL[o.status]}
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          </section>

          {/* ---------- Clube Meive ---------- */}
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

      {/* ---------- Modal de Confirmação de Saída ---------- */}
      {modalSairAberto && (
        <div className="client-modal-overlay">
          <div className="client-modal-content">
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