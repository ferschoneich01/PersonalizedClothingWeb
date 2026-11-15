import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Swal from 'sweetalert2'
import { useCart } from '../context/CartContext'
import './CatalogView.css'

const GARMENT_TYPE_LABELS = {
  1: 'Camiseta',
  2: 'Sudadera / Hoodie',
  3: 'Crop Top',
  4: 'Suéter',
  7: 'Taza Personalizable'
}

export default function ItemCard({
  item,
  viewMode = 'grid',
  selectedSize = 'M',
  isFavorite: controlledFav,
  onToggleFavorite
}) {
  const { addToCart } = useCart()
  const [localFav, setLocalFav] = useState(false)

  // Normaliza tanto si Flask devuelve array como objeto
  const name = item.name || item[1] || item[0] || 'Artículo'
  const price = item.price || item[4] || item[1] || 0
  const image = (Array.isArray(item.images) && item.images[0]) || item.image || item[3] || item[2]
  const id_item = item.id_item || item[0] || item[4]
  const clasification = Number(item.clasification ?? item[5] ?? 1)

  const imgSrc = image?.startsWith('http') ? image : `/img/${image}`
  const subtitleLabel = `${GARMENT_TYPE_LABELS[clasification] || 'Prenda Base'} · 100% Algodón Premium`

  useEffect(() => {
    if (controlledFav !== undefined) return
    try {
      const saved = JSON.parse(localStorage.getItem('pc_favorites') || '[]')
      setLocalFav(saved.includes(id_item))
    } catch {
      setLocalFav(false)
    }
  }, [id_item, controlledFav])

  const isFav = controlledFav !== undefined ? controlledFav : localFav

  const handleToggleFav = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (onToggleFavorite) {
      onToggleFavorite(id_item)
      return
    }
    try {
      const saved = JSON.parse(localStorage.getItem('pc_favorites') || '[]')
      const next = saved.includes(id_item)
        ? saved.filter((id) => id !== id_item)
        : [...saved, id_item]
      localStorage.setItem('pc_favorites', JSON.stringify(next))
      setLocalFav(next.includes(id_item))
    } catch {
      setLocalFav((prev) => !prev)
    }
  }

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart({
      id_item,
      name,
      price,
      image,
      quantity: 1,
      size: selectedSize || 'M',
      color: 'Negro'
    })
    Swal.fire({
      icon: 'success',
      title: '¡Añadido!',
      text: `${name} (${selectedSize || 'M'}) añadido al carrito.`,
      timer: 1400,
      showConfirmButton: false
    })
  }

  const isList = viewMode === 'list'

  return (
    <article className={`sc-card ${isList ? 'is-list' : ''}`}>
      {/* Imagen del artículo */}
      <Link to={`/items/${id_item}`} className="sc-card-media">
        <img
          src={imgSrc}
          alt={name}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = '/img/item-1.png'
          }}
        />
        <span className="sc-card-price">C${price}</span>

        <button
          type="button"
          onClick={handleToggleFav}
          className={`sc-card-fav-top ${isFav ? 'is-fav' : ''}`}
          title={isFav ? 'Quitar de favoritos' : 'Guardar en favoritos'}
          aria-label="Favorito"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill={isFav ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </Link>

      {/* Información y acciones */}
      <div className="sc-card-body">
        <div>
          <Link to={`/items/${id_item}`} className="sc-card-title" title={name}>
            {name}
          </Link>
          <p className="sc-card-sub">{subtitleLabel}</p>
        </div>

        <div className="sc-card-actions">
          <button
            type="button"
            onClick={handleAddToCart}
            className="sc-action-btn"
            title="Agregar al carrito"
            aria-label="Agregar al carrito"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
          </button>

          <a
            href={`https://wa.me/50589154885?text=${encodeURIComponent(
              `Hola, quiero ordenar el artículo ${name} (Talla ${selectedSize || 'M'}) con ID ${id_item}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="sc-action-btn is-whatsapp"
            title="Solicitar por WhatsApp"
            aria-label="Solicitar por WhatsApp"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
          </a>

          <button
            type="button"
            onClick={handleToggleFav}
            className={`sc-action-btn ${isFav ? 'is-fav' : ''}`}
            title={isFav ? 'En favoritos' : 'Añadir a favoritos'}
            aria-label="Favorito"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill={isFav ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>

          <Link
            to={`/items/${id_item}`}
            className="sc-action-btn"
            title="Ver detalle"
            aria-label="Ver detalle"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  )
}
