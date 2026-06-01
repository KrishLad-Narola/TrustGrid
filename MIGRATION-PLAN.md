# UI/UX Migration Plan — NewKYCPlatform ← core-trust-suite

## 1. Codebase comparison

### Stack (aligned)
- Vite 7, React 19, Tailwind CSS v4, Radix primitives, lucide-react, sonner, recharts
- Same design tokens in `styles.css` (oklch palette, glass-card, btn-primary/ghost)

### Architecture (differs — do not change in current)
| Layer | Current project | Reference project |
|--------|-----------------|-------------------|
| Routing | **React Router** (`App.jsx`, `/dashboard`, `/admin`) | TanStack Router (`/app`, file routes) |
| Auth | **Real API** (`auth-context.jsx` + `axiosInstance`) | Mock users + `switchRole` |
| API pages | KycPage, DealsPage, Landing, Register, KYC flow | Mock data only |
| Layout | `AppShell` + `AppHeader` in shell + `PageHeader` on pages | Sidebar layout; **AppHeader per page** |
| UI primitives | `ui-kit.jsx` (`Panel`, `PageHeader`) | `ui-bits.jsx` (`Card`, `SectionTitle`, `StatCard`) |
| shadcn `components/ui/` | **Missing** | Present (optional; not required for parity) |

### Route mapping (keep current paths)
| Current | Reference equivalent |
|---------|---------------------|
| `/dashboard` | `/app` |
| `/dashboard/kyc` | `/app/kyc` |
| `/dashboard/trust` | `/app/trust-score` |
| `/dashboard/deals` | `/app/deals` |
| `/dashboard/directory` | `/app/directory` |
| `/dashboard/shared` | `/app/shared` |
| `/dashboard/audit` | `/app/audit` |
| `/dashboard/settings` | `/app/settings` |
| `/admin/*` | `/admin/*` (labels differ slightly) |

### Screen inventory
**Shell:** `app-shell`, `AppSidebar`, `app-header`, `role-switcher`, `notification-drawer`, `trust-gauge`

**Dashboard (UI refactor, mock + local state OK):** DashboardHome, TrustPage, DirectoryPage, SharedPage, AuditPage, SettingsPage

**Dashboard (preserve API/logic):** KycPage (+ DocumentPreviewModal), DealsPage

**Admin (mostly mock UI):** AdminHome, AdminBusinesses, AdminKyc, AdminTrust, AdminDisputes, AdminAudit, AdminSettings

**Auth / onboarding (preserve API):** Landing, Register, ForgotPassword, Verifyemail, ResetPassword, ProfilePage, ChangePassword, KycSubmitPage, kycComplete, KycGuard

**Untouched:** `App.jsx` guards/routes, `auth-context.jsx`, `axiosInstance.js`, `PublicRoutes.jsx`, hooks

---

## 2. UX issues in current build
1. **Double headers** — `AppShell` renders `AppHeader`; pages also use `PageHeader`.
2. **Undefined utility classes** — `glass`, `glass-strong`, `cyan-glow`, `glow-primary` used widely but not in `styles.css` (reference uses `glass-card`, `btn-*`, semantic tokens).
3. **Sidebar** — Missing reference footer (user chip + logout); reference DEV role switch stays as floating `RoleSwitcher`.
4. **Inconsistent cards** — `Panel` vs `glass-card` / `Card`.

---

## 3. Migration strategy (functionality first)

### Phase 1 — Foundation & shell ✅
- Dedupe `styles.css` font imports; align with reference tokens only.
- Add `components/ui-bits.jsx` from reference.
- Extend `ui-kit.jsx` to re-export `ui-bits` + map `Panel` → `Card`, dual `StatusBadge` keys.
- Refactor `AppSidebar` (reference nav UX, current routes, real `user`/`business`, `logout`).
- Refactor `app-shell` to reference layout (sidebar + scrollable main); single `AppHeader` via layout `headerMap`.
- Expand `DashboardLayout` / `AdminLayout` header maps for all child routes.
- Update `role-switcher` to reference button styles.

### Phase 2 — Dashboard & admin pages ✅ (mostly complete)
- DashboardHome, TrustPage, DirectoryPage, SharedPage, AuditPage aligned to reference.
- AdminHome aligned to reference (queue table + system alerts).
- Removed duplicate `PageHeader` across dashboard/admin routes.
- Replaced legacy `cyan-glow` / `glass` classes with design tokens on most pages.

### Phase 3 — High-risk screens ✅ (UI shell)
- **KycPage:** Upload modal restyled (`glass-card`, `btn-*`); API logic unchanged.
- **DealsPage:** Layout padding/header fixed; deal API CRUD unchanged.
- **Landing / Register / auth:** Reference marketing/auth shells; axios + zod preserved.

### Phase 4 — Polish
- Mobile: reference sidebar width, header search `hidden md:flex`, table `overflow-x-auto`.
- Smoke-test guards: KYC DRAFT → submit → complete → VERIFIED dashboard.
- Remove `_reference` folder from repo before production (local only).

### Out of scope
- TanStack Router migration
- Copying entire `components/ui/` unless a page needs a specific control
- Changing `MainAppGuard` / KYC status logic

---

## 4. Component mapping
| Reference | Current action |
|-----------|----------------|
| `app-sidebar.jsx` | Merge into `AppSidebar.jsx` (react-router `Link`) |
| `app-header.jsx` | Already aligned |
| `ui-bits.jsx` | Add; migrate imports gradually |
| `ui-kit.jsx` | Thin compatibility layer → deprecate |
| `audit-log-view.jsx` | Port if Audit pages need shared table |
| `notification-drawer.jsx` | Keep (already shared) |
| `trust-gauge.jsx` | Keep (already shared) |

---

## 5. Risk register
| Risk | Mitigation |
|------|------------|
| StatusBadge casing | Support both lowercase (deals/kyc) and Title Case (admin mock) |
| Admin pages use mock data | UI-only change; wire APIs later separately |
| DealsPage size | UI-only diff; no handler changes |
| Logout in sidebar | Call existing `logout()` from auth context |

---

## 6. Success criteria
- [x] Navigation matches reference (sidebar, active states, footer user block)
- [x] One header per authenticated page
- [x] All routes in `App.jsx` unchanged
- [x] KYC upload modal + deals API logic preserved (manual QA recommended)
- [x] Login/register/password flows preserved (manual QA recommended)
- [ ] Full responsive pass on KycSubmit / kycComplete / Profile (minor legacy classes may remain)
