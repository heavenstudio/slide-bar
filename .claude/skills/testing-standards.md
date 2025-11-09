---
skill: testing-standards
description: Enforces comprehensive testing standards using hybrid BDD/TDD approach
trigger: after_code_change
---

# Testing Standards Enforcement Skill

Enforces strict testing standards to maintain high code quality and prevent untested code from being merged.

## 🚨 Enforcement Rules

### Critical Blockers (Exit Code 1)

- ❌ **Any `.jsx` file with 0% coverage** - Every component/page MUST have at least a render test
- ❌ **Overall coverage below 85%** - Absolute minimum threshold

### Warnings (Exit Code 0)

- ⚠️ **Overall coverage below 90%** - Target not met, should add tests
- ⚠️ **File below its target threshold** - Component at 70% when target is 100%

## 📊 Coverage Targets

| File Type                 | Minimum | Target | Enforcement                      |
| ------------------------- | ------- | ------ | -------------------------------- |
| **JSX files**             | 100%    | 100%   | ❌ Block if 0%, warn if < 100%   |
| **Business logic (lib/)** | 90%     | 95%    | ⚠️ Warn if below target          |
| **Overall project**       | 85%     | 90%    | ❌ Block if < 85%, warn if < 90% |

## 🎯 Testing Philosophy

### Hybrid BDD/TDD Approach

**BDD for E2E Tests** - Use Given-When-Then syntax:

```javascript
/**
 * Scenario: User uploads an image
 *   Given I am authenticated and on the dashboard
 *   When I select and upload an image file
 *   Then the image appears in the grid
 */
test('should upload image to dashboard', async ({ page }) => {
  // Given: User is authenticated
  await page.goto('/');

  // When: User uploads an image
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles('test-image.jpg');

  // Then: Image appears in grid
  await expect(page.locator('[data-testid="image-card"]')).toBeVisible();
});
```

**TDD for Unit/Integration Tests** - Red-Green-Refactor cycle:

```javascript
// RED: Write failing test first
it('should show error for invalid file type', () => {
  render(<ImageUpload />);
  fireEvent.change(fileInput, {
    target: { files: [new File(['test'], 'test.txt')] },
  });
  expect(screen.getByText(/apenas.*jpg.*png/i)).toBeInTheDocument();
});
// Run test → ❌ Fails

// GREEN: Implement minimum code to pass
// Add file type validation to component
// Run test → ✅ Passes

// REFACTOR: Improve code quality
// Extract validation, improve messages
// Run test → ✅ Still passes
```

## 🧪 Integration Testing Over Mocks

**Critical Principle**: Prefer real Supabase integration tests over mocks

✅ **DO:**

- Use real Supabase TEST instance (port 55321)
- Test actual database operations
- Test real file uploads
- Use `vi.spyOn()` for function observation without breaking integrations

❌ **DON'T:**

- Mock internal APIs (`vi.mock('../../src/lib/supabaseApi')`) - causes cross-test pollution
- Mock Supabase client in integration tests
- Use module-level mocks that persist across test files

**Example - Integration Test:**

```javascript
import { demoLogin, uploadImage } from '../../src/lib/supabaseApi';
import { cleanDatabase } from '../helpers/supabase';

describe('ImageUpload Integration', () => {
  beforeEach(async () => {
    cleanup(); // Clean DOM between tests
    await cleanDatabase();
    await demoLogin();
  });

  it('should upload image and save to database', async () => {
    const file = createMockImageFile('test.jpg');
    const result = await uploadImage(file);
    expect(result.filename).toBe('test.jpg');
  });
});
```

## ⚠️ Critical Testing Challenges & Solutions

### 1. Mock Pollution Across Test Files

**Problem**: Module-level `vi.mock()` persists across test files, breaking unrelated tests
**Solution**: Use `vi.spyOn()` + proper cleanup instead:

```javascript
// ❌ BAD - Pollutes other tests
vi.mock('../../src/lib/api');

// ✅ GOOD - Isolated and cleaned
const deleteImageSpy = vi.spyOn(api, 'deleteImage');

beforeEach(() => {
  cleanup(); // Clean DOM
  vi.clearAllMocks(); // Reset spies
});
```

