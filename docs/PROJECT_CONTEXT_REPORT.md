# ServeCircle Project Context Report

Start here for future AI sessions: `docs/AI_START_HERE.md`. Current state and next priorities are maintained in `docs/PROJECT_STATE.md` and `docs/IMPLEMENTATION_ROADMAP.md`.

## Purpose of this file

This is an engineering context document for future work on the repository. It records the product intent found in `docs/ServeCircle_BusinessPlan.pdf` and the implementation surface found in source code. It is not a marketing document and should be updated when architecture, routes, or major features change.

Audit basis: repository structure, package manifests, application entry points, route registration, model files, configuration names, tests, and the business-plan PDF currently present in the repository.

## Product identity

ServeCircle is intended to be an India-focused service marketplace and employment ecosystem:

- Customers discover and book home, vehicle, cleaning, event, furniture, garden, emergency, food, travel, pet, health, society, and relocation services.
- Workers register, receive jobs, build ratings and portfolios, complete training, and earn through the platform.
- Admins manage workers, bookings, complaints, coupons, partners, analytics, and notifications.
- B2B customers manage recurring service contracts, locations, teams, bookings, and invoices.
- AI features cover customer chat, photo/video problem diagnosis, price and ETA intelligence, worker trust matching, recommendations, fraud, demand, and cancellation analysis.
- The active platform consists of a React web client against the Express API. The former Flutter client has been removed from this repository.

The PDF describes eight original service menus, employment, subscriptions, emergency response, social impact, and a multi-stream revenue model. The code has expanded beyond the PDF into additional product hubs and enterprise/AI surfaces.

## System shape

```text
Root orchestration
  |-- Express + Socket.IO + MongoDB backend  (server/)
  |-- React 19 + Vite web client             (client/)
  |-- product/business documentation         (docs/)
  `-- one-off migration/translation/image scripts (*.js, *.cjs)
