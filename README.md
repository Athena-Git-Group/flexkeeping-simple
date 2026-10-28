# TMS Web — Hotel Task Management (frontend)

An operations back-office for hotel housekeeping and maintenance: a live room
board, a unified work-item (assignment) list, room allocation, lost & found,
guest relations and audits. This is a frontend starter — it runs entirely on
in-memory mock data, no backend required.

## Tech stack

- **Vite** + **React 18** + **TypeScript** (strict)
- **React Router v6** for routing
- **TanStack Query** (`@tanstack/react-query`) for server-state and caching
- **Zustand** for the small amount of client session state
- **Tailwind CSS** for styling

## Run it

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check (tsc -b) then production build
npm run preview  # serve the production build
```

## What's in the box

| Screen | Path | What it does |
|---|---|---|
| Dashboard | `/` | Stat cards (dirty rooms, awaiting inspection, open tasks, urgent) + open work list |
| Housekeeping | `/housekeeping` | Room-status grid, filter by sector/cleanliness, click a room to inspect and change cleanliness |
| Tasks | `/tasks` | Assignment table, filter by type/state/priority, detail panel with to-do, comments, attachments |
| Room Allocation | `/allocation` | Pick an on-duty housekeeper, assign pending cleans by hand or spread them evenly (auto assign) |
| Lost & Found | `/lost-and-found` | Item list with lifecycle state |
| Guest Relations | `/guest-relations` | Feedback cards with satisfaction, severity, compensation |
| Audits | `/audits` | Inspection questionnaires and open-run counts |

The top bar switches the active facility and refetches that facility's slice.

## Data model overview

Property hierarchy: **Facility → Realm → Sector → Space** (room).

Core entities (`src/domain/types.ts`):

- **Space** — a room with `RoomCleanliness`, `Occupancy`, an `isStayover` flag and
  attribute flags (linen, towel, ECO, VIP, …).
- **Cleanup** — one cleaning job on a space (`CleanupState`, `CleanupType`).
- **Assignment** — the unified work item (`task | repair | issue | flaw_cleaning |
  room_order`) with state, priority, assignee, to-do items, comments, attachments.
- **LostAndFoundItem**, **Questionnaire** / **Question**, **GuestFeedback**,
  **User**, **Reservation**, **ConsumptionItem**.

Enum values are honest: a value means what its name says. Display strings live in
`src/domain/labels.ts` (one `key → label` map per enum, ready for i18n) and status
colors live in `src/domain/colors.ts` (Tailwind class tokens). Change a label or a
color in one place and every screen follows.

## Project layout

```
src/
  domain/      types, labels, colors — the single source of truth
  mock/        seed data + Promise-based repository (the fake backend)
  app/         session store (Zustand) + React Query client
  hooks/       React Query hooks (one per repository method)
  components/  UI primitives (ui/), app shell (shell/), domain components
  pages/       one file per screen
```

## Seams to replace when a real backend arrives

This project is built so the mock parts come out cleanly:

1. **Repository layer (`src/mock/repository.ts`)** — the main seam. Every data
   call goes through a repository method that returns a `Promise`. Swap the mock
   bodies for real HTTP/SDK calls and keep the signatures; the React Query hooks
   in `src/hooks/queries.ts` and every page stay unchanged. The artificial latency
   (`LATENCY_MS`) and in-memory mutation also live here.
2. **Auth & session (`src/app/session.ts`)** — the active facility and current
   user are plain client state. Replace with real authentication and a
   facility picker bound to the backend; feed the authenticated user in instead of
   the hardcoded name.
3. **Real-time sync** — the mock has none. A production build needs live updates
   (room status and assignments change from other devices). Add a subscription
   transport (WebSocket / SSE / a sync SDK) and have it invalidate or patch the
   relevant React Query keys. The query-key namespacing by facility is already in
   place to make targeted invalidation straightforward.
```
