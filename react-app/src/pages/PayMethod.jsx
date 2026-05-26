import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { addOrder } from '../api/ordersApi'
import Swal from 'sweetalert2'

export default function PayMethod() {
  const { cartItems, cartTotal, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [address, setAddress] = useState('')

  const shippingCost = 70
  const finalTotal = cartTotal + shippingCost

  const handlePay = async (e) => {
    e.preventDefault()

    if (!address) {
      Swal.fire({ icon: 'warning', title: 'Falta dirección', text: 'Por favor, ingrese una dirección de envío.' })
      return
    }

    try {
      const orderData = {
        username: user.username,
        address: address,
        carListItems: cartItems.map(item => [
          item.name, 
          item.price, 
          item.quantity, 
          item.size, 
          item.color, 
          item.image, 
          item.cartId,
          item.id_item
        ])
      }

      await addOrder(orderData)
      clearCart()
      navigate('/successPay', { state: { address } })
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Ocurrió un error al procesar el pago.' })
      console.error(error)
    }
  }

  if (cartItems.length === 0) {
    return (
      <div className="container has-text-centered" style={{ marginTop: '50px', minHeight: '50vh' }}>
        <h2 className="title">Carrito vacío</h2>
        <Link to="/items" className="button is-dark">Volver al catálogo</Link>
      </div>
    )
  }

  return (
    <div className="container" style={{ marginTop: '50px', marginBottom: '50px' }}>
      <div className="columns is-centered">
        <div className="column is-half">
          <div className="box">
            <h1 className="title has-text-centered">Resumen de Compra</h1>
            
            <div className="content">
              <ul>
                {cartItems.map(item => (
                  <li key={item.cartId}>{item.quantity}x {item.name} - C${item.price * item.quantity}</li>
                ))}
              </ul>
              <hr />
              <p>Subtotal: C${cartTotal}</p>
              <p>Envío: C${shippingCost}</p>
              <h3 className="title is-4" style={{ marginTop: '10px' }}>Total a pagar: C${finalTotal}</h3>
            </div>

            <form onSubmit={handlePay}>
              <div className="field">
                <label className="label">Dirección de Envío</label>
                <div className="control">
                  <textarea 
                    className="textarea" 
                    placeholder="Ej. Barrio San Judas, del semáforo 2c al sur..." 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows="3"
                  />
                </div>
              </div>

              <div className="field">
                <label className="label">Método de Pago</label>
                <div className="control">
                  <label className="radio">
                    <input type="radio" name="payment" defaultChecked /> Pago contra entrega (Efectivo)
                  </label>
                </div>
              </div>

              <button type="submit" className="button is-success is-fullwidth is-medium" style={{ marginTop: '20px' }}>
                Confirmar y Pagar
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
