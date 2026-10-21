# 06 — AUTH & PERMISSION MATRIX
## ServeCircle Flutter Migration — Role-Based Access Control Specification

**Source:** Verified from server/middleware/auth.js, server/routes/*, client/src/App.jsx

---

## ROLES

| Role | Description | Demo Credential |
|------|-------------|----------------|
| `customer` | End-user booking home services | rudra@test.com / test123 |
| `worker` | Service professional accepting/completing jobs | ramesh@test.com / test123 |
| `admin` | Platform administrator — full access | admin@servecircle.in / admin123 |
| `b2b` | B2B partner/client (corporate accounts) | gv@test.com / test123 |

---

## JWT PAYLOAD

```json
{ "id": "<userId>", "role": "customer|worker|admin|b2b" }
```

**Signed with:** `process.env.JWT_SECRET`
**Expiry:** 7 days (`7d`)
**Storage:** `localStorage["servecircle_session"].token`

---

## ROUTE PERMISSION MATRIX

### Auth Routes
| Route | customer | worker | admin | b2b | Public |
|-------|----------|--------|-------|-----|--------|
| POST /api/auth/register | — | — | — | — | ? |
| POST /api/auth/login | — | — | — | — | ? |
| GET /api/auth/me | ? | ? | ? | ? | — |
| PUT /api/auth/profile | ? | ? | ? | ? | — |
| POST /api/auth/change-password | ? | ? | ? | ? | — |
| PUT /api/auth/subscription | ? | — | ? | — | — |
| GET /api/auth/demo/* | — | — | — | — | ? |

### Bookings Routes
| Route | customer | worker | admin | b2b | Notes |
|-------|----------|--------|-------|-----|-------|
| GET /api/bookings | ? (own) | ? (own) | ? (all) | ? (own) | Role-filtered |
| GET /api/bookings/all | — | — | ? | — | |
| POST /api/bookings | ? | — | ? | ? | |
| GET /api/bookings/:id | ? | ? | ? | ? | Own bookings only |
| PUT /api/bookings/:id/assign | — | — | ? | — | |
| PUT /api/bookings/:id/accept | — | ? (own) | — | — | Worker must be assigned |
| PUT /api/bookings/:id/reject | — | ? (own) | — | — | |
| POST /api/bookings/:id/start | — | ? (own) | — | — | Requires OTP |
| POST /api/bookings/:id/complete | — | ? (own) | — | — | GPS capture |
| POST /api/bookings/:id/cancel | ? (own) | ? (own) | ? | — | |
| POST /api/bookings/:id/photos | — | ? (own) | — | — | Multipart |
| GET /api/bookings/:id/otp | ? (own) | — | — | — | |

### Services Routes
| Route | customer | worker | admin | b2b | Public |
|-------|----------|--------|-------|-----|--------|
| GET /api/services | — | — | — | — | ? |
| GET /api/services/search | — | — | — | — | ? |
| GET /api/services/category/:cat | — | — | — | — | ? |
| GET /api/services/:id | — | — | — | — | ? |
| POST /api/services | — | — | ? | — | — |
| PUT /api/services/:id | — | — | ? | — | — |
| DELETE /api/services/:id | — | — | ? | — | — |
| PATCH /api/services/:id/toggle | — | — | ? | — | — |

### Reviews Routes
| Route | customer | worker | admin | b2b |
|-------|----------|--------|-------|-----|
| GET /api/reviews | ? | ? | ? | — |
| GET /api/reviews/worker/:id | Public | Public | Public | Public |
| POST /api/reviews | ? | — | — | — |
| PUT /api/reviews/:id | ? (own) | — | ? | — |
| DELETE /api/reviews/:id | ? (own) | — | ? | — |
| POST /api/reviews/:id/reply | — | ? (own) | — | — |

### Wallet Routes
| Route | customer | worker | admin | b2b |
|-------|----------|--------|-------|-----|
| GET /api/wallet | ? | ? | — | — |
| GET /api/wallet/transactions | ? | ? | — | — |
| POST /api/wallet/topup | ? | — | — | — |
| POST /api/wallet/pay | ? | — | — | — |
| POST /api/wallet/withdraw | — | ? | — | — |

### Complaints Routes
| Route | customer | worker | admin | b2b |
|-------|----------|--------|-------|-----|
| GET /api/complaints | ? (own) | ? (own) | ? (all) | ? (own) |
| GET /api/complaints/all | — | — | ? | — |
| POST /api/complaints | ? | ? | ? | ? |
| GET /api/complaints/:id | ? (own) | — | ? | — |
| PUT /api/complaints/:id/resolve | — | — | ? | — |
| PUT /api/complaints/:id/status | — | — | ? | — |

### Notifications Routes
| Route | customer | worker | admin | b2b |
|-------|----------|--------|-------|-----|
| GET /api/notifications | ? | ? | ? | ? |
| POST /api/notifications | — | — | ? | — |
| PATCH /api/notifications/:id/read | ? | ? | ? | ? |
| DELETE /api/notifications/:id | — | — | ? | — |

### Coupons Routes
| Route | customer | worker | admin | b2b |
|-------|----------|--------|-------|-----|
| GET /api/coupons | ? | — | ? | — |
| GET /api/coupons/all | — | — | ? | — |
| POST /api/coupons/validate | ? | — | ? | — |
| POST /api/coupons | — | — | ? | — |
| PUT /api/coupons/:id | — | — | ? | — |
| DELETE /api/coupons/:id | — | — | ? | — |

### Contracts Routes (B2B)
| Route | customer | worker | admin | b2b |
|-------|----------|--------|-------|-----|
| GET /api/contracts | — | — | ? (all) | ? (own) |
| GET /api/contracts/all | — | — | ? | — |
| GET /api/contracts/:id | — | — | ? | ? (own) |
| POST /api/contracts | — | — | ? | ? |
| PUT /api/contracts/:id | — | — | ? | — |
| DELETE /api/contracts/:id | — | — | ? | — |

### Invoices Routes (B2B)
| Route | customer | worker | admin | b2b |
|-------|----------|--------|-------|-----|
| GET /api/invoices | — | — | ? (all) | ? (own) |
| GET /api/invoices/all | — | — | ? | — |
| POST /api/invoices | — | — | ? | — |
| PUT /api/invoices/:id | — | — | ? | ? |

### Analytics Routes
| Route | customer | worker | admin | b2b |
|-------|----------|--------|-------|-----|
| GET /api/analytics/* | — | — | ? | — |

### Worker Verification Routes
| Route | customer | worker | admin | b2b | Public/Optional |
|-------|----------|--------|-------|-----|----------------|
| GET /api/verify/:workerId | opt | opt | opt | opt | ? (optionalAuth) |
| GET /api/verify/status/:workerId | — | — | — | — | ? |
| GET /api/booking/:id/worker-preview | opt | opt | opt | opt | ? (optionalAuth) |
| POST /api/verify/worker | opt | — | opt | opt | ? (optionalAuth) |
| GET /api/admin/worker/:id/idcard | — | — | ? | — | — |
| POST /api/admin/worker/:id/regenerate-qr | — | — | ? | — | — |
| POST /api/admin/worker/:id/toggle-qr | — | — | ? | — | — |

### AI Routes
| Route | customer | worker | admin | b2b | Notes |
|-------|----------|--------|-------|-----|-------|
| POST /api/ai/chat | ? | ? | — | — | Blocks non-customer if auth; allows guest |
| POST /api/ai/analyze | opt | opt | opt | opt | optionalAuth |
| GET /api/ai/health | — | — | — | — | ? Public |
| GET /api/ai/status | — | — | — | — | ? Public |
| GET /api/ai/providers | — | — | ? | — | — |
| POST /api/ai/switch | — | — | ? | — | — |
| POST /api/ai/test/* | — | — | ? | — | — |
| GET /api/internal/ai/* | — | — | ? | — | — |
| POST /api/internal/ai/* | — | — | ? | — | — |
| DELETE /api/internal/ai/cache | — | — | ? | — | — |

### Admin Export Routes
| Route | customer | worker | admin | b2b |
|-------|----------|--------|-------|-----|
| GET /api/admin/export/* | — | — | ? | — |

---

## WORKER STATUS GATES

Workers face additional authorization based on their `workerStatus`:

| Action | Required workerStatus |
|--------|----------------------|
| Accept bookings | approved_senior OR approved_junior OR approved |
| Access Worker Panel | approved_* (or any — client-side only, not server-enforced for UI) |
| QR Code valid | approved_* AND qrActive=true AND !isDeleted AND !suspended/blocked/expired/rejected |

**Note:** The worker status check is NOT enforced in the JWT `authorize()` middleware. It's checked only in specific business logic endpoints. In Flutter, the UI should check `user.workerStatus` on login and redirect pending workers appropriately.

---

## CLIENT-SIDE SECURITY AUDIT (VERIFIED BUG)

**BUG-001: No PrivateRoute / route guards in App.jsx**

The web client has NO React Router route guards. Any URL can be accessed without authentication. API calls will fail with 401, but pages render.

**Flutter Implementation MUST:**
- Implement auth state management (e.g., Riverpod Provider)
- Redirect to LoginPage if no valid token in secure storage
- Redirect to role-appropriate home on login
- Handle 401 responses by clearing token and redirecting to login

**Recommended Flutter Auth Pattern:**
```dart
// On app start
final session = await secureStorage.read(key: 'session');
if (session == null) ? navigate to /login
else ? validate token (GET /api/auth/me) ? navigate to role home
```

---

## FLUTTER AUTH IMPLEMENTATION NOTES

1. **Token storage:** Use `flutter_secure_storage` (NOT SharedPreferences — insecure)
2. **Session key:** `servecircle_session` (JSON: `{ token, user }`)
3. **Token injection:** Add `Authorization: Bearer <token>` to all protected requests
4. **Token expiry:** 7 days — check `exp` claim in JWT payload or catch 401 and re-login
5. **No refresh token:** On expiry, user must re-authenticate
6. **Role enforcement:** After login, check `user.role` and navigate accordingly
7. **Admin cannot register:** Only login — admin accounts are pre-seeded
