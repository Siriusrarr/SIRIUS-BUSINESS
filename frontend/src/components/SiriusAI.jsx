import { useEffect, useRef, useState } from 'react';
import { businessApi } from '../services/businessApi.js';
import './sirius-ai.css';

const suggestions = [
  { icon: '↗', label: 'Analiza mis ventas', prompt: 'Analiza las ventas de mi negocio este mes.' },
  { icon: '▦', label: 'Revisa mi inventario', prompt: '¿Cómo está mi inventario y qué productos necesitan atención?' },
  { icon: '◉', label: 'Consulta mis finanzas', prompt: 'Explícame el estado financiero de mi negocio este mes.' },
];

const welcome = {
  role: 'assistant',
  content: '¡Hola! Soy Sirius, tu copiloto empresarial. Puedo ayudarte a entender las ventas, revisar el inventario y analizar las finanzas de tu negocio. ¿Qué quieres consultar?',
};

function splitCells(line) {
  return line.trim().replace(/^\|/, '').replace(/\|$/, '').split(/(?<!\\)\|/).map(cell => cell.trim().replace(/\\\|/g, '|'));
}

function isTableStart(lines, index) {
  const header = lines[index];
  const divider = lines[index + 1] || '';
  if (!header.includes('|') || !divider.includes('|')) return false;
  const cells = splitCells(divider);
  return cells.length === splitCells(header).length && cells.every(cell => /^:?-{3,}:?$/.test(cell));
}

function messageBlocks(text) {
  const lines = text.replace(/\r\n?/g, '\n').split('\n');
  const blocks = [];
  const bullet = /^\s*(?:[-*+]|\d+[.)])\s+/;
  for (let i = 0; i < lines.length;) {
    const line = lines[i++].trim();
    if (!line) continue;
    if (isTableStart(lines, i - 1)) {
      const labels = splitCells(line);
      const rows = [];
      i++;
      while (i < lines.length && lines[i].includes('|')) rows.push(splitCells(lines[i++]));
      blocks.push({ type: 'table', labels, rows });
    } else if (bullet.test(line)) {
      const ordered = /^\d/.test(line);
      const items = [line.replace(bullet, '')];
      while (i < lines.length && bullet.test(lines[i]) && /^\d/.test(lines[i].trim()) === ordered) {
        items.push(lines[i++].replace(bullet, ''));
      }
      blocks.push({ type: ordered ? 'ol' : 'ul', items });
    } else if (!/^([-*_])(?:\s*\1){2,}$/.test(line)) {
      blocks.push({ type: /^#{1,6}\s/.test(line) ? 'heading' : 'text', text: line.replace(/^#{1,6}\s+/, '') });
    }
  }
  return blocks;
}

function inlineText(text) {
  return text.split(/(\*\*[^*\n]+\*\*|__[^_\n]+__|\x60[^\x60\n]+\x60|\*[^*\n]+\*)/g).map((part, index) => {
    if (/^(\*\*|__)/.test(part) && part.length > 4 && part.endsWith(part.slice(0, 2))) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('\x60') && part.endsWith('\x60') && part.length > 2) return <code key={index}>{part.slice(1, -1)}</code>;
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) return <em key={index}>{part.slice(1, -1)}</em>;
    return part;
  });
}

function AssistantReply({ text }) {
  return <div style={{ display: 'grid', gap: '0.65rem', minWidth: 0, whiteSpace: 'normal', overflowWrap: 'anywhere' }}>
    {messageBlocks(text).map((block, index) => {
      if (block.type === 'table') return <div key={index} style={{ display: 'grid', gap: '0.5rem' }}>
        {block.rows.map((row, r) => <dl key={r} style={{ margin: 0, padding: '0.65rem', border: '1px solid #384461', borderRadius: 10, background: '#141d30' }}>
          {block.labels.map((label, c) => <div key={c} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '0.5rem', padding: '0.2rem 0' }}>
            <dt style={{ color: '#b9c5de' }}>{inlineText(label)}</dt>
            <dd style={{ margin: 0, fontWeight: 600 }}>{inlineText(row[c] || '—')}</dd>
          </div>)}
        </dl>)}
      </div>;
      if (block.items) {
        const List = block.type;
        return <List key={index} style={{ margin: 0, paddingInlineStart: '1.25rem' }}>
          {block.items.map((item, n) => <li key={n}>{inlineText(item)}</li>)}
        </List>;
      }
      if (block.type === 'heading') return <strong key={index}>{inlineText(block.text)}</strong>;
      return <p key={index} style={{ margin: 0 }}>{inlineText(block.text)}</p>;
    })}
  </div>;
}

