import React from "react";
import "./Services.css";

const servicesData = [
  {
    id: "01",
    tag: "MAIS PEDIDO",
    title: "VOLUME RUSSO",
    description: "Fios ultrafinos em leque. Resultado dramático e cheio que dura semanas.",
    price: "R$ 280",
    duration: "3h",
  },
  {
    id: "02",
    tag: null,
    title: "FIO A FIO",
    description: "Clássico e natural. Um fio por cílio para quem quer leveza no dia a dia.",
    price: "R$ 180",
    duration: "2h",
  },
  {
    id: "03",
    tag: "FAVORITO",
    title: "HÍBRIDO",
    description: "O melhor dos dois mundos — textura e volume sem exageros.",
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
              <strong className="service-price">{service.price}</strong>
              <span className="service-duration">{service.duration}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}