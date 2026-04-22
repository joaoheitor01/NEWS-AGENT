// api/noticias.js
const Parser = require('rss-parser');

// Múltiplas fontes RSS com foco Brasil
const FEEDS = [
  // === BRASIL — Notícias diárias ===
  { url: 'https://canaltech.com.br/rss/',                          nome: 'Canaltech',        pais: 'BR' },
  { url: 'https://olhardigital.com.br/feed/',                      nome: 'Olhar Digital',    pais: 'BR' },
  { url: 'https://www.tecmundo.com.br/feed',                       nome: 'TecMundo',         pais: 'BR' },
  { url: 'https://tecnoblog.net/feed/',                            nome: 'Tecnoblog',        pais: 'BR' },
  { url: 'https://www.showmetech.com.br/feed/',                    nome: 'Show Me Tech',     pais: 'BR' },

  // === BRASIL — Hardware e Infraestrutura ===
  { url: 'https://www.clubedohardware.com.br/rss/1-noticias/',     nome: 'Clube do Hardware',pais: 'BR' },
  { url: 'https://diolinux.com.br/feed',                           nome: 'Diolinux',         pais: 'BR' },

  // === BRASIL — Desenvolvimento e Engenharia ===
  { url: 'https://www.tabnews.com.br/recentes/rss',                nome: 'TabNews',          pais: 'BR' },
  { url: 'https://codigofonte.com.br/feed',                        nome: 'Código Fonte TV',  pais: 'BR' },

  // === BRASIL — Mercado e Negócios Tech ===
  { url: 'https://exame.com/tecnologia/feed/',                     nome: 'Exame Tecnologia', pais: 'BR' },
  { url: 'https://www.infomoney.com.br/feed/',                     nome: 'InfoMoney',        pais: 'BR' },

  // === INTERNACIONAL — Referências globais ===
  { url: 'https://www.theverge.com/rss/index.xml',                 nome: 'The Verge',        pais: 'US' },
  { url: 'https://feeds.feedburner.com/TechCrunch',                nome: 'TechCrunch',       pais: 'US' },
  { url: 'https://www.wired.com/feed/rss',                         nome: 'Wired',            pais: 'US' },
];

