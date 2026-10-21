# 02 — FEATURE PARITY MATRIX
## ServeCircle Flutter Migration — Complete Feature-by-Feature Coverage

**Source:** Verified from App.jsx, routes/, pages/, components/
**Status Legend:** ? Fully specified | ?? Partial / Needs clarification | ?? Complex — see notes

---

## CUSTOMER PANEL

| Feature | Web Screen | API Endpoints | Priority | Complexity |
|---------|-----------|---------------|----------|-----------|
| Dashboard | CustomerDashboard | GET /bookings?status=active | P1 | Medium |
| Browse Services | BrowseServices | GET /services | P1 | Low |
| Service Categories (14 hubs) | Multiple Hub pages | GET /services/category/:cat | P1 | Medium |
| Service Detail | ServiceDetail | GET /services/:id | P1 | Low |
| AI Smart Diagnosis (text+image) | AISmartDiagnosis | POST /api/ai/analyze, POST /api/ai/chat | P1 | High |
| AI Chat | CustomerAIChat | POST /api/ai/chat (multipart/form-data) | P1 | High |
| Book Service | BookingFlow | POST /api/bookings | P1 | High |
| Payment Flow (UPI/Card/Wallet) | PaymentModal | POST /api/wallet/pay | P1 | High |
| Booking History | BookingHistory | GET /api/bookings | P1 | Medium |
| Live Tracking | LiveTracking | Socket: booking_status_update | P1 | High |
| Worker OTP Verification | LiveTracking | POST /api/bookings/:id/start (OTP) | P1 | High |
| Post-Service Review | PostServiceReview | POST /api/reviews | P1 | Medium |
| My Reviews | CustomerReviews | GET /api/reviews | P2 | Low |
| Wallet | CustomerWallet | GET /api/wallet, POST /api/wallet/topup | P1 | Medium |
| Subscriptions | CustomerSubscriptions | GET /api/subscriptions | P2 | Medium |
| Coupons (Apply) | BookingFlow | POST /api/coupons/validate | P1 | Low |
| Notifications | DashboardNavbar | Socket: admin_notification | P2 | Medium |
| Worker Verification (QR Scan) | SecureWorkerVerification | GET /api/verify/:workerId, POST /api/verify/worker | P1 | High |
| Emergency Hub | EmergencyHub | POST /api/bookings (isEmergency: true) | P1 | Medium |
| Events Hub | EventsHub | GET /services/category/Events | P2 | Low |
| Relocation Hub | RelocationHub | GET /services/category/Relocation | P2 | Low |
| Travel & Commute Hub | TravelCommuteHub | GET /services/category/Travel | P2 | Medium |
| Food & Kitchen Hub | FoodKitchenHub | GET /services/category/Food | P2 | Low |
| Pet Services Hub | PetHub | GET /services/category/Pet | P2 | Low |
| Health & Wellness Hub | HealthWellnessHub | GET /services/category/Health | P2 | Low |
| Society Management Hub | SocietyManagementHub | GET /services/category/Society | P2 | Low |
| Vehicle Services Hub | VehicleServicesHub | GET /services/category/Vehicle | P2 | Low |
| My Home Dashboard | MyHomeDashboard | GET /api/bookings (filtered) | P2 | Medium |
| Trust & Safety | TrustSafety | GET /api/verify/:id | P2 | Low |
| HomeFixr Warranty | HomeFixrWarranty | Informational page | P3 | Low |
| Video Consultation | VideoConsultation | Informational / Booking flow | P3 | High |
| Group Booking | GroupBooking | POST /api/bookings (group) | P3 | High |
| Language Toggle (EN/HI/GU) | LanguageToggle | Local only (i18n) | P1 | Medium |
| Search | GlobalServiceSearch | GET /services/search?q= | P2 | Low |
| Ordered Services History | OrderedServices | GET /api/bookings | P2 | Low |
| Premium Demo Flows (4) | *-flow pages | Informational | P3 | Low |
| Demo Pages (3) | *-demo pages | Informational | P3 | Low |

---

## WORKER PANEL

| Feature | Web Screen | API Endpoints | Priority | Complexity |
|---------|-----------|---------------|----------|-----------|
| Worker Dashboard | WorkerDashboard | GET /api/bookings (worker), GET /api/wallet | P1 | Medium |
| Job Requests / Available Jobs | WorkerJobs | GET /api/bookings?status=pending | P1 | Medium |
| Accept/Reject Job | WorkerJobs | PUT /api/bookings/:id/accept, PUT /api/bookings/:id/reject | P1 | Medium |
| Schedule / Calendar | WorkerSchedule | GET /api/bookings?worker=me | P1 | Medium |
| Start Job (OTP entry) | WorkerJobs | POST /api/bookings/:id/start (OTP) | P1 | High |
| Upload Before/After Photos | WorkerJobs | POST /api/bookings/:id/photos | P1 | High |
| Complete Job | WorkerJobs | POST /api/bookings/:id/complete | P1 | Medium |
| Earnings / Wallet | WorkerEarnings | GET /api/wallet, GET /api/wallet/transactions | P1 | Medium |
| Withdraw | WorkerEarnings | POST /api/wallet/withdraw | P1 | Medium |
| Training Modules | WorkerTraining | GET /api/training (or static) | P2 | Low |
| Worker Profile | WorkerProfile | GET/PUT /api/auth/profile | P1 | Medium |
| Become a Pro | BecomeAProHub | Informational / POST application | P3 | Low |
| Live Job Notifications | DashboardNavbar | Socket: booking_assigned | P1 | High |

