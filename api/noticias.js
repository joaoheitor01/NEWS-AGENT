const RSSParser = require("rss-parser");

module.exports = async function handler(req, res) {
  console.log(">>> [NOTICIAS] Função iniciada. Método:", req.method);

  try {
    if (req.method !== "POST") {
      return res.status(405).json({ erro: "Método não permitido. Use POST." });
    }

    const { topico } = req.body || {};
    console.log(">>> [NOTICIAS] Tópico recebido:", topico);

    if (!topico) {
      return res.status(400).json({ erro: "O campo 'topico' é obrigatório." });
    }

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    if (!OPENROUTER_API_KEY) {
      console.error(">>> [NOTICIAS] OPENROUTER_API_KEY NÃO ENCONTRADA!");
      return res.status(500).json({
        erro: "Falha na matriz",
        detalhe: "Variável OPENROUTER_API_KEY não configurada no ambiente.",
      });
    }
    console.log(">>> [NOTICIAS] API Key encontrada. Primeiros 10 chars:", OPENROUTER_API_KEY.substring(0, 10) + "...");

    // 1. Buscar RSS
    let feedItems = [];
    try {
      console.log(">>> [NOTICIAS] Buscando RSS do The Verge...");
      const parser = new RSSParser({ timeout: 8000 });
      const feed = await parser.parseURL("https://www.theverge.com/rss/index.xml");
      feedItems = (feed.items || []).slice(0, 15).map((item) => ({
        titulo: item.title || "",
        link: item.link || "",
        data: item.pubDate || item.isoDate || "",
        resumo: item.contentSnippet || item.content || "",
      }));
      console.log(">>> [NOTICIAS] RSS OK. Itens encontrados:", feedItems.length);
    } catch (rssErr) {
      console.error(">>> [NOTICIAS] ERRO NO RSS:", rssErr.message);
      return res.status(502).json({
        erro: "Falha na matriz",
        detalhe: "RSS: " + rssErr.message,
      });
    }

    if (feedItems.length === 0) {
      return res.status(502).json({
        erro: "Falha na matriz",
        detalhe: "Feed RSS retornou 0 itens.",
      });
    }

    // 2. Montar prompt
    const listaFormatada = feedItems
      .map((item, i) => `[${i + 1}] Título: ${item.titulo}\nLink: ${item.link}\nData: ${item.data}\nResumo: ${item.resumo.substring(0, 200)}`)
      .join("\n\n");

    const prompt = `Você é um curador de notícias tech. Selecione a notícia MAIS relevante sobre "${topico}" da lista abaixo.

LISTA:
${listaFormatada}

Retorne APENAS um JSON puro (sem markdown, sem crases, sem explicação) com estes campos:
{"titulo":"título em português","resumo":"resumo em português com 2-3 frases","fonte":"The Verge","link":"URL original","empresa":"Google|Microsoft|Anthropic|OpenAI|GitHub|Meta|Apple|Outros","impacto":"alto|médio|curto","data":"DD/MM/YYYY"}`;

    // 3. Chamar OpenRouter
    let rawAIResponse = "";
    try {
      console.log(">>> [NOTICIAS] Chamando OpenRouter...");
      const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + OPENROUTER_API_KEY,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://news-agent.vercel.app",
          "X-Title": "Tech News Agent",
        },
        body: JSON.stringify({
          model: "google/gemma-3-27b-it:free",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3,
          max_tokens: 800,
        }),
      });

      console.log(">>> [NOTICIAS] OpenRouter respondeu. Status:", aiResponse.status);

      if (!aiResponse.ok) {
        const errBody = await aiResponse.text();
        console.error(">>> [NOTICIAS] OpenRouter ERRO body:", errBody);
        return res.status(502).json({
          erro: "Falha na matriz",
          detalhe: "OpenRouter status " + aiResponse.status + ": " + errBody.substring(0, 300),
        });
      }

      const aiData = await aiResponse.json();
      rawAIResponse = (aiData && aiData.choices && aiData.choices[0] && aiData.choices[0].message && aiData.choices[0].message.content) || "";
      console.log(">>> [NOTICIAS] Resposta bruta da IA (primeiros 300 chars):", rawAIResponse.substring(0, 300));
    } catch (aiErr) {
      console.error(">>> [NOTICIAS] ERRO ao chamar OpenRouter:", aiErr.message);
      return res.status(500).json({
        erro: "Falha na matriz",
        detalhe: "Fetch OpenRouter: " + aiErr.message,
      });
    }

    if (!rawAIResponse || rawAIResponse.trim().length === 0) {
      return res.status(500).json({
        erro: "Falha na matriz",
        detalhe: "IA retornou resposta vazia.",
      });
    }

    // 4. Parse robusto do JSON
    try {
      // Remove blocos markdown e crases
      let cleaned = rawAIResponse
        .replace(/```json\s*/gi, "")
        .replace(/```\s*/g, "")
        .trim();

      // Extrai apenas o conteúdo entre as primeiras { e últimas }
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error(">>> [NOTICIAS] Regex não encontrou JSON na resposta:", cleaned.substring(0, 500));
        return res.status(500).json({
          erro: "Falha na matriz",
          detalhe: "Nenhum objeto JSON encontrado na resposta da IA.",
          respostaBruta: cleaned.substring(0, 500),
        });
      }

      const noticia = JSON.parse(jsonMatch[0]);
      console.log(">>> [NOTICIAS] Parse OK! Título:", noticia.titulo);
      return res.status(200).json(noticia);
    } catch (parseErr) {
      console.error(">>> [NOTICIAS] ERRO de parse:", parseErr.message);
      console.error(">>> [NOTICIAS] Conteúdo que falhou:", rawAIResponse.substring(0, 500));
      return res.status(500).json({
        erro: "Falha na matriz",
        detalhe: "JSON.parse falhou: " + parseErr.message,
        respostaBruta: rawAIResponse.substring(0, 500),
      });
    }

  } catch (globalErr) {
    console.error(">>> [NOTICIAS] ERRO GLOBAL:", globalErr.message, globalErr.stack);
    return res.status(500).json({
      erro: "Falha na matriz",
      detalhe: "Erro global: " + globalErr.message,
    });
  }
};
