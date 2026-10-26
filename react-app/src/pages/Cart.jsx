import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import Swal from 'sweetalert2'
import { parseCustomization, getItemPreviewImage, showViewsGalleryModal } from '../utils/customizationHelper'

function CartItem({ item, onRemove, onQtyChange }) {
  const customData = parseCustomization(item.customization || item.image)
  const imgSrc = getItemPreviewImage(item)

  const handleImgClick = () => {
    if (customData?.views && customData.views.length > 1) {
      showViewsGalleryModal(customData.views, item.name)
    } else {
      Swal.fire({
        imageUrl: imgSrc,
        imageAlt: item.name,
        showConfirmButton: false,
        showCloseButton: true,
        width: 'auto',
        padding: '1em',
      })
    }
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
      <div className="cart-item__img-wrap" onClick={handleImgClick} title={customData?.views?.length > 1 ? "Ver todas las vistas 3D" : "Ver imagen completa"}>
        <img
          src={imgSrc}
          alt={item.name}
          className="cart-item__img"
          onError={(e) => { e.target.style.opacity = '0.3' }}
        />
        {customData?.views && customData.views.length > 1 && (
          <span style={{
            position: 'absolute',
            bottom: '4px',
            right: '4px',
            background: 'rgba(15, 23, 42, 0.85)',
            color: '#fff',
            fontSize: '9.5px',
            fontWeight: '700',
            padding: '2px 5px',
            borderRadius: '4px',
            backdropFilter: 'blur(2px)',
          }}>
            {customData.views.length} caras
          </span>
        )}
      </div>

      {/* Info */}
      <div className="cart-item__info">
        <div className="cart-item__header">
          <div>
            <h3 className="cart-item__name">{item.name}</h3>
            <p className="cart-item__meta" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
              <span className="cart-item__badge">{item.size}</span>
              <span className="cart-item__badge">{item.color}</span>
              {customData && (
                <span className="cart-item__badge" style={{ backgroundColor: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', fontWeight: '700' }}>
                  Personalizado 3D
                </span>
              )}
            </p>

            {/* Vistas y detalles de personalización */}
            {customData && (
              <div style={{ marginTop: '6px', fontSize: '11.5px', color: '#475569' }}>
                {customData.views && customData.views.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                    <span style={{ fontWeight: '600', color: '#334155' }}>Vistas:</span>
                    {customData.views.map((v) => (
                      <span key={v.zone} style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '10.5px' }}>
                        {v.name || v.zone}
                      </span>
                    ))}
                    {customData.views.length > 1 && (
                      <button
                        type="button"
                        onClick={() => showViewsGalleryModal(customData.views, item.name)}
                        style={{
                          background: '#0f172a',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '10.5px',
                          padding: '4px 9px',
                          cursor: 'pointer',
                          fontWeight: '600',
                          marginLeft: '2px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                        <span>Ver vistas 3D ({customData.views.length})</span>
                      </button>
                    )}
                  </div>
                )}

                {customData.customerLogos && customData.customerLogos.length > 0 && (
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <span>{customData.customerLogos.length} archivo(s) original(es) adjunto(s)</span>
                  </div>
                )}
              </div>
            )}
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
