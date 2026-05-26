import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getUser, updateUser } from '../api/usersApi'
import Swal from 'sweetalert2'
import '../../public/userSettings.css'

export default function UserSettings() {
  const { user } = useAuth()
  const [userData, setUserData] = useState({
    email: '',
    password: '',
    role: 2,
    status_user: 1
  })

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getUser(user.username)
        const data = res.data[0] || res.data
        setUserData({
          email: data.email || '',
          password: '', // Don't show hashed password
          role: data.role || 2,
          status_user: data.status_user || 1
        })
      } catch (error) {
        console.error('Error fetching user:', error)
      }
    }
    if (user?.username) fetchUser()
  }, [user])

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (!userData.password) {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Debe ingresar una nueva contraseña o la actual para actualizar.' })
        return
      }
      
      await updateUser(user.id_user, userData)
      Swal.fire({ icon: 'success', title: 'Actualizado', text: 'Datos actualizados correctamente.', timer: 1500, showConfirmButton: false })
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Hubo un error al actualizar los datos.' })
    }
  }

  return (
    <div className="container" style={{ marginTop: '50px', marginBottom: '50px' }}>
      <div className="columns is-centered">
        <div className="column is-half">
          <div className="box">
            <h1 className="title has-text-centered">Configuración de Usuario</h1>
            <p className="has-text-centered" style={{ marginBottom: '20px' }}>Usuario: <strong>{user.username}</strong></p>

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label className="label">Correo Electrónico</label>
                <div className="control">
                  <input 
                    className="input" 
                    type="email" 
                    name="email" 
                    value={userData.email} 
                    onChange={handleChange} 
                  />
                </div>
              </div>

              <div className="field">
                <label className="label">Nueva Contraseña</label>
                <div className="control">
                  <input 
                    className="input" 
                    type="password" 
                    name="password" 
                    placeholder="Ingrese su nueva contraseña"
                    value={userData.password} 
                    onChange={handleChange} 
                  />
                </div>
              </div>

              <button type="submit" className="button is-dark is-fullwidth" style={{ marginTop: '20px' }}>
                Actualizar Datos
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
