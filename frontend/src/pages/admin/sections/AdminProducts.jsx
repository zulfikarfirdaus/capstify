import { useState, useEffect } from 'react'
import {
  adminFetchProducts, adminFetchCategories,
  adminSaveProduct, adminDeleteProduct, uploadImage,
} from '../../../api'

const EMPTY = {
  name: '', slug: '', category_id: '', description: '',
  images: [], price: '', whatsapp_message: '',
  shopee_url: '', tiktok_url: '',
  featured: false, is_new_arrival: false, sort_order: 0,
  details: { specs: [], features: [] },
}

function toSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export default function AdminProducts() {
  const [products,   setProducts]   = useState([])
  const [categories, setCategories] = useState([])
  const [form,       setForm]       = useState(EMPTY)
  const [editId,     setEditId]     = useState(null)
  const [showForm,   setShowForm]   = useState(false)
  const [msg,        setMsg]        = useState('')
  const [uploading,  setUploading]  = useState(false)

  const load = () => {
    adminFetchProducts().then(setProducts).catch(() => {})
    adminFetchCategories().then(setCategories).catch(() => {})
  }

  useEffect(() => { load() }, [])

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000) }

  const openNew = () => { setForm(EMPTY); setEditId(null); setShowForm(true) }

  const openEdit = (p) => {
    setForm({
      name: p.name, slug: p.slug, category_id: p.category_id,
      description: p.description || '',
      images: Array.isArray(p.images) ? p.images : [],
      price: p.price || '',
      whatsapp_message: p.whatsapp_message || '',
      shopee_url: p.shopee_url || '', tiktok_url: p.tiktok_url || '',
      featured: !!p.featured, is_new_arrival: !!p.is_new_arrival,
      sort_order: p.sort_order,
      details: p.details || { specs: [], features: [] },
    })
    setEditId(p.id)
    setShowForm(true)
  }

  const handleNameChange = (e) => {
    const name = e.target.value
    setForm(f => ({ ...f, name, slug: f.slug || toSlug(name) }))
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    try {
      const urls = await Promise.all(files.map(uploadImage))
      setForm(f => ({ ...f, images: [...f.images, ...urls] }))
    } catch {
      flash('Image upload failed.')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const removeImage = (idx) => {
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }))
  }

  const save = async () => {
    try {
      await adminSaveProduct(form, editId)
      flash(editId ? 'Product updated.' : 'Product created.')
      setShowForm(false)
      load()
    } catch {
      flash('Error saving product.')
    }
  }

  const del = async (id) => {
    if (!confirm('Delete this product?')) return
    await adminDeleteProduct(id).catch(() => {})
    load()
  }

  return (
    <div className="admin-section">
      <div className="admin-section__head">
        <h1>Products</h1>
        <button className="btn-admin-add" onClick={openNew}>+ Add Product</button>
      </div>

      {msg && <div className="form-success">{msg}</div>}

      {showForm && (
        <div className="admin-form-panel">
          <h3>{editId ? 'Edit Product' : 'New Product'}</h3>
          <div className="admin-form-grid">
            <div className="form-group">
              <label>Product Name</label>
              <input type="text" value={form.name} onChange={handleNameChange} />
            </div>
            <div className="form-group">
              <label>Slug</label>
              <input type="text" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}>
                <option value="">— Select category —</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Price (IDR, blank = hidden)</label>
              <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="250000" />
            </div>
            <div className="form-group form-group--full">
              <label>Description</label>
              <textarea rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="form-group form-group--full">
              <label>Product Images (up to 5)</label>
              <div className="upload-field">
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} disabled={uploading || form.images.length >= 5} />
                <span className="upload-hint">{uploading ? 'Uploading...' : `${form.images.length}/5 images`}</span>
                <div className="images-grid">
                  {form.images.map((url, i) => (
                    <div key={i} className="image-thumb-wrap">
                      <img src={url} alt={`img ${i+1}`} className="image-thumb" />
                      <button className="image-thumb-remove" onClick={() => removeImage(i)}>×</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="form-group form-group--full">
              <label>WhatsApp Message</label>
              <textarea rows={3} value={form.whatsapp_message} onChange={e => setForm(f => ({ ...f, whatsapp_message: e.target.value }))} placeholder="Hi! I'm interested in this cap..." />
            </div>
            <div className="form-group form-group--full">
              <label>Product Specs</label>
              {form.details.specs.map((spec, i) => (
                <div key={i} style={{display:'flex', gap:8, marginBottom:8, alignItems:'center'}}>
                  <input
                    type="text" placeholder="Label (e.g. Material)" value={spec.label}
                    style={{flex:'0 0 180px'}}
                    onChange={e => {
                      const specs = [...form.details.specs]
                      specs[i] = { ...specs[i], label: e.target.value }
                      setForm(f => ({ ...f, details: { ...f.details, specs } }))
                    }}
                  />
                  <input
                    type="text" placeholder="Value" value={spec.value} style={{flex:1}}
                    onChange={e => {
                      const specs = [...form.details.specs]
                      specs[i] = { ...specs[i], value: e.target.value }
                      setForm(f => ({ ...f, details: { ...f.details, specs } }))
                    }}
                  />
                  <button className="admin-btn-del" onClick={() => {
                    const specs = form.details.specs.filter((_, idx) => idx !== i)
                    setForm(f => ({ ...f, details: { ...f.details, specs } }))
                  }}>×</button>
                </div>
              ))}
              <button className="btn-admin-secondary" style={{marginTop:4}} onClick={() =>
                setForm(f => ({ ...f, details: { ...f.details, specs: [...f.details.specs, { label: '', value: '' }] } }))
              }>+ Add Spec</button>
            </div>
            <div className="form-group form-group--full">
              <label>Product Features</label>
              {form.details.features.map((feat, i) => (
                <div key={i} style={{display:'flex', gap:8, marginBottom:8, alignItems:'center'}}>
                  <input
                    type="text" placeholder="e.g. Breathable mesh back" value={feat} style={{flex:1}}
                    onChange={e => {
                      const features = [...form.details.features]
                      features[i] = e.target.value
                      setForm(f => ({ ...f, details: { ...f.details, features } }))
                    }}
                  />
                  <button className="admin-btn-del" onClick={() => {
                    const features = form.details.features.filter((_, idx) => idx !== i)
                    setForm(f => ({ ...f, details: { ...f.details, features } }))
                  }}>×</button>
                </div>
              ))}
              <button className="btn-admin-secondary" style={{marginTop:4}} onClick={() =>
                setForm(f => ({ ...f, details: { ...f.details, features: [...f.details.features, ''] } }))
              }>+ Add Feature</button>
            </div>
            <div className="form-group">
              <label>Shopee URL</label>
              <input type="url" value={form.shopee_url} onChange={e => setForm(f => ({ ...f, shopee_url: e.target.value }))} placeholder="https://shopee.co.id/..." />
            </div>
            <div className="form-group">
              <label>TikTok Shop URL</label>
              <input type="url" value={form.tiktok_url} onChange={e => setForm(f => ({ ...f, tiktok_url: e.target.value }))} placeholder="https://tiktok.com/..." />
            </div>
            <div className="form-group">
              <label>Sort Order</label>
              <input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))} />
            </div>
            <div className="form-group">
              <label style={{marginBottom:12}}>Flags</label>
              <div className="admin-toggle">
                <input type="checkbox" id="featured" checked={!!form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} />
                <label htmlFor="featured">Featured</label>
              </div>
              <div className="admin-toggle" style={{marginTop:8}}>
                <input type="checkbox" id="newArrival" checked={!!form.is_new_arrival} onChange={e => setForm(f => ({ ...f, is_new_arrival: e.target.checked }))} />
                <label htmlFor="newArrival">New Arrival</label>
              </div>
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
          <tr>
            <th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Flags</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              <td>
                {p.images?.[0]
                  ? <img src={p.images[0]} className="admin-thumb" alt="" />
                  : <span className="admin-no-img">—</span>}
              </td>
              <td>{p.name}</td>
              <td>{p.category_name}</td>
              <td>{p.price ? `Rp ${Number(p.price).toLocaleString('id-ID')}` : '—'}</td>
              <td>{p.featured ? '★ ' : ''}{p.is_new_arrival ? 'New' : ''}</td>
              <td>
                <button className="admin-btn-edit" onClick={() => openEdit(p)}>Edit</button>
                <button className="admin-btn-del"  onClick={() => del(p.id)}>Delete</button>
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr><td colSpan={6} style={{textAlign:'center', padding:'32px', color:'var(--admin-mid)'}}>No products yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
