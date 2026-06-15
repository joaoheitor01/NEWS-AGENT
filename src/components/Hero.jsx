// Capa (hero) — banner cinematográfico. A foto do cavaleiro é carregada de
// /hero.jpg; se ainda não existir, um gradiente preto elegante assume o lugar.
export default function Hero() {
  return (
    <section className="relative overflow-hidden rounded-sm border border-[var(--color-border)] bg-[#0a0a0a] text-white">
      {/* Fundo: imagem à direita + degradê para a esquerda (legibilidade do texto) */}
      <div className="absolute inset-0" aria-hidden="true">
        <div
          className="absolute inset-0 bg-cover bg-no-repeat"
          style={{ backgroundImage: 'url(/hero.jpg)', backgroundPosition: 'right center' }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, #0a0a0a 0%, rgba(10,10,10,0.94) 28%, rgba(10,10,10,0.55) 55%, rgba(10,10,10,0.05) 82%, rgba(10,10,10,0) 100%)',
          }}
        />
      </div>

      {/* Texto */}
      <div className="relative flex min-h-[380px] flex-col justify-between gap-10 p-7 sm:p-10 md:min-h-[460px] md:p-14 md:max-w-[62%]">
        <div className="flex flex-col gap-5">
          <h1 className="font-[family-name:var(--font-serif)] text-3xl leading-[1.06] tracking-[-0.01em] sm:text-4xl md:text-5xl">
            O sinal em meio ao ruído
          </h1>
          <div className="flex flex-col gap-2">
            <span className="font-[family-name:var(--font-sans)] text-[11px] font-semibold uppercase tracking-[0.32em] text-white/70">
              Curated Intelligence
            </span>
            <p className="font-[family-name:var(--font-serif)] text-base text-white/85 md:text-lg">
              Curadoria das notícias de tecnologia que realmente importam.
            </p>
          </div>
        </div>

        <blockquote className="border-l border-white/30 pl-4 font-[family-name:var(--font-serif)] text-sm italic text-white/65 md:text-[15px]">
          “O futuro já chegou. Só não está igualmente distribuído.”
          <cite className="mt-1.5 block font-[family-name:var(--font-sans)] text-[10px] not-italic uppercase tracking-[0.2em] text-white/45">
            — William Gibson
          </cite>
        </blockquote>
      </div>
    </section>
  );
}
