import { Link } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  return (
    <header className="navbar">
      {/* Logo redireciona para a página inicial */}
      <Link to="/" className="logo">
        <span className="logo-main">MEIVE</span>
        <span className="logo-sub">BEAUTY STUDIO</span>
      </Link>

      <nav className="nav-links">
        <Link to="/courses">CURSOS</Link>
        <a href="/#servicos">SERVIÇOS</a>
        <a href="/#produtos">PRODUTOS</a>
        <a href="/#sobre">SOBRE</a>
        <a href="/#promocoes">PROMOÇÕES</a>
        <a href="/#contato">CONTATO</a>
      </nav>

      <div className="nav-actions">
        <button className="cart-box-button" aria-label="Carrinho">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
        </button>
   
        {/* Botão Minha Conta redireciona para /login */}
        <Link to="/login" className="account-box-button">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span>MINHA CONTA</span>
        </Link>
      </div>
    </header>
  );
}