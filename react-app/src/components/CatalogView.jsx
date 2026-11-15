import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ItemCard from './ItemCard'
import { usePagination } from '../hooks/usePagination'
import { getOrderDetails } from '../api/ordersApi'
import './CatalogView.css'

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

const THEME_OPTIONS = [
  { id: 'all', label: 'Todas las temáticas' },
  {
    id: 'anime',
    label: 'Anime & Series',
    keywords: [
      'rick',
      'morty',
      'simpson',
      'bob',
      'calamardo',
      'naruto',
      'anime',
      'one piece',
      'mugiwara',
      'luffy',
      'stitch',
      'aventura',
      'scooby',
      'snoopy',
      'stranger'
    ]
  },
  {
    id: 'cine',
    label: 'Cine & Superhéroes',
    keywords: ['spider', 'joker', 'calamar', 'jack', 'nasa']
  },
  {
    id: 'musica',
    label: 'Música & Bandas',
    keywords: ['beatles', 'bts', 'rock', 'pink floyd', 'spotify']
  },
  {
    id: 'minimal',
    label: 'Streetwear & Otros',
    keywords: [] // fallback para los demás
  }
]

const COLLECTION_OPTIONS = [
  { id: 'all', label: 'Todas las colecciones' },
  { id: '1', label: 'Caballeros' },
  { id: '2', label: 'Damas' },
  { id: '3', label: 'Niños' }
]

const DEFAULT_GARMENT_TYPES = {
  '1': 'Camisetas',
  '2': 'Sudaderas / Hoodies',
  '3': 'Crop Tops',
  '4': 'Suéteres',
  '7': 'Tazas'
}

const TECHNIQUE_OPTIONS = [
  { id: 'dtf', label: 'DTF Full Color' },
  { id: 'sublimacion', label: 'Sublimación HD' },
  { id: 'bordado', label: 'Bordado Directo' }
]

function detectItemTheme(name = '') {
  const lower = String(name).toLowerCase()
  for (const theme of THEME_OPTIONS) {
    if (theme.id === 'all' || theme.id === 'minimal') continue
    if (theme.keywords.some((kw) => lower.includes(kw))) {
      return theme.id
    }
  }
  return 'minimal'
}

