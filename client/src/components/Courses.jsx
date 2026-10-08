import React from "react";
import { Link } from "react-router-dom";
import "./Courses.css";

// Dados divididos por categorias
const categoriesData = [
  {
    categoryTitle: "TÉCNICAS DE ALONGAMENTO",
    courses: [
      {
        id: "01",
        tag: "MAIS PROCURADO",
        title: "FIO A FIO",
        description: "O curso de extensão de cílios fio a fio ensina a técnica de aplicar um fio sintético em cada cílio natural do cliente, com foco em segurança, simetria e durabilidade.",
        price: "R$ 1500",
        duration: "20h",
      },
      {
        id: "02",
        tag: null,
        title: "VOLUME RUSSO",
        description: "Montagem de leques artesanais contendo de 3 a 10 fios ultrafinos aplicados em cada cílio natural.",
        price: "R$ 1800",
        duration: "30h",
      },
      {
        id: "03",
        tag: null,
        title: "LASH LIFTING",
        description: "O curso ensina a aplicar uma química suave que altera a estrutura do fio natural, curvando-o desde a raiz.",
        price: "R$ 2300",
        duration: "28h",
      },
      {
        id: "04",
        tag: null,
        title: "MEGA VOLUME",
        description: "Uma evolução do Volume Russo, onde são aplicados fans com 10 a 20 fios extremamente finos e leves.",
        price: "R$ 2000",
        duration: "30h",
      },
    ],
  },
  {
    categoryTitle: "NEGÓCIOS E CLIENTELA",
    courses: [
      {
        id: "05",
        tag: "NOVO",
        title: "AGENDA LOTADA",
        description: "Posicionamento, conteúdo e estratégias de vendas para construir uma clientela fiel e faturar mais.",
        price: "R$ 900",
        duration: "10h",
      },
    ],
  },
];

export default function ServicesPage() {
  return (
    <div className="services-page-container">
      <div className="services-page-nav-bar">
        <Link to="/" className="back-home-btn">← Voltar ao Início</Link>
      </div>

      <section className="services-section">
        <div className="services-header-container">
          <div className="services-titles">
            <span className="services-subtitle">MEIVE BEAUTY STUDIO</span>
            <h2 className="services-title">CURSOS PROFISSIONAIS</h2>
          </div>
          <p className="services-top-note">
            Os cursos profissionais de formação para Lash Designers (design de cílios) ensinam desde a anatomia do olho até técnicas complexas de colagem e visagismo.
          </p>
        </div>

        {/* Mapeia cada categoria */}
        {categoriesData.map((category, index) => (
          // Ajustado o marginBottom para 30px para aproximar do próximo bloco
          <div key={index} className="course-category-block" style={{ marginBottom: "30px" }}>
            
            {/* Título da Categoria */}
            <h3 style={{ 
              fontFamily: "'Bebas Neue', sans-serif", 
              fontSize: "32px", 
              color: "#ffffff", 
              letterSpacing: "1px", 
              marginBottom: "25px",
              borderLeft: "4px solid #ad1838",
              paddingLeft: "12px"
            }}>
              {category.categoryTitle}
            </h3>

            {/* Grid dos cards daquela categoria específica */}
            <div className="services-grid">
              {category.courses.map((service) => (
                <div key={service.id} className="service-card">
                  <div className="service-card-top">
                    {service.tag && <span className="service-tag">{service.tag}</span>}
                    <span className="service-number">{service.id}</span>
                  </div>

                  <div className="service-info">
                    <h3>{service.title}</h3>
                    <p>{service.description}</p>
                  </div>

                  <div className="service-footer">
                    <strong className="service-price">{service.price}</strong>
                    <span className="service-duration">{service.duration}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        ))}
      </section>

      {/* DIVISÓRIA MINIMALISTA E ELEGANTE */}
      <div style={{ width: "100%", padding: "0 5%", boxSizing: "border-box" }}>
        <hr style={{ 
          border: "none", 
          height: "1px", 
          backgroundColor: "rgba(255, 255, 255, 0.1)", 
          margin: "10px 0 40px 0" 
        }} />
      </div>

      <section className="testimonials-section" style={{ paddingTop: "0px" }}>
        <div
          style={{
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            marginBottom: "40px",
          }}
        >
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "12px",
              letterSpacing: "4px",
              color: "#ad1838",
              fontWeight: "600",
              marginBottom: "15px",
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
    </div>
  );
}