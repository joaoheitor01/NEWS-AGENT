// Placeholder animado exibido durante o carregamento.
export default function SkeletonCard() {
  return (
    <div className="flex items-stretch overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
      <span className="w-1 shrink-0 bg-[var(--color-border-strong)]" />
      <div className="hidden sm:block w-24 md:w-28 shrink-0 bg-[var(--color-surface-2)] animate-pulse" />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="h-2.5 w-32 rounded bg-[var(--color-surface-3)] animate-pulse" />
        <div className="h-4 w-4/5 rounded bg-[var(--color-surface-3)] animate-pulse" />
        <div className="h-3 w-full rounded bg-[var(--color-surface-2)] animate-pulse" />
        <div className="h-3 w-2/3 rounded bg-[var(--color-surface-2)] animate-pulse" />
      </div>
    </div>
  );
}