### 2. DOM Cleanup in Sequential Tests

**Problem**: Sequential test execution (`singleFork: true`) causes DOM elements to persist
**Solution**: Always call `cleanup()` in `beforeEach`:

```javascript
import { cleanup } from '@testing-library/react';

beforeEach(() => {
  cleanup(); // Critical for sequential tests
});
```

### 3. Realtime Subscription Flakiness

**Problem**: Realtime events are unreliable in jsdom environment (timing issues, event propagation)
**Solution**: Test Realtime functionality via E2E tests only, document in unit test comments:

```javascript
// Note: Realtime subscription testing is complex and flaky in unit test environment
// The subscription setup is verified through:
// 1. Component mounting (which sets up subscription)
// 2. E2E tests (player.spec.js) which verify Realtime updates in real browser
```

### 4. Coverage Report Accuracy

**Problem**: Config files and scripts inflate/deflate coverage percentages
**Solution**: Properly exclude non-source files in `vitest.config.js`:

```javascript
coverage: {
  provider: 'v8',
  reporter: ['text', 'json', 'json-summary', 'html'],
  exclude: [
    'node_modules/',
    'tests/',
    '**/*.config.js',
    '**/*.config.mjs',
    'scripts/',
    'supabase/',
  ],
}
```

### 5. Index Out of Bounds in Realtime Updates

**Problem**: When viewing an image that gets deleted, component shows blank screen
**Solution**: Always add bounds checking when array length changes:

```javascript
setCurrentIndex((prevIndex) => {
  if (newImages.length === 0) return 0;
  if (prevIndex >= newImages.length) {
    return newImages.length - 1; // Go to last image
  }
  return prevIndex;
});
```

### 6. waitForTimeout Anti-Pattern (Playwright/E2E Tests)

**Problem**: Using `page.waitForTimeout()` makes tests flaky, slow, and unreliable
**Why it's bad**:

- Tests wait arbitrary time regardless of actual state
- Too short = flaky failures, too long = slow tests
- Doesn't verify actual state, just assumes timing
- Breaks on slower CI environments

**Solution**: Always wait for actual DOM state or events:

```javascript
// ❌ BAD - Arbitrary time-based wait
await page.waitForTimeout(1000);
await expect(page.locator('.result')).toBeVisible();

// ✅ GOOD - Wait for specific element state
await expect(page.locator('.result')).toBeVisible({ timeout: 5000 });

// ✅ GOOD - Wait for DOM count change
await page.waitForFunction(
  (count) => document.querySelectorAll('.item').length === count,
  expectedCount,
  { timeout: 5000 }
);

// ✅ GOOD - Wait for element to be removed
await expect(page.locator('.item')).not.toBeVisible();

// ✅ GOOD - Wait for network idle
await page.waitForLoadState('networkidle');
```

**Real Example from this codebase**:

```javascript
// ❌ BEFORE - Flaky timeout
await confirmButton.click();
await page.waitForTimeout(500); // Hope it deleted by now?
await expect(nextElement).toBeVisible();

// ✅ AFTER - Event-based wait
await confirmButton.click();
await expect(page.locator('[data-testid="image-card"]')).not.toBeVisible();
await expect(nextElement).toBeVisible({ timeout: 10000 });
```

**Enforcement**: ESLint rule prevents `waitForTimeout` usage (see eslint.config.js)

## ✅ Mandatory Test Checklist

### For Every Component/Page (.jsx files)

- [ ] Basic render test (MINIMUM - prevents 0% coverage blocker)
- [ ] All user interactions (clicks, typing, keyboard controls)
- [ ] Loading states (spinners, isLoading)
- [ ] Error states (error messages, fallbacks)
- [ ] Edge cases (empty data, deletion, wrap-around navigation)

### For Every Function (lib/ files)

