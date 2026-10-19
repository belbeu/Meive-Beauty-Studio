import React from "react";
import "./AdminDashboard.css"; // header, botões, painel, avatar (compartilhados)
import "./AdminClientes.css";

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
  search: (
    <svg {...iconProps} width="20" height="20">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  ),
  users: (
    <svg {...iconProps} width="20" height="20">
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
      <path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.3c2.2.7 3.5 2.6 3.5 5.7" />
    </svg>
  ),
  star: (
    <svg {...iconProps} width="20" height="20">
      <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z" />
    </svg>
  ),
  calendar: (
    <svg {...iconProps} width="20" height="20">
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M3 9h18M8 2v4M16 2v4" />
    </svg>
  ),
  chevron: (
    <svg {...iconProps} width="16" height="16">
      <path d="m9 6 6 6-6 6" />
    </svg>
  ),
};

/* ---------- Dados (troque por chamadas à sua API / Supabase) ---------- */
const STATS = [
  { icon: Icons.users, value: "186", label: "CLIENTES ATIVAS", note: "+12 este mês", variant: "red" },
  { icon: Icons.star, value: "42", label: "CLIENTES VIP", note: "23% da base", variant: "purple" },
  { icon: Icons.calendar, value: "68%", label: "RETORNO EM 30 DIAS", note: "+4,2% no mês", variant: "gray" },
];

const TOTAL_CLIENTS = 186;

const CLIENTS = [
  { id: 1, initials: "JM", name: "Juliana Mendes", phone: "(11) 99128-4450", lastVisit: "Hoje, 14:30", today: true, visits: 8, total: "R$ 1.840" },
  { id: 2, initials: "CR", name: "Camila Rodrigues", phone: "(11) 98845-2106", lastVisit: "Hoje, 09:00", today: true, visits: 12, total: "R$ 2.760" },
  { id: 3, initials: "BA", name: "Bianca Alves", phone: "(11) 99732-1184", lastVisit: "Hoje, 11:30", today: true, visits: 5, total: "R$ 980" },
  { id: 4, initials: "AC", name: "Aline Costa", phone: "(11) 98211-7630", lastVisit: "28 Mai 2026", today: false, visits: 3, total: "R$ 570" },
  { id: 5, initials: "MS", name: "Mariana Silva", phone: "(11) 99018-3327", lastVisit: "20 Mai 2026", today: false, visits: 6, total: "R$ 1.420" },
];

/* ---------- Helpers ---------- */
function formatToday() {
  return new Date()
    .toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })
    .toUpperCase();
}

/* ---------- Componente ---------- */
export default function AdminClientes() {
  return (
    <main className="dash-main">
      <header className="dash-header">
        <div>
          <span className="dash-date">{formatToday()}</span>
          <h1 className="dash-title">CLIENTES</h1>
        </div>

        <div className="dash-header-actions">
          <button type="button" className="dash-icon-btn" aria-label="Buscar">
            {Icons.search}
          </button>
          <button type="button" className="dash-primary-btn">
            + NOVA CLIENTE
          </button>
        </div>
      </header>

      {/* ---- Indicadores ---- */}
      <section className="clients-stats" aria-label="Indicadores de clientes">
        {STATS.map((s) => (
          <article key={s.label} className="clients-stat">
            <div className={`clients-stat-icon clients-stat-icon--${s.variant}`}>{s.icon}</div>
            <div className="clients-stat-body">
              <strong className="clients-stat-value">{s.value}</strong>
              <span className="clients-stat-label">{s.label}</span>
            </div>
            <span className="clients-stat-note">{s.note}</span>
          </article>
        ))}
      </section>

      {/* ---- Base de clientes ---- */}
      <section className="dash-panel clients-panel">
        <div className="dash-panel-head">
          <div>
            <h2 className="dash-panel-title">BASE DE CLIENTES</h2>
            <p className="dash-panel-sub">
              {CLIENTS.length} de {TOTAL_CLIENTS} clientes
            </p>
          </div>
          <button type="button" className="clients-export">
            EXPORTAR LISTA
          </button>
        </div>

        <div className="clients-table" role="table" aria-label="Base de clientes">
          <div className="clients-row clients-row--head" role="row">
            <span role="columnheader">CLIENTE</span>
            <span role="columnheader" className="clients-col-contact">CONTATO</span>
            <span role="columnheader" className="clients-col-last">ÚLTIMA VISITA</span>
            <span role="columnheader" className="clients-col-visits">VISITAS</span>
            <span role="columnheader" className="clients-col-total">TOTAL INVESTIDO</span>
            <span aria-hidden="true" />
          </div>

          {CLIENTS.map((c) => (
            <button key={c.id} type="button" className="clients-row clients-row--item" role="row">
              <span className="clients-name" role="cell">
                <span className="dash-avatar clients-avatar">{c.initials}</span>
                <strong>{c.name}</strong>
              </span>
              <span className="clients-phone clients-col-contact" role="cell">{c.phone}</span>
              <span
                className={`clients-last clients-col-last ${c.today ? "is-today" : ""}`}
                role="cell"
              >
                {c.lastVisit}
              </span>
              <strong className="clients-visits clients-col-visits" role="cell">{c.visits}</strong>
              <strong className="clients-total clients-col-total" role="cell">{c.total}</strong>
              <span className="clients-chevron" aria-hidden="true">{Icons.chevron}</span>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}