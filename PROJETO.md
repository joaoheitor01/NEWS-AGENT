# 📰 Tech News Agent — Visão Geral do Projeto

> Documento pensado para você (João Heitor), explicando o que o projeto é, como
> ele funciona por dentro e como evoluí-lo no futuro. Para instruções rápidas de
> instalação/dev, veja o [`README.md`](./README.md).

---

## 1. O que é

O **Tech News Agent** é um jornal digital de tecnologia com curadoria
automática. Ele varre dezenas de fontes RSS (portais BR, veículos
internacionais, blogs oficiais de laboratórios de IA e universidades), filtra
o que é relevante, organiza por tópico e — quando há uma chave de IA
configurada — escreve um **briefing editorial do dia** no estilo dos
resumos de notícias da Gemini/Google.

O visual é inspirado em jornais como o **NYT**: tipografia serifada para
títulos, layout em blocos, tons neutros (sem "neon"), com **modo claro e
escuro**.

---

## 2. Como funciona, na prática

```
[Feeds RSS] → coleta paralela → dedupe/score → top candidatos
                                                     │
                                                     ▼
                                   tem OPENROUTER_API_KEY?
                                  /                        \
                              SIM                          NÃO
                               │                            │
                     Curadoria por IA               Curadoria heurística
            (briefing + resumos + "pontos")      (pontuação por relevância,
                               │                   recência e peso da fonte)
                               ▼                            │
                          resposta JSON  ◄──────────────────┘
                               │
                               ▼
                         Frontend (React)
```

1. **Coleta** (`api/_lib/curate.js → coletarItens`): busca todos os feeds de
   `api/_lib/feeds.js` em paralelo (com `Promise.allSettled`, então um feed
   fora do ar não derruba os outros).
2. **Seleção** (`selecionarCandidatos`): remove duplicados, extrai imagem,
   detecta o tópico de cada item e pontua por relevância + recência + peso da
   fonte.
3. **Curadoria**:
   - **Com IA** (`api/_lib/openrouter.js → curadoriaIA`): manda a lista de
     candidatos para um modelo gratuito do OpenRouter, que devolve um
     **briefing** ("O resumo do dia") + 8–10 notícias com emoji, resumo e
     bullets "Por dentro da notícia".
   - **Sem IA / se a IA falhar**: `curadoriaHeuristica` ordena os candidatos
     pelo score calculado na etapa anterior. O site continua funcionando 100%
     sem nenhuma chave configurada.
4. **Frontend** (`src/App.jsx` e componentes): mostra a Hero, o briefing (só
   na Capa), e os blocos de notícia — uma em destaque (`variant="lead"`) e o
   resto em grade.

---

## 3. Funcionalidades

- **Briefing diário** ("O resumo do dia"), gerado por IA quando disponível.
- **Tópicos/seções**: Capa, IA, Ciência, Dev, Hardware, Chips, Cibersegurança,
  Web3, Mercado — navegação no masthead, igual a um jornal.
- **Busca instantânea** por texto e ordenação por impacto/relevância.
- **Notícias salvas** (localStorage) — aba "Salvas".
- **Compartilhar** via Web Share API (ótimo no celular).
- **Modo claro/escuro**, com preferência salva e respeito ao tema do sistema.
- **Cache local** da última busca — abre instantâneo mesmo sem rede.
- **Push diário** (cron + ntfy.sh) com a notícia mais importante do dia.
- **App Android** via Capacitor (mesma base de código).

---

## 4. Fontes de notícias

Tudo configurado em **`api/_lib/feeds.js`** (fonte única de verdade), hoje
com ~30 feeds organizados em:

- **Brasil — geral**: Canaltech, Olhar Digital, Tecnoblog, Show Me Tech, Meio
  Bit, Adrenaline.
- **Brasil — dev / open source**: Diolinux, TabNews.
- **Brasil — mercado**: InfoMoney.
- **Internacional — referências**: The Verge, TechCrunch, Wired, Ars
  Technica, Engadget, Hacker News.
