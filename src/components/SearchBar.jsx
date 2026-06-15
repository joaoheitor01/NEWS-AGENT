// Busca textual instantânea (estilo editorial, sublinhado discreto).
export default function SearchBar({ value, onChange, count }) {
  return (
    <div className="flex items-center gap-2 border-b border-[var(--color-rule)] py-1.5 focus-within:border-[var(--color-accent)]">
      <span translate="no" className="material-symbols-outlined text-[20px] text-[var(--color-ink-faint)]">search</span>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar nas notícias…"
        className="flex-1 bg-transparent font-[family-name:var(--font-sans)] text-[14px] text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:outline-none"
        aria-label="Buscar nas notícias"
      />
      {value && (
        <>
          <span className="font-[family-name:var(--font-sans)] text-[12px] text-[var(--color-ink-faint)]">{count}</span>
          <button
            onClick={() => onChange('')}
            translate="no"
            className="material-symbols-outlined text-[18px] text-[var(--color-ink-faint)] hover:text-[var(--color-ink)]"
            aria-label="Limpar busca"
          >
            close
          </button>
        </>
      )}
    </div>
  );
}
