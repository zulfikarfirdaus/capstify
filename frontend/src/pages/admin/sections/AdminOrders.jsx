import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import {
  adminFetchOrders,
  adminFetchOrderDetail,
  adminUpdateOrderStatus,
  adminFetchPaymentConfirmation,
} from '../../../api'

const STATUS_LABELS = {
  pending:          { label: 'Menunggu Bayar',  color: '#b7950b' },
  payment_uploaded: { label: 'Bukti Dikirim',   color: '#1a5276' },
  verified:         { label: 'Terverifikasi',   color: '#1e8449' },
  shipped:          { label: 'Dikirim',         color: '#6c3483' },
  cancelled:        { label: 'Dibatalkan',      color: '#922b21' },
}

const STATUS_TRANSITIONS = {
  pending:          ['cancelled'],
  payment_uploaded: ['verified', 'cancelled'],
  verified:         ['shipped', 'cancelled'],
  shipped:          [],
  cancelled:        [],
}

function formatPrice(n) {
  return 'Rp ' + Number(n).toLocaleString('id-ID')
}

function formatDate(iso) {
  return new Date(iso).toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function StatusBadge({ status }) {
  const meta = STATUS_LABELS[status] || { label: status, color: '#666' }
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: '4px',
      fontSize: '12px',
      fontFamily: 'var(--font-display)',
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      background: meta.color + '18',
      color: meta.color,
      border: `1px solid ${meta.color}40`,
    }}>
      {meta.label}
    </span>
  )
}

function OrderRow({ order, onRefresh }) {
  const [open,    setOpen]    = useState(false)
  const [detail,  setDetail]  = useState(null)
  const [proof,   setProof]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)

  const toggleOpen = async () => {
    if (!open && !detail) {
      setLoading(true)
      const [d, p] = await Promise.all([
        adminFetchOrderDetail(order.order_id),
        adminFetchPaymentConfirmation(order.order_id),
      ])
      setDetail(d)
      setProof(p)
      setLoading(false)
    }
    setOpen(v => !v)
  }

  const handleStatus = async (newStatus) => {
    if (!window.confirm(`Ubah status ke "${STATUS_LABELS[newStatus]?.label}"?`)) return
    setUpdating(true)
    await adminUpdateOrderStatus(order.order_id, newStatus)
    setUpdating(false)
    onRefresh()
  }

  const transitions = STATUS_TRANSITIONS[order.status] || []

  return (
    <div className="ao-row">
      <button className="ao-row__header" onClick={toggleOpen}>
        <span className="ao-row__id">{order.order_id}</span>
        <span className="ao-row__name">{order.customer_name}</span>
        <span className="ao-row__method">
          {order.payment_method === 'qris' ? 'QRIS' : 'Bank Transfer'}
        </span>
        <span className="ao-row__amount">{formatPrice(order.total_amount)}</span>
        <StatusBadge status={order.status} />
        <span className="ao-row__date">{formatDate(order.created_at)}</span>
        <span className="ao-row__chevron">
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      {open && (
        <div className="ao-detail">
          {loading ? (
            <p className="ao-detail__loading">Memuat...</p>
          ) : detail ? (
            <>
              <div className="ao-detail__grid">
                <div className="ao-detail__col">
                  <h4 className="ao-detail__col-title">Info Pembeli</h4>
                  <p><strong>Email:</strong> {detail.customer_email}</p>
                  <p><strong>HP:</strong> {detail.customer_phone}</p>
                  <p><strong>Alamat:</strong> {detail.customer_address}</p>
                </div>

                <div className="ao-detail__col">
                  <h4 className="ao-detail__col-title">Item Pesanan</h4>
                  <ul className="ao-detail__items">
                    {detail.items?.map(item => (
                      <li key={item.id}>
                        {item.product_name} ×{item.quantity}
                        <span> — {formatPrice(item.subtotal)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {proof && (
                  <div className="ao-detail__col">
                    <h4 className="ao-detail__col-title">Bukti Pembayaran</h4>
                    <p><strong>Pengirim:</strong> {proof.sender_name}</p>
                    <p><strong>Jumlah:</strong> {formatPrice(proof.amount_sent)}</p>
                    <a
                      href={proof.proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ao-proof-link"
                    >
                      <ExternalLink size={14} /> Lihat Bukti
                    </a>
                    {proof.proof_url && (
                      <img
                        src={proof.proof_url}
                        alt="Bukti pembayaran"
                        className="ao-proof-img"
                      />
                    )}
                  </div>
                )}
              </div>

              {transitions.length > 0 && (
                <div className="ao-detail__actions">
                  {transitions.map(s => (
                    <button
                      key={s}
                      className={`ao-action-btn ao-action-btn--${s}`}
                      onClick={() => handleStatus(s)}
                      disabled={updating}
                    >
                      {updating ? '...' : STATUS_LABELS[s]?.label}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="ao-detail__loading">Gagal memuat detail.</p>
          )}
        </div>
      )}
    </div>
  )
}

export default function AdminOrders() {
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState('all')

  const load = () => {
    setLoading(true)
    adminFetchOrders()
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const filtered = filter === 'all'
    ? orders
    : orders.filter(o => o.status === filter)

  return (
    <div className="admin-orders">
      <div className="ao-header">
        <h2 className="ao-header__title">Orders</h2>
        <div className="ao-filters">
          {['all', 'pending', 'payment_uploaded', 'verified', 'shipped', 'cancelled'].map(f => (
            <button
              key={f}
              className={`ao-filter-btn${filter === f ? ' active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'Semua' : STATUS_LABELS[f]?.label || f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="ao-loading">Memuat pesanan...</p>
      ) : filtered.length === 0 ? (
        <p className="ao-empty">Tidak ada pesanan.</p>
      ) : (
        <div className="ao-list">
          <div className="ao-list__head">
            <span>ID</span>
            <span>Nama</span>
            <span>Metode</span>
            <span>Total</span>
            <span>Status</span>
            <span>Tanggal</span>
            <span />
          </div>
          {filtered.map(o => (
            <OrderRow key={o.id} order={o} onRefresh={load} />
          ))}
        </div>
      )}
    </div>
  )
}
