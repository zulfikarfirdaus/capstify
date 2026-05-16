import { useNavigate } from 'react-router-dom'
import './ProductCard.css'

function formatPrice(price) {
  if (!price) return null
  return 'Rp ' + Number(price).toLocaleString('id-ID')
}

export default function ProductCard({ product }) {
  const navigate = useNavigate()
  const image = product.images?.[0] || null

  return (
    <article className="product-card" onClick={() => navigate(`/product/${product.id}`)}>
      <div className="product-card__img-wrap">
        {image ? (
          <img src={image} alt={product.name} loading="lazy" />
        ) : (
          <div className="product-card__placeholder" />
        )}
        <div className="product-card__overlay" aria-hidden="true" />
      </div>
      <div className="product-card__body">
        <span className="eyebrow product-card__cat">{product.category_name}</span>
        <h3 className="product-card__name">{product.name}</h3>
        {product.price && (
          <span className="product-card__price">{formatPrice(product.price)}</span>
        )}
        <span className="product-card__link">View Details →</span>
      </div>
    </article>
  )
}
