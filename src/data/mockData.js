/**
 * @file        mockData.js
 * @module      Mock Data
 * @project     Admin-FrontEnd
 * @layer       Data
 * @description Static Firestore-aligned mock dataset providing businesses, bookings, stats, metrics, alerts, invoices, commissions, categories, admin users, trials, and chart data for the admin dashboard UI.
 *
 * @updated     2026-05-29
 * @version     1.0.0
 *
 * @dependencies
 *   - None (pure data module, no imports)
 *
 * @sideEffects
 *   - None
 */

// ─────────────────────────────────────────
// CONSTANTS & CONFIG
// ─────────────────────────────────────────

// ─── ZYNTELL Admin Dashboard — Firestore-Aligned Mock Data ──────────────────

/** Supported platform service category labels */
export const CATEGORIES = ['Healthcare', 'Restaurant', 'Real Estate', 'Beauty', 'Education']

// ─────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────

/**
 * @function    businesses
 * @purpose     Static list of registered business records used for seeding the UI and command palette search
 * @returns {Array<Object>} Array of business objects with id, name, contact, category, plan, and trial fields
 */
export const businesses = [
  { id: 'biz001', name: 'Sunshine Dental', email: 'sunshine@test.com', phone: '+919876543210', category: 'Healthcare', subCategory: 'Dental', city: 'Hyderabad', locality: 'Banjara Hills', plan: 'pro', isActive: true, isTrialActive: false, createdAt: '2024-01-15', trialEndDate: null },
  { id: 'biz002', name: 'MedCare Clinic', email: 'medcare@test.com', phone: '+919876543211', category: 'Healthcare', subCategory: 'General', city: 'Hyderabad', locality: 'Jubilee Hills', plan: 'growth', isActive: true, isTrialActive: false, createdAt: '2024-02-10', trialEndDate: null },
  { id: 'biz003', name: 'CityMed Hospital', email: 'citymed@test.com', phone: '+919876543212', category: 'Healthcare', subCategory: 'Hospital', city: 'Delhi', locality: 'Connaught Place', plan: 'pro', isActive: true, isTrialActive: false, createdAt: '2023-11-20', trialEndDate: null },
  { id: 'biz004', name: 'Spice Route', email: 'spice@test.com', phone: '+919876543213', category: 'Restaurant', subCategory: 'Fine Dining', city: 'Mumbai', locality: 'Bandra', plan: 'starter', isActive: true, isTrialActive: false, createdAt: '2024-03-01', trialEndDate: null },
  { id: 'biz005', name: 'La Bella Dining', email: 'labella@test.com', phone: '+919876543214', category: 'Restaurant', subCategory: 'Casual', city: 'Pune', locality: 'Koregaon Park', plan: 'trial', isActive: false, isTrialActive: true, createdAt: '2024-04-01', trialEndDate: '2024-04-18' },
  { id: 'biz006', name: 'Urban Realty', email: 'urban@test.com', phone: '+919876543215', category: 'Real Estate', subCategory: 'Residential', city: 'Bangalore', locality: 'Whitefield', plan: 'trial', isActive: false, isTrialActive: true, createdAt: '2024-04-05', trialEndDate: '2024-04-19' },
  { id: 'biz007', name: 'PrimeSpace Realty', email: 'prime@test.com', phone: '+919876543216', category: 'Real Estate', subCategory: 'Commercial', city: 'Hyderabad', locality: 'HITECH City', plan: 'starter', isActive: true, isTrialActive: false, createdAt: '2024-02-28', trialEndDate: null },
  { id: 'biz008', name: 'Glow Beauty Studio', email: 'glow@test.com', phone: '+919876543217', category: 'Beauty', subCategory: 'Salon', city: 'Chennai', locality: 'Anna Nagar', plan: 'growth', isActive: true, isTrialActive: false, createdAt: '2024-01-08', trialEndDate: null },
  { id: 'biz009', name: 'Wellness Hub', email: 'wellness@test.com', phone: '+919876543218', category: 'Beauty', subCategory: 'Spa', city: 'Kolkata', locality: 'Park Street', plan: 'pro', isActive: true, isTrialActive: false, createdAt: '2023-12-15', trialEndDate: null },
  { id: 'biz010', name: 'City Tutors', email: 'tutors@test.com', phone: '+919876543219', category: 'Education', subCategory: 'Coaching', city: 'Hyderabad', locality: 'Ameerpet', plan: 'trial', isActive: false, isTrialActive: true, createdAt: '2024-04-08', trialEndDate: '2024-04-22' },
]

