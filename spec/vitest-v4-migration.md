# Vitest v4 Migration

**Status**: 🟡 In Progress
**Started**: 2025-11-10
**Branch**: `feat/vitest-v4-migration`
**Approach**: Modernize to Vitest v3 best practices first, then upgrade to v4 with TDD

## Goal

Upgrade from Vitest v3.2.4 to Vitest v4.x while ensuring all tests pass and follow modern best practices. This migration was previously attempted but failed due to timeout issues in Player tests (5/85 tests failed). By first modernizing our test code to use v3 best practices and addressing potential compatibility issues proactively, we aim for a clean v4 upgrade.

## Current State Analysis

### Test Suite Baseline

- **Unit tests**: 85 passing ✅
- **E2E tests**: 16 passing ✅
- **Current Vitest version**: 3.2.4
- **Target Vitest version**: 4.0.8 (latest stable)

### Current Mocking Patterns Audit

✅ **Already following modern practices**:

- Only 1 `vi.mock()` usage (ImageUpload.test.tsx) - properly hoisted
- 2 `vi.spyOn()` usages - modern pattern
- Extensive `vi.fn()` usage - all correct
- No deprecated Jest globals
- Proper cleanup with `vi.clearAllMocks()`

⚠️ **Opportunities for improvement**:

1. **Direct property mutation** (supabaseApi.test.ts):
   - Pattern: `supabase.auth.signOut = vi.fn().mockResolvedValue(...)`
   - Should use: `vi.spyOn(supabase.auth, 'signOut').mockResolvedValue(...)`
2. **Complex nested mocks** (supabaseApi.test.ts):
   - Deep `vi.fn()` chains for Supabase client
   - Could benefit from mock factory pattern
3. **Type assertions**: Some mocks use `as any` for type compatibility
4. **No use of `vi.mocked()`** helper for better type inference

### Vitest v4 Breaking Changes

