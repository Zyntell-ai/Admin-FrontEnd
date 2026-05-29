/**
 * @file        Categories.jsx
 * @module      Categories Admin
 * @project     Admin-FrontEnd
 * @layer       Page
 * @description Provides a master-detail interface for viewing, creating, editing, and toggling platform service categories with commission rates and sub-category support.
 *
 * @updated     2026-05-29
 * @version     1.0.0
 *
 * @dependencies
 *   - React (useState, useEffect, useCallback)
 *   - Layout: ../components/layout/Layout
 *   - Modal: ../components/ui/Modal
 *   - ToastContext: ../context/ToastContext
 *   - Admin API: getCategories, createCategory, updateCategory (../api/admin)
 *   - lucide-react: Plus, Edit2, ToggleLeft, ToggleRight, ChevronRight, Save, X, RefreshCw, AlertCircle, Loader2
 *   - clsx
 *
 * @sideEffects
 *   - Fetches all categories from admin API on mount
 *   - Creates or updates a category via admin API on form submit
 *   - Toggles a category's isActive flag via admin API
 *   - Displays success/error toasts on all mutation operations
 */

/*
 * ╔══════════════════════════════════════════╗
 * ║           SDLC LIFECYCLE STATUS          ║
 * ╠══════════════════════════════════════════╣
 * ║ Planning     : ✅ Complete               ║
 * ║ Design       : ✅ Complete               ║
 * ║ Development  : ✅ Complete               ║
 * ║ Testing      : ⚠️  Partial              ║
 * ║ Deployment   : ✅ Complete               ║
 * ║ Maintenance  : 🔄 Active                ║
 * ╚══════════════════════════════════════════╝
 */

// ─────────────────────────────────────────
// IMPORTS & DEPENDENCIES
// ─────────────────────────────────────────
import { useState, useEffect, useCallback } from 'react'
import Layout from '../components/layout/Layout'
import Modal from '../components/ui/Modal'
import { useToast } from '../context/ToastContext'
import { getCategories, createCategory, updateCategory } from '../api/admin'
import {
  Plus, Edit2, ToggleLeft, ToggleRight, ChevronRight,
  Save, X, RefreshCw, AlertCircle, Loader2
} from 'lucide-react'
import clsx from 'clsx'

// ─────────────────────────────────────────
// CONSTANTS & CONFIG
// ─────────────────────────────────────────
// (No module-level constants beyond component defaults — config is inlined in state initialisers)