```

### Runtime flow

1. `server/server.js` loads environment variables, creates Express and Socket.IO, connects to MongoDB, initializes the AI provider manager, mounts route modules, and listens on `PORT` (default 5000).
2. The web client starts from `client/src/main.jsx`, renders `App.jsx`, and uses React Router for public, customer, worker, admin, and B2B route trees.
3. The backend emits real-time events through Socket.IO rooms for admins, workers, and customers. The web client also contains `client/src/socket.js`.
4. MongoDB is the main persistence layer. The server attempts Atlas first when configured, then falls back to a local MongoDB URI; it can continue in demo fallback mode if both fail.

## Repository inventory

Generated/dependency directories are intentionally excluded from the source inventory below: root `node_modules`, `client/node_modules`, and `server/node_modules`.

### Current physical organization

The first safe organization pass is complete:

- `client/` and `server/` remain at the repository root because package manifests, deployment files, and many relative imports depend on those roots.
- The former standalone Flutter project was removed after its 173 tracked files were confirmed to have no active web/server runtime dependency.
- Product and engineering documents now live in `docs/`.
- Maintenance scripts now live under `tools/content/` and `tools/assets/legacy/`; the remaining path-sensitive scripts are grouped there and clearly separated from runtime source.
- Runtime source trees and public assets have not been moved.

This is intentional staging, not an unfinished rename. Application-root renaming should happen only as a coordinated migration with build, server startup, and deployment validation.

### Root files and documentation

- `package.json`, `package-lock.json`: root scripts and shared dependencies.
- `docs/ServeCircle_BusinessPlan.pdf`: 18-page product and business plan; source of product intent.
- `docs/ServeCircle_BusinessPlan.html`: HTML version of the business plan.
- `docs/ServeCircle_NewFeatures.md`: notes on UPI checkout, coupons, GPS address formatting, express booking, and worker training concepts.
- `docs/PROJECT_CONTEXT_REPORT.md`: this engineering context report.
- `tools/content/autoTranslate.js`, `tools/content/extractTranslations.js`, `tools/content/perfectTranslate.js`: extracted translation utilities. Their client paths are resolved from the repository root, so they no longer depend on the current working directory.
- `tools/content/repair/`: CSS and JSX repair scripts (`add-css-temp`, `add-link-import`, `append-css`, `fix-*`, `revert-cards`).
- `tools/content/translation/`: translation injection and premium-flow scripts (`add-translations`, `translate*`, `update-premium-flow`) plus the client i18n injector scripts formerly under `client/src/i18n`.
- `tools/assets/legacy/`: image copy/crop/check, color replacement, image generation, scraper, and card-update utilities formerly mixed into `client/` and `client/src/`. These are syntax-valid but some still require path normalization before manual reuse.
- `client/src/pages/_archive/`: four statically unused legacy customer pages quarantined from the runtime page tree: `CleaningServicesComingSoon`, `RepairServicesComingSoon`, `ServeCircleChat`, and `SOSAlertSystem`.

### Root commands

- `npm run install:all`: installs root, server, and client dependencies.
- `npm run dev`: runs server, client, and tunnel concurrently.
- `npm run dev:server`: runs the backend in watch mode.
- `npm run dev:client`: runs Vite.
- `npm run dev:tunnel`: runs `server/tunnel.js`.

### Client source: `client/`

- `index.html`, `vite.config.js`, `package.json`: Vite application shell and build configuration.
- `src/main.jsx`: React entry point.
- `src/App.jsx`: complete web route registry.
- `src/index.css`: global styles.
- `src/socket.js`: Socket.IO client integration.
- `src/data/generalServicesData.jsx`: general service catalog data.
- `src/data/servicesRegistry.js`: service/category registry.
- `src/i18n/index.js`, `en.js`, `hi.js`, `gu.js`: i18next setup and English/Hindi/Gujarati translations.
- `src/i18n/services_en.json`, `services_hi.json`, `services_gu.json`: localized service data.
- `src/utils/imageHelpers.js`, `customAlert.js`: shared web utilities.
- `src/components/`: `Navbar`, `Sidebar`, dashboard layout/navbar, service image, language toggle, global service search, worker verification/ID/call widgets, and callback widget.
- `src/pages/auth/`: `LoginPage`, `RegisterPage`, `WorkerRegister`, and auth styles.
- `src/pages/customer/`: customer dashboard, service browsing/detail/booking/history, wallet, subscriptions, reviews, AI diagnosis/chat, HomeFixr warranty, video consultation, group booking, live tracking, trust/safety, worker verification, five original service hubs, general-service hubs, events/emergency, and additional food, travel, pet, health, society, relocation, packers, and premium/demo flows.
- `src/pages/worker/`: dashboard, jobs, schedule, earnings, training, profile, Become-a-Pro, auth prompt, worker API, helpers, auth hook, and styles.
- `src/pages/admin/`: dashboard, bookings, worker verification, analytics, coupons, complaints, partners, notifications, and styles.
- `src/pages/b2b/`: dashboard, booking, contracts, locations, team, invoices, dashboard data, and styles.

#### Web route groups

- Public: `/`, `/about/:id`, `/login`, `/register`, `/worker-register`.
- Redirect aliases: `/ai-chat`, `/chat`, `/ai-diagnosis`.
- Customer: `/customer/*`, including services, events, emergency, bookings, wallet, subscriptions, AI, live tracking, verification, demos, and premium flows.
- Worker: `/worker/*` for jobs, schedule, earnings, training, profile, and pro progression.
- Admin: `/admin/*` for operations and moderation.
- B2B: `/b2b/*` for enterprise operations.
- Public worker verification: `/verify-worker` and `/verify/worker/:workerIdCode`.

### Server source: `server/`

- `server.js`: HTTP server bootstrap, CORS/JSON middleware, event middleware, Socket.IO, MongoDB connection, AI initialization, health endpoint, route mounting, 404 handling, and error handling.
- `tunnel.js`: tunnel/dev connectivity helper.
- `Dockerfile`, `render.yaml`: deployment configuration.
- `.env`: local environment variable names; values are intentionally not documented here.
- `config/aiConfig.js`: model names, versions, confidence levels, limits, validation ranges, inference settings.
- `config/providers.js`: enabled AI provider table. Gemini is enabled; OpenAI, Claude, and Ollama are configured as disabled placeholders.
- `constants/bookingStates.js`: booking state machine and legal transitions.
- `constants/otpConfig.js`: OTP configuration.
- `middleware/auth.js`: JWT protection, role authorization, optional authentication.
- `middleware/asyncHandler.js`: async route wrapper.
- `middleware/errorHandler.js`: application error types and global error handling.
- `middleware/eventMiddleware.js`: event/logging middleware.
- `middleware/validation.js`: request validation helpers.
- `utils/transitionValidator.js`: transition validation support.

#### Mounted API modules

The backend currently has 21 route files and approximately 136 route declarations. Mounts are:

| Prefix | Module | Declared routes |
|---|---|---:|
| `/` | `verification.js` | 8 |
| `/api/auth` | `auth.js` | 3 |
| `/api/users` | `users.js` | 10 |
| `/api/services` | `services.js` | 8 |
| `/api/bookings` | `bookings.js` | 20 |
| `/api/reviews` | `reviews.js` | 6 |
| `/api/wallet` | `wallet.js` | 4 |
| `/api/coupons` | `coupons.js` | 5 |
| `/api/complaints` | `complaints.js` | 4 |
| `/api/contracts` | `contracts.js` | 5 |
| `/api/invoices` | `invoices.js` | 4 |
| `/api/notifications` | `notifications.js` | 5 |
| `/api/partners` | `partners.js` | 5 |
| `/api/analytics` | `analytics.js` | 1 |
| `/api/admin/export` | `export.js` | 2 |
| `/api/internal/ai` | `internalAi.js` | 16 |
| `/api/internal/ai` | `internalAiMultimodal.js` | 10 |
| `/api/internal/ai/trustmatch` | `internalAiTrustMatch.js` | 6 |
| `/api/internal/ai` | `internalAiIntelligence.js` | 8 |
| `/api/ai` | `aiProvider.js` | 6 |
| `/api/customer/ai` | `customerAi.js` | 1 |

`GET /api/health` is defined directly in `server.js`. Unknown `/api/*` routes return JSON 404 responses.

#### Backend services

- `assignmentService.js`: worker/job assignment.
- `bookingService.js`: booking operations and lifecycle support.
- `eventService.js`: event-driven operations.
- `exportService.js`: export preparation.
- `featureService.js`: feature extraction/storage support.
- `historyService.js`: historical records.
- `metricsService.js`: operational/customer/worker metrics.
- `notificationService.js`: notification creation and delivery support.
- `otpService.js`: OTP operations.
- `serviceService.js`: service catalog operations.

#### MongoDB models

`ActivityLog`, `AIAnalysis`, `Booking`, `Complaint`, `ComplaintMetrics`, `Contract`, `Coupon`, `CustomerBehaviour`, `CustomerMetrics`, `DemandHistory`, `DocumentHistory`, `EventLog`, `FeatureStore`, `Invoice`, `Notification`, `Partner`, `Review`, `Service`, `TrustProfile`, `User`, `WalletTransaction`, `WorkerGeoHistory`, `WorkerMetrics`, and `WorkerSkillHistory` are defined under `server/models/`.

#### AI subsystem

- Core: `confidenceEngine`, `costCalculator`, `explainabilityService`, `featureExtractor`, `inferenceService`, `modelManager`, `modelRegistry`, `predictionEngine`, `retryEngine`, `smartCache`.
- Providers: `AIProviderManager`, `BaseAIProvider`, `GeminiProvider`, `PromptBuilder`, `ProviderHealth`, `ProviderRegistry`, `ResponseParser`.
- Prediction models: `BasePredictionModel`, `ArrivalPredictionModel`, `CancellationPredictionModel`, `DemandForecastModel`, `FairPriceModel`, `FraudDetectionModel`, `ProblemClassificationModel`, `TrustMatchModel`, `WorkerRecommendationModel`.
- Intelligence: `cancellationEngine`, `demandEngine`, `etaEngine`, `fairPriceEngine`, `fraudEngine`, `intelligenceManager`.
- Multimodal: `contextBuilder`, `imageProcessor`, `imageQualityAnalyzer`, `multimodalManager`, `problemAnalyzer`, `recommendationPipeline`, `serviceResolver`, `textProcessor`, `urgencyAnalyzer`, `voiceProcessor`.
- Trust matching: `customerPreferenceEngine`, `recommendationEngine`, `trustEngine`, `trustMatchManager`, `workerFilterEngine`, `workerRankingEngine`, `workerScoringEngine`.
- AI operational services: `aiHealthService`, `aiUsageService`.

#### Server scripts, backups, and tests

- `scripts/seed.js`: seed data command (`npm run seed`).
- `backup/`: migration scripts, inspection/smoke scripts, migration audit output, and local Mongo index backups. Treat this as operational history/data tooling, not runtime application code.
- `__cust.json`, `__work.json`, `_r_register.json`: local/working data artifacts.
- Tests cover provider response parsing, customer AI intent, problem analysis, Phase 4A multimodal vision, and Phase 4B enterprise platform behavior.

### Mobile client status

The former Flutter client under `mobile/` has been completely removed. It contained 173 tracked files and had no active imports from the web client, server, or root runtime scripts. Mobile-specific reconstruction, if needed later, should start as a new separately scoped application rather than reintroducing the removed generated/platform tree.

## Key contracts and behavior

### Authentication

The server uses JWT bearer tokens. `protect` loads the user from MongoDB and removes the password from the request user. `authorize` enforces role names. Web auth behavior is implemented in page/layout components and should be checked alongside backend middleware when changing access rules.

### Booking state machine

Canonical flow:

`pending -> assigned -> accepted -> en-route -> arrived -> started -> completed -> paid -> closed`

`rejected` returns to `pending`; cancellation is allowed through `arrived`; `closed` and `cancelled` are terminal. Any booking UI or API change must preserve `server/constants/bookingStates.js` as the source of truth.

### Realtime rooms

- `admin_room`
- `worker_<workerId>`
- `customer_<customerId>`

### Configuration names

The server `.env` declares `PORT`, `MONGO_URI`, `MONGODB_ATLAS_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, `AI_PROVIDER`, `GEMINI_TEXT_MODEL`, `GEMINI_VISION_MODEL`, and `GEMINI_EMBEDDING_MODEL`. Never copy secret values into documentation or source.

## Product-to-code coverage

Strongly represented in code: customer booking, worker operations, admin operations, B2B operations, service catalog, reviews, wallet, coupons, complaints, contracts, invoices, notifications, verification, Socket.IO, AI chat, multimodal AI scaffolding, and trust matching.

Represented mainly as UI/concept or requires verification before being called production-complete: subscription billing, actual UPI settlement, live GPS provider integration, guaranteed 30-minute emergency fulfillment, government/NGO integrations, training certification issuance, HomeFixr health scoring, and several premium/demo flows. The PDF is a product plan; its claims must not be treated as proof that the corresponding external integrations are live.

## Working rules for future changes

1. Start from the owning surface: web route/component, server route/service/model, or AI provider layer.
2. Keep booking status changes aligned with `bookingStates.js`.
3. Preserve role checks in both API and client navigation.
4. Add or update a focused server test when changing shared API, booking, auth, or AI behavior.
5. Treat `server/backup/`, generated build directories, node modules, tunnel URLs, and local data artifacts as environment/operational context rather than portable application logic.
6. After changes, validate the narrowest useful command first: server tests for backend behavior and `npm run build` in `client/` for web changes.

## Current audit limitations

This report is a source inventory and architecture map. It does not claim that every route has been manually executed, that external providers are configured, or that the entire repository currently builds cleanly. The next useful audit step for a specific feature is an endpoint-by-endpoint contract check against its client callers and tests.