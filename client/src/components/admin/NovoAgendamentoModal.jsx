import React, { useState, useEffect } from "react";
import { api } from "../../api";

export default function NovoAgendamentoModal({ isOpen, onClose, onSuccess }) {
  const [clientes, setClientes] = useState([]);
  const [servicos, setServicos] = useState([]);
  
  const [formData, setFormData] = useState({
    id_usuario: "",
    id_servico: "",
    data: "",
    hora: "",
    valor: "",
    sinal_pago: "",
    status: "confirmed"
  });

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (isOpen) {
      // Carrega clientes e serviços cadastrados no banco
      Promise.all([
        api("/clientes/").catch(() => []),
        api("/servicos/").catch(() => [])
      ]).then(([resClientes, resServicos]) => {
        setClientes(Array.isArray(resClientes) ? resClientes : resClientes.results || []);
        setServicos(Array.isArray(resServicos) ? resServicos : resServicos.results || []);
      });
    }
  }, [isOpen]);

  // Preenche o valor automaticamente ao selecionar o serviço
  const handleServicoChange = (e) => {
    const servicoId = e.target.value;
    const servicoSelecionado = servicos.find(s => String(s.id_servico) === String(servicoId));
    
    setFormData(prev => ({
      ...prev,
      id_servico: servicoId,
      valor: servicoSelecionado ? servicoSelecionado.preco || "" : ""
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro("");

    try {
      // Junta data e hora no formato ISO aceito pelo Django (TIMESTAMP)
      const dataAgendamento = `${formData.data}T${formData.hora}:00`;

      await api("/agendamentos/", {
        method: "POST",
        body: JSON.stringify({
          id_usuario: formData.id_usuario,
          id_servico: formData.id_servico,
          data_agendamento: dataAgendamento,
          valor: formData.valor,
          sinal_pago: formData.sinal_pago || 0,
          status: formData.status
        })
      });

      setLoading(false);
      onSuccess();
      onClose();
    } catch (err) {
      setLoading(false);
      setErro("Erro ao cadastrar agendamento. Verifique os campos.");
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content dash-panel">
        <div className="dash-panel-head">
          <h2 className="dash-panel-title">NOVO AGENDAMENTO</h2>
          <button type="button" className="dash-link" onClick={onClose}>✕ Fechar</button>
        </div>

        {erro && <p style={{ color: "#d12a4a", fontSize: "12px", margin: "10px 0" }}>{erro}</p>}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "16px" }}>
          <div>
            <label style={{ fontSize: "10px", color: "var(--faint)", display: "block", marginBottom: "4px" }}>CLIENTE</label>
            <select 
              value={formData.id_usuario} 
              onChange={e => setFormData({...formData, id_usuario: e.target.value})}
              required
              style={{ width: "100%", padding: "10px", background: "#1a1a1a", border: "1px solid var(--border)", color: "#fff" }}
            >
              <option value="">Selecione uma cliente...</option>
              {clientes.map(c => (
                <option key={c.id_usuario || c.id} value={c.id_usuario || c.id}>{c.nome} ({c.email})</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: "10px", color: "var(--faint)", display: "block", marginBottom: "4px" }}>SERVIÇO</label>
            <select 
              value={formData.id_servico} 
              onChange={handleServicoChange}
              required
              style={{ width: "100%", padding: "10px", background: "#1a1a1a", border: "1px solid var(--border)", color: "#fff" }}
            >
              <option value="">Selecione o serviço...</option>
              {servicos.map(s => (
                <option key={s.id_servico} value={s.id_servico}>{s.nome} - R$ {s.preco || 0}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <label style={{ fontSize: "10px", color: "var(--faint)", display: "block", marginBottom: "4px" }}>DATA</label>
              <input 
                type="date" 
                value={formData.data} 
                onChange={e => setFormData({...formData, data: e.target.value})}
                required
                style={{ width: "100%", padding: "10px", background: "#1a1a1a", border: "1px solid var(--border)", color: "#fff", boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ fontSize: "10px", color: "var(--faint)", display: "block", marginBottom: "4px" }}>HORÁRIO</label>
              <input 
                type="time" 
                value={formData.hora} 
                onChange={e => setFormData({...formData, hora: e.target.value})}
                required
                style={{ width: "100%", padding: "10px", background: "#1a1a1a", border: "1px solid var(--border)", color: "#fff", boxSizing: "border-box" }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <div>
              <label style={{ fontSize: "10px", color: "var(--faint)", display: "block", marginBottom: "4px" }}>VALOR TOTAL (R$)</label>
              <input 
                type="number" 
                step="0.01" 
                value={formData.valor} 
                onChange={e => setFormData({...formData, valor: e.target.value})}
                required
                style={{ width: "100%", padding: "10px", background: "#1a1a1a", border: "1px solid var(--border)", color: "#fff", boxSizing: "border-box" }}
              />
            </div>
            <div>
              <label style={{ fontSize: "10px", color: "var(--faint)", display: "block", marginBottom: "4px" }}>SINAL PAGO (R$)</label>
              <input 
                type="number" 
                step="0.01" 
                value={formData.sinal_pago} 
                onChange={e => setFormData({...formData, sinal_pago: e.target.value})}
                style={{ width: "100%", padding: "10px", background: "#1a1a1a", border: "1px solid var(--border)", color: "#fff", boxSizing: "border-box" }}
              />
            </div>
          </div>

          <button type="submit" className="dash-primary-btn" disabled={loading} style={{ marginTop: "10px", width: "100%" }}>
            {loading ? "SALVANDO..." : "CADASTRAR AGENDAMENTO"}
          </button>
        </form>
      </div>
    </div>
  );
}