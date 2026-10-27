import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { getCategories } from '../api/itemsApi'

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const { cartCount } = useCart()
  const location = useLocation()
  const isPersonalizar = location.pathname === '/personalizar'
  const isAdminRoute = location.pathname.startsWith('/admin')

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [openSection, setOpenSection] = useState(null) // 'men' | 'women' | 'user'
  const [categories, setCategories] = useState([])

  // Carga categorías de la BD para soportar categorías dinámicas
  useEffect(() => {
    getCategories()
      .then((res) => {
        if (Array.isArray(res.data)) {
          setCategories(res.data)
        }
      })
      .catch(() => {})
  }, [])

  const extraCategories = categories.filter((c) => ![1, 2, 3, 4].includes(c.id_clasification))

  // Cierra el drawer al cambiar de ruta
  useEffect(() => {
    setDrawerOpen(false)
    setOpenSection(null)
  }, [location.pathname])

  // Bloquea el scroll del body cuando el drawer está abierto
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  const toggleDrawer = () => setDrawerOpen(prev => !prev)
  const closeDrawer = () => { setDrawerOpen(false); setOpenSection(null) }

  const toggleSection = (section) => {
    setOpenSection(prev => (prev === section ? null : section))
  }

  const handleLogout = () => {
    logout()
    closeDrawer()
  }

  return (
    <header className="site-header" style={{ position: 'sticky', top: 0, zIndex: 1000, backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <nav className="navbar" style={{ backgroundColor: '#ffffff', minHeight: '60px' }}>

        {/* ── Barra móvil (visible solo en móvil/tablet < 1023px) ── */}
        <header className="nabvar-mobile">
          <button
            id="btn-mobile"
            className="mobile-icon-btn"
            onClick={toggleDrawer}
            aria-label="Abrir menú"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#0f172a">
              <title>menu</title>
              <path d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z" />
            </svg>
          </button>

          <div className="navbar-mobile-brand">
            <Link to="/" className="mobile-brand-link">
              <div className="brand-emblem brand-emblem--sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z"/>
                </svg>
              </div>
              <span className="brand-title brand-title--sm">
                PERSONALIZED <span className="brand-accent">CLOTHING</span>
              </span>
            </Link>
          </div>

          <Link to="/cart" className="mobile-icon-btn mobile-cart-btn" aria-label="Carrito">
            <i className="zmdi zmdi-shopping-cart" style={{ fontSize: '22px', color: '#0f172a' }}></i>
            {cartCount > 0 && (
              <span className="mobile-cart-badge">
                {cartCount}
              </span>
            )}
          </Link>
        </header>

        {/* ── Overlay oscuro al abrir drawer ── */}
        {drawerOpen && (
          <div
            className="drawer-overlay"
            onClick={closeDrawer}
          />
        )}

        {/* ── Drawer / Nav Menu ── */}
        <nav
          className={`nav-menu${drawerOpen ? ' openOffCanvas' : ''}`}
          id="mySidenav"
          aria-label="Menú principal"
        >
          {/* Cabecera del drawer (solo visible en móvil/tablet < 1023px) */}
          <div className="drawer-header">
            <Link to="/" className="mobile-brand-link" onClick={closeDrawer}>
              <div className="brand-emblem brand-emblem--sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z"/>
                </svg>
              </div>
              <span className="brand-title brand-title--sm">
                PERSONALIZED <span className="brand-accent">CLOTHING</span>
              </span>
            </Link>

            <button
              onClick={closeDrawer}
              className="drawer-close-btn"
              aria-label="Cerrar menú"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Logo con Emblema (solo escritorio >= 1023px) */}
          <Link
            className="brand"
            to="/"
          >
            <div className="brand-emblem">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z"/>
              </svg>
            </div>
            <span className="brand-title">
              PERSONALIZED <span className="brand-accent">CLOTHING</span>
            </span>
          </Link>

          <ul className="nav-menu-ul">

            {/* ── Hombre ── */}
            <li className={`nav-menu-item${openSection === 'men' ? ' is-open' : ''}`} id="men">
              <a
                className={`nav-menu-link link-submenu${openSection === 'men' ? ' active' : ''}`}
                href="#"
                onClick={(e) => { e.preventDefault(); toggleSection('men') }}
              >
                <span className="nav-link-label">
                  <i className="zmdi zmdi-male-alt nav-mobile-item-icon"></i>
                  <span>Hombre</span>
                </span>
                <i className={`zmdi zmdi-chevron-${openSection === 'men' ? 'up' : 'down'} nav-chevron`}></i>
              </a>
              <div className="container-sub-menu minimal-sub-menu" style={openSection === 'men' ? { maxHeight: '600px' } : {}}>
                <div className="minimal-menu-body">
                  <div className="minimal-menu-col">
                    <span className="minimal-menu-header">Frío</span>
                    <Link className="minimal-menu-item" to="/items/category/1/2" onClick={closeDrawer}>Sudaderas</Link>
                    <Link className="minimal-menu-item" to="/items/category/1/4" onClick={closeDrawer}>Suéteres</Link>
                  </div>
                  <div className="minimal-menu-col">
                    <span className="minimal-menu-header">Casual</span>
                    <Link className="minimal-menu-item" to="/items/category/1/1" onClick={closeDrawer}>Camisetas</Link>
                  </div>
                  {extraCategories.length > 0 && (
                    <div className="minimal-menu-col">
                      <span className="minimal-menu-header">Más</span>
                      {extraCategories.map((c) => (
                        <Link
                          key={c.id_clasification}
                          className="minimal-menu-item"
                          to={`/items/category/1/${c.id_clasification}`}
                          onClick={closeDrawer}
                        >
                          {c.name.charAt(0).toUpperCase() + c.name.slice(1)}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
                <div className="minimal-menu-footer">
                  <Link className="minimal-menu-view-all" to="/items/clasification/1" onClick={closeDrawer}>
                    <span>Ver toda la colección de Hombre</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </Link>
                </div>
              </div>
            </li>

            {/* ── Mujer ── */}
            <li className={`nav-menu-item${openSection === 'women' ? ' is-open' : ''}`} id="women">
              <a
                href="#"
                className={`nav-menu-link link-submenu${openSection === 'women' ? ' active' : ''}`}
                onClick={(e) => { e.preventDefault(); toggleSection('women') }}
              >
                <span className="nav-link-label">
                  <i className="zmdi zmdi-female nav-mobile-item-icon"></i>
                  <span>Mujer</span>
                </span>
                <i className={`zmdi zmdi-chevron-${openSection === 'women' ? 'up' : 'down'} nav-chevron`}></i>
              </a>
              <div className="container-sub-menu minimal-sub-menu" style={openSection === 'women' ? { maxHeight: '600px' } : {}}>
                <div className="minimal-menu-body">
                  <div className="minimal-menu-col">
                    <span className="minimal-menu-header">Frío</span>
                    <Link className="minimal-menu-item" to="/items/category/2/2" onClick={closeDrawer}>Sudaderas</Link>
                    <Link className="minimal-menu-item" to="/items/category/2/4" onClick={closeDrawer}>Suéteres</Link>
                  </div>
                  <div className="minimal-menu-col">
                    <span className="minimal-menu-header">Casual</span>
                    <Link className="minimal-menu-item" to="/items/category/2/1" onClick={closeDrawer}>Camisetas</Link>
                    <Link className="minimal-menu-item" to="/items/category/2/3" onClick={closeDrawer}>Crop tops</Link>
                  </div>
                  {extraCategories.length > 0 && (
                    <div className="minimal-menu-col">
                      <span className="minimal-menu-header">Más</span>
                      {extraCategories.map((c) => (
                        <Link
                          key={c.id_clasification}
                          className="minimal-menu-item"
                          to={`/items/category/2/${c.id_clasification}`}
                          onClick={closeDrawer}
                        >
                          {c.name.charAt(0).toUpperCase() + c.name.slice(1)}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
                <div className="minimal-menu-footer">
                  <Link className="minimal-menu-view-all" to="/items/clasification/2" onClick={closeDrawer}>
                    <span>Ver toda la colección de Mujer</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </Link>
                </div>
              </div>
            </li>

            {/* ── Personalizar ── */}
            <li className="nav-menu-item">
              <Link
                to="/personalizar"
                className={`nav-menu-link nav-link-personalizar${isPersonalizar ? ' is-active-personalizar' : ''}`}
              >
                <span className="nav-link-label">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isPersonalizar ? '#059669' : 'currentColor'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 19l7-7 3 3-7 7-3-3z"/>
                    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
                    <path d="M2 2l7.586 7.586"/>
                    <circle cx="11" cy="11" r="2"/>
                  </svg>
                  <span>Personalizar</span>
                </span>
              </Link>
            </li>

            {/* ── Carrito ── */}
            <li className="nav-menu-item navbar-top-item">
              <Link
                to="/cart"
                className="nav-menu-link"
              >
                <span className="nav-link-label">
                  <i className="zmdi zmdi-shopping-cart" style={{ fontSize: '18px' }}></i>
                  <span>Carrito ({cartCount})</span>
                </span>
              </Link>
            </li>

            {/* ── Compras (solo autenticado) ── */}
            {isAuthenticated && (
              <li className="nav-menu-item navbar-top-item">
                <Link
                  to="/buys"
                  className="nav-menu-link"
                >
                  <span className="nav-link-label">
                    <i className="zmdi zmdi-shopping-basket" style={{ fontSize: '17px' }}></i>
                    <span>Compras</span>
                  </span>
                </Link>
              </li>
            )}

            {/* ── Admin (solo admin → lleva directo al panel en Pedidos) ── */}
            {isAdmin && (
              <li className="nav-menu-item" id="adminSettings">
                <Link
                  to="/admin/orders"
                  className={`nav-menu-link nav-link-admin${isAdminRoute ? ' is-active-admin' : ''}`}
                >
                  <span className="nav-link-label">
                    <i className="zmdi zmdi-shield-security" style={{ fontSize: '17px' }}></i>
                    <span>Admin</span>
                  </span>
                </Link>
              </li>
            )}

            {/* ── Usuario / Login ── */}
            {isAuthenticated ? (
              <li className={`nav-menu-item${openSection === 'user' ? ' is-open' : ''}`} id="userSettings">
                <a
                  className={`nav-menu-link link-submenu${openSection === 'user' ? ' active' : ''}`}
                  href="#"
                  onClick={(e) => { e.preventDefault(); toggleSection('user') }}
                >
                  <span className="nav-link-label">
                    <i className="zmdi zmdi-account-circle" style={{ fontSize: '22px' }}></i>
                    <span className="nav-user-mobile-name">{user.username}</span>
                  </span>
                  <i className={`zmdi zmdi-chevron-${openSection === 'user' ? 'up' : 'down'} nav-chevron`}></i>
                </a>
                <div className="container-sub-menu-user" style={openSection === 'user' ? { maxHeight: '300px' } : {}}>
                  <ul className="sub-menu-ul">
                    <li className="nav-menu-item">
                      <span className="nav-menu-link user-status-row">
                        <span style={{ textTransform: 'uppercase', fontWeight: '700', color: '#0f172a' }}>
                          {user.username}
                        </span>
                        <span className="user-online-dot"></span>
                      </span>
                    </li>
                    <li className="nav-menu-item">
                      <Link to="/userSettings" className="nav-menu-link">
                        <span><i className="zmdi zmdi-settings" style={{ marginRight: '6px' }}></i> Configuración</span>
                      </Link>
                    </li>
                    <li className="nav-menu-item">
                      <a onClick={handleLogout} className="nav-menu-link user-logout-link" style={{ cursor: 'pointer' }}>
                        <span><i className="zmdi zmdi-power" style={{ marginRight: '6px' }}></i> Cerrar sesión</span>
                      </a>
                    </li>
                  </ul>
                </div>
              </li>
            ) : (
              <li className="nav-menu-item navbar-top-item nav-login-item">
                <Link to="/login" className="nav-menu-link nav-login-link">
                  <span className="nav-link-label">
                    <i className="zmdi zmdi-account" style={{ fontSize: '18px' }}></i>
                    <span>Iniciar sesión | Registrarme</span>
                  </span>
                </Link>
              </li>
            )}

          </ul>
        </nav>

      </nav>
    </header>
  )
}
