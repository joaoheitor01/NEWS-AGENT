// src/lib/api.js — cliente da API de notícias.

// Em produção (Vercel) a API é same-origin (/api). Em build nativo (Capacitor)
// é preciso apontar para o host de produção via VITE_API_BASE.
const API_BASE = import.meta.env.VITE_API_BASE || '';

export async function buscarNoticias(topic = null, { signal } = {}) {
  // GET (em vez de POST) permite cache de borda na Vercel: reduz custo/abuso
  // de chamadas repetidas à IA e acelera o carregamento.
  const qs = topic ? `?topic=${encodeURIComponent(topic)}` : '';
  const resp = await fetch(`${API_BASE}/api/noticias${qs}`, { method: 'GET', signal });

  if (!resp.ok) {
    throw new Error(`Falha na matriz (status ${resp.status})`);
  }

  const data = await resp.json();
  if (data.erro) throw new Error(data.erro);
  return data;
}
