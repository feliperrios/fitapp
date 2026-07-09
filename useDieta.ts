"use client";

import { useState, useEffect, useCallback } from "react";
import { Refeicao, AlimentoRefeicao } from "@/lib/types";
import { getDb } from "@/lib/db";

export function useDieta(userId: string | undefined) {
  const [refeicoes, setRefeicoes] = useState<Refeicao[]>([]);
  const [obs, setObsState] = useState("");
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!userId) return;
    const db = getDb();
    const [r, o] = await Promise.all([db.getRefeicoes(userId), db.getDietaObs(userId)]);
    setRefeicoes(r);
    setObsState(o);
    setLoading(false);
  }, [userId]);

  useEffect(() => { reload(); }, [reload]);

  const totalKcal = refeicoes
    .filter((r) => r.concluida)
    .flatMap((r) => r.alimentos)
    .reduce((acc, a) => acc + a.kcal, 0);

  async function addRefeicao() {
    if (!userId) return;
    await getDb().addRefeicao(userId);
    await reload();
  }

  async function removeRefeicao(id: string) {
    if (!userId) return;
    await getDb().removeRefeicao(userId, id);
    await reload();
  }

  async function toggleConcluida(id: string) {
    if (!userId) return;
    await getDb().toggleRefeicaoConcluida(userId, id);
    await reload();
  }

  async function addAlimento(refeicaoId: string, alimento: AlimentoRefeicao) {
    if (!userId) return;
    await getDb().addAlimentoRefeicao(userId, refeicaoId, alimento);
    await reload();
  }

  async function removeAlimento(refeicaoId: string, idx: number) {
    if (!userId) return;
    await getDb().removeAlimentoRefeicao(userId, refeicaoId, idx);
    await reload();
  }

  async function salvarObs(texto: string) {
    if (!userId) return;
    await getDb().setDietaObs(userId, texto);
    await reload();
  }

  return { refeicoes, obs, totalKcal, loading, reload, addRefeicao, removeRefeicao, toggleConcluida, addAlimento, removeAlimento, salvarObs };
}
