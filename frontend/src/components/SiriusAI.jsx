import { useState } from 'react';
import './sirius-ai.css';

const features = [
  { icon: '◈', title: 'Inteligencia para tu negocio', body: 'Un espacio para convertir tus datos en decisiones más claras.' },
  { icon: '⌁', title: 'Ventas e inventario', body: 'Prepara consultas sobre movimientos, existencias y productos.' },
  { icon: '✧', title: 'Tu copiloto, a tu ritmo', body: 'Una experiencia sencilla, integrada con la identidad de Sirius.' },
];

export function SiriusAIPage({ onOpenAssistant }) {
  return (
    <div className="sb-content sirius-ai-page">
      <section className="sai-hero">
        <div className="sai-hero-copy">
          <span className="sai-eyebrow"><i /> INTELIGENCIA EMPRESARIAL · SIRIUS</span>
          <h2>Las ideas orbitan.<br/><em>Tu negocio avanza.</em></h2>
          <p>Muy pronto podrás conversar con Sirius para entender mejor tu negocio, explorar tus datos y encontrar nuevas oportunidades.</p>
          <button className="sai-cta" type="button" onClick={onOpenAssistant}>Explorar asistente <span>↗</span></button>
        </div>
        <div className="sai-orbit-scene" aria-hidden="true">
          <div className="sai-orbit sai-orbit-one"/><div className="sai-orbit sai-orbit-two"/>
          <div className="sai-core"><span>✦</span></div><i className="sai-moon sai-moon-one"/><i className="sai-moon sai-moon-two"/>
          <div className="sai-particle sai-particle-one"/><div className="sai-particle sai-particle-two"/>
        </div>
        <div className="sai-hero-foot"><span>01 / UN NUEVO CENTRO DE IDEAS</span><span>DISEÑADO PARA SIRIUS BUSINESS</span></div>
      </section>
      <div className="sai-section-heading"><div><span className="sai-eyebrow">POSIBILIDADES</span><h3>Una nueva forma de mirar tu negocio</h3></div><span className="sai-coming">EN PREPARACIÓN</span></div>
      <div className="sai-feature-grid">
        {features.map((item, index) => <article className="sai-feature" key={item.title} style={{'--sai-delay': index * 100 + 'ms'}}>
          <span className="sai-feature-icon">{item.icon}</span><h4>{item.title}</h4><p>{item.body}</p><span className="sai-feature-index">0{index + 1}</span>
        </article>)}
      </div>
      <section className="sai-bottom-note"><span className="sai-note-star">✧</span><div><strong>Estamos preparando el siguiente salto.</strong><p>La interfaz ya está lista para recibir el motor de inteligencia de Sirius.</p></div><span className="sai-note-status"><i/> INTERFAZ ACTIVA</span></section>
    </div>
  );
}

export function SiriusAIFloating({ onOpenAI }) {
  const [open, setOpen] = useState(false);
  return <>
    {open && <section className="sai-float-panel" role="dialog" aria-label="Ventana de Sirius AI">
      <header className="sai-float-head"><div className="sai-avatar">✦</div><div><strong>Sirius AI</strong><small><i/> Tu copiloto empresarial</small></div><button type="button" onClick={() => setOpen(false)} aria-label="Cerrar ventana">×</button></header>
      <div className="sai-float-body"><div className="sai-float-glow">✧</div><span className="sai-eyebrow">BIENVENIDO A SIRIUS</span><h3>¿Qué vamos a descubrir?</h3><p>Tu espacio de inteligencia empresarial está tomando forma. Desde aquí podrás acceder rápidamente a Sirius AI.</p><div className="sai-float-hint"><span>◈</span> Consultas sobre tu negocio, en un solo lugar.</div></div>
      <button className="sai-float-open" type="button" onClick={() => { setOpen(false); onOpenAI(); }}>Abrir Sirius AI <span>↗</span></button>
      <div className="sai-float-foot">SIRIUS BUSINESS <span>·</span> EN PREPARACIÓN</div>
    </section>}
    <button className={'sai-launcher' + (open ? ' is-open' : '')} type="button" onClick={() => setOpen(v => !v)} aria-label={open ? 'Cerrar Sirius AI' : 'Abrir Sirius AI'} aria-expanded={open}>
      <span className="sai-launcher-orbit">✦</span><span className="sai-launcher-pulse"/>
    </button>
  </>;
}
