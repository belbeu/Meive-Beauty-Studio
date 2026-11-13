import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api";
import NovoAgendamentoModal from "./NovoAgendamentoModal";
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

const STATUS_LABEL = {
  concluded: "CONCLUÍDO",
  ongoing: "EM ATENDIMENTO",
  confirmed: "CONFIRMADO",
  cancelled: "CANCELADO",
};

const WEEK_LABELS = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "DOM"];
const TOP_PRODUTOS = 5;

/* ---------- Helpers ---------- */
const pad = (n) => String(n).padStart(2, "0");

// AAAA-MM-DD no fuso local (toISOString usa UTC e "vira o dia" à noite no Brasil)
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

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

const brl = (v, semCentavosSeInteiro = false) => {
  const n = Number(v) || 0;
  return n.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: semCentavosSeInteiro && Number.isInteger(n) ? 0 : 2,
    maximumFractionDigits: 2,
  });
};

const lista = (dados) => (Array.isArray(dados) ? dados : dados?.results || []);

function formatToday() {
  const text = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return text.replace(",", "").toUpperCase().replace(/^(\S+) (.*)$/, "$1, $2");
}

// A data do agendamento é lida como foi digitada (sem converter fuso), igual à tela Agenda.
const diaDe = (ag) => (ag.data_agendamento || "").split("T")[0];
const horaDe = (ag) => ((ag.data_agendamento || "").split("T")[1] || "").substring(0, 5);

const iniciais = (nome) =>
  (nome || "Cliente")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "CL";

const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;

