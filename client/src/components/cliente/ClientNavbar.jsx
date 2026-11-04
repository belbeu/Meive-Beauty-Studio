// Salvar como: src/components/cliente/ClientNavbar.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usuarioAtual, logout as fazerLogout } from "../../auth";
import ThemeToggle from "../ThemeToggle";
import FontSizeControls from "../../theme/FontSizeControls";
import "./ClienteDashboard.css"; // Reaproveita os estilos limpos da dashboard

function getInitials(fullName) {
  if (!fullName) return "MG";
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function ClientNavbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    async function carregarUsuario() {
      try {
        const dados = await usuarioAtual();
        setUsuario(dados);
      } catch (err) {
        // Se houver falha na sessão, mantém silencioso ou deixa o avatar padrão
      }
    }
    carregarUsuario();
  }, []);

  const confirmarLogout = () => {
    fazerLogout();
    navigate("/login");
  };

  const initials = getInitials(usuario?.nome);

  return (
    <header className="client-wrapper" style={{ padding: "24px 24px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <Link to="/minha-conta" className="client-tag" style={{ textDecoration: "none" }}>
          <i className="client-tag-line" /> VOLTAR AO PAINEL
        </Link>
      </div>

      <div className="client-user" style={{ marginTop: 0 }}>
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
            <Link to="/cestinha" role="menuitem" onClick={() => setMenuOpen(false)}>
              Minha Cestinha
            </Link>
            <Link to="/minha-conta" role="menuitem" onClick={() => setMenuOpen(false)}>
              Meu Painel
            </Link>
            <button 
              type="button" 
              role="menuitem" 
              onClick={() => {
                setMenuOpen(false);
                confirmarLogout();
              }}
            >
              Sair
            </button>
          </div>
        )}
      </div>
    </header>
  );
}