import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { addOrder } from '../api/ordersApi'
import Swal from 'sweetalert2'
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api'

// Datos de prueba para los bancos (puedes cambiarlos luego)
const BANKS = [
  { id: 'bac', name: 'BAC Credomatic', account: '359-204-102', owner: 'Juan Pérez', type: 'Ahorro, Córdobas', logo: 'https://via.placeholder.com/60x40/db1a1a/fff?text=BAC' },
  { id: 'banpro', name: 'Banpro', account: '1002-1234-5678', owner: 'Juan Pérez', type: 'Ahorro, Córdobas', logo: 'https://via.placeholder.com/60x40/007a33/fff?text=BANPRO' },
  { id: 'lafise', name: 'Lafise Bancentro', account: '4005-9876-5432', owner: 'Juan Pérez', type: 'Corriente, Córdobas', logo: 'https://via.placeholder.com/60x40/004b23/fff?text=LAFISE' },
]

export default function PayMethod() {
  const { cartItems, cartTotal, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [address, setAddress] = useState('')
  const [paymethod, setPaymethod] = useState('Efectivo') // 'Efectivo' | 'Deposito'
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [markerPos, setMarkerPos] = useState(null)

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  })

  const mapContainerStyle = { width: '100%', height: '300px', borderRadius: '8px', border: '1px solid #ddd' }
  const defaultCenter = { lat: 12.1328, lng: -86.2504 } // Managua por defecto

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMarkerPos({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        () => {
          Swal.fire('Error', 'No pudimos obtener tu ubicación. Verifica que hayas dado permisos al navegador.', 'error')
        }
      )
    } else {
      Swal.fire('Error', 'Tu navegador no soporta geolocalización.', 'error')
    }
  }

  const shippingCost = 70
  const finalTotal = cartTotal + shippingCost

  const handlePay = async (e) => {
    e.preventDefault()

    if (!address.trim()) {
      Swal.fire({ icon: 'warning', title: 'Falta dirección', text: 'Por favor, ingrese una dirección de envío.' })
      return
    }

    setIsSubmitting(true)
    try {
      let finalAddress = address.trim()
      if (markerPos) {
        finalAddress += ` | Mapa: https://maps.google.com/?q=${markerPos.lat},${markerPos.lng}`
      }

      const orderData = {
        username: user.username,
        address: finalAddress,
        paymethod: paymethod, // Enviamos el método de pago al backend
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
      
      if (paymethod === 'Deposito') {
        Swal.fire({
          icon: 'success',
          title: 'Pedido registrado',
          text: 'Tu pedido está pendiente. Por favor, sube el comprobante de depósito en la sección "Mis Compras".',
          confirmButtonText: 'Ir a Mis Compras'
        }).then(() => navigate('/buys'))
      } else {
        navigate('/successPay', { state: { address } })
      }
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Ocurrió un error al procesar el pedido.' })
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty">
        <div className="cart-empty__icon"><i className="zmdi zmdi-shopping-cart"></i></div>
        <h2 className="cart-empty__title">Carrito vacío</h2>
        <p className="cart-empty__sub">Agrega productos antes de pagar</p>
        <Link to="/lookbook" className="cart-empty__btn">Volver al catálogo</Link>
      </div>
    )
  }

  return (
    <div className="checkout-wrapper">
      <h1 className="checkout-title">Finalizar compra</h1>

      <div className="checkout-layout">
        
        {/* Columna Izquierda: Formulario */}
        <div className="checkout-form-col">
          <form onSubmit={handlePay} className="checkout-form">
            
            {/* Dirección */}
            <section className="checkout-section">
              <h2 className="checkout-section-title">
                <i className="zmdi zmdi-pin"></i> 1. Dirección de envío
              </h2>
              <div className="pd-field">
                <label className="pd-label">Dirección detallada</label>
                <textarea 
                  className="checkout-textarea" 
                  placeholder="Ej. Barrio San Judas, del semáforo 2c al sur..." 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows="3"
                  required
                />
              </div>

              <div className="pd-field" style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '10px' }}>
                  <label className="pd-label" style={{ marginBottom: 0 }}>
                    Ubicación exacta en el mapa <span style={{ color: '#888', fontWeight: 'normal', fontSize: '0.85rem', textTransform: 'none' }}>(Mueve el pin rojo)</span>
                  </label>
                  <button type="button" className="button is-small is-info is-light" onClick={handleLocateMe} style={{ fontWeight: 'bold' }}>
                    <i className="zmdi zmdi-gps-dot" style={{ marginRight: '5px' }}></i> Mi Ubicación
                  </button>
                </div>
                {isLoaded ? (
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={markerPos || defaultCenter}
                    zoom={14}
                    onClick={(e) => setMarkerPos({ lat: e.latLng.lat(), lng: e.latLng.lng() })}
                  >
                    <Marker 
                      position={markerPos || defaultCenter} 
                      draggable={true} 
                      onDragEnd={(e) => setMarkerPos({ lat: e.latLng.lat(), lng: e.latLng.lng() })}
                    />
                  </GoogleMap>
                ) : (
                  <div className="notification is-light has-text-centered">Cargando mapa...</div>
                )}
                {!import.meta.env.VITE_GOOGLE_MAPS_API_KEY && (
                  <p className="help is-danger mt-2">Nota para Admin: Falta configurar VITE_GOOGLE_MAPS_API_KEY en el archivo .env</p>
                )}
              </div>
            </section>

            {/* Método de pago */}
            <section className="checkout-section">
              <h2 className="checkout-section-title">
                <i className="zmdi zmdi-card"></i> 2. Método de pago
              </h2>
              
              <div className="payment-options">
                {/* Opción Efectivo */}
                <label className={`payment-option ${paymethod === 'Efectivo' ? 'active' : ''}`}>
                  <input 
                    type="radio" 
                    name="payment" 
                    value="Efectivo"
                    checked={paymethod === 'Efectivo'}
                    onChange={(e) => setPaymethod(e.target.value)}
                  />
                  <div className="payment-option-content">
                    <span className="payment-option-title">Pago contra entrega (Efectivo)</span>
                    <span className="payment-option-desc">Pagas al repartidor cuando recibas tu pedido.</span>
                  </div>
                </label>

                {/* Opción Depósito */}
                <label className={`payment-option ${paymethod === 'Deposito' ? 'active' : ''}`}>
                  <input 
                    type="radio" 
                    name="payment" 
                    value="Deposito"
                    checked={paymethod === 'Deposito'}
                    onChange={(e) => setPaymethod(e.target.value)}
                  />
                  <div className="payment-option-content">
                    <span className="payment-option-title">Depósito o Transferencia</span>
                    <span className="payment-option-desc">Transfiere a nuestras cuentas y sube el comprobante.</span>
                  </div>
                </label>
              </div>

              {/* Bancos a mostrar si selecciona depósito */}
              {paymethod === 'Deposito' && (
                <div className="banks-container">
                  <p className="banks-hint">Por favor, realiza el pago a alguna de estas cuentas. Luego podrás subir el comprobante en la sección "Mis Compras".</p>
                  <div className="banks-grid">
                    {BANKS.map(bank => (
                      <div key={bank.id} className="bank-card">
                        <img src={bank.logo} alt={bank.name} className="bank-logo" />
                        <div className="bank-info">
                          <strong className="bank-name">{bank.name}</strong>
                          <span className="bank-account">{bank.account}</span>
                          <span className="bank-owner">{bank.owner} - {bank.type}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            <button 
              type="submit" 
              className="checkout-submit-btn" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Procesando...' : (paymethod === 'Deposito' ? 'Confirmar pedido y ver cuentas' : 'Confirmar y Pagar')}
            </button>

          </form>
        </div>

        {/* Columna Derecha: Resumen (Similar al carrito) */}
        <aside className="cart-summary">
          <h2 className="cart-summary__title">Resumen del pedido</h2>
          <div className="cart-summary__rows">
            {cartItems.map((item) => (
              <div key={item.cartId} className="cart-summary__row">
                <span className="cart-summary__row-name">
                  {item.name} <span className="cart-summary__row-qty">× {item.quantity}</span>
                </span>
                <span className="cart-summary__row-price">C${item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="cart-summary__divider"></div>
          
          <div className="cart-summary__row">
            <span className="cart-summary__row-name">Subtotal</span>
            <span className="cart-summary__row-price">C${cartTotal}</span>
          </div>
          <div className="cart-summary__row mb-3">
            <span className="cart-summary__row-name">Envío</span>
            <span className="cart-summary__row-price">C${shippingCost}</span>
          </div>
          
          <div className="cart-summary__total-row">
            <span className="cart-summary__total-label">Total a pagar</span>
            <span className="cart-summary__total-val has-text-success">C${finalTotal}</span>
          </div>
        </aside>

      </div>
    </div>
  )
}
