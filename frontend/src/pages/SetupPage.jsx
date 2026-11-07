import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { businessApi } from '../services/businessApi.js';

const cleanPersonOrPlace = value => value.replace(/[^\p{L}\p{M}\s.'’-]/gu, '').replace(/\s{2,}/g, ' ');
const cleanPhone = value => value.replace(/[^0-9+()\s.-]/g, '').slice(0, 20);

export default function SetupPage() {
  const [form, setForm] = useState({ name: '', category: '', phone: '', city: '', taxId: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const change = event => {
    const { name, value } = event.target;
    const cleanValue = name === 'phone' ? cleanPhone(value) : name === 'city' ? cleanPersonOrPlace(value) : value;
    setForm(current => ({ ...current, [name]: cleanValue }));
  };
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    try { await businessApi.createBusiness(form); navigate('/', { replace: true }); }
    catch (requestError) { setError(requestError.message); }
    finally { setBusy(false); }
  }
  return <main className="sb-setup"><form className="sb-panel sb-setup-form" onSubmit={submit}>
    <p className="sb-kicker">SIRIUS BUSINESS · CONFIGURACIÓN</p><h1>Vamos a configurar tu negocio.</h1>
    <p>Estos datos crearán tu espacio empresarial privado. Podrás modificarlos después.</p>
    <label>Nombre del negocio<input name="name" value={form.name} onChange={change} required minLength="2" maxLength="120" placeholder="Ej. Café Aurora" /></label>
    <label>Actividad o sector<input name="category" value={form.category} onChange={change} placeholder="Ej. Alimentación, ropa, tecnología" /></label>
    <div className="sb-form-row">
      <label>Teléfono<input name="phone" type="tel" inputMode="tel" pattern="[0-9+() .-]{7,20}" title="Introduce un teléfono válido usando números." value={form.phone} onChange={change} maxLength="20" /></label>
      <label>Ciudad<input name="city" value={form.city} onChange={change} placeholder="Montería" pattern="[A-Za-zÁÉÍÓÚÜÑáéíóúüñ .’'-]*" title="Escribe una ciudad sin números." /></label>
    </div>
    <label>NIT o documento (opcional)<input name="taxId" value={form.taxId} onChange={change} inputMode="text" maxLength="40" placeholder="Los números y guiones están permitidos" /></label>
    {error && <p className="sb-error">{error}</p>}
    <button className="sb-primary" disabled={busy}>{busy ? 'Creando espacio…' : 'Crear mi espacio empresarial'}</button>
  </form></main>;
}
