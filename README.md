# GenTask

SaaS de gestão de tarefas com foco em **Detalhe da Tarefa + Activity Feed**, construído com:

- Next.js 15 + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (Auth + Postgres + Storage)
- TanStack Query
- Zod
- Vitest + Testing Library + Playwright
- Deploy na Vercel

## Funcionalidades

- Auth com Supabase (`signup`, `login`, `logout`)
- Multi-tenant por workspace com papéis `admin` e `member`
- Projects + tarefas com status, prioridade, responsável, `due date`, labels e checklist
- Comentários e anexos por tarefa
- Activity timeline por tarefa (`actor`, `eventType`, `old/new`, `createdAt`)
- Layout responsivo desktop/mobile

## Estrutura

- `app/`: rotas Next.js App Router
- `components/`: UI e blocos de domínio (task/activity/comments)
- `hooks/`: hooks com TanStack Query
- `lib/`: clients Supabase, utils e validações Zod
- `supabase/migrations`: migrations versionadas com RLS/policies
- `supabase/seed.sql`: seed inicial

## Variáveis de ambiente

Copie `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

Preencha:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_NAME` (default `GenTask`)
- `NEXT_PUBLIC_SITE_URL` (para redirects locais)

## Scripts

```bash
npm run dev
npm run lint
npm run test:unit
npm run test:e2e
npm run test
npm run build
```

## Setup local

1. Instale dependências:

```bash
npm ci
```

2. Rode a aplicação:

```bash
npm run dev
```

3. Acesse `http://localhost:3000`.

## Supabase: banco, migrations, RLS e seed

1. Crie um projeto no Supabase.
2. No SQL Editor, aplique as migrations na ordem:
   - `supabase/migrations/20260301110000_initial_schema.sql`
   - `supabase/migrations/20260301111000_rls_policies.sql`
   - `supabase/migrations/20260301112000_storage.sql`
   - `supabase/migrations/20260301113000_activity_triggers.sql`
3. Execute `supabase/seed.sql` para popular workspace/projeto/tarefa inicial.
4. Em **Authentication > Providers**, habilite Email/Password.
5. Em **Storage**, confirme bucket `task-attachments`.

## Deploy na Vercel (produção)

1. Publique o repositório no GitHub.
2. Na Vercel, clique em **Add New Project** e conecte o repositório `GenTask`.
3. Em **Environment Variables**, configure:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_NAME=GenTask`
   - `NEXT_PUBLIC_SITE_URL=https://SEU-DOMINIO.vercel.app`
4. Garanta que o build command é `npm run build`.
5. Faça deploy.
6. Após deploy, valide login/signup e página `/app/tasks/:id`.

## CI/CD

Pipeline GitHub Actions em `.github/workflows/ci.yml` com etapas:

1. Install (`npm ci`)
2. Lint (`npm run lint`)
3. Test (`npm run test`)
4. Build (`npm run build`)

## Observações técnicas

- RLS habilitado em todas as tabelas multi-tenant.
- Policies por `workspace_id` e papel de membro.
- Storage protegido por path `workspace_id/task_id/file`.
- Sem `any` explícito no código da aplicação.
