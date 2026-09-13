# ServeCircle Role, Workflow, and Service Audit

For session handoff and update rules, read `docs/AI_START_HERE.md`, `docs/PROJECT_STATE.md`, and `docs/AI_WORK_PROTOCOL.md` first.

## Purpose

This document describes what the current system actually contains, what is only UI/demo behavior, how roles and services should interact, and the simplest workflow to make the platform operational. It is based on the current React web client, Express/Mongoose backend, route and model contracts, service registry, tests, and the business-plan PDF.

This is an engineering/product audit, not a promise that every item shown in the UI is production-ready.

## Executive summary

ServeCircle currently has a broad multi-role web experience but only a narrow integrated workflow.

The strongest foundation is in the backend:

- JWT middleware and role enum exist.
- A booking state machine exists and is implemented through dedicated workflow endpoints.
- Mongo models cover users, services, bookings, reviews, wallets, complaints, contracts, invoices, notifications, partners, metrics, and AI analysis.
- Socket.IO rooms exist for admin, worker, and customer updates.
- AI provider, multimodal, intelligence, and trust-match layers exist.

The main problem is that the web client and backend are not one coherent product yet:

- Customer booking confirmation now creates a persisted backend booking, but many service entry points still send unverified display names/categories.
- Login and registration now call the authentication API and store a web session; broader session refresh/logout and API coverage still need work.
- The frontend has 110 service records across 19 categories; the backend initial seed contains only 9 services.
- Event management is a rich frontend estimator routed into the ordinary booking flow, but the backend has no customer-event domain.
- Worker, admin, and B2B screens contain a mixture of real API calls, static data, mock data, and incorrect endpoint assumptions.
- Subscriptions, UPI payment, GPS tracking, emergency guarantees, and several AI capabilities are presented more strongly than their integrations prove.

The safest product direction is to build one real service-booking workflow first, use one canonical service catalog, and keep event management as a separate order/workflow domain.

## Current roles

The database currently defines four application roles:

| Role | Current UI | Current backend support | Correct responsibility |
|---|---|---|---|
| Customer | Customer dashboard, catalog, booking, wallet, subscriptions, AI, reviews, tracking | Can create/read/pay/cancel own bookings when authenticated | Discover services, create bookings, approve work, pay, review, raise complaints |
| Worker | Jobs, schedule, earnings, training, profile, pro progression | Can read jobs and use dedicated booking lifecycle endpoints | Maintain profile/availability, accept jobs, execute work, upload proof, complete jobs |
| Admin | Operations dashboard, bookings, verification, analytics, complaints, coupons, partners, notifications | Strongest API role coverage | Verify workers, manage catalog, dispatch/reassign, moderate, refund/close, operate platform |
| B2B | Dashboard, bulk booking, contracts, locations, team, invoices | Backend contracts/invoices/partners exist | Manage organization, locations, recurring requests, approvals, invoices, and SLAs |

There is no separate `event_manager`, `vendor`, `customer_support`, `finance`, or `dispatcher` role in the current User model. Event decorators, caterers, photographers, DJs, and vendors are currently represented as service/provider concepts, not as a separate operational role.

### Role access that should be enforced

- Customer: only own profile, own bookings, own wallet, own reviews, own complaints.
- Worker: only assigned/eligible jobs, own schedule, own earnings, own profile and verification state.
- Admin: platform-wide operations and moderation.
- B2B: organization-owned contracts, locations, team members, bookings, invoices.
- Public: catalog browsing, public worker verification, health check only.

The current web router exposes customer, worker, admin, and B2B panels without client-side route protection. Backend protection exists, but the UI should not rely on navigation secrecy.

## Menus and current service taxonomy

### Current customer menu surfaces

The web client currently exposes these customer areas:

- Services and general services
- Home repairs
- Vehicle services
- Cleaning and hygiene
- Furniture and decor
- Garden and outdoor
- Events and celebrations
- Emergency services
- Food and kitchen
- Travel and commute
- Pet services
- Health and wellness
- Society management
- Relocation and packers
- My home and warranty tracking
- Booking history and ordered services
- Wallet and subscriptions
- Reviews and trust/safety
- AI diagnosis and AI chat
- Video consultation
- Group booking
- Live tracking
- Premium/demo flows for pet, food, travel, society, health, vehicle, and packers

The number of screens is much larger than the number of stable backend workflows. The customer menu should eventually be driven by the canonical catalog and a small set of workflow types, not by one custom page per idea.

### Frontend catalog reality

`client/src/data/servicesRegistry.js` contains 110 service records in 19 categories:

