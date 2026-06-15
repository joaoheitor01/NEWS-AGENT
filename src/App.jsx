import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import Header from './components/Header';
import AgentTerminal from './components/AgentTerminal';
import SearchBar from './components/SearchBar';
import NewsCard from './components/NewsCard';
import SkeletonCard from './components/SkeletonCard';
import { TOPICS, topicMeta } from './lib/topics';
import { buscarNoticias } from './lib/api';
import { getSaved, setSaved as persistSaved, toggleSaved, isSaved, getCache, setCache } from './lib/storage';
import { saudacao, tempoRelativo, filtrarPorTexto, ordenarPorImpacto } from './lib/format';

// Estado inicial do feed/meta a partir do cache (lazy — roda só no 1º render).
function cacheInicial() {
  const cache = getCache();
  if (cache?.noticias?.length) {
    return { feed: cache.noticias, meta: { ...cache.meta, ts: cache.ts } };
  }
  return { feed: [], meta: null };
}

export default function App() {
  const [view, setView] = useState('home');               // 'home' | topicKey | 'salvos'
  const [feed, setFeed] = useState(() => cacheInicial().feed); // notícias carregadas
  const [meta, setMeta] = useState(() => cacheInicial().meta); // info da última busca
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState([]);
  const [expanded, setExpanded] = useState(null);         // link da notícia expandida
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('relevancia');         // 'relevancia' | 'impacto'
  const [saved, setSaved] = useState(() => getSaved());
  const [hora, setHora] = useState(new Date());
  const [toast, setToast] = useState(null);
  const abortRef = useRef(null);
  const feedRef = useRef(feed); // espelho de `feed` para mesclas sem closure stale

  // ---- Relógio (atualiza a cada 30s — barato) ----
  useEffect(() => {
    const t = setInterval(() => setHora(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  // ---- Toast efêmero ----
  const flash = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }, []);

  const addLog = useCallback((msg) => {
    setLog((prev) => [...prev.slice(-30), { msg, id: Date.now() + Math.random() }]);
  }, []);

  // ---- Busca de notícias ----
  const buscar = useCallback(async (alvo) => {
    const topic = alvo === 'home' || !TOPICS[alvo] ? null : alvo;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setLog([]);
    addLog('inicializando neural news crawler...');
    addLog('coletando fontes de tecnologia BR + internacional');
    addLog(topic ? `filtrando sinais do tópico "${topicMeta(topic).long}"` : 'curando notícias mais relevantes');

    try {
      const data = await buscarNoticias(topic, { signal: controller.signal });
      const recebidas = data.noticias || [];
      if (recebidas.length === 0) {
        addLog('nenhuma notícia retornada');
        flash('Nenhuma notícia encontrada');
        return;
      }

      // Busca por tópico: mescla (dedupe por link); busca geral: substitui.
      let novo;
      if (topic) {
        const vistos = new Set(feedRef.current.map((n) => n.link));
        novo = [...recebidas.filter((n) => !vistos.has(n.link)), ...feedRef.current];
      } else {
        novo = recebidas;
      }
      feedRef.current = novo;
      setFeed(novo);

      const novaMeta = {
        curadoria: data.curadoria,
        totalFontes: data.totalFontes,
        geradoEm: data.geradoEm,
      };
      setMeta({ ...novaMeta, ts: Date.now() });
      setCache(novo, novaMeta);

      addLog(`${recebidas.length} notícias carregadas ${data.curadoria === 'ia' ? '(curadoria IA)' : '(curadoria heurística)'}`);
    } catch (err) {
      if (err.name === 'AbortError') return;
      addLog(`erro: ${err.message}`);
      flash('Falha ao buscar notícias');
    } finally {
      if (abortRef.current === controller) {
        setLoading(false);
        abortRef.current = null;
      }
    }
  }, [addLog, flash]);

  // ---- Salvar / compartilhar ----
  const onSave = useCallback((noticia) => {
    setSaved((prev) => {
      const existia = isSaved(prev, noticia.link);
      const novo = toggleSaved(prev, noticia);
      persistSaved(novo);
      flash(existia ? 'Removida das salvas' : 'Notícia salva');
      return novo;
    });
  }, [flash]);

  const onShare = useCallback(async (noticia) => {
    const dados = { title: noticia.titulo, text: noticia.titulo, url: noticia.link };
    try {
      if (navigator.share) {
        await navigator.share(dados);
      } else {
        await navigator.clipboard.writeText(noticia.link);
        flash('Link copiado');
      }
    } catch { /* cancelado pelo usuário */ }
  }, [flash]);

  const limparSalvas = useCallback(() => {
    setSaved([]);
    persistSaved([]);
    flash('Salvas removidas');
  }, [flash]);

  // ---- Navegação ----
  const navigate = useCallback((alvo) => {
    setView(alvo);
    setExpanded(null);
    setSearch('');
  }, []);

  // ---- Derivações ----
  const greeting = saudacao(hora);
  const isHome = view === 'home';
  const isTopic = TOPICS[view] != null;

  const baseList = useMemo(() => {
    if (view === 'salvos') return [...saved].sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0));
    if (isTopic) return feed.filter((n) => n.topico === view);
    return feed;
  }, [view, isTopic, feed, saved]);

  const lista = useMemo(() => {
    let l = filtrarPorTexto(baseList, search);
    if (sort === 'impacto') l = ordenarPorImpacto(l);
    return l;
  }, [baseList, search, sort]);

  const primaryLabel = isHome
    ? 'Atualizar notícias'
    : isTopic
      ? `Buscar ${topicMeta(view).long}`
      : 'Atualizar notícias';

  return (
    <div className="min-h-screen text-[var(--color-ink)]">
      <Sidebar view={view} onNavigate={navigate} savedCount={saved.length} />
      <Header hora={hora} onHome={() => navigate('home')} />
      <MobileNav view={view} onNavigate={navigate} savedCount={saved.length} />

      <main className="md:pl-60 lg:pl-72 pt-16 pb-28 md:pb-12 px-4 md:px-8">
        <div className="mx-auto flex max-w-4xl flex-col gap-6">

          {/* ===== HERO (home) ===== */}
          {isHome && (
            <section className="flex flex-col gap-5 pt-4">
              <div>
                <h1 className="font-[family-name:var(--font-display)] text-3xl md:text-4xl font-bold tracking-tight">
                  <span className="text-[var(--color-brand)]">Tech</span> News Agent
                </h1>
                <p className="mt-2 text-[var(--color-ink-muted)]">
                  {greeting}, João Heitor — sua dose curada de tecnologia.
                </p>
              </div>
              <nav className="flex flex-wrap gap-2">
                {Object.entries(TOPICS).map(([key, t]) => (
                  <button
                    key={key}
                    onClick={() => navigate(key)}
                    className="rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all hover:scale-[1.03]"
                    style={{ borderColor: 'var(--color-border-strong)', color: t.color }}
                  >
                    {t.long}
                  </button>
                ))}
              </nav>
            </section>
          )}

          {/* ===== Cabeçalho de tópico ===== */}
          {isTopic && (
            <section className="flex items-center gap-3 pt-4">
              <span className="material-symbols-outlined text-3xl" style={{ color: topicMeta(view).color }}>
                {topicMeta(view).icon}
              </span>
              <div>
                <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight">
                  {topicMeta(view).long}
                </h1>
                <p className="text-sm text-[var(--color-ink-muted)]">{baseList.length} notícias no tópico</p>
              </div>
            </section>
          )}

          {/* ===== Ações ===== */}
          {view !== 'salvos' && (
            <>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => buscar(view)}
                  disabled={loading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--color-brand)] py-3.5 font-[family-name:var(--font-display)] font-semibold text-black transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
                >
                  <span className={`material-symbols-outlined ${loading ? 'animate-spin' : ''}`}>
                    {loading ? 'progress_activity' : 'auto_awesome'}
                  </span>
                  {loading ? 'Buscando…' : primaryLabel}
                </button>
                <button
                  onClick={() => navigate('salvos')}
                  className="flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border-strong)] px-5 py-3.5 font-[family-name:var(--font-display)] font-semibold text-[var(--color-ink)] transition-all hover:bg-white/5"
                >
                  <span className="material-symbols-outlined">bookmark</span>
                  Salvas {saved.length > 0 && <span className="text-[var(--color-brand)]">{saved.length}</span>}
                </button>
              </div>

              <AgentTerminal log={log} loading={loading} />
            </>
          )}

          {/* ===== Barra de busca + ordenação ===== */}
          {baseList.length > 0 && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex-1">
                <SearchBar value={search} onChange={setSearch} count={lista.length} />
              </div>
              {view !== 'salvos' && (
                <div className="flex items-center gap-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-1 text-xs">
                  {[['relevancia', 'Relevância'], ['impacto', 'Impacto']].map(([key, lbl]) => (
                    <button
                      key={key}
                      onClick={() => setSort(key)}
                      className="rounded-lg px-3 py-1.5 font-semibold transition-colors"
                      style={{
                        backgroundColor: sort === key ? 'var(--color-surface-3)' : 'transparent',
                        color: sort === key ? 'var(--color-ink)' : 'var(--color-ink-faint)',
                      }}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===== Cabeçalho da lista ===== */}
          {(lista.length > 0 || loading) && (
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--color-ink-faint)]">
                {view === 'salvos'
                  ? `${lista.length} ${lista.length === 1 ? 'notícia salva' : 'notícias salvas'}`
                  : `${lista.length} ${lista.length === 1 ? 'notícia' : 'notícias'}`}
                {meta?.ts && view !== 'salvos' && (
                  <span className="ml-2 font-normal normal-case tracking-normal text-[var(--color-ink-faint)]">
                    · atualizado {tempoRelativo(meta.ts)}
                    {meta.curadoria === 'ia' ? ' · IA' : ''}
                  </span>
                )}
              </h2>
              {view === 'salvos' && saved.length > 0 && (
                <button
                  onClick={limparSalvas}
                  className="rounded-lg border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 px-3 py-1.5 text-xs font-bold text-[var(--color-danger)] transition-all hover:bg-[var(--color-danger)]/20"
                >
                  Limpar tudo
                </button>
              )}
            </div>
          )}

          {/* ===== Lista / estados ===== */}
          <section className="flex flex-col gap-3">
            {loading && feed.length === 0 &&
              Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}

            {lista.map((n) => (
              <NewsCard
                key={n.link || n.titulo}
                noticia={n}
                expanded={expanded === (n.link || n.titulo)}
                onToggle={() => setExpanded(expanded === (n.link || n.titulo) ? null : (n.link || n.titulo))}
                onSave={onSave}
                isSaved={isSaved(saved, n.link)}
                onShare={onShare}
              />
            ))}

            {/* Estados vazios */}
            {!loading && lista.length === 0 && (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[var(--color-border)] py-16 text-center">
                <span className="material-symbols-outlined text-4xl text-[var(--color-ink-faint)]">
                  {view === 'salvos' ? 'bookmark_border' : search ? 'search_off' : 'newspaper'}
                </span>
                <p className="text-[var(--color-ink-muted)]">
                  {view === 'salvos'
                    ? 'Nenhuma notícia salva ainda.'
                    : search
                      ? 'Nada encontrado para sua busca.'
                      : isTopic
                        ? `Sem notícias de ${topicMeta(view).long} no momento.`
                        : 'Toque em "Atualizar notícias" para começar.'}
                </p>
                {view !== 'salvos' && !search && (
                  <button
                    onClick={() => buscar(view)}
                    className="mt-1 rounded-xl bg-[var(--color-brand)] px-5 py-2.5 text-sm font-semibold text-black transition-all hover:brightness-110"
                  >
                    {primaryLabel}
                  </button>
                )}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* ===== Toast ===== */}
      {toast && (
        <div className="fixed bottom-24 md:bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full border border-[var(--color-border-strong)] bg-[var(--color-surface-3)] px-5 py-2.5 text-sm font-medium shadow-xl animate-[var(--animate-fade-up)]">
          {toast}
        </div>
      )}
    </div>
  );
}
