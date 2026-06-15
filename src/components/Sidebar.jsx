import { TOPICS } from '../lib/topics';

function NavItem({ active, icon, label, color, badge, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left transition-all"
      style={{
        backgroundColor: active ? `${color}1f` : 'transparent',
        borderLeft: `3px solid ${active ? color : 'transparent'}`,
        color: active ? color : 'var(--color-ink-muted)',
      }}
    >
      <span className="material-symbols-outlined text-xl">{icon}</span>
      <span className="font-[family-name:var(--font-display)] text-sm font-semibold uppercase tracking-widest">
        {label}
      </span>
      {badge > 0 && (
        <span className="ml-auto rounded-full bg-[var(--color-brand)] px-2 py-0.5 text-[10px] font-bold text-black">
          {badge}
        </span>
      )}
    </button>
  );
}

export default function Sidebar({ view, onNavigate, savedCount }) {
  return (
    <aside className="hidden md:flex fixed left-0 top-0 z-40 h-screen w-60 lg:w-72 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)]/70 backdrop-blur-xl">
      <button
        onClick={() => onNavigate('home')}
        className="flex items-center gap-2.5 px-6 py-5 text-left"
      >
        <span className="material-symbols-outlined text-2xl text-[var(--color-brand)]">graph_3</span>
        <span className="font-[family-name:var(--font-display)] text-lg font-bold tracking-tight text-[var(--color-brand)]">
          TECH NEWS<span className="text-[var(--color-ink)]"> AGENT</span>
        </span>
      </button>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-2 no-scrollbar">
        <NavItem
          active={view === 'home'}
          icon="bolt"
          label="Início"
          color="var(--color-brand)"
          onClick={() => onNavigate('home')}
        />
        <div className="my-2 px-4 text-[10px] font-bold uppercase tracking-widest text-[var(--color-ink-faint)]">
          Tópicos
        </div>
        {Object.entries(TOPICS).map(([key, t]) => (
          <NavItem
            key={key}
            active={view === key}
            icon={t.icon}
            label={t.label}
            color={t.color}
            onClick={() => onNavigate(key)}
          />
        ))}
      </nav>

      <div className="border-t border-[var(--color-border)] p-3">
        <NavItem
          active={view === 'salvos'}
          icon="bookmark"
          label="Salvas"
          color="var(--color-brand)"
          badge={savedCount}
          onClick={() => onNavigate('salvos')}
        />
      </div>
    </aside>
  );
}
