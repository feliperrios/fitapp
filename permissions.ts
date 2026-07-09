// lib/permissions.ts
// Regras de permissão por tipo de coach.
// - coachNutri trava edição de Dados Corporais e Dieta.
// - coachTrainer trava edição de Treinos.
// - Sem nenhum coach, o próprio usuário edita tudo livremente.
// - Com ambos, cada coach trava sua área correspondente (não há prioridade
//   entre eles: nutri nunca trava treino, trainer nunca trava dieta/dados).

import { Profile } from "./types";

export function canEditDadosCorporais(user: Profile | null): boolean {
  if (!user) return false;
  return !user.coachNutri;
}

export function canEditTreinos(user: Profile | null): boolean {
  if (!user) return false;
  return !user.coachTrainer;
}

export function canEditDieta(user: Profile | null): boolean {
  if (!user) return false;
  return !user.coachNutri;
}

export function readonlyReason(
  user: Profile | null,
  area: "dados" | "treinos" | "dieta"
): string | null {
  if (!user) return null;
  if (area === "dados" && user.coachNutri) return "Nutricionista";
  if (area === "dieta" && user.coachNutri) return "Nutricionista";
  if (area === "treinos" && user.coachTrainer) return "Treinador";
  return null;
}
