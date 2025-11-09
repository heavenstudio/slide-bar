# Migrate to Latest LTS/Stable Versions

**Status**: 🟡 In Progress
**Started**: 2025-11-09
**Branch**: `feat/migrate-to-latest-versions`
**Approach**: Phased migration with TDD - update dependencies in stages, run tests after each phase

## Goal

Migrate all packages and runtimes to their latest LTS/stable versions to ensure security, performance, and access to latest features while maintaining compatibility.

## Current vs Target Versions

### Runtimes

| Package      | Current | Target                  | Status            |
| ------------ | ------- | ----------------------- | ----------------- |
| Node.js      | 24.7.0  | 24.11.0 (LTS "Krypton") | ⚠️ Minor update   |
| pnpm         | 10.20.0 | 10.20.0                 | ✅ Already latest |
| Supabase CLI | 2.54.11 | 2.54.11                 | ✅ Already latest |

### Core Dependencies

| Package      | Current | Target | Notes                                   |
| ------------ | ------- | ------ | --------------------------------------- |
| React        | 18.2.0  | 19.2.0 | ⚠️ Major - Breaking changes             |
| React DOM    | 18.2.0  | 19.2.0 | ⚠️ Major - Breaking changes             |
| React Router | 6.20.1  | 7.9.5  | ⚠️ Major - Requires React 18+, Node 20+ |
| Supabase JS  | 2.80.0  | 2.80.0 | ✅ Already latest                       |
| Vite         | 5.4.21  | 7.2.2  | ⚠️ Major - Requires Node 20.19+         |

### Dev Dependencies

| Package                   | Current | Target                     | Priority |
| ------------------------- | ------- | -------------------------- | -------- |
| @vitejs/plugin-react      | 4.7.0   | Latest for Vite 7          | High     |
| @playwright/test          | 1.56.1  | Latest                     | Medium   |
| @testing-library/react    | 14.1.2  | Latest (React 19 compat)   | High     |
| @testing-library/jest-dom | 6.1.5   | Latest                     | Medium   |
| Vitest                    | 1.0.4   | Latest                     | High     |
| @vitest/coverage-v8       | 1.0.0   | Latest                     | High     |
| ESLint                    | 9.39.1  | Latest                     | Low      |
| Prettier                  | 3.6.2   | Latest                     | Low      |
| Tailwind CSS              | 3.3.6   | 4.0.0 ✅ Stable (Jan 2025) | High     |
| PostCSS                   | 8.4.32  | Latest                     | Low      |
| Autoprefixer              | 10.4.16 | Latest                     | Low      |

## Migration Phases

### Phase 1: Pre-Migration Preparation ✅

**Goal**: Ensure clean baseline before migrations

- [x] Create feature branch `feat/migrate-to-latest-versions`
- [x] Research latest versions of all dependencies
- [x] Document current state (package.json snapshot in spec)
- [x] Run full test suite to establish baseline
  - Unit tests: `pnpm test` → 85 passing
  - E2E tests: `pnpm test:e2e` -> 16 passing
  - Linting: `pnpm lint` → 0 errors ✅
  - Formatting: `pnpm format:check` → all formatted ✅
- [x] Document baseline state (85 unit tests, 16 e2e tests, no failures)
- [x] Commit spec file (df851ef)

**Baseline State**:

- Tests (CI): 85/85 passing ✅ (source of truth)
- Tests (Local): 85 passing
- E2E Tests (Local): 16 passing
- Lint: 0 errors ✅
- Format: All files formatted ✅
- Note: CI is green - local failures are flaky timing issues, not blockers

**Success Criteria**: ✅ Spec committed, baseline documented, ready to proceed

---

### Phase 2: Update Node.js & Runtime ✅

**Goal**: Update Node.js to latest LTS 24.11.0

- [x] Update Node.js to 24.11.0 using nvm/fnm
- [x] Create `.nvmrc` file with version 24.11.0
- [x] Update `package.json` engines field (Node >=24.11.0, pnpm >=10.20.0)
- [x] Verify Supabase CLI compatibility with Node 24.11.0 (v2.54.11 compatible)
- [x] Update `.github/workflows/pr-checks.yml` Node version to 24.11.0
- [x] Update `.devcontainer/Dockerfile` Node version to 24.11.0-bullseye
- [x] Rebuild Docker images for E2E tests
- [x] Run tests: `pnpm test` (85/85 passing)
- [x] Run E2E tests: `pnpm test:e2e` (16/16 passing)
- [x] Set nvm default to 24.11.0
- [x] Verify dev server runs correctly

**Success Criteria**: ✅ Node 24.11.0 installed, all tests passing, committed (84b6c53)

---

### Phase 3: Update Vite Ecosystem (Major) ✅

**Goal**: Migrate from Vite 5 → Vite 7

**Dependencies to update**:

