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

const IgIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
  </svg>
)

const WaIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.558 4.121 1.532 5.852L.057 23.077a.75.75 0 0 0 .921.899l5.352-1.538A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.726 9.726 0 0 1-4.953-1.355l-.355-.213-3.676 1.056 1.002-3.595-.232-.369A9.718 9.718 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
  </svg>
)

export default function Footer() {
  const year = new Date().getFullYear()
  const [activeSlugs, setActiveSlugs] = useState(new Set())

  useEffect(() => {
    fetchActiveCategorySlugs().then(setActiveSlugs).catch(() => {})
  }, [])

  return (
    <footer className="footer">
      <div className="footer__top container">
        <img src={logoPng} alt="Capstify" className="footer__logo" />
        <div className="footer__socials">
          <a
            href="https://instagram.com/capstify"
            target="_blank"
            rel="noopener noreferrer"
            className="footer__social-btn"
            aria-label="Instagram"
          >
            <IgIcon />
          </a>
          <a
            href="https://wa.me/6281234567890"
            target="_blank"
            rel="noopener noreferrer"
            className="footer__social-btn"
            aria-label="WhatsApp"
          >
            <WaIcon />
          </a>
        </div>
      </div>
      <div className="footer__bottom container">
        <div className="footer__copy-block">
          <span className="footer__copy">&copy; {year} PT. Capstify Gaya Kreatif. All rights reserved.</span>
          <a href="https://spladestudio.com" target="_blank" rel="noopener noreferrer" className="footer__built-by">Built by Splade Studio</a>
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
      </div>
    </footer>
  )
}
