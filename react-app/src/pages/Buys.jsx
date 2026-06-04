import { useEffect, useState } from 'react'
import { getOrdersByUser, uploadVoucher } from '../api/ordersApi'
import { useAuth } from '../context/AuthContext'
import Swal from 'sweetalert2'

// Cloudinary config
const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dzlbg8ni6/image/upload'
const CLOUDINARY_UPLOAD_PRESET = 'ss1j77hf'

export default function Buys() {
  const { user } = useAuth()
  const [buys, setBuys] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploadingFor, setUploadingFor] = useState(null) // id_order

  const fetchBuys = async () => {
    try {
      const res = await getOrdersByUser(user.username)
      setBuys(res.data)
    } catch (error) {
      console.error('Error fetching buys:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.username) fetchBuys()
  }, [user])

  // Agrupación y cálculo
  const groupedOrders = Object.values(
    buys.reduce((acc, buy) => {
      if (!acc[buy.id_order]) {
        acc[buy.id_order] = {
          id_order: buy.id_order,
          orderdate: buy.orderdate,
          status: buy.status,
          address: buy.address,
          cost: buy.cost,
          paymethod: buy.order_paymethod, // Desde DB (o 'Efectivo' default)
          voucher_url: buy.voucher_url,   // Desde DB
          items: []
        }
      }
      acc[buy.id_order].items.push(buy)
      return acc
    }, {})
  )

  groupedOrders.forEach(order => {
    const itemsTotal = order.items.reduce((sum, item) => sum + (item.price * item.quantityOrders), 0)
    order.realTotal = itemsTotal + parseFloat(order.cost)
  })
  groupedOrders.sort((a, b) => new Date(b.orderdate) - new Date(a.orderdate))

  // ── Upload Voucher a Cloudinary ──
  const handleVoucherUpload = async (e, id_order) => {
    const file = e.target.files[0]
    if (!file) return

    setUploadingFor(id_order)
    try {
      // 1. Subir a Cloudinary
      const uploadData = new FormData()
      uploadData.append('file', file)
      uploadData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)

      const res = await fetch(CLOUDINARY_URL, { method: 'POST', body: uploadData })
      const data = await res.json()

      if (!res.ok) throw new Error('Error al subir la imagen')

      const imageUrl = data.secure_url

      // 2. Guardar URL en Backend
      await uploadVoucher(id_order, imageUrl)

      Swal.fire({
        icon: 'success',
        title: '¡Comprobante enviado!',
        text: 'Hemos recibido tu comprobante. Revisaremos el depósito y procesaremos tu orden.',
        timer: 3000,
        showConfirmButton: false
      })

      // 3. Recargar compras
      fetchBuys()

    } catch (error) {
      console.error('Upload Error:', error)
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo subir el comprobante. Intenta de nuevo.' })
    } finally {
      setUploadingFor(null)
      e.target.value = '' // reset file input
    }
  }

  // Helper para abrir imagen full
  const handleViewImage = (url, alt) => {
    Swal.fire({ imageUrl: url, imageAlt: alt, showConfirmButton: false, showCloseButton: true, width: 'auto', padding: '1em' })
  }

  return (
    <div className="container buys-container" style={{ marginTop: '50px', marginBottom: '50px', minHeight: '60vh' }}>
      <h1 className="title is-2 has-text-centered">Mis Compras</h1>

      {loading ? (
        <div className="pd-loading"><div className="loading-spinner"></div><p>Cargando tus compras...</p></div>
      ) : buys.length === 0 ? (
        <div className="cart-empty">
          <i className="zmdi zmdi-shopping-basket" style={{ fontSize: '72px', color: '#ddd' }}></i>
          <p className="is-size-5 mt-4">¡Hola! {user.username} aún no haz comprado un artículo :D</p>
        </div>
      ) : (
        <div className="buys-grid">
          {groupedOrders.map((order) => (
            <div key={order.id_order} className="buy-card">

              {/* Header */}
              <div className="buy-card__header">
                <div className="buy-card__header-info">
                  <h3 className="buy-card__title">Pedido #{order.id_order}</h3>
                  <span className="buy-card__date">{new Date(order.orderdate).toLocaleDateString()}</span>
                </div>
                <div className="buy-card__status-wrap">
                  <span className={`buy-card__status status-${order.status.replace(/\s+/g, '').toLowerCase()}`}>
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Contenido (Items + Resumen) */}
              <div className="buy-card__body columns is-marginless">

                {/* Items */}
                <div className="column is-7 buy-card__items">
                  {order.items.map((item, idx) => {
                    const finalImg = (item.custom_image || item.image)?.startsWith('http') ? (item.custom_image || item.image) : `/img/${item.custom_image || item.image}`
                    return (
                      <div key={idx} className="buy-item">
                        <img
                          src={finalImg}
                          alt={item.name}
                          className="buy-item__img"
                          onClick={() => handleViewImage(finalImg, item.name)}
                          title="Ver imagen"
                        />
                        <div className="buy-item__info">
                          <p className="buy-item__name">{item.name}</p>
                          <p className="buy-item__meta">Talla: {item.size} | Color: {item.color}</p>
                          <p className="buy-item__meta">Cant: {item.quantityOrders} × C${item.price}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Resumen & Voucher */}
                <div className="column is-5 buy-card__summary">
                  <div className="buy-summary-box">
                    <h4 className="buy-summary__title">Resumen del Pedido</h4>
                    <p className="buy-summary__text"><strong>Dirección:</strong> {order.address}</p>
                    <p className="buy-summary__text"><strong>Método:</strong> {order.paymethod}</p>
                    <hr className="buy-summary__divider" />
                    <div className="buy-summary__row">
                      <span>Costo de Envío:</span>
                      <span>C${order.cost}</span>
                    </div>
                    <div className="buy-summary__total-row">
                      <span>Total Pagado:</span>
                      <span className="has-text-success">C${order.realTotal}</span>
                    </div>

                    {/* VOUCHER UPLOAD SECTION */}
                    {order.paymethod === 'Deposito' && (
                      <div className="voucher-section">
                        {order.voucher_url ? (
                          <div className="voucher-success">
                            <span className="voucher-success__text"><i className="zmdi zmdi-check-circle"></i> Comprobante enviado</span>
                            <img
                              src={order.voucher_url}
                              alt="Comprobante"
                              className="voucher-thumb"
                              onClick={() => handleViewImage(order.voucher_url, 'Comprobante')}
                            />
                            {order.status === 'Pendiente' && <p className="voucher-hint">Esperando validación...</p>}
                          </div>
                        ) : (
                          <div className="voucher-upload-box">
                            <p className="voucher-upload-msg">Por favor sube tu comprobante de depósito para procesar la orden.</p>
                            <label className={`voucher-upload-btn ${uploadingFor === order.id_order ? 'is-loading' : ''}`}>
                              {uploadingFor === order.id_order ? 'Subiendo...' : (
                                <><i className="zmdi zmdi-upload"></i> Subir Comprobante</>
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={(e) => handleVoucherUpload(e, order.id_order)}
                                disabled={uploadingFor === order.id_order}
                              />
                            </label>
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  )
}
