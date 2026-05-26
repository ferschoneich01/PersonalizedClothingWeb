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
      <div className="banner banner-cover">
        <div className="banner-container">
          <h1 className="title-cover is-mobile-logo">
            <img className="img-logo" src="https://res.cloudinary.com/dzlbg8ni6/image/upload/v1639170003/1639108673441_sxs4vh.png" alt="Logo" />
          </h1>
          <Link aria-label="Thanks" className="btn h-button centered" data-text="Ver catalogo" to="/items">
            <span>v</span><span>a</span><span>m</span><span>o</span><span>s</span><span>!</span>
          </Link>
        </div>
        <div className="slider-frame">
          <ul>
            <li>
              <picture>
                <source srcSet="/img/back2-main.jpg" media="(min-width: 1024px)" />
                <source srcSet="/img/back2-main.jpg" media="(min-width: 768px)" />
                <source srcSet="/img/back-mob.jpg" media="(min-width: 377px)" />
                <img src="/img/back-mob.jpg" alt="slide" />
              </picture>
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
