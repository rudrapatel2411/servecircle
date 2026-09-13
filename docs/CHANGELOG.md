# ServeCircle Change Log

This is the durable session handoff history. Add entries newest-first after meaningful changes.

## 2026-09-13 - Universal Service Booking, Instant Cash on Delivery & Demo Payment Simulator

- Changed: Made all 110 services across all 19 categories bookable end-to-end. Seeded full canonical catalog into MongoDB via `servicesCatalog.json`. Added category normalization supporting both URL slugs and display titles (e.g. `pet-services` to `Pet Services`). Implemented instant Cash on Delivery order placement in `BookingFlow.jsx` bypassing unnecessary modals. Implemented interactive demo payment simulator modals for UPI and Card with 1-click test authorization. Connected live map tracking demo simulation directly to created bookings and booking history. Updated all category hubs to pass canonical categories and service IDs. Fixed non-canonical status `active` to `started` in `seed.js`.
- Files: `server/constants/servicesCatalog.json`, `server/services/serviceService.js`, `server/middleware/validation.js`, `server/scripts/seed.js`, `client/src/pages/customer/BookingFlow.jsx`, `client/src/pages/customer/BookingHistory.jsx`, `client/src/pages/customer/LiveTracking.jsx`, `client/src/pages/customer/PetHub.jsx`, `client/src/pages/customer/TravelCommuteHub.jsx`, `client/src/pages/customer/FoodKitchenHub.jsx`, `client/src/pages/customer/RelocationHub.jsx`, `client/src/pages/customer/HealthWellnessHub.jsx`, `client/src/pages/customer/EventsHub.jsx`, `client/src/pages/customer/EmergencyHub.jsx`, `client/src/pages/customer/CustomerDashboard.jsx`, `client/src/pages/customer/BrowseServices.jsx`, `client/src/pages/customer/TravelPremiumFlow.jsx`, `client/src/pages/customer/SocietyPremiumFlow.jsx`, `client/src/pages/customer/PetPremiumFlow.jsx`, `client/src/pages/customer/HealthWellnessDemo.jsx`, `client/src/pages/customer/FoodPremiumFlow.jsx`, project docs.
- Validation: `npm run build` in `client` compiled in 3.69s with 0 errors; `node --check` passed for all modified server files; category normalization verified for all category slugs; test bookings confirmed.
- Remaining risk: Live map tracking is in simulated demo mode as requested by user; real-time GPS worker telemetry remains planned for Phase 7.

## 2026-09-11 - Groq Qwen 3.8 27B multimodal AI integration

- Changed: Integrated Groq Cloud API with Qwen 3.8 27B (multimodal vision + text) replacing the rigid Gemini/regex fallback pipeline. Added `GroqProvider.js` extending `BaseAIProvider`, registered it in `ProviderRegistry.js`, updated `.env` and `providers.js`, and modernized `server/routes/customerAi.js` `/chat` endpoint with full catalog-aware system prompt, eliminating false "out of scope" regex rejections and fake offline if-else fallbacks.
- Files: `server/ai/providers/GroqProvider.js`, `server/ai/providers/ProviderRegistry.js`, `server/ai/providers/AIProviderManager.js`, `server/config/providers.js`, `server/routes/customerAi.js`, `server/.env`, `server/package.json`, project docs.
- Validation: Live API probe verified Qwen 3.8 27B for casual chit-chat, Hinglish problem diagnosis (AC leakage & cooling), Gujarati plumbing requests, and base64 image vision inspection; `node --check` passed for all backend files; `Set-Location client; npm run build` passed with 0 errors.
- Remaining risk: Relies on Groq free-tier rate limits (1000 requests/day, 8000 tokens/min); production deployment may benefit from developer tier when scaling.

- Changed: Added optional public `serviceId` to the backend Service model, assigned stable IDs to the 9 initial services, and passed mapped launch IDs from ServiceDetail into BookingFlow.
- Files: `server/models/Service.js`, `server/services/serviceService.js`, `server/services/bookingService.js`, `server/middleware/validation.js`, `client/src/pages/customer/ServiceDetail.jsx`, `client/src/pages/customer/BookingFlow.jsx`, project docs.
- Validation: Backend `node --check` passed for changed files; `Set-Location client; npm run build` passed.
- Remaining risk: Only the initial launch set is mapped; the remaining frontend services are not yet canonical/API-driven.

