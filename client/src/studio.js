// Dados do studio (nome, contato, endereço e horários) vindos do banco.
// O rodapé e a tela Admin > Configurações usam este mesmo arquivo.

import { useEffect, useState } from "react";
import { api } from "./api";

export const DIAS = [
  { id: "seg", curto: "Seg", longo: "Segunda" },
  { id: "ter", curto: "Ter", longo: "Terça" },
  { id: "qua", curto: "Qua", longo: "Quarta" },
  { id: "qui", curto: "Qui", longo: "Quinta" },
  { id: "sex", curto: "Sex", longo: "Sexta" },
  { id: "sab", curto: "Sáb", longo: "Sábado" },
  { id: "dom", curto: "Dom", longo: "Domingo" },
];

const FECHADO = { aberto: false, abre: "09:00", fecha: "18:00" };

// Mostrado enquanto o banco não responde (ou se a API estiver fora do ar).
export const STUDIO_PADRAO = {
  nome: "Meive Beauty Studio",
  telefone: "(11) 94487-4969",
  email: "meivebeautystudio@gmail.com",
  endereco: "R. Giancarlo Palanti, 22 A, 03661-050, Vila Ré",
  horarios: {
    seg: { ...FECHADO },
    ter: { aberto: true, abre: "09:00", fecha: "22:00" },
    qua: { aberto: true, abre: "09:00", fecha: "22:00" },
    qui: { aberto: true, abre: "09:00", fecha: "22:00" },
    sex: { aberto: true, abre: "09:00", fecha: "22:00" },
    sab: { aberto: true, abre: "09:00", fecha: "17:00" },
    dom: { ...FECHADO },
  },
};

/* ---------- cache compartilhado ---------- */
let cache = null;
let pendente = null;
const ouvintes = new Set();

export function carregarStudio(forcar = false) {
  if (cache && !forcar) return Promise.resolve(cache);
  if (!pendente) {
    pendente = api("/studio/")
      .then((dados) => {
        cache = dados;
        ouvintes.forEach((fn) => fn(dados));
        return dados;
      })
      .finally(() => {
        pendente = null;
      });
  }
  return pendente;
}

// Chamado pelo painel depois de salvar, para o site já refletir a mudança.
export function atualizarCacheStudio(dados) {
  cache = dados;
  ouvintes.forEach((fn) => fn(dados));
}

export function useStudio() {
  const [studio, setStudio] = useState(cache || STUDIO_PADRAO);

  useEffect(() => {
    ouvintes.add(setStudio);
    carregarStudio().catch(() => {}); // se falhar, fica com o padrão
    return () => ouvintes.delete(setStudio);
  }, []);

  return studio;
}

/* ---------- helpers ---------- */
export function formatarHora(hhmm) {
  const [h, m] = String(hhmm || "").split(":");
  if (h === undefined || m === undefined) return "";
  return m === "00" ? `${Number(h)}h` : `${Number(h)}h${m}`;
}

// Junta dias seguidos com o mesmo horário: "Ter - Sex  9h às 22h", "Sábado  9h às 17h"...
// Se o primeiro e o último grupo forem iguais, eles se juntam ("Dom - Seg  Fechado").
export function agruparHorarios(horarios) {
  const chave = (d) => (d?.aberto ? `${d.abre}-${d.fecha}` : "fechado");
  const grupos = [];

  DIAS.forEach((dia) => {
    const dado = horarios?.[dia.id];
    const k = chave(dado);
    const ultimo = grupos[grupos.length - 1];
    if (ultimo && ultimo.chave === k) ultimo.dias.push(dia);
    else grupos.push({ chave: k, dado, dias: [dia] });
  });

  if (grupos.length > 1 && grupos[0].chave === grupos[grupos.length - 1].chave) {
    const primeiro = grupos.shift();
    grupos[grupos.length - 1].dias.push(...primeiro.dias);
  }

  return grupos.map((g) => {
    const { dias, dado } = g;
    const aberto = Boolean(dado?.aberto);
    return {
      rotulo: dias.length === 1 ? dias[0].longo : `${dias[0].curto} - ${dias[dias.length - 1].curto}`,
      texto: aberto ? `${formatarHora(dado.abre)} às ${formatarHora(dado.fecha)}` : "Fechado",
      aberto,
    };
  });
}

// "(11) 94487-4969" -> "5511944874969" (formato do wa.me)
export function whatsappDoStudio(telefone) {
  const digitos = String(telefone || "").replace(/\D/g, "");
  return digitos.length >= 12 && digitos.startsWith("55") ? digitos : `55${digitos}`;
}

export function mascararTelefone(valor) {
  const n = String(valor || "").replace(/\D/g, "").slice(0, 11);
  if (n.length === 0) return "";
  if (n.length <= 2) return `(${n}`;
  if (n.length <= 6) return `(${n.slice(0, 2)}) ${n.slice(2)}`;
  if (n.length <= 10) return `(${n.slice(0, 2)}) ${n.slice(2, 6)}-${n.slice(6)}`;
  return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`;
}
