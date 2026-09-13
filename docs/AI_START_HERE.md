# ServeCircle AI Start Here

## Read this first

You are working on the ServeCircle repository. Before changing code, read these files in this order:

1. `docs/AI_START_HERE.md` - this entrypoint and reading order.
2. `docs/PROJECT_STATE.md` - current verified system state and active work.
3. `docs/ROLE_WORKFLOW_SERVICE_AUDIT.md` - roles, services, workflows, gaps, and target architecture.
4. `docs/PROJECT_CONTEXT_REPORT.md` - repository structure, APIs, models, AI, configuration, and operational details.
5. `docs/IMPLEMENTATION_ROADMAP.md` - prioritized next work and acceptance criteria.
6. `docs/IMPLEMENTATION_STATUS_REPORT.md` - complete, partial, demo, planned, and unknown feature truth table.
7. `docs/CHANGELOG.md` - what previous AI sessions changed.
8. `docs/AI_WORK_PROTOCOL.md` - rules for safe changes and documentation updates.

Only read product references when needed:

- `docs/ServeCircle_BusinessPlan.pdf` and `.html`: original business vision, not proof of implementation.
- `docs/ServeCircle_NewFeatures.md`: feature notes and concepts, not proof of production integration.

## Project identity

ServeCircle is currently a React/Vite web application plus an Express/Mongoose/Socket.IO backend. The former Flutter `mobile/` project was intentionally removed. The repository has customer, worker, admin, and B2B role surfaces, but the product is still being normalized from a broad UI/demo system into a smaller set of real workflows.

## Current truth in one minute

- Real backend foundation: JWT auth APIs, role middleware, Mongo models, booking state machine, dedicated worker lifecycle endpoints, OTP services, Socket.IO rooms, service APIs, AI layers, and many operational APIs.
- Newly connected web flows: login, registration, role dashboard protection, customer booking creation, customer booking history, worker lifecycle/OTP endpoint alignment, and admin booking queue.
- Main unresolved architecture problem: frontend has 110 service records in 19 categories while backend initial seed has 9 services. The backend catalog must become canonical.
- Event management is not ordinary service booking. It needs a separate event aggregate with child service bookings.
- Many pages remain static/demo: payment settlement, live tracking, subscriptions, B2B submission, event fulfillment, several analytics/operations pages, and premium flows.

## Active implementation order

1. Stabilize ordinary booking end to end.
2. Make the database service catalog authoritative.
3. Connect admin dispatch, complaints, notifications, and operations.
4. Build B2B parent requests and child bookings.
5. Build event management as a separate aggregate and workflow.
6. Add optional payment, subscriptions, emergency SLA, and advanced AI integrations.

## Before you edit

State one local hypothesis about the code path, identify one focused validation command, and make the smallest change that tests the hypothesis. Never delete or rewrite broad feature areas just because they look speculative; classify them first.

## After you edit

Run the narrowest validation available, then update:

- `docs/PROJECT_STATE.md` if current truth or active priorities changed.
- `docs/CHANGELOG.md` with files, behavior, and validation.
- `docs/IMPLEMENTATION_ROADMAP.md` when a milestone changes.
- The relevant audit/context report when architecture or contracts change.

A future AI should be able to continue from the docs without rescanning the whole repository.
