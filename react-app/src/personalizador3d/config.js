// Configuración del personalizador 3D.
// Este archivo lo usan tanto la página (React) como el script `npm run bake:zonas`,
// por eso debe ser JavaScript puro (sin imports de Vite ni de React).
//
// ¿Cómo funcionan las zonas?
// Cada zona es un "área de impresión" definida en coordenadas 3D del modelo .glb.
// El script de bake proyecta esa área sobre la superficie de la prenda y guarda,
// para cada píxel de la textura, qué punto del diseño le corresponde.
// Todo lo que quede fuera de una zona (capucha, puños, pretina, asa de la taza...)
// NUNCA recibe diseño: así se aplican las restricciones.
//
// Si cambias una zona (centro, ancho, alto, etc.) vuelve a ejecutar:
//   npm run bake:zonas

/** Resolución de la textura que se genera sobre el modelo (px). */
export const TEX_SIZE = 2048

export const COLORES = {
  negro:       { nombre: 'Negro',        hex: '#1c1c1c' },
  blanco:      { nombre: 'Blanco',       hex: '#f4f4f4' },
  grisClaro:   { nombre: 'Gris claro',   hex: '#bdbdbd' },
  grisOscuro:  { nombre: 'Gris oscuro',  hex: '#4a4a4a' },
  azulOscuro:  { nombre: 'Azul oscuro',  hex: '#14213d' },
  rosado:      { nombre: 'Rosado',       hex: '#f2a7bb' },
  rojo:        { nombre: 'Rojo',         hex: '#b71c1c' },
  verdeOscuro: { nombre: 'Verde oscuro', hex: '#1b4332' },
}

const COLORES_PRENDA = Object.keys(COLORES)

/*
 * Tipos de zona:
 *  - 'plano':    proyección plana. `centro` = centro del área, `derecha` y `abajo` = ejes del
 *                diseño vistos por el cliente, `dir` = dirección desde la que se "estampa"
 *                (apunta hacia afuera de la superficie), `ancho`/`alto` en unidades del modelo.
 *  - 'cilindro': para la taza. Envuelve el diseño alrededor del eje Y.
 *                `angulos` en grados (0 = frente +Z, positivo hacia +X), `y` = [min, max].
 *
 * `cm` = tamaño físico aproximado del área (para el taller y las proporciones del editor).
 * `camara` = posición de la cámara de <model-viewer> al seleccionar la pestaña.
 */
