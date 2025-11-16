# Slide Bar - Project Context

## Architecture

- **Frontend**: React 19 + Vite 7 + TypeScript 5.9 (strict mode) + Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Deployment**: Vercel (frontend) + Supabase Cloud (backend)
- **Testing**: Vitest 4.0.8 (unit/integration) + Playwright 1.56 (E2E)
- **CI/CD**: GitHub Actions (lint + type-check + tests) + Vercel (auto-deploy)
- **Migration Status**: ✅ All dependencies migrated to latest LTS/stable versions (Node 22.21.1 LTS)
- **TypeScript Status**: ✅ Full migration complete with strict mode enabled
- **Production Status**: ✅ Live at https://slide-bar.vercel.app

## Folder Structure

```
slide-bar/
├── docs/                 # Business/market documentation
├── scripts/              # Dev/test automation scripts
├── spec/                 # Feature specifications (spec-driven development)
├── src/                  # React + Vite + TypeScript + Tailwind
│   ├── components/       # React components (.tsx)
│   ├── lib/              # Supabase API client, utilities (.ts)
│   ├── pages/            # Page components (.tsx)
│   └── types/            # TypeScript types (supabase.ts auto-generated, database.ts helpers)
├── supabase/             # Supabase config, migrations, functions
└── tests/                # All tests (unit + E2E + fixtures)
    ├── config/           # Test configuration (setup.ts for Vitest)
    ├── e2e/
    │   ├── fixtures/     # Test assets (images)
    │   ├── specs/        # E2E test files (*.spec.ts)
    │   └── support/      # E2E helpers (constants, fixtures, global-setup/teardown)
    ├── helpers/          # Shared test helpers (Supabase cleanup)
    └── unit/
        ├── components/   # Component unit tests (includes App.test.tsx)
        ├── lib/          # Library unit tests
        └── pages/        # Page unit tests
```

## Port Configuration

### Development (Local)

- Frontend: 5173
- Supabase API: 54321 (local)
- Supabase Studio: 54323 (local)

### Testing (E2E)

- Test Frontend: 5174
- Playwright Report: 9323

### Production

- Frontend: https://slide-bar.vercel.app
- Player: https://slide-bar.vercel.app/player
- Supabase: https://cdpxkskbpntoiarhtyuj.supabase.co
- Demo credentials: demo@example.com / demo-password-123

## Key Commands

- `pnpm start` - Start dev servers (includes Docker database)
- `pnpm stop` - Stop all dev servers
- `pnpm type-check` - Run TypeScript compiler (no emit, strict mode)
- `pnpm test` - Run all unit tests
- `pnpm test:e2e` - Run E2E tests
- `pnpm test:coverage` - Run tests with coverage
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier

## Critical Compatibility Notes

- **TypeScript-Only Codebase**: ESLint blocks any .js/.jsx files except `eslint.config.js` and `postcss.config.js`
  - All source code must be TypeScript (.ts/.tsx)
  - All scripts must be TypeScript (run with `tsx`)
  - Coverage checks validate TSX files (not JSX)
- **React 19 JSX Transform**: NEVER use explicit `JSX.Element` return type annotations
  - React 19's new JSX transform doesn't export JSX namespace globally
  - Using `JSX.Element` causes "Cannot find namespace 'JSX'" errors in strict CI environments
  - **Best practice**: Let TypeScript infer component return types automatically
  - ESLint rule enforces this with `no-restricted-syntax` blocking JSX namespace usage
  - Example: `function App() { return <div>...</div> }` NOT `function App(): JSX.Element`
- **Vite Configuration** (`config/vite.config.ts`):
  - `root: src/` - index.html location
  - `envDir: projectRoot` - **CRITICAL:** Load .env from project root, not src/
  - `publicDir: public/` - Static assets (favicon, etc.)
  - Must use `--config config/vite.config.ts` flag in all scripts
- **Supabase Local**: Runs via Docker (`supabase start`), uses ports 54321-54324
- **macOS ARM**: Requires `@rollup/rollup-darwin-arm64` dependency
- **Platform-Specific Binaries**:
  - **esbuild**: Requires `@esbuild/linux-arm64@0.25.12` for Docker E2E tests (macOS uses darwin-arm64)
  - **Tailwind v4**: Uses LightningCSS which requires platform-specific binaries (automatically handled by pnpm)

## Development Practices

### Spec-Driven Development

For complex features or major changes, create a specification document first:

