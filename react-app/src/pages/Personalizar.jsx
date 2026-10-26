import { useState, useRef, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import Swal from 'sweetalert2'
import '@google/model-viewer'
import { PRODUCTOS, COLORES, aspectoZona } from '../personalizador3d/config'
import { cargarZonasBin, componerTexturaPrenda } from '../personalizador3d/textureEngine'
import '../personalizador3d/personalizador.css'
import { uploadToCloudinary } from '../utils/customizationHelper'

const MAX_IMAGENES = 5

// Catálogo de fuentes: Animadas, caricatura, urbanas, cursivas y modernas
const FONTS = [
  { name: 'Bangers', label: 'Bangers (Cómic / Héroe)', category: 'Animada' },
  { name: 'Fredoka', label: 'Fredoka (Caricatura / Redonda)', category: 'Animada' },
  { name: 'Bungee', label: 'Bungee (Urbana / Cartel)', category: 'Animada' },
  { name: 'Permanent Marker', label: 'Permanent Marker (Graffiti)', category: 'Animada' },
  { name: 'Press Start 2P', label: 'Press Start (8-Bit / Retro Gamer)', category: 'Animada' },
  { name: 'Creepster', label: 'Creepster (Terror / Halloween)', category: 'Animada' },
  { name: 'Righteous', label: 'Righteous (Retro Futurista)', category: 'Moderna' },
  { name: 'Russo One', label: 'Russo One (Fuerte / Deportiva)', category: 'Moderna' },
  { name: 'Pacifico', label: 'Pacifico (Cursiva / Verano)', category: 'Cursiva' },
  { name: 'Lobster', label: 'Lobster (Vintage Cursiva)', category: 'Cursiva' },
  { name: 'Caveat', label: 'Caveat (Manuscrita Casual)', category: 'Cursiva' },
  { name: 'Anton', label: 'Anton (Impacto / Bloque)', category: 'Clásica' },
  { name: 'Montserrat', label: 'Montserrat (Limpia / Minimalista)', category: 'Moderna' },
  { name: 'Impact', label: 'Impact (Clásica Meme)', category: 'Clásica' },
  { name: 'Arial', label: 'Arial (Básica)', category: 'Clásica' },
]

// Paleta de colores rápidos para texto
const TEXT_COLORS_QUICK = [
  { name: 'Blanco', hex: '#ffffff' },
  { name: 'Negro', hex: '#111827' },
  { name: 'Amarillo', hex: '#facc15' },
  { name: 'Rojo', hex: '#ef4444' },
  { name: 'Cian', hex: '#06b6d4' },
  { name: 'Azul', hex: '#3b82f6' },
  { name: 'Verde', hex: '#10b981' },
  { name: 'Rosado', hex: '#ec4899' },
  { name: 'Naranja', hex: '#f97316' },
]

/**
 * Remueve inteligentemente el fondo de una imagen (ya sea negro, blanco o de color sólido),
 * detectando automáticamente el color de las esquinas y aplicando un recorrido por los bordes (flood-fill).
 * Preserva intactos los dibujos, ojos, portal y personajes interiores, integrando el logo limpio sobre la tela 3D.
 */
function removerFondoAutomatico(imgEl, tolerancia = 42) {
  const canvas = document.createElement('canvas')
  const w = imgEl.naturalWidth || imgEl.width || 512
  const h = imgEl.naturalHeight || imgEl.height || 512
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(imgEl, 0, 0, w, h)
  const imgData = ctx.getImageData(0, 0, w, h)
  const data = imgData.data

  // 1. Muestrear las 4 esquinas exteriores para calcular el color de fondo predominante
  const esquinas = [
    0,
    (w - 1) * 4,
    ((h - 1) * w) * 4,
    ((h - 1) * w + (w - 1)) * 4,
  ]
  let bgR = 0, bgG = 0, bgB = 0
  for (const idx of esquinas) {
    bgR += data[idx]
    bgG += data[idx + 1]
    bgB += data[idx + 2]
  }
  bgR = Math.round(bgR / 4)
  bgG = Math.round(bgG / 4)
  bgB = Math.round(bgB / 4)

  const distColor = (idx) => {
    const dr = data[idx] - bgR
    const dg = data[idx + 1] - bgG
    const db = data[idx + 2] - bgB
    return Math.sqrt(dr * dr + dg * dg + db * db)
  }

  const esFondo = (idx) => {
    return data[idx + 3] > 10 && distColor(idx) <= tolerancia
  }

  const total = w * h
  const visitado = new Uint8Array(total)
  const cola = new Int32Array(total)
  let head = 0
  let tail = 0

  const pushPixel = (x, y) => {
    const pIdx = y * w + x
    if (!visitado[pIdx]) {
      visitado[pIdx] = 1
      if (esFondo(pIdx * 4)) {
        cola[tail++] = pIdx
      }
    }
  }

  // Explorar todo el perímetro exterior
  for (let x = 0; x < w; x++) {
    pushPixel(x, 0)
    pushPixel(x, h - 1)
  }
  for (let y = 0; y < h; y++) {
    pushPixel(0, y)
    pushPixel(w - 1, y)
  }

  // BFS flood-fill hacia adentro
  while (head < tail) {
    const pIdx = cola[head++]
    const x = pIdx % w
    const y = (pIdx / w) | 0

    if (x > 0) {
      const nIdx = pIdx - 1
      if (!visitado[nIdx]) {
        visitado[nIdx] = 1
        if (esFondo(nIdx * 4)) cola[tail++] = nIdx
      }
    }
    if (x < w - 1) {
      const nIdx = pIdx + 1
      if (!visitado[nIdx]) {
        visitado[nIdx] = 1
        if (esFondo(nIdx * 4)) cola[tail++] = nIdx
      }
    }
    if (y > 0) {
      const nIdx = pIdx - w
      if (!visitado[nIdx]) {
        visitado[nIdx] = 1
        if (esFondo(nIdx * 4)) cola[tail++] = nIdx
      }
    }
    if (y < h - 1) {
      const nIdx = pIdx + w
      if (!visitado[nIdx]) {
        visitado[nIdx] = 1
        if (esFondo(nIdx * 4)) cola[tail++] = nIdx
      }
    }
  }

  // Suavizado anti-alias en los contornos para una integración perfecta sin bordes duros
  for (let i = 0; i < tail; i++) {
    const pIdx = cola[i]
    const dIdx = pIdx * 4
    const d = distColor(dIdx)
    if (d <= tolerancia * 0.7) {
      data[dIdx + 3] = 0
    } else {
      const factor = (d - tolerancia * 0.7) / (tolerancia * 0.3)
      data[dIdx + 3] = Math.round(data[dIdx + 3] * factor)
    }
  }

  ctx.putImageData(imgData, 0, 0)
  return canvas
}

const removerFondoBlanco = removerFondoAutomatico

export default function Personalizar() {
  const { addToCart } = useCart()
  const navigate = useNavigate()

  // Referencias
  const modelViewerRef = useRef(null)
  const viewerContainerRef = useRef(null)
  const blobUrlRef = useRef(null)

  // Estado del producto y color
  const [garmentKey, setGarmentKey] = useState('sudadera')
  const [color, setColor] = useState('negro')
  const [view, setView] = useState('frente')

  // Datos 3D y zonas cargadas
  const [zonasData, setZonasData] = useState(null)
  const [cargando3D, setCargando3D] = useState(true)
  const [modeloListo, setModeloListo] = useState(false)

  // Elementos de diseño (múltiples imágenes y textos por prenda)
  // { id, type: 'image'|'text', url, file, imgElement, text, font, fontSize, textColor, rotation, view, xRel, yRel, wRel, hRel }
  const [designs, setDesigns] = useState([])
  const [selectedDesignId, setSelectedDesignId] = useState(null)
  const [modoDiseno, setModoDiseno] = useState(true)
  const [draggingId, setDraggingId] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const isDraggingRef = useRef(false)
  const dragStartRef = useRef(null)

  // Datos del formulario de compra
  const [uploading, setUploading] = useState(false)
  const [addingToCart, setAddingToCart] = useState(false)
  const [size, setSize] = useState('M')
  const [quantity, setQuantity] = useState(1)
  const [instructions, setInstructions] = useState('')

  const activeProduct = PRODUCTOS[garmentKey] || PRODUCTOS.sudadera
  const activeZoneDef = activeProduct.zonas?.[view] || Object.values(activeProduct.zonas)[0]

  // Contar cuántas imágenes lleva subidas el cliente (máximo 5)
  const totalImagenesSubidas = designs.filter((d) => d.type === 'image').length

  // Cargar el archivo de zonas (.zonas.bin) cuando cambia el producto
  useEffect(() => {
    let activo = true
    setCargando3D(true)
    setModeloListo(false)

    if (!activeProduct.zonasBin) {
      setZonasData(null)
      setCargando3D(false)
      return
    }

    cargarZonasBin(activeProduct.zonasBin)
      .then((data) => {
        if (activo) {
          setZonasData(data)
          setCargando3D(false)
        }
      })
      .catch((err) => {
        console.error('Error cargando zonas binarias:', err)
        if (activo) setCargando3D(false)
      })

    return () => {
      activo = false
    }
  }, [garmentKey, activeProduct.zonasBin])

  // Escuchar cuando <model-viewer> termina de cargar el modelo 3D
  useEffect(() => {
    const mv = modelViewerRef.current
    if (!mv) return

    const handleLoad = () => {
      setModeloListo(true)
      if (activeProduct.material && mv.model) {
        mv.model.materials.forEach((m) => {
          if (activeProduct.material.roughness !== undefined) {
            m.pbrMetallicRoughness.setRoughnessFactor(activeProduct.material.roughness)
          }
          if (activeProduct.material.metallic !== undefined) {
            m.pbrMetallicRoughness.setMetallicFactor(activeProduct.material.metallic)
          }
        })
      }
    }

    mv.addEventListener('load', handleLoad)
    return () => mv.removeEventListener('load', handleLoad)
  }, [garmentKey, activeProduct])

  // Orientar la cámara 3D cuando el usuario selecciona una pestaña de zona
  useEffect(() => {
    const mv = modelViewerRef.current
    if (!mv || !activeZoneDef?.camara) return
    mv.cameraOrbit = activeZoneDef.camara.orbit
    if (activeZoneDef.camara.target) {
      mv.cameraTarget = activeZoneDef.camara.target
    }
  }, [view, activeZoneDef])

  // Renderizar las zonas activas en lienzos 2D (1024px ultrarrápido durante arrastre, 2048px en reposo)
  const canvasesPorZona = useMemo(() => {
    const resultado = {}
    if (!activeProduct.zonas) return resultado

    for (const [zKey, zDef] of Object.entries(activeProduct.zonas)) {
      const zoneDesigns = designs.filter((d) => d.view === zKey)
      if (zoneDesigns.length === 0) continue

      const aspect = aspectoZona(zDef) || 1
      const S_W = isDragging ? 1024 : 2048
      const S_H = Math.max(256, Math.round(S_W / aspect))

      const canvas = document.createElement('canvas')
      canvas.width = S_W
      canvas.height = S_H
      const ctx = canvas.getContext('2d')
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = isDragging ? 'medium' : 'high'

      for (const d of zoneDesigns) {
        ctx.save()
        const cx = (d.xRel + d.wRel / 2) * S_W
        const cy = (d.yRel + d.hRel / 2) * S_H
        const dw = d.wRel * S_W
        const dh = d.hRel * S_H

        ctx.translate(cx, cy)
        if (d.rotation) {
          ctx.rotate((d.rotation * Math.PI) / 180)
        }

        if (d.type === 'image') {
          const imgSource = (d.sinFondo && d.processedCanvas) ? d.processedCanvas : d.imgElement
          if (imgSource) {
            ctx.drawImage(imgSource, -dw / 2, -dh / 2, dw, dh)
          }
        } else if (d.type === 'text') {
          ctx.fillStyle = d.textColor || '#ffffff'
          const scaleFactor = S_W / 360
          const fontSize = (d.fontSize || 32) * scaleFactor
          ctx.font = `bold ${Math.round(fontSize)}px "${d.font || 'Arial'}", sans-serif`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(d.text, 0, 0, dw * 1.5)
        }
        ctx.restore()
      }

      resultado[zKey] = canvas
    }
    return resultado
  }, [designs, activeProduct.zonas, isDragging])

  // Actualizar la textura del modelo 3D en tiempo real (color + diseños) con modo rápido a 60 FPS
  useEffect(() => {
    const mv = modelViewerRef.current
    if (!mv || !modeloListo || !zonasData) return

    let cancelado = false
    const timeout = setTimeout(async () => {
      try {
        const hex = COLORES[color]?.hex || '#1c1c1c'
        const textureCanvas = componerTexturaPrenda({
          texSize: zonasData.texSize,
          zonasData,
          colorHex: hex,
          canvasesPorZona,
          fastMode: isDragging,
        })

        // Durante arrastre usamos WebP/JPEG a 60 FPS (~3ms), en reposo PNG sin pérdida de alta fidelidad
        const blob = await new Promise((res) =>
          textureCanvas.toBlob(res, isDragging ? 'image/webp' : 'image/png', isDragging ? 0.85 : undefined)
        )
        if (cancelado || !blob) return

        if (blobUrlRef.current) {
          URL.revokeObjectURL(blobUrlRef.current)
        }
        const nuevoUrl = URL.createObjectURL(blob)
        blobUrlRef.current = nuevoUrl

        const texture = await mv.createTexture(nuevoUrl)
        if (cancelado) return

        if (mv.model?.materials) {
          mv.model.materials.forEach((mat) => {
            mat.pbrMetallicRoughness.baseColorTexture.setTexture(texture)
            mat.pbrMetallicRoughness.setBaseColorFactor([1, 1, 1, 1])
          })
        }
      } catch (err) {
        console.error('Error aplicando textura 3D:', err)
      }
    }, isDragging ? 16 : 50)

    return () => {
      cancelado = true
      clearTimeout(timeout)
    }
  }, [color, canvasesPorZona, zonasData, modeloListo, isDragging])

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current)
    }
  }, [])

  // Cambiar producto
  const cambiarProducto = (prodKey) => {
    const target = PRODUCTOS[prodKey]
    if (!target) return
    if (target.disponible === false) {
      Swal.fire({
        icon: 'info',
        title: 'Próximamente',
        text: `El modelo 3D para ${target.nombre} estará disponible pronto.`,
      })
      return
    }

    if (designs.length > 0) {
      Swal.fire({
        title: '¿Cambiar de producto?',
        text: 'Se reiniciarán los diseños que has colocado en este producto.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, cambiar',
        cancelButtonText: 'Cancelar',
      }).then((result) => {
        if (result.isConfirmed) {
          ejecutarCambioProducto(prodKey, target)
        }
      })
    } else {
      ejecutarCambioProducto(prodKey, target)
    }
  }

  const ejecutarCambioProducto = (prodKey, target) => {
    setGarmentKey(prodKey)
    setDesigns([])
    setSelectedDesignId(null)
    const primerZona = Object.keys(target.zonas)[0] || 'frente'
    setView(primerZona)
    if (!target.colores.includes(color)) {
      setColor(target.colores[0])
    }
  }

  // Subir imágenes con LÍMITE DE MÁXIMO 5 IMÁGENES
  const handleImageUpload = async (e) => {
    const rawFiles = Array.from(e.target.files || [])
    if (rawFiles.length === 0) return

    const imagenesActuales = designs.filter((d) => d.type === 'image').length
    const cuposDisponibles = MAX_IMAGENES - imagenesActuales

    if (cuposDisponibles <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Límite alcanzado',
        text: `Solo puedes subir un máximo de ${MAX_IMAGENES} imágenes en tu prenda. Elimina alguna para agregar una nueva.`,
      })
      e.target.value = ''
      return
    }

    let files = rawFiles
    if (files.length > cuposDisponibles) {
      Swal.fire({
        icon: 'info',
        title: 'Límite de imágenes',
        text: `Solo puedes agregar ${cuposDisponibles} imagen(es) más para no exceder el máximo de ${MAX_IMAGENES}.`,
      })
      files = files.slice(0, cuposDisponibles)
    }

    setUploading(true)
    const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dzlbg8ni6/image/upload'
    const CLOUDINARY_UPLOAD_PRESET = 'ss1j77hf'

    try {
      const nuevosDiseños = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const localUrl = URL.createObjectURL(file)

        // Pre-cargar la imagen en memoria para render rápido en canvas
        const img = await new Promise((resolve, reject) => {
          const el = new Image()
          el.onload = () => resolve(el)
          el.onerror = reject
          el.src = localUrl
        })

        // Subir a Cloudinary para persistencia del pedido
        let cloudUrl = localUrl
        try {
          const formData = new FormData()
          formData.append('file', file)
          formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
          const res = await fetch(CLOUDINARY_URL, { method: 'POST', body: formData })
          const data = await res.json()
          if (data.secure_url) cloudUrl = data.secure_url
        } catch (uploadErr) {
          console.warn('Subida en segundo plano a Cloudinary falló, usando local:', uploadErr)
        }

        // Calcular proporciones iniciales dentro de la zona permitida
        const imgAspect = img.width / img.height
        const zoneAspect = aspectoZona(activeZoneDef) || 1

        let wRel = 0.35
        let hRel = (wRel * zoneAspect) / imgAspect

        if (hRel > 0.8) {
          hRel = 0.8
          wRel = (hRel * imgAspect) / zoneAspect
        }

        const stagger = (i * 0.04) % 0.2
        const xRel = Math.min(1 - wRel, Math.max(0, 0.5 - wRel / 2 + stagger))
        const yRel = Math.min(1 - hRel, Math.max(0, 0.5 - hRel / 2 + stagger))

        nuevosDiseños.push({
          id: Date.now() + i,
          type: 'image',
          url: cloudUrl,
          displayUrl: cloudUrl,
          file,
          imgElement: img,
          rotation: 0,
          view,
          xRel,
          yRel,
          wRel,
          hRel,
          sinFondo: false,
          processedCanvas: null,
        })
      }

      setDesigns((prev) => [...prev, ...nuevosDiseños])
      if (nuevosDiseños.length > 0) {
        setSelectedDesignId(nuevosDiseños[nuevosDiseños.length - 1].id)
      }
    } catch (err) {
      console.error(err)
      Swal.fire({ icon: 'error', title: 'Error', text: 'Ocurrió un error al cargar las imágenes.' })
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  // Añadir capa de texto con fuente y tamaño configurable
  const handleAddText = () => {
    const newDesign = {
      id: Date.now(),
      type: 'text',
      text: 'Tu Texto',
      font: 'Bangers',
      fontSize: 32,
      textColor: '#ffffff',
      rotation: 0,
      view,
      xRel: 0.2,
      yRel: 0.35,
      wRel: 0.6,
      hRel: 0.22,
    }
    setDesigns((prev) => [...prev, newDesign])
    setSelectedDesignId(newDesign.id)
  }

  // Alternar eliminación de fondo blanco exterior de la imagen
  const toggleQuitarFondo = (designId) => {
    setDesigns((prev) =>
      prev.map((d) => {
        if (d.id !== designId || d.type !== 'image') return d
        const nuevoEstado = !d.sinFondo
        let processedCanvas = d.processedCanvas
        let displayUrl = d.url
        if (nuevoEstado) {
          if (!processedCanvas && d.imgElement) {
            processedCanvas = removerFondoBlanco(d.imgElement)
          }
          if (processedCanvas) {
            displayUrl = processedCanvas.toDataURL('image/png')
          }
        }
        return {
          ...d,
          sinFondo: nuevoEstado,
          processedCanvas,
          displayUrl: nuevoEstado ? displayUrl : d.url,
        }
      })
    )
  }

  // Actualizar propiedades de un elemento
  const updateDesign = (id, newProps) => {
    setDesigns((prev) => prev.map((d) => (d.id === id ? { ...d, ...newProps } : d)))
  }

  // Eliminar elemento
  const deleteDesign = (id) => {
    setDesigns((prev) => prev.filter((d) => d.id !== id))
    if (selectedDesignId === id) setSelectedDesignId(null)
  }

  // Re-centrar la cámara 3D en la zona actual
  const reCentrarCamara = () => {
    const mv = modelViewerRef.current
    if (!mv || !activeZoneDef?.camara) return
    mv.cameraOrbit = activeZoneDef.camara.orbit
    if (activeZoneDef.camara.target) {
      mv.cameraTarget = activeZoneDef.camara.target
    }
  }

  // Cambiar el lado de la prenda de un elemento (Frente, Espalda, Mangas...)
  const cambiarLadoElemento = (designId, nuevoLado) => {
    if (!activeProduct?.zonas?.[nuevoLado]) return
    setDesigns((prev) =>
      prev.map((d) => {
        if (d.id !== designId) return d
        return { ...d, view: nuevoLado }
      })
    )
    setView(nuevoLado)
    setModoDiseno(true)
  }

  // Escalar / Expandir / Reducir un elemento
  const escalarElemento = (designId, factor) => {
    setDesigns((prev) =>
      prev.map((d) => {
        if (d.id !== designId) return d
        const curW = d.wRel || 0.35
        const curH = d.hRel || 0.35
        const nuevoW = Math.max(0.08, Math.min(1 - d.xRel, curW * factor))
        const nuevoH = Math.max(0.08, Math.min(1 - d.yRel, curH * factor))
        const nuevoFontSize =
          d.type === 'text' ? Math.max(14, Math.min(72, Math.round((d.fontSize || 32) * factor))) : undefined
        return {
          ...d,
          wRel: nuevoW,
          hRel: nuevoH,
          ...(nuevoFontSize ? { fontSize: nuevoFontSize } : {}),
        }
      })
    )
  }

  // Rotar un elemento por pasos de grados (+15°, -15°, etc.)
  const rotarElemento = (designId, deltaGrados) => {
    setDesigns((prev) =>
      prev.map((d) => {
        if (d.id !== designId) return d
        let nuevaRot = ((d.rotation || 0) + deltaGrados) % 360
        if (nuevaRot > 180) nuevaRot -= 360
        if (nuevaRot < -180) nuevaRot += 360
        return { ...d, rotation: nuevaRot }
      })
    )
  }

  // Desplazar el diseño por pasos pequeños (ajuste fino / flechas de posición)
  const moverDisenoDelta = (designId, dxRel, dyRel) => {
    setDesigns((prev) =>
      prev.map((d) => {
        if (d.id !== designId) return d
        const curW = d.wRel || 0.35
        const curH = d.hRel || 0.35
        const newX = Math.max(0, Math.min(1 - curW, (d.xRel || 0) + dxRel))
        const newY = Math.max(0, Math.min(1 - curH, (d.yRel || 0) + dyRel))
        return { ...d, xRel: newX, yRel: newY }
      })
    )
  }

  // Centrar horizontalmente el elemento en el área de impresión (Printify style)
  const centrarHorizontal = (designId) => {
    setDesigns((prev) =>
      prev.map((d) => {
        if (d.id !== designId) return d
        const newX = Math.max(0, Math.min(1 - d.wRel, (1 - d.wRel) / 2))
        return { ...d, xRel: newX }
      })
    )
  }

  // Centrar verticalmente el elemento en el área de impresión (Printify style)
  const centrarVertical = (designId) => {
    setDesigns((prev) =>
      prev.map((d) => {
        if (d.id !== designId) return d
        const newY = Math.max(0, Math.min(1 - d.hRel, (1 - d.hRel) / 2))
        return { ...d, yRel: newY }
      })
    )
  }

  // Alinear a la izquierda (Printify style)
  const alinearIzquierda = (designId) => {
    setDesigns((prev) =>
      prev.map((d) => {
        if (d.id !== designId) return d
        return { ...d, xRel: 0 }
      })
    )
  }

  // Alinear a la derecha (Printify style)
  const alinearDerecha = (designId) => {
    setDesigns((prev) =>
      prev.map((d) => {
        if (d.id !== designId) return d
        return { ...d, xRel: Math.max(0, 1 - (d.wRel || 0.35)) }
      })
    )
  }

  // Alinear arriba (Printify style)
  const alinearArriba = (designId) => {
    setDesigns((prev) =>
      prev.map((d) => {
        if (d.id !== designId) return d
        return { ...d, yRel: 0 }
      })
    )
  }

  // Alinear abajo (Printify style)
  const alinearAbajo = (designId) => {
    setDesigns((prev) =>
      prev.map((d) => {
        if (d.id !== designId) return d
        return { ...d, yRel: Math.max(0, 1 - (d.hRel || 0.35)) }
      })
    )
  }

  // Ajustar tamaño del elemento a la zona segura (Printify fit)
  const ajustarZona = (designId) => {
    setDesigns((prev) =>
      prev.map((d) => {
        if (d.id !== designId) return d
        const aspect = d.wRel / (d.hRel || 0.35)
        let w = 0.72
        let h = w / aspect
        if (h > 0.75) {
          h = 0.75
          w = h * aspect
        }
        return {
          ...d,
          wRel: w,
          hRel: h,
          xRel: (1 - w) / 2,
          yRel: (1 - h) / 2,
        }
      })
    )
  }

  // Duplicar elemento actual (Printify duplicate)
  const duplicarElemento = (designId) => {
    const original = designs.find((d) => d.id === designId)
    if (!original) return

    const totalImgs = designs.filter((d) => d.type === 'image').length
    if (original.type === 'image' && totalImgs >= MAX_IMAGENES) {
      Swal.fire({
        icon: 'warning',
        title: 'Límite alcanzado',
        text: `Máximo ${MAX_IMAGENES} imágenes permitidas en la prenda.`,
      })
      return
    }

    const nuevo = {
      ...original,
      id: Date.now(),
      xRel: Math.min(1 - original.wRel, (original.xRel || 0) + 0.05),
      yRel: Math.min(1 - original.hRel, (original.yRel || 0) + 0.05),
    }

    setDesigns((prev) => [...prev, nuevo])
    setSelectedDesignId(nuevo.id)
  }

  // Finalizar compra y agregar al carrito con captura multi-ángulo y subida de archivos originales
  const handleAddToCart = async (e) => {
    e.preventDefault()

    if (designs.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Diseño vacío',
        text: 'Agrega al menos un logo, imagen o texto a tu prenda.',
      })
      return
    }

    setAddingToCart(true)

    // Notificar al usuario que estamos procesando los archivos para el taller
    Swal.fire({
      title: 'Procesando diseño para producción',
      html: `
        <div style="font-size: 13.5px; color: #475569; margin-top: 8px; line-height: 1.5;">
          Asegurando archivos originales y generando capturas 3D de todas las áreas diseñadas...
        </div>
      `,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading()
      },
    })

    try {
      const mv = modelViewerRef.current

      // 1. SUBIR / ASEGURAR LOGOS ORIGINALES DEL CLIENTE (PNG/JPG en alta resolución)
      const customerLogos = []
      for (let i = 0; i < designs.length; i++) {
        const d = designs[i]
        if (d.type !== 'image') continue

        let highResUrl = d.url
        try {
          // Si el cliente aplicó "Quitar fondo", subimos el recorte transparente limpio
          if (d.sinFondo && d.processedCanvas) {
            const transparentBase64 = d.processedCanvas.toDataURL('image/png')
            highResUrl = await uploadToCloudinary(transparentBase64)
          } else if (!highResUrl || !highResUrl.startsWith('https://res.cloudinary.com')) {
            if (d.file) {
              highResUrl = await uploadToCloudinary(d.file)
            } else if (d.imgElement?.src && d.imgElement.src.startsWith('data:')) {
              highResUrl = await uploadToCloudinary(d.imgElement.src)
            }
          }
        } catch (uploadErr) {
          console.warn('Error subiendo logo original a Cloudinary:', uploadErr)
        }

        customerLogos.push({
          id: d.id,
          zone: d.view,
          zoneName: activeProduct.zonas[d.view]?.nombre || d.view,
          url: highResUrl || d.url || '/img/hero.png',
          sinFondo: Boolean(d.sinFondo),
          name: d.file?.name || `Logo-${i + 1}.png`,
        })
      }

      // 2. EXTRAER TEXTOS PERSONALIZADOS
      const customerTexts = designs
        .filter((d) => d.type === 'text')
        .map((d) => ({
          id: d.id,
          zone: d.view,
          zoneName: activeProduct.zonas[d.view]?.nombre || d.view,
          text: d.text,
          font: d.font,
          textColor: d.textColor,
        }))

      // 3. CAPTURA DE VISTAS 3D MULTI-ÁNGULO (Frente + Cualquier cara con diseño)
      const designedZonesKeys = Object.keys(activeProduct.zonas || {}).filter((zKey) =>
        designs.some((d) => d.view === zKey)
      )
      // Aseguramos que el frente siempre se capture como vista principal
      const zonesToCapture = Array.from(new Set(['frente', ...designedZonesKeys]))

      const prevOrbit = mv?.cameraOrbit
      const prevTarget = mv?.cameraTarget
      const capturedViews = []

      if (mv && typeof mv.toDataURL === 'function') {
        for (const zKey of zonesToCapture) {
          const zDef = activeProduct.zonas[zKey]
          if (!zDef) continue

          if (zDef.camara) {
            mv.cameraOrbit = zDef.camara.orbit
            if (zDef.camara.target) mv.cameraTarget = zDef.camara.target
            if (typeof mv.jumpCameraToGoal === 'function') {
              mv.jumpCameraToGoal()
            }
            // Breve espera para que el motor WebGL renderice el cuadro desde el nuevo ángulo
            await new Promise((resolve) => setTimeout(resolve, 140))
          }

          try {
            const snapshotBase64 = mv.toDataURL('image/png')
            const cloudUrl = await uploadToCloudinary(snapshotBase64)
            if (cloudUrl) {
              capturedViews.push({
                zone: zKey,
                name: zDef.nombre || zKey,
                image: cloudUrl,
              })
            }
          } catch (snapErr) {
            console.warn(`Error capturando zona ${zKey}:`, snapErr)
          }
        }

        // Restaurar posición de cámara original
        if (prevOrbit) mv.cameraOrbit = prevOrbit
        if (prevTarget) mv.cameraTarget = prevTarget
        if (typeof mv.jumpCameraToGoal === 'function') mv.jumpCameraToGoal()
      }

      // Si por alguna razón falló la captura 3D, asegurar al menos una vista de respaldo
      if (capturedViews.length === 0) {
        capturedViews.push({
          zone: 'frente',
          name: 'Frente',
          image: '/img/hero.png',
        })
      }

      const frontViewObj = capturedViews.find((v) => v.zone === 'frente') || capturedViews[0]
      const finalImageUrl = frontViewObj.image

      // 4. CREAR PAQUETE ESTRUCTURADO DE PRODUCCIÓN (3D, logos originales, textos)
      const zonesNames = zonesToCapture.map((z) => activeProduct.zonas[z]?.nombre || z).join(', ')
      const customizationPayload = {
        is3D: true,
        garmentKey,
        garmentName: activeProduct.nombre,
        colorName: COLORES[color]?.nombre || color,
        colorHex: COLORES[color]?.hex,
        preview: finalImageUrl,
        views: capturedViews,
        customerLogos,
        customerTexts,
        instructions: instructions || '',
        zonesSummary: zonesNames,
      }

      const itemPrice = activeProduct.precio || 350
      const cartItem = {
        id_item: activeProduct.dbId || 40,
        name: `${activeProduct.nombreCarrito} - ${COLORES[color]?.nombre || color} (Personalizado 3D)`,
        price: itemPrice,
        quantity: parseInt(quantity, 10),
        size: activeProduct.tallas ? size : 'Única',
        color: COLORES[color]?.nombre || color,
        image: finalImageUrl,
        customization: customizationPayload,
        instructions: instructions || '',
        id_cartItem: `custom-3d-${Date.now()}`,
      }

      addToCart(cartItem)

      Swal.fire({
        icon: 'success',
        title: '¡Diseño listo para taller!',
        html: `
          <div style="font-size: 13.5px; color: #475569; line-height: 1.5;">
            Se guardaron <strong>${capturedViews.length} vista(s) 3D</strong> y 
            <strong>${customerLogos.length} archivo(s) de imagen</strong> en alta resolución.
          </div>
        `,
        timer: 2000,
        showConfirmButton: false,
      })

      navigate('/cart')
    } catch (err) {
      console.error('Error al preparar personalización:', err)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al procesar el pedido para producción. Por favor intenta de nuevo.',
      })
    } finally {
      setAddingToCart(false)
    }
  }

  const selectedDesign = designs.find((d) => d.id === selectedDesignId)
  const designsEnZona = designs.filter((d) => d.view === view)
  const aspectZonaActual = aspectoZona(activeZoneDef) || 1

  // Dimensiones calibradas de la zona imprimible sobre la prenda 3D
  // Protege rigurosamente capucha, bolsillo canguro, puños y costuras
  const editorBoxDims = useMemo(() => {
    if (garmentKey === 'sudadera') {
      if (view === 'frente') {
        // En el frente: debajo del cuello (sin tocar capucha) y encima del bolsillo canguro
        return { w: 175, h: 165, top: '53%', left: '50%' }
      }
      if (view === 'espalda') {
        return { w: 180, h: 175, top: '53%', left: '50%' }
      }
      if (view === 'mangaIzquierda' || view === 'mangaDerecha') {
        return { w: 220, h: 80, top: '50%', left: '50%' }
      }
    } else if (garmentKey === 'camiseta') {
      if (view === 'frente' || view === 'espalda') {
        return { w: 185, h: 185, top: '51%', left: '50%' }
      }
      if (view === 'mangaIzquierda' || view === 'mangaDerecha') {
        return { w: 140, h: 120, top: '50%', left: '50%' }
      }
    } else if (garmentKey === 'taza') {
      return { w: 220, h: 110, top: '52%', left: '50%' }
    }

    if (aspectZonaActual < 1) {
      const h = 175
      const w = Math.round(h * aspectZonaActual)
      return { w, h, top: '52%', left: '50%' }
    }
    const w = 220
    const h = Math.max(70, Math.round(w / aspectZonaActual))
    return { w, h, top: '50%', left: '50%' }
  }, [garmentKey, view, aspectZonaActual])

  // Calcular la zona de estampado en coordenadas del visor 3D en pantalla
  const getZoneScreenBox = () => {
    if (!viewerContainerRef.current) return null
    const vRect = viewerContainerRef.current.getBoundingClientRect()
    const topPct = parseFloat(editorBoxDims.top) / 100
    const leftPct = parseFloat(editorBoxDims.left) / 100
    const centerX = vRect.left + vRect.width * leftPct
    const centerY = vRect.top + vRect.height * topPct
    const left = centerX - editorBoxDims.w / 2
    const top = centerY - editorBoxDims.h / 2
    return {
      left,
      top,
      width: editorBoxDims.w,
      height: editorBoxDims.h,
    }
  }

  const activeActionRef = useRef(null)

  // Iniciar movimiento del diseño (arrastrar sobre la prenda)
  const handleMoveStart = (e, design) => {
    e.stopPropagation()
    e.preventDefault()
    setSelectedDesignId(design.id)
    activeActionRef.current = 'move'
    isDraggingRef.current = true
    setIsDragging(true)

    const zoneBox = getZoneScreenBox()
    const zoneW = zoneBox?.width || editorBoxDims.w || 180
    const zoneH = zoneBox?.height || editorBoxDims.h || 170

    dragStartRef.current = {
      action: 'move',
      startX: e.clientX,
      startY: e.clientY,
      startXR: design.xRel || 0,
      startYR: design.yRel || 0,
      wRel: design.wRel || 0.35,
      hRel: design.hRel || 0.35,
      designId: design.id,
      zoneW,
      zoneH,
    }

    try {
      e.target.setPointerCapture(e.pointerId)
    } catch {}
  }

  // Iniciar redimensionamiento desde una de las 4 esquinas estilo Shopify
  const handleCornerResizeStart = (e, design, corner) => {
    e.stopPropagation()
    e.preventDefault()
    setSelectedDesignId(design.id)
    activeActionRef.current = 'resize'
    isDraggingRef.current = true
    setIsDragging(true)

    const zoneBox = getZoneScreenBox()
    const zoneW = zoneBox?.width || editorBoxDims.w || 180
    const zoneH = zoneBox?.height || editorBoxDims.h || 170

    const wRel = design.wRel || 0.35
    const hRel = design.hRel || 0.35
    const aspect = wRel / (hRel || 0.35)

    dragStartRef.current = {
      action: 'resize',
      corner,
      startX: e.clientX,
      startY: e.clientY,
      startXR: design.xRel || 0,
      startYR: design.yRel || 0,
      startW: wRel,
      startH: hRel,
      aspect,
      designId: design.id,
      zoneW,
      zoneH,
      type: design.type,
      startFontSize: design.fontSize || 32,
    }

    try {
      e.target.setPointerCapture(e.pointerId)
    } catch {}
  }

  // Iniciar rotación desde el tirador superior circular (↻)
  const handleRotateStart = (e, design) => {
    e.stopPropagation()
    e.preventDefault()
    setSelectedDesignId(design.id)
    activeActionRef.current = 'rotate'
    isDraggingRef.current = true
    setIsDragging(true)

    const zoneBox = getZoneScreenBox()
    const zoneW = zoneBox?.width || editorBoxDims.w || 180
    const zoneH = zoneBox?.height || editorBoxDims.h || 170
    const zoneLeft = zoneBox?.left || 0
    const zoneTop = zoneBox?.top || 0

    const centerX = zoneLeft + (design.xRel + (design.wRel || 0.35) / 2) * zoneW
    const centerY = zoneTop + (design.yRel + (design.hRel || 0.35) / 2) * zoneH
    const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI)

    dragStartRef.current = {
      action: 'rotate',
      centerX,
      centerY,
      startAngle,
      startRot: design.rotation || 0,
      designId: design.id,
    }

    try {
      e.target.setPointerCapture(e.pointerId)
    } catch {}
  }

  // Control interactivo fluido (60 FPS) para arrastrar, escalar y rotar
  const handlePointerMove = (e) => {
    if (!isDraggingRef.current || !dragStartRef.current) return
    const data = dragStartRef.current

    if (data.action === 'move') {
      const { startX, startY, startXR, startYR, wRel, hRel, designId, zoneW, zoneH } = data
      const dx = e.clientX - startX
      const dy = e.clientY - startY
      const newX = Math.max(0, Math.min(1 - wRel, startXR + dx / zoneW))
      const newY = Math.max(0, Math.min(1 - hRel, startYR + dy / zoneH))
      updateDesign(designId, { xRel: newX, yRel: newY })
    } else if (data.action === 'resize') {
      const { corner, startX, startY, startXR, startYR, startW, startH, aspect, designId, zoneW, zoneH, type, startFontSize } = data
      const dx = (e.clientX - startX) / zoneW
      const dy = (e.clientY - startY) / zoneH

      let newW = startW
      let newH = startH
      let newX = startXR
      let newY = startYR

      if (corner === 'se') {
        const delta = Math.abs(dx) > Math.abs(dy) ? dx : dy
        newW = Math.max(0.08, Math.min(1 - startXR, startW + delta))
        newH = newW / aspect
        if (startYR + newH > 1) {
          newH = 1 - startYR
          newW = newH * aspect
        }
      } else if (corner === 'sw') {
        const delta = -dx
        newW = Math.max(0.08, Math.min(startXR + startW, startW + delta))
        newH = newW / aspect
        if (startYR + newH > 1) {
          newH = 1 - startYR
          newW = newH * aspect
        }
        newX = (startXR + startW) - newW
      } else if (corner === 'ne') {
        const delta = dx
        newW = Math.max(0.08, Math.min(1 - startXR, startW + delta))
        newH = newW / aspect
        if (startYR + startH - newH < 0) {
          newH = startYR + startH
          newW = newH * aspect
        }
        newY = (startYR + startH) - newH
      } else if (corner === 'nw') {
        const delta = -dx
        newW = Math.max(0.08, Math.min(startXR + startW, startW + delta))
        newH = newW / aspect
        if (startYR + startH - newH < 0) {
          newH = startYR + startH
          newW = newH * aspect
        }
        newX = (startXR + startW) - newW
        newY = (startYR + startH) - newH
      }

      const updates = { xRel: newX, yRel: newY, wRel: newW, hRel: newH }
      if (type === 'text') {
        const scaleRatio = newW / startW
        updates.fontSize = Math.max(14, Math.min(72, Math.round(startFontSize * scaleRatio)))
      }
      updateDesign(designId, updates)
    } else if (data.action === 'rotate') {
      const { centerX, centerY, startAngle, startRot, designId } = data
      const curAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI)
      let delta = curAngle - startAngle
      let newRot = Math.round((startRot + delta) % 360)
      if (newRot > 180) newRot -= 360
      if (newRot < -180) newRot += 360
      updateDesign(designId, { rotation: newRot })
    }
  }

  // Soltar interacción
  const handlePointerUp = (e) => {
    if (!isDraggingRef.current) return
    isDraggingRef.current = false
    setIsDragging(false)
    activeActionRef.current = null
    dragStartRef.current = null
    try {
      e.target.releasePointerCapture(e.pointerId)
    } catch {}
  }

  return (
    <div className="container" style={{ marginTop: '18px', marginBottom: '40px', minHeight: '85vh' }}>
      {/* ENCABEZADO DE PÁGINA: SECCIÓN Y DESCRIPCIÓN */}
      <div className="has-text-centered studio-page-header">
        <div className="studio-eyebrow">
          <div className="studio-pill-tag">
            <span className="studio-live-dot" />
            <span>Personalizador 3D</span>
          </div>
          <span className="studio-eyebrow-desc">• Taller interactivo en tiempo real</span>
        </div>

        <h1 className="studio-main-title">
          Diseña Tu Prenda a Tu Medida
        </h1>
        <p className="studio-main-subtitle">
          Agrega hasta 5 imágenes, logos y textos con fuentes animadas en el frente, espalda y mangas con previsualización 360°.
        </p>
      </div>

      <div className="columns is-multiline">
        {/* ============================================================ */}
        {/* COLUMNA IZQUIERDA: VISOR 3D CON EDITOR EN PRENDA INTEGRADO   */}
        {/* ============================================================ */}
        <div className="column is-7">
          <div className="personalizador-card" style={{ overflow: 'hidden' }}>
            
            {/* BARRA SUPERIOR: VISTA 3D Y CONTROLES DE MODO */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 16px',
                backgroundColor: '#ffffff',
                borderBottom: '1px solid #e2e8f0',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              {/* EMBLEMA DE ESTUDIO 3D */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '5px 12px',
                    borderRadius: '20px',
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <span
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      backgroundColor: '#10b981',
                      boxShadow: '0 0 8px #10b981',
                      display: 'inline-block',
                    }}
                  />
                  <span style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                    {activeProduct.nombre}
                  </span>
                  <span style={{ opacity: 0.35, fontSize: '11px' }}>|</span>
                  <span style={{ fontSize: '11px', fontWeight: '600', color: '#34d399' }}>
                    {activeZoneDef?.nombre}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={reCentrarCamara}
                  title="Re-centrar la cámara 3D en la zona de estampado"
                  style={{
                    padding: '5px 12px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: '600',
                    backgroundColor: '#ffffff',
                    color: '#334155',
                    border: '1.5px solid #e2e8f0',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#10b981'
                    e.currentTarget.style.color = '#10b981'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0'
                    e.currentTarget.style.color = '#334155'
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="22" y1="12" x2="18" y2="12" />
                    <line x1="6" y1="12" x2="2" y2="12" />
                    <line x1="12" y1="6" x2="12" y2="2" />
                    <line x1="12" y1="22" x2="12" y2="18" />
                  </svg>
                  <span>Centrar vista</span>
                </button>
              </div>

              {/* Toggle Diseñar / Girar 360 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ display: 'inline-flex', background: '#e2e8f0', borderRadius: '18px', padding: '2px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setModoDiseno(true)
                      reCentrarCamara()
                    }}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '16px',
                      fontSize: '11px',
                      fontWeight: modoDiseno ? '700' : '500',
                      backgroundColor: modoDiseno ? '#ffffff' : 'transparent',
                      color: modoDiseno ? '#0f172a' : '#64748b',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: modoDiseno ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                    <span>Diseñar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setModoDiseno(false)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '16px',
                      fontSize: '11px',
                      fontWeight: !modoDiseno ? '700' : '500',
                      backgroundColor: !modoDiseno ? '#ffffff' : 'transparent',
                      color: !modoDiseno ? '#0f172a' : '#64748b',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: !modoDiseno ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="23 4 23 10 17 10" />
                      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                    </svg>
                    <span>Girar 360°</span>
                  </button>
                </div>
              </div>
            </div>

            {/* CONTENEDOR PRINCIPAL: VISOR 3D CON EDITOR EN PRENDA DIRECTO */}
            <div
              ref={viewerContainerRef}
              style={{
                position: 'relative',
                width: '100%',
                height: '520px',
                backgroundColor: '#f8fafc',
                overflow: 'hidden',
                userSelect: 'none',
              }}
            >
              {cargando3D && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(248,250,252,0.85)',
                    zIndex: 30,
                  }}
                >
                  <button className="button is-loading is-large is-ghost">Cargando 3D...</button>
                </div>
              )}

              {/* Visor 3D de Google model-viewer */}
              <model-viewer
                ref={modelViewerRef}
                src={activeProduct.modelo}
                camera-controls={!modoDiseno}
                touch-action={modoDiseno ? 'none' : 'pan-y'}
                shadow-intensity="1.2"
                shadow-softness="0.8"
                exposure="1.0"
                interaction-prompt="none"
                style={{ width: '100%', height: '100%' }}
              />

              {/* LIENZO INTERACTIVO SOBRE LA PRENDA ESTILO PRINTIFY */}
              {modoDiseno && (
                <div
                  onPointerDown={(e) => {
                    // Clic en el fondo del visor deselecciona
                    if (e.target === e.currentTarget) {
                      setSelectedDesignId(null)
                    }
                  }}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 10,
                    touchAction: 'none',
                    userSelect: 'none',
                  }}
                >
                  {/* ÁREA CALIBRADA DE IMPRESIÓN (PRINTIFY BOUNDARY) */}
                  <div
                    style={{
                      position: 'absolute',
                      top: editorBoxDims.top,
                      left: editorBoxDims.left,
                      transform: 'translate(-50%, -50%)',
                      width: `${editorBoxDims.w}px`,
                      height: `${editorBoxDims.h}px`,
                      border: '1.5px dashed rgba(148, 163, 184, 0.45)',
                      borderRadius: '6px',
                      pointerEvents: 'none',
                    }}
                  >
                    {/* Emblema flotante de área de impresión */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '-20px',
                        left: '0',
                        fontSize: '10px',
                        fontWeight: '700',
                        color: '#0f172a',
                        backgroundColor: 'rgba(255, 255, 255, 0.88)',
                        backdropFilter: 'blur(4px)',
                        padding: '1px 8px',
                        borderRadius: '10px',
                        border: '1px solid rgba(148, 163, 184, 0.35)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        pointerEvents: 'none',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                      }}
                    >
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                      <span>Área de impresión: {activeZoneDef?.nombre}</span>
                    </div>

                    {/* Elementos en la zona */}
                    {designsEnZona.map((design) => {
                      const esSeleccionado = design.id === selectedDesignId

                      if (!esSeleccionado) {
                        return (
                          <div
                            key={design.id}
                            onPointerDown={(e) => {
                              handleMoveStart(e, design)
                            }}
                            title="Toca o arrastra directamente sobre la prenda"
                            style={{
                              position: 'absolute',
                              left: `${design.xRel * editorBoxDims.w}px`,
                              top: `${design.yRel * editorBoxDims.h}px`,
                              width: `${design.wRel * editorBoxDims.w}px`,
                              height: `${design.hRel * editorBoxDims.h}px`,
                              transform: `rotate(${design.rotation || 0}deg)`,
                              transformOrigin: 'center center',
                              cursor: 'grab',
                              pointerEvents: 'auto',
                              borderRadius: '4px',
                              border: '1.5px dashed rgba(16, 185, 129, 0.4)',
                              transition: 'all 0.15s ease',
                            }}
                          />
                        )
                      }

                      // ELEMENTO SELECCIONADO: CONTROLES DIRECTOS ESTILO PRINTIFY (#10b981)
                      return (
                        <div
                          key={design.id}
                          onPointerDown={(e) => handleMoveStart(e, design)}
                          style={{
                            position: 'absolute',
                            left: `${design.xRel * editorBoxDims.w}px`,
                            top: `${design.yRel * editorBoxDims.h}px`,
                            width: `${design.wRel * editorBoxDims.w}px`,
                            height: `${design.hRel * editorBoxDims.h}px`,
                            transform: `rotate(${design.rotation || 0}deg)`,
                            transformOrigin: 'center center',
                            border: '1.5px dashed #10b981',
                            borderRadius: '4px',
                            backgroundColor: 'transparent',
                            boxShadow: '0 0 0 1px rgba(255,255,255,0.45)',
                            cursor: isDragging ? 'grabbing' : 'grab',
                            pointerEvents: 'auto',
                            touchAction: 'none',
                            zIndex: 20,
                          }}
                        >
                          {/* Previsualización rápida durante el arrastre */}
                          {isDragging && (
                            <div
                              style={{
                                width: '100%',
                                height: '100%',
                                pointerEvents: 'none',
                                opacity: 0.35,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {design.type === 'image' ? (
                                <img
                                  src={design.displayUrl || design.url}
                                  alt=""
                                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                  draggable={false}
                                />
                              ) : (
                                <div
                                  style={{
                                    color: design.textColor || '#fff',
                                    fontFamily: `"${design.font || 'Arial'}", sans-serif`,
                                    fontSize: `${(design.fontSize || 32) * (editorBoxDims.w / 360)}px`,
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                  }}
                                >
                                  {design.text}
                                </div>
                              )}
                            </div>
                          )}

                          {/* BARRA FLOTANTE DE ALINEACIÓN RÁPIDA ESTILO PRINTIFY (Arriba del diseño) */}
                          <div
                            onPointerDown={(e) => e.stopPropagation()}
                            style={{
                              position: 'absolute',
                              top: (design.yRel * editorBoxDims.h < 50) ? `${(design.hRel * editorBoxDims.h) + 40}px` : '-46px',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              backgroundColor: '#ffffff',
                              color: '#0f172a',
                              padding: '3px 6px',
                              borderRadius: '10px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              boxShadow: '0 4px 16px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)',
                              zIndex: 35,
                              pointerEvents: 'auto',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {/* Centrar H */}
                            <button
                              type="button"
                              onClick={() => centrarHorizontal(design.id)}
                              title="Centrar horizontalmente"
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '6px',
                                border: '1px solid #e2e8f0',
                                backgroundColor: '#ffffff',
                                color: '#334155',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 0,
                              }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                <line x1="12" y1="2" x2="12" y2="22" strokeDasharray="3 3"/>
                                <rect x="5" y="6" width="14" height="12" rx="2" />
                              </svg>
                            </button>

                            {/* Centrar V */}
                            <button
                              type="button"
                              onClick={() => centrarVertical(design.id)}
                              title="Centrar verticalmente"
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '6px',
                                border: '1px solid #e2e8f0',
                                backgroundColor: '#ffffff',
                                color: '#334155',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 0,
                              }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                <line x1="2" y1="12" x2="22" y2="12" strokeDasharray="3 3"/>
                                <rect x="6" y="5" width="12" height="14" rx="2" />
                              </svg>
                            </button>

                            {/* Ajustar a zona */}
                            <button
                              type="button"
                              onClick={() => ajustarZona(design.id)}
                              title="Ajustar tamaño a la zona"
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '6px',
                                border: '1px solid #e2e8f0',
                                backgroundColor: '#ffffff',
                                color: '#334155',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 0,
                              }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                <polyline points="15 3 21 3 21 9"/>
                                <polyline points="9 21 3 21 3 15"/>
                                <line x1="21" y1="3" x2="14" y2="10"/>
                                <line x1="3" y1="21" x2="10" y2="14"/>
                              </svg>
                            </button>

                            {/* Duplicar */}
                            <button
                              type="button"
                              onClick={() => duplicarElemento(design.id)}
                              title="Duplicar elemento"
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '6px',
                                border: '1px solid #e2e8f0',
                                backgroundColor: '#ffffff',
                                color: '#334155',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 0,
                              }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                              </svg>
                            </button>

                            <div style={{ width: '1px', height: '16px', backgroundColor: '#e2e8f0', margin: '0 2px' }} />

                            {/* Reset Rotación 0° */}
                            {design.rotation !== 0 && (
                              <button
                                type="button"
                                onClick={() => updateDesign(design.id, { rotation: 0 })}
                                title="Restablecer rotación a 0°"
                                style={{
                                  padding: '2px 6px',
                                  borderRadius: '6px',
                                  border: '1px solid #bae6fd',
                                  backgroundColor: '#f0f9ff',
                                  color: '#0284c7',
                                  fontSize: '11px',
                                  fontWeight: 'bold',
                                  cursor: 'pointer',
                                }}
                              >
                                0°
                              </button>
                            )}

                            {/* Quitar fondo para imagen */}
                            {design.type === 'image' && (
                              <button
                                type="button"
                                onClick={() => toggleQuitarFondo(design.id)}
                                title={design.sinFondo ? 'Restaurar fondo original' : 'Quitar fondo sólido automáticamente'}
                                style={{
                                  width: '28px',
                                  height: '28px',
                                  borderRadius: '6px',
                                  border: '1px solid #e2e8f0',
                                  backgroundColor: design.sinFondo ? '#dcfce7' : '#ffffff',
                                  color: design.sinFondo ? '#15803d' : '#334155',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '13px',
                                }}
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                                </svg>
                              </button>
                            )}

                            {/* Eliminar */}
                            <button
                              type="button"
                              onClick={() => deleteDesign(design.id)}
                              title="Eliminar elemento"
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '6px',
                                border: '1px solid #fee2e2',
                                backgroundColor: '#fef2f2',
                                color: '#ef4444',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 0,
                              }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                              </svg>
                            </button>
                          </div>

                          {/* 4 PUNTOS DE ESQUINA INTERACTIVOS ESTILO PRINTIFY (#10b981 con aro blanco) */}
                          {/* Esquina superior izquierda */}
                          <div
                            onPointerDown={(e) => handleCornerResizeStart(e, design, 'nw')}
                            title="Arrastra para cambiar tamaño"
                            style={{
                              position: 'absolute',
                              top: '-6px',
                              left: '-6px',
                              width: '13px',
                              height: '13px',
                              borderRadius: '3px',
                              backgroundColor: '#10b981',
                              border: '2px solid #ffffff',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                              cursor: 'nwse-resize',
                              pointerEvents: 'auto',
                            }}
                          />

                          {/* Esquina superior derecha */}
                          <div
                            onPointerDown={(e) => handleCornerResizeStart(e, design, 'ne')}
                            title="Arrastra para cambiar tamaño"
                            style={{
                              position: 'absolute',
                              top: '-6px',
                              right: '-6px',
                              width: '13px',
                              height: '13px',
                              borderRadius: '3px',
                              backgroundColor: '#10b981',
                              border: '2px solid #ffffff',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                              cursor: 'nesw-resize',
                              pointerEvents: 'auto',
                            }}
                          />

                          {/* Esquina inferior izquierda */}
                          <div
                            onPointerDown={(e) => handleCornerResizeStart(e, design, 'sw')}
                            title="Arrastra para cambiar tamaño"
                            style={{
                              position: 'absolute',
                              bottom: '-6px',
                              left: '-6px',
                              width: '13px',
                              height: '13px',
                              borderRadius: '3px',
                              backgroundColor: '#10b981',
                              border: '2px solid #ffffff',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                              cursor: 'nesw-resize',
                              pointerEvents: 'auto',
                            }}
                          />

                          {/* Esquina inferior derecha */}
                          <div
                            onPointerDown={(e) => handleCornerResizeStart(e, design, 'se')}
                            title="Arrastra para cambiar tamaño"
                            style={{
                              position: 'absolute',
                              bottom: '-6px',
                              right: '-6px',
                              width: '13px',
                              height: '13px',
                              borderRadius: '3px',
                              backgroundColor: '#10b981',
                              border: '2px solid #ffffff',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                              cursor: 'nwse-resize',
                              pointerEvents: 'auto',
                            }}
                          />

                          {/* Tirador de Rotación Inferior estilo Printify (↻ verde con stem) */}
                          <div
                            style={{
                              position: 'absolute',
                              bottom: '-28px',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              pointerEvents: 'auto',
                            }}
                          >
                            <div style={{ width: '1.5px', height: '6px', backgroundColor: '#10b981' }} />
                            <div
                              onPointerDown={(e) => handleRotateStart(e, design)}
                              title="Girar diseño: arrastra en círculos"
                              style={{
                                width: '22px',
                                height: '22px',
                                borderRadius: '50%',
                                backgroundColor: '#ffffff',
                                color: '#10b981',
                                border: '1.5px solid #10b981',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                cursor: 'grab',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.18)',
                                userSelect: 'none',
                                lineHeight: 1,
                              }}
                            >
                              ↻
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* SELECTOR DE LADO ESTILO PRINTIFY (PILLS CENTRADOS EN LA PARTE INFERIOR) */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  zIndex: 25,
                  maxWidth: '96%',
                  overflowX: 'auto',
                  padding: '2px',
                }}
              >
                {Object.entries(activeProduct.zonas || {}).map(([zKey, zDef]) => {
                  const esActivo = view === zKey
                  const cantEnZona = designs.filter((d) => d.view === zKey).length
                  return (
                    <button
                      key={zKey}
                      type="button"
                      onClick={() => {
                        setView(zKey)
                        setModoDiseno(true)
                      }}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: esActivo ? '700' : '500',
                        backgroundColor: esActivo ? '#1e293b' : '#ffffff',
                        color: esActivo ? '#ffffff' : '#334155',
                        border: esActivo ? '1px solid #1e293b' : '1px solid #cbd5e1',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.08)',
                        transition: 'all 0.15s ease',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <span>{zDef.nombre}</span>
                      {cantEnZona > 0 && (
                        <span
                          style={{
                            backgroundColor: esActivo ? '#10b981' : '#e2e8f0',
                            color: esActivo ? '#ffffff' : '#0f172a',
                            borderRadius: '10px',
                            padding: '1px 5px',
                            fontSize: '10px',
                            fontWeight: 'bold',
                          }}
                        >
                          {cantEnZona}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Guía en la esquina inferior derecha cuando no hay elemento seleccionado */}
              {!selectedDesign && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '10px',
                    right: '10px',
                    background: 'rgba(15,23,42,0.75)',
                    color: '#fff',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    pointerEvents: 'none',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  {modoDiseno ? 'Toca y arrastra la prenda para ubicar el diseño' : 'Gira libremente con el cursor para ver todos los ángulos'}
                </div>
              )}
            </div>

            {/* Pie de tarjeta con nota informativa */}
            <div style={{ padding: '8px 16px', backgroundColor: '#fafbfc', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
              <span style={{ fontSize: '11px', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span><strong>Límites automáticos:</strong> El área delimitada protege capucha, puños y costuras de ser estampados.</span>
              </span>
            </div>

          </div>
        </div>

        {/* ============================================================ */}
        {/* COLUMNA DERECHA: HERRAMIENTAS DE DISEÑO REDISEÑADA           */}
        {/* ============================================================ */}
        <div className="column is-5">
          <div className="personalizador-card">
            
            {/* ENCABEZADO */}
            <div className="personalizador-header">
              <span>Herramientas de Diseño</span>
              <span className="tag is-info is-light is-small" style={{ fontWeight: 'bold' }}>
                {activeProduct.nombre}
              </span>
            </div>

            {/* SECCIÓN 1: PRODUCTO Y COLOR */}
            <div className="personalizador-section">
              <div className="section-label">
                <span>1. Prenda y Producto</span>
              </div>
              <div className="product-grid">
                {Object.entries(PRODUCTOS).map(([key, prod]) => {
                  const activo = garmentKey === key
                  const deshabilitado = prod.disponible === false
                  return (
                    <button
                      key={key}
                      type="button"
                      className={`product-btn ${activo ? 'active' : ''}`}
                      onClick={() => cambiarProducto(key)}
                      disabled={deshabilitado}
                    >
                      <div>{prod.nombre}</div>
                      {deshabilitado && <span style={{ fontSize: '10px', opacity: 0.7 }}>(Pronto)</span>}
                    </button>
                  )
                })}
              </div>

              <div className="section-label" style={{ marginTop: '12px' }}>
                <span>Color de la prenda: <strong style={{ color: '#0d9488' }}>{COLORES[color]?.nombre}</strong></span>
              </div>
              <div className="color-swatches">
                {activeProduct.colores.map((cKey) => {
                  const cDef = COLORES[cKey]
                  const esSeleccionado = color === cKey
                  return (
                    <button
                      key={cKey}
                      type="button"
                      className={`color-dot ${esSeleccionado ? 'active' : ''}`}
                      data-color={cKey}
                      onClick={() => setColor(cKey)}
                      title={cDef.nombre}
                      style={{ backgroundColor: cDef.hex }}
                    />
                  )
                })}
              </div>
            </div>

            {/* SECCIÓN 2: AGREGAR ELEMENTOS */}
            <div className="personalizador-section">
              <div className="section-label">
                <span>2. Elementos ({activeZoneDef?.nombre})</span>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    color: totalImagenesSubidas >= MAX_IMAGENES ? '#ef4444' : '#0284c7',
                    background: totalImagenesSubidas >= MAX_IMAGENES ? '#fee2e2' : '#e0f2fe',
                    padding: '2px 8px',
                    borderRadius: '12px',
                  }}
                >
                  Imágenes: {totalImagenesSubidas}/{MAX_IMAGENES}
                </span>
              </div>

              <div className="action-grid">
                <div>
                  <label className="btn-add-img" style={{ margin: 0, height: '100%' }}>
                    <span>{uploading ? 'Cargando...' : '+ Añadir Imagen'}</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      multiple
                      onChange={handleImageUpload}
                      disabled={uploading || totalImagenesSubidas >= MAX_IMAGENES}
                      hidden
                    />
                  </label>
                </div>

                <div>
                  <button type="button" className="btn-add-text" onClick={handleAddText}>
                    + Añadir Texto
                  </button>
                </div>
              </div>

              {/* CONSEJO DE CALIDAD */}
              <div style={{ marginTop: '6px', fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <span><strong>Tip de nitidez:</strong> Usa imágenes PNG transparentes de 800px o más.</span>
              </div>

              {/* LISTA DE CAPAS ESTILO PRINTIFY (Screenshot 2) */}
              {designs.length > 0 && (
                <div style={{ marginTop: '14px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Capas en la prenda ({designs.length})
                    </span>
                    {selectedDesignId && (
                      <button
                        type="button"
                        onClick={() => setSelectedDesignId(null)}
                        style={{ fontSize: '11px', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        Deseleccionar
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
                    {designs.map((d, idx) => {
                      const sel = d.id === selectedDesignId
                      const zoneNombre = activeProduct.zonas[d.view]?.nombre || d.view
                      return (
                        <div
                          key={d.id}
                          className={`printify-layer-row ${sel ? 'active' : ''}`}
                          onClick={() => {
                            setSelectedDesignId(d.id)
                            if (d.view !== view) setView(d.view)
                            setModoDiseno(true)
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                            {d.type === 'image' ? (
                              <img
                                src={d.displayUrl || d.url}
                                alt=""
                                style={{ width: '32px', height: '32px', objectFit: 'contain', borderRadius: '4px', background: '#f1f5f9', border: '1px solid #e2e8f0', flexShrink: 0 }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '4px',
                                  background: '#0284c7',
                                  color: '#ffffff',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: '900',
                                  fontSize: '14px',
                                  flexShrink: 0,
                                }}
                              >
                                T
                              </div>
                            )}
                            <div style={{ overflow: 'hidden' }}>
                              <div style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {d.type === 'image' ? (d.file?.name ? d.file.name.slice(0, 18) : `Imagen ${idx + 1}`) : `"${d.text.slice(0, 16)}"`}
                              </div>
                              <div style={{ fontSize: '10px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ backgroundColor: '#e2e8f0', padding: '1px 5px', borderRadius: '4px', fontWeight: '600' }}>
                                  {zoneNombre}
                                </span>
                                <span>•</span>
                                <span>{Math.round((d.wRel || 0.35) * 100)}%</span>
                                {d.rotation ? <span>• {d.rotation}°</span> : null}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteDesign(d.id)
                            }}
                            title="Eliminar capa"
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: '#94a3b8',
                              cursor: 'pointer',
                              padding: '4px',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'color 0.15s ease',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444' }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8' }}
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* INSPECTOR / EDICIÓN DEL ELEMENTO SELECCIONADO (Estilo Printify) */}
              {selectedDesign && (
                <div className="inspector-card">
                  <div className="inspector-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
                        Ajustes de {selectedDesign.type === 'image' ? 'Imagen' : 'Texto'}
                      </span>
                      <span className="tag is-success is-light is-small" style={{ fontWeight: 'bold' }}>
                        {activeProduct.zonas[selectedDesign.view]?.nombre}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteDesign(selectedDesign.id)}
                      style={{
                        background: '#fee2e2',
                        color: '#dc2626',
                        border: '1px solid #fecaca',
                        borderRadius: '6px',
                        padding: '2px 8px',
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                    >
                      Eliminar
                    </button>
                  </div>

                  {/* 6 BOTONES DE ALINEACIÓN RÁPIDA ESTILO PRINTIFY (Screenshot 2) */}
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>
                      Alineación en la prenda:
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px' }}>
                      <button
                        type="button"
                        onClick={() => alinearIzquierda(selectedDesign.id)}
                        title="Alinear a la izquierda"
                        className="align-tool-btn"
                      >
                        ⇤
                      </button>
                      <button
                        type="button"
                        onClick={() => centrarHorizontal(selectedDesign.id)}
                        title="Centrar horizontalmente"
                        className="align-tool-btn"
                      >
                        ↔
                      </button>
                      <button
                        type="button"
                        onClick={() => alinearDerecha(selectedDesign.id)}
                        title="Alinear a la derecha"
                        className="align-tool-btn"
                      >
                        ⇥
                      </button>
                      <button
                        type="button"
                        onClick={() => alinearArriba(selectedDesign.id)}
                        title="Alinear arriba"
                        className="align-tool-btn"
                      >
                        ⤒
                      </button>
                      <button
                        type="button"
                        onClick={() => centrarVertical(selectedDesign.id)}
                        title="Centrar verticalmente"
                        className="align-tool-btn"
                      >
                        ↕
                      </button>
                      <button
                        type="button"
                        onClick={() => alinearAbajo(selectedDesign.id)}
                        title="Alinear abajo"
                        className="align-tool-btn"
                      >
                        ⤓
                      </button>
                    </div>
                  </div>

                  {/* Mover entre Frente, Espalda o Mangas */}
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>
                      Lado de la prenda:
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {Object.entries(activeProduct.zonas || {}).map(([zKey, zDef]) => {
                        const esActivo = selectedDesign.view === zKey
                        return (
                          <button
                            key={zKey}
                            type="button"
                            onClick={() => cambiarLadoElemento(selectedDesign.id, zKey)}
                            style={{
                              padding: '4px 10px',
                              borderRadius: '14px',
                              fontSize: '11px',
                              fontWeight: esActivo ? '700' : '500',
                              backgroundColor: esActivo ? '#10b981' : '#f1f5f9',
                              color: esActivo ? '#ffffff' : '#334155',
                              border: esActivo ? '1px solid #10b981' : '1px solid #cbd5e1',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            {zDef.nombre}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* SI ES IMAGEN: ESCALA Y QUITAR FONDO BLANCO */}
                  {selectedDesign.type === 'image' && (
                    <div style={{ marginBottom: '12px', background: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      {/* Control de tamaño de la imagen */}
                      <div style={{ marginBottom: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>
                          <span>Tamaño del diseño:</span>
                          <span style={{ color: '#10b981', fontWeight: '700' }}>{Math.round((selectedDesign.wRel || 0.35) * 100)}%</span>
                        </div>
                        <div className="stepper-control">
                          <button
                            type="button"
                            className="stepper-btn"
                            onClick={() => escalarElemento(selectedDesign.id, 0.9)}
                            title="Reducir tamaño"
                          >
                            −
                          </button>
                          <input
                            type="range"
                            min="15"
                            max="95"
                            value={Math.round((selectedDesign.wRel || 0.35) * 100)}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10) / 100
                              const ratio = val / (selectedDesign.wRel || 0.35)
                              escalarElemento(selectedDesign.id, ratio)
                            }}
                            style={{ flex: 1, cursor: 'pointer' }}
                          />
                          <button
                            type="button"
                            className="stepper-btn"
                            onClick={() => escalarElemento(selectedDesign.id, 1.1)}
                            title="Expandir tamaño"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Botón de quitar fondo blanco */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#334155' }}>
                          Fondo de la imagen:
                        </span>
                        {selectedDesign.sinFondo && (
                          <span style={{ fontSize: '10px', color: '#0d9488', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            <span>Fondo removido</span>
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleQuitarFondo(selectedDesign.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          width: '100%',
                          padding: '7px 10px',
                          fontSize: '12px',
                          fontWeight: '600',
                          borderRadius: '6px',
                          border: selectedDesign.sinFondo ? '1px solid #10b981' : '1px solid #cbd5e1',
                          background: selectedDesign.sinFondo ? '#f0fdf4' : '#ffffff',
                          color: selectedDesign.sinFondo ? '#047857' : '#334155',
                          cursor: 'pointer',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                        </svg>
                        <span>{selectedDesign.sinFondo ? 'Restaurar fondo original' : 'Quitar fondo (automático)'}</span>
                      </button>
                      <p style={{ fontSize: '10px', color: '#64748b', marginTop: '5px', lineHeight: '1.3' }}>
                        Detecta y elimina automáticamente el fondo negro, blanco o de color sólido alrededor del diseño para estamparlo limpio.
                      </p>
                    </div>
                  )}

                  {/* SI ES TEXTO: CONFIGURADOR DE FUENTE, TAMAÑO Y COLOR */}
                  {selectedDesign.type === 'text' && (
                    <div style={{ display: 'grid', gap: '10px', marginBottom: '12px', background: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      {/* Texto */}
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>
                          Texto:
                        </div>
                        <input
                          type="text"
                          className="input is-small"
                          value={selectedDesign.text}
                          onChange={(e) => updateDesign(selectedDesign.id, { text: e.target.value })}
                          placeholder="Escribe tu texto..."
                        />
                      </div>

                      {/* Fuente */}
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>
                          Tipografía (Fuentes animadas y divertidas):
                        </div>
                        <div className="select is-small is-fullwidth">
                          <select
                            value={selectedDesign.font}
                            onChange={(e) => updateDesign(selectedDesign.id, { font: e.target.value })}
                            style={{ fontFamily: `"${selectedDesign.font || 'Arial'}", sans-serif` }}
                          >
                            {FONTS.map((f) => (
                              <option
                                key={f.name}
                                value={f.name}
                                style={{ fontFamily: `"${f.name}", sans-serif`, fontSize: '13px' }}
                              >
                                {f.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Control de Tamaño de Fuente */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>
                          <span>Tamaño de letra:</span>
                          <span style={{ color: '#0284c7', fontWeight: '700' }}>{selectedDesign.fontSize || 32} px</span>
                        </div>
                        <div className="stepper-control">
                          <button
                            type="button"
                            className="stepper-btn"
                            onClick={() => updateDesign(selectedDesign.id, { fontSize: Math.max(14, (selectedDesign.fontSize || 32) - 2) })}
                            title="Disminuir tamaño"
                          >
                            −
                          </button>
                          <input
                            type="range"
                            min="14"
                            max="72"
                            value={selectedDesign.fontSize || 32}
                            onChange={(e) => updateDesign(selectedDesign.id, { fontSize: parseInt(e.target.value, 10) })}
                            style={{ flex: 1, cursor: 'pointer' }}
                          />
                          <button
                            type="button"
                            className="stepper-btn"
                            onClick={() => updateDesign(selectedDesign.id, { fontSize: Math.min(72, (selectedDesign.fontSize || 32) + 2) })}
                            title="Aumentar tamaño"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Color de texto */}
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>
                          Color del texto:
                        </div>
                        <div className="text-color-palette">
                          {TEXT_COLORS_QUICK.map((tc) => (
                            <button
                              key={tc.hex}
                              type="button"
                              className={`text-color-dot ${selectedDesign.textColor === tc.hex ? 'active' : ''}`}
                              onClick={() => updateDesign(selectedDesign.id, { textColor: tc.hex })}
                              title={tc.name}
                              style={{ backgroundColor: tc.hex }}
                            />
                          ))}
                          {/* Selector personalizado */}
                          <input
                            type="color"
                            value={selectedDesign.textColor || '#ffffff'}
                            onChange={(e) => updateDesign(selectedDesign.id, { textColor: e.target.value })}
                            title="Color personalizado"
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              border: 'none',
                              padding: 0,
                              cursor: 'pointer',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Rotación (común para imagen y texto) */}
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', fontWeight: '600', color: '#475569', marginBottom: '4px' }}>
                      <span>Rotación: {selectedDesign.rotation || 0}°</span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                      <button
                        type="button"
                        onClick={() => rotarElemento(selectedDesign.id, -15)}
                        style={{
                          flex: 1,
                          padding: '4px',
                          fontSize: '11px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          cursor: 'pointer',
                        }}
                      >
                        ↺ -15°
                      </button>
                      <button
                        type="button"
                        onClick={() => rotarElemento(selectedDesign.id, 15)}
                        style={{
                          flex: 1,
                          padding: '4px',
                          fontSize: '11px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          cursor: 'pointer',
                        }}
                      >
                        ↻ +15°
                      </button>
                      <button
                        type="button"
                        onClick={() => updateDesign(selectedDesign.id, { rotation: 0 })}
                        style={{
                          flex: 1,
                          padding: '4px',
                          fontSize: '11px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          cursor: 'pointer',
                          color: '#10b981',
                          fontWeight: '700',
                        }}
                      >
                        0°
                      </button>
                    </div>
                    <input
                      type="range"
                      min="-180"
                      max="180"
                      value={selectedDesign.rotation || 0}
                      onChange={(e) => updateDesign(selectedDesign.id, { rotation: parseInt(e.target.value, 10) })}
                      style={{ width: '100%', cursor: 'pointer' }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* SECCIÓN 3: DETALLES DEL PEDIDO (TALLA, CANTIDAD, INSTRUCCIONES) */}
            <div className="personalizador-section">
              <div className="section-label">
                <span>3. Detalles del Pedido</span>
              </div>

              <div className="columns is-mobile mb-2">
                {activeProduct.tallas && (
                  <div className="column is-6 py-1">
                    <label style={{ fontSize: '11px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>
                      Talla:
                    </label>
                    <div className="select is-small is-fullwidth">
                      <select value={size} onChange={(e) => setSize(e.target.value)}>
                        <option value="XS">XS</option>
                        <option value="S">S</option>
                        <option value="M">M</option>
                        <option value="L">L</option>
                        <option value="XL">XL</option>
                        <option value="XXL">XXL</option>
                      </select>
                    </div>
                  </div>
                )}
                <div className={`column ${activeProduct.tallas ? 'is-6' : 'is-12'} py-1`}>
                  <label style={{ fontSize: '11px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Cantidad:
                  </label>
                  <input
                    className="input is-small"
                    type="number"
                    min="1"
                    max="50"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  />
                </div>
              </div>

              <div style={{ marginTop: '8px' }}>
                <label style={{ fontSize: '11px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '4px' }}>
                  Indicaciones especiales (opcional):
                </label>
                <textarea
                  className="textarea is-small"
                  placeholder="Ej: El logo de la manga quiero que esté 2 cm más centrado..."
                  rows="2"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* BANNER DE PRECIO Y CHECKOUT */}
              <div className="price-banner">
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Total a pagar</span>
                  <span className="price-amount">C$ {(activeProduct.precio || 350) * quantity}</span>
                </div>
                {quantity > 1 && (
                  <span className="tag is-light is-small">
                    C$ {activeProduct.precio} c/u
                  </span>
                )}
              </div>

              <div style={{ marginTop: '12px' }}>
                <button
                  type="button"
                  className="btn-checkout"
                  onClick={handleAddToCart}
                  disabled={addingToCart || cargando3D}
                >
                  <span>{addingToCart ? 'Procesando...' : 'Finalizar y Agregar al Carrito'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
