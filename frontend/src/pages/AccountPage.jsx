import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { authApi } from '../services/api.js';

const planNames = { free: 'Gratis', entrepreneur: 'Emprendedor', business_pro: 'Business Pro' };
const dateLabel = (value) => value ? new Intl.DateTimeFormat('es-CO', { dateStyle: 'long' }).format(new Date(value)) : 'No disponible';

export default function AccountPage() {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function saveProfile(event) {
    event.preventDefault();
    setBusy(true); setError(''); setMessage('');
    try {
      await authApi.updateProfile({ name });
      await refreshUser();
      setEditing(false);
      setMessage('Tu información personal se actualizó correctamente.');
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  async function signOut() {
    await logout();
    navigate('/login', { replace: true });
  }

  return <div className="sb-content account-page">
    <section className="account-hero">
      <div className="account-avatar">{(user?.name || 'U').trim().charAt(0).toUpperCase()}</div>
      <div><span className="space-eyebrow">CENTRO DE CUENTA / SIRIUS ID</span><h2>{user?.name || 'Mi cuenta'}</h2><p>{user?.email}</p></div>
      <span className="account-status"><i/> Cuenta activa</span>
    </section>

    {message && <div className="account-message success" role="status">{message}</div>}
    {error && <div className="account-message error" role="alert">{error}</div>}

    <div className="account-grid">
      <section className="sb-panel account-card">
        <div className="account-card-heading"><span className="account-icon">◉</span><div><h3>Información personal</h3><p>Los datos asociados a tu identidad en Sirius.</p></div></div>
        {editing ? <form className="account-form" onSubmit={saveProfile}>
          <label>Nombre completo<input value={name} onChange={e=>setName(e.target.value)} minLength={2} maxLength={80} required autoComplete="name"/></label>
          <label>Correo electrónico<input value={user?.email || ''} readOnly disabled/><small>El correo se utiliza para iniciar sesión y no se puede cambiar desde aquí.</small></label>
          <div className="account-actions"><button className="sb-primary" disabled={busy}>{busy?'Guardando…':'Guardar cambios'}</button><button type="button" className="sb-secondary" onClick={()=>{setEditing(false);setName(user?.name||'');setError('');}}>Cancelar</button></div>
        </form> : <>
          <div className="account-detail"><span>Nombre completo</span><strong>{user?.name}</strong></div>
          <div className="account-detail"><span>Correo electrónico</span><strong>{user?.email}</strong></div>
          <button className="account-text-button" onClick={()=>{setEditing(true);setMessage('');setError('');}}>Editar información personal ↗</button>
        </>}
      </section>

      <section className="sb-panel account-card">
        <div className="account-card-heading"><span className="account-icon">⌑</span><div><h3>Seguridad y acceso</h3><p>Protege el acceso a tu espacio.</p></div></div>
        <div className="account-detail"><span>Contraseña</span><strong>••••••••••••</strong></div>
        <p className="account-hint">Si deseas cambiar tu contraseña, puedes iniciar el proceso de recuperación mediante tu correo electrónico.</p>
        <Link className="account-text-button" to="/forgot-password">Cambiar contraseña ↗</Link>
      </section>

      <section className="sb-panel account-card">
        <div className="account-card-heading"><span className="account-icon">✧</span><div><h3>Plan y suscripción</h3><p>Tu nivel de acceso actual.</p></div></div>
        <div className="account-plan"><span>PLAN ACTUAL</span><strong>{planNames[user?.selectedPlan] || 'Sin plan'}</strong><small>La facturación y los cobros todavía no están habilitados.</small></div>
        <Link className="account-text-button" to="/#plans" onClick={e=>{e.preventDefault();navigate('/');}}>Volver al espacio empresarial ↗</Link>
      </section>

      <section className="sb-panel account-card">
        <div className="account-card-heading"><span className="account-icon">◷</span><div><h3>Actividad de la cuenta</h3><p>Información básica de tu registro.</p></div></div>
        <div className="account-detail"><span>Cuenta creada</span><strong>{dateLabel(user?.createdAt)}</strong></div>
        <div className="account-detail"><span>Correo verificado</span><strong>{user?.emailVerified ? 'Sí' : 'Pendiente'}</strong></div>
      </section>
    </div>

    <section className="sb-panel account-danger">
      <div><h3>¿Quieres salir de Sirius Business?</h3><p>Tu información permanece guardada. Podrás volver a iniciar sesión cuando quieras.</p></div>
      <button className="account-logout" onClick={signOut}>Cerrar sesión</button>
    </section>
    <p className="sb-footnote">SIRIUS ID · Tu cuenta personal, independiente de la información operativa de tu negocio.</p>
  </div>;
}
