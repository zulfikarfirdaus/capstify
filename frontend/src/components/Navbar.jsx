import { useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { Search, X, Menu, ShoppingCart, Phone } from 'lucide-react'
import logoPng from '../assets/logo-capstify.png'
import { fetchActiveCategorySlugs } from '../api'
import { useCartStore } from '../store/cartStore'
import './Navbar.css'

const CATEGORIES = [
  { name: 'Truckers', slug: 'truckers' },
  { name: 'A Frame',  slug: 'a-frame' },
  { name: 'Classic',  slug: 'classic' },
  { name: 'Baseball', slug: 'baseball' },
  { name: 'Snapback', slug: 'snapback' },
]

export default function Navbar() {
  const [scrolled, setScrolled]           = useState(false)
  const [menuOpen, setMenuOpen]           = useState(false)
  const [searchOpen, setSearchOpen]       = useState(false)
  const [searchQuery, setSearchQuery]     = useState('')
  const [activeSlugs, setActiveSlugs]     = useState(new Set())
  const items = useCartStore(s => s.items)
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0)

  useEffect(() => {
    fetchActiveCategorySlugs().then(setActiveSlugs).catch(() => {})
  }, [])
  const navigate  = useNavigate()
  const location  = useLocation()
  const isHome    = location.pathname === '/'
  const solid     = !isHome || scrolled

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setSearchOpen(false)
    }
  }

  return (
    <header className={`navbar${solid ? ' navbar--scrolled' : ''}`}>
      <div className="navbar__inner">
        {/* Logo */}
        <NavLink to="/" className="navbar__logo" aria-label="Capstify Home">
          <img src={logoPng} alt="Capstify" className="navbar__logo-img" />
        </NavLink>

        {/* Desktop nav */}
        <nav className="navbar__nav" aria-label="Product categories">
          {CATEGORIES.map(cat => {
            const active = activeSlugs.has(cat.slug)
            return active ? (
              <NavLink
                key={cat.slug}
                to={`/category/${cat.slug}`}
                className={({ isActive }) => `navbar__link${isActive ? ' active' : ''}`}
              >
                {cat.name}
              </NavLink>
            ) : (
              <span key={cat.slug} className="navbar__link navbar__link--disabled">
                {cat.name}
              </span>
            )
          })}
        </nav>

        {/* Actions */}
        <div className="navbar__actions">
          {searchOpen ? (
            <form className="navbar__search-form" onSubmit={handleSearch}>
              <input
                autoFocus
                type="text"
                placeholder="Search caps..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="navbar__search-input"
              />
              <button type="button" onClick={() => setSearchOpen(false)} aria-label="Close search">
                <X size={18} />
              </button>
            </form>
          ) : (
            <>
              <button onClick={() => setSearchOpen(true)} className="navbar__icon-btn" aria-label="Search">
                <Search size={18} />
              </button>
              <NavLink to="/cart" className="navbar__icon-btn navbar__cart-btn" aria-label={`Cart (${cartCount})`}>
                <ShoppingCart size={18} />
                {cartCount > 0 && (
                  <span className="navbar__cart-badge">{cartCount}</span>
                )}
              </NavLink>
              <NavLink to="/contact" className="navbar__icon-btn" aria-label="Contact">
                <Phone size={18} />
              </NavLink>
            </>
          )}
          <button
            className="navbar__burger"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      <div className={`navbar__overlay${menuOpen ? ' open' : ''}`} role="dialog" aria-modal="true">
        <button className="navbar__overlay-close" onClick={() => setMenuOpen(false)} aria-label="Close menu">
          <X size={24} />
        </button>
        <nav className="navbar__overlay-nav">
          <NavLink
            to="/contact"
            className="navbar__overlay-link"
            onClick={() => setMenuOpen(false)}
          >
            Contact Us
          </NavLink>
          {CATEGORIES.map(cat => {
            const active = activeSlugs.has(cat.slug)
            return active ? (
              <NavLink
                key={cat.slug}
                to={`/category/${cat.slug}`}
                className="navbar__overlay-link"
                onClick={() => setMenuOpen(false)}
              >
                {cat.name}
              </NavLink>
            ) : (
              <span key={cat.slug} className="navbar__overlay-link navbar__overlay-link--disabled">
                {cat.name}
              </span>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
