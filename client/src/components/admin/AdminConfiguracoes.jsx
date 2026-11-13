import React, { useEffect, useState } from "react";
import "./AdminDashboard.css"; // header, botões, painel (compartilhados)
import "./AdminConfiguracoes.css";
import "./AdminAvisos.css"; // modal de aviso (mesmo padrão das outras telas)
import { api } from "../../api";
import {
  DIAS,
  agruparHorarios,
  atualizarCacheStudio,
  mascararTelefone,
} from "../../studio";

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
};

/* ---------- Seções ---------- */
const TABS = [
  { id: "profile", label: "PERFIL DO STUDIO" },
  { id: "hours", label: "HORÁRIOS" },
];

/* ---------- Helpers ---------- */
function formatToday() {
  return new Date()
    .toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })
    .toUpperCase();
}

function extrairForm(dados) {
  return {
    nome: dados.nome,
    telefone: dados.telefone,
    email: dados.email,
    endereco: dados.endereco,
    horarios: dados.horarios,
  };
}

// Junta as mensagens de erro que o Django devolve ({campo: ["msg"]}) em um texto só.
function mensagemDeErro(erro) {
  const dados = erro?.dados;
  if (dados && typeof dados === "object") {
    const textos = Object.values(dados)
      .flat()
      .filter((m) => typeof m === "string");
    if (textos.length) return textos.join("\n");
  }
  if (erro?.status === 403) return "Você não tem permissão para alterar as configurações.";
  return "Não foi possível salvar agora. Tente novamente em instantes.";
}

