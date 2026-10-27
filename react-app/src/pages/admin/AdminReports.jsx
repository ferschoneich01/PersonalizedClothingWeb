import { useEffect, useMemo, useState } from 'react'
import { getSalesReport, getOrderDetails } from '../../api/ordersApi'
import Swal from 'sweetalert2'
import { parseCustomization, showViewsGalleryModal } from '../../utils/customizationHelper'

// ─────────────────────────────────────────────────────────────
// Canales de venta e Iconos SVG
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
const IconRefresh = (p) => (
  <Svg {...p}>
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </Svg>
)
const IconDownload = (p) => (
  <Svg {...p}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </Svg>
)
const IconPrinter = (p) => (
  <Svg {...p}>
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </Svg>
)
const IconSearch = (p) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </Svg>
)
const IconTrendingUp = (p) => (
  <Svg {...p}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </Svg>
)
const IconLayers = (p) => (
  <Svg {...p}>
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </Svg>
)
const IconCalendar = (p) => (
  <Svg {...p}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </Svg>
)

const CHANNELS = [
  { id: 1, label: 'Web', Icon: IconGlobe, bg: '#EFF1F5', text: '#374151', border: '#DADFE6' },
  { id: 2, label: 'WhatsApp', Icon: IconChat, bg: '#E4F5EA', text: '#1E7A45', border: '#BEE6CC' },
  { id: 3, label: 'Facebook', Icon: IconFacebook, bg: '#E7F0FC', text: '#1B5FB0', border: '#C7DEF7' },
  { id: 4, label: 'Instagram', Icon: IconInstagram, bg: '#FCEAF0', text: '#B0245A', border: '#F5C9DB' },
]

const STATUS_DOT = {
  'Pendiente': '#d97706',
  'En proceso': '#2563eb',
  'No enviado': '#dc2626',
  'Enviado': '#7c3aed',
  'Entregado': '#0d9488',
  'Terminado': '#64748b',
}

const getChannel = (id) => CHANNELS.find(c => c.id === Number(id)) || CHANNELS[0]

const fmtMoney = (n) =>
  `C$ ${Number(n || 0).toLocaleString('es-NI', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`

