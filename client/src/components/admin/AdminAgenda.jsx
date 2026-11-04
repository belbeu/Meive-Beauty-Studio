import React, { useMemo, useState, useEffect } from "react";
import "./AdminDashboard.css"; // sidebar, header, botões, avatar e status reaproveitados
import "./AdminAgenda.css";
import { api } from "../../api";
import NovoAgendamentoModal from "./NovoAgendamentoModal";

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
  calendar: (
    <svg {...iconProps} width="18" height="18">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  close: (
    <svg {...iconProps} width="16" height="16">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  ),
  plus: (
    <svg {...iconProps} width="12" height="12" strokeWidth="1.8">
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
};

const STATUS_LABEL = {
  concluded: "CONCLUÍDO",
  ongoing: "EM ATENDIMENTO",
  confirmed: "CONFIRMADO",
};

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
  return d
    .toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })
    .toUpperCase();
}

function formatShortDate(d) {
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
function DayPanel({ date, appointments, onOpenNew, isDataPassada }) {
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
          <li key={a.time + a.name + a.dateStr} className="agenda-row">
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
              {STATUS_LABEL[a.status] || "CONFIRMADO"}
            </span>
            <button type="button" className="dash-more" aria-label={`Mais opções de ${a.name}`}>
              •••
            </button>
          </li>
        ))}

        {/* Só exibe o horário disponível/botão de novo agendamento se NÃO for data passada */}
        {!isDataPassada && (
          <li className="agenda-free">
            <span className="agenda-free-time">{NEXT_FREE_SLOT}</span>
            <button type="button" className="agenda-free-btn" aria-label="Adicionar agendamento" onClick={onOpenNew}>
              {Icons.plus}
            </button>
            <span className="agenda-free-label">HORÁRIO DISPONÍVEL</span>
          </li>
        )}
      </ul>
    </div>
  );
}

