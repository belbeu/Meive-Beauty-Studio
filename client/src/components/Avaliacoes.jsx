import React from "react";
import "./Avaliacoes.css";

export default function Testimonials() {
  return (
    <section className="testimonials-section">
      <div
        style={{
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          marginBottom: "50px",
        }}
      >
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "12px",
            letterSpacing: "4px",
            color: "#ad1838",
            fontWeight: "600",
            marginBottom: "20px",
            whiteSpace: "nowrap",
            display: "inline-block",
          }}
        >
          DEPOIMENTOS
        </span>
        <h2
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            margin: "0",
            padding: "0",
            lineHeight: "0.9",
          }}
        >
          <span
            style={{
              fontFamily: '"Bebas Neue", sans-serif',
              fontSize: "78px",
              color: "#ffffff",
              margin: "0 0 -5px 0",
            }}
          >
            O QUE AS
          </span>

          <span
            style={{
              fontFamily: '"Bebas Neue", sans-serif',
              fontSize: "85px",
              color: "#8a2be2",
              margin: "0 0 -5px 0",
              letterSpacing: "1px",
            }}
          >
            MEIVE GIRLS
          </span>

          <span
            style={{
              fontFamily: '"Bebas Neue", sans-serif',
              fontSize: "78px",
              color: "#ffffff",
              margin: "0",
            }}
          >
            DIZEM
          </span>
        </h2>
      </div>

      <div className="testimonials-grid">
        {/* Card 1 */}
        <div className="testimonial-card">
          <div className="stars">★★★★★</div>
          <p className="testimonial-text">
            "Fiz volume russo e não tem volta. A Meive arrasa demais, tudo perfeito!"
          </p>
          <div className="testimonial-author">
            <span className="author-avatar">A</span>
            <span className="author-name">Ana Paula M.</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="testimonial-card">
          <div className="stars">★★★★★</div>
          <p className="testimonial-text">
            "Acordei pronta. Melhor decisão da minha vida foi descobrir o Meive Beauty Studio."
          </p>
          <div className="testimonial-author">
            <span className="author-avatar">B</span>
            <span className="author-name">Bruna L.</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="testimonial-card">
          <div className="stars">★★★★★</div>
          <p className="testimonial-text">
            "Fora o resultado incrível, o espaço é lindo e o atendimento é impecável."
          </p>
          <div className="testimonial-author">
            <span className="author-avatar">L</span>
            <span className="author-name">Larissa C.</span>
          </div>
        </div>
      </div>
    </section>
  );
}