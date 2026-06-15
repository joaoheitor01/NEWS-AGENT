import { TOPICS } from '../lib/topics';

// Barra de navegação inferior (mobile). Mostra Início, alguns tópicos e Salvas.
const QUICK = ['ia', 'hardware', 'cyber'];

export default function MobileNav({ view, onNavigate, savedCount }) {
  const items = [
    { key: 'home', icon: 'bolt', label: 'Início', color: 'var(--color-brand)' },
    ...QUICK.map((k) => ({ key: k, icon: TOPICS[k].icon, label: TOPICS[k].label, color: TOPICS[k].color })),
    { key: 'salvos', icon: 'bookmark', label: 'Salvas', color: 'var(--color-brand)', badge: savedCount },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-stretch border-t border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
      {items.map((it) => {
        const active = view === it.key;
        return (
          <button
            key={it.key}
            onClick={() => onNavigate(it.key)}
            aria-current={active ? 'page' : undefined}
            className="relative flex flex-1 flex-col items-center gap-0.5 py-2.5 transition-colors"
            style={{ color: active ? it.color : 'var(--color-ink-faint)' }}
          >
            <span className="material-symbols-outlined text-[22px]"
              style={{ fontVariationSettings: `'FILL' ${active ? 1 : 0}` }}>
              {it.icon}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wide">{it.label}</span>
            {it.badge > 0 && (
              <span className="absolute right-1/4 top-1.5 rounded-full bg-[var(--color-brand)] px-1.5 text-[9px] font-bold text-black">
                {it.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
