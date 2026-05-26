import { Link, useLocation } from 'react-router-dom'

export default function SuccessPay() {
  const location = useLocation()
  const address = location.state?.address || 'la dirección registrada'

  return (
    <div className="container has-text-centered" style={{ marginTop: '100px', minHeight: '50vh' }}>
      <i className="zmdi zmdi-check-circle" style={{ fontSize: '80px', color: '#00d1b2' }}></i>
      <h1 className="title is-2" style={{ marginTop: '20px' }}>¡Pago exitoso!</h1>
      <p className="subtitle is-4" style={{ marginTop: '20px' }}>
        Su pedido ha sido procesado y será enviado a: <strong>{address}</strong>
      </p>
      <div style={{ marginTop: '40px' }}>
        <Link to="/buys" className="button is-dark is-medium" style={{ marginRight: '10px' }}>Ver mis compras</Link>
        <Link to="/" className="button is-light is-medium">Volver al inicio</Link>
      </div>
    </div>
  )
}