/** Individual booking records across all businesses */
export const bookings = [
  { id: 'book001', businessId: 'biz001', businessName: 'Sunshine Dental', category: 'Healthcare', customerName: 'Rajesh P.', customerPhone: '+919800001111', serviceName: 'Dental Cleaning', staffName: 'Dr. Rao', status: 'COMPLETED', scheduledAt: '2024-04-12T10:00', source: 'whatsapp', createdAt: '2024-04-10' },
  { id: 'book002', businessId: 'biz001', businessName: 'Sunshine Dental', category: 'Healthcare', customerName: 'Meera S.', customerPhone: '+919800001112', serviceName: 'Root Canal', staffName: 'Dr. Rao', status: 'NO_SHOW', scheduledAt: '2024-04-12T11:00', source: 'voice', createdAt: '2024-04-10' },
  { id: 'book003', businessId: 'biz002', businessName: 'MedCare Clinic', category: 'Healthcare', customerName: 'Arjun K.', customerPhone: '+919800001113', serviceName: 'Consultation', staffName: 'Dr. Priya', status: 'CONFIRMED', scheduledAt: '2024-04-13T09:30', source: 'whatsapp', createdAt: '2024-04-11' },
  { id: 'book004', businessId: 'biz003', businessName: 'CityMed Hospital', category: 'Healthcare', customerName: 'Pooja M.', customerPhone: '+919800001114', serviceName: 'Blood Test', staffName: 'Lab Staff', status: 'COMPLETED', scheduledAt: '2024-04-11T08:00', source: 'whatsapp', createdAt: '2024-04-09' },
  { id: 'book005', businessId: 'biz004', businessName: 'Spice Route', category: 'Restaurant', customerName: 'Vikram R.', customerPhone: '+919800001115', serviceName: 'Table Booking', staffName: '', status: 'COMPLETED', scheduledAt: '2024-04-12T20:00', source: 'whatsapp', createdAt: '2024-04-11' },
  { id: 'book006', businessId: 'biz004', businessName: 'Spice Route', category: 'Restaurant', customerName: 'Anita L.', customerPhone: '+919800001116', serviceName: 'Table Booking', staffName: '', status: 'NO_SHOW', scheduledAt: '2024-04-12T21:00', source: 'voice', createdAt: '2024-04-11' },
  { id: 'book007', businessId: 'biz006', businessName: 'Urban Realty', category: 'Real Estate', customerName: 'Suresh T.', customerPhone: '+919800001117', serviceName: 'Site Visit', staffName: 'Ravi Agent', status: 'COMPLETED', scheduledAt: '2024-04-10T11:00', source: 'whatsapp', createdAt: '2024-04-08' },
  { id: 'book008', businessId: 'biz008', businessName: 'Glow Beauty Studio', category: 'Beauty', customerName: 'Nisha G.', customerPhone: '+919800001118', serviceName: 'Hair Spa', staffName: 'Kavya', status: 'COMPLETED', scheduledAt: '2024-04-12T14:00', source: 'whatsapp', createdAt: '2024-04-10' },
  { id: 'book009', businessId: 'biz009', businessName: 'Wellness Hub', category: 'Beauty', customerName: 'Divya P.', customerPhone: '+919800001119', serviceName: 'Full Body Massage', staffName: 'Therapist A', status: 'CONFIRMED', scheduledAt: '2024-04-13T10:00', source: 'whatsapp', createdAt: '2024-04-11' },
  { id: 'book010', businessId: 'biz002', businessName: 'MedCare Clinic', category: 'Healthcare', customerName: 'Ram B.', customerPhone: '+919800001120', serviceName: 'X-Ray', staffName: 'Dr. Priya', status: 'NO_SHOW', scheduledAt: '2024-04-11T10:00', source: 'voice', createdAt: '2024-04-10' },
]

