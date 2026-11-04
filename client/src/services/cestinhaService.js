// Salvar como: src/services/cestinhaService.js
import { api } from "../api";

const LOCAL_STORAGE_KEY = "@meive_cestinha_temporaria";

export const cestinhaService = {
  getItensLocais() {
    try {
      const itens = localStorage.getItem(LOCAL_STORAGE_KEY);
      return itens ? JSON.parse(itens) : [];
    } catch {
      return [];
    }
  },

  adicionarItemLocal(produto, quantidade = 1) {
    const itens = this.getItensLocais();
    const index = itens.findIndex((i) => i.id_produto === produto.id_produto);

    if (index >= 0) {
      itens[index].quantidade += quantidade;
    } else {
      itens.push({
        id_produto: produto.id_produto,
        quantidade,
        produto: {
          id_produto: produto.id_produto,
          nome: produto.nome,
          preco: produto.preco,
          categoria: produto.categoria,
          imagem_url: produto.imagem_url,
          em_estoque: produto.em_estoque ?? true,
        },
      });
    }

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(itens));
    return itens;
  },

  removerItemLocal(id_produto) {
    let itens = this.getItensLocais();
    itens = itens.filter((i) => i.id_produto !== id_produto);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(itens));
    return itens;
  },

  limparLocal() {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  },

  async getItensAPI() {
    const response = await api("/cestinha/");
    return Array.isArray(response) ? response : response.results || [];
  },

  async adicionarItemAPI(id_produto, quantidade = 1) {
    return await api("/cestinha/", {
      method: "POST",
      body: JSON.stringify({ id_produto, quantidade }),
    });
  },

  async removerItemAPI(id_cestinha) {
    await api(`/cestinha/${id_cestinha}/`, {
      method: "DELETE",
    });
  },

  async atualizarQuantidadeAPI(id_cestinha, quantidade) {
    return await api(`/cestinha/${id_cestinha}/`, {
      method: "PATCH",
      body: JSON.stringify({ quantidade }),
    });
  },

  async migrarItensLocaisParaAPI() {
    const itensLocais = this.getItensLocais();
    if (itensLocais.length === 0) return;

    try {
      for (const item of itensLocais) {
        await api("/cestinha/", {
          method: "POST",
          body: JSON.stringify({
            id_produto: item.id_produto,
            quantidade: item.quantidade,
          }),
        }).catch(() => {
          // Se já existir na API do usuário, ignora o conflito e continua
        });
      }
      this.limparLocal();
    } catch (error) {
      console.error("Erro ao migrar cestinha temporária:", error);
    }
  },
};