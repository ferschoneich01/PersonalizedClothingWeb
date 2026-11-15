import { useEffect, useState } from 'react'
import { getCategories, getItems } from '../api/itemsApi'
import CatalogView from '../components/CatalogView'

export default function Lookbook() {
  const [items, setItems] = useState([])
  const [categoriesMap, setCategoriesMap] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([getItems(), getCategories()])
      .then(([itemsRes, catsRes]) => {
        if (itemsRes.status === 'fulfilled') {
          const data = itemsRes.value.data
          setItems(Array.isArray(data) ? data : [])
        } else {
          console.error('Error fetching lookbook items:', itemsRes.reason)
        }

        if (catsRes.status === 'fulfilled') {
          const data = catsRes.value.data
          if (Array.isArray(data)) {
            const map = {}
            data.forEach((c) => {
              const id = c.id_category ?? c.id_clasification ?? c.id
              const name = c.name ?? c.category_name ?? c.description
              if (id != null && name) map[String(id)] = name
            })
            setCategoriesMap(map)
          }
        }
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <CatalogView
      items={items}
      loading={loading}
      title="Lookbook & Catálogo"
      subtitle="Prendas esenciales de gramaje alto personalizadas mediante DTF, sublimación y bordado de precisión."
      breadcrumbLabel="Lookbook"
      categoriesMap={categoriesMap}
    />
  )
}
