// Salvar como: client/src/api.js  (substitui o api.js anterior)
//
// Faz as chamadas ao Django e, se houver login, envia o token automaticamente.
// Se o token estiver vencido, tenta renová-lo; se não der, desloga a pessoa.

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api";
// Se o projeto usa Create React App, troque a linha acima por:
// const BASE_URL = process.env.REACT_APP_API_URL ?? "http://127.0.0.1:8000/api";

function enviar(path, options, token) {
  return fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
}

async function renovarToken() {
  const refresh = localStorage.getItem("refresh");
  if (refresh) {
    const r = await fetch(`${BASE_URL}/auth/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
    if (r.ok) {
      const dados = await r.json();
      localStorage.setItem("access", dados.access);
      return dados.access;
    }
  }
  // não foi possível renovar: limpa o login
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  return null;
}

export async function api(path, options = {}) {
  const token = localStorage.getItem("access");
  let resp = await enviar(path, options, token);

  // Token vencido: tenta renovar e repete a chamada uma vez.
  // (Importante também para rotas públicas, pois um token inválido gera 401 nelas.)
  if (resp.status === 401 && token) {
    const novoToken = await renovarToken();
    resp = await enviar(path, options, novoToken);
  }

  if (!resp.ok) {
    const erro = new Error(`Erro ${resp.status}`);
    erro.status = resp.status;
    erro.dados = await resp.json().catch(() => null);
    throw erro;
  }
  return resp.status === 204 ? null : resp.json();
}