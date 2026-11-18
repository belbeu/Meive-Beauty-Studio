import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api";
import "./AdminNotificacoes.css";

const INTERVALO_MS = 60 * 1000; // consulta o servidor a cada 1 minuto

// "AAAA-MM-DDTHH:MM..." -> "HH:MM" e "dd/mm" (a hora é guardada como digitada, sem converter fuso)
const horaDe = (iso) => (iso || "").split("T")[1]?.substring(0, 5) || "--:--";
const diaDe = (iso) => {
  const [a, m, d] = ((iso || "").split("T")[0] || "").split("-");
  return a ? `${d}/${m}` : "";
};

function textoTempo(item) {
  const min = item.minutos;
  if (item.tipo === "pendente") return `Era ${diaDe(item.data_agendamento)} às ${horaDe(item.data_agendamento)}`;
  if (min <= 0) return "Começando agora";
  if (min < 60) return `Começa em ${min} min`;
  const h = Math.floor(min / 60);
  const resto = min % 60;
  return `Começa em ${h}h${resto ? ` ${resto}min` : ""}`;
}

export default function AdminNotificacoes() {
  const [dados, setDados] = useState({ itens: [], janela_horas: 2 });
  const [aberto, setAberto] = useState(false);
  const [erro, setErro] = useState(false);
  const raiz = useRef(null);
  const navigate = useNavigate();

  const carregar = useCallback(async () => {
    try {
      setDados(await api("/admin/notificacoes/"));
      setErro(false);
    } catch {
      setErro(true); // sem derrubar a tela: o sino só mostra que não conseguiu atualizar
    }
  }, []);

  useEffect(() => {
    carregar();
    const id = setInterval(carregar, INTERVALO_MS);
    return () => clearInterval(id);
  }, [carregar]);

  // Fecha ao clicar fora ou apertar Esc
  useEffect(() => {
    if (!aberto) return undefined;
    const fora = (e) => {
      if (raiz.current && !raiz.current.contains(e.target)) setAberto(false);
    };
    const esc = (e) => e.key === "Escape" && setAberto(false);
    document.addEventListener("mousedown", fora);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", fora);
      document.removeEventListener("keydown", esc);
    };
  }, [aberto]);

  const proximos = dados.itens.filter((i) => i.tipo === "proximo");
  const pendentes = dados.itens.filter((i) => i.tipo === "pendente");
  const total = dados.itens.length;

  const abrirAgenda = () => {
    setAberto(false);
    navigate("/admin/agenda");
  };

  const renderItem = (item) => (
    <li key={`${item.tipo}-${item.id_agendamento}`}>
      <button type="button" className={`notif-item notif-item--${item.tipo}`} onClick={abrirAgenda}>
        <span className="notif-item-hora">{horaDe(item.data_agendamento)}</span>
        <span className="notif-item-corpo">
          <strong>{item.cliente_nome}</strong>
          <span>{item.servico_nome}</span>
          <em>{textoTempo(item)}</em>
        </span>
      </button>
    </li>
  );

  return (
    <div className="notif-wrap" ref={raiz}>
      <button
        type="button"
        className={`notif-bell ${proximos.length ? "is-alert" : ""}`}
        aria-label={total ? `Notificações: ${total} aviso(s)` : "Notificações: nenhum aviso"}
        aria-haspopup="dialog"
        aria-expanded={aberto}
        onClick={() => {
          setAberto((v) => !v);
          if (!aberto) carregar();
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.7 21a2 2 0 0 1-3.4 0" />
        </svg>
        {total > 0 && <span className="notif-badge">{total > 9 ? "9+" : total}</span>}
      </button>

      {aberto && (
        <div className="notif-panel" role="dialog" aria-label="Notificações da agenda">
          <header className="notif-panel-head">
            <strong>NOTIFICAÇÕES</strong>
            <button type="button" className="notif-refresh" onClick={carregar}>Atualizar</button>
          </header>

          {erro && <p className="notif-erro">Não foi possível atualizar agora.</p>}

          {total === 0 && !erro && (
            <p className="notif-vazio">Nenhum atendimento próximo nem pendente.</p>
          )}

          {proximos.length > 0 && (
            <section>
              <h3>Próximas {dados.janela_horas}h</h3>
              <ul>{proximos.map(renderItem)}</ul>
            </section>
          )}

          {pendentes.length > 0 && (
            <section>
              <h3>Aguardando conclusão</h3>
              <ul>{pendentes.map(renderItem)}</ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
