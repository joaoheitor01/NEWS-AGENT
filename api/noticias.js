// api/noticias.js
// -----------------------------------------------------------------------------
// Endpoint principal. Coleta feeds, seleciona candidatos relevantes e cura com
// IA (OpenRouter) quando disponível — caso contrário usa curadoria heurística.
// Aceita POST { topic } e também GET ?topic= para facilitar testes/cache.
// -----------------------------------------------------------------------------
const { coletarItens, selecionarCandidatos, curadoriaHeuristica } = require('./_lib/curate');
const { curadoriaIA, getApiKey } = require('./_lib/openrouter');
const { TOPICS } = require('./_lib/feeds');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  // Tópico via body (POST) ou query (GET). Valida contra os tópicos conhecidos.
  let topic = req.method === 'POST' ? req.body?.topic : req.query?.topic;
  if (topic && !TOPICS[topic]) topic = null;

  try {
    console.log(`[noticias] coletando feeds (topic=${topic || 'todos'})`);
    const { itens, feedsOk, totalFeeds, fontesUsadas } = await coletarItens();

    if (itens.length === 0) {
      return res.status(200).json({
        noticias: [],
        aviso: 'Nenhum feed disponível no momento',
        geradoEm: new Date().toISOString(),
        topicFilter: topic || 'todos',
      });
    }

    const candidatos = selecionarCandidatos(itens, topic, 40);
    console.log(`[noticias] feeds ${feedsOk}/${totalFeeds}, itens ${itens.length}, candidatos ${candidatos.length}`);

    const apiKey = getApiKey();
    let noticias;
    let briefing = null;
    let curadoEm = 'heuristica';
    let iaErro = null;

    if (apiKey) {
      try {
        // Rede de segurança: limite de tempo total para a IA. Se estourar, cai na
        // heurística e retorna rápido — garante que a função nunca dê timeout (504).
        const guarda = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('tempo limite da IA')), 45000)
        );
        const r = await Promise.race([curadoriaIA(apiKey, candidatos), guarda]);
        noticias = r.noticias;
        briefing = r.briefing;
        curadoEm = 'ia';
      } catch (err) {
        iaErro = err.message;
        console.error('[noticias] IA falhou, usando heurística:', err.message);
        noticias = curadoriaHeuristica(candidatos);
      }
    } else {
      noticias = curadoriaHeuristica(candidatos);
    }

    // Cache de borda: serve rápido e revalida em background.
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=1800');

    return res.status(200).json({
      noticias,
      briefing,
      geradoEm: new Date().toISOString(),
      totalFontes: feedsOk,
      totalFeeds,
      fontes: fontesUsadas,
      totalItensAnalisados: candidatos.length,
      topicFilter: topic || 'todos',
      curadoria: curadoEm,
      _diag: { temChave: !!apiKey, iaErro: iaErro ? String(iaErro).slice(0, 200) : null },
    });
  } catch (error) {
    console.error('[noticias] erro crítico:', error.message);
    return res.status(500).json({ erro: 'Erro interno no servidor', detalhe: error.message });
  }
};
