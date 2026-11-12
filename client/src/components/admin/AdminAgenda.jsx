import React, { useMemo, useState, useEffect } from "react";
import "./AdminDashboard.css"; // sidebar, header, botões, avatar e status reaproveitados
import "./AdminAgenda.css";
import "./AdminAvisos.css"; // cartões de aviso/confirmação (mesmo padrão das outras telas)
import { api } from "../../api";
import NovoAgendamentoModal from "./NovoAgendamentoModal";
import ReagendarModal from "./ReagendarModal";

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
  cancelled: "CANCELADO",
};

const NEXT_FREE_SLOT = "18:30";

/* ---------- Helpers ---------- */
const WEEK_LABELS = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];

const pad = (n) => String(n).padStart(2, "0");

// AAAA-MM-DD no fuso local (toISOString usa UTC e "vira o dia" à noite no Brasil)
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const brl = (v) =>
  Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const formatBR = (dataStr) => {
  const [a, m, d] = (dataStr || "").split("-");
  return a ? `${d}/${m}/${a}` : "—";
};

// Agendamento de data anterior a hoje: não pode mais ter as informações editadas
const ehPassado = (appt) => appt.dateStr < ymd(new Date());

// Só dá para reagendar enquanto o atendimento ainda está confirmado (antes de ser realizado)
const podeReagendar = (appt) => appt.status === "confirmed";

const MSG_PASSADO = "Agendamentos de datas anteriores não podem ser editados";

// "AAAA-MM-DDTHH:MM..." -> "dd/mm/aaaa às HH:MM" sem converter fuso (a data é guardada como digitada)
function formatAgendado(iso) {
  const [d = "", h = ""] = (iso || "").split("T");
  return d ? `${formatBR(d)} às ${h.substring(0, 5)}` : "—";
}

function formatDateTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return "";
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} às ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

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

// Converte um registro do banco no formato usado pela tela
function mapAgendamento(ag) {
  const [dataStr = "", resto = ""] = (ag.data_agendamento || "").split("T");
  const nomeCliente = ag.cliente_nome || "Cliente";
  const iniciais = nomeCliente
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return {
    id: ag.id_agendamento,
    time: resto.substring(0, 5) || "00:00",
    initials: iniciais || "CL",
    name: nomeCliente,
    service: ag.servico_nome || "Serviço",
    duration: "2h",
    price: brl(ag.valor),
    status: ag.status || "confirmed",
    dateStr: dataStr,
    raw: ag,
  };
}

/* ---------- Linha do tempo do agendamento ---------- */
const FLOW = ["confirmed", "ongoing", "concluded"];

const EVENTO_LABEL = {
  created: "Agendamento criado",
  confirmed: "Confirmado",
  ongoing: "Realizado",
  concluded: "Concluído",
  cancelled: "Cancelado",
  rescheduled: "Reagendado",
};

function montarLinhaDoTempo(raw) {
  let eventos = Array.isArray(raw.historico) ? raw.historico : [];

  // Agendamentos antigos (de antes do histórico): reconstrói pelo status atual, sem datas.
  if (eventos.length === 0) {
    eventos = [{ status: "created", em: raw.criado_em || null }];
    if (raw.status === "cancelled") {
      eventos.push({ status: "confirmed", em: null }, { status: "cancelled", em: null });
    } else {
      FLOW.slice(0, FLOW.indexOf(raw.status) + 1).forEach((s) => eventos.push({ status: s, em: null }));
    }
  }

  // Etapas que ainda vão acontecer (some se estiver cancelado)
  const idx = FLOW.indexOf(raw.status);
  const pendentes = raw.status === "cancelled" || idx < 0 ? [] : FLOW.slice(idx + 1);

  return { eventos, pendentes };
}

