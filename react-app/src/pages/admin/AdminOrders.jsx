import { useEffect, useMemo, useRef, useState } from 'react'
import { getOrderDetails, changeOrderStatus } from '../../api/ordersApi'
import Swal from 'sweetalert2'
import { parseCustomization, getItemPreviewImage, showViewsGalleryModal } from '../../utils/customizationHelper'

const STATUS_OPTIONS = ['Pendiente', 'En proceso', 'No enviado', 'Enviado', 'Entregado', 'Terminado']
const PAGE_SIZE = 20

// Color de cada estado (punto indicador)
const STATUS_DOT = {
  'Pendiente': '#d97706',
  'En proceso': '#2563eb',
  'No enviado': '#dc2626',
  'Enviado': '#7c3aed',
  'Entregado': '#0d9488',
  'Terminado': '#64748b',
}

// ─────────────────────────────────────────────────────────────
// Iconos SVG (trazo fino, mismo estilo que el personalizador)
// ─────────────────────────────────────────────────────────────
const Svg = ({ size = 14, sw = 2, children, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, ...style }}>
    {children}
  </svg>
)

const IconGlobe = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </Svg>
)
const IconChat = (p) => (
  <Svg {...p}>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </Svg>
)
const IconFacebook = (p) => (
  <Svg {...p}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </Svg>
)
const IconInstagram = (p) => (
  <Svg {...p}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </Svg>
)
const IconGrid = (p) => (
  <Svg {...p}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
  </Svg>
)
const IconUser = (p) => (
  <Svg {...p}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
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
const IconLayers = (p) => (
  <Svg {...p}>
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </Svg>
)
const IconDownload = (p) => (
  <Svg {...p}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </Svg>
)
const IconImage = (p) => (
  <Svg {...p}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </Svg>
)
const IconInfo = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </Svg>
)
const IconCheck = (p) => (
  <Svg {...p}>
    <polyline points="20 6 9 17 4 12" />
  </Svg>
)
const IconSearch = (p) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </Svg>
)
const IconRefresh = (p) => (
  <Svg {...p}>
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
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
const IconText = (p) => (
  <Svg {...p}>
    <polyline points="4 7 4 4 20 4 20 7" />
    <line x1="9" y1="20" x2="15" y2="20" />
    <line x1="12" y1="4" x2="12" y2="20" />
  </Svg>
)
const IconNote = (p) => (
  <Svg {...p}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </Svg>
)
const IconBag = (p) => (
  <Svg {...p}>
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </Svg>
)

// ─────────────────────────────────────────────────────────────
// Canales de venta (id_canal_de_ventas)
// ─────────────────────────────────────────────────────────────
const CHANNELS = [
  { id: 1, label: 'Web', Icon: IconGlobe, bg: '#EFF1F5', text: '#374151', border: '#DADFE6' },
  { id: 2, label: 'WhatsApp', Icon: IconChat, bg: '#E4F5EA', text: '#1E7A45', border: '#BEE6CC' },
  { id: 3, label: 'Facebook', Icon: IconFacebook, bg: '#E7F0FC', text: '#1B5FB0', border: '#C7DEF7' },
  { id: 4, label: 'Instagram', Icon: IconInstagram, bg: '#FCEAF0', text: '#B0245A', border: '#F5C9DB' },
]
const getChannelId = (raw) => {
  const n = Number(raw)
  return CHANNELS.some(c => c.id === n) ? n : 1
}
const getChannel = (raw) => CHANNELS.find(c => c.id === getChannelId(raw))

const fmtMoney = (n) =>
  `C$ ${Number(n || 0).toLocaleString('es-NI', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`

// Determina si un color HEX es claro (para mostrar textos blancos sobre fondo oscuro)
const isLightColor = (hex) => {
  if (!hex || typeof hex !== 'string') return false
  const h = hex.replace('#', '')
  if (h.length !== 6) return false
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) > 200
}

const isCustomItem = (it) => {
  const c = parseCustomization(it.custom_image || it.image)
  return Boolean(c) || Boolean(it.name && it.name.toLowerCase().includes('personalizado'))
}

const ChannelBadge = ({ channelId, compact = false }) => {
  const ch = getChannel(channelId)
  return (
    <span className="pc-channel-badge" style={{ background: ch.bg, color: ch.text, borderColor: ch.border }}>
      <ch.Icon size={compact ? 10 : 11} sw={2.2} />
      {!compact && <span>{ch.label}</span>}
    </span>
  )
}

