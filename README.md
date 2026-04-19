# HireFlow AI v2

Cloud-ready Bangladesh media recruitment workspace built with Next.js, TypeScript, and Supabase.

## What is included

- Dashboard with truthful live metrics
- Jobs and watchlists
- Candidate pool with explainable score summaries
- Pipeline board
- Outreach templates and draft generation
- Compliant imports for manual social leads, resumes, CSV, GitHub public profiles, and public URLs
- Quick import with smart text parsing
- Job board aggregation from Bangladesh sources
- Real-time updates via Supabase
- Email notifications
- User authentication

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `DATABASE_URL` - PostgreSQL connection string (optional)
- `HIREFLOW_CRON_SECRET` - Secret for cron jobs

## Deployment to Vercel

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables in Vercel dashboard

3. **Environment Variables in Vercel:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   HIREFLOW_CRON_SECRET=your-secure-secret
   ```

4. **Deploy:**
   - Vercel will automatically build and deploy

## Supabase Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)

2. Run the migration in `supabase/migrations/0001_init.sql` in your Supabase SQL Editor

3. Enable Authentication:
   - Go to Authentication > Providers
   - Enable Email provider

4. (Optional) Set up Storage:
   - Go to Storage
   - Create a new bucket for uploads

## Cron Jobs

The app includes a daily cron job that runs at 9 AM every day to refresh watchlists and rescores candidates.

Configure in `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/daily-refresh",
      "schedule": "0 9 * * *"
    }
  ]
}
```

## Tech Stack

- Next.js 16
- TypeScript
- Tailwind CSS v4
- Supabase (Auth, Database, Realtime)
- Zod for validation
- date-fns

## Notes

- Social platforms are handled through manual lead capture, not hidden scraping.
- Contact extraction is limited to candidate-provided or approved public sources.
- All data collection complies with platform terms and privacy laws.