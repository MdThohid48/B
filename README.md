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
