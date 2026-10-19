import React, { useMemo, useState } from "react";
import "./AdminDashboard.css"; // sidebar, header, botões, avatar e status reaproveitados
import "./AdminAgenda.css";

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
  plus: (
    <svg {...iconProps} width="12" height="12" strokeWidth="1.8">
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
};

/* ---------- Dados (troque por chamadas à sua API / Supabase) ---------- */
const STATUS_LABEL = {
  concluded: "CONCLUÍDO",
  ongoing: "EM ATENDIMENTO",
  confirmed: "CONFIRMADO",
};

// Agendamentos mockados por dia da semana (0 = segunda ... 5 = sábado)
const MOCK_BY_WEEKDAY = [
  [
    { time: "09:00", initials: "LP", name: "Larissa Pires", service: "Volume Russo", duration: "2h", price: "R$ 280", status: "confirmed" },
    { time: "13:00", initials: "TS", name: "Taís Santos", service: "Manutenção", duration: "2h", price: "R$ 140", status: "confirmed" },
    { time: "16:00", initials: "NF", name: "Natália Freitas", service: "Lash Lifting", duration: "2h", price: "R$ 150", status: "confirmed" },
  ],
  [
    { time: "09:00", initials: "MC", name: "Marina Castro", service: "Volume Brasileiro", duration: "2h", price: "R$ 230", status: "confirmed" },
    { time: "11:30", initials: "RB", name: "Renata Barros", service: "Manutenção", duration: "2h", price: "R$ 140", status: "confirmed" },
    { time: "14:30", initials: "PL", name: "Paula Lima", service: "Volume Russo", duration: "2h", price: "R$ 280", status: "confirmed" },
    { time: "17:00", initials: "DG", name: "Daniela Gomes", service: "Lash Lifting", duration: "2h", price: "R$ 150", status: "confirmed" },
  ],
  [
    { time: "09:00", initials: "CR", name: "Camila Rodrigues", service: "Volume Russo", duration: "2h", price: "R$ 280", status: "concluded" },
    { time: "11:30", initials: "BA", name: "Bianca Alves", service: "Manutenção", duration: "2h", price: "R$ 140", status: "ongoing" },
    { time: "14:30", initials: "JM", name: "Juliana Mendes", service: "Volume Brasileiro", duration: "2h", price: "R$ 230", status: "confirmed" },
    { time: "17:00", initials: "AC", name: "Aline Costa", service: "Lash Lifting", duration: "2h", price: "R$ 150", status: "confirmed" },
  ],
  [
    { time: "10:00", initials: "FR", name: "Fernanda Reis", service: "Volume Brasileiro", duration: "2h", price: "R$ 230", status: "confirmed" },
    { time: "13:30", initials: "GM", name: "Gabriela Melo", service: "Manutenção", duration: "2h", price: "R$ 140", status: "confirmed" },
    { time: "16:00", initials: "IS", name: "Isabela Souza", service: "Volume Russo", duration: "2h", price: "R$ 280", status: "confirmed" },
  ],
  [
    { time: "09:00", initials: "VA", name: "Vanessa Araújo", service: "Lash Lifting", duration: "2h", price: "R$ 150", status: "confirmed" },
    { time: "11:30", initials: "KT", name: "Karen Teixeira", service: "Volume Russo", duration: "2h", price: "R$ 280", status: "confirmed" },
    { time: "14:30", initials: "SO", name: "Sabrina Oliveira", service: "Manutenção", duration: "2h", price: "R$ 140", status: "confirmed" },
    { time: "17:00", initials: "LM", name: "Letícia Moura", service: "Volume Brasileiro", duration: "2h", price: "R$ 230", status: "confirmed" },
  ],
  [
    { time: "09:00", initials: "EC", name: "Eduarda Campos", service: "Volume Russo", duration: "2h", price: "R$ 280", status: "confirmed" },
    { time: "11:30", initials: "HB", name: "Helena Batista", service: "Manutenção", duration: "2h", price: "R$ 140", status: "confirmed" },
  ],
];

const NEXT_FREE_SLOT = "18:30";

/* ---------- Helpers ---------- */
const WEEK_LABELS = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];

function getMonday(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

const monthName = (d) => d.toLocaleDateString("pt-BR", { month: "long" });

function formatLongDate(d) {
  // QUARTA-FEIRA, 12 DE JUNHO
  return d
    .toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })
    .toUpperCase();
}

function formatShortDate(d) {
  // QUARTA, 12 DE JUNHO
  return formatLongDate(d).replace(/^(\S+?)-FEIRA/, "$1");
}

function formatRange(start, end) {
  const sameMonth = start.getMonth() === end.getMonth();
  const left = sameMonth
    ? `${start.getDate()}`
    : `${start.getDate()} ${monthName(start).slice(0, 3)}`;
  return `${left} — ${end.getDate()} ${monthName(end)}, ${end.getFullYear()}`.toUpperCase();
}

