// src/lib/format.js — helpers de formatação e busca.

// Garante que um link só seja usado se for http(s). Bloqueia javascript:, data:, etc.
// (defesa contra XSS via href vindo de feeds RSS de terceiros).
export function linkSeguro(url) {
  if (typeof url !== 'string') return '';
  try {
    const u = new URL(url, window.location.origin);
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.href : '';
  } catch {
    return '';
  }
}

// "há 2 h", "há 3 d", "agora". Aceita ISO string, ms epoch, ou vazio.
export function tempoRelativo(data) {
  if (!data) return 'agora';
  const ts = typeof data === 'number' ? data : Date.parse(data);
  if (!ts || Number.isNaN(ts)) return 'agora';

  const diff = Date.now() - ts;
  const min = Math.round(diff / 60000);
  if (min < 1) return 'agora';
  if (min < 60) return `há ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.round(h / 24);
  if (d < 7) return `há ${d} d`;
  const sem = Math.round(d / 7);
  return `há ${sem} sem`;
}

// Trunca um texto SEMPRE no limite de uma palavra inteira (nunca no meio dela).
// Se o texto já couber em `max`, devolve igual — sem reticências.
export function truncar(texto, max = 180) {
  const t = (texto || '').trim();
  if (t.length <= max) return t;
  const corte = t.slice(0, max);
  const ultimoEspaco = corte.lastIndexOf(' ');
  const base = ultimoEspaco > 0 ? corte.slice(0, ultimoEspaco) : corte;
  // Remove pontuação/espaço solto no fim antes de acrescentar as reticências.
  return `${base.replace(/[\s.,;:!?–—-]+$/, '')}…`;
}

export const IMPACTO_RANK = { alto: 3, médio: 2, medio: 2, baixo: 1, curto: 1 };

// Saudação conforme a hora.
export function saudacao(hora = new Date()) {
  const h = hora.getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

// Filtro de texto simples (título + resumo + fonte).
export function filtrarPorTexto(noticias, termo) {
  const q = termo.trim().toLowerCase();
  if (!q) return noticias;
  return noticias.filter((n) =>
    `${n.titulo} ${n.resumo} ${n.fonte} ${n.empresa || ''}`.toLowerCase().includes(q)
  );
}

// Ordena por relevância (impacto) e depois recência.
export function ordenarPorImpacto(noticias) {
  return [...noticias].sort((a, b) => {
    const ra = IMPACTO_RANK[a.impacto] || 0;
    const rb = IMPACTO_RANK[b.impacto] || 0;
    if (rb !== ra) return rb - ra;
    return (Date.parse(b.data) || 0) - (Date.parse(a.data) || 0);
  });
}

// Ordena estritamente por data (mais recentes primeiro), ignorando o score.
export function ordenarPorData(noticias) {
  return [...noticias].sort((a, b) => (Date.parse(b.data) || 0) - (Date.parse(a.data) || 0));
}
