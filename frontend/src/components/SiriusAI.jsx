import { createContext, useContext, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const SiriusAIContext = createContext(null);

export function SiriusAIProvider({ children }) {
  const [floatingOpen, setFloatingOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [fullPageRequested, setFullPageRequested] = useState(false);

  const value = {
    floatingOpen,
    setFloatingOpen,
    draft,
    setDraft,
    fullPageRequested,
    requestFullPage() { setFloatingOpen(false); setFullPageRequested(true); },
    consumeFullPageRequest() { setFullPageRequested(false); },
    clearDraft() { setDraft(''); }
  };

  return <SiriusAIContext.Provider value={value}>{children}</SiriusAIContext.Provider>;
}

export function useSiriusAI() {
  const value = useContext(SiriusAIContext);
  if (!value) throw new Error('useSiriusAI debe utilizarse dentro de SiriusAIProvider.');
  return value;
}

const PROMPTS = [
  { id: 'sales', icon: 'chart', title: 'Analizar mis ventas', description: 'Resultados, tendencias y comportamiento de ventas', prompt: 'Quiero analizar las ventas de mi negocio.' },
  { id: 'inventory', icon: 'boxes', title: 'Revisar inventario', description: 'Existencias, productos críticos y rotación', prompt: 'Ayúdame a revisar el estado de mi inventario.' },
  { id: 'finance', icon: 'wallet', title: 'Consultar mis finanzas', description: 'Ingresos, gastos y beneficio estimado', prompt: 'Quiero revisar las finanzas de mi negocio.' },
  { id: 'guide', icon: 'compass', title: 'Aprender a usar Sirius', description: 'Guías para aprovechar cada módulo', prompt: 'Enséñame a utilizar Sirius Business.' }
];

function Glyph({ name, size = 20 }) {
  const paths = {
    ai: <><path d="M12 3.5 14 9l5.5 2-5.5 2-2 5.5L10 13l-5.5-2L10 9l2-5.5Z"/><path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z"/></>,
    chart: <><path d="M4 19V5"/><path d="M4 19h17"/><path d="m7 15 4-4 3 2 6-7"/></>,
    boxes: <><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/></>,
    wallet: <><rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 9V6a2 2 0 0 1 2-2h13"/><path d="M16 13h5v4h-5a2 2 0 0 1 0-4Z"/></>,
    compass: <><circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2.2 4.8-4.8 2.2 2.2-4.8 4.8-2.2Z"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    history: <><path d="M3 12a9 9 0 1 0 2.7-6.4L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
    send: <><path d="m22 2-7 20-4-9-9-4 20-7Z"/><path d="M22 2 11 13"/></>,
    expand: <><path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M3 16v3a2 2 0 0 0 2 2h3"/></>,
    spark: <><path d="m12 3 1.5 6.5L20 12l-6.5 1.5L12 20l-1.5-6.5L4 12l6.5-2.5L12 3Z"/><path d="m19 3 .6 2.4L22 6l-2.4.6L19 9l-.6-2.4L16 6l2.4-.6L19 3Z"/></>
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
  const { draft, setDraft, clearDraft } = useSiriusAI();

  return <div className="sb-content sirius-ai-page">
    <section className="sirius-ai-hero">
      <div className="sirius-ai-hero-copy">
        <span className="sirius-ai-eyebrow"><Glyph name="spark" size={13}/> INTELIGENCIA EMPRESARIAL</span>
        <h2>Tu negocio tiene preguntas.<br/><em>Sirius tiene el espacio para responderlas.</em></h2>
        <p>Un lugar para entender tus números, explorar oportunidades y aprender a gestionar tu negocio con más claridad.</p>
        <div className="sirius-ai-hero-meta"><span className="sirius-ai-status-dot"/> Centro de inteligencia preparado <span className="sirius-ai-meta-divider"/> Motor IA pendiente de conexión</div>
      </div>
      <div className="sirius-ai-hero-art" aria-hidden="true"><SiriusMark/></div>
    </section>

    <div className="sirius-ai-layout">
      <aside className="sirius-ai-history">
        <div className="sirius-ai-history-head">
          <div><span className="sirius-ai-eyebrow">TU ESPACIO</span><h3>Conversaciones</h3></div>
          <span className="sirius-ai-history-count">0</span>
        </div>
        <button className="sirius-ai-new-chat" type="button" onClick={clearDraft}><Glyph name="plus" size={16}/> Nueva conversación</button>
        <div className="sirius-ai-history-empty">
          <span><Glyph name="history" size={19}/></span>
          <strong>Tu historial comenzará aquí</strong>
          <p>Cuando conectemos el asistente, tus conversaciones se organizarán en este espacio.</p>
        </div>
        <div className="sirius-ai-history-foot"><span className="sirius-ai-lock-dot"/> Historial privado de tu espacio</div>
      </aside>

      <section className="sirius-ai-chat-area">
        <div className="sirius-ai-welcome">
          <SiriusMark small/>
          <span className="sirius-ai-welcome-label">SIRIUS AI · TU COPILOTO EMPRESARIAL</span>
          <h2>¿Qué quieres resolver hoy?</h2>
          <p>Elige un punto de partida. Pronto podrás conversar con Sirius sobre la información real de tu negocio.</p>
          <div className="sirius-ai-prompts">
            {PROMPTS.map(item=><button className={draft===item.prompt?'selected':''} key={item.id} type="button" onClick={()=>setDraft(item.prompt)}>
              <span className={'sirius-ai-prompt-icon sirius-ai-prompt-'+item.id}><Glyph name={item.icon} size={19}/></span>
              <span><strong>{item.title}</strong><small>{item.description}</small></span>
              <Glyph name="arrow" size={16}/>
            </button>)}
          </div>
        </div>
        <div className="sirius-ai-composer-wrap">
          {draft && <div className="sirius-ai-draft-note">Punto de partida seleccionado. Se activará cuando conectemos el asistente.</div>}
          <div className="sirius-ai-composer">
            <textarea rows="2" value={draft} onChange={event=>setDraft(event.target.value)} placeholder="El chat estará disponible al conectar Ghosty AI…" disabled/>
            <button type="button" disabled aria-label="Enviar mensaje"><Glyph name="send" size={18}/></button>
          </div>
          <div className="sirius-ai-composer-foot"><span><Glyph name="history" size={12}/> Las conversaciones aparecerán aquí después de conectar Ghosty</span><span>Powered by Sirius</span></div>
        </div>
      </section>
    </div>
    <p className="sirius-ai-disclaimer">SIRIUS AI · La interfaz está preparada. Las respuestas inteligentes y el acceso a datos empresariales se habilitarán al integrar el proveedor de IA.</p>
  </div>;
}

export function SiriusAIFloating() {
  const { floatingOpen, setFloatingOpen, draft, setDraft, requestFullPage } = useSiriusAI();
  const location = useLocation();
  const navigate = useNavigate();
  const visible = location.pathname === '/' || location.pathname === '/account';

  if (!visible) return null;

  return <div className="sirius-ai-floating-root">
    {floatingOpen && <section className="sirius-ai-float-panel" aria-label="Asistente Sirius AI">
      <header className="sirius-ai-float-head">
        <div className="sirius-ai-float-identity"><SiriusMark small/><span><strong>Sirius AI</strong><small>Copiloto empresarial</small></span></div>
        <div className="sirius-ai-float-head-actions">
          <button type="button" onClick={()=>{requestFullPage();navigate('/');}} aria-label="Abrir Sirius AI completo"><Glyph name="expand" size={16}/></button>
          <button type="button" onClick={()=>setFloatingOpen(false)} aria-label="Cerrar asistente"><Glyph name="close" size={17}/></button>
        </div>
      </header>
      <div className="sirius-ai-float-body">
        <div className="sirius-ai-float-welcome"><SiriusMark small/><strong>¡Hola! Soy Sirius.</strong><p>Tu espacio de inteligencia empresarial se está preparando.</p></div>
        <div className="sirius-ai-float-status"><span className="sirius-ai-status-dot"/> Conexión con Ghosty AI pendiente</div>
        <div className="sirius-ai-float-suggestions">
          {PROMPTS.slice(0,3).map(item=><button key={item.id} type="button" className={draft===item.prompt?'selected':''} onClick={()=>setDraft(item.prompt)}><Glyph name={item.icon} size={15}/>{item.title}</button>)}
        </div>
        <div className="sirius-ai-float-composer">
          <textarea rows="2" value={draft} placeholder="El chat se activará al conectar Ghosty…" disabled/>
          <button type="button" disabled aria-label="Enviar mensaje"><Glyph name="send" size={16}/></button>
        </div>
        <button className="sirius-ai-open-full" type="button" onClick={()=>{requestFullPage();navigate('/');}}>Abrir centro de Sirius AI <Glyph name="arrow" size={15}/></button>
      </div>
    </section>}
    <button className={'sirius-ai-float-trigger'+(floatingOpen?' is-open':'')} type="button" aria-label={floatingOpen?'Cerrar Sirius AI':'Abrir Sirius AI'} aria-expanded={floatingOpen} onClick={()=>setFloatingOpen(open=>!open)}>
      {floatingOpen?<Glyph name="close" size={22}/>:<><SiriusMark small/><span>Sirius AI</span></>}
    </button>
  </div>;
}
