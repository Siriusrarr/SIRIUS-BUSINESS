import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useLocation, useNavigate } from 'react-router-dom';
import { assistantApi } from '../services/assistantApi.js';

const SiriusAIContext = createContext(null);

export function SiriusAIProvider({ children }) {
  const { user } = useAuth();
  const [floatingOpen, setFloatingOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [fullPageRequested, setFullPageRequested] = useState(false);
  const [assistantReady, setAssistantReady] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [assistantError, setAssistantError] = useState('');

  const refreshConversations = useCallback(async () => {
    const result = await assistantApi.conversations();
    setConversations(result.items || []);
    return result.items || [];
  }, []);

  useEffect(() => {
    let active = true;
    if (!user?.id) {
      setAssistantReady(false);
      setStatusLoading(false);
      setConversations([]);
      setActiveConversationId(null);
      setMessages([]);
      setAssistantError('');
      return () => { active = false; };
    }

    setStatusLoading(true);
    Promise.all([assistantApi.status(), assistantApi.conversations()])
      .then(([status, history]) => {
        if (!active) return;
        setAssistantReady(Boolean(status.ready));
        setConversations(history.items || []);
        setAssistantError('');
      })
      .catch((error) => {
        if (active) {
          setAssistantReady(false);
          setAssistantError(error.message);
        }
      })
      .finally(() => { if (active) setStatusLoading(false); });

    return () => { active = false; };
  }, [user?.id]);

  const startConversation = useCallback(() => {
    setActiveConversationId(null);
    setMessages([]);
    setDraft('');
    setAssistantError('');
  }, []);

  const openConversation = useCallback(async (id) => {
    setHistoryLoading(true);
    setAssistantError('');
    try {
      const result = await assistantApi.conversation(id);
      setActiveConversationId(result.conversation.id);
      setMessages(result.conversation.messages || []);
      setDraft('');
    } catch (error) {
      setAssistantError(error.message);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (rawMessage) => {
    const message = String(rawMessage || '').trim();
    if (!message || sending || !assistantReady) return;
    setSending(true);
    setAssistantError('');
    setDraft('');
    try {
      const result = await assistantApi.send(message, activeConversationId);
      const conversation = result.conversation;
      setActiveConversationId(conversation.id);
      setMessages((current) => [
        ...current,
        conversation.userMessage,
        conversation.assistantMessage,
      ]);
      setConversations((current) => [
        conversation,
        ...current.filter((item) => item.id !== conversation.id),
      ].slice(0, 30));
    } catch (error) {
      setAssistantError(error.message);
      setDraft(message);
    } finally {
      setSending(false);
    }
  }, [activeConversationId, assistantReady, sending]);

  const deleteConversation = useCallback(async (id) => {
    try {
      await assistantApi.deleteConversation(id);
      setConversations((current) => current.filter((item) => item.id !== id));
      if (activeConversationId === id) startConversation();
    } catch (error) {
      setAssistantError(error.message);
    }
  }, [activeConversationId, startConversation]);

  const value = {
    floatingOpen,
    setFloatingOpen,
    draft,
    setDraft,
    fullPageRequested,
    requestFullPage() { setFloatingOpen(false); setFullPageRequested(true); },
    consumeFullPageRequest() { setFullPageRequested(false); },
    clearDraft: startConversation,
    assistantReady,
    statusLoading,
    conversations,
    activeConversationId,
    messages,
    sending,
    historyLoading,
    assistantError,
    setAssistantError,
    startConversation,
    openConversation,
    sendMessage,
    deleteConversation,
    refreshConversations,
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

function ChatMessages({ compact = false }) {
  const { messages, sending } = useSiriusAI();
  const visibleMessages = compact ? messages.slice(-4) : messages;
  return <div className={compact ? 'sirius-ai-messages compact' : 'sirius-ai-messages'}>
    {visibleMessages.map((message) => (
      <article key={message.id} className={'sirius-ai-message '+(message.role === 'user' ? 'from-user' : 'from-ai')}>
        <span>{message.role === 'user' ? 'Tú' : 'Sirius AI'}</span>
        <p>{message.content}</p>
      </article>
    ))}
    {sending && <article className="sirius-ai-message from-ai"><span>Sirius AI</span><p className="sirius-ai-typing">Analizando los datos de tu negocio…</p></article>}
  </div>;
}

export function SiriusAIPage() {
  const {
    draft, setDraft, clearDraft, assistantReady, statusLoading, conversations,
    activeConversationId, messages, sending, historyLoading, assistantError,
    setAssistantError, openConversation, sendMessage, deleteConversation,
  } = useSiriusAI();

  function submit(event) {
    event.preventDefault();
    sendMessage(draft);
  }

  return <div className="sb-content sirius-ai-page">
    <section className="sirius-ai-hero">
      <div className="sirius-ai-hero-copy">
        <span className="sirius-ai-eyebrow"><Glyph name="spark" size={13}/> INTELIGENCIA EMPRESARIAL</span>
        <h2>Tu negocio tiene preguntas.<br/><em>Sirius tiene el espacio para responderlas.</em></h2>
        <p>Consulta ventas, inventario y resultados de tu empresa con información de tu propio espacio.</p>
        <div className="sirius-ai-hero-meta"><span className="sirius-ai-status-dot"/> {statusLoading ? 'Comprobando conexión con Ghosty…' : assistantReady ? 'Ghosty conectado · Consultas empresariales disponibles' : 'Conexión con Formmy pendiente'}</div>
      </div>
      <div className="sirius-ai-hero-art" aria-hidden="true"><SiriusMark/></div>
    </section>

    <div className="sirius-ai-layout">
      <aside className="sirius-ai-history">
        <div className="sirius-ai-history-head">
          <div><span className="sirius-ai-eyebrow">TU ESPACIO</span><h3>Conversaciones</h3></div>
          <span className="sirius-ai-history-count">{conversations.length}</span>
        </div>
        <button className="sirius-ai-new-chat" type="button" onClick={clearDraft}><Glyph name="plus" size={16}/> Nueva conversación</button>
        <div className="sirius-ai-history-list">
          {conversations.map((item) => (
            <div key={item.id} className={'sirius-ai-history-item'+(activeConversationId===item.id?' active':'')}>
              <button type="button" onClick={()=>openConversation(item.id)}>
                <strong>{item.title}</strong>
                <small>{new Date(item.updatedAt).toLocaleDateString('es-CO')}</small>
              </button>
              <button type="button" aria-label="Eliminar conversación" onClick={()=>deleteConversation(item.id)}>×</button>
            </div>
          ))}
          {!conversations.length && <div className="sirius-ai-history-empty">
            <span><Glyph name="history" size={19}/></span>
            <strong>Tu historial comenzará aquí</strong>
            <p>Las conversaciones que tengas con Sirius aparecerán en esta lista.</p>
          </div>}
        </div>
        <div className="sirius-ai-history-foot"><span className="sirius-ai-lock-dot"/> Historial privado de tu cuenta y negocio</div>
      </aside>

      <section className="sirius-ai-chat-area">
        {messages.length ? (
          <div className="sirius-ai-conversation-view">
            <div className="sirius-ai-conversation-heading">
              <SiriusMark small/>
              <div><strong>{conversations.find(item=>item.id===activeConversationId)?.title || 'Conversación con Sirius AI'}</strong><small>Contexto privado de tu negocio</small></div>
            </div>
            <ChatMessages/>
            {historyLoading && <p className="sirius-ai-draft-note">Cargando conversación…</p>}
          </div>
        ) : (
          <div className="sirius-ai-welcome">
            <SiriusMark small/>
            <span className="sirius-ai-welcome-label">SIRIUS AI · TU COPILOTO EMPRESARIAL</span>
            <h2>¿Qué quieres resolver hoy?</h2>
            <p>Empieza con una pregunta sobre los datos de tu negocio.</p>
            <div className="sirius-ai-prompts">
              {PROMPTS.map(item=><button type="button" key={item.id} onClick={()=>setDraft(item.prompt)}>
                <span className={'sirius-ai-prompt-icon sirius-ai-prompt-'+item.id}><Glyph name={item.icon} size={19}/></span>
                <span><strong>{item.title}</strong><small>{item.description}</small></span>
                <Glyph name="arrow" size={15}/>
              </button>)}
            </div>
          </div>
        )}

        {assistantError && <div className="sirius-ai-error" role="alert">{assistantError}<button type="button" onClick={()=>setAssistantError('')} aria-label="Cerrar aviso">×</button></div>}
        {!assistantReady && !statusLoading && <p className="sirius-ai-setup-note">La conexión con Formmy no está lista. Revisa las variables privadas FORMMY_SECRET_KEY y FORMMY_AGENT_ID en Render.</p>}
        <form className="sirius-ai-composer-wrap" onSubmit={submit}>
          <div className="sirius-ai-composer">
            <textarea rows="2" value={draft} onChange={event=>setDraft(event.target.value)} placeholder={assistantReady ? 'Pregunta sobre las ventas, inventario o finanzas de tu negocio…' : 'El chat se activará al configurar Formmy…'} disabled={!assistantReady || sending}/>
            <button type="submit" disabled={!assistantReady || sending || !draft.trim()} aria-label="Enviar mensaje"><Glyph name="send" size={17}/></button>
          </div>
          <div className="sirius-ai-composer-foot"><span>{sending ? 'Sirius está consultando los datos de tu negocio…' : 'Sirius consulta tus datos y no modifica registros'}</span><span>Powered by Formmy</span></div>
        </form>
      </section>
    </div>
    <p className="sirius-ai-disclaimer">Las respuestas se generan con Formmy a partir de un resumen actualizado de los datos del negocio autenticado. Esta versión permite consultas; no ejecuta cambios.</p>
  </div>;
}

export function SiriusAIFloating() {
  const {
    floatingOpen, setFloatingOpen, draft, setDraft, requestFullPage, assistantReady,
    messages, sending, assistantError, sendMessage,
  } = useSiriusAI();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const visible = Boolean(user) && (location.pathname === '/' || location.pathname === '/account');

  useEffect(() => { if (!visible) setFloatingOpen(false); }, [visible, setFloatingOpen]);
  if (!visible) return null;

  function submit(event) {
    event.preventDefault();
    sendMessage(draft);
  }

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
        {messages.length
          ? <ChatMessages compact/>
          : <div className="sirius-ai-float-welcome"><SiriusMark small/><strong>¡Hola! Soy Sirius.</strong><p>Puedo responder preguntas sobre la información de tu negocio.</p></div>}
        {!assistantReady && <div className="sirius-ai-float-status">Falta configurar la conexión con Formmy.</div>}
        {assistantError && <p className="sirius-ai-error" role="alert">{assistantError}</p>}
        <div className="sirius-ai-float-suggestions">
          {PROMPTS.slice(0,3).map(item=><button key={item.id} type="button" className={draft===item.prompt?'selected':''} onClick={()=>setDraft(item.prompt)}><Glyph name={item.icon} size={15}/>{item.title}</button>)}
        </div>
        <form className="sirius-ai-float-composer" onSubmit={submit}>
          <textarea rows="2" value={draft} onChange={event=>setDraft(event.target.value)} placeholder="Pregunta sobre tu negocio…" disabled={!assistantReady || sending}/>
          <button type="submit" disabled={!assistantReady || sending || !draft.trim()} aria-label="Enviar mensaje"><Glyph name="send" size={16}/></button>
        </form>
        <button className="sirius-ai-open-full" type="button" onClick={()=>{requestFullPage();navigate('/');}}>Abrir centro de Sirius AI <Glyph name="arrow" size={15}/></button>
      </div>
    </section>}
    <button className={'sirius-ai-float-trigger'+(floatingOpen?' is-open':'')} type="button" aria-label={floatingOpen?'Cerrar Sirius AI':'Abrir Sirius AI'} aria-expanded={floatingOpen} onClick={()=>setFloatingOpen(open=>!open)}>
      {floatingOpen?<Glyph name="close" size={22}/>:<><SiriusMark small/><span>Sirius AI</span></>}
    </button>
  </div>;
}
