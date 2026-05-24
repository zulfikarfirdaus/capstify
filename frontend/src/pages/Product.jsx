import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MessageCircle, ShoppingBag, ArrowLeft } from 'lucide-react'
import { fetchProduct, fetchHero } from '../api'
import { usePageView, trackClick } from '../hooks/useAnalytics'
import './Product.css'

function formatPrice(price) {
  if (!price) return null
  return 'Rp ' + Number(price).toLocaleString('id-ID')
}

export default function Product() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [product, setProduct]       = useState(null)
  const [waNumber, setWaNumber]     = useState('6281234567890')
  const [tokopediaUrl, setTokopediaUrl] = useState(null)
  const [activeImg, setActiveImg]   = useState(0)
  const [loading, setLoading]       = useState(true)

  usePageView(`/product/${slug}`)

  useEffect(() => {
    setLoading(true)
    fetchProduct(slug)
      .then(p => { setProduct(p); setActiveImg(0) })
      .catch(() => {})
      .finally(() => setLoading(false))

    fetchHero()
      .then(d => {
        if (d?.whatsapp_number) setWaNumber(d.whatsapp_number)
        if (d?.tokopedia_url) setTokopediaUrl(d.tokopedia_url)
      })
      .catch(() => {})
  }, [slug])

  const handleWA = () => {
    if (product?.id) trackClick(product.id, 'whatsapp')
    const msg = product?.whatsapp_message || `Hi! I'm interested in ${product?.name}`
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const handleShopee = () => {
    if (product?.id) trackClick(product.id, 'shopee')
    window.open(product.shopee_url, '_blank')
  }

  const handleTiktok = () => {
    if (product?.id) trackClick(product.id, 'tiktok')
    window.open(product.tiktok_url, '_blank')
  }

  const handleTokopedia = () => {
    if (product?.id) trackClick(product.id, 'tokopedia')
    window.open(tokopediaUrl, '_blank')
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
              <button className="btn-wa" onClick={handleWA}>
                <MessageCircle size={18} />
                Order via WhatsApp
              </button>
              <div className="product-info__marketplaces">
                <button className="btn-outline" onClick={product.shopee_url ? handleShopee : undefined} disabled={!product.shopee_url}>
                  <ShoppingBag size={16} />
                  Shopee
                </button>
                <button className="btn-outline" onClick={tokopediaUrl ? handleTokopedia : undefined} disabled={!tokopediaUrl}>
                  <img src="https://tyfrdfizecqstrsgopcf.supabase.co/storage/v1/object/public/product-images/brand/tokopedia-icon.png" alt="" width="16" height="16" style={{objectFit:'contain'}} />
                  Tokopedia
                </button>
                <button className="btn-outline" onClick={product.tiktok_url ? handleTiktok : undefined} disabled={!product.tiktok_url}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/>
                  </svg>
                  TikTok
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
