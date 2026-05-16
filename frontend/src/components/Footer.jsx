import { NavLink } from 'react-router-dom'
import logoPng from '../assets/logo-capstify.png'
import './Footer.css'

const CATEGORIES = [
  { name: 'Truckers', slug: 'truckers' },
  { name: 'Classic',  slug: 'classic' },
  { name: 'A Frame',  slug: 'a-frame' },
  { name: 'Baseball', slug: 'baseball' },
  { name: 'Snapback', slug: 'snapback' },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer__top container">
        <div className="footer__brand">
          <img src={logoPng} alt="Capstify" className="footer__logo" />
          <p className="footer__tagline">Crafted for the ones who lead.</p>
        </div>
        <nav className="footer__nav" aria-label="Footer navigation">
          {CATEGORIES.map(cat => (
            <NavLink key={cat.slug} to={`/category/${cat.slug}`} className="footer__link">
              {cat.name}
            </NavLink>
          ))}
        </nav>
        <div className="footer__social">
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="footer__social-link" aria-label="Instagram">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="2" width="20" height="20" rx="5"/>
              <circle cx="12" cy="12" r="5"/>
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
            </svg>
          </a>
          <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="footer__social-link" aria-label="TikTok">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/>
            </svg>
          </a>
          <a href="https://shopee.co.id" target="_blank" rel="noopener noreferrer" className="footer__social-link" aria-label="Shopee">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C9.62 2 7.5 3.37 7.5 5.5h9C16.5 3.37 14.38 2 12 2zM5 7l1.5 13h11L19 7H5zm7 2a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z"/>
            </svg>
          </a>
        </div>
      </div>
      <div className="footer__bottom container">
        <span className="footer__copy">&copy; {year} Capstify. All rights reserved.</span>
        <NavLink to="/admin/login" className="footer__admin-link">Admin</NavLink>
      </div>
    </footer>
  )
}
