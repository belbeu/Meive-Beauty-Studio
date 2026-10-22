import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./AdminDashboard.css";

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
  search: (
    <svg {...iconProps} width="20" height="20">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  ),
};

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

const API_BASE = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api").replace(/\/$/, "");

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
  const [totalClients, setTotalClients] = useState(0);
  const maxWeek = Math.max(...WEEK.map((d) => d.value));

  // Buscar total de clientes do banco via API do Django
  useEffect(() => {
    const fetchClientsCount = async () => {
      try {
        const token = localStorage.getItem("access");
        const response = await fetch(`${API_BASE}/clientes/`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (response.ok) {
          const data = await response.json();
          const results = Array.isArray(data) ? data : data.results || [];
          setTotalClients(results.length);
        }
      } catch (error) {
        console.error("Erro ao buscar total de clientes para o dashboard:", error);
      }
    };

    fetchClientsCount();
  }, []);

  const STATS = [
    { label: "FATURAMENTO DO MÊS", value: "R$ 12.480", note: "+18,4%", variant: "red" },
    { label: "AGENDAMENTOS", value: "48", note: "+6 esta semana", variant: "purple" },
    { label: "NOVAS CLIENTES", value: totalClients.toString(), note: "Total no banco", variant: "dark" },
    { label: "TICKET MÉDIO", value: "R$ 260", note: "+R$ 18", variant: "dark" },
  ];

  return (
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
            <Link to="/admin/agenda" className="dash-link">
              VER AGENDA COMPLETA
            </Link>
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
  );
}