export function SiriusChat({ expanded }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([welcome]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState('');
  const retry = useRef(null);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const show = () => setOpen(true);
    const escape = event => { if (event.key === 'Escape') setOpen(false); };
    window.addEventListener('sirius-ai-open', show);
    window.addEventListener('keydown', escape);
    return () => {
      window.removeEventListener('sirius-ai-open', show);
      window.removeEventListener('keydown', escape);
    };
  }, []);

  useEffect(() => {
    if (expanded) setOpen(false);
  }, [expanded]);

  useEffect(() => {
    if (open || expanded) {
      const list = endRef.current?.parentElement;
      if (list) list.scrollTop = list.scrollHeight;
      if (expanded) return;
      const timer = window.setTimeout(() => inputRef.current?.focus(), 180);
      return () => window.clearTimeout(timer);
    }
  }, [messages, open, sending, expanded]);

  async function showHistory() {
    setHistoryOpen(true);
    setLoadingHistory(true);
    setHistoryError('');
    try {
      const result = await businessApi.listConversations();
      setConversations(result.conversations);
    } catch (err) {
      setHistoryError(err.message);
    } finally {
      setLoadingHistory(false);
    }
  }

  async function selectConversation(id) {
    setLoadingHistory(true);
    setHistoryError('');
    try {
      const { conversation } = await businessApi.getConversation(id);
      setMessages([welcome, ...conversation.turns.flatMap(turn => [
        { role: 'user', content: turn.question },
        { role: 'assistant', content: turn.answer },
      ])]);
      setConversationId(id);
      setDraft('');
      setError('');
      retry.current = null;
      setHistoryOpen(false);
    } catch (err) {
      setHistoryError(err.message);
    } finally {
      setLoadingHistory(false);
    }
  }

  async function send(value = draft) {
    const text = value.trim();
    if (!text || sending || loadingHistory) return;
    const requestId = retry.current?.text === text ? retry.current.id : crypto.randomUUID();
    retry.current = { text, id: requestId };
    const previous = messages;
    setMessages([...previous, { role: 'user', content: text }]);
    setHistoryOpen(false);
    setDraft('');
    setError('');
    setSending(true);
    try {
      const result = await businessApi.chatWithSirius(text, conversationId, requestId);
      setConversationId(result.conversation.id);
      setMessages(current => [...current, { role: 'assistant', content: result.answer }]);
      retry.current = null;
    } catch (err) {
      setMessages(previous);
      setDraft(text);
      setError(err.message || 'No se pudo conectar con Sirius. Inténtalo de nuevo.');
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  function resetChat() {
    if (sending || loadingHistory) return;
    setConversationId(null);
    setHistoryOpen(false);
    setMessages([welcome]);
    setDraft('');
    setError('');
    retry.current = null;
  }

  return <>
    {(expanded || open) && <section className={expanded ? "sai-float-panel sai-chat-page" : "sai-float-panel"} role={expanded ? "region" : "dialog"} aria-label="Conversación con Sirius AI" aria-modal={expanded ? undefined : false}>
      <header className="sai-float-head">
        <div className="sai-avatar"><span>✦</span></div>
        <div className="sai-head-copy"><strong>Sirius AI</strong><small><i/> Copiloto empresarial <span>· Groq</span></small></div>
        <button type="button" className="sai-history-toggle" disabled={sending || loadingHistory} aria-expanded={historyOpen}
          onClick={() => historyOpen ? setHistoryOpen(false) : showHistory()}>Historial</button>
        <button className="sai-reset" type="button" onClick={resetChat} disabled={sending || loadingHistory} aria-label="Nueva conversación" title="Nueva conversación">↻</button>
        {!expanded && <button className="sai-close" type="button" onClick={() => setOpen(false)} aria-label="Cerrar ventana">×</button>}
      </header>
      {historyOpen ? <section className="sai-history" aria-label="Conversaciones guardadas">
        <h3>Conversaciones</h3>
        {loadingHistory && <p role="status">Cargando…</p>}
        {historyError && <p role="alert">{historyError} <button onClick={showHistory}>Reintentar</button></p>}
        {!loadingHistory && !historyError && !conversations.length && <p>Tus consultas aparecerán aquí cuando Sirius responda.</p>}
        {conversations.map(item => <button type="button" key={item.id} disabled={loadingHistory}
          aria-current={item.id === conversationId ? 'true' : undefined} onClick={() => selectConversation(item.id)}>
          <strong>{item.title}</strong><small>{new Date(item.updatedAt).toLocaleString('es-CO')}</small>
        </button>)}
      </section> : <>
      <div className="sai-chat-meta"><span>CONVERSACIÓN PRIVADA</span><span>DATOS DE TU NEGOCIO</span></div>
      <div className="sai-chat-messages" aria-live="polite">
        {messages.map((message, index) => <article className={'sai-message sai-message-' + message.role} key={index}>
          {message.role === 'assistant' && <span className="sai-message-avatar">✦</span>}
          <div className="sai-message-bubble">{message.role === 'assistant' ? <AssistantReply text={message.content}/> : message.content}</div>
        </article>)}
        {sending && <article className="sai-message sai-message-assistant"><span className="sai-message-avatar">✦</span><div className="sai-message-bubble sai-typing"><i/><i/><i/><span>Sirius está pensando</span></div></article>}
        {error && <div className="sai-chat-error" role="alert"><span>!</span><p>{error}</p><button type="button" onClick={() => send(draft)}>Reintentar</button></div>}
        <div ref={endRef}/>
      </div>
      {messages.length === 1 && <div className="sai-suggestions">{suggestions.map(item => <button type="button" key={item.label} onClick={() => send(item.prompt)} disabled={sending}><span>{item.icon}</span>{item.label}<b>↗</b></button>)}</div>}
      <form className="sai-composer" onSubmit={event => { event.preventDefault(); send(); }}>
        <textarea ref={inputRef} rows="1" value={draft} maxLength={2000} onChange={event => setDraft(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); send(); } }} placeholder="Pregúntale algo a Sirius…" aria-label="Escribe tu consulta" disabled={sending}/>
        <button type="submit" disabled={sending || !draft.trim()} aria-label="Enviar mensaje"><span>➤</span></button>
      </form>
      </>}
      <div className="sai-float-foot">SIRIUS BUSINESS <span>·</span> SOLO CONSULTA · IA CON GROQ</div>
    </section>}
    {!expanded && <button className={'sai-launcher' + (open ? ' is-open' : '')} type="button" onClick={() => setOpen(v => !v)} aria-label={open ? 'Cerrar Sirius AI' : 'Abrir Sirius AI'} aria-expanded={open}>
      <span className="sai-launcher-orbit">✦</span><span className="sai-launcher-pulse"/>
    </button>}
  </>;
}
