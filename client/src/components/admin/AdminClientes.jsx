import React, { useState, useEffect } from "react";
import "./AdminDashboard.css"; 
import "./AdminClientes.css";
import "./AdminAvisos.css";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { api } from "../../api";

/* ---------- Ícones (SVG inline) ---------- */
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
  close: (
    <svg {...iconProps} width="18" height="18">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  ),
};

/* ---------- Helpers ---------- */
function formatToday() {
  return new Date()
    .toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })
    .toUpperCase();
}

function getInitials(name) {
  if (!name) return "CL";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

function formatDate(dateString) {
  if (!dateString) return "Cadastrada recentemente";
  const date = new Date(dateString);
  if (isNaN(date)) return dateString;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

/* Máscara de WhatsApp / Telefone: (00) 00000-0000 */
function applyPhoneMask(value) {
  if (!value) return "";
  const numbers = value.replace(/\D/g, "").slice(0, 11);
  if (numbers.length <= 2) {
    return `(${numbers}`;
  }
  if (numbers.length <= 7) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  }
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
}

/* ---------- Validação e mensagens de erro ---------- */
const ROTULOS_CAMPOS = { nome: "Nome", email: "E-mail", telefone: "Telefone", password: "Senha" };

function formatarErroApi(error) {
  const d = error?.dados;
  if (!d) return error?.message || "Erro inesperado. Tente novamente.";
  if (typeof d === "string") return d;
  if (d.detail) return d.detail;
  return Object.entries(d)
    .map(([campo, msgs]) => `${ROTULOS_CAMPOS[campo] || campo}: ${[].concat(msgs).join(" ")}`)
    .join("\n");
}

function validarCliente({ nome, email, senha }, exigirSenha = false) {
  if (!nome.trim()) return "Informe o nome completo.";
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) return "Informe um e-mail válido.";
  if (exigirSenha && senha.length < 8) return "A senha inicial deve ter no mínimo 8 caracteres.";
  return null;
}

