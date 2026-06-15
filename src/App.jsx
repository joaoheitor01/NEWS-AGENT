import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Masthead from './components/Masthead';
import Hero from './components/Hero';
import NewsBlock from './components/NewsBlock';
import SkeletonCard from './components/SkeletonCard';
import SearchBar from './components/SearchBar';
import { TOPICS, topicMeta } from './lib/topics';
import { buscarNoticias } from './lib/api';
import { getSaved, setSaved as persistSaved, toggleSaved, isSaved, getCache, setCache } from './lib/storage';
import { saudacao, tempoRelativo, filtrarPorTexto, ordenarPorImpacto } from './lib/format';

function cacheInicial() {
  const cache = getCache();
  if (cache?.noticias?.length) return { feed: cache.noticias, meta: { ...cache.meta, ts: cache.ts } };
  return { feed: [], meta: null };
}

export default function App() {
  const [view, setView] = useState('home');
  const [feed, setFeed] = useState(() => cacheInicial().feed);
  const [meta, setMeta] = useState(() => cacheInicial().meta);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('relevancia');
  const [saved, setSaved] = useState(() => getSaved());
  const [hora, setHora] = useState(new Date());
  const [toast, setToast] = useState(null);
  const [theme, setTheme] = useState(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  );
  const abortRef = useRef(null);
  const feedRef = useRef(feed);

  useEffect(() => {
    const t = setInterval(() => setHora(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      const root = document.documentElement;
      root.classList.toggle('dark', next === 'dark');
      try { localStorage.setItem('tna_theme', next); } catch { /* ignore */ }
      const m = document.querySelector('meta[name="theme-color"]');
      if (m) m.setAttribute('content', next === 'dark' ? '#121212' : '#ffffff');
      return next;
    });
  }, []);

  const flash = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }, []);

  const buscar = useCallback(async (alvo) => {
    const topic = alvo === 'home' || !TOPICS[alvo] ? null : alvo;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);

    try {
      const data = await buscarNoticias(topic, { signal: controller.signal });
      const recebidas = data.noticias || [];
      if (recebidas.length === 0) {
        flash('Nenhuma notícia encontrada');
        return;
      }

      let novo;
      if (topic) {
        const vistos = new Set(feedRef.current.map((n) => n.link));
        novo = [...recebidas.filter((n) => !vistos.has(n.link)), ...feedRef.current];
      } else {
        novo = recebidas;
      }
      feedRef.current = novo;
      setFeed(novo);

      const novaMeta = { curadoria: data.curadoria, totalFontes: data.totalFontes, geradoEm: data.geradoEm, briefing: data.briefing || null };
      setMeta({ ...novaMeta, ts: Date.now() });
      setCache(novo, novaMeta);
      flash(`${recebidas.length} notícias atualizadas`);
    } catch (err) {
      if (err.name === 'AbortError') return;
      flash('Falha ao buscar notícias');
    } finally {
      if (abortRef.current === controller) {
        setLoading(false);
        abortRef.current = null;
      }
    }
  }, [flash]);

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
    try {
      if (navigator.share) {
        await navigator.share({ title: noticia.titulo, text: noticia.titulo, url: noticia.link });
      } else {
        await navigator.clipboard.writeText(noticia.link);
        flash('Link copiado');
      }
    } catch { /* cancelado */ }
  }, [flash]);

  const limparSalvas = useCallback(() => {
    setSaved([]);
    persistSaved([]);
    flash('Salvas removidas');
  }, [flash]);

  const navigate = useCallback((alvo) => {
    setView(alvo);
    setExpanded(null);
    setSearch('');
  }, []);

  const isHome = view === 'home';
  const isTopic = TOPICS[view] != null;
  const isSalvos = view === 'salvos';

  const baseList = useMemo(() => {
    if (isSalvos) return [...saved].sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0));
    if (isTopic) return feed.filter((n) => n.topico === view);
    return feed;
  }, [isSalvos, isTopic, feed, saved, view]);

  const lista = useMemo(() => {
    let l = filtrarPorTexto(baseList, search);
    if (sort === 'impacto') l = ordenarPorImpacto(l);
    return l;
  }, [baseList, search, sort]);

  const sectionTitle = isHome ? 'A Capa' : isSalvos ? 'Notícias salvas' : topicMeta(view).long;
  const [lead, ...rest] = lista;

  const cellClass =
    'border-t border-[var(--color-border)] pt-6 lg:border-l lg:pl-7 ' +
    'lg:[&:nth-child(3n+1)]:border-l-0 lg:[&:nth-child(3n+1)]:pl-0';

  const renderBlock = (n, variant) => (
    <NewsBlock
      noticia={n}
      variant={variant}
      expanded={expanded === (n.link || n.titulo)}
      onToggle={() => setExpanded(expanded === (n.link || n.titulo) ? null : (n.link || n.titulo))}
      onSave={onSave}
      isSaved={isSaved(saved, n.link)}
      onShare={onShare}
    />
  );

  return (
    <div className="min-h-screen">
      <Masthead view={view} onNavigate={navigate} hora={hora} savedCount={saved.length} theme={theme} onToggleTheme={toggleTheme} />
      {loading && <div className="h-0.5 w-full animate-pulse bg-[var(--color-accent)]" />}

      <main className="mx-auto max-w-6xl px-4 pb-24 pt-5">
        {/* Capa (hero) — apenas na home */}
        {isHome && (
          <div className="mb-8">
            <Hero />
            <p className="mt-4 text-center font-[family-name:var(--font-serif)] text-[15px] italic text-[var(--color-ink-muted)]">
              {saudacao(hora)}, João Heitor.
            </p>
          </div>
        )}

        {/* Briefing do dia (quando a curadoria por IA está ativa) */}
        {isHome && meta?.briefing && (
          <section className="mb-9 border-l-2 border-[var(--color-rule)] pl-5">
            <h2 className="mb-2 font-[family-name:var(--font-sans)] text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-ink-faint)]">
              O resumo do dia
            </h2>
            {meta.briefing.split('\n').filter(Boolean).map((par, i) => (
              <p key={i} className="mb-2 font-[family-name:var(--font-serif)] text-[17px] leading-relaxed text-[var(--color-ink)]">
                {par}
              </p>
            ))}
          </section>
        )}

        {/* Cabeçalho da seção */}
        <div className="mb-5 flex items-end gap-4">
          <h1 className="font-[family-name:var(--font-serif)] text-[22px] font-bold tracking-tight text-[var(--color-ink)]">
            {sectionTitle}
          </h1>
          <span className="mb-1.5 h-px flex-1 bg-[var(--color-rule)]" />
          {isSalvos ? (
            saved.length > 0 && (
              <button
                onClick={limparSalvas}
                className="mb-1 font-[family-name:var(--font-sans)] text-[12px] font-semibold uppercase tracking-wide text-[var(--color-danger)] hover:underline"
              >
                Limpar tudo
              </button>
            )
          ) : (
            <button
              onClick={() => buscar(view)}
              disabled={loading}
              className="mb-1 flex items-center gap-1.5 border border-[var(--color-rule)] px-3.5 py-1.5 font-[family-name:var(--font-sans)] text-[12px] font-semibold uppercase tracking-wide text-[var(--color-ink)] transition-colors hover:bg-[var(--color-ink)] hover:text-[var(--color-bg)] disabled:opacity-40"
            >
              <span translate="no" className={`material-symbols-outlined text-[16px] ${loading ? 'animate-spin' : ''}`}>
                {loading ? 'progress_activity' : 'refresh'}
              </span>
              {loading ? 'Atualizando' : 'Atualizar'}
            </button>
          )}
        </div>

        {/* Controles: busca + ordenação */}
        {baseList.length > 0 && (
          <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="w-full sm:max-w-xs">
              <SearchBar value={search} onChange={setSearch} count={lista.length} />
            </div>
            {!isSalvos && (
              <div className="flex items-center gap-3 font-[family-name:var(--font-sans)] text-[12px]">
                <span className="uppercase tracking-wide text-[var(--color-ink-faint)]">Ordenar:</span>
                {[['relevancia', 'Relevância'], ['impacto', 'Impacto']].map(([key, lbl]) => (
                  <button
                    key={key}
                    onClick={() => setSort(key)}
                    className="font-semibold transition-colors"
                    style={{
                      color: sort === key ? 'var(--color-ink)' : 'var(--color-ink-faint)',
                      textDecoration: sort === key ? 'underline' : 'none',
                      textUnderlineOffset: '3px',
                    }}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            )}
            {meta?.ts && !isSalvos && (
              <span className="hidden font-[family-name:var(--font-sans)] text-[11px] text-[var(--color-ink-faint)] lg:block">
                Atualizado {tempoRelativo(meta.ts)}{meta.curadoria === 'ia' ? ' · curadoria IA' : ''}
              </span>
            )}
          </div>
        )}

        {/* Conteúdo */}
        {loading && feed.length === 0 ? (
          <div className="grid grid-cols-1 gap-x-7 gap-y-7 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : lista.length === 0 ? (
          <div className="flex flex-col items-center gap-3 border-t border-[var(--color-border)] py-20 text-center">
            <span translate="no" className="material-symbols-outlined text-4xl text-[var(--color-ink-faint)]">
              {isSalvos ? 'bookmark_border' : search ? 'search_off' : 'newspaper'}
            </span>
            <p className="font-[family-name:var(--font-serif)] text-[var(--color-ink-muted)]">
              {isSalvos ? 'Você ainda não salvou nenhuma notícia.'
                : search ? 'Nada encontrado para sua busca.'
                : isTopic ? `Sem notícias de ${topicMeta(view).long} no momento.`
                : 'Toque em "Atualizar" para carregar as notícias.'}
            </p>
            {!isSalvos && !search && (
              <button
                onClick={() => buscar(view)}
                className="mt-1 border border-[var(--color-rule)] px-4 py-2 font-[family-name:var(--font-sans)] text-[12px] font-semibold uppercase tracking-wide transition-colors hover:bg-[var(--color-ink)] hover:text-[var(--color-bg)]"
              >
                Atualizar agora
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Destaque */}
            {lead && (
              <div className="mb-8 border-b border-[var(--color-rule)] pb-8">
                {renderBlock(lead, 'lead')}
              </div>
            )}
            {/* Grade de blocos */}
            {rest.length > 0 && (
              <div className="grid grid-cols-1 gap-x-7 gap-y-7 md:grid-cols-2 lg:grid-cols-3">
                {rest.map((n) => (
                  <div key={n.link || n.titulo} className={cellClass}>
                    {renderBlock(n, 'standard')}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Rodapé editorial */}
        {meta?.totalFontes && (
          <footer className="mt-16 border-t-2 border-[var(--color-rule)] pt-4 text-center font-[family-name:var(--font-sans)] text-[11px] uppercase tracking-wide text-[var(--color-ink-faint)]">
            Tech News Agent · {meta.totalFontes} fontes · curadoria {meta.curadoria === 'ia' ? 'por IA' : 'automática'}
          </footer>
        )}
      </main>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 border border-[var(--color-rule)] bg-[var(--color-ink)] px-5 py-2.5 font-[family-name:var(--font-sans)] text-[13px] font-medium text-[var(--color-bg)] shadow-lg animate-[var(--animate-fade-up)]">
          {toast}
        </div>
      )}
    </div>
  );
}
