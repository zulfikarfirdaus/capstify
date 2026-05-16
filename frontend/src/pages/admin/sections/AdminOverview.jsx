import { useState, useEffect } from 'react'
import { adminFetchProducts, adminFetchCategories, adminFetchAnalytics } from '../../../api'

export default function AdminOverview() {
  const [products,   setProducts]   = useState(0)
  const [categories, setCategories] = useState(0)
  const [analytics,  setAnalytics]  = useState({ totals: { visits: 0, whatsapp: 0, shopee: 0, tiktok: 0 } })

  useEffect(() => {
    adminFetchProducts().then(d => setProducts(d.length)).catch(() => {})
    adminFetchCategories().then(d => setCategories(d.length)).catch(() => {})
    adminFetchAnalytics('7d').then(setAnalytics).catch(() => {})
  }, [])

  const t = analytics.totals || {}

  return (
    <div className="admin-section">
      <div className="admin-section__head">
        <h1>Overview</h1>
      </div>
      <div className="admin-cards">
        <div className="admin-stat-card">
          <div className="admin-stat-card__val">{products}</div>
          <div className="admin-stat-card__label">Products</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-card__val">{categories}</div>
          <div className="admin-stat-card__label">Categories</div>
        </div>
        <div className="admin-stat-card highlight">
          <div className="admin-stat-card__val">{t.visits ?? 0}</div>
          <div className="admin-stat-card__label">Visits (7d)</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-card__val">{t.whatsapp ?? 0}</div>
          <div className="admin-stat-card__label">WA Clicks (7d)</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-card__val">{(t.shopee ?? 0) + (t.tiktok ?? 0)}</div>
          <div className="admin-stat-card__label">Shop Clicks (7d)</div>
        </div>
      </div>
    </div>
  )
}
