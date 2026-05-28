import { useEffect, useState, useMemo } from 'react'
import { getShippings, changeOrderStatus } from '../../api/ordersApi'
import Swal from 'sweetalert2'

export default function AdminShippings() {
  const [shippings, setShippings] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedOrders, setExpandedOrders] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const [cityFilter, setCityFilter] = useState('')

  const fetchShippings = async () => {
    try {
      const res = await getShippings()
      setShippings(res.data)
    } catch (error) {
      console.error('Error fetching shippings:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchShippings()
  }, [])

  const handleMarkAsDelivered = async (id_order) => {
    try {
      const result = await Swal.fire({
        title: '¿Confirmar entrega?',
        text: '¿Estás seguro de que este pedido ha sido entregado exitosamente al cliente?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3273dc',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, marcar Entregado',
        cancelButtonText: 'Cancelar'
      })

      if (result.isConfirmed) {
        await changeOrderStatus(id_order, 'Entregado')
        Swal.fire({ icon: 'success', title: '¡Entregado!', text: 'El pedido ha sido marcado como entregado.', timer: 1500, showConfirmButton: false })
        fetchShippings()
      }
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo actualizar el estado del envío' })
    }
  }

  const toggleOrder = (id_order) => {
    setExpandedOrders(prev => ({
      ...prev,
      [id_order]: !prev[id_order]
    }))
  }

  // 1. Filter only "Enviado" orders
  const activeShippings = shippings.filter(ship => ship.status === 'Enviado')

  // 2. Group by order
  const groupedShippings = useMemo(() => {
    const grouped = Object.values(
      activeShippings.reduce((acc, ship) => {
        if (!acc[ship.id_order]) {
          acc[ship.id_order] = {
            id_order: ship.id_order,
            username: ship.username,
            client_name: ship.client_name,
            client_lastname: ship.client_lastname,
            cedula: ship.cedula,
            city: ship.city,
            address: ship.address,
            status: ship.status,
            cost: ship.cost,
            paymethod: ship.paymethod,
            items: []
          }
        }
        acc[ship.id_order].items.push(ship)
        return acc
      }, {})
    )

    // Calculate totals
    grouped.forEach(order => {
      const itemsTotal = order.items.reduce((sum, item) => sum + (parseFloat(item.price) * parseInt(item.quantityOrders || 1)), 0)
      order.realTotal = itemsTotal + parseFloat(order.cost)
    })

    // Sort by order ID descending
    grouped.sort((a, b) => b.id_order - a.id_order)
    return grouped
  }, [activeShippings])

  // 3. Get unique cities for the filter dropdown
  const uniqueCities = useMemo(() => {
    const cities = [...new Set(groupedShippings.map(o => o.city).filter(Boolean))]
    cities.sort()
    return cities
  }, [groupedShippings])

  // 4. Apply search and city filter
  const filteredShippings = useMemo(() => {
    return groupedShippings.filter(order => {
      const term = searchTerm.toLowerCase()
      const matchesSearch = !term ||
        String(order.id_order).includes(term) ||
        order.username?.toLowerCase().includes(term) ||
        order.client_name?.toLowerCase().includes(term) ||
        order.client_lastname?.toLowerCase().includes(term) ||
        order.cedula?.toLowerCase().includes(term)

      const matchesCity = !cityFilter || order.city === cityFilter

      return matchesSearch && matchesCity
    })
  }, [groupedShippings, searchTerm, cityFilter])

  return (
    <div className="container" style={{ marginTop: '50px', marginBottom: '50px', minHeight: '60vh', padding: '0 20px' }}>
      <h1 className="title is-2 has-text-centered" style={{ marginBottom: '10px' }}>Gestión de Envíos en Ruta</h1>
      
      <p className="has-text-centered has-text-grey" style={{ marginBottom: '25px' }}>
        Aquí solo se muestran los pedidos con estado <strong>"Enviado"</strong>. Al entregarlos, desaparecerán de esta lista.
      </p>

      {/* SEARCH AND FILTER BAR - STICKY */}
      <div
        className="box"
        style={{
          position: 'sticky',
          top: '20px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          borderTop: '4px solid #ffdd57',
          padding: '20px 25px',
          marginBottom: '30px'
        }}
      >
        <div className="columns is-mobile is-multiline is-vcentered">
          <div className="column is-12-mobile is-6-tablet">
            <div className="field">
              <label className="label is-small">Buscar por Cliente, Cédula o # Pedido</label>
              <div className="control has-icons-left">
                <input
                  className="input"
                  type="text"
                  placeholder="Ej. Keysi, 001-12345, 328..."
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
              <label className="label is-small">Filtrar por Departamento</label>
              <div className="control has-icons-left">
                <div className="select is-fullwidth">
                  <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}>
                    <option value="">Todos los Departamentos</option>
                    {uniqueCities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
                <span className="icon is-left">
                  <i className="zmdi zmdi-pin"></i>
                </span>
              </div>
            </div>
          </div>
          <div className="column is-12-mobile is-2-tablet">
            <div className="field" style={{ marginTop: '22px' }}>
              <span className="tag is-warning is-medium is-fullwidth">
                <i className="zmdi zmdi-truck mr-2"></i>
                {filteredShippings.length} envío(s)
              </span>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <p className="has-text-centered">Cargando envíos en ruta...</p>
      ) : filteredShippings.length === 0 ? (
        <div className="notification is-light has-text-centered mx-auto" style={{ maxWidth: '600px', padding: '40px 30px' }}>
          <i className="zmdi zmdi-check-all" style={{ fontSize: '48px', color: '#48c774', display: 'block', marginBottom: '15px' }}></i>
          <p className="is-size-5">
            {searchTerm || cityFilter
              ? 'No se encontraron envíos con esos criterios de búsqueda.'
              : '¡Excelente trabajo! No hay envíos pendientes por entregar en este momento.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {filteredShippings.map((order) => (
            <div key={order.id_order} className="box" style={{ padding: '0', overflow: 'hidden', borderLeft: '5px solid #ffdd57', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
              
              {/* ORDER HEADER */}
              <div 
                style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: '20px 25px',
                  backgroundColor: '#fcfcfc', 
                  borderBottom: expandedOrders[order.id_order] ? '1px solid #eee' : 'none' 
                }}
              >
                <div style={{ minWidth: '250px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    <i className="zmdi zmdi-truck has-text-warning" style={{ fontSize: '26px', marginRight: '10px' }}></i> 
                    <span className="title is-4" style={{ marginBottom: '0' }}>Pedido #{order.id_order}</span>
                  </div>
                  <p style={{ marginBottom: '0', paddingLeft: '36px', color: '#666', fontSize: '0.95rem' }}>
                    <strong>Cliente:</strong> {order.client_name ? `${order.client_name} ${order.client_lastname}` : order.username}
                    {order.city && <span className="tag is-light is-small" style={{ marginLeft: '8px' }}>{order.city}</span>}
                  </p>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ textAlign: 'right', marginRight: '8px' }}>
                    <p className="is-size-7 has-text-grey" style={{ marginBottom: '2px' }}>Total a Cobrar</p>
                    <span className="is-size-4 has-text-weight-bold has-text-success">
                      C${order.realTotal}
                    </span>
                  </div>

                  <span className="tag is-warning is-medium">
                    <i className="zmdi zmdi-run" style={{ marginRight: '5px' }}></i> En camino
                  </span>
                  
                  <button 
                    className={`button is-small ${expandedOrders[order.id_order] ? 'is-light' : 'is-info is-outlined'}`} 
                    onClick={() => toggleOrder(order.id_order)}
                  >
                    <i className={`zmdi zmdi-chevron-${expandedOrders[order.id_order] ? 'up' : 'down'}`} style={{ marginRight: '5px' }}></i>
                    {expandedOrders[order.id_order] ? 'Ocultar' : 'Detalles'}
                  </button>
                  
                  <button 
                    className="button is-success is-small" 
                    onClick={() => handleMarkAsDelivered(order.id_order)}
                  >
                    <i className="zmdi zmdi-check-all" style={{ marginRight: '5px' }}></i> Entregado
                  </button>
                </div>
              </div>
              
              {/* ORDER DETAILS (Collapsible) */}
              {expandedOrders[order.id_order] && (
                <div style={{ padding: '25px 30px', backgroundColor: '#fff' }}>
                  <div className="columns is-variable is-6">
                    
                    {/* Left: Client Data + Shipping */}
                    <div className="column is-12-mobile is-5-tablet">
                      <div style={{ backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e8e8e8', padding: '20px 22px', height: '100%' }}>
                        
                        <h4 className="title is-6" style={{ color: '#444', borderBottom: '2px solid #e0e0e0', paddingBottom: '10px', marginBottom: '15px' }}>
                          <i className="zmdi zmdi-account" style={{ marginRight: '8px' }}></i>Datos del Cliente
                        </h4>
                        <div style={{ marginBottom: '20px' }}>
                          <p style={{ fontSize: '0.95rem', marginBottom: '8px' }}>
                            <strong>Nombre Completo:</strong><br/>
                            {order.client_name ? `${order.client_name} ${order.client_lastname}` : 'N/A'}
                          </p>
                          <p style={{ fontSize: '0.95rem', marginBottom: '8px' }}>
                            <strong>Cédula:</strong> {order.cedula || 'N/A'}
                          </p>
                          <p style={{ fontSize: '0.95rem', marginBottom: '0' }}>
                            <strong>Usuario:</strong> @{order.username}
                          </p>
                        </div>
                        
                        <h4 className="title is-6" style={{ color: '#444', borderBottom: '2px solid #e0e0e0', paddingBottom: '10px', marginBottom: '15px', marginTop: '25px' }}>
                          <i className="zmdi zmdi-pin" style={{ marginRight: '8px' }}></i>Destino de Entrega
                        </h4>
                        <div style={{ marginBottom: '20px' }}>
                          <p style={{ fontSize: '0.95rem', marginBottom: '8px' }}>
                            <strong>Ciudad / Departamento:</strong><br/>
                            {order.city || 'N/A'}
                          </p>
                          <p style={{ fontSize: '0.95rem', marginBottom: '8px' }}>
                            <strong>Dirección Exacta:</strong><br/>
                            {order.address.split(' | Mapa:')[0]}
                          </p>
                          <p style={{ fontSize: '0.95rem', marginBottom: '0' }}>
                            <strong>Método de Pago:</strong>{' '}
                            <span className="tag is-primary is-light">{order.paymethod}</span>
                          </p>
                        </div>
                        
                        {/* Google Maps Button */}
                        {order.address.includes(' | Mapa: https://maps') ? (
                          <a 
                            href={order.address.match(/\| Mapa: (https:\/\/maps\.google\.com\/\?q=[0-9.-]+,[0-9.-]+)/)?.[1] || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="button is-fullwidth is-link" 
                            style={{ marginTop: '15px' }}
                          >
                            <i className="zmdi zmdi-map" style={{ marginRight: '8px' }}></i> Ver en Google Maps
                          </a>
                        ) : (
                          <button 
                            className="button is-fullwidth is-link is-light" 
                            style={{ marginTop: '15px' }}
                            onClick={() => Swal.fire('Sin Ubicación Exacta', 'El cliente no marcó su ubicación en el mapa interactivo durante la compra.', 'info')}
                          >
                            <i className="zmdi zmdi-map" style={{ marginRight: '8px' }}></i> Ver en Google Maps
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Right: Package Contents */}
                    <div className="column is-12-mobile is-7-tablet">
                      <div style={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e8e8e8', padding: '20px 22px', height: '100%' }}>
                        <h5 className="title is-6" style={{ color: '#444', borderBottom: '2px solid #e0e0e0', paddingBottom: '10px', marginBottom: '15px' }}>
                          <i className="zmdi zmdi-dropbox" style={{ marginRight: '8px' }}></i>
                          Contenido del Paquete ({order.items.length} artículo{order.items.length > 1 ? 's' : ''})
                        </h5>
                        
                        {order.items.map((item, idx) => {
                          const imgSrc = item.custom_image || item.image
                          const finalImg = imgSrc?.startsWith('http') ? imgSrc : `/img/${imgSrc}`
                          return (
                            <div 
                              key={idx} 
                              style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                marginBottom: '14px', 
                                backgroundColor: '#fafafa', 
                                padding: '14px 16px', 
                                borderRadius: '8px', 
                                border: '1px solid #f0f0f0' 
                              }}
                            >
                              <img
                                src={finalImg}
                                alt={item.name}
                                style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '6px', marginRight: '18px', cursor: 'pointer', border: '1px solid #ddd' }}
                                onClick={() => Swal.fire({ imageUrl: finalImg, imageAlt: item.name, showConfirmButton: false, showCloseButton: true, width: 'auto', padding: '1em' })}
                                title="Haz clic para ver completo"
                              />
                              <div style={{ flex: 1 }}>
                                <p className="has-text-weight-bold" style={{ marginBottom: '4px' }}>{item.name}</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.85rem', color: '#666' }}>
                                  <span><strong>Talla:</strong> {item.size}</span>
                                  <span><strong>Color:</strong> {item.color}</span>
                                </div>
                                <p style={{ fontSize: '0.85rem', marginTop: '4px', color: '#888' }}>
                                  {item.quantityOrders} unidad(es) × C${item.price}
                                </p>
                              </div>
                            </div>
                          )
                        })}
                        
                        <div style={{ textAlign: 'right', marginTop: '18px', paddingTop: '14px', borderTop: '1px dashed #ddd' }}>
                          <p style={{ fontSize: '0.95rem', color: '#666' }}>
                            Costo de Envío: <strong>C${order.cost}</strong>
                          </p>
                          <p style={{ fontSize: '1.1rem', marginTop: '6px' }}>
                            <strong className="has-text-success">Total: C${order.realTotal}</strong>
                          </p>
                        </div>
                      </div>
                    </div>
                    
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  )
}
