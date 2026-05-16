import { useState, useEffect } from 'react'
import { adminFetchSettings, adminSaveSettings, uploadImage } from '../../../api'

const FIELDS = [
  { key: 'hero_article_name', label: 'Article Name',    placeholder: 'The Season\'s Crown' },
  { key: 'hero_sub_copy',     label: 'Sub Copy',        placeholder: 'Headwear crafted...', multiline: true },
  { key: 'hero_button_label', label: 'Button Label',    placeholder: 'Explore Collection' },
  { key: 'whatsapp_number',   label: 'WhatsApp Number', placeholder: '6281234567890' },
  { key: 'instagram_url',     label: 'Instagram URL',   placeholder: 'https://instagram.com/...' },
  { key: 'shopee_store_url',  label: 'Shopee Store URL',placeholder: 'https://shopee.co.id/...' },
  { key: 'tiktok_url',        label: 'TikTok URL',      placeholder: 'https://tiktok.com/...' },
  { key: 'footer_tagline',    label: 'Footer Tagline',  placeholder: 'Crafted for the ones who lead.' },
]

export default function AdminHero() {
  const [settings,  setSettings]  = useState({})
  const [msg,       setMsg]       = useState({ text: '', type: 'success' })
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    adminFetchSettings().then(setSettings).catch(() => {})
  }, [])

  const flash = (text, type = 'success') => {
    setMsg({ text, type })
    setTimeout(() => setMsg({ text: '', type: 'success' }), 3000)
  }

  const save = async () => {
    try {
      await adminSaveSettings(settings)
      flash('Settings saved.')
    } catch {
      flash('Error saving.', 'error')
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadImage(file)
      setSettings(s => ({ ...s, hero_image: url }))
    } catch {
      flash('Image upload failed.', 'error')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="admin-section">
      <div className="admin-section__head">
        <h1>Hero & Settings</h1>
      </div>

      <div className="admin-form-panel">
        <h3>Hero Poster</h3>
        {msg.text && <div className={msg.type === 'error' ? 'form-error' : 'form-success'}>{msg.text}</div>}

        <div className="form-group" style={{ marginBottom: 24 }}>
          <label>Hero Image</label>
          <div className="upload-field">
            <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
            <span className="upload-hint">{uploading ? 'Uploading...' : 'Upload a full-screen poster image.'}</span>
            {settings.hero_image && (
              <img src={settings.hero_image} alt="Hero preview" className="upload-preview" style={{ width: 140, height: 88, objectFit: 'cover' }} />
            )}
          </div>
        </div>

        <div className="admin-form-grid">
          {FIELDS.map(f => (
            <div key={f.key} className={`form-group${f.multiline ? ' form-group--full' : ''}`}>
              <label>{f.label}</label>
              {f.multiline ? (
                <textarea
                  rows={3}
                  placeholder={f.placeholder}
                  value={settings[f.key] || ''}
                  onChange={e => setSettings(s => ({ ...s, [f.key]: e.target.value }))}
                />
              ) : (
                <input
                  type="text"
                  placeholder={f.placeholder}
                  value={settings[f.key] || ''}
                  onChange={e => setSettings(s => ({ ...s, [f.key]: e.target.value }))}
                />
              )}
            </div>
          ))}
        </div>

        <div className="admin-form-actions">
          <button className="btn-admin-primary" onClick={save}>Save Settings</button>
        </div>
      </div>
    </div>
  )
}
