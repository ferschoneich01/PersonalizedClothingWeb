import { Link } from 'react-router-dom'
import Swal from 'sweetalert2'
import { useCart } from '../context/CartContext'

export default function ItemCard({ item }) {
  const { addToCart } = useCart()

  const handleAddToCart = (e) => {
    e.preventDefault()
    // For simplicity, defaulting to 1 quantity and no specific color/size for now,
    // in product detail it can be selected properly.
    addToCart({
      id_item: item.id_item || item[4] || item[5], // Handle array from flask or json obj
      name: item.name || item[0],
      price: item.price || item[1],
      image: item.image || item[2] || item[3] || item[4],
      quantity: 1,
      size: 'M',
      color: 'Negro'
    })
    
    Swal.fire({
      icon: 'success',
      title: '¡Añadido!',
      text: 'El artículo ha sido añadido al carrito.',
      timer: 1500,
      showConfirmButton: false
    })
  }

  // Fallbacks if data comes as array (like Flask returned) or object (API directly)
  const name = item.name || item[0]
  const price = item.price || item[1] || 0
  const image = item.image || item[3] || item[4] || item[2]
  const id_item = item.id_item || item[4] || item[5] || item[0]

  return (
    <div className="card">
      <span className="price">C${price}</span>
      <img src={image?.startsWith('http') ? image : `/img/${image}`} alt={name} />
      <div className="card-info">
        <h4 className="has-text-black has-text-centered has-text-weight-bold">
          {name} C${price}
        </h4>
        <p className="has-text-centered">100% cotton.</p>
        <div className="card-buttons">
          <a href="#" onClick={handleAddToCart} className="btn btn--mini-rounded">
            <i className="zmdi zmdi-shopping-cart"></i>
          </a>
          <a href="#" className="btn btn--mini-rounded">
            <i className="zmdi zmdi-favorite-outline"></i>
          </a>
          <Link to={`/items/${id_item}`} className="btn btn--mini-rounded">
            <i className="zmdi zmdi-eye"></i>
          </Link>
        </div>
      </div>
    </div>
  )
}
