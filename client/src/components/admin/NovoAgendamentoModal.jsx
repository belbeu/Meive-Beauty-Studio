import React, { useState, useEffect } from "react";
import { api } from "../../api";
import "./AdminAvisos.css"; // cartão de confirmação (mesmo padrão das outras telas do admin)

const FORM_VAZIO = {
  id_usuario: "",
  id_servico: "",
  data: "",
  hora: "",
  valor: "",
  sinal_pago: "",
  status: "confirmed",
};

const STATUS_OPCOES = [
  { value: "confirmed", label: "Confirmado" },
  { value: "ongoing", label: "Em atendimento (realizado)" },
  { value: "concluded", label: "Concluído" },
  { value: "cancelled", label: "Cancelado" },
];

const campoStyle = {
  width: "100%",
  padding: "10px",
  background: "#1a1a1a",
  border: "1px solid var(--border)",
  color: "#fff",
  boxSizing: "border-box",
};

const campoTravado = { opacity: 0.55, cursor: "not-allowed" };

const labelStyle = {
  fontSize: "10px",
  color: "var(--faint)",
  display: "block",
  marginBottom: "4px",
};

// Mensagem vinda do back-end (ex.: regra de data) ou a padrão
function mensagemDeErro(err, padrao) {
  const d = err?.dados?.detail;
  const msg = Array.isArray(d) ? d[0] : d;
  return typeof msg === "string" ? msg : padrao;
}

const brl = (v) =>
  Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/**
 * Serve para CRIAR (sem `agendamento`) e para EDITAR (com `agendamento`).
 * Ao editar, o botão abre um modal de confirmação antes de gravar no banco.
 */
