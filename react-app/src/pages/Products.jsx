import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getItemsByCategory } from '../api/itemsApi'
import ItemCard from '../components/ItemCard'

export default function Products() {
  const { cat, clas } = useParams()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true)
      try {
        const res = await getItemsByCategory(cat, clas)
        setItems(res.data)
      } catch (error) {
        console.error('Error fetching category items:', error)
      } finally {
        setLoading(false)
      }
    }

    if (cat && clas) {
      fetchItems()
    }
  }, [cat, clas])

  return (
    <div className="container container-full">
      <h1 className="is-size-2 has-text-weight-bold has-text-centered has-text-black" style={{ marginTop: '20px' }}>Catálogo</h1>
      <h2 className="is-size-4 has-text-centered has-text-black">Encuentra tu estilo</h2>

      {loading ? (
        <p className="has-text-centered" style={{ marginTop: '50px' }}>Cargando artículos...</p>
      ) : items.length === 0 ? (
        <p className="has-text-centered" style={{ marginTop: '50px' }}>No hay artículos en esta categoría.</p>
      ) : (
        <div className="columns is-multiline" style={{ marginTop: '20px' }}>
          <div className="column is-full-mobile">
            <div className="columns is-centered is-mobile is-multiline">
              {items.map((item, i) => (
                <div key={i} className="column is-one-quarter-desktop is-half-tablet column-full">
                  <ItemCard item={item} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