From [migration guide](https://vitest.dev/guide/migration.html):

1. **vi.mock() factory must return explicit object**:

   ```typescript
   // v3 (auto-default)
   vi.mock('./path', () => 'hello');

   // v4 (explicit)
   vi.mock('./path', () => ({ default: 'hello' }));
   ```

2. **vi.fn().getMockName() changes**: Returns `"vi.fn()"` instead of `"spy"` (affects snapshots)

3. **Automocked getters behavior**: No longer invoke original getter (return `undefined`)

4. **mock.invocationCallOrder**: Now starts at `1` instead of `0` (Jest parity)

5. **vi.restoreAllMocks() behavior**: No longer resets automock state

6. **Constructor support**: `vi.spyOn()` and `vi.fn()` now support `new` keyword

## Migration Phases

### Phase 1: Pre-Migration Audit ✅

**Goal**: Document current state and create migration spec

- [x] Create feature branch `feat/vitest-v4-migration`
- [x] Analyze all test files for mocking patterns
- [x] Document current test baseline (85 unit, 16 E2E, all passing)
- [x] Research Vitest v3 best practices
- [x] Research Vitest v4 breaking changes
- [x] Create this specification document
- [ ] Commit spec file

**Success Criteria**: ✅ Branch created, audit complete, spec documented

---

### Phase 2: Modernize to Vitest v3 Best Practices

**Goal**: Update all tests to use modern Vitest v3 patterns before v4 upgrade

#### Step 2.1: Replace Direct Property Mutation with vi.spyOn()

**Files to update**:

- `tests/unit/lib/supabaseApi.test.ts` (multiple instances)

**Pattern changes**:

```typescript
// BEFORE (direct mutation)
const originalSignOut = supabase.auth.signOut;
supabase.auth.signOut = vi.fn().mockResolvedValue({ error });
// ... test
supabase.auth.signOut = originalSignOut;

// AFTER (vi.spyOn with auto-restore)
const signOutSpy = vi.spyOn(supabase.auth, 'signOut').mockResolvedValue({ error });
// ... test
// Cleanup handled by vi.clearAllMocks() in afterEach
```

**Locations in supabaseApi.test.ts**:

- Line ~75: `supabase.auth.signInWithPassword` mutation
- Line ~95: `supabase.auth.signOut` mutation
- Line ~120: `supabase.from` mutation (complex nested mock)
- Line ~145: `supabase.storage.from` mutation

**Tasks**:

- [ ] Update `signInWithPassword` test to use `vi.spyOn()`
- [ ] Update `signOut` test to use `vi.spyOn()`
- [ ] Update `fetchImages` error test to use `vi.spyOn()`
- [ ] Update `deleteImage` error test to use `vi.spyOn()`
- [ ] Update `uploadImage` error test to use `vi.spyOn()`
- [ ] Remove manual cleanup (restore assignments)
- [ ] Run tests: `pnpm test` (expect 85/85 passing)

#### Step 2.2: Create Mock Factory for Complex Supabase Mocks

**Goal**: Reduce duplication and improve maintainability

**New file**: `tests/helpers/supabaseMocks.ts`

**Factory functions to create**:

```typescript
// Mock Supabase query builder
export const createMockQueryBuilder = (mockData: any) => ({
  select: vi.fn(() => ({
    order: vi.fn(() => Promise.resolve(mockData)),
  })),
  delete: vi.fn(() => ({
    eq: vi.fn(() => Promise.resolve(mockData)),
  })),
});

// Mock Supabase storage bucket
export const createMockStorageBucket = (mockData: any) => ({
  upload: vi.fn(() => Promise.resolve(mockData)),
  remove: vi.fn(() => Promise.resolve(mockData)),
  getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'mock-url' } })),
});
```

**Tasks**:

- [ ] Create `tests/helpers/supabaseMocks.ts`
- [ ] Implement `createMockQueryBuilder()` factory
- [ ] Implement `createMockStorageBucket()` factory
- [ ] Refactor `supabaseApi.test.ts` to use factories
- [ ] Run tests: `pnpm test` (expect 85/85 passing)

#### Step 2.3: Add vi.mocked() for Better Type Safety

**Goal**: Replace `as Mock` type assertions with `vi.mocked()` helper

**Pattern changes**:

```typescript
// BEFORE
import { Mock } from 'vitest';
(uploadImage as Mock).mockResolvedValue(mockStorageData);

// AFTER
import { vi, mocked } from 'vitest';
vi.mocked(uploadImage).mockResolvedValue(mockStorageData);
```

**Files to update**:

- `tests/unit/components/ImageUpload.test.tsx`
- `tests/unit/components/ImageGrid.test.tsx`

**Tasks**:

- [ ] Update `ImageUpload.test.tsx` to use `vi.mocked()`
- [ ] Update `ImageGrid.test.tsx` to use `vi.mocked()`
- [ ] Remove `Mock` type imports where no longer needed
- [ ] Run tests: `pnpm test` (expect 85/85 passing)

#### Step 2.4: Verify vi.mock() Factory Returns

**Goal**: Ensure all vi.mock() factories return explicit objects (v4 requirement)

**Current usage**: Only 1 instance in `ImageUpload.test.tsx`

**Verification**:

```typescript
// Current (should already be correct)
vi.mock('../../../src/lib/supabaseApi', () => ({
  uploadImage: vi.fn(), // ✅ Explicit object return
}));
```

**Tasks**:

- [ ] Verify `ImageUpload.test.tsx` vi.mock() returns explicit object
- [ ] No changes needed if already correct
- [ ] Document as v4-ready

**Success Criteria**: All tests modernized to v3 best practices, 85/85 unit tests passing, 16/16 E2E tests passing

---

### Phase 3: Pre-v4 Test Suite Verification

**Goal**: Establish clean baseline before version upgrade

**Tasks**:

- [ ] Run full test suite: `pnpm test` (85/85 passing)
- [ ] Run E2E tests: `pnpm test:e2e` (16/16 passing)
- [ ] Run linting: `pnpm lint` (0 errors)
- [ ] Run type check: `pnpm type-check` (0 errors)
- [ ] Run formatting check: `pnpm format:check` (all formatted)
- [ ] Run coverage: `pnpm coverage:all` (baseline metrics)
- [ ] Commit Phase 2 changes: "refactor: modernize tests to Vitest v3 best practices"

**Baseline Metrics to Record**:

- Unit test execution time: \_\_\_
- E2E test execution time: \_\_\_
- Total coverage: **_% lines, _**% statements
- Any warnings in test output

**Success Criteria**: Clean test run with all checks passing, baseline metrics documented

---

### Phase 4: Upgrade to Vitest v4

**Goal**: Update Vitest packages to v4.x

**Dependencies to update**:

- `vitest`: 3.2.4 → 4.0.8
- `@vitest/coverage-v8`: 3.2.4 → 4.0.8

**Tasks**:

- [ ] Update `package.json` vitest dependencies to 4.0.8
- [ ] Update `@vitest/coverage-v8` to 4.0.8
- [ ] Install new versions: `pnpm install`
- [ ] Check for any peer dependency warnings
- [ ] Review Vitest v4 changelog for any additional breaking changes

**Success Criteria**: Vitest v4 installed, dependencies resolved

---

### Phase 5: Fix Breaking Changes (If Any)

**Goal**: Address any v4-specific issues that emerge

**Expected issues** (based on previous attempt):

- Player.test.tsx timeout failures (5/85 tests)
- Possible mock behavior changes
- Snapshot updates (if using snapshots)

**Debugging strategy if tests fail**:

1. Run tests in isolation: `pnpm test -- tests/unit/pages/Player.test.tsx`
2. Increase timeout for specific tests if needed
3. Check for automock behavior changes
4. Review mock restoration differences
5. Check for `invocationCallOrder` issues if using that API

**Tasks**:

- [ ] Run unit tests: `pnpm test`
- [ ] Document any failures with error messages
- [ ] Investigate root cause of each failure
- [ ] Apply fixes (prioritize code changes over test changes)
- [ ] Re-run tests after each fix
- [ ] Update vitest.config.ts if timeout adjustments needed
- [ ] Run E2E tests: `pnpm test:e2e`

**Success Criteria**: 85/85 unit tests passing, 16/16 E2E tests passing with Vitest v4

---

### Phase 6: Performance & Regression Testing

**Goal**: Verify v4 performance and catch any regressions

**Tasks**:

- [ ] Run full test suite 3 times, record execution times
- [ ] Compare v4 execution time to Phase 3 baseline
- [ ] Run coverage: `pnpm coverage:all`
- [ ] Verify coverage percentages match baseline (±2%)
- [ ] Run dev server: `pnpm dev` (verify no console errors)
- [ ] Run build: `pnpm build` (verify successful build)
- [ ] Rebuild Docker images: `docker-compose -f config/docker-compose.test.yml build`
- [ ] Run E2E tests in Docker: `pnpm test:e2e`

**Performance Metrics to Compare**:
| Metric | v3.2.4 Baseline | v4.0.8 Result | Change |
|--------|-----------------|---------------|--------|
| Unit test time | **_ | _** | **_ |
| E2E test time | _** | **_ | _** |
| Coverage % | **_ | _** | \_\_\_ |

**Success Criteria**: All tests passing, performance acceptable (no >20% regression), coverage maintained

---

### Phase 7: Update Documentation

**Goal**: Document v4 upgrade and any new patterns

**Files to update**:

- `.claude/CLAUDE.md` - Update Vitest version (3.2.4 → 4.0.8)
- `spec/migrate-to-latest-versions.md` - Update Phase 6 with v4 success notes
- `package.json` - Already updated in Phase 4

**Documentation updates**:

- [ ] Update `.claude/CLAUDE.md` with Vitest 4.0.8
- [ ] Add note about v3 best practices migration
- [ ] Update `spec/migrate-to-latest-versions.md` Phase 6
- [ ] Document any vitest.config.ts changes made
- [ ] Document new mock factory pattern in `tests/helpers/`

**Success Criteria**: Documentation reflects Vitest v4 upgrade

---

### Phase 8: Final Verification & Commit

**Goal**: Clean test run and commit v4 upgrade

**Tasks**:

- [ ] Run pre-commit checks (will run automatically via hook):
  - Prettier formatting
  - ESLint validation
  - TypeScript type check
  - Unit tests
- [ ] Run pre-push checks (will run automatically via hook):
  - Full coverage (unit + E2E + merge)
  - Coverage threshold validation
- [ ] Verify all 101 tests passing (85 unit + 16 E2E)
- [ ] Commit changes: "feat: upgrade Vitest to v4.0.8 with modernized test patterns"
- [ ] Push branch to remote
- [ ] Verify CI passes on GitHub Actions

**Commit message template**:

```
feat: upgrade Vitest to v4.0.8 with modernized test patterns

- Modernize tests to Vitest v3 best practices before v4 upgrade
- Replace direct property mutation with vi.spyOn() for better immutability
- Add mock factory pattern for complex Supabase client mocks
- Use vi.mocked() for improved type safety
- Upgrade vitest and @vitest/coverage-v8 to 4.0.8
- All 85 unit tests + 16 E2E tests passing

Breaking changes addressed:
- vi.mock() factories already return explicit objects (v4 requirement)
- No automock usage that would be affected by restoration changes
- No snapshot dependencies on getMockName() output

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

**Success Criteria**: Clean commit, all tests passing, CI green, ready for PR

---

## Testing Strategy (TDD)

**After each step within a phase**:

1. Run affected tests first (targeted test file)
2. Then run full test suite: `pnpm test`
3. If tests fail, debug and fix before proceeding
4. Only proceed when current step is green

**After each phase**:

1. Run `pnpm lint` - must pass with 0 errors
2. Run `pnpm type-check` - must pass with 0 errors
3. Run `pnpm test` - all 85 unit tests must pass
4. Run `pnpm test:e2e` - all 16 E2E tests must pass
5. Commit phase changes before moving to next phase

## Rollback Plan

- **Phase 2 issues**: Revert specific test file changes (git checkout)
- **Phase 4 issues**: Rollback package.json and pnpm-lock.yaml
  ```bash
  git checkout HEAD -- package.json pnpm-lock.yaml
  pnpm install
  ```
- **Phase 5 failures**: If v4 issues can't be fixed, stay on v3.2.4
- **Branch management**: Each phase is a separate commit for granular rollback

## Risk Assessment

**High Risk**:

- Player.test.tsx timeouts (known issue from previous attempt)
- Mock behavior changes in v4 affecting Supabase client tests

**Medium Risk**:

- Type safety changes with vi.mocked() introduction
- Mock factory pattern refactor introducing bugs

**Low Risk**:

- vi.spyOn() refactor (well-documented pattern)
- Documentation updates

## Success Metrics

- ✅ All 85 unit tests passing with Vitest v4
- ✅ All 16 E2E tests passing with Vitest v4
- ✅ 0 ESLint errors
- ✅ 0 TypeScript errors
- ✅ Coverage maintained: ≥95% lines, ≥92% statements
- ✅ Test execution time: No >20% regression from v3.2.4
- ✅ CI/CD passing on GitHub Actions
- ✅ No console warnings or errors in test output

## Notes

- **Previous failure**: Vitest v4.0.8 caused 5/85 Player tests to timeout (Phase 6 of migrate-to-latest-versions)
- **Root cause hypothesis**: Mock timing behavior changes or test timeout defaults
- **Mitigation strategy**: Modernize mocking patterns first, then upgrade with careful timeout monitoring
- **v3 best practices**: Using vi.spyOn() over direct mutation, mock factories, vi.mocked() for types
- **v4 breaking changes**: Factory returns, mock name changes, restoration behavior, getter behavior
- **Vitest v4 promise**: 5-100x faster test execution (from official changelog)

## Progress Tracking

**Status**: 🟡 In Progress
**Current Phase**: Phase 1 (Pre-Migration Audit)
**Completed Phases**: 0/8
**Blockers**: None
**Next Step**: Commit this spec file and begin Phase 2
