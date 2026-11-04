// Salvar como: client/src/auth.js

import { api } from "./api";
import { cestinhaService } from "./services/cestinhaService";

export function logout() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
}

export function estaLogado() {
  return Boolean(localStorage.getItem("access"));
}

// Busca os dados do usuário dono do token (nome, e-mail, tipo...)
export function usuarioAtual() {
  return api("/auth/eu/");
}

export async function login(email, senha) {
  logout(); // garante que não sobrou token antigo
  const tokens = await api("/auth/login/", {
    method: "POST",
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      password: senha,
    }),
  });
  localStorage.setItem("access", tokens.access);
  localStorage.setItem("refresh", tokens.refresh);

  // MIGRAÇÃO DA CESTINHA: Transfere os itens temporários para o banco do usuário logado
  await cestinhaService.migrarItensLocaisParaAPI();

  return usuarioAtual();
}

// Cria a conta de cliente e já deixa a pessoa logada
export async function registrar({ nome, email, telefone, senha }) {
  await api("/auth/registro/", {
    method: "POST",
    body: JSON.stringify({
      nome: nome.trim(),
      email: email.trim().toLowerCase(),
      telefone: telefone?.trim() || null,
      password: senha,
    }),
  });
  return login(email, senha);
}

export async function loginComGoogle(credential) {
  const data = await api("/auth/google/", {
    method: "POST",
    body: JSON.stringify({ credential }),
  });
  localStorage.setItem("access", data.access);
  localStorage.setItem("refresh", data.refresh);

  // MIGRAÇÃO DA CESTINHA PARA LOGIN VIA GOOGLE
  await cestinhaService.migrarItensLocaisParaAPI();

  return usuarioAtual();
}