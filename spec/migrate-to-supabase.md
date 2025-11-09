# Supabase Migration Plan - TDD Approach

**Status**: 🟡 In Progress
**Started**: 2025-11-08
**Approach**: Incremental migration with all tests passing at every commit
**Target**: Full Supabase client-side architecture

---

## Migration Decisions

✅ **Full Supabase client-side** - Remove Express, call Supabase directly from React
✅ **Database first** - Start with Supabase PostgreSQL connection
✅ **Supabase CLI local stack** - Set up local development immediately
✅ **All tests passing at every step** - True TDD, no broken tests

---

## Phase 1: Setup Supabase Infrastructure ✅ DONE

**Goal**: Set up Supabase project and local development without breaking existing code

### Tasks

- [x] **1.1 Create Supabase cloud project** ✅
  - Project: slide-bar
  - URL: https://cdpxkskbpntoiarhtyuj.supabase.co
  - Credentials saved in `.env.example`

- [x] **1.2 Install Supabase CLI** ✅
  - Installed v2.54.11 via Homebrew

- [x] **1.3 Initialize Supabase in project** ✅
  - Created `supabase/` directory
  - Created `supabase/config.toml`

- [x] **1.4 Install Supabase dependencies** ✅
  - Installed `@supabase/supabase-js@2.80.0` in frontend

- [x] **1.5 Start local Supabase stack** ✅
  - Local stack running on ports 54321-54324
  - PostgreSQL, PostgREST, Realtime, Storage, Auth all running

- [x] **1.6 Create initial database migration** ✅
  - Created `supabase/migrations/20251108000001_initial_schema.sql`
  - Includes: organizations, users, images tables
  - Verified with `docker exec supabase_db_slide-bar psql`

- [x] **1.7 Update environment configuration** ✅
  - Updated `.env.example` with local and cloud Supabase vars
  - Documented Docker networking for E2E tests

- [x] **1.8 Verify tests still pass** ✅
  - Frontend: 14 tests passing
  - Backend: 25 tests passing
  - Total: 39 unit tests passing

**Success Criteria**: ✅ **ACHIEVED** - Supabase runs locally, no code changes, all tests pass

---

## Phase 2: Database Connection Migration ⏸️ PENDING

**Goal**: Point backend to Supabase PostgreSQL while keeping all APIs unchanged

### Tasks

- [ ] **2.1 Add Supabase connection support**
  - Update `packages/backend/src/config/database.js`
  - Support both old and new connection strings
  - Use environment variable to toggle

- [ ] **2.2 Update Prisma schema**
  - Modify `datasource` URL to use Supabase
  - Keep Prisma client (Supabase supports Prisma)

- [ ] **2.3 Test database operations**

  ```bash
  pnpm test        # Unit tests against Supabase
  pnpm test:e2e    # E2E tests
  ```

- [ ] **2.4 Deploy schema to Supabase cloud**

  ```bash
  supabase db push
  ```

  - Verify via Supabase Studio

**Success Criteria**: ✅ Backend uses Supabase PostgreSQL, all APIs work, all tests pass

---

## Phase 3: Add Supabase Client Layer ✅ DONE

**Goal**: Create Supabase client in frontend while keeping Express as fallback

### Tasks

- [x] **3.1 Create Supabase client setup** ✅
  - Created `packages/frontend/src/lib/supabase.js`
  - Initialized client with URL and anon key
  - Configured for local/production with placeholder fallbacks

- [x] **3.2 Create parallel API implementation** ✅
  - Created `packages/frontend/src/lib/supabaseApi.js`
  - Implemented: `demoLogin()`, `getImages()`, `uploadImage()`, `deleteImage()`
  - Uses Supabase client directly

- [x] **3.3 Write tests for Supabase API layer (TDD)** ✅
  - Created `packages/frontend/tests/supabaseApi.test.js` with 11 tests
  - **RED**: Wrote tests first, verified they failed ❌
  - **GREEN**: Implemented functions until tests passed ✅
  - All tests use mocks (no actual Supabase connection needed)

- [x] **3.4 Add feature flag** ✅
  - Added `VITE_USE_SUPABASE` environment variable
  - Updated `packages/frontend/src/lib/api.js` to switch implementations
  - Default: `false` (keeps Express backend)

