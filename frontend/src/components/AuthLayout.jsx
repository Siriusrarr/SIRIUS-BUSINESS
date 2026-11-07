import { Link } from 'react-router-dom';

export default function AuthLayout({ eyebrow = 'GESTIÓN INTELIGENTE', title, subtitle, children, footer }) {
  return (
    <main className="auth-page">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <header className="topbar">
        <Link className="brand" to="/login" aria-label="Sirius Business, inicio">
          <span className="brand-mark"><span /></span>
          <span>SIRIUS <b>BUSINESS</b></span>
        </Link>
        <span className="topbar-caption">PLATAFORMA EMPRESARIAL</span>
      </header>

      <section className="auth-grid">
        <aside className="intro-panel">
          <div className="intro-orbit orbit-a" />
          <div className="intro-orbit orbit-b" />
          <div className="intro-content">
            <span className="eyebrow"><span className="status-dot" /> {eyebrow}</span>
            <h1>Tu negocio.<br /><em>En órbita.</em></h1>
            <p>Una plataforma para tener el control de tus ventas, inventario y finanzas desde un solo lugar.</p>
            <div className="intro-footnote"><span className="mini-star">✦</span> TODO CONECTADO. TODO BAJO CONTROL.</div>
          </div>
          <div className="orbit-planet" aria-hidden="true"><div className="planet-core" /><div className="planet-ring" /><div className="planet-dot" /></div>
        </aside>

        <section className="form-panel">
          <div className="form-card">
            <div className="mobile-brand brand"><span className="brand-mark"><span /></span><span>SIRIUS <b>BUSINESS</b></span></div>
            <div className="form-heading">
              <div className="form-kicker">{eyebrow}</div>
              <h2>{title}</h2>
              <p>{subtitle}</p>
            </div>
            {children}
            {footer && <div className="form-footer">{footer}</div>}
          </div>
          <div className="legal-line">© {new Date().getFullYear()} Sirius Business <span>·</span> Hecho para hacer crecer negocios.</div>
        </section>
      </section>
    </main>
  );
}