const horarios = (n) => `${n} ${n === 1 ? "horário" : "horários"}`;

/* ---------- Painel de um dia ---------- */
function DayPanel({ date, appointments }) {
  const total = appointments.length;

  return (
    <div className="agenda-day">
      <div className="agenda-day-head">
        <div>
          <span className="agenda-day-date">{formatShortDate(date)}</span>
          <strong className="agenda-day-count">
            {total} {total === 1 ? "atendimento" : "atendimentos"}
          </strong>
        </div>

        <div className="agenda-legend">
          <span className="agenda-legend-item">
            <i className="agenda-dot agenda-dot--free" /> Horário disponível
          </span>
          <span className="agenda-legend-item">
            <i className="agenda-dot agenda-dot--busy" /> Confirmado
          </span>
        </div>
      </div>

      <ul className="agenda-timeline">
        {appointments.map((a) => (
          <li key={a.time} className="agenda-row">
            <span className="agenda-time">{a.time}</span>
            <span
              className={`agenda-marker ${a.status === "ongoing" ? "is-live" : ""}`}
              aria-hidden="true"
            />
            <div className="dash-avatar agenda-avatar">{a.initials}</div>
            <div className="dash-appointment-info">
              <strong>{a.name}</strong>
              <span>
                {a.service} · {a.duration}
              </span>
            </div>
            <span className="agenda-price">{a.price}</span>
            <span className={`dash-status dash-status--${a.status}`}>
              {STATUS_LABEL[a.status]}
            </span>
            <button type="button" className="dash-more" aria-label={`Mais opções de ${a.name}`}>
              •••
            </button>
          </li>
        ))}

        <li className="agenda-free">
          <span className="agenda-free-time">{NEXT_FREE_SLOT}</span>
          <button type="button" className="agenda-free-btn" aria-label="Adicionar agendamento">
            {Icons.plus}
          </button>
          <span className="agenda-free-label">HORÁRIO DISPONÍVEL</span>
        </li>
      </ul>
    </div>
  );
}

/* ---------- Componente ---------- */
export default function AdminAgenda() {
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [selected, setSelected] = useState(() => Math.min((new Date().getDay() + 6) % 7, 5));
  const [view, setView] = useState("week"); // "week" | "list"

  const days = useMemo(
    () =>
      WEEK_LABELS.map((label, i) => {
        const date = addDays(weekStart, i);
        return { label, date, appointments: MOCK_BY_WEEKDAY[i] };
      }),
    [weekStart]
  );

  const current = days[selected];

  return (
    <main className="dash-main">
      <header className="dash-header">
        <div>
          <span className="dash-date">{formatLongDate(current.date)}</span>
          <h1 className="dash-title">AGENDA</h1>
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

      {/* ---- Barra de navegação da semana ---- */}
      <div className="agenda-toolbar">
        <div className="agenda-range">
          <button
            type="button"
            aria-label="Semana anterior"
            onClick={() => setWeekStart((w) => addDays(w, -7))}
          >
            ‹
          </button>
          <span>{formatRange(days[0].date, days[5].date)}</span>
          <button
            type="button"
            aria-label="Próxima semana"
            onClick={() => setWeekStart((w) => addDays(w, 7))}
          >
            ›
          </button>
        </div>

        <div className="agenda-toggle" role="tablist" aria-label="Modo de visualização">
          <button
            type="button"
            role="tab"
            aria-selected={view === "week"}
            className={view === "week" ? "is-active" : ""}
            onClick={() => setView("week")}
          >
            SEMANA
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === "list"}
            className={view === "list" ? "is-active" : ""}
            onClick={() => setView("list")}
          >
            LISTA
          </button>
        </div>
      </div>

      {/* ---- Painel principal ---- */}
      <section className="agenda-panel" aria-label="Agenda da semana">
        {view === "week" ? (
          <>
            <div className="agenda-week" role="tablist" aria-label="Dias da semana">
              {days.map((d, i) => (
                <button
                  key={d.label}
                  type="button"
                  role="tab"
                  aria-selected={selected === i}
                  className={`agenda-weekday ${selected === i ? "is-active" : ""}`}
                  onClick={() => setSelected(i)}
                >
                  <span className="agenda-weekday-label">{d.label}</span>
                  <strong className="agenda-weekday-number">{d.date.getDate()}</strong>
                  <span className="agenda-weekday-count">{horarios(d.appointments.length)}</span>
                </button>
              ))}
            </div>

            <DayPanel date={current.date} appointments={current.appointments} />
          </>
        ) : (
          days.map((d) => (
            <DayPanel key={d.label} date={d.date} appointments={d.appointments} />
          ))
        )}
      </section>
    </main>
  );
}