import { useEffect, useState } from 'react'
import { getOrderDetails, changeOrderStatus } from '../../api/ordersApi'
import Swal from 'sweetalert2'

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [expandedOrders, setExpandedOrders] = useState({})

  const fetchOrders = async () => {
    try {
      const res = await getOrderDetails()
      setOrders(res.data)
    } catch (error) {
      console.error('Error fetching admin orders:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleStatusChange = async (id_order, newStatus) => {
    try {
      await changeOrderStatus(id_order, newStatus)
      Swal.fire({ icon: 'success', title: 'Actualizado', text: 'Estado actualizado', timer: 1500, showConfirmButton: false })
      fetchOrders() // Refresh
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo actualizar el estado' })
    }
  }

  const toggleOrder = (id_order) => {
    setExpandedOrders(prev => ({
      ...prev,
      [id_order]: !prev[id_order]
    }))
  }

  const groupedOrders = Object.values(
    orders.reduce((acc, buy) => {
      if (!acc[buy.id_order]) {
        acc[buy.id_order] = {
          id_order: buy.id_order,
          username: buy.username,
          status: buy.status,
          cost: buy.cost,
          totalAmount: buy.totalAmount,
          items: []
        }
      }
      acc[buy.id_order].items.push(buy)
      return acc
    }, {})
  )

  // Calculate actual total per order (items cost + shipping)
  groupedOrders.forEach(order => {
    const itemsTotal = order.items.reduce((sum, item) => sum + (item.price * item.quantityOrders), 0)
    order.realTotal = itemsTotal + parseFloat(order.cost)
  })

  // Sort by order ID descending
  groupedOrders.sort((a, b) => b.id_order - a.id_order)

  // FILTER LOGIC
  const filteredOrders = groupedOrders.filter(order => {
    const matchesSearch =
      order.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id_order.toString().includes(searchTerm)

    const matchesStatus = statusFilter === 'Todos' || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="container" style={{ marginTop: '50px', marginBottom: '50px', minHeight: '60vh', padding: '0 15px' }}>
      <h1 className="title is-2 has-text-centered">Administración de Pedidos</h1>

      {/* SEARCH AND FILTER BAR - STICKY */}
      <div
        className="box mb-5"
        style={{
          position: 'sticky',
          top: '20px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          borderTop: '4px solid #3273dc'
        }}
      >
        <div className="columns is-mobile is-multiline">
          <div className="column is-12-mobile is-8-tablet">
            <div className="field">
              <label className="label is-small">Buscar por Cliente o # Pedido</label>
              <div className="control has-icons-left">
                <input
                  className="input"
                  type="text"
                  placeholder="Ej. Fernando01, 328..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <span className="icon is-left">
                  <i className="zmdi zmdi-search"></i>
                </span>
              </div>
            </div>
          </div>
          <div className="column is-12-mobile is-4-tablet">
            <div className="field">
              <label className="label is-small">Filtrar por Estado</label>
              <div className="control">
                <div className="select is-fullwidth">
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="Todos">Todos los Estados</option>
                    <option value="En proceso">En proceso</option>
                    <option value="No enviado">No enviado</option>
                    <option value="Enviado">Enviado</option>
                    <option value="Entregado">Entregado</option>
                    <option value="Terminado">Terminado</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <p className="has-text-centered">Cargando pedidos...</p>
      ) : filteredOrders.length === 0 ? (
        <p className="has-text-centered">No se encontraron pedidos con esos filtros.</p>
      ) : (
        <div className="columns is-multiline" style={{ marginTop: '10px' }}>
          {filteredOrders.map((order, i) => (
            <div key={i} className="column is-12">
              <div className="box" style={{ padding: '10', overflow: 'hidden' }}>

                {/* ORDER HEADER (Always visible) */}
                <div
                  className="is-flex is-flex-wrap-wrap is-align-items-center is-justify-content-space-between p-4"
                  style={{ backgroundColor: '#fdfdfd', borderBottom: expandedOrders[order.id_order] ? '1px solid #eee' : 'none' }}
                >
                  <div style={{ minWidth: '200px' }}>
                    <h3 className="title is-4 mb-1">Pedido #{order.id_order}</h3>
                    <p className="subtitle is-6 mb-0">Cliente: <strong>{order.username}</strong></p>
                  </div>

                  <div className="is-flex is-align-items-center is-flex-wrap-wrap mt-2-mobile" style={{ gap: '15px' }}>
                    <span className="is-size-5 has-text-weight-bold has-text-success mr-2">
                      C${order.realTotal}
                    </span>
                    <div className="select is-small">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id_order, e.target.value)}
                        style={{ fontWeight: 'bold' }}
                      >
                        <option value="En proceso">En proceso</option>
                        <option value="No enviado">No enviado</option>
                        <option value="Enviado">Enviado</option>
                        <option value="Entregado">Entregado</option>
                        <option value="Terminado">Terminado</option>
                      </select>
                    </div>
                    <button
                      className={`button is-small ${expandedOrders[order.id_order] ? 'is-light' : 'is-info'}`}
                      onClick={() => toggleOrder(order.id_order)}
                    >
                      <i className={`zmdi zmdi-chevron-${expandedOrders[order.id_order] ? 'up' : 'down'} mr-2`}></i>
                      {expandedOrders[order.id_order] ? 'Ocultar' : 'Ver Detalles'}
                    </button>
                  </div>
                </div>

                {/* ORDER DETAILS (Collapsible) */}
                {expandedOrders[order.id_order] && (
                  <div className="p-4" style={{ backgroundColor: '#fff' }}>
                    <div className="columns is-multiline">
                      <div className="column is-12-mobile is-8-tablet">
                        <h5 className="title is-6 mb-3 has-text-grey">Artículos del Pedido:</h5>
                        {order.items.map((item, idx) => {
                          const imgSrc = item.custom_image || item.image
                          const finalImg = imgSrc?.startsWith('http') ? imgSrc : `/img/${imgSrc}`
                          return (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', backgroundColor: '#fafafa', padding: '10px', borderRadius: '8px' }}>
                              <img
                                src={finalImg}
                                alt={item.name}
                                style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px', marginRight: '15px', cursor: 'pointer', border: '1px solid #ddd' }}
                                onClick={() => Swal.fire({ imageUrl: finalImg, imageAlt: item.name, showConfirmButton: false, showCloseButton: true, width: 'auto', padding: '1em' })}
                                title="Haz clic para ver completo"
                              />
                              <div style={{ flex: 1 }}>
                                <p className="has-text-weight-bold mb-1 is-size-6-mobile">{item.name}</p>
                                <p className="is-size-7 mb-0">Talla: {item.size} | Color: {item.color}</p>
                                <p className="is-size-7 mb-0">Cantidad: {item.quantityOrders} x C${item.price}</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      <div className="column is-12-mobile is-4-tablet">
                        <div className="notification is-light is-small">
                          <h4 className="title is-6 mb-3 has-text-grey">Resumen Financiero</h4>
                          <div className="is-flex is-justify-content-space-between mb-1">
                            <span className="is-size-7">Subtotal Artículos:</span>
                            <span className="is-size-7">C${order.realTotal - parseFloat(order.cost)}</span>
                          </div>
                          <div className="is-flex is-justify-content-space-between mb-1">
                            <span className="is-size-7">Costo de Envío:</span>
                            <span className="is-size-7">C${order.cost}</span>
                          </div>
                          <div className="is-flex is-justify-content-space-between mt-2 pt-2" style={{ borderTop: '1px solid #ddd' }}>
                            <span className="is-size-6 has-text-weight-bold">Total a Cobrar:</span>
                            <span className="is-size-5 has-text-weight-bold has-text-success">C${order.realTotal}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
