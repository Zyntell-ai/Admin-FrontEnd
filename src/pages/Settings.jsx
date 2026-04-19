import { useState } from 'react'
import Layout from '../components/layout/Layout'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { updatePlatformConfig } from '../api/admin'
import {
  Users, Shield, Settings2, Save, Loader2,
  Info, ChevronDown, ChevronUp
} from 'lucide-react'
import clsx from 'clsx'

const TABS = ['System Settings', 'Permissions Matrix']

const ALL_PERMISSIONS = [
  { key: 'manage_businesses', label: 'Manage Businesses', desc: 'View, edit, suspend businesses' },
  { key: 'view_revenue',      label: 'View Revenue',      desc: 'Access billing and financial data' },
  { key: 'handle_alerts',     label: 'Handle Alerts',     desc: 'Resolve, assign, dismiss alerts' },
  { key: 'manage_categories', label: 'Manage Categories', desc: 'Edit categories and commission rates' },
]

const permissionsMatrix = [
  { resource: 'Dashboard',        superAdmin: true,  admin: true,  support: true,  finance: false },
  { resource: 'Bookings',         superAdmin: true,  admin: true,  support: true,  finance: false },
  { resource: 'Analytics',        superAdmin: true,  admin: true,  support: false, finance: false },
  { resource: 'Billing',          superAdmin: true,  admin: true,  support: false, finance: true  },
  { resource: 'Commissions',      superAdmin: true,  admin: true,  support: false, finance: true  },
  { resource: 'Businesses',       superAdmin: true,  admin: true,  support: true,  finance: false },
  { resource: 'Categories',       superAdmin: true,  admin: true,  support: false, finance: false },
  { resource: 'Alerts',           superAdmin: true,  admin: true,  support: true,  finance: false },
  { resource: 'Settings',         superAdmin: true,  admin: false, support: false, finance: false },
  { resource: 'Export Data',      superAdmin: true,  admin: true,  support: false, finance: true  },
  { resource: 'Suspend Business', superAdmin: true,  admin: false, support: false, finance: false },
]

const systemSettingsDefs = [
  { key: 'trialDays',       label: 'Trial Period',                         defaultValue: 14,   type: 'number', unit: 'days' },
  { key: 'anomalyThreshold', label: 'Anomaly Alert Threshold',             defaultValue: 15,   type: 'number', unit: '%' },
  { key: 'lowUsageThreshold', label: 'Low Usage Threshold',                defaultValue: 5,    type: 'number', unit: 'bookings/week' },
  { key: 'signalMinScore',  label: 'Commission Auto-confirm Signal Score', defaultValue: 85,   type: 'number', unit: '/175' },
  { key: 'graceDays',       label: 'Overdue Invoice Grace Period',         defaultValue: 7,    type: 'number', unit: 'days' },
  { key: 'convCap',         label: 'Trial Conversation Cap',               defaultValue: 50,   type: 'number', unit: 'messages' },
  { key: 'autoInvoice',     label: 'Auto-generate Monthly Invoices',       defaultValue: true, type: 'toggle' },
]

