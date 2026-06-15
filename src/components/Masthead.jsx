import { TOPICS } from '../lib/topics';
import Logo from './Logo';

// Cabeçalho/nameplate de jornal + navegação horizontal de seções (sticky).
export default function Masthead({ view, onNavigate, hora, savedCount, theme, onToggleTheme }) {
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
      {/* Linha superior: data + nameplate + tema */}
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 pt-2.5 pb-1.5">
        <span className="w-10 sm:w-40 font-[family-name:var(--font-sans)] text-[11px] uppercase tracking-wide text-[var(--color-ink-faint)]">
          <span className="hidden sm:inline">{dataExtenso}</span>
        </span>
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 text-[var(--color-ink)]"
          aria-label="Início — Tech News Agent"
        >
          <Logo className="h-7 w-auto sm:h-8" />
          <span className="font-[family-name:var(--font-serif)] text-2xl font-bold tracking-[-0.01em] sm:text-3xl">
            Tech News Agent
          </span>
        </button>
        <div className="flex w-10 sm:w-40 items-center justify-end">
          <button
            onClick={onToggleTheme}
            className="flex items-center rounded-full p-2 text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-section)] hover:text-[var(--color-ink)]"
            aria-label={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
            title={theme === 'dark' ? 'Tema claro' : 'Tema escuro'}
          >
            <span translate="no" className="material-symbols-outlined text-[20px]">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
        </div>
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