/** Aggregated per-business statistics pre-computed for the analytics and dashboard pages */
export const businessStats = [
  { businessId: 'biz001', businessName: 'Sunshine Dental', category: 'Healthcare', city: 'Hyderabad', plan: 'pro', status: 'active', totalBookings: 487, confirmed: 445, completed: 398, noShows: 47, showUpRate: 89.4, anomalyPct: 10.6, generatedBill: 9740, totalRevenue: 8766, commission: 876, weeklyBookings: 112, monthlyBookings: 487 },
  { businessId: 'biz002', businessName: 'MedCare Clinic', category: 'Healthcare', city: 'Hyderabad', plan: 'growth', status: 'active', totalBookings: 312, confirmed: 298, completed: 271, noShows: 27, showUpRate: 90.9, anomalyPct: 9.1, generatedBill: 6240, totalRevenue: 5616, commission: 562, weeklyBookings: 72, monthlyBookings: 312 },
  { businessId: 'biz003', businessName: 'CityMed Hospital', category: 'Healthcare', city: 'Delhi', plan: 'pro', status: 'active', totalBookings: 678, confirmed: 612, completed: 545, noShows: 67, showUpRate: 89.1, anomalyPct: 10.9, generatedBill: 13560, totalRevenue: 12204, commission: 1220, weeklyBookings: 158, monthlyBookings: 678 },
  { businessId: 'biz004', businessName: 'Spice Route', category: 'Restaurant', city: 'Mumbai', plan: 'starter', status: 'active', totalBookings: 312, confirmed: 298, completed: 271, noShows: 27, showUpRate: 90.9, anomalyPct: 9.1, generatedBill: 6240, totalRevenue: 5616, commission: 562, weeklyBookings: 71, monthlyBookings: 312 },
  { businessId: 'biz005', businessName: 'La Bella Dining', category: 'Restaurant', city: 'Pune', plan: 'trial', status: 'trial', totalBookings: 189, confirmed: 172, completed: 143, noShows: 29, showUpRate: 83.1, anomalyPct: 16.9, generatedBill: 3780, totalRevenue: 3402, commission: 340, weeklyBookings: 42, monthlyBookings: 189 },
  { businessId: 'biz006', businessName: 'Urban Realty', category: 'Real Estate', city: 'Bangalore', plan: 'trial', status: 'trial', totalBookings: 156, confirmed: 142, completed: 118, noShows: 24, showUpRate: 83.1, anomalyPct: 16.9, generatedBill: 3120, totalRevenue: 2808, commission: 281, weeklyBookings: 36, monthlyBookings: 156 },
  { businessId: 'biz007', businessName: 'PrimeSpace Realty', category: 'Real Estate', city: 'Hyderabad', plan: 'starter', status: 'active', totalBookings: 98, confirmed: 89, completed: 74, noShows: 15, showUpRate: 83.1, anomalyPct: 16.9, generatedBill: 1960, totalRevenue: 1764, commission: 176, weeklyBookings: 22, monthlyBookings: 98 },
  { businessId: 'biz008', businessName: 'Glow Beauty Studio', category: 'Beauty', city: 'Chennai', plan: 'growth', status: 'active', totalBookings: 234, confirmed: 221, completed: 208, noShows: 13, showUpRate: 94.1, anomalyPct: 5.9, generatedBill: 4680, totalRevenue: 4212, commission: 421, weeklyBookings: 54, monthlyBookings: 234 },
  { businessId: 'biz009', businessName: 'Wellness Hub', category: 'Beauty', city: 'Kolkata', plan: 'pro', status: 'active', totalBookings: 321, confirmed: 304, completed: 289, noShows: 15, showUpRate: 95.1, anomalyPct: 4.9, generatedBill: 6420, totalRevenue: 5778, commission: 578, weeklyBookings: 74, monthlyBookings: 321 },
  { businessId: 'biz010', businessName: 'City Tutors', category: 'Education', city: 'Hyderabad', plan: 'trial', status: 'trial', totalBookings: 34, confirmed: 28, completed: 20, noShows: 8, showUpRate: 71.4, anomalyPct: 28.6, generatedBill: 680, totalRevenue: 612, commission: 61, weeklyBookings: 8, monthlyBookings: 34 },
]

/** Dashboard KPI snapshots for today, weekly, and monthly time windows */
export const dashboardMetrics = {
  today: { bookings: 342, revenue: 18450, expectedBookings: 380, anomalyRate: 8.4, newTrials: 3 },
  weekly: { bookings: 2187, revenue: 124300, expectedBookings: 2400, anomalyRate: 7.1, newTrials: 12 },
  monthly: { bookings: 9420, revenue: 538600, expectedBookings: 10000, anomalyRate: 6.8, newTrials: 47 },
}