function LinhaDoTempo({ raw }) {
  const { eventos, pendentes } = montarLinhaDoTempo(raw);

  return (
    <ol className="agenda-tl">
      {eventos.map((e, i) => {
        const atual = i === eventos.length - 1;
        const reativado = e.status === "confirmed" && e.de === "cancelled";
        return (
          <li
            key={`${e.status}-${i}`}
            className={`agenda-tl-item is-done ${e.status === "cancelled" ? "is-cancelled" : ""} ${
              atual ? "is-current" : ""
            }`}
          >
            <span className="agenda-tl-dot" aria-hidden="true" />
            <div className="agenda-tl-body">
              <strong>{reativado ? "Reativado" : EVENTO_LABEL[e.status] || e.status}</strong>
              <span>{formatDateTime(e.em) || "Data não registrada"}</span>
              {e.status === "rescheduled" && (
                <span>
                  De {formatAgendado(e.de)} para {formatAgendado(e.para)}
                </span>
              )}
            </div>
          </li>
        );
      })}

      {pendentes.map((s) => (
        <li key={`pendente-${s}`} className="agenda-tl-item is-pending">
          <span className="agenda-tl-dot" aria-hidden="true" />
          <div className="agenda-tl-body">
            <strong>{EVENTO_LABEL[s]}</strong>
            <span>Aguardando</span>
          </div>
        </li>
      ))}
    </ol>
  );
}

