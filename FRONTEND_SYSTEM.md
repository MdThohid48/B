# VAULTIX Frontend System (Production-Ready Blueprint)

## 1) Design System
- **Visual language:** Soft glassmorphism, frosted blur, lavender-indigo fintech gradients, rounded mega containers (18px–28px), premium soft shadow.
- **Color tokens:** Primary `#5B5FEF`, Secondary `#7DD3FC`, Accent `#A78BFA`, Success `#10B981`, Warning `#F59E0B`, Danger `#EF4444`.
- **Interaction primitives:** Hover lift, gradient shimmer, soft pulse buttons, progressive loading bars, page fade and slide transitions.
- **Typography:** Inter / system sans; high-contrast headers + calm muted helper text for enterprise readability.

## 2) Layout Wireframes
- **Top navigation:** Vaultix logo, active role badge, notification icon, avatar/profile.
- **Sidebar:** Dashboard, Cloud Storage, Access Requests, Permissions, Analytics, Profile, Settings, Logout.
- **Workspace:** Card-grid analytics, data tables, role-context widgets, upload and request flows.

## 3) Page UI Breakdown
1. **Landing** (`pages/landing`) hero + CTA + fintech visual block.
2. **Role Selection** (`pages/role-selection`) owner/user/authority selection cards.
3. **Login** (`pages/login`) enterprise auth form.
4. **Register** (`pages/register`) onboarding form.
5. **OTP** (`pages/otp`) six-digit verification inputs.
6. **Role Dashboards** (`pages/dashboards/index.html`) includes Data Owner, Data User, Trust Authority views.
7. **Cloud Storage** (`pages/cloud`) file cards, filters, grid/list controls.
8. **Access Request Management** (`pages/dashboards/access-requests.html`) queue table + actions.
9. **Analytics** (`pages/analytics`) usage, trends, approval, category chart blocks.
10. **Profiles** (`pages/profile`) common + role-specific profile modules.
11. **Settings** (`pages/settings`) tab-like badges for profile/security/notifications/theme/accounts.

## 4) Component Library
- `components/cards/stat-card.html`
- `components/navbar/top-navbar.html`
- `components/sidebar/sidebar.html`
- `components/tables/data-table.html`
- `components/forms/otp-input.html`
- `components/charts/soft-chart.html`

## 5) Profile System Design
- **Common fields:** Avatar, name, role badge, verification, organization, join date.
- **Editable profile data:** Name/email/phone/organization/location/bio.
- **Security panel:** Password reset, OTP, 2FA, login history, active sessions.
- **Role-specific metrics:** Owner (storage/permissions), User (requests/access), Authority (reviews/approvals/level).
- **Activity timeline:** Login, file action, approval, security events.

## 6) Animation System
- `.fade-in`, `.slide-in`, hover-lift on cards.
- Button pulse + progress shimmer.
- Sidebar active-link slide feedback.

## 7) Responsive Behavior
- Desktop: full sidebar + multi-column card grids.
- Tablet: compact sidebar + 2-column stat layouts.
- Mobile: stacked cards, horizontal-scroll nav pills, single-column forms.

## 8) Folder Structure
```
/assets
  styles.css
  app.js
/components
  /navbar
  /sidebar
  /cards
  /tables
  /forms
  /charts
/pages
  /landing
  /role-selection
  /login
  /register
  /otp
  /dashboards
  /cloud
  /analytics
  /profile
  /settings
```