- [x] **3.5 Verify tests** ✅
  ```bash
  pnpm test        # ✅ 50 tests pass (25 frontend + 25 backend)
  ```

**Success Criteria**: ✅ **ACHIEVED** - Supabase API layer exists and tested, not used yet, all tests pass

---

## Phase 4: Migrate Authentication ✅ DONE

**Goal**: Switch from JWT to Supabase Auth without breaking authentication flow

### Tasks

- [x] **4.1 Configure Supabase Auth** ✅
  - Created demo user via migration (`20251108134228_seed_demo_user.sql`)
  - User credentials: demo@example.com / demo-password-123
  - Documented in `.env.example`

- [x] **4.2 Implement auth in Supabase API layer** ✅
  - Auth already implemented in `supabaseApi.js` (Phase 3)
  - Uses Supabase Auth with `signInWithPassword()`
  - Session management handled by Supabase client

- [x] **4.3 Write auth tests (TDD)** ✅
  - Auth tests already written in `supabaseApi.test.js` (Phase 3)
  - **RED**: Tests failed initially ❌
  - **GREEN**: Tests pass ✅
  - Covers: login, error handling

- [x] **4.4 Test with feature flag** ✅
  - All tests pass with `VITE_USE_SUPABASE=false` (default)
  - Ready for testing with `VITE_USE_SUPABASE=true`

- [x] **4.5 Update E2E tests** ⏸️
  - Tests work with Express (current default)
  - Need to verify with Supabase flag enabled (Phase 6)

**Success Criteria**: ✅ **ACHIEVED** - Supabase Auth configured, demo user created, all tests pass

---

## Phase 5: Migrate File Storage ✅ DONE

**Goal**: Move from filesystem to Supabase Storage

### Tasks

- [x] **5.1 Configure Supabase Storage** ✅
  - Created `images` bucket via migration (`20251108134555_setup_storage.sql`)
  - Set up RLS policies (public read, authenticated write/delete)
  - Configured file size limit (5MB) and MIME types (JPEG, PNG)

- [x] **5.2 Implement storage in Supabase API layer** ✅
  - Storage already implemented in `supabaseApi.js` (Phase 3)
  - Uses Supabase Storage SDK for upload/delete
  - Handles image metadata in database

- [x] **5.3 Write storage tests (TDD)** ✅
  - Storage tests already written in `supabaseApi.test.js` (Phase 3)
  - **RED**: Tests failed initially ❌
  - **GREEN**: Tests pass ✅
  - Mocks file uploads, storage operations

- [x] **5.4 Test with feature flag** ⏸️
  - All tests pass with `VITE_USE_SUPABASE=false` (default)
  - Need to verify E2E with `VITE_USE_SUPABASE=true` (Phase 6)

**Success Criteria**: ✅ **ACHIEVED** - File storage configured, RLS policies set, all tests pass

---

## Phase 6: Enable Supabase by Default ✅ DONE

**Goal**: Make Supabase the default, deprecate Express

### Tasks

- [x] **6.1 Flip feature flag default** ✅
  - Set `VITE_USE_SUPABASE=true` by default
  - Updated `.env.example`
  - Updated `api.js` documentation

- [x] **6.2 Run full test suite** ✅

  ```bash
  pnpm test             # ✅ 50 tests pass (25 frontend + 25 backend)
  pnpm test:e2e         # ✅ 13 tests pass (5.5s)
  pnpm test:coverage    # ✅ Coverage maintained
  ```

- [x] **6.3 Update deployment configuration** ✅
  - Updated README with Supabase + Vercel deployment instructions
  - Removed `render.yaml` (legacy Express deployment)
  - Updated tech stack section to show Supabase
  - Updated infrastructure section with demo credentials

- [ ] **6.4 Test in production-like environment** (manual user task)
  - Deploy to Vercel preview (user will do when ready)
  - Connect to Supabase cloud (instructions in README)
  - Verify all features

**Success Criteria**: ✅ **ACHIEVED** - Supabase is default, deployment docs updated, all tests pass

---

## Phase 7: Remove Express Backend ✅ DONE

**Goal**: Clean up deprecated code

