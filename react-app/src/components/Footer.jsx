import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <>
      <footer className="footer">
        <div className="container">
          <div className="columns is-multiline">
            <div className="column">
              <ul className="footer-ul">
                <li className="footer-item">
                  <h3 className="has-text-weight-bold">Información</h3>
                </li>
                <li className="footer-item"><a className="footer-link" href="#">La marca</a></li>
                <li className="footer-item"><a className="footer-link" href="#">Local stores</a></li>
                <li className="footer-item"><a className="footer-link" href="#">Servicios </a></li>
                <li className="footer-item"><a className="footer-link" href="#">Privacidad y cookies</a></li>
                <li className="footer-item"><a className="footer-link" href="#">Mapa del sitio</a></li>
              </ul>
            </div>

            <div className="column">
              <ul className="footer-ul">
                <li className="footer-item">
                  <h3 className="has-text-weight-bold">Porqué comprar</h3>
                </li>
                <li className="footer-item"><a className="footer-link" href="#">Envios y retornos</a></li>
                <li className="footer-item"><a className="footer-link" href="#">Envios seguros</a></li>
                <li className="footer-item"><a className="footer-link" href="#">Testimonios </a></li>
                <li className="footer-item"><a className="footer-link" href="#">Award waining</a></li>
                <li className="footer-item"><a className="footer-link" href="#">Etival trading</a></li>
              </ul>
            </div>
            <div className="column">
              <ul className="footer-ul">
                <li className="footer-item">
                  <h3 className="has-text-weight-bold">Tu cuenta</h3>
                </li>
                <li className="footer-item"><Link className="footer-link" to="/login">Iniciar sesión</Link></li>
                <li className="footer-item"><Link className="footer-link" to="/register">Registro</Link></li>
                <li className="footer-item"><Link className="footer-link" to="/cart">Ver carrito</Link></li>
                <li className="footer-item"><Link className="footer-link" to="/items">Ver catálogo</Link></li>
                <li className="footer-item"><a className="footer-link" href="#">Track an order</a></li>
              </ul>
            </div>
            <div className="column">
              <ul className="footer-ul">
                <li className="footer-item">
                  <h3 className="has-text-weight-bold">Catalogo</h3>
                </li>
                <li className="footer-item"><Link className="footer-link" to="/items/clasification/1">Catálogo para hombres</Link></li>
                <li className="footer-item"><Link className="footer-link" to="/items/clasification/2">Catálogo para mujeres</Link></li>
                <li className="footer-item"><a className="footer-link" href="#">Ver tu Catalogo </a></li>
                <li className="footer-item"><a className="footer-link" href="#">Privacidad y cookies</a></li>
                <li className="footer-item"><a className="footer-link" href="#">Borrar tu catalogo</a></li>
              </ul>
            </div>
            <div className="column">
              <ul className="footer-ul">
                <li className="footer-item">
                  <h3 className="has-text-weight-bold">Datos de contacto</h3>
                </li>
                <li className="footer-item"><a className="footer-link" href="#">Head</a></li>
                <li className="footer-item"><Link className="footer-link" to="/items/clasification/2">Catálogo para mujeres</Link></li>
                <li className="footer-item"><a className="footer-link" href="#">Ver tu Catalogo </a></li>
                <li className="footer-item"><a className="footer-link" href="#">Privacidad y cookies</a></li>
                <li className="footer-item"><a className="footer-link" href="#">Borrar tu catalogo</a></li>
              </ul>
            </div>
            <div className="column is-full">
              <div className="footer-socials">
                <a className="footer-solcials-link" href="https://www.facebook.com/PersonalizedCloth1ng" target="_blank" rel="noreferrer"><i className="zmdi zmdi-facebook"></i></a>
                <a className="footer-solcials-link" href="#"><i className="zmdi zmdi-twitter"></i></a>
                <a className="footer-solcials-link" href="https://www.instagram.com/personalizedclothing_/" target="_blank" rel="noreferrer"><i className="zmdi zmdi-instagram"></i></a>
                <a className="footer-solcials-link" href="#"><i className="zmdi zmdi-pinterest"></i></a>
              </div>
            </div>
          </div>
        </div>
      </footer>
      <div className="footer-bar-top">
        <div className="container">
          <a className="footer-bar-top-links" href="#">© 2023 Copyright: Personalized Clothing</a>
        </div>
      </div>
    </>
  )
}
