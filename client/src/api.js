// Faz as chamadas ao Django e, se houver login, envia o token automaticamente.
// Se o token estiver vencido, tenta renová-lo; se não der, desloga a pessoa.

// Endereço da API: VITE_API_URL online; no computador local usa o Django em 127.0.0.1:8000.
export const BASE_URL = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://127.0.0.1:8000/api" : "/api")
).replace(/\/+$/, "");

function enviar(path, options, token) {
  // Em upload (FormData) o navegador define o Content-Type sozinho, com o boundary.
  const ehUpload = typeof FormData !== "undefined" && options.body instanceof FormData;
  return fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(ehUpload ? {} : { "Content-Type": "application/json" }),
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