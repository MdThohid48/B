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
- Use as a design reference or as a base for migration to React/Next.js.
