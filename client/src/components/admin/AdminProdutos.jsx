import React, { useState, useEffect } from "react";
import "./AdminDashboard.css"; // header, botões, painel (compartilhados)
import "./AdminProdutos.css";
import "./AdminAvisos.css"; // modal de aviso (mesmo padrão do AdminClientes)
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
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
  imagem: "Imagem",
  quantidade: "Quantidade",
};

const textoPdf = (t) => String(t).replace(/[\u00a0\u202f]/g, " ");

function montarLinhasPdf(lista) {
  let unidades = 0;
  let valor = 0;

  const linhas = lista.map((p) => {
    const status = getStatus(p);
    const estoque = Number(p.estoque_atual) || 0;
    const entraNoValor = status !== "inactive";
    const valorLinha = entraNoValor ? Number(p.preco || 0) * estoque : null;
    if (entraNoValor) {
      unidades += estoque;
      valor += valorLinha;
    }
    return [
      `#${String(p.id_produto).padStart(4, "0")}`,
      p.nome || "-",
      p.categoria || "-",
      formatBRL(p.preco),
      `${estoque} un.`,
      STATUS_LABEL[status],
      valorLinha === null ? "-" : formatBRL(valorLinha),
    ].map(textoPdf);
  });

  return { linhas, unidades, valor };
}

