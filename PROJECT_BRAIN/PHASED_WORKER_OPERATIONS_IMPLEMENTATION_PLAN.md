# Phased Worker Operations Implementation Plan

Status: Proposed; no feature implementation started from the supplied feature brief.
Owner: Product + Web + API + QA.
Date: 2026-11-20.

This plan turns the supplied 13-feature brief into a delivery sequence that protects the existing customer booking workflow. It includes worker/admin implementation, API and data work, customer-site changes, and release gates.

## Executive sequence

Do not start all 13 features together. Their dependencies form a platform workflow:

1. **Foundation gate:** prove one persistence path for booking, worker, wallet/ledger, notifications, and audit. The current code can create through Prisma and dispatch through Mongo-backed services; this split can skip auto-assignment. Resolve that before adding availability-based dispatch or balances.
2. **Ground Operations (features 1–5):** worker duty and eligibility, job navigation/contact, proof capture, and dual OTP completion. This completes fulfillment and dispute evidence.
3. **Money & Invoicing (features 6–9):** customer-approved quote changes, payout account management, payout ledger, and COD reconciliation. These depend on auditable job completion and a verified money ledger.
4. **Safety, Schedule & Trust (features 10–13):** SOS, availability/leave, training/assessment, and two-way reviews. Dispatch availability depends on feature 1 and 11; customer risk handling depends on the review and dispute policies.

## Phase 0 — Foundation and workflow proof

### Work

- Select one authoritative booking persistence adapter and make create, assign, accept, transition, OTP, payment state, and history use it consistently. First resolve Prisma-create/Mongo-dispatch divergence.
- Define a test environment and dedicated customer, admin, and workers. Add safe seed/reset tooling scoped to that environment only. Do not seed demo workers into production.
- Define booking transition invariants, idempotency rules, audit events, notification delivery/retry behavior, and role/ownership checks.
- Replace generic booking updates with field allowlists; status, amount, assignment, and payment must use dedicated operations.
- Verify customer → admin review → eligible worker → assignment alert → worker accept → en-route → arrival/start OTP → proof → end OTP → completion against persisted data.
- Choose the first pilot city and service categories; define worker skill/category and service-area matching data.

### Customer-site impact

- No new customer-facing capabilities yet. Make booking detail/tracking render only persisted state, assigned worker identity, and explicit unavailable states.
- Show clear status when no worker is assigned and preserve a support/cancel path where policy allows.
- Keep simulated payment methods visibly in development mode and never set paid from a client timer.

### Exit gate

Persisted state survives API restart; unauthorized users cannot read or mutate another booking; retries do not duplicate assignments, charges, or OTP actions; a full role-based test journey passes.

## Phase 1 — Core Ground Operations (features 1–5)

### 1. Worker duty switch and dispatch eligibility

**Backend/data:** add worker availability state (`online`, `offline`, `paused`), last state change, optional consented location timestamp, service area, and explicit schedule eligibility. Enforce availability inside the assignment query and again when assigning to avoid race conditions. Make online/offline changes authenticated, audited, rate-limited, and idempotent. Do not dispatch while offline, suspended, unverified, on approved leave, or outside service/shift coverage.

**Worker web:** add an accessible duty switch in worker dashboard and jobs header with server-confirmed state, pending/error state, reconnect handling, last-updated time, and location permission explanation. Browser geolocation can be requested only after worker action; do not silently poll when offline.

**Admin web:** show online/offline, last-seen, city/coverage, and active-job counts. Dispatch tools must explain why a worker is ineligible.

**Customer site:** no online-worker names or exact GPS are exposed. Booking confirmation and booking detail show `finding a professional`, `assigned`, or `no professional available` from server state. If dispatch times out, offer a retry/support/cancel option instead of implying an assignment.

**Acceptance:** online eligible worker can receive a matching job; offline/leave/ineligible worker never can; concurrent booking tests do not overbook the worker; browser permission denial does not prevent manual online status if the product permits non-GPS service.

### 2. One-click Google Maps navigation

**Backend/data:** persist a normalized service address and optional customer pin coordinates with consent and validation. Return only the assigned worker's job destination. Avoid persisting worker location unless a distinct feature requires it.

**Worker web:** for accepted/en-route jobs, build an encoded Google Maps directions URL with destination coordinates when present, otherwise a normalized address. Use a platform-compatible web/app link; provide copy-address fallback and handle missing address gracefully.

**Admin web:** expose address completeness and customer-provided pin to dispatch/support.

**Customer site:** add an optional map pin/adjust-address control during booking and show the confirmed service address/pin in booking detail. Explain that the pin is shared with the assigned worker.