| Category | Count | Domain classification |
|---|---:|---|
| `home-repairs` | 10 | Standard service |
| `vehicle-services` | 8 | Standard service |
| `cleaning` | 7 | Standard service |
| `events` | 6 | Event component/service |
| `home-it` | 7 | Standard service |
| `care-family` | 5 | Care/personal service |
| `utility-daily` | 5 | Standard service |
| `learning-support` | 5 | Appointment/service |
| `property-services` | 5 | Property service |
| `festive-seasonal` | 5 | Seasonal/event-adjacent service |
| `furniture-decor` | 7 | Standard service |
| `garden-outdoor` | 6 | Standard service |
| `relocation` | 6 | Project/logistics service |
| `health-wellness` | 6 | Sensitive appointment service |
| `kids-elderly` | 4 | Care service |
| `pet-services` | 5 | Care/appointment service |
| `food-kitchen` | 5 | Delivery/preparation service |
| `travel-commute` | 4 | Transport service |
| `society-management` | 4 | B2B/community service |

Representative frontend service IDs include:

- Home: `ac-repair`, `electrician-visit`, `plumbing-fix`, `carpenter-visit`, `painter-pro`, `geyser-repair`, `locksmith-pro`, `appliance-install`, `chimney-service`, `water-purifier`.
- Vehicle: `car-wash`, `bike-repair`, `battery-jumpstart`, `dent-paint`, `car-detailing`, `bike-puncture`, `windshield-repair`, `engine-coolant`.
- Cleaning: `deep-clean`, `sofa-cleaning`, `pest-control`, `water-tank-clean`, `bathroom-deep-clean`, `kitchen-deep-clean`, `fridge-cleaning`.
- Events: `birthday-decor`, `catering-service`, `dj-setup`, `photographer-pro`, `stage-lighting`, `anchor-emcee`.
- Technology/home IT: `wifi-setup`, `cctv-setup`, `smart-doorbell`, `smart-tv-setup`, `pc-tuneup`, `printer-install`, `home-theater-sync`.
- Care and learning: `elder-care`, `beauty-home`, `makeup-artist`, `yoga-instructor`, `cook-for-day`, `home-tuition`, `seniors-computer`, `spoken-english`, `coding-tutor`, `resume-writing`.
- Property/seasonal: `tenant-ready`, `rental-inspection`, `pest-pre-purchase`, `house-appraisal`, `key-management`, `waterproofing`, `diwali-prep`, `air-purifier-service`, `christmas-tree-decor`, `holi-color-clean`.
- Furniture/garden: `furniture-assembly`, `furniture-polish`, `interior-design`, `wallpaper-install`, `sofa-upholstery`, `curtain-installation`, `modular-kitchen-fix`, `plant-care`, `lawn-mowing`, `welding-gate-fix`, `drip-irrigation`, `garden-design`, `outdoor-lighting`.
- Logistics/health/care: `full-home-shifting`, `single-item-transport`, `storage-vault`, `office-shifting`, `packing-supplies`, `vehicle-transit`, `doctor-visit`, `physiotherapy`, `lab-diagnostics`, `nurse-home-care`, `mental-wellbeing`, `fitness-trainer`, `babysitting`, `special-needs-care`, `newborn-nanny`, `seniors-activity-companion`.
- Pet/food/travel/community: `pet-grooming`, `vet-visit`, `pet-walking`, `pet-sitting`, `aquarium-cleaning`, `home-chef`, `tiffin-subscription`, `custom-cake`, `banquet-catering`, `dietician-plan`, `airport-transfer`, `outstation-chauffeur`, `luxury-cab`, `weekend-getaway-driver`, `rwa-bulk-clean`, `society-security`, `rwa-pest-spray`, `cctv-gate-sync`.

### Backend catalog reality

`server/services/serviceService.js` seeds only 9 initial services when the database is empty:

- Electrical Work
- Plumbing
- Carpentry
- AC & Appliance Repair
- Painting
- Car Repair
- Bike Repair
- Home Deep Cleaning
- Pest Control

The backend `Service` model and `/api/services` routes are designed to become the canonical catalog, but the frontend still owns a separate static registry. This is the highest-priority structural mismatch.

### Required catalog decision

Choose one canonical representation:

1. Database-backed catalog is the source of truth.
2. Every service has a stable machine ID, display names/translations, category, service type, pricing rules, availability, worker skill requirements, and active state.
3. Frontend fetches `/api/services` and does not invent service IDs locally.
4. Seed data imports the approved catalog once.
5. Event components reference catalog service IDs rather than creating fake service names.