/** Category-level booking and revenue breakdown for the current day */
export const categoryDayStats = [
  { category: 'Healthcare', bookings: 148, revenue: 8200, showUps: 134 },
  { category: 'Restaurant', bookings: 87, revenue: 4100, showUps: 74 },
  { category: 'Real Estate', bookings: 43, revenue: 2800, showUps: 36 },
  { category: 'Beauty', bookings: 52, revenue: 2600, showUps: 49 },
  { category: 'Education', bookings: 12, revenue: 750, showUps: 8 },
]

/** Monthly revenue vs target data points for the revenue line/bar chart */
export const revenueChartData = [
  { month: 'Aug', revenue: 42000, target: 50000 },
  { month: 'Sep', revenue: 58000, target: 55000 },
  { month: 'Oct', revenue: 53000, target: 60000 },
  { month: 'Nov', revenue: 67000, target: 65000 },
  { month: 'Dec', revenue: 71000, target: 70000 },
  { month: 'Jan', revenue: 64000, target: 75000 },
  { month: 'Feb', revenue: 79000, target: 80000 },
  { month: 'Mar', revenue: 88000, target: 85000 },
  { month: 'Apr', revenue: 95000, target: 90000 },
]

/** Daily bookings vs show-ups data for the weekly bookings chart */
export const bookingsChartData = [
  { day: 'Mon', bookings: 312, showups: 274 },
  { day: 'Tue', bookings: 389, showups: 351 },
  { day: 'Wed', bookings: 428, showups: 384 },
  { day: 'Thu', bookings: 356, showups: 318 },
  { day: 'Fri', bookings: 445, showups: 401 },
  { day: 'Sat', bookings: 298, showups: 251 },
  { day: 'Sun', bookings: 187, showups: 162 },
]

/** Category revenue distribution data for the donut/pie chart */
export const categoryRevenueData = [
  { name: 'Healthcare', value: 38, color: '#4F46E5' },
  { name: 'Restaurant', value: 24, color: '#818CF8' },
  { name: 'Real Estate', value: 19, color: '#D4AF37' },
  { name: 'Beauty', value: 12, color: '#6EE7B7' },
  { name: 'Education', value: 7, color: '#94A3B8' },
]

/** Active and historical platform alert records */
export const clinicAlerts = [
  { id: 'alert001', businessId: 'biz006', businessName: 'Urban Realty', type: 'LOW_CONFIRMATION_RATE', confirmationRate: 83.1, platformAverage: 91.2, severity: 'Critical', status: 'OPEN', assignedTo: null, notes: '', createdAt: '2024-04-12', spotCheckPatients: [{ name: 'Suresh T.', phone: '+919800001117', bookingDate: '2024-04-10' }] },
  { id: 'alert002', businessId: 'biz005', businessName: 'La Bella Dining', type: 'PAYMENT_OVERDUE', confirmationRate: null, platformAverage: null, severity: 'Critical', status: 'OPEN', assignedTo: null, notes: '', createdAt: '2024-04-11', spotCheckPatients: [] },
  { id: 'alert003', businessId: 'biz006', businessName: 'Urban Realty', type: 'TRIAL_EXPIRING', confirmationRate: null, platformAverage: null, severity: 'High', status: 'IN_REVIEW', assignedTo: 'Rahul K.', notes: 'Called owner, interested in growth plan', createdAt: '2024-04-10', spotCheckPatients: [] },
  { id: 'alert004', businessId: 'biz004', businessName: 'Spice Route', type: 'LOW_CONFIRMATION_RATE', confirmationRate: 85.2, platformAverage: 91.2, severity: 'Medium', status: 'OPEN', assignedTo: null, notes: '', createdAt: '2024-04-09', spotCheckPatients: [] },
  { id: 'alert005', businessId: 'biz001', businessName: 'Sunshine Dental', type: 'SUSPICIOUS_ACTIVITY', confirmationRate: null, platformAverage: null, severity: 'High', status: 'RESOLVED', assignedTo: 'Priya S.', notes: 'False positive — spike due to holiday season', createdAt: '2024-04-08', spotCheckPatients: [] },
  { id: 'alert006', businessId: 'biz007', businessName: 'PrimeSpace Realty', type: 'PAYMENT_OVERDUE', confirmationRate: null, platformAverage: null, severity: 'Critical', status: 'OPEN', assignedTo: null, notes: '', createdAt: '2024-04-07', spotCheckPatients: [] },
  { id: 'alert007', businessId: 'biz010', businessName: 'City Tutors', type: 'LOW_CONFIRMATION_RATE', confirmationRate: 71.4, platformAverage: 91.2, severity: 'Critical', status: 'OPEN', assignedTo: null, notes: '', createdAt: '2024-04-06', spotCheckPatients: [] },
]

