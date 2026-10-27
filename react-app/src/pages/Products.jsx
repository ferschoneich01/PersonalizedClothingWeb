import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  getItemsByCategory,
  getItemsByCategoryOnly,
  getItemsByClasificationOnly,
  getCategories,
} from '../api/itemsApi'
import ItemCard from '../components/ItemCard'
import Pagination from '../components/Pagination'
import { usePagination } from '../hooks/usePagination'

const DEFAULT_CATEGORIES = {
  '1': 'Camisetas',
  '2': 'Sudaderas',
  '3': 'Crop tops',
  '4': 'Suéteres',
}

const GENDER_MAP = {
  '1': 'Hombre',
  '2': 'Mujer',
  '3': 'Niños',
}

export default function Products() {
  const { cat, clas } = useParams()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [categoriesMap, setCategoriesMap] = useState(DEFAULT_CATEGORIES)

  const { page, totalPages, paginated, setPage, goNext, goPrev } = usePagination(items, 8)

  // Carga las categorías dinámicas de la base de datos
  useEffect(() => {
    getCategories()
      .then((res) => {
        if (Array.isArray(res.data)) {
          const map = { ...DEFAULT_CATEGORIES }
          res.data.forEach((c) => {
            if (c.id_clasification && c.name) {
              const nameLower = c.name.toLowerCase().trim()
              let label = c.name
              if (nameLower === 'camisetas') label = 'Camisetas'
              else if (nameLower === 'sudadera') label = 'Sudaderas'
              else if (nameLower === 'croptop') label = 'Crop tops'
              else if (nameLower === 'sueter') label = 'Suéteres'
              else label = c.name.charAt(0).toUpperCase() + c.name.slice(1)

              map[String(c.id_clasification)] = label
            }
          })
          setCategoriesMap(map)
        }
      })
      .catch((err) => {
        console.warn('No se pudieron cargar categorías dinámicas, usando catálogo por defecto:', err)
      })
  }, [])

  // Determinar títulos y cargar artículos según los parámetros recibidos
  useEffect(() => {
    setLoading(true)
    setPage(1)

    // Caso 1: Ambos parámetros presentes (ej. /items/category/:gender/:garment o /category/:cat/:clas)
    if (cat && clas) {
      const catNum = parseInt(cat, 10)
      const clasNum = parseInt(clas, 10)

      let genderParam = cat
      let garmentParam = clas

      // Detección inteligente por si vienen invertidos (ej. prenda > 2 y género <= 2)
      if (catNum > 2 && clasNum <= 2) {
        genderParam = clas
        garmentParam = cat
      }

      getItemsByCategory(genderParam, garmentParam)
        .then((res) => setItems(res.data || []))
        .catch((err) => {
          console.error('Error fetching items by category:', err)
          setItems([])
        })
        .finally(() => setLoading(false))
      return
    }

    // Caso 2: Solo clas presente (ej. /items/clasification/:clas desde Home o Footer)
    if (clas && !cat) {
      if (['1', '2', '3'].includes(String(clas))) {
        // Viene de "Catálogo de Caballero" o "Catálogo de Dama"
        getItemsByCategoryOnly(clas)
          .then((res) => setItems(res.data || []))
          .catch((err) => {
            console.error('Error fetching items by gender:', err)
            setItems([])
          })
          .finally(() => setLoading(false))
      } else {
        // Es un id_clasification de prenda directo
        getItemsByClasificationOnly(clas)
          .then((res) => setItems(res.data || []))
          .catch((err) => {
            console.error('Error fetching items by clasification:', err)
            setItems([])
          })
          .finally(() => setLoading(false))
      }
      return
    }

    // Caso 3: Solo cat presente (ej. /items/category/:cat)
    if (cat && !clas) {
      if (['1', '2', '3'].includes(String(cat))) {
        getItemsByCategoryOnly(cat)
          .then((res) => setItems(res.data || []))
          .catch((err) => {
            console.error('Error fetching items by category only:', err)
            setItems([])
          })
          .finally(() => setLoading(false))
      } else {
        getItemsByClasificationOnly(cat)
          .then((res) => setItems(res.data || []))
          .catch((err) => {
            console.error('Error fetching items by clasification only:', err)
            setItems([])
          })
          .finally(() => setLoading(false))
      }
      return
    }

    setLoading(false)
  }, [cat, clas])

  // Calcular etiquetas visuales de Título y Subtítulo
  let title = 'Catálogo de Artículos'
  let subtitle = ''

  if (cat && clas) {
    const catNum = parseInt(cat, 10)
    const clasNum = parseInt(clas, 10)
    let genderKey = cat
    let garmentKey = clas
    if (catNum > 2 && clasNum <= 2) {
      genderKey = clas
      garmentKey = cat
    }
    title = categoriesMap[garmentKey] || 'Prendas'
    subtitle = GENDER_MAP[genderKey] || ''
  } else if (clas && !cat) {
    if (['1', '2', '3'].includes(String(clas))) {
      title = `Catálogo de ${GENDER_MAP[clas] || ''}`
      subtitle = 'Todos los artículos de la colección'
    } else {
      title = categoriesMap[clas] || 'Artículos'
      subtitle = 'Colección completa'
    }
  } else if (cat && !clas) {
    if (['1', '2', '3'].includes(String(cat))) {
      title = `Catálogo de ${GENDER_MAP[cat] || ''}`
      subtitle = 'Todos los artículos de la colección'
    } else {
      title = categoriesMap[cat] || 'Artículos'
      subtitle = 'Colección completa'
    }
  }

  return (
    <div className="catalog-page">
      {/* Header */}
      <div className="catalog-header">
        <h1 className="catalog-title">{title}</h1>
        {subtitle && <p className="catalog-subtitle">{subtitle}</p>}
        {!loading && (
          <p className="catalog-count">{items.length} artículo{items.length !== 1 ? 's' : ''}</p>
        )}
      </div>

      {/* Contenido */}
      {loading ? (
        <div className="catalog-loading">
          <div className="loading-spinner"></div>
          <p>Cargando artículos...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="catalog-empty">
          <i className="zmdi zmdi-alert-circle" style={{ fontSize: '48px', color: '#ccc' }}></i>
          <p>No hay artículos en esta categoría actualmente.</p>
          <div style={{ marginTop: '16px' }}>
            <Link to="/items" className="btn btn-default is-size-7" style={{ textDecoration: 'none' }}>
              Explorar todo el catálogo
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="items-grid">
            {paginated.map((item, i) => (
              <ItemCard key={item.id_item || i} item={item} />
            ))}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            onPrev={goPrev}
            onNext={goNext}
            onPage={setPage}
          />

          <p className="catalog-page-info">
            Página {page} de {totalPages}
          </p>
        </>
      )}
    </div>
  )
}
