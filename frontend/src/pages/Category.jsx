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
            <div className="empty-state"><p>No products yet in this category.</p></div>
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