const fmtDate = (dStr) => {
  if (!dStr) return 'N/A'
  try {
    const d = new Date(dStr)
    if (isNaN(d.getTime())) return dStr
    return d.toLocaleDateString('es-NI', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dStr
  }
}

const isCustomItem = (it) => {
  const c = parseCustomization(it.custom_image || it.image)
  return Boolean(c) || Boolean(it.name && it.name.toLowerCase().includes('personalizado'))
}

export default function AdminReports() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [rawDetails, setRawDetails] = useState([])
  const [serverSummary, setServerSummary] = useState(null)

  // Filtros
  const [timePreset, setTimePreset] = useState('all') // 'all' | 'year' | 'month' | '30days' | '7days' | 'custom'
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [channelFilter, setChannelFilter] = useState('todos')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [customTypeFilter, setCustomTypeFilter] = useState('todos') // 'todos' | '3d' | 'catalog'
  const [categoryFilter, setCategoryFilter] = useState('todas')
  const [searchTerm, setSearchTerm] = useState('')

  // Paginación de tabla
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 12

  // Tooltip interactivo de gráfico
  const [chartHover, setChartHover] = useState(null)

  // Cargar datos
  const loadData = async () => {
    try {
      const res = await getSalesReport()
      if (res.data) {
        setRawDetails(res.data.details || [])
        setServerSummary(res.data)
      }
    } catch (err) {
      console.warn('Fallback a getOrderDetails:', err)
      try {
        const fall = await getOrderDetails()
        setRawDetails(fall.data || [])
      } catch (e) {
        console.error('Error cargando reportes:', e)
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    loadData()
  }

  // Agrupar filas de detalles en pedidos únicos con sus productos
  const allOrders = useMemo(() => {
    const map = {}
    rawDetails.forEach((row) => {
      const id = row.id_order
      if (!map[id]) {
        map[id] = {
          id_order: id,
          username: row.username,
          pedidoNombre: row.pedidoNombre || row.username,
          pedidoTelefono: row.pedidoTelefono || '',
          cedula: row.cedula || '',
          status: row.status || 'Pendiente',
          paymethod: row.paymethod || row.order_paymethod || 'Efectivo',
          id_canal_de_ventas: Number(row.id_canal_de_ventas) || 1,
          orderdate: row.orderdate || null,
          cost: parseFloat(row.cost || 0),
          items: [],
        }
      }
      map[id].items.push(row)
    })

    const list = Object.values(map)
    list.forEach((order) => {
      const subtotal = order.items.reduce((s, it) => s + (Number(it.price || 0) * Number(it.quantityOrders || 1)), 0)
      const itemsCount = order.items.reduce((s, it) => s + Number(it.quantityOrders || 1), 0)
      order.subtotal = subtotal
      order.totalAmount = subtotal + order.cost
      order.itemsCount = itemsCount
      order.has3D = order.items.some(isCustomItem)
      order.dateObj = order.orderdate ? new Date(order.orderdate) : null
    })

    // Ordenar de más reciente a más antiguo
    list.sort((a, b) => {
      if (a.dateObj && b.dateObj) return b.dateObj.getTime() - a.dateObj.getTime()
      return b.id_order - a.id_order
    })

    return list
  }, [rawDetails])

  // Lista única de categorías encontradas
  const availableCategories = useMemo(() => {
    const cats = new Set()
    rawDetails.forEach((d) => {
      if (d.category_name) cats.add(d.category_name)
    })
    return Array.from(cats).sort()
  }, [rawDetails])

  // Aplicar filtros de fecha, canal, estado, tipo y categoría
  const filteredOrders = useMemo(() => {
    const now = new Date()
    let minDate = null
    let maxDate = null

    if (timePreset === 'year') {
      minDate = new Date(now.getFullYear(), 0, 1)
    } else if (timePreset === 'month') {
      minDate = new Date(now.getFullYear(), now.getMonth(), 1)
    } else if (timePreset === '30days') {
      minDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    } else if (timePreset === '7days') {
      minDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    } else if (timePreset === 'today') {
      minDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    } else if (timePreset === 'custom') {
      if (customStart) minDate = new Date(customStart + 'T00:00:00')
      if (customEnd) maxDate = new Date(customEnd + 'T23:59:59')
    }

    return allOrders.filter((order) => {
      // Filtro de fecha
      if (minDate && order.dateObj && order.dateObj < minDate) return false
      if (maxDate && order.dateObj && order.dateObj > maxDate) return false

      // Filtro de canal
      if (channelFilter !== 'todos' && order.id_canal_de_ventas !== Number(channelFilter)) return false

      // Filtro de estado
      if (statusFilter !== 'todos' && order.status.toLowerCase() !== statusFilter.toLowerCase()) return false

      // Filtro de personalización 3D
      if (customTypeFilter === '3d' && !order.has3D) return false
      if (customTypeFilter === 'catalog' && order.has3D) return false

      // Filtro de categoría
      if (categoryFilter !== 'todas') {
        const matchesCat = order.items.some(
          it => (it.category_name || '').toLowerCase() === categoryFilter.toLowerCase()
        )
        if (!matchesCat) return false
      }

      // Filtro de búsqueda
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim()
        const matchId = String(order.id_order).includes(q)
        const matchName = (order.pedidoNombre || '').toLowerCase().includes(q)
        const matchTel = (order.pedidoTelefono || '').includes(q)
        const matchItem = order.items.some(it => (it.name || '').toLowerCase().includes(q))
        if (!matchId && !matchName && !matchTel && !matchItem) return false
      }

      return true
    })
  }, [allOrders, timePreset, customStart, customEnd, channelFilter, statusFilter, customTypeFilter, categoryFilter, searchTerm])

  // KPIs calculados
  const kpis = useMemo(() => {
    let totalSales = 0
    let deliveredSales = 0
    let pendingSales = 0
    let totalItems = 0
    let customOrdersCount = 0

    filteredOrders.forEach((o) => {
      totalSales += o.totalAmount
      totalItems += o.itemsCount
      if (['Entregado', 'Terminado'].includes(o.status)) {
        deliveredSales += o.totalAmount
      } else {
        pendingSales += o.totalAmount
      }
      if (o.has3D) customOrdersCount++
    })

    const totalOrders = filteredOrders.length
    const avgTicket = totalOrders > 0 ? totalSales / totalOrders : 0
    const customRatio = totalOrders > 0 ? (customOrdersCount / totalOrders) * 100 : 0

    return {
      totalSales,
      deliveredSales,
      pendingSales,
      totalOrders,
      totalItems,
      avgTicket,
      customOrdersCount,
      customRatio,
    }
  }, [filteredOrders])

  // Distribución por Canales de Venta
  const channelBreakdown = useMemo(() => {
    const map = { 1: 0, 2: 0, 3: 0, 4: 0 }
    const ordersMap = { 1: 0, 2: 0, 3: 0, 4: 0 }
    filteredOrders.forEach((o) => {
      const ch = o.id_canal_de_ventas || 1
      map[ch] = (map[ch] || 0) + o.totalAmount
      ordersMap[ch] = (ordersMap[ch] || 0) + 1
    })

    const total = kpis.totalSales || 1
    return CHANNELS.map((ch) => ({
      ...ch,
      sales: map[ch.id] || 0,
      orders: ordersMap[ch.id] || 0,
      percent: Math.round(((map[ch.id] || 0) / total) * 100),
    }))
  }, [filteredOrders, kpis.totalSales])

  // Distribución por Estados
  const statusBreakdown = useMemo(() => {
    const map = {}
    filteredOrders.forEach((o) => {
      map[o.status] = (map[o.status] || 0) + 1
    })
    const total = filteredOrders.length || 1
    return Object.keys(STATUS_DOT).map((s) => ({
      status: s,
      count: map[s] || 0,
      color: STATUS_DOT[s],
      percent: Math.round(((map[s] || 0) / total) * 100),
    }))
  }, [filteredOrders])

  // Distribución por Categoría de Prendas
  const categoryBreakdown = useMemo(() => {
    const map = {}
    filteredOrders.forEach((order) => {
      order.items.forEach((it) => {
        const cat = it.category_name || 'General'
        if (!map[cat]) map[cat] = { qty: 0, sales: 0 }
        map[cat].qty += Number(it.quantityOrders || 1)
        map[cat].sales += Number(it.price || 0) * Number(it.quantityOrders || 1)
      })
    })

    const list = Object.entries(map).map(([name, val]) => ({
      category: name,
      qty: val.qty,
      sales: val.sales,
    }))
    list.sort((a, b) => b.sales - a.sales)
    return list
  }, [filteredOrders])

  // Top 10 Productos Más Vendidos
  const topProducts = useMemo(() => {
    const map = {}
    filteredOrders.forEach((order) => {
      order.items.forEach((it) => {
        const key = it.id_item || it.name
        if (!map[key]) {
          map[key] = {
            id_item: it.id_item,
            name: it.name,
            image: it.image,
            category: it.category_name || 'General',
            qty: 0,
            revenue: 0,
            price: it.price,
          }
        }
        map[key].qty += Number(it.quantityOrders || 1)
        map[key].revenue += Number(it.price || 0) * Number(it.quantityOrders || 1)
      })
    })

    const list = Object.values(map)
    list.sort((a, b) => b.qty - a.qty)
    return list.slice(0, 8)
  }, [filteredOrders])

  // Métodos de Pago
  const paymentBreakdown = useMemo(() => {
    const map = {}
    filteredOrders.forEach((o) => {
      const m = o.paymethod || 'Efectivo'
      map[m] = (map[m] || 0) + o.totalAmount
    })
    return Object.entries(map).map(([m, s]) => ({
      method: m,
      sales: s,
      percent: Math.round((s / (kpis.totalSales || 1)) * 100),
    }))
  }, [filteredOrders, kpis.totalSales])

  // Serie de Tiempo para el Gráfico SVG
  const timeSeriesData = useMemo(() => {
    if (filteredOrders.length === 0) return []

    // Agrupar por mes o por día según rango
    const isDayBucket = ['today', '7days', '30days'].includes(timePreset)
    const map = {}

    filteredOrders.forEach((order) => {
      let key = 'Sin fecha'
      if (order.dateObj) {
        if (isDayBucket) {
          key = order.dateObj.toISOString().slice(0, 10)
        } else {
          key = order.dateObj.toISOString().slice(0, 7) // YYYY-MM
        }
      }
      if (!map[key]) {
        map[key] = { key, sales: 0, orders: 0, items: 0 }
      }
      map[key].sales += order.totalAmount
      map[key].orders += 1
      map[key].items += order.itemsCount
    })

    const list = Object.values(map)
    list.sort((a, b) => a.key.localeCompare(b.key))
    // Limitar a máximo 24 barras para mantener nitidez
    return list.length > 24 ? list.slice(-24) : list
  }, [filteredOrders, timePreset])

  // Paginación de pedidos en la tabla
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredOrders.slice(start, start + pageSize)
  }, [filteredOrders, currentPage])

  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1

  // Exportar a CSV / Excel con compatibilidad UTF-8 BOM
  const handleExportCSV = () => {
    if (filteredOrders.length === 0) {
      Swal.fire({ icon: 'info', title: 'Sin registros', text: 'No hay pedidos en el rango seleccionado para exportar.' })
      return
    }

    const headers = [
      'N.º Pedido',
      'Fecha y Hora',
      'Canal de Venta',
      'Cliente',
      'Cédula',
      'Teléfono',
      'Artículos / Prendas',
      'Tiene Personalización 3D',
      'Método de Pago',
      'Estado',
      'Costo Envío (C$)',
      'Total Pedido (C$)',
    ]

    const rows = filteredOrders.map((o) => {
      const itemsDesc = o.items.map(it => `${it.quantityOrders || 1}x ${it.name} (${it.size || 'U'}, ${it.color || 'Estándar'})`).join(' | ')
      const ch = getChannel(o.id_canal_de_ventas)
      return [
        `#${o.id_order}`,
        `"${fmtDate(o.orderdate)}"`,
        `"${ch.label}"`,
        `"${(o.pedidoNombre || o.username || '').replace(/"/g, '""')}"`,
        `"${o.cedula || ''}"`,
        `"${o.pedidoTelefono || ''}"`,
        `"${itemsDesc.replace(/"/g, '""')}"`,
        o.has3D ? 'SÍ' : 'NO',
        `"${o.paymethod}"`,
        `"${o.status}"`,
        Number(o.cost || 0).toFixed(2),
        Number(o.totalAmount || 0).toFixed(2),
      ].join(',')
    })

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const filename = `reporte_ventas_personalized_clothing_${new Date().toISOString().slice(0, 10)}.csv`
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    Swal.fire({
      icon: 'success',
      title: 'Reporte Exportado',
      text: `Se descargó "${filename}" con ${filteredOrders.length} registros.`,
      timer: 2000,
      showConfirmButton: false,
    })
  }

  // Imprimir informe ejecutivo profesional
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="pc-admin">
      <style>{`
        .pc-admin {
          --pc-ink: #0f172a;
          --pc-ink-2: #1e293b;
          --pc-slate-700: #334155;
          --pc-slate-500: #64748b;
          --pc-slate-400: #94a3b8;
          --pc-slate-300: #cbd5e1;
          --pc-slate-200: #e2e8f0;
          --pc-slate-100: #f1f5f9;
          --pc-slate-50:  #f8fafc;
          --pc-brand: #10b981;
          --pc-brand-dark: #059669;
          --pc-brand-soft: #ecfdf5;
          --pc-brand-border: #a7f3d0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          color: var(--pc-ink);
          max-width: 1700px;
          margin: 0 auto;
          padding: 18px 24px 60px;
        }

        /* ── Encabezado de página ── */
        .pc-page-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }
        .pc-eyebrow {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }
        .pc-pill-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 3px 9px;
          border-radius: 999px;
          background: #ecfdf5;
          color: #059669;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border: 1px solid #a7f3d0;
        }
        .pc-live-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.25);
        }
        .pc-eyebrow-desc {
          font-size: 12px;
          color: var(--pc-slate-500);
          font-weight: 500;
        }
        .pc-title {
          font-size: 26px;
          font-weight: 800;
          color: var(--pc-ink);
          margin: 0 0 4px;
          letter-spacing: -0.5px;
        }
        .pc-subtitle {
          font-size: 13.5px;
          color: var(--pc-slate-500);
          margin: 0;
          max-width: 780px;
        }

        .pc-head-actions {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .pc-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: var(--pc-ink);
          color: #ffffff;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all 0.15s ease;
          box-shadow: 0 2px 4px rgba(15, 23, 42, 0.12);
        }
        .pc-btn-primary:hover {
          background: #1e293b;
          transform: translateY(-1px);
        }
        .pc-btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #ffffff;
          color: var(--pc-slate-700);
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          border: 1px solid var(--pc-slate-300);
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .pc-btn-ghost:hover {
          background: var(--pc-slate-50);
          border-color: var(--pc-slate-400);
          color: var(--pc-ink);
        }
        .pc-btn-ghost:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* ── Barra de Filtros ── */
        .pc-filters-card {
          background: #ffffff;
          border: 1px solid var(--pc-slate-200);
          border-radius: 12px;
          padding: 14px 18px;
          margin-bottom: 20px;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
        }
        .pc-filter-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }
        .pc-presets {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: var(--pc-slate-100);
          padding: 3px;
          border-radius: 8px;
          flex-wrap: wrap;
        }
        .pc-preset-btn {
          background: transparent;
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          color: var(--pc-slate-700);
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .pc-preset-btn.is-active {
          background: #ffffff;
          color: var(--pc-ink);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
          font-weight: 700;
        }
        .pc-subfilters {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .pc-select {
          height: 34px;
          border: 1px solid var(--pc-slate-300);
          border-radius: 7px;
          padding: 0 10px;
          font-size: 12.5px;
          color: var(--pc-ink);
          background: #ffffff;
          font-weight: 500;
          cursor: pointer;
        }
        .pc-date-input {
          height: 34px;
          border: 1px solid var(--pc-slate-300);
          border-radius: 7px;
          padding: 0 10px;
          font-size: 12px;
          color: var(--pc-ink);
          background: #ffffff;
        }

        /* ── Tarjetas KPI ── */
        .pc-kpi-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 14px;
          margin-bottom: 20px;
        }
        .pc-kpi-card {
          background: #ffffff;
          border: 1px solid var(--pc-slate-200);
          border-radius: 12px;
          padding: 16px 18px;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
          position: relative;
          overflow: hidden;
        }
        .pc-kpi-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: #e2e8f0;
        }
        .pc-kpi-card.accent-green::before { background: #10b981; }
        .pc-kpi-card.accent-blue::before { background: #2563eb; }
        .pc-kpi-card.accent-purple::before { background: #7c3aed; }
        .pc-kpi-card.accent-amber::before { background: #d97706; }
        .pc-kpi-card.accent-emerald::before { background: #059669; }

        .pc-kpi-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .pc-kpi-label {
          font-size: 12px;
          font-weight: 700;
          color: var(--pc-slate-500);
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }
        .pc-kpi-icon {
          width: 26px;
          height: 26px;
          border-radius: 6px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: var(--pc-slate-100);
          color: var(--pc-slate-700);
        }
        .pc-kpi-value {
          font-size: 24px;
          font-weight: 800;
          color: var(--pc-ink);
          letter-spacing: -0.5px;
          line-height: 1.1;
          margin-bottom: 6px;
        }
        .pc-kpi-sub {
          font-size: 11.5px;
          color: var(--pc-slate-500);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        /* ── Grid Principal de Dashboard ── */
        .pc-dash-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 16px;
          margin-bottom: 20px;
        }
        .pc-dash-card {
          background: #ffffff;
          border: 1px solid var(--pc-slate-200);
          border-radius: 12px;
          padding: 18px 20px;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
        }
        .pc-dash-title {
          font-size: 15px;
          font-weight: 700;
          color: var(--pc-ink);
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .pc-dash-subtitle {
          font-size: 12px;
          color: var(--pc-slate-500);
          margin-bottom: 16px;
        }

        /* ── Gráfico SVG Interactivo ── */
        .pc-chart-wrap {
          width: 100%;
          overflow-x: auto;
          position: relative;
        }
        .pc-chart-svg {
          width: 100%;
          min-width: 480px;
          height: 230px;
          display: block;
        }
        .pc-chart-bar {
          transition: opacity 0.2s ease, fill 0.2s ease;
          cursor: pointer;
        }
        .pc-chart-bar:hover {
          fill: #059669 !important;
          opacity: 1 !important;
        }
        .pc-chart-tooltip {
          position: absolute;
          top: 10px;
          right: 14px;
          background: rgba(15, 23, 42, 0.94);
          color: #ffffff;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 11.5px;
          pointer-events: none;
          backdrop-filter: blur(4px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        /* ── Canales de Venta Bars ── */
        .pc-channel-row {
          margin-bottom: 12px;
        }
        .pc-channel-row-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12.5px;
          font-weight: 600;
          margin-bottom: 4px;
        }
        .pc-channel-badge-wrap {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .pc-channel-progress {
          height: 8px;
          background: var(--pc-slate-100);
          border-radius: 999px;
          overflow: hidden;
          display: flex;
        }
        .pc-channel-progress-bar {
          height: 100%;
          border-radius: 999px;
          transition: width 0.4s ease;
        }

        /* ── Segunda Fila del Dashboard (Top Productos y Categorías) ── */
        .pc-dash-row-2 {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 16px;
          margin-bottom: 20px;
        }
        .pc-top-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12.5px;
        }
        .pc-top-table th {
          text-align: left;
          font-size: 11px;
          font-weight: 700;
          color: var(--pc-slate-500);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 8px 10px;
          border-bottom: 1px solid var(--pc-slate-200);
        }
        .pc-top-table td {
          padding: 10px 10px;
          border-bottom: 1px solid var(--pc-slate-100);
          vertical-align: middle;
        }
        .pc-product-cell {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .pc-prod-thumb {
          width: 36px;
          height: 36px;
          border-radius: 6px;
          object-fit: cover;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          flex-shrink: 0;
        }
        .pc-prod-title {
          font-weight: 600;
          color: var(--pc-ink);
          line-height: 1.2;
          max-width: 240px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .pc-prod-cat {
          font-size: 11px;
          color: var(--pc-slate-500);
        }

        /* ── Tabla Principal de Auditoría ── */
        .pc-table-card {
          background: #ffffff;
          border: 1px solid var(--pc-slate-200);
          border-radius: 12px;
          padding: 18px 20px;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
        }
        .pc-table-head-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 14px;
        }
        .pc-search-box {
          position: relative;
          min-width: 280px;
        }
        .pc-search-box input {
          width: 100%;
          height: 36px;
          padding: 0 12px 0 34px;
          border: 1px solid var(--pc-slate-300);
          border-radius: 8px;
          font-size: 12.5px;
          color: var(--pc-ink);
        }
        .pc-search-box svg {
          position: absolute;
          left: 10px;
          top: 11px;
          color: var(--pc-slate-400);
        }

        .pc-report-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }
        .pc-report-table th {
          text-align: left;
          font-size: 11px;
          font-weight: 700;
          color: var(--pc-slate-500);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 10px 12px;
          background: var(--pc-slate-50);
          border-top: 1px solid var(--pc-slate-200);
          border-bottom: 1px solid var(--pc-slate-200);
        }
        .pc-report-table td {
          padding: 11px 12px;
          border-bottom: 1px solid var(--pc-slate-100);
          color: var(--pc-slate-700);
          vertical-align: middle;
        }
        .pc-report-table tr:hover td {
          background: #f8fafc;
        }
        .pc-order-tag {
          font-weight: 700;
          color: var(--pc-ink);
          font-variant-numeric: tabular-nums;
        }
        .pc-client-cell {
          font-weight: 600;
          color: var(--pc-ink);
          line-height: 1.2;
        }
        .pc-client-sub {
          font-size: 11px;
          color: var(--pc-slate-500);
          font-weight: 400;
        }
        .pc-badge-channel {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          border: 1px solid;
        }
        .pc-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 2px 8px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 600;
          background: var(--pc-slate-100);
        }
        .pc-badge-3d {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 6px;
          border-radius: 4px;
          background: #f3e8ff;
          color: #7e22ce;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.3px;
        }

        /* ── Paginador ── */
        .pc-pagination {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 14px;
          margin-top: 8px;
          border-top: 1px solid var(--pc-slate-200);
          font-size: 12.5px;
          color: var(--pc-slate-500);
        }
        .pc-page-buttons {
          display: inline-flex;
          gap: 6px;
        }
        .pc-page-btn {
          height: 30px;
          padding: 0 12px;
          border-radius: 6px;
          border: 1px solid var(--pc-slate-300);
          background: #ffffff;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }
        .pc-page-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        /* ── Animación Giro ── */
        @keyframes pc-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* ── Estilos para Impresión Ejecutiva / PDF ── */
        @media print {
          body {
            background: #ffffff !important;
            color: #000000 !important;
          }
          header, .site-header, .pc-admin-subnav-wrap, .pc-head-actions, .pc-filters-card, .pc-pagination, .pc-search-box {
            display: none !important;
          }
          .pc-admin {
            padding: 0 !important;
            max-width: 100% !important;
          }
          .pc-dash-grid, .pc-dash-row-2 {
            display: block !important;
          }
          .pc-dash-card, .pc-table-card, .pc-kpi-card {
            border: 1px solid #ccc !important;
            box-shadow: none !important;
            margin-bottom: 12px !important;
            page-break-inside: avoid;
          }
          .pc-kpi-grid {
            grid-template-columns: repeat(5, 1fr) !important;
            gap: 8px !important;
          }
          .pc-chart-wrap {
            display: none !important;
          }
        }

        /* ── Responsive ── */
        @media (max-width: 1200px) {
          .pc-kpi-grid { grid-template-columns: repeat(3, 1fr); }
          .pc-dash-grid { grid-template-columns: 1fr; }
          .pc-dash-row-2 { grid-template-columns: 1fr; }
        }
        @media (max-width: 768px) {
          .pc-kpi-grid { grid-template-columns: 1fr 1fr; }
          .pc-filter-row { flex-direction: column; align-items: stretch; }
          .pc-presets { width: 100%; justify-content: center; }
          .pc-subfilters { width: 100%; }
          .pc-subfilters select, .pc-subfilters input { flex: 1; }
          .pc-report-table { display: block; overflow-x: auto; }
        }
      `}</style>

      {/* ═══════════ ENCABEZADO ═══════════ */}
      <div className="pc-page-head">
        <div>
          <div className="pc-eyebrow">
            <span className="pc-pill-tag">
              <span className="pc-live-dot" />
              <span>Reportes & Dashboard</span>
            </span>
            <span className="pc-eyebrow-desc">• Analítica y control comercial</span>
          </div>
          <h1 className="pc-title">Dashboard de Ventas y Reportes</h1>
          <p className="pc-subtitle">
            Monitorea los ingresos netos, pedidos por canal comercial, prendas más vendidas y genera reportes ejecutivos.
          </p>
        </div>

        <div className="pc-head-actions">
          <button
            type="button"
            className="pc-btn-primary"
            onClick={handleExportCSV}
            title="Exportar archivo CSV compatible con Excel"
          >
            <IconDownload size={14} sw={2.2} />
            <span>Exportar Excel (CSV)</span>
          </button>
          <button
            type="button"
            className="pc-btn-ghost"
            onClick={handlePrint}
            title="Imprimir o guardar reporte en PDF"
          >
            <IconPrinter size={14} sw={2.2} />
            <span>Imprimir / PDF</span>
          </button>
          <button
            type="button"
            className="pc-btn-ghost"
            onClick={handleRefresh}
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

      {/* ═══════════ FILTROS Y PERÍODOS ═══════════ */}
      <div className="pc-filters-card">
        <div className="pc-filter-row">
          {/* Presets de Tiempo */}
          <div className="pc-presets" role="tablist" aria-label="Rango de fecha">
            {[
              { id: 'all', label: 'Histórico' },
              { id: 'year', label: 'Año 2026' },
              { id: 'month', label: 'Este Mes' },
              { id: '30days', label: 'Últimos 30 días' },
              { id: '7days', label: 'Últimos 7 días' },
              { id: 'today', label: 'Hoy' },
              { id: 'custom', label: 'Personalizado' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                className={`pc-preset-btn${timePreset === p.id ? ' is-active' : ''}`}
                onClick={() => {
                  setTimePreset(p.id)
                  setCurrentPage(1)
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Subfiltros desplegables */}
          <div className="pc-subfilters">
            {timePreset === 'custom' && (
              <>
                <input
                  type="date"
                  className="pc-date-input"
                  value={customStart}
                  onChange={(e) => { setCustomStart(e.target.value); setCurrentPage(1) }}
                  title="Fecha inicial"
                />
                <span style={{ fontSize: '12px', color: '#64748b' }}>hasta</span>
                <input
                  type="date"
                  className="pc-date-input"
                  value={customEnd}
                  onChange={(e) => { setCustomEnd(e.target.value); setCurrentPage(1) }}
                  title="Fecha final"
                />
              </>
            )}

            {/* Canal */}
            <select
              className="pc-select"
              value={channelFilter}
              onChange={(e) => { setChannelFilter(e.target.value); setCurrentPage(1) }}
              aria-label="Filtrar por canal"
            >
              <option value="todos">Todos los Canales</option>
              {CHANNELS.map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>

            {/* Estado */}
            <select
              className="pc-select"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1) }}
              aria-label="Filtrar por estado"
            >
              <option value="todos">Todos los Estados</option>
              {Object.keys(STATUS_DOT).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            {/* Tipo */}
            <select
              className="pc-select"
              value={customTypeFilter}
              onChange={(e) => { setCustomTypeFilter(e.target.value); setCurrentPage(1) }}
              aria-label="Filtrar por tipo"
            >
              <option value="todos">Todos los tipos</option>
              <option value="3d">Solo Personalizado 3D</option>
              <option value="catalog">Solo Catálogo</option>
            </select>

            {/* Categoría */}
            {availableCategories.length > 0 && (
              <select
                className="pc-select"
                value={categoryFilter}
                onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1) }}
                aria-label="Filtrar por categoría"
              >
                <option value="todas">Todas las Categorías</option>
                {availableCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════ TARJETAS KPI RESUMEN ═══════════ */}
      <div className="pc-kpi-grid">
        {/* KPI 1: Ingresos Totales */}
        <div className="pc-kpi-card accent-green">
          <div className="pc-kpi-header">
            <span className="pc-kpi-label">Ingresos Totales</span>
            <div className="pc-kpi-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
              <IconTrendingUp size={15} sw={2.3} />
            </div>
          </div>
          <div className="pc-kpi-value">{fmtMoney(kpis.totalSales)}</div>
          <div className="pc-kpi-sub">
            <span style={{ color: '#059669', fontWeight: '700' }}>{fmtMoney(kpis.deliveredSales)}</span> cobrado
          </div>
        </div>

        {/* KPI 2: Total Pedidos */}
        <div className="pc-kpi-card accent-blue">
          <div className="pc-kpi-header">
            <span className="pc-kpi-label">Total Pedidos</span>
            <div className="pc-kpi-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
              <Svg size={14}><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /></Svg>
            </div>
          </div>
          <div className="pc-kpi-value">{kpis.totalOrders}</div>
          <div className="pc-kpi-sub">
            <span>{filteredOrders.filter(o => ['Entregado', 'Terminado'].includes(o.status)).length} completados</span>
          </div>
        </div>

        {/* KPI 3: Ticket Promedio */}
        <div className="pc-kpi-card accent-purple">
          <div className="pc-kpi-header">
            <span className="pc-kpi-label">Ticket Promedio</span>
            <div className="pc-kpi-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
              <Svg size={14}><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></Svg>
            </div>
          </div>
          <div className="pc-kpi-value">{fmtMoney(kpis.avgTicket)}</div>
          <div className="pc-kpi-sub">
            <span>Promedio por orden de venta</span>
          </div>
        </div>

        {/* KPI 4: Prendas Vendidas */}
        <div className="pc-kpi-card accent-amber">
          <div className="pc-kpi-header">
            <span className="pc-kpi-label">Prendas Vendidas</span>
            <div className="pc-kpi-icon" style={{ background: '#fffbeb', color: '#d97706' }}>
              <Svg size={14}><path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z" /></Svg>
            </div>
          </div>
          <div className="pc-kpi-value">{kpis.totalItems}</div>
          <div className="pc-kpi-sub">
            <span>Unidades despachadas</span>
          </div>
        </div>

        {/* KPI 5: Pedidos Personalizados 3D */}
        <div className="pc-kpi-card accent-emerald">
          <div className="pc-kpi-header">
            <span className="pc-kpi-label">Personalizados 3D</span>
            <div className="pc-kpi-icon" style={{ background: '#fdf4ff', color: '#c026d3' }}>
              <IconLayers size={14} sw={2.2} />
            </div>
          </div>
          <div className="pc-kpi-value">{kpis.customOrdersCount}</div>
          <div className="pc-kpi-sub">
            <span style={{ color: '#7e22ce', fontWeight: '700' }}>{Math.round(kpis.customRatio)}%</span> del total de pedidos
          </div>
        </div>
      </div>

      {/* ═══════════ GRÁFICOS INTERACTIVOS (FILA 1) ═══════════ */}
      <div className="pc-dash-grid">
        {/* Gráfico 1: Evolución de Ventas en el Tiempo */}
        <div className="pc-dash-card">
          <div className="pc-dash-title">
            <span>Evolución Histórica de Ventas</span>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>
              {timeSeriesData.length} períodos registrados
            </span>
          </div>
          <div className="pc-dash-subtitle">
            Ingresos generados (C$) y volumen de pedidos a través del tiempo.
          </div>

          <div className="pc-chart-wrap">
            {timeSeriesData.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8', fontSize: '13px' }}>
                No hay ventas registradas para este período.
              </div>
            ) : (
              (() => {
                const maxVal = Math.max(...timeSeriesData.map(d => d.sales), 1000)
                const chartH = 160
                const chartW = Math.max(500, timeSeriesData.length * 36)
                const barW = Math.max(12, Math.min(28, (chartW / timeSeriesData.length) - 8))

                return (
                  <svg className="pc-chart-svg" viewBox={`0 0 ${chartW} 220`}>
                    {/* Líneas guía de fondo */}
                    {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                      const y = 180 - pct * chartH
                      return (
                        <g key={idx}>
                          <line x1="0" y1={y} x2={chartW} y2={y} stroke="#e2e8f0" strokeDasharray="3 3" />
                          <text x="0" y={y - 4} fontSize="9" fill="#94a3b8">
                            {fmtMoney(maxVal * pct)}
                          </text>
                        </g>
                      )
                    })}

                    {/* Barras */}
                    {timeSeriesData.map((d, i) => {
                      const barH = (d.sales / maxVal) * chartH
                      const x = (i * (chartW / timeSeriesData.length)) + 16
                      const y = 180 - barH
                      const isHovered = chartHover?.key === d.key

                      return (
                        <g
                          key={d.key}
                          onMouseEnter={() => setChartHover(d)}
                          onMouseLeave={() => setChartHover(null)}
                        >
                          <rect
                            className="pc-chart-bar"
                            x={x}
                            y={y}
                            width={barW}
                            height={Math.max(4, barH)}
                            rx="4"
                            fill={isHovered ? '#059669' : '#10b981'}
                            opacity={isHovered ? 1 : 0.85}
                          />
                          {/* Etiqueta X */}
                          <text
                            x={x + barW / 2}
                            y="200"
                            fontSize="9"
                            fill="#64748b"
                            textAnchor="middle"
                            fontWeight="500"
                          >
                            {d.key.slice(-5)}
                          </text>
                        </g>
                      )
                    })}
                  </svg>
                )
              })()
            )}

            {/* Tooltip de barra */}
            {chartHover && (
              <div className="pc-chart-tooltip">
                <strong>{chartHover.key}</strong>
                <div>Ingresos: <strong>{fmtMoney(chartHover.sales)}</strong></div>
                <div>{chartHover.orders} pedidos · {chartHover.items} prendas</div>
              </div>
            )}
          </div>
        </div>

        {/* Gráfico 2: Ventas por Canal */}
        <div className="pc-dash-card">
          <div className="pc-dash-title">
            <span>Ventas por Canal</span>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>Distribución</span>
          </div>
          <div className="pc-dash-subtitle">
            Participación de mercado por origen comercial.
          </div>

          <div>
            {channelBreakdown.map((ch) => (
              <div key={ch.id} className="pc-channel-row">
                <div className="pc-channel-row-head">
                  <div className="pc-channel-badge-wrap">
                    <span
                      style={{
                        display: 'inline-flex',
                        padding: '3px',
                        borderRadius: '4px',
                        background: ch.bg,
                        color: ch.text,
                        border: `1px solid ${ch.border}`,
                      }}
                    >
                      <ch.Icon size={12} />
                    </span>
                    <span style={{ color: ch.text, fontWeight: '700' }}>{ch.label}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ color: '#0f172a', fontWeight: '700' }}>{fmtMoney(ch.sales)}</span>
                    <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '6px' }}>
                      ({ch.orders} ped. · {ch.percent}%)
                    </span>
                  </div>
                </div>
                <div className="pc-channel-progress">
                  <div
                    className="pc-channel-progress-bar"
                    style={{
                      width: `${ch.percent}%`,
                      background: ch.id === 1 ? '#475569' : ch.id === 2 ? '#10b981' : ch.id === 3 ? '#2563eb' : '#db2777',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Desglose de Métodos de Pago */}
          <div style={{ marginTop: '22px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a', display: 'block', marginBottom: '8px' }}>
              Métodos de Pago Utilizados:
            </span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {paymentBreakdown.map((pm, idx) => (
                <div
                  key={idx}
                  style={{
                    flex: '1',
                    background: '#f8fafc',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontSize: '11.5px',
                  }}
                >
                  <div style={{ color: '#64748b' }}>{pm.method}</div>
                  <strong style={{ color: '#0f172a', fontSize: '13px' }}>{fmtMoney(pm.sales)}</strong>
                  <div style={{ fontSize: '10.5px', color: '#10b981', fontWeight: '600' }}>{pm.percent}% del total</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════ FILA 2: TOP PRODUCTOS Y CATEGORÍAS ═══════════ */}
      <div className="pc-dash-row-2">
        {/* Top Productos */}
        <div className="pc-dash-card">
          <div className="pc-dash-title">
            <span>Productos Más Vendidos</span>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>Top Ranking</span>
          </div>
          <div className="pc-dash-subtitle">
            Artículos con mayor volumen de unidades vendidas y recaudación.
          </div>

          <table className="pc-top-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Producto</th>
                <th>Categoría</th>
                <th style={{ textAlign: 'center' }}>Unidades</th>
                <th style={{ textAlign: 'right' }}>Ingresos</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                    No hay productos vendidos en este rango.
                  </td>
                </tr>
              ) : (
                topProducts.map((p, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: '800', color: idx < 3 ? '#10b981' : '#94a3b8' }}>
                      {idx + 1}
                    </td>
                    <td>
                      <div className="pc-product-cell">
                        <img
                          src={p.image || 'https://via.placeholder.com/60'}
                          alt={p.name}
                          className="pc-prod-thumb"
                        />
                        <div>
                          <div className="pc-prod-title" title={p.name}>{p.name}</div>
                          <div className="pc-prod-cat">{fmtMoney(p.price)} unitario</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ textTransform: 'capitalize', color: '#475569', fontWeight: '500' }}>
                        {p.category}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: '700', color: '#0f172a' }}>
                      {p.qty}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: '800', color: '#0f172a' }}>
                      {fmtMoney(p.revenue)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Ventas por Categoría y Estados */}
        <div className="pc-dash-card">
          <div className="pc-dash-title">
            <span>Ventas por Familia / Categoría</span>
          </div>
          <div className="pc-dash-subtitle">
            Rendimiento por tipo de prenda de vestir.
          </div>

          <div style={{ marginBottom: '20px' }}>
            {categoryBreakdown.map((cat, idx) => {
              const maxCat = Math.max(...categoryBreakdown.map(c => c.sales), 1)
              const pct = Math.round((cat.sales / maxCat) * 100)
              return (
                <div key={idx} style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '3px' }}>
                    <strong style={{ textTransform: 'capitalize', color: '#1e293b' }}>{cat.category}</strong>
                    <span>{fmtMoney(cat.sales)} ({cat.qty} uds.)</span>
                  </div>
                  <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: '#3b82f6', borderRadius: '4px' }} />
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a', display: 'block', marginBottom: '8px' }}>
              Balance por Estado de Órdenes:
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {statusBreakdown.map((st, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 10px',
                    background: '#f8fafc',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    fontSize: '11.5px',
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: st.color }} />
                    <span style={{ color: '#334155' }}>{st.status}</span>
                  </span>
                  <strong style={{ color: '#0f172a' }}>{st.count}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════ TABLA DETALLADA DE REPORTES ═══════════ */}
      <div className="pc-table-card">
        <div className="pc-table-head-bar">
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
              Auditoría y Registro Detallado de Ventas
            </h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              {filteredOrders.length} pedidos encontrados con los filtros activos.
            </span>
          </div>

          <div className="pc-search-box">
            <IconSearch size={14} />
            <input
              type="text"
              placeholder="Buscar por cliente, n.º orden, teléfono..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
            />
          </div>
        </div>

        <table className="pc-report-table">
          <thead>
            <tr>
              <th># Pedido</th>
              <th>Fecha</th>
              <th>Canal</th>
              <th>Cliente</th>
              <th>Prendas / Artículos</th>
              <th>Pago</th>
              <th>Estado</th>
              <th style={{ textAlign: 'right' }}>Total (C$)</th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrders.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  No se encontraron ventas para los criterios seleccionados.
                </td>
              </tr>
            ) : (
              paginatedOrders.map((o) => {
                const ch = getChannel(o.id_canal_de_ventas)
                return (
                  <tr key={o.id_order}>
                    <td>
                      <span className="pc-order-tag">#{o.id_order}</span>
                    </td>
                    <td style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>
                      {fmtDate(o.orderdate)}
                    </td>
                    <td>
                      <span
                        className="pc-badge-channel"
                        style={{ background: ch.bg, color: ch.text, borderColor: ch.border }}
                      >
                        <ch.Icon size={11} />
                        <span>{ch.label}</span>
                      </span>
                    </td>
                    <td>
                      <div className="pc-client-cell">{o.pedidoNombre}</div>
                      {o.pedidoTelefono && <div className="pc-client-sub">{o.pedidoTelefono}</div>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '12px', fontWeight: '600' }}>
                          {o.itemsCount} {o.itemsCount === 1 ? 'prenda' : 'prendas'}
                        </span>
                        {o.has3D && (
                          <span className="pc-badge-3d">
                            <IconLayers size={10} sw={2.4} /> 3D
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {o.items.map(it => it.name).join(', ')}
                      </div>
                    </td>
                    <td style={{ fontSize: '12px' }}>
                      {o.paymethod}
                    </td>
                    <td>
                      <span className="pc-status-pill">
                        <span
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: STATUS_DOT[o.status] || '#94a3b8',
                          }}
                        />
                        <span>{o.status}</span>
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: '800', color: '#0f172a' }}>
                      {fmtMoney(o.totalAmount)}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>

        {/* Paginador */}
        <div className="pc-pagination">
          <span>
            Página {currentPage} de {totalPages} (Mostrando {paginatedOrders.length} de {filteredOrders.length} registros)
          </span>
          <div className="pc-page-buttons">
            <button
              type="button"
              className="pc-page-btn"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            >
              Anterior
            </button>
            <button
              type="button"
              className="pc-page-btn"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
