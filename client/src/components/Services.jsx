import React, { useState } from "react";
import "./Services.css";

const servicesData = {
  CÍLIOS: [
    {
      id: "01",
      tag: "NATURAL",
      title: "LASH LIFTING",
      description:
        "Curvatura dos fios naturais com efeito mais definido e escuro. Ideal para quem busca um resultado natural e delicado.",
      price: "R$ 130",
      duration: "2h",
    },
    {
      id: "02",
      tag: "MAIS PEDIDO",
      title: "VOLUME BRASILEIRO",
      description:
        "Clássico e versátil, proporciona volume e definição sem perder a leveza. Disponível nas curvaturas C e D.",
      price: "R$ 150",
      maintenance: "R$ 110",
      duration: "2h30",
    },
    {
      id: "03",
      tag: "NATURAL",
      title: "BRASILEIRO MARROM",
      description:
        "Uma versão ainda mais leve e natural do Volume Brasileiro, utilizando fios na cor marrom.",
      price: "R$ 150",
      maintenance: "R$ 110",
      duration: "2h30",
    },
    {
      id: "04",
      tag: "TENDÊNCIA",
      title: "EFEITO FOX",
      description:
        "Olhar sexy e confiante inspirado nas maiores tendências. Disponível nas cores preto e marrom.",
      price: "R$ 170",
      maintenance: "R$ 130",
      duration: "2h30",
    },
    {
      id: "05",
      tag: "TENDÊNCIA",
      title: "EFEITO WISPY",
      description:
        "Técnica marcante inspirada nas tendências gringas e no estilo das Kardashians.",
      price: "R$ 180",
      maintenance: "R$ 140",
      duration: "2h30",
    },
    {
      id: "06",
      tag: "GLAMOUR",
      title: "EFEITO GLAMOUR",
      description:
        "Também conhecido como Egípcio, é perfeito para quem busca um volume marcante e preenchido.",
      price: "R$ 160",
      maintenance: "R$ 120",
      duration: "2h30",
    },
    {
      id: "07",
      tag: "FAVORITO",
      title: "EFEITO RÍMEL",
      description:
        "Efeito pretinho e definido, inspirado no acabamento de uma máscara de cílios bem marcada.",
      price: "R$ 160",
      maintenance: "R$ 120",
      duration: "2h30",
    },
    {
      id: "08",
      tag: "VOLUME",
      title: "VOLUME 5D",
      description:
        "Técnica para quem busca mais volume e um olhar marcante, sem abrir mão do acabamento.",
      price: "R$ 160",
      maintenance: "R$ 120",
      duration: "2h30",
    },
    {
      id: "09",
      tag: null,
      title: "REMOÇÃO DE CÍLIOS",
      description:
        "Remoção química e segura da extensão de cílios, realizada com produtos profissionais.",
      price: "R$ 40",
      duration: "45min",
    },
    {
      id: "10",
      tag: null,
      title: "TESTE ALÉRGICO",
      description:
        "Procedimento realizado previamente para verificar possíveis reações aos produtos utilizados na extensão.",
      price: "Consultar",
      duration: "Consultar",
    },
  ],

  SOBRANCELHAS: [
    {
      id: "01",
      tag: "MAIS PEDIDO",
      title: "DESIGN DE SOBRANCELHAS",
      description:
        "Realça o formato natural das sobrancelhas, harmonizando o olhar e valorizando seus traços.",
      price: "R$ 40",
      duration: "45min",
    },
    {
      id: "02",
      tag: "COMBO",
      title: "DESIGN + BUÇO",
      description:
        "Design completo das sobrancelhas combinado com depilação do buço na linha.",
      price: "R$ 55",
      duration: "1h",
    },
    {
      id: "03",
      tag: "FAVORITO",
      title: "DESIGN + COLORAÇÃO",
      description:
        "Design de sobrancelhas combinado com coloração para um resultado mais definido e harmonioso.",
      price: "R$ 60",
      duration: "1h15",
    },
    {
      id: "04",
      tag: "MAIS PEDIDO",
      title: "DESIGN + HENNA",
      description:
        "Design acompanhado de henna para deixar as sobrancelhas mais marcadas e preenchidas.",
      price: "R$ 60",
      duration: "1h15",
    },
    {
      id: "05",
      tag: "TENDÊNCIA",
      title: "BROW LAMINATION",
      description:
        "Alinha e realça os fios, proporcionando sobrancelhas mais cheias, definidas e com aspecto natural.",
      price: "R$ 130",
      maintenance: "R$ 80",
      duration: "2h",
    },
    {
      id: "06",
      tag: null,
      title: "BUÇO NA LINHA",
      description:
        "Depilação do buço utilizando a técnica de linha, proporcionando agilidade e maior durabilidade.",
      price: "R$ 20",
      duration: "15min",
    },
    {
      id: "07",
      tag: null,
      title: "HENNA",
      description:
        "Aplicação de henna para proporcionar um aspecto mais harmônico, marcado e preenchido.",
      price: "R$ 35",
      duration: "30min",
    },
  ],

  UNHAS: [
    {
      id: "01",
      tag: "MAIS PEDIDO",
      title: "BANHO DE GEL",
      description:
        "Camada fina de gel aplicada sobre a unha natural para fortalecer, proteger e proporcionar maior durabilidade.",
      price: "R$ 100",
      maintenance: "R$ 80",
      duration: "2h30",
    },
    {
      id: "02",
      tag: "TENDÊNCIA",
      title: "ALONGAMENTO F1",
      description:
        "Alongamento realizado com molde F1, proporcionando unhas uniformes, resistentes e com curvatura natural.",
      price: "R$ 120",
      maintenance: "R$ 90",
      duration: "3h",
    },
    {
      id: "03",
      tag: "NATURAL",
      title: "ALONGAMENTO RUSSO",
      description:
        "Técnica que proporciona um alongamento fino, elegante e natural, mantendo resistência e acabamento sofisticado.",
      price: "R$ 120",
      maintenance: "R$ 90",
      duration: "3h",
    },
    {
      id: "04",
      tag: "FAVORITO",
      title: "BLINDAGEM",
      description:
        "Revestimento fino aplicado sobre a unha natural para proteger contra quebras, lascas e descamações.",
      price: "R$ 70",
      maintenance: "R$ 50",
      duration: "1h",
    },
    {
      id: "05",
      tag: null,
      title: "REPOSIÇÃO DE UNHA",
      description:
        "Reconstrução de uma unha quebrada ou descolada durante a manutenção do alongamento.",
      price: "R$ 10",
      duration: "5min",
    },
    {
      id: "06",
      tag: null,
      title: "MÃO SIMPLES",
      description:
        "Cuidados completos para as mãos com cuticulagem, lixamento, hidratação e esmaltação.",
      price: "R$ 30",
      duration: "45min",
    },
    {
      id: "07",
      tag: null,
      title: "PÉ SIMPLES",
      description:
        "Cuidados completos para os pés com cuticulagem, lixamento, hidratação e esmaltação.",
      price: "R$ 35",
      duration: "45min",
    },
    {
      id: "08",
      tag: "DURABILIDADE",
      title: "PÉ + ESMALTAÇÃO EM GEL",
      description:
        "Esmaltação em gel para manter os pés bonitos, brilhantes e impecáveis por mais tempo.",
      price: "R$ 60",
      duration: "50min",
    },
    {
      id: "09",
      tag: "COMBO",
      title: "MÃO E PÉ SIMPLES",
      description:
        "Cuidados completos para mãos e pés, incluindo cuticulagem, lixamento, hidratação e esmaltação.",
      price: "R$ 55",
      duration: "1h30",
    },
  ],
};