## 2026-09-11 - Worker ID card image scanning

- Changed: Added uploaded ID-card image QR decoding with `qr-scanner`; decoded QR URLs are normalized to Worker IDs and verified through `POST /api/verify/worker`. Manual Worker ID entry and public verification remain available.
- Files: `client/src/components/WorkerVerifyModal.jsx`, `client/package.json`, `client/package-lock.json`, `docs/PROJECT_STATE.md`, `docs/IMPLEMENTATION_STATUS_REPORT.md`.
- Validation: `Set-Location client; npm run build` passed with the QR scanner worker bundle included.
- Remaining risk: Demo depends on a clear, readable QR image and existing worker records; production device-camera UX, identity policy, and package audit still need hardening.

## 2026-09-11 - Implementation status report created

- Changed: Added a feature-by-feature truth report separating complete slices, partial integrations, demo/UI-only systems, planned domains, and unknown behavior.
- Files: `docs/IMPLEMENTATION_STATUS_REPORT.md`, `docs/AI_START_HERE.md`, `docs/PROJECT_STATE.md`.
- Validation: Report sections and status categories validated against current state and workflow audit.
- Remaining risk: Status is source-audited, not a substitute for full production deployment, payment, security, or external-provider verification.

## 2026-09-11 - Documentation context system created

- Changed: Added `AI_START_HERE.md`, `PROJECT_STATE.md`, `IMPLEMENTATION_ROADMAP.md`, and `AI_WORK_PROTOCOL.md` so a new AI can resume from docs without a full repository rescan.
- Files: `docs/AI_START_HERE.md`, `docs/PROJECT_STATE.md`, `docs/IMPLEMENTATION_ROADMAP.md`, `docs/AI_WORK_PROTOCOL.md`, `docs/CHANGELOG.md`.
- Validation: Documentation files created and their required project facts were derived from existing audits and current source.
- Remaining risk: Future sessions must follow the update protocol or the state may become stale.

## 2026-09-11 - Auth, booking, worker, and admin integration slices

- Changed: Web login/register now call the backend and store sessions; dashboard role guards were added; customer booking creation and history use persisted backend data; worker lifecycle and OTP calls match dedicated backend endpoints; admin booking queue reads persisted bookings.
- Files: `client/src/utils/authSession.js`, `client/src/pages/auth/LoginPage.jsx`, `client/src/pages/auth/RegisterPage.jsx`, `client/src/components/DashboardLayout.jsx`, `client/src/pages/customer/BookingFlow.jsx`, `client/src/pages/customer/BookingHistory.jsx`, `client/src/pages/worker/workerApi.js`, `client/src/pages/worker/WorkerJobs.jsx`, `client/src/pages/admin/AdminBookings.jsx`.
- Validation: `Set-Location client; npm run build` passed.
- Remaining risk: Canonical service catalog, payment settlement, live tracking, B2B submission, and event management remain incomplete.

## 2026-09-11 - Flutter removal

- Changed: Removed the standalone Flutter `mobile/` project and removed stale Flutter architecture/tunnel references.
- Files: entire `mobile/` tree, `server/tunnel.js`, `docs/PROJECT_CONTEXT_REPORT.md`.
- Validation: `mobile/` absence and stale Flutter reference scan passed; web build passed.
- Remaining risk: A future mobile client would need a new separately scoped application.

## 2026-09-11 - Runtime organization

- Changed: Moved product docs to `docs/`; moved maintenance scripts to `tools/content/` and `tools/assets/legacy/`; quarantined four statically unused customer pages under `client/src/pages/_archive/`.
- Validation: 61 moved JavaScript files passed `node --check`; web build passed.
- Remaining risk: Some legacy asset/tool scripts still contain hard-coded paths and should not be executed until normalized.

## 2026-09-11 - Initial project audit

- Changed: Created repository architecture and product context report plus role/workflow/service audit.
- Files: `docs/PROJECT_CONTEXT_REPORT.md`, `docs/ROLE_WORKFLOW_SERVICE_AUDIT.md`.
- Validation: Reports validated for required sections and current source inventory.
- Remaining risk: Original audit identified broad mock/demo coverage and split service taxonomy.
