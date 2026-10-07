import React from "react";
import "./Sobre.css";

export default function AboutSection() {
  return (
    <section id="sobre" className="about-section">

      {/* IMAGEM */}
      <div className="about-image-side">
        <div className="about-image-overlay"></div>
      </div>

      {/* CONTEÚDO */}
      <div className="about-content-side">

        <span className="about-subtitle">
          NOSSA HISTÓRIA
        </span>

        <h2 className="about-title">
          ARTE QUE
          <span className="highlight-red"> TRANSFORMA</span>
          <br />
          OLHARES
        </h2>

        <p className="about-lead">
          O Meive Beauty Studio nasceu da paixão por transformar olhares
          e elevar a autoestima de cada cliente. Aqui, cada detalhe é
          pensado para que você se sinta incrível.
        </p>

        <p className="about-subtext">
          Trabalhamos com fios importados, cola hipoalergênica e técnicas
          atualizadas. Porque você merece o melhor — sem negociação.
        </p>

        <div className="about-specs-grid">

          <div className="spec-card">
            <span className="spec-label">
              CERTIFICADA
            </span>
            <span className="spec-value">
              ABPE & Lash Academy BR
            </span>
          </div>

          <div className="spec-card">
            <span className="spec-label">
              MATERIAIS
            </span>
            <span className="spec-value">
              Importados da Coreia
            </span>
          </div>

          <div className="spec-card">
            <span className="spec-label">
              EXPERIÊNCIA
            </span>
            <span className="spec-value">
              3 anos no mercado
            </span>
          </div>

          <div className="spec-card">
            <span className="spec-label">
              CLIENTES
            </span>
            <span className="spec-value">
              500+ atendidas
            </span>
          </div>

        </div>
      </div>

    </section>
  );
}