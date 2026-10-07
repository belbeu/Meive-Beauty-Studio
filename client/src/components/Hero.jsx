import React from "react";
import "./Hero.css";

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-background"></div>
      <div className="hero-overlay"></div>

      <div className="hero-content">
        <div className="hero-title">
          <span>MEIVE</span>
          <span>BEAUTY</span>
          <span>STUDIO</span>
        </div>

        <p className="hero-description">
          Transformando olhares através da Arte.
        </p>

        <div className="hero-buttons">
          <a href="#contato" className="primary-button">
            AGENDAR AGORA
          </a>

          <a href="#servicos" className="secondary-button">
            VER SERVIÇOS
          </a>
        </div>

        <div className="stats">
          <div className="stat">
            <strong>500+</strong>
            <span>CLIENTES</span>
          </div>

          <div className="stat">
            <strong>3 anos</strong>
            <span>EXPERIÊNCIA</span>
          </div>

          <div className="stat">
            <strong>98%</strong>
            <span>5 ESTRELAS</span>
          </div>
        </div>
      </div>

      <div className="featured-card">
        <span className="card-label">MAIS POPULAR</span>
        <h2>VOLUME RUSSO</h2>
        <p>O lash que vira vício — cheio, dramático e perfeito.</p>
        <div className="card-footer">
          <strong>R$ 280</strong>
          <span>3 horas</span>
        </div>
      </div>
    </section>
  );
}