// ─────────────────────────────────────────
// STATE & HOOKS
// ─────────────────────────────────────────
export default function Categories() {
  const { addToast } = useToast()

  // [STATE]: Category list and async loading flags
  const [catList, setCatList]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  // [STATE]: Master-detail selection and edit modal state
  const [selected, setSelected] = useState(null)
  const [editModal, setEditModal] = useState(null)
  const [editForm, setEditForm] = useState(null)
  const [saving, setSaving]     = useState(false)

  // [STATE]: Create modal state
  const [createModal, setCreateModal] = useState(false)
  const [newCat, setNewCat]     = useState({ id: '', name: '', description: '', icon: '' })
  const [creating, setCreating] = useState(false)

  // ─────────────────────────────────────────
  // CORE LOGIC / HANDLER FUNCTIONS
  // ─────────────────────────────────────────

  /**
   * @function    fetchData
   * @purpose     Loads all categories from the admin API and populates the list
   * @returns {Promise<void>}
   */
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // [API CALL]: Retrieve full category list with no filters
      const data = await getCategories()
      // [STATE]: Replace list with latest data from server
      setCatList(data.categories || [])
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to load categories'
      setError(msg)
      addToast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  /**
   * @function    openEdit
   * @purpose     Opens the edit modal pre-populated with the selected category's current values
   * @param  {Object} cat - Category object from catList
   * @returns {void}
   */
  const openEdit = (cat) => {
    // [STATE]: Clone category into editable form state to avoid mutating the list
    setEditForm({ ...cat })
    setEditModal(cat.id)
  }

  /**
   * @function    saveEdit
   * @purpose     Persists edits to the currently open category via admin API
   * @returns {Promise<void>}
   */
  const saveEdit = async () => {
    // [GUARD]: Do nothing if form state is absent
    if (!editForm) return
    setSaving(true)
    try {
      // [DATA TRANSFORM]: Strip read-only fields before sending update payload
      const { id, createdAt, ...updates } = editForm
      // [API CALL]: Send partial update for the category under edit
      await updateCategory(editModal, updates)
      addToast(`Category updated`, 'success')
      setEditModal(null)
      fetchData()
    } catch (err) {
      addToast(err.response?.data?.error || 'Update failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  /**
   * @function    toggleCat
   * @purpose     Flips the isActive flag of a category via admin API
   * @param  {Object} cat - Category object whose active state should be toggled
   * @returns {Promise<void>}
   */
  const toggleCat = async (cat) => {
    try {
      // [API CALL]: Patch only the isActive field to avoid overwriting other data
      await updateCategory(cat.id, { isActive: !cat.isActive })
      // [ADMIN ACTION]: Notify admin of the new activation state
      addToast(`Category ${cat.isActive ? 'deactivated' : 'activated'}`, 'success')
      fetchData()
    } catch (err) {
      addToast(err.response?.data?.error || 'Toggle failed', 'error')
    }
  }

  /**
   * @function    handleCreate
   * @purpose     Validates the new-category form and submits it to the admin API
   * @returns {Promise<void>}
   */
  const handleCreate = async () => {
    // [VALIDATION]: Both ID and Name are required fields; abort early if missing
    if (!newCat.id.trim() || !newCat.name.trim()) {
      addToast('ID and Name are required', 'error'); return
    }
    setCreating(true)
    try {
      // [API CALL]: Create category as inactive draft — admin must explicitly activate it
      // [BUSINESS RULE]: New categories always start inactive to prevent premature exposure
      await createCategory({ ...newCat, isActive: false })
      addToast(`Category "${newCat.name}" created`, 'success')
      setCreateModal(false)
      // [STATE]: Reset form back to blank defaults after successful creation
      setNewCat({ id: '', name: '', description: '', icon: '' })
      fetchData()
    } catch (err) {
      addToast(err.response?.data?.error || 'Create failed', 'error')
    } finally {
      setCreating(false)
    }
  }

  // [DATA TRANSFORM]: Derive the currently selected category object from the list
  const selectedCat = catList.find(c => c.id === selected)

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────
  return (
    <Layout title="Categories">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title mb-0.5">Category Management</h1>
          <p className="text-sm text-slate-500">
            {loading ? 'Loading...' : `${catList.length} categories · ${catList.filter(c => c.isActive).length} active`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchData} className="btn-ghost gap-1.5"><RefreshCw size={13} /> Refresh</button>
          <button onClick={() => setCreateModal(true)} className="btn-primary"><Plus size={14} /> New Category</button>
        </div>
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="grid grid-cols-12 gap-5">
          <div className="col-span-4 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="card p-4 animate-pulse h-16" />
            ))}
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="card p-12 text-center">
          <AlertCircle size={32} className="text-red-400 mx-auto mb-3" />
          <p className="text-sm text-white mb-1">Failed to load categories</p>
          <p className="text-xs text-slate-500 mb-4">{error}</p>
          <button onClick={fetchData} className="btn-primary mx-auto"><RefreshCw size={13} /> Retry</button>
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-12 gap-5">
          {/* Category List */}
          <div className="col-span-4 space-y-2">
            {catList.length === 0 && (
              <div className="card p-8 text-center text-slate-500 text-sm">No categories found</div>
            )}
            {catList.map(cat => (
              <div key={cat.id}
                onClick={() => setSelected(cat.id === selected ? null : cat.id)}
                className={clsx('card p-4 cursor-pointer transition-all group',
                  selected === cat.id ? 'border-indigo-500/40 bg-indigo-500/5' : 'card-hover')}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{cat.icon || '📁'}</span>
                    <div>
                      <h3 className={clsx('text-sm font-semibold transition-colors', selected === cat.id ? 'text-indigo-300' : 'text-white group-hover:text-indigo-300')}>
                        {cat.name || cat.id}
                      </h3>
                      <p className="text-[10px] text-slate-500 font-mono">{cat.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* [ADMIN ACTION]: Toggle category active state without opening the full edit form */}
                    <button onClick={e => { e.stopPropagation(); toggleCat(cat) }}
                      className="text-slate-400 hover:text-white transition-colors">
                      {cat.isActive ? <ToggleRight size={20} className="text-emerald-400" /> : <ToggleLeft size={20} />}
                    </button>
                    <button onClick={e => { e.stopPropagation(); openEdit(cat) }}
                      className="text-slate-500 hover:text-indigo-400 transition-colors">
                      <Edit2 size={13} />
                    </button>
                    <ChevronRight size={14} className={clsx('transition-transform text-slate-600', selected === cat.id && 'rotate-90')} />
                  </div>
                </div>
                {cat.description && (
                  <p className="text-xs text-slate-500 mt-2 truncate">{cat.description}</p>
                )}
              </div>
            ))}
          </div>

          {/* Category Detail */}
          <div className="col-span-8">
            {!selectedCat ? (
              <div className="card p-12 text-center h-full flex flex-col items-center justify-center">
                <div className="text-4xl mb-3">📁</div>
                <p className="text-sm font-semibold text-white mb-1">Select a category</p>
                <p className="text-xs text-slate-500">Click a category on the left to view its details</p>
              </div>
            ) : (
              <div className="card p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{selectedCat.icon || '📁'}</span>
                    <div>
                      <h2 className="text-lg font-bold text-white">{selectedCat.name || selectedCat.id}</h2>
                      <p className="text-xs text-slate-500 font-mono">{selectedCat.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={clsx('badge', selectedCat.isActive ? 'badge-green' : 'badge-gray')}>
                      {selectedCat.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <button onClick={() => openEdit(selectedCat)} className="btn-ghost gap-1.5">
                      <Edit2 size={12} /> Edit
                    </button>
                  </div>
                </div>

                {selectedCat.description && (
                  <p className="text-sm text-slate-400 mb-4">{selectedCat.description}</p>
                )}

                {/* Commission Rates */}
                {selectedCat.commissionRates && (
                  <div className="mb-4">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Commission Rates</h4>
                    <div className="grid grid-cols-3 gap-3">
                      {Object.entries(selectedCat.commissionRates).map(([key, val]) => (
                        <div key={key} className="bg-white/[0.03] rounded-xl p-3">
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{key}</p>
                          <p className="text-sm font-bold text-white">
                            {typeof val === 'object' ? JSON.stringify(val) : val}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sub-categories */}
                {selectedCat.subCategories?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Sub-categories</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedCat.subCategories.map(sub => (
                        <span key={sub.id || sub} className="badge badge-indigo text-xs">
                          {sub.label || sub}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Raw Fields (for any custom backend data) */}
                <div className="mt-4 pt-4 border-t border-white/[0.05]">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">All Fields</h4>
                  <div className="space-y-1.5">
                    {Object.entries(selectedCat).filter(([k]) => !['commissionRates', 'subCategories'].includes(k)).map(([key, val]) => (
                      <div key={key} className="flex items-center justify-between text-xs py-1 border-b border-white/[0.03]">
                        <span className="text-slate-500 font-mono">{key}</span>
                        <span className="text-slate-300">{typeof val === 'boolean' ? (val ? 'true' : 'false') : String(val ?? '—')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      <Modal isOpen={!!editModal} onClose={() => setEditModal(null)} title="Edit Category" size="md">
        {editForm && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Name</label>
                <input value={editForm.name || ''} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} className="input-field w-full text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Icon (emoji)</label>
                <input value={editForm.icon || ''} onChange={e => setEditForm(f => ({ ...f, icon: e.target.value }))} className="input-field w-full text-sm" placeholder="🏥" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Description</label>
              <textarea value={editForm.description || ''} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                rows={2} className="input-field w-full resize-none text-sm" />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" checked={editForm.isActive || false} onChange={e => setEditForm(f => ({ ...f, isActive: e.target.checked }))}
                className="rounded accent-indigo-500" id="isActiveCheck" />
              <label htmlFor="isActiveCheck" className="text-sm text-slate-300">Active</label>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={saveEdit} disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all">
                {saving ? <><Loader2 size={13} className="animate-spin" /> Saving...</> : <><Save size={13} /> Save Changes</>}
              </button>
              <button onClick={() => setEditModal(null)} className="btn-ghost flex-1 justify-center">Cancel</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Category Modal */}
      <Modal isOpen={createModal} onClose={() => setCreateModal(false)} title="Create New Category" size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Category ID * (e.g. healthcare)</label>
            {/* [VALIDATION]: ID is auto-normalised to lowercase with underscores replacing spaces */}
            <input value={newCat.id} onChange={e => setNewCat(v => ({ ...v, id: e.target.value.toLowerCase().replace(/\s+/g, '_') }))}
              placeholder="healthcare" className="input-field w-full text-sm font-mono" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Name *</label>
            <input value={newCat.name} onChange={e => setNewCat(v => ({ ...v, name: e.target.value }))}
              placeholder="Healthcare" className="input-field w-full text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Icon (emoji)</label>
            <input value={newCat.icon} onChange={e => setNewCat(v => ({ ...v, icon: e.target.value }))}
              placeholder="🏥" className="input-field w-full text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Description</label>
            <textarea value={newCat.description} onChange={e => setNewCat(v => ({ ...v, description: e.target.value }))}
              rows={2} className="input-field w-full resize-none text-sm" />
          </div>
          {/* [BUSINESS RULE]: New categories start as inactive draft; admin activates after review */}
          <p className="text-[11px] text-slate-500">New categories start as inactive (draft). Activate after review.</p>
          <div className="flex gap-3 pt-2">
            <button onClick={handleCreate} disabled={creating}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all">
              {creating ? <><Loader2 size={13} className="animate-spin" /> Creating...</> : <><Plus size={13} /> Create</>}
            </button>
            <button onClick={() => setCreateModal(false)} className="btn-ghost flex-1 justify-center">Cancel</button>
          </div>
        </div>
      </Modal>
    </Layout>
  )
}
