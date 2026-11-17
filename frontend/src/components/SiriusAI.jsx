import { createContext, useContext, useState } from 'react';

const SiriusAIContext = createContext(null);

export function SiriusAIProvider({ children }) {
  const [fullPageRequested, setFullPageRequested] = useState(false);
  const value = {
    fullPageRequested,
    consumeFullPageRequest() { setFullPageRequested(false); },
  };
  return <SiriusAIContext.Provider value={value}>{children}</SiriusAIContext.Provider>;
}

export function useSiriusAI() {
  const value = useContext(SiriusAIContext);
  if (!value) throw new Error('useSiriusAI debe utilizarse dentro de SiriusAIProvider.');
  return value;
}

const PROMPTS = [
  { id: 'sales', icon: 'chart', title: 'Analizar mis ventas', description: 'Resultados, tendencias y comportamiento de ventas' },
  { id: 'inventory', icon: 'boxes', title: 'Revisar inventario', description: 'Existencias, productos críticos y rotación' },
  { id: 'finance', icon: 'wallet', title: 'Consultar mis finanzas', description: 'Ingresos, gastos y beneficio estimado' },
  { id: 'guide', icon: 'compass', title: 'Aprender a usar Sirius', description: 'Guías para aprovechar cada módulo' }
];

function Glyph({ name, size = 20 }) {
  const paths = {
    ai: <><path d="M12 3.5 14 9l5.5 2-5.5 2-2 5.5L10 13l-5.5-2L10 9l2-5.5Z"/><path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2-.9L19 15Z"/></>,
    chart: <><path d="M4 19V5"/><path d="M4 19h17"/><path d="m7 15 4-4 3 2 6-7"/></>,
    boxes: <><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/></>,
    wallet: <><rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 9V6a2 2 0 0 1 2-2h13"/><path d="M16 13h5v4h-5a2 2 0 0 1 0-4Z"/></>,
    compass: <><circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2.2 4.8-4.8 2.2 2.2-4.8 4.8-2.2Z"/></>,
    spark: <><path d="m12 3 1.5 6.5L20 12l-6.5 1.5L12 20l-1.5-6.5L4 12l6.5-2.5L12 3Z"/><path d="m19 3 .6 2.4L22 6l-2.4.6L19 9l-.6-2.4L16 6l2.4-.6L19 3Z"/></>,
    history: <><path d="M3 12a9 9 0 1 0 2.7-6.4L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/></>
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.ai}</svg>;
}

function SiriusMark({ small = false }) {
  return <span className={small ? 'sirius-ai-mark sirius-ai-mark-small' : 'sirius-ai-mark'}>
    <span className="sirius-ai-orbit sirius-ai-orbit-one"/>
    <span className="sirius-ai-orbit sirius-ai-orbit-two"/>
    <span className="sirius-ai-core"/>
    <span className="sirius-ai-star sirius-ai-star-one"/>
    <span className="sirius-ai-star sirius-ai-star-two"/>
  </span>;
}

export function SiriusAIPage() {
  return <div className="sb-content sirius-ai-page">
    <section className="sirius-ai-hero">
      <div className="sirius-ai-hero-copy">
        <span className="sirius-ai-eyebrow"><Glyph name="spark" size={13}/> INTELIGENCIA EMPRESARIAL</span>
        <h2>Tu negocio tiene preguntas.<br/><em>Sirius tiene el espacio para responderlas.</em></h2>
        <p>Un espacio preparado para consultar ventas, inventario y resultados de tu empresa.</p>
        <div className="sirius-ai-hero-meta"><span className="sirius-ai-status-dot"/> Espacio de Sirius AI</div>
      </div>
      <div className="sirius-ai-hero-art" aria-hidden="true"><SiriusMark/></div>
    </section>

    <div className="sirius-ai-layout">
      <aside className="sirius-ai-history">
        <div className="sirius-ai-history-head">
          <div><span className="sirius-ai-eyebrow">TU ESPACIO</span><h3>Conversaciones</h3></div>
          <span className="sirius-ai-history-count">0</span>
        </div>
        <div className="sirius-ai-history-empty">
          <span><Glyph name="history" size={19}/></span>
          <strong>Tu historial comenzará aquí</strong>
          <p>Cuando el asistente esté disponible, tus conversaciones aparecerán en esta lista.</p>
        </div>
        <div className="sirius-ai-history-foot"><span className="sirius-ai-lock-dot"/> Tu espacio de trabajo</div>
      </aside>

      <section className="sirius-ai-chat-area">
        <div className="sirius-ai-welcome">
          <SiriusMark small/>
          <span className="sirius-ai-welcome-label">SIRIUS AI · TU COPILOTO EMPRESARIAL</span>
          <h2>¿Qué quieres resolver hoy?</h2>
          <p>Este espacio está reservado para las herramientas inteligentes de tu negocio.</p>
          <div className="sirius-ai-prompts">
            {PROMPTS.map(item=><div className="sirius-ai-prompt-static" key={item.id}>
              <span className={'sirius-ai-prompt-icon sirius-ai-prompt-'+item.id}><Glyph name={item.icon} size={19}/></span>
              <span><strong>{item.title}</strong><small>{item.description}</small></span>
              <Glyph name="ai" size={15}/>
            </div>)}
          </div>
        </div>
        <div className="sirius-ai-composer-wrap">
          <div className="sirius-ai-composer">
            <textarea rows="2" value="" placeholder="El asistente estará disponible próximamente…" disabled readOnly/>
            <button type="button" disabled aria-label="Enviar mensaje"><Glyph name="spark" size={17}/></button>
          </div>
          <div className="sirius-ai-composer-foot"><span>Tu espacio Sirius AI está conservado</span><span>Próximamente</span></div>
        </div>
      </section>
    </div>
  </div>;
}