/** Invoice records for all businesses covering a billing month */
export const invoices = [
  { id: 'inv001', businessId: 'biz001', businessName: 'Sunshine Dental', category: 'Healthcare', month: '2024-03', baseFee: 3000, bookingCommissions: 4870, showupCommissions: 2380, leadCommissions: 600, adjustments: 0, total: 10850, status: 'PAID', dueDate: '2024-04-01', paidAt: '2024-04-03', razorpayPaymentId: 'pay_xyz123', pdfUrl: '#' },
  { id: 'inv002', businessId: 'biz002', businessName: 'MedCare Clinic', category: 'Healthcare', month: '2024-03', baseFee: 2000, bookingCommissions: 3120, showupCommissions: 1620, leadCommissions: 400, adjustments: 200, total: 7340, status: 'PAID', dueDate: '2024-04-01', paidAt: '2024-04-04', razorpayPaymentId: 'pay_xyz124', pdfUrl: '#' },
  { id: 'inv003', businessId: 'biz003', businessName: 'CityMed Hospital', category: 'Healthcare', month: '2024-03', baseFee: 3000, bookingCommissions: 6780, showupCommissions: 4080, leadCommissions: 1200, adjustments: -500, total: 14560, status: 'PAID', dueDate: '2024-04-01', paidAt: '2024-04-02', razorpayPaymentId: 'pay_xyz125', pdfUrl: '#' },
  { id: 'inv004', businessId: 'biz004', businessName: 'Spice Route', category: 'Restaurant', month: '2024-03', baseFee: 1500, bookingCommissions: 2340, showupCommissions: 1350, leadCommissions: 0, adjustments: 0, total: 5190, status: 'PENDING', dueDate: '2024-04-10', paidAt: null, razorpayPaymentId: null, pdfUrl: '#' },
  { id: 'inv005', businessId: 'biz005', businessName: 'La Bella Dining', category: 'Restaurant', month: '2024-03', baseFee: 1500, bookingCommissions: 1890, showupCommissions: 850, leadCommissions: 0, adjustments: 0, total: 4240, status: 'OVERDUE', dueDate: '2024-04-01', paidAt: null, razorpayPaymentId: null, pdfUrl: '#' },
  { id: 'inv006', businessId: 'biz006', businessName: 'Urban Realty', category: 'Real Estate', month: '2024-03', baseFee: 1500, bookingCommissions: 1560, showupCommissions: 700, leadCommissions: 600, adjustments: 0, total: 4360, status: 'PENDING', dueDate: '2024-04-15', paidAt: null, razorpayPaymentId: null, pdfUrl: '#' },
  { id: 'inv007', businessId: 'biz007', businessName: 'PrimeSpace Realty', category: 'Real Estate', month: '2024-03', baseFee: 1500, bookingCommissions: 980, showupCommissions: 440, leadCommissions: 400, adjustments: 0, total: 3320, status: 'OVERDUE', dueDate: '2024-04-01', paidAt: null, razorpayPaymentId: null, pdfUrl: '#' },
  { id: 'inv008', businessId: 'biz008', businessName: 'Glow Beauty Studio', category: 'Beauty', month: '2024-03', baseFee: 2000, bookingCommissions: 2340, showupCommissions: 1560, leadCommissions: 0, adjustments: 100, total: 6000, status: 'PAID', dueDate: '2024-04-01', paidAt: '2024-04-02', razorpayPaymentId: 'pay_xyz126', pdfUrl: '#' },
  { id: 'inv009', businessId: 'biz009', businessName: 'Wellness Hub', category: 'Beauty', month: '2024-03', baseFee: 3000, bookingCommissions: 3210, showupCommissions: 2170, leadCommissions: 0, adjustments: 0, total: 8380, status: 'PAID', dueDate: '2024-04-01', paidAt: '2024-04-05', razorpayPaymentId: 'pay_xyz127', pdfUrl: '#' },
]

