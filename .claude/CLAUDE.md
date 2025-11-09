# Slide Bar - Project Context

## Architecture

- **Frontend-only**: React 18 + Vite + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Testing**: Vitest (integration) + Playwright (E2E)
- **Migration Status**: ✅ Phase 8 complete (Project structure flattened, monorepo removed, all tests consolidated)

## Folder Structure

```
slide-bar/
├── .claude/              # AI assistant context
├── .devcontainer/        # Docker development environment
├── docs/                 # Business/market documentation
├── src/                  # React + Vite + Tailwind
│   ├── components/       # React components
│   ├── pages/            # Page components
│   └── lib/              # Supabase API client, utilities
├── tests/                # All tests (unit + E2E + fixtures)
│   ├── components/       # Component tests
│   ├── pages/            # Page tests
│   ├── helpers/          # Test helpers (Supabase cleanup, etc.)
│   ├── fixtures/         # Test fixtures (images, Playwright config)
│   ├── *.test.js(x)      # Unit/integration tests (Vitest)
│   ├── *.spec.js         # E2E tests (Playwright)
│   ├── config.js         # E2E test configuration
│   ├── fixtures.js       # Playwright fixtures
│   ├── global-setup.js   # E2E global setup
│   └── global-teardown.js # E2E global teardown
├── scripts/              # Dev/test automation scripts
└── supabase/             # Supabase config, migrations, functions
    ├── config.toml       # Local Supabase configuration
    └── migrations/       # Database schema migrations
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

## Code Quality & Testing Practices

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
- Test coverage reporting configured (`pnpm test:coverage`)
- 18 integration tests + 13 E2E tests (all passing)
- Lint commands: `pnpm lint`, `pnpm lint:fix`
- Format commands: `pnpm format`, `pnpm format:check`

### When Tests Fail

1. **First**: Check implementation code for bugs (don't relax test assertions)
2. **Avoid**: Making tests accept broader outputs (e.g., changing specific format checks to generic string checks)
3. **Debug**: Understand why the test is failing before making changes

## Supabase Integration Testing

### Test Architecture

- **18 integration tests** calling real Supabase TEST instance (`http://127.0.0.1:55321`)
- **Isolated from dev**: Unit tests use TEST Supabase (port 55321), dev uses main Supabase (port 54321)
- **Shared with E2E**: Both unit and E2E tests use the same TEST instance (started by E2E script)
- **Test helpers** in `tests/helpers/supabase.js`:
  - `createServiceClient()` - Service role client bypassing RLS for cleanup
  - `cleanDatabase()` - Delete all test data using service role
  - `useSupabaseCleanup()` - Automatic cleanup after each test
  - `createMockImageFile()` - Custom file-like objects for uploads

### Critical Challenges Solved

1. **Test Data Isolation**
   - **Problem**: Unit tests were deleting dev data from port 54321
   - **Solution**: Point unit tests to TEST Supabase (port 55321) via vitest.config.js
   - **Result**: Dev data on port 54321 is never touched by tests

2. **jsdom MIME Type Limitations**
   - **Problem**: jsdom's File API doesn't preserve MIME types (converts to `text/plain`)
   - **Solution**: Custom file-like object with `arrayBuffer()` + explicit `contentType` in Supabase upload
   - **Location**: `tests/helpers/supabase.js:createMockImageFile()`, `src/lib/supabaseApi.js:uploadImage()`

3. **Sequential Test Execution Required**
   - **Problem**: Parallel tests cause race conditions with shared database state
   - **Solution**: Configure Vitest with `pool: 'forks', singleFork: true` in `vitest.config.js`

4. **Console Warning Noise**
   - **Problem**: "Multiple GoTrueClient instances" warnings clutter test output
   - **Solution**: Filter `console.warn` in `tests/setup.js` to suppress expected warnings

5. **DOM Cleanup Between Test Files**
   - **Problem**: Sequential execution caused DOM elements to persist across test files
   - **Solution**: Add `cleanup()` call in `beforeEach` hooks

6. **Vitest/Playwright Expect Conflict**
   - **Problem**: Both frameworks tried to extend global `expect` object, causing `Cannot redefine property: Symbol($jest-matchers-object)` error
   - **Solution**: Added `testMatch: '**/*.spec.js'` to `playwright.config.mjs` to prevent Playwright from loading Vitest setup files
   - **Location**: `playwright.config.mjs:10`

## Test Organization

### Unit/Integration Tests (Vitest)
- **Location**: `tests/*.test.js(x)`, `tests/components/`, `tests/pages/`
- **Count**: 18 tests (4 test files)
- **Performance**: ~1.5 seconds
- **Database**: Uses TEST Supabase instance (port 55321)
- **Helpers**: `tests/helpers/supabase.js` for database cleanup
- **Configuration**: `vitest.config.js` excludes `tests/*.spec.js` (Playwright tests)

### E2E Tests (Playwright)
- **Location**: `tests/*.spec.js`
- **Count**: 13 tests (2 test files)
- **Performance**: ~6 seconds
- **Database**: Uses TEST Supabase instance (port 55321), shared with unit tests
- **Fixtures**: `tests/fixtures.js` for Playwright test helpers
- **Configuration**: `playwright.config.mjs` points to `./tests` directory with `testMatch: '**/*.spec.js'`
- **Global Setup/Teardown**: `tests/global-setup.js`, `tests/global-teardown.js`
- Tests run entirely inside Docker container (no port conflicts with dev servers)
- All 13 tests passing:
  - 7 image upload tests (dashboard, upload, delete, grid, validation)
  - 6 player tests (public access, empty state, fullscreen, controls, dashboard link)

## PR Workflow

**Automated Checks** (GitHub Actions):

- ESLint validation
- Prettier formatting check
- Unit tests (all packages)

**Before Creating PR:**

1. Fix lint errors: `pnpm lint` (0 errors required)
2. Format code: `pnpm format`
3. Run tests: `pnpm test` (all passing)
4. Optional: Run E2E tests: `pnpm test:e2e`

**CI Workflow** (`.github/workflows/pr-checks.yml`):

- Runs on all PRs to main/master
- Jobs: lint-and-format, test-unit
- Must pass before merge

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
- `README.md` (single source of truth for docs)

**Everything else belongs in subdirectories**
