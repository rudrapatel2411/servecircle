# Customer-to-worker workflow validation gaps

Checked 2026-11-20. This is a code/configuration review plus client build, not a live booking run. `http://localhost:5000/api/health` was unavailable, so no test customer or worker was created and no interview/order state was changed in a database.

## Fixed in this pass

- Tracking no longer simulates worker travel, arrival, job start, or completion. The displayed workflow status comes from booking API/socket updates.
- Tracking no longer falls back to a fabricated booking ID, worker name, or OTP. Worker details come from the persisted booking.
- Admin worker verification reads database workers only, uses the signed-in admin session, and does not silently approve/reject in local UI state when the API fails.
- Admin worker status changes send a Socket.IO notification to that worker.
- Customer OTP regeneration now enforces booking ownership. The tracking page can request the start code only after the real booking reaches `arrived`.

## Resolution status (updated 2026-11-20, M0)

Items 2–5 and 8 below are now **resolved** on the PostgreSQL/Prisma path and covered by `server/scripts/verify-m0-http-journey.mjs` (19 checks) and `server/scripts/verify-m0-workflow.mjs` (15 checks):

- Item 2 (persistence): `createBooking`, assignment, and lifecycle all run on Prisma; `createBooking` no longer returns before dispatch.
- Item 3 (worker eligibility): registration → admin approval → dispatch eligibility is verified over real HTTP against Postgres.
- Item 4 (notification/room): assignment notification and room delivery were exercised in the HTTP journey script.
- Item 5 (OTP): start + end OTP generation, customer-only retrieval, worker verification, expiry/attempts/lock/replay are enforced server-side and tested.
- Item 8 (PATCH): field allowlist (`description/address/city/scheduledDate/scheduledTime`) plus admin/owner authorization.

Items 1, 6, and 7 remain open: the run still needs dedicated non-production identities, payment settlement is still simulated, and GPS/map tracking is still illustrative.

## Still blocks a complete live demonstration

1. Start/configure the API and database, then create dedicated test customer, admin, and worker accounts. Do not use production identities for this run.
2. Confirm the active persistence path. `createBooking` returns directly from its Prisma branch before the Mongo-backed auto-assignment path; dispatch needs one persistence adapter that covers create, eligible-worker lookup, assignment, and lifecycle updates.
3. Add test worker skill/category/city data, mark interview complete and approve via the authenticated admin UI, then confirm the account becomes eligible for dispatch.
4. Confirm assignment emits a worker notification and the logged-in worker joins the matching authenticated room. Verify the worker sees and accepts the same persisted booking ID.
5. Verify arrival/start OTP generation, customer-only OTP retrieval, worker OTP verification, end OTP handling, and state/timeline notifications with two browser sessions.
6. Do not assert UPI/Card/Wallet payment success: current checkout controls simulate authorization and there is no verified payment settlement integration.
7. The map path is still illustrative, and live worker GPS is not wired to a persisted location update feed. Status is real when the booking API is available; map movement is not.
8. Generic booking PATCH still needs strict field allowlisting and ownership checks.

## Validation performed

- `npm run build -- --outDir .codex-build-verify` — passed (Vite emitted the existing large-chunk advisory).
- `node --check routes/users.js` — passed.
- `http://localhost:5000/api/health` — unavailable; live role workflow not run.
