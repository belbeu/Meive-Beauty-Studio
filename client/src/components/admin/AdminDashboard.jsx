import React, { useState } from "react";
import { useAuth } from "./AuthContext";
import "./AdminDashboard.css";

/* ---------- Ícones (SVG inline, sem dependências) ---------- */
const iconProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

const Icons = {
  grid: (
    <svg {...iconProps}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  calendar: (
    <svg {...iconProps}>
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M3 9h18M8 2v4M16 2v4" />
    </svg>
  ),
  users: (
    <svg {...iconProps}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
      <path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.3c2.2.7 3.5 2.6 3.5 5.7" />
    </svg>
  ),
  box: (
    <svg {...iconProps}>
      <path d="M12 2.5 21 7v10l-9 4.5L3 17V7l9-4.5Z" />
      <path d="M3 7l9 4.5L21 7M12 11.5v10" />
    </svg>
  ),
  settings: (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
    </svg>
  ),
  search: (
    <svg {...iconProps} width="20" height="20">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  ),
};

/* ---------- Dados (troque por chamadas à sua API / Supabase) ---------- */
const MENU = [
  { id: "overview", label: "Visão geral", icon: Icons.grid },
  { id: "agenda", label: "Agenda", icon: Icons.calendar },
  { id: "clients", label: "Clientes", icon: Icons.users },
  { id: "products", label: "Produtos", icon: Icons.box },
  { id: "settings", label: "Configurações", icon: Icons.settings },
];

const STATS = [
  { label: "FATURAMENTO DO MÊS", value: "R$ 12.480", note: "+18,4%", variant: "red" },
  { label: "AGENDAMENTOS", value: "48", note: "+6 esta semana", variant: "purple" },
  { label: "NOVAS CLIENTES", value: "14", note: "+21% no mês", variant: "dark" },
  { label: "TICKET MÉDIO", value: "R$ 260", note: "+R$ 18", variant: "dark" },
];

const APPOINTMENTS = [
  { time: "09:00", initials: "CR", name: "Camila Rodrigues", service: "Volume Russo", price: "R$ 280", status: "concluded" },
  { time: "11:30", initials: "BA", name: "Bianca Alves", service: "Manutenção", price: "R$ 140", status: "ongoing" },
  { time: "14:30", initials: "JM", name: "Juliana Mendes", service: "Volume Brasileiro", price: "R$ 230", status: "confirmed" },
  { time: "17:00", initials: "AC", name: "Aline Costa", service: "Lash Lifting", price: "R$ 150", status: "confirmed" },
];

const STATUS_LABEL = {
  concluded: "CONCLUÍDO",
  ongoing: "EM ATENDIMENTO",
  confirmed: "CONFIRMADO",
};

const TOP_PRODUCTS = [
  { rank: "01", name: "Sérum Lash Power", units: 12, total: "R$ 1068", image: null },
  { rank: "02", name: "Clean Girl Foam", units: 9, total: "R$ 612", image: null },
  { rank: "03", name: "Removedor Oil-Free", units: 6, total: "R$ 270", image: null },
];

const WEEK = [
  { day: "SEG", value: 5 },
  { day: "TER", value: 8 },
  { day: "QUA", value: 6 },
  { day: "QUI", value: 9 },
  { day: "SEX", value: 7.5 },
  { day: "SÁB", value: 3.5 },
];

/* ---------- Helpers ---------- */
function formatToday() {
  const text = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return text.replace(",", "").toUpperCase().replace(/^(\S+) (.*)$/, "$1, $2");
}

/* ---------- Componente ---------- */
export default function AdminDashboard() {
  const { logout } = useAuth();
  const [active, setActive] = useState("overview");

  const maxWeek = Math.max(...WEEK.map((d) => d.value));

  return (
    <div className="dash-container">
      {/* ============ SIDEBAR ============ */}
      <aside className="dash-sidebar">
        <div className="dash-brand">
          <span className="dash-brand-name">MEIVE</span>
          <span className="dash-brand-badge">ADMIN</span>
        </div>

        <nav className="dash-nav" aria-label="Navegação do painel">
          {MENU.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`dash-nav-item ${active === item.id ? "is-active" : ""}`}
              onClick={() => setActive(item.id)}
              aria-current={active === item.id ? "page" : undefined}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="dash-user">
          <div className="dash-avatar dash-avatar--lg">MB</div>
          <div className="dash-user-info">
            <strong>Meive Beauty</strong>
            <button type="button" className="dash-logout" onClick={logout}>
              Sair do painel
            </button>
          </div>
        </div>
      </aside>

      {/* ============ CONTEÚDO ============ */}
      <main className="dash-main">
        <header className="dash-header">
          <div>
            <span className="dash-date">{formatToday()}</span>
            <h1 className="dash-title">VISÃO GERAL</h1>
          </div>

          <div className="dash-header-actions">
            <button type="button" className="dash-icon-btn" aria-label="Buscar">
              {Icons.search}
            </button>
            <button type="button" className="dash-primary-btn">
              + NOVO AGENDAMENTO
            </button>
          </div>
        </header>

        {/* ---- Cards de métricas ---- */}
        <section className="dash-stats" aria-label="Indicadores do mês">
          {STATS.map((stat) => (
            <article key={stat.label} className={`dash-stat dash-stat--${stat.variant}`}>
              <span className="dash-stat-label">{stat.label}</span>
              <strong className="dash-stat-value">{stat.value}</strong>
              <span className="dash-stat-note">{stat.note}</span>
            </article>
          ))}
        </section>

        {/* ---- Agenda + Mais vendidos ---- */}
        <section className="dash-grid">
          <article className="dash-panel">
            <div className="dash-panel-head">
              <div>
                <h2 className="dash-panel-title">AGENDA DE HOJE</h2>
                <p className="dash-panel-sub">5 atendimentos · R$ 1.150 previstos</p>
              </div>
              <a href="#agenda" className="dash-link" onClick={() => setActive("agenda")}>
                VER AGENDA COMPLETA
              </a>
            </div>

            <ul className="dash-list">
              {APPOINTMENTS.map((a) => (
                <li key={a.time} className="dash-appointment">
                  <span className="dash-appointment-time">{a.time}</span>
                  <div className="dash-avatar">{a.initials}</div>
                  <div className="dash-appointment-info">
                    <strong>{a.name}</strong>
                    <span>{a.service}</span>
                  </div>
                  <span className="dash-appointment-price">{a.price}</span>
                  <span className={`dash-status dash-status--${a.status}`}>
                    {STATUS_LABEL[a.status]}
                  </span>
                  <button type="button" className="dash-more" aria-label={`Mais opções de ${a.name}`}>
                    •••
                  </button>
                </li>
              ))}
            </ul>
          </article>

          <article className="dash-panel">
            <div className="dash-panel-head">
              <div>
                <h2 className="dash-panel-title">MAIS VENDIDOS</h2>
                <p className="dash-panel-sub">Últimos 30 dias</p>
              </div>
            </div>

            <ul className="dash-list">
              {TOP_PRODUCTS.map((p) => (
                <li key={p.rank} className="dash-product">
                  <span className="dash-product-rank">{p.rank}</span>
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="dash-product-img" />
                  ) : (
                    <div className="dash-product-img dash-product-img--placeholder" />
                  )}
                  <div className="dash-product-info">
                    <strong>{p.name}</strong>
                    <span>{p.units} unidades</span>
                  </div>
                  <span className="dash-product-total">{p.total}</span>
                </li>
              ))}
            </ul>
          </article>
        </section>

        {/* ---- Visão da semana ---- */}
        <section className="dash-panel dash-week">
          <div className="dash-panel-head">
            <div>
              <h2 className="dash-panel-title">VISÃO DA SEMANA</h2>
              <p className="dash-panel-sub">Agendamentos confirmados</p>
            </div>
            <div className="dash-week-total">
              <strong>32</strong>
              <span>ATENDIMENTOS</span>
            </div>
          </div>

          <div className="dash-chart" role="img" aria-label="Gráfico de agendamentos por dia da semana">
            {WEEK.map((d) => (
              <div key={d.day} className="dash-bar-col">
                <div className="dash-bar-track">
                  <div
                    className="dash-bar"
                    style={{ height: `${(d.value / maxWeek) * 100}%` }}
                    title={`${d.value} atendimentos`}
                  />
                </div>
                <span className="dash-bar-label">{d.day}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}