### Tasks

- [x] **7.1 Remove backend package** ✅

  ```bash
  rm -rf packages/backend
  ```

  - ✅ Update `pnpm-workspace.yaml`
  - ✅ Remove backend scripts from `package.json`
  - ✅ Update dev scripts (dev-start.sh, dev-stop.sh)

- [x] **7.2 Update tests** ✅ DONE
  - ✅ Remove backend unit tests
  - ✅ Update E2E test infrastructure (test-e2e.sh)
  - ✅ Remove backend imports from E2E tests
  - ✅ Create test fixtures in e2e/fixtures/
  - ✅ Fix database reset (supabase db reset --yes)
  - ✅ Fix Docker networking (host.docker.internal)
  - ✅ E2E tests: **13/13 passing** (all tests working with Supabase)
  - ✅ Unit tests converted to integration tests (18 tests)
    - 7 Supabase API tests using real Supabase
    - 4 Player component tests using real Supabase
    - 4 ImageUpload component tests (mocked)
    - 3 ImageGrid component tests (presentational)

- [x] **7.3 Convert unit tests from mocks to integration tests** ✅ DONE
  - Created test helpers in `tests/helpers/supabase.js`
  - Database cleanup utilities with service role client
  - Custom file-like objects to work around jsdom MIME type limitations
  - Sequential test execution to prevent database conflicts
  - Suppressed GoTrueClient warnings in test environment
  - All 18 tests passing cleanly

- [ ] **7.4 Clean up configuration** (TODO)
  - [ ] Flatten packages/frontend to root (simplify structure)
  - [ ] Investigate supabase-test config (consolidate or remove)
  - [ ] Update pnpm start/stop commands to manage Supabase + frontend
  - [ ] Update GitHub Actions workflows for new structure

- [ ] **7.5 Final verification** (TODO)
  ```bash
  pnpm test             # ✅ 18/18 unit tests passing
  pnpm test:e2e         # ✅ 13/13 E2E tests passing
  pnpm test:coverage    # Maintained
  ```

**Success Criteria**: ✅ **ACHIEVED** - Express backend removed, all tests converted to Supabase integration, E2E tests passing

**Remaining Work**: Configuration cleanup (package structure, scripts, CI/CD)

---

## Phase 8: Project Structure Cleanup ✅ DONE

**Goal**: Simplify project structure and improve developer experience

### Tasks

- [x] **8.1 Flatten packages/frontend to root** ✅
  - Moved `packages/frontend/*` to root
  - Updated all import paths (Git detected as renames)
  - Updated configuration files
  - Removed empty `packages/` directory
  - Removed pnpm workspace configuration (`pnpm-workspace.yaml` deleted)
  - Merged `package.json` files

- [x] **8.2 Consolidate tests** ✅
  - Moved all E2E tests from `e2e/` to `tests/` folder
  - All tests now in single directory
  - Maintained separation: `*.test.js` for Vitest, `*.spec.js` for Playwright
  - Fixed Vitest/Playwright expect conflict with `testMatch` pattern

- [x] **8.3 Update development scripts** ✅
  - Updated `scripts/dev-start.sh` to work with root structure
  - Updated `scripts/test-e2e-ui.sh` to remove backend references
  - Scripts now correctly manage Supabase + frontend dev server
  - Removed all backend/packages/frontend path references

- [x] **8.4 Update GitHub Actions workflows** ✅
  - Updated `.github/workflows/pr-checks.yml`
  - Migrated from PostgreSQL/Prisma to Supabase CLI
  - Updated paths for flat structure
  - Added E2E test job with Supabase
  - All CI jobs passing

### Critical Challenge Solved

**Vitest/Playwright Expect Conflict**:

- **Problem**: Both frameworks tried to extend global `expect`, causing `TypeError: Cannot redefine property: Symbol($jest-matchers-object)`
- **Root Cause**: Playwright loaded all `.js` files from `tests/` directory, including Vitest's `setup.js`
- **Solution**: Added `testMatch: '**/*.spec.js'` to `playwright.config.mjs` to restrict Playwright to only `.spec.js` files
- **Result**: E2E tests passing (13/13), unit tests passing (18/18)

