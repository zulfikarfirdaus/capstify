import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import logoPng from '../assets/logo-capstify.png'
import { fetchActiveCategorySlugs } from '../api'
import './Footer.css'

const CATEGORIES = [
  { name: 'Truckers', slug: 'truckers' },
  { name: 'A Frame',  slug: 'a-frame' },
  { name: 'Classic',  slug: 'classic' },
  { name: 'Baseball', slug: 'baseball' },
  { name: 'Snapback', slug: 'snapback' },
]

export default function Footer() {
  const year = new Date().getFullYear()
  const [activeSlugs, setActiveSlugs] = useState(new Set())

  useEffect(() => {
    fetchActiveCategorySlugs().then(setActiveSlugs).catch(() => {})
  }, [])

  return (
    <footer className="footer">
      <div className="footer__top container">
        <div className="footer__brand">
          <img src={logoPng} alt="Capstify" className="footer__logo" />
          <p className="footer__tagline">Premium Materials. Timeless Shape.</p>
        </div>
        <nav className="footer__nav" aria-label="Footer navigation">
          {CATEGORIES.map(cat => {
            const active = activeSlugs.has(cat.slug)
            return active ? (
              <NavLink key={cat.slug} to={`/category/${cat.slug}`} className="footer__link">
                {cat.name}
              </NavLink>
            ) : (
              <span key={cat.slug} className="footer__link footer__link--disabled">
                {cat.name}
              </span>
            )
          })}
        </nav>
        <div className="footer__right">
          <NavLink to="/contact" className="footer__right-link">Contact Us</NavLink>
          <a href="https://instagram.com/capstify" target="_blank" rel="noopener noreferrer" className="footer__right-link">Instagram</a>
        </div>
      </div>
      <div className="footer__bottom container">
        <span className="footer__copy">&copy; {year} PT. Capstify Gaya Kreatif. All rights reserved.</span>
        <a href="https://spladestudio.com" target="_blank" rel="noopener noreferrer" className="footer__admin-link">Built by Splade Studio</a>
      </div>
    </footer>
  )
}
