import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const { cartCount } = useCart()

  return (
    <header>
      <nav className="navbar">
        <header className="nabvar-mobile is-size-5-mobile">
          <div>
            <a href="#" id="btn-mobile" style={{ position: 'absolute' }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style={{ width: '30px' }}>
                <title>menu</title>
                <path d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z" />
              </svg>
            </a>
          </div>
          <div className="navbar-mobile-link" style={{ textAlign: 'center', fontWeight: '600 !important', width: '100%' }}>
            <Link className="is-uppercase has-text-black" to="/">
              Personalized Clothing
            </Link>
          </div>
          <div className="navbar-mobile-link has-text-black">
            <Link to="/cart" className="has-text-black">
              <i style={{ fontSize: '1em' }} className="zmdi zmdi-shopping-cart"></i>
            </Link>
          </div>
        </header>

        <nav className="nav-menu" id="mySidenav">
          <Link className="is-hidden-mobile brand is-uppercase has-text-weight-bold has-text-dark" style={{ width: '40%' }} to="/">
            Personalized Clothing
          </Link>
          <ul className="nav-menu-ul">
            <li className="nav-menu-item" id="men">
              <a className="nav-menu-link link-submenu active" href="#">
                Hombre <i className="zmdi zmdi-chevron-down"></i>
              </a>
              <div className="container-sub-menu">
                <ul className="sub-menu-ul">
                  <li className="nav-menu-item">
                    <a className="nav-menu-link" href="#">
                      <strong>Frio</strong>
                    </a>
                    <ul className="sub-menu-ul">
                      <li className="nav-menu-item">
                        <Link className="nav-menu-link" to="/items/category/3/1">
                          Sudaderas
                        </Link>
                      </li>
                      <li className="nav-menu-item">
                        <Link className="nav-menu-link" to="/items/category/4/1">
                          Sueters
                        </Link>
                      </li>
                    </ul>
                  </li>
                </ul>
                <ul className="sub-menu-ul">
                  <li className="nav-menu-item">
                    <a className="nav-menu-link" href="#">
                      <strong>Casual</strong>
                    </a>
                    <ul className="sub-menu-ul">
                      <li className="nav-menu-item">
                        <a className="nav-menu-link" href="#">
                          Joggers
                        </a>
                      </li>
                      <li className="nav-menu-item">
                        <Link className="nav-menu-link" to="/items/category/1/1">
                          Camisetas
                        </Link>
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
            <li className="nav-menu-item" id="women">
              <a style={{ color: 'black' }} href="#" className="nav-menu-link link-submenu">
                Mujer <i className="zmdi zmdi-chevron-down"></i>
              </a>
              <div className="container-sub-menu">
                <ul className="sub-menu-ul">
                  <li className="nav-menu-item">
                    <a className="nav-menu-link" href="#">
                      <strong>Frio</strong>
                    </a>
                    <ul className="sub-menu-ul">
                      <li className="nav-menu-item">
                        <Link className="nav-menu-link" to="/items/category/2/2">
                          Sudaderas
                        </Link>
                      </li>
                      <li className="nav-menu-item">
                        <Link className="nav-menu-link" to="/items/category/4/2">
                          Sueters
                        </Link>
                      </li>
                      <li className="nav-menu-item">
                        <Link className="nav-menu-link" to="/items/category/3/2">
                          Crops
                        </Link>
                      </li>
                    </ul>
                  </li>
                </ul>
                <ul className="sub-menu-ul">
                  <li className="nav-menu-item">
                    <a className="nav-menu-link" href="#">
                      <strong>Casual</strong>
                    </a>
                    <ul className="sub-menu-ul">
                      <li className="nav-menu-item">
                        <a className="nav-menu-link" href="#">
                          Joggers
                        </a>
                      </li>
                      <li className="nav-menu-item">
                        <Link className="nav-menu-link" to="/items/category/1/2">
                          Camisetas
                        </Link>
                      </li>
                      <li className="nav-menu-item">
                        <Link className="nav-menu-link" to="/items/category/4/2">
                          Crop tops
                        </Link>
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
            <li className="navbar-top-item">
              <Link to="/cart" style={{ color: 'black' }} className="nav-menu-link">
                <i style={{ marginRight: '6px', marginTop: '5px', fontSize: '19px' }} className="zmdi zmdi-shopping-cart"></i>
                <span>Carrito ({cartCount})</span>
              </Link>
            </li>

            {isAuthenticated && (
              <li className="navbar-top-item">
                <Link to="/buys" style={{ color: 'black' }} className="nav-menu-link">
                  <i className="zmdi zmdi-shopping-basket" style={{ color: 'black', fontSize: '19px', marginTop: '2px', marginRight: '3px' }}></i>
                  <span>Compras</span>
                </Link>
              </li>
            )}

            {isAdmin && (
              <li className="nav-menu-item" id="adminSettings">
                <a className="nav-menu-link link-submenu" href="#" style={{ color: 'black' }}>
                  <i className="zmdi zmdi-shield-security" style={{ color: 'black', fontSize: '19px', marginTop: '2px', marginRight: '3px' }}></i>
                  <span>Admin <i className="zmdi zmdi-chevron-down"></i></span>
                </a>
                <div className="container-sub-menu" style={{ minWidth: '150px' }}>
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

            {isAuthenticated ? (
              <li className="nav-menu-item" id="userSettings">
                <a className="nav-menu-link link-submenu" href="#">
                  <i className="zmdi zmdi-account-circle" style={{ color: 'black', marginRight: '6px', marginTop: '-2px', fontSize: '30px' }}></i>
                </a>
                <div className="container-sub-menu-user">
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
                      <a style={{ color: 'black', cursor: 'pointer' }} onClick={logout} className="nav-menu-link">
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
