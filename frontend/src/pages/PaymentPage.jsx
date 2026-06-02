import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Clock, Copy, Check, ArrowRight, ArrowLeft } from 'lucide-react'
import { fetchOrder, fetchHero, adminUpdateOrderStatus } from '../api'
import './PaymentPage.css'

function formatPrice(n) {
  return 'Rp ' + Number(n).toLocaleString('id-ID')
}

function useCountdown(expiresAt) {
  const getRemaining = useCallback(() => {
    const diff = new Date(expiresAt) - Date.now()
    if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0, expired: true }
    const h = Math.floor(diff / 3600000)
    const m = Math.floor((diff % 3600000) / 60000)
    const s = Math.floor((diff % 60000) / 1000)
    return { hours: h, minutes: m, seconds: s, expired: false }
  }, [expiresAt])

  const [remaining, setRemaining] = useState(getRemaining)

  useEffect(() => {
    const t = setInterval(() => setRemaining(getRemaining()), 1000)
    return () => clearInterval(t)
  }, [getRemaining])

  return remaining
}

export default function PaymentPage() {
  const { orderId } = useParams()
  const navigate    = useNavigate()
  const [order,    setOrder]    = useState(null)
  const [settings, setSettings] = useState({})
  const [loading,  setLoading]  = useState(true)
  const [copied,    setCopied]    = useState(false)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    Promise.all([fetchOrder(orderId), fetchHero()])
      .then(([o, s]) => { setOrder(o); setSettings(s) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [orderId])

  const remaining = useCountdown(order?.payment_expires_at || new Date().toISOString())

  const handleCancel = async () => {
    if (!window.confirm('Cancel this order? This cannot be undone.')) return
    setCancelling(true)
    await adminUpdateOrderStatus(orderId, 'cancelled').catch(() => {})
    navigate('/')
  }

  const copyAccountNumber = () => {
    navigator.clipboard.writeText(settings.bank_account_number || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return <div className="payment-loading"><p>Loading...</p></div>
  }

  if (!order) {
    return (
      <div className="payment-not-found">
        <p>Order not found.</p>
        <Link to="/">Back to Home</Link>
      </div>
    )
  }

  const pad = n => String(n).padStart(2, '0')
  const isQris = order.payment_method === 'qris'
  const alreadyPaid = ['payment_uploaded', 'verified', 'shipped'].includes(order.status)

  return (
    <div className="payment-page">
      <div className="container payment-container">
        <Link to="/" className="payment-back">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        {/* Header */}
        <div className="payment-header">
          <span className="payment-header__eyebrow">Awaiting Payment</span>
          <h1 className="payment-header__order-id">{order.order_id}</h1>
          <p className="payment-header__name">{order.customer_name}</p>
        </div>

        {/* Countdown */}
        <div className={`payment-timer${remaining.expired ? ' expired' : ''}`}>
          <Clock size={16} />
          {remaining.expired
            ? <span>Payment window expired</span>
            : (
              <span>
                Complete payment within&nbsp;
                <strong>{pad(remaining.hours)}:{pad(remaining.minutes)}:{pad(remaining.seconds)}</strong>
              </span>
            )
          }
        </div>

        <div className="payment-body">
          {/* Payment detail */}
          <div className="payment-card">
            <h2 className="payment-card__title">
              {isQris ? 'Scan QRIS' : 'Bank Transfer Details'}
            </h2>

            {isQris ? (
              <div className="payment-qris">
                {settings.qris_image ? (
                  <img
                    src={settings.qris_image}
                    alt="QRIS Code"
                    className="payment-qris__img"
                  />
                ) : (
                  <div className="payment-qris__placeholder">
                    <p>QRIS not configured.</p>
                    <p>Upload via Admin → Settings → QRIS Image.</p>
                  </div>
                )}
                <p className="payment-qris__note">
                  Open your banking or e-wallet app, choose Scan QR,
                  then manually enter <strong>{formatPrice(order.total_amount)}</strong> as the amount.
                </p>
              </div>
            ) : (
              <div className="payment-bank">
                <div className="payment-bank__row">
                  <span className="payment-bank__label">Bank</span>
                  <span className="payment-bank__value">{settings.bank_name || '—'}</span>
                </div>
                <div className="payment-bank__row">
                  <span className="payment-bank__label">Account Number</span>
                  <div className="payment-bank__account">
                    <span className="payment-bank__value payment-bank__value--mono">
                      {settings.bank_account_number || '—'}
                    </span>
                    <button className="payment-bank__copy" onClick={copyAccountNumber} aria-label="Copy account number">
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
                <div className="payment-bank__row">
                  <span className="payment-bank__label">Account Name</span>
                  <span className="payment-bank__value">{settings.bank_account_name || '—'}</span>
                </div>
              </div>
            )}

            {/* Total */}
            <div className="payment-total">
              <span className="payment-total__label">Amount to Transfer</span>
              <span className="payment-total__amount">{formatPrice(order.total_amount)}</span>
            </div>
          </div>

          {/* Order summary */}
          <div className="payment-summary">
            <h2 className="payment-summary__title">Order Details</h2>
            <ul className="payment-summary__items">
              {order.items.map(item => (
                <li key={item.id} className="payment-summary__item">
                  <span className="payment-summary__item-name">
                    {item.product_name}
                    <span className="payment-summary__item-qty"> ×{item.quantity}</span>
                  </span>
                  <span>{formatPrice(item.subtotal)}</span>
                </li>
              ))}
            </ul>
            <div className="payment-summary__divider" />
            <div className="payment-summary__total">
              <span>Total</span>
              <span>{formatPrice(order.total_amount)}</span>
            </div>

            {alreadyPaid ? (
              <div className="payment-uploaded-note">
                Payment proof submitted. Your order is being verified.
              </div>
            ) : (
              <>
                <button
                  className="payment-confirm-btn"
                  onClick={() => navigate(`/confirm/${orderId}`)}
                  disabled={remaining.expired}
                >
                  I've Paid <ArrowRight size={16} />
                </button>
                <button
                  className="payment-cancel-btn"
                  onClick={handleCancel}
                  disabled={cancelling}
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Order'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
