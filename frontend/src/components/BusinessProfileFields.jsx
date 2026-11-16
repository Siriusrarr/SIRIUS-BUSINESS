import { useEffect, useMemo, useState } from 'react';
import DIVIPOLA from '../data/colombia-divipola.json';


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

const MUNICIPALITIES = DIVIPOLA.municipalities.filter(item => item.type === 'municipality' || item.type === 'island');

export function BusinessLocationField({ value, onChange, disabled = false }) {
  const [departmentCode, setDepartmentCode] = useState('');
  const [cityCode, setCityCode] = useState('');

  const departments = useMemo(
    () => [...DIVIPOLA.departments].sort((a,b)=>a.name.localeCompare(b.name,'es')),
    []
  );

  const cities = useMemo(
    () => MUNICIPALITIES
      .filter(item => item.departmentCode === departmentCode)
      .sort((a,b)=>a.name.localeCompare(b.name,'es')),
    [departmentCode]
  );

  useEffect(() => {
    if (!value) return;
    const [oldCity, ...rest] = value.split(' - ');
    const oldDepartment = rest.join(' - ').trim();
    const cityName = oldCity.trim().toLocaleLowerCase('es-CO');
    const candidates = MUNICIPALITIES.filter(item =>
      item.name.toLocaleLowerCase('es-CO') === cityName &&
      (!oldDepartment || item.department.toLocaleLowerCase('es-CO') === oldDepartment.toLocaleLowerCase('es-CO'))
    );
    if (candidates.length === 1) {
      setDepartmentCode(candidates[0].departmentCode);
      setCityCode(candidates[0].code);
    } else if (oldDepartment) {
      const department = departments.find(item => item.name.toLocaleLowerCase('es-CO') === oldDepartment.toLocaleLowerCase('es-CO'));
      if (department) {
        setDepartmentCode(department.code);
        setCityCode('');
      }
    }
  }, [value, departments]);

  function selectDepartment(nextCode) {
    setDepartmentCode(nextCode);
    setCityCode('');
    onChange('');
  }

  function selectCity(nextCode) {
    const selected = cities.find(item => item.code === nextCode);
    setCityCode(nextCode);
    onChange(selected ? selected.name + ' - ' + selected.department : '');
  }

  return <div className="sb-location-field">
    <label htmlFor="business-department">Departamento</label>
    <select
      id="business-department"
      value={departmentCode}
      disabled={disabled}
      onChange={event => selectDepartment(event.target.value)}
    >
      <option value="">Selecciona un departamento</option>
      {departments.map(item => <option key={item.code} value={item.code}>{item.name}</option>)}
    </select>

    <label htmlFor="business-city">Municipio o ciudad</label>
    <select
      id="business-city"
      value={cityCode}
      disabled={disabled || !departmentCode}
      onChange={event => selectCity(event.target.value)}
    >
      <option value="">{!departmentCode ? 'Primero selecciona un departamento' : 'Selecciona un municipio'}</option>
      {cities.map(item => <option key={item.code} value={item.code}>{item.name}</option>)}
    </select>
  </div>;
}
