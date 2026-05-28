import { useState, useMemo } from 'react'

/**
 * Hook de paginación del lado del cliente.
 * @param {Array}  items        - Array completo de ítems
 * @param {number} pageSize     - Cantidad de ítems por página (default 12)
 * @returns {{ page, totalPages, paginated, setPage, goNext, goPrev }}
 */
export function usePagination(items = [], pageSize = 12) {
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))

  // Reinicia a página 1 si el array cambia (nuevo filtro de categoría)
  const safePage = Math.min(page, totalPages)

  const paginated = useMemo(() => {
    const start = (safePage - 1) * pageSize
    return items.slice(start, start + pageSize)
  }, [items, safePage, pageSize])

  const goNext = () => setPage((p) => Math.min(p + 1, totalPages))
  const goPrev = () => setPage((p) => Math.max(p - 1, 1))

  return { page: safePage, totalPages, paginated, setPage, goNext, goPrev }
}
