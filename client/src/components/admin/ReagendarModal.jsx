import React, { useState, useEffect } from "react";
import { api } from "../../api";
import "./AdminAvisos.css"; // cartão de confirmação (mesmo padrão das outras telas do admin)

const campoStyle = {
  width: "100%",
  padding: "10px",
  background: "#1a1a1a",
  border: "1px solid var(--border)",
  color: "#fff",
  boxSizing: "border-box",
};

const labelStyle = {
  fontSize: "10px",
  color: "var(--faint)",
  display: "block",
  marginBottom: "4px",
};

const pad = (n) => String(n).padStart(2, "0");
const hojeLocal = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const formatBR = (dataStr) => {
  const [a, m, d] = (dataStr || "").split("-");
  return a ? `${d}/${m}/${a}` : "—";
};

function mensagemDeErro(err, padrao) {
  const d = err?.dados?.detail;
  const msg = Array.isArray(d) ? d[0] : d;
  return typeof msg === "string" ? msg : padrao;
}

/**
 * Reagendar: muda só data e horário de um agendamento ainda confirmado.
 * `agendamento` é o registro vindo da API. Pede confirmação antes de gravar.
 */
export default function ReagendarModal({ isOpen, agendamento, onClose, onSuccess }) {
  const [data, setData] = useState("");
  const [hora, setHora] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmando, setConfirmando] = useState(false);

  const [dataAtual = "", resto = ""] = (agendamento?.data_agendamento || "").split("T");
  const horaAtual = resto.substring(0, 5);

  useEffect(() => {
    if (!isOpen) return;
    setData(dataAtual);
    setHora(horaAtual);
    setErro("");
    setConfirmando(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, agendamento]);

  if (!isOpen || !agendamento) return null;

  const igual = data === dataAtual && hora === horaAtual;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErro("");
    if (igual) {
      setErro("Escolha uma data ou um horário diferente do atual.");
      return;
    }
    if (data < hojeLocal()) {
      setErro("A nova data não pode ser anterior a hoje.");
      return;
    }
    setConfirmando(true);
  };

  const salvar = async () => {
    setLoading(true);
    try {
      await api(`/agendamentos/${agendamento.id_agendamento}/`, {
        method: "PATCH",
        body: JSON.stringify({ data_agendamento: `${data}T${hora}:00` }),
      });
      setLoading(false);
      setConfirmando(false);
      await onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setLoading(false);
      setConfirmando(false);
      setErro(mensagemDeErro(err, "Não foi possível reagendar. Tente novamente."));
    }
  };

  return (
    <div className="modal-overlay agenda-modal-overlay">
      <div className="modal-content dash-panel agenda-modal-content">
        <div className="dash-panel-head">
          <h2 className="dash-panel-title">REAGENDAR</h2>
          <button type="button" className="dash-link" onClick={onClose}>✕ Fechar</button>
        </div>

        <p style={{ fontSize: "13px", color: "var(--faint)", margin: "14px 0 0", lineHeight: 1.5 }}>
          {agendamento.cliente_nome} · {agendamento.servico_nome}
          <br />
          Atual: {formatBR(dataAtual)} às {horaAtual}
        </p>

        {erro && <p style={{ color: "#d12a4a", fontSize: "12px", margin: "10px 0 0" }}>{erro}</p>}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <label style={labelStyle}>NOVA DATA</label>
              <input
                type="date"
                value={data}
                min={hojeLocal()}
                onChange={(e) => setData(e.target.value)}
                required
                style={campoStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>NOVO HORÁRIO</label>
              <input
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                required
                style={campoStyle}
              />
            </div>
          </div>

          <button type="submit" className="dash-primary-btn" disabled={loading} style={{ marginTop: "10px", width: "100%" }}>
            REAGENDAR
          </button>
        </form>
      </div>

      {/* ---- CONFIRMAÇÃO DO REAGENDAMENTO ---- */}
      {confirmando && (
        <div className="clients-toast-overlay" onClick={() => !loading && setConfirmando(false)}>
          <div className="clients-toast-card" role="alertdialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h3 className="clients-toast-title">CONFIRMAR REAGENDAMENTO</h3>
            <p className="clients-toast-message">
              Deseja reagendar este atendimento?{"\n\n"}
              {agendamento.cliente_nome} · {agendamento.servico_nome}
              {"\n"}De: {formatBR(dataAtual)} às {horaAtual}
              {"\n"}Para: {formatBR(data)} às {hora}
            </p>
            <div className="clients-toast-actions">
              <button type="button" className="agenda-btn-ghost" disabled={loading} onClick={() => setConfirmando(false)}>
                VOLTAR
              </button>
              <button type="button" className="dash-primary-btn" disabled={loading} onClick={salvar}>
                {loading ? "SALVANDO..." : "CONFIRMAR REAGENDAMENTO"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
