import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { addItem, getItems, updateItem, deleteItem } from '../../api/itemsApi'
import Swal from 'sweetalert2'

const CATEGORY_LABEL = { 1: 'Camisetas', 2: 'Sudaderas', 3: 'Crops', 4: 'Suéters' }
const CLASIFICATION_LABEL = { 1: 'Hombre', 2: 'Mujer', 3: 'Niño' }
const PAGE_SIZE = 8

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

const EMPTY_FORM = { name: '', price: '', category: '', clasification: '', image: '', description: '' }

export default function AdminAddItem() {
  const navigate = useNavigate()

  // --- Create form state ---
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState('')

  // --- Product table state ---
  const [items, setItems] = useState([])
  const [loadingItems, setLoadingItems] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState(null)
  const [editUploading, setEditUploading] = useState(false)

  const fetchItems = async () => {
    setLoadingItems(true)
    try {
      const res = await getItems()
      setItems(res.data)
    } catch (error) {
      console.error('Error fetching items:', error)
    } finally {
      setLoadingItems(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  // --- Create handlers ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadToCloudinary(file)
      setPreview(url)
      setFormData({ ...formData, image: url })
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
      setFormData(EMPTY_FORM)
      setPreview('')
      fetchItems()
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo agregar el artículo' })
    }
  }

  // --- Table / edit handlers ---
  const startEdit = (item) => {
    setEditingId(item.id_item)
    setEditForm({
      name: item.name,
      price: item.price,
      category: item.category,
      clasification: item.clasification,
      image: item.image,
      description: item.description,
      status_item: item.status_item,
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm(null)
  }

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value })
  }

  const handleEditImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setEditUploading(true)
    try {
      const url = await uploadToCloudinary(file)
      setEditForm({ ...editForm, image: url })
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Hubo un error al subir la imagen' })
    } finally {
      setEditUploading(false)
    }
  }

  const saveEdit = async (id_item) => {
    try {
      await updateItem(id_item, editForm)
      Swal.fire({ icon: 'success', title: 'Actualizado', text: 'Artículo actualizado', timer: 1300, showConfirmButton: false })
      cancelEdit()
      fetchItems()
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo actualizar el artículo' })
    }
  }

  const toggleActive = async (item) => {
    try {
      await updateItem(item.id_item, { ...item, status_item: item.status_item === 1 ? 0 : 1 })
      fetchItems()
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cambiar el estado del artículo' })
    }
  }

  const handleDelete = (item) => {
    Swal.fire({
      title: `¿Eliminar "${item.name}"?`,
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      buttonsStyling: false,
      customClass: { confirmButton: 'pc-swal-danger', cancelButton: 'pc-swal-cancel' },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteItem(item.id_item)
          Swal.fire({ icon: 'success', title: 'Eliminado', timer: 1200, showConfirmButton: false })
          fetchItems()
        } catch (error) {
          Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar el artículo' })
        }
      }
    })
  }

  const filteredItems = items.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()))
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const pageItems = filteredItems.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return
    setCurrentPage(p)
  }

  return (
    <div className="pc-admin">
      {/* NOTE: colors here are hardcoded hex (not var(--pc-*)) inside the pc-swal-* classes on
          purpose — SweetAlert2 renders its modal appended to <body>, outside .pc-admin, so CSS
          custom properties scoped to .pc-admin are not visible there. Using a var() in that
          scope makes the whole declaration invalid, which was making the confirm button
          transparent-on-transparent (invisible). */}
      <style>{`
        .pc-admin {
          --pc-black: #111111;
          --pc-gray-700: #4a4a4a;
          --pc-gray-500: #767676;
          --pc-gray-300: #cfcfcb;
          --pc-gray-200: #e6e5e1;
          --pc-gray-100: #f6f5f2;
          --pc-white: #ffffff;
          --pc-accent: #B4802F;
          --pc-danger: #B0392F;
          --pc-radius: 8px;
          font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, Arial, sans-serif;
          color: var(--pc-black);
          max-width: 1240px;
          margin: 0 auto;
          padding: 48px 24px 96px;
          background: var(--pc-white);
          overflow-x: hidden;
        }
        .pc-admin * { box-sizing: border-box; }

        .pc-header { padding-bottom: 22px; border-bottom: 2px solid var(--pc-black); margin-bottom: 32px; }
        .pc-header h1 { font-size: 24px; font-weight: 700; margin: 0; }

        /* Two-column layout: table left, form right */
        .pc-layout { display: grid; grid-template-columns: minmax(0, 1fr) 380px; gap: 40px; align-items: start; }
        .pc-table-col { order: 1; min-width: 0; }
        .pc-form-col { order: 2; }

        .pc-panel { border: 1px solid var(--pc-gray-200); border-radius: 12px; padding: 28px; }
        .pc-form-col .pc-panel { position: sticky; top: 24px; }
        .pc-panel h2 { font-size: 16px; font-weight: 700; margin: 0 0 22px; }

        .pc-field { margin-bottom: 16px; }
        .pc-field label { display: block; font-size: 12.5px; font-weight: 700; color: var(--pc-gray-700); margin-bottom: 6px; }
        .pc-input, .pc-select, .pc-textarea {
          width: 100%;
          border: 1px solid var(--pc-gray-300);
          border-radius: var(--pc-radius);
          background: var(--pc-white);
          padding: 9px 11px;
          font-size: 13.5px;
          font-weight: 500;
          color: var(--pc-black);
          outline: none;
          font-family: inherit;
          transition: border-color 0.15s ease;
        }
        .pc-textarea { resize: vertical; min-height: 80px; }
        .pc-input:focus, .pc-select:focus, .pc-textarea:focus { border-color: var(--pc-black); }
        .pc-select { cursor: pointer; }
        .pc-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

        .pc-file-row { display: flex; gap: 0; }
        .pc-file-btn {
          background: var(--pc-black);
          color: var(--pc-white);
          font-weight: 700;
          font-size: 12.5px;
          padding: 9px 14px;
          border-radius: var(--pc-radius) 0 0 var(--pc-radius);
          cursor: pointer;
          white-space: nowrap;
          display: inline-flex;
          align-items: center;
        }
        .pc-file-btn input { display: none; }
        .pc-file-name {
          flex: 1;
          border: 1px solid var(--pc-gray-300);
          border-left: none;
          border-radius: 0 var(--pc-radius) var(--pc-radius) 0;
          padding: 9px 11px;
          font-size: 12.5px;
          color: var(--pc-gray-500);
          display: flex;
          align-items: center;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
        .pc-help { font-size: 11.5px; color: var(--pc-gray-500); margin-top: 7px; }
        .pc-preview { margin-bottom: 12px; text-align: center; }
        .pc-preview img { max-height: 130px; max-width: 100%; border-radius: 8px; border: 1px solid var(--pc-gray-200); }

        .pc-btn-primary {
          width: 100%;
          background: var(--pc-black);
          color: var(--pc-white);
          border: 1px solid var(--pc-black);
          border-radius: var(--pc-radius);
          padding: 12px 16px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          margin-top: 6px;
          transition: opacity 0.15s ease;
        }
        .pc-btn-primary:hover { opacity: 0.85; }
        .pc-btn-primary:disabled { background: var(--pc-gray-100); color: var(--pc-gray-300); border-color: var(--pc-gray-200); cursor: not-allowed; }

        .pc-btn { border-radius: var(--pc-radius); padding: 7px 12px; font-size: 12px; font-weight: 700; cursor: pointer; font-family: inherit; border: 1px solid transparent; white-space: nowrap; }
        .pc-btn-dark { background: var(--pc-black); color: var(--pc-white); }
        .pc-btn-dark:hover { opacity: 0.85; }
        .pc-btn-light { background: var(--pc-gray-100); color: var(--pc-black); border-color: var(--pc-gray-300); }
        .pc-btn-light:hover { background: var(--pc-gray-200); }
        .pc-btn-danger { background: var(--pc-white); color: var(--pc-danger); border-color: #eccbc6; }
        .pc-btn-danger:hover { background: #FBEEEC; }

        /* Toolbar */
        .pc-toolbar { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 6px; flex-wrap: wrap; }
        .pc-toolbar .pc-input { max-width: 240px; }
        .pc-count { font-size: 12.5px; font-weight: 600; color: var(--pc-gray-500); display: block; margin-bottom: 14px; }

        /* Table */
        .pc-table-wrap { border-top: 1px solid var(--pc-gray-200); }
        .pc-row { display: grid; grid-template-columns: 46px minmax(0, 1fr) 80px 96px 130px; gap: 12px; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--pc-gray-100); }
        .pc-row-head { font-size: 11px; font-weight: 700; color: var(--pc-gray-500); border-bottom: 1px solid var(--pc-gray-200); }
        .pc-thumb { width: 40px; height: 40px; border-radius: 6px; object-fit: cover; border: 1px solid var(--pc-gray-200); }
        .pc-prod-name { font-size: 13.5px; font-weight: 700; margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .pc-prod-sub { font-size: 11.5px; color: var(--pc-gray-500); margin: 2px 0 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .pc-price { font-size: 13px; font-weight: 700; }
        .pc-status-toggle { display: inline-flex; align-items: center; gap: 6px; cursor: pointer; font-size: 11.5px; font-weight: 700; background: none; border: none; padding: 0; font-family: inherit; }
        .pc-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .pc-actions { display: flex; gap: 6px; justify-content: flex-end; flex-wrap: wrap; }
        .pc-state-msg { text-align: center; color: var(--pc-gray-500); font-size: 13.5px; padding: 44px 0; }

        /* Inline edit */
        .pc-edit-row { padding: 18px; background: var(--pc-gray-100); border-radius: 10px; margin: 8px 0; }
        .pc-edit-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
        .pc-edit-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 6px; }

        .pc-pagination { display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 24px; flex-wrap: wrap; }
        .pc-page-btn { min-width: 32px; height: 32px; border-radius: var(--pc-radius); border: 1px solid var(--pc-gray-300); background: var(--pc-white); font-size: 12.5px; font-weight: 600; cursor: pointer; }
        .pc-page-btn:hover:not(:disabled) { background: var(--pc-gray-100); }
        .pc-page-btn:disabled { color: var(--pc-gray-300); cursor: not-allowed; }
        .pc-page-btn.is-active { background: var(--pc-black); border-color: var(--pc-black); color: var(--pc-white); }

        /* Tablet: stack columns, form on top */
        @media (max-width: 960px) {
          .pc-layout { grid-template-columns: 1fr; gap: 32px; }
          .pc-form-col { order: -1; }
          .pc-form-col .pc-panel { position: static; }
          .pc-row { grid-template-columns: 46px minmax(0, 1fr) 90px 110px 150px; }
        }

        /* Mobile: hide status column, wrap actions */
        @media (max-width: 560px) {
          .pc-admin { padding: 32px 16px 72px; }
          .pc-row { grid-template-columns: 40px minmax(0, 1fr) 76px; }
          .pc-row-head > span:nth-child(4), .pc-row-head > span:nth-child(5) { display: none; }
          .pc-row > .pc-status-toggle, .pc-row > .pc-actions { grid-column: 1 / -1; justify-self: start; margin-top: 6px; }
          .pc-actions { justify-content: flex-start; }
          .pc-edit-grid { grid-template-columns: 1fr; }
          .pc-row-2 { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="pc-header">
        <h1>Catálogo de Artículos</h1>
      </div>

      <div className="pc-layout">
        {/* LEFT: MANAGE TABLE */}
        <div className="pc-table-col">
          <div className="pc-toolbar">
            <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Artículos existentes</h2>
            <input
              className="pc-input"
              type="text"
              placeholder="Buscar artículo…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <span className="pc-count">{filteredItems.length} {filteredItems.length === 1 ? 'artículo' : 'artículos'}</span>

          {loadingItems ? (
            <p className="pc-state-msg">Cargando artículos…</p>
          ) : filteredItems.length === 0 ? (
            <p className="pc-state-msg">No se encontraron artículos.</p>
          ) : (
            <div className="pc-table-wrap">
              <div className="pc-row pc-row-head">
                <span></span>
                <span>Artículo</span>
                <span>Precio</span>
                <span>Estado</span>
                <span></span>
              </div>

              {pageItems.map((item) => (
                <div key={item.id_item}>
                  <div className="pc-row">
                    <img className="pc-thumb" src={item.image?.startsWith('http') ? item.image : `/img/${item.image}`} alt={item.name} />
                    <div>
                      <p className="pc-prod-name">{item.name}</p>
                      <p className="pc-prod-sub">{CATEGORY_LABEL[item.category] || '—'} · {CLASIFICATION_LABEL[item.clasification] || '—'}</p>
                    </div>
                    <span className="pc-price">C${item.price}</span>
                    <button className="pc-status-toggle" onClick={() => toggleActive(item)} title="Clic para cambiar estado">
                      <span className="pc-dot" style={{ background: item.status_item === 1 ? '#1E7A45' : '#B0392F' }} />
                      {item.status_item === 1 ? 'Activo' : 'Inactivo'}
                    </button>
                    <div className="pc-actions">
                      <button className="pc-btn pc-btn-light" onClick={() => startEdit(item)}>Editar</button>
                      <button className="pc-btn pc-btn-danger" onClick={() => handleDelete(item)}>Eliminar</button>
                    </div>
                  </div>

                  {editingId === item.id_item && editForm && (
                    <div className="pc-edit-row">
                      <div className="pc-edit-grid">
                        <div className="pc-field" style={{ marginBottom: 0 }}>
                          <label>Nombre</label>
                          <input className="pc-input" type="text" name="name" value={editForm.name} onChange={handleEditChange} />
                        </div>
                        <div className="pc-field" style={{ marginBottom: 0 }}>
                          <label>Precio (C$)</label>
                          <input className="pc-input" type="number" name="price" value={editForm.price} onChange={handleEditChange} />
                        </div>
                        <div className="pc-field" style={{ marginBottom: 0 }}>
                          <label>Categoría</label>
                          <select className="pc-select" name="category" value={editForm.category} onChange={handleEditChange}>
                            {Object.entries(CATEGORY_LABEL).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
                          </select>
                        </div>
                        <div className="pc-field" style={{ marginBottom: 0 }}>
                          <label>Clasificación</label>
                          <select className="pc-select" name="clasification" value={editForm.clasification} onChange={handleEditChange}>
                            {Object.entries(CLASIFICATION_LABEL).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="pc-field">
                        <label>Descripción</label>
                        <textarea className="pc-textarea" name="description" value={editForm.description} onChange={handleEditChange}></textarea>
                      </div>

                      <div className="pc-field">
                        <label>Imagen</label>
                        <div className="pc-preview">
                          <img src={editForm.image?.startsWith('http') ? editForm.image : `/img/${editForm.image}`} alt="Preview" />
                        </div>
                        <div className="pc-file-row">
                          <label className="pc-file-btn">
                            {editUploading ? 'Subiendo…' : 'Cambiar imagen…'}
                            <input type="file" accept="image/*" onChange={handleEditImageUpload} disabled={editUploading} />
                          </label>
                          <span className="pc-file-name">{editUploading ? 'Subiendo archivo…' : 'Imagen actual cargada'}</span>
                        </div>
                      </div>

                      <div className="pc-edit-actions">
                        <button className="pc-btn pc-btn-light" onClick={cancelEdit}>Cancelar</button>
                        <button className="pc-btn pc-btn-dark" onClick={() => saveEdit(item.id_item)} disabled={editUploading}>Guardar cambios</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {totalPages > 1 && (
                <div className="pc-pagination">
                  <button className="pc-page-btn" onClick={() => goToPage(safePage - 1)} disabled={safePage === 1}>Anterior</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} className={`pc-page-btn${p === safePage ? ' is-active' : ''}`} onClick={() => goToPage(p)}>{p}</button>
                  ))}
                  <button className="pc-page-btn" onClick={() => goToPage(safePage + 1)} disabled={safePage === totalPages}>Siguiente</button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT: CREATE FORM */}
        <div className="pc-form-col">
          <div className="pc-panel">
            <h2>Agregar nuevo artículo</h2>
            <form onSubmit={handleSubmit}>
              <div className="pc-field">
                <label>Nombre</label>
                <input className="pc-input" type="text" name="name" value={formData.name} onChange={handleChange} />
              </div>

              <div className="pc-field">
                <label>Precio (C$)</label>
                <input className="pc-input" type="number" name="price" value={formData.price} onChange={handleChange} />
              </div>

              <div className="pc-field">
                <label>Descripción</label>
                <textarea className="pc-textarea" name="description" value={formData.description} onChange={handleChange}></textarea>
              </div>

              <div className="pc-field">
                <label>Imagen del artículo</label>
                {preview && (
                  <div className="pc-preview">
                    <img src={preview} alt="Preview" />
                  </div>
                )}
                <div className="pc-file-row">
                  <label className="pc-file-btn">
                    {uploading ? 'Subiendo…' : 'Seleccionar…'}
                    <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                  </label>
                  <span className="pc-file-name">{formData.image ? 'Imagen cargada' : 'Ningún archivo'}</span>
                </div>
                <p className="pc-help">Al seleccionar un archivo, se subirá automáticamente y se generará la URL.</p>
              </div>

              <div className="pc-row-2">
                <div className="pc-field">
                  <label>Categoría</label>
                  <select className="pc-select" name="category" value={formData.category} onChange={handleChange}>
                    <option value="" disabled>Seleccionar</option>
                    {Object.entries(CATEGORY_LABEL).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
                  </select>
                </div>
                <div className="pc-field">
                  <label>Clasificación</label>
                  <select className="pc-select" name="clasification" value={formData.clasification} onChange={handleChange}>
                    <option value="" disabled>Seleccionar</option>
                    {Object.entries(CLASIFICATION_LABEL).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
                  </select>
                </div>
              </div>

              <button type="submit" className="pc-btn-primary" disabled={uploading}>
                Agregar artículo
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Global, unscoped styles for SweetAlert2 — its modal is appended to <body>,
          outside .pc-admin, so it cannot see the --pc-* custom properties above. */}
      <style>{`
        .pc-swal-danger {
          background: #B0392F !important;
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
          color: #4a4a4a !important;
          border: 1px solid #cfcfcb !important;
          border-radius: 8px !important;
          padding: 10px 22px !important;
          font-size: 13px !important;
          font-weight: 700 !important;
          margin: 0 6px !important;
        }
      `}</style>
    </div>
  )
}
