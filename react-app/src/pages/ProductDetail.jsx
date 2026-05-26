import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getItemById } from '../api/itemsApi'
import { useCart } from '../context/CartContext'
import Swal from 'sweetalert2'

export default function ProductDetail() {
  const { id } = useParams()
  const { addToCart } = useCart()
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  
  const [quantity, setQuantity] = useState(1)
  const [size, setSize] = useState('S')
  const [color, setColor] = useState('Negro')

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await getItemById(id)
        // Ensure it's not array or handle array
        let data = res.data
        if (Array.isArray(data)) data = data[0]
        
        // Map Flask tuple logic if needed
        setItem({
          id_item: data.id_item || data[4] || data[5] || data[0],
          name: data.name || data[0],
          price: data.price || data[1],
          image: data.image || data[3] || data[4] || data[2],
          description: data.description || '100% cotton.'
        })
      } catch (error) {
        console.error('Error fetching product:', error)
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchItem()
  }, [id])

  const handleAddToCart = (e) => {
    e.preventDefault()
    addToCart({
      ...item,
      quantity: Number(quantity),
      size,
      color
    })
    Swal.fire({
      icon: 'success',
      title: '¡Añadido!',
      text: 'El artículo ha sido añadido al carrito.',
      timer: 1500,
      showConfirmButton: false
    })
  }

  if (loading) return <p className="has-text-centered" style={{ marginTop: '50px' }}>Cargando producto...</p>
  if (!item) return <p className="has-text-centered" style={{ marginTop: '50px' }}>Producto no encontrado.</p>

  const imgSrc = item.image?.startsWith('http') ? item.image : `/img/${item.image}`

  return (
    <div className="container" style={{ marginTop: '50px', marginBottom: '50px' }}>
      <div className="columns">
        <div className="column is-half">
          <img src={imgSrc} alt={item.name} style={{ width: '100%', borderRadius: '8px' }} />
        </div>
        <div className="column is-half" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h1 className="title is-2 has-text-black">{item.name}</h1>
          <h2 className="subtitle is-3 has-text-black has-text-weight-bold" style={{ marginTop: '10px' }}>
            C${item.price}
          </h2>
          <p style={{ marginBottom: '20px' }}>{item.description}</p>
          
          <form onSubmit={handleAddToCart}>
            <div className="field">
              <label className="label">Talla</label>
              <div className="control">
                <div className="select">
                  <select value={size} onChange={(e) => setSize(e.target.value)}>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="field">
              <label className="label">Color</label>
              <div className="control">
                <div className="select">
                  <select value={color} onChange={(e) => setColor(e.target.value)}>
                    <option value="Negro">Negro</option>
                    <option value="Blanco">Blanco</option>
                    <option value="Gris">Gris</option>
                    <option value="Azul">Azul</option>
                    <option value="Rojo">Rojo</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="field">
              <label className="label">Cantidad</label>
              <div className="control">
                <input 
                  className="input" 
                  type="number" 
                  min="1" 
                  max="10" 
                  value={quantity} 
                  onChange={(e) => setQuantity(e.target.value)} 
                  style={{ width: '100px' }}
                />
              </div>
            </div>

            <div className="field is-grouped" style={{ marginTop: '30px' }}>
              <div className="control">
                <button type="submit" className="button is-dark is-medium">Añadir al carrito</button>
              </div>
              <div className="control">
                <Link to="/items" className="button is-light is-medium">Seguir comprando</Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