/** Commission records linked to bookings, show-ups, leads, and manual adjustments */
export const commissions = [
  { id: 'com001', businessId: 'biz001', businessName: 'Sunshine Dental', category: 'Healthcare', bookingId: 'book001', type: 'SHOWUP', amount: 250, status: 'CONFIRMED', triggeredBy: 'OTP', signalScore: 145, invoiceId: 'inv001', createdAt: '2024-04-12' },
  { id: 'com002', businessId: 'biz001', businessName: 'Sunshine Dental', category: 'Healthcare', bookingId: 'book002', type: 'BOOKING', amount: 150, status: 'CONFIRMED', triggeredBy: 'BOT', signalScore: 90, invoiceId: 'inv001', createdAt: '2024-04-12' },
  { id: 'com003', businessId: 'biz002', businessName: 'MedCare Clinic', category: 'Healthcare', bookingId: 'book003', type: 'BOOKING', amount: 150, status: 'PENDING', triggeredBy: 'BOT', signalScore: 72, invoiceId: null, createdAt: '2024-04-13' },
  { id: 'com004', businessId: 'biz003', businessName: 'CityMed Hospital', category: 'Healthcare', bookingId: 'book004', type: 'SHOWUP', amount: 250, status: 'CONFIRMED', triggeredBy: 'GPS', signalScore: 162, invoiceId: 'inv003', createdAt: '2024-04-11' },
  { id: 'com005', businessId: 'biz004', businessName: 'Spice Route', category: 'Restaurant', bookingId: 'book005', type: 'SHOWUP', amount: 200, status: 'CONFIRMED', triggeredBy: 'OTP', signalScore: 130, invoiceId: 'inv004', createdAt: '2024-04-12' },
  { id: 'com006', businessId: 'biz005', businessName: 'La Bella Dining', category: 'Restaurant', bookingId: 'book006', type: 'BOOKING', amount: 150, status: 'DISPUTED', triggeredBy: 'BOT', signalScore: 58, invoiceId: null, createdAt: '2024-04-12' },
  { id: 'com007', businessId: 'biz006', businessName: 'Urban Realty', category: 'Real Estate', bookingId: 'book007', type: 'SHOWUP', amount: 250, status: 'PENDING', triggeredBy: 'REPLY', signalScore: 88, invoiceId: null, createdAt: '2024-04-10' },
  { id: 'com008', businessId: 'biz008', businessName: 'Glow Beauty Studio', category: 'Beauty', bookingId: 'book008', type: 'SHOWUP', amount: 200, status: 'CONFIRMED', triggeredBy: 'OTP', signalScore: 155, invoiceId: 'inv008', createdAt: '2024-04-12' },
  { id: 'com009', businessId: 'biz009', businessName: 'Wellness Hub', category: 'Beauty', bookingId: 'book009', type: 'BOOKING', amount: 150, status: 'PENDING', triggeredBy: 'BOT', signalScore: 68, invoiceId: null, createdAt: '2024-04-13' },
  { id: 'com010', businessId: 'biz001', businessName: 'Sunshine Dental', category: 'Healthcare', leadId: 'lead001', type: 'LEAD', amount: 600, status: 'CONFIRMED', triggeredBy: 'BOT', signalScore: 92, invoiceId: 'inv001', createdAt: '2024-04-09' },
  { id: 'com011', businessId: 'biz002', businessName: 'MedCare Clinic', category: 'Healthcare', bookingId: null, type: 'ADJUSTMENT', amount: 200, status: 'CONFIRMED', triggeredBy: 'MANUAL', signalScore: null, invoiceId: 'inv002', createdAt: '2024-04-05' },
]

