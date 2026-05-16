import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { fetchHero, fetchCategories, fetchProducts } from '../api'
import { usePageView } from '../hooks/useAnalytics'
import useReveal from '../hooks/useReveal'
import ProductCard from '../components/ui/ProductCard'
import ScrollIndicator from '../components/ui/ScrollIndicator'
import './Home.css'

function HeroSection({ hero }) {
  const [imgLoaded, setImgLoaded] = useState(false)

  return (
    <section className="hero">
      <div className="hero__bg">
        {hero?.hero_image ? (
          <img
            src={hero.hero_image}
            alt="Hero"
            className={imgLoaded ? 'loaded' : ''}
            onLoad={() => setImgLoaded(true)}
          />
        ) : (
          <div className="hero__bg-fallback" />
        )}
      </div>
      <div className="hero__overlay" aria-hidden="true" />
      <div className="hero__content">
        <span className="hero__eyebrow">New Collection</span>
        <h1 className="hero__headline">
          {hero?.hero_article_name || 'The Season\'s Crown'}
        </h1>
        <p className="hero__subcopy">
          {hero?.hero_sub_copy || 'Headwear crafted for the ones who lead.'}
        </p>
        <Link to="/category/truckers" className="hero__cta">
          {hero?.hero_button_label || 'Explore Collection'}
        </Link>
      </div>
      <ScrollIndicator />
    </section>
  )
}

function CategoryStrip({ categories }) {
  return (
    <section className="section cat-strip">
      <div className="container">
        <div className="section-header">
          <h2 className="heading-md reveal">Shop By Category</h2>
        </div>
        <div className="cat-strip__grid reveal">
          {categories.map(cat => (
            <Link key={cat.id} to={`/category/${cat.slug}`} className="cat-strip__item">
              <div className="cat-strip__img">
                {cat.image ? (
                  <img src={cat.image} alt={cat.name} loading="lazy" />
                ) : (
                  <div className="cat-strip__placeholder" />
                )}
                <div className="cat-strip__overlay" />
              </div>
              <span className="cat-strip__name">{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTABand({ hero }) {
  const whatsappUrl = hero?.whatsapp_number
    ? `https://wa.me/${hero.whatsapp_number}`
    : null

  const channels = [
    { label: 'WhatsApp', href: whatsappUrl },
    { label: 'Shopee',   href: hero?.shopee_store_url || null },
    { label: 'TikTok Shop', href: hero?.tiktok_url || null },
  ].filter(c => c.href)

  return (
    <section className="cta-band">
      <div className="cta-band__bg">
        <img
          src="https://images.unsplash.com/photo-1681583663936-7e213cca9d72?w=1920&q=85&auto=format&fit=crop"
          alt=""
          loading="lazy"
        />
      </div>
      <div className="cta-band__overlay" />
      <div className="cta-band__content container">
        <span className="cta-band__eyebrow">Order Direct</span>
        <h2 className="cta-band__headline">Find Us<br />Where You Shop</h2>
        <p className="cta-band__sub">
          Reach out on WhatsApp or shop us on Shopee and TikTok — we're always ready.
        </p>
        <div className="cta-band__actions">
          {channels.length > 0 ? channels.map(c => (
            <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer" className="cta-band__btn">
              {c.label} →
            </a>
          )) : (
            <>
              <span className="cta-band__btn">WhatsApp →</span>
              <span className="cta-band__btn">Shopee →</span>
              <span className="cta-band__btn">TikTok Shop →</span>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  const [hero, setHero]             = useState(null)
  const [categories, setCategories] = useState([])
  const [featured, setFeatured]     = useState([])
  const revealRef = useReveal()

  usePageView('/')

  useEffect(() => {
    fetchHero().then(setHero).catch(() => {})
    fetchCategories().then(setCategories).catch(() => {})
    fetchProducts({ featured: 1, limit: 4 }).then(setFeatured).catch(() => {})
  }, [])

  return (
    <div ref={revealRef}>
      <HeroSection hero={hero} />

      {featured.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-header">
              <h2 className="heading-md reveal">Featured</h2>
              <Link to="/category/truckers" className="section-link reveal">View All →</Link>
            </div>
            <div className="products-grid">
              {featured.map(p => (
                <div key={p.id} className="reveal">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <CategoryStrip categories={categories} />

      <CTABand hero={hero} />
    </div>
  )
}