**Acceptance:** special characters, apartment names, and non-English addresses produce a valid destination; missing GPS still navigates by address; only assigned workers can fetch the destination.

### 3. Worker-to-customer call and chat

**Backend/data:** add booking-scoped conversation/message records, participant checks, retention controls, delivery/read states, and rate limits. Use Socket.IO for live delivery with persisted fetch as recovery. Add a call-provider adapter boundary for masked calls; do not claim number masking until a provider number and callback flow are configured and verified.

**Worker web:** add Call and Chat controls to accepted/active job cards, plus approved quick replies. Disable contact outside allowed booking states and show provider unavailability clearly.

**Admin web:** authorized support access with audit log, report/abuse controls, and delivery diagnostics; do not expose conversations broadly by default.

**Customer site:** add the same booking-scoped chat and call entry points on booking detail/tracking, display message delivery state, and let customer report/block unsafe contact.

**Acceptance:** only booking participants and authorized support can access the conversation; messages persist across reconnect; scripted quick replies are labeled; call UI reports unsupported until relay integration is live.

### 4. Before/after work photos

**Backend/data:** use signed upload URLs or an authenticated upload service, file type/size limits, malware/content checks, private object storage, metadata (uploader, booking, stage, timestamp), retention/deletion workflow, and append-only proof references. Make before proof a start prerequisite and after proof a completion prerequisite for configured service types; allow documented admin exception with reason. Image timestamp should be server-verified metadata; a visual watermark is informational and not tamper-proof evidence.

**Worker web:** camera/file capture for before proof after start authorization and after proof before completion. Show upload progress, retry, preview, and failure recovery. Never mark proof uploaded until storage confirms.

**Admin web:** booking evidence gallery with actor/time and audit trail; complaint review can compare both sets.

**Customer site:** show before/after images on booking detail after upload, explain when photos are required, and provide privacy/report controls. Do not publish customer-home imagery to public reviews.

**Acceptance:** reject unsupported/malicious/oversized files; access control prevents cross-booking image access; failed upload blocks the required transition with recoverable UX; deletion/retention policy is enforceable.

### 5. Dual OTP completion protocol

**Backend/data:** retain separate start and end OTP challenges with expiration, attempt limits, lockout, regeneration ownership, audit records, and notification delivery. Completion requires start OTP verified, required proof present, and end OTP verified. Ensure OTP is never returned in booking list/detail payloads or logs. Regeneration is customer-owning-booking or authorized admin only. Current service has two OTP operations, but must verify all persistence adapters enforce the same conditions.

**Worker web:** enter start OTP only after arrival; submit before proof; capture after proof; request completion; enter customer-provided end OTP; display completion only after server confirmation.

**Admin web:** inspect OTP state/timestamps/attempts without seeing OTP values; allow audited exception resolution only with a reason.

**Customer site:** reveal/request start OTP only after backend reports arrived; show end OTP after worker requests completion; provide explicit confirmation that customer has inspected the work; allow dispute/report instead of OTP when work is incomplete. Explain that OTP confirms the customer's handover action, not a guarantee of workmanship.

**Acceptance:** invalid/expired/replayed/locked OTP cannot advance state; completion cannot bypass proof or end OTP; customer sees status only after committed API response/socket event.

## Phase 2 — Money, estimates, and settlement (features 6–9)

This phase must start only after payment, ledger, and accounting ownership are decided. Use append-only financial transactions and integer minor units (paise); never maintain balances by editing one number without ledger entries.

### 6. Spare parts/material estimate revisions

**Backend/data:** add booking quote revisions and line items (name, quantity, unit price, tax/fee treatment, evidence attachment, proposer, status, customer decision, timestamps). A revised quote is immutable after submission; subsequent changes create a new revision. Prevent extra work/material charges before customer approval except an explicitly designed safety exception.

**Worker web:** submit a revised estimate with line items and receipt/photo; see pending/approved/rejected state. Keep original service amount visible.

**Admin web:** inspect quote disputes and approve exceptions with audit trail.

**Customer site:** real-time notification, itemized revised total, Approve/Reject/Ask a question, and a clear pause/stop-work choice. Booking detail and final invoice show original quote and every accepted revision.

**Acceptance:** no silent total change; concurrent approvals are conflict-safe; customer approval is attributable and version-specific; total charge equals accepted quote plus explicitly allowed adjustments.

### 7. Worker payout account management

**Backend/data:** store payout method through a payment-provider tokenization/beneficiary API where available. Encrypt sensitive values at rest, never return full account numbers, mask in responses, log access, and require re-authentication/step-up verification for changes. Define beneficiary verification and ownership checks with the chosen provider.

**Worker web:** payout settings for bank/UPI, masked details, verification state, change history, and clear pending/failed messaging. Confirmed account number is never re-displayed.

