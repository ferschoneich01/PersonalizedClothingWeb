import { useEffect, useState, useMemo } from 'react'
import { getShippings, changeOrderStatus } from '../../api/ordersApi'
import Swal from 'sweetalert2'
import { parseCustomization, getItemPreviewImage, showViewsGalleryModal } from '../../utils/customizationHelper'

// ─────────────────────────────────────────────────────────────
// Iconos SVG en el mismo lenguaje visual que Gestión de Pedidos
// ─────────────────────────────────────────────────────────────
const Svg = ({ size = 14, sw = 2, children, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, ...style }}>
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

const IconTruck = (p) => (
  <Svg {...p}>
    <rect x="1" y="3" width="15" height="13" rx="1" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </Svg>
)

const IconCheck = (p) => (
  <Svg {...p}>
    <polyline points="20 6 9 17 4 12" />
  </Svg>
)

const IconClock = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </Svg>
)

const IconAlert = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
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

const IconPin = (p) => (
  <Svg {...p}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </Svg>
)

const IconUser = (p) => (
  <Svg {...p}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </Svg>
)

const IconPackage = (p) => (
  <Svg {...p}>
    <path d="M16.5 9.4L7.55 4.24a2 2 0 0 0-2 0L3.5 5.5a2 2 0 0 0-1 1.73v9.54a2 2 0 0 0 1 1.73l2.05 1.26a2 2 0 0 0 2 0L16.5 14.6a2 2 0 0 0 1-1.73V11.13a2 2 0 0 0-1-1.73z" />
    <polyline points="3.29 7 12 12 20.71 7" />
    <line x1="12" y1="22" x2="12" y2="12" />
  </Svg>
)

const IconChevronLeft = (p) => (
  <Svg {...p}>
    <polyline points="15 18 9 12 15 6" />
  </Svg>
)

const IconChevronRight = (p) => (
  <Svg {...p}>
    <polyline points="9 18 15 12 9 6" />
  </Svg>
)

const IconNavigation = (p) => (
  <Svg {...p}>
    <polygon points="3 11 22 2 13 21 11 13 3 11" />
  </Svg>
)

const IconPhone = (p) => (
  <Svg {...p}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </Svg>
)

const IconCard = (p) => (
  <Svg {...p}>
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </Svg>
)

// Configuración de Estados para la barra superior (equivalente a los canales de venta en pedidos)
const STATUS_TABS = [
  { id: 'todos', label: 'Todos', Icon: IconGrid, color: '#0f172a' },
  { id: 'Enviado', label: 'En camino', Icon: IconTruck, color: '#d97706' },
  { id: 'Entregado', label: 'Entregados', Icon: IconCheck, color: '#10b981' },
  { id: 'No enviado', label: 'No enviados', Icon: IconAlert, color: '#dc2626' },
  { id: 'Pendiente', label: 'Pendientes', Icon: IconClock, color: '#2563eb' },
]

