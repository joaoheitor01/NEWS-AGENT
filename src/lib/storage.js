// src/lib/storage.js
// -----------------------------------------------------------------------------
// Acesso ao localStorage para notícias salvas e cache da última busca.
// Tolerante a falhas (modo privado, quota, JSON inválido).
// -----------------------------------------------------------------------------

const K_SAVED = 'tna_saved_v2';
const K_CACHE = 'tna_cache_v2';

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

// ---- Notícias salvas ----
export function getSaved() {
  const saved = read(K_SAVED, []);
  if (Array.isArray(saved) && saved.length) return saved;

  // Migração da versão anterior (chave/cache antigos), se existir.
  const legado = read('noticias_salvas', []);
  if (Array.isArray(legado) && legado.length) {
    const migrado = legado.map((n) => ({ ...n, savedAt: n.savedAt || Date.now() }));
    write(K_SAVED, migrado);
    try { localStorage.removeItem('noticias_salvas'); } catch { /* ignore */ }
    return migrado;
  }
  return [];
}

export function setSaved(list) {
  write(K_SAVED, list);
}

export function isSaved(list, link) {
  return list.some((n) => n.link === link);
}

// Alterna uma notícia na lista de salvas (retorna a nova lista).
export function toggleSaved(list, noticia) {
  if (isSaved(list, noticia.link)) {
    return list.filter((n) => n.link !== noticia.link);
  }
  return [{ ...noticia, savedAt: Date.now() }, ...list];
}

// ---- Cache da última busca ----
export function getCache() {
  return read(K_CACHE, null);
}

export function setCache(noticias, meta = {}) {
  write(K_CACHE, { noticias, meta, ts: Date.now() });
}

export function clearCache() {
  try { localStorage.removeItem(K_CACHE); } catch { /* ignore */ }
}
