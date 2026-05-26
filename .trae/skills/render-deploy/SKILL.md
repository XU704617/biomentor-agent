---
name: render-deploy
description: Deploy applications to Render using blueprints and CLI. Invoke when user asks to deploy to Render, set up a Render project, or deploy web services/static sites on Render.
---

# Render Deploy

Deploy applications to [Render](https://render.com) using Render Blueprints (infrastructure-as-code) and the Render API.

## Overview

Render supports:
- **Web Services**: Long-running HTTP services (Node, Python, Go, etc.)
- **Static Sites**: Static file hosting with auto-build from Git
- **Background Workers**: Non-HTTP background processes
- **Cron Jobs**: Scheduled tasks
- **PostgreSQL / Redis**: Managed databases
- **Docker**: Container-based services

## Authentication

1. Create an API key at: https://dashboard.render.com/u/settings/api-keys
2. Export it:

```bash
export RENDER_API_KEY=rnd_xxxxxxxxxxxx
```

## Deploy via Blueprint (infrastructure-as-code)

Create a `render.yaml` in your repo root:

```yaml
services:
  - type: web
    name: my-api
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: my-db
          property: connectionString

  - type: web
    name: my-frontend
    env: static
    buildCommand: npm install && npm run build
    staticPublishPath: ./dist

databases:
  - name: my-db
    plan: free
```

Then connect your GitHub repo in the Render dashboard. Render auto-deploys on push.

## Deploy via CLI / API

```bash
# Create a new web service
curl -X POST https://api.render.com/v1/services \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "web_service",
    "name": "my-app",
    "ownerId": "team-xxx",
    "repo": "https://github.com/user/repo",
    "branch": "main",
    "buildCommand": "npm run build",
    "startCommand": "npm start"
  }'
```

## Common Service Patterns

### Node.js Web Service

```yaml
services:
  - type: web
    env: node
    buildCommand: npm install && npm run build
    startCommand: node dist/index.js
```

### Python Web Service

```yaml
services:
  - type: web
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: gunicorn app:app
```

### Go Web Service

```yaml
services:
  - type: web
    env: go
    buildCommand: go build -o app
    startCommand: ./app
```

### Docker Service

```yaml
services:
  - type: web
    env: docker
    dockerfilePath: ./Dockerfile
```

### Static Site

```yaml
services:
  - type: web
    env: static
    buildCommand: npm run build
    staticPublishPath: ./dist
```

## Environment Variables

Set in `render.yaml` or the Render dashboard. Never commit secrets to `render.yaml` — use the dashboard for secrets:

```bash
# Or via API
curl -X PUT "https://api.render.com/v1/services/{serviceId}/env-vars" \
  -H "Authorization: Bearer $RENDER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '[{"key": "SECRET_KEY", "value": "xxx"}]'
```

## Troubleshooting

- **Deploy not triggering**: Check GitHub repository connection in Render dashboard
- **Build failures**: Review build logs in the Render dashboard
- **Invalid render.yaml**: Validate YAML syntax and service type compatibility
- **Network issues**: Ensure outbound network access for API calls
