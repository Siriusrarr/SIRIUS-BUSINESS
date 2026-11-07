import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout.jsx';
import FormMessage from '../components/FormMessage.jsx';
import PasswordInput from '../components/PasswordInput.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function RegisterPage() {
  const { user, loading, register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!loading && user) return <Navigate to="/" replace />;

  async function handleSubmit(event) {
    event.preventDefault(); setError('');
    if (password !== confirmPassword) { setError('Las contraseñas no coinciden.'); return; }
    setBusy(true);
    try {
      await register({ name, email, password });
      navigate('/plans', { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout eyebrow="CREA TU ESPACIO" title="Crea tu cuenta" subtitle="Empieza a organizar y gestionar tu negocio desde una plataforma centralizada. Tu cuenta quedará activa inmediatamente, sin correos de verificación." footer={<>¿Ya tienes una cuenta? <Link to="/login">Iniciar sesión</Link></>}>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field-group"><label htmlFor="name">Nombre completo</label><input id="name" autoComplete="name" placeholder="Cómo te llamas" value={name} onChange={(event) => setName(event.target.value.replace(/[^\p{L}\p{M}\s.'’-]/gu, '').replace(/\s{2,}/g, ' '))} pattern="[A-Za-zÁÉÍÓÚÜÑáéíóúüñ][A-Za-zÁÉÍÓÚÜÑáéíóúüñ .’'-]*" title="Escribe tu nombre sin números." required minLength={2} maxLength={80} /></div>
          <div className="field-group"><label htmlFor="email">Correo electrónico</label><input id="email" type="email" autoComplete="email" placeholder="tu@empresa.com" value={email} onChange={(event) => setEmail(event.target.value)} required maxLength={254} /></div>
          <PasswordInput id="password" label="Contraseña" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" hint="Utiliza al menos 10 caracteres." />
          <PasswordInput id="confirmPassword" label="Confirma tu contraseña" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" />
          <FormMessage>{error}</FormMessage>
          <button className="primary-button" type="submit" disabled={busy}>{busy ? 'Creando cuenta…' : 'Crear cuenta'} <span>↗</span></button>
          <p className="terms-copy">Al crear una cuenta, aceptas que Sirius Business utilice estos datos para gestionar tu acceso.</p>
        </form>
    </AuthLayout>
  );
}
