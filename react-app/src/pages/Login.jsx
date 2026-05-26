import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { recoverPassword } from '../api/usersApi'
import Swal from 'sweetalert2'
import '../../public/login.css'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!username || !password) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ingrese un nombre de usuario y contraseña'
      })
      return
    }

    try {
      await login(username, password)
      Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: 'Sesión iniciada correctamente',
        timer: 1500,
        showConfirmButton: false
      })
      navigate('/')
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error de autenticación',
        text: error.message || 'Contraseña incorrecta o el usuario no existe'
      })
    }
  }

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    
    const { value: email } = await Swal.fire({
      title: 'Recuperar contraseña',
      input: 'email',
      inputLabel: 'Ingresa tu correo electrónico',
      inputPlaceholder: 'correo@ejemplo.com',
      showCancelButton: true,
      confirmButtonText: 'Enviar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#00d1b2'
    })

    if (email) {
      Swal.fire({
        title: 'Procesando...',
        text: 'Generando nueva contraseña temporal.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading()
        }
      })
      
      try {
        const res = await recoverPassword(email)
        Swal.fire({
          icon: 'success',
          title: '¡Enviado!',
          text: res.data.message
        })
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Hubo un error al recuperar la contraseña.'
        })
      }
    }
  }

  return (
    <div className="login-page-wrapper">
      <form onSubmit={handleSubmit} className="form-box animated fadeInUp">
        <Link className="back-button" to="/">
          <svg style={{ width: '24px', height: '24px' }} viewBox="0 0 24 24">
            <path fill="black" d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z" />
          </svg>
        </Link>
        <img src="/img/img-login.png" alt="" height="150px" width="150px" />
        <h1 style={{ color: 'black' }} className="form-title">Inicia Sesión</h1>
        
        <input
          name="username"
          type="text"
          className="form-control"
          placeholder="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        
        <input
          name="password"
          type="password"
          className="form-control"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        
        <b>
          <a className="pass-link" style={{ color: 'rgb(5, 5, 5)', textDecoration: 'none', cursor: 'pointer' }} onClick={handleForgotPassword}>
            ¿Has olvidado tu contraseña?
          </a>
        </b>
        
        <button type="submit" className="btn btn-primary" style={{ backgroundColor: '#00d1b2', border: 'none' }}>
          Iniciar Sesión
        </button>

        <div style={{ marginTop: '20px' }}>
          <label className="register-link">¿Aún no tienes una cuenta? </label>
          <b>
            <Link className="register-link" style={{ color: 'rgb(5, 5, 5)', textDecoration: 'none' }} to="/register">
              Regístrate
            </Link>
          </b>
        </div>
      </form>
    </div>
  )
}
