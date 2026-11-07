import { Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout.jsx';

export default function ForgotPasswordPage() {
  return (
    <AuthLayout eyebrow="RECUPERAR ACCESO" title="Recuperación no disponible" subtitle="Esta versión de demostración no envía correos electrónicos. Si olvidaste tu contraseña, crea otra cuenta con un correo diferente para continuar probando el sistema." footer={<>¿Recuerdas tu contraseña? <Link to="/login">Iniciar sesión</Link></>}>
      <div className="success-panel">
        <div className="success-symbol">i</div>
        <h3>Modo demostración</h3>
        <p>El registro y el inicio de sesión funcionan con la base de datos local. No se requiere confirmar el correo.</p>
        <Link className="primary-button button-link" to="/login">Volver al inicio de sesión <span>↗</span></Link>
      </div>
    </AuthLayout>
  );
}
