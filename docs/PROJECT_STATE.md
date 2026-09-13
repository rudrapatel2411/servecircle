# ServeCircle Current Project State

Last updated: 2026-09-11
Source of truth for the current state. Update this file whenever a workflow, domain boundary, runtime root, or priority changes.

Feature truth classification is maintained in `docs/IMPLEMENTATION_STATUS_REPORT.md`.

## Active runtime

- Web: React 19 + Vite in `client/`.
- API: Express 5 + Mongoose + Socket.IO in `server/`.
- Database: MongoDB Atlas first, local Mongo fallback.
- AI provider: Groq (Qwen 3.8 27B Multimodal/Vision) active primary; Gemini configured as secondary fallback.
- Mobile: Flutter project removed completely from `mobile/`.

## Current runtime roots

- `client/`: web runtime and public assets.
- `server/`: API runtime, models, services, AI, tests, deployment files.
- `docs/`: engineering/product context and workflow reports.
- `tools/`: maintenance/content/asset scripts, separated from runtime.
- `client/src/pages/_archive/`: statically unused legacy customer pages; not runtime routes.

## Verified working slices

1. Web login calls `POST /api/auth/login`, stores JWT/user session, verifies selected role, and routes to the matching panel.
2. Web registration calls `POST /api/auth/register`, stores the returned session, and routes to the matching panel.
3. `DashboardLayout` redirects unauthenticated sessions to login and blocks a session from opening another role panel.
4. Customer booking confirmation calls `POST /api/bookings` with the authenticated token and uses the persisted booking database ID for tracking navigation.
5. Customer booking history calls `GET /api/bookings/my` and renders persisted bookings.
6. Worker accept/reject/en-route/arrive actions use dedicated backend endpoints.
7. Worker start/end OTP verification uses backend OTP endpoints; worker status labels match the backend state machine.
8. Admin booking queue calls `GET /api/bookings` and renders populated customer/worker records.
9. Worker ID verification supports manual Worker ID lookup and uploaded ID-card image QR scanning through `qr-scanner`, backed by `POST /api/verify/worker`.
10. Backend launch services have stable public `serviceId` values, and the service-detail-to-booking path passes mapped IDs for the initial launch set.
11. Client build passes with `Set-Location client; npm run build`.
12. All 61 reorganized tool JavaScript files pass `node --check`.
13. Customer AI Chat is powered by Groq Qwen 3.8 27B with native multimodal vision, multilingual fluency (Hinglish/Hindi/Gujarati/English), and catalog-backed service mapping; hardcoded regex intent blocks and offline mock fallbacks removed.
14. Universal catalog & booking validation: all 110 canonical services across 19 categories seeded and validated with category slug/title normalization; free ₹0 estimates supported without validation error.
15. Instant Cash on Delivery order creation: bypasses modal delays, calls `POST /api/bookings` with `paymentMethod: 'Cash'`, and routes to live tracking with real booking ID.
16. Interactive demo payment simulators: UPI and Card modal with 1-click test authorization and 4s timer simulation.
17. Seed data booking status `active` replaced with canonical `started`.
18. Resilient offline/demo fallback: `demoBookingStore.js` and in-memory service fallback in `serviceService.js` ensure 100% availability for testing when MongoDB Atlas IP whitelist is restricted or offline.

## Backend booking contract

Canonical status flow:

`pending -> assigned -> accepted -> en-route -> arrived -> started -> completed -> paid -> closed`

- `rejected` returns to `pending`.
- Cancellation is allowed through `arrived`.
- `closed` and `cancelled` are terminal.
- Dedicated workflow endpoints must be used for status changes.

Key endpoints:

- Customer/B2B create: `POST /api/bookings`
- Customer list: `GET /api/bookings/my`
- Worker jobs: `GET /api/bookings/jobs`
- Admin list: `GET /api/bookings`
- Admin assign: `PATCH /api/bookings/:id/assign`
- Worker accept/reject: `PATCH /api/bookings/:id/accept`, `/reject`
- Worker progress: `PATCH /api/bookings/:id/en-route`, `/arrive`, `/start`, `/complete`
- Worker OTP: `POST /api/bookings/:id/start-otp/verify`, `/end-otp/verify`
- Customer/admin payment: `PATCH /api/bookings/:id/pay`
- Customer/worker/admin cancel: `PATCH /api/bookings/:id/cancel`
- Admin close: `PATCH /api/bookings/:id/close`

Important: current payment UI simulations do not prove real payment settlement. Do not mark a booking paid from a fake timer or simulated UPI/Card confirmation.

## Current known gaps

### P0: workflow blockers

- Generic booking field PATCH needs stricter ownership/field allowlisting.

### P1: next integrations

- Connect worker dashboard/schedule/earnings fully to persisted data and remove demo-token paths.
- Connect admin assignment, complaints, notifications, analytics, and worker verification to real data.
- Replace simulated tracking with persisted timeline/Socket.IO updates where available.
- Connect B2B contracts, locations, teams, bulk requests, child bookings, and invoices.

### P2: separate domains

- Add event aggregate, event components, quote/approval, coordinator, vendor assignment, deposits, revisions, cleanup, and final invoice.
- Add real payment provider and subscription entitlement enforcement.
- Add emergency dispatch SLA and provider availability.
- Verify advanced AI claims with production integrations, confidence handling, and fallbacks.

## Known safety constraints

- Do not move or rename `client/` or `server/` without coordinated config/deployment/import updates.
- Do not treat PDF claims or UI pages as proof of implementation.
- Do not use `active` or other non-canonical booking statuses; use `bookingStates.js`.
- Do not merge event management into ordinary one-service bookings.
- Do not delete archived/demo files without checking routes, imports, and product intent.
- Do not expose secrets from `.env` or tunnel configuration in documentation.
- Existing unrelated worktree changes may belong to the user; preserve them.

## Current recommended next task

Canonicalize the service catalog. First compare the 110 frontend records to the 9 backend records, define one stable service schema/ID strategy, choose a small launch set, seed it idempotently, expose it through `/api/services`, and update the service browser/booking flow to consume that API. Validate catalog reads and booking validation before expanding service count.
