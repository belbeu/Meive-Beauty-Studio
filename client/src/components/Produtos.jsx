import React, { useState } from "react";
import "./Produtos.css";
import Navbar from "./Navbar";
import Footer from "./Footer";
import FotoProduto from "./FotoProduto";
import {
  useProdutosLoja,
  ordenarParaLoja,
  categoriasDaLoja,
  buscaCombina,
  formatarPreco,
  normalizar,
  seloDoProduto,
} from "../produtosLoja";

export default function Produtos() {
  const { produtos, carregando, erro, tentarNovamente } = useProdutosLoja();

  const [activeFilter, setActiveFilter] = useState("todos");
  const [searchQuery, setSearchQuery] = useState("");

  const filters = [{ chave: "todos", rotulo: "TODOS" }, ...categoriasDaLoja(produtos)];

  const filteredProducts = ordenarParaLoja(produtos).filter((product) => {
    const matchesCategory =
      activeFilter === "todos" || normalizar(product.categoria) === activeFilter;
    return matchesCategory && buscaCombina(product, searchQuery);
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

        {/* Banner Informativo da Tierlist Atualizado */}
        <div className="products-tierlist-banner">
          <div className="banner-icon">✨</div>
          <div className="banner-text">
            <h4>Monte sua tierlist de beleza!</h4>
            <p>
              Com os produtos que utilizamos aqui. Como funciona: você cria sua cestinha de interesse 
              e pode solicitar a compra dos produtos entrando em contato conosco ou presencialmente no estúdio.
            </p>
          </div>
        </div>

        {/* Filter and Redesigned Search Section */}
        <section className="filter-section">
          <div className="filters">
            {filters.map((filter) => (
              <button
                key={filter.chave}
                className={`filter-btn ${activeFilter === filter.chave ? "active" : ""}`}
                onClick={() => setActiveFilter(filter.chave)}
              >
                {filter.rotulo.toLocaleUpperCase("pt-BR")}
              </button>
            ))}
          </div>

          {/* Barra de pesquisa redesenhada */}
          <div className="search-box-wrapper">
            <svg className="search-icon-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              className="search-input-field"
              placeholder="Pesquisar produto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="search-clear-btn" onClick={() => setSearchQuery("")}>×</button>
            )}
          </div>
        </section>

        {/* Contador de produtos */}
        {!carregando && !erro && (
          <div className="product-count">
            <p>
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1 ? "PRODUTO" : "PRODUTOS"}
            </p>
          </div>
        )}

        {carregando && (
          <section className="product-grid product-grid--loading" aria-busy="true" aria-label="Carregando produtos">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="product-card product-card--skeleton">
                <div className="image-container" />
                <span className="skeleton-line skeleton-line--title" />
                <span className="skeleton-line" />
              </div>
            ))}
          </section>
        )}

        {!carregando && erro && (
          <section className="product-grid">
            <div className="product-message">
              <p>Não foi possível carregar os produtos no momento.</p>
              <button className="product-buy-btn" onClick={tentarNovamente}>
                TENTAR NOVAMENTE
              </button>
            </div>
          </section>
        )}

        {/* Product Grid */}
        {!carregando && !erro && (
          <section className="product-grid">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => {
                const selo = seloDoProduto(product);
                return (
                  <div key={product.id_produto} className="product-card">
                    <div className="image-container">
                      {selo && <span className="product-badge">{selo}</span>}
                      <FotoProduto src={product.imagem_url} alt={product.nome} />

                      <div className="hover-overlay">
                        <button className="details-btn">VER DETALHES &rarr;</button>
                      </div>
                    </div>

                    <div className="product-info">
                      <div className="product-text">
                        <span className="product-category">{product.categoria}</span>
                        <h3 className="product-name">{product.nome}</h3>
                      </div>
                      <div className="product-price-action">
                        <span className="product-price">
                          {formatarPreco(product.preco, { sempreCentavos: true })}
                        </span>
                        <button className="cart-btn" aria-label="Adicionar à cestinha" disabled={!product.em_estoque}>
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
                        <button className="product-buy-btn" disabled={!product.em_estoque}>
                          {product.em_estoque ? "ADICIONAR NA CESTINHA" : "ESGOTADO"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p style={{ color: "#888", gridColumn: "1 / -1" }}>
                {produtos.length === 0
                  ? "Novidades chegando em breve por aqui."
                  : "Nenhum produto encontrado."}
              </p>
            )}
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}