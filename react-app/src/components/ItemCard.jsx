import { Link } from 'react-router-dom'
import Swal from 'sweetalert2'
import { useCart } from '../context/CartContext'

export default function ItemCard({ item }) {
  const { addToCart } = useCart()

  // Normaliza tanto si Flask devuelve array como objeto
  const name    = item.name        || item[1] || item[0]
  const price   = item.price       || item[4] || item[1] || 0
  const image   = item.image       || item[3] || item[2]
  const id_item = item.id_item     || item[0] || item[4]

  const imgSrc = image?.startsWith('http') ? image : `/img/${image}`

  const handleAddToCart = (e) => {
    e.preventDefault()
    addToCart({
      id_item,
      name,
      price,
      image,
      quantity: 1,
      size: 'M',
      color: 'Negro',
    })
    Swal.fire({
      icon: 'success',
      title: '¡Añadido!',
      text: 'El artículo ha sido añadido al carrito.',
      timer: 1500,
      showConfirmButton: false,
    })
  }

  return (
    <div className="item-card">
      {/* imagen */}
      <Link to={`/items/${id_item}`} className="item-card__img-wrap">
        <img
          src={imgSrc}
          alt={name}
          className="item-card__img"
          loading="lazy"
          onError={(e) => { e.target.style.display = 'none' }}
        />
        <span className="item-card__price">C${price}</span>
      </Link>

      {/* info */}
      <div className="item-card__body">
        <h3 className="item-card__name">{name}</h3>
        <p className="item-card__sub">100% algodón</p>

        <div className="item-card__actions">
          <button
            onClick={handleAddToCart}
            className="item-card__btn"
            title="Agregar al carrito"
          >
            <i className="zmdi zmdi-shopping-cart"></i>
          </button>

          <a
            href={`https://wa.me/50589154885?text=${encodeURIComponent(`Hola, quiero ordenar el artículo ${name} con ID ${id_item}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="item-card__btn"
            title="Solicitar por WhatsApp"
            style={{ color: '#25D366' }}
          >
            <i className="zmdi zmdi-whatsapp"></i>
          </a>

          <button className="item-card__btn" title="Favorito">
            <i className="zmdi zmdi-favorite-outline"></i>
          </button>

          <Link to={`/items/${id_item}`} className="item-card__btn" title="Ver detalle">
            <i className="zmdi zmdi-eye"></i>
          </Link>
        </div>
      </div>
    </div>
  )
}
