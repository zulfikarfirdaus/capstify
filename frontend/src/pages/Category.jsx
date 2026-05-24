import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { fetchCategories, fetchProducts } from '../api'
import { usePageView } from '../hooks/useAnalytics'
import useReveal from '../hooks/useReveal'
import CategoryBanner from '../components/ui/CategoryBanner'
import ProductCard from '../components/ui/ProductCard'
import './Category.css'

export default function Category() {
  const { slug } = useParams()
  const [category, setCategory] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const revealRef = useReveal()

  usePageView(`/category/${slug}`)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetchCategories(),
      fetchProducts({ category: slug }),
    ]).then(([cats, prods]) => {
      setCategory(cats.find(c => c.slug === slug) || null)
      setProducts(prods)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [slug])

  return (
    <div ref={revealRef}>
      <CategoryBanner category={category} />
      <section className="section">
        <div className="container">
          {loading ? (
            <div className="empty-state"><p>Loading...</p></div>
          ) : products.length === 0 ? (
            <div className="coming-soon">
              <svg className="coming-soon__icon" width="40" height="40" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M3,15c0,0.1,0,0.3,0.1,0.4c0.1,0.1,0.1,0.2,0.2,0.3L4.6,17c2.3,2.3,5.3,3.4,8.3,3.4c2.5,0,5-0.8,7.2-2.5c0.6-0.5,1-1.2,1.1-2c0-0.8-0.2-1.6-0.8-2.1L18,11.6v-1.1C18,6.4,14.6,3,10.5,3S3,6.4,3,10.5V15z M18.9,15.3c0.2,0.2,0.2,0.4,0.2,0.6c0,0.1-0.1,0.4-0.3,0.5c-3.7,2.9-8.9,2.7-12.4-0.4h3.3c2.7,0,5.2-0.9,7.2-2.6L18.9,15.3z M5,10.5C5,8,6.7,5.9,9,5.2l1.3,1c1,0.8,1.8,1.9,2.2,3.1C12.7,9.8,13,10,13.4,10c0.1,0,0.2,0,0.4-0.1c0.5-0.2,0.8-0.8,0.6-1.3c-0.5-1.3-1.3-2.5-2.3-3.4C14.4,5.9,16,8,16,10.5v1.1c-1.7,1.6-3.9,2.4-6.2,2.4H5V10.5z"/>
              </svg>
              <h2 className="coming-soon__heading">Cool caps coming soon</h2>
            </div>
          ) : (
            <>
              <p className="category__count reveal">
                {products.length} {products.length === 1 ? 'item' : 'items'}
              </p>
              <div className="products-grid">
                {products.map(p => (
                  <div key={p.id} className="reveal">
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  )
}