**Admin web:** finance-only permission to inspect masked destination and verification status; all access/change events audited.

**Customer site:** no payout account or worker financial data is exposed.

**Acceptance:** secrets absent from logs/API/browser storage; invalid IFSC/VPA rejected by provider validation; account change triggers confirmation and risk controls; payout blocked until destination is verified.

### 8. Withdrawal request and payout ledger

**Backend/data:** define worker payable balance, holds, fees, payout request, provider transfer, webhook reconciliation, idempotency, UTR/reference, failure/return, and reversal entries. A UTR is stored only when supplied by the real provider. Add admin reconciliation/export and role-based finance controls.

**Worker web:** show available, pending, on-hold, paid, and COD commission due balances separately; withdrawal request form; paginated ledger with amount, masked method, provider reference, status, timestamps, and failure reason/retry path.

**Admin web:** payout queue, approve/reject policy, provider reconciliation, exception queue, and immutable audit trail.

**Customer site:** invoice and payment/refund history for the customer's own booking; no worker withdrawal details.

**Acceptance:** ledger balance reconciles to transactions; duplicate requests/webhooks do not double-credit/debit; failed transfer restores payable funds exactly once; no payout is labeled credited until provider confirms.

### 9. Cash-on-delivery collection and commission reconciliation

**Backend/data:** record customer amount due, worker-reported collection, customer confirmation/receipt where policy requires, commission liability, adjustments, and cash remittance. Decide commission rules and who bears refunds before release. Make cash collection and commission postings idempotent and auditable.

**Worker web:** collect amount, confirm method/cash amount, upload receipt if required, see cash in hand and commission due separately, and settle outstanding dues through supported channels.

**Admin web:** COD mismatch queue, commission receivable ledger, worker-level reconciliation, dispute/refund adjustment, and daily reporting.

**Customer site:** show amount due before service, confirm amount/method after collection, download invoice/receipt, dispute unexpected amounts, and see any authorized estimate revisions.

**Acceptance:** customer total, collected cash, worker earnings, platform commission, refund, and settlement reconcile exactly; no COD booking is marked paid merely because a worker clicked collected.

## Phase 3 — Safety, schedule, training, and trust (features 10–13)

### 10. Worker SOS

**Backend/data:** add emergency incident entity, severity, worker/booking linkage, consented location snapshots, acknowledgement/escalation timeline, resolution, and retention. Implement authenticated SOS endpoint, idempotent hold action, on-call routing, SMS/voice provider integration, and health monitoring. A UI siren without staffed/on-call delivery is not an emergency service.

**Worker web:** persistent SOS control with press-and-hold/cancel countdown, accessible keyboard/touch behavior, confirmed-send state, retry path, offline/call-helpline guidance, and worker-selected emergency contacts. Do not silently activate microphone recording; any future audio feature requires explicit consent, clear indicator, retention controls, and product/legal review.

**Admin web:** staffed emergency desk, audible/visual priority alert, acknowledge/escalate buttons, map only for consented current coordinates, incident timeline, and after-action report.

**Customer site:** customer receives only necessary service interruption/support messaging. Never expose worker SOS details, contact, or live location to the customer.

**Acceptance:** on-call drill verifies end-to-end delivery and acknowledgement SLA; duplicate SOS is deduplicated; stale GPS is marked stale; unavailable provider shows a fallback, not a false sent state.

### 11. Weekly availability and leave planner

**Backend/data:** normalized recurring weekly slots, timezone, exception dates, approved/blocked leave, lead time, and conflict rules. Use the customer's service-area timezone and define behavior for already-assigned work. Assignment checks both recurring availability and leave in the same authoritative query/service.

**Worker web:** weekly planner, timezone, shift save, leave request/block, existing assignment warning, and calendar/list view.

**Admin web:** availability coverage view and audited override/reassignment workflow.

**Customer site:** calendar offers only genuinely serviceable slots; if no worker capacity remains, customer can choose another slot/service area or join a waitlist. Do not show a slot as confirmed until booking API accepts it.

**Acceptance:** daylight-saving/timezone boundary cases, overlapping shifts/leaves, concurrent booking, and changes to already-assigned work are tested.

### 12. Training video, quiz, and certificate

**Backend/data:** training module/version, media metadata, completion evidence, quiz attempts/answers, pass threshold, expiry/retraining, certification issuer, and revocation. Only issue a certificate for approved curriculum and verified identity; do not imply PMKVY/government certification without a formal authorized partnership.

**Worker web:** accessible player, captions/transcript, progress, quiz, feedback, and certificate status/download. “Watched” means the defined completion threshold passed, not button clicked.

**Admin web:** course/module management, result audit, expiring credentials, and worker eligibility controls.