export const PRODUCTOS = {
  sudadera: {
    nombre: 'Sudadera',
    nombreCarrito: 'Sudadera (Con Capucha)',
    dbId: 40,
    precio: 750,
    tallas: true,
    colores: COLORES_PRENDA,
    modelo: '/models3D/hoodie.glb',
    zonasBin: '/models3D/hoodie.zonas.bin',
    zonas: {
      frente: {
        nombre: 'Frente', tipo: 'plano',
        centro: [0, 17.95, 0], derecha: [1, 0, 0], abajo: [0, -1, 0], dir: [0, 0, 1],
        ancho: 3.5, alto: 4.7, cm: [35, 47],
        camara: { orbit: '0deg 80deg auto', target: 'auto auto auto' },
      },
      espalda: {
        nombre: 'Espalda', tipo: 'plano',
        centro: [0, 17.95, 0], derecha: [-1, 0, 0], abajo: [0, -1, 0], dir: [0, 0, -1],
        ancho: 3.8, alto: 5.3, cm: [38, 53],
        camara: { orbit: '180deg 80deg auto', target: 'auto auto auto' },
      },
      mangaIzquierda: {
        // El modelo está en pose "T": la parte exterior de la manga mira hacia arriba (+Y).
        nombre: 'Manga izquierda', tipo: 'plano',
        centro: [6.3, 21, -2.1], derecha: [1, 0, 0], abajo: [0, 0, 1], dir: [0, 1, 0],
        ancho: 4.6, alto: 1.6, cm: [46, 16],
        camara: { orbit: '20deg 35deg 14m', target: '6.3m 20m -2.1m' },
      },
      mangaDerecha: {
        nombre: 'Manga derecha', tipo: 'plano',
        centro: [-6.3, 21, -2.1], derecha: [-1, 0, 0], abajo: [0, 0, 1], dir: [0, 1, 0],
        ancho: 4.6, alto: 1.6, cm: [46, 16],
        camara: { orbit: '-20deg 35deg 14m', target: '-6.3m 20m -2.1m' },
      },
    },
  },

  camiseta: {
    nombre: 'Camiseta',
    nombreCarrito: 'Camiseta Básica',
    dbId: 42,
    precio: 350,
    tallas: true,
    colores: COLORES_PRENDA,
    modelo: '/models3D/camiseta.glb',
    zonasBin: '/models3D/camiseta.zonas.bin',
    // El modelo original trae un material brillante; lo hacemos mate como el algodón.
    material: { roughness: 0.9, metallic: 0 },
    zonas: {
      frente: {
        nombre: 'Frente', tipo: 'plano',
        centro: [0, 1.21, 0], derecha: [1, 0, 0], abajo: [0, -1, 0], dir: [0, 0, 1],
        ancho: 0.6, alto: 0.72, cm: [33, 40],
        camara: { orbit: '0deg 85deg auto', target: 'auto auto auto' },
      },
      espalda: {
        nombre: 'Espalda', tipo: 'plano',
        centro: [0, 1.26, 0], derecha: [-1, 0, 0], abajo: [0, -1, 0], dir: [0, 0, -1],
        ancho: 0.6, alto: 0.76, cm: [33, 42],
        camara: { orbit: '180deg 85deg auto', target: 'auto auto auto' },
      },
      mangaIzquierda: {
        nombre: 'Manga izquierda', tipo: 'plano',
        centro: [0.7, 1.38, -0.08], derecha: [0, 0, -1], abajo: [0, -1, 0], dir: [1, 0, 0],
        ancho: 0.22, alto: 0.24, cm: [12, 13],
        camara: { orbit: '90deg 80deg 1.6m', target: '0.6m 1.38m -0.08m' },
      },
      mangaDerecha: {
        nombre: 'Manga derecha', tipo: 'plano',
        centro: [-0.7, 1.38, -0.08], derecha: [0, 0, 1], abajo: [0, -1, 0], dir: [-1, 0, 0],
        ancho: 0.22, alto: 0.24, cm: [12, 13],
        camara: { orbit: '-90deg 80deg 1.6m', target: '-0.6m 1.38m -0.08m' },
      },
    },
  },

  taza: {
    nombre: 'Taza',
    nombreCarrito: 'Taza Personalizada',
    dbId: null, // TODO: crear el artículo "Taza" en la base de datos y poner aquí su id_item
    precio: 250, // TODO: precio real
    tallas: false,
    colores: ['blanco'], // Las tazas de sublimación son blancas
    modelo: '/models3D/taza.glb',
    zonasBin: '/models3D/taza.zonas.bin',
    zonas: {
      cuerpo: {
        // El asa está hacia -Z (180°); se deja libre un hueco de 80° alrededor de ella.
        nombre: 'Taza', tipo: 'cilindro',
        centro: [0, 0, 0], radioMin: 0.05, angulos: [-140, 140], y: [0.012, 0.126],
        ancho: 0.06 * (280 * Math.PI / 180), alto: 0.114, cm: [20.5, 8],
        camara: { orbit: '0deg 75deg auto', target: 'auto auto auto' },
      },
    },
  },

  jogger: {
    nombre: 'Jogger',
    nombreCarrito: 'Jogger',
    dbId: null,
    precio: 0,
    tallas: true,
    colores: COLORES_PRENDA,
    disponible: false, // Pendiente: falta el modelo 3D (public/models3D/jogger.glb)
    modelo: '/models3D/jogger.glb',
    zonasBin: '/models3D/jogger.zonas.bin',
    zonas: {},
  },

  sueter: {
    nombre: 'Suéter',
    nombreCarrito: 'Suéter (Cuello Redondo)',
    dbId: 41,
    precio: 650,
    tallas: true,
    colores: COLORES_PRENDA,
    disponible: false, // Pendiente: falta el modelo 3D (public/models3D/sueter.glb)
    modelo: '/models3D/sueter.glb',
    zonasBin: '/models3D/sueter.zonas.bin',
    zonas: {},
  },
}

/** Relación de aspecto (ancho / alto) del área de impresión, tal como se proyecta en el modelo. */
export const aspectoZona = (zona) => zona.ancho / zona.alto
