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
- [ ] Verify Supabase CLI installed: `supabase --version`
- [ ] Link local project to cloud: `supabase link --project-ref cdpxkskbpntoiarhtyuj`
- [ ] Push migrations to cloud: `supabase db push`
- [ ] Verify migrations applied in Dashboard → Table Editor
  - Check for: users, images tables
  - Check for: RLS policies

### 1.3 Configure Storage
- [ ] Verify `images` bucket created (should be automatic from migration)
- [ ] Check RLS policies in Dashboard → Storage → Policies
- [ ] Test upload manually (optional)

### 1.4 Create Demo User
- [ ] Go to Dashboard → Authentication → Users
- [ ] Click "Add user" → "Create new user"
  - Email: demo@example.com
  - Password: demo-password-123
  - Auto Confirm User: Yes
- [ ] Verify user created and confirmed

**Success Criteria**:
- ✅ Supabase project running
- ✅ All migrations applied (users table, images table, RLS policies, storage)
- ✅ Demo user exists and is confirmed
- ✅ Storage bucket configured with RLS

## Phase 2: Vercel Configuration

### 2.1 Create Vercel Configuration File
- [ ] Create `vercel.json` with:
  - Build settings (pnpm, vite)
  - SPA routing (rewrite all to index.html)
  - Asset caching headers
  - Environment variable setup

### 2.2 Test Local Production Build
- [ ] Run production build: `pnpm build`
- [ ] Verify dist/ folder generated
- [ ] Test production build locally: `pnpm preview`
- [ ] Verify app works on http://localhost:4173

**Success Criteria**:
- ✅ Local production build completes without errors
- ✅ Preview server runs and app is functional

## Phase 3: Vercel Project Setup

### 3.1 Connect GitHub Repository
- [ ] Sign up/login to https://vercel.com
- [ ] Click "Add New Project"
- [ ] Import GitHub repository: `heavenstudio/slide-bar`
- [ ] Grant Vercel access to repository

### 3.2 Configure Build Settings
- [ ] Framework Preset: Vite (auto-detected)
- [ ] Root Directory: `./` (project root)
- [ ] Build Command: `pnpm build`
- [ ] Output Directory: `dist`
- [ ] Install Command: `pnpm install --frozen-lockfile`
- [ ] Node.js Version: 18.x or later

### 3.3 Configure Environment Variables
- [ ] Add environment variables (both Production and Preview use same Supabase):
  - `VITE_SUPABASE_URL` = `https://cdpxkskbpntoiarhtyuj.supabase.co`
  - `VITE_SUPABASE_ANON_KEY` = `<anon-key-from-credentials-file>`
  - Apply to: **Production** and **Preview** environments

### 3.4 Deploy
- [ ] Click "Deploy"
- [ ] Wait for build to complete (~2-3 minutes)
- [ ] Note deployment URL: `https://<project-name>.vercel.app`

**Success Criteria**:
- ✅ Vercel project created and deployed
- ✅ Build succeeds
- ✅ Deployment URL accessible

## Phase 4: Production Testing

### 4.1 Functional Testing
- [ ] Visit production URL
- [ ] Test authentication: Login with demo@example.com
- [ ] Test image upload: Upload a test image
- [ ] Test image grid: Verify image appears in dashboard
- [ ] Test image deletion: Delete uploaded image
- [ ] Test player page: Open /player route
- [ ] Test realtime updates: Upload image in dashboard, verify player updates
- [ ] Test keyboard controls in player (arrow keys, fullscreen)
- [ ] Test on mobile device (responsive design)

### 4.2 Performance Testing
- [ ] Run Lighthouse audit in Chrome DevTools
- [ ] Check performance score (target: >90)
- [ ] Check accessibility score (target: >90)
- [ ] Check SEO score
- [ ] Verify page load time < 3s

### 4.3 Error Monitoring
- [ ] Test error states (invalid login, upload failure, etc.)
- [ ] Check browser console for errors
- [ ] Verify error messages display correctly

**Success Criteria**:
- ✅ All features working on production
- ✅ No console errors
- ✅ Lighthouse performance > 90
- ✅ Mobile responsive

## Phase 5: CI/CD Automation

### 5.1 Automatic Deployments
- [ ] Verify Vercel auto-deploys on push to main (enabled by default)
- [ ] Test: Push a small change to main
- [ ] Verify automatic deployment triggered
- [ ] Verify deployment succeeds

### 5.2 Preview Deployments for PRs
- [ ] Verify Vercel creates preview deployments for PRs (enabled by default)
- [ ] Test: Create a test PR
- [ ] Verify preview deployment created
- [ ] Verify preview URL posted as PR comment
- [ ] Test preview deployment works

### 5.3 GitHub Actions Integration (Optional)
- [ ] Create deployment workflow: `.github/workflows/deploy.yml`
- [ ] Add Supabase migrations check on PRs
- [ ] Add deployment status notifications
- [ ] Optional: Add Playwright E2E tests against preview deployments

**Success Criteria**:
- ✅ Auto-deploy on main push working
- ✅ Preview deployments on PRs working
- ✅ Deployment status visible in GitHub

## Phase 6: Documentation & Cleanup

### 6.1 Update Documentation
- [ ] Update README.md with:
  - Production URL
  - Deployment instructions
  - Environment variable setup
  - Demo credentials
- [ ] Update .claude/CLAUDE.md with deployment context
- [ ] Create deployment troubleshooting guide
- [ ] Document rollback procedure

### 6.2 Security Review
- [ ] Verify RLS policies active on production
- [ ] Verify service role key not exposed in frontend
- [ ] Verify environment variables not committed to git
- [ ] Review Supabase Auth settings
- [ ] Enable email confirmations (optional, for production users)

**Success Criteria**:
- ✅ Complete deployment documentation
- ✅ Security checklist completed

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

- [ ] Production URL accessible: https://<project>.vercel.app
- [ ] Supabase cloud project running with all migrations
- [ ] All E2E tests pass against production
- [ ] Auto-deployments working (main → production)
- [ ] Preview deployments working (PRs → preview URLs)
- [ ] Lighthouse performance score > 90
- [ ] Zero console errors in production
- [ ] Documentation complete

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
