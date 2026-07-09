"use client";

import { useState, useEffect, useCallback } from "react";
import { Treino, DiaTreinoMap } from "@/lib/types";
import { getDb } from "@/lib/db";
import { DIAS_SEMANA_KEYS } from "@/lib/date";
import { ymd, getDatasSemanaAtual } from "@/lib/date";

export function useTreinos(userId: string | undefined) {
  const [treinos, setTreinos] = useState<Record<string, Treino>>({});
  const [diaTreinoMap, setDiaTreinoMap] = useState<DiaTreinoMap>({} as DiaTreinoMap);
  const [treinosConcluidos, setTreinosConcluidos] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!userId) return;
    const db = getDb();
    const [t, m, c] = await Promise.all([
      db.getTreinos(userId),
      db.getDiaTreinoMap(userId),
      db.getTreinosConcluidos(userId),
    ]);
    setTreinos(t);
    setDiaTreinoMap(m);
    setTreinosConcluidos(c);
    setLoading(false);
  }, [userId]);

  useEffect(() => { reload(); }, [reload]);

  // ---- Meta semanal ----
  // Total = quantos dias foram manualmente vinculados a um treino (pode ser 0)
  const totalSemana = DIAS_SEMANA_KEYS.filter((k) => !!diaTreinoMap[k]).length;

  // Contagem real de dias concluídos nesta semana (apenas dias com treino vinculado)
  function countConcluidos(): number {
    const datas = getDatasSemanaAtual();
    let c = 0;
    for (const k of DIAS_SEMANA_KEYS) {
      const grupo = diaTreinoMap[k];
      if (!grupo) continue;
      const chave = `${ymd(datas[k])}_${grupo}`;
      if (treinosConcluidos[chave]) c++;
    }
    return c;
  }

  const concluidos = countConcluidos();

  async function addGrupo() {
    if (!userId) return;
    await getDb().addGrupoTreino(userId);
    await reload();
  }

  async function removeGrupo(grupo: string) {
    if (!userId) return;
    await getDb().removeGrupoTreino(userId, grupo);
    await reload();
  }

  async function updateTreino(grupo: string, patch: Partial<Treino>) {
    if (!userId) return;
    await getDb().updateTreino(userId, grupo, patch);
    await reload();
  }

  async function addExercicio(grupo: string, exercicioBibliotecaId: string) {
    if (!userId) return;
    await getDb().addExercicioAoTreino(userId, grupo, exercicioBibliotecaId);
    await reload();
  }

  async function removeExercicio(grupo: string, idx: number) {
    if (!userId) return;
    await getDb().removeExercicioDoTreino(userId, grupo, idx);
    await reload();
  }

  async function registrarSerie(grupo: string, exIdx: number, series: number, reps: number, carga: number, descanso: number) {
    if (!userId) return;
    await getDb().registrarSerie(userId, grupo, exIdx, series, reps, carga, descanso);
    await reload();
  }

  async function salvarDiaTreinoMap(map: DiaTreinoMap) {
    if (!userId) return;
    await getDb().setDiaTreinoMap(userId, map);
    await reload();
  }

  async function toggleConcluido(diaKey: string, grupo: string) {
    if (!userId) return;
    const datas = getDatasSemanaAtual();
    const chave = `${ymd(datas[diaKey as keyof typeof datas])}_${grupo}`;
    const jaConcluido = !!treinosConcluidos[chave];
    if (!jaConcluido) {
      if (totalSemana > 0 && concluidos >= totalSemana) {
        alert("Todos os treinos da semana já foram concluídos.");
        return;
      }
    }
    await getDb().setTreinoConcluido(userId, chave, !jaConcluido);
    await reload();
  }

  return {
    treinos,
    diaTreinoMap,
    treinosConcluidos,
    totalSemana,
    concluidos,
    loading,
    reload,
    addGrupo,
    removeGrupo,
    updateTreino,
    addExercicio,
    removeExercicio,
    registrarSerie,
    salvarDiaTreinoMap,
    toggleConcluido,
  };
}
