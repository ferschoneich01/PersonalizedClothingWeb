import { useEffect, useState, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { addItem, getItems, updateItem, deleteItem, getCategories } from '../../api/itemsApi'
import Swal from 'sweetalert2'

const GENDER_LABEL = { 1: 'Hombre', 2: 'Mujer' }
const PAGE_SIZE = 10

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dzlbg8ni6/image/upload'
const CLOUDINARY_UPLOAD_PRESET = 'ss1j77hf'

async function uploadToCloudinary(file) {
  const uploadData = new FormData()
  uploadData.append('file', file)
  uploadData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
  const res = await fetch(CLOUDINARY_URL, { method: 'POST', body: uploadData })
  const data = await res.json()
  return data.secure_url
}

const capitalize = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

// ─────────────────────────────────────────────────────────────
// Iconos SVG de estilo consistente (sin emojis ni símbolos genéricos)
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

const IconShirt = (p) => (
  <Svg {...p}>
    <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
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

const IconUpload = (p) => (
  <Svg {...p}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
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

const IconStar = (p) => (
  <Svg {...p}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </Svg>
)

const IconImage = (p) => (
  <Svg {...p}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </Svg>
)

const IconTag = (p) => (
  <Svg {...p}>
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </Svg>
)

const IconDollar = (p) => (
  <Svg {...p}>
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </Svg>
)

const IconFileText = (p) => (
  <Svg {...p}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </Svg>
)

const EMPTY_FORM = {
  name: '',
  price: '',
  category: '1', // Género (1: Hombre, 2: Mujer)
  clasification: '1', // Categoría de prenda (id_clasification)
  image: '',
  images: [], // Lista de hasta 5 imágenes
  description: '',
}

export default function AdminAddItem() {
  const formRef = useRef(null)

  // Datos del backend
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Filtros
  const [categoryFilter, setCategoryFilter] = useState('todos')
  const [genderFilter, setGenderFilter] = useState('todos')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Estado del Formulario (Crear o Editar)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState(null)

  // Carga de datos inicial
  const fetchData = async (isManual = false) => {
    if (isManual) setRefreshing(true)
    else setLoading(true)

    try {
      // 1. Cargar artículos
      let itemsList = []
      try {
        const itemsRes = await getItems()
        itemsList = itemsRes.data || []
        setItems(itemsList)
      } catch (err) {
        console.error('Error cargando artículos:', err)
      }

      // 2. Cargar categorías dinámicas
      try {
        const catsRes = await getCategories()
        const fetchedCats = catsRes.data || []
        if (Array.isArray(fetchedCats) && fetchedCats.length > 0) {
          setCategories(fetchedCats)
          setFormData(prev => ({
            ...prev,
            clasification: prev.clasification || String(fetchedCats[0].id_clasification),
          }))
        }
      } catch (catErr) {
        console.warn('Endpoint de categorías no disponible o 404, usando fallback:', catErr)
        const defaultCats = [
          { id_clasification: 1, name: 'camisetas' },
          { id_clasification: 2, name: 'sudadera' },
          { id_clasification: 3, name: 'croptop' },
          { id_clasification: 4, name: 'sueter' },
        ]
        setCategories(defaultCats)
      }

      if (itemsList.length === 0 && isManual) {
        Swal.fire({
          icon: 'warning',
          title: 'Sin artículos',
          text: 'No se encontraron artículos en la base de datos.',
        })
      }
    } catch (error) {
      console.error('Error general fetching data:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: 'No se pudieron cargar los datos del catálogo.',
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Diccionario rápido de ID categoría -> Nombre
  const categoryMap = useMemo(() => {
    const map = {}
    categories.forEach(c => {
      map[c.id_clasification] = c.name
    })
    return map
  }, [categories])

  const getCategoryName = (id) => {
    const name = categoryMap[id]
    if (!name) return `Cat #${id}`
    return capitalize(name)
  }

  // Conteo dinámico de prendas por categoría para la barra superior
  const categoryStats = useMemo(() => {
    const stats = {
      todos: items.length,
    }
    categories.forEach(c => {
      stats[c.id_clasification] = items.filter(
        i => String(i.clasification) === String(c.id_clasification)
      ).length
    })
    return stats
  }, [items, categories])

  // Filtrado de artículos
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesCat =
        categoryFilter === 'todos' ||
        String(item.clasification) === String(categoryFilter)

      const matchesGender =
        genderFilter === 'todos' || String(item.category) === String(genderFilter)

      const matchesStatus =
        statusFilter === 'todos' ||
        (statusFilter === 'activos' && item.status_item === 1) ||
        (statusFilter === 'inactivos' && item.status_item === 0)

      const term = searchTerm.toLowerCase().trim()
      const matchesSearch =
        !term ||
        item.name?.toLowerCase().includes(term) ||
        item.description?.toLowerCase().includes(term) ||
        String(item.price).includes(term)

      return matchesCat && matchesGender && matchesStatus && matchesSearch
    })
  }, [items, categoryFilter, genderFilter, statusFilter, searchTerm])

  // Paginación
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const paginatedItems = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE
    return filteredItems.slice(start, start + PAGE_SIZE)
  }, [filteredItems, safePage])

  useEffect(() => {
    setCurrentPage(1)
  }, [categoryFilter, genderFilter, statusFilter, searchTerm])

  // Manejo de formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Carga de MÚLTIPLES imágenes (hasta 5)
  const handleImagesUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const currentImgs = Array.isArray(formData.images) && formData.images.length > 0
      ? formData.images
      : (formData.image ? [formData.image] : [])

    const availableSlots = 5 - currentImgs.length

    if (availableSlots <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Límite alcanzado',
        text: 'Ya has alcanzado el límite de 5 fotografías para este artículo.',
      })
      return
    }

    const filesToUpload = files.slice(0, availableSlots)
    if (files.length > availableSlots) {
      Swal.fire({
        icon: 'info',
        title: 'Límite de 5 imágenes',
        text: `Solo se subirán las primeras ${availableSlots} fotografía(s) seleccionadas.`,
        timer: 2200,
        showConfirmButton: false,
      })
    }

    setUploading(true)
    try {
      const uploadPromises = filesToUpload.map(f => uploadToCloudinary(f))
      const urls = await Promise.all(uploadPromises)

      setFormData(prev => {
        const existing = Array.isArray(prev.images) && prev.images.length > 0
          ? prev.images
          : (prev.image ? [prev.image] : [])
        const combined = [...existing, ...urls].slice(0, 5)
        return {
          ...prev,
          images: combined,
          image: combined[0] || '',
        }
      })

      Swal.fire({
        icon: 'success',
        title: urls.length > 1 ? `${urls.length} imágenes cargadas` : 'Imagen cargada',
        text: 'La primera foto se utiliza como portada principal del producto.',
        timer: 1600,
        showConfirmButton: false,
      })
    } catch (error) {
      console.error(error)
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudieron subir las imágenes a Cloudinary.' })
    } finally {
      setUploading(false)
      if (e.target) e.target.value = ''
    }
  }

  // Establecer una imagen como principal (mueve al índice 0)
  const setPrimaryImage = (index) => {
    if (index === 0) return
    setFormData(prev => {
      const list = [...(prev.images || [])]
      const [chosen] = list.splice(index, 1)
      const updated = [chosen, ...list]
      return {
        ...prev,
        images: updated,
        image: updated[0] || '',
      }
    })
  }

  // Eliminar una imagen de la lista
  const removeImage = (index) => {
    setFormData(prev => {
      const updated = (prev.images || []).filter((_, i) => i !== index)
      return {
        ...prev,
        images: updated,
        image: updated[0] || '',
      }
    })
  }

  const startEdit = (item) => {
    setEditingId(item.id_item)
    const itemImgs = Array.isArray(item.images) && item.images.length > 0
      ? item.images
      : (item.image ? [item.image] : [])

    setFormData({
      name: item.name || '',
      price: item.price || '',
      category: String(item.category || '1'),
      clasification: String(item.clasification || (categories[0]?.id_clasification || '1')),
      image: itemImgs[0] || item.image || '',
      images: itemImgs,
      description: item.description || '',
    })

    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setFormData({
      ...EMPTY_FORM,
      clasification: String(categories[0]?.id_clasification || '1'),
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      Swal.fire({ icon: 'warning', title: 'Campo requerido', text: 'Por favor ingresa el nombre del artículo.' })
      return
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      Swal.fire({ icon: 'warning', title: 'Precio inválido', text: 'Ingresa un precio mayor a 0.' })
      return
    }

    const currentImages = Array.isArray(formData.images) && formData.images.length > 0
      ? formData.images
      : (formData.image ? [formData.image] : [])

    if (currentImages.length === 0) {
      Swal.fire({ icon: 'warning', title: 'Imagen requerida', text: 'Por favor sube al menos una imagen para el producto.' })
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        image: currentImages[0],
        images: currentImages,
        price: parseFloat(formData.price),
        clasification: parseInt(formData.clasification),
        category: parseInt(formData.category),
      }

      if (editingId) {
        // Actualizar
        await updateItem(editingId, {
          ...payload,
          id_item: editingId,
        })
        Swal.fire({
          icon: 'success',
          title: 'Artículo actualizado',
          text: `"${formData.name}" ha sido actualizado con éxito.`,
          timer: 1500,
          showConfirmButton: false,
        })
        cancelEdit()
      } else {
        // Crear nuevo
        await addItem({
          ...payload,
          status_item: 1,
        })
        Swal.fire({
          icon: 'success',
          title: 'Artículo registrado',
          text: `"${formData.name}" se agregó al catálogo exitosamente.`,
          timer: 1500,
          showConfirmButton: false,
        })
        setFormData({
          ...EMPTY_FORM,
          clasification: String(categories[0]?.id_clasification || '1'),
        })
      }
      fetchData()
    } catch (error) {
      console.error(error)
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo guardar el artículo.' })
    } finally {
      setSubmitting(false)
    }
  }

  // Activar / Desactivar
  const toggleActive = async (item) => {
    const newStatus = item.status_item === 1 ? 0 : 1
    try {
      await updateItem(item.id_item, { ...item, status_item: newStatus })
      fetchData()
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cambiar el estado del artículo.' })
    }
  }

  // Eliminar
  const handleDelete = (item) => {
    Swal.fire({
      title: `¿Eliminar "${item.name}"?`,
      text: 'El artículo y todas sus fotografías asociadas serán removidos del catálogo.',
      icon: 'warning',
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
          await deleteItem(item.id_item)
          Swal.fire({
            icon: 'success',
            title: 'Eliminado',
            text: 'El artículo fue retirado del catálogo.',
            timer: 1500,
            showConfirmButton: false,
          })
          if (editingId === item.id_item) cancelEdit()
          fetchData()
        } catch (error) {
          Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar el artículo.' })
        }
      }
    })
  }

  const getFullImgUrl = (img) => {
    if (!img) return 'https://via.placeholder.com/150?text=Prenda'
    if (img.startsWith('http')) return img
    return `https://res.cloudinary.com/dzlbg8ni6/image/upload/${img}`
  }

  // Modal para ver todas las fotos de un artículo en la tabla
  const openGalleryModal = (item) => {
    const imgs = Array.isArray(item.images) && item.images.length > 0
      ? item.images
      : (item.image ? [item.image] : [])

    if (imgs.length === 1) {
      Swal.fire({
        imageUrl: getFullImgUrl(imgs[0]),
        imageAlt: item.name,
        title: item.name,
        showConfirmButton: false,
        showCloseButton: true,
        width: 'auto',
        padding: '1em',
      })
      return
    }

    const htmlContent = `
      <div style="display:flex; flex-direction:column; gap:14px; max-height:75vh; overflow-y:auto; padding:8px 4px;">
        <div style="font-size:12.5px; color:#64748b; font-weight:600; text-align:left;">
          Total: ${imgs.length} fotografías en catálogo
        </div>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:10px;">
          ${imgs.map((src, i) => `
            <div style="position:relative; aspect-ratio:1; border-radius:8px; overflow:hidden; border:2px solid ${i === 0 ? '#10b981' : '#e2e8f0'}; background:#f8fafc;">
              <img src="${getFullImgUrl(src)}" style="width:100%; height:100%; object-fit:cover;" />
              ${i === 0 ? '<span style="position:absolute; bottom:4px; left:4px; background:#10b981; color:#fff; font-size:9px; font-weight:800; padding:2px 6px; border-radius:4px; letter-spacing:0.4px;">PORTADA</span>' : ''}
              <span style="position:absolute; top:4px; right:4px; background:rgba(15,23,42,0.75); color:#fff; font-size:10px; font-weight:700; width:20px; height:20px; border-radius:50%; display:flex; align-items:center; justify-content:center;">${i+1}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `

    Swal.fire({
      title: item.name,
      html: htmlContent,
      showConfirmButton: false,
      showCloseButton: true,
      width: '600px',
    })
  }

  // Lista de imágenes activas en el formulario
  const formImages = Array.isArray(formData.images) && formData.images.length > 0
    ? formData.images
    : (formData.image ? [formData.image] : [])

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
          padding: 6px 14px;
          font-size: 12px;
          font-weight: 600;
          color: var(--pc-slate-700);
          cursor: pointer;
          transition: all 0.15s ease;
          font-family: inherit;
          text-decoration: none;
        }
        .pc-btn-ghost:hover { border-color: var(--pc-teal); color: var(--pc-teal-dark); }
        .pc-btn-ghost:disabled { opacity: 0.6; cursor: wait; }
        .pc-spin { animation: pc-spin 0.8s linear infinite; }
        @keyframes pc-spin { to { transform: rotate(360deg); } }

        /* ───────── Pestañas superiores DINÁMICAS ───────── */
        .pc-channel-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }
        .pc-tabs-group {
          display: flex;
          align-items: center;
          gap: 10px;
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
        .pc-seg-count {
          font-size: 11px;
          font-weight: 700;
          background: rgba(15, 23, 42, 0.07);
          color: var(--pc-slate-700);
          padding: 1px 7px;
          border-radius: 10px;
        }
        .pc-seg-btn.is-active .pc-seg-count { background: var(--pc-ink); color: #fff; }

        .pc-btn-manage-cats {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: #ecfdf5;
          color: #059669;
          border: 1px dashed #6ee7b7;
          border-radius: 18px;
          padding: 6px 14px;
          font-size: 12px;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.15s ease;
        }
        .pc-btn-manage-cats:hover {
          background: #d1fae5;
          border-color: #34d399;
          color: #047857;
        }

        .pc-channel-summary {
          font-size: 12.5px;
          color: var(--pc-slate-500);
        }
        .pc-channel-summary strong { color: var(--pc-ink); }

        /* ───────── Layout en 2 columnas: Catálogo y Formulario Extendido ───────── */
        .pc-split-catalog {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 460px;
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
          padding: 15px 22px;
          background: #0f172a;
          color: #fff;
          font-size: 13.5px;
          font-weight: 700;
          letter-spacing: -0.2px;
        }

        /* ───────── Toolbar / Filtros ───────── */
        .pc-section {
          padding: 14px 18px;
          border-bottom: 1px solid var(--pc-slate-200);
        }
        .pc-toolbar-grid {
          display: grid;
          grid-template-columns: 1fr 140px 120px;
          gap: 10px;
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
        .pc-input, .pc-select, .pc-textarea {
          width: 100%;
          background: #fff;
          border: 1px solid var(--pc-slate-300);
          border-radius: 8px;
          padding: 9px 12px;
          font-size: 13px;
          color: var(--pc-ink);
          font-family: inherit;
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .pc-input.has-icon { padding-left: 34px; }
        .pc-input:focus, .pc-select:focus, .pc-textarea:focus {
          border-color: var(--pc-teal);
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
        }

        /* ───────── Tabla de Artículos ───────── */
        .pc-items-table {
          display: flex;
          flex-direction: column;
        }
        .pc-item-row {
          display: grid;
          grid-template-columns: 60px 1fr 120px 90px 90px 170px;
          align-items: center;
          gap: 12px;
          padding: 12px 18px;
          border-bottom: 1px solid var(--pc-slate-100);
          transition: background 0.12s ease;
        }
        .pc-item-row:last-child { border-bottom: none; }
        .pc-item-row:not(.is-header):hover { background: #f8fafc; }
        .pc-item-row.is-header {
          background: #f8fafc;
          border-bottom: 1px solid var(--pc-slate-200);
          font-size: 11px;
          font-weight: 700;
          color: var(--pc-slate-500);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 10px 18px;
        }

        .pc-thumb-container {
          position: relative;
          display: inline-block;
          width: 48px;
          height: 48px;
        }
        .pc-prod-thumb {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          object-fit: cover;
          border: 1.5px solid var(--pc-slate-200);
          background: #fff;
          cursor: zoom-in;
          transition: transform 0.15s ease;
          display: block;
        }
        .pc-prod-thumb:hover { transform: scale(1.08); }
        .pc-badge-photo-count {
          position: absolute;
          bottom: -3px;
          right: -3px;
          background: #0f172a;
          color: #ffffff;
          font-size: 9.5px;
          font-weight: 800;
          padding: 1px 4.5px;
          border-radius: 8px;
          border: 1.5px solid #ffffff;
          line-height: 1.1;
          box-shadow: 0 1px 3px rgba(0,0,0,0.25);
        }

        .pc-prod-name {
          font-size: 13.5px;
          font-weight: 700;
          color: var(--pc-ink);
          margin-bottom: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .pc-prod-desc-snip {
          font-size: 12px;
          color: var(--pc-slate-400);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .pc-badge-cat {
          display: inline-block;
          background: #f1f5f9;
          color: var(--pc-slate-700);
          border: 1px solid var(--pc-slate-200);
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
        }

        .pc-badge-clas {
          display: inline-block;
          background: #eef2ff;
          color: #4f46e5;
          border: 1px solid #c7d2fe;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
        }

        .pc-price-tag {
          font-size: 13.5px;
          font-weight: 800;
          color: var(--pc-ink);
        }

        .pc-actions-cell {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 6px;
        }

        .pc-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          border: 1px solid transparent;
          transition: all 0.15s ease;
          background: transparent;
        }
        .pc-status-pill.is-active {
          background: #f0fdf4;
          color: #15803d;
          border-color: #bbf7d0;
        }
        .pc-status-pill.is-inactive {
          background: #fef2f2;
          color: #b91c1c;
          border-color: #fecaca;
        }
        .pc-dot-status {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .pc-btn-edit {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #fff;
          border: 1px solid var(--pc-slate-300);
          color: var(--pc-slate-700);
          border-radius: 6px;
          padding: 4px 8px;
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
          width: 26px;
          height: 26px;
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

        /* ───────── Formulario Extendido y Galería Profesional de Fotos ───────── */
        .pc-form-sticky {
          position: sticky;
          top: 76px;
        }
        .pc-form-body {
          padding: 22px 24px 28px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .pc-form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .pc-form-head-label {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .pc-form-label {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11.5px;
          font-weight: 700;
          color: var(--pc-slate-700);
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }
        .pc-photos-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 700;
          color: var(--pc-slate-500);
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          padding: 2px 8px;
          border-radius: 12px;
        }
        .pc-form-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        /* Cuadrícula de fotos en el formulario */
        .pc-multi-imgs-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }
        .pc-img-card {
          position: relative;
          aspect-ratio: 1;
          border-radius: 9px;
          overflow: hidden;
          border: 1.5px solid var(--pc-slate-200);
          background: #f8fafc;
          transition: all 0.15s ease;
        }
        .pc-img-card:hover {
          border-color: #94a3b8;
        }
        .pc-img-card.is-primary {
          border-color: #10b981;
          box-shadow: 0 0 0 2.5px rgba(16, 185, 129, 0.25);
        }
        .pc-img-card-thumb {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .pc-img-card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(15,23,42,0.55) 0%, transparent 42%, rgba(15,23,42,0.75) 100%);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 5px;
        }
        .pc-tag-primary {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #10b981;
          color: #ffffff;
          font-size: 9px;
          font-weight: 800;
          padding: 2.5px 6px;
          border-radius: 5px;
          align-self: flex-start;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.25);
        }
        .pc-btn-make-primary {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(2px);
          color: #ffffff;
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 5px;
          padding: 3px 6px;
          font-size: 9px;
          font-weight: 700;
          cursor: pointer;
          align-self: flex-start;
          transition: all 0.15s ease;
        }
        .pc-btn-make-primary:hover {
          background: #10b981;
          border-color: #10b981;
        }
        .pc-btn-remove-img {
          position: absolute;
          top: 5px;
          right: 5px;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(2px);
          color: #ffffff;
          border: 1px solid rgba(255,255,255,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .pc-btn-remove-img:hover {
          background: #dc2626;
          border-color: #dc2626;
          transform: scale(1.08);
        }

        .pc-add-more-card {
          aspect-ratio: 1;
          border: 2px dashed #cbd5e1;
          border-radius: 9px;
          background: #fafbfc;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
          cursor: pointer;
          text-align: center;
          padding: 8px;
          transition: all 0.18s ease;
        }
        .pc-add-more-card:hover {
          border-color: #10b981;
          background: #f0fdf4;
          transform: translateY(-1px);
        }
        .pc-add-more-icon-wrap {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #ecfdf5;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #059669;
        }
        .pc-add-more-label {
          font-size: 10.5px;
          font-weight: 700;
          color: var(--pc-ink);
        }
        .pc-add-more-count {
          font-size: 9.5px;
          color: var(--pc-slate-400);
          font-weight: 600;
        }

        .pc-upload-area {
          border: 2px dashed var(--pc-slate-300);
          border-radius: 9px;
          padding: 20px 14px;
          text-align: center;
          background: #fafbfc;
          cursor: pointer;
          transition: border-color 0.15s ease, background 0.15s ease;
        }
        .pc-upload-area:hover {
          border-color: var(--pc-teal);
          background: #f0fdf4;
        }

        .pc-photos-hint {
          display: flex;
          align-items: flex-start;
          gap: 6px;
          font-size: 11px;
          color: var(--pc-slate-500);
          line-height: 1.4;
          margin-top: 4px;
        }

        /* Textarea expandida hacia abajo */
        .pc-textarea {
          min-height: 140px;
          resize: vertical;
          line-height: 1.55;
          font-size: 13px;
        }

        .pc-btn-save-item {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          background: #0f172a;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          padding: 13px 18px;
          font-size: 13.5px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.15s ease, transform 0.1s ease;
          box-shadow: 0 3px 8px rgba(15, 23, 42, 0.18);
          font-family: inherit;
          margin-top: 4px;
        }
        .pc-btn-save-item:hover:not(:disabled) {
          background: #1e293b;
          transform: translateY(-1px);
        }
        .pc-btn-save-item:disabled { opacity: 0.6; cursor: wait; }

        /* Paginación */
        .pc-pager {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 10px 18px;
          border-top: 1px solid var(--pc-slate-200);
          background: #fafbfc;
          font-size: 12px;
          color: var(--pc-slate-500);
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

        .pc-empty {
          text-align: center;
          padding: 60px 20px;
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
        @media (max-width: 1080px) {
          .pc-split-catalog { grid-template-columns: 1fr; }
          .pc-form-sticky { position: static; order: -1; }
        }
        @media (max-width: 768px) {
          .pc-admin { padding: 14px 14px 40px; }
          .pc-toolbar-grid { grid-template-columns: 1fr; }
          .pc-item-row { grid-template-columns: 50px minmax(0, 1fr) 80px; }
          .pc-item-row.is-header > span:nth-child(3),
          .pc-item-row.is-header > span:nth-child(4),
          .pc-item-row.is-header > span:nth-child(6) { display: none; }
          .pc-item-row > div.pc-hide-mobile { display: none; }
          .pc-item-row > div.pc-actions-cell { grid-column: 1 / -1; justify-content: flex-start; margin-top: 4px; }
        }
      `}</style>

      {/* ═══════════ ENCABEZADO ═══════════ */}
      <div className="pc-page-head">
        <div>
          <div className="pc-eyebrow">
            <span className="pc-pill-tag">
              <span className="pc-live-dot" />
              <span>Catálogo de Productos</span>
            </span>
            <span className="pc-eyebrow-desc">• Hasta 5 fotos por artículo y portada principal</span>
          </div>
          <h1 className="pc-title">Gestión de Artículos y Catálogo</h1>
          <p className="pc-subtitle">
            Administra tus prendas, organiza las fotografías del producto, escoge la portada y gestiona tus colecciones dinámicamente.
          </p>
        </div>

        <div className="pc-head-actions">
          <Link to="/admin/categories" className="pc-btn-ghost">
            <IconGrid size={13} />
            <span>Gestionar Categorías</span>
          </Link>

          <button
            type="button"
            className="pc-btn-ghost"
            onClick={() => fetchData(true)}
            disabled={refreshing || loading}
          >
            <IconRefresh size={13} sw={2.2} style={refreshing ? { animation: 'pc-spin 0.8s linear infinite' } : undefined} />
            <span>{refreshing ? 'Actualizando…' : 'Actualizar'}</span>
          </button>
        </div>
      </div>

      {/* ═══════════ PESTAÑAS DINÁMICAS DE CATEGORÍA ═══════════ */}
      <div className="pc-channel-bar">
        <div className="pc-tabs-group">
          <div className="pc-segmented" role="tablist" aria-label="Categorías del catálogo">
            <button
              type="button"
              role="tab"
              aria-selected={categoryFilter === 'todos'}
              className={`pc-seg-btn${categoryFilter === 'todos' ? ' is-active' : ''}`}
              onClick={() => setCategoryFilter('todos')}
            >
              <IconGrid size={14} />
              <span>Todas</span>
              <span className="pc-seg-count">{categoryStats.todos}</span>
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id_clasification}
                type="button"
                role="tab"
                aria-selected={String(categoryFilter) === String(cat.id_clasification)}
                className={`pc-seg-btn${String(categoryFilter) === String(cat.id_clasification) ? ' is-active' : ''}`}
                onClick={() => setCategoryFilter(String(cat.id_clasification))}
              >
                <IconShirt size={14} />
                <span>{capitalize(cat.name)}</span>
                <span className="pc-seg-count">{categoryStats[cat.id_clasification] || 0}</span>
              </button>
            ))}
          </div>

          <Link to="/admin/categories" className="pc-btn-manage-cats" title="Añadir o editar categorías">
            <IconPlus size={12} sw={2.4} />
            <span>Nueva Categoría</span>
          </Link>
        </div>

        <div className="pc-channel-summary">
          <span>Mostrando: <strong>{filteredItems.length}</strong> de {items.length} artículos</span>
        </div>
      </div>

      {/* ═══════════ LAYOUT: TABLA + FORMULARIO EXTENDIDO ═══════════ */}
      <div className="pc-split-catalog">

        {/* ── COLUMNA IZQUIERDA: LISTA Y GESTIÓN DE ARTÍCULOS ── */}
        <div className="pc-card">

          {/* Barra de herramientas */}
          <div className="pc-section">
            <div className="pc-toolbar-grid">
              <div className="pc-search-wrap">
                <IconSearch size={14} />
                <input
                  className="pc-input has-icon"
                  type="text"
                  placeholder="Buscar por nombre, descripción o precio…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <select
                className="pc-select"
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
              >
                <option value="todos">Todo Género</option>
                <option value="1">Hombre</option>
                <option value="2">Mujer</option>
              </select>

              <select
                className="pc-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="todos">Todos</option>
                <option value="activos">Activos</option>
                <option value="inactivos">Inactivos</option>
              </select>
            </div>
          </div>

          {/* Tabla de artículos */}
          <div className="pc-items-table">
            <div className="pc-item-row is-header">
              <span>Fotos</span>
              <span>Artículo</span>
              <span>Categoría</span>
              <span>Sección</span>
              <span>Precio</span>
              <span style={{ textAlign: 'right' }}>Acciones</span>
            </div>

            {loading ? (
              <div className="pc-empty">
                <div style={{ animation: 'pc-spin 1s linear infinite', display: 'inline-block', marginBottom: '8px' }}>
                  <IconRefresh size={22} />
                </div>
                <div>Cargando catálogo…</div>
              </div>
            ) : paginatedItems.length === 0 ? (
              <div className="pc-empty">
                <IconCheck size={26} style={{ color: '#94a3b8', marginBottom: '6px' }} />
                <div style={{ fontWeight: 700, color: '#0f172a' }}>No hay artículos que coincidan</div>
                <div style={{ fontSize: '12px', marginTop: '2px' }}>Prueba ajustando los filtros de categoría o búsqueda.</div>
              </div>
            ) : (
              paginatedItems.map((item) => {
                const itemImgs = Array.isArray(item.images) && item.images.length > 0
                  ? item.images
                  : (item.image ? [item.image] : [])
                const primaryThumb = itemImgs[0] || item.image

                return (
                  <div key={item.id_item} className="pc-item-row">
                    <div className="pc-thumb-container">
                      <img
                        src={getFullImgUrl(primaryThumb)}
                        alt={item.name}
                        className="pc-prod-thumb"
                        onClick={() => openGalleryModal(item)}
                        title="Clic para ver galería completa de fotos"
                      />
                      {itemImgs.length > 1 && (
                        <span className="pc-badge-photo-count" title={`${itemImgs.length} fotos registradas`}>
                          {itemImgs.length}
                        </span>
                      )}
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div className="pc-prod-name" title={item.name}>{item.name}</div>
                      <div className="pc-prod-desc-snip" title={item.description}>{item.description || 'Sin descripción adicional'}</div>
                    </div>

                    <div className="pc-hide-mobile">
                      <span className="pc-badge-cat">
                        {getCategoryName(item.clasification)}
                      </span>
                    </div>

                    <div className="pc-hide-mobile">
                      <span className="pc-badge-clas">
                        {GENDER_LABEL[item.category] || 'Unisex'}
                      </span>
                    </div>

                    <div>
                      <span className="pc-price-tag">C${item.price}</span>
                    </div>

                    <div className="pc-actions-cell">
                      <button
                        type="button"
                        className={`pc-status-pill ${item.status_item === 1 ? 'is-active' : 'is-inactive'}`}
                        onClick={() => toggleActive(item)}
                        title="Clic para cambiar disponibilidad"
                      >
                        <span className="pc-dot-status" style={{ background: item.status_item === 1 ? '#10b981' : '#dc2626' }} />
                        <span>{item.status_item === 1 ? 'Activo' : 'Oculto'}</span>
                      </button>

                      <button
                        type="button"
                        className="pc-btn-edit"
                        onClick={() => startEdit(item)}
                        title="Editar artículo y sus fotografías"
                      >
                        <IconEdit size={12} />
                        <span>Editar</span>
                      </button>

                      <button
                        type="button"
                        className="pc-btn-delete"
                        onClick={() => handleDelete(item)}
                        title="Eliminar artículo"
                      >
                        <IconTrash size={12} />
                      </button>
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

        {/* ── COLUMNA DERECHA: FORMULARIO AGREGAR / EDITAR EXTENDIDO ── */}
        <div className="pc-form-sticky" ref={formRef}>
          <div className="pc-card">

            <div className="pc-card-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '7px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#10b981'
                }}>
                  {editingId ? <IconEdit size={13} sw={2.2} /> : <IconPlus size={14} sw={2.4} />}
                </div>
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 800 }}>
                    {editingId ? 'Editar Artículo' : 'Nuevo Artículo'}
                  </div>
                  {editingId && (
                    <div style={{ fontSize: '10.5px', color: '#94a3b8', fontWeight: 600 }}>
                      ID #{editingId}
                    </div>
                  )}
                </div>
              </div>

              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#ffffff',
                    borderRadius: '7px',
                    padding: '4px 10px',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    transition: 'all 0.15s ease'
                  }}
                  title="Cancelar edición y volver a nuevo artículo"
                >
                  <IconClose size={12} sw={2.4} />
                  <span>Cancelar</span>
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="pc-form-body">

              {/* Fotografías del Artículo (Hasta 5 con portada) */}
              <div className="pc-form-group">
                <div className="pc-form-head-label">
                  <label className="pc-form-label">
                    <IconImage size={13} sw={2.2} />
                    <span>Fotografías del Artículo</span>
                  </label>
                  <span className="pc-photos-badge">
                    <IconImage size={11} />
                    <span>{formImages.length} de 5</span>
                  </span>
                </div>

                {formImages.length > 0 ? (
                  <>
                    <div className="pc-multi-imgs-grid">
                      {formImages.map((imgUrl, idx) => (
                        <div key={idx} className={`pc-img-card${idx === 0 ? ' is-primary' : ''}`}>
                          <img src={getFullImgUrl(imgUrl)} alt={`Foto ${idx + 1}`} className="pc-img-card-thumb" />

                          <div className="pc-img-card-overlay">
                            {idx === 0 ? (
                              <span className="pc-tag-primary">
                                <IconStar size={9.5} sw={2.5} style={{ fill: '#ffffff' }} />
                                <span>Portada</span>
                              </span>
                            ) : (
                              <button
                                type="button"
                                className="pc-btn-make-primary"
                                onClick={() => setPrimaryImage(idx)}
                                title="Establecer como foto de portada"
                              >
                                <IconStar size={9.5} sw={2.2} />
                                <span>Portada</span>
                              </button>
                            )}

                            <button
                              type="button"
                              className="pc-btn-remove-img"
                              onClick={() => removeImage(idx)}
                              title="Eliminar esta foto"
                            >
                              <IconClose size={11} sw={2.6} />
                            </button>
                          </div>
                        </div>
                      ))}

                      {formImages.length < 5 && (
                        <label className="pc-add-more-card" title="Agregar más imágenes">
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImagesUpload}
                            disabled={uploading}
                            style={{ display: 'none' }}
                          />
                          <div className="pc-add-more-icon-wrap">
                            <IconPlus size={15} sw={2.6} />
                          </div>
                          <span className="pc-add-more-label">
                            {uploading ? 'Subiendo…' : 'Añadir foto'}
                          </span>
                          <span className="pc-add-more-count">
                            ({formImages.length}/5)
                          </span>
                        </label>
                      )}
                    </div>

                    <div className="pc-photos-hint">
                      <IconStar size={12} sw={2.2} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                      <span>
                        La foto marcada como <strong>Portada</strong> es la imagen principal visible en el catálogo. Pulsa en otra foto para cambiarla.
                      </span>
                    </div>
                  </>
                ) : (
                  <label className="pc-upload-area" style={{ display: 'block' }}>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImagesUpload}
                      disabled={uploading}
                      style={{ display: 'none' }}
                    />
                    <div>
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        background: '#ecfdf5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 8px',
                        color: '#059669'
                      }}>
                        <IconUpload size={20} sw={2.2} />
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', display: 'block', marginBottom: '2px' }}>
                        {uploading ? 'Subiendo imágenes a Cloudinary…' : 'Seleccionar fotos del producto (máx. 5)'}
                      </span>
                      <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                        Puedes seleccionar hasta 5 fotos a la vez. La primera será la portada.
                      </span>
                    </div>
                  </label>
                )}
              </div>

              {/* Nombre */}
              <div className="pc-form-group">
                <label className="pc-form-label">
                  <IconTag size={13} sw={2.2} />
                  <span>Nombre del Producto</span>
                </label>
                <input
                  className="pc-input"
                  type="text"
                  name="name"
                  placeholder="Ej. Sudadera Oversize Black"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Precio */}
              <div className="pc-form-group">
                <label className="pc-form-label">
                  <IconDollar size={13} sw={2.2} />
                  <span>Precio en Córdobas (C$)</span>
                </label>
                <input
                  className="pc-input"
                  type="number"
                  step="0.01"
                  min="0"
                  name="price"
                  placeholder="Ej. 550"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Categoría Dinámica y Sección/Género */}
              <div className="pc-form-group">
                <div className="pc-form-row-2">
                  <div>
                    <label className="pc-form-label">
                      <IconShirt size={13} sw={2.2} />
                      <span>Categoría</span>
                    </label>
                    <select
                      className="pc-select"
                      name="clasification"
                      value={formData.clasification}
                      onChange={handleInputChange}
                    >
                      {categories.map((cat) => (
                        <option key={cat.id_clasification} value={String(cat.id_clasification)}>
                          {capitalize(cat.name)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="pc-form-label">
                      <IconGrid size={13} sw={2.2} />
                      <span>Sección / Género</span>
                    </label>
                    <select
                      className="pc-select"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                    >
                      <option value="1">Hombre</option>
                      <option value="2">Mujer</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Descripción Expandida hacia abajo */}
              <div className="pc-form-group">
                <label className="pc-form-label">
                  <IconFileText size={13} sw={2.2} />
                  <span>Descripción y Medidas</span>
                </label>
                <textarea
                  className="pc-textarea"
                  name="description"
                  placeholder="Detalles sobre medidas por talla (S, M, L, XL), materiales, corte o especificaciones…"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>

              {/* Botón Guardar */}
              <button
                type="submit"
                className="pc-btn-save-item"
                disabled={uploading || submitting}
              >
                {submitting ? (
                  <>
                    <IconRefresh size={14} className="pc-spin" />
                    <span>Guardando cambios…</span>
                  </>
                ) : editingId ? (
                  <>
                    <IconCheck size={16} sw={2.4} />
                    <span>Guardar Cambios</span>
                  </>
                ) : (
                  <>
                    <IconPlus size={16} sw={2.4} />
                    <span>Registrar en Catálogo</span>
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
