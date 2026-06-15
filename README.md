# 🛰️ Tech News Agent

Agregador inteligente de notícias de tecnologia do **Brasil e do mundo**, com
curadoria por IA (opcional), interface dark "neural/terminal", filtragem por
tópico, busca instantânea, notícias salvas e push diário.

> React 19 + Vite + Tailwind CSS v4 · API serverless na Vercel · app Android via Capacitor.

---

## ✨ Recursos

- **16 fontes RSS** (Canaltech, Olhar Digital, Tecnoblog, TecMundo, Diolinux,
  TabNews, The Verge, Ars Technica, Hacker News, etc.).
- **Curadoria por IA** via OpenRouter — _opcional_. Sem chave, usa uma
  **curadoria heurística** (pontuação por relevância + recência + peso da fonte).
- **7 tópicos** alinhados ponta a ponta (IA, Dev, Hardware, Chips, Cyber, Web3,
  Mercado): o backend marca cada notícia com seu tópico e o frontend filtra na hora.
- **Busca textual instantânea** e ordenação por relevância/impacto.
- **Imagens reais** extraídas dos feeds (com fallback por ícone do tópico).
- **Notícias salvas** (localStorage) e **cache** da última busca (carrega na hora).
- **Compartilhar** via Web Share API (ótimo no mobile/Android).
- **Responsivo**: sidebar no desktop, navegação inferior no mobile.
- **Acessível**: foco visível, `aria-*`, `prefers-reduced-motion`.
- **Push diário** (cron + [ntfy.sh](https://ntfy.sh)) com a notícia do dia.

---

## 🚀 Começando

```bash
npm install
cp .env.example .env   # opcional: preencha OPENROUTER_API_KEY
npm run dev            # http://localhost:5173
```

O servidor de dev inclui um _bridge_ que executa as funções de `api/` localmente,
então `/api/noticias` funciona sem deploy.

### Scripts

| Comando           | Descrição                          |
| ----------------- | ---------------------------------- |
| `npm run dev`     | Ambiente de desenvolvimento (Vite) |
| `npm run build`   | Build de produção em `dist/`       |
| `npm run preview` | Serve o build localmente           |
| `npm run lint`    | ESLint                             |

---

## 🧠 Arquitetura

```
api/
  _lib/
    feeds.js       # FONTE ÚNICA de feeds + tópicos/keywords
    curate.js      # coleta RSS, imagem, score, dedupe, heurística
    openrouter.js  # curadoria por IA (opcional)
  noticias.js      # endpoint principal (POST/GET)
  cron.js          # push diário via ntfy.sh
src/
  lib/             # topics, storage, api, format
  components/      # Sidebar, MobileNav, Header, NewsCard, ...
  App.jsx          # orquestração de estado/visões
  index.css        # design system (Tailwind v4 @theme)
```

O endpoint coleta os feeds em paralelo (tolerante a falhas), pontua e
**deduplica** os itens, e então cura via IA — ou heurística, se não houver chave.
Cada notícia volta marcada com `topico`, `impacto`, `pais` e `imagem`.

---

## ⚙️ Configuração (variáveis de ambiente)

Veja [`.env.example`](./.env.example). Todas são **opcionais**:

| Variável             | Padrão            | Uso                                   |
| -------------------- | ----------------- | ------------------------------------- |
| `OPENROUTER_API_KEY` | —                 | Liga a curadoria por IA               |
| `OPENROUTER_MODEL`   | `openrouter/auto` | Modelo usado na curadoria             |
| `NTFY_TOPIC`         | `aion_news_...`   | Tópico do push diário                 |
| `SITE_URL`           | —                 | `HTTP-Referer` do OpenRouter          |
| `VITE_API_BASE`      | —                 | Base da API em build nativo (Android) |

---

## 🧩 Como estender

- **Nova fonte:** adicione um objeto em `FEEDS` (`api/_lib/feeds.js`).
- **Novo tópico:** adicione a chave em `TOPICS` de `api/_lib/feeds.js` (keywords)
  **e** em `src/lib/topics.js` (rótulo, ícone, cor). As chaves devem ser iguais.

---

## ☁️ Deploy

- **Web (Vercel):** importe o repositório; defina as variáveis de ambiente.
  O cron diário (`vercel.json`) chama `/api/cron` às 11h UTC.
- **Android (Capacitor):** `npm run build && npx cap sync android` e abra em
  `android/` no Android Studio. Defina `VITE_API_BASE` apontando para a API web.

---

## 📄 Licença

Projeto pessoal de João Heitor. Uso livre para fins de estudo.
