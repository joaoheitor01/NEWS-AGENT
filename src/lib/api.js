// src/lib/api.js — cliente da API de notícias.

// Em produção (Vercel) a API é same-origin (/api). Em build nativo (Capacitor)
// é preciso apontar para o host de produção via VITE_API_BASE.
const API_BASE = import.meta.env.VITE_API_BASE || '';

export async function buscarNoticias(topic = null, { signal } = {}) {
  const resp = await fetch(`${API_BASE}/api/noticias`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic }),
    signal,
  });

  if (!resp.ok) {
    throw new Error(`Falha na matriz (status ${resp.status})`);
  }

  const data = await resp.json();
  if (data.erro) throw new Error(data.erro);
  return data;
}
