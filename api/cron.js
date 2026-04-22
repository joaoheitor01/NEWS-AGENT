// api/cron.js
const Parser = require('rss-parser');

module.exports = async function handler(req, res) {
  try {
    console.log("▶ Cron iniciado");

    const parser = new Parser();
    const feed = await parser.parseURL('https://www.theverge.com/rss/index.xml');

    const ultimasNoticias = feed.items.slice(0, 15).map(item => ({
      titulo: item.title,
      link: item.link
    }));

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash:free",
        messages: [{
          role: "user",
          content: `Aja como um curador tech. Escolha a notícia mais relevante sobre IA ou tecnologia nesta lista: ${JSON.stringify(ultimasNoticias)}. Retorne APENAS um JSON com os campos: "titulo" (traduzido para português), "resumo" (2 frases em português) e "link" (original). Sem texto extra.`
        }]
      })
    });

    const aiData = await response.json();
    const textoBruto = aiData.choices[0].message.content;

    const match = textoBruto.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("IA não retornou JSON válido");

    const noticia = JSON.parse(match[0]);

    const ntfyResponse = await fetch("https://ntfy.sh/aion_news_jh_2026", {
      method: "POST",
      body: noticia.resumo,
      headers: {
        "Title": noticia.titulo,
        "Tags": "robot,newspaper",
        "Click": noticia.link,
        "Priority": "default"
      }
    });

    if (!ntfyResponse.ok) throw new Error(`ntfy falhou: ${ntfyResponse.statusText}`);

    res.status(200).json({ status: "ok", noticia });

  } catch (error) {
    console.error("✗ Erro no cron:", error);
    res.status(500).json({ erro: error.message });
  }
};