export default function Services() {
  const [category, setCategory] = useState("CÍLIOS");
  const [currentIndex, setCurrentIndex] = useState(0);

  const services = servicesData[category];

  const nextSlide = () => {
    setCurrentIndex((prev) =>
      prev >= services.length - 4 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prev) =>
      prev <= 0 ? Math.max(services.length - 4, 0) : prev - 1
    );
  };

  const changeCategory = (event) => {
    setCategory(event.target.value);
    setCurrentIndex(0);
  };

  return (
    <section id="servicos" className="services-section">
      <div className="services-header-container">
        <div className="services-titles">
          <span className="services-subtitle">O QUE A GENTE FAZ</span>

          <div className="services-title-row">
            <h2 className="services-title">SERVIÇOS E TÉCNICAS</h2>

            <select
              className="services-select"
              value={category}
              onChange={changeCategory}
            >
              <option value="CÍLIOS">CÍLIOS</option>
              <option value="SOBRANCELHAS">SOBRANCELHAS</option>
              <option value="UNHAS">UNHAS</option>
            </select>
          </div>
        </div>

        <p className="services-top-note">
          Cada procedimento é realizado com técnica, cuidado e produtos
          selecionados para valorizar sua beleza.
        </p>
      </div>

      <div className="services-carousel">
        <button
          className="carousel-arrow carousel-arrow-left"
          onClick={prevSlide}
          aria-label="Serviço anterior"
        >
          ‹
        </button>

        <div className="services-grid">
          {services.slice(currentIndex, currentIndex + 4).map((service) => (
            <div key={service.id + service.title} className="service-card">
              <div className="service-card-top">
                {service.tag && (
                  <span className="service-tag">{service.tag}</span>
                )}

                <span className="service-number">{service.id}</span>
              </div>

              <div className="service-info">
                <h3>{service.title}</h3>

                <p>{service.description}</p>
              </div>

              <div className="service-footer">
                <div className="service-price-wrapper">
                  <strong className="service-price">
                    {service.price}
                  </strong>

                  {service.maintenance && (
                    <span className="service-maintenance">
                      Manutenção {service.maintenance}
                    </span>
                  )}
                </div>

                <span className="service-duration">
                  {service.duration}
                </span>
              </div>
            </div>
          ))}
        </div>

        <button
          className="carousel-arrow carousel-arrow-right"
          onClick={nextSlide}
          aria-label="Próximo serviço"
        >
          ›
        </button>
      </div>

      <div className="carousel-dots">
        {services.map((_, index) => (
          <button
            key={index}
            className={`carousel-dot ${
              index === currentIndex ? "active" : ""
            }`}
            onClick={() =>
              setCurrentIndex(
                Math.min(index, Math.max(services.length - 4, 0))
              )
            }
            aria-label={`Ir para serviço ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
