// api/cron.js
// -----------------------------------------------------------------------------
// Job diário: escolhe a notícia mais relevante do dia e envia push via ntfy.sh.
// Usa as mesmas libs do endpoint principal (fonte única de verdade).
// -----------------------------------------------------------------------------
const { coletarItens, selecionarCandidatos, curadoriaHeuristica } = require('./_lib/curate');
const { chamarOpenRouter, getApiKey } = require('./_lib/openrouter');

const NTFY_TOPIC = process.env.NTFY_TOPIC || 'aion_news_jh_2026';

module.exports = async function handler(req, res) {
  // Proteção: se CRON_SECRET estiver definido, exige o header Authorization.
  // A Vercel envia "Authorization: Bearer <CRON_SECRET>" automaticamente nos crons.
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && req.headers.authorization !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ erro: 'Não autorizado' });
  }

  try {
    const { itens } = await coletarItens({ porFeed: 10 });
    if (itens.length === 0) throw new Error('Nenhum feed disponível');

    const candidatos = selecionarCandidatos(itens, null, 25);

    // Escolhe a melhor notícia: IA se houver chave, senão a de maior score.
    let noticia;
    const apiKey = getApiKey();

    if (apiKey) {
      try {
        const texto = await chamarOpenRouter(apiKey, {
          maxTokens: 600,
          messages: [{
            role: 'user',
            content: `Você é um curador tech com foco no Brasil. Escolha A notícia mais importante desta lista para um desenvolvedor brasileiro começar o dia. Priorize IA, desenvolvimento, open-source, hardware, segurança e mercado tech BR; prefira fontes brasileiras quando igualmente relevantes.

Lista: ${JSON.stringify(candidatos.slice(0, 25).map((c) => ({ titulo: c.titulo, resumo: c.resumoOriginal, link: c.link, fonte: c.fonte })))}

Retorne APENAS um JSON com "titulo" (português), "resumo" (2 frases em português direto), "link" (original) e "fonte". Sem texto extra, sem crases.`,
          }],
        });
        const match = texto.match(/\{[\s\S]*\}/);
        if (match) noticia = JSON.parse(match[0]);
      } catch (err) {
        console.error('[cron] IA falhou, usando heurística:', err.message);
      }
    }

    if (!noticia) {
      noticia = curadoriaHeuristica(candidatos, 1)[0];
    }

    await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
      method: 'POST',
      body: noticia.resumo,
      headers: {
        Title: noticia.titulo,
        Tags: 'robot,newspaper',
        Click: noticia.link,
        Priority: 'default',
      },
    });

    return res.status(200).json({ status: 'ok', noticia });
  } catch (error) {
    console.error('[cron] erro:', error.message);
    return res.status(500).json({ erro: error.message });
  }
};
