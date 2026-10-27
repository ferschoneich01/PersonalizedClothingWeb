import { useEffect, useState, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { getCategories, addCategory, updateCategory, deleteCategory } from '../../api/itemsApi'
import Swal from 'sweetalert2'

// ─────────────────────────────────────────────────────────────
// Iconos SVG consistentes con Pedidos, Envíos y Artículos
// ─────────────────────────────────────────────────────────────
const Svg = ({ size = 14, sw = 2, children, style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={sw}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0, ...style }}
  >
    {children}
  </svg>
)

const IconGrid = (p) => (
  <Svg {...p}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
  </Svg>
)

const IconRefresh = (p) => (
  <Svg {...p}>
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </Svg>
)

const IconSearch = (p) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </Svg>
)

const IconPlus = (p) => (
  <Svg {...p}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </Svg>
)

const IconEdit = (p) => (
  <Svg {...p}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </Svg>
)

const IconTrash = (p) => (
  <Svg {...p}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </Svg>
)

const IconCheck = (p) => (
  <Svg {...p}>
    <polyline points="20 6 9 17 4 12" />
  </Svg>
)

const IconClose = (p) => (
  <Svg {...p}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </Svg>
)

const IconShirt = (p) => (
  <Svg {...p}>
    <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
  </Svg>
)

const IconArrowRight = (p) => (
  <Svg {...p}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </Svg>
)