Do not try to make 110 services production-ready at once. Classify them into `active`, `planned`, and `hidden`; launch a small verified set first.

## Workflow status by role

### Customer workflow: current

1. Customer authenticates through the connected web login/register flow.
2. Customer opens a dashboard or service hub and enters date, time, address, tier, coupon, and payment choice.
3. Booking confirmation calls the backend and navigates using the persisted booking database ID.
4. Booking history reads persisted customer bookings; tracking, payment settlement, OTP customer controls, and some order cards remain mock/local or incomplete.
5. AI chat and diagnosis are also customer-to-backend integrations.

### Customer workflow: should be

1. Login/register through `/api/auth/login` or `/api/auth/register`; store the JWT and role.
2. Store JWT and user role in one web auth store.
3. Fetch services from `/api/services`.
4. Select service and submit validated request to `POST /api/bookings`.
5. Receive a persisted booking ID and `pending` or auto-assigned status.
6. See assignment, timeline, worker profile, ETA, OTP controls, payment, review, and complaint from persisted APIs/events.

### Worker workflow: current

- Worker login/API helper exists.
- Jobs, profile, earnings, and schedule pages exist.
- Some screens use backend calls; other paths use demo tokens or mock jobs.
- Worker job actions and OTP verification now match the backend's dedicated lifecycle endpoints.
- Demo-token/mock-job paths and some worker dashboard/schedule/earnings surfaces still remain.

### Worker workflow: should be

1. Register as worker.
2. Complete profile, skills, city, availability, ID/KYC, and interview status.
3. Admin verifies and sets worker tier/status.
4. Worker receives eligible `assigned` jobs.
5. Worker accepts or rejects.
6. Worker moves through `en-route`, `arrived`, `started`, and `completed` using dedicated endpoints.
7. Start/end OTP and before/after proof are handled through backend contracts.
8. Worker earnings, rating, completed jobs, and tier update from completed work.

### Admin workflow: current

- Worker verification is partially connected.
- Most booking, analytics, complaint, notification, coupon, partner, and dashboard screens are static or partly mocked.
- Some UI calls endpoints that do not exist or use an incorrect path.

### Admin workflow: should be

1. View real pending/assigned/in-progress/completed bookings.
2. Verify workers and manage status/tier.
3. Manage one canonical service catalog and prices.
4. Auto-assign or manually assign workers.
5. Reassign failed/cancelled jobs.
6. Resolve complaints, refunds, disputes, and safety events.
7. Manage coupons, partners, notifications, metrics, and exports.
8. Close bookings only after payment and review/complaint policy checks.

### B2B workflow: current

- B2B pages show dashboards, locations, team, contracts, invoices, and bulk booking concepts.
- Most visible data is local/static.
- The bulk booking submit button currently has no real submission handler.
- Backend contract and invoice APIs exist, but client integration is incomplete.

### B2B workflow: should be

1. B2B account is created and approved by admin.
2. Organization owns locations and team members.
3. B2B selects a catalog service, locations, schedule/frequency, quantity, and SLA.
4. Backend creates a bulk request or a parent work order.
5. Admin reviews scope, price, availability, and assignment.
6. Parent request expands into child bookings by location/date/service where required.
7. B2B sees status and approvals; invoice is generated from completed child work.
8. Contract, renewal, complaint, and payment history remain organization-scoped.

## Booking workflow and state ownership

The canonical ordinary-service booking flow is:

```text
Customer/B2B creates
  -> pending
  -> assigned (system/admin)
  -> accepted or rejected (worker)
  -> en-route
  -> arrived
  -> started (after start OTP)
  -> completed (after end proof/OTP)
  -> paid
  -> closed (admin/system policy)
```

Cancellation is allowed through `arrived`. `rejected` returns to `pending`. `closed` and `cancelled` are terminal.

### State ownership

| Transition | Owner | API shape |
|---|---|---|
| Create | Customer/B2B | `POST /api/bookings` |
| Assign/reassign | Admin/system | `PATCH /api/bookings/:id/assign` |
| Accept/reject | Worker | dedicated endpoints |
| En-route/arrive/start/complete | Worker | dedicated endpoints |
| Start/end OTP verification | Worker; regeneration customer/admin | `/start-otp/*`, `/end-otp/*` |
| Pay | Customer/admin | `PATCH /api/bookings/:id/pay` |
| Cancel | Customer/worker/admin | `PATCH /api/bookings/:id/cancel` |
| Close | Admin | `PATCH /api/bookings/:id/close` |

### Current risks in booking