const STATUS_COLOR_MAP = {
  'Enviado': { dot: '#d97706', bg: '#fffbeb', border: '#fde68a', text: '#b45309', label: 'En camino' },
  'Entregado': { dot: '#10b981', bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d', label: 'Entregado' },
  'No enviado': { dot: '#dc2626', bg: '#fef2f2', border: '#fecaca', text: '#b91c1c', label: 'No enviado' },
  'Pendiente': { dot: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8', label: 'Pendiente' },
  'En proceso': { dot: '#0284c7', bg: '#f0f9ff', border: '#bae6fd', text: '#0369a1', label: 'En proceso' },
  'Terminado': { dot: '#64748b', bg: '#f8fafc', border: '#e2e8f0', text: '#475569', label: 'Terminado' },
}

// Función auxiliar para extraer dirección y coordenadas GPS
function parseLocation(addressStr = '') {
  if (!addressStr) {
    return { addressText: 'No especificada', mapsUrl: null, lat: null, lng: null }
  }
  const parts = addressStr.split(' | Mapa: ')
  const addressText = parts[0] ? parts[0].trim() : addressStr
  let mapsUrl = parts[1] ? parts[1].trim() : null

  if (!mapsUrl && addressStr.includes('https://maps.google.com/')) {
    const match = addressStr.match(/https:\/\/maps\.google\.com\/[^\s]+/)
    if (match) mapsUrl = match[0]
  }

  let lat = null
  let lng = null
  if (mapsUrl) {
    const coordsMatch = mapsUrl.match(/[?&]q=([0-9.-]+)[,%2C]+([0-9.-]+)/)
    if (coordsMatch) {
      lat = parseFloat(coordsMatch[1])
      lng = parseFloat(coordsMatch[2])
    }
  }

  return { addressText, mapsUrl, lat, lng }
}

const PAGE_SIZE = 20

export default function AdminShippings() {
  const [shippings, setShippings] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  
  // Filtros
  const [statusFilter, setStatusFilter] = useState('Enviado') // Por defecto 'Enviado' (En camino)
  const [searchTerm, setSearchTerm] = useState('')
  const [cityFilter, setCityFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Selección en la lista (Maestro / Detalle)
  const [selectedId, setSelectedId] = useState(null)
  const [showDetailMobile, setShowDetailMobile] = useState(false)

  const fetchShippings = async (isManual = false) => {
    if (isManual) setRefreshing(true)
    else setLoading(true)

    try {
      const res = await getShippings()
      setShippings(res.data || [])
    } catch (error) {
      console.error('Error fetching shippings:', error)
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudieron cargar los envíos' })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchShippings()
  }, [])

  // Agrupar filas individuales por orden
  const groupedOrders = useMemo(() => {
    const grouped = Object.values(
      shippings.reduce((acc, ship) => {
        if (!acc[ship.id_order]) {
          acc[ship.id_order] = {
            id_order: ship.id_order,
            username: ship.username,
            client_name: ship.client_name,
            client_lastname: ship.client_lastname,
            cedula: ship.cedula,
            city: ship.city,
            address: ship.address,
            status: ship.status,
            cost: ship.cost,
            paymethod: ship.paymethod,
            pedidoTelefono: ship.pedidoTelefono,
            items: []
          }
        }
        acc[ship.id_order].items.push(ship)
        return acc
      }, {})
    )

    grouped.forEach(order => {
      const itemsTotal = order.items.reduce((sum, item) => sum + (parseFloat(item.price) * parseInt(item.quantityOrders || 1)), 0)
      order.realTotal = itemsTotal + parseFloat(order.cost || 0)
    })

    grouped.sort((a, b) => b.id_order - a.id_order)
    return grouped
  }, [shippings])

  // Conteo de pedidos por estado para las pestañas superiores
  const statusStats = useMemo(() => {
    const counts = { todos: groupedOrders.length }
    STATUS_TABS.forEach(tab => {
      if (tab.id !== 'todos') {
        counts[tab.id] = groupedOrders.filter(o => o.status === tab.id).length
      }
    })
    return counts
  }, [groupedOrders])

  // Departamentos únicos para el selector
  const uniqueCities = useMemo(() => {
    const cities = [...new Set(groupedOrders.map(o => o.city).filter(Boolean))]
    cities.sort()
    return cities
  }, [groupedOrders])

  // Filtrado final de órdenes
  const filteredOrders = useMemo(() => {
    return groupedOrders.filter(order => {
      const matchesStatus = statusFilter === 'todos' || order.status === statusFilter
      
      const term = searchTerm.toLowerCase().trim()
      const matchesSearch = !term ||
        String(order.id_order).includes(term) ||
        order.username?.toLowerCase().includes(term) ||
        order.client_name?.toLowerCase().includes(term) ||
        order.client_lastname?.toLowerCase().includes(term) ||
        order.cedula?.toLowerCase().includes(term) ||
        order.city?.toLowerCase().includes(term)

      const matchesCity = !cityFilter || order.city === cityFilter

      return matchesStatus && matchesSearch && matchesCity
    })
  }, [groupedOrders, statusFilter, searchTerm, cityFilter])

  // Paginación
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const paginatedOrders = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE
    return filteredOrders.slice(start, start + PAGE_SIZE)
  }, [filteredOrders, safePage])

  // Mantener seleccionado el pedido actual o el primero de la lista
  useEffect(() => {
    if (filteredOrders.length > 0) {
      const exists = filteredOrders.some(o => o.id_order === selectedId)
      if (!exists) {
        setSelectedId(filteredOrders[0].id_order)
      }
    } else {
      setSelectedId(null)
    }
  }, [filteredOrders, selectedId])

  // Reset de página al cambiar filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter, searchTerm, cityFilter])

  const selectedOrder = useMemo(() => {
    return groupedOrders.find(o => o.id_order === selectedId) || null
  }, [groupedOrders, selectedId])

  // Manejo de cambio de estado (Marcar como entregado o cambiar estado)
  const handleStatusChange = async (id_order, newStatus) => {
    try {
      const result = await Swal.fire({
        title: `¿Cambiar estado a "${newStatus}"?`,
        text: `El pedido #${id_order} se actualizará a estado ${newStatus}.`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#0f172a',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Sí, cambiar estado',
        cancelButtonText: 'Cancelar',
        customClass: {
          confirmButton: 'pc-swal-confirm',
          cancelButton: 'pc-swal-cancel',
        }
      })

      if (result.isConfirmed) {
        await changeOrderStatus(id_order, newStatus)
        Swal.fire({
          icon: 'success',
          title: 'Estado actualizado',
          text: `El pedido #${id_order} ahora está ${newStatus}.`,
          timer: 1500,
          showConfirmButton: false,
        })
        fetchShippings()
      }
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo actualizar el estado' })
    }
  }

  const selectOrder = (id) => {
    setSelectedId(id)
    setShowDetailMobile(true)
  }

  const selectedLocation = useMemo(() => {
    return parseLocation(selectedOrder?.address)
  }, [selectedOrder])

  return (
    <div className="pc-admin">
      <style>{`
        .pc-admin {
          --pc-ink: #0f172a;
          --pc-ink-2: #1e293b;
          --pc-slate-700: #334155;
          --pc-slate-500: #64748b;
          --pc-slate-300: #cbd5e1;
          --pc-slate-200: #e2e8f0;
          --pc-slate-100: #f1f5f9;
          --pc-slate-50: #f8fafc;
          --pc-teal: #10b981;
          --pc-teal-dark: #059669;
          --pc-teal-bg: #f0fdf4;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          color: var(--pc-ink);
          max-width: 1760px;
          margin: 0 auto;
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
          margin-bottom: 16px;
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
        .pc-btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #fff;
          border: 1px solid var(--pc-slate-200);
          border-radius: 18px;
          padding: 6px 14px;
          font-size: 12px;
          font-weight: 600;
          color: var(--pc-slate-700);
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: inherit;
        }
        .pc-btn-ghost:hover { border-color: var(--pc-teal); color: var(--pc-teal-dark); }
        .pc-btn-ghost:disabled { opacity: 0.6; cursor: wait; }
        .pc-spin { animation: pc-spin 0.8s linear infinite; }
        @keyframes pc-spin { to { transform: rotate(360deg); } }

        /* ───────── Pestañas superiores divididas por ESTADOS ───────── */
        .pc-channel-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }
        .pc-segmented {
          display: inline-flex;
          background: var(--pc-slate-200);
          border-radius: 22px;
          padding: 3px;
          gap: 2px;
          max-width: 100%;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .pc-segmented::-webkit-scrollbar { display: none; }
        .pc-seg-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 16px;
          border-radius: 19px;
          border: none;
          background: transparent;
          color: var(--pc-slate-500);
          font-size: 12.5px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s ease;
          font-family: inherit;
        }
        .pc-seg-btn:hover { color: var(--pc-ink); }
        .pc-seg-btn.is-active {
          background: #fff;
          color: var(--pc-ink);
          font-weight: 700;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .pc-seg-btn.is-empty { opacity: 0.55; }
        .pc-seg-count {
          font-size: 11px;
          font-weight: 700;
          background: rgba(15, 23, 42, 0.07);
          color: var(--pc-slate-700);
          padding: 1px 7px;
          border-radius: 10px;
        }
        .pc-seg-btn.is-active .pc-seg-count { background: var(--pc-ink); color: #fff; }
        .pc-channel-summary {
          font-size: 12.5px;
          color: var(--pc-slate-500);
          font-weight: 600;
        }
        .pc-channel-summary strong { color: var(--pc-ink); }

        /* ───────── Layout maestro / detalle (Split) ───────── */
        .pc-split {
          display: grid;
          grid-template-columns: minmax(360px, 430px) minmax(0, 1fr);
          gap: 20px;
          align-items: start;
        }
        .pc-master .pc-card { max-height: calc(100vh - 32px); position: sticky; top: 16px; }
        .pc-detail .pc-card { max-height: calc(100vh - 32px); position: sticky; top: 16px; }

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
          background: var(--pc-ink-2);
          color: #fff;
          padding: 13px 18px;
          font-weight: 700;
          font-size: 15px;
          letter-spacing: 0.3px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          flex-shrink: 0;
        }

        .pc-section {
          padding: 14px 18px;
          border-bottom: 1px solid var(--pc-slate-100);
        }
        .pc-section:last-child { border-bottom: none; }
        .pc-section-label {
          font-size: 13px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .pc-section-label small {
          font-size: 11.5px;
          font-weight: 600;
          color: var(--pc-slate-500);
        }

        /* Buscador y select en la lista izquierda */
        .pc-search-row {
          display: grid;
          grid-template-columns: 1fr;
          gap: 8px;
        }
        .pc-search {
          position: relative;
        }
        .pc-search svg {
          position: absolute;
          left: 11px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--pc-slate-500);
        }
        .pc-input, .pc-select {
          width: 100%;
          border: 1px solid var(--pc-slate-300);
          border-radius: 8px;
          background: #fff;
          padding: 8px 12px 8px 33px;
          font-size: 13px;
          font-weight: 500;
          color: var(--pc-ink);
          outline: none;
          font-family: inherit;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .pc-input:focus, .pc-select:focus {
          border-color: var(--pc-teal);
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
        }

        /* Lista izquierda de pedidos */
        .pc-list {
          flex: 1;
          overflow-y: auto;
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-height: 220px;
        }
        .pc-list::-webkit-scrollbar, .pc-detail-body::-webkit-scrollbar { width: 6px; }
        .pc-list::-webkit-scrollbar-thumb, .pc-detail-body::-webkit-scrollbar-thumb { background: var(--pc-slate-300); border-radius: 4px; }

        .pc-order-row {
          border: 1.5px solid var(--pc-slate-200);
          border-radius: 8px;
          padding: 10px 12px;
          cursor: pointer;
          background: #fff;
          transition: all 0.15s ease;
          text-align: left;
        }
        .pc-order-row:hover { border-color: #94a3b8; background: var(--pc-slate-50); }
        .pc-order-row.is-selected {
          border-color: var(--pc-teal);
          background: var(--pc-teal-bg);
          box-shadow: 0 1px 3px rgba(16, 185, 129, 0.15);
        }
        .pc-row-top, .pc-row-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .pc-row-id {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13.5px;
          font-weight: 800;
          color: var(--pc-ink);
        }
        .pc-row-price { font-size: 13.5px; font-weight: 800; color: var(--pc-ink); white-space: nowrap; }
        .pc-row-client {
          display: flex;
          align-items: center;
          gap: 6px;
          margin: 5px 0 6px;
          font-size: 12.5px;
          color: var(--pc-slate-700);
          min-width: 0;
        }
        .pc-row-client svg { color: var(--pc-slate-500); }
        .pc-row-name { font-weight: 700; color: var(--pc-ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .pc-row-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11.5px;
          font-weight: 600;
          color: var(--pc-slate-700);
        }
        .pc-row-city {
          background: var(--pc-slate-100);
          border: 1px solid var(--pc-slate-200);
          padding: 1px 7px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          color: var(--pc-slate-700);
        }

        /* Paginación */
        .pc-pager {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 10px 14px;
          border-top: 1px solid var(--pc-slate-100);
          background: #fafbfc;
          font-size: 12px;
          color: var(--pc-slate-500);
          flex-shrink: 0;
        }
        .pc-pager strong { color: var(--pc-ink); }
        .pc-pager-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          border-radius: 8px;
          border: 1.5px solid var(--pc-slate-200);
          background: #fff;
          color: var(--pc-ink);
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .pc-pager-btn:hover:not(:disabled) { border-color: var(--pc-teal); color: var(--pc-teal-dark); }
        .pc-pager-btn:disabled { color: var(--pc-slate-300); cursor: not-allowed; }

        /* ───────── Panel derecho (Detalle) ───────── */
        .pc-detail-body { overflow-y: auto; flex: 1; }
        .pc-head-left { display: flex; align-items: center; gap: 10px; min-width: 0; flex-wrap: wrap; }
        
        .pc-btn-back {
          display: none;
          align-items: center;
          gap: 4px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #fff;
          border-radius: 16px;
          padding: 4px 10px 4px 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
        }

        .pc-head-status-select {
          background: #fff;
          color: var(--pc-ink);
          border: none;
          border-radius: 14px;
          padding: 5px 12px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          outline: none;
          font-family: inherit;
        }

        /* Bloque de Información del Cliente */
        .pc-info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 10px;
        }
        .pc-info-box {
          border: 1.5px solid var(--pc-slate-200);
          border-radius: 8px;
          padding: 10px 12px;
          display: flex;
          gap: 10px;
          align-items: flex-start;
          min-width: 0;
        }
        .pc-info-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: var(--pc-slate-100);
          color: var(--pc-slate-700);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .pc-info-label {
          display: block;
          font-size: 10.5px;
          font-weight: 700;
          color: var(--pc-slate-500);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 2px;
        }
        .pc-info-val {
          font-size: 13.5px;
          font-weight: 700;
          color: var(--pc-ink);
          word-break: break-word;
        }
        .pc-info-sub { font-size: 11.5px; color: var(--pc-slate-500); }

        /* ───────── BLOQUE DESTACADO GPS / MAPA ───────── */
        .pc-gps-card {
          background: #ffffff;
          border: 1.5px solid #cbd5e1;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.05);
        }
        .pc-gps-top {
          padding: 12px 16px;
          background: #f8fafc;
          border-bottom: 1px solid var(--pc-slate-200);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          flex-wrap: wrap;
        }
        .pc-gps-coords-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          color: #1d4ed8;
          font-size: 11.5px;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 6px;
        }
        .pc-gps-map-frame {
          width: 100%;
          height: 230px;
          border: none;
          display: block;
        }
        .pc-gps-bottom {
          padding: 12px 16px;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }
        .pc-gps-address-text {
          font-size: 13px;
          color: var(--pc-ink);
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .pc-btn-navigate {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: #0f172a;
          color: #ffffff !important;
          border-radius: 8px;
          padding: 8px 16px;
          font-size: 12.5px;
          font-weight: 700;
          text-decoration: none;
          transition: background 0.15s ease;
          box-shadow: 0 2px 6px rgba(15, 23, 42, 0.15);
        }
        .pc-btn-navigate:hover {
          background: #1e293b;
        }

        /* Lista de Artículos */
        .pc-items-list { display: flex; flex-direction: column; gap: 8px; }
        .pc-item-card {
          border: 1.5px solid var(--pc-slate-200);
          border-radius: 8px;
          padding: 10px 12px;
          background: #fff;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .pc-item-thumb {
          width: 58px;
          height: 58px;
          border-radius: 6px;
          object-fit: cover;
          border: 1px solid var(--pc-slate-200);
          background: var(--pc-slate-50);
          cursor: zoom-in;
          flex-shrink: 0;
        }
        .pc-item-info { flex: 1; min-width: 0; }
        .pc-item-title {
          font-size: 13.5px;
          font-weight: 700;
          color: var(--pc-ink);
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 3px;
        }
        .pc-item-tag-3d {
          background: #dcfce7;
          border: 1px solid #a7f3d0;
          color: #065f46;
          font-size: 10.5px;
          font-weight: 800;
          padding: 1px 6px;
          border-radius: 4px;
        }
        .pc-item-meta {
          font-size: 12px;
          color: var(--pc-slate-500);
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .pc-item-meta strong { color: var(--pc-ink); }

        /* Resumen de Pago */
        .pc-summary {
          background: var(--pc-slate-50);
          border: 1px solid var(--pc-slate-200);
          border-radius: 8px;
          padding: 12px 14px;
        }
        .pc-summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          padding: 3px 0;
          color: var(--pc-slate-700);
        }
        .pc-summary-total {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-top: 8px;
          padding-top: 10px;
          border-top: 1px solid var(--pc-slate-200);
        }
        .pc-summary-total span { font-size: 12px; color: var(--pc-slate-500); font-weight: 600; }
        .pc-summary-total strong { font-size: 22px; font-weight: 800; color: var(--pc-ink); }

        /* Botón de acción principal para entrega */
        .pc-btn-action-deliver {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          background: #10b981;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          padding: 12px 18px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.15s ease;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.25);
        }
        .pc-btn-action-deliver:hover {
          background: #059669;
        }

        .pc-empty {
          text-align: center;
          padding: 60px 20px;
          color: var(--pc-slate-500);
          font-size: 13px;
        }
        .pc-empty-icon {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: var(--pc-slate-100);
          color: #94a3b8;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
        }

        /* SweetAlert */
        .pc-swal-confirm {
          background: #0f172a !important;
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

        /* ───────── Responsive ───────── */
        @media (max-width: 1023px) {
          .pc-admin { padding: 14px 14px 40px; }
          .pc-title { font-size: 22px; }
          .pc-split { display: block; }
          .pc-master .pc-card, .pc-detail .pc-card { max-height: none; position: static; }
          .pc-list { overflow: visible; }
          .pc-detail-body { overflow: visible; }
          .pc-detail { display: none; }
          .pc-split.show-detail .pc-master { display: none; }
          .pc-split.show-detail .pc-detail { display: block; }
          .pc-btn-back { display: inline-flex; }
          .pc-channel-bar { flex-direction: column; align-items: stretch; }
          .pc-segmented { width: 100%; }
          .pc-seg-btn { flex: 1; justify-content: center; padding: 7px 12px; }
        }
      `}</style>

      {/* ═══════════ ENCABEZADO ═══════════ */}
      <div className="pc-page-head">
        <div>
          <div className="pc-eyebrow">
            <span className="pc-pill-tag">
              <span className="pc-live-dot" />
              <span>Gestión de Envíos</span>
            </span>
            <span className="pc-eyebrow-desc">• Seguimiento de ruta y entrega</span>
          </div>
          <h1 className="pc-title">Control de Envíos y Despacho</h1>
          <p className="pc-subtitle">Selecciona un pedido para revisar su ubicación GPS en el mapa, detalles y marcar entrega.</p>
        </div>
        <button
          type="button"
          className="pc-btn-ghost"
          onClick={() => fetchShippings(true)}
          disabled={refreshing || loading}
        >
          <IconRefresh size={13} sw={2.2} style={refreshing ? { animation: 'pc-spin 0.8s linear infinite' } : undefined} />
          <span>{refreshing ? 'Actualizando…' : 'Actualizar'}</span>
        </button>
      </div>

      {/* ═══════════ PESTAÑAS DE ESTADO (Igual que canales en Pedidos) ═══════════ */}
      <div className="pc-channel-bar">
        <div className="pc-segmented" role="tablist" aria-label="Estado de envío">
          {STATUS_TABS.map((tab) => {
            const count = statusStats[tab.id] || 0
            const active = statusFilter === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                className={`pc-seg-btn${active ? ' is-active' : ''}${count === 0 ? ' is-empty' : ''}`}
                onClick={() => setStatusFilter(tab.id)}
              >
                <span style={{ color: active ? tab.color : 'inherit', display: 'inline-flex' }}>
                  <tab.Icon size={14} />
                </span>
                <span>{tab.label}</span>
                <span className="pc-seg-count">{count}</span>
              </button>
            )
          })}
        </div>

        <div className="pc-channel-summary">
          <span>Mostrando: <strong>{filteredOrders.length}</strong> de {groupedOrders.length} envíos</span>
        </div>
      </div>

      {/* ═══════════ LAYOUT MAESTRO / DETALLE ═══════════ */}
      <div className={`pc-split${showDetailMobile ? ' show-detail' : ''}`}>
        
        {/* ── PANEL IZQUIERDO: LISTA DE ENVÍOS (MASTER) ── */}
        <div className="pc-master">
          <div className="pc-card">
            
            {/* Buscador y filtro por departamento */}
            <div className="pc-section">
              <div className="pc-search-row">
                <div className="pc-search">
                  <IconSearch size={14} />
                  <input
                    className="pc-input"
                    type="text"
                    placeholder="Buscar por cliente, cédula o # pedido…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="pc-search">
                  <IconPin size={14} />
                  <select
                    className="pc-select"
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                  >
                    <option value="">Todos los Departamentos</option>
                    {uniqueCities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Listado de pedidos */}
            <div className="pc-list" role="list">
              {loading ? (
                <div className="pc-empty">
                  <div className="pc-empty-icon" style={{ animation: 'pc-spin 1s linear infinite' }}>
                    <IconRefresh size={22} />
                  </div>
                  <div>Cargando envíos…</div>
                </div>
              ) : paginatedOrders.length === 0 ? (
                <div className="pc-empty">
                  <div className="pc-empty-icon">
                    <IconCheck size={24} />
                  </div>
                  <div><strong>No hay envíos</strong></div>
                  <div style={{ fontSize: '12px', marginTop: '4px' }}>
                    {searchTerm || cityFilter ? 'Prueba cambiando los filtros.' : 'No hay pedidos en este estado.'}
                  </div>
                </div>
              ) : (
                paginatedOrders.map((order) => {
                  const isSelected = order.id_order === selectedId
                  const clientName = order.client_name ? `${order.client_name} ${order.client_lastname}` : order.username
                  const statusInfo = STATUS_COLOR_MAP[order.status] || { dot: '#64748b', label: order.status }

                  return (
                    <div
                      key={order.id_order}
                      className={`pc-order-row${isSelected ? ' is-selected' : ''}`}
                      onClick={() => selectOrder(order.id_order)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="pc-row-top">
                        <span className="pc-row-id">
                          <IconTruck size={14} style={{ color: statusInfo.dot }} />
                          <span>#{order.id_order}</span>
                        </span>
                        <span className="pc-row-price">C${order.realTotal}</span>
                      </div>

                      <div className="pc-row-client">
                        <IconUser size={12} />
                        <span className="pc-row-name">{clientName}</span>
                      </div>

                      <div className="pc-row-bottom">
                        <span className="pc-row-status">
                          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: statusInfo.dot, display: 'inline-block' }} />
                          <span>{statusInfo.label}</span>
                        </span>
                        {order.city && (
                          <span className="pc-row-city">{order.city}</span>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="pc-pager">
                <button
                  type="button"
                  className="pc-pager-btn"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={safePage <= 1}
                >
                  <IconChevronLeft size={13} />
                </button>
                <span>Página <strong>{safePage}</strong> de {totalPages}</span>
                <button
                  type="button"
                  className="pc-pager-btn"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={safePage >= totalPages}
                >
                  <IconChevronRight size={13} />
                </button>
              </div>
            )}

          </div>
        </div>

        {/* ── PANEL DERECHO: DETALLE DEL ENVÍO (DETAIL) ── */}
        <div className="pc-detail">
          {selectedOrder ? (
            <div className="pc-card">
              
              {/* Encabezado del Detalle */}
              <div className="pc-card-head">
                <div className="pc-head-left">
                  <button
                    type="button"
                    className="pc-btn-back"
                    onClick={() => setShowDetailMobile(false)}
                  >
                    <IconChevronLeft size={13} />
                    <span>Volver</span>
                  </button>
                  <span>Envío #{selectedOrder.id_order}</span>
                  {selectedOrder.city && (
                    <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.15)', padding: '2px 8px', borderRadius: '4px' }}>
                      {selectedOrder.city}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', color: '#cbd5e1' }}>Estado:</span>
                  <select
                    className="pc-head-status-select"
                    value={selectedOrder.status}
                    onChange={(e) => handleStatusChange(selectedOrder.id_order, e.target.value)}
                  >
                    <option value="Enviado">Enviado (En camino)</option>
                    <option value="Entregado">Entregado</option>
                    <option value="No enviado">No enviado</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="En proceso">En proceso</option>
                    <option value="Terminado">Terminado</option>
                  </select>
                </div>
              </div>

              <div className="pc-detail-body">
                
                {/* 1. SECCIÓN DESTINO Y MAPA GPS */}
                <div className="pc-section">
                  <div className="pc-section-label">
                    <span>Ubicación y Datos de Entrega</span>
                    <small>{selectedLocation.lat ? 'GPS Confirmado' : 'Dirección física'}</small>
                  </div>

                  <div className="pc-gps-card">
                    <div className="pc-gps-top">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <IconPin size={16} style={{ color: '#dc2626' }} />
                        <span style={{ fontWeight: '700', fontSize: '13px' }}>
                          {selectedOrder.city ? `${selectedOrder.city}, Nicaragua` : 'Destino de Envío'}
                        </span>
                      </div>

                      {selectedLocation.lat && selectedLocation.lng ? (
                        <div className="pc-gps-coords-badge">
                          <IconNavigation size={12} />
                          <span>GPS: {selectedLocation.lat.toFixed(5)}, {selectedLocation.lng.toFixed(5)}</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '11.5px', color: '#64748b' }}>Sin coordenadas directas</span>
                      )}
                    </div>

                    {/* Previsualización del mapa Google Maps interactivo si hay coordenadas */}
                    {selectedLocation.lat && selectedLocation.lng ? (
                      <iframe
                        title="Mapa de Entrega"
                        className="pc-gps-map-frame"
                        src={`https://maps.google.com/maps?q=${selectedLocation.lat},${selectedLocation.lng}&hl=es&z=16&output=embed`}
                        loading="lazy"
                      />
                    ) : (
                      <div style={{ padding: '30px 16px', textAlign: 'center', background: '#f8fafc', color: '#64748b', fontSize: '12.5px' }}>
                        <IconPin size={28} style={{ color: '#94a3b8', display: 'block', margin: '0 auto 6px' }} />
                        <span>El cliente no marcó el pin en el mapa interactivo durante su compra.</span>
                      </div>
                    )}

                    <div className="pc-gps-bottom">
                      <div className="pc-gps-address-text">
                        <span>Dirección:</span>
                        <strong style={{ color: '#0f172a' }}>{selectedLocation.addressText}</strong>
                      </div>

                      {selectedLocation.mapsUrl ? (
                        <a
                          href={selectedLocation.mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="pc-btn-navigate"
                        >
                          <IconNavigation size={13} />
                          <span>Abrir en Google Maps / GPS</span>
                        </a>
                      ) : (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${selectedLocation.addressText}, ${selectedOrder.city || ''}, Nicaragua`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="pc-btn-navigate"
                          style={{ background: '#334155' }}
                        >
                          <IconSearch size={13} />
                          <span>Buscar en Google Maps</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. SECCIÓN CLIENTE Y CONTACTO */}
                <div className="pc-section">
                  <div className="pc-section-label">
                    <span>Datos del Cliente y Pago</span>
                  </div>

                  <div className="pc-info-grid">
                    <div className="pc-info-box">
                      <div className="pc-info-icon"><IconUser size={16} /></div>
                      <div>
                        <span className="pc-info-label">Cliente</span>
                        <div className="pc-info-val">
                          {selectedOrder.client_name ? `${selectedOrder.client_name} ${selectedOrder.client_lastname}` : selectedOrder.username}
                        </div>
                        <div className="pc-info-sub">@{selectedOrder.username}</div>
                      </div>
                    </div>

                    <div className="pc-info-box">
                      <div className="pc-info-icon"><IconCard size={16} /></div>
                      <div>
                        <span className="pc-info-label">Cédula</span>
                        <div className="pc-info-val">{selectedOrder.cedula || 'No especificada'}</div>
                        <div className="pc-info-sub">Identificación</div>
                      </div>
                    </div>

                    <div className="pc-info-box">
                      <div className="pc-info-icon"><IconCard size={16} /></div>
                      <div>
                        <span className="pc-info-label">Método de Pago</span>
                        <div className="pc-info-val">{selectedOrder.paymethod || 'Efectivo'}</div>
                        <div className="pc-info-sub">Cobro contra entrega</div>
                      </div>
                    </div>

                    {selectedOrder.pedidoTelefono && (
                      <div className="pc-info-box">
                        <div className="pc-info-icon"><IconPhone size={16} /></div>
                        <div>
                          <span className="pc-info-label">Teléfono</span>
                          <div className="pc-info-val">{selectedOrder.pedidoTelefono}</div>
                          <div className="pc-info-sub">Contacto directo</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. SECCIÓN ARTÍCULOS EN EL PAQUETE */}
                <div className="pc-section">
                  <div className="pc-section-label">
                    <span>Contenido del Envío</span>
                    <small>{selectedOrder.items.length} artículo(s)</small>
                  </div>

                  <div className="pc-items-list">
                    {selectedOrder.items.map((item, idx) => {
                      const customData = parseCustomization(item.custom_image || item.image)
                      const finalImg = getItemPreviewImage(item)
                      const hasMultiViews = customData?.views && customData.views.length > 1

                      return (
                        <div key={idx} className="pc-item-card">
                          <img
                            src={finalImg}
                            alt={item.name}
                            className="pc-item-thumb"
                            onClick={() => {
                              if (hasMultiViews) {
                                showViewsGalleryModal(customData.views, item.name)
                              } else {
                                Swal.fire({
                                  imageUrl: finalImg,
                                  imageAlt: item.name,
                                  showConfirmButton: false,
                                  showCloseButton: true,
                                  width: 'auto',
                                  padding: '1em'
                                })
                              }
                            }}
                            title={hasMultiViews ? 'Ver vistas 3D' : 'Clic para ver imagen'}
                          />
                          <div className="pc-item-info">
                            <div className="pc-item-title">
                              <span>{item.name}</span>
                              {customData && <span className="pc-item-tag-3d">3D</span>}
                            </div>
                            <div className="pc-item-meta">
                              <span>Talla: <strong>{item.size || 'N/A'}</strong></span>
                              <span>Color: <strong>{item.color || 'N/A'}</strong></span>
                              <span>Cant: <strong>{item.quantityOrders || 1}</strong></span>
                              <span>Precio: <strong>C${item.price}</strong></span>
                            </div>

                            {hasMultiViews && (
                              <button
                                type="button"
                                onClick={() => showViewsGalleryModal(customData.views, item.name)}
                                style={{
                                  marginTop: '5px',
                                  padding: '2px 7px',
                                  fontSize: '11px',
                                  fontWeight: '600',
                                  background: '#f1f5f9',
                                  border: '1px solid #cbd5e1',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  color: '#0f172a'
                                }}
                              >
                                Ver vistas 3D ({customData.views.length})
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* 4. RESUMEN Y ACCIÓN DE ENTREGA */}
                <div className="pc-section">
                  <div className="pc-summary">
                    <div className="pc-summary-row">
                      <span>Costo de Envío:</span>
                      <strong>C${selectedOrder.cost || 0}</strong>
                    </div>
                    <div className="pc-summary-total">
                      <span>TOTAL A COBRAR:</span>
                      <strong>C${selectedOrder.realTotal}</strong>
                    </div>
                  </div>

                  <div style={{ marginTop: '16px' }}>
                    {selectedOrder.status === 'Enviado' ? (
                      <button
                        type="button"
                        className="pc-btn-action-deliver"
                        onClick={() => handleStatusChange(selectedOrder.id_order, 'Entregado')}
                      >
                        <IconCheck size={18} sw={2.5} />
                        <span>Confirmar Entrega al Cliente</span>
                      </button>
                    ) : (
                      <div style={{
                        padding: '12px',
                        background: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        borderRadius: '8px',
                        textAlign: 'center',
                        color: '#15803d',
                        fontWeight: '700',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}>
                        <IconCheck size={16} sw={2.5} />
                        <span>Este pedido figura con estado: "{selectedOrder.status}"</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </div>
          ) : (
            <div className="pc-card">
              <div className="pc-empty" style={{ padding: '120px 20px' }}>
                <div className="pc-empty-icon"><IconTruck size={28} /></div>
                <div style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>Ningún envío seleccionado</div>
                <p style={{ marginTop: '4px' }}>Haz clic en un envío del panel izquierdo para ver su mapa GPS y detalles completos.</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
