import { TOPICS } from '../lib/topics';

// Cabeçalho/nameplate de jornal + navegação horizontal de seções (sticky).
export default function Masthead({ view, onNavigate, hora, savedCount }) {
  const dataExtenso = hora.toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
  });

  const sections = [
    { key: 'home', label: 'Capa' },
    ...Object.entries(TOPICS).map(([key, t]) => ({ key, label: t.label })),
    { key: 'salvos', label: `Salvas${savedCount ? ` (${savedCount})` : ''}` },
  ];

  return (
    <header className="sticky top-0 z-30 border-b-2 border-[var(--color-rule)] bg-[var(--color-bg)]/97 backdrop-blur">
      {/* Linha superior: data + nameplate */}
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 pt-2.5 pb-1.5">
        <span className="hidden sm:block w-40 font-[family-name:var(--font-sans)] text-[11px] uppercase tracking-wide text-[var(--color-ink-faint)]">
          {dataExtenso}
        </span>
        <button
          onClick={() => onNavigate('home')}
          className="font-[family-name:var(--font-serif)] text-2xl sm:text-3xl font-bold tracking-[-0.01em] text-[var(--color-ink)]"
          aria-label="Início"
        >
          Tech News Agent
        </button>
        <span className="hidden sm:block w-40 text-right font-[family-name:var(--font-sans)] text-[11px] uppercase tracking-wide text-[var(--color-ink-faint)]">
          Edição digital
        </span>
      </div>

      {/* Navegação de seções */}
      <nav className="border-t border-[var(--color-border)]">
        <div className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-2 no-scrollbar">
          {sections.map((s) => {
            const active = view === s.key;
            return (
              <button
                key={s.key}
                onClick={() => onNavigate(s.key)}
                aria-current={active ? 'page' : undefined}
                className="relative whitespace-nowrap px-3 py-2 font-[family-name:var(--font-sans)] text-[13px] font-semibold transition-colors"
                style={{ color: active ? 'var(--color-ink)' : 'var(--color-ink-muted)' }}
              >
                {s.label}
                {active && (
                  <span className="absolute inset-x-2 -bottom-px h-0.5 bg-[var(--color-ink)]" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