/** Platform service category definitions with commission rates, lead questions, and performance data */
export const categories = [
  { id: 'healthcare', label: 'Healthcare', icon: '🏥', phase: 1, isActive: true, subCategories: [{ id: 'dental', label: 'Dental Clinic' }, { id: 'general', label: 'General Clinic' }, { id: 'hospital', label: 'Hospital' }, { id: 'diagnostic', label: 'Diagnostic Center' }], commissionRates: { booking: 150, showup: 250, lead: { hot: 600, warm: 400, mild: 200 } }, leadQuestions: ['How long have you had this issue?', 'How severe is the pain (1-10)?', 'Is this your first visit?', 'Preferred appointment time?', 'Budget range?'], defaultServices: ['Consultation', 'Dental Cleaning', 'X-Ray', 'Blood Test'], businesses: 3, performance: 91, revenue: 218000 },
  { id: 'restaurant', label: 'Restaurant', icon: '🍽️', phase: 1, isActive: true, subCategories: [{ id: 'finedining', label: 'Fine Dining' }, { id: 'casual', label: 'Casual' }, { id: 'cafe', label: 'Cafe' }, { id: 'fastfood', label: 'Fast Food' }], commissionRates: { booking: 120, showup: 200, lead: { hot: 400, warm: 250, mild: 100 } }, leadQuestions: ['Party size?', 'Occasion?', 'Dietary requirements?', 'Budget per head?', 'Indoor or outdoor?'], defaultServices: ['Table Booking', 'Private Dining', 'Takeaway'], businesses: 2, performance: 84, revenue: 96000 },
  { id: 'realestate', label: 'Real Estate', icon: '🏢', phase: 1, isActive: true, subCategories: [{ id: 'residential', label: 'Residential' }, { id: 'commercial', label: 'Commercial' }, { id: 'rental', label: 'Rental' }, { id: 'plot', label: 'Plot' }], commissionRates: { booking: 200, showup: 300, lead: { hot: 800, warm: 500, mild: 250 } }, leadQuestions: ['Property type?', 'Budget range?', 'Preferred locality?', 'Ready to move or under construction?', 'Purpose (own use/investment)?'], defaultServices: ['Site Visit', 'Consultation', 'Virtual Tour'], businesses: 2, performance: 73, revenue: 72000 },
  { id: 'beauty', label: 'Beauty & Wellness', icon: '💅', phase: 1, isActive: true, subCategories: [{ id: 'salon', label: 'Salon' }, { id: 'spa', label: 'Spa' }, { id: 'gym', label: 'Gym' }, { id: 'yoga', label: 'Yoga' }], commissionRates: { booking: 120, showup: 200, lead: { hot: 400, warm: 250, mild: 100 } }, leadQuestions: ['Service needed?', 'Preferred stylist?', 'Time preference?', 'First visit?', 'Budget?'], defaultServices: ['Hair Cut', 'Hair Spa', 'Facial', 'Massage', 'Manicure'], businesses: 2, performance: 89, revenue: 94000 },
  { id: 'education', label: 'Education', icon: '🎓', phase: 2, isActive: false, subCategories: [{ id: 'coaching', label: 'Coaching' }, { id: 'tutoring', label: 'Tutoring' }, { id: 'workshop', label: 'Workshop' }], commissionRates: { booking: 100, showup: 150, lead: { hot: 300, warm: 200, mild: 100 } }, leadQuestions: ['Subject/course?', 'Student level?', 'Batch or 1-on-1?', 'Budget?', 'Start date?'], defaultServices: ['Demo Class', 'Consultation', 'Enrollment'], businesses: 1, performance: 62, revenue: 14000 },
]

/** Admin user profiles for the Settings page (seeded data — backend has no CRUD endpoint) */
export const adminUsers = [
  { id: 'admin001', name: 'Arjun Sharma', email: 'arjun@zyntell.ai', role: 'SUPER_ADMIN', permissions: ['manage_businesses', 'view_revenue', 'handle_alerts', 'manage_categories'], isActive: true, lastLoginAt: '2024-04-12T09:42' },
  { id: 'admin002', name: 'Priya Sinha', email: 'priya@zyntell.ai', role: 'ADMIN', permissions: ['manage_businesses', 'view_revenue', 'handle_alerts'], isActive: true, lastLoginAt: '2024-04-12T08:15' },
  { id: 'admin003', name: 'Rahul Kapoor', email: 'rahul@zyntell.ai', role: 'SUPPORT', permissions: ['handle_alerts', 'manage_businesses'], isActive: true, lastLoginAt: '2024-04-11T18:30' },
  { id: 'admin004', name: 'Amit Mehta', email: 'amit@zyntell.ai', role: 'SUPPORT', permissions: ['handle_alerts'], isActive: true, lastLoginAt: '2024-04-11T14:20' },
  { id: 'admin005', name: 'Nisha Patel', email: 'nisha@zyntell.ai', role: 'FINANCE', permissions: ['view_revenue'], isActive: true, lastLoginAt: '2024-04-10T11:55' },
  { id: 'admin006', name: 'Dev Kumar', email: 'dev@zyntell.ai', role: 'ADMIN', permissions: ['manage_businesses', 'view_revenue'], isActive: false, lastLoginAt: '2024-03-28T09:00' },
]

