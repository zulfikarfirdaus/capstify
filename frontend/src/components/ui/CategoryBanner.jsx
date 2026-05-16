import './CategoryBanner.css'

export default function CategoryBanner({ category }) {
  return (
    <section className="cat-banner">
      {category?.image && (
        <div className="cat-banner__bg">
          <img src={category.image} alt={category.name} />
        </div>
      )}
      <div className="cat-banner__overlay" />
      <div className="cat-banner__content container">
        <span className="eyebrow cat-banner__eyebrow">Collection</span>
        <h1 className="cat-banner__title">{category?.name}</h1>
        {category?.description && (
          <p className="cat-banner__desc">{category.description}</p>
        )}
      </div>
    </section>
  )
}