export default function Settings() {
  const { admin } = useAuth()
  const { addToast } = useToast()
  const [activeTab, setActiveTab] = useState('System Settings')
  const [settings, setSettings] = useState(() => {
    const s = {}
    systemSettingsDefs.forEach(d => { s[d.key] = d.defaultValue })
    return s
  })
  const [saving, setSaving] = useState(false)

  const isSuperAdmin = admin?.role === 'SUPER_ADMIN'

  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      await updatePlatformConfig(settings)
      addToast('Platform settings saved', 'success')
    } catch (err) {
      addToast(err.response?.data?.error || 'Save failed — check permissions', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Layout title="Settings">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title mb-0.5">Settings</h1>
          <p className="text-sm text-slate-500">Platform configuration and role management</p>
        </div>
      </div>

      {/* Info Banner — Admin User Management */}
      <div className="card p-4 mb-6 border border-amber-500/20 bg-amber-500/5 flex items-start gap-3">
        <Info size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-300 mb-0.5">Admin User Management</p>
          <p className="text-xs text-amber-400/80">
            Admin user invite, list, and CRUD endpoints are not available in the current backend version.
            Use the seed script (<code className="font-mono">node createAdmin.js</code>) to create admin accounts directly.
          </p>
        </div>
      </div>

      {/* Current Admin Info */}
      <div className="card p-5 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield size={16} className="text-indigo-400" />
          <h3 className="text-sm font-semibold text-white">Logged-in Admin</h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Name', value: admin?.name },
            { label: 'Email', value: admin?.email },
            { label: 'Role', value: admin?.role },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{label}</p>
              <p className="text-sm text-white font-medium">{value || '—'}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-white/[0.05]">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Permissions</p>
          <div className="flex flex-wrap gap-2">
            {ALL_PERMISSIONS.map(p => {
              const hasIt = admin?.role === 'SUPER_ADMIN' || admin?.permissions?.includes(p.key)
              return (
                <span key={p.key} className={clsx('badge text-[10px]', hasIt ? 'badge-green' : 'bg-white/5 text-slate-500')}>
                  {p.label}
                </span>
              )
            })}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0 border-b border-white/[0.06] mb-5">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={clsx('px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px',
              activeTab === tab ? 'text-white border-indigo-500 bg-indigo-500/5' : 'text-slate-400 border-transparent hover:text-slate-200')}>
            {tab}
          </button>
        ))}
      </div>

      {/* System Settings Tab */}
      {activeTab === 'System Settings' && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-white">Platform Configuration</h3>
            {isSuperAdmin ? (
              <button onClick={handleSaveSettings} disabled={saving}
                className="flex items-center gap-1.5 text-xs btn-primary">
                {saving ? <><Loader2 size={12} className="animate-spin" /> Saving...</> : <><Save size={12} /> Save Changes</>}
              </button>
            ) : (
              <span className="text-xs text-slate-500">Super Admin only</span>
            )}
          </div>
          <div className="space-y-5">
            {systemSettingsDefs.map(setting => (
              <div key={setting.key} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                <div>
                  <p className="text-sm text-white">{setting.label}</p>
                  {setting.unit && <p className="text-[10px] text-slate-500 mt-0.5">Unit: {setting.unit}</p>}
                </div>
                {setting.type === 'toggle' ? (
                  <button onClick={() => setSettings(s => ({ ...s, [setting.key]: !s[setting.key] }))}
                    className={clsx('w-12 h-6 rounded-full transition-all relative flex-shrink-0', settings[setting.key] ? 'bg-indigo-600' : 'bg-white/10')}>
                    <div className={clsx('w-5 h-5 rounded-full bg-white shadow absolute top-0.5 transition-all', settings[setting.key] ? 'left-6' : 'left-0.5')} />
                  </button>
                ) : (
                  <input type="number" value={settings[setting.key]} onChange={e => setSettings(s => ({ ...s, [setting.key]: parseFloat(e.target.value) || 0 }))}
                    className="input-field w-24 text-sm text-right" disabled={!isSuperAdmin} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Permissions Matrix Tab */}
      {activeTab === 'Permissions Matrix' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Resource</th>
                  {['Super Admin', 'Admin', 'Support', 'Finance'].map(r => (
                    <th key={r} className="text-center px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{r}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {permissionsMatrix.map(row => (
                  <tr key={row.resource} className="border-b border-white/[0.04] table-row-hover">
                    <td className="px-4 py-3 text-white text-xs font-medium">{row.resource}</td>
                    {[row.superAdmin, row.admin, row.support, row.finance].map((has, i) => (
                      <td key={i} className="px-4 py-3 text-center">
                        {has
                          ? <span className="text-emerald-400 text-base">✓</span>
                          : <span className="text-slate-700 text-base">✗</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  )
}