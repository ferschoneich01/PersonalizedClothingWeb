// Genera los mapas de zonas de impresión (public/models3D/*.zonas.bin) a partir de los modelos .glb
// y de la configuración en src/personalizador3d/config.js.
//
// Uso:  npm run bake:zonas            (todos los productos)
//       npm run bake:zonas sudadera   (solo uno)
//       npm run bake:zonas -- --debug (además guarda PNGs de verificación en models3D-src/debug)
//
// Para cada píxel de la textura del modelo calcula a qué punto 3D corresponde y, si ese punto
// está dentro de un área de impresión visible, guarda la coordenada (s, t) del diseño.
// En el navegador basta con recorrer esa lista para "estampar" el diseño en la prenda.

import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'
import { fileURLToPath } from 'node:url'
import { PRODUCTOS, TEX_SIZE } from '../src/personalizador3d/config.js'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const DEBUG = args.includes('--debug')
const soloIds = args.filter((a) => !a.startsWith('--'))

// ---------------------------------------------------------------------------------------------
// Lectura de GLB (geometría en espacio mundo, con las transformaciones de los nodos aplicadas)
// ---------------------------------------------------------------------------------------------
function cargarGLB(file) {
  const buf = fs.readFileSync(file)
  if (buf.readUInt32LE(0) !== 0x46546c67) throw new Error(`${file} no es un archivo .glb válido`)
  const jsonLen = buf.readUInt32LE(12)
  const gltf = JSON.parse(buf.subarray(20, 20 + jsonLen).toString('utf8'))
  const binStart = 20 + jsonLen + 8
  const NCOMP = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 }
  const CSIZE = { 5120: 1, 5121: 1, 5122: 2, 5123: 2, 5125: 4, 5126: 4 }

  const leer = (idx) => {
    const a = gltf.accessors[idx]
    const bv = gltf.bufferViews[a.bufferView]
    const n = NCOMP[a.type]
    const cs = CSIZE[a.componentType]
    const stride = bv.byteStride || n * cs
    const base = binStart + (bv.byteOffset || 0) + (a.byteOffset || 0)
    const out = new Float64Array(a.count * n)
    for (let i = 0; i < a.count; i++) {
      for (let c = 0; c < n; c++) {
        const o = base + i * stride + c * cs
        let v
        switch (a.componentType) {
          case 5126: v = buf.readFloatLE(o); break
          case 5125: v = buf.readUInt32LE(o); break
          case 5123: v = buf.readUInt16LE(o); if (a.normalized) v /= 65535; break
          case 5121: v = buf.readUInt8(o); if (a.normalized) v /= 255; break
          case 5122: v = buf.readInt16LE(o); if (a.normalized) v = Math.max(v / 32767, -1); break
          default: v = buf.readInt8(o); if (a.normalized) v = Math.max(v / 127, -1)
        }
        out[i * n + c] = v
      }
    }
    return out
  }

  const mul = (a, b) => {
    const r = new Array(16).fill(0)
    for (let i = 0; i < 4; i++) for (let k = 0; k < 4; k++) for (let l = 0; l < 4; l++) r[k * 4 + i] += a[l * 4 + i] * b[k * 4 + l]
    return r
  }
  const trs = (n) => {
    if (n.matrix) return n.matrix
    const [x, y, z, w] = n.rotation || [0, 0, 0, 1]
    const [sx, sy, sz] = n.scale || [1, 1, 1]
    const [tx, ty, tz] = n.translation || [0, 0, 0]
    return [
      (1 - 2 * (y * y + z * z)) * sx, 2 * (x * y + z * w) * sx, 2 * (x * z - y * w) * sx, 0,
      2 * (x * y - z * w) * sy, (1 - 2 * (x * x + z * z)) * sy, 2 * (y * z + x * w) * sy, 0,
      2 * (x * z + y * w) * sz, 2 * (y * z - x * w) * sz, (1 - 2 * (x * x + y * y)) * sz, 0,
      tx, ty, tz, 1,
    ]
  }
  const ID = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
  const instancias = []
  const recorrer = (ni, padre) => {
    const n = gltf.nodes[ni]
    const m = mul(padre, trs(n))
    if (n.mesh !== undefined) instancias.push({ mesh: n.mesh, m })
    ;(n.children || []).forEach((c) => recorrer(c, m))
  }
  gltf.scenes[gltf.scene || 0].nodes.forEach((n) => recorrer(n, ID))

  const P = [], U = [], N = []
  for (const { mesh, m: M } of instancias) {
    // Matriz normal = inversa transpuesta de la parte 3x3
    const a = [M[0], M[1], M[2], M[4], M[5], M[6], M[8], M[9], M[10]]
    const det = a[0] * (a[4] * a[8] - a[5] * a[7]) - a[3] * (a[1] * a[8] - a[2] * a[7]) + a[6] * (a[1] * a[5] - a[2] * a[4])
    const inv = [
      (a[4] * a[8] - a[5] * a[7]) / det, (a[2] * a[7] - a[1] * a[8]) / det, (a[1] * a[5] - a[2] * a[4]) / det,
      (a[5] * a[6] - a[3] * a[8]) / det, (a[0] * a[8] - a[2] * a[6]) / det, (a[2] * a[3] - a[0] * a[5]) / det,
      (a[3] * a[7] - a[4] * a[6]) / det, (a[1] * a[6] - a[0] * a[7]) / det, (a[0] * a[4] - a[1] * a[3]) / det,
    ] // columnas de la inversa (column-major)
    for (const prim of gltf.meshes[mesh].primitives) {
      if (prim.attributes.TEXCOORD_0 === undefined) continue
      const pos = leer(prim.attributes.POSITION)
      const uv = leer(prim.attributes.TEXCOORD_0)
      const nor = prim.attributes.NORMAL !== undefined ? leer(prim.attributes.NORMAL) : null
      const idx = prim.indices !== undefined ? leer(prim.indices) : Float64Array.from({ length: pos.length / 3 }, (_, i) => i)
      const tp = (i) => [0, 1, 2].map((c) => M[c] * pos[i * 3] + M[4 + c] * pos[i * 3 + 1] + M[8 + c] * pos[i * 3 + 2] + M[12 + c])
      // normal' = (M^-1)^T n  ->  componente c = sum_r inv[r][c] * n[r]  (inv en column-major: inv[col*3+row])
      const tn = (i) => {
        const n = [nor[i * 3], nor[i * 3 + 1], nor[i * 3 + 2]]
        const v = [0, 1, 2].map((c) => inv[c * 3] * n[0] + inv[c * 3 + 1] * n[1] + inv[c * 3 + 2] * n[2])
        const L = Math.hypot(...v) || 1
        return v.map((q) => q / L)
      }
      for (let t = 0; t < idx.length; t += 3) {
        const ids = [idx[t], idx[t + 1], idx[t + 2]]
        const ps = ids.map(tp)
        let ns
        if (nor) ns = ids.map(tn)
        else {
          const e1 = ps[1].map((v, k) => v - ps[0][k]), e2 = ps[2].map((v, k) => v - ps[0][k])
          const f = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]]
          const L = Math.hypot(...f) || 1
          ns = [0, 1, 2].map(() => f.map((q) => (q / L) * Math.sign(det)))
        }
        ps.forEach((p) => P.push(...p))
        ns.forEach((n) => N.push(...n))
        ids.forEach((i) => U.push(uv[i * 2], uv[i * 2 + 1]))
      }
    }
  }
  return { pos: Float64Array.from(P), nrm: Float64Array.from(N), uv: Float64Array.from(U), tris: P.length / 9 }
}

