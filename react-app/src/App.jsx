import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'

import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'

import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Lookbook from './pages/Lookbook'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import PayMethod from './pages/PayMethod'
import SuccessPay from './pages/SuccessPay'
import Buys from './pages/Buys'
import UserSettings from './pages/UserSettings'
import Personalizar from './pages/Personalizar'

import AdminOrders from './pages/admin/AdminOrders'
import AdminShippings from './pages/admin/AdminShippings'
import AdminAddItem from './pages/admin/AdminAddItem'

function AppLayout() {
  const location = useLocation()
  const hideNavAndFooter = location.pathname === '/login' || location.pathname === '/register'

  return (
    <>
      {!hideNavAndFooter && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/items" element={<Lookbook />} />
        <Route path="/items/:id" element={<ProductDetail />} />
        <Route path="/items/category/:cat/:clas" element={<Products />} />
        <Route path="/items/clasification/:clas" element={<Products />} />
        
        {/* Rutas Protegidas (Solo Usuarios Logueados) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/cart" element={<Cart />} />
          <Route path="/payMethod" element={<PayMethod />} />
          <Route path="/successPay" element={<SuccessPay />} />
          <Route path="/buys" element={<Buys />} />
          <Route path="/userSettings" element={<UserSettings />} />
          <Route path="/personalizar" element={<Personalizar />} />
        </Route>

        {/* Rutas Admin (Solo Administradores) */}
        <Route element={<AdminRoute />}>
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/shippings" element={<AdminShippings />} />
          <Route path="/admin/addItem" element={<AdminAddItem />} />
        </Route>
      </Routes>
      {!hideNavAndFooter && <Footer />}
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppLayout />
        </Router>
      </CartProvider>
    </AuthProvider>
  )
}
