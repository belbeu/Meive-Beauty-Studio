import React from "react";
import "./Promocao.css";

export default function PromocoesSection() {
  const promocoesData = [
    {
      id: "promo-1",
      title: "Combo Olhar Perfeito",
      description: "Extensão Volume Russo + Design de Sobrancelhas com Henna. O combo ideal para transformar o seu olhar.",
      oldPrice: "R$ 350",
      newPrice: "R$ 290",
      validity: "Válido até sexta-feira",
      highlight: true // Para dar um destaque especial a este cartão
    },
    {
      id: "promo-2",
      title: "1ª Vez no Estúdio",
      description: "Nunca fez os cílios conosco? Aproveite este desconto especial na sua primeira aplicação do modelo Fio a Fio.",
      oldPrice: "R$ 180",
      newPrice: "R$ 150",
      validity: "Apenas para novas clientes",
      highlight: false
    },
    {
      id: "promo-3",
      title: "Pacote Manutenção Mensal",
      description: "Feche 2 manutenções no mês e ganhe a higienização profunda dos fios grátis em ambas as sessões.",
      oldPrice: "R$ 250",
      newPrice: "R$ 190",
      validity: "Vagas limitadas",
      highlight: false
    }
  ];

  return (
    <section id="promocoes" className="promo-section">
      <div className="promo-header">
        <span className="promo-subtitle">OFERTAS ESPECIAIS</span>
        <h2 className="promo-title">PROMOÇÕES DO MÊS</h2>
      </div>

      <div className="promo-grid">
        {promocoesData.map((promo) => (
          <div key={promo.id} className={`promo-card ${promo.highlight ? 'highlighted' : ''}`}>
            {promo.highlight && <div className="promo-badge">Mais Popular</div>}
            
            <div className="promo-content">
              <h3>{promo.title}</h3>
              <p>{promo.description}</p>
              
              <div className="promo-pricing">
                <span className="promo-old-price">{promo.oldPrice}</span>
                <span className="promo-new-price">{promo.newPrice}</span>
              </div>
              
              <span className="promo-validity">{promo.validity}</span>
            </div>

            <button className="promo-btn">Agendar Agora!</button>
          </div>
        ))}
      </div>
    </section>
  );
}