**Customer site:** show only verified, relevant worker qualification badges and expiry/issuer context; no training scores or private attempts.

**Acceptance:** video progress is persisted honestly; quiz is server-scored/versioned; certificate is verifiable and revocable; catalog service requirements can gate assignment.

### 13. Worker-to-customer rating

**Backend/data:** add a separate worker-authored customer review linked to a completed booking, one submission per worker/booking, structured behavior tags, moderation/report flow, visibility/retention rules, and appeal process. Keep this distinct from the customer's worker review and do not use raw accusations as an automatic ban trigger.

**Worker web:** post-completion rating prompt with optional tags and private safety/report route; explain visibility and allow skip where policy permits.

**Admin web:** moderation queue, repeated behavior signals, evidence/context, worker appeal, customer response, and audited account action. Require human review for restrictions.

**Customer site:** show a neutral account conduct notice or support contact when action is taken; do not publicly display sensitive worker-authored notes or unmoderated allegations. Allow customer response/appeal.

**Acceptance:** completed booking only; no duplicate ratings; harassment, retaliation, and discrimination moderation policy is defined; account enforcement is explainable and reviewable.

## Cross-cutting engineering requirements

- **Identity and authorization:** role and booking participant checks on every read/write, including socket room joins and media URLs. Do not trust client-supplied worker/customer IDs.
- **Data contracts:** version API payloads; use stable booking IDs; normalize enums/timestamps and store UTC with explicit display timezone.
- **Notifications:** persist important notifications before emitting; client socket event is a fast path, API inbox is recovery. Use delivery retries and prevent duplicate actions.
- **Reliability:** idempotency keys for booking create, quote decision, OTP regeneration, payment, COD collection, and payout. Use outbox/retry pattern for provider/socket side effects.
- **Observability:** correlation ID, actor, booking, transition, provider result, and latency. Never log OTP, full phone/account, access token, or private photo URL.
- **Accessibility and low-connectivity:** keyboard and screen-reader labels, Hindi/English copy, mobile-first camera flow, retryable uploads, and clear stale/offline state.
- **Privacy:** least-data location, purpose-bound retention, signed private photo access, explicit permissions, user data deletion process, and no sensitive finance/contact fields in customer-facing worker payloads.
- **Quality gates:** API state/authorization tests, client component/integration tests, multi-role browser journey, concurrency/retry tests, file upload abuse tests, provider sandbox tests, and operational runbooks before pilot.

## Recommended delivery order and release gates

| Milestone | Scope | Release gate |
|---|---|---|
| M0 | Persistence/dispatch unification, test fixtures, access-control baseline | Full booking journey persists and survives restart |
| M1 | Duty switch + availability/leave foundation (1 + 11 data contract) | Online eligibility and no-overbooking tests pass |
| M2 | Navigation + job contact (2 + 3) | Participant access and address handling verified; masked calling only if provider live |
| M3 | Photo proof + dual OTP (4 + 5) | Required proof and both OTP transitions enforced server-side |
| M4 | Quote revisions + payout destination (6 + 7) | Customer approval is immutable; financial data protected |
| M5 | Payout ledger + COD reconciliation (8 + 9) | Provider sandbox/reconciliation and accounting invariants pass |
| M6 | SOS + training + two-way review (10 + 12 + 13) | SOS drill staffed; training claims verified; moderation/appeal ready |

Deploy each milestone behind role/feature flags, run an internal test cohort, review support/dispatch/finance metrics, then expand city/service coverage. Emergency SOS and payout release require explicit operational owner and on-call procedures before enabling for workers.

## Success metrics

- Eligible-worker assignment rate, time-to-assignment, worker acceptance rate, no-show/cancel rate, and customer booking completion.
- Arrival punctuality and median travel time, reported separately from GPS coverage.
- Required-proof completion, upload failure/retry rate, dispute rate, and dispute resolution time.
- Quote revision approval/rejection rate and frequency of unapproved extra charges (target zero).
- Payout success/failure/return rate, ledger reconciliation variance (target zero), COD mismatch and commission overdue.
- SOS delivery/acknowledgement time, false alarm rate, and drill success (not just button clicks).
- Training completion/pass/retraining, skill-linked service quality, rating response/moderation time, and appeal reversal rate.

## Out of scope for the first pilot

- Guaranteed live GPS/ETA until consented telemetry, battery/network behavior, retention, and accuracy are verified.
- Automatic background audio recording from SOS.
- Real UPI/card settlement, instant payouts, or micro-deposits until a provider and compliance/finance operations are configured.
- Government/PMKVY certificate branding without formal issuer authorization.
- Automated worker/customer bans based only on a rating or single complaint.
