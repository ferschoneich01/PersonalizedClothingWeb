import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { addItem } from '../../api/itemsApi'
import Swal from 'sweetalert2'

export default function AdminAddItem() {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    clasification: '',
    image: '',
    description: ''
  })
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState('')
  
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

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
      
      setPreview(data.secure_url)
      setFormData({ ...formData, image: data.secure_url })
      Swal.fire({ icon: 'success', title: 'Imagen subida', text: 'La imagen se cargó correctamente', timer: 1500, showConfirmButton: false })
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Hubo un error al subir la imagen' })
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    for (const key in formData) {
      if (!formData[key]) {
        Swal.fire({ icon: 'warning', title: 'Campos incompletos', text: `Llene el campo: ${key}` })
        return
      }
    }

    try {
      await addItem(formData)
      Swal.fire({ icon: 'success', title: 'Guardado', text: 'Artículo agregado exitosamente', timer: 1500, showConfirmButton: false })
      navigate('/items')
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo agregar el artículo' })
    }
  }

  return (
    <div className="container" style={{ marginTop: '50px', marginBottom: '50px' }}>
      <div className="columns is-centered">
        <div className="column is-half">
          <div className="box">
            <h1 className="title has-text-centered">Agregar Nuevo Artículo</h1>
            
            <form onSubmit={handleSubmit}>
              <div className="field">
                <label className="label">Nombre</label>
                <div className="control">
                  <input className="input" type="text" name="name" onChange={handleChange} />
                </div>
              </div>

              <div className="field">
                <label className="label">Precio (C$)</label>
                <div className="control">
                  <input className="input" type="number" name="price" onChange={handleChange} />
                </div>
              </div>

              <div className="field">
                <label className="label">Descripción</label>
                <div className="control">
                  <textarea className="textarea" name="description" onChange={handleChange}></textarea>
                </div>
              </div>

              <div className="field">
                <label className="label">Imagen del Artículo</label>
                {preview && (
                  <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                    <img src={preview} alt="Preview" style={{ maxHeight: '200px', borderRadius: '8px' }} />
                  </div>
                )}
                <div className="control">
                  <div className={`file is-dark has-name is-fullwidth ${uploading ? 'is-loading' : ''}`}>
                    <label className="file-label">
                      <input className="file-input" type="file" name="imageFile" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                      <span className="file-cta">
                        <span className="file-icon">
                          <i className="zmdi zmdi-upload"></i>
                        </span>
                        <span className="file-label">
                          {uploading ? 'Subiendo...' : 'Seleccionar archivo...'}
                        </span>
                      </span>
                      <span className="file-name">
                        {formData.image ? 'Imagen cargada' : 'Ningún archivo seleccionado'}
                      </span>
                    </label>
                  </div>
                </div>
                <p className="help">Al seleccionar un archivo, se subirá automáticamente y se generará la URL.</p>
              </div>

              <div className="columns">
                <div className="column is-half">
                  <div className="field">
                    <label className="label">Categoría</label>
                    <div className="control">
                      <div className="select is-fullwidth">
                        <select name="category" onChange={handleChange} defaultValue="">
                          <option value="" disabled>Seleccionar</option>
                          <option value="1">Camisetas</option>
                          <option value="2">Sudaderas</option>
                          <option value="3">Crops</option>
                          <option value="4">Sueters</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="column is-half">
                  <div className="field">
                    <label className="label">Clasificación</label>
                    <div className="control">
                      <div className="select is-fullwidth">
                        <select name="clasification" onChange={handleChange} defaultValue="">
                          <option value="" disabled>Seleccionar</option>
                          <option value="1">Hombre</option>
                          <option value="2">Mujer</option>
                          <option value="3">Niño</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button type="submit" className="button is-dark is-fullwidth" style={{ marginTop: '20px' }} disabled={uploading}>
                Agregar Artículo
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
