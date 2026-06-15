// src/lib/topics.js
// -----------------------------------------------------------------------------
// Metadados de exibição dos tópicos. As CHAVES devem casar com as de
// `api/_lib/feeds.js` (backend), que guarda as palavras-chave de cada tópico.
// Visual editorial: sem cores por tópico — apenas rótulos (estilo seções de jornal).
// -----------------------------------------------------------------------------

export const TOPICS = {
  ia:       { label: 'IA',        long: 'Inteligência Artificial' },
  ciencia:  { label: 'Ciência',   long: 'Ciência e Pesquisa' },
  dev:      { label: 'Dev',       long: 'Desenvolvimento' },
  hardware: { label: 'Hardware',  long: 'Hardware' },
  chips:    { label: 'Chips',     long: 'Semicondutores' },
  cyber:    { label: 'Segurança', long: 'Cibersegurança' },
  web3:     { label: 'Web3',      long: 'Web3 e Cripto' },
  mercado:  { label: 'Mercado',   long: 'Mercado e Startups' },
};

export const TOPIC_KEYS = Object.keys(TOPICS);

export function topicMeta(key) {
  return TOPICS[key] || { label: 'Tech', long: 'Tecnologia' };
}
