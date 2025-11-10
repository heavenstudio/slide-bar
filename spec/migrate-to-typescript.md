# Migrate to TypeScript

**Status**: 🟡 In Progress
**Started**: 2025-11-09
**Approach**: Incremental migration with TDD validation at each phase

## Goal

Migrate the entire Slide Bar codebase from JavaScript to TypeScript to improve:

- **Code quality** with AI-assisted development (Claude Code)
- **Type safety** at compile-time
- **Developer experience** with better IntelliSense
- **Supabase integration** with auto-generated database types
- **Maintainability** as the codebase grows

## Migration Scope

- **~30 files to convert**: 9 source files, 14 test files, 5 config files, 2 scripts
- **New dependencies**: TypeScript core + React types + ESLint TS support (~6 packages)
- **Zero tooling friction**: Vite/Vitest have native TypeScript support
- **Database types**: Auto-generate from Supabase schema

## Success Criteria

- ✅ All 85 unit tests passing
- ✅ All 16 E2E tests passing
- ✅ Test coverage maintained (>90%)
- ✅ No TypeScript errors with strict mode enabled
- ✅ CI/CD pipeline includes type checking
- ✅ Build and dev server working correctly
- ✅ Supabase types generated and integrated

---

## Phase 1: TypeScript Setup

**Goal**: Install TypeScript and create base configuration

### Tasks

- [ ] Install TypeScript dependencies
  - `typescript` (latest stable)
  - `@types/node` (for Node.js APIs in config files)
  - `@types/react` (React 19 compatible)
  - `@types/react-dom` (React 19 compatible)
  - `@typescript-eslint/parser` (ESLint v9 compatible)
  - `@typescript-eslint/eslint-plugin` (ESLint v9 compatible)
- [ ] Create `tsconfig.json` with lenient initial config
- [ ] Create `tsconfig.node.json` for build tools (optional)
- [ ] Add `type-check` script to package.json
- [ ] Run `pnpm test` to verify no breakage

**Success Criteria**: Tests pass, TypeScript installed, no errors

---

## Phase 2: Generate Supabase Types

**Goal**: Auto-generate TypeScript types from database schema

### Tasks

- [ ] Run `supabase gen types typescript --local` to generate types
- [ ] Create `src/types/supabase.ts` with generated types
- [ ] Create `src/types/database.ts` for helper types
- [ ] Run `pnpm test` to verify

**Success Criteria**: Database types generated, tests pass

---

## Phase 3: Configuration Files

**Goal**: Convert build tool configs to TypeScript

### Tasks

- [ ] Convert `vite.config.js` → `vite.config.ts`
- [ ] Convert `vitest.config.js` → `vitest.config.ts`
- [ ] Convert `playwright.config.mjs` → `playwright.config.ts`
- [ ] Update `eslint.config.js` to support TypeScript parsing
- [ ] Update `index.html` script tag if needed
- [ ] Run `pnpm test` (unit tests)
- [ ] Run `pnpm test:e2e` (E2E tests)

**Success Criteria**: All configs converted, all tests pass

---

## Phase 4: Test Infrastructure (TDD Foundation)

**Goal**: Convert test helpers and setup files to TypeScript

### Tasks

- [ ] Convert `tests/config/setup.js` → `setup.ts`
- [ ] Convert `tests/helpers/supabase.js` → `supabase.ts`
  - Type `createServiceClient()` return value
  - Type `cleanDatabase()` function
  - Type `useSupabaseCleanup()` hook
  - Type `createMockImageFile()` return value
- [ ] Update imports in test files (keep .js extension initially)
- [ ] Run `pnpm test` to verify helpers work

**Success Criteria**: Test helpers typed, unit tests pass

---

## Phase 5: Core Library Files

**Goal**: Convert Supabase API and utility files to TypeScript

### Tasks

#### lib/supabase.ts

- [ ] Convert `src/lib/supabase.js` → `src/lib/supabase.ts`
- [ ] Import Supabase types from generated types
- [ ] Type the `supabase` client export
- [ ] Run `pnpm test` → should pass

#### lib/supabaseApi.ts

- [ ] Convert `src/lib/supabaseApi.js` → `src/lib/supabaseApi.ts`
- [ ] Type all function signatures:
  - `demoLogin()` return type
  - `uploadImage()` parameters and return type
  - `getUserImages()` return type
  - `deleteImage()` parameter and return type
- [ ] Use generated database types for responses
- [ ] Run `pnpm test` → should pass

#### lib/api.js

- [ ] Convert `src/lib/api.js` → `src/lib/api.ts`
- [ ] Type all function signatures
- [ ] Run `pnpm test` → should pass

**Success Criteria**: All lib files typed, tests pass

---

## Phase 6: Components (TDD)

**Goal**: Convert React components to TypeScript with prop typing

### Tasks

#### ImageUpload Component

- [ ] Convert `tests/unit/components/ImageUpload.test.jsx` → `ImageUpload.test.tsx`
- [ ] Run tests → should fail with TS errors
- [ ] Convert `src/components/upload/ImageUpload.jsx` → `ImageUpload.tsx`
  - Define `ImageUploadProps` interface
  - Type component props
  - Type state variables
  - Type event handlers
- [ ] Run tests → should pass

#### ImageGrid Component

- [ ] Convert `tests/unit/components/ImageGrid.test.jsx` → `ImageGrid.test.tsx`
- [ ] Run tests → should fail with TS errors
- [ ] Convert `src/components/upload/ImageGrid.jsx` → `ImageGrid.tsx`
  - Define `ImageGridProps` interface
  - Type component props
  - Type state variables
