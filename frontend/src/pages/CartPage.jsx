import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight } from 'lucide-react'
import { useCartStore } from '../store/cartStore'
import './CartPage.css'

function formatPrice(n) {
  return 'Rp ' + Number(n).toLocaleString('id-ID')
}

export default function CartPage() {
  const navigate = useNavigate()
  const items        = useCartStore(s => s.items)
  const removeItem   = useCartStore(s => s.removeItem)
  const updateQty    = useCartStore(s => s.updateQuantity)
  const totalPrice   = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)

  if (items.length === 0) {
    return (
      <div className="cart-empty">
        <ShoppingCart size={40} strokeWidth={1.2} />
        <p className="cart-empty__msg">Your cart is empty.</p>
        <Link to="/" className="cart-empty__back">Continue Shopping</Link>
      </div>
    )
  }

  return (
    <div className="cart-page">
      <div className="container">
        <h1 className="cart-page__title">Your Cart</h1>

        <div className="cart-layout">
          <ul className="cart-items">
            {items.map(({ product, quantity }) => {
              const img = product.images?.[0]
              return (
                <li key={product.id} className="cart-item">
                  <div className="cart-item__img">
                    {img
                      ? <img src={img} alt={product.name} />
                      : <div className="cart-item__img-placeholder" />
                    }
                  </div>
                  <div className="cart-item__info">
                    <span className="cart-item__cat">{product.category_name}</span>
                    <Link to={`/product/${product.slug}`} className="cart-item__name">
                      {product.name}
                    </Link>
                    <p className="cart-item__price">{formatPrice(product.price)}</p>
                  </div>
                  <div className="cart-item__qty">
                    <button
                      className="cart-item__qty-btn"
                      onClick={() => updateQty(product.id, quantity - 1)}
                      disabled={quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="cart-item__qty-num">{quantity}</span>
                    <button
                      className="cart-item__qty-btn"
                      onClick={() => updateQty(product.id, quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <div className="cart-item__subtotal">
                    {formatPrice(product.price * quantity)}
                  </div>
                  <button
                    className="cart-item__remove"
                    onClick={() => removeItem(product.id)}
                    aria-label="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              )
            })}
          </ul>

          <div className="cart-summary">
            <h2 className="cart-summary__title">Order Summary</h2>
            <div className="cart-summary__row">
              <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            <div className="cart-summary__row cart-summary__row--shipping">
              <span>Shipping</span>
              <span className="cart-summary__tbd">Calculated at checkout</span>
            </div>
            <div className="cart-summary__divider" />
            <div className="cart-summary__row cart-summary__row--total">
              <span>Total</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            <button
              className="cart-summary__cta"
              onClick={() => navigate('/checkout')}
            >
              Checkout <ArrowRight size={16} />
            </button>
            <Link to="/" className="cart-summary__continue">Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