/* ---------- Menu "•••" do agendamento ---------- */
function RowMenu({ appt, aberto, onToggle, onAction }) {
  const cancelado = appt.status === "cancelled";
  const passado = ehPassado(appt);

  return (
    <div className="agenda-menu-wrap">
      <button
        type="button"
        className="dash-more"
        aria-label={`Mais opções de ${appt.name}`}
        aria-haspopup="menu"
        aria-expanded={aberto}
        onClick={() => onToggle(appt.id)}
      >
        •••
      </button>

      {aberto && (
        <div className="agenda-menu" role="menu">
          <button type="button" role="menuitem" onClick={() => onAction("details", appt)}>
            Ver detalhes
          </button>
          <button
            type="button"
            role="menuitem"
            disabled={passado}
            title={passado ? MSG_PASSADO : undefined}
            onClick={() => onAction("edit", appt)}
          >
            Editar
          </button>
          {podeReagendar(appt) && (
            <button type="button" role="menuitem" onClick={() => onAction("reschedule", appt)}>
              Reagendar
            </button>
          )}
          {cancelado ? (
            <button type="button" role="menuitem" onClick={() => onAction("reactivate", appt)}>
              Reativar
            </button>
          ) : (
            <button type="button" role="menuitem" onClick={() => onAction("cancel", appt)}>
              Cancelar
            </button>
          )}
          <button type="button" role="menuitem" className="is-danger" onClick={() => onAction("delete", appt)}>
            Excluir
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- Faixa dos dias da semana ---------- */
function WeekTabs({ days, selected, onSelect }) {
  return (
    <div className="agenda-week" role="tablist" aria-label="Dias da semana">
      {days.map((d, i) => (
        <button
          key={d.label}
          type="button"
          role="tab"
          aria-selected={selected === i}
          className={`agenda-weekday ${selected === i ? "is-active" : ""}`}
          onClick={() => onSelect(i)}
        >
          <span className="agenda-weekday-label">{d.label}</span>
          <strong className="agenda-weekday-number">{d.date.getDate()}</strong>
          <span className="agenda-weekday-count">{horarios(d.appointments.length)}</span>
        </button>
      ))}
    </div>
  );
}

/* ---------- Painel de um dia ---------- */
function DayPanel({ date, appointments, onOpenNew, isDataPassada, menuId, onToggleMenu, onAction }) {
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
          <li
            key={a.id}
            className={`agenda-row ${a.status === "cancelled" ? "is-cancelled" : ""}`}
          >
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
            <RowMenu appt={a} aberto={menuId === a.id} onToggle={onToggleMenu} onAction={onAction} />
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

/* ---------- Aba DETALHES: lista do dia + linha do tempo ---------- */
function DetalhesDoDia({ date, appointments, detailId, onSelect, onAction }) {
  const atual = appointments.find((a) => a.id === detailId) || appointments[0];

  if (!atual) {
    return (
      <div className="agenda-details-empty">
        <span className="agenda-day-date">{formatShortDate(date)}</span>
        <p>Nenhum atendimento neste dia.</p>
      </div>
    );
  }

  const raw = atual.raw;
  const valor = Number(raw.valor || 0);
  const sinal = Number(raw.sinal_pago || 0);
  const restante = Math.max(valor - sinal, 0);
  const cancelado = atual.status === "cancelled";
  const passado = ehPassado(atual);

  return (
    <div className="agenda-details">
      <aside className="agenda-details-list" aria-label="Atendimentos do dia">
        {appointments.map((a) => (
          <button
            key={a.id}
            type="button"
            className={`agenda-details-item ${a.id === atual.id ? "is-active" : ""} ${
              a.status === "cancelled" ? "is-cancelled" : ""
            }`}
            onClick={() => onSelect(a.id)}
          >
            <span className="agenda-details-time">{a.time}</span>
            <span className="agenda-details-who">
              <strong>{a.name}</strong>
              <span>{a.service}</span>
            </span>
            <span className={`agenda-chip agenda-chip--${a.status}`}>{STATUS_LABEL[a.status] || "CONFIRMADO"}</span>
          </button>
        ))}
      </aside>

      <section className="agenda-details-card" aria-label={`Detalhes do agendamento de ${atual.name}`}>
        <div className="agenda-details-head">
          <div className="agenda-details-person">
            <div className="dash-avatar agenda-avatar">{atual.initials}</div>
            <div>
              <strong className="agenda-details-name">{atual.name}</strong>
              <span className="agenda-details-service">{atual.service}</span>
            </div>
          </div>
          <span className={`agenda-chip agenda-chip--${atual.status}`}>
            {STATUS_LABEL[atual.status] || "CONFIRMADO"}
          </span>
        </div>

        <div className="agenda-info-grid">
          <div>
            <span>DATA</span>
            <strong>{formatBR(atual.dateStr)}</strong>
          </div>
          <div>
            <span>HORÁRIO</span>
            <strong>{atual.time}</strong>
          </div>
          <div>
            <span>VALOR TOTAL</span>
            <strong>{brl(valor)}</strong>
          </div>
          <div>
            <span>SINAL PAGO</span>
            <strong>{brl(sinal)}</strong>
          </div>
          <div>
            <span>RESTANTE</span>
            <strong>{brl(restante)}</strong>
          </div>
        </div>

        <div>
          <h3 className="agenda-details-subtitle">LINHA DO TEMPO</h3>
          <LinhaDoTempo raw={raw} />
        </div>

        <div className="agenda-details-actions">
          <button
            type="button"
            className="agenda-btn-ghost"
            disabled={passado}
            title={passado ? MSG_PASSADO : undefined}
            onClick={() => onAction("edit", atual)}
          >
            EDITAR
          </button>
          {podeReagendar(atual) && (
            <button type="button" className="agenda-btn-ghost" onClick={() => onAction("reschedule", atual)}>
              REAGENDAR
            </button>
          )}
          {cancelado ? (
            <button type="button" className="agenda-btn-ghost" onClick={() => onAction("reactivate", atual)}>
              REATIVAR
            </button>
          ) : (
            <button type="button" className="agenda-btn-ghost" onClick={() => onAction("cancel", atual)}>
              CANCELAR
            </button>
          )}
          <button type="button" className="agenda-btn-danger" onClick={() => onAction("delete", atual)}>
            EXCLUIR
          </button>
        </div>
        {passado && <p className="agenda-details-hint">{MSG_PASSADO}.</p>}
      </section>
    </div>
  );
}

/* ---------- Componente Principal ---------- */
export default function AdminAgenda() {
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [selected, setSelected] = useState(() => Math.min((new Date().getDay() + 6) % 7, 5));
  const [view, setView] = useState("week"); // "week" | "list" | "details"

  const [agendamentosDoBanco, setAgendamentosDoBanco] = useState([]);
  const [modal, setModal] = useState({ open: false, agendamento: null }); // novo ou edição
  const [reagendando, setReagendando] = useState(null); // registro que está sendo reagendado

  // Estados para o seletor de data (calendário)
  const [selectedDateFilter, setSelectedDateFilter] = useState("");

  // Menu "•••", detalhes e modais de confirmação/aviso
  const [menuId, setMenuId] = useState(null);
  const [detailId, setDetailId] = useState(null);
  const [confirmInfo, setConfirmInfo] = useState(null);
  const [toastInfo, setToastInfo] = useState(null);
  const [processando, setProcessando] = useState(false);

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

  // Fecha o menu "•••" ao clicar fora ou apertar Esc
  useEffect(() => {
    if (menuId === null) return undefined;

    const fechar = (e) => {
      if (!e.target.closest?.(".agenda-menu-wrap")) setMenuId(null);
    };
    const esc = (e) => {
      if (e.key === "Escape") setMenuId(null);
    };

    document.addEventListener("mousedown", fechar);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", fechar);
      document.removeEventListener("keydown", esc);
    };
  }, [menuId]);

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

  const doDia = (dataStr) =>
    agendamentosDoBanco
      .filter((ag) => ag.data_agendamento && ag.data_agendamento.startsWith(dataStr))
      .map(mapAgendamento)
      .sort((a, b) => a.time.localeCompare(b.time));

  // Dias gerados com base na semana ou filtrados pela data exata
  const days = useMemo(() => {
    if (selectedDateFilter) {
      const [ano, mes, dia] = selectedDateFilter.split("-");
      const dateObj = new Date(ano, mes - 1, dia);

      return [
        {
          label: dateObj.toLocaleDateString("pt-BR", { weekday: "short" }).toUpperCase().replace(".", ""),
          date: dateObj,
          appointments: doDia(selectedDateFilter),
        },
      ];
    }

    return WEEK_LABELS.map((label, i) => {
      const date = addDays(weekStart, i);
      return { label, date, appointments: doDia(ymd(date)) };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStart, agendamentosDoBanco, selectedDateFilter]);

  const current = days[selected] || days[0];

  // Identifica se a data visualizada atualmente é anterior ao dia de hoje
  const hojeStr = ymd(new Date());
  const dataAtualPainel = current?.date ? ymd(current.date) : hojeStr;
  const isDataPassada = dataAtualPainel < hojeStr;

  const abrirNovo = () => setModal({ open: true, agendamento: null });
  const fecharModal = () => setModal({ open: false, agendamento: null });

  /* ---------- Ações do menu ---------- */
  const mudarStatus = async (appt, novoStatus) => {
    setProcessando(true);
    try {
      await api(`/agendamentos/${appt.id}/`, {
        method: "PATCH",
        body: JSON.stringify({ status: novoStatus }),
      });
      await carregarAgenda();
      setConfirmInfo(null);
    } catch (err) {
      console.error(err);
      setConfirmInfo(null);
      setToastInfo({
        title: "NÃO FOI POSSÍVEL ATUALIZAR",
        message: "O agendamento não foi alterado. Tente novamente.",
      });
    } finally {
      setProcessando(false);
    }
  };

  const excluir = async (appt) => {
    setProcessando(true);
    try {
      await api(`/agendamentos/${appt.id}/`, { method: "DELETE" });
      await carregarAgenda();
      setConfirmInfo(null);
    } catch (err) {
      console.error(err);
      setConfirmInfo(null);
      setToastInfo({
        title: "NÃO FOI POSSÍVEL EXCLUIR",
        message: "O agendamento não foi excluído. Tente novamente.",
      });
    } finally {
      setProcessando(false);
    }
  };

  const executarAcao = (acao, appt) => {
    setMenuId(null);
    const resumo = `${appt.name} · ${appt.service}\n${formatBR(appt.dateStr)} às ${appt.time}`;

    if (acao === "details") {
      setDetailId(appt.id);
      const idx = days.findIndex((d) => d.appointments.some((a) => a.id === appt.id));
      if (idx >= 0) setSelected(idx);
      setView("details");
    } else if (acao === "edit") {
      if (ehPassado(appt)) {
        setToastInfo({ title: "EDIÇÃO INDISPONÍVEL", message: `${MSG_PASSADO}.` });
        return;
      }
      setModal({ open: true, agendamento: appt.raw });
    } else if (acao === "reschedule") {
      if (!podeReagendar(appt)) {
        setToastInfo({
          title: "REAGENDAMENTO INDISPONÍVEL",
          message: "Só é possível reagendar um atendimento que ainda está confirmado.",
        });
        return;
      }
      setReagendando(appt.raw);
    } else if (acao === "cancel") {
      setConfirmInfo({
        title: "CANCELAR AGENDAMENTO",
        message: `Deseja cancelar este agendamento?\n\n${resumo}\n\nVocê poderá reativá-lo depois.`,
        confirmLabel: "CONFIRMAR CANCELAMENTO",
        tone: "danger",
        onConfirm: () => mudarStatus(appt, "cancelled"),
      });
    } else if (acao === "reactivate") {
      mudarStatus(appt, "confirmed");
    } else if (acao === "delete") {
      setConfirmInfo({
        title: "EXCLUIR AGENDAMENTO",
        message: `Deseja excluir este agendamento?\n\n${resumo}\n\nEsta ação não pode ser desfeita.`,
        confirmLabel: "CONFIRMAR EXCLUSÃO",
        tone: "danger",
        onConfirm: () => excluir(appt),
      });
    }
  };

  const toggleMenu = (id) => setMenuId((atual) => (atual === id ? null : id));

  const painelProps = {
    onOpenNew: abrirNovo,
    menuId,
    onToggleMenu: toggleMenu,
    onAction: executarAcao,
  };

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
            <button type="button" className="dash-primary-btn" onClick={abrirNovo}>
              + NOVO AGENDAMENTO
            </button>
          )}
        </div>
      </header>

      <div className="agenda-toolbar">
        {!selectedDateFilter && (
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
        )}

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
          <button
            type="button"
            role="tab"
            aria-selected={view === "details"}
            className={view === "details" ? "is-active" : ""}
            onClick={() => setView("details")}
          >
            DETALHES
          </button>
        </div>
      </div>

      <section className="agenda-panel" aria-label="Agenda de atendimentos">
        {view === "details" ? (
          <>
            {!selectedDateFilter && <WeekTabs days={days} selected={selected} onSelect={setSelected} />}
            {current && (
              <DetalhesDoDia
                date={current.date}
                appointments={current.appointments}
                detailId={detailId}
                onSelect={setDetailId}
                onAction={executarAcao}
              />
            )}
          </>
        ) : selectedDateFilter ? (
          days.map((d) => (
            <DayPanel
              key={d.date.toISOString()}
              date={d.date}
              appointments={d.appointments}
              isDataPassada={isDataPassada}
              {...painelProps}
            />
          ))
        ) : view === "week" ? (
          <>
            <WeekTabs days={days} selected={selected} onSelect={setSelected} />

            {current && (
              <DayPanel
                date={current.date}
                appointments={current.appointments}
                isDataPassada={isDataPassada}
                {...painelProps}
              />
            )}
          </>
        ) : (
          days.map((d) => (
            <DayPanel
              key={d.label}
              date={d.date}
              appointments={d.appointments}
              isDataPassada={ymd(d.date) < hojeStr}
              {...painelProps}
            />
          ))
        )}
      </section>

      {/* Novo agendamento / edição (a edição pede confirmação dentro do próprio modal) */}
      <NovoAgendamentoModal
        isOpen={modal.open}
        agendamento={modal.agendamento}
        onClose={fecharModal}
        onSuccess={carregarAgenda}
      />

      {/* Reagendar (só data e horário; pede confirmação dentro do próprio modal) */}
      <ReagendarModal
        isOpen={Boolean(reagendando)}
        agendamento={reagendando}
        onClose={() => setReagendando(null)}
        onSuccess={carregarAgenda}
      />

      {/* ---- MODAL DE CONFIRMAÇÃO (CANCELAR / EXCLUIR) ---- */}
      {confirmInfo && (
        <div className="clients-toast-overlay" onClick={() => !processando && setConfirmInfo(null)}>
          <div
            className="clients-toast-card"
            role="alertdialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="clients-toast-title">{confirmInfo.title}</h3>
            <p className="clients-toast-message">{confirmInfo.message}</p>
            <div className="clients-toast-actions">
              <button
                type="button"
                className="agenda-btn-ghost"
                disabled={processando}
                onClick={() => setConfirmInfo(null)}
              >
                VOLTAR
              </button>
              <button
                type="button"
                className={confirmInfo.tone === "danger" ? "agenda-btn-danger" : "dash-primary-btn"}
                disabled={processando}
                onClick={confirmInfo.onConfirm}
              >
                {processando ? "AGUARDE..." : confirmInfo.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---- MODAL DE AVISO (ERROS) ---- */}
      {toastInfo && (
        <div className="clients-toast-overlay" onClick={() => setToastInfo(null)}>
          <div className="clients-toast-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="clients-toast-title">{toastInfo.title}</h3>
            <p className="clients-toast-message">{toastInfo.message}</p>
            <div className="clients-toast-actions">
              <button type="button" className="dash-primary-btn" onClick={() => setToastInfo(null)}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
