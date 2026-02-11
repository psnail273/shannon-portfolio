# CLAUDE.md

## Project Overview

Shannon's Portfolio - a password-protected Next.js 16 portfolio site showcasing design work. Uses App Router, React 19, TypeScript.

## Commands

- `npm run dev` - start dev server (http://localhost:3000)
- `npm run build` - production build
- `npm run lint` - run ESLint

## Architecture

- **App Router**: Pages in `app/`, components in `components/`, utilities in `lib/`
- **Auth**: Password-gated at root layout level. HMAC-signed tokens stored in cookies (1hr expiry). See `lib/auth.ts` and `app/api/password/route.ts`.
- **Database**: Neon serverless Postgres via `@neondatabase/serverless`. Queries in `lib/db.ts`.
- **Images**: Hosted on Cloudinary, loaded via custom Next.js image loader (`lib/cloudinary-loader.ts`).
- **Styling**: Tailwind CSS v4 + MUI v7 components. Font: Playfair Display (Google Fonts).
- **Path aliases**: `@/*` maps to project root (e.g., `@/components/...`, `@/lib/...`).

## Code Style

- 2-space indentation
- Single quotes
- Object curly brace spacing: `{ value }` not `{value}`
- JSX curly brace spacing: `{ value }` with spaces
- Component files use kebab-case in kebab-case directories (e.g., `components/galleryItem/galleryItem.tsx`)
- ESLint config: `eslint.config.mjs` with `@stylistic/eslint-plugin`

## Environment Variables

- `DATABASE_URL` - Neon Postgres connection string (required)
- `AUTH_SECRET` - Secret for signing auth tokens (falls back to PASSWORD)
- `PASSWORD` - Site login password
- `NEXT_PUBLIC_DEV_MODE` - Shows dev banner when "true"
- `NEXT_PUBLIC_SITE_URL` - Base URL for metadata

## Deployment

Docker multi-stage build with standalone output. Deployed via Gitea Actions (`.gitea/workflows/dev.yaml`) on push to `dev` branch. Secrets are mounted during build, not baked into the image.

## Git Workflow

- `main` - production branch
- `dev` - development branch, triggers CI/CD