- **Laboratórios de IA (fontes primárias)**: OpenAI, Google DeepMind,
  Anthropic, Hugging Face, MIT Technology Review, The Decoder, NVIDIA Blog,
  VentureBeat AI.
- **Universidades e pesquisa**: Jornal da USP, Agência FAPESP, MIT News,
  Stanford, Harvard Gazette, UC Berkeley, ScienceDaily.

Cada fonte tem um `peso` (prioridade na curadoria) e um `pais` (`BR`/`US`),
usado para badges e diversidade do briefing.

---

## 5. Tópicos e como a classificação funciona

`TOPICS` (em `api/_lib/feeds.js`, espelhado em `src/lib/topics.js`) define,
para cada tópico, uma lista de palavras-chave em português/inglês. Cada
notícia recebe automaticamente o tópico cujas palavras-chave aparecem com mais
força no título/resumo (`detectarTopico`). A IA também pode sugerir o tópico,
mas o resultado é sempre validado contra essa lista fixa.

Tópicos atuais: **IA, Ciência, Dev, Hardware, Chips, Cibersegurança, Web3,
Mercado**.

---

## 6. Curadoria por IA (OpenRouter)

- **Opcional** — sem `OPENROUTER_API_KEY`, o site usa só a curadoria
  heurística (que já é bem decente).
- A chave aceita 3 nomes (`OPENROUTER_API_KEY`, `OPENROUT_API_KEY`,
  `OPEN_ROUTER_API_KEY`) para tolerar erros de digitação.
- **Descoberta automática de modelos gratuitos**: a cada execução, o backend
  consulta `GET /api/v1/models` e filtra os que têm preço **zero** de prompt
  e completion — assim nunca depende de um ID de modelo "free" que deixou de
  existir.
- **Ordem de tentativa**: modelo escolhido em `OPENROUTER_MODEL` (você
  configurou `google/gemma-4-26b-a4b-it:free`) → modelos gratuitos
  descobertos → lista fixa de fallback → `openrouter/auto`.
- **Tolerância a lentidão**: modelos gratuitos podem ser lentos. Por isso há
  um prazo total (`deadlineMs`) e um timeout por modelo (`porModeloMs`), e a
  função na Vercel tem `maxDuration: 60` (em `vercel.json`). Se nada
  responder a tempo, cai automaticamente na curadoria heurística — o usuário
  nunca vê erro.

---

## 7. Design

- **Tipografia**: Lora (serifada, títulos/citações) + Libre Franklin
  (sans-serif, corpo de texto).
- **Paleta**: tons neutros de jornal — fundo branco/cinza claro no modo
  claro, quase-preto no modo escuro, um azul discreto (`--color-accent`) para
  links/destaques e vermelho (`--color-danger`) para "alto impacto".
- **Layout**: masthead com logo TNA, hero cinematográfica (foto + frase de
  efeito + citação), briefing em destaque, depois notícias em blocos (uma
  "lead" maior + grade).
- **Modo escuro**: classe `.dark` no `<html>`, alternável pelo botão no
  masthead, com persistência em localStorage e respeito a
  `prefers-color-scheme` no primeiro acesso.
- Tudo definido via CSS custom properties em `src/index.css` (Tailwind v4
  `@theme`), então trocar cores no futuro é editar um único lugar.

---

## 8. Estrutura do projeto

```
api/
  _lib/
    feeds.js       # fonte única: lista de feeds + tópicos/keywords
    curate.js       # coleta, score, dedupe, curadoria heurística
    openrouter.js   # curadoria por IA (briefing + notícias)
  noticias.js        # endpoint principal (GET/POST /api/noticias)
  cron.js            # job diário de push (ntfy.sh)

src/
  components/
    Masthead.jsx     # cabeçalho + navegação + toggle de tema
    Hero.jsx         # banner de capa
    Logo.jsx         # logo TNA em SVG
    NewsBlock.jsx     # cartão de notícia (lead/standard)
    SearchBar.jsx, SkeletonCard.jsx
  lib/
    api.js           # chamada ao /api/noticias
    topics.js        # rótulos dos tópicos no frontend
    storage.js        # localStorage (salvos + cache)
    format.js         # datas, sanitização de links, ordenação
  App.jsx             # orquestra estado, tema, busca, seções
  index.css           # design system (tema claro/escuro)

public/
  logo.svg, hero.jpg, hero.webp
```

