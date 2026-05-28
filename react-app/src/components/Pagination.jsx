/**
 * Componente de paginación reutilizable.
 * Props: page, totalPages, onPrev, onNext, onPage
 */
export default function Pagination({ page, totalPages, onPrev, onNext, onPage }) {
  if (totalPages <= 1) return null

  // Genera números de página a mostrar (max 5, centrado en la actual)
  const getPages = () => {
    const delta = 2
    const range = []
    const left  = Math.max(1, page - delta)
    const right = Math.min(totalPages, page + delta)

    for (let i = left; i <= right; i++) range.push(i)

    // Agrega primera y última con ellipsis si es necesario
    const pages = []
    if (left > 1) {
      pages.push(1)
      if (left > 2) pages.push('...')
    }
    pages.push(...range)
    if (right < totalPages) {
      if (right < totalPages - 1) pages.push('...')
      pages.push(totalPages)
    }
    return pages
  }

  return (
    <nav className="pagination-nav" aria-label="Paginación">
      <button
        className="pagination-btn"
        onClick={onPrev}
        disabled={page === 1}
        aria-label="Página anterior"
      >
        ‹
      </button>

      <div className="pagination-pages">
        {getPages().map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="pagination-ellipsis">…</span>
          ) : (
            <button
              key={p}
              className={`pagination-btn pagination-num${p === page ? ' active' : ''}`}
              onClick={() => onPage(p)}
              aria-current={p === page ? 'page' : undefined}
            >
              {p}
            </button>
          )
        )}
      </div>

      <button
        className="pagination-btn"
        onClick={onNext}
        disabled={page === totalPages}
        aria-label="Página siguiente"
      >
        ›
      </button>
    </nav>
  )
}
