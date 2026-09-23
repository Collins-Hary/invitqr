# Dashboard Redesign — Changes Summary

This file documents the incremental, non-invasive dashboard redesign implemented in the frontend.

Date: 2026-08-12

Files added
- `frontend/src/components/dashboard/DashboardLayout.tsx` — layout wrapper that provides the sidebar (desktop) and header and mounts main content.
- `frontend/src/components/dashboard/Sidebar.tsx` — left navigation for dashboard (responsive, used inside overlay for mobile).
- `frontend/src/components/dashboard/HeaderBar.tsx` — header with greeting, search, avatar and mobile menu toggle.
- `frontend/src/components/dashboard/StatsCards.tsx` — high-level metric cards.
- `frontend/src/components/dashboard/RecentInvites.tsx` — recent invites list/cards used in overview.
- `frontend/src/components/dashboard/UpcomingEvents.tsx` — shows next events with time-to-event.
- `frontend/src/components/dashboard/QuickActions.tsx` — quick action CTAs (opens quick-create modal).
- `frontend/src/components/dashboard/QuickCreateModal.tsx` — quick event creation modal for fast workflows.

Files modified
- `frontend/src/pages/dashboard/Dashboard.tsx` — wrapped existing dashboard content into `DashboardLayout`; integrated `StatsCards`, `RecentInvites`, `UpcomingEvents`, `QuickActions`, and wired quick-create to refresh events.

Notes
- Design approach: non-invasive, reuse existing services (`frontend/src/services/auth.ts`) and routes; no new router wrappers added.
- Mobile support: sidebar overlay + header toggle implemented.
- Quick-create is intentionally lightweight and calls the existing `createEvent` service, then refreshes the dashboard list.

How to test locally
1. Run frontend dev server:

   npm --prefix frontend run dev

2. Open app and navigate to the dashboard. Verify:
   - Sidebar visible on desktop and toggleable on mobile (☰ button).
   - Stats cards show aggregated values.
   - Recent invites and upcoming events render correctly.
   - Quick Actions → "+ Criar Convite" opens a modal and newly created events appear in the list.

If you want, I can now refine responsive spacing, accessibility attributes (aria), or run the dev server and fix any runtime issues.
