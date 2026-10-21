import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "./AuthContext";
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
  grid: (
    <svg {...iconProps}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  calendar: (
    <svg {...iconProps}>
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M3 9h18M8 2v4M16 2v4" />
    </svg>
  ),
  users: (
    <svg {...iconProps}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
      <path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.3c2.2.7 3.5 2.6 3.5 5.7" />
    </svg>
  ),
  box: (
    <svg {...iconProps}>
      <path d="M12 2.5 21 7v10l-9 4.5L3 17V7l9-4.5Z" />
      <path d="M3 7l9 4.5L21 7M12 11.5v10" />
    </svg>
  ),
  settings: (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
    </svg>
  ),
};

const MENU = [
  { id: "overview", label: "Visão geral", icon: Icons.grid, to: "/admin/dashboard" },
  { id: "agenda", label: "Agenda", icon: Icons.calendar, to: "/admin/agenda" },
  { id: "clients", label: "Clientes", icon: Icons.users, to: "/admin/clientes" },
  { id: "products", label: "Produtos", icon: Icons.box, to: "/admin/produtos" },
  { id: "settings", label: "Configurações", icon: Icons.settings, to: "/admin/configuracoes" },
];

export default function AdminSidebar() {
  const { logout } = useAuth();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleConfirmLogout = () => {
    setIsLogoutModalOpen(false);
    logout();
  };

  return (
    <>
      <aside className="dash-sidebar">
        <div className="dash-brand">
          <span className="dash-brand-name">MEIVE</span>
          <span className="dash-brand-badge">ADMIN</span>
        </div>

        <nav className="dash-nav" aria-label="Navegação do painel">
          {MENU.map((item) => (
            <NavLink
              key={item.id}
              to={item.to}
              className={({ isActive }) => `dash-nav-item ${isActive ? "is-active" : ""}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="dash-user">
          <div className="dash-avatar dash-avatar--lg">MB</div>
          <div className="dash-user-info">
            <strong>Meive Beauty</strong>
            <button type="button" className="dash-logout" onClick={() => setIsLogoutModalOpen(true)}>
              Sair do painel
            </button>
          </div>
        </div>
      </aside>

      {/* ---- MODAL DE CONFIRMAÇÃO DE SAÍDA ---- */}
      {isLogoutModalOpen && (
        <div className="clients-modal-overlay" onClick={() => setIsLogoutModalOpen(false)}>
          <div className="clients-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="clients-modal-header">
              <h2>ENCERRAR SESSÃO</h2>
              <button onClick={() => setIsLogoutModalOpen(false)} className="clients-modal-close">
                ✕
              </button>
            </div>
            <p style={{ fontSize: "12px", color: "#aaa", margin: 0 }}>
              Tem certeza de que deseja sair do painel administrativo?
            </p>
            <div className="clients-modal-actions">
              <button
                type="button"
                className="clients-btn-cancel"
                onClick={() => setIsLogoutModalOpen(false)}
              >
                CANCELAR
              </button>
              <button
                type="button"
                className="dash-primary-btn"
                onClick={handleConfirmLogout}
              >
                SIM, SAIR
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}