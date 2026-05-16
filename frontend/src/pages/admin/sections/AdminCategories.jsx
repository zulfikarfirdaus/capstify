import { useState, useEffect } from 'react'
import { adminFetchCategories, adminSaveCategory, adminDeleteCategory, uploadImage } from '../../../api'

const EMPTY = { name: '', slug: '', description: '', image: '', sort_order: 0 }

function toSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [form,       setForm]       = useState(EMPTY)
  const [editId,     setEditId]     = useState(null)
  const [showForm,   setShowForm]   = useState(false)
  const [msg,        setMsg]        = useState({ text: '', type: 'success' })
  const [uploading,  setUploading]  = useState(false)

  const load = () => adminFetchCategories().then(setCategories).catch(() => {})

  useEffect(() => { load() }, [])

  const flash = (text, type = 'success') => {
    setMsg({ text, type })
    setTimeout(() => setMsg({ text: '', type: 'success' }), 3000)
  }

  const openEdit = (c) => {
    setForm({ name: c.name, slug: c.slug, description: c.description || '', image: c.image || '', sort_order: c.sort_order })
    setEditId(c.id); setShowForm(true)
  }

  const openNew = () => { setForm(EMPTY); setEditId(null); setShowForm(true) }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return
    setUploading(true)
    try {
      const url = await uploadImage(file)
      setForm(f => ({ ...f, image: url }))
    } catch { flash('Upload failed.', 'error') }
    finally { setUploading(false); e.target.value = '' }
  }

  const save = async () => {
    try {
      const payload = editId ? form : { ...form, slug: form.slug || toSlug(form.name) }
      await adminSaveCategory(payload, editId)
      flash('Saved.'); setShowForm(false); load()
    } catch { flash('Error saving.', 'error') }
  }

  const del = async (id) => {
    if (!confirm('Delete this category?')) return
    try {
      await adminDeleteCategory(id)
      load()
    } catch {
      flash('Cannot delete — category may have products.', 'error')
    }
  }

  const moveOrder = async (cat, dir) => {
    const sort_order = Math.max(0, (cat.sort_order || 0) + dir)
    await adminSaveCategory({ ...cat, sort_order }, cat.id).catch(() => {})
    load()
  }

  return (
    <div className="admin-section">
      <div className="admin-section__head">
        <h1>Categories</h1>
        <button className="btn-admin-add" onClick={openNew}>+ Add Category</button>
      </div>

      {msg.text && <div className={msg.type === 'error' ? 'form-error' : 'form-success'}>{msg.text}</div>}

      {showForm && (
        <div className="admin-form-panel">
          <h3>{editId ? 'Edit Category' : 'New Category'}</h3>
          <div className="admin-form-grid">
            <div className="form-group">
              <label>Name</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Slug</label>
              <input type="text" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder={toSlug(form.name)} />
            </div>
            <div className="form-group form-group--full">
              <label>Description</label>
              <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Category Image</label>
              <div className="upload-field">
                <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                <span className="upload-hint">{uploading ? 'Uploading...' : 'Used in the category banner and strip.'}</span>
                {form.image && <img src={form.image} alt="Preview" className="upload-preview" />}
              </div>
            </div>
            <div className="form-group">
              <label>Sort Order</label>
              <input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))} />
            </div>
          </div>
          <div className="admin-form-actions">
            <button className="btn-admin-primary" onClick={save}>Save</button>
            <button className="btn-admin-secondary" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <table className="admin-table">
        <thead>
          <tr><th>Image</th><th>Name</th><th>Slug</th><th>Order</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {categories.map(c => (
            <tr key={c.id}>
              <td>
                {c.image
                  ? <img src={c.image} className="admin-thumb" alt="" />
                  : <span className="admin-no-img">—</span>}
              </td>
              <td>{c.name}</td>
              <td style={{fontFamily:'monospace', fontSize:12}}>{c.slug}</td>
              <td>
                <div style={{display:'flex', gap:6, alignItems:'center'}}>
                  <button className="admin-btn-edit" onClick={() => moveOrder(c, -1)}>↑</button>
                  <span style={{fontSize:13}}>{c.sort_order}</span>
                  <button className="admin-btn-edit" onClick={() => moveOrder(c, 1)}>↓</button>
                </div>
              </td>
              <td>
                <button className="admin-btn-edit" onClick={() => openEdit(c)}>Edit</button>
                <button className="admin-btn-del"  onClick={() => del(c.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
