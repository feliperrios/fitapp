# FitApp

App de fitness (treinos, dieta, dados corporais) com permissões de coach (nutricionista/treinador), construído em **Next.js 14 (App Router) + TypeScript + Tailwind**.

## Stack

- Next.js 14 / React 18 / TypeScript
- Tailwind CSS (tema dark, accent `#1D9E75`)
- Camada de dados abstrata (`lib/db.ts`): hoje rodando em **mock local** (`lib/db-mock.ts`), pronta para trocar por **Supabase** (`lib/db-supabase.ts`) sem alterar nenhum componente — só liga a env var.

## Rodando localmente

```bash
npm install
npm run dev
```

Abra http://localhost:3000

## Ligar o Supabase

1. Copie `.env.example` para `.env.local`.
2. Crie um projeto em supabase.com, rode `supabase/schema.sql` no SQL Editor.
3. Preencha `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Mude `NEXT_PUBLIC_USE_SUPABASE=true`.
5. Reinicie o servidor.

A troca é transparente: `lib/db.ts` exporta a implementação correta de acordo com essa env var, e todos os componentes/hooks usam só essa interface.

## Estrutura

```
app/            # rotas (App Router): login, home, dados, treinos, dieta, admin
components/     # componentes de UI, organizados por área
hooks/          # lógica de estado por domínio (useAuth, useTreinos, useDieta...)
lib/            # tipos, permissões, camada de dados, cliente Supabase
data/           # dados estáticos (tabela TACO simplificada)
supabase/       # schema.sql para criar as tabelas reais
```

## Deploy no Vercel

1. Suba este repositório para o GitHub.
2. No Vercel: **New Project** → importe o repositório → Framework: **Next.js** (detecta automático).
3. Configure as env vars (mesmas do `.env.example`) em **Settings → Environment Variables**.
4. Deploy.

## Regras de negócio importantes

- **Permissões**: `coachNutri` trava edição de Dados Corporais e Dieta; `coachTrainer` trava edição de Treinos. Ver `lib/permissions.ts`.
- **Datas**: todo cálculo de dia/semana usa data **local** (nunca `toISOString()`, que desloca o dia em fusos negativos). Ver `lib/date.ts`.
- **Meta semanal de treinos**: o total exibido vem de quantos dias da semana foram **manualmente vinculados** a um treino (tela "Configurar dias"), não da quantidade de treinos cadastrados. Pode legitimamente ser `0/0`.
- **Treinos são dinâmicos**: o usuário pode adicionar/remover treinos (grupos), sempre mantendo ao menos 1.

Ver `PROGRESSO_RECONSTRUCAO.md` para o histórico completo de decisões.
