// api/_lib/feeds.js
// -----------------------------------------------------------------------------
// FONTE ÚNICA DE VERDADE para feeds e tópicos do backend.
//
// Para ADICIONAR UMA FONTE: inclua um objeto em FEEDS.
// Para ADICIONAR UM TÓPICO: inclua uma entrada em TOPICS (a chave precisa ser a
// MESMA usada no frontend em `src/lib/topics.js`).
// -----------------------------------------------------------------------------

// Peso (`peso`) prioriza fontes na curadoria. BR > internacional por padrão.
const FEEDS = [
  // === BRASIL — Notícias gerais de tecnologia ===
  { url: 'https://canaltech.com.br/rss/',            nome: 'Canaltech',      pais: 'BR', peso: 3 },
  { url: 'https://olhardigital.com.br/feed/',        nome: 'Olhar Digital',  pais: 'BR', peso: 3 },
  { url: 'https://tecnoblog.net/feed/',              nome: 'Tecnoblog',      pais: 'BR', peso: 3 },
  { url: 'https://www.showmetech.com.br/feed/',      nome: 'Show Me Tech',   pais: 'BR', peso: 2 },
  { url: 'https://meiobit.com/feed/',                nome: 'Meio Bit',       pais: 'BR', peso: 2 },
  { url: 'https://www.adrenaline.com.br/feed/',      nome: 'Adrenaline',     pais: 'BR', peso: 2 },

  // === BRASIL — Linux / open source / desenvolvimento ===
  { url: 'https://diolinux.com.br/feed',             nome: 'Diolinux',       pais: 'BR', peso: 2 },
  { url: 'https://www.tabnews.com.br/recentes/rss',  nome: 'TabNews',        pais: 'BR', peso: 2 },

  // === BRASIL — Mercado e negócios tech ===
  { url: 'https://www.infomoney.com.br/feed/',       nome: 'InfoMoney',      pais: 'BR', peso: 1 },

  // === INTERNACIONAL — Referências globais ===
  { url: 'https://www.theverge.com/rss/index.xml',   nome: 'The Verge',      pais: 'US', peso: 1 },
  { url: 'https://techcrunch.com/feed/',             nome: 'TechCrunch',     pais: 'US', peso: 1 },
  { url: 'https://www.wired.com/feed/rss',           nome: 'Wired',          pais: 'US', peso: 1 },
  { url: 'https://feeds.arstechnica.com/arstechnica/index', nome: 'Ars Technica', pais: 'US', peso: 1 },
  { url: 'https://www.engadget.com/rss.xml',         nome: 'Engadget',       pais: 'US', peso: 1 },
  { url: 'https://hnrss.org/frontpage',              nome: 'Hacker News',    pais: 'US', peso: 1 },

  // === INTERNACIONAL — Laboratórios de IA e pesquisa (fontes primárias) ===
  { url: 'https://openai.com/news/rss.xml',          nome: 'OpenAI',         pais: 'US', peso: 2 },
  { url: 'https://deepmind.google/blog/rss.xml',     nome: 'Google DeepMind', pais: 'US', peso: 2 },
  { url: 'https://huggingface.co/blog/feed.xml',     nome: 'Hugging Face',   pais: 'US', peso: 2 },
  { url: 'https://www.technologyreview.com/feed/',   nome: 'MIT Tech Review', pais: 'US', peso: 2 },
  { url: 'https://the-decoder.com/feed/',            nome: 'The Decoder',    pais: 'US', peso: 1 },
  { url: 'https://blogs.nvidia.com/feed/',           nome: 'NVIDIA Blog',    pais: 'US', peso: 1 },
  { url: 'https://venturebeat.com/category/ai/feed/', nome: 'VentureBeat AI', pais: 'US', peso: 1 },
  // Anthropic não publica RSS oficial; usamos um espelho comunitário mantido.
  { url: 'https://raw.githubusercontent.com/taobojlen/anthropic-rss-feed/main/anthropic_news_rss.xml', nome: 'Anthropic', pais: 'US', peso: 2 },

  // === UNIVERSIDADES E PESQUISA (Brasil + exterior) ===
  { url: 'https://jornal.usp.br/feed/',              nome: 'Jornal da USP',  pais: 'BR', peso: 2 },
  { url: 'https://agencia.fapesp.br/rss',            nome: 'Agência FAPESP', pais: 'BR', peso: 1 },
  { url: 'https://news.mit.edu/rss/feed',            nome: 'MIT News',       pais: 'US', peso: 2 },
  { url: 'https://news.stanford.edu/feed/',          nome: 'Stanford',       pais: 'US', peso: 1 },
  { url: 'https://news.harvard.edu/gazette/feed/',   nome: 'Harvard Gazette', pais: 'US', peso: 1 },
  { url: 'https://news.berkeley.edu/feed/',          nome: 'UC Berkeley',    pais: 'US', peso: 1 },
  { url: 'https://www.sciencedaily.com/rss/computers_math/artificial_intelligence.xml', nome: 'ScienceDaily', pais: 'US', peso: 1 },
];

