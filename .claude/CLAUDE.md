# Slide Bar - Project Context

## Architecture

- **Monorepo**: pnpm workspaces (packages/frontend, packages/backend)
- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Node.js + Express + Prisma + PostgreSQL
- **Testing**: Vitest (unit) + Playwright (E2E)

## Folder Structure

```
slide-bar/
├── .claude/              # AI assistant context
├── .devcontainer/        # Docker development environment
├── .vscode/              # VS Code settings and tasks
├── docs/                 # Business/market documentation
├── e2e/                  # Playwright E2E tests
├── packages/
│   ├── backend/          # Express API + Prisma
│   │   ├── prisma/       # Database schema
│   │   ├── src/
│   │   │   ├── config/   # Configuration files
│   │   │   ├── controllers/  # Request handlers
│   │   │   ├── middleware/   # Auth, upload middleware
│   │   │   ├── routes/   # API routes
│   │   │   └── services/ # Business logic
│   │   └── tests/        # Backend unit tests
│   └── frontend/         # React + Vite + Tailwind
│       ├── src/
│       │   ├── components/  # React components
│       │   ├── pages/    # Page components
│       │   └── lib/      # API client, utilities
│       └── tests/        # Frontend unit tests
└── scripts/              # Dev/test automation scripts
```

## Port Configuration

### Development

- Frontend: 5173
- Backend: 3000
- Database: 5432

### Testing (E2E)

- Test Frontend: 5174
- Test Backend: 3001
- Playwright Report: 9323

## Key Commands

- `pnpm start` - Start dev servers (includes Docker database)
- `pnpm stop` - Stop all dev servers
- `pnpm test` - Run all unit tests
- `pnpm test:e2e` - Run E2E tests
- `pnpm test:coverage` - Run tests with coverage

## Critical Compatibility Notes

- **Node 24**: Prisma requires default import pattern (`import pkg from '@prisma/client'`)
- **Docker**: Database runs in container via .devcontainer/docker-compose.yml
- **macOS ARM**: Requires `@rollup/rollup-darwin-arm64` dependency
- **Platform-Specific Binaries**:
  - **esbuild**: Requires `@esbuild/linux-arm64@0.21.5` for Docker E2E tests (macOS uses darwin-arm64)
  - **Prisma**: Uses `binaryTargets = ["native", "linux-arm64-openssl-1.1.x"]` to support both macOS and Linux Docker container
  - These binaries coexist in node_modules; each platform uses the correct one

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
- 22 unit tests + 7 E2E tests (all passing)
- Lint commands: `pnpm lint`, `pnpm lint:fix`
- Format commands: `pnpm format`, `pnpm format:check`

### When Tests Fail
1. **First**: Check implementation code for bugs (don't relax test assertions)
2. **Avoid**: Making tests accept broader outputs (e.g., changing specific format checks to generic string checks)
3. **Debug**: Understand why the test is failing before making changes

## E2E Test Execution

- Tests run entirely inside Docker container (no port conflicts with dev servers)
- Test script checks if devcontainer app is running, else creates temporary container
- Test servers use ports 3001 (backend) and 5174 (frontend) internally
- Database is cleaned before each test run (slidebar_test database)
- All 7 tests passing: dashboard/auto-login, empty state, upload, validation, deletion, grid display, refresh

## Security Features

- Filename sanitization to prevent path traversal attacks
- Auth middleware required for all upload routes
- File type validation (JPEG, PNG only)
- File size limits enforced
