import { useEffect, useMemo, useState } from 'react';

const DIVIPOLA_URL = 'https://www.datos.gov.co/resource/gdxc-w37w.json?$limit=5000&$order=cod_mpio';
let locationsPromise;
const DEPARTMENT_FALLBACK = [
  'Amazonas','Antioquia','Arauca','Atlántico','Bogotá D.C.','Bolívar','Boyacá','Caldas','Caquetá','Casanare','Cauca','Cesar','Chocó','Córdoba','Cundinamarca','Guainía','Guaviare','Huila','La Guajira','Magdalena','Meta','Nariño','Norte de Santander','Putumayo','Quindío','Risaralda','San Andrés, Providencia y Santa Catalina','Santander','Sucre','Tolima','Valle del Cauca','Vaupés','Vichada'
];

async function loadLocations() {
  if (!locationsPromise) locationsPromise = fetch(DIVIPOLA_URL, { headers: { Accept: 'application/json' } })
    .then(response => {
      if (!response.ok) throw new Error('No fue posible consultar DIVIPOLA');
      return response.json();
    })
    .then(rows => {
      if (!Array.isArray(rows)) throw new Error('Respuesta DIVIPOLA inválida');
      return rows
        .filter(row => row.dpto && row.nom_mpio && String(row.tipo_municipio || '').toLocaleLowerCase('es-CO').includes('municipio'))
        .map(row => ({ department: row.dpto.trim(), city: row.nom_mpio.trim(), departmentCode: row.cod_dpto, cityCode: row.cod_mpio }));
    })
    .catch(error => {
      console.error('Error cargando municipios DIVIPOLA:', error);
      return [];
    });
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
  const [department, setDepartment] = useState('');
  const [city, setCity] = useState('');

  useEffect(() => {
    let active = true;
    loadLocations().then(rows => {
      if (!active) return;
      setLocations(rows);
      if (value) {
        const [oldCity, ...rest] = value.split(' - ');
        const oldDepartment = rest.join(' - ');
        const match = rows.find(row =>
          row.city.toLocaleLowerCase('es-CO') === oldCity.trim().toLocaleLowerCase('es-CO') &&
          (!oldDepartment || row.department.toLocaleLowerCase('es-CO') === oldDepartment.trim().toLocaleLowerCase('es-CO'))
        );
        if (match) {
          setDepartment(match.department);
          setCity(match.city);
        } else if (oldDepartment) {
          setDepartment(oldDepartment);
          setCity(oldCity.trim());
        }
      }
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const departments = useMemo(() => {
    const fromData = [...new Set(locations.map(row => row.department))];
    return (fromData.length ? fromData : DEPARTMENT_FALLBACK).sort((a,b)=>a.localeCompare(b,'es'));
  }, [locations]);

  const cities = useMemo(() => [...new Set(
    locations.filter(row => row.department === department).map(row => row.city)
  )].sort((a,b)=>a.localeCompare(b,'es')), [locations, department]);

  function selectDepartment(nextDepartment) {
    setDepartment(nextDepartment);
    setCity('');
    onChange('');
  }

  function selectCity(nextCity) {
    setCity(nextCity);
    onChange(nextCity && department ? nextCity + ' - ' + department : '');
  }

  return <div className="sb-location-field">
    <label htmlFor="business-department">Departamento</label>
    <select id="business-department" value={department} disabled={disabled || loading} onChange={event => selectDepartment(event.target.value)}>
      <option value="">{loading ? 'Cargando departamentos…' : 'Selecciona un departamento'}</option>
      {departments.map(item => <option key={item} value={item}>{item}</option>)}
    </select>

    <label htmlFor="business-city">Municipio o ciudad</label>
    <select id="business-city" value={city} disabled={disabled || loading || !department || cities.length === 0} onChange={event => selectCity(event.target.value)}>
      <option value="">{loading ? 'Cargando municipios…' : !department ? 'Primero selecciona un departamento' : cities.length ? 'Selecciona un municipio' : 'No hay municipios disponibles'}</option>
      {cities.map(item => <option key={item} value={item}>{item}</option>)}
    </select>
    {!loading && locations.length === 0 && <p className="sb-location-note">No se pudo conectar con el listado oficial de municipios. Intenta recargar la página.</p>}
  </div>;
}
