// api/_lib/curate.js
// -----------------------------------------------------------------------------
// Coleta de feeds, extração de imagem, pontuação de relevância, deduplicação e
// curadoria heurística (funciona SEM IA). Usado por noticias.js e cron.js.
// -----------------------------------------------------------------------------
const Parser = require('rss-parser');
const { FEEDS, TOPICS, ALL_KEYWORDS } = require('./feeds');

const parser = new Parser({
  timeout: 12000,
  headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TechNewsAgent/2.0)' },
  customFields: {
    item: [
      ['media:content', 'mediaContent', { keepArray: true }],
      ['media:thumbnail', 'mediaThumbnail', { keepArray: true }],
      ['content:encoded', 'contentEncoded'],
    ],
  },
});

// Extrai a melhor imagem possível de um item RSS (enclosure, media:*, ou <img>).
function extrairImagem(item) {
  if (item.enclosure?.url && /^https?:\/\//.test(item.enclosure.url)) return item.enclosure.url;

  const media = item.mediaContent?.[0]?.$?.url || item.mediaThumbnail?.[0]?.$?.url;
  if (media && /^https?:\/\//.test(media)) return media;

  const html = item.contentEncoded || item['content:encoded'] || item.content || '';
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (match && /^https?:\/\//.test(match[1])) return match[1];

  return null;
}

function limparTexto(html = '') {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Coleta itens de todos os feeds em paralelo, com tolerância a falhas por feed.
async function coletarItens({ porFeed = 12 } = {}) {
  const resultados = await Promise.allSettled(
    FEEDS.map(async (f) => {
      const feed = await parser.parseURL(f.url);
      return { feed, fonte: f };
    })
  );

  const itens = [];
  let feedsOk = 0;
  const fontesUsadas = [];

  for (const r of resultados) {
    if (r.status !== 'fulfilled') continue;
    feedsOk++;
    const { feed, fonte } = r.value;
    fontesUsadas.push(fonte.nome);
    (feed.items || []).slice(0, porFeed).forEach((item) => {
      const resumo = limparTexto(item.contentSnippet || item.summary || item.content || '');
      const link = /^https?:\/\//i.test(item.link || '') ? item.link : '';
      itens.push({
        titulo: limparTexto(item.title || ''),
        link,
        resumoOriginal: resumo.slice(0, 500),
        fonte: fonte.nome,
        pais: fonte.pais,
        peso: fonte.peso || 1,
        imagem: extrairImagem(item),
        data: item.isoDate || item.pubDate || '',
        timestamp: item.isoDate || item.pubDate ? new Date(item.isoDate || item.pubDate).getTime() : 0,
      });
    });
  }

  return { itens, feedsOk, totalFeeds: FEEDS.length, fontesUsadas };
}

// Pontua relevância: nº de keywords + peso da fonte + bônus de recência.
function pontuar(item, topico = null) {
  const texto = `${item.titulo} ${item.resumoOriginal}`.toLowerCase();
  const keywords = topico && TOPICS[topico] ? TOPICS[topico].keywords : ALL_KEYWORDS;

  let hits = 0;
  for (const k of keywords) if (texto.includes(k)) hits++;
  if (topico && hits === 0) return 0; // num tópico específico, exige ao menos 1 match

  const recencia = item.timestamp ? Math.max(0, 1 - (Date.now() - item.timestamp) / (1000 * 60 * 60 * 72)) : 0;
  return hits * 3 + item.peso + recencia * 2;
}

// Remove duplicatas por link e por título muito parecido (sobreposição de tokens).
function deduplicar(itens) {
  const vistosLink = new Set();
  const aceitos = [];

  const tokensDe = (t) =>
    new Set(
      t.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter((w) => w.length > 3)
    );

  for (const item of itens) {
    const linkKey = (item.link || '').split('?')[0];
    if (linkKey && vistosLink.has(linkKey)) continue;

    const tokens = tokensDe(item.titulo);
    let duplicado = false;
    for (const a of aceitos) {
      const inter = [...tokens].filter((w) => a._tokens.has(w)).length;
      const uniao = new Set([...tokens, ...a._tokens]).size || 1;
      if (inter / uniao > 0.6) {
        duplicado = true;
        break;
      }
    }
    if (duplicado) continue;

    if (linkKey) vistosLink.add(linkKey);
    aceitos.push({ ...item, _tokens: tokens });
  }

  // Remove o campo auxiliar _tokens antes de retornar.
  return aceitos.map((item) => {
    const copia = { ...item };
    delete copia._tokens;
    return copia;
  });
}

// Seleciona e ordena candidatos relevantes para um tópico (ou todos).
function selecionarCandidatos(itens, topico = null, limite = 40) {
  const comScore = itens
    .map((item) => ({ item, score: pontuar(item, topico) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.item);

  const base = comScore.length > 0 ? comScore : [...itens].sort((a, b) => b.timestamp - a.timestamp);
  return deduplicar(base).slice(0, limite);
}

// Detecta o tópico de uma notícia (para colorir/agrupar no frontend).
function detectarTopico(item) {
  const texto = `${item.titulo} ${item.resumoOriginal || item.resumo || ''}`.toLowerCase();
  let melhor = null;
  let melhorHits = 0;
  for (const [chave, t] of Object.entries(TOPICS)) {
    const hits = t.keywords.reduce((acc, k) => acc + (texto.includes(k) ? 1 : 0), 0);
    if (hits > melhorHits) {
      melhorHits = hits;
      melhor = chave;
    }
  }
  return melhor || 'ia';
}

// Curadoria heurística (sem IA): formata candidatos no formato final da API.
function curadoriaHeuristica(candidatos, limite = 21) {
  return candidatos.slice(0, limite).map((item) => ({
    titulo: item.titulo,
    resumo: item.resumoOriginal ? `${item.resumoOriginal.slice(0, 220)}${item.resumoOriginal.length > 220 ? '…' : ''}` : '',
    fonte: item.fonte,
    link: item.link,
    imagem: item.imagem || null,
    empresa: item.fonte,
    impacto: item.peso >= 3 ? 'alto' : item.peso === 2 ? 'médio' : 'baixo',
    pais: item.pais,
    topico: detectarTopico(item),
    data: item.data,
  }));
}

module.exports = {
  coletarItens,
  selecionarCandidatos,
  curadoriaHeuristica,
  detectarTopico,
  extrairImagem,
  limparTexto,
};