**Success Criteria**: ✅ **ACHIEVED** - Flat structure, monorepo removed, all tests consolidated and passing

---

## Phase 9: Add Realtime Features ✅ DONE

**Goal**: Leverage Supabase Realtime for instant updates

### Tasks

- [x] **9.1 Enable Realtime on images table** ✅
  - Created migration `20251109124018_enable_realtime_for_images.sql`
  - Added `images` table to `supabase_realtime` publication
  - Applied to both dev and test instances

- [x] **9.2 Implement Realtime subscriptions** ✅
  - Subscribed to `images` table in Player component
  - Update slideshow on INSERT, UPDATE, DELETE events
  - Removed 5-minute polling interval
  - Proper cleanup on component unmount

- [x] **9.3 Write E2E tests for Realtime** ✅
  - Created E2E test: `should update in real-time when new images are uploaded`
  - Tests two-tab scenario (player + dashboard)
  - Verifies instant updates without page refresh
  - All 14 E2E tests passing

- [x] **9.4 Verify all tests pass** ✅
  ```bash
  pnpm test             # ✅ 18/18 unit tests passing (1.5s)
  pnpm test:e2e         # ✅ 14/14 E2E tests passing (7.1s)
  pnpm test:coverage    # ✅ Coverage maintained (61% overall)
  ```

**Success Criteria**: ✅ **ACHIEVED** - Real-time updates working, enhanced UX, all tests pass

---

## Testing Strategy

**At Every Phase**:

1. **RED**: Write tests first ❌
2. **GREEN**: Implement feature ✅
3. **REFACTOR**: Clean up code
4. Run `pnpm test` ✅
5. Run `pnpm test:e2e` ✅
6. Check `pnpm test:coverage` ✅
7. Commit only when all tests pass

**Test Categories**:

- **Unit tests**: Supabase client functions in isolation
- **Integration tests**: Supabase operations against local stack
- **E2E tests**: Full user flows (upload, view, delete)

---

## Rollback Strategy

**If tests fail**:

- Feature flag allows instant rollback
- Revert commits to last green state
- Debug before proceeding
- **Never merge with failing tests**

---

## Timeline Estimate

- **Phase 1-2**: 2 days (setup + database)
- **Phase 3-5**: 5 days (client layer + auth + storage)
- **Phase 6-7**: 2 days (enable + cleanup)
- **Phase 8**: 2 days (realtime)

**Total: ~11-12 days** ✅

---

## Progress Tracking

- [x] Planning completed
- [x] **Phase 1: Setup Supabase Infrastructure** ✅ DONE (2025-11-08)
- [ ] Phase 2: Database Connection Migration (skipped - going client-side)
- [x] **Phase 3: Add Supabase Client Layer** ✅ DONE (2025-11-08)
- [x] **Phase 4: Migrate Authentication** ✅ DONE (2025-11-08)
- [x] **Phase 5: Migrate File Storage** ✅ DONE (2025-11-08)
- [x] **Phase 6: Enable Supabase by Default** ✅ DONE (2025-11-08)
- [x] **Phase 7: Remove Express Backend** ✅ DONE (2025-11-08)
  - Removed backend package
  - Fixed E2E tests (13/13 passing)
  - Converted unit tests to integration tests (18/18 passing)
- [x] **Phase 8: Project Structure Cleanup** ✅ DONE (2025-11-09)
  - Flattened packages/frontend to root
  - Consolidated all tests in tests/ folder
  - Updated development scripts and removed backend references
  - Updated GitHub Actions workflows to use Supabase
  - Fixed Vitest/Playwright expect conflict
  - All tests passing (18 unit + 13 E2E)
- [x] **Phase 9: Add Realtime Features** ✅ DONE (2025-11-09)
  - Enabled Realtime on images table via migration
  - Implemented real-time subscriptions in Player component
  - Replaced 5-minute polling with instant updates
  - Added E2E test for real-time functionality
  - All tests passing (18 unit + 14 E2E)

---

## Notes

- Keep this document updated as we progress
- Mark tasks complete with ✅
- Update status from ⏸️ PENDING to ⏳ IN PROGRESS to ✅ DONE
- Document any deviations from plan
- Record any issues encountered
