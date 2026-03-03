# VeilDB Overview

[Documentation](https://veildb.gitbook.io/) • [Main Project](https://github.com/veildb-tech) • [Website](https://veildb.com)


**Open-source platform for database anonymization and secure sharing across development teams.**

VeilDB helps you safely share production-like databases without exposing sensitive customer data.

## Why VeilDB?
Sharing real production databases is risky:

- Personal data leaks
- Compliance violations
- Accidental exposure in local environments

At the same time, development teams need realistic data for:

- Debugging
- QA
- Demos
- Performance testing

VeilDB solves this by automatically anonymizing sensitive data and generating clean, shareable database dumps.

## VeilDB Architecture

VeilDB consists of three independent components designed to separate configuration, processing, and consumption of anonymized database dumps.

```
                ┌──────────────────────────┐
                │        VeilDB Service    │
                │  (Web UI + Rule Engine)  │
                └─────────────┬────────────┘
                              │
                              │ HTTPS / API
                              ▼
                ┌──────────────────────────┐
                │        VeilDB Agent      │
                │  (Processing Engine)     │
                └─────────────┬────────────┘
                              │
                              │ Secure storage / S3 / Filesystem
                              ▼
                ┌──────────────────────────┐
                │        VeilDB Client     │
                │  (Developer CLI Tool)    │
                └──────────────────────────┘
```

## Components Overview

### Service Layer

**Purpose:**
Central configuration and rule management system.

**Responsibilities:**

- Configure masking/anonymization rules
- Define environments (staging, demo, dev, etc.)
- Trigger processing (manual, webhook, scheduled)
- Manage Agents
- Store metadata about processed backups

**Does NOT:**

- Process dumps directly
- Store raw production data

### Agent Layer

**Purpose:**
Secure processing engine installed inside infrastructure.

**Runs as:**
Docker-based application

**Responsibilities:**

- Receive rules from Service
- Download database dump
- Apply anonymization rules
- Generate processed dump
- Upload result to configured storage
- Report status back to Service

**Security Principle:**

- Agent runs inside client’s infrastructure
- Service does not access production database directly
- Raw dumps never leave controlled environment unprocessed

### Client Layer

**Purpose:**
Lightweight CLI tool for developers.

**Responsibilities:**

- Authenticate with Service
- List available processed dumps
- Download latest anonymized dump
- Simplify local environment setup

**Does NOT:**

- Access production database
- Process raw data


# VeilDB Service

**This repository** is an entrypoint - a web-based control center for managing database anonymization rules and infrastructure.

The Service is the control panel of VeilDB. It stores configuration, manages access, and coordinates agents.

In most cases, you need to clone and set up only this repository. To install the agent and client components, you can follow the instructions on the service dashboard or documentation.

But since this repository is a **part** of the VeilDB platform, you might want to explore the agent and client repositories. More details:

- Main project overview: [https://github.com/veildb-tech](https://github.com/veildb-tech)
- Documentation: [https://veildb.gitbook.io/](https://veildb.gitbook.io/)

---

## Typical Flow

1. Add database source
2. Configure masking rules
3. Assign permissions
4. Agent processes dump
5. Developers download anonymized database

---

## Demo

![Service Demo](https://github.com/veildb-tech/.github/blob/main/profile/demo.gif)

The demo shows rule configuration, triggering a dump, and verifying masked output.

---

## Installation

### Quick Installation (Recommended)

Run the automated installation script:

```bash
./install.sh
```

This script will:
1. Set up all environment files (`.env`) from `env-sample` files
2. Generate JWT passphrase automatically
3. Start Docker Compose services
4. Install backend dependencies via Composer
5. Set up the database and run migrations
6. Generate JWT keys
7. Install frontend dependencies

### Manual Installation

If you prefer to install manually:

1. Clone this repository.
2. Copy environment files:
   ```bash
   cp env-sample .env
   cp src/backend/env-sample src/backend/.env
   cp src/frontend/env-sample src/frontend/.env
   ```
3. Generate JWT passphrase and update `src/backend/.env`:
   ```bash
   # Generate a random passphrase
   openssl rand -base64 32 | tr -d "=+/" | cut -c1-32
   # Add it to JWT_PASSPHRASE in src/backend/.env
   ```
4. Start Docker Compose:
   ```bash
   docker compose up -d --build
   ```
5. Install backend dependencies:
   ```bash
   docker compose exec php composer install
   ```
6. Generate JWT keys:
   ```bash
   docker compose exec php php bin/console lexik:jwt:generate-keypair
   ```
7. Run database migrations:
   ```bash
   docker compose exec php php bin/console doctrine:migrations:migrate
   ```
8. Frontend dependencies will be installed automatically when the container starts.

### Local Access

After installation, services will be available at: http://localhost:8080 (or port specified in `.env` as `NGINX_PORT`)


- If services fail to start, check logs: `docker compose logs`
- To rebuild containers: `docker compose up -d --build`
- To stop services: `docker compose down`
