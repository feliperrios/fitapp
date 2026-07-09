// lib/date.ts
// IMPORTANTE: nunca usar Date.toISOString() para chaves de calendário —
// isso converte para UTC e desloca o dia em fusos negativos (ex: Brasil),
// causando bugs como "treino de segunda aparecendo marcado no sábado".
// Sempre usar ymd() (data local) para qualquer chave de data persistida.

import { DiaSemanaKey } from "./types";

export function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayYmd(): string {
  return ymd(new Date());
}

export const DIAS_SEMANA_KEYS: DiaSemanaKey[] = [
  "seg",
  "ter",
  "qua",
  "qui",
  "sex",
  "sab",
  "dom",
];

export const DIAS_SEMANA_LABELS: Record<DiaSemanaKey, string> = {
  seg: "Segunda",
  ter: "Terça",
  qua: "Quarta",
  qui: "Quinta",
  sex: "Sexta",
  sab: "Sábado",
  dom: "Domingo",
};

export const DIAS_SEMANA_SHORT: Record<DiaSemanaKey, string> = {
  seg: "Seg",
  ter: "Ter",
  qua: "Qua",
  qui: "Qui",
  sex: "Sex",
  sab: "Sáb",
  dom: "Dom",
};

/** Retorna a data (Date) de cada dia da semana atual, a partir de segunda-feira. */
export function getDatasSemanaAtual(): Record<DiaSemanaKey, Date> {
  const hoje = new Date();
  const dow = hoje.getDay(); // 0 = domingo
  const segunda = new Date(hoje);
  segunda.setDate(hoje.getDate() - (dow === 0 ? 6 : dow - 1));

  const resultado = {} as Record<DiaSemanaKey, Date>;
  DIAS_SEMANA_KEYS.forEach((key, i) => {
    const d = new Date(segunda);
    d.setDate(segunda.getDate() + i);
    resultado[key] = d;
  });
  return resultado;
}

export function fmtDataBR(dataYmd: string): string {
  const [y, m, d] = dataYmd.split("-");
  const meses = [
    "jan", "fev", "mar", "abr", "mai", "jun",
    "jul", "ago", "set", "out", "nov", "dez",
  ];
  return `${parseInt(d, 10)} ${meses[parseInt(m, 10) - 1]} ${y}`;
}

export function saudacaoPorHora(): string {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}
