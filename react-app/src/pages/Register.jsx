import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from '../api/usersApi'
import Swal from 'sweetalert2'
import '../../public/register.css'

export default function Register() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    cedula: '',
    name: '',
    lastname: '',
    birthday: '',
    phone: '',
    city: '',
    sex: 'M'
  })

  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleNext = () => {
    if (!formData.username || !formData.password || !formData.email) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor completa usuario, contraseña y correo para continuar.'
      })
      return
    }
    setStep(2)
  }

  const handlePrev = () => {
    setStep(1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate Step 2 fields
    for (const key in formData) {
      if (!formData[key]) {
        Swal.fire({
          icon: 'error',
          title: 'Campos incompletos',
          text: 'Por favor complete todos los campos personales.'
        })
        return
      }
    }

    try {
      await registerUser(formData)
      Swal.fire({
        icon: 'success',
        title: '¡Cuenta creada exitosamente!',
        timer: 1500,
        showConfirmButton: false
      })
      navigate('/login')
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error de registro',
        text: 'El usuario ingresado ya existe o hubo un error en el servidor.'
      })
    }
  }

  return (
    <div className="register-page-wrapper">
      <div className="form-box animated fadeInUp">
        {step === 1 && (
          <Link className="back-button" to="/login">
            <svg style={{ width: '24px', height: '24px', cursor: 'pointer' }} viewBox="0 0 24 24">
              <path fill="black" d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z" />
            </svg>
          </Link>
        )}
        {step === 2 && (
          <a className="back-button" onClick={handlePrev}>
            <svg style={{ width: '24px', height: '24px', cursor: 'pointer' }} viewBox="0 0 24 24">
              <path fill="black" d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z" />
            </svg>
          </a>
        )}
        
        <img src="/img/img-login.png" alt="" height="120px" width="120px" style={{ margin: '10px auto' }} />
        <h1 style={{ color: 'black', marginBottom: '5px' }} className="form-title">
          Registrarse (Paso {step} de 2)
        </h1>

        {step === 1 ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>Datos de la cuenta</p>
            
            <input name="username" type="text" className="form-control" placeholder="Usuario" value={formData.username} onChange={handleChange} />
            <input name="email" type="email" className="form-control input-email" placeholder="Correo Electrónico" value={formData.email} onChange={handleChange} />
            <input name="password" type="password" className="form-control" placeholder="Contraseña" value={formData.password} onChange={handleChange} />
            
            <button type="button" onClick={handleNext} className="btn btn-primary" style={{ backgroundColor: '#00d1b2', border: 'none', marginTop: '30px', width: '250px' }}>
              Siguiente
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ textAlign: 'center' }}>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>Información personal</p>
            
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <input name="name" type="text" className="form-control" placeholder="Nombre" style={{ width: '120px', margin: '10px 0' }} value={formData.name} onChange={handleChange} />
              <input name="lastname" type="text" className="form-control" placeholder="Apellido" style={{ width: '120px', margin: '10px 0' }} value={formData.lastname} onChange={handleChange} />
            </div>
            
            <input name="cedula" type="text" className="form-control" placeholder="Cédula" style={{ margin: '10px auto' }} value={formData.cedula} onChange={handleChange} />
            <input name="phone" type="text" className="form-control" placeholder="Teléfono" style={{ margin: '10px auto' }} value={formData.phone} onChange={handleChange} />
            
            <div style={{ textAlign: 'left', width: '250px', margin: '0 auto' }}>
              <label style={{ fontSize: '12px', color: '#666', marginLeft: '5px' }}>Fecha de Nacimiento</label>
              <input name="birthday" type="date" className="form-control fecha-nac" style={{ margin: '0 auto 10px auto', width: '100%' }} value={formData.birthday} onChange={handleChange} />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <select name="city" className="form-control combo-elije-sexo" style={{ width: '120px', margin: '10px 0', padding: '10px' }} value={formData.city} onChange={handleChange}>
                <option value="">Ciudad</option>
                <option value="Managua">Managua</option>
                <option value="Leon">Leon</option>
                <option value="Granada">Granada</option>
              </select>

              <select name="sex" className="form-control combo-elije-sexo" style={{ width: '120px', margin: '10px 0', padding: '10px' }} value={formData.sex} onChange={handleChange}>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#00d1b2', border: 'none', marginTop: '20px', width: '250px' }}>
              Crear Cuenta
            </button>
          </form>
        )}

        {step === 1 && (
          <div style={{ marginTop: '20px' }}>
            <label className="register-link" style={{ fontSize: '14px' }}>¿Ya tienes una cuenta? </label>
            <b>
              <Link className="register-link" style={{ color: 'rgb(5, 5, 5)', textDecoration: 'none', fontSize: '14px' }} to="/login">
                Inicia sesión
              </Link>
            </b>
          </div>
        )}
      </div>
    </div>
  )
}
