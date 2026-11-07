import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import FormMessage from '../components/FormMessage.jsx';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'para siempre',
    description: 'Lo esencial para empezar a organizar tu negocio.',
    features: [
      'Panel de control',
      'Inventario y productos',
      'Registro de ventas',
      'Finanzas básicas',
      'Clientes y proveedores',
      'Códigos QR y de barras',
    ],
    note: '1 negocio · 1 usuario · hasta 200 productos activos',
    featured: false,
  },
  {
    id: 'entrepreneur',
    name: 'Emprendedor',
    price: '$29.900',
    period: 'COP / mes',
    description: 'Más herramientas para acompañar el crecimiento.',
    features: [
      'Todo lo incluido en Free',
      'Tienda virtual de Sirius',
      'Promociones avanzadas',
      'Informes ampliados',
      'Hasta 3 usuarios',
      'Importación de productos',
    ],
    note: 'Una solución para negocios en crecimiento',
    featured: true,
  },
  {
    id: 'business_pro',
    name: 'Business Pro',
    price: '$59.900',
    period: 'COP / mes',
    description: 'Más capacidad para operaciones empresariales.',
    features: [
      'Todo lo incluido en Emprendedor',
      'Hasta 10 usuarios',
      'Varias sucursales',
      'Integraciones externas',
      'API y webhooks',
      'Informes empresariales',
    ],
    note: 'Pensado para operaciones con varios canales',
    featured: false,
  },
];

export default function PlansPage() {
  const { user, selectPlan, logout } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleContinue() {
    setBusy(true);
    setError('');
    try {
      await selectPlan(selected);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'No se pudo guardar tu selección. Inténtalo de nuevo.');
    } finally {
      setBusy(false);
    }
  }

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <main className="plans-page">
      <header className="plans-header">
        <div className="brand"><span className="brand-mark"><span /></span><span>SIRIUS <b>BUSINESS</b></span></div>
        <button className="logout-button" onClick={handleLogout}>Cerrar sesión ↗</button>
      </header>

      <section className="plans-shell">
        <div className="plans-intro">
          <span className="eyebrow"><span className="status-dot" /> CONFIGURACIÓN INICIAL</span>
          <h1>Elige cómo quieres<br /><em>comenzar.</em></h1>
          <p>Hola, {user?.name?.split(' ')[0] || 'bienvenido'}. Selecciona el plan que mejor se adapte a tu negocio. Podrás cambiarlo más adelante.</p>
          <div className="demo-notice"><span>i</span><div><strong>Demostración académica</strong><small>La selección no genera cobros ni activa una suscripción real. Los precios son referenciales.</small></div></div>
        </div>

        <div className="plans-grid">
          {plans.map((plan) => (
            <button
              type="button"
              key={plan.id}
              className={`plan-card ${plan.featured ? 'plan-card-featured' : ''} ${selected === plan.id ? 'plan-card-selected' : ''}`}
              onClick={() => setSelected(plan.id)}
              aria-pressed={selected === plan.id}
            >
              {plan.featured && <span className="plan-ribbon">RECOMENDADO</span>}
              <span className="plan-radio"><span /></span>
              <span className="plan-name">{plan.name}</span>
              <span className="plan-price">{plan.price}</span>
              <span className="plan-period">{plan.period}</span>
              <span className="plan-description">{plan.description}</span>
              <span className="plan-divider" />
              <span className="plan-includes">INCLUYE</span>
              <span className="plan-features">
                {plan.features.map((feature) => <span key={feature}><b>✓</b>{feature}</span>)}
              </span>
              <span className="plan-note">{plan.note}</span>
            </button>
          ))}
        </div>

        {error && <FormMessage>{error}</FormMessage>}
        <div className="plans-bottom">
          <div><strong>Tu información siempre será tuya.</strong><span>Elegir un plan no elimina ni bloquea tus datos.</span></div>
          <button className="primary-button plans-continue" onClick={handleContinue} disabled={busy || !selected}>
            {busy ? 'Guardando selección…' : selected ? 'Continuar' : 'Selecciona un plan'} <span>→</span>
          </button>
        </div>
        <p className="plans-footnote">Podrás consultar las características y cambiar tu selección desde la configuración de tu cuenta.</p>
      </section>
    </main>
  );
}