/* ---------- Componente Principal ---------- */
export default function AdminAgenda() {
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [selected, setSelected] = useState(() => Math.min((new Date().getDay() + 6) % 7, 5));
  const [view, setView] = useState("week"); // "week" | "list"
  
  const [agendamentosDoBanco, setAgendamentosDoBanco] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estados para o seletor de data (calendário)
  const [selectedDateFilter, setSelectedDateFilter] = useState("");

  // Buscar agendamentos reais da API
  const carregarAgenda = async () => {
    try {
      const data = await api("/agendamentos/");
      const resultados = Array.isArray(data) ? data : data.results || [];
      setAgendamentosDoBanco(resultados);
    } catch (err) {
      console.error("Erro ao carregar agendamentos:", err);
    }
  };

  useEffect(() => {
    carregarAgenda();
  }, []);

  // Manipular a escolha da data no calendário
  const handleDateChange = (e) => {
    const val = e.target.value; // Formato YYYY-MM-DD
    setSelectedDateFilter(val);
    if (val) {
      const [ano, mes, dia] = val.split("-");
      const d = new Date(ano, mes - 1, dia);
      setWeekStart(getMonday(d));
      setSelected(Math.min((d.getDay() + 6) % 7, 5));
    }
  };

  // Dias gerados com base na semana ou filtrados pela data exata
  const days = useMemo(() => {
    if (selectedDateFilter) {
      const filtrados = agendamentosDoBanco.filter((ag) => {
        return ag.data_agendamento && ag.data_agendamento.startsWith(selectedDateFilter);
      });

      const [ano, mes, dia] = selectedDateFilter.split("-");
      const dateObj = new Date(ano, mes - 1, dia);

      const appointmentsDoDia = filtrados
        .map((ag) => {
          const horaStr = ag.data_agendamento.split("T")[1]?.substring(0, 5) || "00:00";
          const nomeCliente = ag.cliente_nome || "Cliente";
          const iniciais = nomeCliente
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();

          return {
            time: horaStr,
            initials: iniciais || "CL",
            name: nomeCliente,
            service: ag.servico_nome || "Serviço",
            duration: "2h",
            price: `R$ ${ag.valor || 0}`,
            status: ag.status || "confirmed",
            dateStr: selectedDateFilter
          };
        })
        .sort((a, b) => a.time.localeCompare(b.time));

      return [
        {
          label: dateObj.toLocaleDateString("pt-BR", { weekday: "short" }).toUpperCase().replace(".", ""),
          date: dateObj,
          appointments: appointmentsDoDia,
        },
      ];
    }

    return WEEK_LABELS.map((label, i) => {
      const date = addDays(weekStart, i);
      const dataStr = date.toISOString().split("T")[0];

      const appointmentsDoDia = agendamentosDoBanco
        .filter((ag) => ag.data_agendamento && ag.data_agendamento.startsWith(dataStr))
        .map((ag) => {
          const horaStr = ag.data_agendamento.split("T")[1]?.substring(0, 5) || "00:00";
          const nomeCliente = ag.cliente_nome || "Cliente";
          const iniciais = nomeCliente
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();

          return {
            time: horaStr,
            initials: iniciais || "CL",
            name: nomeCliente,
            service: ag.servico_nome || "Serviço",
            duration: "2h",
            price: `R$ ${ag.valor || 0}`,
            status: ag.status || "confirmed",
            dateStr: dataStr
          };
        })
        .sort((a, b) => a.time.localeCompare(b.time));

      return { label, date, appointments: appointmentsDoDia };
    });
  }, [weekStart, agendamentosDoBanco, selectedDateFilter]);

  const current = days[selected] || days[0];

  // Identifica se a data visualizada atualmente é anterior ao dia de hoje
  const hojeStr = new Date().toISOString().split("T")[0];
  const dataAtualPainel = current?.date ? current.date.toISOString().split("T")[0] : hojeStr;
  const isDataPassada = dataAtualPainel < hojeStr;

  return (
    <main className="dash-main">
      <header className="dash-header">
        <div>
          <span className="dash-date">{current ? formatLongDate(current.date) : "AGENDA"}</span>
          <h1 className="dash-title">AGENDA</h1>
        </div>

        <div className="dash-header-actions">
          <div className="agenda-calendar-picker">
            <span className="agenda-calendar-icon" aria-hidden="true">
              {Icons.calendar}
            </span>
            <input
              type="date"
              value={selectedDateFilter}
              onChange={handleDateChange}
              title="Filtrar por data específica"
            />
            {selectedDateFilter && (
              <button
                type="button"
                className="agenda-calendar-clear"
                onClick={() => setSelectedDateFilter("")}
                aria-label="Limpar filtro de data"
                title="Mostrar semana completa"
              >
                {Icons.close}
              </button>
            )}
          </div>

          {/* Oculta o botão de novo agendamento se for data passada */}
          {!isDataPassada && (
            <button type="button" className="dash-primary-btn" onClick={() => setIsModalOpen(true)}>
              + NOVO AGENDAMENTO
            </button>
          )}
        </div>
      </header>

      {!selectedDateFilter && (
        <div className="agenda-toolbar">
          <div className="agenda-range">
            <button
              type="button"
              aria-label="Semana anterior"
              onClick={() => setWeekStart((w) => addDays(w, -7))}
            >
              ‹
            </button>
            <span>{formatRange(days[0]?.date || new Date(), days[5]?.date || new Date())}</span>
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
      )}

      <section className="agenda-panel" aria-label="Agenda de atendimentos">
        {selectedDateFilter ? (
          days.map((d) => (
            <DayPanel 
              key={d.date.toISOString()} 
              date={d.date} 
              appointments={d.appointments} 
              onOpenNew={() => setIsModalOpen(true)}
              isDataPassada={isDataPassada}
            />
          ))
        ) : view === "week" ? (
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

            {current && (
              <DayPanel 
                date={current.date} 
                appointments={current.appointments} 
                onOpenNew={() => setIsModalOpen(true)}
                isDataPassada={isDataPassada}
              />
            )}
          </>
        ) : (
          days.map((d) => {
            const dataDiaStr = d.date.toISOString().split("T")[0];
            const passada = dataDiaStr < hojeStr;
            return (
              <DayPanel 
                key={d.label} 
                date={d.date} 
                appointments={d.appointments} 
                onOpenNew={() => setIsModalOpen(true)}
                isDataPassada={passada}
              />
            );
          })
        )}
      </section>

      <NovoAgendamentoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={carregarAgenda}
      />
    </main>
  );
}