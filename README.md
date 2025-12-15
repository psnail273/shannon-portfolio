# Shannon's Portfolio

A portfolio website built for my friend Shannon to showcase their work.

## Tech Stack

- **Next.js 16** with React 19
- **Tailwind CSS** for styling
- **MUI** components
- **Neon** serverless Postgres database
- **Motion** for animations

## Development

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

The site will be available at http://localhost:3000

For a production build:

```bash
npm run build
npm run start
```

## Database

This project uses [Neon](https://neon.tech) as a serverless Postgres database. Set the `DATABASE_URL` environment variable to connect:

```
DATABASE_URL=postgres://user:password@your-neon-host/dbname
```

## Deployment

There's a Gitea Actions workflow (`.gitea/workflows/dev.yaml`) that handles CI/CD. On push to the `dev` branch, it:

1. Builds a Docker image
2. Pushes it to the private registry
3. Deploys the container to the server

The workflow expects these secrets to be configured:
- `USERNAME` / `PASSWORD` - registry credentials
- `DEV_AUTH_SECRET` - auth secret for the app
- `DEV_PASSWORD` - app password
- `DEV_DATABASE_URL` - Neon connection string
