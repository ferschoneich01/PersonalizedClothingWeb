import { Navigate, Outlet, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ADMIN_TABS = [
  {
    to: '/admin/orders',
    label: 'Pedidos',
    sublabel: 'Producción y despacho',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
  {
    to: '/admin/shippings',
    label: 'Envíos',
    sublabel: 'Pedidos en ruta',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="1" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
  {
    to: '/admin/addItem',
    label: 'Productos',
    sublabel: 'Agregar y editar catálogo',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    ),
  },
  {
    to: '/admin/categories',
    label: 'Categorías',
    sublabel: 'Familias de prendas',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    to: '/admin/reports',
    label: 'Reportes y Dashboard',
    sublabel: 'Métricas y balance',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
]

export default function AdminRoute() {
  const { isAuthenticated, isAdmin } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="pc-admin-shell">
      <div className="pc-admin-subnav-wrap">
        <div className="pc-admin-subnav">
          <div className="pc-admin-subnav-brand">
            <span className="pc-admin-subnav-kicker">Panel de Administración</span>
          </div>

          <nav className="pc-admin-tabs" aria-label="Módulos de administración">
            {ADMIN_TABS.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                className={({ isActive }) =>
                  `pc-admin-tab${isActive ? ' is-active' : ''}`
                }
              >
                <span className="pc-admin-tab-icon">{tab.icon}</span>
                <span className="pc-admin-tab-text">
                  <span className="pc-admin-tab-label">{tab.label}</span>
                  <span className="pc-admin-tab-sub">{tab.sublabel}</span>
                </span>
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      <Outlet />
    </div>
  )
}
