import { useEffect, useMemo, useState } from 'react';

const DIVIPOLA_URL = 'https://www.datos.gov.co/resource/gdxc-w37w.json?$select=cod_dpto,dpto,cod_mpio,nom_mpio,tipo_municipio&$limit=2000';
let locationsPromise;
const DEPARTMENT_FALLBACK = [
  'Amazonas','Antioquia','Arauca','Atlántico','Bogotá D.C.','Bolívar','Boyacá','Caldas','Caquetá','Casanare','Cauca','Cesar','Chocó','Córdoba','Cundinamarca','Guainía','Guaviare','Huila','La Guajira','Magdalena','Meta','Nariño','Norte de Santander','Putumayo','Quindío','Risaralda','San Andrés, Providencia y Santa Catalina','Santander','Sucre','Tolima','Valle del Cauca','Vaupés','Vichada'
];

async function loadLocations() {
  if (!locationsPromise) locationsPromise = fetch(DIVIPOLA_URL)
    .then(response => { if (!response.ok) throw new Error('No fue posible consultar DIVIPOLA'); return response.json(); })
    .then(rows => rows.filter(row => row.dpto && row.nom_mpio && (!row.tipo_municipio || /municipio|distrito/i.test(row.tipo_municipio)))
      .map(row => ({ department: row.dpto.trim(), city: row.nom_mpio.trim(), departmentCode: row.cod_dpto, cityCode: row.cod_mpio })))
    .catch(() => []);
  return locationsPromise;
}

export const BUSINESS_CATEGORIES = [
  'Alimentación y bebidas','Restaurantes y cafeterías','Ropa y accesorios','Comercio minorista','Comercio mayorista',
  'Belleza y cuidado personal','Salud y bienestar','Tecnología y electrónica','Educación y formación','Transporte y logística',
  'Construcción y ferretería','Servicios profesionales','Turismo y hotelería','Agricultura y ganadería','Manufactura y producción',
  'Hogar y decoración','Deportes y recreación','Servicios automotrices','Mascotas y veterinaria','Arte, cultura y entretenimiento','Otro'
];

export function BusinessCategoryField({ value, onChange, disabled = false }) {
  const isKnown = BUSINESS_CATEGORIES.includes(value);
  const [other, setOther] = useState(isKnown || !value ? '' : value);
  const [showOther, setShowOther] = useState(Boolean(value && !isKnown));
  const selected = isKnown ? value : (value || showOther) ? 'Otro' : '';
  return <div className="sb-location-field">
    <label htmlFor="business-category-select">Actividad o sector</label>
    <select id="business-category-select" value={selected} disabled={disabled} onChange={event => {
      const next = event.target.value;
      if (next === 'Otro') { setShowOther(true); onChange(other); }
      else { setShowOther(false); setOther(''); onChange(next); }
    }}>
      <option value="">Selecciona una actividad</option>
      {BUSINESS_CATEGORIES.map(item => <option key={item} value={item}>{item === 'Otro' ? 'Otro (especificar)' : item}</option>)}
    </select>
    {selected === 'Otro' && <input aria-label="Especifica la actividad del negocio" value={other} disabled={disabled} maxLength={80} placeholder="Escribe la actividad de tu negocio" onChange={event => { setOther(event.target.value); onChange(event.target.value); }} />}
  </div>;
}

export function BusinessLocationField({ value, onChange, disabled = false }) {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [department, setDepartment] = useState('');
  const [city, setCity] = useState('');
  const [manual, setManual] = useState('');

  useEffect(() => {
    let active = true;
    loadLocations().then(rows => {
      if (!active) return;
      setLocations(rows);
      setLoadFailed(rows.length === 0);
      if (value) {
        const [oldCity, ...rest] = value.split(' - ');
        const oldDepartment = rest.join(' - ');
        const match = rows.find(row => row.city.toLocaleLowerCase('es-CO') === oldCity.trim().toLocaleLowerCase('es-CO') && (!oldDepartment || row.department.toLocaleLowerCase('es-CO') === oldDepartment.trim().toLocaleLowerCase('es-CO')));
        if (match) { setDepartment(match.department); setCity(match.city); }
        else if (oldDepartment) { setDepartment(oldDepartment); setCity(oldCity.trim()); }
        else setManual(value);
      }
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const departments = useMemo(() => [...new Set([...DEPARTMENT_FALLBACK, ...locations.map(row => row.department)])].sort((a,b)=>a.localeCompare(b,'es')), [locations]);
  const cities = useMemo(() => locations.filter(row => row.department === department).map(row => row.city).sort((a,b)=>a.localeCompare(b,'es')), [locations, department]);

  function updateLocation(nextDepartment, nextCity) {
    setDepartment(nextDepartment); setCity(nextCity); setManual('');
    onChange(nextCity && nextDepartment ? nextCity + ' - ' + nextDepartment : '');
  }

  return <div className="sb-location-field">
    <label htmlFor="business-department">Departamento</label>
    <select id="business-department" value={department} disabled={disabled} onChange={event => updateLocation(event.target.value, '')}>
      <option value="">Selecciona un departamento</option>
      {departments.map(item => <option key={item} value={item}>{item}</option>)}
    </select>
    <label htmlFor="business-city">Municipio o ciudad</label>
    <select id="business-city" value={city} disabled={disabled || !department || loading || cities.length === 0} onChange={event => updateLocation(department, event.target.value)}>
      <option value="">{loading ? 'Cargando municipios…' : !department ? 'Primero selecciona un departamento' : 'Selecciona un municipio'}</option>
      {cities.map(item => <option key={item} value={item}>{item}</option>)}
    </select>
    {loadFailed && <p className="sb-location-note">No pudimos cargar el listado oficial. Puedes escribir tu ciudad manualmente.</p>}
    {(loadFailed || manual) && <input aria-label="Ciudad y departamento" value={manual} disabled={disabled} maxLength={100} placeholder="Ej. Montería - Córdoba" onChange={event => { setManual(event.target.value); onChange(event.target.value); }} />}
    <p className="sb-location-note">Listado basado en la división político-administrativa DIVIPOLA del DANE.</p>
  </div>;
}
