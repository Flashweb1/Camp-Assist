# CampAssist 🏕️

A marketplace connecting NYSC corps members with vendors inside orientation camp. Corps members can browse vendors (food, laundry, errands, supplies), place orders, chat with vendors, and pay on delivery. Vendors can manage profiles, receive orders, update status, and chat with corps members.

## Tech Stack

- **React 19** + **Vite 8** (frontend)
- **Firebase Auth** (authentication)
- **Cloud Firestore** (real-time database)
- **React Router v7** (routing)

## Setup

1. Clone the repo
2. `npm install`
3. `npm run dev`

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Roles

- **Corps Member** — browse vendors, place orders, rate service
- **Vendor** — receive orders, update status, manage profile
- **Admin** — camp-wide order overview and stats

## Firestore Collections

- `users/{uid}` — role mapping
- `corps_members/{uid}` — corps member profiles
- `vendors/{uid}` — vendor profiles
- `orders/{orderId}` — orders with status tracking
- `chats/{orderId}/messages/{messageId}` — per-order chat messages
- `ratings/{ratingId}` — star ratings and reviews
