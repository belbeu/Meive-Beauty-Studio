import React from "react";
import "./Navbar.css";

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="logo">
        <span className="logo-main">MEIVE</span>
        <span className="logo-sub">BEAUTY STUDIO</span>
      </div>

      <nav className="nav-links">
        <a href="#servicos">SERVIÇOS</a>
        <a href="#produtos">PRODUTOS</a>
        <a href="#sobre">SOBRE</a>
        <a href="#contato">CONTATO</a>
      </nav>

      <div className="nav-actions">
        <button className="cart-button" aria-label="Carrinho">
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.4L21 8H6" />
            <circle cx="10" cy="20" r="1" />
            <circle cx="18" cy="20" r="1" />
          </svg>
        </button>

        <a href="#contato" className="schedule-button">
          AGENDAR
        </a>
      </div>
    </header>
  );
}