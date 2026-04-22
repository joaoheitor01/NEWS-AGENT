// api/noticias.js
const Parser = require('rss-parser');

// Múltiplas fontes RSS para variedade
const FEEDS = [
  { url: 'https://www.theverge.com/rss/index.xml',         nome: 'The Verge' },
  { url: 'https://feeds.feedburner.com/TechCrunch',        nome: 'TechCrunch' },
  { url: 'https://www.wired.com/feed/rss',                 nome: 'Wired' },
  { url: 'https://olhardigital.com.br/feed/',              nome: 'Olhar Digital' },
  { url: 'https://canaltech.com.br/rss/',                  nome: 'Canaltech' },
];

// Palavras-chave que definem o conteúdo relevante
const KEYWORDS = [
  'ai', 'artificial intelligence', 'inteligência artificial',
  'google', 'microsoft', 'openai', 'anthropic', 'meta ai',
  'gemini', 'copilot', 'gpt', 'claude', 'llm',
  'github', 'apple intelligence', 'chatgpt', 'machine learning',
  'neural', 'automation', 'robot', 'tech', 'startup'
];

function isRelevant(item) {
  const text = ((item.titulo || '') + ' ' + (item.resumoOriginal || '')).toLowerCase();
  return KEYWORDS.some(k => text.includes(k));
}

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido' });

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return res.status(500).json({ erro: 'OPENROUTER_API_KEY não configurada' });

  try {
    const parser = new Parser({ timeout: 8000 });

    // Coleta itens de todos os feeds em paralelo (com fallback por feed)
    const feedResults = await Promise.allSettled(
      FEEDS.map(f => parser.parseURL(f.url).then(feed => ({ feed, fonte: f.nome })))
    );

    const todosItens = [];
    for (const result of feedResults) {
      if (result.status === 'fulfilled') {
        const { feed, fonte } = result.value;
        const itens = feed.items.slice(0, 10).map(item => ({
          titulo: item.title || '',
          link: item.link || '',
          resumoOriginal: item.contentSnippet || item.summary || '',
          fonte,
          data: item.pubDate || ''
        }));
        todosItens.push(...itens);
      }
    }

    if (todosItens.length === 0) {
      return res.status(200).json({ noticias: [], aviso: 'Nenhum feed disponível no momento' });
    }

    // Filtra por relevância
    const relevantes = todosItens.filter(isRelevant).slice(0, 20);
    const candidatos = relevantes.length > 0 ? relevantes : todosItens.slice(0, 20);

    // Chama IA para selecionar e resumir as 5 melhores
    const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://project-o0ekx.vercel.app',
        'X-Title': 'Tech News Agent'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash:free',
        max_tokens: 1500,
        messages: [{
          role: 'user',
          content: `Você é um curador de notícias tech. Analise esta lista e selecione as 5 notícias MAIS IMPORTANTES sobre IA, tecnologia, Google, Microsoft, Anthropic, OpenAI, GitHub, Meta, Apple.

Lista:
${JSON.stringify(candidatos, null, 2)}

Retorne APENAS um array JSON válido com exatamente 5 objetos, cada um com:
- "titulo": título traduzido para português
- "resumo": 2 frases explicando o que aconteceu e por que importa
- "fonte": nome do veículo
- "link": URL original sem alteração
- "empresa": empresa principal (ex: Google, Microsoft, Anthropic)
- "impacto": "alto", "médio" ou "curto"

Retorne SOMENTE o array JSON. Sem texto, sem markdown, sem crases.`
        }]
      })
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error('OpenRouter erro:', aiResponse.status, errText);
      return res.status(502).json({ erro: `OpenRouter retornou ${aiResponse.status}`, detalhe: errText });
    }

    const aiData = await aiResponse.json();
    const textoBruto = aiData?.choices?.[0]?.message?.content || '';

    // Parse robusto — aceita array direto ou dentro de objeto
    const matchArray = textoBruto.match(/\[[\s\S]*\]/);
    if (!matchArray) {
      console.error('IA não retornou array JSON. Resposta:', textoBruto);
      return res.status(500).json({ erro: 'IA não retornou formato esperado', raw: textoBruto });
    }

    const noticias = JSON.parse(matchArray[0]);

    // Timestamp da busca
    const resultado = {
      noticias,
      geradoEm: new Date().toISOString(),
      totalFontes: FEEDS.length,
      totalItensAnalisados: candidatos.length
    };

    return res.status(200).json(resultado);

  } catch (error) {
    console.error('Erro crítico:', error);
    return res.status(500).json({ erro: 'Erro interno', detalhe: error.message });
  }
};