/* ---------- Componente ---------- */
export default function AdminClientes() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modais de formulário
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  // Estados dos modais customizados de aviso e confirmação
  const [toastInfo, setToastInfo] = useState(null); 
  const [confirmInfo, setConfirmInfo] = useState(null); 

  // Campos do formulário de Nova Cliente
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Campos do modal de Edição
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");

  // Buscar clientes via API centralizada
  const fetchClients = async () => {
    try {
      setLoading(true);
      const data = await api("/clientes/");
      const results = Array.isArray(data) ? data : data.results || [];
      setClients(results);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
      setToastInfo({
        title: "ERRO DE CONEXÃO",
        message: `Não foi possível carregar as clientes.\n${formatarErroApi(error)}`
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const filteredClients = clients.filter(
    (c) =>
      c.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.telefone?.includes(searchTerm) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Criar Nova Cliente
  const handleCreateClient = async (e) => {
    e.preventDefault();
    const erroValidacao = validarCliente(
      { nome: newName, email: newEmail, senha: newPassword },
      true
    );
    if (erroValidacao) {
      setToastInfo({ title: "CAMPOS INVÁLIDOS", message: erroValidacao });
      return;
    }

    try {
      await api("/clientes/", {
        method: "POST",
        body: JSON.stringify({
          nome: newName.trim(),
          email: newEmail.trim().toLowerCase(),
          telefone: newPhone?.trim() || null,
          password: newPassword,
          tipo: "CLIENTE",
        }),
      });

      await fetchClients(); 
      setNewName("");
      setNewEmail("");
      setNewPhone("");
      setNewPassword("");
      setIsNewModalOpen(false);
      setToastInfo({
        title: "SUCESSO",
        message: "Cliente cadastrada com sucesso!"
      });
    } catch (error) {
      console.error("Erro na requisição:", error);
      const errorDetail = formatarErroApi(error);
      setToastInfo({
        title: "ERRO AO CADASTRAR",
        message: `Não foi possível cadastrar a cliente.\n${errorDetail}`
      });
    }
  };

  const handleOpenEditModal = (client) => {
    setSelectedClient(client);
    setEditName(client.nome || "");
    setEditEmail(client.email || "");
    setEditPhone(client.telefone || "");
  };

  // Atualizar Cliente
  const handleUpdateClient = async (e) => {
    e.preventDefault();
    if (!selectedClient) return;

    const erroValidacao = validarCliente({ nome: editName, email: editEmail, senha: "" });
    if (erroValidacao) {
      setToastInfo({ title: "CAMPOS INVÁLIDOS", message: erroValidacao });
      return;
    }

    try {
      await api(`/clientes/${selectedClient.id_usuario}/`, {
        method: "PATCH",
        body: JSON.stringify({
          nome: editName.trim(),
          email: editEmail.trim().toLowerCase(),
          telefone: editPhone?.trim() || null,
        }),
      });

      await fetchClients();
      setSelectedClient(null);
      setToastInfo({
        title: "SUCESSO",
        message: "Informações da cliente atualizadas com sucesso!"
      });
    } catch (error) {
      console.error("Erro na atualização:", error);
      const errorDetail = formatarErroApi(error);
      setToastInfo({
        title: "ERRO AO ATUALIZAR",
        message: `Não foi possível atualizar a cliente.\n${errorDetail}`
      });
    }
  };

  // Excluir Cliente (com confirmação customizada)
  const requestDeleteClient = (id) => {
    setConfirmInfo({
      title: "EXCLUIR CLIENTE",
      message: "Tem certeza de que deseja excluir esta cliente? Esta ação não poderá ser desfeita.",
      onConfirm: async () => {
        setConfirmInfo(null);
        try {
          await api(`/clientes/${id}/`, {
            method: "DELETE",
          });

          await fetchClients();
          setSelectedClient(null);
          setToastInfo({
            title: "SUCESSO",
            message: "A cliente foi excluída com sucesso!"
          });
        } catch (error) {
          console.error("Erro na exclusão:", error);
          const errorDetail = formatarErroApi(error);
          setToastInfo({
            title: "ERRO AO EXCLUIR",
            message: `Não foi possível excluir a cliente.\n${errorDetail}`
          });
        }
      }
    });
  };

  const totalClientsCount = clients.length;
  const vipCount = Math.round(totalClientsCount * 0.23);

  const exportClientsPdf = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const hoje = new Date();
    const dataAtual = hoje.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
    const horaAtual = hoje.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    const clientesExportadas = filteredClients;

    doc.setFillColor(36, 31, 32);
    doc.rect(0, 0, 297, 42, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("MEVIE", 15, 17);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("STUDIO BEAUTY", 15, 24);

    doc.setFontSize(15);
    doc.setFont("helvetica", "bold");
    doc.text("LISTA DE CLIENTES", 15, 34);

    doc.setTextColor(65, 58, 60);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Emitido em: ${dataAtual} às ${horaAtual}`, 15, 52);
    doc.text(`Total de clientes: ${clientesExportadas.length}`, 15, 59);

    autoTable(doc, {
      startY: 66,
      head: [["Nº", "NOME", "TELEFONE / WHATSAPP", "E-MAIL", "DATA DE CADASTRO"]],
      body: clientesExportadas.map((cliente, index) => [
        index + 1,
        cliente.nome || "-",
        cliente.telefone || "-",
        cliente.email || "-",
        cliente.criado_em ? new Date(cliente.criado_em).toLocaleDateString("pt-BR") : "-",
      ]),
      theme: "grid",
      margin: { left: 15, right: 15, bottom: 20 },
      styles: {
        font: "helvetica",
        fontSize: 9,
        cellPadding: 4,
        textColor: [55, 48, 50],
        lineColor: [230, 223, 225],
        lineWidth: 0.2,
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: [130, 91, 104],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [250, 246, 247],
      },
      columnStyles: {
        0: { cellWidth: 12 },
        1: { cellWidth: 48 },
        2: { cellWidth: 43 },
        3: { cellWidth: 95 },
        4: { cellWidth: 39 },
      },
      didDrawPage: () => {
        const pagina = doc.internal.getNumberOfPages();
        const altura = doc.internal.pageSize.getHeight();
        doc.setFontSize(8);
        doc.setTextColor(120, 110, 113);
        doc.text("MEVIE - STUDIO BEAUTY | Relatório de clientes", 15, altura - 8);
        doc.text(`Página ${pagina}`, doc.internal.pageSize.getWidth() - 15, altura - 8, { align: "right" });
      },
    });

    doc.save(`mevie-clientes-${hoje.toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <main className="dash-main">
      <header className="dash-header">
        <div>
          <span className="dash-date">{formatToday()}</span>
          <h1 className="dash-title">CLIENTES</h1>
        </div>

        <div className="dash-header-actions">
          <div className={`dash-search-container ${searchOpen ? "is-open" : ""}`}>
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="dash-search-input"
            />
            <button
              type="button"
              className="dash-icon-btn"
              aria-label="Buscar"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              {Icons.search}
            </button>
          </div>

          <button
            type="button"
            className="dash-primary-btn"
            onClick={() => setIsNewModalOpen(true)}
          >
            + NOVA CLIENTE
          </button>
        </div>
      </header>

      <section className="clients-stats" aria-label="Indicadores de clientes">
        <article className="clients-stat">
          <div className="clients-stat-icon clients-stat-icon--red">{Icons.users}</div>
          <div className="clients-stat-body">
            <strong className="clients-stat-value">{totalClientsCount}</strong>
            <span className="clients-stat-label">CLIENTES ATIVAS</span>
          </div>
          <span className="clients-stat-note">Banco Neon</span>
        </article>

        <article className="clients-stat">
          <div className="clients-stat-icon clients-stat-icon--purple">{Icons.star}</div>
          <div className="clients-stat-body">
            <strong className="clients-stat-value">{vipCount}</strong>
            <span className="clients-stat-label">CLIENTES VIP</span>
          </div>
          <span className="clients-stat-note">23% da base</span>
        </article>

        <article className="clients-stat">
          <div className="clients-stat-icon clients-stat-icon--gray">{Icons.calendar}</div>
          <div className="clients-stat-body">
            <strong className="clients-stat-value">0%</strong>
            <span className="clients-stat-label">RETORNO EM 30 DIAS</span>
          </div>
          <span className="clients-stat-note">+4,2% no mês</span>
        </article>
      </section>

      <section className="dash-panel clients-panel">
        <div className="dash-panel-head">
          <div>
            <h2 className="dash-panel-title">BASE DE CLIENTES</h2>
            <p className="dash-panel-sub">
              {filteredClients.length} de {totalClientsCount} clientes listadas
            </p>
          </div>
          <button type="button" className="clients-export" onClick={exportClientsPdf}>
            EXPORTAR LISTA
          </button>
        </div>

        <div className="clients-table" role="table" aria-label="Base de clientes">
          <div className="clients-row clients-row--head" role="row">
            <span role="columnheader">CLIENTE</span>
            <span role="columnheader" className="clients-col-contact">CONTATO / E-MAIL</span>
            <span role="columnheader" className="clients-col-last">CADASTRO</span>
            <span role="columnheader" className="clients-col-visits">VISITAS</span>
            <span role="columnheader" className="clients-col-total">TOTAL INVESTIDO</span>
            <span aria-hidden="true" />
          </div>

          {loading ? (
            <div className="clients-empty-msg">Carregando clientes do banco...</div>
          ) : filteredClients.length > 0 ? (
            filteredClients.map((c) => (
              <button
                key={c.id_usuario}
                type="button"
                className="clients-row clients-row--item"
                role="row"
                onClick={() => handleOpenEditModal(c)}
              >
                <span className="clients-name" role="cell">
                  <span className="dash-avatar clients-avatar">{getInitials(c.nome)}</span>
                  <strong>{c.nome}</strong>
                </span>
                <span className="clients-phone clients-col-contact" role="cell">
                  {c.telefone || c.email}
                </span>
                <span className="clients-last clients-col-last" role="cell">
                  {formatDate(c.criado_em)}
                </span>
                <strong className="clients-visits clients-col-visits" role="cell">-</strong>
                <strong className="clients-total clients-col-total" role="cell">R$ 0,00</strong>
                <span className="clients-chevron" aria-hidden="true">{Icons.chevron}</span>
              </button>
            ))
          ) : (
            <div className="clients-empty-msg">Nenhuma cliente encontrada no banco.</div>
          )}
        </div>
      </section>

      {/* ---- MODAL: NOVA CLIENTE ---- */}
      {isNewModalOpen && (
        <div className="clients-modal-overlay" onClick={() => setIsNewModalOpen(false)}>
          <div className="clients-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="clients-modal-header">
              <h2>ADICIONAR NOVA CLIENTE</h2>
              <button onClick={() => setIsNewModalOpen(false)} className="clients-modal-close">
                {Icons.close}
              </button>
            </div>
            <form onSubmit={handleCreateClient} className="clients-form" noValidate>
              <div className="clients-form-group">
                <label>Nome Completo</label>
                <input
                  type="text"
                  placeholder="Ex: Ana Souza"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                />
              </div>
              <div className="clients-form-group">
                <label>E-mail</label>
                <input
                  type="email"
                  placeholder="ana@email.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                />
              </div>
              <div className="clients-form-group">
                <label>Telefone / WhatsApp</label>
                <input
                  type="text"
                  placeholder="(11) 99999-9999"
                  value={newPhone}
                  onChange={(e) => setNewPhone(applyPhoneMask(e.target.value))}
                  maxLength={15}
                />
              </div>
              <div className="clients-form-group">
                <label>Senha inicial (mínimo de 8 caracteres)</label>
                <input
                  type="password"
                  placeholder="Defina uma senha inicial"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={8}
                  autoComplete="new-password"
                  required
                />
              </div>
              <div className="clients-modal-actions">
                <button
                  type="button"
                  className="clients-btn-cancel"
                  onClick={() => setIsNewModalOpen(false)}
                >
                  CANCELAR
                </button>
                <button type="submit" className="dash-primary-btn">
                  CADASTRAR CLIENTE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---- MODAL: EDITAR / EXCLUIR CLIENTE ---- */}
      {selectedClient && (
        <div className="clients-modal-overlay" onClick={() => setSelectedClient(null)}>
          <div className="clients-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="clients-modal-header">
              <div className="clients-modal-title-wrap">
                <span className="dash-avatar clients-avatar">{getInitials(selectedClient.nome)}</span>
                <h2>EDITAR CLIENTE</h2>
              </div>
              <button onClick={() => setSelectedClient(null)} className="clients-modal-close">
                {Icons.close}
              </button>
            </div>
            <form onSubmit={handleUpdateClient} className="clients-form" noValidate>
              <div className="clients-form-group">
                <label>Nome Completo</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>
              <div className="clients-form-group">
                <label>E-mail</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  required
                />
              </div>
              <div className="clients-form-group">
                <label>Telefone / WhatsApp</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(applyPhoneMask(e.target.value))}
                  maxLength={15}
                />
              </div>

              <div className="clients-modal-info-row">
                <span>Cliente desde: <strong>{formatDate(selectedClient.criado_em)}</strong></span>
              </div>

              <div className="clients-modal-actions clients-modal-actions--split">
                <button
                  type="button"
                  className="clients-btn-delete"
                  onClick={() => requestDeleteClient(selectedClient.id_usuario)}
                >
                  EXCLUIR CLIENTE
                </button>
                <div className="clients-modal-right-btns">
                  <button
                    type="button"
                    className="clients-btn-cancel"
                    onClick={() => setSelectedClient(null)}
                  >
                    CANCELAR
                  </button>
                  <button type="submit" className="dash-primary-btn">
                    SALVAR ALTERAÇÕES
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---- MODAL CUSTOMIZADO DE AVISOS (TOAST) ---- */}
      {toastInfo && (
        <div className="clients-toast-overlay" onClick={() => setToastInfo(null)}>
          <div className="clients-toast-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="clients-toast-title">{toastInfo.title}</h3>
            <p className="clients-toast-message">{toastInfo.message}</p>
            <div className="clients-toast-actions">
              <button
                type="button"
                className="dash-primary-btn"
                onClick={() => setToastInfo(null)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---- MODAL CUSTOMIZADO DE CONFIRMAÇÃO (EXCLUSÃO) ---- */}
      {confirmInfo && (
        <div className="clients-toast-overlay" onClick={() => setConfirmInfo(null)}>
          <div className="clients-toast-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="clients-toast-title">{confirmInfo.title}</h3>
            <p className="clients-toast-message">{confirmInfo.message}</p>
            <div className="clients-toast-actions">
              <button
                type="button"
                className="clients-btn-cancel"
                onClick={() => setConfirmInfo(null)}
              >
                CANCELAR
              </button>
              <button
                type="button"
                className="clients-btn-delete"
                onClick={confirmInfo.onConfirm}
              >
                CONFIRMAR EXCLUSÃO
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}