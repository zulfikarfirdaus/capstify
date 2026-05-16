import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import './App.css'

import Navbar from './components/Navbar'
import Footer from './components/Footer'
import PrivateRoute from './components/PrivateRoute'
import WhatsAppFAB from './components/WhatsAppFAB'

import Home from './pages/Home'
import Category from './pages/Category'
import Product from './pages/Product'
import Search from './pages/Search'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <WhatsAppFAB />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/"               element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/category/:slug" element={<PublicLayout><Category /></PublicLayout>} />
        <Route path="/product/:slug"  element={<PublicLayout><Product /></PublicLayout>} />
        <Route path="/search"         element={<PublicLayout><Search /></PublicLayout>} />
        <Route path="/admin/login"    element={<AdminLogin />} />
        <Route path="/admin/*"        element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  )
}
