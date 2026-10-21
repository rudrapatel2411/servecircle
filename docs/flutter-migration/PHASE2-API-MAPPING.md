# PHASE 2: REST API CONTRACT & FLUTTER REPOSITORY MAPPING
## Exhaustive Endpoint Inventory & Dart Model Specification

**Document Version:** 2.0.0  
**Phase:** 2 — Planning Only  
**Base URL:** `http://localhost:5000/api` (Configurable via `AppConfig.apiBaseUrl`)  
**Network Engine:** `Dio` with `AuthInterceptor`, `LoggingInterceptor`, and `RetryInterceptor`  

---

## 1. NETWORK CLIENT CONFIGURATION

The Flutter API client is encapsulated in `DioClient` with the following production constraints:

```dart
// Conceptual configuration blueprint
BaseOptions(
  baseUrl: AppConfig.apiBaseUrl,
  connectTimeout: const Duration(seconds: 10),
  receiveTimeout: const Duration(seconds: 15),
  sendTimeout: const Duration(seconds: 15),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
);
```

### 1.1 Interceptor Architecture
1. **`AuthInterceptor`:**
   - Automatically reads the active JWT from `SecureStorageService` and injects `Authorization: Bearer <token>`.
   - Intercepts HTTP 401 Unauthorized responses: purges the active session, broadcasts a `session_expired` event via Riverpod, and triggers redirection to `/login?expired=true`.
2. **`LoggingInterceptor`:**
   - Pretty-prints request URLs, headers, payloads, response times, and status codes in debug mode; silenced in production.
3. **`RetryInterceptor`:**
   - Automatically retries idempotent GET requests up to 3 times with exponential backoff (500ms, 1000ms, 2000ms) upon network socket dropouts. Never retries non-idempotent POST/PUT mutations automatically (delegated to the offline Sync Engine).

---

## 2. EXHAUSTIVE API MAPPING TABLE (ALL 20 MODULES)