// Tópicos: a CHAVE deve casar com `src/lib/topics.js` (frontend).
// `keywords` alimentam a relevância/curadoria. `label` é só para logs.
const TOPICS = {
  ia: {
    label: 'Inteligência Artificial',
    keywords: [
      'inteligência artificial', 'inteligencia artificial', ' ia ', ' ai ', 'machine learning',
      'aprendizado de máquina', 'deep learning', 'rede neural', 'redes neurais', 'llm',
      'modelo de linguagem', 'ia generativa', 'generative ai', 'chatbot', 'chatgpt', 'gpt',
      'gemini', 'copilot', 'claude', 'openai', 'anthropic', 'mistral', 'llama', 'nlp',
      'visão computacional', 'agente de ia', 'ai agent', 'transformer',
    ],
  },
  ciencia: {
    label: 'Ciência e Pesquisa',
    keywords: [
      'pesquisa', 'pesquisador', 'pesquisadores', 'universidade', 'estudo', 'cientista',
      'cientistas', 'ciência', 'ciencia', 'científic', 'cientific', 'descoberta',
      'laboratório', 'laboratorio', 'usp', 'unicamp', 'fapesp', 'mit', 'stanford',
      'harvard', 'berkeley', 'oxford', 'cambridge', 'doutorado', 'mestrado', 'paper',
      'física', 'fisica', 'quântica', 'quantica', 'biotecnologia', 'astronomia',
      'neurociência', 'genoma', 'clima', 'energia limpa', 'fusão nuclear', 'fusao nuclear',
    ],
  },
  dev: {
    label: 'Desenvolvimento',
    keywords: [
      'desenvolvedor', 'programação', 'programacao', 'javascript', 'typescript', 'python',
      'react', 'node', 'django', 'java ', 'rust', 'golang', ' go ', 'php', 'framework',
      ' api ', 'backend', 'frontend', 'fullstack', 'devops', 'docker', 'kubernetes',
      'open source', 'open-source', 'código aberto', 'codigo aberto', 'github', 'gitlab',
      'linux', 'ubuntu', 'fedora', 'kernel', 'git ', 'webassembly', 'compilador',
    ],
  },
  hardware: {
    label: 'Hardware',
    keywords: [
      'gpu', 'placa de vídeo', 'placa de video', 'processador', 'cpu', 'nvidia', 'geforce',
      'rtx', 'radeon', 'amd', 'ryzen', 'intel', 'core ultra', 'arm', 'notebook', 'laptop',
      'ssd', 'memória ram', 'memoria ram', 'ddr5', 'benchmark', 'overclock', 'placa-mãe',
      'placa mae', 'fonte', 'cooler', 'monitor', 'periférico', 'perifericos', 'console',
    ],
  },
  chips: {
    label: 'Semicondutores',
    keywords: [
      'chip', 'semicondutor', 'semicondutores', 'tsmc', 'asml', 'foundry', 'fundição',
      'nanômetro', 'nanometro', '2nm', '3nm', '4nm', '5nm', 'litografia', 'wafer',
      'fabricação de chips', 'fabricacao de chips', 'transistor', 'euv', 'samsung foundry',
      'globalfoundries', 'snapdragon', 'qualcomm', 'mediatek', 'apple silicon', 'm4', 'm3',
    ],
  },
  cyber: {
    label: 'Cibersegurança',
    keywords: [
      'cibersegurança', 'ciberseguranca', 'segurança digital', 'seguranca digital',
      'ransomware', 'malware', 'vazamento de dados', 'vazamento', 'hacker', 'ataque hacker',
      'vulnerabilidade', 'exploit', 'phishing', 'golpe', 'fraude', 'privacidade', 'lgpd',
      'criptografia', 'invasão', 'invasao', 'cve-', 'zero-day', 'backdoor', 'ddos', 'botnet',
    ],
  },
  web3: {
    label: 'Web3 e Cripto',
    keywords: [
      'web3', 'blockchain', 'cripto', 'criptomoeda', 'criptomoedas', 'bitcoin', 'ethereum',
      'nft', 'defi', 'descentralizado', 'token', 'carteira digital', 'metaverso', 'dao',
      'smart contract', 'contrato inteligente', 'stablecoin', 'drex', 'web 3',
    ],
  },
  mercado: {
    label: 'Mercado e Startups',
    keywords: [
      'startup', 'startups', 'investimento', 'venture capital', 'rodada de investimento',
      'aporte', 'fintech', 'edtech', 'healthtech', 'unicórnio', 'unicornio', 'ipo',
      'aquisição', 'aquisicao', 'fusão', 'fusao', 'valuation', 'mercado de tecnologia',
      'bndes', 'finep', 'demissões', 'demissoes', 'layoff', 'receita', 'faturamento',
    ],
  },
};

// Lista achatada de todas as palavras-chave (filtro padrão "todos os tópicos").
const ALL_KEYWORDS = Object.values(TOPICS).flatMap((t) => t.keywords);

module.exports = { FEEDS, TOPICS, ALL_KEYWORDS };
