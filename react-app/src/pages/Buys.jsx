import { useEffect, useState } from 'react'
import { getOrdersByUser } from '../api/ordersApi'
import { useAuth } from '../context/AuthContext'
import Swal from 'sweetalert2'

export default function Buys() {
  const { user } = useAuth()
  const [buys, setBuys] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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

    if (user?.username) {
      fetchBuys()
    }
  }, [user])

  const groupedOrders = Object.values(
    buys.reduce((acc, buy) => {
      if (!acc[buy.id_order]) {
        acc[buy.id_order] = { 
          id_order: buy.id_order,
          orderdate: buy.orderdate,
          status: buy.status,
          address: buy.address,
          cost: buy.cost,
          totalAmount: buy.totalAmount, // Note: SP totalAmount is the total of THAT item + shipping. We will sum it properly.
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

  // Sort by latest order
  groupedOrders.sort((a, b) => new Date(b.orderdate) - new Date(a.orderdate))

  return (
    <div className="container" style={{ marginTop: '50px', marginBottom: '50px', minHeight: '60vh' }}>
      <h1 className="title is-2 has-text-centered">Mis Compras</h1>

      {loading ? (
        <p className="has-text-centered">Cargando tus compras...</p>
      ) : buys.length === 0 ? (
        <div className="has-text-centered">
          <p>¡Hola! {user.username} aún no haz comprado un artículo :D</p>
        </div>
      ) : (
        <div className="columns is-multiline" style={{ marginTop: '20px' }}>
          {groupedOrders.map((order, i) => (
            <div key={i} className="column is-12">
              <div className="box">
                <div className="columns is-vcentered" style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}>
                  <div className="column">
                    <h3 className="title is-4 mb-1">Pedido #{order.id_order}</h3>
                    <p className="has-text-grey is-size-7">Fecha: {new Date(order.orderdate).toLocaleDateString()}</p>
                  </div>
                  <div className="column has-text-right">
                    <span className={`tag is-medium ${order.status === 'Pendiente' ? 'is-warning' : 'is-info'}`}>{order.status}</span>
                  </div>
                </div>
                
                <div className="columns">
                  <div className="column is-8">
                    <h5 className="title is-5 mb-3">Artículos:</h5>
                    {order.items.map((item, idx) => {
                      const imgSrc = item.custom_image || item.image
                      const finalImg = imgSrc?.startsWith('http') ? imgSrc : `/img/${imgSrc}`
                      return (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', backgroundColor: '#fafafa', padding: '10px', borderRadius: '8px' }}>
                          <img 
                            src={finalImg} 
                            alt={item.name} 
                            style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', marginRight: '15px', cursor: 'pointer', border: '1px solid #ddd' }}
                            onClick={() => Swal.fire({ imageUrl: finalImg, imageAlt: item.name, showConfirmButton: false, showCloseButton: true, width: 'auto', padding: '1em' })} 
                            title="Haz clic para ver completo"
                          />
                          <div>
                            <p className="has-text-weight-bold mb-1">{item.name}</p>
                            <p className="is-size-7 mb-0">Talla: {item.size} | Color: {item.color}</p>
                            <p className="is-size-7 mb-0">Cantidad: {item.quantityOrders} x C${item.price}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="column is-4">
                    <div className="notification is-light">
                      <h4 className="title is-5 mb-3">Resumen del Pedido</h4>
                      <p className="mb-1"><strong>Dirección:</strong> {order.address}</p>
                      <hr style={{ margin: '10px 0' }} />
                      <div className="is-flex is-justify-content-space-between mb-1">
                        <span>Costo de Envío:</span>
                        <span>C${order.cost}</span>
                      </div>
                      <div className="is-flex is-justify-content-space-between mt-2">
                        <span className="is-size-5 has-text-weight-bold">Total Pagado:</span>
                        <span className="is-size-4 has-text-weight-bold has-text-success">C${order.realTotal}</span>
                      </div>
                    </div>
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
