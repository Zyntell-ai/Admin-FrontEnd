# ZYNTELL Admin Dashboard

A premium, production-grade SaaS admin dashboard for the ZYNTELL AI chatbot platform.

## Tech Stack

- **Vite** — Lightning-fast build tool
- **React 18** — UI framework
- **React Router v6** — Client-side routing
- **Tailwind CSS** — Utility-first styling
- **Recharts** — Chart library
- **Lucide React** — Icon library

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev

# 3. Open http://localhost:5173
```

## Pages

| Route | Page |
|-------|------|
| `/` | Dashboard — KPIs, charts, signals |
| `/bookings` | Bookings — table with all businesses |
| `/businesses` | Businesses — card grid view |
| `/businesses/:id` | Business Detail — full profile |
| `/analytics` | Analytics — funnel, monitoring, performance |
| `/billing` | Billing — invoices, status, actions |
| `/commissions` | Commissions — ledger and signal scores |
| `/categories` | Categories — management and config |
| `/alerts` | Alerts — severity management |
| `/settings` | Settings — users, roles, permissions |

## Project Structure

```
src/
├── components/
│   └── layout/
│       ├── Layout.jsx      # Main wrapper
│       ├── Sidebar.jsx     # Fixed left nav
│       └── TopNav.jsx      # Sticky header
├── pages/
│   ├── Dashboard.jsx
│   ├── Bookings.jsx
│   ├── BusinessDetail.jsx
│   ├── Analytics.jsx
│   ├── Billing.jsx
│   ├── Commissions.jsx
│   ├── Businesses.jsx
│   ├── Categories.jsx
│   ├── Alerts.jsx
│   └── Settings.jsx
├── data/
│   └── mockData.js         # All mock data
├── App.jsx
├── main.jsx
└── index.css
```

## Theme

| Token | Value |
|-------|-------|
| Dark Navy | `#0B0F1A` |
| Indigo | `#4F46E5` |
| Gold | `#D4AF37` |
| Card BG | `#0F1629` |

## Features

- ✅ 9 fully-built pages
- ✅ Interactive charts (line, bar, pie)
- ✅ Booking heatmap
- ✅ Conversion funnel
- ✅ Role-based permissions matrix
- ✅ Filterable tables with badges
- ✅ Business card grid
- ✅ Notification center
- ✅ Global search bar
- ✅ Alert severity management
- ✅ Commission signal scoring
- ✅ Category management panel
- ✅ Billing invoice actions
- ✅ Admin actions (suspend, warn, unlock)