const capitalize = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export default function AdminCategories() {
  const formRef = useRef(null)

  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const [searchTerm, setSearchTerm] = useState('')
  const [nameInput, setNameInput] = useState('')
  const [editingCategory, setEditingCategory] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Cargar categorías desde el API
  const fetchCategories = async (isManual = false) => {
    if (isManual) setRefreshing(true)
    else setLoading(true)

    try {
      const res = await getCategories()
      const data = res.data || []
      if (Array.isArray(data) && data.length > 0) {
        setCategories(data)
      } else {
        // Fallback por si la respuesta no es un array no vacío
        setCategories([
          { id_clasification: 1, name: 'camisetas', items_count: 0 },
          { id_clasification: 2, name: 'sudadera', items_count: 0 },
          { id_clasification: 3, name: 'croptop', items_count: 0 },
          { id_clasification: 4, name: 'sueter', items_count: 0 },
        ])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      // Fallback para mantener la UI funcional
      setCategories([
        { id_clasification: 1, name: 'camisetas', items_count: 0 },
        { id_clasification: 2, name: 'sudadera', items_count: 0 },
        { id_clasification: 3, name: 'croptop', items_count: 0 },
        { id_clasification: 4, name: 'sueter', items_count: 0 },
      ])
      if (isManual) {
        const msg = error.response?.data?.message || 'No se pudo conectar con el servidor de categorías.'
        Swal.fire({
          icon: 'error',
          title: 'Error de conexión',
          text: msg,
        })
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  // Métricas
  const stats = useMemo(() => {
    const total = categories.length
    const withItems = categories.filter((c) => (c.items_count || 0) > 0).length
    const empty = total - withItems
    const totalItems = categories.reduce((acc, c) => acc + (c.items_count || 0), 0)
    return { total, withItems, empty, totalItems }
  }, [categories])

  // Filtrado de categorías por término de búsqueda
  const filteredCategories = useMemo(() => {
    const term = searchTerm.toLowerCase().trim()
    if (!term) return categories
    return categories.filter(
      (c) =>
        c.name?.toLowerCase().includes(term) ||
        String(c.id_clasification).includes(term)
    )
  }, [categories, searchTerm])

  // Iniciar edición
  const startEdit = (cat) => {
    setEditingCategory(cat)
    setNameInput(cat.name)
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Cancelar edición
  const cancelEdit = () => {
    setEditingCategory(null)
    setNameInput('')
  }

  // Guardar (Crear o Actualizar)
  const handleSubmit = async (e) => {
    e.preventDefault()
    const cleanName = nameInput.trim()

    if (!cleanName) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo obligatorio',
        text: 'Por favor ingresa un nombre para la categoría.',
      })
      return
    }

    setSubmitting(true)
    try {
      if (editingCategory) {
        // Actualizar
        await updateCategory(editingCategory.id_clasification, { name: cleanName })
        Swal.fire({
          icon: 'success',
          title: 'Categoría actualizada',
          text: `"${cleanName}" se ha actualizado con éxito.`,
          timer: 1500,
          showConfirmButton: false,
        })
        cancelEdit()
      } else {
        // Crear
        await addCategory({ name: cleanName })
        Swal.fire({
          icon: 'success',
          title: 'Categoría agregada',
          text: `"${cleanName}" se agregó al catálogo exitosamente.`,
          timer: 1500,
          showConfirmButton: false,
        })
        setNameInput('')
      }
      fetchCategories()
    } catch (error) {
      console.error(error)
      const msg = error.response?.data?.message || 'No se pudo guardar la categoría.'
      Swal.fire({ icon: 'error', title: 'Error', text: msg })
    } finally {
      setSubmitting(false)
    }
  }

  // Eliminar categoría
  const handleDelete = (cat) => {
    if (cat.items_count > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Categoría en uso',
        html: `La categoría <strong>"${capitalize(cat.name)}"</strong> tiene <strong>${cat.items_count} artículo(s)</strong> asociados en el catálogo.<br/><br/>Para eliminarla, primero debes reasignar o eliminar dichos artículos en la sección de Productos.`,
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#0f172a',
      })
      return
    }

    Swal.fire({
      title: `¿Eliminar "${capitalize(cat.name)}"?`,
      text: 'Esta acción no se puede deshacer.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      customClass: {
        confirmButton: 'pc-swal-danger',
        cancelButton: 'pc-swal-cancel',
      },
      buttonsStyling: false,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteCategory(cat.id_clasification)
          Swal.fire({
            icon: 'success',
            title: 'Eliminada',
            text: 'La categoría fue eliminada con éxito.',
            timer: 1400,
            showConfirmButton: false,
          })
          if (editingCategory?.id_clasification === cat.id_clasification) {
            cancelEdit()
          }
          fetchCategories()
        } catch (error) {
          const msg = error.response?.data?.message || 'No se pudo eliminar la categoría.'
          Swal.fire({ icon: 'error', title: 'Error', text: msg })
        }
      }
    })
  }

  return (
    <div className="pc-admin">
      <style>{`
        /* ───────── Variables y Base ───────── */
        .pc-admin {
          --pc-ink: #0f172a;
          --pc-teal: #10b981;
          --pc-teal-dark: #059669;
          --pc-slate-50: #f8fafc;
          --pc-slate-100: #f1f5f9;
          --pc-slate-200: #e2e8f0;
          --pc-slate-300: #cbd5e1;
          --pc-slate-400: #94a3b8;
          --pc-slate-500: #64748b;
          --pc-slate-700: #334155;
          --pc-font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          font-family: var(--pc-font);
          color: var(--pc-ink);
          background-color: var(--pc-slate-50);
          min-height: calc(100vh - 120px);
          padding: 18px 28px 48px;
        }
        .pc-admin * { box-sizing: border-box; }

        /* ───────── Encabezado ───────── */
        .pc-page-head {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }
        .pc-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
          flex-wrap: wrap;
        }
        .pc-pill-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 3px 10px;
          border-radius: 20px;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #15803d;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.6px;
          text-transform: uppercase;
        }
        .pc-live-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 0 2.5px rgba(16, 185, 129, 0.25);
        }
        .pc-eyebrow-desc {
          font-size: 12px;
          color: var(--pc-slate-500);
          font-weight: 600;
        }
        .pc-title {
          font-size: 26px;
          font-weight: 800;
          letter-spacing: -0.6px;
          margin: 0 0 2px;
          line-height: 1.2;
          color: var(--pc-ink);
        }
        .pc-subtitle {
          font-size: 13.5px;
          color: var(--pc-slate-500);
          margin: 0;
          font-weight: 500;
        }
        .pc-head-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .pc-btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #fff;
          border: 1px solid var(--pc-slate-200);
          border-radius: 18px;
          padding: 7px 14px;
          font-size: 12px;
          font-weight: 600;
          color: var(--pc-slate-700);
          cursor: pointer;
          transition: all 0.15s ease;
          text-decoration: none;
          font-family: inherit;
        }
        .pc-btn-ghost:hover { border-color: var(--pc-teal); color: var(--pc-teal-dark); }
        .pc-btn-ghost:disabled { opacity: 0.6; cursor: wait; }
        .pc-spin { animation: pc-spin 0.8s linear infinite; }
        @keyframes pc-spin { to { transform: rotate(360deg); } }

        /* ───────── Tarjetas de Resumen ───────── */
        .pc-stats-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 14px;
          margin-bottom: 22px;
        }
        .pc-stat-card {
          background: #fff;
          border: 1px solid var(--pc-slate-200);
          border-radius: 12px;
          padding: 14px 18px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .pc-stat-icon-wrap {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--pc-ink);
        }
        .pc-stat-val {
          font-size: 20px;
          font-weight: 800;
          color: var(--pc-ink);
          line-height: 1.1;
        }
        .pc-stat-label {
          font-size: 12px;
          color: var(--pc-slate-500);
          font-weight: 600;
          margin-top: 2px;
        }

        /* ───────── Layout Split ───────── */
        .pc-split-cat {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 380px;
          gap: 24px;
          align-items: start;
        }

        .pc-card {
          background: #fff;
          border: 1px solid var(--pc-slate-200);
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .pc-card-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 18px;
          background: #0f172a;
          color: #fff;
          font-size: 13.5px;
          font-weight: 700;
          letter-spacing: -0.2px;
        }

        /* ───────── Barra de Búsqueda ───────── */
        .pc-cat-toolbar {
          padding: 14px 18px;
          border-bottom: 1px solid var(--pc-slate-200);
          background: #fff;
        }
        .pc-search-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .pc-search-wrap svg {
          position: absolute;
          left: 12px;
          color: var(--pc-slate-400);
          pointer-events: none;
        }
        .pc-input {
          width: 100%;
          background: #fff;
          border: 1px solid var(--pc-slate-300);
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 13px;
          color: var(--pc-ink);
          font-family: inherit;
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .pc-input.has-icon { padding-left: 34px; }
        .pc-input:focus {
          border-color: var(--pc-teal);
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
        }

        /* ───────── Lista / Tabla de Categorías ───────── */
        .pc-cat-table {
          display: flex;
          flex-direction: column;
        }
        .pc-cat-row {
          display: grid;
          grid-template-columns: 50px 1fr 140px 100px 90px;
          align-items: center;
          gap: 12px;
          padding: 12px 18px;
          border-bottom: 1px solid var(--pc-slate-100);
          transition: background 0.12s ease;
        }
        .pc-cat-row:last-child { border-bottom: none; }
        .pc-cat-row:not(.is-header):hover { background: #f8fafc; }
        .pc-cat-row.is-header {
          background: #f8fafc;
          border-bottom: 1px solid var(--pc-slate-200);
          font-size: 11px;
          font-weight: 700;
          color: var(--pc-slate-500);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 10px 18px;
        }

        .pc-cat-id {
          font-size: 12px;
          font-weight: 700;
          color: var(--pc-slate-400);
          font-family: monospace;
        }
        .pc-cat-name {
          font-size: 14px;
          font-weight: 700;
          color: var(--pc-ink);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .pc-cat-slug {
          font-size: 11.5px;
          color: var(--pc-slate-400);
          font-weight: 500;
        }
        .pc-badge-items {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: #f1f5f9;
          color: var(--pc-slate-700);
          border: 1px solid var(--pc-slate-200);
          padding: 3px 9px;
          border-radius: 12px;
          font-size: 11.5px;
          font-weight: 700;
        }
        .pc-badge-status {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 700;
        }
        .pc-badge-status.is-in-use {
          background: #f0fdf4;
          color: #15803d;
          border: 1px solid #bbf7d0;
        }
        .pc-badge-status.is-empty {
          background: #f8fafc;
          color: #64748b;
          border: 1px solid #e2e8f0;
        }

        .pc-actions-cell {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 6px;
        }
        .pc-btn-edit {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #fff;
          border: 1px solid var(--pc-slate-300);
          color: var(--pc-slate-700);
          border-radius: 6px;
          padding: 5px 9px;
          font-size: 11.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .pc-btn-edit:hover { border-color: var(--pc-teal); color: var(--pc-teal-dark); background: #f0fdf4; }
        .pc-btn-delete {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 6px;
          border: 1px solid var(--pc-slate-200);
          background: #fff;
          color: #dc2626;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .pc-btn-delete:hover {
          background: #fef2f2;
          border-color: #fecaca;
        }

        /* ───────── Formulario Sticky ───────── */
        .pc-form-sticky {
          position: sticky;
          top: 80px;
        }
        .pc-form-group {
          margin-bottom: 14px;
        }
        .pc-form-label {
          display: block;
          font-size: 12px;
          font-weight: 700;
          color: var(--pc-slate-700);
          margin-bottom: 5px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        .pc-form-hint {
          font-size: 11.5px;
          color: var(--pc-slate-500);
          line-height: 1.45;
          margin-top: 6px;
        }
        .pc-btn-save {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          background: #0f172a;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          padding: 11px 16px;
          font-size: 13.5px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.15s ease;
          box-shadow: 0 2px 6px rgba(15, 23, 42, 0.15);
          font-family: inherit;
        }
        .pc-btn-save:hover:not(:disabled) { background: #1e293b; }
        .pc-btn-save:disabled { opacity: 0.6; cursor: wait; }

        .pc-empty {
          text-align: center;
          padding: 50px 20px;
          color: var(--pc-slate-500);
        }

        /* SweetAlert */
        .pc-swal-danger {
          background: #dc2626 !important;
          color: #ffffff !important;
          border: none !important;
          border-radius: 8px !important;
          padding: 10px 22px !important;
          font-size: 13px !important;
          font-weight: 700 !important;
          margin: 0 6px !important;
        }
        .pc-swal-cancel {
          background: #ffffff !important;
          color: #475569 !important;
          border: 1px solid #cbd5e1 !important;
          border-radius: 8px !important;
          padding: 10px 22px !important;
          font-size: 13px !important;
          font-weight: 700 !important;
          margin: 0 6px !important;
        }

        /* Responsive */
        @media (max-width: 960px) {
          .pc-split-cat { grid-template-columns: 1fr; }
          .pc-form-sticky { position: static; order: -1; }
        }
        @media (max-width: 680px) {
          .pc-admin { padding: 14px 14px 40px; }
          .pc-cat-row { grid-template-columns: 35px 1fr 85px; }
          .pc-cat-row.is-header > span:nth-child(3),
          .pc-cat-row.is-header > span:nth-child(4) { display: none; }
          .pc-hide-sm { display: none; }
          .pc-cat-row > .pc-actions-cell { justify-content: flex-end; }
        }
      `}</style>

      {/* ═══════════ ENCABEZADO ═══════════ */}
      <div className="pc-page-head">
        <div>
          <div className="pc-eyebrow">
            <span className="pc-pill-tag">
              <span className="pc-live-dot" />
              <span>Catálogo de Prendas</span>
            </span>
            <span className="pc-eyebrow-desc">• Categorías y tipos dinámicos</span>
          </div>
          <h1 className="pc-title">Gestión de Categorías</h1>
          <p className="pc-subtitle">
            Crea, edita y organiza las categorías de prendas. Cualquier categoría agregada aquí se reflejará dinámicamente en el filtro y creación de artículos.
          </p>
        </div>

        <div className="pc-head-actions">
          <Link to="/admin/addItem" className="pc-btn-ghost">
            <IconShirt size={14} />
            <span>Ver Catálogo de Artículos</span>
            <IconArrowRight size={12} />
          </Link>

          <button
            type="button"
            className="pc-btn-ghost"
            onClick={() => fetchCategories(true)}
            disabled={refreshing || loading}
          >
            <IconRefresh
              size={13}
              sw={2.2}
              style={refreshing ? { animation: 'pc-spin 0.8s linear infinite' } : undefined}
            />
            <span>{refreshing ? 'Actualizando…' : 'Actualizar'}</span>
          </button>
        </div>
      </div>

      {/* ═══════════ RESUMEN DE ESTADÍSTICAS ═══════════ */}
      <div className="pc-stats-row">
        <div className="pc-stat-card">
          <div className="pc-stat-icon-wrap" style={{ background: '#ecfdf5', color: '#10b981' }}>
            <IconGrid size={18} />
          </div>
          <div>
            <div className="pc-stat-val">{stats.total}</div>
            <div className="pc-stat-label">Categorías Registradas</div>
          </div>
        </div>

        <div className="pc-stat-card">
          <div className="pc-stat-icon-wrap" style={{ background: '#eff6ff', color: '#3b82f6' }}>
            <IconShirt size={18} />
          </div>
          <div>
            <div className="pc-stat-val">{stats.totalItems}</div>
            <div className="pc-stat-label">Artículos en Catálogo</div>
          </div>
        </div>

        <div className="pc-stat-card">
          <div className="pc-stat-icon-wrap" style={{ background: '#f8fafc', color: '#64748b' }}>
            <IconCheck size={18} />
          </div>
          <div>
            <div className="pc-stat-val">{stats.withItems}</div>
            <div className="pc-stat-label">Categorías con Artículos</div>
          </div>
        </div>
      </div>

      {/* ═══════════ LAYOUT: TABLA + FORMULARIO ═══════════ */}
      <div className="pc-split-cat">

        {/* ── COLUMNA IZQUIERDA: LISTA DE CATEGORÍAS ── */}
        <div className="pc-card">
          {/* Barra de búsqueda */}
          <div className="pc-cat-toolbar">
            <div className="pc-search-wrap">
              <IconSearch size={14} />
              <input
                className="pc-input has-icon"
                type="text"
                placeholder="Buscar categoría por nombre o código…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Tabla de categorías */}
          <div className="pc-cat-table">
            <div className="pc-cat-row is-header">
              <span>#</span>
              <span>Categoría</span>
              <span className="pc-hide-sm">Artículos</span>
              <span className="pc-hide-sm">Estado</span>
              <span style={{ textAlign: 'right' }}>Acciones</span>
            </div>

            {loading ? (
              <div className="pc-empty">
                <div style={{ animation: 'pc-spin 1s linear infinite', display: 'inline-block', marginBottom: '8px' }}>
                  <IconRefresh size={22} />
                </div>
                <div>Cargando categorías…</div>
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="pc-empty">
                <IconCheck size={26} style={{ color: '#94a3b8', marginBottom: '6px' }} />
                <div style={{ fontWeight: 700, color: '#0f172a' }}>No se encontraron categorías</div>
                <div style={{ fontSize: '12px', marginTop: '2px' }}>
                  {searchTerm ? 'Prueba con otro término de búsqueda.' : 'Agrega tu primera categoría desde el formulario.'}
                </div>
              </div>
            ) : (
              filteredCategories.map((cat) => (
                <div key={cat.id_clasification} className="pc-cat-row">
                  <span className="pc-cat-id">#{cat.id_clasification}</span>

                  <div>
                    <div className="pc-cat-name">
                      {capitalize(cat.name)}
                    </div>
                    <div className="pc-cat-slug">
                      clasificación ID: {cat.id_clasification}
                    </div>
                  </div>

                  <div className="pc-hide-sm">
                    <span className="pc-badge-items">
                      <IconShirt size={11} />
                      <span>{cat.items_count || 0} prendas</span>
                    </span>
                  </div>

                  <div className="pc-hide-sm">
                    <span className={`pc-badge-status ${(cat.items_count || 0) > 0 ? 'is-in-use' : 'is-empty'}`}>
                      {(cat.items_count || 0) > 0 ? 'En uso' : 'Sin artículos'}
                    </span>
                  </div>

                  <div className="pc-actions-cell">
                    <button
                      type="button"
                      className="pc-btn-edit"
                      onClick={() => startEdit(cat)}
                      title="Editar categoría"
                    >
                      <IconEdit size={12} />
                      <span>Editar</span>
                    </button>

                    <button
                      type="button"
                      className="pc-btn-delete"
                      onClick={() => handleDelete(cat)}
                      title={cat.items_count > 0 ? 'No se puede eliminar (tiene artículos)' : 'Eliminar categoría'}
                    >
                      <IconTrash size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── COLUMNA DERECHA: FORMULARIO AGREGAR / EDITAR ── */}
        <div className="pc-form-sticky" ref={formRef}>
          <div className="pc-card">
            <div className="pc-card-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {editingCategory ? (
                  <IconEdit size={15} style={{ color: '#10b981' }} />
                ) : (
                  <IconPlus size={15} style={{ color: '#10b981' }} />
                )}
                <span>{editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}</span>
              </div>
              {editingCategory && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#fff',
                    borderRadius: '6px',
                    padding: '3px 8px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <IconClose size={11} />
                  <span>Cancelar</span>
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '18px 20px' }}>
              <div className="pc-form-group">
                <label className="pc-form-label">Nombre de la Categoría</label>
                <input
                  className="pc-input"
                  type="text"
                  placeholder="Ej. Pantalones, Gorras, Buzos..."
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  autoFocus
                  required
                />
                <p className="pc-form-hint">
                  {editingCategory
                    ? 'Al cambiar el nombre, se actualizará en las opciones de filtro y en todos los artículos asociados.'
                    : 'Las categorías se mostrarán automáticamente en las pestañas del catálogo de artículos y en las opciones de selección.'}
                </p>
              </div>

              <button
                type="submit"
                className="pc-btn-save"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <IconRefresh size={14} className="pc-spin" />
                    <span>Guardando…</span>
                  </>
                ) : editingCategory ? (
                  <>
                    <IconCheck size={15} sw={2.5} />
                    <span>Actualizar Categoría</span>
                  </>
                ) : (
                  <>
                    <IconPlus size={15} sw={2.5} />
                    <span>Registrar Categoría</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  )
}
