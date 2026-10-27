import React, { useState } from "react";
import "./Produtos.css";
import Navbar from "./Navbar";
import Footer from "./Footer";
import serumImg from "../assets/serum de cilios.webp";
import removedorImg from "../assets/removedor.webp";
import espumaImg from "../assets/espuma para cilios.webp";
import gelImg from "../assets/gel de limpeza.webp";

const productsData = [
  {
    id: 1,
    name: "Sérum Lash Power",
    category: "CÍLIOS",
    price: 89.0,
    badge: "BEST-SELLER",
    image: serumImg,
  },
  {
    id: 2,
    name: "Clean Girl Foam",
    category: "SKINCARE",
    price: 68.0,
    badge: "NOVO",
    image: espumaImg,
  },
  {
    id: 3,
    name: "Removedor Oil-Free",
    category: "CÍLIOS",
    price: 45.0,
    badge: null,
    image: removedorImg,
  },
  {
    id: 4,
    name: "Kit de Pincéis Pro",
    category: "ACESSÓRIOS",
    price: 120.0,
    badge: "EDIÇÃO LIMITADA",
    image: gelImg,
  },
];

const filters = ["TODOS", "CÍLIOS", "SKINCARE", "ACESSÓRIOS"];

export default function Produtos() {
  // Estados para o filtro de categoria e para a barra de busca
  const [activeFilter, setActiveFilter] = useState("TODOS");
  const [searchQuery, setSearchQuery] = useState("");

  // Filtra por categoria E pelo texto da busca
  const filteredProducts = productsData.filter((product) => {
    const matchesCategory =
      activeFilter === "TODOS" || product.category === activeFilter;
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.trim().toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <Navbar />

      <main className="produto-container">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <p className="hero-subtitle">
              <span className="red-line"></span> MEIVE SHOP
            </p>
            <h2 className="hero-title">
                <span className="texto-branco">BEAUTY</span> <span className="texto-vermelho">ESSENTIALS</span>
            </h2>
            <p className="hero-description">
              Fórmulas e ferramentas escolhidas para elevar o seu ritual.
            </p>
          </div>
        </section>

        {/* Filter and Search Section */}
        <section className="filter-section">
          <div className="filters">
            {filters.map((filter) => (
              <button
                key={filter}
                className={`filter-btn ${activeFilter === filter ? "active" : ""}`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="BUSCAR PRODUTO"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </section>

        {/* Contador de produtos filtrados */}
        <div className="product-count">
          <p>
            {filteredProducts.length}{" "}
            {filteredProducts.length === 1 ? "PRODUTO" : "PRODUTOS"}
          </p>
        </div>

        {/* Product Grid */}
        <section className="product-grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div key={product.id} className="product-card">
                <div className="image-container">
                  {product.badge && (
                    <span className="product-badge">{product.badge}</span>
                  )}
                  <img src={product.image} alt={product.name} />

                  <div className="hover-overlay">
                    <button className="details-btn">VER DETALHES &rarr;</button>
                  </div>
                </div>
                
                <div className="product-info">
                  <div className="product-text">
                    <span className="product-category">{product.category}</span>
                    <h3 className="product-name">{product.name}</h3>
                  </div>
                  <div className="product-price-action">
                <span className="product-price">
                    R$ {product.price.toFixed(2).replace(".", ",")}
                </span>
                    <button className="cart-btn" aria-label="Adicionar ao carrinho">
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
    >
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <path d="M16 10a4 4 0 0 1-8 0"></path>
                    </svg>
                    </button>
                        <button className="product-buy-btn">COMPRAR</button>
                    </div>
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: "#888", gridColumn: "1 / -1" }}>
              Nenhum produto encontrado.
            </p>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}