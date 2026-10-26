// Motor de composición de texturas 3D en el navegador.
// Decodifica las zonas pre-calculadas (.zonas.bin) y proyecta los diseños 2D
// sobre el mapa de textura del modelo en milisegundos.

const cacheZonas = new Map()

/**
 * Carga y decodifica el archivo binario de zonas de un producto.
 * @param {string} url Ruta al archivo .zonas.bin
 */
export async function cargarZonasBin(url) {
  if (cacheZonas.has(url)) {
    return cacheZonas.get(url)
  }

  const resp = await fetch(url)
  if (!resp.ok) {
    throw new Error(`No se pudo cargar el archivo de zonas: ${url} (${resp.statusText})`)
  }

  let arrayBuffer
  // Descompresión gzip nativa en el navegador
  if (typeof DecompressionStream !== 'undefined') {
    try {
      const ds = new DecompressionStream('gzip')
      const decompressedStream = resp.body.pipeThrough(ds)
      arrayBuffer = await new Response(decompressedStream).arrayBuffer()
    } catch {
      // Si el servidor web ya entrega el archivo descomprimido automáticamente
      const fallbackResp = await fetch(url)
      arrayBuffer = await fallbackResp.arrayBuffer()
    }
  } else {
    arrayBuffer = await resp.arrayBuffer()
  }

  const view = new DataView(arrayBuffer)
  const magic = String.fromCharCode(
    view.getUint8(0),
    view.getUint8(1),
    view.getUint8(2),
    view.getUint8(3)
  )

  if (magic !== 'PZ01') {
    throw new Error(`Formato de zonas inválido en ${url}. Se esperaba PZ01 y se obtuvo ${magic}`)
  }

  const texSize = view.getUint32(4, true)
  const nZonas = view.getUint32(8, true)
  let offset = 12

  const zonas = {}
  const decoder = new TextDecoder('utf-8')

  for (let z = 0; z < nZonas; z++) {
    const nameLen = view.getUint8(offset)
    offset += 1
    const nameBytes = new Uint8Array(arrayBuffer, offset, nameLen)
    const name = decoder.decode(nameBytes)
    offset += nameLen

    const count = view.getUint32(offset, true)
    offset += 4

    // deltaIdx: Uint32Array con deltas comprimidos
    const deltaIdx = new Uint32Array(arrayBuffer.slice(offset, offset + count * 4))
    offset += count * 4

    // Reconstruir los índices absolutos de píxeles
    const idx = new Uint32Array(count)
    let acc = 0
    for (let i = 0; i < count; i++) {
      acc += deltaIdx[i]
      idx[i] = acc
    }

    const su = new Uint16Array(arrayBuffer.slice(offset, offset + count * 2))
    offset += count * 2

    const tu = new Uint16Array(arrayBuffer.slice(offset, offset + count * 2))
    offset += count * 2

    zonas[name] = { count, idx, su, tu }
  }

  const resultado = { texSize, zonas }
  cacheZonas.set(url, resultado)
  return resultado
}

/**
 * Genera el lienzo de textura completo para el modelo 3D:
 * Aplica el color base seleccionado y estampa los diseños de cada zona en tiempo real.
 *
 * @param {object} params
 * @param {number} params.texSize Tamaño de la textura (ej: 2048)
 * @param {object} params.zonasData Zonas decodificadas de cargarZonasBin
 * @param {string} params.colorHex Color base en formato hex (#1c1c1c)
 * @param {object} params.canvasesPorZona Mapa { [nombreZona]: HTMLCanvasElement }
 * @returns {HTMLCanvasElement}
 */
