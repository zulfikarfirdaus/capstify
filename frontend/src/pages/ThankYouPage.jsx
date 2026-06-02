import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { CheckCircle, Clock } from 'lucide-react'
import { fetchOrder } from '../api'
import './ThankYouPage.css'

function formatPrice(n) {
  return 'Rp ' + Number(n).toLocaleString('id-ID')
}

export default function ThankYouPage() {
  const { orderId } = useParams()
  const [order, setOrder]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrder(orderId)
      .then(setOrder)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [orderId])

  if (loading) {
    return <div className="thankyou-loading"><p>Loading...</p></div>
  }

  return (
    <div className="thankyou-page">
      <div className="container thankyou-container">
        <div className="thankyou-icon">
          <CheckCircle size={48} strokeWidth={1.2} />
        </div>

        <h1 className="thankyou-title">Thank You!</h1>
        <p className="thankyou-order-id">
          Order <strong>{orderId}</strong> is being verified
        </p>

        <div className="thankyou-card">
          <div className="thankyou-card__row">
            <Clock size={16} />
            <span>Estimated confirmation within <strong>1×24 hours</strong> after payment is verified</span>
          </div>
          <p className="thankyou-card__note">
            We'll reach out via WhatsApp or email once your payment has been confirmed.
          </p>
        </div>

        {order && (
          <div className="thankyou-summary">
            <h2 className="thankyou-summary__title">Order Summary</h2>
            <ul className="thankyou-summary__items">
              {order.items?.map(item => (
                <li key={item.id} className="thankyou-summary__item">
                  <span>
                    {item.product_name}
                    <span className="thankyou-summary__qty"> ×{item.quantity}</span>
                  </span>
                  <span>{formatPrice(item.subtotal)}</span>
                </li>
              ))}
            </ul>
            <div className="thankyou-summary__divider" />
            <div className="thankyou-summary__row thankyou-summary__row--total">
              <span>Total</span>
              <span>{formatPrice(order.total_amount)}</span>
            </div>
            <div className="thankyou-summary__row">
              <span>Payment Method</span>
              <span>{order.payment_method === 'qris' ? 'QRIS' : 'Bank Transfer'}</span>
            </div>
            <div className="thankyou-summary__row">
              <span>Recipient</span>
              <span>{order.customer_name}</span>
            </div>
          </div>
        )}

        <Link to="/" className="thankyou-cta">Continue Shopping</Link>
      </div>
    </div>
  )
}