function rasterTri(p0, p1, p2, W, H, cb) {
  const minX = Math.max(0, Math.floor(Math.min(p0[0], p1[0], p2[0])))
  const maxX = Math.min(W - 1, Math.ceil(Math.max(p0[0], p1[0], p2[0])))
  const minY = Math.max(0, Math.floor(Math.min(p0[1], p1[1], p2[1])))
  const maxY = Math.min(H - 1, Math.ceil(Math.max(p0[1], p1[1], p2[1])))
  const area = (p1[0] - p0[0]) * (p2[1] - p0[1]) - (p1[1] - p0[1]) * (p2[0] - p0[0])
  if (Math.abs(area) < 1e-12) return
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const px = x + 0.5, py = y + 0.5
      const w0 = ((p1[0] - px) * (p2[1] - py) - (p1[1] - py) * (p2[0] - px)) / area
      const w1 = ((p2[0] - px) * (p0[1] - py) - (p2[1] - py) * (p0[0] - px)) / area
      const w2 = 1 - w0 - w1
      if (w0 >= -1e-4 && w1 >= -1e-4 && w2 >= -1e-4) cb(x, y, w0, w1, w2)
    }
  }
}

const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]

// ---------------------------------------------------------------------------------------------
// Bake
// ---------------------------------------------------------------------------------------------
function bakeProducto(id, prod) {
  const file = path.join(ROOT, 'public', prod.modelo)
  if (!fs.existsSync(file)) { console.log(`- ${id}: sin modelo (${prod.modelo}), se omite`); return }
  const nombresZonas = Object.keys(prod.zonas)
  if (!nombresZonas.length) { console.log(`- ${id}: sin zonas, se omite`); return }

  const g = cargarGLB(file)
  const S = TEX_SIZE
  // 1) Mapa de posición y normal por texel (rasterizando cada triángulo en espacio UV)
  const cubierto = new Uint8Array(S * S)
  const wpos = new Float32Array(S * S * 3)
  const wnrm = new Float32Array(S * S * 3)
  for (let t = 0; t < g.tris; t++) {
    const uvs = [0, 1, 2].map((k) => [g.uv[t * 6 + k * 2] * S, g.uv[t * 6 + k * 2 + 1] * S])
    rasterTri(uvs[0], uvs[1], uvs[2], S, S, (x, y, a, b, c) => {
      const i = y * S + x
      cubierto[i] = 1
      for (let k = 0; k < 3; k++) {
        wpos[i * 3 + k] = a * g.pos[t * 9 + k] + b * g.pos[t * 9 + 3 + k] + c * g.pos[t * 9 + 6 + k]
        wnrm[i * 3 + k] = a * g.nrm[t * 9 + k] + b * g.nrm[t * 9 + 3 + k] + c * g.nrm[t * 9 + 6 + k]
      }
    })
  }

  const zonasOut = []
  for (const nombre of nombresZonas) {
    const z = prod.zonas[nombre]
    const sArr = new Float32Array(S * S).fill(-1)
    const tArr = new Float32Array(S * S).fill(-1)

    if (z.tipo === 'plano') {
      // 2) Buffer de profundidad visto desde la dirección de estampado, para quedarnos solo con
      //    la superficie más cercana (evita estampar la cara interior o la parte de atrás).
      const ZR = 768
      const zw = z.ancho >= z.alto ? ZR : Math.ceil(ZR * z.ancho / z.alto)
      const zh = z.ancho >= z.alto ? Math.ceil(ZR * z.alto / z.ancho) : ZR
      const margen = 1.15 // un poco más grande que el área para no fallar en los bordes
      const proy = (p) => {
        const d = [p[0] - z.centro[0], p[1] - z.centro[1], p[2] - z.centro[2]]
        return [
          (dot(d, z.derecha) / (z.ancho * margen) + 0.5) * zw,
          (dot(d, z.abajo) / (z.alto * margen) + 0.5) * zh,
          dot(p, z.dir),
        ]
      }
      const zbuf = new Float64Array(zw * zh).fill(-Infinity)
      for (let t = 0; t < g.tris; t++) {
        const pr = [0, 1, 2].map((k) => proy([g.pos[t * 9 + k * 3], g.pos[t * 9 + k * 3 + 1], g.pos[t * 9 + k * 3 + 2]]))
        rasterTri(pr[0], pr[1], pr[2], zw, zh, (x, y, a, b, c) => {
          const d = a * pr[0][2] + b * pr[1][2] + c * pr[2][2]
          if (d > zbuf[y * zw + x]) zbuf[y * zw + x] = d
        })
      }
      const tol = Math.max(z.ancho, z.alto) * 0.02
      for (let i = 0; i < S * S; i++) {
        if (!cubierto[i]) continue
        const p = [wpos[i * 3], wpos[i * 3 + 1], wpos[i * 3 + 2]]
        const n = [wnrm[i * 3], wnrm[i * 3 + 1], wnrm[i * 3 + 2]]
        const nl = Math.hypot(...n) || 1
        if (dot(n, z.dir) / nl < 0.15) continue // mira hacia otro lado
        const d = [p[0] - z.centro[0], p[1] - z.centro[1], p[2] - z.centro[2]]
        const s = dot(d, z.derecha) / z.ancho + 0.5
        const tt = dot(d, z.abajo) / z.alto + 0.5
        if (s < 0 || s > 1 || tt < 0 || tt > 1) continue
        const [px, py, depth] = proy(p)
        const zx = Math.min(zw - 1, Math.max(0, Math.floor(px))), zy = Math.min(zh - 1, Math.max(0, Math.floor(py)))
        let zmax = -Infinity
        for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) {
          const xx = zx + ox, yy = zy + oy
          if (xx >= 0 && yy >= 0 && xx < zw && yy < zh) zmax = Math.max(zmax, zbuf[yy * zw + xx])
        }
        if (depth < zmax - tol) continue // tapado por otra superficie
        sArr[i] = s
        tArr[i] = tt
      }
    } else if (z.tipo === 'cilindro') {
      const a0 = (z.angulos[0] * Math.PI) / 180, a1 = (z.angulos[1] * Math.PI) / 180
      for (let i = 0; i < S * S; i++) {
        if (!cubierto[i]) continue
        const x = wpos[i * 3] - z.centro[0], y = wpos[i * 3 + 1], zz = wpos[i * 3 + 2] - z.centro[2]
        const r = Math.hypot(x, zz)
        if (r < z.radioMin || y < z.y[0] || y > z.y[1]) continue
        const n = [wnrm[i * 3], wnrm[i * 3 + 1], wnrm[i * 3 + 2]]
        const nl = Math.hypot(...n) || 1
        if ((n[0] * x + n[2] * zz) / (r * nl) < 0.5) continue // solo la cara exterior
        const ang = Math.atan2(x, zz)
        if (ang < a0 || ang > a1) continue
        sArr[i] = (ang - a0) / (a1 - a0)
        tArr[i] = (z.y[1] - y) / (z.y[1] - z.y[0])
      }
    } else {
      throw new Error(`Tipo de zona desconocido: ${z.tipo}`)
    }

    // 3) Dilatar 2 px hacia el margen vacío de la textura para evitar bordes en las costuras UV
    for (let pass = 0; pass < 2; pass++) {
      const nuevos = []
      for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
        const i = y * S + x
        if (sArr[i] >= 0 || cubierto[i]) continue
        for (const [ox, oy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const xx = x + ox, yy = y + oy
          if (xx < 0 || yy < 0 || xx >= S || yy >= S) continue
          const j = yy * S + xx
          if (sArr[j] >= 0) { nuevos.push([i, sArr[j], tArr[j]]); break }
        }
      }
      for (const [i, s, t] of nuevos) { sArr[i] = s; tArr[i] = t; cubierto[i] = 2 }
    }

    const indices = []
    for (let i = 0; i < S * S; i++) if (sArr[i] >= 0) indices.push(i)
    const idx = new Uint32Array(indices.length)
    const su = new Uint16Array(indices.length)
    const tu = new Uint16Array(indices.length)
    let prev = 0
    indices.forEach((i, k) => {
      idx[k] = i - prev // delta: comprime mucho mejor
      prev = i
      su[k] = Math.round(sArr[i] * 65535)
      tu[k] = Math.round(tArr[i] * 65535)
    })
    zonasOut.push({ nombre, idx, su, tu })
    console.log(`  · ${nombre}: ${indices.length.toLocaleString()} píxeles de textura`)

    if (DEBUG) guardarDebug(id, nombre, S, cubierto, sArr, tArr)
  }

  // Formato: "PZ01" | u32 texSize | u32 nZonas | por zona: u8 len, nombre, u32 n, n*u32 deltaIdx, n*u16 s, n*u16 t
  const partes = []
  const head = Buffer.alloc(12)
  head.write('PZ01', 0, 'ascii')
  head.writeUInt32LE(S, 4)
  head.writeUInt32LE(zonasOut.length, 8)
  partes.push(head)
  for (const z of zonasOut) {
    const nb = Buffer.from(z.nombre, 'utf8')
    const h = Buffer.alloc(1 + nb.length + 4)
    h.writeUInt8(nb.length, 0)
    nb.copy(h, 1)
    h.writeUInt32LE(z.idx.length, 1 + nb.length)
    partes.push(h, Buffer.from(z.idx.buffer), Buffer.from(z.su.buffer), Buffer.from(z.tu.buffer))
  }
  const gz = zlib.gzipSync(Buffer.concat(partes), { level: 9 })
  const outFile = path.join(ROOT, 'public', prod.zonasBin)
  fs.writeFileSync(outFile, gz)
  console.log(`  → ${prod.zonasBin} (${(gz.length / 1024).toFixed(0)} KB)`)
}

