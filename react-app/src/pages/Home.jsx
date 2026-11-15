import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getItems } from '../api/itemsApi'
import { getOrderDetails } from '../api/ordersApi'

const HERO_SLIDES = [
  {
    id: 'video-main',
    type: 'video',
    src: '/img/video1_fondo.mp4',
    label: 'Taller de personalización en vivo: bordado, DTF y sublimación en algodón premium 450 GSM.'
  },
  {
    id: 'slide-2',
    type: 'image',
    src: '/img/back2-main.jpg',
    label: 'Colección Streetwear en algodón orgánico peinado de alto gramaje.'
  },
  {
    id: 'slide-3',
    type: 'image',
    src: '/img/back3-main.jpg',
    label: 'Diseños en DTF, sublimación y bordado de alta definición sin mínimo de pedido.'
  },
  {
    id: 'slide-4',
    type: 'image',
    src: '/img/back4-main.jpg',
    label: 'Prendas personalizadas listas para despacho express en 24/48 horas.'
  }
]

const STUDIO_TECHNIQUES = [
  {
    id: 'dtf',
    title: 'ESTAMPADO DTF FULL COLOR',
    subtitle: 'Alta adherencia y colores vivos'
  },
  {
    id: 'sublimacion',
    title: 'SUBLIMACIÓN ALTA DEFINICIÓN',
    subtitle: 'Tinta integrada en la fibra'
  },
  {
    id: 'bordado',
    title: 'BORDADO PROFESIONAL',
    subtitle: 'Hilo resistente de alto detalle'
  }
]

const STUDIO_TONES = [
  {
    id: 'black',
    label: 'Negro Ónix',
    hex: '#0f172a',
    front: '/img/hoodie_black_front_1779693992723.png',
    back: '/img/hoodie_black_back.png'
  },
  {
    id: 'white',
    label: 'Blanco Puro',
    hex: '#f1f5f9',
    front: '/img/hoodie_white_front_1779693980563.png',
    back: '/img/hoodie_mockup_back.png'
  },
  {
    id: 'emerald',
    label: 'Verde Esmeralda',
    hex: '#059669',
    front: '/img/hoodie_black_front_1779693992723.png',
    back: '/img/hoodie_black_back.png',
    tint: 'hue-rotate(135deg) saturate(1.4) brightness(1.05)'
  },
  {
    id: 'gray',
    label: 'Gris Jaspeado',
    hex: '#64748b',
    front: '/img/hoodie_gray_front_1779694004101.png',
    back: '/img/hoodie_gray_back.png'
  }
]

const STUDIO_VIEWS = [
  {
    id: 'front',
    label: 'Frente',
    zoneLabel: 'ÁREA PECHO',
    zoneSize: '10 x 10 cm',
    boxStyle: { top: '32%', left: '50%', transform: 'translateX(-50%)', width: '96px', height: '104px' }
  },
  {
    id: 'back',
    label: 'Espalda',
    zoneLabel: 'ESPALDA COMPLETA',
    zoneSize: '28 x 35 cm',
    boxStyle: { top: '28%', left: '50%', transform: 'translateX(-50%)', width: '122px', height: '132px' }
  },
  {
    id: 'sleeve',
    label: 'Manga',
    zoneLabel: 'DETALLE MANGA',
    zoneSize: '6 x 6 cm',
    boxStyle: { top: '45%', left: '75%', transform: 'translateX(-50%)', width: '72px', height: '78px' }
  }
]

const CLASIFICATION_LABELS = {
  1: 'CAMISETA OVERSIZE',
  2: 'CORTE BOXY UNISEX',
  3: 'CROP TOP CASUAL',
  4: 'CORTE REGULAR RELAJADO'
}

const FALLBACK_ITEMS = [
  {
    id_item: 36,
    name: 'Hoodie Boxy Heavyweight',
    description: 'Algodón 100% peinado sin cordones. Doble costura en sisa y puños reforzados.',
    price: 580,
    image: 'item-1.png',
    clasification: 2,
    category: 1
  },
  {
    id_item: 7,
    name: 'Sudadera Crewneck Essential',
    description: 'Cuello redondo acanalado de 3cm con felpa suave perchada interior. Ideal para bordado fino.',
    price: 490,
    image: 'item-3.png',
    clasification: 4,
    category: 1
  },
  {
    id_item: 5,
    name: 'Heavy Vintage Tee',
    description: 'Punto jersey compacto con caída pesada que no transparenta. Perfecta para impresión directa DTF.',
    price: 270,
    image: 'item-2.png',
    clasification: 1,
    category: 2
  }
]

const CATALOG_COLLECTIONS = [
  {
    id: 'men',
    badgeTop: 'NOVEDADES',
    badgeTopBg: '#ffffff',
    badgeTopColor: '#111827',
    badgeSub: 'MÁS VENDIDO',
    badgeSubBg: '#10b981',
    badgeSubColor: '#ffffff',
    modelsText: '42 MODELOS BASE',
    specText: 'CORTE BOXY & REGULAR',
    eyebrow: 'CABALLEROS',
    title: 'COLECCIÓN HOMBRE / STREETWEAR & BÁSICOS',
    description: 'Prendas pesadas de 400 a 450 GSM con caída estructurada, hombro caído y acabados anti-pilling listos para DTF, sublimación o bordado.',
    colors: ['#0f172a', '#475569', '#e2e8f0', '#059669'],
    extraColors: '+14',
    ctaText: 'VER CATÁLOGO HOMBRE',
    image: '/img/coleccion_hombre.jpg',
    link: '/items/clasification/1'
  },
  {
    id: 'women',
    badgeTop: 'FAVORITOS',
    badgeTopBg: '#059669',
    badgeTopColor: '#ffffff',
    badgeSub: 'NUEVA TEMPORADA',
    badgeSubBg: 'rgba(255,255,255,0.92)',
    badgeSubColor: '#111827',
    modelsText: '38 MODELOS BASE',
    specText: 'TONALIDADES NEUTRAS',
    eyebrow: 'MUJERES',
    title: 'COLECCIÓN MUJER / OVERSIZE & ESSENTIALS',
    description: 'Siluetas relajadas y confortables en felpa perchada suave y paletas orgánicas listas para bordado fino, DTF o sublimación.',
    colors: ['#e5dec9', '#f5d0fe', '#0f172a', '#d6d3d1'],
    extraColors: '+18',
    ctaText: 'VER CATÁLOGO MUJER',
    image: '/img/coleccion_mujer.jpg',
    link: '/items/clasification/2'
  },
  {
    id: 'kids',
    badgeTop: 'COLECCIÓN JUNIOR',
    badgeTopBg: '#7c3aed',
    badgeTopColor: '#ffffff',
    badgeSub: 'ALGODÓN HIPOALERGÉNICO',
    badgeSubBg: 'rgba(255,255,255,0.92)',
    badgeSubColor: '#111827',
    modelsText: '25 MODELOS BASE',
    specText: 'TINTAS HIPOALERGÉNICAS',
    eyebrow: 'NIÑOS',
    title: 'COLECCIÓN KIDS / COMODIDAD & COLOR',
    description: 'Prendas de alta resistencia y tacto ultra suave, 100% algodón peinado certificado seguro para pieles delicadas y juegos activos.',
    colors: ['#10b981', '#38bdf8', '#facc15', '#a855f7'],
    extraColors: '+12',
    ctaText: 'VER CATÁLOGO NIÑOS',
    image: '/img/coleccion_ninos.jpg',
    link: '/items/clasification/3'
  }
]

