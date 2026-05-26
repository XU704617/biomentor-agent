---
name: cloudflare-deploy
description: Deploy applications to Cloudflare using Workers, Pages, and platform services. Invoke when user asks to deploy to Cloudflare, set up a Cloudflare project, or use Workers/Pages/R2/D1.
---

# Cloudflare Deploy

Deploy applications and infrastructure to Cloudflare using Workers, Pages, and related platform services.

## Prerequisites

- Cloudflare account
- Node.js installed
- Wrangler CLI (via npx or global install)

## Authentication

```bash
# Check auth
npx wrangler whoami

# If not authenticated
npx wrangler login
```

For CI/CD: set `CLOUDFLARE_API_TOKEN` environment variable.

## Quick Decision Trees

### Running Code

```
Need to run code?
├─ Serverless functions at the edge → Workers (wrangler deploy)
├─ Full-stack web app with Git deploys → Pages
├─ Stateful coordination/real-time → Durable Objects
├─ Scheduled tasks (cron) → Cron Triggers
├─ Long-running jobs → Workflows
└─ Lightweight edge logic → Snippets
```

### Storing Data

```
Need storage?
├─ Key-value (config, sessions, cache) → KV
├─ Relational SQL → D1 (SQLite)
├─ Object/file storage (S3-compatible) → R2
├─ Message queue (async processing) → Queues
├─ Vector embeddings (AI/semantic search) → Vectorize
└─ Secrets management → Secrets Store
```

### AI/ML

```
Need AI?
├─ Run inference (LLMs, embeddings, images) → Workers AI
├─ Vector database for RAG/search → Vectorize
├─ AI Gateway (caching, routing) → AI Gateway
└─ AI-powered search → AI Search
```

## Common Deploy Commands

### Workers

```bash
# Create a new Worker
npm create cloudflare@latest my-worker

# Deploy
npx wrangler deploy

# Tail logs
npx wrangler tail
```

### Pages

```bash
# Deploy via Git (connect repo in Cloudflare dashboard)
# Or deploy via CLI
npx wrangler pages deploy ./dist
```

### D1 (Database)

```bash
# Create database
npx wrangler d1 create my-database

# Execute SQL
npx wrangler d1 execute my-database --file=./schema.sql
```

### R2 (Object Storage)

```bash
# Create bucket
npx wrangler r2 bucket create my-bucket

# Upload file
npx wrangler r2 object put my-bucket/path/to/file --file=./local-file.txt
```

## Wrangler Configuration (wrangler.toml)

```toml
name = "my-worker"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "my-database"
database_id = "xxx"

[[kv_namespaces]]
binding = "CACHE"
id = "xxx"

[[r2_buckets]]
binding = "BUCKET"
bucket_name = "my-bucket"
```

## Environment Variables

```bash
# Set secret
npx wrangler secret put API_KEY

# Set in wrangler.toml
[vars]
ENVIRONMENT = "production"
```

## Troubleshooting

- **Auth errors**: Run `npx wrangler login` or set `CLOUDFLARE_API_TOKEN`
- **Deploy failures**: Check `wrangler.toml` configuration and account permissions
- **Network issues**: Ensure outbound network access for deployment commands
