# Slide Bar - Project Context

## Architecture

- **Frontend-only**: React 18 + Vite + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Testing**: Vitest (integration) + Playwright (E2E)
- **Migration Status**: ✅ Phase 8 complete (Project structure flattened, monorepo removed, all tests consolidated)

## Folder Structure

```
slide-bar/
├── docs/                 # Business/market documentation
├── scripts/              # Dev/test automation scripts
├── spec/                 # Feature specifications (spec-driven development)
├── src/                  # React + Vite + Tailwind
│   ├── components/       # React components
│   ├── lib/              # Supabase API client, utilities
│   └── pages/            # Page components
├── supabase/             # Supabase config, migrations, functions
└── tests/                # All tests (unit + E2E + fixtures)
    ├── config/           # Test configuration (setup.js for Vitest)
    ├── e2e/
    │   ├── fixtures/     # Test assets (images)
    │   ├── specs/        # E2E test files (*.spec.js)
    │   └── support/      # E2E helpers (constants, fixtures, global-setup/teardown)
    ├── helpers/          # Shared test helpers (Supabase cleanup)
    └── unit/
        ├── components/   # Component unit tests (includes App.test.jsx)
        ├── lib/          # Library unit tests
        └── pages/        # Page unit tests
```

## Port Configuration

### Development

- Frontend: 5173
- Supabase API: 54321 (local)
- Supabase Studio: 54323 (local)

### Testing (E2E)

- Test Frontend: 5174
- Playwright Report: 9323

## Key Commands

- `pnpm start` - Start dev servers (includes Docker database)
- `pnpm stop` - Stop all dev servers
- `pnpm test` - Run all unit tests
- `pnpm test:e2e` - Run E2E tests
- `pnpm test:coverage` - Run tests with coverage

## Critical Compatibility Notes

- **Supabase Local**: Runs via Docker (`supabase start`), uses ports 54321-54324
- **macOS ARM**: Requires `@rollup/rollup-darwin-arm64` dependency
- **Platform-Specific Binaries**:
  - **esbuild**: Requires `@esbuild/linux-arm64@0.21.5` for Docker E2E tests (macOS uses darwin-arm64)

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

- ESLint v9 (flat config) - configured and passing
- Prettier for formatting - configured
- Test coverage reporting configured (`pnpm coverage:all`)
- 85 unit tests + 16 E2E tests = 101 total (all passing)
- Coverage: ~97% lines, ~94% statements, ~77% branches, ~94% functions
- Lint commands: `pnpm lint`, `pnpm lint:fix`
- Format commands: `pnpm format`, `pnpm format:check`

### When Tests Fail

1. **First**: Check implementation code for bugs (don't relax test assertions)
2. **Avoid**: Making tests accept broader outputs (e.g., changing specific format checks to generic string checks)
3. **Debug**: Understand why the test is failing before making changes

## Supabase Integration Testing

### Test Architecture

- **unit tests** in `tests/unit/**/*.test.{js,jsx}` calling real Supabase TEST instance (port 55321)
- **E2E tests** in `tests/e2e/specs/*.spec.js`
- **Isolated from dev**: Unit tests use TEST Supabase (port 55321), dev uses main Supabase (port 54321)
- **Shared TEST instance**: Both unit and E2E tests use the same TEST instance (started by E2E script)
- **Test helpers** in `tests/helpers/supabase.js`:
  - `createServiceClient()` - Service role client bypassing RLS for cleanup
  - `cleanDatabase()` - Delete all test data using service role
  - `useSupabaseCleanup()` - Automatic cleanup after each test
  - `createMockImageFile()` - Custom file-like objects for uploads

## Test Organization

### Unit/Integration Tests (Vitest)

- **Location**: `tests/unit/**/*.test.{js,jsx}`
- **Configuration**: `vitest.config.js` with `include: ['tests/unit/**/*.{test,spec}.{js,jsx}']`
- **CRITICAL**: Sequential execution via `pool: 'forks', singleFork: true` (prevents database race conditions)

### E2E Tests (Playwright)

- **Location**: `tests/e2e/specs/*.spec.js`
- **Configuration**: `playwright.config.mjs` with `testDir: './tests/e2e/specs'` and `testMatch: '**/*.spec.js'`
- Tests run entirely inside Docker container (no port conflicts with dev servers)

### Combined Coverage

- **Command**: `pnpm coverage:all` (runs unit + E2E + merge)
- **Merge script**: `scripts/merge-coverage.js` - V8 + Istanbul → `.test-output/merged-coverage/`

## PR Workflow

**Before Creating PR:**

1. Fix lint errors: `pnpm lint` (0 errors required)
2. Format code: `pnpm format`
3. Run full coverage: `pnpm coverage:all` (unit + E2E + merge)

**Automated Checks** (GitHub Actions - `.github/workflows/pr-checks.yml`):

- ESLint validation (must pass)
- Prettier formatting check (must pass)
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

Essential configuration files only:

- `package.json`, `pnpm-lock.yaml` (no workspace config - flat structure)
- `.gitignore`, `.prettierrc`, `eslint.config.js`
- `playwright.config.mjs`, `vitest.config.js`, `vite.config.js`
- `index.html`, `postcss.config.js`, `tailwind.config.js` (Vite/frontend configs)
- `docker-compose.e2e.yml` (E2E test infrastructure)
- `README.md` (single source of truth for user docs)

**Everything else belongs in subdirectories**:

- `.claude/` - AI assistant context
- `.devcontainer/` - Docker development environment
- `.github/` - CI/CD workflows
- `docs/` - Business/market documentation
- `scripts/` - Automation scripts
- `spec/` - Feature specifications
- `src/` - Application code
- `supabase/` - Supabase configuration
- `tests/` - All tests
