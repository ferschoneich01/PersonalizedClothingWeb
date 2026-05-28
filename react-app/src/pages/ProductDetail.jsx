import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getItemById, getItemsByCategory } from '../api/itemsApi'
import { useCart } from '../context/CartContext'
import ItemCard from '../components/ItemCard'
import Swal from 'sweetalert2'

const SIZES  = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
const COLORS = [
  { label: 'Negro',  hex: '#1a1a1a' },
  { label: 'Blanco', hex: '#f5f5f5' },
  { label: 'Gris',   hex: '#9e9e9e' },
  { label: 'Azul',   hex: '#1565c0' },
  { label: 'Rojo',   hex: '#c62828' },
  { label: 'Verde',  hex: '#2e7d32' },
]

function normalizeItem(data) {
  if (!data) return null
  const d = Array.isArray(data) ? data[0] : data
  return {
    id_item:      d.id_item      ?? d[0],
    name:         d.name         ?? d[1],
    description:  d.description  ?? d[2] ?? '100% algodón.',
    image:        d.image        ?? d[3],
    price:        d.price        ?? d[4],
    clasification: d.clasification ?? d[5],
    category:     d.category     ?? d[6],
  }
}

export default function ProductDetail() {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const { addToCart } = useCart()

  const [item, setItem]       = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [imgLoaded, setImgLoaded] = useState(false)

  const [quantity, setQuantity] = useState(1)
  const [size, setSize]         = useState('M')
  const [color, setColor]       = useState('Negro')

  // Carga el producto principal
  useEffect(() => {
    if (!id) return
    setLoading(true)
    setImgLoaded(false)
    getItemById(id)
      .then((res) => {
        const normalized = normalizeItem(res.data)
        setItem(normalized)
        // Carga productos relacionados por misma categoría y clasificación
        if (normalized?.category && normalized?.clasification) {
          return getItemsByCategory(normalized.category, normalized.clasification)
            .then((r) => {
              const others = r.data.filter(
                (x) => (x.id_item ?? x[0]) !== normalized.id_item
              )
              setRelated(others.slice(0, 4))
            })
        }
      })
      .catch((err) => console.error('Error fetching product:', err))
      .finally(() => setLoading(false))
  }, [id])

  const handleAddToCart = (e) => {
    e.preventDefault()
    addToCart({ ...item, quantity: Number(quantity), size, color })
    Swal.fire({
      icon: 'success',
      title: '¡Añadido!',
      text: `${item.name} — Talla ${size}, ${color}`,
      timer: 1600,
      showConfirmButton: false,
    })
  }

  // ── Loading ──
  if (loading) return (
    <div className="pd-loading">
      <div className="loading-spinner"></div>
      <p>Cargando producto...</p>
    </div>
  )

  if (!item) return (
    <div className="pd-loading">
      <p>Producto no encontrado.</p>
      <button className="pd-btn-primary" onClick={() => navigate(-1)}>← Volver</button>
    </div>
  )

  const imgSrc = item.image?.startsWith('http') ? item.image : `/img/${item.image}`
  const selectedColor = COLORS.find(c => c.label === color) ?? COLORS[0]

  return (
    <div className="pd-wrapper">

      {/* ── Breadcrumb ── */}
      <nav className="pd-breadcrumb">
        <Link to="/">Inicio</Link>
        <span>/</span>
        <Link to={`/items/category/${item.category}/${item.clasification}`}>Catálogo</Link>
        <span>/</span>
        <span>{item.name}</span>
      </nav>

      {/* ── Main layout ── */}
      <div className="pd-main">

        {/* Imagen */}
        <div className="pd-img-col">
          <div className="pd-img-wrap">
            {!imgLoaded && <div className="pd-img-skeleton"></div>}
            <img
              src={imgSrc}
              alt={item.name}
              className={`pd-img${imgLoaded ? ' pd-img--loaded' : ''}`}
              onLoad={() => setImgLoaded(true)}
              onError={(e) => { e.target.src = 'https://via.placeholder.com/600x750?text=Sin+imagen' }}
            />
          </div>
        </div>

        {/* Info */}
        <div className="pd-info-col">

          <h1 className="pd-name">{item.name}</h1>

          <div className="pd-price-row">
            <span className="pd-price">C${item.price}</span>
            <span className="pd-stock-badge">● En stock</span>
          </div>

          <p className="pd-description">{item.description}</p>

          <div className="pd-divider"></div>

          <form onSubmit={handleAddToCart} className="pd-form">

            {/* Talla */}
            <div className="pd-field">
              <label className="pd-label">
                Talla <span className="pd-label-selected">{size}</span>
              </label>
              <div className="pd-size-grid">
                {SIZES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`pd-size-btn${size === s ? ' active' : ''}`}
                    onClick={() => setSize(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div className="pd-field">
              <label className="pd-label">
                Color <span className="pd-label-selected">{color}</span>
              </label>
              <div className="pd-color-grid">
                {COLORS.map((c) => (
                  <button
                    key={c.label}
                    type="button"
                    title={c.label}
                    className={`pd-color-btn${color === c.label ? ' active' : ''}`}
                    style={{ '--swatch': c.hex }}
                    onClick={() => setColor(c.label)}
                  >
                    {color === c.label && <span className="pd-color-check">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Cantidad */}
            <div className="pd-field">
              <label className="pd-label">Cantidad</label>
              <div className="pd-qty-row">
                <button
                  type="button"
                  className="pd-qty-btn"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >−</button>
                <span className="pd-qty-val">{quantity}</span>
                <button
                  type="button"
                  className="pd-qty-btn"
                  onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                >+</button>
              </div>
            </div>

            {/* Botones */}
            <div className="pd-actions">
              <button type="submit" className="pd-btn-primary">
                <i className="zmdi zmdi-shopping-cart"></i> Añadir al carrito
              </button>
              <button type="button" className="pd-btn-secondary" onClick={() => navigate(-1)}>
                ← Volver
              </button>
            </div>

          </form>

          {/* Features */}
          <ul className="pd-features">
            <li><i className="zmdi zmdi-truck"></i> Envío gratis en pedidos mayores a C$500</li>
            <li><i className="zmdi zmdi-refresh"></i> Devoluciones en 30 días</li>
            <li><i className="zmdi zmdi-lock"></i> Pago 100% seguro</li>
          </ul>

        </div>
      </div>

      {/* ── Productos relacionados ── */}
      {related.length > 0 && (
        <section className="pd-related">
          <div className="pd-related-header">
            <h2 className="pd-related-title">También te puede gustar</h2>
            <Link
              to={`/items/category/${item.category}/${item.clasification}`}
              className="pd-related-all"
            >
              Ver todo →
            </Link>
          </div>
          <div className="pd-related-grid">
            {related.map((r, i) => (
              <ItemCard key={r.id_item ?? i} item={r} />
            ))}
          </div>
        </section>
      )}

    </div>
  )
}
