// api/cron.js
const Parser = require('rss-parser');

const FEEDS = [
  { url: 'https://canaltech.com.br/rss/',              nome: 'Canaltech'         },
  { url: 'https://olhardigital.com.br/feed/',           nome: 'Olhar Digital'     },
  { url: 'https://tecnoblog.net/feed/',                 nome: 'Tecnoblog'         },
  { url: 'https://www.tabnews.com.br/recentes/rss',     nome: 'TabNews'           },
  { url: 'https://diolinux.com.br/feed',                nome: 'Diolinux'          },
  { url: 'https://www.infomoney.com.br/feed/',          nome: 'InfoMoney'         },
  { url: 'https://www.theverge.com/rss/index.xml',      nome: 'The Verge'         },
  { url: 'https://feeds.feedburner.com/TechCrunch',     nome: 'TechCrunch'        },
];

module.exports = async function handler(req, res) {
  try {
    const parser = new Parser({ timeout: 8000 });

    const feedResults = await Promise.allSettled(
      FEEDS.map(f => parser.parseURL(f.url).then(feed => ({ feed, fonte: f.nome })))
    );

    const todosItens = [];
    for (const result of feedResults) {
      if (result.status === 'fulfilled') {
        const { feed, fonte } = result.value;
        feed.items.slice(0, 10).forEach(item => {
          todosItens.push({ titulo: item.title, link: item.link, fonte });
        });
      }
    }

    if (todosItens.length === 0) throw new Error('Nenhum feed disponível');

    const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://project-o0ekx.vercel.app',
        'X-Title': 'Tech News Agent Cron'
      },
      body: JSON.stringify({
        model: 'openrouter/auto',
        max_tokens: 600,
        messages: [{
          role: 'user',
          content: `Você é um curador tech com foco no Brasil. Escolha A notícia mais importante desta lista para um desenvolvedor brasileiro começar o dia.

Priorize: IA, desenvolvimento, open-source, hardware, segurança, mercado tech BR.
Prefira fontes brasileiras quando a notícia for igualmente relevante.

Lista: ${JSON.stringify(todosItens.slice(0, 25))}

Retorne APENAS um JSON com: "titulo" (em português), "resumo" (2 frases em português direto), "link" (original), "fonte". Sem texto extra, sem crases.`
        }]
      })
    });

    const aiData = await aiResponse.json();
    const textoBruto = aiData?.choices?.[0]?.message?.content || '';
    const match = textoBruto.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('IA não retornou JSON válido');

    const noticia = JSON.parse(match[0]);

    // Envia notificação via ntfy
    await fetch('https://ntfy.sh/aion_news_jh_2026', {
      method: 'POST',
      body: noticia.resumo,
      headers: {
        'Title': noticia.titulo,
        'Tags': 'robot,newspaper',
        'Click': noticia.link,
        'Priority': 'default'
      }
    });

    res.status(200).json({ status: 'ok', noticia });

  } catch (error) {
    console.error('Cron erro:', error);
    res.status(500).json({ erro: error.message });
  }
};
