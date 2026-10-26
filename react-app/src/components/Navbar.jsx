import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const { cartCount } = useCart()
  const location = useLocation()
  const isPersonalizar = location.pathname === '/personalizar'

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [openSection, setOpenSection] = useState(null) // 'men' | 'women' | 'admin' | 'user'

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
    <header style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <nav className="navbar" style={{ backgroundColor: '#ffffff', minHeight: '65px' }}>

        {/* ── Barra móvil (visible solo en móvil) ── */}
        <header className="nabvar-mobile is-size-5-mobile">
          <div>
            <button
              id="btn-mobile"
              onClick={toggleDrawer}
              aria-label="Abrir menú"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style={{ width: '30px' }}>
                <title>menu</title>
                <path d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z" />
              </svg>
            </button>
          </div>

          <div className="navbar-mobile-link" style={{ textAlign: 'center', width: '100%', display: 'flex', justifyContent: 'center' }}>
            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                textDecoration: 'none',
              }}
            >
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                  flexShrink: 0,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z"/>
                </svg>
              </div>
              <span style={{ fontWeight: '800', letterSpacing: '0.6px', fontSize: '13px', color: '#0f172a' }}>
                PERSONALIZED <span style={{ color: '#10b981' }}>CLOTHING</span>
              </span>
            </Link>
          </div>

          <div className="navbar-mobile-link has-text-black">
            <Link to="/cart" className="has-text-black" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <i style={{ fontSize: '1.2em' }} className="zmdi zmdi-shopping-cart"></i>
              {cartCount > 0 && (
                <span style={{
                  background: '#e53e3e',
                  color: 'white',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  fontSize: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                }}>
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </header>

        {/* ── Overlay oscuro al abrir drawer ── */}
        {drawerOpen && (
          <div
            onClick={closeDrawer}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.45)',
              zIndex: 99,
            }}
          />
        )}

        {/* ── Drawer / Nav Menu ── */}
        <nav
          className={`nav-menu${drawerOpen ? ' openOffCanvas' : ''}`}
          id="mySidenav"
          aria-label="Menú principal"
        >
          {/* Botón cerrar (solo visible en móvil dentro del drawer) */}
          <button
            onClick={closeDrawer}
            className="drawer-close-btn"
            aria-label="Cerrar menú"
            style={{
              position: 'absolute',
              top: '12px',
              right: '14px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px',
              color: '#334155',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Logo con Emblema (solo escritorio) */}
          <Link
            className="is-hidden-mobile brand"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '9px', textDecoration: 'none', flexShrink: 0 }}
            to="/"
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '7px',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
                flexShrink: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z"/>
              </svg>
            </div>
            <span style={{ fontWeight: '800', letterSpacing: '0.8px', fontSize: '15px', color: '#0f172a' }}>
              PERSONALIZED <span style={{ color: '#10b981' }}>CLOTHING</span>
            </span>
          </Link>

          <ul className="nav-menu-ul" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>

            {/* ── Hombre ── */}
            <li className={`nav-menu-item${openSection === 'men' ? ' is-open' : ''}`} id="men">
              <a
                className={`nav-menu-link link-submenu${openSection === 'men' ? ' active' : ''}`}
                href="#"
                style={{ color: '#0f172a', fontWeight: '600', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 10px' }}
                onClick={(e) => { e.preventDefault(); toggleSection('men') }}
              >
                <span>Hombre</span>
                <i className={`zmdi zmdi-chevron-${openSection === 'men' ? 'up' : 'down'}`} style={{ fontSize: '13px', opacity: 0.7 }}></i>
              </a>
              <div className="container-sub-menu" style={openSection === 'men' ? { maxHeight: '500px' } : {}}>
                <ul className="sub-menu-ul">
                  <li className="nav-menu-item">
                    <a className="nav-menu-link" href="#"><strong>Frío</strong></a>
                    <ul className="sub-menu-ul">
                      <li className="nav-menu-item">
                        <Link className="nav-menu-link" to="/items/category/3/1">Sudaderas</Link>
                      </li>
                      <li className="nav-menu-item">
                        <Link className="nav-menu-link" to="/items/category/4/1">Suéteres</Link>
                      </li>
                    </ul>
                  </li>
                </ul>
                <ul className="sub-menu-ul">
                  <li className="nav-menu-item">
                    <a className="nav-menu-link" href="#"><strong>Casual</strong></a>
                    <ul className="sub-menu-ul">
                      <li className="nav-menu-item">
                        <a className="nav-menu-link" href="#">Joggers</a>
                      </li>
                      <li className="nav-menu-item">
                        <Link className="nav-menu-link" to="/items/category/1/1">Camisetas</Link>
                      </li>
                    </ul>
                  </li>
                </ul>
                <div className="ads is-hidden-touch">
                  <h1 className="ads-h1">Ofertas de Verano</h1>
                  <h2 className="ads-h2">Desde el 15% de descuento</h2>
                </div>
              </div>
            </li>

            {/* ── Mujer ── */}
            <li className={`nav-menu-item${openSection === 'women' ? ' is-open' : ''}`} id="women">
              <a
                href="#"
                className={`nav-menu-link link-submenu${openSection === 'women' ? ' active' : ''}`}
                style={{ color: '#0f172a', fontWeight: '600', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 10px' }}
                onClick={(e) => { e.preventDefault(); toggleSection('women') }}
              >
                <span>Mujer</span>
                <i className={`zmdi zmdi-chevron-${openSection === 'women' ? 'up' : 'down'}`} style={{ fontSize: '13px', opacity: 0.7 }}></i>
              </a>
              <div className="container-sub-menu" style={openSection === 'women' ? { maxHeight: '500px' } : {}}>
                <ul className="sub-menu-ul">
                  <li className="nav-menu-item">
                    <a className="nav-menu-link" href="#"><strong>Frío</strong></a>
                    <ul className="sub-menu-ul">
                      <li className="nav-menu-item">
                        <Link className="nav-menu-link" to="/items/category/2/2">Sudaderas</Link>
                      </li>
                      <li className="nav-menu-item">
                        <Link className="nav-menu-link" to="/items/category/4/2">Suéteres</Link>
                      </li>
                      <li className="nav-menu-item">
                        <Link className="nav-menu-link" to="/items/category/3/2">Crops</Link>
                      </li>
                    </ul>
                  </li>
                </ul>
                <ul className="sub-menu-ul">
                  <li className="nav-menu-item">
                    <a className="nav-menu-link" href="#"><strong>Casual</strong></a>
                    <ul className="sub-menu-ul">
                      <li className="nav-menu-item">
                        <a className="nav-menu-link" href="#">Joggers</a>
                      </li>
                      <li className="nav-menu-item">
                        <Link className="nav-menu-link" to="/items/category/1/2">Camisetas</Link>
                      </li>
                      <li className="nav-menu-item">
                        <Link className="nav-menu-link" to="/items/category/4/2">Crop tops</Link>
                      </li>
                    </ul>
                  </li>
                </ul>
                <div className="ads is-hidden-touch">
                  <h1 className="ads-h1">Ofertas de Verano</h1>
                  <h2 className="ads-h2">Desde el 15% de descuento</h2>
                </div>
              </div>
            </li>

            {/* ── Personalizar ── */}
            <li className="nav-menu-item">
              <Link
                to="/personalizar"
                className="nav-menu-link"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px',
                  fontWeight: isPersonalizar ? '700' : '600',
                  color: isPersonalizar ? '#047857' : '#0f172a',
                  backgroundColor: isPersonalizar ? '#f0fdf4' : 'transparent',
                  border: isPersonalizar ? '1.5px solid #a7f3d0' : '1.5px solid transparent',
                  borderRadius: '20px',
                  padding: '5px 12px',
                  transition: 'all 0.15s ease',
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={isPersonalizar ? '#059669' : '#0f172a'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 19l7-7 3 3-7 7-3-3z"/>
                  <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
                  <path d="M2 2l7.586 7.586"/>
                  <circle cx="11" cy="11" r="2"/>
                </svg>
                <span>Personalizar</span>
              </Link>
            </li>

            {/* ── Carrito ── */}
            <li className="navbar-top-item">
              <Link
                to="/cart"
                className="nav-menu-link"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#0f172a',
                  padding: '6px 10px',
                }}
              >
                <i className="zmdi zmdi-shopping-cart" style={{ fontSize: '18px', color: '#0f172a' }}></i>
                <span>Carrito ({cartCount})</span>
              </Link>
            </li>

            {/* ── Compras (solo autenticado) ── */}
            {isAuthenticated && (
              <li className="navbar-top-item">
                <Link
                  to="/buys"
                  className="nav-menu-link"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#0f172a',
                    padding: '6px 10px',
                  }}
                >
                  <i className="zmdi zmdi-shopping-basket" style={{ fontSize: '17px', color: '#0f172a' }}></i>
                  <span>Compras</span>
                </Link>
              </li>
            )}

            {/* ── Admin (solo admin) ── */}
            {isAdmin && (
              <li className={`nav-menu-item${openSection === 'admin' ? ' is-open' : ''}`} id="adminSettings">
                <a
                  className={`nav-menu-link link-submenu${openSection === 'admin' ? ' active' : ''}`}
                  href="#"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#0f172a',
                    padding: '6px 10px',
                  }}
                  onClick={(e) => { e.preventDefault(); toggleSection('admin') }}
                >
                  <i className="zmdi zmdi-shield-security" style={{ fontSize: '17px', color: '#0f172a' }}></i>
                  <span>Admin</span>
                  <i className={`zmdi zmdi-chevron-${openSection === 'admin' ? 'up' : 'down'}`} style={{ fontSize: '13px', opacity: 0.7 }}></i>
                </a>
                <div className="container-sub-menu" style={{ minWidth: '150px', ...(openSection === 'admin' ? { maxHeight: '300px' } : {}) }}>
                  <ul className="sub-menu-ul">
                    <li className="nav-menu-item">
                      <Link className="nav-menu-link" to="/admin/orders">
                        <strong><i className="zmdi zmdi-library" style={{ marginRight: '5px' }}></i> Pedidos</strong>
                      </Link>
                    </li>
                    <li className="nav-menu-item">
                      <Link className="nav-menu-link" to="/admin/shippings">
                        <strong><i className="zmdi zmdi-local-shipping" style={{ marginRight: '5px' }}></i> Envíos</strong>
                      </Link>
                    </li>
                    <li className="nav-menu-item">
                      <Link className="nav-menu-link" to="/admin/addItem">
                        <strong><i className="zmdi zmdi-plus-circle" style={{ marginRight: '5px' }}></i> Add Producto</strong>
                      </Link>
                    </li>
                  </ul>
                </div>
              </li>
            )}

            {/* ── Usuario / Login ── */}
            {isAuthenticated ? (
              <li className={`nav-menu-item${openSection === 'user' ? ' is-open' : ''}`} id="userSettings">
                <a
                  className={`nav-menu-link link-submenu${openSection === 'user' ? ' active' : ''}`}
                  href="#"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 8px',
                    color: '#0f172a',
                  }}
                  onClick={(e) => { e.preventDefault(); toggleSection('user') }}
                >
                  <i className="zmdi zmdi-account-circle" style={{ fontSize: '24px', color: '#0f172a' }}></i>
                  <i className={`zmdi zmdi-chevron-${openSection === 'user' ? 'up' : 'down'}`} style={{ fontSize: '13px', opacity: 0.7 }}></i>
                </a>
                <div className="container-sub-menu-user" style={openSection === 'user' ? { display: 'block', maxHeight: '300px' } : {}}>
                  <ul className="sub-menu-ul">
                    <li className="nav-menu-item">
                      <a style={{ color: 'black', fontWeight: '600' }} className="nav-menu-link">
                        <span style={{ marginLeft: '20px', marginRight: '8px', textTransform: 'uppercase' }}>
                          {user.username}
                        </span>
                        <div style={{ marginTop: '5px', width: '8px', height: '8px', backgroundColor: 'rgb(71, 235, 71)', borderRadius: '50%' }}></div>
                      </a>
                    </li>
                    <li className="nav-menu-item">
                      <Link style={{ color: 'black' }} to="/userSettings" className="nav-menu-link">
                        <span style={{ marginLeft: '20px' }}>Configuración</span>
                      </Link>
                    </li>
                    <li className="nav-menu-item">
                      <a style={{ color: 'black', cursor: 'pointer' }} onClick={handleLogout} className="nav-menu-link">
                        <span style={{ color: 'red', marginLeft: '20px' }}>Logout</span>
                      </a>
                    </li>
                  </ul>
                </div>
              </li>
            ) : (
              <li className="navbar-top-item">
                <Link to="/login" className="nav-menu-link active">
                  Iniciar sesión | Registrarme
                </Link>
              </li>
            )}

          </ul>
        </nav>

      </nav>
    </header>
  )
}
