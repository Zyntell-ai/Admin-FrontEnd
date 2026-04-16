import { useState } from 'react'
import Layout from '../components/layout/Layout'
import { categories as initialCategories } from '../data/mockData'
import Modal from '../components/ui/Modal'
import {
  Plus, Edit2, ToggleLeft, ToggleRight, ChevronRight,
  Save, X, Trash2
} from 'lucide-react'
import clsx from 'clsx'

export default function Categories() {
  const [catList, setCatList] = useState(initialCategories)
  const [selected, setSelected] = useState(null)
  const [editModal, setEditModal] = useState(null)
  const [addSubcat, setAddSubcat] = useState('')
  const [editForm, setEditForm] = useState(null)

  const openEdit = (cat) => {
    setEditForm({ ...cat, commissionRates: { ...cat.commissionRates, lead: { ...cat.commissionRates.lead } } })
    setEditModal(cat.id)
  }

  const saveEdit = () => {
    setCatList(prev => prev.map(c => c.id === editModal ? { ...editForm } : c))
    setEditModal(null)
  }

  const toggleCat = (id) => setCatList(prev => prev.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c))

  const addSubcategory = (catId) => {
    if (!addSubcat.trim()) return
    setCatList(prev => prev.map(c => c.id === catId
      ? { ...c, subCategories: [...c.subCategories, { id: addSubcat.toLowerCase().replace(/\s+/g, '_'), label: addSubcat }] }
      : c))
    setAddSubcat('')
  }

  const removeSubcat = (catId, subcatId) => {
    setCatList(prev => prev.map(c => c.id === catId
      ? { ...c, subCategories: c.subCategories.filter(s => s.id !== subcatId) }
      : c))
  }

  const selectedCat = catList.find(c => c.id === selected)

  return (
    <Layout title="Categories">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title mb-0.5">Category Management</h1>
          <p className="text-sm text-slate-500">Configure AI chatbot categories, commissions, and lead flows</p>
        </div>
        <button className="btn-primary"><Plus size={14} /> Add Category</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Categories', value: catList.length },
          { label: 'Active', value: catList.filter(c => c.isActive).length },
          { label: 'Total Businesses', value: catList.reduce((a, c) => a + c.businesses, 0) },
          { label: 'Total Revenue', value: `₹${catList.reduce((a, c) => a + c.revenue, 0).toLocaleString()}`, gold: true },
        ].map(({ label, value, gold }) => (
          <div key={label} className={clsx('card p-4', gold && 'border-gold/15')}>
            <p className="stat-label mb-1">{label}</p>
            <p className={clsx('text-xl font-bold font-display', gold ? 'metric-gold' : 'text-white')}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-5">
        {/* List */}
        <div className="col-span-7 space-y-3">
          {catList.map(cat => (
            <div key={cat.id}
              className={clsx('card card-hover p-5 cursor-pointer transition-all', selected === cat.id && 'border-indigo-500/30 bg-indigo-500/5', !cat.isActive && 'opacity-60')}
              onClick={() => setSelected(cat.id === selected ? null : cat.id)}>
              <div className="flex items-start gap-4">
                <div className="text-2xl w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl flex-shrink-0">{cat.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-white">{cat.label}</h3>
                      <span className={clsx('badge text-[10px]', cat.isActive ? 'badge-green' : 'badge-gray')}>{cat.isActive ? 'Active' : 'Disabled'}</span>
                      <span className="badge badge-indigo text-[10px]">Phase {cat.phase}</span>
                    </div>
                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <button onClick={() => toggleCat(cat.id)}
                        className="flex items-center gap-1 btn-ghost text-xs px-2 py-1">
                        {cat.isActive ? <ToggleRight size={14} className="text-emerald-400" /> : <ToggleLeft size={14} className="text-slate-500" />}
                        {cat.isActive ? 'Enabled' : 'Disabled'}
                      </button>
                      <button onClick={() => openEdit(cat)} className="btn-ghost text-xs px-2 py-1"><Edit2 size={12} /> Edit</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-3 text-center">
                    {[
                      { label: 'Businesses', value: cat.businesses },
                      { label: 'Booking ₹', value: cat.commissionRates.booking },
                      { label: 'Showup ₹', value: cat.commissionRates.showup },
                      { label: 'Lead (Hot) ₹', value: cat.commissionRates.lead.hot },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-white/[0.03] rounded-lg py-2">
                        <p className="text-[9px] text-slate-500 uppercase tracking-wider">{label}</p>
                        <p className="text-sm font-bold text-white mt-0.5">{value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500">Performance:</span>
                    <div className="flex-1 bg-white/5 rounded-full h-1.5">
                      <div className={clsx('h-1.5 rounded-full', cat.performance >= 85 ? 'bg-emerald-500' : cat.performance >= 70 ? 'bg-indigo-500' : 'bg-amber-500')}
                        style={{ width: `${cat.performance}%` }} />
                    </div>
                    <span className={clsx('text-[10px] font-bold', cat.performance >= 85 ? 'text-emerald-400' : cat.performance >= 70 ? 'text-indigo-400' : 'text-amber-400')}>
                      {cat.performance}%
                    </span>
                  </div>
                </div>
                <ChevronRight size={14} className={clsx('text-slate-600 flex-shrink-0 transition-transform mt-1', selected === cat.id && 'rotate-90 text-indigo-400')} />
              </div>
            </div>
          ))}
        </div>

        {/* Detail Panel */}
        <div className="col-span-5">
          {selectedCat ? (
            <div className="card p-5 sticky top-6 space-y-4 animate-fade-in">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedCat.icon}</span>
                <div>
                  <h3 className="section-title">{selectedCat.label}</h3>
                  <p className="text-xs text-slate-500">{selectedCat.businesses} businesses · ₹{selectedCat.revenue.toLocaleString()} revenue</p>
                </div>
              </div>

              {/* Subcategories */}
              <div>
                <p className="stat-label mb-2">Subcategories</p>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {selectedCat.subCategories.map(sub => (
                    <span key={sub.id} className="badge badge-indigo text-[10px] flex items-center gap-1 pr-1">
                      {sub.label}
                      <button onClick={() => removeSubcat(selectedCat.id, sub.id)} className="hover:text-red-400 transition-colors">
                        <X size={9} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={addSubcat} onChange={e => setAddSubcat(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addSubcategory(selectedCat.id)}
                    placeholder="New subcategory..." className="input-field text-xs flex-1" />
                  <button onClick={() => addSubcategory(selectedCat.id)} className="btn-primary text-xs px-3"><Plus size={11} /></button>
                </div>
              </div>

              {/* Commission rates display */}
              <div>
                <p className="stat-label mb-2">Commission Rates</p>
                <div className="space-y-2">
                  {[
                    { label: 'Booking', value: `₹${selectedCat.commissionRates.booking}` },
                    { label: 'Show-up', value: `₹${selectedCat.commissionRates.showup}` },
                    { label: 'Lead (Hot)', value: `₹${selectedCat.commissionRates.lead.hot}` },
                    { label: 'Lead (Warm)', value: `₹${selectedCat.commissionRates.lead.warm}` },
                    { label: 'Lead (Mild)', value: `₹${selectedCat.commissionRates.lead.mild}` },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between px-3 py-2 bg-white/[0.03] rounded-lg border border-white/[0.05]">
                      <span className="text-xs text-slate-400">{label}</span>
                      <span className="text-sm font-bold text-indigo-400">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lead Questions */}
              <div>
                <p className="stat-label mb-2">Lead Questions ({selectedCat.leadQuestions.length})</p>
                <div className="space-y-1.5">
                  {selectedCat.leadQuestions.map((q, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-400 bg-white/[0.03] rounded px-3 py-2">
                      <span className="text-slate-600 font-mono flex-shrink-0">Q{i + 1}</span>
                      <span>{q}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={() => openEdit(selectedCat)} className="btn-primary w-full justify-center">
                <Edit2 size={13} /> Edit Category
              </button>
            </div>
          ) : (
            <div className="card p-10 flex flex-col items-center justify-center text-center h-64">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-3">
                <Edit2 size={20} className="text-indigo-400" />
              </div>
              <p className="text-sm font-semibold text-white mb-1">Select a Category</p>
              <p className="text-xs text-slate-500">Click a category to view and configure it</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <Modal open={!!editModal} onClose={() => setEditModal(null)} title={`Edit — ${editForm?.label}`} size="lg">
        {editForm && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Category Label</label>
                <input value={editForm.label} onChange={e => setEditForm(f => ({ ...f, label: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Icon (emoji)</label>
                <input value={editForm.icon} onChange={e => setEditForm(f => ({ ...f, icon: e.target.value }))} className="input-field" />
              </div>
            </div>

            <div>
              <p className="text-xs text-slate-400 mb-2 font-medium">Commission Rates (₹)</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Per Booking', path: 'booking' },
                  { label: 'Per Show-up', path: 'showup' },
                ].map(({ label, path }) => (
                  <div key={path}>
                    <label className="text-[10px] text-slate-500 mb-1 block">{label}</label>
                    <input type="number" value={editForm.commissionRates[path]}
                      onChange={e => setEditForm(f => ({ ...f, commissionRates: { ...f.commissionRates, [path]: parseInt(e.target.value) } }))}
                      className="input-field" />
                  </div>
                ))}
                {[
                  { label: 'Lead — Hot', path: 'hot' },
                  { label: 'Lead — Warm', path: 'warm' },
                  { label: 'Lead — Mild', path: 'mild' },
                ].map(({ label, path }) => (
                  <div key={path}>
                    <label className="text-[10px] text-slate-500 mb-1 block">{label}</label>
                    <input type="number" value={editForm.commissionRates.lead[path]}
                      onChange={e => setEditForm(f => ({ ...f, commissionRates: { ...f.commissionRates, lead: { ...f.commissionRates.lead, [path]: parseInt(e.target.value) } } }))}
                      className="input-field" />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-white/[0.03] rounded-lg border border-white/[0.05]">
              <div>
                <p className="text-sm font-medium text-white">Category Active</p>
                <p className="text-xs text-slate-500">Visible to businesses during registration</p>
              </div>
              <button onClick={() => setEditForm(f => ({ ...f, isActive: !f.isActive }))}
                className={clsx('w-10 h-6 rounded-full transition-all relative', editForm.isActive ? 'bg-indigo-600' : 'bg-white/10')}>
                <div className={clsx('absolute top-1 w-4 h-4 rounded-full bg-white transition-all', editForm.isActive ? 'right-1' : 'left-1')} />
              </button>
            </div>

            <div className="flex gap-3">
              <button onClick={saveEdit} className="btn-primary flex-1 justify-center gap-2 flex items-center"><Save size={13} /> Save Changes</button>
              <button onClick={() => setEditModal(null)} className="btn-ghost flex-1 justify-center">Cancel</button>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  )
}