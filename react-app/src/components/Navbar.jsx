import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const { cartCount } = useCart()
  const location = useLocation()

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
    <header>
      <nav className="navbar">

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

          <div className="navbar-mobile-link" style={{ textAlign: 'center', fontWeight: '600', width: '100%' }}>
            <Link className="is-uppercase has-text-black" to="/">
              Personalized Clothing
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
              fontSize: '24px',
              lineHeight: 1,
              color: '#333',
            }}
          >
            ✕
          </button>

          {/* Logo (solo escritorio) */}
          <Link
            className="is-hidden-mobile brand is-uppercase has-text-weight-bold has-text-dark"
            style={{ width: '40%' }}
            to="/"
          >
            Personalized Clothing
          </Link>

          <ul className="nav-menu-ul">

            {/* ── Hombre ── */}
            <li className="nav-menu-item" id="men">
              <a
                className={`nav-menu-link link-submenu${openSection === 'men' ? ' active' : ''}`}
                href="#"
                onClick={(e) => { e.preventDefault(); toggleSection('men') }}
              >
                Hombre <i className={`zmdi zmdi-chevron-${openSection === 'men' ? 'up' : 'down'}`}></i>
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
            <li className="nav-menu-item" id="women">
              <a
                style={{ color: 'black' }}
                href="#"
                className={`nav-menu-link link-submenu${openSection === 'women' ? ' active' : ''}`}
                onClick={(e) => { e.preventDefault(); toggleSection('women') }}
              >
                Mujer <i className={`zmdi zmdi-chevron-${openSection === 'women' ? 'up' : 'down'}`}></i>
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
              <Link style={{ color: 'black' }} to="/personalizar" className="nav-menu-link">
                <img
                  style={{ marginTop: '1px', width: '18px' }}
                  src="https://res.cloudinary.com/dzlbg8ni6/image/upload/v1639114295/paintbrush_83820_rycmmh.png"
                  alt="paintbrush"
                />
                <span>Personalizar</span>
              </Link>
            </li>

            {/* ── Carrito ── */}
            <li className="navbar-top-item">
              <Link to="/cart" style={{ color: 'black' }} className="nav-menu-link">
                <i style={{ marginRight: '6px', marginTop: '5px', fontSize: '19px' }} className="zmdi zmdi-shopping-cart"></i>
                <span>Carrito ({cartCount})</span>
              </Link>
            </li>

            {/* ── Compras (solo autenticado) ── */}
            {isAuthenticated && (
              <li className="navbar-top-item">
                <Link to="/buys" style={{ color: 'black' }} className="nav-menu-link">
                  <i className="zmdi zmdi-shopping-basket" style={{ color: 'black', fontSize: '19px', marginTop: '2px', marginRight: '3px' }}></i>
                  <span>Compras</span>
                </Link>
              </li>
            )}

            {/* ── Admin (solo admin) ── */}
            {isAdmin && (
              <li className="nav-menu-item" id="adminSettings">
                <a
                  className={`nav-menu-link link-submenu${openSection === 'admin' ? ' active' : ''}`}
                  href="#"
                  style={{ color: 'black' }}
                  onClick={(e) => { e.preventDefault(); toggleSection('admin') }}
                >
                  <i className="zmdi zmdi-shield-security" style={{ color: 'black', fontSize: '19px', marginTop: '2px', marginRight: '3px' }}></i>
                  <span>Admin <i className={`zmdi zmdi-chevron-${openSection === 'admin' ? 'up' : 'down'}`}></i></span>
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
              <li className="nav-menu-item" id="userSettings">
                <a
                  className={`nav-menu-link link-submenu${openSection === 'user' ? ' active' : ''}`}
                  href="#"
                  onClick={(e) => { e.preventDefault(); toggleSection('user') }}
                >
                  <i className="zmdi zmdi-account-circle" style={{ color: 'black', marginRight: '6px', marginTop: '-2px', fontSize: '30px' }}></i>
                  <i className={`zmdi zmdi-chevron-${openSection === 'user' ? 'up' : 'down'}`}></i>
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
