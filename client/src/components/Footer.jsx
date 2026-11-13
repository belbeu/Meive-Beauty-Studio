import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useStudio, agruparHorarios } from "../studio";
import "./Footer.css";

export default function Footer() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const studio = useStudio();
  const horarios = agruparHorarios(studio.horarios);

  // Função para rolar suavemente até seções internas na Home
  const irPara = (e, id) => {
    e.preventDefault();
    if (pathname === "/") {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate({ pathname: "/", hash: `#${id}` });
    }
  };

  return (
    <footer className="site-footer" id="footer">
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

        {/* Coluna 2: EXPLORE */}
        <div className="footer-col explore-col">
          <h4 className="footer-title highlight-title">EXPLORE</h4>
          <ul className="explore-list">
            <li>
              <a href="#servicos" onClick={(e) => irPara(e, "servicos")}>
                SERVIÇOS & CURSOS
              </a>
            </li>
            <li>
              <a href="#produtos" onClick={(e) => irPara(e, "produtos")}>
                PRODUTOS
              </a>
            </li>
            <li>
              <Link to="/login">MINHA CONTA</Link>
            </li>
          
            <li>
                <Link to="/agendar">
                AGENDAR
                </Link>
            </li>
          </ul>
        </div>

        {/* Coluna 3: Horários */}
        <div className="footer-col schedule-col">
          <h4 className="footer-title">HORÁRIOS</h4>
          <ul className="schedule-list">
            {horarios.map((h) => (
              <li key={h.rotulo}>
                <span>{h.rotulo}</span>
                <span className={h.aberto ? "highlight-time" : "closed-time"}>{h.texto}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Coluna 4: Contato */}
        <div className="footer-col contact-col">
          <h4 className="footer-title">CONTATO</h4>
          <ul className="contact-list">
            <li>
              <span className="icon">📍</span>
              <span>{studio.endereco}</span>
            </li>
            <li>
              <span className="icon">📱</span>
              <span>{studio.telefone}</span>
            </li>
            <li>
              <span className="icon">📧</span>
              <span>{studio.email}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Linha inferior de Copyright */}
      <div className="footer-bottom">
        <p>© 2026 {studio.nome}. Todos os direitos reservados.</p>
        <span className="hashtag">#MeiveBeauty</span>
      </div>
    </footer>
  );
}