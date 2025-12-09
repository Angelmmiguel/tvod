# TVOD - Twitch VOD Manager

A self-hosted Twitch VOD downloader and manager built as a monorepo.

## Project Structure

```
tvod/
├── packages/
│   └── app/                    # Main SvelteKit application
├── llms/                       # Library documentation for AI agents
├── biome.json                  # Code formatter/linter config
├── pnpm-workspace.yaml         # Monorepo workspace definition
└── flake.nix                   # Nix development environment
```

## Tech Stack

- **Framework**: SvelteKit with Svelte 5 (uses runes: `$props()`, `$state()`, `{@render}`)
- **Styling**: Tailwind CSS v4 (zero-config, uses `@import "tailwindcss"` in CSS)
- **UI Components**: bits-ui
- **Icons**: phosphor-svelte (import from `phosphor-svelte/lib/IconName`)
- **Database**: SQLite via better-sqlite3 with Drizzle ORM
- **Package Manager**: pnpm 10.x
- **Code Quality**: Biome (formatter & linter)

## Development Environment

This project uses Nix for development environment management. Before running pnpm commands:

```bash
nix develop
```

Then you can use pnpm commands:

```bash
# From packages/app directory
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm preview          # Preview production build
pnpm check            # Type check with svelte-check
pnpm test             # Run tests
```

Database commands:

```bash
pnpm db:push          # Push schema to database
pnpm db:generate      # Generate migrations
pnpm db:migrate       # Run migrations
pnpm db:studio        # Open Drizzle Studio
```

## Code Style

Configured via Biome (`biome.json`):

- **Indentation**: Tabs
- **Line width**: 100 characters
- **Quotes**: Single quotes
- **Trailing commas**: ES5 style

Run formatting/linting:

```bash
npx @biomejs/biome check --write .
```

## Key Directories

- `packages/app/src/routes/` - SvelteKit pages and layouts
- `packages/app/src/lib/` - Shared components and utilities (use `$lib/` alias)
- `packages/app/src/lib/server/db/` - Database schema and client

## UI Patterns

### Importing Components

```svelte
<script lang="ts">
  import { Button } from 'bits-ui';
  import IconName from 'phosphor-svelte/lib/IconName';
</script>

<Button.Root class="...">Click me</Button.Root>
```

### Svelte 5 Runes

This project uses Svelte 5 runes syntax:

```svelte
<script lang="ts">
  const { children } = $props();
  let count = $state(0);
</script>

{@render children()}
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

- `DATABASE_URL` - SQLite database path (e.g., `local.db`)

## Library Documentation

The `llms/` directory contains documentation files for key libraries used in this project. These files follow the llms.txt convention and provide comprehensive API references.

### Available Documentation

| Library | Path | Description |
|---------|------|-------------|
| Svelte & SvelteKit | `llms/svelte/llms.txt` | Framework documentation including runes, components, and SvelteKit |
| bits-ui | `llms/bits-ui/llms.txt` | UI component library documentation |

### How to Use

These documentation files are large and should not be read in full. Use targeted searches to find relevant information:

```bash
# Search for a specific component or API
grep -n "Button" llms/bits-ui/llms.txt | head -20

# Find a section header
grep -n "^# " llms/svelte/llms.txt

# Search with context around matches
grep -B5 -A10 "pattern" llms/bits-ui/llms.txt
```

When working with these docs:

1. **Search first**: Use grep to find relevant sections before reading
2. **Read in chunks**: Use offset/limit when reading to avoid loading entire files
3. **Look for headers**: Section headers (lines starting with `#`) help navigate the docs
4. **Check examples**: Most components include code examples showing usage patterns