/** Active trial business records with conversation usage and days remaining */
export const trials = [
  { businessId: 'biz005', businessName: 'La Bella Dining', category: 'Restaurant', startDate: '2024-04-01', endDate: '2024-04-15', conversationCount: 34, conversationCap: 50, converted: false, daysLeft: 3 },
  { businessId: 'biz006', businessName: 'Urban Realty', category: 'Real Estate', startDate: '2024-04-05', endDate: '2024-04-19', conversationCount: 28, conversationCap: 50, converted: false, daysLeft: 7 },
  { businessId: 'biz010', businessName: 'City Tutors', category: 'Education', startDate: '2024-04-08', endDate: '2024-04-22', conversationCount: 12, conversationCap: 50, converted: false, daysLeft: 10 },
]

/** Businesses that have cancelled their subscription with churn reason and revenue impact */
export const cancelledBusinesses = [
  { id: 'canc001', name: 'QuickFit Gym', category: 'Beauty', city: 'Mumbai', cancelledAt: '2024-03-28', reason: 'Price too high', plan: 'starter', totalRevenueLost: 4200, contactEmail: 'quickfit@test.com' },
  { id: 'canc002', name: 'Bistro Bliss', category: 'Restaurant', city: 'Pune', cancelledAt: '2024-03-22', reason: 'Low ROI', plan: 'growth', totalRevenueLost: 8600, contactEmail: 'bistro@test.com' },
  { id: 'canc003', name: 'HomeFirst Realty', category: 'Real Estate', city: 'Bangalore', cancelledAt: '2024-04-02', reason: 'Switched to competitor', plan: 'starter', totalRevenueLost: 3100, contactEmail: 'homefirst@test.com' },
]

/** Businesses with abnormally low booking activity versus their expected minimum */
export const lowUsageBusinesses = [
  { businessId: 'biz010', businessName: 'City Tutors', category: 'Education', bookingsLast30: 8, expectedMin: 30, lastActive: '2024-04-10' },
  { businessId: 'biz005', businessName: 'La Bella Dining', category: 'Restaurant', bookingsLast30: 14, expectedMin: 40, lastActive: '2024-04-11' },
]

/** Geographic area-level aggregated performance metrics */
export const areaPerformance = [
  { area: 'Hyderabad', businesses: 4, bookings: 929, revenue: 186400, showUpRate: 88.2 },
  { area: 'Mumbai', businesses: 1, bookings: 312, revenue: 62400, showUpRate: 90.9 },
  { area: 'Bangalore', businesses: 1, bookings: 156, revenue: 31200, showUpRate: 83.1 },
  { area: 'Delhi', businesses: 1, bookings: 678, revenue: 135600, showUpRate: 89.1 },
  { area: 'Chennai', businesses: 1, bookings: 234, revenue: 46800, showUpRate: 94.1 },
  { area: 'Kolkata', businesses: 1, bookings: 321, revenue: 64200, showUpRate: 95.1 },
  { area: 'Pune', businesses: 1, bookings: 189, revenue: 37800, showUpRate: 83.1 },
]

/** Conversion funnel stages from signup through 3-month retention */
export const funnelData = [
  { stage: 'Signups', count: 284, pct: 100, color: '#4F46E5' },
  { stage: 'Trial Started', count: 231, pct: 81.3, color: '#6366F1' },
  { stage: 'First Booking', count: 178, pct: 62.7, color: '#818CF8' },
  { stage: 'Paid Plan', count: 124, pct: 43.7, color: '#D4AF37' },
  { stage: 'Retained 3mo', count: 89, pct: 31.3, color: '#E8C94A' },
]

/** Seed notifications displayed in the TopNav notification bell on initial render */
export const notifications = [
  { id: 1, type: 'alert', message: 'Urban Realty has 16.9% anomaly rate this week', time: '10m ago', read: false },
  { id: 2, type: 'payment', message: 'La Bella Dining invoice overdue by 7 days', time: '1h ago', read: false },
  { id: 3, type: 'booking', message: 'New booking spike: CityMed Hospital (+23%)', time: '2h ago', read: false },
  { id: 4, type: 'trial', message: 'PrimeSpace Realty trial expires in 3 days', time: '4h ago', read: true },
  { id: 5, type: 'system', message: 'Monthly invoices generated for 184 businesses', time: '1d ago', read: true },
]
