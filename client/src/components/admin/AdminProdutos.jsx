import React, { useState, useEffect } from "react";
import "./AdminDashboard.css"; // header, botões, painel (compartilhados)
import "./AdminProdutos.css";
import "./AdminAvisos.css"; // modal de aviso (mesmo padrão do AdminClientes)
import { api } from "../../api";

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
  close: (
    <svg {...iconProps} width="18" height="18">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  ),
};

/* ---------- Regras do estoque ---------- */
// O banco não tem "estoque mínimo": até 5 unidades conta como estoque baixo.
const LIMITE_ESTOQUE_BAIXO = 5;

const STATUS_LABEL = {
  active: "ATIVO",
  low: "ESTOQUE BAIXO",
  out: "SEM ESTOQUE",
  inactive: "INATIVO",
};

/* ---------- Helpers ---------- */
function formatToday() {
  return new Date()
    .toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })
    .toUpperCase();
}

// O Django devolve DecimalField como texto ("89.00"), por isso o Number().
function formatBRL(value, semCentavosSeInteiro = false) {
  const n = Number(value) || 0;
  return n.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: semCentavosSeInteiro && Number.isInteger(n) ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

const doisDigitos = (n) => String(n).padStart(2, "0");

// ativo vem do banco (pode ser null; só false conta como inativo)
function getStatus(p) {
  if (p.ativo === false) return "inactive";
  if (p.estoque_atual <= 0) return "out";
  if (p.estoque_atual <= LIMITE_ESTOQUE_BAIXO) return "low";
  return "active";
}

const isEstoqueBaixo = (status) => status === "low" || status === "out";

const ROTULOS_CAMPOS = {
  nome: "Nome",
  descricao: "Descrição",
  categoria: "Categoria",
  preco: "Preço",
  custo: "Custo",
  estoque_atual: "Estoque",
  imagem_url: "Imagem",
};

function formatarErroApi(error) {
  if (error?.status === 403) return "Sua conta não tem permissão de administrador.";
  const d = error?.dados;
  if (d?.detail) return d.detail;
  if (d && typeof d === "object") {
    return Object.entries(d)
      .map(([campo, msgs]) => `${ROTULOS_CAMPOS[campo] || campo}: ${[].concat(msgs).join(" ")}`)
      .join("\n");
  }
  return error?.message || "Erro inesperado. Tente novamente.";
}

/* ---------- Formulário de novo produto ---------- */
const FORM_VAZIO = {
  nome: "",
  categoria: "",
  descricao: "",
  preco: "",
  custo: "",
  estoque: "0",
  imagemUrl: "",
  ativo: true,
};

// Aceita "89,90" ou "89.90"; devolve null se não for um número válido
function lerDecimal(texto) {
  const limpo = String(texto).trim().replace(",", ".");
  if (limpo === "" || !/^\d+(\.\d{1,2})?$/.test(limpo)) return null;
  return limpo;
}

function validarProduto(f) {
  if (!f.nome.trim()) return "Informe o nome do produto.";
  if (f.nome.trim().length > 150) return "O nome pode ter no máximo 150 caracteres.";
  if (lerDecimal(f.preco) === null) return "Informe um preço válido (ex.: 89,90).";
  if (f.custo.trim() !== "" && lerDecimal(f.custo) === null) {
    return "O custo precisa ser um valor válido (ex.: 40,00) ou ficar em branco.";
  }
  if (!/^\d+$/.test(f.estoque.trim())) {
    return "O estoque precisa ser um número inteiro, 0 ou maior.";
  }
  if (f.categoria.trim().length > 100) return "A categoria pode ter no máximo 100 caracteres.";
  if (f.imagemUrl.trim().length > 255) return "O endereço da imagem é longo demais (máx. 255).";
  return null;
}

/* Foto do produto: usa imagem_url do banco e cai no placeholder se faltar/quebrar */
function ProductImage({ src, alt }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <div className="products-img products-img--placeholder" />;
  }
  return (
    <img
      src={src}
      alt={alt}
      className="products-img"
      onError={() => setFailed(true)}
    />
  );
}