export default function NovoAgendamentoModal({ isOpen, onClose, onSuccess, agendamento = null }) {
  const editando = Boolean(agendamento);

  const [clientes, setClientes] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [formData, setFormData] = useState(FORM_VAZIO);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [confirmando, setConfirmando] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setErro("");
    setConfirmando(false);

    if (agendamento) {
      const [data = "", resto = ""] = (agendamento.data_agendamento || "").split("T");
      setFormData({
        id_usuario: String(agendamento.id_usuario ?? ""),
        id_servico: String(agendamento.id_servico ?? ""),
        data,
        hora: resto.substring(0, 5),
        valor: agendamento.valor ?? "",
        sinal_pago: agendamento.sinal_pago ?? "",
        status: agendamento.status || "confirmed",
      });
    } else {
      setFormData(FORM_VAZIO);
    }

    // Carrega clientes e serviços cadastrados no banco
    Promise.all([
      api("/clientes/").catch(() => []),
      api("/servicos/").catch(() => []),
    ]).then(([resClientes, resServicos]) => {
      setClientes(Array.isArray(resClientes) ? resClientes : resClientes.results || []);
      setServicos(Array.isArray(resServicos) ? resServicos : resServicos.results || []);
    });
  }, [isOpen, agendamento]);

  // Preenche o valor automaticamente ao selecionar o serviço
  const handleServicoChange = (e) => {
    const servicoId = e.target.value;
    const servicoSelecionado = servicos.find((s) => String(s.id_servico) === String(servicoId));

    setFormData((prev) => ({
      ...prev,
      id_servico: servicoId,
      valor: servicoSelecionado ? servicoSelecionado.preco || "" : "",
    }));
  };

  const salvar = async () => {
    setLoading(true);
    setErro("");

    try {
      // Junta data e hora no formato ISO aceito pelo Django (TIMESTAMP)
      const dataAgendamento = `${formData.data}T${formData.hora}:00`;

      const corpo = {
        id_usuario: formData.id_usuario,
        id_servico: formData.id_servico,
        data_agendamento: dataAgendamento,
        valor: formData.valor,
        sinal_pago: formData.sinal_pago || 0,
        status: formData.status,
      };

      if (editando) {
        await api(`/agendamentos/${agendamento.id_agendamento}/`, {
          method: "PATCH",
          body: JSON.stringify(corpo),
        });
      } else {
        await api("/agendamentos/", { method: "POST", body: JSON.stringify(corpo) });
      }

      setLoading(false);
      setConfirmando(false);
      await onSuccess();
      onClose();
    } catch (err) {
      setLoading(false);
      setConfirmando(false);
      setErro(
        mensagemDeErro(
          err,
          editando
            ? "Erro ao salvar as alterações. Verifique os campos."
            : "Erro ao cadastrar agendamento. Verifique os campos."
        )
      );
      console.error(err);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErro("");
    if (editando) {
      setConfirmando(true); // pede confirmação antes de alterar
      return;
    }
    salvar();
  };

  if (!isOpen) return null;

  // Data e horário só mudam enquanto o atendimento está confirmado (antes de ser realizado)
  const travaData = editando && agendamento.status !== "confirmed";

  const nomeCliente = clientes.find((c) => String(c.id_usuario || c.id) === String(formData.id_usuario))?.nome;
  const nomeServico = servicos.find((s) => String(s.id_servico) === String(formData.id_servico))?.nome;
  const statusLabel = STATUS_OPCOES.find((s) => s.value === formData.status)?.label;
  const [ano, mes, dia] = (formData.data || "").split("-");

  const resumo = [
    `Cliente: ${nomeCliente || agendamento?.cliente_nome || "—"}`,
    `Serviço: ${nomeServico || agendamento?.servico_nome || "—"}`,
    `Data: ${dia}/${mes}/${ano} às ${formData.hora}`,
    `Valor: ${brl(formData.valor)} (sinal ${brl(formData.sinal_pago)})`,
    `Status: ${statusLabel}`,
  ].join("\n");

  return (
    <div className="modal-overlay agenda-modal-overlay">
      <div className="modal-content dash-panel agenda-modal-content">
        <div className="dash-panel-head">
          <h2 className="dash-panel-title">{editando ? "EDITAR AGENDAMENTO" : "NOVO AGENDAMENTO"}</h2>
          <button type="button" className="dash-link" onClick={onClose}>✕ Fechar</button>
        </div>

        {erro && <p style={{ color: "#d12a4a", fontSize: "12px", margin: "10px 0" }}>{erro}</p>}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "16px" }}>
          <div>
            <label style={labelStyle}>CLIENTE</label>
            <select
              value={formData.id_usuario}
              onChange={(e) => setFormData({ ...formData, id_usuario: e.target.value })}
              required
              style={campoStyle}
            >
              <option value="">Selecione uma cliente...</option>
              {clientes.map((c) => (
                <option key={c.id_usuario || c.id} value={c.id_usuario || c.id}>
                  {c.nome} ({c.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>SERVIÇO</label>
            <select value={formData.id_servico} onChange={handleServicoChange} required style={campoStyle}>
              <option value="">Selecione o serviço...</option>
              {servicos.map((s) => (
                <option key={s.id_servico} value={s.id_servico}>
                  {s.nome} - R$ {s.preco || 0}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <label style={labelStyle}>DATA</label>
              <input
                type="date"
                value={formData.data}
                onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                required
                disabled={travaData}
                style={{ ...campoStyle, ...(travaData ? campoTravado : {}) }}
              />
            </div>
            <div>
              <label style={labelStyle}>HORÁRIO</label>
              <input
                type="time"
                value={formData.hora}
                onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                required
                disabled={travaData}
                style={{ ...campoStyle, ...(travaData ? campoTravado : {}) }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <label style={labelStyle}>VALOR TOTAL (R$)</label>
              <input
                type="number"
                step="0.01"
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                required
                style={campoStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>SINAL PAGO (R$)</label>
              <input
                type="number"
                step="0.01"
                value={formData.sinal_pago}
                onChange={(e) => setFormData({ ...formData, sinal_pago: e.target.value })}
                style={campoStyle}
              />
            </div>
          </div>

          {travaData && (
            <p style={{ margin: 0, fontSize: "11px", color: "var(--faint)" }}>
              A data e o horário só podem ser alterados enquanto o agendamento está confirmado.
            </p>
          )}

          {editando && (
            <div>
              <label style={labelStyle}>STATUS</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                style={campoStyle}
              >
                {STATUS_OPCOES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          )}

          <button type="submit" className="dash-primary-btn" disabled={loading} style={{ marginTop: "10px", width: "100%" }}>
            {loading
              ? "SALVANDO..."
              : editando
              ? "SALVAR ALTERAÇÕES"
              : "CADASTRAR AGENDAMENTO"}
          </button>
        </form>
      </div>

      {/* ---- CONFIRMAÇÃO DA EDIÇÃO ---- */}
      {confirmando && (
        <div className="clients-toast-overlay" onClick={() => !loading && setConfirmando(false)}>
          <div
            className="clients-toast-card"
            role="alertdialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="clients-toast-title">CONFIRMAR ALTERAÇÕES</h3>
            <p className="clients-toast-message">
              Deseja salvar as alterações deste agendamento?{"\n\n"}
              {resumo}
            </p>
            <div className="clients-toast-actions">
              <button
                type="button"
                className="agenda-btn-ghost"
                disabled={loading}
                onClick={() => setConfirmando(false)}
              >
                VOLTAR
              </button>
              <button type="button" className="dash-primary-btn" disabled={loading} onClick={salvar}>
                {loading ? "SALVANDO..." : "CONFIRMAR ALTERAÇÕES"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