function validar(form) {
  if (!form.nome.trim()) return "Informe o nome do negócio.";
  const digitos = form.telefone.replace(/\D/g, "");
  if (digitos.length !== 10 && digitos.length !== 11) {
    return "Informe um telefone com DDD (10 ou 11 dígitos).";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return "Informe um e-mail válido.";
  if (!form.endereco.trim()) return "Informe o endereço.";
  for (const dia of DIAS) {
    const h = form.horarios[dia.id];
    if (h.aberto && (!h.abre || !h.fecha || h.fecha <= h.abre)) {
      return `${dia.longo}: o fechamento deve ser depois da abertura.`;
    }
  }
  return null;
}

/* ---------- Componente ---------- */
export default function AdminConfiguracoes() {
  const [tab, setTab] = useState("profile");
  const [carregando, setCarregando] = useState(true);
  const [erroCarga, setErroCarga] = useState(false);
  const [salvo, setSalvo] = useState(null); // último estado gravado no banco
  const [form, setForm] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [toastInfo, setToastInfo] = useState(null);

  const carregar = () => {
    setCarregando(true);
    setErroCarga(false);
    api("/studio/")
      .then((dados) => {
        const inicial = extrairForm(dados);
        setSalvo(inicial);
        setForm(inicial);
      })
      .catch(() => setErroCarga(true))
      .finally(() => setCarregando(false));
  };

  useEffect(carregar, []);

  const alterado = form && salvo && JSON.stringify(form) !== JSON.stringify(salvo);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: name === "telefone" ? mascararTelefone(value) : value }));
  };

  const handleDia = (id, mudanca) => {
    setForm((f) => ({
      ...f,
      horarios: { ...f.horarios, [id]: { ...f.horarios[id], ...mudanca } },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!alterado || salvando) return;

    const problema = validar(form);
    if (problema) {
      setToastInfo({ title: "CAMPOS INVÁLIDOS", message: problema });
      return;
    }

    setSalvando(true);
    try {
      const dados = await api("/studio/", {
        method: "PATCH",
        body: JSON.stringify({
          ...form,
          nome: form.nome.trim(),
          email: form.email.trim(),
          endereco: form.endereco.trim(),
        }),
      });
      const gravado = extrairForm(dados);
      setSalvo(gravado);
      setForm(gravado);
      atualizarCacheStudio(dados); // rodapé do site já mostra o novo conteúdo
      setToastInfo({
        title: "CONFIGURAÇÕES SALVAS",
        message: "As informações do studio e os horários foram atualizados no site.",
      });
    } catch (erro) {
      setToastInfo({ title: "NÃO FOI POSSÍVEL SALVAR", message: mensagemDeErro(erro) });
    } finally {
      setSalvando(false);
    }
  };

  const previa = form ? agruparHorarios(form.horarios) : [];

  return (
    <main className="dash-main">
      <header className="dash-header">
        <div>
          <span className="dash-date">{formatToday()}</span>
          <h1 className="dash-title">CONFIGURAÇÕES</h1>
        </div>

        <div className="dash-header-actions">
          
        </div>
      </header>

      {carregando ? (
        <section className="dash-panel settings-panel">
          <p className="dash-panel-sub">Carregando configurações...</p>
        </section>
      ) : erroCarga ? (
        <section className="dash-panel settings-panel">
          <h2 className="dash-panel-title">NÃO FOI POSSÍVEL CARREGAR</h2>
          <p className="dash-panel-sub">Verifique a conexão com o servidor e tente de novo.</p>
          <button type="button" className="dash-primary-btn settings-retry" onClick={carregar}>
            TENTAR NOVAMENTE
          </button>
        </section>
      ) : (
        <div className="settings-layout">
          {/* ---- Menu lateral de seções ---- */}
          <nav className="settings-nav" role="tablist" aria-label="Seções de configurações">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                className={`settings-nav-item ${tab === t.id ? "is-active" : ""}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </nav>

          {/* ---- Conteúdo ---- */}
          <form className="settings-content" onSubmit={handleSubmit}>
            {tab === "profile" ? (
              <section className="dash-panel settings-panel">
                <div className="dash-panel-head">
                  <div>
                    <h2 className="dash-panel-title">PERFIL DO STUDIO</h2>
                    <p className="dash-panel-sub">Informações exibidas para suas clientes</p>
                  </div>
                </div>

                <div className="settings-fields settings-fields--spaced">
                  <label className="settings-field settings-field--full">
                    <span>NOME DO NEGÓCIO</span>
                    <input name="nome" value={form.nome} onChange={handleChange} maxLength={150} />
                  </label>

                  <label className="settings-field">
                    <span>TELEFONE / WHATSAPP</span>
                    <input
                      name="telefone"
                      type="tel"
                      value={form.telefone}
                      onChange={handleChange}
                      placeholder="(11) 99999-9999"
                    />
                  </label>

                  <label className="settings-field">
                    <span>E-MAIL</span>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      maxLength={150}
                    />
                  </label>

                  <label className="settings-field settings-field--full">
                    <span>ENDEREÇO</span>
                    <input
                      name="endereco"
                      value={form.endereco}
                      onChange={handleChange}
                      maxLength={255}
                    />
                  </label>
                </div>
              </section>
            ) : (
              <>
                <section className="dash-panel settings-panel">
                  <div className="dash-panel-head">
                    <div>
                      <h2 className="dash-panel-title">HORÁRIOS DE FUNCIONAMENTO</h2>
                      <p className="dash-panel-sub">Exibidos no rodapé do site</p>
                    </div>
                  </div>

                  <ul className="dash-list">
                    {DIAS.map((dia) => {
                      const h = form.horarios[dia.id];
                      return (
                        <li key={dia.id} className="settings-hours-row">
                          <strong className="settings-hours-day">{dia.longo}</strong>

                          <div className="settings-hours-times">
                            {h.aberto ? (
                              <>
                                <input
                                  type="time"
                                  className="settings-time"
                                  aria-label={`${dia.longo}: abre às`}
                                  value={h.abre}
                                  onChange={(e) => handleDia(dia.id, { abre: e.target.value })}
                                />
                                <span>às</span>
                                <input
                                  type="time"
                                  className="settings-time"
                                  aria-label={`${dia.longo}: fecha às`}
                                  value={h.fecha}
                                  onChange={(e) => handleDia(dia.id, { fecha: e.target.value })}
                                />
                              </>
                            ) : (
                              <span className="settings-hours-closed">Fechado</span>
                            )}
                          </div>

                          <button
                            type="button"
                            role="switch"
                            aria-checked={h.aberto}
                            aria-label={`${dia.longo}: aberto`}
                            className={`settings-switch ${h.aberto ? "is-on" : ""}`}
                            onClick={() => handleDia(dia.id, { aberto: !h.aberto })}
                          >
                            <span className="settings-switch-knob" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </section>

                <section className="dash-panel settings-panel">
                  <div className="dash-panel-head">
                    <div>
                      <h2 className="dash-panel-title">PRÉVIA NO RODAPÉ</h2>
                      <p className="dash-panel-sub">Como os horários vão aparecer para as clientes</p>
                    </div>
                  </div>

                  <ul className="settings-preview">
                    {previa.map((p) => (
                      <li key={p.rotulo}>
                        <span>{p.rotulo}</span>
                        <span className={p.aberto ? "settings-preview-open" : ""}>{p.texto}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              </>
            )}

            <div className="settings-footer">
              <span>{alterado ? "Há alterações não salvas" : "Tudo salvo"}</span>
              <button
                type="submit"
                className="dash-primary-btn settings-save"
                disabled={!alterado || salvando}
              >
                {salvando ? "SALVANDO..." : "SALVAR ALTERAÇÕES"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ---- MODAL DE AVISO ---- */}
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
    </main>
  );
}
