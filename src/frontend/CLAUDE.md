# Frontend CLAUDE.md

Next.js 13.5 (React 18) frontend with Apollo Client (GraphQL), MUI v5, and Tailwind CSS v3.

## Commands

Run from `src/frontend/` locally or via Docker:

```bash
# Local (Node.js required)
yarn install
yarn dev          # dev server on port 80
yarn build
yarn lint
yarn lint-fix

# Inside Docker container
docker compose exec frontend yarn lint
docker compose exec frontend yarn lint-fix
docker compose exec frontend yarn build
```

## Directory Structure (`src/`)

```
src/
├── components/             # Reusable UI components
│   ├── cron/               # Internalized cron expression editor (forked react-js-cron)
│   ├── database/           # Database selector
│   ├── grid/               # Data grid, import/export, grid table
│   ├── rule/               # Condition and conditions components
│   └── ...                 # breadcrumbs, delete-dialog, notifications, chart, severity-pill
├── contexts/               # React Context providers
│   ├── apollo-context.js   # Apollo Client setup and token management
│   ├── auth-context.js     # Authentication state (login, logout, register)
│   ├── config-context.js   # App configuration
│   └── rule/               # Rule and rule-additions contexts
├── elements/               # Low-level UI primitives
│   ├── icons/              # SVG icon components
│   ├── multiselect1/       # Custom multiselect
│   └── switch1/            # Custom switch
├── guards/                 # Route protection wrappers
│   └── auth-guard.js       # Redirects unauthenticated users
├── hocs/                   # Higher-order components (withAuthGuard)
├── hooks/                  # Custom React hooks
│   ├── use-auth.js         # Access auth context
│   ├── use-workspace.js    # Current workspace state
│   ├── use-permission.js   # Permission checks
│   ├── use-url.js          # URL utilities
│   ├── use-popover.js      # Popover open/close state
│   ├── use-selection.js    # Table row selection
│   └── use-step-navigator.js # Multi-step form navigation
├── layouts/
│   ├── auth/               # Auth pages layout (centered card)
│   └── dashboard/          # Main app layout (side-nav, top-nav, account popover)
├── pages/                  # Next.js file-based routing
│   ├── auth/               # login, register, forgot-password, invitation, workspace, restore-password/[hash]
│   ├── databases/          # index (list), [uuid] (detail)
│   ├── rules/              # index (list), create, [uuid] (edit)
│   ├── servers/            # index (list), create, [uuid] (detail)
│   ├── manage/             # index, users, groups, webhooks
│   └── account.js, contact.js, index.js (dashboard overview)
├── queries/                # Apollo Client GraphQL definitions
│   ├── auth/               # Login, register, password reset mutations
│   ├── database/           # Database, dump, dump-delete-rules CRUD
│   ├── workspace/          # Users, groups, invitations, notifications
│   ├── rule/               # DatabaseRule CRUD and templates
│   └── server/             # Server CRUD
├── sections/               # Page-level feature modules (main UI logic)
│   ├── account/            # Profile, password, danger zone (delete account, leave workspace)
│   ├── auth/               # Login form, register form, workspace selector, invitation, change password
│   ├── database/           # Database list search, database detail (general, dumps, groups, clean rules)
│   ├── rule/               # Rule list, rule editor (conditions, schedule, faker options)
│   ├── server/             # Server list, server detail
│   └── manage/             # Users, groups, webhooks, invitations management
├── theme/                  # MUI theme — custom palette (`dbm-color-*` tokens), typography, component overrides
└── middleware.js            # Next.js middleware for route auth checks
```

## Key Patterns

### Apollo Client Setup

Configured in `contexts/apollo-context.js`. Attaches JWT access token from cookie to every request. Implements token refresh on 401 using the refresh token cookie.

All GraphQL operations are defined in `queries/` as exported `gql` tagged template literals. Import from the barrel `queries/index.js`.

```js
import { GET_DATABASES, DELETE_DATABASE } from 'src/queries';
```

### Authentication Flow

`contexts/auth-context.js` manages auth state. Pages needing auth are wrapped with `guards/auth-guard.js` via `hocs/with-auth-guard.js`. Tokens stored as cookies via `react-cookie`.

Workspace selection happens after login — `pages/auth/workspace.js` lets users pick or create a workspace before entering the dashboard.

### Page Structure

Each page in `pages/` is thin — it imports a section component that contains the actual UI logic.

```js
// pages/databases/[uuid].js
import { DatabaseDetails } from 'src/sections/database/database-details';
export default function Page() { return <DatabaseDetails />; }
```

### Forms

Formik + Yup for form state and validation throughout. Form components live in `sections/`.

### Data Grid

`components/grid/data-grid.js` is the shared table component used across list pages. Supports pagination, selection, import/export.

### Cron Editor

`components/cron/` is an internalized fork of `react-js-cron`. Use `<Cron value={...} setValue={...} />` — do not install the npm package.

### Permissions

`hooks/use-permission.js` checks user group permissions for workspace operations. Wrap permission-gated UI with this hook.

## Environment Variables

In `src/frontend/.env.local` (copy from `env-sample`):

```
NEXT_PUBLIC_GRAPHQL_URL=http://localhost/api/graphql
NEXT_PUBLIC_API_URL=http://localhost
```

## Package Notes

- **Apollo Client**: Uses `@apollo/client` v3 — all hooks (`useQuery`, `useMutation`) are imported directly from `@apollo/client` (not v4 subpaths).
- **MUI**: v5 — use `Grid` from `@mui/material` (not `Unstable_Grid2`).
- **Tailwind CSS**: v3 — uses standard `@tailwind base/components/utilities` directives and `tailwind.config.js`.
- **Next.js 13**: Uses `middleware.js` (not `proxy.js`). `eslint` key present in `next.config.js`.
- **Lint**: ESLint with `eslint-config-airbnb` + `eslint-plugin-prettier`. Run `yarn lint-fix` to auto-fix. Pre-commit hook runs lint via Husky.
- **No TypeScript in pages/sections/components**: Only `components/cron/` uses TypeScript (`.ts`/`.tsx`). All other source files use `.js`.
