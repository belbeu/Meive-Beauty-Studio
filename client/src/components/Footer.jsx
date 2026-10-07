import React from "react";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        {/* Coluna 1: Logo, descrição e redes sociais */}
        <div className="footer-col brand-col">
          <div className="footer-logo">
            <span className="logo-main">MEIVE</span>
            <span className="logo-sub">BEAUTY STUDIO</span>
          </div>
          <p className="footer-description">
            Studio de cílios e beleza em São Paulo.
            <br />
            Transformando olhares através da arte.
          </p>
          <div className="footer-socials">
            <a
              href="https://www.instagram.com/nineris.studio/"
              target="_blank"
              rel="noreferrer"
              className="social-btn"
            >
              INSTAGRAM
            </a>
            <a
              href="https://tiktok.com"
              target="_blank"
              rel="noreferrer"
              className="social-btn"
            >
              TIKTOK
            </a>
          </div>
        </div>

        {/* Coluna 2: Horários */}
        <div className="footer-col schedule-col">
          <h4 className="footer-title">HORÁRIOS</h4>
          <ul className="schedule-list">
            <li>
              <span>Ter - Sex</span>
              <span className="highlight-time">13h às 21h</span>
            </li>
            <li>
              <span>Sábado</span>
              <span className="highlight-time">9h às 1h</span>
            </li>
            <li>
              <span>Dom - Seg</span>
              <span className="closed-time">Fechado</span>
            </li>
          </ul>
        </div>

        {/* Coluna 3: Contato */}
        <div className="footer-col contact-col">
          <h4 className="footer-title">CONTATO</h4>
          <ul className="contact-list">
            <li>
              <span className="icon">📍</span>
              <span>R. Giancarlo Palanti, 22 A, 03661-050, Vila Ré</span>
            </li>
            <li>
              <span className="icon">📱</span>
              <span>(11) 94487-4969</span>
            </li>
            <li>
              <span className="icon">📧</span>
              <span>meivestudio@email.com</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Linha inferior de Copyright */}
      <div className="footer-bottom">
        <p>© 2026 Meive Beauty Studio. Todos os direitos reservados.</p>
        <span className="hashtag">#MeiveBeauty</span>
      </div>
    </footer>
  );
}