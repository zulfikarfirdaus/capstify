import { NavLink, Routes, Route, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import AdminOverview    from './sections/AdminOverview'
import AdminHero        from './sections/AdminHero'
import AdminProducts    from './sections/AdminProducts'
import AdminCategories  from './sections/AdminCategories'
import AdminAnalytics   from './sections/AdminAnalytics'
import './Admin.css'

export default function AdminDashboard() {
  const navigate = useNavigate()

  const logout = async () => {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  const navLinks = [
    { to: '/admin',            label: 'Overview',   end: true },
    { to: '/admin/hero',       label: 'Hero',       end: false },
    { to: '/admin/products',   label: 'Products',   end: false },
    { to: '/admin/categories', label: 'Categories', end: false },
    { to: '/admin/analytics',  label: 'Analytics',  end: false },
  ]

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__logo">CAPSTIFY</div>
        <nav className="admin-nav">
          {navLinks.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => `admin-nav__link${isActive ? ' active' : ''}`}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <button className="admin-logout" onClick={logout}>Logout</button>
      </aside>

      <main className="admin-main">
        <Routes>
          <Route index        element={<AdminOverview />} />
          <Route path="hero"       element={<AdminHero />} />
          <Route path="products"   element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="analytics"  element={<AdminAnalytics />} />
        </Routes>
      </main>
    </div>
  )
}
