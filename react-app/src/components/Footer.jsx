import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <div className="stitch-footer" role="contentinfo">
      <style>{`
        .stitch-footer {
          background-color: #ffffff;
          color: #64748b;
          padding: 28px 24px 34px !important;
          margin: 0 !important;
          border: none !important;
          font-family: 'DM Sans', 'Inter', system-ui, -apple-system, sans-serif;
        }
        .stitch-footer-inner {
          max-width: 1240px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          flex-wrap: wrap;
        }
        .stitch-footer-brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }
        .stitch-footer-logo-img {
          width: 30px;
          height: 30px;
          border-radius: 7px;
          object-fit: cover;
          flex-shrink: 0;
        }
        .stitch-footer-title {
          font-family: 'Space Grotesk', 'Inter', sans-serif;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #111827;
          text-transform: uppercase;
          line-height: 1.2;
        }
        .stitch-footer-title span {
          color: #10b981;
        }
        .stitch-footer-links {
          display: flex;
          align-items: center;
          gap: 24px;
          flex-wrap: wrap;
          margin: 0;
          padding: 0;
          list-style: none;
        }
        .stitch-footer-link {
          font-family: 'Space Grotesk', 'Inter', sans-serif;
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #64748b;
          text-transform: uppercase;
          text-decoration: none;
          transition: color 0.15s ease;
        }
        .stitch-footer-link:hover {
          color: #10b981;
        }
        .stitch-footer-copy {
          font-size: 11.5px;
          color: #64748b;
          line-height: 1.4;
          text-align: right;
        }
        @media (max-width: 768px) {
          .stitch-footer-inner {
            flex-direction: column;
            text-align: center;
          }
          .stitch-footer-links {
            justify-content: center;
          }
          .stitch-footer-copy {
            text-align: center;
          }
        }
      `}</style>
      <div className="stitch-footer-inner">
        <Link to="/" className="stitch-footer-brand">
          <img
            src="/img/logo_emblema.png"
            alt="Personalized Clothing"
            className="stitch-footer-logo-img"
          />
          <span className="stitch-footer-title">
            PERSONALIZED <span>CLOTHING</span>
          </span>
        </Link>

        <ul className="stitch-footer-links">
          <li><Link className="stitch-footer-link" to="/items">Términos</Link></li>
          <li><Link className="stitch-footer-link" to="/items">Privacidad</Link></li>
          <li><Link className="stitch-footer-link" to="/items">Cookies</Link></li>
          <li><Link className="stitch-footer-link" to="/personalizar">Guía de Tallas</Link></li>
        </ul>

        <div className="stitch-footer-copy">
          © 2026 Personalized Clothing. Todos los derechos reservados.
        </div>
      </div>
    </div>
  )
}
