import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [busy, setBusy] = useState(false);

  async function handleLogout() {
    setBusy(true);
    try { await logout(); } finally { window.location.assign('/login'); }
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div className="brand"><span className="brand-mark"><span /></span><span>SIRIUS <b>BUSINESS</b></span></div>
        <button className="logout-button" onClick={handleLogout} disabled={busy}>{busy ? 'Cerrando…' : 'Cerrar sesión ↗'}</button>
      </header>
      <section className="dashboard-welcome">
        <span className="eyebrow"><span className="status-dot" /> SESIÓN ACTIVA</span>
        <h1>Bienvenido a Sirius,<br /><em>{user?.name || 'tu espacio de trabajo'}.</em></h1>
        <p>Tu cuenta está verificada y tu sesión está protegida. Este es el punto de partida del panel empresarial.</p>
        <div className="account-card">
          <div className="account-avatar">{user?.name?.trim()?.charAt(0)?.toUpperCase() || 'S'}</div>
          <div><strong>{user?.name}</strong><span>{user?.email}</span></div>
          <span className="verified-pill">✓ Correo verificado</span>
        </div>
        <div className="coming-grid">
          <article><span>01 / OPERACIÓN</span><h2>Inventario</h2><p>Productos, existencias y códigos.</p></article>
          <article><span>02 / COMERCIO</span><h2>Ventas</h2><p>Pedidos, pagos y movimientos.</p></article>
          <article><span>03 / CONTROL</span><h2>Finanzas</h2><p>Ingresos, gastos y rentabilidad.</p></article>
        </div>
      </section>
    </main>
  );
}
