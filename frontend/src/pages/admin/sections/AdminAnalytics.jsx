import { useState, useEffect, useMemo } from 'react'
import { adminFetchAnalytics } from '../../../api'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
function fmtDate(str) {
  if (!str) return ''
  const [, m, d] = str.split('-')
  return `${parseInt(d)} ${MONTHS[parseInt(m) - 1]}`
}

const CHART_W = 600
const CHART_H = 160
const BAR_W   = 14
const COLORS  = { whatsapp: '#25D366', shopee: '#EE4D2D', tiktok: '#0C0C0C' }

function BarChart({ data, color, label }) {
  const max = Math.max(...data.map(d => d.count), 1)
  const barData = useMemo(() => {
    const n = data.length || 1
    const spacing = Math.max(BAR_W + 4, CHART_W / n)
    return data.map((d, i) => ({
      x: i * spacing + spacing / 2 - BAR_W / 2,
      y: CHART_H - Math.round((d.count / max) * CHART_H),
      h: Math.round((d.count / max) * CHART_H),
      date: fmtDate(d.date),
      count: d.count,
    }))
  }, [data, max])

  return (
    <div className="chart-wrap">
      <h3>{label}</h3>
      <svg viewBox={`0 0 ${CHART_W} ${CHART_H + 28}`} style={{width:'100%', height:'auto', display:'block'}}>
        <line x1="0" y1={CHART_H} x2={CHART_W} y2={CHART_H} stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
        {barData.map((b, i) => (
          <g key={i}>
            <rect x={b.x} y={b.y} width={BAR_W} height={b.h} fill={color} opacity="0.85" />
            <text x={b.x + BAR_W / 2} y={CHART_H + 16} textAnchor="middle" fontSize="9" fill="#8B7355" fontFamily="Staatliches, sans-serif" letterSpacing="0.5">
              {b.date}
            </text>
            {b.count > 0 && (
              <text x={b.x + BAR_W / 2} y={b.y - 4} textAnchor="middle" fontSize="9" fill={color} fontFamily="Staatliches, sans-serif">
                {b.count}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  )
}

export default function AdminAnalytics() {
  const [range,     setRange]     = useState('7d')
  const [analytics, setAnalytics] = useState(null)
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    setLoading(true)
    adminFetchAnalytics(range)
      .then(setAnalytics)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [range])

  const t = analytics?.totals || {}

  const clicksByType = useMemo(() => {
    if (!analytics?.clicks) return {}
    const grouped = { whatsapp: {}, shopee: {}, tiktok: {} }
    analytics.clicks.forEach(c => {
      if (!grouped[c.type]) return
      grouped[c.type][c.date] = (grouped[c.type][c.date] || 0) + parseInt(c.count)
    })
    const dates = analytics.visits.map(v => v.date)
    return Object.fromEntries(
      Object.entries(grouped).map(([type, byDate]) => [
        type,
        dates.map(d => ({ date: d, count: byDate[d] || 0 })),
      ])
    )
  }, [analytics])

  return (
    <div className="admin-section">
      <div className="admin-section__head">
        <h1>Analytics</h1>
      </div>

      <div className="analytics-tabs">
        {['7d', '30d', '90d'].map(r => (
          <button key={r} className={`analytics-tab${range === r ? ' active' : ''}`} onClick={() => setRange(r)}>
            {r === '7d' ? 'Last 7 Days' : r === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
          </button>
        ))}
      </div>

      <div className="admin-cards">
        <div className="admin-stat-card highlight">
          <div className="admin-stat-card__val">{t.visits ?? 0}</div>
          <div className="admin-stat-card__label">Total Visits</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-card__val">{t.whatsapp ?? 0}</div>
          <div className="admin-stat-card__label">WhatsApp Clicks</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-card__val">{t.shopee ?? 0}</div>
          <div className="admin-stat-card__label">Shopee Clicks</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-card__val">{t.tiktok ?? 0}</div>
          <div className="admin-stat-card__label">TikTok Clicks</div>
        </div>
      </div>

      {loading ? (
        <p style={{color:'var(--admin-mid)', fontFamily:'var(--font-display)', letterSpacing:'0.1em', textTransform:'uppercase', fontSize:13}}>Loading...</p>
      ) : analytics ? (
        <>
          <BarChart data={analytics.visits} color="#2C2012" label="Page Visits" />
          <div className="chart-wrap">
            <h3>CTA Clicks by Type</h3>
            <div style={{display:'flex', flexDirection:'column', gap:16}}>
              {Object.entries(clicksByType).map(([type, data]) => (
                <div key={type}>
                  <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:8}}>
                    <div className="chart-legend__dot" style={{background: COLORS[type]}} />
                    <span style={{fontFamily:'var(--font-display)', fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--admin-mid)'}}>
                      {type}
                    </span>
                  </div>
                  <svg viewBox={`0 0 ${CHART_W} ${CHART_H * 0.6 + 28}`} style={{width:'100%',height:'auto',display:'block'}}>
                    <line x1="0" y1={CHART_H * 0.6} x2={CHART_W} y2={CHART_H * 0.6} stroke="rgba(0,0,0,0.08)" strokeWidth="1"/>
                    {(() => {
                      const max2 = Math.max(...data.map(d => d.count), 1)
                      const n = data.length || 1
                      const spacing = Math.max(BAR_W + 4, CHART_W / n)
                      return data.map((d, i) => {
                        const h = Math.round((d.count / max2) * CHART_H * 0.6)
                        return (
                          <g key={i}>
                            <rect x={i * spacing + spacing/2 - BAR_W/2} y={CHART_H * 0.6 - h} width={BAR_W} height={h} fill={COLORS[type]} opacity="0.85" />
                            <text x={i * spacing + spacing/2} y={CHART_H * 0.6 + 16} textAnchor="middle" fontSize="9" fill="#8B7355" fontFamily="Staatliches,sans-serif" letterSpacing="0.5">
                              {fmtDate(d.date)}
                            </text>
                          </g>
                        )
                      })
                    })()}
                  </svg>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