/* ---------- Componente ---------- */
export default function AdminDashboard() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [totalClientes, setTotalClientes] = useState(0);
  const [produtos, setProdutos] = useState([]);
  const [itensCestinha, setItensCestinha] = useState([]);
  const [loading, setLoading] = useState({ agenda: true, clientes: true, produtos: true, cestinha: true });
  const [modalAberto, setModalAberto] = useState(false);

  const fim = (chave) => setLoading((l) => ({ ...l, [chave]: false }));

  const carregarAgendamentos = useCallback(async () => {
    try {
      setAgendamentos(lista(await api("/agendamentos/")));
    } catch (err) {
      console.error("Erro ao carregar agendamentos do dashboard:", err);
    } finally {
      fim("agenda");
    }
  }, []);

  useEffect(() => {
    carregarAgendamentos();

    api("/clientes/")
      .then((d) => setTotalClientes(lista(d).length))
      .catch((err) => console.error("Erro ao buscar clientes do dashboard:", err))
      .finally(() => fim("clientes"));

    api("/admin/produtos/")
      .then((d) => setProdutos(lista(d)))
      .catch((err) => console.error("Erro ao buscar produtos do dashboard:", err))
      .finally(() => fim("produtos"));

    api("/cestinha/")
      .then((d) => setItensCestinha(lista(d)))
      .catch((err) => console.error("Erro ao buscar cestinhas do dashboard:", err))
      .finally(() => fim("cestinha"));
  }, [carregarAgendamentos]);

  /* ---------- Cálculos a partir do banco ---------- */
  const {
    entradaMes,
    sinaisMes,
    agendamentosMes,
    agendamentosSemana,
    agendaHoje,
    previstoHoje,
    semana,
    totalSemana,
    nomeMes,
  } = useMemo(() => {
    const hoje = new Date();
    const hojeStr = ymd(hoje);
    const mesStr = hojeStr.slice(0, 7);
    const segunda = getMonday(hoje);
    const diasSemana = WEEK_LABELS.map((label, i) => ({ label, dataStr: ymd(addDays(segunda, i)) }));
    const primeiroDia = diasSemana[0].dataStr;
    const ultimoDia = diasSemana[6].dataStr;

    const validos = agendamentos.filter((a) => a.status !== "cancelled");
    const doMes = validos.filter((a) => diaDe(a).startsWith(mesStr));

    // Entrada = valor dos atendimentos já finalizados no mês.
    const entrada = doMes
      .filter((a) => a.status === "concluded")
      .reduce((soma, a) => soma + Number(a.valor || 0), 0);

    // Sinais já recebidos de atendimentos que ainda não foram finalizados
    // (nos finalizados o sinal já está dentro do valor total).
    const sinais = doMes
      .filter((a) => a.status !== "concluded")
      .reduce((soma, a) => soma + Number(a.sinal_pago || 0), 0);

    const hojeLista = agendamentos
      .filter((a) => diaDe(a) === hojeStr)
      .sort((a, b) => horaDe(a).localeCompare(horaDe(b)));
    const hojeValidos = hojeLista.filter((a) => a.status !== "cancelled");

    const dias = diasSemana.map((d) => ({
      ...d,
      value: validos.filter((a) => diaDe(a) === d.dataStr).length,
      hoje: d.dataStr === hojeStr,
    }));
    // Domingo só aparece se houver atendimento nele (o studio costuma fechar).
    const diasVisiveis = dias.filter((d) => d.label !== "DOM" || d.value > 0);

    return {
      entradaMes: entrada,
      sinaisMes: sinais,
      agendamentosMes: doMes.length,
      agendamentosSemana: validos.filter((a) => diaDe(a) >= primeiroDia && diaDe(a) <= ultimoDia).length,
      agendaHoje: hojeLista,
      previstoHoje: hojeValidos.reduce((soma, a) => soma + Number(a.valor || 0), 0),
      semana: diasVisiveis,
      totalSemana: dias.reduce((soma, d) => soma + d.value, 0),
      nomeMes: hoje.toLocaleDateString("pt-BR", { month: "long" }),
    };
  }, [agendamentos]);

  // Valor em estoque: igual à página de Produtos (produtos ativos: preço x estoque atual).
  const { valorEstoque, produtosAtivos } = useMemo(() => {
    const ativos = produtos.filter((p) => p.ativo !== false);
    return {
      produtosAtivos: ativos.length,
      valorEstoque: ativos.reduce(
        (soma, p) => soma + Number(p.preco || 0) * Number(p.estoque_atual || 0),
        0
      ),
    };
  }, [produtos]);

  // Produtos mais adicionados às cestinhas das clientes.
  const maisRequisitados = useMemo(() => {
    const mapa = new Map();
    itensCestinha.forEach((item) => {
      const p = item.produto;
      if (!p) return;
      const atual = mapa.get(p.id_produto) || {
        id: p.id_produto,
        nome: p.nome,
        imagem: p.imagem_url,
        cestinhas: 0,
        unidades: 0,
      };
      atual.cestinhas += 1;
      atual.unidades += Number(item.quantidade) || 1;
      mapa.set(p.id_produto, atual);
    });
    return [...mapa.values()]
      .sort((a, b) => b.cestinhas - a.cestinhas || b.unidades - a.unidades)
      .slice(0, TOP_PRODUTOS);
  }, [itensCestinha]);

  const show = (carregando, valor) => (carregando ? "—" : valor);

  const STATS = [
    {
      label: "ENTRADA DO MÊS",
      value: show(loading.agenda, brl(entradaMes, true)),
      note: loading.agenda
        ? "Atendimentos concluídos"
        : `Concluídos em ${nomeMes} · + ${brl(sinaisMes)} em sinais`,
      variant: "red",
    },
    {
      label: "AGENDAMENTOS",
      value: show(loading.agenda, String(agendamentosMes)),
      note: loading.agenda ? "Sem cancelados" : `${agendamentosSemana} esta semana`,
      variant: "purple",
    },
    {
      label: "CLIENTES",
      value: show(loading.clientes, String(totalClientes)),
      note: "Total cadastradas",
      variant: "dark",
    },
    {
      label: "VALOR EM ESTOQUE",
      value: show(loading.produtos, brl(valorEstoque, true)),
      note: loading.produtos ? "Produtos ativos" : plural(produtosAtivos, "produto ativo", "produtos ativos"),
      variant: "dark",
    },
  ];

  const atendimentosHoje = agendaHoje.filter((a) => a.status !== "cancelled").length;
  const maxSemana = Math.max(1, ...semana.map((d) => d.value));

  return (
    <main className="dash-main">
      <header className="dash-header">
        <div>
          <span className="dash-date">{formatToday()}</span>
          <h1 className="dash-title">VISÃO GERAL</h1>
        </div>

        <div className="dash-header-actions">
          <button type="button" className="dash-primary-btn" onClick={() => setModalAberto(true)}>
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

      {/* ---- Agenda + Mais requisitados ---- */}
      <section className="dash-grid">
        <article className="dash-panel">
          <div className="dash-panel-head">
            <div>
              <h2 className="dash-panel-title">AGENDA DE HOJE</h2>
              <p className="dash-panel-sub">
                {loading.agenda
                  ? "Carregando..."
                  : `${plural(atendimentosHoje, "atendimento", "atendimentos")} · ${brl(previstoHoje, true)} previstos`}
              </p>
            </div>
            <Link to="/admin/agenda" className="dash-link">
              VER AGENDA COMPLETA
            </Link>
          </div>

          {!loading.agenda && agendaHoje.length === 0 ? (
            <p className="dash-empty">Nenhum atendimento para hoje.</p>
          ) : (
            <ul className="dash-list">
              {agendaHoje.map((a) => (
                <li
                  key={a.id_agendamento}
                  className={`dash-appointment dash-appointment--home ${a.status === "cancelled" ? "is-cancelled" : ""}`}
                >
                  <span className="dash-appointment-time">{horaDe(a)}</span>
                  <div className="dash-avatar">{iniciais(a.cliente_nome)}</div>
                  <div className="dash-appointment-info">
                    <strong>{a.cliente_nome || "Cliente"}</strong>
                    <span>{a.servico_nome || "Serviço"}</span>
                  </div>
                  <span className="dash-appointment-price">{brl(a.valor)}</span>
                  <span className={`dash-status dash-status--${a.status}`}>
                    {STATUS_LABEL[a.status] || String(a.status || "").toUpperCase()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="dash-panel">
          <div className="dash-panel-head">
            <div>
              <h2 className="dash-panel-title">MAIS REQUISITADOS</h2>
              <p className="dash-panel-sub">Mais adicionados às cestinhas das clientes</p>
            </div>
          </div>

          {!loading.cestinha && maisRequisitados.length === 0 ? (
            <p className="dash-empty">Nenhum produto nas cestinhas ainda.</p>
          ) : (
            <ul className="dash-list">
              {maisRequisitados.map((p, i) => (
                <li key={p.id} className="dash-product">
                  <span className="dash-product-rank">{pad(i + 1)}</span>
                  <ProdutoImg src={p.imagem} alt={p.nome} />
                  <div className="dash-product-info">
                    <strong>{p.nome}</strong>
                    <span>{plural(p.cestinhas, "cestinha", "cestinhas")}</span>
                  </div>
                  <span className="dash-product-total">{p.unidades} un.</span>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>

      {/* ---- Visão da semana ---- */}
      <section className="dash-panel dash-week">
        <div className="dash-panel-head">
          <div>
            <h2 className="dash-panel-title">VISÃO DA SEMANA</h2>
            <p className="dash-panel-sub">Agendamentos da semana (sem cancelados)</p>
          </div>
          <div className="dash-week-total">
            <strong>{show(loading.agenda, totalSemana)}</strong>
            <span>ATENDIMENTOS</span>
          </div>
        </div>

        <div
          className="dash-chart"
          style={{ gridTemplateColumns: `repeat(${semana.length}, 1fr)` }}
          role="img"
          aria-label="Gráfico de agendamentos por dia da semana"
        >
          {semana.map((d) => (
            <div key={d.label} className="dash-bar-col">
              <div className="dash-bar-track">
                <div
                  className={`dash-bar ${d.hoje ? "dash-bar--today" : ""}`}
                  style={{ height: `${(d.value / maxSemana) * 86}%` }}
                  title={plural(d.value, "atendimento", "atendimentos")}
                >
                  <span className="dash-bar-value">{loading.agenda ? "" : d.value}</span>
                </div>
              </div>
              <span className="dash-bar-label">{d.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Novo agendamento (o mesmo modal da página Agenda) */}
      <NovoAgendamentoModal
        isOpen={modalAberto}
        agendamento={null}
        onClose={() => setModalAberto(false)}
        onSuccess={carregarAgendamentos}
      />
    </main>
  );
}

function ProdutoImg({ src, alt }) {
  const [falhou, setFalhou] = useState(false);
  if (!src || falhou) return <div className="dash-product-img dash-product-img--placeholder" />;
  return <img src={src} alt={alt} className="dash-product-img" onError={() => setFalhou(true)} />;
}