export function componerTexturaPrenda({ texSize, zonasData, colorHex, canvasesPorZona, fastMode = false }) {
  const canvas = document.createElement('canvas')
  canvas.width = texSize
  canvas.height = texSize
  const ctx = canvas.getContext('2d', { willReadFrequently: true })

  // 1. Color base
  ctx.fillStyle = colorHex
  ctx.fillRect(0, 0, texSize, texSize)

  const imgData = ctx.getImageData(0, 0, texSize, texSize)
  const dst = imgData.data

  // 2. Estampado de cada zona activa
  if (zonasData && zonasData.zonas) {
    for (const [nombreZona, zoneCanvas] of Object.entries(canvasesPorZona)) {
      const zona = zonasData.zonas[nombreZona]
      if (!zona || !zoneCanvas) continue

      const zw = zoneCanvas.width
      const zh = zoneCanvas.height
      if (zw === 0 || zh === 0) continue

      const zctx = zoneCanvas.getContext('2d', { willReadFrequently: true })
      const zImgData = zctx.getImageData(0, 0, zw, zh)
      const src = zImgData.data

      const { count, idx, su, tu } = zona

      if (fastMode) {
        // Modo ultrarrápido (60 FPS) para arrastre, escala y rotación sin demoras
        const zwMinus1 = zw - 1
        const zhMinus1 = zh - 1
        for (let k = 0; k < count; k++) {
          const s = su[k] / 65535
          const t = tu[k] / 65535
          const x = (s * zwMinus1) | 0
          const y = (t * zhMinus1) | 0
          const srcIdx = (y * zw + x) * 4
          const alpha = src[srcIdx + 3]

          if (alpha > 10) {
            const dstIdx = idx[k] * 4
            if (alpha >= 240) {
              dst[dstIdx] = src[srcIdx]
              dst[dstIdx + 1] = src[srcIdx + 1]
              dst[dstIdx + 2] = src[srcIdx + 2]
            } else {
              const a = alpha / 255
              const invA = 1 - a
              dst[dstIdx] = (src[srcIdx] * a + dst[dstIdx] * invA) | 0
              dst[dstIdx + 1] = (src[srcIdx + 1] * a + dst[dstIdx + 1] * invA) | 0
              dst[dstIdx + 2] = (src[srcIdx + 2] * a + dst[dstIdx + 2] * invA) | 0
            }
          }
        }
      } else {
        // Interpolación bilineal de alta fidelidad: elimina bordes pixelados y dientes de sierra
        for (let k = 0; k < count; k++) {
          const s = su[k] / 65535
          const t = tu[k] / 65535

          const fx = s * (zw - 1)
          const fy = t * (zh - 1)
          const x0 = fx | 0
          const y0 = fy | 0
          const x1 = x0 < zw - 1 ? x0 + 1 : x0
          const y1 = y0 < zh - 1 ? y0 + 1 : y0

          const wx1 = fx - x0
          const wx0 = 1 - wx1
          const wy1 = fy - y0
          const wy0 = 1 - wy1

          const w00 = wx0 * wy0
          const w10 = wx1 * wy0
          const w01 = wx0 * wy1
          const w11 = wx1 * wy1

          const i00 = (y0 * zw + x0) * 4
          const i10 = (y0 * zw + x1) * 4
          const i01 = (y1 * zw + x0) * 4
          const i11 = (y1 * zw + x1) * 4

          const alpha = w00 * src[i00 + 3] + w10 * src[i10 + 3] + w01 * src[i01 + 3] + w11 * src[i11 + 3]

          if (alpha > 1) {
            const r = w00 * src[i00] + w10 * src[i10] + w01 * src[i01] + w11 * src[i11]
            const g = w00 * src[i00 + 1] + w10 * src[i10 + 1] + w01 * src[i01 + 1] + w11 * src[i11 + 1]
            const b = w00 * src[i00 + 2] + w10 * src[i10 + 2] + w01 * src[i01 + 2] + w11 * src[i11 + 2]

            const dstIdx = idx[k] * 4
            if (alpha >= 254) {
              dst[dstIdx] = r | 0
              dst[dstIdx + 1] = g | 0
              dst[dstIdx + 2] = b | 0
            } else {
              const a = alpha / 255
              const invA = 1 - a
              dst[dstIdx] = (r * a + dst[dstIdx] * invA) | 0
              dst[dstIdx + 1] = (g * a + dst[dstIdx + 1] * invA) | 0
              dst[dstIdx + 2] = (b * a + dst[dstIdx + 2] * invA) | 0
            }
          }
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0)
  return canvas
}
