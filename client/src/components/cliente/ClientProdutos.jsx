// Salvar como: src/components/cliente/ClientProdutos.jsx
import React, { useState } from "react";
import "../Produtos.css"; 
import ClientNavbar from "./ClientNavbar"; // <--- Usando a navbar da cliente
import Footer from "../Footer";
import FotoProduto from "../FotoProduto";
import CestinhaToast from "../CestinhaToast";
import { cestinhaService } from "../../services/cestinhaService";
import {
  useProdutosLoja,
  ordenarParaLoja,
  categoriasDaLoja,
  buscaCombina,
  formatarPreco,
  normalizar,
  seloDoProduto,
} from "../../produtosLoja";

export default function ClientProdutos() {
  const { produtos, carregando, erro, tentarNovamente } = useProdutosLoja();

  const [activeFilter, setActiveFilter] = useState("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [produtoAdicionado, setProdutoAdicionado] = useState(null);

  const filters = [{ chave: "todos", rotulo: "TODOS" }, ...categoriasDaLoja(produtos)];

  const filteredProducts = ordenarParaLoja(produtos).filter((product) => {
    const matchesCategory =
      activeFilter === "todos" || normalizar(product.categoria) === activeFilter;
    return matchesCategory && buscaCombina(product, searchQuery);
  });

  const handleAdicionarCestinha = async (product) => {
    if (!product.em_estoque) return;

    try {
      await cestinhaService.adicionarItemAPI(product.id_produto, 1);
      setProdutoAdicionado(product.nome);
    } catch (err) {
      console.error(err);
      alert("Erro ao adicionar produto à cestinha.");
    }
  };

  return (
    <>
      <ClientNavbar />

      <main className="produto-container">
        <section className="hero-section">
          <div className="hero-content">
            <p className="hero-subtitle">
              <span className="red-line"></span> MEIVE SHOP - ÁREA DA CLIENTE
            </p>
            <h2 className="hero-title">
                <span className="texto-branco">BEAUTY</span> <span className="texto-vermelho">ESSENTIALS</span>
            </h2>
            <p className="hero-description">
              Adicione novos favoritos à sua cestinha de interesse mantendo sua sessão ativa.
            </p>
          </div>
        </section>

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
                        <button 
                          className="product-buy-btn" 
                          disabled={!product.em_estoque}
                          onClick={() => handleAdicionarCestinha(product)}
                        >
                          {product.em_estoque ? "ADICIONAR NA CESTINHA" : "ESGOTADO"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p style={{ color: "#888", gridColumn: "1 / -1" }}>Nenhum produto encontrado.</p>
            )}
          </section>
        )}
      </main>

      {produtoAdicionado && (
        <CestinhaToast 
          produtoNome={produtoAdicionado} 
          onClose={() => setProdutoAdicionado(null)} 
        />
      )}

      <Footer />
    </>
  );
}