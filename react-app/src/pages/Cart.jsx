import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import Swal from 'sweetalert2'

function CartItem({ item, onRemove, onQtyChange }) {
  const imgSrc = item.image?.startsWith('http') ? item.image : `/img/${item.image}`

  const handleImgClick = () => {
    Swal.fire({
      imageUrl: imgSrc,
      imageAlt: item.name,
      showConfirmButton: false,
      showCloseButton: true,
      width: 'auto',
      padding: '1em',
    })
  }

  const handleRemove = () => {
    Swal.fire({
      title: '¿Eliminar artículo?',
      text: item.name,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#1a1a1a',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) onRemove(item.cartId)
    })
  }

  return (
    <div className="cart-item">
      {/* Imagen */}
      <div className="cart-item__img-wrap" onClick={handleImgClick} title="Ver imagen completa">
        <img
          src={imgSrc}
          alt={item.name}
          className="cart-item__img"
          onError={(e) => { e.target.style.opacity = '0.3' }}
        />
      </div>

      {/* Info */}
      <div className="cart-item__info">
        <div className="cart-item__header">
          <div>
            <h3 className="cart-item__name">{item.name}</h3>
            <p className="cart-item__meta">
              <span className="cart-item__badge">{item.size}</span>
              <span className="cart-item__badge">{item.color}</span>
            </p>
          </div>
          <button
            className="cart-item__remove"
            onClick={handleRemove}
            aria-label="Eliminar artículo"
          >
            <i className="zmdi zmdi-close"></i>
          </button>
        </div>

        <div className="cart-item__footer">
          {/* Stepper cantidad */}
          <div className="cart-item__qty">
            <button
              className="cart-item__qty-btn"
              onClick={() => onQtyChange(item.cartId, Math.max(1, item.quantity - 1))}
              disabled={item.quantity <= 1}
            >−</button>
            <span className="cart-item__qty-val">{item.quantity}</span>
            <button
              className="cart-item__qty-btn"
              onClick={() => onQtyChange(item.cartId, Math.min(10, item.quantity + 1))}
              disabled={item.quantity >= 10}
            >+</button>
          </div>

          {/* Precio */}
          <div className="cart-item__price-wrap">
            <span className="cart-item__unit">C${item.price} c/u</span>
            <span className="cart-item__total">C${(item.price * item.quantity).toFixed(0)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Cart() {
  const { cartItems, removeFromCart, clearCart, cartTotal, updateQty } = useCart()
  const navigate = useNavigate()

  // Actualiza cantidad de un ítem
  const handleQtyChange = (cartId, newQty) => {
    updateQty(cartId, newQty)
  }

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Swal.fire({ icon: 'warning', title: 'Carrito vacío', text: 'Agrega un artículo.' })
      return
    }
    navigate('/payMethod')
  }

  const handleClear = () => {
    Swal.fire({
      title: '¿Vaciar carrito?',
      text: 'Se eliminarán todos los artículos.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#c62828',
      cancelButtonColor: '#aaa',
      confirmButtonText: 'Vaciar',
      cancelButtonText: 'Cancelar',
    }).then((r) => { if (r.isConfirmed) clearCart() })
  }

  const itemCount = cartItems.reduce((s, i) => s + i.quantity, 0)

  /* ── Carrito vacío ── */
  if (cartItems.length === 0) {
    return (
      <div className="cart-empty">
        <div className="cart-empty__icon">
          <i className="zmdi zmdi-shopping-cart"></i>
        </div>
        <h2 className="cart-empty__title">Tu carrito está vacío</h2>
        <p className="cart-empty__sub">Agrega productos desde el catálogo</p>
        <Link to="/lookbook" className="cart-empty__btn">
          Ir al catálogo →
        </Link>
      </div>
    )
  }

  return (
    <div className="cart-wrapper">

      {/* Header */}
      <div className="cart-header">
        <h1 className="cart-title">Tu Carrito</h1>
        <span className="cart-count-badge">{itemCount} {itemCount === 1 ? 'artículo' : 'artículos'}</span>
      </div>

      {/* Layout principal */}
      <div className="cart-layout">

        {/* Lista de ítems */}
        <div className="cart-items-col">
          {cartItems.map((item) => (
            <CartItem
              key={item.cartId}
              item={item}
              onRemove={removeFromCart}
              onQtyChange={handleQtyChange}
            />
          ))}

          <button className="cart-clear-btn" onClick={handleClear}>
            <i className="zmdi zmdi-delete"></i> Vaciar carrito
          </button>
        </div>

        {/* Resumen del pedido */}
        <aside className="cart-summary">
          <h2 className="cart-summary__title">Resumen del pedido</h2>

          <div className="cart-summary__rows">
            {cartItems.map((item) => (
              <div key={item.cartId} className="cart-summary__row">
                <span className="cart-summary__row-name">
                  {item.name} <span className="cart-summary__row-qty">× {item.quantity}</span>
                </span>
                <span className="cart-summary__row-price">
                  C${(item.price * item.quantity).toFixed(0)}
                </span>
              </div>
            ))}
          </div>

          <div className="cart-summary__divider"></div>

          <div className="cart-summary__total-row">
            <span className="cart-summary__total-label">Total</span>
            <span className="cart-summary__total-val">C${cartTotal.toFixed(0)}</span>
          </div>

          <p className="cart-summary__hint">
            <i className="zmdi zmdi-truck"></i> Envío calculado al pagar
          </p>

          <button className="cart-checkout-btn" onClick={handleCheckout}>
            Proceder al pago →
          </button>

          <Link to="/lookbook" className="cart-continue-btn">
            ← Seguir comprando
          </Link>
        </aside>

      </div>
    </div>
  )
}
