import React from "react";
import "./ProdutosHome.css";
import serumImg from "../assets/serum de cilios.webp";
import removedorImg from "../assets/removedor.webp";
import espumaImg from "../assets/espuma para cilios.webp";
import gelImg from "../assets/gel de limpeza.webp";

export default function ProdutosSection() {
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
    },
    {
      id: "prod-3",
      image: espumaImg,
      title: "Espuma para Cílios",
      price: "R$ 55",
    },
    {
      id: "prod-4",
      image: gelImg,
      title: "Gel de Limpeza Facial",
      price: "R$ 68",
    },
  ];

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