// lib/types.ts
// Tipos centrais do FitApp. Espelham as tabelas que existirão no Supabase.

export interface Profile {
  id: string;
  nome: string;
  email: string;
  admin: boolean;
  status: "active" | "blocked";
  teste: boolean;
  expira: string | null; // YYYY-MM-DD
  coachNutri: boolean;
  coachTrainer: boolean;
}

export interface PesoRegistro {
  id: string;
  userId: string;
  data: string; // YYYY-MM-DD
  peso: number;
}

export interface DadosCorporais {
  userId: string;
  idade?: string;
  sexo?: string;
  altura?: string;
}

export interface ExercicioMidia {
  tipo: "foto" | "video";
  url: string;
}

export interface ExercicioBiblioteca {
  id: string;
  userId: string;
  nome: string;
  grupoMuscular: string;
  seriesPadrao?: number;
  repsMin?: number;
  repsMax?: number;
  descansoPadrao: number; // segundos
  midias: ExercicioMidia[];
}

export interface SerieRegistrada {
  series: number;
  reps: number;
  carga: number;
  descanso: number;
  data: string; // YYYY-MM-DD
}

export interface ExercicioTreino {
  exercicioId: string;
  nome: string;
  grupoMuscular: string;
  seriesPadrao?: number;
  repsMin?: number;
  repsMax?: number;
  descansoPadrao: number;
  series: SerieRegistrada[];
}

export interface Treino {
  id: string; // letra do grupo: 'A', 'B'...
  userId: string;
  nome: string;
  observacao: string;
  exercicios: ExercicioTreino[];
}

export type DiaSemanaKey = "seg" | "ter" | "qua" | "qui" | "sex" | "sab" | "dom";

export type DiaTreinoMap = Record<DiaSemanaKey, string | null>; // null = descanso

export interface AlimentoRefeicao {
  nomeTaco: string;
  gramas: number;
  fatorCoccao: number;
  medidaLabel: string;
  kcal: number;
  proteina: number;
  carboidrato: number;
  gordura: number;
}

export interface Refeicao {
  id: string;
  userId: string;
  nome: string;
  alimentos: AlimentoRefeicao[];
  concluida: boolean;
}

export interface TacoAlimento {
  nome: string;
  categoria: string;
  kcal: number;
  proteina: number;
  carboidrato: number;
  gordura: number;
  fatorCoccao: number;
}

export interface MetasNutricionais {
  kcal: number;
  proteina: number;
  carboidrato: number;
  gordura: number;
}