// Palavras-chave que definem o conteúdo relevante
const KEYWORDS = [
  // IA e modelos
  'inteligência artificial', 'ia ', ' ia,', 'ai ', 'artificial intelligence',
  'llm', 'gpt', 'gemini', 'claude', 'copilot', 'machine learning',
  'deep learning', 'neural', 'chatgpt', 'openai', 'anthropic',

  // Empresas globais
  'google', 'microsoft', 'meta', 'apple', 'amazon', 'nvidia',
  'samsung', 'intel', 'qualcomm',

  // Empresas e mercado BR
  'github', 'startup', 'nubank', 'ifood', 'totvs',
  'mercado livre', 'magalu', 'b3', 'fintec', 'fintech',

  // Dev e infra
  'react', 'typescript', 'python', 'django', 'node', 'kubernetes',
  'docker', 'linux', 'open source', 'open-source', 'kernel',
  'ubuntu', 'fedora', 'distribuição', 'framework', 'api',

  // Hardware
  'processador', 'gpu', 'placa de vídeo', 'memória ram', 'ssd',
  'benchmark', 'ryzen', 'geforce', 'radeon',

  // Segurança
  'cibersegurança', 'ransomware', 'vazamento', 'hack', 'segurança digital',

  // Geral tech
  'tecnologia', 'tech', 'software', 'hardware', 'automação',
  'nuvem', 'cloud', 'dados', 'blockchain', '5g', 'iot'
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
  if (!apiKey) {
    console.error('OPENROUTER_API_KEY não encontrada');
    return res.status(500).json({ erro: 'API Key não configurada' });
  }

  try {
    console.log('[NOTICIAS] Iniciando busca de feeds...');
    
    const parser = new Parser({ timeout: 12000 });

    // Coleta itens de todos os feeds em paralelo (com fallback por feed)
    const feedResults = await Promise.allSettled(
      FEEDS.map(f => 
        parser.parseURL(f.url)
          .then(feed => {
            console.log(`[NOTICIAS] Feed "${f.nome}" OK: ${feed.items.length} itens`);
            return { feed, fonte: f.nome };
          })
          .catch(err => {
            console.error(`[NOTICIAS] Erro ao buscar "${f.nome}": ${err.message}`);
            throw err;
          })
      )
    );

    const todosItens = [];
    let feedsOk = 0;

    for (const result of feedResults) {
      if (result.status === 'fulfilled') {
        feedsOk++;
        const { feed, fonte } = result.value;
        const itens = (feed.items || []).slice(0, 10).map(item => ({
          titulo: item.title || '',
          link: item.link || '',
          resumoOriginal: item.contentSnippet || item.summary || '',
          fonte,
          data: item.pubDate || ''
        }));
        todosItens.push(...itens);
      }
    }

    console.log(`[NOTICIAS] Feeds processados: ${feedsOk}/${FEEDS.length}, Total de itens: ${todosItens.length}`);

    if (todosItens.length === 0) {
      console.warn('[NOTICIAS] Nenhum item obtido dos feeds');
      return res.status(200).json({ 
        noticias: [], 
        aviso: 'Nenhum feed disponível no momento',
        geradoEm: new Date().toISOString()
      });
    }

    // Filtra por relevância
    const relevantes = todosItens.filter(isRelevant).slice(0, 20);
    const candidatos = relevantes.length > 0 ? relevantes : todosItens.slice(0, 20);

    console.log(`[NOTICIAS] Candidatos para IA: ${candidatos.length}`);

    // Chama IA para selecionar e resumir as 5 melhores
    console.log('[NOTICIAS] Chamando OpenRouter...');
    
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
        temperature: 0.3,
        messages: [{
          role: 'user',
          content: `Você é um curador de notícias tech com foco no Brasil. Analise esta lista de notícias coletadas de portais brasileiros e internacionais.
Selecione as 5 notícias MAIS IMPORTANTES considerando esta ordem de prioridade:

1. Notícias de portais brasileiros (Canaltech, Olhar Digital, TecMundo, Tecnoblog, Clube do Hardware, Diolinux, TabNews, Código Fonte TV, Exame, InfoMoney)
2. Notícias internacionais que impactam diretamente o mercado brasileiro de tecnologia

Temas prioritários: IA, desenvolvimento de software, hardware, Linux/open-source, segurança digital, mercado tech Brasil, startups brasileiras.

Lista disponível:
${JSON.stringify(candidatos, null, 2)}

Retorne APENAS um array JSON válido com exatamente 5 objetos, cada um com:
- "titulo": título em português claro e direto
- "resumo": 2 frases explicando o que aconteceu e por que importa para o público brasileiro
- "fonte": nome do veículo
- "link": URL original sem nenhuma alteração
- "empresa": empresa ou projeto principal mencionado
- "impacto": "alto", "médio" ou "curto"
- "pais": "BR" se fonte brasileira, "US" se internacional

Retorne SOMENTE o array JSON. Sem texto, sem markdown, sem crases.`
        }]
      })
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error(`[NOTICIAS] OpenRouter erro ${aiResponse.status}:`, errText.substring(0, 500));
      
      // Fallback: retorna os candidatos sem curação da IA
      const fallbackNoticias = candidatos.slice(0, 5).map(item => ({
        titulo: item.titulo,
        resumo: item.resumoOriginal.substring(0, 200),
        fonte: item.fonte,
        link: item.link,
        empresa: 'Tech',
        impacto: 'médio'
      }));

      return res.status(200).json({
        noticias: fallbackNoticias,
        geradoEm: new Date().toISOString(),
        totalFontes: feedsOk,
        totalItensAnalisados: candidatos.length,
        aviso: 'Resultados sem curação por IA (fallback)'
      });
    }

    const aiData = await aiResponse.json();
    const textoBruto = aiData?.choices?.[0]?.message?.content || '';

    console.log('[NOTICIAS] Resposta IA recebida, parseando...');

    // Parse robusto — aceita array direto ou dentro de objeto
    const matchArray = textoBruto.match(/\[[\s\S]*\]/);
    if (!matchArray) {
      console.error('[NOTICIAS] Erro ao parsear JSON. Resposta bruta:', textoBruto.substring(0, 500));
      
      // Fallback novamente
      const fallbackNoticias = candidatos.slice(0, 5).map(item => ({
        titulo: item.titulo,
        resumo: item.resumoOriginal.substring(0, 200),
        fonte: item.fonte,
        link: item.link,
        empresa: 'Tech',
        impacto: 'médio'
      }));

      return res.status(200).json({
        noticias: fallbackNoticias,
        geradoEm: new Date().toISOString(),
        totalFontes: feedsOk,
        totalItensAnalisados: candidatos.length,
        aviso: 'Resultados sem curação por IA (fallback - parse error)'
      });
    }

    let noticias;
    try {
      noticias = JSON.parse(matchArray[0]);
    } catch (parseErr) {
      console.error('[NOTICIAS] JSON.parse falhou:', parseErr.message);
      
      // Fallback final
      const fallbackNoticias = candidatos.slice(0, 5).map(item => ({
        titulo: item.titulo,
        resumo: item.resumoOriginal.substring(0, 200),
        fonte: item.fonte,
        link: item.link,
        empresa: 'Tech',
        impacto: 'médio'
      }));

      return res.status(200).json({
        noticias: fallbackNoticias,
        geradoEm: new Date().toISOString(),
        totalFontes: feedsOk,
        totalItensAnalisados: candidatos.length,
        aviso: 'Resultados sem curação por IA (fallback - JSON error)'
      });
    }

    // Garante que é um array
    if (!Array.isArray(noticias)) {
      noticias = [noticias];
    }

    // Garante máximo de 5
    noticias = noticias.slice(0, 5);

    console.log(`[NOTICIAS] Sucesso! ${noticias.length} notícias retornadas`);

    // Timestamp da busca
    const resultado = {
      noticias,
      geradoEm: new Date().toISOString(),
      totalFontes: feedsOk,
      totalItensAnalisados: candidatos.length
    };

    return res.status(200).json(resultado);

  } catch (error) {
    console.error('[NOTICIAS] Erro crítico:', error.message, error.stack);
    return res.status(500).json({ 
      erro: 'Erro interno no servidor',
      detalhe: error.message 
    });
  }
};
