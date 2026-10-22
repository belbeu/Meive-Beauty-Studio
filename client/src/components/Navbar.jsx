import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Navbar.css";

export default function Navbar() {
  const { pathname, hash } = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname, hash]);

  useEffect(() => {
    if (pathname === "/" && hash) {
      const id = hash.replace("#", "");
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [pathname, hash]);

  const irPara = (e, id) => {
    e.preventDefault();
    setMenuOpen(false);

    if (pathname === "/") {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate({ pathname: "/", hash: `#${id}` });
    }
  };

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  return (
    <header className="navbar">
      <Link to="/" className="logo" onClick={() => setMenuOpen(false)}>
        <span className="logo-main">MEIVE</span>
        <span className="logo-sub">BEAUTY STUDIO</span>
      </Link>

      {/* Links da Navbar Desktop */}
      <nav className="nav-links">
        <Link to="/courses">CURSOS</Link>
        <Link to="/#servicos" onClick={(e) => irPara(e, "servicos")}>SERVIÇOS</Link>
        <Link to="/#produtos" onClick={(e) => irPara(e, "produtos")}>PRODUTOS</Link>
        <Link to="/#sobre" onClick={(e) => irPara(e, "sobre")}>SOBRE</Link>
        <Link to="/#promocoes" onClick={(size, e) => irPara(e, "promocoes")}>PROMOÇÕES</Link>
        <Link to="/#contato" onClick={(e) => irPara(e, "contato")}>CONTATO</Link>
      </nav>

      {/* Ações da Navbar Desktop */}
      <div className="nav-actions">
        <button className="cart-box-button" aria-label="Carrinho">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
        </button>

        <Link to="/login" className="account-box-button">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span>MINHA CONTA</span>
        </Link>
      </div>

      {/* Botão do Menu Hambúrguer (Mobile) */}
      <button 
        className="hamburger-toggle" 
        onClick={toggleMenu}
        aria-label="Toggle Menu"
      >
        {menuOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        )}
      </button>

      {/* Menu Suspenso Mobile */}
      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <div className="mobile-nav-links">
          <Link to="/courses" onClick={() => setMenuOpen(false)}>CURSOS</Link>
          <Link to="/#servicos" onClick={(e) => irPara(e, "servicos")}>SERVIÇOS</Link>
          <Link to="/#produtos" onClick={(e) => irPara(e, "produtos")}>PRODUTOS</Link>
          <Link to="/#sobre" onClick={(e) => irPara(e, "sobre")}>SOBRE</Link>
          <Link to="/#promocoes" onClick={(e) => irPara(e, "promocoes")}>PROMOÇÕES</Link>
          <Link to="/#contato" onClick={(e) => irPara(e, "contato")}>CONTATO</Link>
        </div>

        <div className="mobile-divider" />

        <div className="mobile-actions">
          <Link to="/login" className="account-box-button" onClick={() => setMenuOpen(false)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>MINHA CONTA</span>
          </Link>

          <button className="cart-box-button" aria-label="Carrinho" onClick={() => setMenuOpen(false)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}