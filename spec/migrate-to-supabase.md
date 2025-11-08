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

## Phase 3: Add Supabase Client Layer ⏸️ PENDING

**Goal**: Create Supabase client in frontend while keeping Express as fallback

### Tasks

- [ ] **3.1 Create Supabase client setup**
  - Create `packages/frontend/src/lib/supabase.js`
  - Initialize client with URL and anon key
  - Configure for local/production

- [ ] **3.2 Create parallel API implementation**
  - Create `packages/frontend/src/lib/supabaseApi.js`
  - Implement: `demoLogin()`, `getImages()`, `uploadImage()`, `deleteImage()`
  - Use Supabase client directly

- [ ] **3.3 Write tests for Supabase API layer (TDD)**
  - Create `packages/frontend/tests/supabaseApi.test.js`
  - **RED**: Write tests first, watch them fail ❌
  - **GREEN**: Implement functions until tests pass ✅
  - Test against local Supabase

- [ ] **3.4 Add feature flag**
  - Add `VITE_USE_SUPABASE` environment variable
  - Update `packages/frontend/src/lib/api.js` to switch implementations
  - Default: `false` (keep Express)

- [ ] **3.5 Verify tests**
  ```bash
  pnpm test        # New Supabase tests pass
  pnpm test:e2e    # Existing E2E tests still pass
  ```

**Success Criteria**: ✅ Supabase API layer exists and tested, not used yet, all tests pass

---

## Phase 4: Migrate Authentication ⏸️ PENDING

**Goal**: Switch from JWT to Supabase Auth without breaking authentication flow

### Tasks

- [ ] **4.1 Configure Supabase Auth**
  - Enable email/password auth in dashboard
  - Configure in `supabase/config.toml`
  - Create demo user via migration

- [ ] **4.2 Implement auth in Supabase API layer**
  - Update `supabaseApi.js` to use Supabase Auth
  - Implement session management
  - Auto-managed tokens

- [ ] **4.3 Write auth tests (TDD)**
  - Create `packages/frontend/tests/supabaseAuth.test.js`
  - **RED**: Write tests, watch them fail ❌
  - **GREEN**: Implement until tests pass ✅
  - Test: login, session retrieval, token validation

- [ ] **4.4 Test with feature flag**
  ```bash
  VITE_USE_SUPABASE=true pnpm test:e2e
  ```
  - Fix any issues

- [ ] **4.5 Update E2E tests**
  - Make tests work with both auth systems
  - Pass with flag on/off

**Success Criteria**: ✅ Supabase Auth works, can toggle between JWT/Supabase, all tests pass

---

## Phase 5: Migrate File Storage ⏸️ PENDING

**Goal**: Move from filesystem to Supabase Storage

### Tasks

- [ ] **5.1 Configure Supabase Storage**
  - Create `images` bucket
  - Set up RLS policies (public read, authenticated write)
  - Configure local storage

- [ ] **5.2 Implement storage in Supabase API layer**
  - Update `supabaseApi.js` upload/delete
  - Use Supabase Storage SDK
  - Handle image metadata in database

- [ ] **5.3 Write storage tests (TDD)**
  - Create `packages/frontend/tests/supabaseStorage.test.js`
  - **RED**: Write tests, watch them fail ❌
  - **GREEN**: Implement until tests pass ✅
  - Mock file uploads

- [ ] **5.4 Test with feature flag**
  ```bash
  VITE_USE_SUPABASE=true pnpm test:e2e
  ```
  - Verify images upload to Supabase
  - Verify images display in player

**Success Criteria**: ✅ File storage works with Supabase, can toggle, all tests pass

---

## Phase 6: Enable Supabase by Default ⏸️ PENDING

**Goal**: Make Supabase the default, deprecate Express

### Tasks

- [ ] **6.1 Flip feature flag default**
  - Set `VITE_USE_SUPABASE=true` by default
  - Update `.env.example`
  - Update documentation

- [ ] **6.2 Run full test suite**
  ```bash
  pnpm test             # ✅
  pnpm test:e2e         # ✅
  pnpm test:coverage    # Verify maintained
  ```

- [ ] **6.3 Update deployment configuration**
  - Update README with Supabase deployment
  - Remove `render.yaml`
  - Add Vercel deployment instructions

- [ ] **6.4 Test in production-like environment**
  - Deploy to Vercel preview
  - Connect to Supabase cloud
  - Verify all features

**Success Criteria**: ✅ Supabase is default, Express unused, all tests pass

---

## Phase 7: Remove Express Backend ⏸️ PENDING

**Goal**: Clean up deprecated code

### Tasks

- [ ] **7.1 Remove backend package**
  ```bash
  rm -rf packages/backend
  ```
  - Update `pnpm-workspace.yaml`
  - Remove backend scripts from `package.json`

- [ ] **7.2 Update tests**
  - Remove backend unit tests (covered by frontend)
  - Update E2E tests (no backend server needed)
  - All E2E tests still pass ✅

- [ ] **7.3 Clean up configuration**
  - Remove backend env vars
  - Update documentation
  - Remove Docker Compose (if unused)

- [ ] **7.4 Final verification**
  ```bash
  pnpm test             # ✅
  pnpm test:e2e         # ✅
  pnpm test:coverage    # Maintained
  ```

**Success Criteria**: ✅ Clean codebase, only Supabase, all tests pass

---

## Phase 8: Add Realtime Features ⏸️ PENDING

**Goal**: Leverage Supabase Realtime for instant updates

### Tasks

- [ ] **8.1 Implement Realtime subscriptions**
  - Subscribe to `images` table in Player
  - Update slideshow on changes
  - Remove 5-minute polling

- [ ] **8.2 Write Realtime tests (TDD)**
  - Create `packages/frontend/tests/supabaseRealtime.test.js`
  - **RED**: Write tests, watch them fail ❌
  - **GREEN**: Implement until tests pass ✅
  - Mock Supabase Realtime

- [ ] **8.3 Test E2E with Realtime**
  - Upload in dashboard
  - Verify player updates instantly
  - All tests pass ✅

**Success Criteria**: ✅ Real-time updates working, enhanced UX, all tests pass

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
- [ ] Phase 2: Database Connection Migration (Day 2)
- [ ] Phase 3: Add Supabase Client Layer (Day 3-4)
- [ ] Phase 4: Migrate Authentication (Day 5-6)
- [ ] Phase 5: Migrate File Storage (Day 7-8)
- [ ] Phase 6: Enable Supabase by Default (Day 9)
- [ ] Phase 7: Remove Express Backend (Day 10)
- [ ] Phase 8: Add Realtime Features (Day 11-12)

---

## Notes

- Keep this document updated as we progress
- Mark tasks complete with ✅
- Update status from ⏸️ PENDING to ⏳ IN PROGRESS to ✅ DONE
- Document any deviations from plan
- Record any issues encountered