**Process** (inspired by GitHub's spec-kit):

1. Create `spec/feature-name.md` before writing code
2. Document: Goal, Architecture, Tasks, Success Criteria, Progress
3. Break down into phases with clear checkpoints
4. Mark tasks complete with ✅ as you progress
5. Keep spec updated throughout development

**Example**: `spec/migrate-to-supabase.md` - 9-phase migration with TDD at every step

**When to use specs**:

- Major architectural changes
- Multi-phase migrations
- Features requiring coordination across multiple components
- When you need to track progress over multiple sessions

**Spec template**:

```markdown
# Feature Name

**Status**: 🟡 In Progress / ✅ Done
**Started**: YYYY-MM-DD
**Approach**: Brief description

## Goal

What we're trying to achieve

## Phase 1: Phase Name

- [ ] Task 1
- [ ] Task 2

**Success Criteria**: How we know it's done
```

**Timestamps**: Always use system time from `<env>Today's date</env>` context for all dates/timestamps. Never use placeholder dates.

### Test-Driven Development (TDD)

- **Write tests first**: Create tests before implementation, verify they fail initially
- **Red-Green-Refactor**: Failing test → Make it pass → Improve code quality
- **High unit test coverage**: Focus on edge cases, functions, classes, and modules
- **E2E tests for happy paths**: Lower coverage acceptable for complex integration tests
- **Never change both**: Update tests OR implementation, never simultaneously
- **Test performance**: Monitor test suite execution time, optimize slow tests
- **Use testing tools**: Leverage mocks, factories, and testing libraries
- **Coverage analysis**: Run `pnpm test:coverage` after features to identify gaps

### Quality Tools

- **TypeScript 5.9** with strict mode enabled - zero type errors
- **Supabase Type Generation**: Auto-generated types from database schema (`src/types/supabase.ts`)
- ESLint v9 (flat config with TypeScript support) - configured and passing
- Prettier 3.6 for formatting - configured
- Test coverage reporting configured (`pnpm coverage:all`)
- 85 unit tests + 16 E2E tests = 101 total (all passing)
- Coverage: ~97% lines, ~94% statements, ~77% branches, ~94% functions
- Type check: `pnpm type-check` (runs in CI/CD)
- Lint commands: `pnpm lint`, `pnpm lint:fix`
- Format commands: `pnpm format`, `pnpm format:check`

### When Tests Fail

1. **First**: Check implementation code for bugs (don't relax test assertions)
2. **Avoid**: Making tests accept broader outputs (e.g., changing specific format checks to generic string checks)
3. **Debug**: Understand why the test is failing before making changes

### ESLint and Code Quality Rules

**CRITICAL: NEVER relax or disable ESLint rules without explicit user confirmation**

When encountering ESLint warnings or errors:

1. **DO**: Fix the code to comply with the rule (refactor, extract functions, split files)
2. **DO**: Research industry best practices if the rule seems too strict
3. **DO**: Ask the user for clarification if unsure about the best approach
4. **DO NOT**: Add `eslint-disable` comments without user approval
5. **DO NOT**: Increase rule limits (e.g., max-lines-per-function) without user approval
6. **DO NOT**: Remove or relax rules in `eslint.config.js` without user approval

**Examples of proper fixes**:

- ESLint `max-lines-per-function` warning → Extract helper functions or split into describe blocks
- ESLint `no-console` warning → Change to `console.warn` or `console.error`, or remove
- ESLint `max-len` warning → Break long lines, extract variables, or improve formatting

**If in doubt**: Always ask the user before modifying ESLint configuration

## Supabase Integration Testing

### Test Architecture

- **unit tests** in `tests/unit/**/*.test.{ts,tsx}` calling real Supabase TEST instance (port 55321)
- **E2E tests** in `tests/e2e/specs/*.spec.ts`
- **Isolated from dev**: Unit tests use TEST Supabase (port 55321), dev uses main Supabase (port 54321)
- **Shared TEST instance**: Both unit and E2E tests use the same TEST instance (started by E2E script)

### Test Configuration & Warning Suppression

**`tests/config/setup.ts`** - Global test setup:

- Imports `@testing-library/jest-dom` for DOM matchers
- **Suppresses expected test warnings**:
  - **GoTrueClient multiple instances**: Expected when creating fresh Supabase instances per test
  - **React act() warnings**: Expected when async operations (Supabase calls) complete after test cleanup
- **Why suppress instead of fix**: These warnings indicate expected behavior in test environments, not actual issues
  - act() warnings happen because components are unmounted during cleanup while async operations are still pending
  - Wrapping every state update in act() or adding extra waitFor() calls is unnecessary and makes tests harder to maintain

### Test Helpers

**`tests/helpers/supabase.ts`** - Supabase test utilities:

- `createServiceClient()` - Service role client bypassing RLS for cleanup
- `cleanDatabase()` - Delete all test data using service role
- `useSupabaseCleanup()` - Automatic cleanup after each test
- `createMockImageFile()` - Custom file-like objects for uploads

**`tests/helpers/fixtures.ts`** - Mock data factories:

- `createMockImage(overrides?)` - Single mock Image with sensible defaults
- `createMockImages(count, baseOverrides?)` - Array of mock Images with unique IDs
- `createMockPngImage(overrides?)` - Mock PNG image
- `createMockImageWithSize(sizeInBytes, overrides?)` - Mock image with specific size
- `createMockStorageData(path?)` - Mock Supabase storage upload response
- `mockImages` - Predefined mock images for common scenarios

**Usage examples**:

```typescript
// Simple usage
const image = createMockImage();
const images = createMockImages(3);

// With overrides
const largeImage = createMockImage({ size: 2000000, mime_type: 'image/png' });

// For size formatting tests
const testImage = createMockImageWithSize(1048576); // 1 MB

// For storage upload tests
const storageData = createMockStorageData('uploads/image.jpg');
```

## Supabase Database Management

### CRITICAL: Database Safety Rules

**NEVER run `supabase db reset` on any instance** - it deletes ALL data including RLS policies and auth users

- ✅ **DO**: Use `supabase migration up` to apply schema changes
- ✅ **DO**: Create new migration files for schema changes: `supabase migration new feature_name`
- ❌ **NEVER**: Run `supabase db reset` (destroys data + policies + auth users)
- ❌ **NEVER**: Use env vars in test helpers (prevents accidental dev database access)

### Test Database Isolation

**Two completely isolated Supabase instances:**

- **Dev instance**: Port 54321 (manual testing, local development)
- **Test instance**: Port 55321 (automated tests only, auto-cleaned after each test)

**Critical isolation mechanisms:**

1. **`src/lib/supabase.ts`**: Detects test mode via `import.meta.env.MODE === 'test'` and overrides to port 55321
2. **`tests/helpers/supabase.ts`**: Hard-coded to port 55321 (NEVER uses env vars)
3. **`scripts/setup-test-db.sh`**: Auto-creates demo user in test instance before running tests

**Why this matters**: Tests previously deleted all dev database images by accidentally connecting to port 54321. Two-layer protection ensures this never happens again.

### Automatic Test Setup

- `pnpm test` and `pnpm test:coverage` automatically run `scripts/setup-test-db.sh`
- Creates demo user (`demo@example.com` / `demo-password-123`) in test instance
- No manual intervention needed - hooks pass cleanly without `--no-verify`

### Manual Production Migration Deployment

**When automated deployment fails, push migrations manually using `--linked`:**

```bash
# 1. Check current migration status
supabase migration list --linked

# 2. Repair orphaned migrations (if needed)
supabase migration repair --linked --status reverted MIGRATION_ID_1 MIGRATION_ID_2

# 3. Push new migrations to production
supabase db push --linked --include-all

# 4. Verify migrations applied successfully
supabase migration list --linked
```

**How `--linked` works:**

- Uses project configuration from `supabase/.temp/project-ref`
- Authenticates via session-based login (`cli_login_postgres`), not direct database password
- Automatically routes through Supabase pooler (IPv4-compatible)
- Requires `supabase link --project-ref PROJECT_ID` to be run first (already configured for production: `cdpxkskbpntoiarhtyuj`)

**Why use `--linked` instead of `--db-url`:**

- ✅ Works from both IPv4 and IPv6 environments
- ✅ Uses pooler connection automatically (no manual URL transformation needed)
- ✅ Session-based auth is more secure than passing passwords in URLs
- ❌ Direct `--db-url` fails with IPv6 connectivity issues even on latest CLI

## Test Organization

### Unit/Integration Tests (Vitest)

- **Location**: `tests/unit/**/*.test.{ts,tsx}` (all migrated to TypeScript)
- **Configuration**: `vitest.config.ts` with `include: ['tests/unit/**/*.{test,spec}.{js,jsx,ts,tsx}']`
- **CRITICAL**: Sequential execution via `fileParallelism: false` + `pool: 'forks'` (prevents database race conditions + ensures test isolation)
  - **Vitest v4 change**: Replaced `singleFork: true` with `fileParallelism: false` - each test file runs in its own fork sequentially
  - **Why it matters**: Module-level mocks (like `vi.mock()`) leak between files without proper process isolation

### E2E Tests (Playwright)

- **Location**: `tests/e2e/specs/*.spec.ts` (all migrated to TypeScript)
- **Configuration**: `playwright.config.ts` with `testDir: './tests/e2e/specs'` and `testMatch: '**/*.spec.{js,ts}'`
- Tests run entirely inside Docker container (no port conflicts with dev servers)

### Combined Coverage

- **Command**: `pnpm coverage:all` (runs unit + E2E + merge)
- **Merge script**: `scripts/merge-coverage.ts` - V8 + Istanbul → `.test-output/merged-coverage/`

## PR Workflow

**Pre-Commit Hook (Husky):**

- Automatically runs on every commit (fast checks only, ~30s):
  1. Prettier formatting check
  2. ESLint validation
  3. TypeScript type checking
  4. Unit tests only (85 tests)
- Output is suppressed for speed, only shows pass/fail status
- If any check fails, commit is blocked with helpful error message
- To bypass (NOT recommended): `git commit --no-verify`

**Pre-Push Hook (Husky):**

- Automatically runs before push (thorough checks, ~2-3 min):
  1. Full test coverage (unit + E2E + merge)
  2. Coverage threshold validation
- Ensures all code pushed to remote has complete test coverage
- To bypass (NOT recommended): `git push --no-verify`

**Before Creating PR:**

1. Hooks handle all checks automatically (pre-commit + pre-push)
2. If hooks are bypassed, manually run: `pnpm lint && pnpm format && pnpm type-check && pnpm coverage:all`

**Automated Checks** (GitHub Actions - `.github/workflows/pr-checks.yml`):

- ESLint validation (must pass)
- Prettier formatting check (must pass)
- TypeScript type check (must pass, strict mode)
- Unit tests (Vitest with Supabase local)
- E2E tests (Playwright with Docker)
- Combined coverage report

**CI Setup**:

- Uses Supabase CLI to start local stack
- Runs tests sequentially (unit first, then E2E)
- All checks must pass before merge

## Security Features

- **Supabase RLS (Row Level Security)**: Database policies enforce authentication for uploads
- **File type validation**: JPEG, PNG only (MIME type validation)
- **File size limits**: 5MB max enforced by Supabase Storage
- **Filename sanitization**: UUID-based paths prevent path traversal

## File Organization Rules

### CRITICAL: Avoid Root Folder Clutter

**DO NOT create files in the root folder unless absolutely necessary**

- ❌ **NEVER** create uppercase markdown files (DEPLOYMENT.md, CONTRIBUTING.md, etc.)
- ❌ **NEVER** create documentation files in root unless explicitly requested
- ✅ Add documentation to README.md or relevant existing files
- ✅ Use appropriate subdirectories:
  - `docs/` - Business/market documentation
  - `scripts/` - Automation scripts
  - `.github/` - CI/CD workflows
  - `.claude/` - AI assistant context

### Root Folder - Allowed Files Only

Essential files only (configs moved to `config/`):

- `package.json`, `pnpm-lock.yaml` - Package manager files
- `.gitignore`, `.dockerignore` - Version control ignore files
- `.nvmrc`, `.pnpmrc` - Tool configuration files
- `.env*` files - Environment variables (required in root by Vite)
- `README.md` - Single source of truth for user docs

**Build/test configuration files in `config/` folder**:

- Build tool configs: `vite.config.ts`, `vitest.config.ts`, `playwright.config.ts`
- Infrastructure configs: `docker-compose.test.yml`

**Tooling configuration files in root** (required for standard tooling/deployment):

- `tsconfig.json` - Required in root for IDE TypeScript support
- `eslint.config.js` - Required in root for IDE/editor integration (also blocks .js/.jsx files)
- `.prettierrc`, `.prettierignore` - Required in root for IDE/editor integration
- `postcss.config.js` - **CRITICAL:** Must stay in root for PostCSS/Vite (DO NOT move to config/)
- `vercel.json` - Required in root by Vercel deployment platform

**Everything else belongs in subdirectories**:

- `.claude/` - AI assistant context
- `.devcontainer/` - Docker development environment
- `.github/` - CI/CD workflows
- `config/` - All configuration files
- `docs/` - Business/market documentation
- `scripts/` - Automation scripts
- `spec/` - Feature specifications
- `src/` - Application code (including index.html)
- `supabase/` - Supabase configuration
- `tests/` - All tests
