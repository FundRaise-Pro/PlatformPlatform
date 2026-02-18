# FundRaise Pro — Product Vision

> **This file is the single source of truth for what we are building.**
> Every AI agent session should read this file first to understand the end goal, the current state of the product, and what remains to be done.

---

## What We Are Building

**FundRaise Pro** is a multi-tenant SaaS platform for nonprofit organizations (NPOs), schools, churches, and community groups to run professional-grade fundraising operations. It is built on top of [PlatformPlatform](https://github.com/platformplatform/PlatformPlatform) — a production-ready .NET + React monorepo that provides multi-tenancy, authentication, subscription billing, and infrastructure out of the box.

Each tenant (organisation) gets:
- A **branded public website** to showcase their cause, campaigns, stories, events, and blog
- An **admin dashboard** to manage fundraising operations, donors, transactions, certificates, QR codes, and settings
- **Configurable terminology** so the platform adapts its language per tenant (e.g. "Donation" can become "Tithe", "Campaign" can become "Project")
- **Payment processing** (PayFast for South Africa, with Stripe as a future international option)
- **Legal compliance tools** — Section 18A tax deduction certificates for South African NPOs

---

## Who The Users Are

| User | What they do |
|------|-------------|
| **Organisation Admin** | Manages campaigns, stories, events, branches, users, settings, certificates, QR codes, and transactions via the admin dashboard at `/{slug}/fundraiser/` |
| **Public Donor** | Browses the public website, learns about the cause, and makes donations. Can optionally create an account to track donation history, receive certificates, and get updates |
| **End User / Beneficiary** | Submits applications for support via the organisation's public forms |
| **Platform Owner (you, Colin)** | Manages the overall SaaS platform, subscription tiers, and back-office operations |

---

## The Core User Journeys

### Journey 1: Donor discovers → donates → gets certificate
```
Public site homepage → Campaigns → Campaign detail → Story detail → Donate page
    → Payment (PayFast) → Transaction recorded → Certificate auto-generated
```

### Journey 2: QR code at event → instant donation
```
Scan QR code → Redirect to donate page (with channel=qrCode tracking)
    → Payment → Transaction with provenance tracking
```

### Journey 3: Admin manages fundraising lifecycle
```
Create campaign → Add stories/fundraisers → Set goals → Publish
    → Monitor donations in real-time → Generate certificates → Export reports
```

### Journey 4: Returning donor with account
```
Donor creates optional account → Logs in → Views donation history
    → Downloads Section 18A certificates → Receives personalised campaign updates
    → Makes repeat/recurring donations with saved details
```

> **Note**: Donor accounts are entirely optional. Anonymous one-off donations must always remain supported. The account simply enhances the experience for repeat donors by giving them a dashboard to view their history and download certificates.

---

## System Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    AppGateway (YARP)                       │
│            ┌─────────────┬──────────────┐                │
│            │             │              │                 │
│     account-management  fundraiser   back-office         │
│     (Auth, Users,       (Core SCS)   (Support/Ops)       │
│      Tenants, SSO)                                       │
│            │             │              │                 │
│     ┌──────┴──────┐ ┌───┴────┐  ┌──────┴──────┐         │
│     │ WebApp(SPA) │ │WebApp  │  │ WebApp(SPA) │         │
│     │ Api         │ │Api     │  │ Api         │         │
│     │ Core        │ │Core    │  │ Core        │         │
│     │ Workers     │ │Workers │  │ Workers     │         │
│     │ Tests       │ │Tests   │  │ Tests       │         │
│     └─────────────┘ └────────┘  └─────────────┘         │
│                                                          │
│     public-site (Next.js SSR — the public storefront)    │
│     shared-kernel (.NET shared infrastructure)           │
│     shared-webapp (React shared UI components)           │
└──────────────────────────────────────────────────────────┘
```

### Tech Stack
- **Backend**: .NET 10, Minimal API, MediatR (CQRS), EF Core, Vertical Slice Architecture
- **Admin Frontend**: React 19, TanStack Router + Query, ShadCN 2.0 + BaseUI, Rsbuild, Module Federation
- **Public Site**: Next.js (App Router), Server Components, Server Actions
- **Database**: SQL Server (Aspire-managed locally)
- **Payments**: PayFast (South Africa), Stripe (future)
- **Infrastructure**: Azure, Aspire, Docker, Bicep IaC

---

## Feature Domains (Fundraiser Module)

These are the 16 feature areas within the `fundraiser` self-contained system:

| Domain | What it does | Admin route | Status |
|--------|-------------|-------------|--------|
| **Campaigns** | Fundraising campaigns with goals, stories, and tags | `/fundraiser/campaigns` | ✅ Built |
| **Stories** | Individual fundraiser stories within campaigns (a beneficiary's story) | `/fundraiser/stories` | ✅ Built |
| **Donations** | Transaction processing, payment integration, donor management | `/fundraiser/donations`, `/fundraiser/transactions` | ✅ Backend, ⚠️ Public payment flow incomplete |
| **Events** | Fundraising events with dates, venues, and linked campaigns | `/fundraiser/events` | ✅ Built |
| **Certificates** | Section 18A tax certificate template management and generation | `/fundraiser/certificates` | ✅ Backend, ⚠️ PDF rendering placeholder |
| **QR Codes** | Generate QR codes that link to donation pages with tracking | `/fundraiser/qr-codes` | ✅ Built |
| **Blogs** | Content management for the public blog | `/fundraiser/blogs` | ✅ Built |
| **Applications** | End-user/beneficiary application forms for support | `/fundraiser/applications` | ✅ Built |
| **Forms** | Dynamic form builder for applications and surveys | `/fundraiser/forms` | ✅ Built |
| **Branches** | Multi-branch support for organisations with regional offices | `/fundraiser/branches` | ✅ Built |
| **End Users** | Beneficiary/end-user profiles and management | (via Applications) | ✅ Built |
| **Users** | Organisation staff and volunteer user management | `/fundraiser/users` | ✅ Built |
| **Subscriptions** | SaaS subscription and billing management | `/fundraiser/subscription` | ✅ Built |
| **TenantSettings** | Theme, brand, domain, content labels, payment config, feature flags | `/fundraiser/settings` | ✅ Built |
| **Public** | Anonymous public API endpoints for the public site | N/A (API only) | ⚠️ In progress |
| **Provisioning** | Tenant setup and initial data seeding | (automatic) | ✅ Built |

---

## What Remains To Be Done

### 🔴 Critical Path (Must-have for MVP)

1. **Payment Integration (PayFast)**
   - Wire up `CreatePublicTransaction` backend command to actually create PayFast payment sessions
   - Build the donate page form that submits to PayFast and handles return/ITN callbacks
   - Test the full payment round-trip: form → PayFast → ITN → transaction status update
   - *Requires: PayFast MCP server or sandbox credentials*

2. **Transaction Provenance** (Phase 1 of integration plan)
   - Add `DonationChannel` enum to `Transaction` entity (Web, QrCode, EventKiosk, Api, Manual)
   - EF Core migration for the new column
   - Pass channel through `CreatePublicTransaction` for origin-of-funds tracking

3. **Public API Endpoints** (Phase 2 backend)
   - `CreatePublicTransaction` command (anonymous donation)
   - `GetPublicStoriesByCampaignSlug` query
   - `GetPublicStoryBySlug` query
   - `GetPublicEventBySlug` query
   - Wire up in `PublicEndpoints.cs`

4. **QR Code → Donation Flow** (Phase 5)
   - Ensure QR code redirect includes `?channel=qrCode` parameter
   - Test scan → donate → track flow

5. **Certificate Generation** (Phase 6)
   - Add minimum donation threshold to `CertificateTemplate`
   - Actual PDF rendering (currently stubbed)
   - Include fuller donor details (ID number, tax number, address)

6. **Donor Accounts (Optional)**
   - Public-site login/signup flow for donors (email-based, lightweight)
   - Donor dashboard: donation history, certificate downloads, profile management
   - Link anonymous past donations to an account (by matching email)
   - Saved donor details for faster repeat donations
   - Account is always optional — anonymous donations remain fully supported

### 🟡 Important (Should-have)

7. **Auditing Infrastructure**
   - Entity-level audit trail with user attribution
   - Immutable financial records
   - Comprehensive reporting/export capabilities
   - *Covered in separate conversation (f97232d2)*

8. **Stripe Integration**
   - International payment option alongside PayFast
   - Configurable per-tenant via `PaymentConfig.Provider`

9. **End-to-End Tests**
   - Full donor journey: browse → select → donate → confirm
   - Admin workflow: create campaign → add story → publish → verify on public site

### 🟢 Nice-to-have (Post-MVP)

10. **Back-Office Tools** — Support/ops dashboard in the `back-office` SCS
11. **Advanced Reporting** — Financial dashboards, donor analytics, campaign performance
12. **Email Notifications** — Donation receipts, certificate delivery, campaign updates
13. **Recurring Donations** — Monthly/weekly giving via PayFast subscriptions
14. **Multiple Languages** — Full i18n beyond en-US (Afrikaans, Zulu, etc.)
15. **API for Partners** — RESTful API for corporate sponsors and integration partners

---

## Design Principles

1. **Tenant-first**: Everything is scoped to a tenant. Every label, colour, and feature toggle is configurable per-organisation
2. **South Africa first, global later**: PayFast + ZAR as default, Section 18A compliance — then Stripe + multi-currency
3. **Compliance is non-negotiable**: Immutable financial records, audit trails, and certificate generation are not optional for NPOs
4. **The public site must inspire trust**: Professional, branded, and polished — donors need to feel confident giving money
5. **Convention over configuration**: Follow PlatformPlatform's existing patterns (Vertical Slices, CQRS, ShadCN, Module Federation) — don't invent new ones
6. **No half-measures on payment**: The donation flow must be rock-solid. Failed payments, double-charges, and lost transactions are unacceptable

---

## Configurable Terminology (ContentConfig)

The platform adapts its language per tenant via `ContentConfig`:

| Setting | Default | Example Override |
|---------|---------|------------------|
| `ApplicationLabel` | "Application" | "Request" |
| `CauseType` | "Cause" | "Ministry" |
| `BeneficiaryLabel` | "Beneficiary" | "Student" |
| `DonationLabel` | "Donation" | "Tithe" |
| `CampaignLabel` | "Campaign" | "Project" |
| `BranchLabel` | "Branch" | "Chapter" |

All public-facing text uses these labels dynamically. Never hardcode "donation" or "campaign" in the public site.

---

## Key Technical Decisions Already Made

- **PlatformPlatform as foundation** — we extend, not replace, the existing SCS architecture
- **`fundraiser` is the core SCS** — all fundraising domain logic lives here
- **`public-site` is a separate Next.js app** — SSR for SEO, server actions for API calls, no TanStack Query
- **PayFast as primary payment provider** — configured via `PaymentConfig` in TenantSettings
- **Strongly typed IDs everywhere** — `TransactionId`, `CampaignId`, `StoryId`, etc.
- **Custom domains per tenant** — via `DomainConfig` in TenantSettings

---

## How To Use This File

**For AI agents**: Read this file at the start of every session. It tells you:
- What the product IS (a fundraising SaaS)
- Who uses it (admins, donors, beneficiaries)
- What domains exist (16 feature areas)
- What's done and what isn't (the status table + remaining work list)
- How to make decisions (design principles)

**For Colin**: Update the "What Remains" section as work is completed. This is your living project roadmap.
