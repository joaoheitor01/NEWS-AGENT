// api/_lib/openrouter.js
// -----------------------------------------------------------------------------
// Wrapper opcional do OpenRouter. Se não houver OPENROUTER_API_KEY, o chamador
// deve usar a curadoria heurística. Modelo configurável via OPENROUTER_MODEL.
// -----------------------------------------------------------------------------
const { detectarTopico } = require('./curate');

const MODEL = process.env.OPENROUTER_MODEL || 'openrouter/auto';
const REFERER = process.env.SITE_URL || 'https://tech-news-agent.vercel.app';

async function chamarOpenRouter(apiKey, { messages, maxTokens = 3000, temperature = 0.4 }) {
  const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': REFERER,
      'X-Title': 'Tech News Agent',
    },
    body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, temperature, messages }),
  });

  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`OpenRouter ${resp.status}: ${txt.slice(0, 300)}`);
  }

  const data = await resp.json();
  return data?.choices?.[0]?.message?.content || '';
}

// Cura entre 15 e 21 notícias usando a IA. Lança erro se falhar (chamador faz fallback).
async function curadoriaIA(apiKey, candidatos) {
  const prompt = `Você é um curador de notícias de tecnologia com foco no Brasil.
Analise a lista de notícias coletadas de portais brasileiros e internacionais e selecione
entre 15 e 21 das MAIS IMPORTANTES, RECENTES e DIVERSIFICADAS.

Prioridade:
1. Portais brasileiros (Canaltech, Olhar Digital, Tecnoblog, TecMundo, Diolinux, TabNews).
2. Notícias internacionais que impactam o mercado brasileiro de tecnologia.

Temas: IA, desenvolvimento de software, hardware, semicondutores, cibersegurança, web3/cripto,
mercado e startups. DIVERSIFIQUE temas e fontes — não repita o mesmo assunto.

Lista disponível (JSON):
${JSON.stringify(candidatos.map((c) => ({
  titulo: c.titulo,
  resumo: c.resumoOriginal,
  fonte: c.fonte,
  link: c.link,
  imagem: c.imagem,
  pais: c.pais,
  data: c.data,
})), null, 1)}

Retorne APENAS um array JSON válido (sem markdown, sem crases, sem texto) com 15 a 21 objetos:
- "titulo": título claro em português
- "resumo": 2 frases explicando o que aconteceu e por que importa
- "fonte": nome do veículo (exatamente como na lista)
- "link": URL original SEM alteração
- "imagem": a URL de imagem da lista, ou null
- "empresa": empresa/projeto principal, ou o nome da fonte
- "impacto": "alto", "médio" ou "baixo"
- "pais": "BR" ou "US"
- "topico": um de ["ia","dev","hardware","chips","cyber","web3","mercado"]`;

  const texto = await chamarOpenRouter(apiKey, {
    messages: [{ role: 'user', content: prompt }],
    maxTokens: 4000,
  });

  const match = texto.match(/\[[\s\S]*\]/);
  if (!match) throw new Error('IA não retornou array JSON');

  let noticias = JSON.parse(match[0]);
  if (!Array.isArray(noticias)) noticias = [noticias];

  // Sanitiza e completa campos faltantes a partir dos candidatos originais.
  const porLink = new Map(candidatos.map((c) => [(c.link || '').split('?')[0], c]));
  return noticias.slice(0, 21).map((n) => {
    const orig = porLink.get((n.link || '').split('?')[0]) || {};
    return {
      titulo: n.titulo || orig.titulo || '',
      resumo: n.resumo || '',
      fonte: n.fonte || orig.fonte || 'Tech',
      link: n.link || orig.link || '',
      imagem: n.imagem || orig.imagem || null,
      empresa: n.empresa || n.fonte || orig.fonte || 'Tech',
      impacto: ['alto', 'médio', 'baixo'].includes(n.impacto) ? n.impacto : 'médio',
      pais: n.pais || orig.pais || 'BR',
      topico: n.topico || detectarTopico({ titulo: n.titulo, resumo: n.resumo }),
      data: orig.data || '',
    };
  });
}

module.exports = { curadoriaIA, chamarOpenRouter, MODEL };
