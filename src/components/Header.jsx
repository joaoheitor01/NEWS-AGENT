// Barra superior fixa. Marca (mobile) à esquerda, relógio à direita.
export default function Header({ hora, onHome }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 px-4 py-3 backdrop-blur-xl md:left-60 lg:left-72">
      <button
        onClick={onHome}
        className="flex items-center gap-2 md:invisible"
        aria-label="Ir para o início"
      >
        <span className="material-symbols-outlined text-xl text-[var(--color-brand)]">graph_3</span>
        <span className="font-[family-name:var(--font-display)] text-base font-bold tracking-tight text-[var(--color-brand)]">
          TECH NEWS<span className="text-[var(--color-ink)]"> AGENT</span>
        </span>
      </button>

      <div className="flex items-center gap-2 font-[family-name:var(--font-display)] tabular-nums">
        <span className="text-base font-bold tracking-tight text-[var(--color-ink)]">
          {hora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </span>
        <span className="hidden sm:inline text-xs uppercase tracking-widest text-[var(--color-ink-faint)]">
          {hora.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}
        </span>
      </div>
    </header>
  );
}
