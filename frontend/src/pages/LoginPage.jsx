import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout.jsx';
import FormMessage from '../components/FormMessage.jsx';
import PasswordInput from '../components/PasswordInput.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!loading && user) return <Navigate to="/" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true); setError('');
    try {
      await login({ email, password });
      navigate('/', { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout title="Bienvenido de nuevo" subtitle="Accede a tu espacio de trabajo y sigue llevando tu negocio más lejos." footer={<>¿Aún no tienes una cuenta? <Link to="/register">Crear cuenta</Link></>}>
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="field-group">
          <label htmlFor="email">Correo electrónico</label>
          <input id="email" name="email" type="email" autoComplete="email" placeholder="tu@empresa.com" value={email} onChange={(event) => setEmail(event.target.value)} required maxLength={254} />
        </div>
        <PasswordInput id="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        <div className="field-options"><span>Tu acceso seguro a Sirius</span><Link to="/forgot-password">¿Has olvidado tu contraseña?</Link></div>
        <FormMessage>{error}</FormMessage>
        <button className="primary-button" type="submit" disabled={busy}>{busy ? 'Comprobando…' : 'Iniciar sesión'} <span>↗</span></button>
      </form>
      <div className="secure-note"><span className="lock-icon">⌑</span> Acceso protegido con sesión segura y contraseña cifrada.</div>
    </AuthLayout>
  );
}
