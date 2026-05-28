import { useEffect, useState } from 'react'
import { getItems } from '../api/itemsApi'
import ItemCard from '../components/ItemCard'
import Pagination from '../components/Pagination'
import { usePagination } from '../hooks/usePagination'

export default function Lookbook() {
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(true)

  const { page, totalPages, paginated, setPage, goNext, goPrev } = usePagination(items, 8)

  useEffect(() => {
    getItems()
      .then((res) => setItems(res.data))
      .catch((err) => console.error('Error fetching lookbook items:', err))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="catalog-page">
      {/* Header */}
      <div className="catalog-header">
        <h1 className="catalog-title">Lookbook</h1>
        <p className="catalog-subtitle">Prendas con el mejor estilo</p>
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
          <p>No hay artículos disponibles.</p>
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