export default function Home() {
  // ── Estado del Carrusel del Hero (Video + Imágenes) ──
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const videoRef = useRef(null)

  // ── Estado de Colecciones (Filtro lateral izquierdo) ──
  const [collectionFilter, setCollectionFilter] = useState('all')

  // ── Estado del Estudio 3D en Tiempo Real ──
  const [studioTone, setStudioTone] = useState(STUDIO_TONES[0])
  const [studioView, setStudioView] = useState(STUDIO_VIEWS[0])
  const [studioTechIdx, setStudioTechIdx] = useState(0)

  // ── Estado de Productos Más Populares ──
  const [activeFilter, setActiveFilter] = useState('todas')
  const [catalogItems, setCatalogItems] = useState([])
  const [orderDetails, setOrderDetails] = useState([])

  // Control de reproducción y avance automático del carrusel
  useEffect(() => {
    const activeSlideObj = HERO_SLIDES[currentSlide]

    if (activeSlideObj.type === 'video') {
      const vid = videoRef.current
      if (vid) {
        if (isPlaying) {
          vid.currentTime = 0
          vid.play().catch(() => {})
        } else {
          vid.pause()
        }
      }
      if (!isPlaying) return
      // Respaldo por si el video dura mucho o no dispara onEnded
      const backupTimer = setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)
      }, 14000)
      return () => clearTimeout(backupTimer)
    } else {
      if (!isPlaying) return
      const imgTimer = setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)
      }, 5000)
      return () => clearTimeout(imgTimer)
    }
  }, [currentSlide, isPlaying])

  const handleVideoEnded = () => {
    if (isPlaying) {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)
    }
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)
  }

  // Carga de productos y detalles de ventas reales
  useEffect(() => {
    let mounted = true
    Promise.allSettled([getItems(), getOrderDetails()]).then(([itemsRes, ordersRes]) => {
      if (!mounted) return
      if (itemsRes.status === 'fulfilled' && Array.isArray(itemsRes.value?.data)) {
        setCatalogItems(itemsRes.value.data)
      }
      if (ordersRes.status === 'fulfilled' && Array.isArray(ordersRes.value?.data)) {
        setOrderDetails(ordersRes.value.data)
      }
    })
    return () => {
      mounted = false
    }
  }, [])

  // Ranking de productos más populares según ventas
  const bestSellingProducts = useMemo(() => {
    const salesByItemId = {}
    const salesByName = {}

    orderDetails.forEach((row) => {
      const qty = Number(row.quantityOrders || 1)
      if (row.id_item) {
        salesByItemId[row.id_item] = (salesByItemId[row.id_item] || 0) + qty
      }
      if (row.name) {
        const key = String(row.name).trim().toLowerCase()
        salesByName[key] = (salesByName[key] || 0) + qty
      }
    })

    const sourceItems = catalogItems.length > 0 ? catalogItems : FALLBACK_ITEMS

    const normalized = sourceItems.map((it) => {
      const id_item = it.id_item ?? it[0]
      const name = it.name ?? it[1] ?? 'Prenda'
      const description =
        it.description ??
        it[2] ??
        'Algodón 100% peinado con costuras reforzadas y acabado suave de alta resistencia.'
      const image =
        (Array.isArray(it.images) && it.images[0]) || it.image || it[3] || 'item-1.png'
      const price = Number(it.price ?? it[4] ?? 0)
      const clasification = Number(it.clasification ?? it[5] ?? 1)
      const category = Number(it.category ?? it[6] ?? 1)

      const soldCount =
        salesByItemId[id_item] ||
        salesByName[String(name).trim().toLowerCase()] ||
        0

      return {
        id_item,
        name,
        description,
        image,
        price,
        clasification,
        category,
        soldCount
      }
    })

    normalized.sort((a, b) => b.soldCount - a.soldCount)
    return normalized
  }, [catalogItems, orderDetails])

  const filteredTopProducts = useMemo(() => {
    const list =
      activeFilter === 'todas'
        ? bestSellingProducts
        : bestSellingProducts.filter((p) => String(p.clasification) === String(activeFilter))
    return list.slice(0, 3)
  }, [bestSellingProducts, activeFilter])

  const visibleCollections = useMemo(() => {
    if (collectionFilter === 'all') return CATALOG_COLLECTIONS
    return CATALOG_COLLECTIONS.filter((c) => c.id === collectionFilter)
  }, [collectionFilter])

  const currentMockupSrc =
    studioView.id === 'back' ? studioTone.back : studioTone.front

  return (
    <div className="uk-home">
      <style>{`
        .uk-home {
          font-family: 'DM Sans', 'Inter', system-ui, -apple-system, sans-serif;
          color: #111827;
          background-color: #f4f6fb;
          overflow-x: hidden;
        }

        /* ── Animaciones de Entrada Progresiva + Efecto Rainbow para el Hero ── */
        @keyframes ukWordReveal {
          0% {
            opacity: 0;
            transform: translateY(28px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes ukRainbowFlow {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes ukFadeSlideUp {
          0% {
            opacity: 0;
            transform: translateY(22px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes ukPulseDot {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.35);
            opacity: 0.65;
          }
        }

        .uk-anim-badge {
          opacity: 0;
          animation: ukFadeSlideUp 0.75s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards;
        }
        .uk-anim-line-1 {
          display: block;
          opacity: 0;
          animation: ukWordReveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards;
        }
        .uk-anim-line-2 {
          display: block;
          opacity: 0;
          animation: ukWordReveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.45s forwards;
        }
        .uk-anim-line-3 {
          display: block;
          opacity: 0;
          animation: ukWordReveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.7s forwards;
        }
        .uk-anim-desc {
          opacity: 0;
          animation: ukFadeSlideUp 0.85s cubic-bezier(0.16, 1, 0.3, 1) 0.95s forwards;
        }
        .uk-anim-btns {
          opacity: 0;
          animation: ukFadeSlideUp 0.85s cubic-bezier(0.16, 1, 0.3, 1) 1.15s forwards;
        }
        .uk-anim-specs {
          opacity: 0;
          animation: ukFadeSlideUp 0.85s cubic-bezier(0.16, 1, 0.3, 1) 1.32s forwards;
        }
        .uk-anim-live {
          opacity: 0;
          animation: ukFadeSlideUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) 1.45s forwards;
        }

        .uk-green-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
        }

        /* ── HERO PRINCIPAL CON VIDEO Y CARRUSEL DE FONDO ── */
        .uk-hero {
          position: relative;
          min-height: 600px;
          background-color: #090d16;
          color: #ffffff;
          overflow: hidden;
          display: flex;
          align-items: center;
        }
        .uk-hero-carousel-bg {
          position: absolute;
          inset: 0;
          z-index: 1;
        }
        .uk-hero-slide {
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 0.9s ease-in-out;
          pointer-events: none;
        }
        .uk-hero-slide.is-active {
          opacity: 1;
        }
        .uk-hero-slide video,
        .uk-hero-slide img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 22%;
          display: block;
        }
        .uk-hero-overlay {
          position: absolute;
          inset: 0;
          z-index: 2;
          background: linear-gradient(
            90deg,
            rgba(8, 11, 18, 0.92) 0%,
            rgba(8, 11, 18, 0.78) 48%,
            rgba(8, 11, 18, 0.45) 100%
          );
        }
        .uk-hero-container {
          position: relative;
          z-index: 3;
          width: 100%;
          max-width: 1240px;
          margin: 0 auto;
          padding: 64px 24px 56px;
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 32px;
          align-items: end;
        }

        .uk-hero-top-pill {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: rgba(17, 24, 39, 0.82);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 999px;
          padding: 6px 14px;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 22px;
        }
        .uk-hero-top-pill-emerald {
          color: #10b981;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .uk-hero-top-pill-lot {
          color: #94a3b8;
          padding-left: 10px;
          border-left: 1px solid rgba(255, 255, 255, 0.16);
        }

        .uk-hero-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(2.5rem, 4.8vw, 4.1rem);
          font-weight: 700;
          line-height: 1.04;
          letter-spacing: -0.02em;
          text-transform: uppercase;
          margin: 0 0 22px;
        }
        .uk-rainbow-text {
          display: inline-block;
          background-image: linear-gradient(
            90deg,
            #ff4d6d 0%,
            #ff8a00 18%,
            #ffd60a 35%,
            #10b981 52%,
            #06b6d4 68%,
            #8b5cf6 84%,
            #ff4d6d 100%
          );
          background-size: 220% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent !important;
          -webkit-text-fill-color: transparent !important;
          animation: ukRainbowFlow 6s ease-in-out infinite;
        }
        .uk-rainbow-delay-1 {
          animation-delay: 0s;
        }
        .uk-rainbow-delay-2 {
          animation-delay: -1.4s;
        }
        .uk-rainbow-delay-3 {
          animation-delay: -2.8s;
        }

        .uk-hero-desc {
          font-size: 15px;
          line-height: 1.65;
          color: #cbd5e1;
          max-width: 540px;
          margin: 0 0 28px;
        }

        .uk-hero-actions {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
          margin-bottom: 28px;
        }
        .uk-btn-emerald {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: #10b981;
          color: #06281e !important;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 14px 24px;
          border-radius: 10px;
          text-decoration: none;
          box-shadow: 0 10px 24px rgba(16, 185, 129, 0.3);
          transition: all 0.2s ease;
        }
        .uk-btn-emerald:hover {
          background: #34d399;
          transform: translateY(-2px);
          box-shadow: 0 14px 28px rgba(16, 185, 129, 0.42);
        }
        .uk-btn-ghost {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: rgba(30, 41, 59, 0.72);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #ffffff !important;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 14px 22px;
          border-radius: 10px;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        .uk-btn-ghost:hover {
          background: rgba(51, 65, 85, 0.9);
          border-color: rgba(255, 255, 255, 0.35);
          transform: translateY(-2px);
        }

        .uk-hero-mini-specs {
          display: inline-flex;
          align-items: center;
          gap: 18px;
          flex-wrap: wrap;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 9px 16px;
          border-radius: 10px;
          margin-bottom: 24px;
        }
        .uk-mini-spec-item {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11.5px;
          font-weight: 600;
          color: #e2e8f0;
        }
        .uk-mini-spec-item svg {
          color: #10b981;
        }

        /* ── Controles del Carrusel en el Hero ── */
        .uk-carousel-controls {
          display: inline-flex;
          align-items: center;
          gap: 14px;
          background: rgba(15, 23, 42, 0.82);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 999px;
          padding: 7px 14px;
        }
        .uk-ctrl-play {
          background: none;
          border: none;
          color: #ffffff;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          padding: 0;
        }
        .uk-ctrl-dots {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 0 8px;
          border-left: 1px solid rgba(255, 255, 255, 0.14);
          border-right: 1px solid rgba(255, 255, 255, 0.14);
        }
        .uk-ctrl-dot {
          height: 6px;
          width: 6px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.3);
          border: none;
          padding: 0;
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .uk-ctrl-dot.is-active {
          width: 22px;
          background: #10b981;
        }
        .uk-ctrl-arrows {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .uk-ctrl-arrow {
          background: none;
          border: none;
          color: #cbd5e1;
          cursor: pointer;
          padding: 2px 4px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: color 0.15s ease;
        }
        .uk-ctrl-arrow:hover {
          color: #10b981;
        }

        /* ── Tarjeta Derecha "Personalizando en Vivo" ── */
        .uk-hero-right {
          display: flex;
          justify-content: flex-end;
          align-items: flex-end;
        }
        .uk-live-card {
          background: rgba(15, 23, 42, 0.84);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 14px;
          padding: 16px 18px;
          max-width: 310px;
          width: 100%;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        }
        .uk-live-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 8px;
        }
        .uk-live-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #f87171;
          text-transform: uppercase;
        }
        .uk-live-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #ef4444;
          animation: ukPulseDot 1.6s infinite;
        }
        .uk-live-play-btn {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.18);
          color: #ffffff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .uk-live-text {
          font-size: 12px;
          line-height: 1.5;
          color: #e2e8f0;
          margin: 0 0 12px;
        }
        .uk-live-progress {
          height: 3px;
          width: 100%;
          background: rgba(255, 255, 255, 0.14);
          border-radius: 999px;
          overflow: hidden;
        }
        .uk-live-progress-bar {
          height: 100%;
          width: 72%;
          background: #10b981;
          border-radius: 999px;
        }

        /* ── Barra Clara de 4 Beneficios debajo del Hero ── */
        .uk-perks-strip {
          background: #e8edff;
          border-bottom: 1px solid #dbe4ff;
          padding: 18px 24px;
        }
        .uk-perks-inner {
          max-width: 1240px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        .uk-perk-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .uk-perk-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: #ffffff;
          border: 1px solid #dbe4ff;
          color: #059669;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 2px 6px rgba(15, 23, 42, 0.04);
        }
        .uk-perk-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: #111827;
          text-transform: uppercase;
          display: block;
        }
        .uk-perk-sub {
          font-size: 11.5px;
          color: #475569;
          display: block;
          margin-top: 1px;
        }

        /* ── SECCIÓN 2: EXPLORA POR COLECCIÓN (Con Filtro Rápido Lateral) ── */
        .uk-collections-section {
          max-width: 1240px;
          margin: 0 auto;
          padding: 64px 24px 72px;
        }
        .uk-sec-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 32px;
          flex-wrap: wrap;
        }
        .uk-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: #059669;
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .uk-sec-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(1.75rem, 2.8vw, 2.35rem);
          font-weight: 700;
          letter-spacing: -0.02em;
          color: #111827;
          text-transform: uppercase;
          margin: 0;
        }
        .uk-sec-desc {
          font-size: 13.5px;
          line-height: 1.6;
          color: #475569;
          max-width: 470px;
          margin: 0;
        }

        .uk-collections-layout {
          display: grid;
          grid-template-columns: 200px 1fr;
          gap: 24px;
          align-items: stretch;
        }
        .uk-sidebar-card {
          background: #eef2ff;
          border: 1px solid #dbe4ff;
          border-radius: 18px;
          padding: 18px 14px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 20px;
        }
        .uk-sidebar-heading {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: #64748b;
          text-transform: uppercase;
          padding: 0 8px;
          margin-bottom: 10px;
          display: block;
        }
        .uk-sidebar-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .uk-sidebar-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 9px 12px;
          border-radius: 8px;
          border: none;
          background: transparent;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: #334155;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .uk-sidebar-btn:hover {
          background: rgba(255, 255, 255, 0.65);
        }
        .uk-sidebar-btn.is-active {
          background: #111827;
          color: #ffffff;
        }
        .uk-sidebar-count {
          font-size: 10px;
          opacity: 0.75;
        }
        .uk-sample-box {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 14px;
        }
        .uk-sample-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #111827;
          text-transform: uppercase;
          display: block;
          margin-bottom: 6px;
        }
        .uk-sample-text {
          font-size: 11.5px;
          line-height: 1.45;
          color: #64748b;
          margin: 0 0 10px;
        }
        .uk-sample-link {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #059669;
          text-transform: uppercase;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .uk-collections-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 22px;
        }
        .uk-col-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .uk-col-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 38px -12px rgba(15, 23, 42, 0.12);
        }
        .uk-col-media {
          position: relative;
          aspect-ratio: 4 / 4.35;
          background: #dbe4ff;
          overflow: hidden;
          display: block;
        }
        .uk-col-media img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center top;
          display: block;
          transition: transform 0.4s ease;
        }
        .uk-col-card:hover .uk-col-media img {
          transform: scale(1.04);
        }
        .uk-col-badges {
          position: absolute;
          top: 12px;
          left: 12px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 5px;
          z-index: 2;
        }
        .uk-col-badge {
          padding: 4px 10px;
          border-radius: 6px;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.12);
        }
        .uk-col-floating-bar {
          position: absolute;
          bottom: 12px;
          left: 12px;
          right: 12px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(6px);
          border-radius: 8px;
          padding: 8px 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: #111827;
          text-transform: uppercase;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.1);
          z-index: 2;
        }
        .uk-col-floating-right {
          color: #64748b;
          font-weight: 600;
        }
        .uk-col-body {
          padding: 20px 20px 22px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .uk-col-eyebrow {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #059669;
          text-transform: uppercase;
          margin-bottom: 5px;
          display: block;
        }
        .uk-col-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 16px;
          font-weight: 700;
          line-height: 1.28;
          color: #111827;
          text-transform: uppercase;
          margin: 0 0 8px;
        }
        .uk-col-desc {
          font-size: 12.5px;
          line-height: 1.55;
          color: #64748b;
          margin: 0 0 14px;
          flex: 1;
        }
        .uk-col-colors {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 16px;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 10px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
        }
        .uk-col-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          border: 1px solid #cbd5e1;
          display: inline-block;
        }
        .uk-col-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .uk-col-btn-main {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          background: #111827;
          color: #ffffff !important;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 12px 14px;
          border-radius: 8px;
          text-decoration: none;
          transition: background 0.2s ease, transform 0.2s ease;
        }
        .uk-col-btn-main:hover {
          background: #1e293b;
          transform: translateY(-1px);
        }
        .uk-col-btn-icon {
          width: 38px;
          height: 38px;
          border-radius: 8px;
          background: #eef2ff;
          border: 1px solid #dbe4ff;
          color: #111827;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        .uk-col-btn-icon:hover {
          background: #10b981;
          color: #ffffff;
          border-color: #10b981;
        }

        /* ── SECCIÓN 3: CREA TU PRENDA ÚNICA EN TIEMPO REAL (OSCURA) ── */
        .uk-studio-section {
          background: #1e2433;
          color: #ffffff;
          padding: 76px 24px;
        }
        .uk-studio-inner {
          max-width: 1240px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 0.95fr 1.05fr;
          gap: 44px;
          align-items: center;
        }
        .uk-studio-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.35);
          color: #34d399;
          padding: 5px 12px;
          border-radius: 999px;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 16px;
        }
        .uk-studio-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(1.85rem, 3vw, 2.55rem);
          font-weight: 700;
          line-height: 1.1;
          letter-spacing: -0.02em;
          text-transform: uppercase;
          color: #ffffff;
          margin: 0 0 16px;
        }
        .uk-studio-desc {
          font-size: 14.5px;
          line-height: 1.65;
          color: #94a3b8;
          margin: 0 0 26px;
        }
        .uk-studio-features {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 30px;
        }
        .uk-studio-feat {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }
        .uk-studio-feat-icon {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: rgba(16, 185, 129, 0.16);
          color: #10b981;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 2px;
        }
        .uk-studio-feat-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: #ffffff;
          text-transform: uppercase;
          display: block;
          margin-bottom: 2px;
        }
        .uk-studio-feat-sub {
          font-size: 12.5px;
          color: #94a3b8;
          display: block;
        }
        .uk-studio-cta-row {
          display: flex;
          align-items: center;
          gap: 18px;
          flex-wrap: wrap;
        }

        /* Ventana Derecha del Estudio 3D */
        .uk-studio-window {
          background: #0d111a;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 28px 60px rgba(0, 0, 0, 0.45);
        }
        .uk-window-topbar {
          background: #141926;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding: 11px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .uk-window-dots {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .uk-w-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
        }
        .uk-window-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #94a3b8;
          text-transform: uppercase;
        }
        .uk-window-tags {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .uk-w-tag {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.06em;
          padding: 3px 8px;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.07);
          color: #cbd5e1;
          text-transform: uppercase;
        }
        .uk-w-tag.is-emerald {
          background: rgba(16, 185, 129, 0.16);
          color: #10b981;
        }

        .uk-window-body {
          padding: 18px;
          display: grid;
          grid-template-columns: 1.25fr 0.75fr;
          gap: 16px;
        }
        .uk-canvas-stage {
          position: relative;
          background: #070a10;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          min-height: 330px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .uk-canvas-garment {
          width: 82%;
          height: 82%;
          object-fit: contain;
          transition: all 0.3s ease;
        }
        .uk-canvas-zone {
          position: absolute;
          border: 1.5px dashed #10b981;
          background: rgba(16, 185, 129, 0.08);
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: 6px;
          pointer-events: none;
          transition: all 0.3s ease;
        }
        .uk-canvas-zone img {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          object-fit: cover;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.45);
        }
        .uk-canvas-zone-lbl {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 7.5px;
          font-weight: 700;
          letter-spacing: 0.06em;
          color: #34d399;
          text-transform: uppercase;
          text-align: center;
          line-height: 1.2;
        }
        .uk-canvas-views {
          position: absolute;
          bottom: 12px;
          left: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .uk-view-btn {
          background: rgba(30, 41, 59, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.14);
          color: #94a3b8;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 10px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .uk-view-btn.is-active {
          background: #1e293b;
          color: #ffffff;
          border-color: #10b981;
        }

        .uk-window-controls {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 14px;
        }
        .uk-w-field-lbl {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #64748b;
          text-transform: uppercase;
          margin-bottom: 6px;
          display: block;
        }
        .uk-w-tech-box {
          width: 100%;
          text-align: left;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.35);
          border-radius: 8px;
          padding: 9px 11px;
          cursor: pointer;
        }
        .uk-w-tech-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 10px;
          font-weight: 700;
          color: #10b981;
          text-transform: uppercase;
          display: block;
        }
        .uk-w-tech-sub {
          font-size: 10.5px;
          color: #94a3b8;
          display: block;
          margin-top: 2px;
        }
        .uk-w-swatches {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .uk-w-swatch {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.25);
          cursor: pointer;
          padding: 0;
          transition: transform 0.15s ease;
        }
        .uk-w-swatch.is-active {
          box-shadow: 0 0 0 2px #0d111a, 0 0 0 4px #10b981;
          transform: scale(1.08);
        }
        .uk-w-upload-box {
          border: 1px dashed rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.03);
          border-radius: 8px;
          padding: 12px 10px;
          text-align: center;
          color: #94a3b8;
          text-decoration: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          transition: border-color 0.2s ease, color 0.2s ease;
        }
        .uk-w-upload-box:hover {
          border-color: #10b981;
          color: #ffffff;
        }
        .uk-w-price-row {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .uk-w-price-lbl {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 9px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
        }
        .uk-w-price-val {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: #ffffff;
        }
        .uk-w-cta {
          width: 100%;
          display: block;
          text-align: center;
          background: #10b981;
          color: #06281e !important;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 10px 12px;
          border-radius: 7px;
          text-decoration: none;
          transition: background 0.2s ease;
        }
        .uk-w-cta:hover {
          background: #34d399;
        }

        /* ── SECCIÓN 4: PRODUCTOS MÁS POPULARES ── */
        .uk-popular-section {
          max-width: 1240px;
          margin: 0 auto;
          padding: 72px 24px 76px;
        }
        .uk-pop-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #e0f2fe;
          border: 1px solid #bae6fd;
          color: #0369a1;
          padding: 4px 11px;
          border-radius: 999px;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 10px;
        }
        .uk-filter-pills {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .uk-filter-btn {
          padding: 8px 15px;
          border-radius: 999px;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.06em;
          color: #475569;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .uk-filter-btn.is-active {
          background: #111827;
          color: #ffffff;
          border-color: #111827;
        }

        .uk-popular-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .uk-pop-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .uk-pop-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 38px -12px rgba(15, 23, 42, 0.12);
        }
        .uk-pop-media {
          position: relative;
          aspect-ratio: 4 / 4.2;
          background: #e8edff;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .uk-pop-media img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.35s ease;
        }
        .uk-pop-card:hover .uk-pop-media img {
          transform: scale(1.04);
        }
        .uk-pop-badges {
          position: absolute;
          top: 12px;
          left: 12px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 5px;
          z-index: 2;
        }
        .uk-pop-badge {
          padding: 4px 10px;
          border-radius: 999px;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          box-shadow: 0 2px 6px rgba(15, 23, 42, 0.1);
        }
        .uk-pop-fab {
          position: absolute;
          bottom: 12px;
          right: 12px;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: #059669;
          color: #ffffff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 14px rgba(5, 150, 105, 0.35);
          z-index: 2;
          transition: transform 0.2s ease, background 0.2s ease;
        }
        .uk-pop-fab:hover {
          background: #10b981;
          transform: scale(1.08);
        }

        .uk-pop-body {
          padding: 18px 20px 20px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .uk-pop-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 6px;
        }
        .uk-pop-cat {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #64748b;
          text-transform: uppercase;
        }
        .uk-pop-price {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 15.5px;
          font-weight: 700;
          color: #111827;
        }
        .uk-pop-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 15.5px;
          font-weight: 700;
          color: #111827;
          text-transform: uppercase;
          text-decoration: none;
          margin: 0 0 6px;
          display: block;
        }
        .uk-pop-title:hover {
          color: #059669;
        }
        .uk-pop-desc {
          font-size: 12.5px;
          line-height: 1.55;
          color: #64748b;
          margin: 0 0 16px;
          flex: 1;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .uk-pop-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding-top: 12px;
          border-top: 1px solid #f1f5f9;
        }
        .uk-pop-swatches {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 10.5px;
          color: #64748b;
          font-weight: 600;
        }
        .uk-pop-link {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #059669;
          text-transform: uppercase;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .uk-pop-link:hover {
          color: #047857;
        }

        .uk-explore-all-wrap {
          margin-top: 38px;
          display: flex;
          justify-content: center;
        }
        .uk-explore-all-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          color: #111827 !important;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 13px 26px;
          border-radius: 10px;
          text-decoration: none;
          transition: all 0.2s ease;
          box-shadow: 0 2px 6px rgba(15, 23, 42, 0.04);
        }
        .uk-explore-all-btn:hover {
          border-color: #111827;
          transform: translateY(-2px);
          box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
        }

        /* ── Responsive ── */
        @media (max-width: 1080px) {
          .uk-hero-container,
          .uk-studio-inner {
            grid-template-columns: 1fr;
          }
          .uk-hero-right {
            justify-content: flex-start;
          }
          .uk-collections-layout {
            grid-template-columns: 1fr;
          }
          .uk-collections-grid,
          .uk-popular-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .uk-perks-inner {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 640px) {
          .uk-collections-grid,
          .uk-popular-grid,
          .uk-perks-inner,
          .uk-window-body {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* ── HERO PRINCIPAL: Video + Carrusel de Fondo y Texto con Aparición Progresiva ── */}
      <section className="uk-hero">
        <div className="uk-hero-carousel-bg">
          {HERO_SLIDES.map((slide, idx) => (
            <div
              key={slide.id}
              className={`uk-hero-slide ${currentSlide === idx ? 'is-active' : ''}`}
            >
              {slide.type === 'video' ? (
                <video
                  ref={videoRef}
                  src={slide.src}
                  autoPlay
                  muted
                  playsInline
                  onEnded={handleVideoEnded}
                />
              ) : (
                <img src={slide.src} alt={slide.label} />
              )}
            </div>
          ))}
        </div>

        <div className="uk-hero-overlay" />

        <div className="uk-hero-container">
          <div className="uk-hero-left">
            <div className="uk-hero-top-pill uk-anim-badge">
              <span className="uk-hero-top-pill-emerald">
                <span className="uk-green-dot" />
                <span>ATELIER DIGITAL // TEMPORADA 25-26</span>
              </span>
              <span className="uk-hero-top-pill-lot">LOTE: 450GSM-ORG-001</span>
            </div>

            <h1 className="uk-hero-title">
              <span className="uk-anim-line-1">
                <span className="uk-rainbow-text uk-rainbow-delay-1">PERSONALIZA TU</span>
              </span>
              <span className="uk-anim-line-2">
                <span className="uk-rainbow-text uk-rainbow-delay-2">PRENDA FAVORITA</span>
              </span>
              <span className="uk-anim-line-3">
                <span className="uk-rainbow-text uk-rainbow-delay-3">AHORA</span>
              </span>
            </h1>

            <p className="uk-hero-desc uk-anim-desc">
              Diseños personalizados con DTF, sublimación y bordado de alta precisión en algodón orgánico de 400+ GSM. Sin mínimos de compra, corte streetwear estructurado y acabados hechos para perdurar.
            </p>

            <div className="uk-hero-actions uk-anim-btns">
              <Link to="/personalizar" className="uk-btn-emerald">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z"/>
                  <path d="M5 19l1.2-2.8L9 15l-2.8-1.2L5 11l-1.2 2.8L1 15l2.8 1.2L5 19z"/>
                </svg>
                <span>PERSONALIZAR PRENDA</span>
              </Link>

              <Link to="/items" className="uk-btn-ghost">
                <span>VER CATÁLOGO</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M19 12l-7 7-7-7"/>
                </svg>
              </Link>
            </div>

            <div className="uk-anim-specs">
              <div className="uk-hero-mini-specs">
                <span className="uk-mini-spec-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z"/>
                  </svg>
                  <span>Estampado DTF</span>
                </span>
                <span className="uk-mini-spec-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                  </svg>
                  <span>Sublimación HD</span>
                </span>
                <span className="uk-mini-spec-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 19l7-7 3 3-7 7-3-3z"/>
                    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
                  </svg>
                  <span>Bordado de Precisión</span>
                </span>
              </div>

              <div>
                <div className="uk-carousel-controls">
                  <button
                    type="button"
                    className="uk-ctrl-play"
                    onClick={() => setIsPlaying((p) => !p)}
                    aria-label={isPlaying ? 'Pausar carrusel' : 'Reproducir carrusel'}
                  >
                    {isPlaying ? (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6" y="4" width="4" height="16" rx="1"/>
                        <rect x="14" y="4" width="4" height="16" rx="1"/>
                      </svg>
                    ) : (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="6 4 20 12 6 20 6 4"/>
                      </svg>
                    )}
                    <span>
                      0{currentSlide + 1} / 0{HERO_SLIDES.length}
                    </span>
                  </button>

                  <div className="uk-ctrl-dots">
                    {HERO_SLIDES.map((s, idx) => (
                      <button
                        key={s.id}
                        type="button"
                        className={`uk-ctrl-dot ${currentSlide === idx ? 'is-active' : ''}`}
                        onClick={() => setCurrentSlide(idx)}
                        aria-label={`Ir a diapositiva ${idx + 1}`}
                      />
                    ))}
                  </div>

                  <div className="uk-ctrl-arrows">
                    <button
                      type="button"
                      className="uk-ctrl-arrow"
                      onClick={prevSlide}
                      aria-label="Anterior"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6"/>
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="uk-ctrl-arrow"
                      onClick={nextSlide}
                      aria-label="Siguiente"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="uk-hero-right uk-anim-live">
            <div className="uk-live-card">
              <div className="uk-live-header">
                <span className="uk-live-badge">
                  <span className="uk-live-dot" />
                  <span>PERSONALIZANDO EN VIVO</span>
                </span>
                <button
                  type="button"
                  className="uk-live-play-btn"
                  onClick={() => setCurrentSlide(0)}
                  title="Ver video del taller"
                  aria-label="Ver video del taller"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="6 4 20 12 6 20 6 4"/>
                  </svg>
                </button>
              </div>
              <p className="uk-live-text">
                {HERO_SLIDES[currentSlide].label}
              </p>
              <div className="uk-live-progress">
                <div
                  className="uk-live-progress-bar"
                  style={{
                    width: `${((currentSlide + 1) / HERO_SLIDES.length) * 100}%`,
                    transition: 'width 0.4s ease'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Barra Clara de 4 Beneficios ── */}
      <div className="uk-perks-strip">
        <div className="uk-perks-inner">
          <div className="uk-perk-item">
            <div className="uk-perk-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z"/>
              </svg>
            </div>
            <div>
              <span className="uk-perk-title">ALGODÓN ORG. 450 GSM</span>
              <span className="uk-perk-sub">Prenda pesada con caída rígida</span>
            </div>
          </div>

          <div className="uk-perk-item">
            <div className="uk-perk-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <div>
              <span className="uk-perk-title">BORDADO DE ALTA PRECISIÓN</span>
              <span className="uk-perk-sub">Acabado artesanal y duradero</span>
            </div>
          </div>

          <div className="uk-perk-item">
            <div className="uk-perk-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
              </svg>
            </div>
            <div>
              <span className="uk-perk-title">DTF &amp; SUBLIMACIÓN HD</span>
              <span className="uk-perk-sub">Colores vivos resistentes al lavado</span>
            </div>
          </div>

          <div className="uk-perk-item">
            <div className="uk-perk-icon">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13"/>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                <circle cx="5.5" cy="18.5" r="2.5"/>
                <circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
            </div>
            <div>
              <span className="uk-perk-title">PRODUCCIÓN EN 24/48 HORAS</span>
              <span className="uk-perk-sub">Desde 1 unidad sin pedido mínimo</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECCIÓN 2: EXPLORA POR COLECCIÓN ── */}
      <section className="uk-collections-section">
        <div className="uk-sec-header">
          <div>
            <span className="uk-eyebrow">
              <span className="uk-green-dot" />
              <span>CATÁLOGOS &amp; LÍNEAS DE CONFECCIÓN</span>
            </span>
            <h2 className="uk-sec-title">EXPLORA POR COLECCIÓN</h2>
          </div>
          <p className="uk-sec-desc">
            Prendas base de alta gama confeccionadas en algodón prémium para hombre, mujer y niños, diseñadas específicamente para destacar con DTF, sublimación y bordado profesional.
          </p>
        </div>

        <div className="uk-collections-layout">
          {/* Sidebar Izquierdo */}
          <aside className="uk-sidebar-card">
            <div>
              <span className="uk-sidebar-heading">FILTRO RÁPIDO</span>
              <div className="uk-sidebar-list">
                {[
                  { id: 'all', label: 'TODO', count: 105 },
                  { id: 'men', label: 'HOMBRE', count: 42 },
                  { id: 'women', label: 'MUJER', count: 38 },
                  { id: 'kids', label: 'KIDS', count: 25 }
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    className={`uk-sidebar-btn ${collectionFilter === f.id ? 'is-active' : ''}`}
                    onClick={() => setCollectionFilter(f.id)}
                  >
                    <span>{f.label}</span>
                    <span className="uk-sidebar-count">{f.count}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="uk-sample-box">
              <span className="uk-sample-title">MUESTRARIO FÍSICO</span>
              <p className="uk-sample-text">
                Recibe muestras textiles y guía de tallas y colores físicos en 24h.
              </p>
              <Link to="/items" className="uk-sample-link">
                <span>VER CATÁLOGO</span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
            </div>
          </aside>

          {/* Tarjetas de Colección (Caballeros, Mujeres, Niños) */}
          <div
            className="uk-collections-grid"
            style={
              visibleCollections.length === 1
                ? { gridTemplateColumns: 'minmax(280px, 420px)' }
                : undefined
            }
          >
            {visibleCollections.map((col) => (
              <div key={col.id} className="uk-col-card">
                <Link to={col.link} className="uk-col-media">
                  <div className="uk-col-badges">
                    <span
                      className="uk-col-badge"
                      style={{
                        backgroundColor: col.badgeTopBg,
                        color: col.badgeTopColor
                      }}
                    >
                      {col.badgeTop}
                    </span>
                    <span
                      className="uk-col-badge"
                      style={{
                        backgroundColor: col.badgeSubBg,
                        color: col.badgeSubColor
                      }}
                    >
                      {col.badgeSub}
                    </span>
                  </div>

                  <img src={col.image} alt={col.title} loading="lazy" />

                  <div className="uk-col-floating-bar">
                    <span>+ {col.modelsText}</span>
                    <span className="uk-col-floating-right">{col.specText}</span>
                  </div>
                </Link>

                <div className="uk-col-body">
                  <span className="uk-col-eyebrow">{col.eyebrow}</span>
                  <h3 className="uk-col-title">{col.title}</h3>
                  <p className="uk-col-desc">{col.description}</p>

                  <div className="uk-col-colors">
                    <span>COLORES:</span>
                    {col.colors.map((hex, i) => (
                      <span
                        key={i}
                        className="uk-col-dot"
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                    <span>{col.extraColors}</span>
                  </div>

                  <div className="uk-col-actions">
                    <Link to={col.link} className="uk-col-btn-main">
                      <span>{col.ctaText}</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </Link>
                    <Link
                      to="/personalizar"
                      className="uk-col-btn-icon"
                      title="Personalizar en estudio"
                      aria-label="Personalizar en estudio"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 4V2M15 16v-2M8 9h2M20 9h2M17.8 11.8L19 13M17.8 6.2L19 5M12.2 6.2L11 5M3 21l9-9"/>
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECCIÓN 3: CREA TU PRENDA ÚNICA EN TIEMPO REAL ── */}
      <section className="uk-studio-section">
        <div className="uk-studio-inner">
          <div>
            <span className="uk-studio-pill">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
              <span>PERSONALIZADOR EN TIEMPO REAL</span>
            </span>
            <h2 className="uk-studio-title">
              CREA TU PRENDA ÚNICA EN TIEMPO REAL
            </h2>
            <p className="uk-studio-desc">
              Sube tus propios diseños, imágenes o tipografías y previsualiza al instante cómo lucirán sobre tu prenda antes de producirla. Realizamos trabajos en DTF, sublimación y bordado de alta calidad.
            </p>

            <div className="uk-studio-features">
              <div className="uk-studio-feat">
                <div className="uk-studio-feat-icon">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                </div>
                <div>
                  <span className="uk-studio-feat-title">ESTAMPADO DTF FULL COLOR</span>
                  <span className="uk-studio-feat-sub">Impresión de alta nitidez y flexibilidad sobre prendas claras u oscuras con gran durabilidad.</span>
                </div>
              </div>

              <div className="uk-studio-feat">
                <div className="uk-studio-feat-icon">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                </div>
                <div>
                  <span className="uk-studio-feat-title">SUBLIMACIÓN DE ALTA DEFINICIÓN</span>
                  <span className="uk-studio-feat-sub">Colores intensos integrados directamente en la tela, tacto suave y sin cuarteaduras.</span>
                </div>
              </div>

              <div className="uk-studio-feat">
                <div className="uk-studio-feat-icon">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                </div>
                <div>
                  <span className="uk-studio-feat-title">BORDADO PROFESIONAL DE PRECISIÓN</span>
                  <span className="uk-studio-feat-sub">Acabado textil elegante con hilos resistentes para logotipos, textos e insignias en pecho, espalda o manga.</span>
                </div>
              </div>
            </div>

            <div className="uk-studio-cta-row">
              <Link to="/personalizar" className="uk-btn-emerald">
                <span>ABRIR ESTUDIO DE DISEÑO</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7M7 7h10v10"/>
                </svg>
              </Link>
              <Link to="/items" className="uk-btn-ghost">
                <span>EXPLORAR PRENDAS BASE</span>
              </Link>
            </div>
          </div>

          {/* Ventana Interactiva del Estudio */}
          <div className="uk-studio-window">
            <div className="uk-window-topbar">
              <div className="uk-window-dots">
                <span className="uk-w-dot" style={{ background: '#ef4444' }} />
                <span className="uk-w-dot" style={{ background: '#f59e0b' }} />
                <span className="uk-w-dot" style={{ background: '#10b981' }} />
              </div>
              <span className="uk-window-title">ESTUDIO_CUSTOM_V2.4 // LIENZO</span>
              <div className="uk-window-tags">
                <span className="uk-w-tag">VISTA 360°</span>
                <span className="uk-w-tag is-emerald">RENDER: ACTIVO</span>
              </div>
            </div>

            <div className="uk-window-body">
              <div className="uk-canvas-stage">
                <img
                  src={currentMockupSrc}
                  alt={studioTone.label}
                  className="uk-canvas-garment"
                  style={studioTone.tint ? { filter: studioTone.tint } : undefined}
                />

                <div className="uk-canvas-zone" style={studioView.boxStyle}>
                  <img src="/img/logo_emblema.png" alt="Logo Emblema" />
                  <span className="uk-canvas-zone-lbl">
                    {studioView.zoneLabel}
                    <br />
                    {studioView.zoneSize}
                  </span>
                </div>

                <div className="uk-canvas-views">
                  {STUDIO_VIEWS.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      className={`uk-view-btn ${studioView.id === v.id ? 'is-active' : ''}`}
                      onClick={() => setStudioView(v)}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="uk-window-controls">
                <div>
                  <span className="uk-w-field-lbl">TÉCNICA SELECCIONADA (CLIC PARA CAMBIAR)</span>
                  <button
                    type="button"
                    className="uk-w-tech-box"
                    onClick={() =>
                      setStudioTechIdx((i) => (i + 1) % STUDIO_TECHNIQUES.length)
                    }
                  >
                    <span className="uk-w-tech-title">
                      {STUDIO_TECHNIQUES[studioTechIdx].title}
                    </span>
                    <span className="uk-w-tech-sub">
                      {STUDIO_TECHNIQUES[studioTechIdx].subtitle}
                    </span>
                  </button>
                </div>

                <div>
                  <span className="uk-w-field-lbl">COLOR DE PRENDA</span>
                  <div className="uk-w-swatches">
                    {STUDIO_TONES.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        className={`uk-w-swatch ${studioTone.id === t.id ? 'is-active' : ''}`}
                        style={{ backgroundColor: t.hex }}
                        onClick={() => setStudioTone(t)}
                        title={t.label}
                        aria-label={t.label}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <span className="uk-w-field-lbl">SUBIR DISEÑO</span>
                  <Link to="/personalizar" className="uk-w-upload-box">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    <span>ARCHIVO PNG, JPG O SVG</span>
                  </Link>
                </div>

                <div>
                  <div className="uk-w-price-row">
                    <span className="uk-w-price-lbl">PRECIO ESTIMADO</span>
                    <span className="uk-w-price-val">C$ 580</span>
                  </div>
                  <Link to="/personalizar" className="uk-w-cta">
                    DISEÑAR AHORA
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECCIÓN 4: PRODUCTOS MÁS POPULARES ── */}
      <section className="uk-popular-section">
        <div className="uk-sec-header">
          <div>
            <span className="uk-pop-pill">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                <polyline points="17 6 23 6 23 12"/>
              </svg>
              <span>TENDENCIAS // MÁS VENDIDOS</span>
            </span>
            <h2 className="uk-sec-title">PRODUCTOS MÁS POPULARES</h2>
            <p className="uk-sec-desc" style={{ marginTop: '6px' }}>
              Básicos indispensables en gramajes prémium con cortes estructurados y tejido optimizado para DTF, sublimación y bordado de alta definición.
            </p>
          </div>

          <div className="uk-filter-pills">
            {[
              { id: 'todas', label: 'TODOS' },
              { id: '2', label: 'HOODIES' },
              { id: '4', label: 'SUÉTERES' },
              { id: '1', label: 'CAMISETAS' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`uk-filter-btn ${activeFilter === tab.id ? 'is-active' : ''}`}
                onClick={() => setActiveFilter(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="uk-popular-grid">
          {filteredTopProducts.map((product, index) => {
            const imgSrc = product.image?.startsWith('http')
              ? product.image
              : `/img/${product.image}`
            const cutLabel =
              CLASIFICATION_LABELS[product.clasification] || 'CORTE BOXY UNISEX'

            const topBadges = [
              { top: 'TOP VENTAS', topBg: '#10b981', topColor: '#ffffff', gsm: '450 GSM' },
              { top: 'FAVORITO', topBg: '#0d9488', topColor: '#ffffff', gsm: '400 GSM' },
              { top: 'ESENCIAL', topBg: '#ffffff', topColor: '#111827', gsm: '240 GSM' }
            ]
            const b = topBadges[index % topBadges.length]

            const swatchSets = [
              ['#0f172a', '#64748b', '#f8fafc'],
              ['#065f46', '#f5f5f4', '#0f172a'],
              ['#f8fafc', '#0f172a', '#64748b']
            ]
            const dots = swatchSets[index % swatchSets.length]

            return (
              <div key={product.id_item || index} className="uk-pop-card">
                <div className="uk-pop-media">
                  <div className="uk-pop-badges">
                    <span
                      className="uk-pop-badge"
                      style={{ backgroundColor: b.topBg, color: b.topColor }}
                    >
                      {b.top}
                    </span>
                    <span
                      className="uk-pop-badge"
                      style={{ backgroundColor: '#ffffff', color: '#111827' }}
                    >
                      {b.gsm}
                    </span>
                  </div>

                  <Link
                    to={`/items/${product.id_item}`}
                    style={{ width: '100%', height: '100%', display: 'block' }}
                  >
                    <img
                      src={imgSrc}
                      alt={product.name}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = '/img/item-1.png'
                      }}
                    />
                  </Link>

                  <Link
                    to="/personalizar"
                    className="uk-pop-fab"
                    title="Personalizar prenda"
                    aria-label="Personalizar prenda"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 19l7-7 3 3-7 7-3-3z"/>
                      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
                    </svg>
                  </Link>
                </div>

                <div className="uk-pop-body">
                  <div className="uk-pop-top-row">
                    <span className="uk-pop-cat">{cutLabel}</span>
                    <span className="uk-pop-price">C$ {product.price}</span>
                  </div>

                  <Link to={`/items/${product.id_item}`} className="uk-pop-title">
                    {product.name}
                  </Link>
                  <p className="uk-pop-desc">{product.description}</p>

                  <div className="uk-pop-footer">
                    <div className="uk-pop-swatches">
                      {dots.map((hex, i) => (
                        <span
                          key={i}
                          className="uk-col-dot"
                          style={{ backgroundColor: hex }}
                        />
                      ))}
                      <span>+4 Tonos</span>
                    </div>

                    <Link to={`/items/${product.id_item}`} className="uk-pop-link">
                      <span>PERSONALIZAR</span>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="uk-explore-all-wrap">
          <Link to="/items" className="uk-explore-all-btn">
            <span>EXPLORAR TODO EL CATÁLOGO</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </section>
    </div>
  )
}
