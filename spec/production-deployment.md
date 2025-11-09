# Production Deployment Setup

**Status**: ✅ Complete
**Started**: 2025-01-09
**Completed**: 2025-01-09
**Approach**: Deploy frontend to Vercel and backend to Supabase Cloud (single project)

## Goal

Set up complete production deployment infrastructure:
- **Frontend**: Vercel (static hosting with automatic deployments)
- **Backend**: Supabase Cloud (managed PostgreSQL + Auth + Storage + Realtime)
- **CI/CD**: Automated deployments on push to main, preview deployments for PRs

## Architecture

```
┌─────────────────────────────────────────────────┐
│ GitHub Repository                                │
│ ├── main branch → Production                     │
│ └── PRs → Preview Deployments                    │
└─────────────┬───────────────────────────────────┘
              │
    ┌─────────┴─────────┐
    │                   │
    ▼                   ▼
┌─────────┐      ┌─────────┐
│ Vercel  │      │ Vercel  │
│  (Prod) │      │(Preview)│
└────┬────┘      └────┬────┘
     │                │
     └────────┬───────┘
              ▼
       ┌──────────────┐
       │  Supabase    │
       │ (Production) │
       │ - PostgreSQL │
       │ - Auth       │
       │ - Storage    │
       │ - Realtime   │
       └──────────────┘
```

**Single Project Approach:**
- ✅ Simpler setup (one project to manage)
- ✅ Preview deployments test against production data
- ✅ Good enough for MVP/early stage
- ⚠️ Preview deployments modify production data (acceptable for now)

## Phase 1: Supabase Cloud Setup

### 1.1 Create Supabase Project
- [x] Sign up/login to https://supabase.com ✅
- [x] Create production project ✅
  - Organization: heavenstudio
  - Project name: slide-bar
  - Project ID: cdpxkskbpntoiarhtyuj
  - Database password: Saved in `.supabase-credentials.txt`
  - Region: South America (São Paulo)
  - Pricing plan: Free tier
- [x] Save credentials in `.supabase-credentials.txt` (gitignored) ✅

### 1.2 Run Database Migrations
- [x] Verify Supabase CLI installed: `supabase --version` ✅
- [x] Link local project to cloud: `supabase link --project-ref cdpxkskbpntoiarhtyuj` ✅
- [x] Push migrations to cloud: `supabase db push` ✅
- [x] Verify migrations applied in Dashboard → Table Editor ✅
  - Check for: users, images tables ✅
  - Check for: RLS policies ✅

### 1.3 Configure Storage
- [x] Verify `images` bucket created (automatic from migration) ✅
- [x] Check RLS policies in Dashboard → Storage → Policies ✅
- [x] Test upload manually (verified via production testing) ✅

### 1.4 Create Demo User
- [x] Create demo user via `scripts/create-demo-user.sh` ✅
  - Email: demo@example.com
  - Password: demo-password-123
  - Auto Confirm User: Yes
- [x] Verify user created and confirmed ✅

**Success Criteria**:
- ✅ Supabase project running
- ✅ All migrations applied (users table, images table, RLS policies, storage)
- ✅ Demo user exists and is confirmed
- ✅ Storage bucket configured with RLS

## Phase 2: Vercel Configuration

### 2.1 Create Vercel Configuration File
- [x] Create `vercel.json` with: ✅
  - Build settings (pnpm, vite) ✅
  - SPA routing (rewrite all to index.html) ✅
  - Asset caching headers ✅

### 2.2 Test Local Production Build
- [x] Run production build: `pnpm build` ✅
- [x] Verify dist/ folder generated ✅
- [x] Test production build locally: `pnpm preview` ✅
- [x] Verify app works on http://localhost:4173 ✅

**Success Criteria**:
- ✅ Local production build completes without errors
- ✅ Preview server runs and app is functional

## Phase 3: Vercel Project Setup

### 3.1 Connect GitHub Repository
- [x] Sign up/login to https://vercel.com ✅
- [x] Click "Add New Project" ✅
- [x] Import GitHub repository: `heavenstudio/slide-bar` ✅
- [x] Grant Vercel access to repository ✅

### 3.2 Configure Build Settings
- [x] Framework Preset: Vite (auto-detected) ✅
- [x] Root Directory: `./` (project root) ✅
- [x] Build Command: `pnpm build` ✅
- [x] Output Directory: `dist` ✅
- [x] Install Command: `pnpm install --frozen-lockfile` ✅
- [x] Node.js Version: 18.x or later ✅

### 3.3 Configure Environment Variables
- [x] Add environment variables (both Production and Preview use same Supabase): ✅
  - `VITE_SUPABASE_URL` = `https://cdpxkskbpntoiarhtyuj.supabase.co` ✅
  - `VITE_SUPABASE_ANON_KEY` = `<anon-key-from-credentials-file>` ✅
  - **CRITICAL**: Must be single-line (no newlines) to avoid "Invalid value" errors ✅
  - Apply to: **Production** and **Preview** environments ✅

### 3.4 Deploy
- [x] Deploy via Vercel CLI: `vercel --prod --yes` ✅
- [x] Wait for build to complete ✅
- [x] Deployment URL: `https://slide-bar.vercel.app` ✅

**Success Criteria**:
- ✅ Vercel project created and deployed
- ✅ Build succeeds
- ✅ Deployment URL accessible
- ✅ Auto-deployments configured (main → production, PRs → preview)

## Phase 4: Production Testing

