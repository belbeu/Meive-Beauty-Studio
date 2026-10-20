import React, { useEffect, useState } from "react";
import { api } from "../api"; // ajuste o caminho: "../api" se o arquivo está em src/pages ou src/components; "./api" se está direto em src
import "./Services.css";

// Converte o preço que vem da API (ex.: "130.00") para "R$ 130"
function formatarPreco(valor) {
  if (valor === null || valor === undefined) return "Consultar";
  return `R$ ${Number(valor).toLocaleString("pt-BR")}`;
}

// Converte minutos para o formato do site: 45 -> "45min", 120 -> "2h", 150 -> "2h30"
function formatarDuracao(minutos) {
  if (minutos === null || minutos === undefined) return "Consultar";
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  if (h === 0) return `${m}min`;
  return m ? `${h}h${String(m).padStart(2, "0")}` : `${h}h`;
}

export default function Services() {
  const [servicesData, setServicesData] = useState({});
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [category, setCategory] = useState("CÍLIOS");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    api("/servicos/")
      .then((lista) => {
        // agrupa os serviços por categoria: { "CÍLIOS": [...], "UNHAS": [...] }
        const agrupado = {};
        lista.forEach((s) => {
          if (!agrupado[s.categoria]) agrupado[s.categoria] = [];
          agrupado[s.categoria].push(s);
        });
        setServicesData(agrupado);
      })
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false));
  }, []);

  const services = servicesData[category] || [];

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

      {carregando && <p className="services-top-note">Carregando serviços...</p>}

      {erro && (
        <p className="services-top-note">
          Não foi possível carregar os serviços no momento.
        </p>
      )}

      {!carregando && !erro && (
        <>
          <div className="services-carousel">
            <button
              className="carousel-arrow carousel-arrow-left"
              onClick={prevSlide}
              aria-label="Serviço anterior"
            >
              ‹
            </button>

            <div className="services-grid">
              {services
                .slice(currentIndex, currentIndex + 4)
                .map((service, i) => (
                  <div key={service.id_servico} className="service-card">
                    <div className="service-card-top">
                      {service.tag && (
                        <span className="service-tag">{service.tag}</span>
                      )}

                      <span className="service-number">
                        {String(currentIndex + i + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <div className="service-info">
                      <h3>{service.nome}</h3>

                      <p>{service.descricao}</p>
                    </div>

                    <div className="service-footer">
                      <div className="service-price-wrapper">
                        <strong className="service-price">
                          {formatarPreco(service.preco)}
                        </strong>

                        {service.preco_manutencao && (
                          <span className="service-maintenance">
                            Manutenção {formatarPreco(service.preco_manutencao)}
                          </span>
                        )}
                      </div>

                      <span className="service-duration">
                        {formatarDuracao(service.duracao_minutos)}
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
        </>
      )}
    </section>
  );
}
