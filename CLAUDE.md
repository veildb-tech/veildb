# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DBVisor is a full-stack database monitoring/management tool. The monorepo contains:
- **Backend**: Symfony 6.2 (PHP 8.2+) with REST + GraphQL via API Platform — see `src/backend/CLAUDE.md`
- **Frontend**: Next.js 13.5 (React 18) with Apollo Client v3 and MUI v5 — see `src/frontend/CLAUDE.md`
- **Infrastructure**: Docker Compose (PHP-FPM, Nginx, Node.js, MySQL 8.0)

## Infrastructure Commands

All services run in Docker. Use these commands from the repo root:

```bash
# Start development environment (includes phpmyadmin, hot reload)
./dev.sh

# Or manually:
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# View logs
docker compose logs -f [php|nginx|frontend|database]

# Stop all services
docker compose down
```

## Architecture

### Request Flow

```
Browser → Nginx (:80) → PHP-FPM → Symfony → GraphQL/REST → Service → Doctrine ORM → MySQL
Browser → Next.js (:3000) → Apollo Client → same Nginx/GraphQL endpoint
```

### Key Domain Concepts

- **Workspace**: Top-level organization container; all entities belong to a workspace
- **Database**: A monitored MySQL database with connection config
- **DatabaseRule**: Compliance/quality rules applied to databases (templates in `src/backend/rule_templates/`)
- **Server**: Database server host configuration
- **Group**: User group for workspace permissions
- **Webhook**: Event notification integrations

### Authentication

JWT-based auth:
1. POST `/api/login_check` → returns access + refresh tokens
2. Frontend stores tokens in cookies (`react-cookie`)
3. All `/api/*` and `/api/graphql` requests require `Authorization: Bearer <token>` header
4. Refresh via POST `/api/token/refresh`
5. JWT keypair is auto-generated on container startup from `JWT_PASSPHRASE` env var

### Environment Setup

Three `.env` files are required:
- Root `.env` — Docker port mapping (copy from `env-sample`):
  ```
  FRONTEND_PORT=3000
  NGINX_PORT=80
  PHPMYADMIN_PORT=8080
  ```
- `src/backend/.env` — database URL, JWT config, mailer, CORS (copy from `src/backend/.env-sample`)
- `src/frontend/.env.local` — GraphQL endpoint URLs (copy from `src/frontend/env-sample`)

The `install.sh` script automates full first-time setup including JWT key generation and running migrations.
