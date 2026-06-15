// api/_lib/openrouter.js
// -----------------------------------------------------------------------------
// Wrapper opcional do OpenRouter. Se não houver OPENROUTER_API_KEY, o chamador
// deve usar a curadoria heurística. Modelo configurável via OPENROUTER_MODEL.
// -----------------------------------------------------------------------------
const { detectarTopico } = require('./curate');

const REFERER = process.env.SITE_URL || 'https://tech-news-agent.vercel.app';

// Modelos GRATUITOS do OpenRouter (não consomem créditos). Usados como fallback
// para contas sem saldo. São tentados em ordem até um responder.
const FREE_FALLBACKS = [
  'deepseek/deepseek-chat-v3-0324:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'google/gemini-2.0-flash-exp:free',
  'mistralai/mistral-small-3.1-24b-instruct:free',
];

// Ordem de tentativa: modelo escolhido (se houver) → gratuitos → auto (pago).
function modelos() {
  const escolhido = process.env.OPENROUTER_MODEL;
  return [...(escolhido ? [escolhido] : []), ...FREE_FALLBACKS, 'openrouter/auto'];
}

const MODEL = process.env.OPENROUTER_MODEL || FREE_FALLBACKS[0];

// Lê a chave aceitando variações de nome (tolera o typo comum "OPENROUT_API_KEY").
function getApiKey() {
  return (
    process.env.OPENROUTER_API_KEY ||
    process.env.OPENROUT_API_KEY ||
    process.env.OPEN_ROUTER_API_KEY ||
    ''
  );
}

// Chama o OpenRouter tentando uma lista de modelos até um funcionar.
async function chamarOpenRouter(apiKey, { messages, maxTokens = 3000, temperature = 0.4 }) {
  let ultimoErro = 'sem modelos';
  for (const model of modelos()) {
    try {
      const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': REFERER,
          'X-Title': 'Tech News Agent',
        },
        body: JSON.stringify({ model, max_tokens: maxTokens, temperature, messages }),
      });

      if (!resp.ok) {
        ultimoErro = `${model} -> ${resp.status}: ${(await resp.text()).slice(0, 120)}`;
        continue; // tenta o próximo modelo (ex.: 402 sem créditos, 404 modelo indisponível)
      }

      const data = await resp.json();
      const content = data?.choices?.[0]?.message?.content || '';
      if (content) return content;
      ultimoErro = `${model} -> resposta vazia`;
    } catch (e) {
      ultimoErro = `${model} -> ${e.message}`;
    }
  }
  throw new Error(`OpenRouter falhou: ${ultimoErro}`);
}

// Cura as notícias com IA no estilo "briefing editorial":
// - um panorama do dia (briefing)
// - por matéria: emoji, resumo, e bullets "Por dentro da notícia"
// Retorna { briefing, noticias }. Lança erro se falhar (chamador faz fallback).
async function curadoriaIA(apiKey, candidatos) {
  const prompt = `Você é o curador-chefe de um jornal digital de tecnologia com foco no Brasil.
Seu método: (1) priorize fatos REAIS e RECENTES (não hype); (2) cruze e valide as fontes;
(3) escreva em português com foco no IMPACTO PRÁTICO para quem trabalha com tecnologia.

A partir da lista abaixo, selecione de 12 a 16 notícias mais importantes e DIVERSIFICADAS
(temas e fontes variados; priorize portais BR e fontes primárias como OpenAI, Anthropic,
Google DeepMind, universidades).

Lista (JSON):
${JSON.stringify(candidatos.slice(0, 28).map((c) => ({
  titulo: c.titulo,
  resumo: (c.resumoOriginal || '').slice(0, 180),
  fonte: c.fonte,
  link: c.link,
  imagem: c.imagem,
  pais: c.pais,
})), null, 0)}

Retorne APENAS um objeto JSON válido (sem markdown, sem crases, sem texto fora do JSON):
{
  "briefing": "1 a 2 parágrafos curtos, em português, com o PANORAMA do dia: o que mais importa agora e por quê. Tom editorial e direto.",
  "noticias": [
    {
      "emoji": "um emoji que combine com a notícia (ex.: ⚖️ 🤖 💾 🔒 🚀 🧠)",
      "titulo": "título claro em português",
      "resumo": "2 a 3 frases: o que aconteceu e por que importa",
      "pontos": [
        { "rotulo": "O fato principal", "texto": "1 frase" },
        { "rotulo": "Desdobramentos técnicos", "texto": "1 frase" },
        { "rotulo": "Por que importa", "texto": "1 frase" }
      ],
      "fonte": "nome do veículo, exatamente como na lista",
      "link": "URL original SEM alteração",
      "imagem": "a URL de imagem da lista, ou null",
      "empresa": "empresa/projeto principal, ou o nome da fonte",
      "impacto": "alto, médio ou baixo",
      "pais": "BR ou US",
      "topico": "um de [ia, ciencia, dev, hardware, chips, cyber, web3, mercado]"
    }
  ]
}`;

  const texto = await chamarOpenRouter(apiKey, {
    messages: [{ role: 'user', content: prompt }],
    maxTokens: 4000,
  });

  const match = texto.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('IA não retornou objeto JSON');

  const obj = JSON.parse(match[0]);
  let noticias = Array.isArray(obj.noticias) ? obj.noticias : Array.isArray(obj) ? obj : [];
  if (noticias.length === 0) throw new Error('IA não retornou notícias');

  // Sanitiza e completa campos a partir dos candidatos originais.
  const porLink = new Map(candidatos.map((c) => [(c.link || '').split('?')[0], c]));
  const limpa = noticias.slice(0, 21).map((n) => {
    const orig = porLink.get((n.link || '').split('?')[0]) || {};
    const pontos = Array.isArray(n.pontos)
      ? n.pontos
          .filter((p) => p && (p.texto || p.rotulo))
          .slice(0, 4)
          .map((p) => ({ rotulo: String(p.rotulo || '').slice(0, 60), texto: String(p.texto || '').slice(0, 300) }))
      : [];
    return {
      emoji: typeof n.emoji === 'string' ? n.emoji.slice(0, 4) : '',
      titulo: n.titulo || orig.titulo || '',
      resumo: n.resumo || '',
      pontos,
      fonte: n.fonte || orig.fonte || 'Tech',
      link: /^https?:\/\//i.test(n.link || '') ? n.link : (orig.link || ''),
      imagem: n.imagem || orig.imagem || null,
      empresa: n.empresa || n.fonte || orig.fonte || 'Tech',
      impacto: ['alto', 'médio', 'baixo'].includes(n.impacto) ? n.impacto : 'médio',
      pais: n.pais || orig.pais || 'BR',
      topico: n.topico || detectarTopico({ titulo: n.titulo, resumo: n.resumo }),
      data: orig.data || '',
    };
  });

  const briefing = typeof obj.briefing === 'string' && obj.briefing.trim() ? obj.briefing.trim() : null;
  return { briefing, noticias: limpa };
}

module.exports = { curadoriaIA, chamarOpenRouter, getApiKey, MODEL };
