# House For Paws (H4P)

Social pet-adoption platform: browse listings, engage (like / favorite / comment), request adoption, message owners about a pet, and moderate content through an admin dashboard.

Built as a Software Engineering academic project by Amit Nosuyev.

## Features

- Browse **available** pets with search, type filters, and sorting
- Create and manage adoption listings
- JWT auth: register, login, profile, avatar, notification prefs
- Change email / password / delete account from Profile → Settings
- Likes, favorites, and listing comments
- Adoption requests (apply → owner approve / reject; approving closes sibling pending requests)
- Pet-linked messaging (floating chat panel), delete conversation, block / unblock users
- Notifications: clear all / delete one; Messages badge separate from the bell
- Reports: listing, comment, chat user (optional on block), site bug (with screenshot)
- Admin dashboard: users, bans/warns, reports (+ chat history), comments, applications, animals (remove listings), stats

## Stack

| Layer | Tech |
|-------|------|
| Client | React, Vite, React Router, CSS Modules |
| Server | Node.js, Express, JWT |
| Database | MySQL |

## Setup

1. Configure `server/.env` from `server/.env.example` (never commit `.env`)
2. Set strong `JWT_SECRET` and `ADMIN_SECRET` (16+ characters; server refuses weak defaults)
3. From repo root: `npm run dev` (API `:5000`, client `:5173`)

Promote an admin (dev / optional): `POST /api/auth/promote` with `{ "email", "secret" }` matching `ADMIN_SECRET`.  
In production, promote stays off unless `ENABLE_ADMIN_PROMOTE=true`.

## Security notes

- Email-only forgot-password is **disabled** (use Settings while logged in)
- Password hashing: PBKDF2 (plaintext fallback removed)
- Banned users cannot log in; role/ban re-checked in auth middleware
- Auth / promote / message-send rate limits
- Public pet APIs do not expose owner emails; contact via messaging

## Project layout

- `client/` — React SPA
- `server/` — Express API + `sql/schema.sql`
