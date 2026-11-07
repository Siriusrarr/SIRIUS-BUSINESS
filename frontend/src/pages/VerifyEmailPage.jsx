import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout.jsx';
import FormMessage from '../components/FormMessage.jsx';
import { authApi } from '../services/api.js';

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Estamos comprobando tu enlace de verificación.');

  useEffect(() => {
    let active = true;
    if (!token) {
      setStatus('error'); setMessage('El enlace no contiene un token válido.');
      return () => { active = false; };
    }
    authApi.verifyEmail(token)
      .then((result) => { if (active) { setStatus('success'); setMessage(result.message); } })
      .catch((error) => { if (active) { setStatus('error'); setMessage(error.message); } });
    return () => { active = false; };
  }, [token]);

  return (
    <AuthLayout eyebrow="VERIFICACIÓN DE CUENTA" title={status === 'success' ? 'Correo confirmado' : status === 'error' ? 'No se pudo verificar' : 'Un momento'} subtitle={message} footer={<>¿Necesitas volver a empezar? <Link to="/login">Ir al inicio de sesión</Link></>}>
      {status === 'loading' && <div className="loading-line"><span /> Validando enlace…</div>}
      {status === 'success' && <div className="success-panel"><div className="success-symbol">✓</div><h3>Tu cuenta está activa</h3><p>Ya puedes iniciar sesión y acceder a Sirius Business.</p><Link className="primary-button button-link" to="/login">Iniciar sesión <span>↗</span></Link></div>}
      {status === 'error' && <><FormMessage>{message}</FormMessage><Link className="primary-button button-link" to="/login">Volver al inicio <span>↗</span></Link></>}
    </AuthLayout>
  );
}
