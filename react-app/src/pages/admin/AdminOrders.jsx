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
    setExpandedOrders(prev => ({ ...prev, [id_order]: !prev[id_order] }))
  }

  const renderChannelBadge = (id_canal) => {
    switch (id_canal) {
      case 2:
        return <span className="tag is-success is-light" style={{ fontWeight: 'bold' }}><i className="zmdi zmdi-whatsapp mr-1"></i> WhatsApp</span>;
      case 3:
        return <span className="tag is-link is-light" style={{ fontWeight: 'bold' }}><i className="zmdi zmdi-facebook mr-1"></i> Facebook</span>;
      case 4:
        return <span className="tag is-danger is-light" style={{ fontWeight: 'bold' }}><i className="zmdi zmdi-instagram mr-1"></i> Instagram</span>;
      default:
        return <span className="tag is-info is-light" style={{ fontWeight: 'bold' }}><i className="zmdi zmdi-globe mr-1"></i> Web</span>;
    }
  }

  const groupedOrders = Object.values(
    orders.reduce((acc, buy) => {
      if (!acc[buy.id_order]) {
        acc[buy.id_order] = {
          id_order: buy.id_order,
          username: buy.username,
          status: buy.status,
          cost: buy.cost,
          paymethod: buy.paymethod,
          voucher_url: buy.voucher_url,
          totalAmount: buy.totalAmount,
          id_canal_de_ventas: buy.id_canal_de_ventas,
          pedidoNombre: buy.pedidoNombre,
          cedula: buy.cedula,
          pedidoTelefono: buy.pedidoTelefono,
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

  groupedOrders.sort((a, b) => b.id_order - a.id_order)

  const filteredOrders = groupedOrders.filter(order => {
    const matchesSearch =
      order.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.pedidoNombre && order.pedidoNombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.pedidoTelefono && order.pedidoTelefono.includes(searchTerm)) ||
      order.id_order.toString().includes(searchTerm)
    const matchesStatus = statusFilter === 'Todos' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleApproveDeposit = (id_order) => {
    Swal.fire({
      title: '¿Aprobar comprobante?',
      text: "El estado cambiará a 'En proceso'",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, aprobar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        handleStatusChange(id_order, 'En proceso')
      }
    })
  }

  return (
    <div className="container" style={{ marginTop: '50px', marginBottom: '50px', minHeight: '60vh', padding: '0 15px' }}>
      <h1 className="title is-2 has-text-centered">Administración de Pedidos</h1>

      {/* SEARCH AND FILTER */}
      <div className="box mb-5" style={{ position: 'sticky', top: '20px', zIndex: 10, boxShadow: '0 4px 15px rgba(0,0,0,0.1)', borderTop: '4px solid #1a1a1a' }}>
        <div className="columns is-mobile is-multiline">
          <div className="column is-12-mobile is-8-tablet">
            <div className="field">
              <label className="label is-small">Buscar por Cliente o # Pedido</label>
              <div className="control has-icons-left">
                <input className="input" type="text" placeholder="Ej. Fernando01, 328..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <span className="icon is-left"><i className="zmdi zmdi-search"></i></span>
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
                    <option value="Pendiente">Pendiente (Depósito)</option>
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
              <div className="box" style={{ padding: '0', overflow: 'hidden', border: order.status === 'Pendiente' ? '2px solid #fbbf24' : '1px solid #eee', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                
                {/* HEADER */}
                <div className="is-flex is-flex-wrap-wrap is-align-items-center is-justify-content-space-between" style={{ padding: '24px', backgroundColor: '#fcfcfc', borderBottom: expandedOrders[order.id_order] ? '1px solid #eee' : 'none' }}>
                  <div style={{ minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                      <span style={{ fontSize: '1.3rem', fontWeight: '800', color: '#1a1a1a' }}>Pedido #{order.id_order}</span>
                      {renderChannelBadge(order.id_canal_de_ventas)}
                      {order.status === 'Pendiente' && <span className="tag is-warning" style={{ fontWeight: 'bold' }}>Pendiente</span>}
                    </div>
                    <p style={{ margin: 0, fontSize: '0.95rem', color: '#555' }}>
                      Cliente: <strong style={{ color: '#1a1a1a' }}>{order.pedidoNombre || order.username}</strong>
                      {order.pedidoTelefono && <span style={{ marginLeft: '15px' }}>Tel: <strong style={{ color: '#1a1a1a' }}>{order.pedidoTelefono}</strong></span>}
                      {order.cedula && <span style={{ marginLeft: '15px' }}>Cédula: <strong style={{ color: '#1a1a1a' }}>{order.cedula}</strong></span>}
                    </p>
                  </div>

                  <div className="is-flex is-align-items-center is-flex-wrap-wrap mt-3-mobile" style={{ gap: '20px' }}>
                    <span className="is-size-5 has-text-weight-bold has-text-success">C${order.realTotal}</span>
                    
                    <div className="select is-small">
                      <select value={order.status} onChange={(e) => handleStatusChange(order.id_order, e.target.value)} style={{ fontWeight: 'bold', minWidth: '130px' }}>
                        <option value="Pendiente">Pendiente</option>
                        <option value="En proceso">En proceso</option>
                        <option value="No enviado">No enviado</option>
                        <option value="Enviado">Enviado</option>
                        <option value="Entregado">Entregado</option>
                        <option value="Terminado">Terminado</option>
                      </select>
                    </div>

                    <button className={`button is-small ${expandedOrders[order.id_order] ? 'is-light' : 'is-dark'}`} onClick={() => toggleOrder(order.id_order)}>
                      <i className={`zmdi zmdi-chevron-${expandedOrders[order.id_order] ? 'up' : 'down'} mr-2`}></i>
                      {expandedOrders[order.id_order] ? 'Ocultar' : 'Ver Detalles'}
                    </button>
                  </div>
                </div>

                {/* DETAILS */}
                {expandedOrders[order.id_order] && (
                  <div style={{ padding: '24px', backgroundColor: '#fff' }}>
                    <div className="columns is-multiline">
                      
                      {/* Items Col */}
                      <div className="column is-12-mobile is-7-tablet" style={{ paddingRight: '24px' }}>
                        <h5 className="title is-6 has-text-grey" style={{ marginBottom: '20px' }}><i className="zmdi zmdi-shopping-cart-plus mr-2"></i>Artículos del Pedido</h5>
                        {order.items.map((item, idx) => {
                          const finalImg = (item.custom_image || item.image)?.startsWith('http') ? (item.custom_image || item.image) : `/img/${item.custom_image || item.image}`
                          return (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', backgroundColor: '#fafafa', padding: '15px', borderRadius: '10px', border: '1px solid #f0f0f0' }}>
                              <img src={finalImg} alt={item.name} style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '8px', marginRight: '20px', border: '1px solid #ddd' }} />
                              <div style={{ flex: 1 }}>
                                <p className="has-text-weight-bold mb-1 is-size-6-mobile">{item.name}</p>
                                <p className="is-size-7 mb-1" style={{ color: '#666' }}>Talla: <strong>{item.size}</strong> | Color: <strong>{item.color}</strong></p>
                                <p className="is-size-7 mb-0">Cant: {item.quantityOrders} x C${item.price}</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {/* Resumen & Comprobante Col */}
                      <div className="column is-12-mobile is-5-tablet">
                        <div className="notification is-light is-small mb-4" style={{ padding: '20px', borderRadius: '10px' }}>
                          <h4 className="title is-6 mb-4 has-text-grey"><i className="zmdi zmdi-receipt mr-2"></i>Resumen Financiero</h4>
                          <div className="is-flex is-justify-content-space-between mb-2"><span className="is-size-7">Subtotal:</span><span className="is-size-7 has-text-weight-semibold">C${order.realTotal - parseFloat(order.cost)}</span></div>
                          <div className="is-flex is-justify-content-space-between mb-2"><span className="is-size-7">Envío:</span><span className="is-size-7 has-text-weight-semibold">C${order.cost}</span></div>
                          <div className="is-flex is-justify-content-space-between mt-3 pt-3" style={{ borderTop: '1px solid #ddd' }}>
                            <span className="is-size-6 has-text-weight-bold">Total:</span><span className="is-size-5 has-text-weight-bold has-text-success">C${order.realTotal}</span>
                          </div>
                        </div>

                        {/* COMPROBANTE DE PAGO */}
                        {order.status === 'Pendiente' && (
                          <div className="box" style={{ backgroundColor: '#fffbeb', border: '1px solid #fcd34d', padding: '20px', borderRadius: '10px' }}>
                            <h4 className="title is-6 mb-3" style={{ color: '#b45309' }}><i className="zmdi zmdi-money-box mr-2"></i> Verificación de Depósito</h4>
                            
                            {order.voucher_url ? (
                              <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                                <p className="is-size-7 mb-2">Comprobante subido por el cliente:</p>
                                <img 
                                  src={order.voucher_url} 
                                  alt="Voucher" 
                                  style={{ width: '100px', height: '140px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #b45309', cursor: 'pointer', transition: 'transform 0.2s' }} 
                                  onClick={() => Swal.fire({ imageUrl: order.voucher_url, imageAlt: 'Comprobante', showConfirmButton: false, showCloseButton: true, width: 'auto', padding: '1em' })}
                                  onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                                  onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                                  title="Clic para ampliar"
                                />
                              </div>
                            ) : (
                              <p className="is-size-7 mb-4" style={{ color: '#92400e' }}>El usuario seleccionó depósito bancario, pero aún <strong>no ha subido el comprobante</strong>.</p>
                            )}
                            
                            <button className="button is-success is-fullwidth is-small" onClick={() => handleApproveDeposit(order.id_order)} disabled={!order.voucher_url}>
                              <i className="zmdi zmdi-check mr-2"></i> Aprobar y procesar orden
                            </button>
                            {!order.voucher_url && <p className="is-size-7 has-text-centered mt-2" style={{color: '#999'}}>Espera a que suban la foto para aprobar.</p>}
                          </div>
                        )}
                        
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
