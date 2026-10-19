import React, { useState } from "react";
import "./AdminDashboard.css"; // header, botões, painel, avatar (compartilhados)
import "./AdminConfiguracoes.css";

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

/* ---------- Dados (troque por chamadas à sua API / Supabase) ---------- */
const TABS = [
  { id: "profile", label: "PERFIL DO STUDIO" },
  { id: "hours", label: "HORÁRIOS" },
  { id: "notifications", label: "NOTIFICAÇÕES" },
  { id: "payments", label: "PAGAMENTOS" },
];

const INITIAL_PROFILE = {
  name: "Meive Beauty Studio",
  phone: "(11) 99999-9999",
  email: "oi@meivebeauty.com.br",
  address: "São Paulo, SP",
};

const REMINDERS = [
  { id: "reminder24", title: "Lembrete 24 horas antes", desc: "Reduz faltas e confirma a presença da cliente." },
  { id: "confirmation", title: "Confirmação ao agendar", desc: "Envia os detalhes assim que o horário é reservado." },
];

/* ---------- Helpers ---------- */
function formatToday() {
  return new Date()
    .toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })
    .toUpperCase();
}

/* ---------- Componente ---------- */
export default function AdminConfiguracoes() {
  const [tab, setTab] = useState("profile");
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [toggles, setToggles] = useState({ reminder24: true, confirmation: true });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((p) => ({ ...p, [name]: value }));
  };

  const handleToggle = (id) => {
    setToggles((t) => ({ ...t, [id]: !t[id] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: salvar na API / Supabase
    console.log("Salvar", { profile, toggles });
  };

  return (
    <main className="dash-main">
      <header className="dash-header">
        <div>
          <span className="dash-date">{formatToday()}</span>
          <h1 className="dash-title">CONFIGURAÇÕES</h1>
        </div>

        <div className="dash-header-actions">
          <button type="button" className="dash-icon-btn" aria-label="Buscar">
            {Icons.search}
          </button>
        </div>
      </header>

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
            <>
              <section className="dash-panel settings-panel">
                <div className="dash-panel-head">
                  <div>
                    <h2 className="dash-panel-title">PERFIL DO STUDIO</h2>
                    <p className="dash-panel-sub">Informações exibidas para suas clientes</p>
                  </div>
                </div>

                <div className="settings-logo">
                  <div className="dash-avatar settings-logo-avatar">MB</div>
                  <div className="settings-logo-info">
                    <strong>Logo do studio</strong>
                    <span>PNG ou JPG · máximo de 2 MB</span>
                    <button type="button" className="settings-logo-btn">
                      ALTERAR IMAGEM
                    </button>
                  </div>
                </div>

                <div className="settings-fields">
                  <label className="settings-field">
                    <span>NOME DO NEGÓCIO</span>
                    <input name="name" value={profile.name} onChange={handleChange} />
                  </label>

                  <label className="settings-field">
                    <span>TELEFONE</span>
                    <input name="phone" type="tel" value={profile.phone} onChange={handleChange} />
                  </label>

                  <label className="settings-field settings-field--full">
                    <span>E-MAIL</span>
                    <input name="email" type="email" value={profile.email} onChange={handleChange} />
                  </label>

                  <label className="settings-field settings-field--full">
                    <span>ENDEREÇO</span>
                    <input name="address" value={profile.address} onChange={handleChange} />
                  </label>
                </div>
              </section>

              <section className="dash-panel settings-panel">
                <div className="dash-panel-head">
                  <div>
                    <h2 className="dash-panel-title">LEMBRETES AUTOMÁTICOS</h2>
                    <p className="dash-panel-sub">Mensagens enviadas antes de cada atendimento</p>
                  </div>
                </div>

                <ul className="dash-list">
                  {REMINDERS.map((r) => (
                    <li key={r.id} className="settings-toggle-row">
                      <div className="settings-toggle-info">
                        <strong>{r.title}</strong>
                        <span>{r.desc}</span>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={toggles[r.id]}
                        aria-label={r.title}
                        className={`settings-switch ${toggles[r.id] ? "is-on" : ""}`}
                        onClick={() => handleToggle(r.id)}
                      >
                        <span className="settings-switch-knob" />
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            </>
          ) : (
            <section className="dash-panel settings-panel">
              <div className="dash-panel-head">
                <div>
                  <h2 className="dash-panel-title">
                    {TABS.find((t) => t.id === tab)?.label}
                  </h2>
                  <p className="dash-panel-sub">Em breve.</p>
                </div>
              </div>
            </section>
          )}

          <div className="settings-footer">
            <span>Alterações salvas automaticamente</span>
            <button type="submit" className="dash-primary-btn settings-save">
              SALVAR ALTERAÇÕES
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}