---

## 9. Variáveis de ambiente

Todas opcionais — veja [`.env.example`](./.env.example):

| Variável | Padrão | Para que serve |
| --- | --- | --- |
| `OPENROUTER_API_KEY` | — | Ativa a curadoria por IA |
| `OPENROUTER_MODEL` | `openrouter/auto` | Modelo preferido (você usa `google/gemma-4-26b-a4b-it:free`) |
| `CRON_SECRET` | — | Protege `/api/cron` (a Vercel envia automaticamente) |
| `NTFY_TOPIC` | `aion_news_jh_2026` | Tópico do ntfy.sh para o push diário |
| `SITE_URL` | `https://tech-news-agent.vercel.app` | Usado no header `HTTP-Referer` do OpenRouter |
| `VITE_API_BASE` | — | Base da API no app Android (Capacitor) |

> Dica: se trocar o domínio principal (ex.: `tech-news-agents.vercel.app`),
> atualize `SITE_URL` para refletir o domínio atual.

---

## 10. Rodando localmente

```bash
npm install
cp .env.example .env   # opcional
npm run dev            # http://localhost:5173
```

O `npm run dev` já inclui um bridge que roda as funções de `api/` localmente,
então `/api/noticias` funciona sem precisar de deploy.

---

## 11. Deploy (Vercel)

- Importe o repositório na Vercel e configure as variáveis de ambiente acima.
- `vercel.json` já define:
  - Cron diário às 11h UTC chamando `/api/cron`.
  - `maxDuration: 60` para `api/noticias.js` e `api/cron.js` (necessário pelos
    modelos gratuitos de IA, que podem ser lentos).
  - Headers de segurança (`X-Content-Type-Options`, `X-Frame-Options`,
    `Referrer-Policy`, `Permissions-Policy`).
- Para compartilhar sem exigir login na Vercel: **Settings → Deployment
  Protection** desative para Production, e use um domínio
  `*.vercel.app` em **Settings → Domains**.

---

## 12. App Android (Capacitor)

```bash
npm run build
npx cap sync android
```

Abra a pasta `android/` no Android Studio. Defina `VITE_API_BASE` apontando
para a API web (ex.: `https://tech-news-agents.vercel.app`) antes do build,
para o app nativo consumir o backend hospedado.

---

## 13. Segurança

- **Links**: todo link de notícia passa por `linkSeguro()` (`src/lib/format.js`),
  que só permite `http`/`https` — bloqueia esquemas perigosos (`javascript:`,
  `data:`, etc.).
- **Feeds**: lista fixa em `feeds.js` (sem URLs vindas de input do usuário) —
  evita SSRF.
- **Cron**: protegido por `CRON_SECRET` opcional, comparando o header
  `Authorization` enviado automaticamente pela Vercel.
- **Headers HTTP**: `vercel.json` aplica headers de segurança padrão em todas
  as rotas.
- `npm audit`: 0 vulnerabilidades na última verificação.

---

## 14. Como expandir

- **Nova fonte de notícia**: adicione um objeto em `FEEDS`
  (`api/_lib/feeds.js`) com `url`, `nome`, `pais` e `peso`.
- **Novo tópico**: adicione a chave em `TOPICS` (`api/_lib/feeds.js`, com
  `label` + `keywords`) **e** em `src/lib/topics.js` (mesma chave, com
  `label`/`long` para exibição). As chaves precisam ser idênticas nos dois
  arquivos.
- **Trocar modelo de IA**: basta mudar `OPENROUTER_MODEL` na Vercel — o
  sistema já tem fallback automático se o modelo escolhido falhar ou ficar
  sem crédito.
- **Ajustar visual**: cores, fontes e espaçamentos do tema claro/escuro estão
  centralizados em `src/index.css` (`@theme` e bloco `.dark`).
