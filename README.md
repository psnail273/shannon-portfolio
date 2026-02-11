# Shannon's Portfolio

A portfolio website built for my friend Shannon to showcase their design work. The site is password-protected and features an image gallery with project pages, filterable by design type.

## Tech Stack

- **Next.js 16** (App Router) with **React 19** and **TypeScript**
- **Tailwind CSS v4** + **MUI v7** for styling/components
- **Motion** for animations
- **Neon** serverless Postgres database
- **Cloudinary** for image hosting/optimization
- **Docker** for containerized deployment

## Project Structure

```
app/
  (home)/page.tsx      # Home page with gallery
  about/page.tsx       # About page
  contact/page.tsx     # Contact page
  designs/[slug]/      # Dynamic project detail pages
  api/password/        # Auth API endpoint
  layout.tsx           # Root layout with auth gate
components/            # Reusable UI components
lib/
  auth.ts              # HMAC token-based authentication
  db.ts                # Neon DB queries (images, projects)
  cloudinary-loader.ts # Next.js custom image loader
  types.ts             # TypeScript types
  pages.ts             # Page definitions
```

## Development

```bash
npm install
npm run dev
```

The site will be available at http://localhost:3000.

### Environment Variables

Create a `.env.local` file:

```
DATABASE_URL=postgres://user:password@your-neon-host/dbname
AUTH_SECRET=your-secret-key
PASSWORD=site-password
```

### Linting

```bash
npm run lint
```

Uses ESLint with `eslint-config-next` and `@stylistic/eslint-plugin` (2-space indent, single quotes, enforced curly brace spacing).

## Database

This project uses [Neon](https://neon.tech) as a serverless Postgres database. The schema has three tables:

- `images` - gallery images with metadata (src, alt, slug, types, dimensions)
- `project` - design projects with descriptions
- `project_image` - join table linking projects to their images

Images are served from Cloudinary via a custom Next.js image loader.

## Deployment

A Gitea Actions workflow (`.gitea/workflows/dev.yaml`) handles CI/CD. On push to the `dev` branch, it:

1. Builds a Docker image (multi-stage, standalone output)
2. Pushes it to the private registry at `git.stuffworks.net`
3. Deploys the container on the `caddy-network` Docker network

The workflow expects these secrets:
- `USERNAME` / `PASSWORD` - registry credentials
- `DEV_AUTH_SECRET` - auth secret for token signing
- `DEV_PASSWORD` - site login password
- `DEV_DATABASE_URL` - Neon connection string
