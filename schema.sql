-- supabase/schema.sql
-- Execute este arquivo no SQL Editor do Supabase para criar todas as tabelas.
-- Habilite Row Level Security (RLS) em produção conforme as políticas abaixo.

-- ============================================================
-- PROFILES
-- ============================================================
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text unique not null,
  admin boolean not null default false,
  status text not null default 'active' check (status in ('active','blocked')),
  teste boolean not null default false,
  expira date,
  coach_nutri boolean not null default false,
  coach_trainer boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- PESO HISTÓRICO
-- ============================================================
create table if not exists peso_historico (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  data date not null,
  peso numeric(5,2) not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- DADOS CORPORAIS
-- ============================================================
create table if not exists dados_corporais (
  user_id uuid primary key references profiles(id) on delete cascade,
  idade text,
  sexo text,
  altura text
);

-- ============================================================
-- BIBLIOTECA DE EXERCÍCIOS
-- ============================================================
create table if not exists exercicios_biblioteca (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  nome text not null,
  grupo_muscular text not null,
  series_padrao int,
  reps_min int,
  reps_max int,
  descanso_padrao int not null default 60,
  created_at timestamptz not null default now()
);

-- ============================================================
-- MÍDIA DE EXERCÍCIO
-- Bucket Supabase Storage: "exercicios-midia"
-- Path sugerido: {user_id}/{exercicio_id}/{timestamp}-{filename}
-- ============================================================
create table if not exists exercicio_midia (
  id uuid primary key default gen_random_uuid(),
  exercicio_id uuid not null references exercicios_biblioteca(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  tipo text not null check (tipo in ('foto','video')),
  url text not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- TREINOS (grupos dinâmicos A, B, C...)
-- ============================================================
create table if not exists treinos (
  id text not null,          -- letra do grupo: 'A', 'B'...
  user_id uuid not null references profiles(id) on delete cascade,
  nome text not null default '',
  observacao text not null default '',
  primary key (user_id, id)
);

-- ============================================================
-- EXERCÍCIOS NO TREINO
-- ============================================================
create table if not exists treino_exercicios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  treino_grupo text not null,
  exercicio_biblioteca_id uuid references exercicios_biblioteca(id) on delete set null,
  nome text not null,
  grupo_muscular text not null,
  series_padrao int,
  reps_min int,
  reps_max int,
  descanso_padrao int not null default 60,
  ordem int not null default 0,
  foreign key (user_id, treino_grupo) references treinos(user_id, id) on delete cascade
);

-- ============================================================
-- SÉRIES REGISTRADAS
-- ============================================================
create table if not exists series_registradas (
  id uuid primary key default gen_random_uuid(),
  treino_exercicio_id uuid not null references treino_exercicios(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  series int not null,
  reps int not null,
  carga numeric(6,2) not null,
  descanso int not null default 0,
  data date not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- MAPEAMENTO DIA DA SEMANA -> TREINO
-- ============================================================
create table if not exists dia_treino_map (
  user_id uuid not null references profiles(id) on delete cascade,
  dia text not null check (dia in ('seg','ter','qua','qui','sex','sab','dom')),
  treino_grupo text,   -- null = descanso
  primary key (user_id, dia)
);

-- ============================================================
-- TREINOS CONCLUÍDOS
-- Chave: YYYY-MM-DD_GRUPO (ex: "2026-07-01_A")
-- ============================================================
create table if not exists treinos_concluidos (
  user_id uuid not null references profiles(id) on delete cascade,
  chave text not null,  -- "YYYY-MM-DD_GRUPO"
  concluido boolean not null default true,
  primary key (user_id, chave)
);

-- ============================================================
-- REFEIÇÕES
-- ============================================================
create table if not exists refeicoes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  nome text not null,
  concluida boolean not null default false,
  ordem int not null default 0,
  created_at timestamptz not null default now()
);

-- ============================================================
-- ALIMENTOS NAS REFEIÇÕES
-- ============================================================
create table if not exists refeicao_alimentos (
  id uuid primary key default gen_random_uuid(),
  refeicao_id uuid not null references refeicoes(id) on delete cascade,
  nome_taco text not null,
  gramas numeric(7,2) not null,
  fator_coccao numeric(5,3) not null default 1,
  medida_label text not null,
  kcal numeric(7,2) not null,
  proteina numeric(7,2) not null,
  carboidrato numeric(7,2) not null,
  gordura numeric(7,2) not null,
  ordem int not null default 0
);

-- ============================================================
-- OBSERVAÇÕES DE DIETA
-- ============================================================
create table if not exists dieta_obs (
  user_id uuid primary key references profiles(id) on delete cascade,
  obs text not null default ''
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) — habilitar em produção
-- ============================================================
-- alter table profiles enable row level security;
-- alter table peso_historico enable row level security;
-- alter table dados_corporais enable row level security;
-- alter table exercicios_biblioteca enable row level security;
-- alter table exercicio_midia enable row level security;
-- alter table treinos enable row level security;
-- alter table treino_exercicios enable row level security;
-- alter table series_registradas enable row level security;
-- alter table dia_treino_map enable row level security;
-- alter table treinos_concluidos enable row level security;
-- alter table refeicoes enable row level security;
-- alter table refeicao_alimentos enable row level security;
-- alter table dieta_obs enable row level security;

-- Exemplo de política (repetir para cada tabela com user_id):
-- create policy "Usuário vê apenas seus próprios dados"
--   on peso_historico for all
--   using (auth.uid() = user_id);
