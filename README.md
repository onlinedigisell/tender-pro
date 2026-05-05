# Tender Pro

Tender and daily activity management app built with Next.js, Prisma, and Postgres.

## Local Setup

```bash
npm install
copy .env.example .env
npm run dev
```

For local development, set `DATABASE_URL` in `.env` to a Postgres database URL.

## Vercel Deployment

1. Create an online Postgres database using Supabase, Neon, or Vercel Postgres.
2. Copy the Postgres connection string.
3. In Vercel, open your project settings and add this environment variable:

```bash
DATABASE_URL=your_postgres_connection_string
```

4. Deploy the project from GitHub.
5. After the first deploy, run the database migration once:

```bash
npm run db:deploy
```

If you run migrations from your computer, make sure your local `.env` contains the same online `DATABASE_URL`.

## Useful Commands

```bash
npm run dev
npm run build
npm run db:deploy
```
