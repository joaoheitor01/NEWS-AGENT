// Capa (hero) — carrossel cinematográfico. Cada slide (imagem + frase + citação)
// vem de `src/lib/heroSlides.js`. Troca sozinho a cada INTERVALO_MS e também é
// navegável manualmente pelas setas e bolinhas. Implementado só com React + CSS
// (sem biblioteca externa).
import { useEffect, useState, useCallback } from 'react';
import { HERO_SLIDES } from '../lib/heroSlides';

// A cada quantos milissegundos o carrossel avança sozinho.
const INTERVALO_MS = 8000;

// Deriva o caminho do .jpg de reserva a partir do .webp do slide.
const fallbackJpg = (webp) => webp.replace(/\.webp$/i, '.jpg');

const GRADIENTE =
  'linear-gradient(90deg, #0a0a0a 0%, rgba(10,10,10,0.94) 28%, rgba(10,10,10,0.55) 55%, rgba(10,10,10,0.05) 82%, rgba(10,10,10,0) 100%)';

export default function Hero() {
  const slides = HERO_SLIDES;
  const total = slides.length;
  const [atual, setAtual] = useState(0);

  // Acessibilidade: respeita prefers-reduced-motion — sem autoplay e sem fade.
  const [reduzir, setReduzir] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const aplicar = () => setReduzir(mq.matches);
    aplicar();
    mq.addEventListener?.('change', aplicar);
    return () => mq.removeEventListener?.('change', aplicar);
  }, []);

  // Vai para um índice qualquer (com loop infinito).
  const irPara = useCallback((i) => setAtual(((i % total) + total) % total), [total]);

  // Autoplay: o timer é recriado sempre que `atual` muda. Como a navegação
  // manual também muda `atual`, um clique nas setas/bolinhas reinicia a contagem
  // a partir daquele ponto (não troca de slide logo em seguida).
  useEffect(() => {
    if (reduzir || total <= 1) return undefined;
    const id = setTimeout(() => setAtual((a) => (a + 1) % total), INTERVALO_MS);
    return () => clearTimeout(id);
  }, [atual, reduzir, total]);

  return (
    <section
      className="relative overflow-hidden rounded-sm border border-[var(--color-border)] bg-[#0a0a0a] text-white"
      aria-roledescription="carrossel"
      aria-label="Destaques da capa"
    >
      {slides.map((s, i) => {
        const ativo = i === atual;
        return (
          <div
            // O slide ativo fica em fluxo (`relative`) e define a altura da capa;
            // os demais ficam sobrepostos (`absolute`) e invisíveis.
            key={s.imagem}
            className={
              (ativo ? 'relative' : 'absolute inset-0') +
              (reduzir ? '' : ' transition-opacity duration-700 ease-in-out')
            }
            style={{ opacity: ativo ? 1 : 0, pointerEvents: ativo ? 'auto' : 'none' }}
            aria-hidden={!ativo}
          >
            {/* Fundo: imagem à direita + degradê para a esquerda (legibilidade) */}
            <div className="absolute inset-0" aria-hidden="true">
              <picture>
                <source srcSet={s.imagem} type="image/webp" />
                <img
                  src={fallbackJpg(s.imagem)}
                  alt=""
                  loading={i === 0 ? 'eager' : 'lazy'}
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{ objectPosition: 'right center' }}
                />
              </picture>
              <div className="absolute inset-0" style={{ background: GRADIENTE }} />
            </div>

            {/* Texto do slide (troca junto com a imagem) */}
            <div className="relative flex min-h-[380px] flex-col justify-between gap-10 p-7 sm:p-10 md:min-h-[460px] md:p-14 md:max-w-[62%]">
              <div className="flex flex-col gap-5">
                <h1 className="font-[family-name:var(--font-serif)] text-3xl leading-[1.06] tracking-[-0.01em] sm:text-4xl md:text-5xl">
                  {s.frase}
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

              {s.citacao && (
                <blockquote className="border-l border-white/30 pl-4 font-[family-name:var(--font-serif)] text-sm italic text-white/65 md:text-[15px]">
                  “{s.citacao}”
                  {s.autorCitacao && (
                    <cite className="mt-1.5 block font-[family-name:var(--font-sans)] text-[10px] not-italic uppercase tracking-[0.2em] text-white/45">
                      — {s.autorCitacao}
                    </cite>
                  )}
                </blockquote>
              )}
            </div>
          </div>
        );
      })}

      {/* Controles de navegação (só se houver mais de um slide) */}
      {total > 1 && (
        <div
          className="absolute bottom-4 right-4 z-10 flex items-center gap-3 md:bottom-6 md:right-6"
          style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.7))' }}
        >
          <button
            type="button"
            onClick={() => irPara(atual - 1)}
            aria-label="Slide anterior"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white/85 backdrop-blur-sm transition-colors hover:bg-black/55 hover:text-white"
          >
            <span translate="no" className="material-symbols-outlined text-[20px]">chevron_left</span>
          </button>

          <div className="flex items-center gap-2">
            {slides.map((s, i) => (
              <button
                key={s.imagem}
                type="button"
                onClick={() => irPara(i)}
                aria-label={`Ir para o slide ${i + 1}`}
                aria-current={i === atual}
                className="h-2 rounded-full transition-all"
                style={{
                  width: i === atual ? '1.25rem' : '0.5rem',
                  backgroundColor: i === atual ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.4)',
                }}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => irPara(atual + 1)}
            aria-label="Próximo slide"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white/85 backdrop-blur-sm transition-colors hover:bg-black/55 hover:text-white"
          >
            <span translate="no" className="material-symbols-outlined text-[20px]">chevron_right</span>
          </button>
        </div>
      )}
    </section>
  );
}
