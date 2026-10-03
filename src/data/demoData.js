/**
 * @file        demoData.js
 * @module      TEMPORARY DEMO DATA
 * @project     Admin-FrontEnd
 * @description ⚠️ FAKE, HARDCODED DEMO CONTENT — NOT REAL PLATFORM DATA. REMOVE BEFORE PRODUCTION.
 *
 *   Isolated here (pre-launch Phase 1F) from Dashboard.jsx and TopNav.jsx so it can be deleted in one place.
 *   Consumers (search "demoData"):
 *     - pages/Dashboard.jsx        — STREAM_SEED, INTEL, DEMO_STREAM_BUSINESS_NAMES, DEMO_CHART_INSIGHTS
 *     - components/layout/TopNav.jsx — DEMO_NOTIFICATION_BUSINESS_NAMES
 *   Related mock module: data/mockData.js (also demo-only; used by TopNav and CommandPalette).
 *   Do not add more fake data here.
 */

// ── Live activity stream data ──────────────────────────────────
export const STREAM_SEED = [
  { id: 1, type: 'payment',  msg: 'Sunrise Dental paid invoice #INV-0041',       time: '2m ago',  color: 'var(--emerald)' },
  { id: 2, type: 'signup',   msg: 'Apollo Multispeciality joined on Growth plan', time: '7m ago',  color: 'var(--aurora)'  },
  { id: 3, type: 'booking',  msg: '18 bookings confirmed via AI at MedFirst',     time: '12m ago', color: 'var(--violet-light)' },
  { id: 4, type: 'upgrade',  msg: 'CareFirst Clinic upgraded Trial → Pro',        time: '24m ago', color: 'var(--amber)'   },
  { id: 5, type: 'alert',    msg: 'Overdue invoice detected — Wellness Hub',      time: '31m ago', color: 'var(--crimson)' },
  { id: 6, type: 'payment',  msg: 'HealthNest paid ₹8,400 monthly subscription',  time: '44m ago', color: 'var(--emerald)' },
]

// ── AI intelligence observations ──────────────────────────────
export const INTEL = [
  { color: 'var(--aurora)',   text: 'Trial conversions increased 8% — onboarding optimisation is working.' },
  { color: 'var(--emerald)',  text: 'Hyderabad clinics outperform average platform revenue by 17%.' },
  { color: 'var(--violet-light)', text: 'Appointment reminders reduced no-shows by 22% across healthcare clients.' },
  { color: 'var(--amber)',    text: '3 businesses on trial are entering day 12 — conversion window is active.' },
  { color: 'var(--crimson)',  text: 'Wellness Hub has 2 overdue invoices totalling ₹14,200 — follow up recommended.' },
]

// Names cycled into the fake live activity stream (Dashboard)
export const DEMO_STREAM_BUSINESS_NAMES = ['CareFirst', 'Sunrise Dental', 'HealthNest', 'Apollo Clinic', 'MedFirst']

// Names used by the fake 30-second "new booking" notifications (TopNav)
export const DEMO_NOTIFICATION_BUSINESS_NAMES = ['Sunrise Dental', 'Apollo Clinic', 'CareFirst']

// Static chart captions shown under Dashboard charts
export const DEMO_CHART_INSIGHTS = {
  revenue: 'Growth primarily driven by clinic upgrades this quarter.',
  renewals: '2 businesses approaching plan renewal in 7 days.',
  bookings: 'AI receptionist driving higher booking completion rates.',
}