- [ ] Happy path (normal input → expected output)
- [ ] Error cases (invalid input → proper error)
- [ ] Edge cases (null, undefined, empty, extreme values)

## 📁 Test Organization

```
tests/
├── components/           # Component tests
├── pages/                # Page tests
├── helpers/              # Test utilities (DB cleanup, mocks)
├── fixtures/             # Test data (images, etc.)
├── *.test.js(x)          # Unit/integration (Vitest)
├── *.spec.js             # E2E tests (Playwright)
└── setup.js              # Test setup

src/
└── [mirror structure in tests/]
```

**Naming Convention:**

- Unit tests: `[ComponentName].test.jsx`
- E2E tests: `[feature-name].spec.js`

## 🔍 Coverage Enforcement

### Automated Script: `scripts/check-coverage.js`

Enforces thresholds by analyzing `coverage/coverage-summary.json`:

```javascript
// Critical violations (exit code 1):
// - Any JSX file with 0% coverage
// - Overall coverage < 85%

// Warnings (exit code 0):
// - Overall coverage < 90%
// - Any file below target threshold
```

**CI/CD Integration** (`.github/workflows/pr-checks.yml`):

```yaml
- name: Run unit tests with coverage
  run: pnpm test:coverage

- name: Check coverage thresholds
  run: node scripts/check-coverage.js
```

### Manual Check

```bash
# Generate coverage report
pnpm test:coverage

# View HTML report
open coverage/index.html

# Check specific file
cat coverage/coverage-summary.json | jq '.["src/pages/Dashboard.jsx"]'
```

## 🛠️ Testing Utilities

### Available Test Helpers (`tests/helpers/supabase.js`)

```javascript
import {
  createServiceClient, // Service role client (bypasses RLS)
  cleanDatabase, // Delete all test data
  useSupabaseCleanup, // Auto-cleanup after each test
  createMockImageFile, // File-like object for uploads
} from './helpers/supabase';

describe('MyComponent', () => {
  useSupabaseCleanup(); // Auto-cleanup

  beforeEach(async () => {
    cleanup(); // Clean DOM
    await cleanDatabase();
    await demoLogin();
  });
});
```

### Common Patterns

**Async Operations:**

```javascript
it('should load data on mount', async () => {
  render(<DataComponent />);
  await waitFor(
    () => {
      expect(screen.getByText('Data loaded')).toBeInTheDocument();
    },
    { timeout: 3000 }
  );
});
```

**Error States:**

```javascript
it('should display error on failure', async () => {
  vi.spyOn(api, 'fetchData').mockRejectedValue(new Error('Failed'));
  render(<DataComponent />);
  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
});
```

## 🚀 Performance Standards

- **Unit tests**: < 5 seconds total
- **E2E tests**: < 10 seconds total
- **Individual test**: < 1 second (warn if slower)

**Optimization:**

- Use `beforeEach` for common setup
- Clean database efficiently (bulk operations)
- Configure sequential execution for Supabase tests (`pool: 'forks', singleFork: true`)

## 📋 Pre-Commit Checklist

- [ ] **All tests pass**: `pnpm test`
- [ ] **No JSX files at 0% coverage**: `pnpm test:coverage`
- [ ] **Overall coverage ≥ 90%**: Check coverage report
- [ ] **New code follows TDD**: Write test first (RED) → Implement (GREEN) → Refactor
- [ ] **E2E tests use Given-When-Then**: Include GWT comments
- [ ] **Integration tests use real Supabase**: No internal API mocks

## 🔀 Combined Coverage (Vitest + Playwright)

**Architecture**: Merge V8 coverage (Vitest) + Istanbul coverage (Playwright) for complete picture

**Critical Path Normalization Challenge**:

- **Problem**: Docker paths (`/workspace/slide-bar/`) vs local paths (`/Users/.../slide-bar/`) prevented nyc merge
- **Solution**: Normalize BOTH top-level keys AND `.path` field inside coverage objects to relative paths
- **Critical**: Must remove `inputSourceMap` to avoid source map errors after path changes
- **Location**: `scripts/merge-coverage.js:normalizePaths()`

