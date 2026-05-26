import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import Swal from 'sweetalert2'
import { Rnd } from 'react-rnd'
import html2canvas from 'html2canvas'

const GARMENTS = {
  sueter: { id: 'custom-sueter', name: 'Suéter (Cuello Redondo)', price: 650, db_id: 41 },
  sudadera: { id: 'custom-sudadera', name: 'Sudadera (Con Capucha)', price: 750, db_id: 40 },
  camiseta: { id: 'custom-camiseta', name: 'Camiseta Básica', price: 350, db_id: 42 }
}

const MOCKUPS = {
  sueter: { 
    front: {
      black: '/img/crewneck_black_front.png',
      white: '/img/crewneck_white_front_1779694027745.png',
      gray: '/img/crewneck_gray_front.png',
      pink: '/img/crewneck_pink_front.png',
    },
    back: {
      black: '/img/hoodie_black_back.png',
      white: '/img/hoodie_mockup_back.png',
      gray: '/img/hoodie_gray_back.png',
      pink: '/img/hoodie_pink_back.png'
    },
    sleeve: {
      black: '/img/tshirt_black_sleeve.png',
      white: '/img/tshirt_mockup_sleeve.png',
      gray: '/img/tshirt_gray_sleeve.png',
      pink: '/img/tshirt_pink_sleeve.png'
    }
  },
  sudadera: { 
    front: {
      black: '/img/hoodie_black_front_1779693992723.png',
      white: '/img/hoodie_white_front_1779693980563.png',
      gray: '/img/hoodie_gray_front_1779694004101.png',
      pink: '/img/hoodie_pink_front_1779694016511.png',
    },
    back: {
      black: '/img/hoodie_black_back.png',
      white: '/img/hoodie_mockup_back.png',
      gray: '/img/hoodie_gray_back.png',
      pink: '/img/hoodie_pink_back.png'
    },
    sleeve: {
      black: '/img/tshirt_black_sleeve.png',
      white: '/img/tshirt_mockup_sleeve.png',
      gray: '/img/tshirt_gray_sleeve.png',
      pink: '/img/tshirt_pink_sleeve.png'
    }
  },
  camiseta: { 
    front: {
      black: '/img/tshirt_black_front_1779693938276.png',
      white: '/img/tshirt_white_front_1779693927263.png',
      gray: '/img/tshirt_gray_front_1779693950684.png',
      pink: '/img/tshirt_pink_front_1779693966987.png',
    },
    back: {
      black: '/img/tshirt_black_back.png',
      white: '/img/tshirt_mockup_back.png',
      gray: '/img/tshirt_gray_back.png',
      pink: '/img/tshirt_pink_back.png'
    },
    sleeve: {
      black: '/img/tshirt_black_sleeve.png',
      white: '/img/tshirt_mockup_sleeve.png',
      gray: '/img/tshirt_gray_sleeve.png',
      pink: '/img/tshirt_pink_sleeve.png'
    }
  }
}

const COLOR_MAP = {
  black: '#444444', 
  white: '#ffffff',
  gray: '#bbbbbb',
  pink: '#ffc0cb'
}

const FONTS = ['Arial', 'Verdana', 'Impact', 'Courier New', 'Comic Sans MS', 'Times New Roman']

