# Architecture Memory

- Frontend: Next.js App Router, TypeScript, Tailwind
- Persistence: Supabase Postgres when `DATABASE_URL` is configured, local JSON fallback otherwise
- Current live adapter: workspace JSON state persisted in Postgres `workspace_state`
- Target evolution: gradually map the live app from workspace-state persistence to the relational schema in `supabase/migrations`