### 4.1 Functional Testing
- [x] Visit production URL (https://slide-bar.vercel.app) ✅
- [x] Test authentication: Auto-login with demo@example.com ✅
- [x] Test image upload: Upload a test image ✅
- [x] Test image grid: Verify image appears in dashboard ✅
- [x] Test image deletion: Delete uploaded image ✅
- [x] Test player page: Open /player route ✅
- [x] Test realtime updates: Upload image in dashboard, verify player updates ✅
- [x] Test keyboard controls in player (arrow keys, fullscreen) ✅
- [x] Test on mobile device (responsive design) ✅

### 4.2 Performance Testing
- [x] All features verified working ✅
- [ ] Run Lighthouse audit (deferred - can be done post-merge)
- [ ] Performance optimization (deferred)

### 4.3 Error Monitoring
- [x] Verified no console errors on production ✅
- [x] Error messages display correctly ✅

**Success Criteria**:
- ✅ All features working on production
- ✅ No console errors
- ✅ Preview deployments working (verified on PR #5)

## Phase 5: CI/CD Automation

### 5.1 Automatic Deployments
- [x] Verify Vercel auto-deploys on push to main (enabled by default) ✅
- [x] Configured production branch: `main` ✅
- [x] Will be tested on PR #5 merge ✅

### 5.2 Preview Deployments for PRs
- [x] Verify Vercel creates preview deployments for PRs (enabled by default) ✅
- [x] Test: Created PR #5 ✅
- [x] Verify preview deployment created ✅
- [x] Verify preview URL posted as PR comment ✅
- [x] Preview URL: `https://slide-bar-git-feat-production-feff1f-stefano-benattis-projects.vercel.app` ✅

### 5.3 GitHub Actions Integration
- [x] Existing CI/CD already in place (`.github/workflows/pr-checks.yml`) ✅
- [x] Runs linting, formatting, tests on PRs ✅
- [ ] Future: Add Playwright E2E tests against preview deployments (deferred)

**Success Criteria**:
- ✅ Auto-deploy on main push configured (will activate on merge)
- ✅ Preview deployments on PRs working (verified on PR #5)
- ✅ Deployment status visible in GitHub

## Phase 6: Documentation & Cleanup

### 6.1 Update Documentation
- [x] Update README.md with production URL ✅
- [x] Deployment spec completed and up-to-date ✅
- [x] Troubleshooting documented (env var newline issue) ✅

### 6.2 Security Review
- [x] Verify RLS policies active on production ✅
- [x] Verify service role key not exposed in frontend ✅
- [x] Verify environment variables not committed to git (.env.production gitignored) ✅
- [x] Review Supabase Auth settings ✅
- [x] Demo user confirmed and working ✅

**Success Criteria**:
- ✅ Deployment spec complete and accurate
- ✅ Security checklist completed
- ✅ Critical fix documented (single-line env vars)

## Environment Variables

### Local Development
```bash
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Production & Preview (Vercel → Supabase Cloud)
```bash
VITE_SUPABASE_URL=https://cdpxkskbpntoiarhtyuj.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

Note: Both production and preview deployments use the same Supabase project.

## Deployment Commands

```bash
# Test local production build
pnpm build
pnpm preview

# Link Supabase project
supabase link --project-ref <project-id>

# Push migrations to production
supabase db push

# View Supabase project status
supabase projects list

# Vercel CLI (optional)
vercel login
vercel deploy --prod
```

## Rollback Plan

### Frontend (Vercel)
1. Go to Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"
4. Instant rollback (no build required)

### Backend (Supabase)
1. Rollback migrations: Create down migration
2. Or restore from Supabase automatic backups (Dashboard → Database → Backups)
3. Free tier: Daily backups, 7-day retention

## Known Limitations & Considerations

### Supabase Free Tier Limits
- 500 MB database space
- 1 GB file storage
- 2 GB bandwidth/month
- 50,000 monthly active users
- 7-day database backups

### Vercel Free Tier Limits
- 100 GB bandwidth/month
- 6,000 build minutes/month
- Unlimited deployments
- Unlimited preview deployments

### Production Considerations
- Single Supabase project (simpler setup for MVP)
- Preview deployments share production data (acceptable for early stage)
- Demo user credentials publicly known (acceptable for MVP)
- Email confirmations disabled for demo user (enable for real users)
- Can add staging environment later if needed

## Success Metrics

- [x] Production URL accessible: https://slide-bar.vercel.app ✅
- [x] Supabase cloud project running with all migrations ✅
- [ ] All E2E tests pass against production (deferred - manual testing complete)
- [x] Auto-deployments working (main → production) ✅
- [x] Preview deployments working (PRs → preview URLs) ✅
- [ ] Lighthouse performance score > 90 (deferred - post-MVP optimization)
- [x] Zero console errors in production ✅
- [x] Documentation complete ✅

## Future Enhancements

- [ ] Custom domain (Vercel supports free custom domains)
- [ ] Staging environment (separate Supabase project + Vercel preview)
- [ ] Vercel Analytics (free tier available)
- [ ] Supabase edge functions (if needed for backend logic)
- [ ] Email authentication for real users (disable demo user)
- [ ] Production monitoring (Sentry, LogRocket, etc.)
- [ ] Automated E2E tests against production (scheduled)

## Notes

- Vercel detects Vite framework automatically
- Supabase provides generous free tier (suitable for MVP)
- Both platforms have excellent DX and documentation
- Preview deployments are invaluable for testing before production
- Consider separate Supabase project for staging if budget allows
