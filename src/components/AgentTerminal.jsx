import { useEffect, useRef } from 'react';

const DEFAULT_LINES = [
  'inicializando neural news crawler...',
  'varrendo dezenas de fontes em busca de sinais',
  'aguardando trigger manual...',
];

// "Live Agent Stream" — log estilizado das ações do agente.
export default function AgentTerminal({ log, loading }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [log]);

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-4 shadow-inner">
      <div className="mb-2 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-[var(--color-success)] animate-[var(--animate-pulse-dot)]" />
        <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-success)]/80">
          Live Agent Stream
        </span>
      </div>
      <div
        ref={ref}
        className="max-h-36 overflow-y-auto font-[family-name:var(--font-mono)] text-[13px] leading-relaxed text-[var(--color-success)]/90 no-scrollbar"
      >
        {log.length === 0
          ? DEFAULT_LINES.map((l, i) => (
              <p key={i} className={i === DEFAULT_LINES.length - 1 ? 'animate-[var(--animate-blink)]' : ''}>
                &gt; {l}
              </p>
            ))
          : log.map((l) => <p key={l.id}>&gt; {l.msg}</p>)}
        {loading && <p className="animate-[var(--animate-blink)]">&gt; processando<span>_</span></p>}
      </div>
    </div>
  );
}
