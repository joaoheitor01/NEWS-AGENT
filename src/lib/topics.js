// src/lib/topics.js
// -----------------------------------------------------------------------------
// Metadados de exibição dos tópicos. As CHAVES devem casar com as de
// `api/_lib/feeds.js` (backend), que guarda as palavras-chave de cada tópico.
// Para adicionar um tópico: adicione aqui (UI) e lá (curadoria).
// -----------------------------------------------------------------------------

export const TOPICS = {
  ia:       { label: 'IA',          long: 'Inteligência Artificial', icon: 'neurology',       color: 'var(--color-topic-ia)' },
  dev:      { label: 'DEV',         long: 'Desenvolvimento',         icon: 'code',            color: 'var(--color-topic-dev)' },
  hardware: { label: 'HARDWARE',    long: 'Hardware',                icon: 'developer_board', color: 'var(--color-topic-hardware)' },
  chips:    { label: 'CHIPS',       long: 'Semicondutores',          icon: 'memory',          color: 'var(--color-topic-chips)' },
  cyber:    { label: 'CYBER',       long: 'Cibersegurança',          icon: 'security',        color: 'var(--color-topic-cyber)' },
  web3:     { label: 'WEB3',        long: 'Web3 e Cripto',           icon: 'currency_bitcoin', color: 'var(--color-topic-web3)' },
  mercado:  { label: 'MERCADO',     long: 'Mercado e Startups',      icon: 'trending_up',     color: 'var(--color-topic-mercado)' },
};

export const TOPIC_KEYS = Object.keys(TOPICS);

export function topicMeta(key) {
  return TOPICS[key] || { label: 'TECH', long: 'Tecnologia', icon: 'sensors', color: 'var(--color-brand)' };
}
