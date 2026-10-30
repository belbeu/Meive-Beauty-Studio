// Busca os produtos da loja no banco e traz as funções usadas pela home e pela
// página de produtos (formatação de preço, categorias, busca e ordem).

import { useEffect, useState } from "react";
import { api } from "./api";

// Carrega os produtos ativos. "tentarNovamente" refaz a chamada (ex.: a API estava acordando).
export function useProdutosLoja() {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    let cancelado = false;
    api("/produtos/")
      .then((lista) => {
        if (cancelado) return;
        setProdutos(Array.isArray(lista) ? lista : lista.results || []);
        setErro(false);
      })
      .catch(() => {
        if (!cancelado) setErro(true);
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });
    return () => {
      cancelado = true;
    };
  }, [tentativa]);

  const tentarNovamente = () => {
    setCarregando(true);
    setErro(false);
    setTentativa((t) => t + 1);
  };

  return { produtos, carregando, erro, tentarNovamente };
}

// A API devolve o preço como texto ("89.00"). Na home aparece "R$ 89" ou "R$ 45,50";
// com sempreCentavos, "R$ 89,00" (página de produtos).
export function formatarPreco(valor, { sempreCentavos = false } = {}) {
  const n = Number(valor);
  if (valor === null || valor === undefined || Number.isNaN(n)) return "Consultar";
  const comCentavos = sempreCentavos || !Number.isInteger(n);
  return n.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: comCentavos ? 2 : 0,
    maximumFractionDigits: 2,
  });
}

// Tira acentos e maiúsculas: "Cílios" e "cilios" ficam iguais
export const normalizar = (texto) =>
  String(texto ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

// Disponíveis primeiro; dentro de cada grupo, os mais recentes (cadastrados por último) na frente.
export function ordenarParaLoja(lista) {
  return [...lista].sort(
    (a, b) =>
      Number(b.em_estoque) - Number(a.em_estoque) || b.id_produto - a.id_produto
  );
}

// Categorias que existem nos produtos, para os botões de filtro.
// As conhecidas vêm primeiro, na ordem de sempre; as outras, em ordem alfabética.
const ORDEM_CATEGORIAS = ["cilios", "skincare", "acessorios"];

export function categoriasDaLoja(produtos) {
  const mapa = new Map();
  produtos.forEach((p) => {
    const rotulo = (p.categoria || "").trim();
    if (rotulo && !mapa.has(normalizar(rotulo))) mapa.set(normalizar(rotulo), rotulo);
  });

  return [...mapa.entries()]
    .map(([chave, rotulo]) => ({ chave, rotulo }))
    .sort((a, b) => {
      const ia = ORDEM_CATEGORIAS.indexOf(a.chave);
      const ib = ORDEM_CATEGORIAS.indexOf(b.chave);
      if (ia !== -1 && ib !== -1) return ia - ib;
      if (ia !== -1) return -1;
      if (ib !== -1) return 1;
      return a.rotulo.localeCompare(b.rotulo, "pt-BR");
    });
}

// Cada palavra digitada precisa aparecer no nome, na categoria ou na descrição.
export function buscaCombina(produto, termo) {
  const termos = normalizar(termo).split(/\s+/).filter(Boolean);
  if (termos.length === 0) return true;
  const texto = normalizar(
    `${produto.nome} ${produto.categoria || ""} ${produto.descricao || ""}`
  );
  return termos.every((t) => texto.includes(t));
}

// Selo que aparece sobre a foto (null = sem selo)
export function seloDoProduto(produto) {
  if (!produto.em_estoque) return "ESGOTADO";
  if (produto.ultimas_unidades) return "ÚLTIMAS UNIDADES";
  return null;
}