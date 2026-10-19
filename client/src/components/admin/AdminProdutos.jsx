import React, { useState } from "react";
import "./AdminDashboard.css"; // header, botões, painel (compartilhados)
import "./AdminProdutos.css";

/* ---------- Ícones (SVG inline, sem dependências) ---------- */
const iconProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

const Icons = {
  search: (
    <svg {...iconProps} width="20" height="20">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  ),
};

/* ---------- Dados (troque por chamadas à sua API / Supabase) ---------- */
const STATS = [
  { label: "VALOR EM ESTOQUE", value: "R$ 8.940", alert: false },
  { label: "PRODUTOS ATIVOS", value: "24", alert: false },
  { label: "ESTOQUE BAIXO", value: "03", alert: true },
  { label: "VENDAS NO MÊS", value: "37", alert: false },
];

// image: coloque a URL da foto do produto (ex.: "/img/serum.jpg"); null mostra um placeholder
const PRODUCTS = [
  { id: 1, sku: "MB-0001", name: "Sérum Lash Power", category: "Cílios", price: "R$ 89,00", stock: 18, status: "active", image: null },
  { id: 2, sku: "MB-0002", name: "Clean Girl Foam", category: "Skincare", price: "R$ 68,00", stock: 6, status: "active", image: null },
  { id: 3, sku: "MB-0003", name: "Removedor Oil-Free", category: "Cílios", price: "R$ 45,00", stock: 2, status: "low", image: null },
  { id: 4, sku: "MB-0004", name: "Kit de Pincéis Pro", category: "Acessórios", price: "R$ 120,00", stock: 11, status: "active", image: null },
];

const STATUS_LABEL = {
  active: "ATIVO",
  low: "ESTOQUE BAIXO",
};

/* ---------- Helpers ---------- */
function formatToday() {
  return new Date()
    .toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })
    .toUpperCase();
}

/* ---------- Componente ---------- */
export default function AdminProdutos() {
  const [filter, setFilter] = useState("all"); // "all" | "low"

  const visible = filter === "low" ? PRODUCTS.filter((p) => p.status === "low") : PRODUCTS;

  return (
    <main className="dash-main">
      <header className="dash-header">
        <div>
          <span className="dash-date">{formatToday()}</span>
          <h1 className="dash-title">PRODUTOS</h1>
        </div>

        <div className="dash-header-actions">
          <button type="button" className="dash-icon-btn" aria-label="Buscar">
            {Icons.search}
          </button>
          <button type="button" className="dash-primary-btn">
            + NOVO PRODUTO
          </button>
        </div>
      </header>

      {/* ---- Resumo ---- */}
      <section className="products-summary" aria-label="Resumo do estoque">
        {STATS.map((s) => (
          <article key={s.label} className="products-summary-item">
            <span className="products-summary-label">{s.label}</span>
            <strong className={`products-summary-value ${s.alert ? "is-alert" : ""}`}>
              {s.value}
            </strong>
          </article>
        ))}
      </section>

      {/* ---- Catálogo e estoque ---- */}
      <section className="dash-panel products-panel">
        <div className="dash-panel-head products-head">
          <div>
            <h2 className="dash-panel-title">CATÁLOGO E ESTOQUE</h2>
            <p className="dash-panel-sub">Acompanhe preços e disponibilidade</p>
          </div>

          <div className="products-filter" role="tablist" aria-label="Filtrar produtos">
            <button
              type="button"
              role="tab"
              aria-selected={filter === "all"}
              className={filter === "all" ? "is-active" : ""}
              onClick={() => setFilter("all")}
            >
              TODOS
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={filter === "low"}
              className={`is-low ${filter === "low" ? "is-active" : ""}`}
              onClick={() => setFilter("low")}
            >
              ESTOQUE BAIXO
            </button>
          </div>
        </div>

        <div className="products-table" role="table" aria-label="Catálogo de produtos">
          <div className="products-row products-row--head" role="row">
            <span role="columnheader">PRODUTO</span>
            <span role="columnheader" className="products-col-category">CATEGORIA</span>
            <span role="columnheader">PREÇO</span>
            <span role="columnheader" className="products-col-stock">ESTOQUE</span>
            <span role="columnheader" className="products-col-status">STATUS</span>
            <span aria-hidden="true" />
          </div>

          {visible.map((p) => (
            <div key={p.id} className="products-row products-row--item" role="row">
              <div className="products-name" role="cell">
                {p.image ? (
                  <img src={p.image} alt={p.name} className="products-img" />
                ) : (
                  <div className="products-img products-img--placeholder" />
                )}
                <div className="products-name-info">
                  <strong>{p.name}</strong>
                  <span>{p.sku}</span>
                </div>
              </div>
              <span className="products-category products-col-category" role="cell">{p.category}</span>
              <strong className="products-price" role="cell">{p.price}</strong>
              <strong className="products-stock products-col-stock" role="cell">{p.stock} un.</strong>
              <span className="products-col-status" role="cell">
                <span className={`products-status products-status--${p.status}`}>
                  {STATUS_LABEL[p.status]}
                </span>
              </span>
              <button type="button" className="products-edit" aria-label={`Editar ${p.name}`}>
                EDITAR
              </button>
            </div>
          ))}

          {visible.length === 0 && (
            <p className="products-empty">Nenhum produto encontrado.</p>
          )}
        </div>
      </section>
    </main>
  );
}