---
name: vercel-deploy
description: Deploy applications and websites to Vercel. Invoke when user asks to deploy to Vercel, create a preview deployment, or push an app live on Vercel.
---

# Vercel Deploy

Deploy any project to Vercel. **Always deploy as preview** (not production) unless the user explicitly asks for production.

## Prerequisites

Check if Vercel CLI is available:

```bash
command -v vercel
```

Install if missing:

```bash
npm install -g vercel
```

## Authentication

```bash
# Login (first time)
vercel login

# Verify
vercel whoami
```

## Quick Deploy

```bash
# Preview deploy (default)
vercel deploy --yes

# Production deploy (only if explicit)
vercel deploy --prod --yes

# Deploy specific path
vercel deploy ./build --yes
```

## First-Time Setup

```bash
# Initialize project
vercel init

# Or link existing project
vercel link
```

This will guide through:
1. Choosing scope/team
2. Setting project name
3. Configuring build settings
4. Creating `vercel.json` if needed

## Framework Auto-Detection

Vercel auto-detects frameworks:

| Framework | Build Command | Output Dir |
|-----------|--------------|------------|
| Next.js | `next build` | `.next` |
| React (Vite) | `vite build` | `dist` |
| React (CRA) | `react-scripts build` | `build` |
| Vue | `vue-cli-service build` | `dist` |
| SvelteKit | `vite build` | `build` |
| Static | - | `.` |

## Vercel Configuration (vercel.json)

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite"
}
```

## Environment Variables

```bash
# Set in dashboard: Project Settings → Environment Variables
# Or via CLI
vercel env add SECRET_KEY

# Access in code
process.env.SECRET_KEY
```

## Output

Show the deployment URL to the user. **Do not** curl or fetch the deployed URL.

## Troubleshooting

- **Not logged in**: Run `vercel login`
- **No project linked**: Run `vercel link` or `vercel init`
- **Build failed**: Check build command and output directory
- **Network issues**: Ensure outbound network access for deployment