- `vite`: 5.4.21 → 7.2.2
- `@vitejs/plugin-react`: 4.7.0 → 5.1.0
- `@esbuild/linux-arm64`: 0.21.5 → 0.25.12 (matches Vite 7's bundled esbuild)

**Breaking Changes**:

- Requires Node.js 20.19+ (we have 24.11.0 ✅)
- ESM-only distribution
- Browser target changed to 'baseline-widely-available'
- Check for plugin compatibility

**Steps**:

- [x] Read Vite 6 and Vite 7 migration guides
- [x] Update Vite packages (vite 7.2.2, @vitejs/plugin-react 5.1.0)
- [x] Update `vite.config.js` for Vite 7 changes (no changes needed - clean config)
- [x] Update `vitest.config.js` if needed (no changes needed)
- [x] Run dev server: `pnpm dev` (Vite 7.2.2 ready in 451ms ✅)
- [x] Run build: `pnpm build` (553KB bundle, 160KB gzipped ✅)
- [x] Run tests: `pnpm test` (85/85 passing ✅)
- [x] Fix esbuild version mismatch for Docker E2E tests (0.25.12)
- [x] Rebuild Docker images with new Vite version
- [x] Run E2E tests: `pnpm test:e2e` (16/16 passing ✅)

**Success Criteria**: ✅ Vite 7 running, dev/build working, all tests passing, committed (2a00adb, 3f27c40)

---

### Phase 4: Update React Ecosystem (Major)

**Goal**: Migrate from React 18 → React 19

**Dependencies to update**:

- `react`: 18.2.0 → 19.2.0
- `react-dom`: 18.2.0 → 19.2.0
- `@testing-library/react`: 14.1.2 → latest (React 19 compatible)
- `@vitejs/plugin-react`: Ensure compatibility with React 19

**Breaking Changes** (from React 19):

- New Actions API
- React Server Components (may not affect client-only app)
- Changes to hooks behavior
- ref as a prop (no longer special-cased)
- `useFormStatus` and `useFormState` now `useActionState`
- Context as a provider (`<Context>` instead of `<Context.Provider>`)

**Steps**:

- [ ] Read React 19 migration guide
- [ ] Update React packages
- [ ] Check for deprecated patterns in codebase
- [ ] Update testing library for React 19
- [ ] Run tests: `pnpm test`
- [ ] Fix any breaking changes in components
- [ ] Run E2E tests: `pnpm test:e2e`
- [ ] Verify all user flows work

**Success Criteria**: React 19 installed, no deprecation warnings, all tests passing

---

### Phase 5: Update React Router (Major)

**Goal**: Update React Router to latest version

**Steps**:

- [ ] Check latest React Router version
- [ ] Read migration guide (if major version change)
- [ ] Update `react-router-dom`
- [ ] Check for breaking changes in routing code
- [ ] Run tests: `pnpm test && pnpm test:e2e`
- [ ] Verify navigation works in dev: `pnpm dev`

**Success Criteria**: Latest React Router installed, all routes working, tests passing

---

### Phase 6: Update Testing Infrastructure

**Goal**: Update Vitest, Playwright, and testing libraries

**Dependencies to update**:

- `vitest`: 1.0.4 → latest
- `@vitest/coverage-v8`: 1.0.0 → latest
- `@playwright/test`: 1.56.1 → latest
- `@testing-library/jest-dom`: 6.1.5 → latest
- `@testing-library/user-event`: 14.5.1 → latest
- `jsdom`: 23.0.1 → latest

**Steps**:

- [ ] Update Vitest and coverage packages
- [ ] Update `vitest.config.js` for new version
- [ ] Update Playwright
- [ ] Update testing libraries
- [ ] Run unit tests: `pnpm test`
- [ ] Run coverage: `pnpm test:coverage`
- [ ] Run E2E tests: `pnpm test:e2e`
- [ ] Verify coverage reporting works
- [ ] Run full coverage: `pnpm coverage:all`

**Success Criteria**: All testing tools updated, tests passing, coverage reports working

---

### Phase 7: Update Build & Dev Tools

**Goal**: Update remaining build tools and utilities

**Dependencies to update**:

- `eslint`: 9.39.1 → latest
- `eslint-plugin-react`: 7.37.5 → latest
- `eslint-plugin-react-hooks`: 7.0.1 → latest (check React 19 compat)
- `prettier`: 3.6.2 → latest
- `tailwindcss`: 3.3.6 → latest (check if v4 is stable)
- `autoprefixer`: 10.4.16 → latest
- `postcss`: 8.4.32 → latest
- Platform-specific packages:
  - `@rollup/rollup-darwin-arm64`: 4.53.0 → latest
  - `@rollup/rollup-linux-arm64-gnu`: 4.53.0 → latest
  - `@esbuild/linux-arm64`: 0.21.5 → latest

**Steps**:

- [ ] Update ESLint ecosystem
- [ ] Run linting: `pnpm lint`
- [ ] Fix any new lint errors
- [ ] Update Prettier
- [ ] Run formatting: `pnpm format`
- [ ] Check Tailwind CSS v4 stability
- [ ] Update Tailwind (v3 latest or v4 if stable)
- [ ] Update PostCSS ecosystem
- [ ] Update platform-specific packages
- [ ] Run build: `pnpm build`
- [ ] Run all tests: `pnpm test && pnpm test:e2e`

**Success Criteria**: All dev tools updated, no lint/format errors, build successful

---

### Phase 8: Update Remaining Dependencies

**Goal**: Update smaller utility packages

**Dependencies to update**:

- `uuid`: 13.0.0 → latest
- `globals`: 16.5.0 → latest
- `c8`: 10.1.3 → latest (or remove if not needed with Vitest coverage)
- `nyc`: 17.1.0 → latest (or remove if not needed)
- `@istanbuljs/nyc-config-typescript`: 1.0.2 → latest

**Steps**:

- [ ] Review if c8/nyc are still needed (Vitest has coverage)
- [ ] Update or remove coverage tools
- [ ] Update uuid and other utilities
- [ ] Run tests: `pnpm test && pnpm test:e2e`
- [ ] Run coverage: `pnpm coverage:all`

**Success Criteria**: Unused packages removed, utilities updated, tests passing

---

### Phase 9: Update CI/CD & Docker

**Goal**: Update CI configuration and Docker images

**Files to update**:

- `.github/workflows/pr-checks.yml`
- `docker-compose.e2e.yml`
- `.devcontainer/Dockerfile`

**Steps**:

- [ ] Update GitHub Actions Node version to 24.11.0
- [ ] Update Docker images to use Node 24.11.0
- [ ] Update Supabase CLI version in CI
- [ ] Update Playwright version in Docker
- [ ] Test CI locally if possible
- [ ] Push branch and verify CI passes

**Success Criteria**: CI using latest versions, all checks passing on GitHub

---

### Phase 10: Final Verification & Documentation

**Goal**: Comprehensive testing and documentation updates

**Steps**:

- [ ] Run full test suite locally
  - `pnpm lint` (0 errors)
  - `pnpm format:check` (all files formatted)
  - `pnpm test` (all unit tests passing)
  - `pnpm test:e2e` (all E2E tests passing)
  - `pnpm coverage:all` (coverage >90%)
- [ ] Run dev server: `pnpm dev` (manual smoke test)
- [ ] Build production: `pnpm build` (verify bundle size)
- [ ] Preview build: `pnpm preview` (test production build)
- [ ] Update `README.md` with new version requirements
- [ ] Update `.claude/CLAUDE.md` with new versions
- [ ] Update `package.json` engines field
- [ ] Check for any deprecation warnings in console
- [ ] Performance comparison (build time, bundle size, test speed)
- [ ] Review CHANGELOG or create migration notes

**Success Criteria**:

- All tests passing (101/101)
- No lint/format errors
- No console warnings
- Documentation updated
- Performance acceptable or improved

---

## Testing Strategy (TDD)

After each phase:

1. Run `pnpm lint` - must pass with 0 errors
2. Run `pnpm test` - all unit tests must pass
3. Run `pnpm test:e2e` - all E2E tests must pass
4. If tests fail, fix code (not tests) first
5. Only proceed to next phase when current phase is green

## Rollback Plan

- Each phase is in a separate commit
- If a phase fails and can't be fixed, revert that commit
- Branch can be rebased/squashed before merge to main
- Keep detailed notes on what broke and why

## Risk Assessment

**High Risk**:

- React 18 → 19 (major version, potential breaking changes)
- Vite 5 → 7 (major version, build system changes)

**Medium Risk**:

- React Router update (if major version)
- Tailwind CSS v4 (if migrating, new architecture)
- Testing library updates (API changes possible)

**Low Risk**:

- Node.js 24.7 → 24.11 (LTS minor update)
- Supabase JS (already on latest)
- ESLint/Prettier (formatting tools)

## Success Metrics

- ✅ All 101 tests passing
- ✅ 0 ESLint errors
- ✅ 0 console warnings
- ✅ Coverage ≥90%
- ✅ Build successful
- ✅ CI/CD passing
- ✅ Production deployment successful
- 📊 Build time: TBD (compare before/after)
- 📊 Bundle size: TBD (compare before/after)
- 📊 Test execution time: TBD (compare before/after)

## Notes

- **React 19**: Major upgrade with new features (Actions API, Server Components, ref as prop)
- **React Router 7**: Major upgrade, requires React 18+, Node 20+, unified package
- **Vite 7**: Requires Node 20.19+, ESM-only, new browser targets, 5-100x faster
- **Tailwind CSS 4**: Stable as of Jan 2025, requires Safari 16.4+/Chrome 111+/Firefox 128+
- **Node 24 LTS "Krypton"**: Active support until April 2028
- **pnpm**: Already on latest (10.20.0)
- **Supabase JS**: Already on latest (2.80.0)
- **Supabase CLI**: Already on latest (2.54.11)

## Progress Tracking

**Current Phase**: Phase 4 (Update React Ecosystem)
**Completed Phases**: 3/10 ✅
**Blockers**: None
**Next Steps**: Update React 18 → React 19 (major version)