export default function CatalogView({
  items = [],
  loading = false,
  title = 'Lookbook & Catálogo',
  subtitle = 'Prendas esenciales de gramaje alto personalizadas mediante DTF, sublimación y bordado de precisión.',
  breadcrumbLabel = 'Lookbook',
  categoriesMap = {},
  hideCollectionFilter = false,
  emptyActionLink = '/items',
  emptyActionLabel = 'Explorar todo el catálogo'
}) {
  // ── Estados de Filtro ──
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTheme, setSelectedTheme] = useState('all')
  const [selectedCollection, setSelectedCollection] = useState('all')
  const [selectedTypes, setSelectedTypes] = useState([])
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedTechniques, setSelectedTechniques] = useState(['dtf', 'sublimacion', 'bordado'])
  const [sortBy, setSortBy] = useState('popular')
  const [viewMode, setViewMode] = useState('grid')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false)

  // Ventas reales para ordenar por "Más populares"
  const [salesByItemId, setSalesByItemId] = useState({})
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('pc_favorites') || '[]')
    } catch {
      return []
    }
  })

  useEffect(() => {
    let mounted = true
    getOrderDetails()
      .then((res) => {
        if (!mounted || !Array.isArray(res.data)) return
        const counts = {}
        res.data.forEach((row) => {
          if (row.id_item) {
            counts[row.id_item] = (counts[row.id_item] || 0) + Number(row.quantityOrders || 1)
          }
        })
        setSalesByItemId(counts)
      })
      .catch(() => {})
    return () => {
      mounted = false
    }
  }, [])

  // Bloquea scroll cuando el drawer móvil está abierto
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [drawerOpen])

  // Normaliza ítems
  const normalizedItems = useMemo(() => {
    return items.map((it) => {
      const id_item = it.id_item ?? it[0]
      const name = it.name ?? it[1] ?? 'Artículo'
      const description = it.description ?? it[2] ?? ''
      const image =
        (Array.isArray(it.images) && it.images[0]) || it.image || it[3] || 'item-1.png'
      const price = Number(it.price ?? it[4] ?? 0)
      const clasification = String(it.clasification ?? it[5] ?? 1)
      const category = String(it.category ?? it[6] ?? 1)
      const theme = detectItemTheme(name)
      const soldCount = salesByItemId[id_item] || 0
      return {
        raw: it,
        id_item,
        name,
        description,
        image,
        price,
        clasification,
        category,
        theme,
        soldCount
      }
    })
  }, [items, salesByItemId])

  // Límites de precio calculados dinámicamente
  const priceBounds = useMemo(() => {
    if (normalizedItems.length === 0) return { min: 0, max: 1000 }
    const prices = normalizedItems.map((it) => it.price)
    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices))
    }
  }, [normalizedItems])

  const [priceRange, setPriceRange] = useState([0, 1000])

  useEffect(() => {
    setPriceRange([priceBounds.min, priceBounds.max])
  }, [priceBounds.min, priceBounds.max])

  // Tipos de prenda disponibles con conteo real
  const garmentTypesList = useMemo(() => {
    const mergedLabels = { ...DEFAULT_GARMENT_TYPES, ...categoriesMap }
    const counts = {}
    normalizedItems.forEach((it) => {
      counts[it.clasification] = (counts[it.clasification] || 0) + 1
    })
    return Object.keys(counts)
      .sort((a, b) => Number(a) - Number(b))
      .map((key) => ({
        id: key,
        label: mergedLabels[key] || `Categoría ${key}`,
        count: counts[key]
      }))
  }, [normalizedItems, categoriesMap])

  // Conteos por temática
  const themeCounts = useMemo(() => {
    const map = { all: normalizedItems.length }
    THEME_OPTIONS.forEach((t) => {
      if (t.id !== 'all') {
        map[t.id] = normalizedItems.filter((it) => it.theme === t.id).length
      }
    })
    return map
  }, [normalizedItems])

  // Conteos por colección
  const collectionCounts = useMemo(() => {
    const map = { all: normalizedItems.length }
    COLLECTION_OPTIONS.forEach((c) => {
      if (c.id !== 'all') {
        map[c.id] = normalizedItems.filter((it) => it.category === c.id).length
      }
    })
    return map
  }, [normalizedItems])

  // Filtrado completo y ordenamiento
  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()

    const result = normalizedItems.filter((it) => {
      if (q) {
        const hay = `${it.name} ${it.description}`.toLowerCase()
        if (!hay.includes(q)) return false
      }

      if (selectedTheme !== 'all' && it.theme !== selectedTheme) {
        return false
      }

      if (!hideCollectionFilter && selectedCollection !== 'all' && it.category !== selectedCollection) {
        return false
      }

      if (selectedTypes.length > 0 && !selectedTypes.includes(it.clasification)) {
        return false
      }

      if (selectedSize) {
        // Verifica si la descripción del artículo menciona tallas; si es taza (clasificacion === '7'), no exige talla textil
        if (it.clasification !== '7' && it.description) {
          const upperDesc = it.description.toUpperCase()
          const hasAnySizeInfo = SIZE_OPTIONS.some((sz) =>
            new RegExp(`(^|\\s|\\n)${sz}(\\s|\\t|\\(|:)`, 'm').test(upperDesc)
          )
          if (hasAnySizeInfo) {
            const hasSelected = new RegExp(`(^|\\s|\\n)${selectedSize}(\\s|\\t|\\(|:)`, 'm').test(
              upperDesc
            )
            if (!hasSelected) return false
          }
        }
      }

      if (it.price < priceRange[0] || it.price > priceRange[1]) {
        return false
      }

      return true
    })

    const sorted = [...result]
    if (sortBy === 'popular') {
      sorted.sort((a, b) => b.soldCount - a.soldCount)
    } else if (sortBy === 'price_asc') {
      sorted.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'price_desc') {
      sorted.sort((a, b) => b.price - a.price)
    } else if (sortBy === 'name_asc') {
      sorted.sort((a, b) => a.name.localeCompare(b.name))
    }

    return sorted
  }, [
    normalizedItems,
    searchQuery,
    selectedTheme,
    selectedCollection,
    hideCollectionFilter,
    selectedTypes,
    selectedSize,
    priceRange,
    sortBy
  ])

  const pageSize = viewMode === 'list' ? 8 : 12
  const { page, totalPages, paginated, setPage, goNext, goPrev } = usePagination(
    filteredItems,
    pageSize
  )

  // Al cambiar filtros vuelve a la página 1
  useEffect(() => {
    setPage(1)
  }, [
    searchQuery,
    selectedTheme,
    selectedCollection,
    selectedTypes,
    selectedSize,
    priceRange,
    sortBy
  ])

  const toggleType = (id) => {
    setSelectedTypes((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const toggleTechnique = (id) => {
    setSelectedTechniques((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    )
  }

  const handleToggleFav = (id_item) => {
    setFavorites((prev) => {
      const next = prev.includes(id_item)
        ? prev.filter((id) => id !== id_item)
        : [...prev, id_item]
      try {
        localStorage.setItem('pc_favorites', JSON.stringify(next))
      } catch {
        // ignore storage errors
      }
      return next
    })
  }

  const clearAllFilters = () => {
    setSearchQuery('')
    setSelectedTheme('all')
    setSelectedCollection('all')
    setSelectedTypes([])
    setSelectedSize('')
    setPriceRange([priceBounds.min, priceBounds.max])
    setSelectedTechniques(['dtf', 'sublimacion', 'bordado'])
  }

  const activeFilterCount =
    (searchQuery.trim() ? 1 : 0) +
    (selectedTheme !== 'all' ? 1 : 0) +
    (!hideCollectionFilter && selectedCollection !== 'all' ? 1 : 0) +
    selectedTypes.length +
    (selectedSize ? 1 : 0) +
    (priceRange[0] > priceBounds.min || priceRange[1] < priceBounds.max ? 1 : 0)

  const startIndex = filteredItems.length === 0 ? 0 : (page - 1) * pageSize + 1
  const endIndex = Math.min(page * pageSize, filteredItems.length)

  const getPageNumbers = () => {
    const pages = []
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
      return pages
    }
    pages.push(1)
    if (page > 3) pages.push('...')
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i)
    }
    if (page < totalPages - 2) pages.push('...')
    pages.push(totalPages)
    return pages
  }

  return (
    <div className="sc-page">
      {/* ── Barra Superior Breadcrumb & Estado ── */}
      <div className="sc-top-strip">
        <div className="sc-top-strip-inner">
          <nav className="sc-breadcrumbs" aria-label="Breadcrumb">
            <Link to="/">Inicio</Link>
            <span>›</span>
            <Link to="/items">Catálogo</Link>
            <span>›</span>
            <span className="sc-breadcrumbs-current">{breadcrumbLabel}</span>
          </nav>

          <div className="sc-strip-status">
            <span className="sc-status-live">
              <span className="sc-status-dot" />
              <span>
                {loading
                  ? 'CARGANDO CATÁLOGO...'
                  : `${filteredItems.length} ARTÍCULO${filteredItems.length !== 1 ? 'S' : ''} DISPONIBLE${filteredItems.length !== 1 ? 'S' : ''}`}
              </span>
            </span>
            <span className="sc-status-sep">•</span>
            <span className="sc-status-meta">
              ALGODÓN 100% PREMIUM • DTF, SUBLIMACIÓN Y BORDADO
            </span>
          </div>
        </div>
      </div>

      {/* ── Contenido Principal ── */}
      <div className="sc-container">
        {/* Encabezado de Sección */}
        <header className="sc-header-row">
          <div>
            <span className="sc-eyebrow-pill">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                <line x1="7" y1="7" x2="7.01" y2="7"/>
              </svg>
              <span>COLECCIÓN URBANA 2026 / STREETWEAR</span>
            </span>
            <h1 className="sc-title">{title}</h1>
            <p className="sc-subtitle">{subtitle}</p>
          </div>

          <div className="sc-header-badges">
            <div className="sc-info-pill">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
              <span>DTF, Sublimación &amp; Bordado</span>
            </div>
            <div className="sc-info-pill">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13"/>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                <circle cx="5.5" cy="18.5" r="2.5"/>
                <circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
              <span>Envíos 24-48h Nacional</span>
            </div>
          </div>
        </header>

        {/* Backdrop móvil del drawer */}
        <div
          className={`sc-drawer-backdrop ${drawerOpen ? 'is-open' : ''}`}
          onClick={() => setDrawerOpen(false)}
        />

        {/* Layout Sidebar + Grid */}
        <div className="sc-layout">
          {/* ── Sidebar de Filtros (Drawer en móvil/tablet) ── */}
          <aside className={`sc-sidebar ${drawerOpen ? 'is-open' : ''}`} aria-label="Filtros de catálogo">
            <div className="sc-sidebar-top">
              <span className="sc-sidebar-title">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="21" x2="4" y2="14"/>
                  <line x1="4" y1="10" x2="4" y2="3"/>
                  <line x1="12" y1="21" x2="12" y2="12"/>
                  <line x1="12" y1="8" x2="12" y2="3"/>
                  <line x1="20" y1="21" x2="20" y2="16"/>
                  <line x1="20" y1="12" x2="20" y2="3"/>
                  <line x1="1" y1="14" x2="7" y2="14"/>
                  <line x1="9" y1="8" x2="15" y2="8"/>
                  <line x1="17" y1="16" x2="23" y2="16"/>
                </svg>
                <span>Filtros</span>
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    className="sc-clear-btn"
                    onClick={clearAllFilters}
                  >
                    LIMPIAR TODO
                  </button>
                )}
                <button
                  type="button"
                  className="sc-drawer-close"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Cerrar filtros"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Colección (si estamos en Lookbook general) */}
            {!hideCollectionFilter && (
              <div className="sc-filter-group">
                <span className="sc-filter-heading">COLECCIÓN</span>
                <div className="sc-option-list">
                  {COLLECTION_OPTIONS.map((col) => {
                    const count = collectionCounts[col.id] || 0
                    if (col.id !== 'all' && count === 0) return null
                    const active = selectedCollection === col.id
                    return (
                      <div
                        key={col.id}
                        role="button"
                        tabIndex={0}
                        className={`sc-option-row ${active ? 'is-active' : ''}`}
                        onClick={() => setSelectedCollection(col.id)}
                        onKeyDown={(e) => e.key === 'Enter' && setSelectedCollection(col.id)}
                      >
                        <span className="sc-option-left">
                          <span className="sc-radio-dot">
                            {active && <span className="sc-radio-inner" />}
                          </span>
                          <span>{col.label}</span>
                        </span>
                        <span className="sc-count-pill">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Temática */}
            <div className="sc-filter-group">
              <span className="sc-filter-heading">TEMÁTICA / POP CULTURE</span>
              <div className="sc-option-list">
                {THEME_OPTIONS.map((theme) => {
                  const count = themeCounts[theme.id] || 0
                  const active = selectedTheme === theme.id
                  return (
                    <div
                      key={theme.id}
                      role="button"
                      tabIndex={0}
                      className={`sc-option-row ${active ? 'is-active' : ''}`}
                      onClick={() => setSelectedTheme(theme.id)}
                      onKeyDown={(e) => e.key === 'Enter' && setSelectedTheme(theme.id)}
                    >
                      <span className="sc-option-left">
                        <span className="sc-radio-dot">
                          {active && <span className="sc-radio-inner" />}
                        </span>
                        <span>{theme.label}</span>
                      </span>
                      <span className="sc-count-pill">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Tipo de prenda */}
            {garmentTypesList.length > 0 && (
              <div className="sc-filter-group">
                <span className="sc-filter-heading">TIPO DE PRENDA</span>
                <div className="sc-option-list">
                  {garmentTypesList.map((gt) => {
                    const active = selectedTypes.includes(gt.id)
                    return (
                      <div
                        key={gt.id}
                        role="button"
                        tabIndex={0}
                        className={`sc-option-row ${active ? 'is-active' : ''}`}
                        onClick={() => toggleType(gt.id)}
                        onKeyDown={(e) => e.key === 'Enter' && toggleType(gt.id)}
                      >
                        <span className="sc-option-left">
                          <span className="sc-checkbox-box">
                            {active && (
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                            )}
                          </span>
                          <span>{gt.label}</span>
                        </span>
                        <span className="sc-count-pill">{gt.count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Tallas */}
            <div className="sc-filter-group">
              <div className="sc-filter-label-row">
                <span className="sc-filter-heading">TALLA</span>
                <button
                  type="button"
                  className="sc-size-guide-link"
                  onClick={() => setSizeGuideOpen(true)}
                >
                  Guía de tallas
                </button>
              </div>
              <div className="sc-sizes-grid">
                {SIZE_OPTIONS.map((sz) => {
                  const active = selectedSize === sz
                  return (
                    <button
                      key={sz}
                      type="button"
                      className={`sc-size-btn ${active ? 'is-active' : ''}`}
                      onClick={() => setSelectedSize((prev) => (prev === sz ? '' : sz))}
                    >
                      {sz}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Rango de Precio */}
            <div className="sc-filter-group">
              <span className="sc-filter-heading">RANGO DE PRECIO</span>
              <div className="sc-price-top">
                <span>C${priceBounds.min}</span>
                <span className="sc-price-max-val">C${priceRange[1]} máx.</span>
              </div>
              <input
                type="range"
                min={priceBounds.min}
                max={priceBounds.max || 1000}
                value={priceRange[1]}
                onChange={(e) =>
                  setPriceRange(([min]) => [min, Math.max(min, Number(e.target.value))])
                }
                className="sc-range-input"
                aria-label="Precio máximo"
              />
              <div className="sc-price-boxes">
                <div className="sc-price-box">
                  <span className="sc-price-box-lbl">Mínimo (C$)</span>
                  <input
                    type="number"
                    className="sc-price-box-input"
                    min={priceBounds.min}
                    max={priceRange[1]}
                    value={priceRange[0]}
                    onChange={(e) => {
                      const val = Number(e.target.value)
                      setPriceRange(([, max]) => [
                        Number.isNaN(val) ? priceBounds.min : Math.min(val, max),
                        max
                      ])
                    }}
                  />
                </div>
                <div className="sc-price-box">
                  <span className="sc-price-box-lbl">Máximo (C$)</span>
                  <input
                    type="number"
                    className="sc-price-box-input"
                    min={priceRange[0]}
                    max={priceBounds.max}
                    value={priceRange[1]}
                    onChange={(e) => {
                      const val = Number(e.target.value)
                      setPriceRange(([min]) => [
                        min,
                        Number.isNaN(val) ? priceBounds.max : Math.max(min, val)
                      ])
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Técnicas disponibles */}
            <div className="sc-filter-group">
              <span className="sc-filter-heading">TÉCNICA DE MARCADO</span>
              <div className="sc-option-list">
                {TECHNIQUE_OPTIONS.map((tech) => {
                  const active = selectedTechniques.includes(tech.id)
                  return (
                    <div
                      key={tech.id}
                      role="button"
                      tabIndex={0}
                      className={`sc-option-row ${active ? 'is-active' : ''}`}
                      onClick={() => toggleTechnique(tech.id)}
                      onKeyDown={(e) => e.key === 'Enter' && toggleTechnique(tech.id)}
                    >
                      <span className="sc-option-left">
                        <span className="sc-checkbox-box">
                          {active && (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          )}
                        </span>
                        <span>{tech.label}</span>
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Card Taller a tu Medida */}
            <div className="sc-custom-cta-card">
              <span className="sc-cta-eyebrow">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z"/>
                </svg>
                <span>TALLER A TU MEDIDA</span>
              </span>
              <h4 className="sc-cta-title">¿Tienes tu propio logo o diseño?</h4>
              <p className="sc-cta-desc">
                Personalizamos desde 1 unidad en DTF, sublimación o bordado profesional.
              </p>
              <a
                href="https://wa.me/50589154885?text=Hola%2C%20quiero%20cotizar%20un%20dise%C3%B1o%20personalizado"
                target="_blank"
                rel="noopener noreferrer"
                className="sc-cta-btn"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                </svg>
                <span>Cotizar por WhatsApp</span>
              </a>
              <Link to="/personalizar" className="sc-cta-sub-link">
                <span>O abrir Estudio de Diseño</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
            </div>

            <button
              type="button"
              className="sc-drawer-apply"
              onClick={() => setDrawerOpen(false)}
            >
              Ver {filteredItems.length} artículo{filteredItems.length !== 1 ? 's' : ''}
            </button>
          </aside>

          {/* ── Área Derecha: Toolbar + Grid de Artículos ── */}
          <main>
            {/* Toolbar de Búsqueda y Ordenamiento */}
            <div className="sc-toolbar">
              <button
                type="button"
                className="sc-mobile-filter-btn"
                onClick={() => setDrawerOpen(true)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                </svg>
                <span>Filtros</span>
                {activeFilterCount > 0 && (
                  <span className="sc-mobile-filter-badge">{activeFilterCount}</span>
                )}
              </button>

              <div className="sc-search-wrap">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="sc-search-icon"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  className="sc-search-input"
                  placeholder="Buscar por banda, anime, película o prenda..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="sc-search-clear"
                    onClick={() => setSearchQuery('')}
                    aria-label="Limpiar búsqueda"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                )}
              </div>

              <div className="sc-toolbar-right">
                <div className="sc-sort-group">
                  <span className="sc-sort-label">ORDENAR:</span>
                  <select
                    className="sc-sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    aria-label="Ordenar artículos"
                  >
                    <option value="popular">Más populares</option>
                    <option value="price_asc">Menor precio</option>
                    <option value="price_desc">Mayor precio</option>
                    <option value="name_asc">Nombre (A - Z)</option>
                  </select>
                </div>

                <div className="sc-view-toggle" role="group" aria-label="Cambiar vista">
                  <button
                    type="button"
                    className={`sc-view-btn ${viewMode === 'list' ? 'is-active' : ''}`}
                    onClick={() => setViewMode('list')}
                    title="Vista lista"
                    aria-label="Vista lista"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="8" y1="6" x2="21" y2="6" />
                      <line x1="8" y1="12" x2="21" y2="12" />
                      <line x1="8" y1="18" x2="21" y2="18" />
                      <line x1="3" y1="6" x2="3.01" y2="6" />
                      <line x1="3" y1="12" x2="3.01" y2="12" />
                      <line x1="3" y1="18" x2="3.01" y2="18" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className={`sc-view-btn ${viewMode === 'grid' ? 'is-active' : ''}`}
                    onClick={() => setViewMode('grid')}
                    title="Vista cuadrícula"
                    aria-label="Vista cuadrícula"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Chips de Filtros Activos */}
            {activeFilterCount > 0 && (
              <div className="sc-active-chips">
                {selectedTheme !== 'all' && (
                  <span className="sc-chip">
                    <span>{THEME_OPTIONS.find((t) => t.id === selectedTheme)?.label}</span>
                    <button type="button" onClick={() => setSelectedTheme('all')} aria-label="Quitar temática">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </span>
                )}
                {!hideCollectionFilter && selectedCollection !== 'all' && (
                  <span className="sc-chip">
                    <span>{COLLECTION_OPTIONS.find((c) => c.id === selectedCollection)?.label}</span>
                    <button type="button" onClick={() => setSelectedCollection('all')} aria-label="Quitar colección">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </span>
                )}
                {selectedSize && (
                  <span className="sc-chip">
                    <span>Talla {selectedSize}</span>
                    <button type="button" onClick={() => setSelectedSize('')} aria-label="Quitar talla">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </span>
                )}
                {selectedTypes.map((tid) => (
                  <span key={tid} className="sc-chip">
                    <span>{garmentTypesList.find((g) => g.id === tid)?.label || tid}</span>
                    <button type="button" onClick={() => toggleType(tid)} aria-label="Quitar tipo">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Estado de Carga / Vacío / Productos */}
            {loading ? (
              <div className="catalog-loading">
                <div className="loading-spinner"></div>
                <p>Cargando artículos...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="catalog-empty" style={{ background: '#ffffff', borderRadius: '18px', border: '1px solid #e2e8f0', padding: '56px 24px' }}>
                <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '10px' }}>
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <p style={{ fontWeight: 600, color: '#111827', marginBottom: '6px' }}>
                  No se encontraron artículos con estos filtros.
                </p>
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '18px' }}>
                  Intenta limpiar algunos filtros o explorar toda la colección.
                </p>
                {activeFilterCount > 0 ? (
                  <button
                    type="button"
                    className="sc-cta-btn"
                    style={{ width: 'auto', padding: '10px 20px', border: 'none', cursor: 'pointer' }}
                    onClick={clearAllFilters}
                  >
                    Restablecer filtros
                  </button>
                ) : (
                  <Link
                    to={emptyActionLink}
                    className="sc-cta-btn"
                    style={{ width: 'auto', padding: '10px 20px' }}
                  >
                    {emptyActionLabel}
                  </Link>
                )}
              </div>
            ) : (
              <>
                <div className={viewMode === 'list' ? 'sc-list' : 'sc-grid'}>
                  {paginated.map((it) => (
                    <ItemCard
                      key={it.id_item}
                      item={it.raw}
                      viewMode={viewMode}
                      selectedSize={selectedSize || 'M'}
                      isFavorite={favorites.includes(it.id_item)}
                      onToggleFavorite={handleToggleFav}
                    />
                  ))}
                </div>

                {/* Barra de Paginación */}
                <div className="sc-pagination-bar">
                  <p className="sc-pagination-info">
                    Mostrando {startIndex} - {endIndex} de {filteredItems.length} artículo{filteredItems.length !== 1 ? 's' : ''}
                  </p>

                  {totalPages > 1 && (
                    <div className="sc-pagination-controls">
                      <button
                        type="button"
                        className="sc-page-btn"
                        onClick={goPrev}
                        disabled={page === 1}
                        aria-label="Página anterior"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="15 18 9 12 15 6"/>
                        </svg>
                      </button>

                      {getPageNumbers().map((p, idx) =>
                        p === '...' ? (
                          <span key={`el-${idx}`} style={{ padding: '0 4px', color: '#94a3b8' }}>
                            ...
                          </span>
                        ) : (
                          <button
                            key={p}
                            type="button"
                            className={`sc-page-btn ${page === p ? 'is-active' : ''}`}
                            onClick={() => setPage(p)}
                          >
                            {p}
                          </button>
                        )
                      )}

                      <button
                        type="button"
                        className="sc-page-btn"
                        onClick={goNext}
                        disabled={page === totalPages}
                        aria-label="Página siguiente"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6"/>
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ── 3 Tarjetas de Beneficios Inferiores ── */}
            <div className="sc-trust-grid">
              <div className="sc-trust-card">
                <div className="sc-trust-icon">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <polyline points="9 12 11 14 15 10"/>
                  </svg>
                </div>
                <div>
                  <h3 className="sc-trust-title">100% Algodón Premium</h3>
                  <p className="sc-trust-desc">
                    Gramajes de 240 a 450 GSM seleccionados para máxima durabilidad y confort.
                  </p>
                </div>
              </div>

              <div className="sc-trust-card">
                <div className="sc-trust-icon">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="3" width="15" height="13"/>
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                    <circle cx="5.5" cy="18.5" r="2.5"/>
                    <circle cx="18.5" cy="18.5" r="2.5"/>
                  </svg>
                </div>
                <div>
                  <h3 className="sc-trust-title">Despacho en 24/48h</h3>
                  <p className="sc-trust-desc">
                    Producción ágil y personalizada desde 1 unidad sin mínimos de compra.
                  </p>
                </div>
              </div>

              <div className="sc-trust-card">
                <div className="sc-trust-icon">
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                    <path d="M2 17l10 5 10-5"/>
                    <path d="M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <div>
                  <h3 className="sc-trust-title">DTF, Sublimación y Bordado</h3>
                  <p className="sc-trust-desc">
                    Acabados de alta definición resistentes lavado tras lavado sin perder color.
                  </p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* ── Modal Guía de Tallas ── */}
      {sizeGuideOpen && (
        <div
          className="sc-modal-overlay"
          onClick={() => setSizeGuideOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Guía de tallas"
        >
          <div className="sc-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="sc-modal-head">
              <h3 className="sc-modal-title">Guía de Tallas Referencial</h3>
              <button
                type="button"
                className="sc-drawer-close"
                style={{ display: 'inline-flex' }}
                onClick={() => setSizeGuideOpen(false)}
                aria-label="Cerrar guía"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <table className="sc-size-table">
              <thead>
                <tr>
                  <th>Talla</th>
                  <th>Hombro</th>
                  <th>Pecho</th>
                  <th>Largo</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>XS</td><td>42 cm</td><td>100 cm</td><td>67 cm</td></tr>
                <tr><td>S</td><td>44.5 cm</td><td>106 cm</td><td>70 cm</td></tr>
                <tr><td>M</td><td>46 cm</td><td>110 cm</td><td>72 cm</td></tr>
                <tr><td>L</td><td>47.8 cm</td><td>115 cm</td><td>74 cm</td></tr>
                <tr><td>XL</td><td>49.6 cm</td><td>120 cm</td><td>76 cm</td></tr>
                <tr><td>XXL</td><td>51.4 cm</td><td>125 cm</td><td>78 cm</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
