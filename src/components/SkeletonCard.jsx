// Placeholder de bloco editorial durante o carregamento.
export default function SkeletonCard() {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="aspect-[3/2] w-full bg-[var(--color-section)] animate-pulse" />
      <div className="h-2.5 w-20 bg-[var(--color-section)] animate-pulse" />
      <div className="h-4 w-11/12 bg-[var(--color-section)] animate-pulse" />
      <div className="h-4 w-3/4 bg-[var(--color-section)] animate-pulse" />
      <div className="h-3 w-full bg-[var(--color-section)] animate-pulse" />
      <div className="h-3 w-5/6 bg-[var(--color-section)] animate-pulse" />
    </div>
  );
}