/* ---------- Componente ---------- */
export default function AdminProdutos() {
  const [filter, setFilter] = useState("all"); // "all" | "low"
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastInfo, setToastInfo] = useState(null);

  // Modal "Novo produto"
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [form, setForm] = useState(FORM_VAZIO);
  const [saving, setSaving] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await api("/admin/produtos/");
      setProducts(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      setToastInfo({
        title: "ERRO DE CONEXÃO",
        message: `Não foi possível carregar os produtos.\n${formatarErroApi(error)}`,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const setCampo = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));

  const openNewModal = () => {
    setForm(FORM_VAZIO);
    setIsNewModalOpen(true);
  };

  const closeNewModal = () => {
    if (!saving) setIsNewModalOpen(false);
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (saving) return;

    const erro = validarProduto(form);
    if (erro) {
      setToastInfo({ title: "CAMPOS INVÁLIDOS", message: erro });
      return;
    }

    try {
      setSaving(true);
      await api("/admin/produtos/", {
        method: "POST",
        body: JSON.stringify({
          nome: form.nome.trim(),
          descricao: form.descricao.trim() || null,
          categoria: form.categoria.trim() || null,
          preco: lerDecimal(form.preco),
          custo: lerDecimal(form.custo),
          estoque_atual: parseInt(form.estoque, 10),
          imagem_url: form.imagemUrl.trim() || null,
          ativo: form.ativo,
        }),
      });

      setIsNewModalOpen(false);
      setForm(FORM_VAZIO);
      await fetchProducts();
      setToastInfo({ title: "SUCESSO", message: "Produto cadastrado com sucesso!" });
    } catch (error) {
      console.error("Erro ao cadastrar produto:", error);
      setToastInfo({
        title: "ERRO AO CADASTRAR",
        message: `Não foi possível cadastrar o produto.\n${formatarErroApi(error)}`,
      });
    } finally {
      setSaving(false);
    }
  };

  // Categorias já existentes no banco, para sugerir no formulário
  const categoriasExistentes = [...new Set(products.map((p) => p.categoria).filter(Boolean))];

  /* ---- Números do resumo (calculados a partir do banco) ---- */
  const ativos = products.filter((p) => getStatus(p) !== "inactive");
  const valorEstoque = ativos.reduce(
    (soma, p) => soma + Number(p.preco || 0) * Number(p.estoque_atual || 0),
    0
  );
  const estoqueBaixo = ativos.filter((p) => isEstoqueBaixo(getStatus(p))).length;
  const inativos = products.length - ativos.length;

  const show = (valor) => (loading ? "—" : valor);

  const stats = [
    { label: "VALOR EM ESTOQUE", value: show(formatBRL(valorEstoque, true)), alert: false },
    { label: "PRODUTOS ATIVOS", value: show(doisDigitos(ativos.length)), alert: false },
    { label: "ESTOQUE BAIXO", value: show(doisDigitos(estoqueBaixo)), alert: !loading && estoqueBaixo > 0 },
    { label: "PRODUTOS INATIVOS", value: show(doisDigitos(inativos)), alert: false },
  ];

  /* ---- Listagem ---- */
  const visible =
    filter === "low"
      ? products.filter((p) => getStatus(p) !== "inactive" && isEstoqueBaixo(getStatus(p)))
      : products;

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
          <button type="button" className="dash-primary-btn" onClick={openNewModal}>
            + NOVO PRODUTO
          </button>
        </div>
      </header>

      {/* ---- Resumo ---- */}
      <section className="products-summary" aria-label="Resumo do estoque">
        {stats.map((s) => (
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

          {loading ? (
            <p className="products-empty">Carregando produtos do banco...</p>
          ) : (
            <>
              {visible.map((p) => {
                const status = getStatus(p);
                return (
                  <div key={p.id_produto} className="products-row products-row--item" role="row">
                    <div className="products-name" role="cell">
                      <ProductImage src={p.imagem_url} alt={p.nome} />
                      <div className="products-name-info">
                        <strong>{p.nome}</strong>
                        <span>#{String(p.id_produto).padStart(4, "0")}</span>
                      </div>
                    </div>
                    <span className="products-category products-col-category" role="cell">
                      {p.categoria || "—"}
                    </span>
                    <strong className="products-price" role="cell">{formatBRL(p.preco)}</strong>
                    <strong className="products-stock products-col-stock" role="cell">
                      {p.estoque_atual} un.
                    </strong>
                    <span className="products-col-status" role="cell">
                      <span className={`products-status products-status--${status}`}>
                        {STATUS_LABEL[status]}
                      </span>
                    </span>
                    <button type="button" className="products-edit" aria-label={`Editar ${p.nome}`}>
                      EDITAR
                    </button>
                  </div>
                );
              })}

              {visible.length === 0 && (
                <p className="products-empty">Nenhum produto encontrado.</p>
              )}
            </>
          )}
        </div>
      </section>

      {/* ---- MODAL: NOVO PRODUTO ---- */}
      {isNewModalOpen && (
        <div className="products-modal-overlay" onClick={closeNewModal}>
          <div className="products-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="products-modal-header">
              <h2>ADICIONAR NOVO PRODUTO</h2>
              <button
                type="button"
                className="products-modal-close"
                aria-label="Fechar"
                onClick={closeNewModal}
              >
                {Icons.close}
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="products-form" noValidate>
              <div className="products-form-group">
                <label htmlFor="prod-nome">Nome do produto</label>
                <input
                  id="prod-nome"
                  type="text"
                  placeholder="Ex: Sérum Lash Power"
                  value={form.nome}
                  onChange={setCampo("nome")}
                  maxLength={150}
                  autoFocus
                  required
                />
              </div>

              <div className="products-form-group">
                <label htmlFor="prod-categoria">Categoria</label>
                <input
                  id="prod-categoria"
                  type="text"
                  list="prod-categorias"
                  placeholder="Ex: Cílios, Skincare, Acessórios"
                  value={form.categoria}
                  onChange={setCampo("categoria")}
                  maxLength={100}
                />
                <datalist id="prod-categorias">
                  {categoriasExistentes.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>

              <div className="products-form-row">
                <div className="products-form-group">
                  <label htmlFor="prod-preco">Preço de venda (R$)</label>
                  <input
                    id="prod-preco"
                    type="text"
                    inputMode="decimal"
                    placeholder="89,90"
                    value={form.preco}
                    onChange={setCampo("preco")}
                    required
                  />
                </div>
                <div className="products-form-group">
                  <label htmlFor="prod-custo">Custo (R$) — opcional</label>
                  <input
                    id="prod-custo"
                    type="text"
                    inputMode="decimal"
                    placeholder="40,00"
                    value={form.custo}
                    onChange={setCampo("custo")}
                  />
                </div>
              </div>

              <div className="products-form-group">
                <label htmlFor="prod-estoque">Estoque atual (unidades)</label>
                <input
                  id="prod-estoque"
                  type="number"
                  min="0"
                  step="1"
                  value={form.estoque}
                  onChange={setCampo("estoque")}
                  required
                />
              </div>

              <div className="products-form-group">
                <label htmlFor="prod-imagem">Endereço da imagem — opcional</label>
                <input
                  id="prod-imagem"
                  type="text"
                  placeholder="https://... ou /img/serum.jpg"
                  value={form.imagemUrl}
                  onChange={setCampo("imagemUrl")}
                  maxLength={255}
                />
              </div>

              <div className="products-form-group">
                <label htmlFor="prod-descricao">Descrição — opcional</label>
                <textarea
                  id="prod-descricao"
                  placeholder="Fale um pouco sobre o produto"
                  value={form.descricao}
                  onChange={setCampo("descricao")}
                />
              </div>

              <label className="products-form-check">
                <input
                  type="checkbox"
                  checked={form.ativo}
                  onChange={(e) => setForm((f) => ({ ...f, ativo: e.target.checked }))}
                />
                Produto ativo (aparece na loja do site)
              </label>

              <div className="products-modal-actions">
                <button type="button" className="products-btn-cancel" onClick={closeNewModal}>
                  CANCELAR
                </button>
                <button type="submit" className="dash-primary-btn" disabled={saving}>
                  {saving ? "SALVANDO..." : "CADASTRAR PRODUTO"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---- MODAL DE AVISO ---- */}
      {toastInfo && (
        <div className="clients-toast-overlay" onClick={() => setToastInfo(null)}>
          <div className="clients-toast-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="clients-toast-title">{toastInfo.title}</h3>
            <p className="clients-toast-message">{toastInfo.message}</p>
            <div className="clients-toast-actions">
              <button
                type="button"
                className="dash-primary-btn"
                onClick={() => setToastInfo(null)}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}