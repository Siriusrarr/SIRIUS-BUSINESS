import { useState } from 'react';

export default function PasswordInput({ id, label = 'Contraseña', value, onChange, autoComplete = 'current-password', hint }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="field-group">
      <label htmlFor={id}>{label}</label>
      <div className="password-wrap">
        <input
          id={id}
          name={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          required
          minLength={10}
          maxLength={72}
        />
        <button className="password-toggle" type="button" onClick={() => setVisible((current) => !current)} aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
          {visible ? 'OCULTAR' : 'MOSTRAR'}
        </button>
      </div>
      {hint && <small className="field-hint">{hint}</small>}
    </div>
  );
}
