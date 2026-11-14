import { Link } from 'react-router-dom'
import ItemCard from '../components/ItemCard'

export default function Home() {
  // Hardcoded items to match the original index.html
  const featuredItems = [
    {
      id_item: 36,
      name: 'Sudadera Jocker joaquin Phoenix',
      price: 580,
      image: 'item-1.png'
    },
    {
      id_item: 5,
      name: 'Camiseta de Dama Anime',
      price: 270,
      image: 'item-2.png'
    },
    {
      id_item: 7,
      name: 'Sueter Rick and Morty',
      price: 580,
      image: 'item-3.png'
    },
    {
      id_item: 1,
      name: 'Camiseta de Naruto Shippuden',
      price: 240,
      image: 'item-4.png'
    },
    {
      id_item: 6,
      name: 'Croptop Cereza Fire',
      price: 240,
      image: 'item-6.png'
    }
  ]

  return (
    <>
      <style>{`
        .banner-cover {
          position: relative;
          height: calc(100vh - 60px) !important;
        }
        .banner-container { z-index: 2; }
        .banner-container .title-cover {
          margin-top: 180px !important;
        }
        .slider-frame ul {
          width: 400% !important;
          height: 100%;
          animation: slide 28s infinite alternate ease-in-out !important;
        }
        .slider-frame li { width: 100%; height: 100%; }
        .slider-frame picture img { width: 100%; height: auto !important; display: block; }
        .slider-frame video { width: 100%; height: 100%; object-fit: cover; display: block; }
        .banner-cta-group {
          position: absolute;
          bottom: 32px;
          right: 48px;
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 18px;
        }
        .banner .banner-cta-group .banner-btn-item {
          position: relative !important;
          left: auto !important;
          top: auto !important;
          transform: none !important;
        }
        .btn-personalizar-cta {
          position: relative;
          display: inline-flex !important;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 20px 26px !important;
          min-width: 250px;
          background: linear-gradient(135deg, #10b981 0%, #059669 50%, #00c8c8 100%) !important;
          color: #ffffff !important;
          font-weight: 800;
          font-size: 14px;
          letter-spacing: 2px;
          text-transform: uppercase;
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.35);
          box-shadow: 0 10px 28px rgba(16, 185, 129, 0.45);
          overflow: hidden;
          animation: ctaPulseGlow 2.4s infinite ease-in-out;
          transition: transform 0.25s ease, box-shadow 0.25s ease, filter 0.25s ease;
        }
        .btn-personalizar-cta:hover {
          transform: translateY(-3px) scale(1.03) !important;
          box-shadow: 0 14px 34px rgba(0, 200, 200, 0.6) !important;
          filter: brightness(1.08);
          color: #ffffff !important;
        }
        .btn-personalizar-glow {
          position: absolute;
          top: 0;
          left: -100%;
          width: 60%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.38), transparent);
          transform: skewX(-20deg);
          animation: ctaShine 3.2s infinite;
          pointer-events: none;
        }
        .btn-personalizar-badge {
          background: #ffffff;
          color: #047857;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.8px;
          padding: 3px 7px;
          border-radius: 999px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
        }
        @keyframes ctaShine {
          0% { left: -100%; }
          45%, 100% { left: 160%; }
        }
        @keyframes ctaPulseGlow {
          0%, 100% { box-shadow: 0 10px 28px rgba(16, 185, 129, 0.45), 0 0 0 0 rgba(16, 185, 129, 0.55); }
          50% { box-shadow: 0 12px 32px rgba(0, 200, 200, 0.55), 0 0 0 8px rgba(16, 185, 129, 0); }
        }
        @media only screen and (max-width: 900px) {
          .banner-cover {
            height: auto !important;
          }
          .banner-container .title-cover {
            margin-top: 0 !important;
          }
        }
        @media (max-width: 768px) {
          .banner-cta-group {
            right: 50%;
            transform: translateX(50%);
            bottom: 24px;
            flex-direction: column;
            gap: 10px;
            width: 90%;
          }
          .btn-personalizar-cta, .banner-cta-group .h-button {
            width: 100% !important;
            min-width: 0;
            padding: 14px 18px !important;
          }
        }
      `}</style>
      <div className="banner banner-cover">
        <div className="banner-container">
          <h1 className="title-cover is-mobile-logo">
            <img className="img-logo" src="https://res.cloudinary.com/dzlbg8ni6/image/upload/v1639170003/1639108673441_sxs4vh.png" alt="Logo" />
          </h1>
          <div className="banner-cta-group">
            <Link aria-label="Ver catalogo" className="btn h-button banner-btn-item" data-text="Ver catalogo" to="/items">
              <span>v</span><span>a</span><span>m</span><span>o</span><span>s</span><span>!</span>
            </Link>
            <Link aria-label="Personalizar" className="btn btn-personalizar-cta banner-btn-item" to="/personalizar">
              <span className="btn-personalizar-glow"></span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="btn-personalizar-icon">
                <path d="M12 19l7-7 3 3-7 7-3-3z"/>
                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
                <path d="M2 2l7.586 7.586"/>
                <circle cx="11" cy="11" r="2"/>
              </svg>
              <span className="btn-personalizar-text">Personalizar</span>
              <span className="btn-personalizar-badge">¡Nuevo!</span>
            </Link>
          </div>
        </div>
        <div className="slider-frame">
          <ul>
            <li>
              <video
                className="slider-video"
                src="/img/video1_fondo.mp4"
                autoPlay
                muted
                loop
                playsInline
              />
            </li>
            <li>
              <picture>
                <source srcSet="/img/back-main.jpg" media="(min-width: 1024px)" />
                <source srcSet="/img/back-main.jpg" media="(min-width: 768px)" />
                <source srcSet="/img/back2-mob.jpg" media="(min-width: 377px)" />
                <img src="/img/back2-mob.jpg" alt="slide" />
              </picture>
            </li>
            <li>
              <picture>
                <source srcSet="/img/back3-main.jpg" media="(min-width: 1024px)" />
                <source srcSet="/img/back3-main.jpg" media="(min-width: 768px)" />
                <source srcSet="/img/back3-mob.jpg" media="(min-width: 377px)" />
                <img src="/img/back3-mob.jpg" alt="slide" />
              </picture>
            </li>
            <li>
              <picture>
                <source srcSet="/img/back4-main.jpg" media="(min-width: 1024px)" />
                <source srcSet="/img/back4-main.jpg" media="(min-width: 768px)" />
                <source srcSet="/img/back4-mob.jpg" media="(min-width: 377px)" />
                <img src="/img/back-mob.jpg" alt="slide" />
              </picture>
            </li>
          </ul>
        </div>
      </div>

      <div className="container">
        <nav className="nav">
          <a className="nav-item active has-text-weight-semibold" href="#">Popular</a>
          <a className="nav-item has-text-weight-semibold" href="#">Novedades</a>
          <a className="nav-item has-text-weight-semibold" href="#">Más vendidos</a>
          <a className="nav-item has-text-weight-semibold" href="#">Ofertas</a>
          <a className="nav-item has-text-weight-semibold" href="#">Muy pronto</a>
        </nav>
      </div>

      <div className="container">
        <div className="columns is-multiline">
          <div className="column is-full-mobile">
            <div className="columns is-centered is-mobile is-multiline">
              <div className="column is-half column-full">
                <ItemCard item={featuredItems[0]} />
              </div>
              <div className="column column-full is-half">
                <ItemCard item={featuredItems[1]} />
              </div>
              <div className="column is-full">
                <ItemCard item={featuredItems[2]} />
              </div>
            </div>
          </div>

          <div className="column is-half is-full-mobile">
            <div className="columns is-mobile is-multiline">
              <div className="column is-full">
                <ItemCard item={featuredItems[3]} />
              </div>
              <div className="column column-full is-half">
                <div className="card">
                  <span className="price">C$270</span>
                  <img src="/img/item-5.png" alt="Crop Top" />
                  <div className="card-info">
                    <h4 className="has-text-black has-text-centered has-text-weight-bold">Crop Top Amarillo Planeta C$270</h4>
                    <p className="has-text-centered">Croptop Casual para dama color amarillo 100% cotton.</p>
                    <div className="card-buttons">
                      <a href="#" className="btn btn--mini-rounded"><i className="zmdi zmdi-shopping-cart"></i></a>
                      <a href="#" className="btn btn--mini-rounded"><i className="zmdi zmdi-favorite-outline"></i></a>
                    </div>
                  </div>
                </div>
              </div>
              <div className="column column-full is-half">
                <ItemCard item={featuredItems[4]} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container container-full">
        <div className="columns is-centered is-multiline">
          <div className="column is-full">
            <div className="separator"></div>
          </div>
          <div className="column is-half-tablet is-one-third-desktop column-half">
            <div className="card card-second">
              <img className="card-second-image" src="/img/SeccionCabelleroF.png" alt="" />
              <div className="card-second-body --text-right">
                <h1 className="has-text-right is-size-4 has-text-weight-semibold-bold">Catálogo de Caballero</h1>
                <p className="has-text-right">La moda masculina es sutil. Se trata de un buen estilo y un buen gusto.</p>
                <div>
                  <Link to="/items/clasification/1" className="btn btn-default is-size-7">Ver ahora</Link>
                </div>
              </div>
            </div>
          </div>
          <div className="column is-half-tablet is-one-third-desktop column-half">
            <div className="card card-second">
              <img className="card-second-image" src="/img/Women.png" alt="" />
              <div className="card-second-body --text-right">
                <h1 className="has-text-right is-size-4 has-text-weight-semibold-bold">Catálogo de Dama</h1>
                <p className="has-text-right">Cambiá tu estilo, Cambiá tu vida No dejes para mañana, lo que puedes comprar hoy.</p>
                <div>
                  <Link to="/items/clasification/2" className="btn btn-default is-size-7">Ver ahora</Link>
                </div>
              </div>
            </div>
          </div>
          <div className="column is-half-tablet is-one-third-desktop column-half">
            <div className="card card-second">
              <img className="card-second-image" src="/img/Kids.png" alt="" />
              <div className="card-second-body --text-right">
                <h1 className="has-text-right is-size-4 has-text-weight-semibold-bold">Catálogo de Niños</h1>
                <p className="has-text-right">Lo tavieso no lo cambiará, <br /> pero su estilo en ropa si será ejemplar.</p>
                <div>
                  <Link to="/items/clasification/3" className="btn btn-default is-size-7">Ver ahora</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