// PNG de verificación: textura con cuadrícula del diseño dentro de la zona
function guardarDebug(id, zona, S, cubierto, sArr, tArr) {
  const D = 1024, f = S / D
  const rgb = Buffer.alloc(D * D * 3, 20)
  for (let y = 0; y < D; y++) for (let x = 0; x < D; x++) {
    const i = Math.floor(y * f) * S + Math.floor(x * f)
    const o = (y * D + x) * 3
    if (sArr[i] >= 0) {
      const s = sArr[i], t = tArr[i]
      const lin = (s * 10) % 1 < 0.08 || (t * 10) % 1 < 0.08
      rgb[o] = lin ? 255 : Math.round(s * 255)
      rgb[o + 1] = lin ? 255 : Math.round(t * 255)
      rgb[o + 2] = lin ? 255 : 120
    } else if (cubierto[i]) { rgb[o] = rgb[o + 1] = rgb[o + 2] = 70 }
  }
  const dir = path.join(ROOT, 'models3D-src', 'debug')
  fs.mkdirSync(dir, { recursive: true })
  escribirPNG(path.join(dir, `${id}_${zona}.png`), D, D, rgb)
}

function escribirPNG(file, W, H, rgb) {
  const crcT = []
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; crcT[n] = c >>> 0 }
  const crc32 = (b) => { let c = 0xffffffff; for (const x of b) c = crcT[(c ^ x) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0 }
  const chunk = (type, data) => {
    const l = Buffer.alloc(4); l.writeUInt32BE(data.length)
    const td = Buffer.concat([Buffer.from(type), data])
    const c = Buffer.alloc(4); c.writeUInt32BE(crc32(td))
    return Buffer.concat([l, td, c])
  }
  const raw = Buffer.alloc((W * 3 + 1) * H)
  for (let y = 0; y < H; y++) rgb.copy(raw, y * (W * 3 + 1) + 1, y * W * 3, (y + 1) * W * 3)
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 2
  fs.writeFileSync(file, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]))
}

for (const [id, prod] of Object.entries(PRODUCTOS)) {
  if (soloIds.length && !soloIds.includes(id)) continue
  console.log(`- ${id}`)
  const t0 = Date.now()
  bakeProducto(id, prod)
  console.log(`  (${((Date.now() - t0) / 1000).toFixed(1)} s)`)
}
