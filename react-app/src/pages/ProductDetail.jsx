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

  let images = []
  if (Array.isArray(d.images) && d.images.length > 0) {
    images = d.images
  } else if (d.image) {
    images = [d.image]
  } else if (d[3]) {
    images = [d[3]]
  }

  return {
    id_item:      d.id_item      ?? d[0],
    name:         d.name         ?? d[1],
    description:  d.description  ?? d[2] ?? '100% algodón.',
    image:        images[0]      ?? d.image ?? d[3],
    images:       images,
    price:        d.price        ?? d[4],
    clasification: d.clasification ?? d[5],
    category:     d.category     ?? d[6],
  }
}

export default function ProductDetail() {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const { addToCart } = useCart()

  const [item, setItem]             = useState(null)
  const [related, setRelated]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [imgLoaded, setImgLoaded]   = useState(false)
  const [activeImgIndex, setActiveImgIndex] = useState(0)

  const [quantity, setQuantity] = useState(1)
  const [size, setSize]         = useState('M')
  const [color, setColor]       = useState('Negro')

  // Carga el producto principal
  useEffect(() => {
    if (!id) return
    setLoading(true)
    setImgLoaded(false)
    setActiveImgIndex(0)
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

  const imagesList = item.images && item.images.length > 0 ? item.images : (item.image ? [item.image] : [])
  const currentImgRaw = imagesList[activeImgIndex] || imagesList[0] || item.image
  const imgSrc = currentImgRaw?.startsWith('http') ? currentImgRaw : `/img/${currentImgRaw}`
  const selectedColor = COLORS.find(c => c.label === color) ?? COLORS[0]

  const handlePrevImage = (e) => {
    e.stopPropagation()
    setImgLoaded(false)
    setActiveImgIndex(prev => (prev === 0 ? imagesList.length - 1 : prev - 1))
  }

  const handleNextImage = (e) => {
    e.stopPropagation()
    setImgLoaded(false)
    setActiveImgIndex(prev => (prev === imagesList.length - 1 ? 0 : prev + 1))
  }

  const openZoomModal = () => {
    Swal.fire({
      imageUrl: imgSrc,
      imageAlt: item.name,
      showConfirmButton: false,
      showCloseButton: true,
      width: 'auto',
      padding: '0.8em',
      background: '#0f172a',
      customClass: {
        popup: 'pd-swal-zoom',
      }
    })
  }

  return (
    <div className="pd-wrapper">
      <style>{`
        /* Galería de imágenes múltiples en Detalle de Producto */
        .pd-img-wrap {
          position: relative;
          cursor: zoom-in;
        }
        .pd-img-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(4px);
          border: 1px solid rgba(0, 0, 0, 0.08);
          color: #0f172a;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          line-height: 1;
          cursor: pointer;
          transition: all 0.15s ease;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
          z-index: 5;
        }
        .pd-img-nav-btn:hover {
          background: #ffffff;
          transform: translateY(-50%) scale(1.08);
          box-shadow: 0 6px 14px rgba(0, 0, 0, 0.2);
        }
        .pd-img-nav-btn--prev { left: 12px; }
        .pd-img-nav-btn--next { right: 12px; }

        .pd-img-counter {
          position: absolute;
          bottom: 12px;
          right: 12px;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(4px);
          color: #ffffff;
          font-size: 11.5px;
          font-weight: 700;
          padding: 3px 9px;
          border-radius: 12px;
          letter-spacing: 0.5px;
          z-index: 5;
        }

        .pd-thumbs-strip {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 14px;
          overflow-x: auto;
          scrollbar-width: thin;
          padding-bottom: 4px;
        }
        .pd-thumb-btn {
          position: relative;
          width: 68px;
          height: 68px;
          flex-shrink: 0;
          border-radius: 10px;
          border: 2px solid #e2e8f0;
          padding: 0;
          background: #f8fafc;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.18s ease;
        }
        .pd-thumb-btn:hover {
          border-color: #94a3b8;
          transform: translateY(-2px);
        }
        .pd-thumb-btn.is-active {
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.25);
          transform: translateY(-2px);
        }
        .pd-thumb-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .pd-thumb-main-badge {
          position: absolute;
          bottom: 2px;
          left: 2px;
          right: 2px;
          background: rgba(15, 23, 42, 0.85);
          color: #10b981;
          font-size: 9px;
          font-weight: 800;
          text-align: center;
          padding: 1px 0;
          border-radius: 4px;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }
      `}</style>

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

        {/* Imagen y Galería de hasta 5 fotos */}
        <div className="pd-img-col">
          <div className="pd-img-wrap" onClick={openZoomModal} title="Clic para ampliar en alta resolución">
            {!imgLoaded && <div className="pd-img-skeleton"></div>}
            <img
              src={imgSrc}
              alt={item.name}
              className={`pd-img${imgLoaded ? ' pd-img--loaded' : ''}`}
              onLoad={() => setImgLoaded(true)}
              onError={(e) => { e.target.src = 'https://via.placeholder.com/600x750?text=Sin+imagen' }}
            />

            {/* Flechas de navegación rápida si hay más de 1 imagen */}
            {imagesList.length > 1 && (
              <>
                <button
                  type="button"
                  className="pd-img-nav-btn pd-img-nav-btn--prev"
                  onClick={handlePrevImage}
                  aria-label="Foto anterior"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="pd-img-nav-btn pd-img-nav-btn--next"
                  onClick={handleNextImage}
                  aria-label="Foto siguiente"
                >
                  ›
                </button>
                <span className="pd-img-counter">
                  {activeImgIndex + 1} / {imagesList.length}
                </span>
              </>
            )}
          </div>

          {/* Carrusel / Tira de Miniaturas */}
          {imagesList.length > 1 && (
            <div className="pd-thumbs-strip" aria-label="Galería de imágenes">
              {imagesList.map((img, idx) => {
                const thumbUrl = img?.startsWith('http') ? img : `/img/${img}`
                const isActive = activeImgIndex === idx
                return (
                  <button
                    key={idx}
                    type="button"
                    className={`pd-thumb-btn${isActive ? ' is-active' : ''}`}
                    onClick={() => {
                      setImgLoaded(false)
                      setActiveImgIndex(idx)
                    }}
                    title={`Ver imagen ${idx + 1}${idx === 0 ? ' (Principal)' : ''}`}
                  >
                    <img
                      src={thumbUrl}
                      alt={`${item.name} miniatura ${idx + 1}`}
                      className="pd-thumb-img"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Prenda' }}
                    />
                    {idx === 0 && (
                      <span className="pd-thumb-main-badge">Principal</span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
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
                    {color === c.label && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="pd-color-check">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
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
            <div className="pd-actions" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                <button type="submit" className="pd-btn-primary" style={{ flex: 1 }}>
                  <i className="zmdi zmdi-shopping-cart"></i> Añadir al carrito
                </button>
                <button type="button" className="pd-btn-secondary" onClick={() => navigate(-1)}>
                  ← Volver
                </button>
              </div>
              <a
                href={`https://wa.me/50589154885?text=${encodeURIComponent(`Hola, quiero ordenar el artículo ${item.name} con ID ${item.id_item}, talla ${size} y color ${color}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="pd-btn-primary"
                style={{ backgroundColor: '#25D366', color: '#fff', borderColor: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none', width: '100%' }}
              >
                <i className="zmdi zmdi-whatsapp" style={{ fontSize: '20px' }}></i> Solicitar por WhatsApp
              </a>
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
