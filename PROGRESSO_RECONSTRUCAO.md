# FLAG DE PROGRESSO — Reconstrução FitApp (Next.js + Supabase-ready)

## ⚠️ AVISO IMPORTANTE
O sandbox de execução já foi resetado uma vez durante esta reconstrução,
perdendo todos os arquivos criados até então (mas não o conteúdo — estava
tudo já decidido e documentado, então foi só reescrito). Caso isso aconteça
de novo: NÃO é preciso redecidir nada, só recriar os arquivos dos blocos
marcados [x] usando exatamente as mesmas especificações abaixo, e continuar
do primeiro bloco marcado [ ].

## OBJETIVO
Recriar o FitApp como projeto Next.js real (App Router), com componentes
separados, rotas, lógica isolada em hooks/lib, e camada de dados já desenhada
para Supabase (mesmo rodando hoje em mock local). NÃO é HTML estático.
Ao final: empacotar tudo em ZIP.

## STACK
- Next.js 14 (App Router) + React + TypeScript
- Tailwind CSS (tema dark, accent #1D9E75)
- lib/db.ts = interface abstrata; lib/db-mock.ts = implementação ativa hoje;
  lib/db-supabase.ts = implementação real, pronta, inativa por padrão
  (liga via NEXT_PUBLIC_USE_SUPABASE=true)

## ESTRUTURA PLANEJADA
```
fitapp-next/
├── package.json / tsconfig.json / tailwind.config.ts / next.config.js / postcss.config.js / .env.example / README.md
├── supabase/schema.sql
├── lib/
│   ├── types.ts / date.ts / permissions.ts / db.ts / db-mock.ts / db-supabase.ts / supabaseClient.ts
├── components/
│   ├── ui/ (Button, Card, Modal, Input, Toggle)
│   ├── auth/ (LoginForm, SignupForm, WelcomeDialog)
│   ├── home/ (HomeHeader, CaloriesCard, WorkoutWeekCard, DietMiniCard, WeekDaysCard, WeightChartCard)
│   ├── dados/ (BodyDataForm, WeightHistory)
│   ├── treinos/ (WorkoutList, WorkoutCard, ExerciseRow, ExerciseLibrary, DayTreinoConfigModal, ExerciseMediaModal)
│   ├── dieta/ (MealList, MealCard, TacoSearchModal, ShoppingListModal, DietObsCard)
│   └── admin/ (UserList, UserCard, AdminStats)
├── app/ (layout.tsx, globals.css, page.tsx=login, home/page.tsx, dados/page.tsx, treinos/page.tsx, dieta/page.tsx, admin/page.tsx)
├── hooks/ (useAuth.ts, useTreinos.ts, useDieta.ts, useDadosCorporais.ts)
└── data/taco.json
```

## PROGRESSO POR BLOCO

- [x] BLOCO 1 — Config raiz (package.json, tsconfig, tailwind, next.config, postcss.config, .env.example, README) — RECRIANDO AGORA
- [x] BLOCO 2 — lib/types.ts + lib/date.ts + lib/permissions.ts + lib/db.ts (interface) + lib/db-mock.ts — RECRIANDO AGORA
- [ ] BLOCO 3 — supabase/schema.sql + lib/supabaseClient.ts + lib/db-supabase.ts
- [ ] BLOCO 4 — components/ui/* (Button, Card, Modal, Input, Toggle, Chip)
- [ ] BLOCO 5 — components/auth/* + app/page.tsx (login) + app/layout.tsx + app/globals.css
- [ ] BLOCO 6 — components/home/* + app/home/page.tsx + hooks/useAuth.ts
- [ ] BLOCO 7 — components/dados/* + app/dados/page.tsx + hooks/useDadosCorporais.ts
- [ ] BLOCO 8 — components/treinos/* + app/treinos/page.tsx + hooks/useTreinos.ts (treinos dinâmicos + config dia->treino + mídia exercício)
- [ ] BLOCO 9 — components/dieta/* + app/dieta/page.tsx + hooks/useDieta.ts + data/taco.json
- [ ] BLOCO 10 — components/admin/* + app/admin/page.tsx
- [ ] BLOCO 11 — Revisão final + ZIP

## REGRAS DE NEGÓCIO A PRESERVAR
1. Permissões: coachNutri trava Dados Corporais + Dieta; coachTrainer trava Treinos.
2. Datas: SEMPRE usar ymd() local (lib/date.ts), NUNCA toISOString() para chaves de calendário/UI.
3. Meta semanal de treinos = quantos dias foram configurados manualmente no
   mapeamento dia->treino (NÃO é "quantidade de treinos cadastrados"). Pode ser 0/0.
4. Bloqueio real (não só visual) ao tentar concluir mais treinos do que o total configurado.
5. Treinos dinâmicos: adicionar (próxima letra livre) e remover (confirm, bloqueia se for o último).
6. Card de Dieta na home vem ANTES do card de Dias da semana.
7. Card de calorias na home NÃO mostra meta, só o total consumido.
8. Cadastro de exercício: séries + reps mín/máx + descanso padrão.
9. Mídia (foto/vídeo) por exercício: hoje aceita URL colada; estrutura pronta para
   upload real + Supabase Storage (bucket "exercicios-midia").
10. scrollTop() ao salvar refeição/alimento/concluir e ao abrir formulários de treino.
11. Cards colapsáveis: dias da semana, dieta, evolução, treinos, histórico.
12. Versionamento no rodapé do login: fallback estático hoje, GitHub real pendente.

## COMO RETOMAR SE TRAVAR / RESETAR DE NOVO
1. Verificar quais arquivos REALMENTE existem em /home/claude/fitapp-next/ (não confiar na memória da conversa).
2. Continuar a partir do primeiro bloco [ ] desta lista.
3. Usar as especificações de tipos/regras acima — não é preciso reabrir decisões já tomadas.
