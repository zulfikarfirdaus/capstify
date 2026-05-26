import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { fetchHero, fetchCategories, fetchProducts } from '../api'
import { usePageView } from '../hooks/useAnalytics'
import useReveal from '../hooks/useReveal'
import ProductCard from '../components/ui/ProductCard'
import ScrollIndicator from '../components/ui/ScrollIndicator'
import './Home.css'

function HeroSection({ hero, heroLoaded }) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const contentVisible = heroLoaded && (!hero?.hero_image || imgLoaded)

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
        ) : heroLoaded ? (
          <div className="hero__bg-fallback" />
        ) : null}
      </div>
      <div className="hero__overlay" aria-hidden="true" />
      <div className={`hero__content${contentVisible ? ' hero__content--visible' : ''}`}>
        <span className="hero__eyebrow">New Drop 2026</span>
        <h1 className="hero__headline">
          {hero?.hero_article_name || 'The Season\'s Crown'}
        </h1>
        <p className="hero__subcopy">
          {hero?.hero_sub_copy || 'Premium Materials. Timeless Shape.'}
        </p>
        <Link to="/category/truckers" className="hero__cta">
          {hero?.hero_button_label || 'Explore Collection'}
        </Link>
      </div>
      <ScrollIndicator />
    </section>
  )
}

function ComingSoonThumb() {
  return (
    <div className="cat-strip__coming-soon">
      <div className="cat-strip__coming-soon__rule" />
      <span className="cat-strip__coming-soon__text">Coming<br />Soon</span>
      <div className="cat-strip__coming-soon__rule" />
    </div>
  )
}

const CATEGORY_ORDER = ['truckers', 'a-frame', 'classic', 'baseball', 'snapback']

function CategoryStrip({ categories, products }) {
  const catImages = products.reduce((acc, p) => {
    if (!acc[p.category_slug] && p.images?.[0]) acc[p.category_slug] = p.images[0]
    return acc
  }, {})

  const activeSlugs = new Set(products.map(p => p.category_slug).filter(Boolean))

  const sorted = [...categories].sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a.slug)
    const bi = CATEGORY_ORDER.indexOf(b.slug)
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
  })

  return (
    <section className="section cat-strip">
      <div className="container">
        <div className="section-header">
          <h2 className="heading-md reveal">Shop By Category</h2>
        </div>
        <div className="cat-strip__grid reveal">
          {sorted.map(cat => {
            const thumb = cat.image || catImages[cat.slug]
            const hasProducts = activeSlugs.has(cat.slug)
            const inner = (
              <>
                <div className="cat-strip__img">
                  {thumb ? (
                    <img src={thumb} alt={cat.name} loading="lazy" />
                  ) : (
                    <ComingSoonThumb />
                  )}
                  <div className="cat-strip__overlay" />
                </div>
                <span className="cat-strip__name">{cat.name}</span>
              </>
            )
            return hasProducts ? (
              <Link key={cat.id} to={`/category/${cat.slug}`} className="cat-strip__item">
                {inner}
              </Link>
            ) : (
              <div key={cat.id} className="cat-strip__item cat-strip__item--disabled">
                {inner}
              </div>
            )
          })}
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
    { label: 'WhatsApp',  href: whatsappUrl },
    { label: 'Shopee',    href: hero?.shopee_store_url || null },
    { label: 'Tokopedia', href: hero?.tokopedia_url || null },
    { label: 'TikTok Shop', href: hero?.tiktok_url || null },
  ].filter(c => c.href)

  return (
    <section className="cta-band">
      <div className="cta-band__bg">
        <img
          src="https://tyfrdfizecqstrsgopcf.supabase.co/storage/v1/object/public/product-images/cta-band-bg.png"
          alt=""
          loading="lazy"
        />
      </div>
      <div className="cta-band__overlay" />
      <div className="cta-band__content container">
        <span className="cta-band__eyebrow">Order Direct</span>
        <h2 className="cta-band__headline">Wear The<br />Culture</h2>
        <p className="cta-band__sub">
          Shop premium headwear directly through WhatsApp, Shopee, Tokopedia, and TikTok Shop — wherever you scroll, we're there.
        </p>
        <div className="cta-band__actions">
          {channels.length > 0 ? channels.map(c => (
            <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer" className="cta-band__btn">
              {c.label}
            </a>
          )) : (
            <>
              <span className="cta-band__btn">WhatsApp</span>
              <span className="cta-band__btn">Shopee</span>
              <span className="cta-band__btn">Tokopedia</span>
              <span className="cta-band__btn">TikTok Shop</span>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  const [hero, setHero]               = useState(null)
  const [heroLoaded, setHeroLoaded]   = useState(false)
  const [categories, setCategories]   = useState([])
  const [featured, setFeatured]       = useState([])
  const [allProducts, setAllProducts] = useState([])
  const revealRef = useReveal()

  usePageView('/')

  useEffect(() => {
    fetchHero().then(data => { setHero(data); setHeroLoaded(true) }).catch(() => setHeroLoaded(true))
    fetchCategories().then(setCategories).catch(() => {})
    fetchProducts({ featured: 1, limit: 4 }).then(setFeatured).catch(() => {})
    fetchProducts().then(setAllProducts).catch(() => {})
  }, [])

  return (
    <div ref={revealRef}>
      <HeroSection hero={hero} heroLoaded={heroLoaded} />

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

      <CategoryStrip categories={categories} products={allProducts} />

      <CTABand hero={hero} />
    </div>
  )
}
