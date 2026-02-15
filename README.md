codex/design-frontend-system-for-vaultix-hc6fqj
# VAULTIX Full Working Prototype (Frontend + Backend)

This repository now includes a working Node.js backend API and the frontend system.

## Run the full system

```bash
node server.js
```

Open: `http://localhost:4173/`

## Demo accounts
All demo users use password: `Password123!`

- `owner@vaultix.io` (Data Owner)
- `user@vaultix.io` (Data User)
- `authority@vaultix.io` (Trust Authority)

> OTP demo code is currently `123456` (shown after login).

## Implemented backend API
- Auth: register, login, OTP verification
- Profile: get/update profile
- Settings: get/update user settings
- Dashboards: role-based dashboard metrics
- Files: list files, owner upload
- Access requests: list/create/update workflow
- Analytics: platform summary metrics

## Data persistence
- JSON store: `backend/data/store.json`
- Password hashing via Node `crypto.scrypt`
- Signed auth tokens via HMAC (frontend stores token in `localStorage`)

## Frontend integration
The following pages are connected to backend API:
- Login (`pages/login/index.html`)
- Register (`pages/register/index.html`)
- OTP (`pages/otp/index.html`)
- Dashboards (`pages/dashboards/index.html`)
- Cloud (`pages/cloud/index.html`)
- Profile (`pages/profile/index.html`)

Shared runtime client logic is in `assets/app.js`.
=======
# VAULTIX Frontend (Static UI Prototype)

This repository contains a **frontend-only**, static prototype for the VAULTIX secure cloud platform.

## How to use it

### 1) Run locally
From the repository root:

```bash
python3 -m http.server 4173
```

Then open:
- `http://localhost:4173/` (navigation hub)

### 2) Navigate pages
The project is organized by feature folders:

- Landing: `/pages/landing/index.html`
- Role Selection: `/pages/role-selection/index.html`
- Login: `/pages/login/index.html`
- Register: `/pages/register/index.html`
- OTP: `/pages/otp/index.html`
- Dashboards: `/pages/dashboards/index.html`
- Access Requests: `/pages/dashboards/access-requests.html`
- Cloud Storage: `/pages/cloud/index.html`
- Analytics: `/pages/analytics/index.html`
- Profile: `/pages/profile/index.html`
- Settings: `/pages/settings/index.html`

### 3) Reuse components
Reusable UI snippets are in `/components`:

- `navbar/`
- `sidebar/`
- `cards/`
- `tables/`
- `forms/`
- `charts/`

### 4) Shared styling & interactions
- Global styles/tokens: `assets/styles.css`
- Basic interactions (progress bars, OTP focus): `assets/app.js`

## Notes
- This is intentionally static UI (no backend / blockchain logic).
- Use as a design reference or as a base for migration to React/Next.js main
