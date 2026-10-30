import React, { useState } from "react";
import "./ProdutosHome.css";
import { Link } from "react-router-dom";
import FotoProduto from "./FotoProduto";
import { useProdutosLoja, ordenarParaLoja, formatarPreco } from "../produtosLoja";

const QUANTIDADE_NA_HOME = 4;

export default function ProdutosSection() {
  const [expandedId, setExpandedId] = useState(null);
  const { produtos, carregando, erro, tentarNovamente } = useProdutosLoja();

  const destaques = ordenarParaLoja(produtos).slice(0, QUANTIDADE_NA_HOME);

  const handleToggleDescription = (id) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
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

      {/* Banner Informativo da Tierlist na Home */}
      <div className="products-tierlist-banner">
        <div className="banner-icon">✨</div>
        <div className="banner-text">
          <h4>Monte sua tierlist de beleza com o que utilizamos aqui!</h4>
          <p>
            Como funciona: você cria sua cestinha de interesse e pode solicitar a compra dos produtos 
            entrando em contato conosco ou presencialmente no estúdio.
          </p>
        </div>
      </div>

      {carregando && (
        <div className="products-grid" aria-busy="true" aria-label="Carregando produtos">
          {Array.from({ length: QUANTIDADE_NA_HOME }).map((_, i) => (
            <div key={i} className="product-card product-card--skeleton">
              <div className="product-image" />
              <div className="product-info">
                <span className="skeleton-line skeleton-line--title" />
                <span className="skeleton-line" />
                <span className="skeleton-line skeleton-line--short" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!carregando && erro && (
        <div className="products-message">
          <p>Não foi possível carregar os produtos no momento.</p>
          <button type="button" className="product-buy-btn" onClick={tentarNovamente}>
            TENTAR NOVAMENTE
          </button>
        </div>
      )}

      {!carregando && !erro && destaques.length === 0 && (
        <div className="products-message">
          <p>Novidades chegando em breve por aqui.</p>
        </div>
      )}

      {!carregando && !erro && destaques.length > 0 && (
        <div className="products-grid">
          {destaques.map((product) => (
            <div key={product.id_produto} className="product-card">
              <div className="product-image">
                <FotoProduto src={product.imagem_url} alt={product.nome} />
              </div>
              <div className="product-info">
                <h3>{product.nome}</h3>

                {product.descricao ? (
                  <p
                    className={`product-description ${expandedId === product.id_produto ? "expanded" : ""}`}
                    onClick={() => handleToggleDescription(product.id_produto)}
                    title="Clique para ler mais"
                  >
                    {product.descricao}
                  </p>
                ) : (
                  <p className="product-description product-description--static">
                    {product.categoria || ""}
                  </p>
                )}

                <div className="product-footer">
                  <span className="product-price">{formatarPreco(product.preco)}</span>
                  <button className="product-buy-btn" disabled={!product.em_estoque}>
                    {product.em_estoque ? "ADICIONAR NA CESTINHA" : "ESGOTADO"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="products-section-footer">
        <Link to="/produtos" className="section-more-link">
          <span>Ver mais produtos</span>
          <div className="section-arrow-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </div>
        </Link>
      </div>
    </section>
  );
}