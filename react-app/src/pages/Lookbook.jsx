import { useEffect, useState } from 'react'
import { getItems } from '../api/itemsApi'
import ItemCard from '../components/ItemCard'

export default function Lookbook() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await getItems()
        setItems(res.data)
      } catch (error) {
        console.error('Error fetching lookbook items:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchItems()
  }, [])

  return (
    <>
      <div className="container container-full">
        <h1 className="is-size-2 has-text-weight-bold has-text-centered has-text-black" style={{ marginTop: '20px' }}>Lookbook</h1>
        <h2 className="is-size-4 has-text-centered has-text-black">Prendas con el mejor estilo</h2>

        {loading ? (
          <p className="has-text-centered" style={{ marginTop: '50px' }}>Cargando artículos...</p>
        ) : (
          <div className="columns is-multiline">
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
    </>
  )
}