const openImage = (url, title) => Swal.fire({
  imageUrl: url,
  imageAlt: title || 'Imagen',
  title: title || undefined,
  showConfirmButton: false,
  showCloseButton: true,
  width: 'auto',
  padding: '1em',
})

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [channelFilter, setChannelFilter] = useState('todos')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const [mobileShowDetail, setMobileShowDetail] = useState(false)
  const detailBodyRef = useRef(null)

  const fetchOrders = async () => {
    try {
      const res = await getOrderDetails()
      setOrders(res.data)
    } catch (error) {
      console.error('Error fetching admin orders:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    let alive = true
    getOrderDetails()
      .then(res => { if (alive) setOrders(res.data) })
      .catch(error => console.error('Error fetching admin orders:', error))
      .finally(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [])

  // Al cambiar filtros: volver a la página 1 y a la lista en móvil
  const resetPaging = () => {
    setCurrentPage(1)
    setMobileShowDetail(false)
  }
  const changeSearch = (v) => { setSearchTerm(v); resetPaging() }
  const changeStatusFilter = (v) => { setStatusFilter(v); resetPaging() }
  const changeChannel = (v) => { setChannelFilter(v); resetPaging() }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchOrders()
  }

  const handleStatusChange = async (id_order, newStatus) => {
    // Actualización optimista para que el cambio se vea al instante
    const previous = orders
    setOrders(prev => prev.map(o => (o.id_order === id_order ? { ...o, status: newStatus } : o)))
    try {
      await changeOrderStatus(id_order, newStatus)
      Swal.fire({ icon: 'success', title: 'Actualizado', text: `Pedido #${id_order}: ${newStatus}`, timer: 1400, showConfirmButton: false })
      fetchOrders()
    } catch {
      setOrders(previous)
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo actualizar el estado' })
    }
  }

  const handleApproveDeposit = (id_order) => {
    Swal.fire({
      title: '¿Aprobar comprobante?',
      text: "El estado cambiará a 'En proceso'",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, aprobar',
      cancelButtonText: 'Cancelar',
      buttonsStyling: false,
      customClass: { confirmButton: 'pc-swal-confirm', cancelButton: 'pc-swal-cancel' },
    }).then((result) => {
      if (result.isConfirmed) {
        handleStatusChange(id_order, 'En proceso')
      }
    })
  }

  // Agrupar filas de detalle por pedido
  const groupedOrders = useMemo(() => {
    const grouped = Object.values(
      orders.reduce((acc, buy) => {
        if (!acc[buy.id_order]) {
          acc[buy.id_order] = {
            id_order: buy.id_order,
            username: buy.username,
            status: buy.status,
            cost: buy.cost,
            paymethod: buy.paymethod,
            voucher_url: buy.voucher_url,
            totalAmount: buy.totalAmount,
            id_canal_de_ventas: getChannelId(buy.id_canal_de_ventas),
            pedidoNombre: buy.pedidoNombre,
            cedula: buy.cedula,
            pedidoTelefono: buy.pedidoTelefono,
            items: []
          }
        }
        acc[buy.id_order].items.push(buy)
        return acc
      }, {})
    )
    grouped.forEach(order => {
      const itemsTotal = order.items.reduce((sum, item) => sum + (item.price * item.quantityOrders), 0)
      order.subtotal = itemsTotal
      order.realTotal = itemsTotal + parseFloat(order.cost || 0)
      order.has3D = order.items.some(isCustomItem)
    })
    grouped.sort((a, b) => b.id_order - a.id_order)
    return grouped
  }, [orders])

  // Conteo por canal (total y pendientes)
  const channelStats = useMemo(() => {
    const stats = { todos: { total: groupedOrders.length, pending: 0 } }
    CHANNELS.forEach(c => { stats[c.id] = { total: 0, pending: 0 } })
    groupedOrders.forEach(o => {
      stats[o.id_canal_de_ventas].total += 1
      if (o.status === 'Pendiente') {
        stats[o.id_canal_de_ventas].pending += 1
        stats.todos.pending += 1
      }
    })
    return stats
  }, [groupedOrders])

  // Pedidos del canal activo + búsqueda (antes de filtrar estado)
  const channelSearchOrders = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return groupedOrders.filter(order => {
      const matchesChannel = channelFilter === 'todos' || order.id_canal_de_ventas === channelFilter
      if (!matchesChannel) return false
      if (!term) return true
      return (
        (order.username || '').toLowerCase().includes(term) ||
        (order.pedidoNombre || '').toLowerCase().includes(term) ||
        (order.pedidoTelefono || '').includes(term) ||
        order.id_order.toString().includes(term)
      )
    })
  }, [groupedOrders, channelFilter, searchTerm])

  const statusCounts = useMemo(() => {
    const counts = { Todos: channelSearchOrders.length }
    STATUS_OPTIONS.forEach(s => { counts[s] = 0 })
    channelSearchOrders.forEach(o => { if (counts[o.status] !== undefined) counts[o.status] += 1 })
    return counts
  }, [channelSearchOrders])

  const filteredOrders = useMemo(
    () => channelSearchOrders.filter(o => statusFilter === 'Todos' || o.status === statusFilter),
    [channelSearchOrders, statusFilter]
  )

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const pageOrders = useMemo(
    () => filteredOrders.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filteredOrders, safePage]
  )
  const rangeStart = filteredOrders.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1
  const rangeEnd = Math.min(safePage * PAGE_SIZE, filteredOrders.length)

  // Si el pedido elegido no está en la página actual, se muestra el primero disponible
  const activeOrderId = pageOrders.some(o => o.id_order === selectedOrderId)
    ? selectedOrderId
    : (pageOrders[0]?.id_order ?? null)

  // Volver arriba del detalle al cambiar de pedido
  useEffect(() => {
    if (detailBodyRef.current) detailBodyRef.current.scrollTop = 0
  }, [activeOrderId])

  const selectedOrder = groupedOrders.find(o => o.id_order === activeOrderId) || null
  const activeChannel = channelFilter === 'todos' ? null : getChannel(channelFilter)

  const handleSelectOrder = (id_order) => {
    setSelectedOrderId(id_order)
    setMobileShowDetail(true)
    if (window.innerWidth < 1024) window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return
    setCurrentPage(p)
  }

  return (
    <div className="pc-admin">
      <style>{`
        .pc-admin {
          --pc-ink: #0f172a;
          --pc-ink-2: #111827;
          --pc-slate-700: #334155;
          --pc-slate-500: #64748b;
          --pc-slate-300: #cbd5e1;
          --pc-slate-200: #e2e8f0;
          --pc-slate-100: #f1f5f9;
          --pc-slate-50: #f8fafc;
          --pc-teal: #00d1b2;
          --pc-teal-dark: #0d9488;
          --pc-teal-bg: #f0fdfa;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          color: var(--pc-ink);
          max-width: 1760px;
          margin: 0 auto;
          padding: 18px 28px 48px;
        }
        .pc-admin * { box-sizing: border-box; }

        /* ───────── Encabezado (mismo lenguaje que el personalizador) ───────── */
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

        /* ───────── Pestañas de canal (toggle tipo "Diseñar / Girar 360°") ───────── */
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
          position: relative;
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
        .pc-seg-pending {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #d97706;
          box-shadow: 0 0 0 2px rgba(217, 119, 6, 0.2);
        }
        .pc-channel-summary {
          font-size: 12.5px;
          color: var(--pc-slate-500);
          font-weight: 600;
        }
        .pc-channel-summary strong { color: var(--pc-ink); }

        /* ───────── Tarjetas (idénticas a .personalizador-card) ───────── */
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
        .pc-head-tag {
          background: #0284c7;
          color: #fff;
          font-size: 11.5px;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 4px;
          white-space: nowrap;
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

        /* ───────── Layout maestro / detalle ───────── */
        .pc-split {
          display: grid;
          grid-template-columns: minmax(360px, 420px) minmax(0, 1fr);
          gap: 20px;
          align-items: start;
        }
        .pc-master .pc-card { max-height: calc(100vh - 32px); position: sticky; top: 16px; }
        .pc-detail .pc-card { max-height: calc(100vh - 32px); position: sticky; top: 16px; }

        /* Buscador */
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
        .pc-input {
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
        .pc-input:focus {
          border-color: var(--pc-teal);
          box-shadow: 0 0 0 3px rgba(0, 209, 178, 0.15);
        }

        /* Chips de estado (estilo .product-btn) */
        .pc-status-chips {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin-top: 10px;
        }
        .pc-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 10px;
          border-radius: 8px;
          font-size: 11.5px;
          font-weight: 500;
          background: #fff;
          border: 1.5px solid var(--pc-slate-200);
          color: var(--pc-slate-700);
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: inherit;
        }
        .pc-chip:hover { border-color: var(--pc-teal); color: var(--pc-teal-dark); }
        .pc-chip.is-active {
          border-color: var(--pc-teal);
          background: var(--pc-teal-bg);
          color: var(--pc-teal-dark);
          font-weight: 700;
          box-shadow: 0 2px 4px rgba(0, 209, 178, 0.15);
        }
        .pc-chip-count { font-size: 10.5px; color: var(--pc-slate-500); font-weight: 700; }
        .pc-chip.is-active .pc-chip-count { color: var(--pc-teal-dark); }
        .pc-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; display: inline-block; }

        /* Lista de pedidos */
        .pc-list {
          flex: 1;
          overflow-y: auto;
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-height: 200px;
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
          outline: none;
        }
        .pc-order-row:hover { border-color: #94a3b8; background: var(--pc-slate-50); }
        .pc-order-row:focus-visible { box-shadow: 0 0 0 3px rgba(0, 209, 178, 0.25); }
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
        .pc-row-tel { color: var(--pc-slate-500); font-size: 11.5px; white-space: nowrap; }
        .pc-row-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11.5px;
          font-weight: 600;
          color: var(--pc-slate-700);
        }
        .pc-row-meta {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11.5px;
          color: var(--pc-slate-500);
        }

        .pc-channel-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 10.5px;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 999px;
          border: 1px solid transparent;
          white-space: nowrap;
        }
        .pc-tag-3d {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 10.5px;
          font-weight: 700;
          color: #047857;
          background: #d1fae5;
          border: 1px solid #a7f3d0;
          border-radius: 4px;
          padding: 1px 6px;
          letter-spacing: 0.3px;
          white-space: nowrap;
        }
        .pc-tag-legacy { color: #475569; background: var(--pc-slate-100); border-color: var(--pc-slate-300); }

        .pc-list-empty {
          text-align: center;
          padding: 40px 16px;
          color: var(--pc-slate-500);
          font-size: 13px;
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

        /* ───────── Detalle ───────── */
        .pc-detail-body { overflow-y: auto; flex: 1; }
        .pc-head-left { display: flex; align-items: center; gap: 10px; min-width: 0; flex-wrap: wrap; }
        .pc-head-status {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 18px;
          padding: 3px 4px 3px 12px;
        }
        .pc-head-status select {
          background: #fff;
          color: var(--pc-ink);
          border: none;
          border-radius: 14px;
          padding: 5px 10px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          outline: none;
          font-family: inherit;
        }
        .pc-head-status-label {
          font-size: 11px;
          font-weight: 600;
          color: #cbd5e1;
          letter-spacing: 0.3px;
        }

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
          width: 30px;
          height: 30px;
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
        .pc-wa-link {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: #15803d;
          text-decoration: none;
          font-weight: 700;
        }
        .pc-wa-link:hover { text-decoration: underline; }

        /* Comprobante */
        .pc-voucher {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          background: #fffbeb;
          border: 1px solid #fde68a;
          border-radius: 8px;
          padding: 12px 14px;
        }
        .pc-voucher img {
          width: 72px;
          height: 96px;
          object-fit: cover;
          border: 1px solid #f59e0b;
          border-radius: 6px;
          cursor: zoom-in;
        }
        .pc-btn-approve {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: var(--pc-ink-2);
          color: #fff;
          border: none;
          border-radius: 8px;
          padding: 9px 14px;
          font-size: 12.5px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.15s ease;
        }
        .pc-btn-approve:hover { background: #000; }

        /* Artículos */
        .pc-item {
          border: 1.5px solid var(--pc-slate-200);
          border-radius: 10px;
          overflow: hidden;
        }
        .pc-item + .pc-item { margin-top: 12px; }
        .pc-item-main {
          display: flex;
          gap: 14px;
          align-items: center;
          padding: 12px 14px;
        }
        .pc-item-thumb {
          width: 64px;
          height: 64px;
          object-fit: contain;
          border: 1px solid var(--pc-slate-200);
          border-radius: 8px;
          background: var(--pc-slate-50);
          flex-shrink: 0;
          cursor: zoom-in;
        }
        .pc-item-name {
          font-size: 14px;
          font-weight: 700;
          margin: 0 0 4px;
          color: var(--pc-ink);
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .pc-item-specs { display: flex; gap: 6px; flex-wrap: wrap; }
        .pc-spec {
          font-size: 11.5px;
          color: var(--pc-slate-700);
          background: var(--pc-slate-100);
          border-radius: 4px;
          padding: 2px 8px;
        }
        .pc-spec strong { color: var(--pc-ink); }
        .pc-item-price { margin-left: auto; text-align: right; flex-shrink: 0; }
        .pc-item-price strong { display: block; font-size: 14px; font-weight: 800; }
        .pc-item-price span { font-size: 11.5px; color: var(--pc-slate-500); }

        .pc-prod {
          background: var(--pc-slate-50);
          border-top: 1px solid var(--pc-slate-200);
          padding: 12px 14px 14px;
        }
        .pc-prod-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 4px;
        }
        .pc-prod-title {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12.5px;
          font-weight: 700;
          color: var(--pc-ink);
        }
        .pc-prod-zones { font-size: 11.5px; color: var(--pc-slate-500); font-weight: 600; }
        .pc-prod-zones strong { color: var(--pc-ink); }
        .pc-block { margin-top: 12px; }
        .pc-block-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 10.5px;
          font-weight: 700;
          color: var(--pc-slate-700);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }
        .pc-views-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 10px;
        }
        .pc-view {
          background: #fff;
          border: 1.5px solid var(--pc-slate-200);
          border-radius: 8px;
          padding: 6px;
          text-align: center;
          cursor: zoom-in;
          transition: border-color 0.15s ease;
        }
        .pc-view:hover { border-color: var(--pc-teal); }
        .pc-view span { display: block; font-size: 11px; font-weight: 700; color: var(--pc-ink); margin-bottom: 4px; }
        .pc-view img { width: 100%; height: 120px; object-fit: contain; display: block; }

        .pc-files-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 8px;
        }
        .pc-file {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          background: #fff;
          border: 1.5px solid var(--pc-slate-200);
          border-radius: 8px;
          padding: 8px 10px;
          min-width: 0;
        }
        .pc-file-info { display: flex; align-items: center; gap: 10px; min-width: 0; }
        .pc-file-thumb {
          width: 44px;
          height: 44px;
          object-fit: contain;
          border: 1px solid var(--pc-slate-200);
          border-radius: 6px;
          background-color: #fff;
          background-image: linear-gradient(45deg, #eef2f6 25%, transparent 25%), linear-gradient(-45deg, #eef2f6 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #eef2f6 75%), linear-gradient(-45deg, transparent 75%, #eef2f6 75%);
          background-size: 10px 10px;
          background-position: 0 0, 0 5px, 5px -5px, -5px 0;
          flex-shrink: 0;
          cursor: zoom-in;
        }
        .pc-file-name {
          margin: 0;
          font-size: 12px;
          font-weight: 700;
          color: var(--pc-ink);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .pc-file-meta { margin: 0; font-size: 11px; color: var(--pc-slate-500); }
        .pc-file-meta strong { color: var(--pc-slate-700); }
        .pc-ok { color: #059669; font-weight: 700; }
        .pc-btn-dl {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #1e293b;
          color: #fff !important;
          font-size: 11.5px;
          font-weight: 600;
          padding: 7px 11px;
          border-radius: 8px;
          text-decoration: none;
          white-space: nowrap;
          flex-shrink: 0;
          transition: background 0.15s ease;
        }
        .pc-btn-dl:hover { background: var(--pc-ink); }

        .pc-text-row {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #fff;
          border: 1.5px solid var(--pc-slate-200);
          border-radius: 8px;
          padding: 8px 10px;
          flex-wrap: wrap;
        }
        .pc-text-row + .pc-text-row { margin-top: 6px; }
        .pc-text-preview {
          font-size: 18px;
          line-height: 1.2;
          padding: 6px 12px;
          border-radius: 6px;
          border: 1px solid var(--pc-slate-200);
          max-width: 100%;
          overflow-wrap: anywhere;
        }
        .pc-text-meta { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }
        .pc-swatch {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 1px solid #94a3b8;
          display: inline-block;
          vertical-align: -1px;
          margin-right: 4px;
        }

        .pc-notes {
          display: flex;
          gap: 8px;
          background: #fef3c7;
          border: 1px solid #fde68a;
          border-radius: 8px;
          padding: 10px 12px;
          color: #78350f;
          font-size: 12.5px;
        }
        .pc-notes strong { display: block; font-size: 11px; color: #92400e; margin-bottom: 2px; }

        .pc-legacy-note {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-size: 11.5px;
          color: var(--pc-slate-500);
          margin-top: 10px;
          line-height: 1.45;
          background: var(--pc-slate-100);
          padding: 8px 12px;
          border-radius: 6px;
          border-left: 3px solid #94a3b8;
        }

        /* Resumen de pago (estilo "Total a pagar" del personalizador) */
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
        .pc-summary-total strong { font-size: 22px; font-weight: 800; color: var(--pc-ink); letter-spacing: -0.3px; }

        .pc-empty {
          text-align: center;
          padding: 70px 20px;
          color: var(--pc-slate-500);
          font-size: 13px;
        }
        .pc-empty-icon {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: var(--pc-slate-100);
          color: #94a3b8;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
        }
        .pc-empty strong { display: block; color: var(--pc-ink); font-size: 14px; margin-bottom: 4px; }

        /* SweetAlert */
        .pc-swal-confirm {
          background: #111111 !important;
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
          color: #4a4a4a !important;
          border: 1px solid #cfcfcb !important;
          border-radius: 8px !important;
          padding: 10px 22px !important;
          font-size: 13px !important;
          font-weight: 700 !important;
          margin: 0 6px !important;
        }

        /* ───────── Responsive ───────── */
        @media (min-width: 1500px) {
          .pc-split { grid-template-columns: 440px minmax(0, 1fr); }
        }
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
        @media (max-width: 600px) {
          .pc-card-head { padding: 12px 14px; font-size: 14px; flex-wrap: wrap; }
          .pc-section { padding: 12px 14px; }
          .pc-item-main { flex-wrap: wrap; }
          .pc-item-price { margin-left: 78px; text-align: left; }
          .pc-files-grid { grid-template-columns: 1fr; }
          .pc-views-grid { grid-template-columns: repeat(2, 1fr); }
          .pc-view img { height: 100px; }
          .pc-seg-btn span.pc-seg-label { display: none; }
          .pc-seg-btn.is-active span.pc-seg-label { display: inline; }
        }
      `}</style>

      {/* ═══════════ ENCABEZADO ═══════════ */}
      <div className="pc-page-head">
        <div>
          <div className="pc-eyebrow">
            <span className="pc-pill-tag">
              <span className="pc-live-dot" />
              <span>Panel de Pedidos</span>
            </span>
            <span className="pc-eyebrow-desc">• Producción y despacho</span>
          </div>
          <h1 className="pc-title">Gestión de Pedidos</h1>
          <p className="pc-subtitle">Revisa, aprueba y prepara para el taller los pedidos de cada canal de venta.</p>
        </div>
        <button type="button" className="pc-btn-ghost" onClick={handleRefresh} disabled={refreshing || loading}>
          <IconRefresh size={13} sw={2.2} style={refreshing ? { animation: 'pc-spin 0.8s linear infinite' } : undefined} />
          <span>{refreshing ? 'Actualizando…' : 'Actualizar'}</span>
        </button>
      </div>

      {/* ═══════════ CANALES DE VENTA ═══════════ */}
      <div className="pc-channel-bar">
        <div className="pc-segmented" role="tablist" aria-label="Canal de venta">
          <button
            type="button"
            role="tab"
            aria-selected={channelFilter === 'todos'}
            className={`pc-seg-btn${channelFilter === 'todos' ? ' is-active' : ''}`}
            onClick={() => changeChannel('todos')}
          >
            <IconGrid size={13} />
            <span className="pc-seg-label">Todos</span>
            <span className="pc-seg-count">{channelStats.todos.total}</span>
          </button>
          {CHANNELS.map(ch => {
            const st = channelStats[ch.id]
            const active = channelFilter === ch.id
            return (
              <button
                key={ch.id}
                type="button"
                role="tab"
                aria-selected={active}
                title={st.pending > 0 ? `${st.pending} pendiente(s)` : ch.label}
                className={`pc-seg-btn${active ? ' is-active' : ''}${st.total === 0 ? ' is-empty' : ''}`}
                onClick={() => changeChannel(ch.id)}
              >
                <span style={{ color: active ? ch.text : 'inherit', display: 'inline-flex' }}>
                  <ch.Icon size={13} />
                </span>
                <span className="pc-seg-label">{ch.label}</span>
                <span className="pc-seg-count">{st.total}</span>
                {st.pending > 0 && <span className="pc-seg-pending" />}
              </button>
            )
          })}
        </div>
        {!loading && (
          <span className="pc-channel-summary">
            {activeChannel ? <>Canal <strong>{activeChannel.label}</strong> · </> : null}
            <strong>{channelStats[channelFilter]?.pending || 0}</strong> pendiente(s) de revisión
          </span>
        )}
      </div>

      {/* ═══════════ MAESTRO / DETALLE ═══════════ */}
      <div className={`pc-split${mobileShowDetail ? ' show-detail' : ''}`}>
        {/* ─────────── COLUMNA IZQUIERDA: BANDEJA ─────────── */}
        <div className="pc-master">
          <div className="pc-card">
            <div className="pc-card-head">
              <span>Bandeja de Pedidos</span>
              <span className="pc-head-tag">{activeChannel ? activeChannel.label : 'Todos los canales'}</span>
            </div>

            <div className="pc-section">
              <div className="pc-search">
                <IconSearch size={14} />
                <input
                  className="pc-input"
                  type="text"
                  placeholder="Buscar por cliente, teléfono o n.º de pedido"
                  value={searchTerm}
                  onChange={(e) => changeSearch(e.target.value)}
                />
              </div>
              <div className="pc-status-chips">
                {['Todos', ...STATUS_OPTIONS].map(s => (
                  <button
                    key={s}
                    type="button"
                    className={`pc-chip${statusFilter === s ? ' is-active' : ''}`}
                    onClick={() => changeStatusFilter(s)}
                  >
                    {s !== 'Todos' && <span className="pc-dot" style={{ background: STATUS_DOT[s] }} />}
                    <span>{s}</span>
                    <span className="pc-chip-count">{statusCounts[s] || 0}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pc-list">
              {loading ? (
                <div className="pc-list-empty">Cargando pedidos…</div>
              ) : pageOrders.length === 0 ? (
                <div className="pc-list-empty">
                  No hay pedidos{activeChannel ? ` de ${activeChannel.label}` : ''} con estos filtros.
                </div>
              ) : (
                pageOrders.map(order => {
                  const isSelected = order.id_order === activeOrderId
                  return (
                    <div
                      key={order.id_order}
                      role="button"
                      tabIndex={0}
                      className={`pc-order-row${isSelected ? ' is-selected' : ''}`}
                      onClick={() => handleSelectOrder(order.id_order)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelectOrder(order.id_order) } }}
                    >
                      <div className="pc-row-top">
                        <span className="pc-row-id">
                          #{order.id_order}
                          {channelFilter === 'todos' && <ChannelBadge channelId={order.id_canal_de_ventas} />}
                        </span>
                        <span className="pc-row-price">{fmtMoney(order.realTotal)}</span>
                      </div>
                      <div className="pc-row-client">
                        <IconUser size={12} />
                        <span className="pc-row-name">{order.pedidoNombre || order.username}</span>
                        {order.pedidoTelefono && <span className="pc-row-tel">· {order.pedidoTelefono}</span>}
                      </div>
                      <div className="pc-row-bottom">
                        <span className="pc-row-status">
                          <span className="pc-dot" style={{ background: STATUS_DOT[order.status] || '#94a3b8' }} />
                          {order.status}
                        </span>
                        <span className="pc-row-meta">
                          {order.has3D && (
                            <span className="pc-tag-3d"><IconLayers size={10} sw={2.2} />3D</span>
                          )}
                          <span>{order.items.length} art.</span>
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            <div className="pc-pager">
              <button type="button" className="pc-pager-btn" onClick={() => goToPage(safePage - 1)} disabled={safePage <= 1} aria-label="Página anterior">
                <IconChevronLeft size={14} sw={2.2} />
              </button>
              <span>
                {filteredOrders.length === 0
                  ? '0 pedidos'
                  : <><strong>{rangeStart}–{rangeEnd}</strong> de {filteredOrders.length} · Pág. {safePage}/{totalPages}</>}
              </span>
              <button type="button" className="pc-pager-btn" onClick={() => goToPage(safePage + 1)} disabled={safePage >= totalPages} aria-label="Página siguiente">
                <IconChevronRight size={14} sw={2.2} />
              </button>
            </div>
          </div>
        </div>

        {/* ─────────── COLUMNA DERECHA: DETALLE ─────────── */}
        <div className="pc-detail">
          <div className="pc-card">
            {selectedOrder ? (
              <>
                <div className="pc-card-head">
                  <div className="pc-head-left">
                    <button type="button" className="pc-btn-back" onClick={() => setMobileShowDetail(false)}>
                      <IconChevronLeft size={14} sw={2.2} />
                      <span>Lista</span>
                    </button>
                    <span>Pedido N.º {selectedOrder.id_order}</span>
                    <ChannelBadge channelId={selectedOrder.id_canal_de_ventas} />
                  </div>
                  <label className="pc-head-status">
                    <span className="pc-dot" style={{ background: STATUS_DOT[selectedOrder.status] || '#94a3b8' }} />
                    <span className="pc-head-status-label">Estado</span>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => handleStatusChange(selectedOrder.id_order, e.target.value)}
                    >
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </label>
                </div>

                <div className="pc-detail-body" ref={detailBodyRef}>
                  {/* 1. Cliente y pago */}
                  <div className="pc-section">
                    <div className="pc-section-label"><span>1. Cliente y Pago</span></div>
                    <div className="pc-info-grid">
                      <div className="pc-info-box">
                        <span className="pc-info-icon"><IconUser size={14} /></span>
                        <div style={{ minWidth: 0 }}>
                          <span className="pc-info-label">Cliente</span>
                          <div className="pc-info-val">{selectedOrder.pedidoNombre || selectedOrder.username}</div>
                          {selectedOrder.cedula && <div className="pc-info-sub">Cédula: {selectedOrder.cedula}</div>}
                          {selectedOrder.pedidoNombre && selectedOrder.username && (
                            <div className="pc-info-sub">Usuario: {selectedOrder.username}</div>
                          )}
                        </div>
                      </div>
                      <div className="pc-info-box">
                        <span className="pc-info-icon"><IconPhone size={14} /></span>
                        <div style={{ minWidth: 0 }}>
                          <span className="pc-info-label">Contacto</span>
                          <div className="pc-info-val">
                            {selectedOrder.pedidoTelefono ? (
                              <a
                                className="pc-wa-link"
                                href={`https://wa.me/${selectedOrder.pedidoTelefono.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Abrir chat de WhatsApp"
                              >
                                {selectedOrder.pedidoTelefono}
                              </a>
                            ) : (
                              <span style={{ color: 'var(--pc-slate-500)', fontWeight: 600 }}>No especificado</span>
                            )}
                          </div>
                          {selectedOrder.pedidoTelefono && <div className="pc-info-sub">Clic para escribir por WhatsApp</div>}
                        </div>
                      </div>
                      <div className="pc-info-box">
                        <span className="pc-info-icon"><IconCard size={14} /></span>
                        <div style={{ minWidth: 0 }}>
                          <span className="pc-info-label">Método de pago</span>
                          <div className="pc-info-val">{selectedOrder.paymethod || 'Efectivo'}</div>
                          <div className="pc-info-sub">Total {fmtMoney(selectedOrder.realTotal)}</div>
                        </div>
                      </div>
                    </div>

                    {selectedOrder.voucher_url && (
                      <div className="pc-voucher" style={{ marginTop: 12 }}>
                        <img
                          src={selectedOrder.voucher_url}
                          alt="Comprobante"
                          title="Ampliar comprobante"
                          onClick={() => openImage(selectedOrder.voucher_url, 'Comprobante de depósito')}
                        />
                        <div style={{ flex: 1, minWidth: 180 }}>
                          <span className="pc-info-label" style={{ color: '#b45309' }}>Comprobante de depósito</span>
                          <div style={{ fontSize: 12.5, color: '#78350f', marginBottom: selectedOrder.status === 'Pendiente' ? 10 : 0 }}>
                            {selectedOrder.status === 'Pendiente'
                              ? 'El cliente adjuntó su comprobante. Verifícalo antes de aprobar.'
                              : 'Comprobante revisado.'}
                          </div>
                          {selectedOrder.status === 'Pendiente' && (
                            <button type="button" className="pc-btn-approve" onClick={() => handleApproveDeposit(selectedOrder.id_order)}>
                              <IconCheck size={13} sw={2.5} />
                              <span>Aprobar comprobante</span>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 2. Artículos */}
                  <div className="pc-section">
                    <div className="pc-section-label">
                      <span>2. Artículos del Pedido</span>
                      <small>{selectedOrder.items.length} artículo(s)</small>
                    </div>

                    {selectedOrder.items.map((item, idx) => {
                      const customData = parseCustomization(item.custom_image || item.image)
                      const isLegacyCustom = !customData && (
                        Boolean(item.custom_image && item.custom_image.startsWith('http')) ||
                        Boolean(item.name && item.name.toLowerCase().includes('personalizado'))
                      )
                      const finalImg = getItemPreviewImage(item)

                      return (
                        <div key={idx} className="pc-item">
                          <div className="pc-item-main">
                            <img
                              className="pc-item-thumb"
                              src={finalImg}
                              alt={item.name}
                              title="Ampliar vista"
                              onClick={() => {
                                if (customData?.views && customData.views.length > 1) {
                                  showViewsGalleryModal(customData.views, item.name)
                                } else {
                                  openImage(finalImg)
                                }
                              }}
                            />
                            <div style={{ minWidth: 0 }}>
                              <p className="pc-item-name">
                                <span>{item.name}</span>
                                {customData ? (
                                  <span className="pc-tag-3d"><IconLayers size={10} sw={2.2} />PERSONALIZADO 3D</span>
                                ) : isLegacyCustom ? (
                                  <span className="pc-tag-3d pc-tag-legacy">PERSONALIZADO</span>
                                ) : null}
                              </p>
                              <div className="pc-item-specs">
                                <span className="pc-spec">Talla <strong>{item.size}</strong></span>
                                <span className="pc-spec">Color <strong>{item.color}</strong></span>
                                <span className="pc-spec">Cant. <strong>{item.quantityOrders}</strong></span>
                              </div>
                            </div>
                            <div className="pc-item-price">
                              <strong>{fmtMoney(item.price * item.quantityOrders)}</strong>
                              <span>{item.quantityOrders} × {fmtMoney(item.price)}</span>
                            </div>
                          </div>

                          {/* Materiales de producción (pedidos 3D) */}
                          {customData && (
                            <div className="pc-prod">
                              <div className="pc-prod-head">
                                <span className="pc-prod-title"><IconLayers size={14} />Materiales para el taller</span>
                                {customData.zonesSummary && (
                                  <span className="pc-prod-zones">Zonas: <strong>{customData.zonesSummary}</strong></span>
                                )}
                              </div>

                              {customData.views && customData.views.length > 0 && (
                                <div className="pc-block">
                                  <div className="pc-block-label"><IconImage size={12} />Vistas de la prenda ({customData.views.length})</div>
                                  <div className="pc-views-grid">
                                    {customData.views.map((v, vIdx) => (
                                      <div
                                        key={vIdx}
                                        className="pc-view"
                                        title="Ampliar vista"
                                        onClick={() => openImage(v.image, `Vista: ${v.name || v.zone}`)}
                                      >
                                        <span>{v.name || v.zone}</span>
                                        <img src={v.image} alt={v.name || v.zone} />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {customData.customerLogos && customData.customerLogos.length > 0 && (
                                <div className="pc-block">
                                  <div className="pc-block-label"><IconDownload size={12} />Archivos originales del cliente ({customData.customerLogos.length})</div>
                                  <div className="pc-files-grid">
                                    {customData.customerLogos.map((logo, lIdx) => (
                                      <div key={lIdx} className="pc-file">
                                        <div className="pc-file-info">
                                          <img
                                            src={logo.url}
                                            alt={logo.name}
                                            className="pc-file-thumb"
                                            onClick={() => openImage(logo.url, logo.name)}
                                          />
                                          <div style={{ minWidth: 0 }}>
                                            <p className="pc-file-name" title={logo.name}>{logo.name || `Archivo ${lIdx + 1}`}</p>
                                            <p className="pc-file-meta">
                                              Zona: <strong>{logo.zoneName || logo.zone}</strong>
                                              {logo.sinFondo && <span className="pc-ok"> · Sin fondo</span>}
                                            </p>
                                          </div>
                                        </div>
                                        <a
                                          href={logo.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="pc-btn-dl"
                                          title="Abrir en resolución completa para descargar"
                                        >
                                          <IconDownload size={12} sw={2.2} />
                                          <span>Descargar</span>
                                        </a>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {customData.customerTexts && customData.customerTexts.length > 0 && (
                                <div className="pc-block">
                                  <div className="pc-block-label"><IconText size={12} />Textos personalizados ({customData.customerTexts.length})</div>
                                  {customData.customerTexts.map((txt, tIdx) => (
                                    <div key={tIdx} className="pc-text-row">
                                      <span
                                        className="pc-text-preview"
                                        style={{
                                          fontFamily: txt.font || 'inherit',
                                          color: txt.textColor || '#0f172a',
                                          background: isLightColor(txt.textColor) ? '#1e293b' : '#fff',
                                        }}
                                      >
                                        {txt.text}
                                      </span>
                                      <div className="pc-text-meta">
                                        <span className="pc-spec">Zona <strong>{txt.zoneName || txt.zone}</strong></span>
                                        <span className="pc-spec">Fuente <strong>{txt.font}</strong></span>
                                        <span className="pc-spec">
                                          <span className="pc-swatch" style={{ backgroundColor: txt.textColor }} />
                                          <strong>{txt.textColor}</strong>
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {customData.instructions && (
                                <div className="pc-block pc-notes">
                                  <IconNote size={14} style={{ marginTop: 1, color: '#92400e' }} />
                                  <div>
                                    <strong>Indicaciones del cliente</strong>
                                    <span>{customData.instructions}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Pedidos personalizados anteriores (solo captura) */}
                          {isLegacyCustom && (
                            <div className="pc-prod">
                              <div className="pc-prod-head">
                                <span className="pc-prod-title"><IconImage size={14} />Captura del diseño</span>
                                <span className="pc-prod-zones">Versión previa</span>
                              </div>
                              <div className="pc-file" style={{ marginTop: 8 }}>
                                <div className="pc-file-info">
                                  <img src={finalImg} alt="Diseño" className="pc-file-thumb" onClick={() => openImage(finalImg, 'Diseño')} />
                                  <div style={{ minWidth: 0 }}>
                                    <p className="pc-file-name">Captura de la prenda</p>
                                    <p className="pc-file-meta">Archivo registrado para el taller</p>
                                  </div>
                                </div>
                                <a href={finalImg} target="_blank" rel="noopener noreferrer" className="pc-btn-dl" title="Abrir en resolución completa">
                                  <IconDownload size={12} sw={2.2} />
                                  <span>Descargar</span>
                                </a>
                              </div>
                              <div className="pc-legacy-note">
                                <IconInfo size={14} style={{ marginTop: 1 }} />
                                <span>Este pedido se registró antes de la captura multi-ángulo. Los pedidos nuevos incluyen todas las vistas (frente, espalda, mangas) y los archivos originales por separado.</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* 3. Resumen */}
                  <div className="pc-section">
                    <div className="pc-section-label"><span>3. Resumen de Pago</span></div>
                    <div className="pc-summary">
                      <div className="pc-summary-row">
                        <span>Subtotal</span>
                        <span>{fmtMoney(selectedOrder.subtotal)}</span>
                      </div>
                      <div className="pc-summary-row">
                        <span>Costo de envío</span>
                        <span>{fmtMoney(selectedOrder.cost)}</span>
                      </div>
                      <div className="pc-summary-total">
                        <span>Total a pagar</span>
                        <strong>{fmtMoney(selectedOrder.realTotal)}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="pc-card-head"><span>Detalle del Pedido</span></div>
                <div className="pc-empty">
                  <div className="pc-empty-icon"><IconBag size={26} sw={1.6} /></div>
                  <strong>{loading ? 'Cargando…' : 'Ningún pedido seleccionado'}</strong>
                  {!loading && <span>Selecciona un pedido de la bandeja para ver su información y materiales de producción.</span>}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
