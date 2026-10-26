import Swal from 'sweetalert2'

export const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dzlbg8ni6/image/upload'
export const CLOUDINARY_UPLOAD_PRESET = 'ss1j77hf'

/**
 * Sube un archivo, Blob o DataURL (base64) a Cloudinary
 */
export async function uploadToCloudinary(fileOrBlobOrBase64) {
  if (!fileOrBlobOrBase64) return null

  // Si ya es una URL remota de Cloudinary, retornarla directamente
  if (typeof fileOrBlobOrBase64 === 'string' && fileOrBlobOrBase64.startsWith('https://res.cloudinary.com')) {
    return fileOrBlobOrBase64
  }

  const formData = new FormData()
  formData.append('file', fileOrBlobOrBase64)
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)

  const res = await fetch(CLOUDINARY_URL, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(`Error en Cloudinary (${res.status}): ${errorText}`)
  }

  const data = await res.json()
  return data.secure_url || data.url
}

/**
 * Parsea de manera segura el JSON de personalización si existe
 */
export function parseCustomization(raw) {
  if (!raw) return null
  if (typeof raw === 'object') return raw
  if (typeof raw === 'string') {
    const trimmed = raw.trim()
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed)
        if (parsed && (parsed.is3D || parsed.views || parsed.customerLogos || parsed.customerTexts)) {
          return parsed
        }
      } catch {
        return null
      }
    }
  }
  return null
}

/**
 * Obtiene la imagen principal de visualización para un ítem
 */
export function getItemPreviewImage(item) {
  if (!item) return '/img/hero.png'
  const custom = parseCustomization(item.custom_image || item.customization || item.image)
  if (custom?.preview) return custom.preview
  if (custom?.views?.[0]?.image) return custom.views[0].image

  const img = item.custom_image || item.image
  if (typeof img === 'string') {
    if (img.startsWith('http')) return img
    if (!img.startsWith('{')) return `/img/${img}`
  }
  return '/img/hero.png'
}

/**
 * Abre un modal interactivo con todas las vistas 3D capturadas
 */
export function showViewsGalleryModal(views = [], title = 'Vistas 3D de la Prenda') {
  if (!views || views.length === 0) return

  const viewsHtml = `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; margin-top: 14px; text-align: center;">
      ${views.map((v, i) => `
        <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; background: #f8fafc;">
          <div style="font-size: 11px; font-weight: 700; color: #0f172a; margin-bottom: 6px; text-transform: uppercase;">
            ${v.name || v.zone || `Vista ${i + 1}`}
          </div>
          <a href="${v.image}" target="_blank" rel="noopener noreferrer" title="Clic para abrir en tamaño completo">
            <img src="${v.image}" alt="${v.name || 'Vista'}" style="width: 100%; height: 130px; object-fit: contain; border-radius: 6px; background: #fff; cursor: zoom-in;" />
          </a>
        </div>
      `).join('')}
    </div>
  `

  Swal.fire({
    title,
    html: viewsHtml,
    width: 650,
    showConfirmButton: true,
    confirmButtonText: 'Cerrar',
    confirmButtonColor: '#0f172a',
  })
}
