// Busca textual instantânea sobre as notícias já carregadas.
export default function SearchBar({ value, onChange, count }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5 focus-within:border-[var(--color-brand)] transition-colors">
      <span className="material-symbols-outlined text-xl text-[var(--color-ink-faint)]">search</span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Filtrar notícias carregadas…"
        className="flex-1 bg-transparent text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:outline-none"
        aria-label="Filtrar notícias"
      />
      {value && (
        <>
          <span className="text-xs text-[var(--color-ink-faint)]">{count}</span>
          <button
            onClick={() => onChange('')}
            className="material-symbols-outlined text-lg text-[var(--color-ink-faint)] hover:text-[var(--color-ink)]"
            aria-label="Limpar busca"
          >
            close
          </button>
        </>
      )}
    </div>
  );
}
