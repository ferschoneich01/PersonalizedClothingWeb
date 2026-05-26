import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import Swal from 'sweetalert2'

export default function Cart() {
  const { cartItems, removeFromCart, clearCart, cartTotal } = useCart()
  const navigate = useNavigate()

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Carrito vacío',
        text: 'Agrega un artículo al carrito de compras.'
      })
      return
    }
    navigate('/payMethod')
  }

  return (
    <div className="container" style={{ marginTop: '50px', marginBottom: '50px', minHeight: '60vh' }}>
      <h1 className="title is-2 has-text-black has-text-centered">Tu Carrito</h1>
      
      {cartItems.length === 0 ? (
        <div className="has-text-centered">
          <p style={{ margin: '20px 0' }}>No tienes artículos en tu carrito.</p>
          <Link to="/items" className="button is-dark">Ir al catálogo</Link>
        </div>
      ) : (
        <>
          <table className="table is-fullwidth is-hoverable" style={{ marginTop: '30px' }}>
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Producto</th>
                <th>Talla / Color</th>
                <th>Precio</th>
                <th>Cantidad</th>
                <th>Total</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => (
                <tr key={item.cartId}>
                  <td>
                    <img 
                      src={item.image?.startsWith('http') ? item.image : `/img/${item.image}`} 
                      alt={item.name} 
                      style={{ width: '50px', borderRadius: '4px', cursor: 'pointer' }} 
                      onClick={() => Swal.fire({
                        imageUrl: item.image?.startsWith('http') ? item.image : `/img/${item.image}`,
                        imageAlt: item.name,
                        showConfirmButton: false,
                        showCloseButton: true,
                        width: 'auto',
                        padding: '1em'
                      })}
                      title="Haz clic para ver completo"
                    />
                  </td>
                  <td style={{ verticalAlign: 'middle' }}>{item.name}</td>
                  <td style={{ verticalAlign: 'middle' }}>{item.size} / {item.color}</td>
                  <td style={{ verticalAlign: 'middle' }}>C${item.price}</td>
                  <td style={{ verticalAlign: 'middle' }}>{item.quantity}</td>
                  <td style={{ verticalAlign: 'middle', fontWeight: 'bold' }}>C${item.price * item.quantity}</td>
                  <td style={{ verticalAlign: 'middle' }}>
                    <button 
                      className="button is-danger is-small" 
                      onClick={() => removeFromCart(item.cartId)}
                    >
                      X
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="columns is-vcentered" style={{ marginTop: '30px' }}>
            <div className="column is-half">
              <button className="button is-light" onClick={clearCart}>Vaciar Carrito</button>
            </div>
            <div className="column is-half has-text-right">
              <h3 className="title is-4">Total: C${cartTotal}</h3>
              <button className="button is-success is-medium" onClick={handleCheckout}>
                Proceder al Pago
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
