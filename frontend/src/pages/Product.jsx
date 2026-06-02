import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MessageCircle, ArrowLeft, ShoppingCart, Check } from 'lucide-react'
import { fetchProduct, fetchHero } from '../api'
import { usePageView, trackClick } from '../hooks/useAnalytics'
import { useCartStore } from '../store/cartStore'
import './Product.css'

function formatPrice(price) {
  if (!price) return null
  return 'Rp ' + Number(price).toLocaleString('id-ID')
}

export default function Product() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [product, setProduct]         = useState(null)
  const [waNumber, setWaNumber]       = useState('628112112122')
  const [activeImg, setActiveImg]     = useState(0)
  const [loading, setLoading]         = useState(true)
  const [addedToCart, setAddedToCart] = useState(false)
  const addItem = useCartStore(s => s.addItem)

  usePageView(`/product/${slug}`)

  useEffect(() => {
    setLoading(true)
    fetchProduct(slug)
      .then(p => { setProduct(p); setActiveImg(0) })
      .catch(() => {})
      .finally(() => setLoading(false))

    fetchHero()
      .then(d => { if (d?.whatsapp_number) setWaNumber(d.whatsapp_number) })
      .catch(() => {})
  }, [slug])

  const handleAddToCart = () => {
    addItem(product)
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  const handleWA = () => {
    if (product?.id) trackClick(product.id, 'whatsapp')
    const msg = product?.whatsapp_message || `Hi! I'm interested in ${product?.name}`
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  if (loading) return <div className="product-loading container"><p>Loading...</p></div>
  if (!product) return <div className="empty-state container" style={{paddingTop: '120px'}}><p>Product not found.</p></div>

  const images = product.images?.length ? product.images : []

  return (
    <div className="product-page">
      <div className="container">
        <button className="product-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>

        <div className="product-layout">
          {/* Gallery */}
          <div className="product-gallery">
            <div className="product-gallery__main">
              {images[activeImg] ? (
                <img src={images[activeImg]} alt={product.name} />
              ) : (
                <div className="product-gallery__placeholder" />
              )}
            </div>
            {images.length > 1 && (
              <div className="product-gallery__thumbs">
                {images.map((img, i) => (
                  <button
                    key={i}
                    className={`product-gallery__thumb${i === activeImg ? ' active' : ''}`}
                    onClick={() => setActiveImg(i)}
                  >
                    <img src={img} alt={`View ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="product-info">
            <span className="eyebrow product-info__cat">{product.category_name}</span>
            <h1 className="product-info__name">{product.name}</h1>
            {product.price && (
              <p className="product-info__price">{formatPrice(product.price)}</p>
            )}
            {product.description && (
              <p className="product-info__desc">{product.description}</p>
            )}

            {product.details && (
              <div className="product-details">
                {product.details.specs?.length > 0 && (
                  <table className="product-specs">
                    <tbody>
                      {product.details.specs.map((s, i) => (
                        <tr key={i}>
                          <td className="product-specs__label">{s.label}</td>
                          <td className="product-specs__value">{s.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            <div className="product-info__ctas">
              {product.price && (
                <button
                  className={`btn-cart${addedToCart ? ' btn-cart--added' : ''}`}
                  onClick={handleAddToCart}
                >
                  {addedToCart ? <Check size={18} /> : <ShoppingCart size={18} />}
                  {addedToCart ? 'Added to Cart' : 'Add to Cart'}
                </button>
              )}
              <button className="btn-wa" onClick={handleWA}>
                <MessageCircle size={18} />
                Order via WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
