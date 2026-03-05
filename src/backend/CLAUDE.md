# Backend CLAUDE.md

Symfony 6.2 (PHP 8.2+) backend with REST + GraphQL API via API Platform and `webonyx/graphql-php`.

## Commands

All commands run inside the `php` Docker container from the repo root:

```bash
# Install/update dependencies
docker compose exec php composer install

# Run database migrations
docker compose exec php php bin/console doctrine:migrations:migrate

# Generate a new migration (diff against current schema)
docker compose exec php php bin/console doctrine:migrations:diff

# Regenerate JWT keys
docker compose exec php php bin/console lexik:jwt:generate-keypair

# Clear cache
docker compose exec php php bin/console cache:clear

# Run all tests
docker compose exec php php bin/phpunit

# Run a single test file
docker compose exec php php bin/phpunit tests/RestApi/DatabaseTest.php
```

## Directory Structure (`src/`)

```
src/
├── Api/                    # API Platform extensions and serializers
│   ├── Filter/             # Custom query filters (UuidFilter)
│   ├── Serializer/         # Custom normalizers (DatabaseRule, Webhook, UserInvitation)
│   ├── Database/           # Database-specific extensions (dump, rule template)
│   └── Workspace/          # Workspace-scoped collection filters
├── ApiResource/            # API Platform resource classes (Configuration, SendContactEmail)
├── Authentication/         # Custom authenticator manager override
├── Command/                # Symfony console commands
│   ├── Database/           # HealthyCheck, ScheduleDump
│   ├── Server/             # ServerHealthyCheck
│   └── Workspace/          # UpdateInvitationStatus
├── Controller/
│   ├── Admin/              # EasyAdmin CRUD controllers (Dashboard, Database, Workspace, Server, Webhook)
│   ├── Api/Database/       # REST controllers for dump operations
│   ├── Security/           # JWT auth token and profile controllers
│   ├── Server/             # Download link and token validation
│   └── Webhook/            # Webhook execution
├── Entity/
│   ├── Database/           # Database, DatabaseDump, DatabaseRule, DatabaseRuleTemplate, DatabaseDumpDeleteRules, etc.
│   ├── Workspace/          # User, Workspace, Group, UserInvitation, Notification, UserRestore
│   └── Admin/              # Admin\User
├── EntityListener/         # Doctrine entity lifecycle hooks (pre/post persist, update, remove)
├── Enums/                  # PHP 8.1+ backed enums (Database status, engine, platform, rule method/operator/faker, etc.)
├── EventListener/          # JWT event listeners (JWTCreated, JWTAuthenticated, JWTSuccess, AccessDenied)
├── Repository/             # Doctrine repositories per entity
├── Resolver/               # GraphQL resolvers (one per query/mutation)
│   ├── Rule/               # TemplateResolver
│   ├── Workspace/          # CurrentWorkspace, UpdateWorkspace, LeaveWorkspace, Invitation, Notification, User, Group, RestorePassword
│   └── ...                 # ConfigurationResolver, SendContactEmailResolver
├── Security/
│   ├── Http/               # TokenAuthenticator (JWT + server token dual auth)
│   ├── Validators/         # Permission validators (factory pattern)
│   └── Voter/              # Symfony voters (GeneralVoter, WorkspaceVoter, WebhookVoter)
└── Service/                # Business logic
    ├── Database/           # ProcessDamaged, ScheduleDump, GenerateSuggestedRule, RuleGenerator
    ├── Server/             # ProcessOffline
    ├── Webhook/            # Execute
    └── Workspace/          # GetSelectedWorkspace, SendInvitationEmail, AcceptInvitation, WorkspaceProcessor, Notification
```

## Key Patterns

### GraphQL Resolvers

Each resolver handles one query or mutation. They implement `QueryItemResolverInterface` or `MutationResolverInterface` from API Platform. Resolvers are autowired — no manual service registration needed.

```php
class MyResolver implements MutationResolverInterface
{
    public function __invoke(?object $item, array $context): object
    {
        // $context['args']['input'] contains mutation arguments
    }
}
```

### Entities

All entities implement `EntityWithUuidInterface` (string UUID as primary key) and most workspace-scoped entities implement `EntityWithWorkspaceInterface`. UUIDs are generated automatically via Doctrine lifecycle.

### Multi-Tenant Workspace Scoping

`FilterByWorkspaceExtension` and `FilterWorkspaceExtension` automatically filter API Platform collections to the current user's workspace. This applies to: Database, DatabaseDump, Server, Notification, DatabaseRuleTemplate, Webhook, DatabaseRule.

### Authentication

Two authentication paths share the same JWT infrastructure:
1. **User JWT** — standard login via `POST /api/login_check`
2. **Server token** — `AccessBackupToken` entity used for server-to-server backup operations

`TokenAuthenticator` handles both. `JWTCreatedListener` and `JWTAuthenticatedListener` inject workspace data into the JWT payload.

### Admin Panel

EasyAdmin 4 bundle at `/admin` (configurable via `ADMIN_PATH` env). CRUD controllers in `Controller/Admin/`. Admin users are separate from workspace users (`Entity/Admin/User` vs `Entity/Workspace/User`).

### Scheduled Jobs

Cron bundle (`cron/cron-bundle`) drives scheduled database dumps. `Command/Database/ScheduleDump` and `Command/Database/HealthyCheck` run on schedule. Cron expressions are stored on `DatabaseRule` entities.

### Rule Generator

`Service/Database/RuleGenerator/RuleGenerator` generates rule suggestions based on database column analysis. Patterns configured in `config/rules/generator_patterns.yaml` and `config/rules/generator_service_words.json`.

### Email

`Service/Mailer` wraps Symfony Mailer. Emails use Twig templates with CSS inliner. Configured via `MAILER_DSN` (supports AWS SES via `symfony/amazon-mailer`). Preview route available via `PreviewEmailController`.

## Environment Variables

Key variables in `src/backend/.env` (copy from `.env-sample`):

```
DATABASE_URL=mysql://...
JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem
JWT_PASSPHRASE=...
CORS_ALLOW_ORIGIN='^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$'
APP_URL=http://localhost
APP_DEFAULT_EMAIL=noreply@example.com
ADMIN_PATH=admin
```

## Testing

Tests in `tests/RestApi/` extend `AbstractAppTestCase` which boots the Symfony kernel with a test database. Fixtures available via `DataFixtures/` (AppFixtures, UserFixture).

```bash
# Run with coverage (requires Xdebug)
docker compose exec php php bin/phpunit --coverage-text
```

## Migrations

71+ migration files in `migrations/`. Always generate via diff — never write manually:

```bash
docker compose exec php php bin/console doctrine:migrations:diff
docker compose exec php php bin/console doctrine:migrations:migrate
```
