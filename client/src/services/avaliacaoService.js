// Salvar como: src/services/avaliacaoService.js
import { api } from "../api";

export const ROTULOS_NOTA = ["Muito ruim", "Ruim", "Regular", "Boa", "Excelente"];
export const FORMATOS_FOTO = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export const TAMANHO_MAX_FOTO = 2 * 1024 * 1024; // 2 MB (igual ao limite do servidor)
export const COMENTARIO_MAX = 1000;

export const avaliacaoService = {
  async listar() {
    const dados = await api("/minhas-avaliacoes/");
    return Array.isArray(dados) ? dados : dados?.results || [];
  },

  async listarPublicas() {
  const dados = await api("/avaliacoes-publicas/");
  return Array.isArray(dados) ? dados : dados?.results || [];
  },

  obter(id) {
    return api(`/minhas-avaliacoes/${id}/`);
  },

  criar(formData) {
    return api("/minhas-avaliacoes/", { method: "POST", body: formData });
  },

  atualizar(id, formData) {
    return api(`/minhas-avaliacoes/${id}/`, { method: "PATCH", body: formData });
  },

  excluir(id) {
    return api(`/minhas-avaliacoes/${id}/`, { method: "DELETE" });
  },
};

// Monta o corpo multipart (a foto vai junto com a avaliação, na mesma requisição).
export function montarFormData({ nota, comentario, anonima, servicoId = "", foto, removerFoto }) {
  const dados = new FormData();
  dados.append("nota", String(nota));
  dados.append("comentario", comentario.trim());
  dados.append("anonima", anonima ? "true" : "false");
  // String vazia representa null no serializer DRF com allow_null=True,
  // permitindo remover o serviço associado durante a edição.
  dados.append("id_servico", servicoId || "");
  if (foto) {
    dados.append("foto", foto);
  } else if (removerFoto) {
    dados.append("remover_foto", "true");
  }
  return dados;
}

// Devolve a mensagem de erro da foto escolhida, ou null se estiver tudo certo.
export function validarFoto(arquivo) {
  if (!FORMATOS_FOTO.includes(arquivo.type)) {
    return "Formato não aceito. Use JPG, PNG, WEBP ou GIF.";
  }
  if (arquivo.size > TAMANHO_MAX_FOTO) {
    return "A foto é grande demais (máximo de 2 MB).";
  }
  return null;
}

// Transforma o erro da API em mensagens para a cliente.
// Retorna { geral, campos: { nota, comentario, foto }, sessaoExpirada }.
export function traduzirErro(erro) {
  const resultado = { geral: null, campos: {}, sessaoExpirada: false };

  // Sem status = a requisição nem chegou ao servidor (internet, servidor fora do ar...)
  if (!erro || typeof erro.status !== "number") {
    resultado.geral =
      "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.";
    return resultado;
  }

  const dados = erro.dados;

  if (erro.status === 400 && dados && typeof dados === "object") {
    const gerais = [];
    for (const [chave, valor] of Object.entries(dados)) {
      const texto = (Array.isArray(valor) ? valor : [valor])
        .filter((item) => typeof item === "string")
        .join(" ");
      if (!texto) continue;
      if (["nota", "comentario", "foto"].includes(chave)) {
        resultado.campos[chave] = texto;
      } else {
        gerais.push(texto);
      }
    }
    if (gerais.length > 0) resultado.geral = gerais.join(" ");
    if (!resultado.geral && Object.keys(resultado.campos).length === 0) {
      resultado.geral = "Não foi possível salvar. Confira os dados e tente novamente.";
    }
    return resultado;
  }

  if (erro.status === 401) {
    resultado.sessaoExpirada = true;
    resultado.geral = "Sua sessão expirou. Entre novamente para continuar.";
  } else if (erro.status === 403) {
    resultado.geral = "Você não tem permissão para fazer isso.";
  } else if (erro.status === 404) {
    resultado.geral = "Avaliação não encontrada. Ela pode já ter sido apagada.";
  } else if (erro.status === 413) {
    resultado.campos.foto = "A foto é grande demais (máximo de 2 MB).";
  } else if (erro.status === 429) {
    resultado.geral = "Muitas tentativas em pouco tempo. Aguarde um pouco e tente de novo.";
  } else if (erro.status >= 500) {
    resultado.geral = "O servidor está com problemas no momento. Tente novamente em instantes.";
  } else {
    resultado.geral = "Algo deu errado. Tente novamente.";
  }
  return resultado;
}