- [ ] Run tests → should pass

#### App Component

- [ ] Convert `tests/unit/components/App.test.jsx` → `App.test.tsx`
- [ ] Run tests → should fail with TS errors
- [ ] Convert `src/App.jsx` → `src/App.tsx`
  - Type state variables
  - Type navigation functions
- [ ] Run tests → should pass

**Success Criteria**: All components typed, tests pass

---

## Phase 7: Pages (TDD)

**Goal**: Convert page components to TypeScript

### Tasks

#### Dashboard Page

- [ ] Convert `tests/unit/pages/Dashboard.test.jsx` → `Dashboard.test.tsx`
- [ ] Run tests → should fail with TS errors
- [ ] Convert `src/pages/Dashboard.jsx` → `Dashboard.tsx`
  - Type state variables
  - Type handler functions
- [ ] Run tests → should pass

#### Player Page

- [ ] Convert `tests/unit/pages/Player.test.jsx` → `Player.test.tsx`
- [ ] Run tests → should fail with TS errors
- [ ] Convert `src/pages/Player.jsx` → `Player.tsx`
  - Type state variables
  - Type interval management
- [ ] Run tests → should pass

**Success Criteria**: All pages typed, tests pass

---

## Phase 8: Entry Point

**Goal**: Convert application entry point to TypeScript

### Tasks

- [ ] Convert `src/main.jsx` → `src/main.tsx`
- [ ] Update `index.html` script tag from `main.jsx` to `main.tsx`
- [ ] Run `pnpm test`
- [ ] Run `pnpm dev` to verify app starts

**Success Criteria**: Entry point converted, app runs

---

## Phase 9: E2E Tests

**Goal**: Convert Playwright E2E tests to TypeScript

### Tasks

#### E2E Support Files

- [ ] Convert `tests/e2e/support/constants.js` → `constants.ts`
- [ ] Convert `tests/e2e/support/fixtures.js` → `fixtures.ts`
- [ ] Convert `tests/e2e/support/global-setup.js` → `global-setup.ts`
- [ ] Convert `tests/e2e/support/global-teardown.js` → `global-teardown.ts`

#### E2E Spec Files

- [ ] Convert `tests/e2e/specs/image-upload.spec.js` → `image-upload.spec.ts`
  - Type page objects
  - Type test fixtures
- [ ] Convert `tests/e2e/specs/player.spec.js` → `player.spec.ts`
  - Type page objects
  - Type test fixtures

#### Verification

- [ ] Run `pnpm test:e2e` → all 16 tests should pass

**Success Criteria**: All E2E tests converted and passing

---

## Phase 10: Scripts (Optional)

**Goal**: Convert Node.js scripts to TypeScript

### Tasks

- [ ] Convert `scripts/merge-coverage.js` → `merge-coverage.ts`
  - May need `tsx` or `ts-node` to run
  - Or keep as .js if simple
- [ ] Convert `scripts/check-coverage.js` → `check-coverage.ts`
- [ ] Test scripts work: `pnpm coverage:all`

**Success Criteria**: Scripts converted or decision to keep as JS

---

## Phase 11: Strict Mode & Cleanup

**Goal**: Enable strict TypeScript checking and fix all errors

### Tasks

- [ ] Enable `strict: true` in `tsconfig.json`
- [ ] Run `pnpm type-check` → fix all errors
- [ ] Remove any `any` types or `@ts-ignore` comments
- [ ] Add type assertions where needed
- [ ] Run `pnpm test` → all tests pass
- [ ] Run `pnpm test:e2e` → all tests pass

**Success Criteria**: Strict mode enabled, no TypeScript errors, all tests pass

---

## Phase 12: CI/CD & Finalization

**Goal**: Update CI/CD pipeline and verify everything works

### Tasks

- [ ] Add `pnpm type-check` step to `.github/workflows/pr-checks.yml`
- [ ] Run `pnpm lint` → 0 errors
- [ ] Run `pnpm format` → format all files
- [ ] Run `pnpm coverage:all` → verify coverage maintained
- [ ] Verify CI/CD pipeline passes locally
- [ ] Update `.gitignore` if needed (add `.tsbuildinfo`)
- [ ] Update README.md with TypeScript info (if needed)

**Success Criteria**: CI/CD updated, all checks pass, ready to commit

---

## Progress Tracking

### Completed Phases

- ✅ Branch created: `migrate-to-typescript`
- ✅ Spec file created: `spec/migrate-to-typescript.md`

### Current Phase

- 🟡 Phase 1: TypeScript Setup

### Remaining Phases

- Phase 2-12 pending

---

## Notes & Learnings

### TypeScript Configuration Choices

- Starting with lenient config (`strict: false`) to allow incremental migration
- Will enable strict mode in Phase 11 after all files converted
- Using `"module": "ESNext"` and `"moduleResolution": "bundler"` for Vite compatibility

### Testing Strategy

- Running tests after each file conversion (TDD approach)
- Unit tests validate library and component logic
- E2E tests validate full application flow
- Coverage validation at the end

### Potential Challenges

- File upload typing (File/Blob objects in tests)
- Supabase response types (may need manual adjustments)
- Mock object typing in tests
- ESLint v9 flat config + TypeScript integration

### Benefits Observed

_(To be filled in during migration)_

---

## References

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Vite TypeScript Guide](https://vite.dev/guide/features.html#typescript)
- [Vitest TypeScript Guide](https://vitest.dev/guide/coverage.html#typescript)
- [Supabase Type Generation](https://supabase.com/docs/guides/api/generating-types)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
