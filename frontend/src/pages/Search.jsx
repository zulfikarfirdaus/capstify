import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Search as SearchIcon } from 'lucide-react'
import { searchProducts } from '../api'
import { usePageView } from '../hooks/useAnalytics'
import useReveal from '../hooks/useReveal'
import ProductCard from '../components/ui/ProductCard'
import './Search.css'

export default function Search() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [query, setQuery]     = useState(searchParams.get('q') || '')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const revealRef = useReveal()

  usePageView('/search')

  const doSearch = (q) => {
    if (!q.trim()) return
    setLoading(true)
    setSearched(true)
    searchProducts(q.trim())
      .then(setResults)
      .catch(() => setResults([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    const q = searchParams.get('q')
    if (q) { setQuery(q); doSearch(q) }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
      doSearch(query.trim())
    }
  }

  return (
    <div className="search-page" ref={revealRef}>
      <div className="container">
        <div className="search-hero">
          <h1 className="heading-lg reveal">Search</h1>
          <form className="search-form reveal" onSubmit={handleSubmit}>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search for caps..."
              className="search-input"
              autoFocus
            />
            <button type="submit" className="search-btn" aria-label="Search">
              <SearchIcon size={20} />
            </button>
          </form>
        </div>

        {loading && <div className="empty-state"><p>Searching...</p></div>}

        {!loading && searched && results.length === 0 && (
          <div className="empty-state">
            <p>No results for &quot;{searchParams.get('q')}&quot;</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <>
            <p className="search-count reveal">
              {results.length} result{results.length !== 1 ? 's' : ''} for &quot;{searchParams.get('q')}&quot;
            </p>
            <div className="products-grid">
              {results.map(p => (
                <div key={p.id} className="reveal">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
