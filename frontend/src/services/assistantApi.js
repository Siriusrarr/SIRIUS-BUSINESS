const API = '/api/assistant';

async function request(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    credentials: 'same-origin',
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || 'No se pudo completar la solicitud.');
    error.code = data.code;
    error.status = response.status;
    throw error;
  }
  return data;
}

export const assistantApi = {
  status: () => request('/status'),
  conversations: () => request('/conversations'),
  conversation: (id) => request(`/conversations/${encodeURIComponent(id)}`),
  deleteConversation: (id) => request(`/conversations/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  send: (message, conversationId) => request('/chat', {
    method: 'POST',
    body: JSON.stringify({ message, ...(conversationId ? { conversationId } : {}) }),
  }),
};