| API Path | Method | Flutter Repository | Request Model (Dart) | Response Model (Dart) | Used By Screen / Controller | Auth Level | Offline Strategy |
|---|---|---|---|---|---|---|---|
| **1. AUTHENTICATION** | | | | | | | |
| `/api/auth/register` | POST | `AuthRepository` | `RegisterRequest` | `AuthResponse` | `RegisterScreen`, `WorkerRegisterScreen` | Public | Network-only (Fails with offline notice) |
| `/api/auth/login` | POST | `AuthRepository` | `LoginRequest` | `AuthResponse` | `LoginScreen` | Public | Network-only (Fallback to demo login) |
| `/api/auth/me` | GET | `AuthRepository` | None | `UserModel` | `AuthController` (Session restoration) | Bearer | Cache-first (Read from Hive `user_box`) |
| `/api/auth/profile` | PUT | `AuthRepository` | `UpdateProfileRequest` | `UserModel` | `CustomerProfileScreen`, `WorkerProfileScreen` | Bearer | Optimistic cache update + SyncQueue |
| `/api/auth/demo/worker` | GET | `AuthRepository` | None | `AuthResponse` | `LoginScreen` (Quick Demo Worker) | Public | Local Fixture Fallback if offline |
| `/api/auth/demo/customer` | GET | `AuthRepository` | None | `AuthResponse` | `LoginScreen` (Quick Demo Customer) | Public | Local Fixture Fallback if offline |
| `/api/auth/demo/admin` | GET | `AuthRepository` | None | `AuthResponse` | `LoginScreen` (Quick Demo Admin) | Public | Local Fixture Fallback if offline |
| `/api/auth/demo/b2b` | GET | `AuthRepository` | None | `AuthResponse` | `LoginScreen` (Quick Demo B2B) | Public | Local Fixture Fallback if offline |
| `/api/auth/change-password` | POST | `AuthRepository` | `ChangePasswordRequest`| `ApiResponse` | `CustomerSettingsScreen` | Bearer | Network-only |
| `/api/auth/subscription` | PUT | `AuthRepository` | `UpdateSubscriptionReq` | `SubscriptionResponse` | `CustomerSubscriptionsScreen` | Bearer | Network-only |
| **2. BOOKINGS** | | | | | | | |
| `/api/bookings` | POST | `CustomerRepository` | `CreateBookingRequest` | `BookingModel` | `BookingFlowScreen` | Bearer (Cust) | Network-only with demo fallback |
| `/api/bookings/my` | GET | `CustomerRepository` | None | `List<BookingModel>` | `CustomerDashboard`, `HistoryScreen` | Bearer (Cust) | Cache-first with network background sync |
| `/api/bookings` | GET | `WorkerRepository` | `JobFilterQuery` | `List<BookingModel>` | `WorkerDashboard`, `WorkerJobsScreen` | Bearer (Worker) | Cache-first with network background sync |
| `/api/bookings/:id` | GET | `CustomerRepository` | None | `BookingModel` | `LiveTrackingScreen`, `BookingDetail` | Bearer | Cache-first with Socket live merge |
| `/api/bookings/:id/accept` | PUT | `WorkerRepository` | None | `BookingModel` | `WorkerJobsScreen` (Accept CTA) | Bearer (Worker) | Optimistic update + SyncQueue |
| `/api/bookings/:id/reject` | PUT | `WorkerRepository` | `RejectJobRequest` | `BookingModel` | `WorkerJobsScreen` (Reject CTA) | Bearer (Worker) | Optimistic removal + SyncQueue |
| `/api/bookings/:id/start` | POST | `WorkerRepository` | `StartJobRequest (OTP)`| `BookingModel` | `WorkerJobDetailScreen` (Start job) | Bearer (Worker) | Network-only (Validates live / demo OTP) |
| `/api/bookings/:id/photos` | POST | `WorkerRepository` | `FormData (Multipart)` | `BookingModel` | `WorkerJobDetailScreen` (Before/After) | Bearer (Worker) | Staged offline upload queue |
| `/api/bookings/:id/complete`| POST | `WorkerRepository` | None | `BookingModel` | `WorkerJobDetailScreen` (Complete) | Bearer (Worker) | Optimistic update + SyncQueue |
| `/api/bookings/:id/cancel` | PUT | `CustomerRepository` | `CancelBookingRequest` | `BookingModel` | `BookingDetailScreen` | Bearer (Cust) | Optimistic update + SyncQueue |
| `/api/bookings/all` | GET | `AdminRepository` | `AdminFilterQuery` | `List<BookingModel>` | `AdminBookingsScreen` | Bearer (Admin) | Cache-first (Hive `admin_bookings`) |
| `/api/bookings/:id/assign` | POST | `AdminRepository` | `AssignWorkerRequest` | `BookingModel` | `AdminBookingsScreen` (Assign modal) | Bearer (Admin) | Network-only |
| **3. SERVICES & HUBS** | | | | | | | |
| `/api/services` | GET | `CustomerRepository` | None | `List<ServiceModel>` | `BrowseServicesScreen`, `GlobalSearch` | Public | Persistent Cache (24-hour TTL in Hive) |
| `/api/services/category/:cat`| GET | `CustomerRepository`| None | `List<ServiceModel>` | `ServiceHubScreen` (14 Categories) | Public | Persistent Cache + Fixture Fallback |
| `/api/services/:id` | GET | `CustomerRepository` | None | `ServiceModel` | `ServiceDetailScreen` | Public | Cache-first |
| `/api/services/search` | GET | `CustomerRepository` | `SearchQuery` | `List<ServiceModel>` | `GlobalSearchScreen` | Public | Offline client-side fuzzy filter fallback |
| **4. WALLET & PAYMENTS** | | | | | | | |
| `/api/wallet` | GET | `WalletRepository` | None | `WalletAccountModel` | `CustomerWalletScreen`, `WorkerEarnings`| Bearer | Cache-first with Live/Demo badge |
| `/api/wallet/topup` | POST | `WalletRepository` | `TopupRequest` | `WalletAccountModel` | `CustomerWalletScreen` (Topup sheet) | Bearer | Network-only (Simulation in Demo mode) |
| `/api/wallet/pay` | POST | `WalletRepository` | `PaymentRequest` | `PaymentReceiptModel`| `PaymentModalScreen` (Checkout) | Bearer | Network-only (Simulated UPI / Wallet) |
| `/api/wallet/withdraw` | POST | `WorkerRepository` | `WithdrawRequest` | `WalletAccountModel` | `WorkerEarningsScreen` (Payout CTA) | Bearer (Worker) | Network-only |
| **5. REVIEWS & RATINGS** | | | | | | | |
| `/api/reviews` | POST | `CustomerRepository` | `CreateReviewRequest` | `ReviewModel` | `PostServiceReviewScreen` | Bearer (Cust) | Optimistic update + SyncQueue |
| `/api/reviews` | GET | `CustomerRepository` | None | `List<ReviewModel>` | `CustomerReviewsScreen` | Bearer (Cust) | Cache-first |
| `/api/reviews/worker/:id` | GET | `CustomerRepository` | None | `List<ReviewModel>` | `WorkerVerificationScreen` | Public | Cache-first |
| **6. COMPLAINTS & TICKETS**| | | | | | | |
| `/api/complaints` | POST | `CustomerRepository` | `CreateComplaintReq` | `ComplaintModel` | `CustomerSettings`, `B2BSupport` | Bearer | Optimistic cache update + SyncQueue |
| `/api/complaints` | GET | `AdminRepository` | None | `List<ComplaintModel>`| `AdminComplaintsScreen` | Bearer (Admin) | Cache-first |
| `/api/complaints/:id/resolve`| PUT | `AdminRepository` | `ResolveComplaintReq` | `ComplaintModel` | `AdminComplaintsScreen` (Resolve) | Bearer (Admin) | Network-only |
| **7. NOTIFICATIONS** | | | | | | | |
| `/api/notifications` | GET | `NotificationRepository`| None | `List<NotificationModel>`| Top Header Notifications Sheet | Bearer | Cache-first with Socket merge |
| `/api/notifications/:id/read`| PUT | `NotificationRepository`| None | `NotificationModel` | Top Header Notifications Sheet | Bearer | Optimistic unread count -1 + SyncQueue |
| `/api/notifications` | POST | `AdminRepository` | `SendNotificationReq` | `NotificationModel` | `AdminNotificationsScreen` (Broadcast) | Bearer (Admin) | Network-only |
| **8. COUPONS** | | | | | | | |
| `/api/coupons` | GET | `CustomerRepository` | None | `List<CouponModel>` | `BookingFlowScreen` (Coupons list) | Bearer (Cust) | Persistent Cache |
| `/api/coupons/validate` | POST | `CustomerRepository` | `ValidateCouponReq` | `CouponValidationResult`| `BookingFlowScreen` (Apply coupon) | Bearer (Cust) | Offline local validation fallback |
| `/api/coupons` | POST | `AdminRepository` | `CreateCouponRequest` | `CouponModel` | `AdminCouponsScreen` (Create promo) | Bearer (Admin) | Network-only |
| `/api/coupons/:id` | DELETE | `AdminRepository` | None | `ApiResponse` | `AdminCouponsScreen` (Delete promo) | Bearer (Admin) | Network-only |
| **9. ANALYTICS & DASHBOARD**| | | | | | | |
| `/api/analytics/dashboard`| GET | `AdminRepository` | None | `AdminDashboardStats` | `AdminDashboardScreen` | Bearer (Admin) | Cache-first (Hive `admin_analytics`) |
| `/api/analytics/revenue` | GET | `AdminRepository` | `DateRangeQuery` | `RevenueChartData` | `AdminAnalyticsScreen` | Bearer (Admin) | Cache-first |
| **10. B2B CONTRACTS** | | | | | | | |
| `/api/contracts` | GET | `B2BRepository` | None | `List<ContractModel>` | `B2BDashboard`, `B2BContractsScreen` | Bearer (B2B/Adm)| Cache-first |
| `/api/contracts` | POST | `B2BRepository` | `CreateContractReq` | `ContractModel` | `B2BContractsScreen` (New contract) | Bearer (B2B/Adm)| Network-only |
| `/api/contracts/:id` | GET | `B2BRepository` | None | `ContractModel` | `B2BContractDetailScreen` | Bearer (B2B/Adm)| Cache-first |
| **11. B2B INVOICES** | | | | | | | |
| `/api/invoices` | GET | `B2BRepository` | None | `List<InvoiceModel>` | `B2BInvoicesScreen` | Bearer (B2B/Adm)| Cache-first |
| `/api/invoices/:id` | GET | `B2BRepository` | None | `InvoiceModel` | `B2BInvoicesScreen` (Detail/PDF) | Bearer (B2B/Adm)| Cache-first |
| `/api/invoices/:id` | PUT | `B2BRepository` | `UpdateInvoiceRequest`| `InvoiceModel` | `B2BInvoicesScreen` (Mark paid) | Bearer (B2B/Adm)| Network-only |
| **12. ADMIN PARTNERS** | | | | | | | |
| `/api/partners` | GET | `AdminRepository` | None | `List<PartnerModel>` | `AdminPartnersScreen` | Bearer (Admin) | Cache-first |
| `/api/partners` | POST | `AdminRepository` | `CreatePartnerReq` | `PartnerModel` | `AdminPartnersScreen` (Onboard) | Bearer (Admin) | Network-only |
| **13. WORKER VERIFICATION & QR** | | | | | | | |
| `/api/verify/:workerId` | GET | `CustomerRepository` | None | `WorkerPublicVerifyDTO`| `WorkerVerificationScreen` (QR Scan) | Public | Cached QR lookup + Demo fallback |
| `/api/verify/worker` | POST | `CustomerRepository` | `VerifyWorkerRequest` | `WorkerPublicVerifyDTO`| `WorkerVerificationScreen` (Manual ID) | Public | Network-only with demo fallback |
| **14. ADMIN WORKER KYC** | | | | | | | |
| `/api/admin/workers` | GET | `AdminRepository` | `WorkerStatusQuery` | `List<AdminWorkerKYC>`| `AdminWorkersScreen` (Verification) | Bearer (Admin) | Cache-first |
| `/api/admin/workers/:id/approve`| PUT | `AdminRepository` | `ApproveWorkerRequest`| `AdminWorkerKYC` | `AdminWorkersScreen` (Tier assign) | Bearer (Admin) | Network-only |
| `/api/admin/worker/:id/idcard` | GET | `AdminRepository` | None | `WorkerIDCardDTO` | `WorkerIDCardScreen` (Digital ID) | Bearer (Admin) | Cache-first |
| **15. CUSTOMER AI CHAT** | | | | | | | |
| `/api/ai/chat` | POST | `AIRepository` | `AIChatRequest (Multipart)`| `AIChatResponse` | `AIChatScreen` (Conversational UI) | Public / Bearer| Network-first with local fallback AI |
| **16. AI MULTIMODAL DIAGNOSIS** | | | | | | | |
| `/api/ai/analyze` | POST | `AIRepository` | `AIAnalyzeRequest (Multipart)`| `AIAnalysisResult` | `AISmartDiagnosisScreen` (Camera) | Public / Bearer| Network-first with local fallback AI |
| **17. AI PROVIDER HEALTH** | | | | | | | |
| `/api/ai/health` | GET | `AdminRepository` | None | `AIHealthStatusDTO` | `AdminAnalyticsScreen` (AI tab) | Bearer (Admin) | Network-only |
| `/api/ai/status` | GET | `AdminRepository` | None | `AIStatusDTO` | `AdminAnalyticsScreen` (AI tab) | Bearer (Admin) | Network-only |
| **18. ADMIN DATA EXPORT** | | | | | | | |
| `/api/admin/export/:collection`| GET | `AdminRepository` | None | `ExportDataDTO (CSV/JSON)`| `AdminAnalyticsScreen` (Export) | Bearer (Admin) | Network-only (Save to device storage) |
| **19. SUBSCRIPTIONS** | | | | | | | |
| `/api/subscriptions` | GET | `CustomerRepository` | None | `List<SubscriptionPlan>`| `CustomerSubscriptionsScreen` | Public | Persistent Cache |
| **20. B2B LOCATIONS & TEAM** | | | | | | | |
| `/api/locations` | GET/POST/DEL | `B2BRepository` | `LocationRequest` | `List<LocationModel>` | `B2BLocationsScreen` | Bearer (B2B) | Cache-first |
| `/api/team` | GET/POST/DEL | `B2BRepository` | `TeamRequest` | `List<TeamMemberModel>` | `B2BTeamScreen` | Bearer (B2B) | Cache-first |

---

## 3. ERROR MAPPING RULES

The `DioClient` maps HTTP status codes into strongly-typed Dart domain exceptions:

```
HTTP 400 Bad Request          ──► ValidationFailure(message: response.data['message'])
HTTP 401 Unauthorized         ──► AuthExpiredFailure() (Triggers automatic logout)
HTTP 403 Forbidden            ──► InsufficientPermissionFailure()
HTTP 404 Not Found            ──► ResourceNotFoundFailure()
HTTP 409 Conflict             ──► StateConflictFailure()
HTTP 500 / 502 / 503 Server   ──► ServerUnavailableFailure() (Triggers Demo Fallback Provider)
SocketTimeoutException        ──► NetworkTimeoutFailure() (Triggers Offline Cache Retrieval)
```
