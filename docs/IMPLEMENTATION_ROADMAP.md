# ServeCircle Implementation Roadmap

This roadmap is intentionally ordered by dependency. Complete and validate earlier phases before building later domains.

## Phase 0: context and safety

Status: complete.

- Separate runtime roots from docs and tooling.
- Remove Flutter client.
- Archive statically unused customer pages.
- Create durable AI documentation system.
- Preserve existing user changes.

## Phase 1: ordinary service booking

Status: partially complete.

Completed:

- Real web login and registration.
- Role dashboard guard.
- Customer booking creation.
- Customer booking history.
- Worker lifecycle endpoint alignment.
- Worker OTP endpoint alignment.
- Admin booking queue.

Remaining acceptance criteria:

- A real customer can register/login and receive a session.
- A customer can select an approved catalog service and create a Mongo booking.
- Booking appears in customer history and admin queue.
- Admin/system assignment reaches the correct worker.
- Worker can accept, travel, arrive, start with OTP, and complete with OTP.
- Customer can see persisted timeline/status.
- Cancellation and access control are tested for customer, worker, admin, and unrelated users.
- Payment remains explicitly pending until a real or clearly labelled development payment adapter exists.

## Phase 2: canonical service catalog

Status: next priority.

Progress:

- Added optional backend `serviceId` to the Service model and booking validation.
- Added stable IDs to the 9 initial backend services.
- Passed mapped launch IDs from ServiceDetail into BookingFlow for the initial launch set.

Tasks:

1. Compare all 110 frontend records with backend seed data.
2. Define stable service fields: `id`, display names/translations, category, workflowType, basePrice, pricingMode, duration, requiredSkills, emergency flag, active state.
3. Decide whether Mongo `_id` or a stable public `serviceId` is used in URLs and bookings. Prefer stable public IDs.
4. Import a small approved launch catalog idempotently.
5. Make `/api/services` the only runtime catalog source.
6. Update browser, category hubs, service detail, AI diagnosis, and booking flow to use canonical IDs/categories.
7. Mark unverified services as planned/hidden instead of allowing them into booking.

Validation:

- Catalog list and category filters return expected records.
- Every visible service opens a valid detail view.
- Every bookable service passes backend validation.
- No booking uses a display label as a service identity.

## Phase 3: operations and trust

Status: planned.

- Strictly allowlist generic booking field updates.
- Connect admin assignment/reassignment.
- Connect worker verification and remove mock fallback from the primary path.
- Connect complaints, notifications, analytics, exports, and audit timeline.
- Persist worker location only with explicit consent and show unavailable states.
- Replace fake tracking timers with persisted status and Socket.IO events.
- Make seed data idempotent and remove invalid `active` booking status.

## Phase 4: B2B

Status: planned.

- Establish organization ownership for B2B records.
- Connect locations and team members to backend records.
- Implement bulk request/parent work order.
- Expand parent requests into child bookings where needed.
- Add approval, SLA, contract, invoice, payment, renewal, and organization complaint flow.
- Reuse ordinary booking execution for child work.

## Phase 5: event management

Status: planned and separate from ordinary services.

Required domain:

- Event aggregate: owner, event type, date/time, venue, guests, theme, budget.
- Component services: decor, catering, photography, DJ, tent, cake, cleanup, etc.
- Quote and revision flow.
- Customer approval and deposit.
- Coordinator/admin ownership.
- Provider assignment per component.
- Child bookings linked to the event.
- Setup/live/cleanup/completion statuses.
- Final balance, invoice, review, and dispute handling.

Do not send an event estimate as a fake ordinary service name.

## Phase 6: payment and subscriptions

Status: planned.

- Choose payment provider and server-side verification strategy.
- Add payment intent/transaction records and idempotency keys.
- Keep booking payment state separate from UI payment selection.
- Implement subscription entitlements, renewal, cancellation, and failed payment handling.
- Keep development payment adapter clearly labelled.

## Phase 7: advanced platform features

Status: planned.

- Emergency dispatch SLA and availability.
- Real worker location/ETA with consent and retention policy.
- AI confidence, audit, cost controls, human fallback, and provider health.
- Worker training/certification records.
- Partner/NGO/government integrations only after contracts are defined.

## Definition of done for any phase

- Owning API/model/UI path is identified.
- Existing behavior and user changes are understood before editing.
- Focused tests or build validation pass.
- No new mock path silently replaces a real path.
- Relevant docs state what changed and what remains.
- `docs/PROJECT_STATE.md` and `docs/CHANGELOG.md` are updated.
