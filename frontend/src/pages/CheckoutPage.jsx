import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useCartStore } from '../store/cartStore'
import { createOrder } from '../api'
import './CheckoutPage.css'

function formatPrice(n) {
  return 'Rp ' + Number(n).toLocaleString('id-ID')
}

const PAYMENT_METHODS = [
  { id: 'qris', label: 'QRIS', desc: 'Scan QR with any banking or e-wallet app' },
]

export default function CheckoutPage() {
  const navigate  = useNavigate()
  const items     = useCartStore(s => s.items)
  const clearCart = useCartStore(s => s.clearCart)
  const total     = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)

  const [form, setForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    paymentMethod: 'qris',
  })
  const [errors,    setErrors]  = useState({})
  const [loading,   setLoading] = useState(false)

  if (items.length === 0) {
    return (
      <div className="checkout-empty">
        <p>Your cart is empty. <Link to="/">Continue shopping</Link></p>
      </div>
    )
  }

  const validate = () => {
    const e = {}
    if (!form.customerName.trim())    e.customerName    = 'Name is required'
    if (!form.customerEmail.trim())   e.customerEmail   = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.customerEmail)) e.customerEmail = 'Invalid email format'
    if (!form.customerPhone.trim())   e.customerPhone   = 'Phone number is required'
    if (!form.customerAddress.trim()) e.customerAddress = 'Shipping address is required'
    return e
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    if (errors[name]) setErrors(err => ({ ...err, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      const orderId = await createOrder({ ...form, items })
      clearCart()
      navigate(`/payment/${orderId}`)
    } catch (err) {
      console.error(err)
      setErrors({ submit: 'Failed to place order. Please try again.' })
      setLoading(false)
    }
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <Link to="/cart" className="checkout-back">
          <ArrowLeft size={16} /> Back to Cart
        </Link>

        <h1 className="checkout-title">Checkout</h1>

        <div className="checkout-layout">
          {/* Form */}
          <form className="checkout-form" onSubmit={handleSubmit} noValidate>
            <section className="checkout-section">
              <h2 className="checkout-section__title">Customer Information</h2>

              <div className="checkout-field">
                <label htmlFor="customerName">Full Name</label>
                <input
                  id="customerName"
                  name="customerName"
                  type="text"
                  value={form.customerName}
                  onChange={handleChange}
                  placeholder="Recipient name"
                  className={errors.customerName ? 'is-error' : ''}
                />
                {errors.customerName && <span className="checkout-field__err">{errors.customerName}</span>}
              </div>

              <div className="checkout-field">
                <label htmlFor="customerEmail">Email</label>
                <input
                  id="customerEmail"
                  name="customerEmail"
                  type="email"
                  value={form.customerEmail}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className={errors.customerEmail ? 'is-error' : ''}
                />
                {errors.customerEmail && <span className="checkout-field__err">{errors.customerEmail}</span>}
              </div>

              <div className="checkout-field">
                <label htmlFor="customerPhone">Phone / WhatsApp</label>
                <input
                  id="customerPhone"
                  name="customerPhone"
                  type="tel"
                  value={form.customerPhone}
                  onChange={handleChange}
                  placeholder="08xxxxxxxxxx"
                  className={errors.customerPhone ? 'is-error' : ''}
                />
                {errors.customerPhone && <span className="checkout-field__err">{errors.customerPhone}</span>}
              </div>

              <div className="checkout-field">
                <label htmlFor="customerAddress">Shipping Address</label>
                <textarea
                  id="customerAddress"
                  name="customerAddress"
                  rows={4}
                  value={form.customerAddress}
                  onChange={handleChange}
                  placeholder="Street, No., District, City, Postal Code"
                  className={errors.customerAddress ? 'is-error' : ''}
                />
                {errors.customerAddress && <span className="checkout-field__err">{errors.customerAddress}</span>}
              </div>
            </section>

            <section className="checkout-section">
              <h2 className="checkout-section__title">Payment Method</h2>
              <div className="checkout-methods">
                {PAYMENT_METHODS.map(m => (
                  <label
                    key={m.id}
                    className={`checkout-method${form.paymentMethod === m.id ? ' selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={m.id}
                      checked={form.paymentMethod === m.id}
                      onChange={handleChange}
                    />
                    <div className="checkout-method__body">
                      <span className="checkout-method__label">{m.label}</span>
                      <span className="checkout-method__desc">{m.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </section>

            {errors.submit && (
              <p className="checkout-error">{errors.submit}</p>
            )}

            <button type="submit" className="checkout-submit" disabled={loading}>
              {loading ? 'Processing...' : (
                <>Proceed to Payment <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          {/* Order summary sidebar */}
          <aside className="checkout-aside">
            <h2 className="checkout-aside__title">Order Summary</h2>
            <ul className="checkout-aside__items">
              {items.map(({ product, quantity }) => (
                <li key={product.id} className="checkout-aside__item">
                  <div className="checkout-aside__item-img">
                    {product.images?.[0]
                      ? <img src={product.images[0]} alt={product.name} />
                      : <div className="checkout-aside__item-placeholder" />
                    }
                    <span className="checkout-aside__item-qty">{quantity}</span>
                  </div>
                  <div className="checkout-aside__item-info">
                    <span className="checkout-aside__item-name">{product.name}</span>
                    <span className="checkout-aside__item-price">
                      {formatPrice(product.price * quantity)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
            <div className="checkout-aside__divider" />
            <div className="checkout-aside__total">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
