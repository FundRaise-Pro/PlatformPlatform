# UI Demo Feature Requirements

## Purpose
`ui-demo` demonstrates a nonprofit platform where non-technical teams can run campaigns, fundraisers, applications, events, media operations, and partner workflows from one system.

This document maps implemented features to the product requirement each feature satisfies.

## 1. Multi-Campaign Website Portfolio (Old + New Goals)
### Requirement
The built website must include all campaigns by default so an NPO can present active, completed, and historical goals in one reliable public experience.

### Behavior
- Public header includes a campaign selector with lifecycle status badge.
- Landing page shows a campaign archive/live portfolio card list.
- Landing page campaign cards can open a selected campaign directly.
- Fundraisers page shows the full campaign portfolio and the selected campaign's fundraiser pages.
- Events page renders campaign events across all campaigns.
- Media page renders updates across all campaigns.

### Acceptance Checks
- If a new campaign is added to `config.campaigns`, it appears immediately in:
  - public campaign selector
  - landing campaign portfolio section
  - fundraisers campaign portfolio section
  - cross-campaign events/media lists
- Campaign status labels reflect lifecycle state (`active`, `completed`, `archived`, `planned`).
- Campaign-level public URLs remain route-stable:
  - `/campaigns/:campaignSlug/fundraisers/:fundraiserSlug`
  - `/campaigns/:campaignSlug/apply/:path`

### Technical Files
- `ui-demo/components/preview/PreviewNavigation.tsx`
- `ui-demo/components/preview/pages/LandingPage.tsx`
- `ui-demo/components/preview/pages/FundraisersPage.tsx`
- `ui-demo/components/preview/pages/EventsPage.tsx`
- `ui-demo/components/preview/pages/BlogPage.tsx`
- `ui-demo/components/Preview.tsx`
- `ui-demo/hooks/useHashRoute.ts`

### Data Requirement
Campaign lifecycle is modeled with:
- `CampaignLifecycleStatus`
- `CampaignRecord.lifecycleStatus`

Seed examples live in `ui-demo/lib/defaultConfig.ts`.

## 2. Visual Website Builder (Focus Mode + Drag/Resize)
## Requirement
Builder must allow drag/drop arrangement and per-component focus editing for non-technical users, using a 12-column layout.

## Implementation
- Interactive section canvas with:
  - drag-drop reorder
  - side resize (width in 12 columns)
  - bottom resize (height)
  - focus highlighting
  - `ui-demo/components/preview/PageSections.tsx`
- Builder constraints and helpers:
  - `ui-demo/lib/builderLayout.ts`
- Left editor panel redesigned to builder-first flow:
  - `ui-demo/components/Editor.tsx`
- App-level focus synchronization between preview and editor:
  - `ui-demo/App.tsx`
  - `ui-demo/components/Preview.tsx`

## Data Requirement
Sections store layout and media settings:
- `NarrativeSection.layout.columnSpan`
- `NarrativeSection.layout.minHeightRem`
- `NarrativeSection.layout.order`
- `NarrativeSection.mediaType`
- `NarrativeSection.mediaUrl`
- `NarrativeSection.ctaUrl`
- `NarrativeSection.ctaOpenInNewTab`

## 3. CTA Redirect URLs (Internal + External)
## Requirement
Each section CTA must optionally redirect to internal or external URLs.

## Implementation
- CTA URL + open-in-new-tab controls in focus inspector:
  - `ui-demo/components/Editor.tsx`
- Runtime rendering supports:
  - internal links (relative path)
  - external links (absolute URL)
  - new-tab behavior
  - `ui-demo/components/preview/PageSections.tsx`

## 4. Image and Video Media Support
## Requirement
Hero and section media must support URLs and video embeds (not image-only).

## Implementation
- Section media type/image/video controls:
  - `ui-demo/components/Editor.tsx`
  - `ui-demo/components/preview/PageSections.tsx`
- Hero media type/image/video controls:
  - `ui-demo/components/Editor.tsx`
  - `ui-demo/components/preview/PageHero.tsx`
- Video URL normalization for YouTube/Vimeo + direct file handling:
  - `ui-demo/lib/builderLayout.ts`

## Data Requirement
Page and section media model includes:
- `PageCustomization.heroMediaType`
- `PageCustomization.heroMediaUrl`
- `NarrativeSection.mediaType`
- `NarrativeSection.mediaUrl`

## 5. Media Operations Studio
## Requirement
Media management should be channel-aware and not cluttered.

## Implementation
- WYSIWYG media studio with channel planning for:
  - WhatsApp
  - Instagram
  - Facebook
  - Twitter/X
  - `ui-demo/components/Dashboard.tsx`
- Form-heavy controls are behind action buttons/sheets.
- Channel activity shown as DataTable.

## Data Requirement
Blog posts can store channel metadata:
- `BlogPost.channels`
- `BlogPost.channelStatus`
- `BlogPost.whatsappAudience`

## 6. Governance + CRM + Applications
## Requirement
Operational workflows must remain consistent while non-technical users manage supporters, partners, and application flows.

## Implementation
- Partner pool allocations are CRM-owned (not in application review):
  - `ui-demo/App.tsx`
  - `ui-demo/features/crm/CrmWorkspace.tsx`
  - `ui-demo/features/crm/allocationPolicy.ts`
- Application forms and conversion workflows remain campaign-aware:
  - `ui-demo/components/Dashboard.tsx`
  - `ui-demo/components/preview/pages/ApplyPage.tsx`

## Operational Notes
- Builder mode is active in editor preview only.
- Public mode remains non-editable.
- Hash routes keep campaign/page context and are integration-friendly for future backend wiring.