**Istanbul vs V8 Branch Tracking**:

- **Istanbul**: Tracks 2-3x more branches (ternaries, logical AND/OR, JSX conditionals, optional chaining)
- **Example**: 140 branches (V8) → 352 branches (Istanbul)
- **Impact**: Lower branch % is expected due to more granular detection, NOT worse coverage

**Coverage Collection Flow**:

1. Vitest generates V8 coverage → `coverage/coverage-final.json`
2. Playwright collects Istanbul coverage via `window.__coverage__` → `.nyc_output/playwright_coverage_*.json`
3. `scripts/merge-coverage.js` converts V8 to Istanbul, normalizes paths, merges with nyc
4. `scripts/check-coverage.js` displays both individual (Vitest) and combined reports

### 7. Running Single Tests for Faster Debugging

**Problem**: Running entire test suite wastes time when only one test is failing
**Why it's important**:

- Full E2E suite takes ~60s, single test takes ~2s
- Faster feedback loop when fixing specific test failures
- Saves CI/CD time during development

**Solution**: Run specific tests using built-in filtering:

```bash
# ❌ BAD - Run all E2E tests when only one is failing (60s)
pnpm test:e2e

# ✅ GOOD - Run specific E2E test using grep (2s)
PLAYWRIGHT_ARGS="--grep 'should show empty state'" pnpm test:e2e:single

# ✅ GOOD - Run multiple specific tests with regex
PLAYWRIGHT_ARGS="--grep 'should show empty state|should show next image'" pnpm test:e2e:single

# ✅ GOOD - Run specific unit test file
pnpm test:single tests/pages/Player.test.jsx

# ✅ GOOD - Run specific unit test by name pattern
pnpm test:single -t "should handle keyboard controls"
```

**When to use**:

1. After writing a new test (run ONLY that test first)
2. When a specific test fails (run ONLY that test to debug)
3. After fixing a test (run ONLY that test to verify fix)
4. Only run full suite after confirming individual test passes

**Workflow**:

```bash
# 1. Write test (RED)
pnpm test:single -t "new feature test"  # ❌ Should fail

# 2. Implement code (GREEN)
pnpm test:single -t "new feature test"  # ✅ Should pass

# 3. Verify full suite still passes
pnpm test  # Run all tests
```

## 📖 Key Commands

```bash
# Run all unit tests
pnpm test

# Run single unit test file
pnpm test:single tests/pages/Player.test.jsx

# Run unit test by name pattern
pnpm test:single -t "keyboard controls"

# Run with coverage
pnpm test:coverage

# Run all E2E tests
pnpm test:e2e

# Run single E2E test using grep
PLAYWRIGHT_ARGS="--grep 'test name'" pnpm test:e2e:single

# Run E2E with coverage
pnpm test:e2e:coverage

# Merge Vitest + Playwright coverage
pnpm coverage:merge

# Check coverage thresholds (shows both individual + combined)
node scripts/check-coverage.js

# View coverage reports
open .test-output/coverage/index.html         # Vitest only
open .test-output/merged-coverage/index.html  # Combined

# Full coverage workflow (quick check ~5s)
pnpm coverage:quick

# Full coverage workflow with E2E (~60s)
pnpm coverage:all
```

## 📚 Reference

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Project CLAUDE.md](/.claude/CLAUDE.md)

---

## Summary

**Testing Standards:**

- ✅ Hybrid BDD (E2E) + TDD (unit/integration)
- ✅ Integration tests with real Supabase over mocks
- ✅ 100% coverage required for all JSX files (warn if < 100%, block if 0%)
- ✅ Sequential test execution to avoid database race conditions
- ✅ Proper cleanup between tests (`cleanup()` + `vi.clearAllMocks()`)

**Enforcement:**

- ❌ Block: Any JSX at 0%, Overall < 85%
- ⚠️ Warn: Overall < 90%, File below target

**Philosophy:**
Write tests that provide confidence and catch real bugs. Use integration tests to verify actual system behavior, not mocked behavior.
