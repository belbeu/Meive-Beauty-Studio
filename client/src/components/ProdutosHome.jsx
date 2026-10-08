import React, { useState } from "react";
import "./ProdutosHome.css";
import serumImg from "../assets/serum de cilios.webp";
import removedorImg from "../assets/removedor.webp";
import espumaImg from "../assets/espuma para cilios.webp";
import gelImg from "../assets/gel de limpeza.webp";

export default function ProdutosSection() {
  // O estado para controlar qual produto está com o texto expandido qual não
  const [expandedId, setExpandedId] = useState(null);

  const productsData = [
    {
      id: "prod-1",
      image: serumImg,
      title: "Sérum para Cílios",
      price: "R$ 89",
      description: "Fórmula multissérum leve para umas pestanas e sobrancelhas mais espessas, densas e com aspeto saudável.",
    },
    {
      id: "prod-2",
      image: removedorImg,
      title: "Removedor Óleo-Free",
      price: "R$ 45",
      description: "Remove suavemente a maquilhagem e as impurezas diárias sem deixar resíduos oleosos na sua pele.",
    },
    {
      id: "prod-3",
      image: espumaImg,
      title: "Espuma para Cílios",
      price: "R$ 55",
      description: "Limpeza profunda e delicada, ideal para a manutenção perfeita e duradoura das suas extensões.",
    },
    {
      id: "prod-4",
      image: gelImg,
      title: "Gel de Limpeza Facial",
      price: "R$ 68",
      description: "Purifica a pele diariamente, controlando a oleosidade e mantendo a hidratação natural do rosto.",
    },
  ];

  // Função que abre ou fecha a descrição do produto clicado
  const handleToggleDescription = (id) => {
    if (expandedId === id) {
      setExpandedId(null); // Fecha se já estiver aberto
    } else {
      setExpandedId(id); // Abre o novo e fecha os outros
    }
  };

  return (
    <section id="produtos" className="products-section">
      <div className="products-header-container">
        <div className="products-titles">
          <span className="products-subtitle">LOJA</span>
          <h2 className="products-title">PRODUTOS</h2>
        </div>
        <p className="products-top-note">
          Selecionados para cuidar da sua beleza em casa do jeito certo.
        </p>
      </div>

      <div className="products-grid">
        {productsData.map((product) => (
          <div key={product.id} className="product-card">
            <div 
              className="product-image" 
              style={{ backgroundImage: `url(${product.image})` }}
            ></div>
            <div className="product-info">
              <h3>{product.title}</h3>
              
              {/* Descrição agora é clicável e muda de classe dinamicamente */}
              <p 
                className={`product-description ${expandedId === product.id ? "expanded" : ""}`}
                onClick={() => handleToggleDescription(product.id)}
                title="Clique para ler mais"
              >
                {product.description}
              </p>
              
              <div className="product-footer">
                <span className="product-price">{product.price}</span>
                <button className="product-buy-btn">COMPRAR</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="products-section-footer">
        <a href="#todos-produtos" className="section-more-link">
          <span>Ver mais produtos</span>
          <div className="section-arrow-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </div>
        </a>
      </div>
    </section>
  );
}