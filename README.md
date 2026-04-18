# Office Computer Inventory

A web app for tracking office computer assets. Built with Next.js 14, TypeScript, TailwindCSS, and Supabase.

## Setup

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the database to provision (~2 minutes)

### 2. Run the database schema

1. In your Supabase project, go to **SQL Editor**
2. Open `supabase/schema.sql` from this repo
3. Paste the contents and click **Run**

This creates the `computers` table, indexes, RLS policies, and optional sample data.

### 3. Get your API keys

In your Supabase project, go to **Settings > API** and copy:
- **Project URL** (`https://xxxx.supabase.co`)
- **anon / public key**

### 4. Configure environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Install dependencies

```bash
npm install
```

### 6. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) and import the repository
3. Add the two environment variables in Vercel's project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy**

Vercel auto-detects Next.js — no build configuration needed.

---

## Features

- **Inventory list** — sortable table with search and status filter
- **Summary cards** — live count of total, active, maintenance, and retired machines
- **Add / Edit forms** — validated forms with dropdowns for brand, OS, and status
- **Delete with confirmation** — confirm dialog before removal
- **Status badges** — color-coded Active (green), Maintenance (yellow), Retired (red)
- **Responsive** — works on mobile and desktop

## Project structure

```
app/
  layout.tsx          # Root layout with nav header
  page.tsx            # Inventory list (client component)
  globals.css         # Tailwind base + component classes
  add/
    page.tsx          # Add computer page
  edit/[id]/
    page.tsx          # Edit computer page (server component, fetches by ID)
components/
  ComputerForm.tsx    # Reusable add/edit form (client component)
  StatusBadge.tsx     # Colored status pill
lib/
  supabase.ts         # Supabase client singleton
  types.ts            # TypeScript interfaces
supabase/
  schema.sql          # Database schema + RLS policies
```
