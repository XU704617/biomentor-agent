---
name: netlify-deploy
description: Deploy web projects to Netlify using Netlify CLI. Invoke when user asks to deploy to Netlify, create a preview deploy, or set up a site on Netlify.
---

# Netlify Deploy

Deploy web projects to Netlify using the Netlify CLI with intelligent detection of project configuration and deployment context.

## Prerequisites

- Node.js installed
- Valid web project in current directory

## Authentication

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Check status
netlify status

# Login if needed
netlify login
```

For CI/CD: set `NETLIFY_AUTH_TOKEN` environment variable.
Generate tokens at: https://app.netlify.com/user/applications#personal-access-tokens

## Workflow

### 1. Verify Authentication

```bash
netlify status
```

- ✅ Authenticated: Shows user email and site link status
- ❌ Not authenticated: Run `netlify login`

### 2. Detect Site Link Status

- **Linked**: Site already connected (shows site name/URL)
- **Not linked**: Need to link or create site

### 3. Link or Create Site

```bash
# Try Git-based linking
git remote show origin
netlify link --git-remote-url <REMOTE_URL>

# If no site exists, create new
netlify init
```

This guides through:
1. Choosing team/account
2. Setting site name
3. Configuring build settings
4. Creating netlify.toml if needed

### 4. Install Dependencies

```bash
npm install
# or yarn install, pnpm install
```

### 5. Deploy

```bash
# Preview deploy (default)
netlify deploy

# Production deploy
netlify deploy --prod
```

### 6. Report Results

- Deploy URL for this deployment
- Production URL (if production deploy)
- Deploy logs link

## Framework Detection

Common defaults:

| Framework | Build Command | Publish Dir |
|-----------|--------------|-------------|
| Next.js | `npm run build` | `.next` |
| React (Vite) | `npm run build` | `dist` |
| Static HTML | - | current dir |

## Netlify Configuration (netlify.toml)

```toml
[build]
  command = "npm run build"
  publish = "dist"
```

## Environment Variables

```
# Set in Netlify dashboard: Site Settings → Environment Variables
# Or via CLI
netlify env:set VAR_NAME value
```

## Troubleshooting

- **Not logged in**: Run `netlify login`
- **No site linked**: Run `netlify link` or `netlify init`
- **Build failed**: Check build command and publish directory in netlify.toml
- **Network issues**: Ensure outbound network access for deployment
