# PHASE 2: B2B CLIENT PORTAL IMPLEMENTATION PLAN
## Complete Mobile-Native Specification for Corporate & Enterprise Facilities

**Document Version:** 2.0.0  
**Phase:** 2 — Planning Only  
**Target Platform:** Flutter (Android)  
**Total B2B Features:** 9 Features (5 P1, 4 P2, 0 P3)  
**Web Baseline:** Mapped from `client/src/pages/b2b/` and `02-FEATURE-PARITY-MATRIX.md`  

---

## 1. B2B CLIENT ARCHITECTURE & SPECIFICATIONS

Corporate partners (e.g., TechCorp India, societies, commercial offices) access enterprise facility management via the dedicated B2B role interface:

### 1.1 B2B Executive Dashboard
- **Screen:** `B2BDashboardScreen`
- **Key Widgets:**
  - `EnterpriseHeaderCard`: Company name ("TechCorp India"), primary account manager, and enterprise tier badge.
  - `FacilityStatsGrid`:
    - Active Contracts Count (`GET /api/contracts`)
    - Pending Monthly Invoices (`GET /api/invoices?status=unpaid`)
    - Managed Office Locations Count (`GET /api/locations`)
    - Scheduled Upcoming Maintenance Visits Count
  - `UpcomingMaintenanceTimeline`: Scheduled recurring maintenance visits for the current month.
- **API Dependency:** `GET /api/contracts`, `GET /api/invoices`, `GET /api/locations`
- **Demo Behavior:** Pre-seeded with TechCorp India corporate account.

### 1.2 Enterprise Service Booking
- **Screen:** `B2BServicesScreen`
- **Key Widgets:**
  - `ContractedServicesGrid`: Services covered under the partner's master agreement (e.g., Commercial HVAC Servicing, Corporate Pest Control, Office Deep Cleaning).
  - `MultiLocationBranchDropdown`: Allows corporate facility managers to dispatch services to specific office branches.
  - `BulkScheduleModal`: Facility for scheduling multi-day recurring servicing visits.
- **API Dependency:** `GET /api/services`, `POST /api/bookings`

### 1.3 Service Contracts Management
- **Screen:** `B2BContractsScreen`, `B2BContractDetailScreen`
- **Key Widgets:**
  - `ContractStatusCard`: Agreement reference (e.g., `CNT-2026-HQ`), duration dates, covered service categories, monthly retainer cost.
  - `ContractSLAPill`: Service Level Agreement terms ("Guaranteed 2-hour response for critical breakdowns").
  - `ContractScopeSheet`: Itemized list of covered maintenance visits per month.
- **API Dependency:** `GET /api/contracts`, `GET /api/contracts/:id`, `POST /api/contracts`

### 1.4 Managed Corporate Locations & Branches
- **Screen:** `B2BLocationsScreen`
- **Key Widgets:**
  - `LocationBranchCard`: Branch title (e.g., "Ahmedabad HQ - SG Highway", "Satellite Office - Prahlad Nagar"), full postal address, branch contact person, and phone number.
  - `AddLocationBottomSheet`: Input form for adding new facility branches.
- **API Dependency:** `GET /api/locations`, `POST /api/locations`, `DELETE /api/locations/:id`

### 1.5 Enterprise Team Accounts & Permissions
- **Screen:** `B2BTeamScreen`
- **Key Widgets:**
  - `TeamMemberTile`: Staff member name, assigned branch, corporate email, role (`Facility Admin`, `Branch Manager`, `Auditor`).
  - `InviteTeamMemberModal`: Form to send branch invitation access.
- **API Dependency:** `GET /api/team`, `POST /api/team`, `DELETE /api/team/:id`

### 1.6 Invoices & Enterprise Billing
- **Screen:** `B2BInvoicesScreen`
- **Key Widgets:**
  - `InvoiceCard`: Invoice number (e.g., `INV-2026-08`), billing period, subtotal, GST amount, and payment status badge (`Paid` [Green], `Pending Due` [Amber], `Overdue` [Red]).
  - `DownloadInvoicePDFButton`: Triggers client-side PDF document generation / download.
  - `PayInvoiceButton`: Enterprise bank transfer / NEFT confirmation.
- **API Dependency:** `GET /api/invoices`, `GET /api/invoices/:id`, `PUT /api/invoices/:id`

### 1.7 Enterprise Service History & Audit Log
- **Screen:** `B2BHistoryScreen`
- **Key Widgets:**
  - `EnterpriseOrderFilterBar`: Filter bookings by specific branch office or date range.
  - `AuditLogListTile`: Detailed job completion record with worker details and before/after verification photos.
- **API Dependency:** `GET /api/bookings`

### 1.8 Dedicated B2B Priority Support
- **Screen:** `B2BSupportScreen`
- **Key Widgets:**
  - `PriorityTicketComposer`: Escalated SLA ticket submission with high-urgency flag.
  - `AccountManagerContactCard`: Direct phone call and email action for the assigned ServeCircle enterprise relationship executive.
- **API Dependency:** `POST /api/complaints` with `isB2B: true`.
