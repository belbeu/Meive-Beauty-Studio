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

// Helper para formatar a data/hora sem alterar o fuso horário
function formatarDataHora(dataIso) {
  if (!dataIso) return "";
  const [dataPart, horaPart] = dataIso.split("T");
  const [ano, mes, dia] = dataPart.split("-");
  const hora = horaPart ? horaPart.substring(0, 5) : "00:00";
  return {
    dataStr: `${dia}/${mes}/${ano}`,
    horaStr: hora,
    dataCompleta: `${dia}/${mes}/${ano} às ${hora}`
  };
}

export default function ClientDashboard() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalSairAberto, setModalSairAberto] = useState(false);
  const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false);
  const [modalHistoricoAberto, setModalHistoricoAberto] = useState(false);
  
  const [usuario, setUsuario] = useState(null);
  const [cestinhaItens, setCestinhaItens] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarDados() {
      try {
        const dados = await usuarioAtual();
        setUsuario(dados);

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
      <div className="client-page" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", backgroundColor: "var(--c-bg)", color: "var(--c-text-muted)" }}>
        <p style={{ fontSize: "1.1rem", letterSpacing: "1px" }}>Carregando sua conta...</p>
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

  const agendamentosFuturos = agendamentos
    .filter(a => new Date(a.data_agendamento) >= agora)
    .sort((a, b) => new Date(a.data_agendamento) - new Date(b.data_agendamento));

  const proximoAgendamento = agendamentosFuturos.length > 0 ? agendamentosFuturos[0] : null;
  const historicoAgendamentos = agendamentos.filter(a => a.id_agendamento !== proximoAgendamento?.id_agendamento);

  let proximoFormatado = null;
  if (proximoAgendamento) {
    const { dataStr, horaStr, dataCompleta } = formatarDataHora(proximoAgendamento.data_agendamento);
    const [ano, mesNum, diaStr] = proximoAgendamento.data_agendamento.split("T")[0].split("-");
    
    const dataObj = new Date(ano, mesNum - 1, diaStr);
    const mes = dataObj.toLocaleDateString("pt-BR", { month: "short" }).toUpperCase().replace(".", "");
    const semana = dataObj.toLocaleDateString("pt-BR", { weekday: "long" });
    const semanaCapitalizada = semana.charAt(0).toUpperCase() + semana.slice(1);

    proximoFormatado = {
      day: diaStr,
      month: mes,
      service: proximoAgendamento.servico_nome || proximoAgendamento.servico?.nome || "Serviço",
      when: `${semanaCapitalizada}, ${horaStr}`,
      dataCompleta,
      professional: "Meive",
      valor: proximoAgendamento.valor || "0,00",
      sinal: proximoAgendamento.sinal_pago || "0,00",
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

              <button 
                type="button" 
                className="client-outline-btn" 
                onClick={() => setModalDetalhesAberto(true)}
              >
                VER DETALHES
              </button>
            </section>
          ) : (
            <section className="client-next" aria-label="Próximo agendamento" style={{ background: "var(--surface)" }}>
              <div className="client-next-info">
                <span className="client-next-label">PRÓXIMO AGENDAMENTO</span>
                <h2>NENHUM AGENDAMENTO FUTURO</h2>
                <p>Que tal agendar seu próximo horário no studio?</p>
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
                <button 
                  type="button" 
                  className="client-link" 
                  onClick={() => setModalHistoricoAberto(true)}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                >
                  VER HISTÓRICO
                </button>
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
                    {(historicoAgendamentos.length > 0 ? historicoAgendamentos : agendamentos).slice(0, 3).map((a) => {
                      const { dataCompleta } = formatarDataHora(a.data_agendamento);
                      return (
                        <li key={a.id_agendamento} className="client-row">
                          <div className="client-row-info">
                            <strong>{a.servico_nome || a.servico?.nome || "Atendimento"}</strong>
                            <span>{dataCompleta}</span>
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

      {/* MODAL: DETALHES DO PRÓXIMO AGENDAMENTO */}
      {modalDetalhesAberto && proximoFormatado && (
        <div className="client-modal-overlay">
          <div className="client-modal-card">
            <h3>DETALHES DO AGENDAMENTO</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", margin: "10px 0" }}>
              <p><strong>Serviço:</strong> {proximoFormatado.service}</p>
              <p><strong>Data e Horário:</strong> {proximoFormatado.dataCompleta}</p>
              <p><strong>Profissional:</strong> {proximoFormatado.professional}</p>
              <p><strong>Valor Total:</strong> R$ {proximoFormatado.valor}</p>
              <p><strong>Sinal Pago:</strong> R$ {proximoFormatado.sinal}</p>
              <p><strong>Status:</strong> {STATUS_LABEL[proximoFormatado.status] || "CONFIRMADO"}</p>
            </div>
            <div className="client-modal-actions">
              <button
                type="button"
                className="client-primary-btn"
                onClick={() => setModalDetalhesAberto(false)}
                style={{ width: "100%" }}
              >
                FECHAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: HISTÓRICO COMPLETO DE AGENDAMENTOS */}
      {modalHistoricoAberto && (
        <div className="client-modal-overlay">
          <div className="client-modal-card" style={{ maxWidth: "550px", maxHeight: "80vh", overflowY: "auto" }}>
            <h3>HISTÓRICO DE AGENDAMENTOS</h3>
            {agendamentos.length === 0 ? (
              <p style={{ margin: "20px 0" }}>Você ainda não possui agendamentos registrados.</p>
            ) : (
              <ul className="client-list" style={{ margin: "15px 0" }}>
                {agendamentos.map((a) => {
                  const { dataCompleta } = formatarDataHora(a.data_agendamento);
                  return (
                    <li key={a.id_agendamento} className="client-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                      <div className="client-row-info">
                        <strong>{a.servico_nome || a.servico?.nome || "Atendimento"}</strong>
                        <span>{dataCompleta} - R$ {a.valor || "0,00"}</span>
                      </div>
                      <span className={`client-badge client-badge--${a.status}`}>
                        {STATUS_LABEL[a.status] || "CONFIRMADO"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
            <div className="client-modal-actions">
              <button
                type="button"
                className="client-primary-btn"
                onClick={() => setModalHistoricoAberto(false)}
                style={{ width: "100%" }}
              >
                FECHAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SAIR DA CONTA */}
      {modalSairAberto && (
        <div className="client-modal-overlay">
          <div className="client-modal-card">
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