- Customer web booking does not call `POST /api/bookings`.
- Worker UI uses generic/incorrect status calls instead of dedicated endpoints.
- Generic booking field update is protected by authentication but needs strict ownership/role rules; otherwise sensitive fields could be changed by an authenticated user.
- Seed data includes a booking status `active`, which is not valid in the Booking schema.
- Payment is represented in the model, but no verified payment gateway settlement is proven.
- Live tracking is simulated in the UI rather than driven by persisted worker coordinates and Socket.IO updates.

## Events versus ordinary services

The word “event” currently means two unrelated things:

1. **Operational event logs:** internal append-only records for booking transitions, AI actions, reviews, complaints, and metrics. These belong to audit/observability.
2. **Customer event management:** birthdays, anniversaries, baby showers, weddings/griha pravesh, Diwali, catering, photography, DJ, decor, tent/furniture, cake, and cleanup. These are customer-facing projects composed of multiple services.

They must remain separate.

### Recommended event domain

An event should not be sent as one ordinary `Booking` with a fake service name. Use an event aggregate with:

- event ID and event type
- host/customer/B2B owner
- date, time, venue, guest count, budget, theme
- selected package or custom plan
- component services
- vendor/worker assignments per component
- deposit, quote, revisions, approval, cancellation, and balance
- event-level status and child booking statuses
- event coordinator/admin owner

Recommended event statuses:

`draft -> quote_requested -> quoted -> customer_approved -> partially_assigned -> confirmed -> in_setup -> live -> cleanup -> completed -> paid -> closed`

Each component can create a normal service booking while the event aggregate controls coordination.

### Event roles

Do not add a new role immediately. Start with:

- Customer/B2B host owns the event.
- Admin/event coordinator manages quote, vendor selection, changes, and exceptions.
- Worker/provider fulfills one or more event components.
- Finance/admin controls deposits, invoices, refunds, and final closure.

Add a dedicated vendor role only when providers need their own onboarding, catalog, availability, quotes, and payouts beyond the current worker model.

## What is genuinely usable now

### Reusable foundation

- Backend server bootstrap and route registration.
- JWT middleware and role enum.
- Booking state constants and dedicated lifecycle routes.
- Mongo models and service layer structure.
- Worker verification fields and public QR verification foundation.
- Reviews, wallet, coupons, complaints, contracts, invoices, notifications, partners, analytics, and exports as backend surfaces.
- Socket.IO rooms and event middleware.
- AI provider manager, Gemini integration, multimodal processing, trust matching, and customer AI endpoints.
- React route structure and presentation components.

### Partially usable

- Worker authentication/profile/jobs, subject to endpoint and mock-data cleanup.
- Admin worker verification.
- Service CRUD APIs.
- Customer AI chat and diagnosis.
- Reviews/wallet/coupon/notification UI, subject to client API audit.
- B2B backend contracts/invoices, without complete client flow.

### UI-only, demo, or concept until proven otherwise

- Customer login/register session establishment.
- Customer booking confirmation and live order state.
- Admin booking/analytics dashboards.
- B2B bulk booking submission.
- GPS live tracking and guaranteed emergency response.
- Event quote/vendor fulfillment.
- Subscription billing and benefits enforcement.
- UPI settlement and payment gateway verification.
- Government/NGO/training certification integrations.
- Home health score and warranty automation.
- Several premium/demo category flows.

## Simplified target product architecture

### One catalog, three workflow types

Instead of one custom implementation for every menu, classify every offering into one of three workflows:

1. **Instant/standard service**
   - One customer, one service, one worker/team, one booking.
   - Examples: electrician, cleaning, vehicle repair, garden work.

2. **Appointment/project service**
   - One customer, one provider/team, scheduled duration or multi-step work.
   - Examples: doctor visit, physiotherapy, interior consultation, shifting, vehicle transit.

3. **Event/enterprise order**
   - One owner, many locations or component services, quote/approval, child bookings, invoice.
   - Examples: birthday, wedding, society cleaning contract, office event, B2B recurring service.

All 110 services can be classified into these types without creating 110 different workflows.

### Simple end-to-end system

```text
Auth
  -> Catalog discovery
  -> Choose workflow type
  -> Create request
  -> Dispatch/quote
  -> Worker/provider execution
  -> Proof/OTP
  -> Payment/invoice
  -> Review/complaint
  -> Metrics and history
```

### Recommended implementation order

#### Phase 1: make ordinary service booking real

