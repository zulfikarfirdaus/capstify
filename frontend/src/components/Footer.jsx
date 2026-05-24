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
          <p className="footer__tagline">Premium Materials. Timeless Shape.</p>
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
        </div>
      </div>
      <div className="footer__bottom container">
        <span className="footer__copy">&copy; {year} Capstify. All rights reserved.</span>
        <a href="https://spladestudio.com" target="_blank" rel="noopener noreferrer" className="footer__admin-link">Built by Splade Studio</a>
      </div>
    </footer>
  )
}
