 # Website Builder: Focus Mode, Drag-Resize, and Media Flexibility

## Summary
The website builder now supports an interactive visual workflow across all public pages:

- 12-column drag-and-drop section layout on live preview
- Click-to-focus component editing in the existing left editor panel
- Side and bottom resize handles (width and height)
- CTA redirect URLs (internal and external)
- Media URLs visible in editor for both image and video
- Embedded video URL support (YouTube, Vimeo, direct video files)

## Scope Implemented
- Builder features apply to all pages using `PageSections`:
  - `landing`
  - `fundraisers`
  - `events`
  - `blog`
  - `partners`
  - `apply`

## Data Model Changes
Updated in `ui-demo/types.ts`:

### `NarrativeSection`
- `ctaUrl?: string`
- `ctaOpenInNewTab?: boolean`
- `mediaType?: "image" | "video"`
- `mediaUrl?: string`
- `layout?: { columnSpan: number; minHeightRem: number; order: number }`

### `PageCustomization`
- `heroMediaType?: "image" | "video"`
- `heroMediaUrl?: string`

Existing fields remain intact for backward compatibility (`image`, `heroImage`).

## Key UI/UX Changes
## 1. Left Editor Panel Redesign
`ui-demo/components/Editor.tsx`

- Reworked to a builder-first flow:
  - `Builder` tab (new default)
  - `Global` tab
  - `Partners` tab
- Builder tab now includes:
  - Live canvas controls
  - Focus mode inspector
  - Page frame controls
  - Component map for quick focus switching

## 2. Focus Mode
- Clicking a section in live preview selects it.
- Selected section opens component-specific controls in the left panel.
- Non-selected components do not flood the panel with fields.

## 3. 12-Column Drag/Resize
`ui-demo/components/preview/PageSections.tsx`

- Drag and drop reorders sections.
- Side handles resize width (`columnSpan`, min 2 / max 12).
- Bottom handle resizes minimum height (`minHeightRem`).
- Ordering persists via `layout.order`.

## 4. CTA Redirects
`ui-demo/components/preview/PageSections.tsx`

- CTA button now supports URL navigation.
- Works for internal and external URLs.
- Optional open-in-new-tab behavior.

## 5. Image + Video Media
- Section media:
  - Image URL/upload
  - Embedded video URL
- Hero media:
  - Image URL/upload
  - Embedded video URL

`ui-demo/components/preview/PageHero.tsx` and `ui-demo/components/preview/PageSections.tsx` now render:
- direct video files with `<video>`
- embed URLs with `<iframe>`

## Architecture Wiring
## App-Level State and Sync
`ui-demo/App.tsx`

- Tracks focused builder component: `focusedBuilderSectionId`
- Passes page/focus state into `Editor`
- Enables builder mode for preview in editor view only
- Handles section update and reorder callbacks from preview

## Preview Bridge
`ui-demo/components/Preview.tsx`

- Added optional builder props:
  - `builderMode`
  - `focusedSectionId`
  - `onFocusSection`
  - `onUpdatePageSection`
  - `onReorderPageSections`
- Forwards section builder behavior into each page component.

## Utility Added
`ui-demo/lib/builderLayout.ts`

- Shared layout constraints and helpers:
  - layout defaults/clamping
  - sorting by persisted order
  - video URL normalization
  - direct video file detection

## Notes
- Builder interactions are active only in editor view; public view remains read-only.
- Existing content remains compatible even when new layout/media fields are missing.
