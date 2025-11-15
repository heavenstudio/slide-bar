# Per-Image Display Duration Feature

**Status**: 🟡 In Progress
**Started**: 2025-11-15
**Approach**: TDD with database schema, API, and UI implementation

## Goal

Add ability to set different display durations for each image in the slideshow, with:

- Individual image duration editing
- Batch duration editing for multiple images
- Organization-wide default duration settings
- Dynamic player timing

## User Requirements

- **Duration Settings**: After upload (edit in Dashboard grid), Global default in settings, Batch settings (apply to multiple images)
- **Constraints**: No constraints, default 5 seconds
- **Display Format**: Seconds only (e.g., '5s', '10s')
- **Migration**: Default existing images to 5000ms

## Phase 1: Database Schema & Types ✅

**Goal**: Add display_duration column to images table and create organization_settings table

### Tasks

- [x] Create failing tests for schema changes
- [x] Write migration for `display_duration` column (default 5000ms)
- [x] Write migration for `organization_settings` table
- [x] Apply migrations to dev and test databases
- [x] Regenerate TypeScript types
- [x] Update test fixtures and helpers
- [x] Verify all 92 tests passing

**Success Criteria**: Migrations applied, types generated, all tests passing

**Completed**: 2025-11-15
**Commit**: feat: add per-image duration database schema

## Phase 2: Player Dynamic Timing ✅

**Goal**: Make Player use per-image duration instead of hardcoded 5000ms

### Tasks

- [x] Update Player component to read `display_duration` from current image
- [x] Update useEffect dependencies to react to duration changes
- [x] Verify player cycles through images with correct timing

**Success Criteria**: Player displays each image for its configured duration

**Completed**: 2025-11-15
**Commit**: feat: implement dynamic per-image timing in Player

## Phase 3: Dashboard Duration Display ✅

**Goal**: Show duration on each image card

### Tasks

- [x] Update ImageGrid to display duration in seconds
- [x] Update README documentation
- [x] Verify display shows correct format (e.g., "⏱ 5.0s")

**Success Criteria**: Duration visible on all image cards

**Completed**: 2025-11-15
**Commit**: feat: display image duration in Dashboard grid

## Phase 4: Individual Duration Editing 🟡

**Goal**: Allow editing duration for individual images

### Tasks

- [x] Add `updateImageDuration` API function
- [x] Add duration editing UI to ImageCard
- [x] Add inline input with save/cancel buttons
- [ ] Update Dashboard to handle duration updates
- [ ] Add optimistic UI updates
- [ ] Write tests for duration editing
- [ ] Verify changes persist after page reload

**Success Criteria**: Users can click duration, edit value, save, and see changes in Player

**Status**: In Progress

## Phase 5: Batch Duration Editing

**Goal**: Allow selecting multiple images and setting duration for all

### Tasks

- [ ] Add checkbox selection to ImageCard
- [ ] Add "Select All" / "Deselect All" buttons
- [ ] Show selected count in header
- [ ] Add "Set Duration for Selected" button
- [ ] Create batch edit modal/dialog
- [ ] Implement batch update API call
- [ ] Update all selected images optimistically
- [ ] Write tests for batch editing
- [ ] Verify batch updates work correctly

**Success Criteria**: Users can select multiple images and set duration for all at once

## Phase 6: Organization Settings Page

**Goal**: Create settings page with organization-wide defaults

### Tasks

- [ ] Create Settings page component (`src/pages/Settings.tsx`)
- [ ] Add route for `/settings`
- [ ] Add "Settings" link to Dashboard header
- [ ] Display current organization default duration
- [ ] Add form to update default duration
- [ ] Create API function to update organization_settings
- [ ] Write tests for Settings page
- [ ] Verify default applies to new uploads

**Success Criteria**: Users can set organization default that applies to new images

## Technical Notes

### Database Schema

```sql
-- images table (modified)
ALTER TABLE images ADD COLUMN display_duration INTEGER DEFAULT 5000 NOT NULL;

-- organization_settings table (new)
CREATE TABLE organization_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  default_slide_duration INTEGER DEFAULT 5000 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(organization_id)
);
```

### API Functions

```typescript
// Implemented
export const updateImageDuration = async (imageId: string, durationMs: number): Promise<UpdateResponse>

// To implement
export const batchUpdateImageDuration = async (imageIds: string[], durationMs: number): Promise<UpdateResponse>
export const getOrganizationSettings = async (): Promise<OrganizationSettings>
export const updateOrganizationSettings = async (settings: Partial<OrganizationSettings>): Promise<UpdateResponse>
```

### UI Components

- **ImageCard**: Editable duration with save/cancel (in progress)
- **ImageGrid**: Batch selection and editing controls (pending)
- **Settings Page**: Organization default configuration (pending)

## Testing Strategy

- Unit tests for API functions
- Integration tests for database operations
- Component tests for UI interactions
- E2E tests for complete workflows

## Progress Tracking

- ✅ Phase 1: Database Schema & Types
- ✅ Phase 2: Player Dynamic Timing
- ✅ Phase 3: Dashboard Duration Display
- 🟡 Phase 4: Individual Duration Editing (80% complete)
- ⏳ Phase 5: Batch Duration Editing
- ⏳ Phase 6: Organization Settings Page

## Known Issues

- None currently

## Next Steps

1. Finish Phase 4 implementation (add duration update handler to Dashboard)
2. Write tests for individual editing
3. Implement Phase 5 (batch editing)
4. Implement Phase 6 (organization settings)
5. Update PR with complete feature