const normalizar = (texto) =>
  String(texto ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

function combinaComBusca(p, termo) {
  const termos = normalizar(termo).split(/\s+/).filter(Boolean);
  if (termos.length === 0) return true;

  const textos = normalizar(
    `${p.nome} ${p.categoria || ""} #${String(p.id_produto).padStart(4, "0")}`
  );
  const status = getStatus(p);
  const palavrasStatus = normalizar(STATUS_LABEL[status]).split(" ");
  if (status !== "inactive") palavrasStatus.push("ativo");

  return termos.every(
    (t) => textos.includes(t) || palavrasStatus.some((palavra) => palavra.startsWith(t))
  );
}

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

const CATEGORIAS_PADRAO = ["CÍLIOS", "SKINCARE", "ACESSÓRIOS"];
const FORMATOS_IMAGEM = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const LIMITE_ARQUIVO = 10 * 1024 * 1024;
const LIMITE_ENVIO = 2 * 1024 * 1024;
const LADO_MAXIMO = 1200;

async function prepararImagem(file) {
  if (!FORMATOS_IMAGEM.includes(file.type)) {
    throw new Error("Escolha uma imagem JPG, PNG, WEBP ou GIF.");
  }
  if (file.size > LIMITE_ARQUIVO) {
    throw new Error("A imagem é grande demais (máximo de 10 MB).");
  }

  let pronta = file;
  if (file.type !== "image/gif") {
    let bitmap;
    try {
      bitmap = await createImageBitmap(file);
    } catch {
      throw new Error("Não foi possível ler essa imagem. Tente outro arquivo.");
    }
    const escala = Math.min(1, LADO_MAXIMO / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * escala);
    canvas.height = Math.round(bitmap.height * escala);
    canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/webp", 0.85));
    if (blob && (escala < 1 || blob.size < file.size)) {
      const extensao = blob.type === "image/webp" ? "webp" : "png";
      pronta = new File([blob], `produto.${extensao}`, { type: blob.type });
    }
  }

  if (pronta.size > LIMITE_ENVIO) {
    throw new Error("Mesmo reduzida, a imagem passa de 2 MB. Escolha uma menor.");
  }
  return pronta;
}

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

const paraTexto = (v) => (v === null || v === undefined ? "" : String(v).replace(".", ","));

function produtoParaForm(p) {
  return {
    nome: p.nome || "",
    categoria: p.categoria || "",
    descricao: p.descricao || "",
    preco: paraTexto(p.preco),
    custo: paraTexto(p.custo),
    estoque: String(p.estoque_atual ?? 0),
    imagemUrl: p.imagem_url || "",
    ativo: p.ativo !== false,
  };
}

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

export default function AdminProdutos() {
  const [filter, setFilter] = useState("all");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastInfo, setToastInfo] = useState(null);

  // Modal "Novo produto"
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(FORM_VAZIO);
  const [saving, setSaving] = useState(false);
  const [imagemModo, setImagemModo] = useState("link");
  const [imagemEnviada, setImagemEnviada] = useState("");
  const [uploading, setUploading] = useState(false);

  // Modal "Registrar venda"
  const [sellProduct, setSellProduct] = useState(null);
  const [sellQty, setSellQty] = useState("1");
  const [selling, setSelling] = useState(false);

  // Modal "Inativar produto"
  const [deleteProduct, setDeleteProduct] = useState(null);
  const [deleting, setDeleting] = useState(false);

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

  const openCreateModal = () => {
    setEditingId(null);
    setForm(FORM_VAZIO);
    setImagemModo("link");
    setImagemEnviada("");
    setIsFormOpen(true);
  };

  const openEditModal = (produto) => {
    const dados = produtoParaForm(produto);
    const veioDeUpload = dados.imagemUrl.includes("/produtos/imagem/");
    setEditingId(produto.id_produto);
    setForm(dados);
    setImagemModo(veioDeUpload ? "arquivo" : "link");
    setImagemEnviada(veioDeUpload ? "Imagem atual" : "");
    setIsFormOpen(true);
  };

  const openSellModal = (produto) => {
    setSellProduct(produto);
    setSellQty("1");
  };

  const closeSellModal = () => {
    if (!selling) setSellProduct(null);
  };

  const openDeleteModal = (produto) => {
    setDeleteProduct(produto);
  };

  const closeDeleteModal = () => {
    if (!deleting) setDeleteProduct(null);
  };

  const handleDelete = async () => {
    if (!deleteProduct || deleting) return;

    try {
      setDeleting(true);
      // Em vez de exclusão física, inativamos o produto via PATCH
      const atualizado = await api(`/admin/produtos/${deleteProduct.id_produto}/`, {
        method: "PATCH",
        body: JSON.stringify({ ativo: false }),
      });

      setProducts((lista) =>
        lista.map((p) => (p.id_produto === atualizado.id_produto ? atualizado : p))
      );
      setDeleteProduct(null);
      setToastInfo({
        title: "PRODUTO INATIVADO",
        message: `O produto "${deleteProduct.nome}" foi desativado com sucesso.`,
      });
    } catch (error) {
      console.error("Erro ao inativar produto:", error);
      setToastInfo({
        title: "ERRO AO INATIVAR",
        message: `Não foi possível desativar o produto.\n${formatarErroApi(error)}`,
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleSell = async (e) => {
    e.preventDefault();
    if (selling || !sellProduct) return;

    const texto = sellQty.trim();
    if (!/^\d+$/.test(texto) || parseInt(texto, 10) < 1) {
      setToastInfo({ title: "CAMPOS INVÁLIDOS", message: "Informe uma quantidade inteira, de 1 em diante." });
      return;
    }
    const quantidade = parseInt(texto, 10);
    if (quantidade > sellProduct.estoque_atual) {
      setToastInfo({
        title: "ESTOQUE INSUFICIENTE",
        message: `Só há ${sellProduct.estoque_atual} un. de "${sellProduct.nome}" em estoque.`,
      });
      return;
    }

    try {
      setSelling(true);
      const atualizado = await api(`/admin/produtos/${sellProduct.id_produto}/vender/`, {
        method: "POST",
        body: JSON.stringify({ quantidade }),
      });
      setProducts((lista) =>
        lista.map((p) => (p.id_produto === atualizado.id_produto ? atualizado : p))
      );
      setSellProduct(null);
      setToastInfo({
        title: "VENDA REGISTRADA",
        message: `${quantidade} un. de "${atualizado.nome}" baixadas do estoque. Restam ${atualizado.estoque_atual} un.`,
      });
    } catch (error) {
      console.error("Erro ao registrar venda:", error);
      setToastInfo({
        title: "ERRO AO REGISTRAR VENDA",
        message: `Não foi possível registrar a venda.\n${formatarErroApi(error)}`,
      });
    } finally {
      setSelling(false);
    }
  };

  const closeFormModal = () => {
    if (!saving && !uploading) setIsFormOpen(false);
  };

  const handleEscolherArquivo = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    try {
      setUploading(true);
      const pronta = await prepararImagem(file);
      const dados = new FormData();
      dados.append("imagem", pronta);
      const resposta = await api("/admin/upload/produto-imagem/", { method: "POST", body: dados });
      setForm((f) => ({ ...f, imagemUrl: resposta.url }));
      setImagemEnviada(file.name);
    } catch (error) {
      console.error("Erro ao enviar imagem:", error);
      setToastInfo({
        title: "ERRO NA IMAGEM",
        message: `Não foi possível enviar a imagem.\n${formatarErroApi(error)}`,
      });
    } finally {
      setUploading(false);
    }
  };

  const removerImagem = () => {
    setForm((f) => ({ ...f, imagemUrl: "" }));
    setImagemEnviada("");
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (saving || uploading) return;

    const erro = validarProduto(form);
    if (erro) {
      setToastInfo({ title: "CAMPOS INVÁLIDOS", message: erro });
      return;
    }

    const editando = editingId !== null;
    const corpo = JSON.stringify({
      nome: form.nome.trim(),
      descricao: form.descricao.trim() || null,
      categoria: form.categoria.trim() || null,
      preco: lerDecimal(form.preco),
      custo: lerDecimal(form.custo),
      estoque_atual: parseInt(form.estoque, 10),
      imagem_url: form.imagemUrl.trim() || null,
      ativo: form.ativo,
    });

    try {
      setSaving(true);

      if (editando) {
        const atualizado = await api(`/admin/produtos/${editingId}/`, {
          method: "PATCH",
          body: corpo,
        });
        setProducts((lista) =>
          lista.map((p) => (p.id_produto === atualizado.id_produto ? atualizado : p))
        );
      } else {
        await api("/admin/produtos/", { method: "POST", body: corpo });
        await fetchProducts();
      }

      setIsFormOpen(false);
      setForm(FORM_VAZIO);
      setEditingId(null);
      setToastInfo({
        title: "SUCESSO",
        message: editando ? "Produto atualizado com sucesso!" : "Produto cadastrado com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      setToastInfo({
        title: editando ? "ERRO AO ATUALIZAR" : "ERRO AO CADASTRAR",
        message: `Não foi possível ${editando ? "atualizar" : "cadastrar"} o produto.\n${formatarErroApi(error)}`,
      });
    } finally {
      setSaving(false);
    }
  };

  const categoriasMap = new Map(CATEGORIAS_PADRAO.map((c) => [c.toLocaleUpperCase("pt-BR"), c]));
  products.forEach((p) => {
    if (p.categoria) categoriasMap.set(p.categoria.trim().toLocaleUpperCase("pt-BR"), p.categoria.trim());
  });
  const categoriasOpcoes = [...categoriasMap.values()];
  if (form.categoria && !categoriasOpcoes.includes(form.categoria)) {
    categoriasOpcoes.push(form.categoria);
  }

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

  const porAba =
    filter === "low"
      ? products.filter((p) => getStatus(p) !== "inactive" && isEstoqueBaixo(getStatus(p)))
      : filter === "inactive"
      ? products.filter((p) => getStatus(p) === "inactive")
      : products;
  const visible = porAba.filter((p) => combinaComBusca(p, searchTerm));
  const temBusca = searchTerm.trim() !== "";

  const exportStockPdf = () => {
    if (visible.length === 0) {
      setToastInfo({
        title: "NADA PARA EXPORTAR",
        message: "Não há produtos na lista para gerar o PDF.",
      });
      return;
    }

    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const hoje = new Date();
    const dataAtual = hoje.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
    const horaAtual = hoje.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    const { linhas, unidades, valor } = montarLinhasPdf(visible);

    doc.setFillColor(36, 31, 32);
    doc.rect(0, 0, 297, 42, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("MEIVE", 15, 17);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("STUDIO BEAUTY", 15, 24);

    doc.setFontSize(15);
    doc.setFont("helvetica", "bold");
    doc.text("ESTOQUE DE PRODUTOS", 15, 34);

    doc.setTextColor(65, 58, 60);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Emitido em: ${dataAtual} às ${horaAtual}`, 15, 52);
    doc.text(`Total de produtos: ${visible.length}`, 15, 59);

    const filtros = [];
    if (filter === "low") filtros.push("Estoque baixo");
    if (filter === "inactive") filtros.push("Inativos");
    if (temBusca) filtros.push(`Busca: "${searchTerm.trim()}"`);
    let inicioTabela = 66;
    if (filtros.length > 0) {
      doc.text(`Filtros: ${filtros.join(" | ")}`, 15, 66);
      inicioTabela = 73;
    }

    autoTable(doc, {
      startY: inicioTabela,
      head: [["CÓD.", "PRODUTO", "CATEGORIA", "PREÇO", "ESTOQUE", "STATUS", "VALOR EM ESTOQUE"]],
      body: linhas,
      foot: [["", "TOTAL (produtos ativos)", "", "", `${unidades} un.`, "", textoPdf(formatBRL(valor))]],
      showFoot: "lastPage",
      theme: "grid",
      margin: { left: 15, right: 15, bottom: 20 },
      styles: {
        font: "helvetica",
        fontSize: 9,
        cellPadding: 4,
        textColor: [55, 48, 50],
        lineColor: [230, 223, 225],
        lineWidth: 0.2,
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: [130, 91, 104],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      footStyles: {
        fillColor: [240, 232, 235],
        textColor: [55, 48, 50],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [250, 246, 247],
      },
      columnStyles: {
        0: { cellWidth: 18 },
        1: { cellWidth: 80 },
        2: { cellWidth: 40 },
        3: { cellWidth: 30 },
        4: { cellWidth: 25 },
        5: { cellWidth: 36 },
        6: { cellWidth: 38 },
      },
      didParseCell: (data) => {
        if ([3, 4, 6].includes(data.column.index)) data.cell.styles.halign = "right";

        if (data.section === "body" && data.column.index === 5) {
          const status = data.cell.raw;
          if (status === STATUS_LABEL.low || status === STATUS_LABEL.out) {
            data.cell.styles.textColor = [173, 18, 56];
            data.cell.styles.fontStyle = "bold";
          } else if (status === STATUS_LABEL.inactive) {
            data.cell.styles.textColor = [140, 130, 133];
          }
        }
      },
      didDrawPage: () => {
        const pagina = doc.internal.getNumberOfPages();
        const altura = doc.internal.pageSize.getHeight();
        doc.setFontSize(8);
        doc.setTextColor(120, 110, 113);
        doc.text("MEIVE - STUDIO BEAUTY | Relatório de estoque", 15, altura - 8);
        doc.text(`Página ${pagina}`, doc.internal.pageSize.getWidth() - 15, altura - 8, { align: "right" });
      },
    });

    doc.save(`meive-estoque-${hoje.toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <main className="dash-main">
      <header className="dash-header">
        <div>
          <span className="dash-date">{formatToday()}</span>
          <h1 className="dash-title">PRODUTOS</h1>
        </div>

        <div className="dash-header-actions">
          <div className={`products-search-container ${searchOpen ? "is-open" : ""}`}>
            <input
              type="text"
              placeholder="Nome, categoria ou status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="products-search-input"
              aria-label="Buscar produto"
            />
            <button
              type="button"
              className="dash-icon-btn"
              aria-label="Buscar"
              onClick={() => setSearchOpen((aberto) => !aberto)}
            >
              {Icons.search}
            </button>
          </div>
          <button type="button" className="dash-primary-btn" onClick={openCreateModal}>
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

          <div className="products-head-actions">
            <button
              type="button"
              className="products-export"
              onClick={exportStockPdf}
              disabled={loading}
            >
              EXPORTAR PDF
            </button>

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
              <button
                type="button"
                role="tab"
                aria-selected={filter === "inactive"}
                className={filter === "inactive" ? "is-active" : ""}
                onClick={() => setFilter("inactive")}
              >
                INATIVOS
              </button>
            </div>
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
                    <div className="products-actions">
                      <button
                        type="button"
                        className="products-sell"
                        aria-label={`Registrar venda de ${p.nome}`}
                        disabled={status === "inactive" || status === "out"}
                        title={
                          status === "inactive"
                            ? "Produto inativo"
                            : status === "out"
                              ? "Sem estoque"
                              : "Registrar venda"
                        }
                        onClick={() => openSellModal(p)}
                      >
                        VENDER
                      </button>
                      <button
                        type="button"
                        className="products-edit"
                        aria-label={`Editar ${p.nome}`}
                        onClick={() => openEditModal(p)}
                      >
                        EDITAR
                      </button>
                      <button
                      type="button"
                      className="products-delete"
                      aria-label={`Inativar ${p.nome}`}
                      disabled={status === "inactive"}
                      title={status === "inactive" ? "Produto já está inativo" : "Inativar produto"}
                      onClick={() => openDeleteModal(p)}
                    >
                      {status === "inactive" ? "INATIVO" : "INATIVAR"}
                    </button>
                    </div>
                  </div>
                );
              })}

              {visible.length === 0 && (
                <p className="products-empty">
                  {temBusca
                    ? `Nenhum produto encontrado para “${searchTerm.trim()}”.`
                    : "Nenhum produto encontrado."}
                </p>
              )}
            </>
          )}
        </div>
      </section>

      {/* ---- MODAL: NOVO PRODUTO ---- */}
      {isFormOpen && (
        <div className="products-modal-overlay" onClick={closeFormModal}>
          <div className="products-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="products-modal-header">
              <h2>{editingId !== null ? "EDITAR PRODUTO" : "ADICIONAR NOVO PRODUTO"}</h2>
              <button
                type="button"
                className="products-modal-close"
                aria-label="Fechar"
                onClick={closeFormModal}
              >
                {Icons.close}
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="products-form" noValidate>
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
                <select
                  id="prod-categoria"
                  value={form.categoria}
                  onChange={setCampo("categoria")}
                >
                  <option value="">Selecione uma categoria</option>
                  {categoriasOpcoes.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
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
                <label>Imagem — opcional</label>

                <div className="products-img-tabs" role="tablist" aria-label="Como adicionar a imagem">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={imagemModo === "link"}
                    className={imagemModo === "link" ? "is-active" : ""}
                    onClick={() => setImagemModo("link")}
                  >
                    COLAR LINK
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={imagemModo === "arquivo"}
                    className={imagemModo === "arquivo" ? "is-active" : ""}
                    onClick={() => setImagemModo("arquivo")}
                  >
                    ENVIAR ARQUIVO
                  </button>
                </div>

                {imagemModo === "link" ? (
                  <input
                    id="prod-imagem"
                    type="text"
                    placeholder="https://... ou /img/serum.jpg"
                    value={form.imagemUrl}
                    onChange={(e) => {
                      setImagemEnviada("");
                      setCampo("imagemUrl")(e);
                    }}
                    maxLength={255}
                  />
                ) : imagemEnviada ? (
                  <div className="products-img-sent">
                    <span>{imagemEnviada}</span>
                    <button type="button" className="products-img-remove" onClick={removerImagem}>
                      REMOVER
                    </button>
                  </div>
                ) : (
                  <label className={`products-file-btn ${uploading ? "is-busy" : ""}`}>
                    {uploading ? "ENVIANDO IMAGEM..." : "ESCOLHER IMAGEM DO COMPUTADOR"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleEscolherArquivo}
                      disabled={uploading}
                    />
                  </label>
                )}

                {imagemModo === "arquivo" && !imagemEnviada && (
                  <span className="products-form-hint">
                    JPG, PNG, WEBP ou GIF. A foto é reduzida automaticamente (máx. 2 MB).
                  </span>
                )}

                {form.imagemUrl.trim() && (
                  <div className="products-img-preview">
                    <ProductImage key={form.imagemUrl} src={form.imagemUrl.trim()} alt="Pré-visualização" />
                    <span>Pré-visualização</span>
                  </div>
                )}
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
                <button type="button" className="products-btn-cancel" onClick={closeFormModal}>
                  CANCELAR
                </button>
                <button type="submit" className="dash-primary-btn" disabled={saving || uploading}>
                  {saving ? "SALVANDO..." : editingId !== null ? "SALVAR ALTERAÇÕES" : "CADASTRAR PRODUTO"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---- MODAL: REGISTRAR VENDA ---- */}
      {sellProduct && (() => {
        const texto = sellQty.trim();
        const qtd = /^\d+$/.test(texto) ? parseInt(texto, 10) : null;
        const depois = qtd === null ? null : sellProduct.estoque_atual - qtd;
        return (
          <div className="products-modal-overlay" onClick={closeSellModal}>
            <div
              className="products-modal-card products-modal-card--sm"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="products-modal-header">
                <h2>REGISTRAR VENDA</h2>
                <button
                  type="button"
                  className="products-modal-close"
                  aria-label="Fechar"
                  onClick={closeSellModal}
                >
                  {Icons.close}
                </button>
              </div>

              <form onSubmit={handleSell} className="products-form" noValidate>
                <div className="products-sell-info">
                  <strong>{sellProduct.nome}</strong>
                  <span>Em estoque agora: {sellProduct.estoque_atual} un.</span>
                </div>

                <div className="products-form-group">
                  <label htmlFor="venda-qtd">Quantidade vendida</label>
                  <input
                    id="venda-qtd"
                    type="number"
                    min="1"
                    max={sellProduct.estoque_atual}
                    step="1"
                    value={sellQty}
                    onChange={(e) => setSellQty(e.target.value)}
                    autoFocus
                    required
                  />
                </div>

                <div className="products-sell-summary">
                  {depois === null ? (
                    <span>Informe a quantidade.</span>
                  ) : depois < 0 ? (
                    <span className="is-error">Quantidade maior que o estoque.</span>
                  ) : (
                    <>
                      <span>Estoque depois da venda: {depois} un.</span>
                      <span>Valor: {formatBRL(Number(sellProduct.preco) * qtd)}</span>
                    </>
                  )}
                </div>

                <div className="products-modal-actions">
                  <button type="button" className="products-btn-cancel" onClick={closeSellModal}>
                    CANCELAR
                  </button>
                  <button
                    type="submit"
                    className="dash-primary-btn"
                    disabled={selling || depois === null || depois < 0}
                  >
                    {selling ? "REGISTRANDO..." : "CONFIRMAR VENDA"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* ---- MODAL: CONFIRMAR INATIVAÇÃO ---- */}
      {deleteProduct && (
        <div className="products-modal-overlay" onClick={closeDeleteModal}>
          <div
            className="products-modal-card products-modal-card--sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="products-modal-header">
              <h2>INATIVAR PRODUTO</h2>
              <button
                type="button"
                className="products-modal-close"
                aria-label="Fechar"
                onClick={closeDeleteModal}
              >
                {Icons.close}
              </button>
            </div>

            <div className="products-form">
              <div className="products-sell-info">
                <strong>{deleteProduct.nome}</strong>
                <span>Deseja realmente desativar este produto? Ele sairá da loja do site, mas poderá ser reativado a qualquer momento.</span>
              </div>

              <div className="products-modal-actions">
                <button type="button" className="products-btn-cancel" onClick={closeDeleteModal}>
                  CANCELAR
                </button>
                <button
                  type="button"
                  className="dash-primary-btn"
                  style={{ background: "#ad1238" }}
                  disabled={deleting}
                  onClick={handleDelete}
                >
                  {deleting ? "INATIVANDO..." : "SIM, INATIVAR"}
                </button>
              </div>
            </div>
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