export default function Personalizar() {
  const { addToCart } = useCart()
  const navigate = useNavigate()
  const captureRef = useRef(null)

  const [garmentKey, setGarmentKey] = useState('sudadera')
  const [color, setColor] = useState('black')
  const [view, setView] = useState('front') 
  
  // design object: { id, type: 'image'|'text', url?, text?, font?, textColor?, x, y, width, height, view }
  const [designs, setDesigns] = useState([]) 
  const [uploading, setUploading] = useState(false)
  const [addingToCart, setAddingToCart] = useState(false)
  const [selectedDesignId, setSelectedDesignId] = useState(null)
  
  const [size, setSize] = useState('M')
  const [quantity, setQuantity] = useState(1)
  const [instructions, setInstructions] = useState('')

  const activeGarment = GARMENTS[garmentKey]
  const currentMockupSrc = typeof MOCKUPS[garmentKey][view] === 'string' 
    ? MOCKUPS[garmentKey][view] 
    : MOCKUPS[garmentKey][view][color]
  const needsTint = typeof MOCKUPS[garmentKey][view] === 'string' || (garmentKey === 'sueter' && color === 'pink')
  const containerBg = needsTint ? COLOR_MAP[color] : '#f5f5f5'
  const imgBlendMode = needsTint ? 'multiply' : 'normal'

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dzlbg8ni6/image/upload'
    const CLOUDINARY_UPLOAD_PRESET = 'ss1j77hf'

    const uploadData = new FormData()
    uploadData.append('file', file)
    uploadData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)

    try {
      const res = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: uploadData
      })
      const data = await res.json()
      
      const newDesign = {
        id: Date.now(),
        type: 'image',
        url: data.secure_url,
        view: view,
        x: 150,
        y: 150,
        width: 150,
        height: 150
      }
      setDesigns([...designs, newDesign])
      setSelectedDesignId(newDesign.id)
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Error al subir el diseño' })
    } finally {
      setUploading(false)
    }
  }

  const handleAddText = () => {
    const newDesign = {
      id: Date.now(),
      type: 'text',
      text: 'Tu Texto',
      font: 'Arial',
      textColor: '#000000',
      view: view,
      x: 150,
      y: 150,
      width: 200,
      height: 50
    }
    setDesigns([...designs, newDesign])
    setSelectedDesignId(newDesign.id)
  }

  const updateDesign = (id, newProps) => {
    setDesigns(designs.map(d => d.id === id ? { ...d, ...newProps } : d))
  }

  const deleteDesign = (id) => {
    setDesigns(designs.filter(d => d.id !== id))
    setSelectedDesignId(null)
  }

  const sleep = ms => new Promise(r => setTimeout(r, ms))

  const handleAddToCart = async (e) => {
    e.preventDefault()

    if (designs.length === 0) {
      Swal.fire({ icon: 'warning', title: 'Falta Diseño', text: 'Agrega al menos una imagen o texto a tu diseño.' })
      return
    }

    setAddingToCart(true)

    try {
      // 1. Determine which views have designs
      const viewsWithDesigns = [...new Set(designs.map(d => d.view))]
      const originalView = view
      
      const finalCanvas = document.createElement('canvas')
      const ctx = finalCanvas.getContext('2d')
      let currentX = 0

      for (let i = 0; i < viewsWithDesigns.length; i++) {
        const v = viewsWithDesigns[i]
        setView(v)
        await sleep(600) // Wait for React to render and images to be painted
        
        const canvas = await html2canvas(captureRef.current, { 
          useCORS: true,
          allowTaint: true,
          backgroundColor: containerBg,
          scale: 1 // Keep scale 1 to prevent huge images
        })
        
        if (i === 0) {
          finalCanvas.width = canvas.width * viewsWithDesigns.length
          finalCanvas.height = canvas.height
        }
        
        ctx.drawImage(canvas, currentX, 0)
        currentX += canvas.width
      }
      
      // Restore original view
      setView(originalView)
      await sleep(100)

      const blob = await new Promise(resolve => finalCanvas.toBlob(resolve, 'image/jpeg', 0.85))
      
      // 2. Upload snapshot to Cloudinary
      const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dzlbg8ni6/image/upload'
      const CLOUDINARY_UPLOAD_PRESET = 'ss1j77hf'
      const uploadData = new FormData()
      uploadData.append('file', blob)
      uploadData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)

      const res = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: uploadData
      })
      const data = await res.json()
      const finalImageUrl = data.secure_url

      // 3. Add to Cart
      const cartItem = {
        id_item: activeGarment.db_id, 
        name: `${activeGarment.name} - ${color} (Personalizado)`,
        price: activeGarment.price,
        quantity: parseInt(quantity),
        size: size,
        color: color,
        image: finalImageUrl, 
        id_cartItem: `custom-${Date.now()}`
      }

      addToCart(cartItem)
      Swal.fire({ icon: 'success', title: '¡Añadido!', text: 'Se ha agregado al carrito.', timer: 1500, showConfirmButton: false })
      navigate('/cart')
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Hubo un problema procesando la imagen final.' })
    } finally {
      setAddingToCart(false)
    }
  }

  const selectedDesign = designs.find(d => d.id === selectedDesignId)

  return (
    <div className="container" style={{ marginTop: '50px', marginBottom: '50px', minHeight: '80vh' }}>
      <h1 className="title is-2 has-text-centered">Crea tu estilo único</h1>
      
      <div className="columns is-multiline">
        
        {/* PREVIEW PANEL */}
        <div className="column is-7">
          <div className="box" style={{ padding: '0', overflow: 'hidden', position: 'relative', border: '1px solid #ddd' }}>
            
            <div className="tabs is-centered is-boxed is-small" style={{ margin: 0, backgroundColor: '#f5f5f5' }}>
              <ul>
                <li className={view === 'front' ? 'is-active' : ''}>
                  <a onClick={() => setView('front')}>Frente</a>
                </li>
                <li className={view === 'back' ? 'is-active' : ''}>
                  <a onClick={() => setView('back')}>Espalda</a>
                </li>
                <li className={view === 'sleeve' ? 'is-active' : ''}>
                  <a onClick={() => setView('sleeve')}>Manga Izquierda</a>
                </li>
              </ul>
            </div>

            {/* MOCKUP VIEWER */}
            <div 
              ref={captureRef}
              style={{ 
                position: 'relative', 
                width: '100%', 
                height: '500px',
                backgroundColor: containerBg, 
                display: 'flex', 
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden'
              }}
              onClick={() => setSelectedDesignId(null)}
            >
              <img 
                src={currentMockupSrc} 
                alt="Garment Preview" 
                crossOrigin="anonymous"
                style={{ 
                  width: '100%', 
                  height: '100%',
                  objectFit: 'cover', 
                  mixBlendMode: imgBlendMode,
                  pointerEvents: 'none'
                }}
              />
              
              {designs.filter(d => d.view === view).map(design => (
                <Rnd
                  key={design.id}
                  bounds="parent"
                  position={{ x: design.x, y: design.y }}
                  size={{ width: design.width, height: design.height }}
                  onDragStop={(e, d) => updateDesign(design.id, { x: d.x, y: d.y })}
                  onResizeStop={(e, direction, ref, delta, position) => {
                    updateDesign(design.id, {
                      width: parseInt(ref.style.width, 10),
                      height: parseInt(ref.style.height, 10),
                      ...position,
                    })
                  }}
                  onPointerDown={(e) => { e.stopPropagation(); setSelectedDesignId(design.id); }}
                  style={{
                    border: selectedDesignId === design.id ? '2px dashed #00d1b2' : 'none',
                    zIndex: selectedDesignId === design.id ? 10 : 1
                  }}
                >
                  <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                    {design.type === 'image' ? (
                      <img 
                        src={design.url} 
                        crossOrigin="anonymous"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                        draggable={false} 
                      />
                    ) : (
                      <div style={{
                        width: '100%', height: '100%', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: design.textColor,
                        fontFamily: design.font,
                        fontSize: '32px', // Scales via resize? Rnd doesn't scale font-size automatically unless we use SVG or container queries. We use viewBox trick or just let it overflow for now. Let's make it fill.
                        textAlign: 'center',
                        wordBreak: 'break-word',
                        overflow: 'hidden'
                      }}>
                        <svg width="100%" height="100%">
                          <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill={design.textColor} fontFamily={design.font} style={{ fontSize: '100%' }}>
                            {design.text}
                          </text>
                        </svg>
                      </div>
                    )}
                    
                    {selectedDesignId === design.id && (
                      <button 
                        onPointerDown={(e) => { e.stopPropagation(); deleteDesign(design.id); }}
                        className="delete is-medium" 
                        style={{ 
                          position: 'absolute', 
                          top: '-15px', 
                          right: '-15px', 
                          backgroundColor: '#ff3860',
                          cursor: 'pointer',
                          zIndex: 999
                        }}
                      ></button>
                    )}
                  </div>
                </Rnd>
              ))}
            </div>
          </div>
          <p className="help has-text-centered mt-2">Arrastra y redimensiona tu diseño. Haz clic sobre él para borrarlo o editarlo.</p>
        </div>

        {/* OPTIONS PANEL */}
        <div className="column is-5">
          <div className="box">
            <h5 className="has-text-centered has-text-white has-background-black" style={{ padding: '10px', marginTop: '-20px', marginLeft: '-20px', marginRight: '-20px' }}>
              Herramientas de Diseño
            </h5>

            <div className="content" style={{ marginTop: '20px', maxHeight: '550px', overflowY: 'auto', overflowX: 'hidden' }}>
              
              <p><strong>1. Prenda y Color:</strong></p>
              <div className="columns is-mobile is-multiline">
                <div className="column is-4 has-text-centered" style={{ padding: '0.25rem' }}>
                  <button className="button is-white" onClick={() => setGarmentKey('sueter')} style={{ border: garmentKey === 'sueter' ? '2px solid #00d1b2' : '1px solid #ddd', height: 'auto', padding: '5px', width: '100%' }}>
                    <span className="is-size-7">Suéter</span>
                  </button>
                </div>
                <div className="column is-4 has-text-centered" style={{ padding: '0.25rem' }}>
                  <button className="button is-white" onClick={() => setGarmentKey('sudadera')} style={{ border: garmentKey === 'sudadera' ? '2px solid #00d1b2' : '1px solid #ddd', height: 'auto', padding: '5px', width: '100%' }}>
                    <span className="is-size-7">Sudadera</span>
                  </button>
                </div>
                <div className="column is-4 has-text-centered" style={{ padding: '0.25rem' }}>
                  <button className="button is-white" onClick={() => setGarmentKey('camiseta')} style={{ border: garmentKey === 'camiseta' ? '2px solid #00d1b2' : '1px solid #ddd', height: 'auto', padding: '5px', width: '100%' }}>
                    <span className="is-size-7">Camiseta</span>
                  </button>
                </div>
              </div>

              <div className="buttons is-centered mt-2">
                {Object.keys(COLOR_MAP).map(c => (
                  <button 
                    key={c}
                    className="button is-white" 
                    onClick={() => setColor(c)}
                    style={{ border: color === c ? '2px solid #00d1b2' : 'none', padding: '2px', borderRadius: '50%', margin: '0 5px' }}
                  >
                    <div style={{ width: '25px', height: '25px', borderRadius: '50%', backgroundColor: COLOR_MAP[c], border: '1px solid #ccc' }}></div>
                  </button>
                ))}
              </div>

              <hr style={{ margin: '10px 0' }}/>
              <p><strong>2. Agrega Elementos ({view}):</strong></p>
              
              <div className="columns is-mobile">
                <div className="column is-6">
                  <div className={`file is-dark has-name is-fullwidth ${uploading ? 'is-loading' : ''}`}>
                    <label className="file-label">
                      <input className="file-input" type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                      <span className="file-cta" style={{ justifyContent: 'center' }}>
                        <span className="file-icon"><i className="zmdi zmdi-upload"></i></span>
                        <span className="file-label">{uploading ? '...' : 'Añadir Imagen'}</span>
                      </span>
                    </label>
                  </div>
                </div>
                <div className="column is-6">
                  <button className="button is-info is-fullwidth" onClick={handleAddText}>
                    <i className="zmdi zmdi-format-size" style={{ marginRight: '5px' }}></i> Añadir Texto
                  </button>
                </div>
              </div>

              {selectedDesign && selectedDesign.type === 'text' && (
                <div className="notification is-light p-3 mt-2">
                  <p className="is-size-7 has-text-weight-bold mb-2">Editar Texto Seleccionado:</p>
                  <input 
                    type="text" 
                    className="input is-small mb-2" 
                    value={selectedDesign.text} 
                    onChange={(e) => updateDesign(selectedDesign.id, { text: e.target.value })} 
                  />
                  <div className="columns is-mobile">
                    <div className="column is-7">
                      <div className="select is-small is-fullwidth">
                        <select value={selectedDesign.font} onChange={(e) => updateDesign(selectedDesign.id, { font: e.target.value })}>
                          {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="column is-5">
                      <input 
                        type="color" 
                        className="input is-small" 
                        style={{ padding: '0', height: '100%' }}
                        value={selectedDesign.textColor} 
                        onChange={(e) => updateDesign(selectedDesign.id, { textColor: e.target.value })} 
                      />
                    </div>
                  </div>
                </div>
              )}

              <hr style={{ margin: '10px 0' }}/>

              <div className="field mt-3">
                <label className="label is-small">Indicaciones especiales (opcional)</label>
                <div className="control">
                  <textarea className="textarea is-small" placeholder="Ej: Quiero que el logo sea un poco más grande..." rows="2" value={instructions} onChange={(e) => setInstructions(e.target.value)}></textarea>
                </div>
              </div>

              <div className="columns is-mobile mt-2">
                <div className="column is-6">
                  <label className="label is-small">Talla</label>
                  <div className="select is-fullwidth is-small">
                    <select value={size} onChange={(e) => setSize(e.target.value)}>
                      <option value="XS">XS</option>
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                    </select>
                  </div>
                </div>
                <div className="column is-6">
                  <label className="label is-small">Cantidad</label>
                  <input className="input is-small" type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                </div>
              </div>
              
              <p className="is-size-5 has-text-weight-bold has-text-right mb-4">Total: C$ {activeGarment.price * quantity}</p>

              <button className={`button is-dark is-fullwidth is-medium ${addingToCart ? 'is-loading' : ''}`} onClick={handleAddToCart} disabled={addingToCart}>
                <i className="zmdi zmdi-shopping-cart" style={{ marginRight: '8px' }}></i> Finalizar y Agregar
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