---

## ADMIN PANEL

| Feature | Web Screen | API Endpoints | Priority | Complexity |
|---------|-----------|---------------|----------|-----------|
| Dashboard | AdminDashboard | GET /api/analytics/dashboard | P1 | Medium |
| All Bookings | AdminBookings | GET /api/bookings/all | P1 | Medium |
| Assign Worker | AdminBookings | POST /api/bookings/:id/assign | P1 | Medium |
| Worker Verification | WorkerVerification (AdminWorkers) | GET /api/admin/workers, PUT /api/admin/workers/:id/approve | P1 | High |
| Worker ID Cards | WorkerIDCardModal | GET /api/admin/worker/:id/idcard | P1 | Medium |
| Analytics Dashboard | AdminAnalytics | GET /api/analytics/* | P2 | High |
| Coupon Management | AdminCoupons | CRUD /api/coupons | P2 | Medium |
| Complaints | AdminComplaints | GET /api/complaints, PUT /api/complaints/:id/resolve | P1 | Medium |
| Partners | AdminPartners | CRUD /api/partners | P2 | Low |
| Notifications | AdminNotifications | POST /api/notifications | P2 | Medium |
| B2B Portal (Admin view) | B2BDashboard | GET /api/contracts/all, GET /api/invoices/all | P2 | Medium |
| B2B Contracts (Admin) | B2BContracts | CRUD /api/contracts | P2 | Medium |
| B2B Locations | B2BLocations | CRUD /api/locations | P2 | Low |
| B2B Invoices (Admin) | B2BInvoices | CRUD /api/invoices | P2 | Medium |
| Data Export | AdminAnalytics | GET /api/admin/export/:collection | P3 | Low |
| AI System Status | Not a UI page | GET /api/ai/health, GET /api/ai/status | P3 | Low |
| Real-time Notifications | DashboardNavbar | Socket: admin_notification | P1 | Medium |

---

## B2B CLIENT PORTAL

| Feature | Web Screen | API Endpoints | Priority | Complexity |
|---------|-----------|---------------|----------|-----------|
| B2B Dashboard | B2BClientDashboard | GET /api/contracts, GET /api/invoices | P1 | Medium |
| Book Services | B2BClientServices | GET /api/services, POST /api/bookings | P1 | Medium |
| My Contracts | B2BClientContracts | GET /api/contracts, POST /api/contracts | P1 | Medium |
| Contract Detail | B2BClientContracts | GET /api/contracts/:id | P1 | Low |
| My Locations | B2BClientLocations | CRUD /api/locations | P2 | Low |
| Team Accounts | B2BTeam | GET/POST/DELETE /api/team | P2 | Medium |
| Invoices | B2BClientInvoices | GET /api/invoices, PUT /api/invoices/:id | P1 | Medium |
| Service History | B2BClientHistory | GET /api/bookings | P2 | Low |
| Support | B2BClientSupport | POST /api/complaints | P2 | Low |

---

## SHARED FEATURES (ACROSS ALL ROLES)

| Feature | Implementation | Priority |
|---------|---------------|----------|
| Login | LoginPage (role selector) | P1 |
| Register | RegisterPage | P1 |
| Worker Registration | WorkerRegister | P1 |
| Logout | clearSession() + navigate /login | P1 |
| Language Switch | LanguageToggle (EN/HI/GU) | P1 |
| Dark/Light Mode | Not implemented | N/A |
| Push Notifications | NOT implemented on web | P2 |
| Deep Links (QR) | /verify/worker/:id | P1 |

---

## PRIORITY DEFINITIONS

| Priority | Definition |
|----------|-----------|
| P1 | Core features — Flutter app cannot ship without these |
| P2 | Important features — must be present in v1.0 |
| P3 | Nice-to-have — can defer to v2.0 |

---

## FEATURE COUNT SUMMARY

| Role | P1 Features | P2 Features | P3 Features | Total |
|------|-------------|-------------|-------------|-------|
| Customer | 14 | 16 | 8 | 38 |
| Worker | 9 | 4 | 1 | 14 |
| Admin | 8 | 8 | 2 | 18 |
| B2B | 5 | 4 | 0 | 9 |
| Shared | 5 | 1 | 0 | 6 |
| **TOTAL** | **41** | **33** | **11** | **85** |
