import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout.jsx';
import FormMessage from '../components/FormMessage.jsx';
import PasswordInput from '../components/PasswordInput.jsx';
import { authApi } from '../services/api.js';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [complete, setComplete] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault(); setError('');
    if (password !== confirmPassword) { setError('Las contraseñas no coinciden.'); return; }
    setBusy(true);
    try {
      await authApi.resetPassword(token, password);
      setComplete(true);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout eyebrow="NUEVA CONTRASEÑA" title={complete ? 'Acceso recuperado' : 'Crea otra contraseña'} subtitle={complete ? 'Tu contraseña se ha actualizado. Por seguridad, tendrás que iniciar sesión de nuevo.' : 'Elige una contraseña nueva que no hayas utilizado en esta cuenta.'} footer={<>¿Necesitas ayuda? <Link to="/login">Volver al acceso</Link></>}>
      {complete ? (
        <div className="success-panel"><div className="success-symbol">✓</div><h3>Todo listo</h3><p>La contraseña se ha cambiado y las sesiones anteriores se han cerrado.</p><Link className="primary-button button-link" to="/login">Iniciar sesión <span>↗</span></Link></div>
      ) : !token ? (
        <FormMessage>Este enlace no contiene un token válido. Solicita una recuperación nueva.</FormMessage>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit}>
          <PasswordInput id="password" label="Nueva contraseña" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" hint="Mínimo 10 caracteres." />
          <PasswordInput id="confirmPassword" label="Confirma la nueva contraseña" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" />
          <FormMessage>{error}</FormMessage>
          <button className="primary-button" type="submit" disabled={busy}>{busy ? 'Actualizando…' : 'Guardar nueva contraseña'} <span>↗</span></button>
        </form>
      )}
    </AuthLayout>
  );
}
