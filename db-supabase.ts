// lib/db-supabase.ts
// Implementação real da camada de dados usando Supabase.
// Ativa quando NEXT_PUBLIC_USE_SUPABASE=true.
// A interface é idêntica ao mockDb — componentes/hooks não percebem a troca.

import { supabase } from "./supabaseClient";
import { Database } from "./db";
import { DiaTreinoMap, Profile, Refeicao } from "./types";
import { DIAS_SEMANA_KEYS } from "./date";

function mapProfile(row: Record<string, unknown>): Profile {
  return {
    id: row.id as string,
    nome: row.nome as string,
    email: row.email as string,
    admin: row.admin as boolean,
    status: row.status as "active" | "blocked",
    teste: row.teste as boolean,
    expira: row.expira as string | null,
    coachNutri: row.coach_nutri as boolean,
    coachTrainer: row.coach_trainer as boolean,
  };
}

export const supabaseDb: Database = {
  async login(email, senha) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) return { error: error.message };
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();
    if (!profile) return { error: "Perfil não encontrado." };
    if (profile.status === "blocked") return { error: "Conta bloqueada. Contate o administrador." };
    return mapProfile(profile);
  },

  async signup(nome, email, senha) {
    const { data, error } = await supabase.auth.signUp({ email, password: senha });
    if (error) return { error: error.message };
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .insert({ id: data.user!.id, nome, email })
      .select()
      .single();
    if (profileError) return { error: profileError.message };
    return mapProfile(profile);
  },

  async logout() {
    await supabase.auth.signOut();
  },

  async listProfiles() {
    const { data } = await supabase.from("profiles").select("*").eq("admin", false);
    return (data ?? []).map(mapProfile);
  },

  async updateProfile(id, patch) {
    const dbPatch: Record<string, unknown> = {};
    if (patch.nome !== undefined) dbPatch.nome = patch.nome;
    if (patch.status !== undefined) dbPatch.status = patch.status;
    if (patch.teste !== undefined) dbPatch.teste = patch.teste;
    if (patch.coachNutri !== undefined) dbPatch.coach_nutri = patch.coachNutri;
    if (patch.coachTrainer !== undefined) dbPatch.coach_trainer = patch.coachTrainer;
    await supabase.from("profiles").update(dbPatch).eq("id", id);
  },

  async deleteProfile(id) {
    await supabase.from("profiles").delete().eq("id", id);
  },

  async getPesoHistorico(userId) {
    const { data } = await supabase
      .from("peso_historico")
      .select("*")
      .eq("user_id", userId)
      .order("data", { ascending: false });
    return (data ?? []).map((r) => ({ id: r.id, userId: r.user_id, data: r.data, peso: r.peso }));
  },

  async addPesoRegistro(userId, data, peso) {
    await supabase.from("peso_historico").insert({ user_id: userId, data, peso });
  },

  async removePesoRegistro(userId, registroId) {
    await supabase.from("peso_historico").delete().eq("id", registroId).eq("user_id", userId);
  },

  async getDadosCorporais(userId) {
    const { data } = await supabase.from("dados_corporais").select("*").eq("user_id", userId).single();
    if (!data) return { userId };
    return { userId, idade: data.idade, sexo: data.sexo, altura: data.altura };
  },

  async setDadoCorporal(userId, campo, valor) {
    const dbCampo = campo === "idade" ? "idade" : campo === "sexo" ? "sexo" : "altura";
    await supabase
      .from("dados_corporais")
      .upsert({ user_id: userId, [dbCampo]: valor }, { onConflict: "user_id" });
  },

  async getTreinos(userId) {
    const { data: treinosData } = await supabase.from("treinos").select("*, treino_exercicios(*, series_registradas(*))").eq("user_id", userId);
    const result: Record<string, import("./types").Treino> = {};
    for (const t of treinosData ?? []) {
      result[t.id] = {
        id: t.id,
        userId,
        nome: t.nome,
        observacao: t.observacao,
        exercicios: (t.treino_exercicios ?? []).sort((a: { ordem: number }, b: { ordem: number }) => a.ordem - b.ordem).map((e: Record<string, unknown>) => ({
          exercicioId: e.exercicio_biblioteca_id as string,
          nome: e.nome as string,
          grupoMuscular: e.grupo_muscular as string,
          seriesPadrao: e.series_padrao as number | undefined,
          repsMin: e.reps_min as number | undefined,
          repsMax: e.reps_max as number | undefined,
          descansoPadrao: e.descanso_padrao as number,
          series: ((e.series_registradas as Record<string, unknown>[]) ?? []).map((s) => ({
            series: s.series as number,
            reps: s.reps as number,
            carga: s.carga as number,
            descanso: s.descanso as number,
            data: s.data as string,
          })),
        })),
      };
    }
    return result;
  },

  async addGrupoTreino(userId) {
    const { data } = await supabase.from("treinos").select("id").eq("user_id", userId);
    const ativos = (data ?? []).map((t: { id: string }) => t.id);
    const alfabeto = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let letra = "A";
    for (const c of alfabeto) {
      if (!ativos.includes(c)) { letra = c; break; }
    }
    await supabase.from("treinos").insert({ id: letra, user_id: userId, nome: "", observacao: "" });
    return letra;
  },

  async removeGrupoTreino(userId, grupo) {
    const { count } = await supabase.from("treinos").select("id", { count: "exact" }).eq("user_id", userId);
    if ((count ?? 0) <= 1) throw new Error("Você precisa manter ao menos um treino cadastrado.");
    await supabase.from("treinos").delete().eq("user_id", userId).eq("id", grupo);
    await supabase.from("dia_treino_map").update({ treino_grupo: null }).eq("user_id", userId).eq("treino_grupo", grupo);
  },

  async updateTreino(userId, grupo, patch) {
    const dbPatch: Record<string, unknown> = {};
    if (patch.nome !== undefined) dbPatch.nome = patch.nome;
    if (patch.observacao !== undefined) dbPatch.observacao = patch.observacao;
    await supabase.from("treinos").update(dbPatch).eq("user_id", userId).eq("id", grupo);
  },

  async addExercicioAoTreino(userId, grupo, exercicioBibliotecaId) {
    const { data: ex } = await supabase.from("exercicios_biblioteca").select("*").eq("id", exercicioBibliotecaId).single();
    if (!ex) return;
    const { count } = await supabase.from("treino_exercicios").select("id", { count: "exact" }).eq("user_id", userId).eq("treino_grupo", grupo);
    await supabase.from("treino_exercicios").insert({
      user_id: userId, treino_grupo: grupo,
      exercicio_biblioteca_id: exercicioBibliotecaId,
      nome: ex.nome, grupo_muscular: ex.grupo_muscular,
      series_padrao: ex.series_padrao, reps_min: ex.reps_min, reps_max: ex.reps_max,
      descanso_padrao: ex.descanso_padrao, ordem: count ?? 0,
    });
  },

  async removeExercicioDoTreino(userId, grupo, exercicioIndex) {
    const { data } = await supabase.from("treino_exercicios").select("id").eq("user_id", userId).eq("treino_grupo", grupo).order("ordem");
    const row = (data ?? [])[exercicioIndex];
    if (row) await supabase.from("treino_exercicios").delete().eq("id", row.id);
  },

  async registrarSerie(userId, grupo, exercicioIndex, series, reps, carga, descanso) {
    const { data } = await supabase.from("treino_exercicios").select("id").eq("user_id", userId).eq("treino_grupo", grupo).order("ordem");
    const row = (data ?? [])[exercicioIndex];
    if (!row) return;
    const hoje = new Date();
    const data_str = `${hoje.getFullYear()}-${String(hoje.getMonth()+1).padStart(2,"0")}-${String(hoje.getDate()).padStart(2,"0")}`;
    await supabase.from("series_registradas").insert({ treino_exercicio_id: row.id, user_id: userId, series, reps, carga, descanso, data: data_str });
  },

  async getBibliotecaExercicios(userId) {
    const { data } = await supabase.from("exercicios_biblioteca").select("*, exercicio_midia(*)").eq("user_id", userId);
    return (data ?? []).map((e: Record<string, unknown>) => ({
      id: e.id as string, userId, nome: e.nome as string, grupoMuscular: e.grupo_muscular as string,
      seriesPadrao: e.series_padrao as number | undefined, repsMin: e.reps_min as number | undefined,
      repsMax: e.reps_max as number | undefined, descansoPadrao: e.descanso_padrao as number,
      midias: ((e.exercicio_midia as Record<string, unknown>[]) ?? []).map((m) => ({ tipo: m.tipo as "foto" | "video", url: m.url as string })),
    }));
  },

  async addExercicioBiblioteca(userId, exercicio) {
    await supabase.from("exercicios_biblioteca").insert({
      user_id: userId, nome: exercicio.nome, grupo_muscular: exercicio.grupoMuscular,
      series_padrao: exercicio.seriesPadrao, reps_min: exercicio.repsMin,
      reps_max: exercicio.repsMax, descanso_padrao: exercicio.descansoPadrao,
    });
  },

  async removeExercicioBiblioteca(userId, exercicioId) {
    await supabase.from("exercicios_biblioteca").delete().eq("id", exercicioId).eq("user_id", userId);
  },

  async addMidiaExercicio(userId, exercicioId, tipo, url) {
    await supabase.from("exercicio_midia").insert({ exercicio_id: exercicioId, user_id: userId, tipo, url });
  },

  async removeMidiaExercicio(userId, exercicioId, tipo, midiaIndex) {
    const { data } = await supabase.from("exercicio_midia").select("id").eq("exercicio_id", exercicioId).eq("tipo", tipo);
    const row = (data ?? [])[midiaIndex];
    if (row) await supabase.from("exercicio_midia").delete().eq("id", row.id);
  },

  async getDiaTreinoMap(userId) {
    const { data } = await supabase.from("dia_treino_map").select("*").eq("user_id", userId);
    const map = {} as DiaTreinoMap;
    DIAS_SEMANA_KEYS.forEach((k) => (map[k] = null));
    for (const row of data ?? []) map[row.dia as keyof DiaTreinoMap] = row.treino_grupo;
    return map;
  },

  async setDiaTreinoMap(userId, map) {
    const rows = DIAS_SEMANA_KEYS.map((dia) => ({ user_id: userId, dia, treino_grupo: map[dia] }));
    await supabase.from("dia_treino_map").upsert(rows, { onConflict: "user_id,dia" });
  },

  async getTreinosConcluidos(userId) {
    const { data } = await supabase.from("treinos_concluidos").select("*").eq("user_id", userId);
    const result: Record<string, boolean> = {};
    for (const row of data ?? []) result[row.chave] = row.concluido;
    return result;
  },

  async setTreinoConcluido(userId, chave, concluido) {
    await supabase.from("treinos_concluidos").upsert({ user_id: userId, chave, concluido }, { onConflict: "user_id,chave" });
  },

  async getRefeicoes(userId) {
    const { data } = await supabase.from("refeicoes").select("*, refeicao_alimentos(*)").eq("user_id", userId).order("ordem");
    return (data ?? []).map((r: Record<string, unknown>) => ({
      id: r.id as string, userId, nome: r.nome as string, concluida: r.concluida as boolean,
      alimentos: ((r.refeicao_alimentos as Record<string, unknown>[]) ?? []).map((a) => ({
        nomeTaco: a.nome_taco as string, gramas: a.gramas as number, fatorCoccao: a.fator_coccao as number,
        medidaLabel: a.medida_label as string, kcal: a.kcal as number, proteina: a.proteina as number,
        carboidrato: a.carboidrato as number, gordura: a.gordura as number,
      })),
    })) as Refeicao[];
  },

  async addRefeicao(userId) {
    const { count } = await supabase.from("refeicoes").select("id", { count: "exact" }).eq("user_id", userId);
    const n = (count ?? 0) + 1;
    await supabase.from("refeicoes").insert({ user_id: userId, nome: `Ref ${n}`, ordem: n });
  },

  async removeRefeicao(userId, refeicaoId) {
    await supabase.from("refeicoes").delete().eq("id", refeicaoId).eq("user_id", userId);
  },

  async toggleRefeicaoConcluida(userId, refeicaoId) {
    const { data } = await supabase.from("refeicoes").select("concluida").eq("id", refeicaoId).single();
    if (data) await supabase.from("refeicoes").update({ concluida: !data.concluida }).eq("id", refeicaoId);
  },

  async addAlimentoRefeicao(userId, refeicaoId, alimento) {
    await supabase.from("refeicao_alimentos").insert({
      refeicao_id: refeicaoId, nome_taco: alimento.nomeTaco, gramas: alimento.gramas,
      fator_coccao: alimento.fatorCoccao, medida_label: alimento.medidaLabel,
      kcal: alimento.kcal, proteina: alimento.proteina, carboidrato: alimento.carboidrato, gordura: alimento.gordura,
    });
  },

  async removeAlimentoRefeicao(userId, refeicaoId, alimentoIndex) {
    const { data } = await supabase.from("refeicao_alimentos").select("id").eq("refeicao_id", refeicaoId).order("ordem");
    const row = (data ?? [])[alimentoIndex];
    if (row) await supabase.from("refeicao_alimentos").delete().eq("id", row.id);
  },

  async getDietaObs(userId) {
    const { data } = await supabase.from("dieta_obs").select("obs").eq("user_id", userId).single();
    return data?.obs ?? "";
  },

  async setDietaObs(userId, obs) {
    await supabase.from("dieta_obs").upsert({ user_id: userId, obs }, { onConflict: "user_id" });
  },
};