- Connect login/register to API and store JWT/role.
- Add client route guards.
- Choose 10-15 launch services from the backend catalog.
- Make frontend fetch the backend catalog.
- Connect `BookingFlow` to `POST /api/bookings`.
- Connect booking history and detail to `/api/bookings/my` and `/api/bookings/:id`.
- Fix worker lifecycle calls to dedicated endpoints.
- Remove demo tokens and fake booking IDs from the primary path.
- Add API contract tests for customer create, worker accept/progress, payment, cancellation, and access control.

#### Phase 2: operations and trust

- Connect admin bookings, assignment, complaints, notifications, and analytics.
- Enforce ownership on generic booking updates and payment/cancel routes.
- Persist timeline, notifications, worker location, before/after photos, and OTP flows.
- Replace simulated tracking with server events and a clear “location unavailable” state.
- Correct seed data and make seed idempotent.

#### Phase 3: catalog expansion

- Import approved services into the database with stable IDs.
- Add category, subtype, required skill, pricing mode, duration, availability, emergency flag, and service status.
- Hide planned services until worker coverage, price, validation, and fulfillment are ready.
- Keep translations attached to service IDs, not duplicated page content.

#### Phase 4: B2B

- Add organization/tenant ownership to B2B records.
- Connect locations, teams, contracts, bulk request, child bookings, invoice, and approval flows.
- Reuse ordinary booking execution for each child work order.

#### Phase 5: event management

- Add event aggregate, package components, quote/approval, coordinator, vendor assignment, deposit, revisions, cleanup, and final invoice.
- Reuse ordinary bookings for individual event components.
- Keep event dashboard separate from ordinary service booking history while linking child bookings.

#### Phase 6: optional advanced features

- Real payment provider.
- Subscription billing and entitlement checks.
- Emergency dispatch SLA.
- AI diagnosis/price recommendations with confidence and human fallback.
- Training certificates, NGO/government partnerships, and richer worker marketplace features.

## Recommended menu simplification

### Customer top-level menu

Keep five primary choices:

1. **Services**: standard and appointment services.
2. **Events**: event projects and packages.
3. **Emergency**: urgent standard services with priority dispatch.
4. **My Activity**: bookings, events, payments, reviews, complaints, warranty.
5. **Account**: profile, addresses, subscription, support, safety.

Put food, travel, pet, health, relocation, society, and seasonal offerings inside Services or Events based on workflow type. Do not make every concept a top-level menu.

### Worker top-level menu

1. Jobs
2. Schedule and availability
3. Active work and proofs
4. Earnings and payouts
5. Skills, verification, training, profile

### Admin top-level menu

1. Operations: bookings, dispatch, event orders, complaints, safety.
2. Marketplace: services, workers, partners, coupons.
3. Finance: payments, wallet, invoices, refunds.
4. Insights: analytics, demand, quality, AI health.
5. Settings and audit logs.

### B2B top-level menu

1. Overview
2. Locations and team
3. Requests and bookings
4. Contracts and SLAs
5. Invoices and payments

## Final diagnosis

The project should not be expanded with more pages yet. The correct next work is integration and domain normalization:

1. Make authentication real.
2. Make one ordinary booking path real from customer to worker to payment/review.
3. Make the backend catalog authoritative.
4. Connect admin operations to persisted data.
5. Then build B2B and event aggregates as separate workflow types.

Removing or rewriting every service page is unnecessary. The pages can become thin views over one catalog and three workflow engines. This keeps the large service count manageable and makes future changes predictable.

## Implementation progress

The first integration slice has now been implemented in the web client:

- Login calls `POST /api/auth/login`, stores the JWT/user session, checks the selected role, and opens the matching panel.
- Registration calls `POST /api/auth/register`, stores the returned session, and opens the matching panel.
- `DashboardLayout` redirects unauthenticated users to login and prevents a session from opening another role's panel.
- Customer booking confirmation calls `POST /api/bookings` with the authenticated token and navigates using the persisted booking database ID.
- Booking history calls `GET /api/bookings/my` and displays persisted backend bookings instead of hardcoded mock cards.
- Worker accept/reject, en-route, arrival, and OTP start/end actions now use the backend's dedicated lifecycle endpoints; the worker UI status vocabulary matches the booking state machine.
- Admin booking queue calls `GET /api/bookings`, uses populated customer/worker records, supports backend status vocabulary, and no longer depends on hardcoded booking rows.
- The booking UI deliberately does not mark a booking as paid during simulated UPI/card flows because the backend state machine does not allow `pending -> paid`; real payment integration remains a separate phase.
- Client production build passes after these changes.

The next integration slice should connect worker lifecycle actions and then the admin booking queue. Event management and the canonical service catalog should still remain separate workstreams after ordinary booking is stable.
