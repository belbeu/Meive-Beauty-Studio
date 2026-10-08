import React from "react";
import "./Services.css";

const servicesData = [
  {
    id: "01",
    tag: "MAIS PEDIDO",
    title: "Modelo RUSSO",
    description: "Usa fios sintéticos ultrafinos e é aplicado em cada cílio natural.Criando um efeito de densidade e preenchimento, resultando em um olhar muito mais dramático e volumoso.",
    price: "R$ 280",
    duration: "3h",
  },
  {
    id: "02",
    tag: "PROMOÇÃO", // Modificado para PROMOÇÃO
    title: "Modelo Brasileiro",
    description: " Usa fios tecnológicos em formato de Y, que dão um efeito trançado e volumoso sem pesar nos olhos.",
    oldPrice: "R$ 220", // Adicionada a propriedade de preço antigo
    price: "R$ 180",
    duration: "2h",
  },
  {
    id: "03",
    tag: "FAVORITO",
    title: "MODELO HÍBRIDO",
    description: "Usado duas tecnicas distintas. O melhor dos dois mundos. Trazendo textura e volume sem exageros.",
    price: "R$ 230",
    duration: "2h30",
  },
  {
    id: "04",
    tag: null,
    title: "MANUTENÇÃO",
    description: "Reposição a cada 3-4 semanas para manter o efeito perfeito.",
    price: "A partir de R$ 100",
    duration: "1h",
  },
];

export default function Services() {
  return (
    <section id="servicos" className="services-section">
      <div className="services-header-container">
        <div className="services-titles">
          <span className="services-subtitle">O QUE A GENTE FAZ</span>
          <h2 className="services-title">SERVIÇOS</h2>
        </div>
        <p className="services-top-note">
          Cada aplicação é feita com técnica refinada e materiais importados da Coreia do Sul.
        </p>
      </div>

      <div className="services-grid">
        {servicesData.map((service) => (
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
              {/* Adicionada esta div wrapper para agrupar os preços */}
              <div className="service-price-wrapper">
                {service.oldPrice && (
                  <span className="service-old-price">{service.oldPrice}</span>
                )}
                <strong className="service-price">{service.price}</strong>
              </div>
              <span className="service-duration">{service.duration}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}