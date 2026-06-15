import { useState } from 'react';
import { topicMeta } from '../lib/topics';
import { tempoRelativo, linkSeguro } from '../lib/format';

// Bloco editorial de notícia. variant: 'lead' (destaque) | 'standard'.
export default function NewsBlock({ noticia, variant = 'standard', expanded, onToggle, onSave, isSaved, onShare }) {
  const [imgErro, setImgErro] = useState(false);
  const secao = topicMeta(noticia.topico).long;
  const temImagem = noticia.imagem && !imgErro;
  const isLead = variant === 'lead';
  const href = linkSeguro(noticia.link);

  const Kicker = (
    <div className="flex items-center gap-2 font-[family-name:var(--font-sans)] text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-accent)]">
      <span>{secao}</span>
      {noticia.impacto === 'alto' && (
        <span className="text-[var(--color-danger)]">• Destaque</span>
      )}
    </div>
  );

  const Imagem = temImagem && (
    <div className={`overflow-hidden bg-[var(--color-section)] ${isLead ? 'aspect-[16/9]' : 'aspect-[3/2]'}`}>
      <img
        src={noticia.imagem}
        alt=""
        loading="lazy"
        onError={() => setImgErro(true)}
        className="h-full w-full object-cover grayscale-[15%] transition-all duration-300 group-hover:grayscale-0 group-hover:scale-[1.02]"
      />
    </div>
  );

  const Byline = (
    <div className="font-[family-name:var(--font-sans)] text-[12px] text-[var(--color-ink-faint)]">
      <span className="font-semibold text-[var(--color-ink-muted)]">{noticia.fonte}</span>
      <span className="mx-1.5">·</span>
      <span>{tempoRelativo(noticia.data)}</span>
      <span className="mx-1.5">·</span>
      <span>{noticia.pais === 'US' ? 'Internacional' : 'Brasil'}</span>
    </div>
  );

  const Acoes = (
    <div className="mt-1 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
      {href && (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-[family-name:var(--font-sans)] text-[12px] font-semibold uppercase tracking-wide text-[var(--color-accent)] hover:underline"
        >
          Ler artigo ↗
        </a>
      )}
      {href && <span className="mx-1 text-[var(--color-border)]">|</span>}
      <button
        onClick={() => onSave(noticia)}
        className="flex items-center text-[var(--color-ink-faint)] transition-colors hover:text-[var(--color-ink)]"
        aria-pressed={isSaved}
        aria-label={isSaved ? 'Remover dos salvos' : 'Salvar'}
        title={isSaved ? 'Remover dos salvos' : 'Salvar'}
      >
        <span translate="no" className="material-symbols-outlined text-[18px]"
          style={{ fontVariationSettings: `'FILL' ${isSaved ? 1 : 0}` }}>
          bookmark
        </span>
      </button>
      {onShare && (
        <button
          onClick={() => onShare(noticia)}
          className="flex items-center text-[var(--color-ink-faint)] transition-colors hover:text-[var(--color-ink)]"
          aria-label="Compartilhar"
          title="Compartilhar"
        >
          <span translate="no" className="material-symbols-outlined text-[18px]">share</span>
        </button>
      )}
    </div>
  );

  // ---- LEAD (destaque, full width) ----
  if (isLead) {
    return (
      <article
        onClick={onToggle}
        className="group grid cursor-pointer gap-x-8 gap-y-4 md:grid-cols-2 animate-[var(--animate-fade-up)]"
      >
        {Imagem && <div className="md:order-2">{Imagem}</div>}
        <div className="flex flex-col gap-3 md:order-1 md:self-center">
          {Kicker}
          <h2 className="font-[family-name:var(--font-serif)] text-[26px] sm:text-[32px] font-semibold leading-[1.12] tracking-[-0.01em] text-[var(--color-ink)] group-hover:text-black">
            {noticia.titulo}
          </h2>
          <p className={`font-[family-name:var(--font-serif)] text-[16px] leading-relaxed text-[var(--color-ink-muted)] ${expanded ? '' : 'line-clamp-3'}`}>
            {noticia.resumo}
          </p>
          {Byline}
          {Acoes}
        </div>
      </article>
    );
  }

  // ---- STANDARD (bloco da grade) ----
  return (
    <article
      onClick={onToggle}
      className="group flex cursor-pointer flex-col gap-2 animate-[var(--animate-fade-up)]"
    >
      {Imagem}
      {Kicker}
      <h3 className="font-[family-name:var(--font-serif)] text-[19px] font-semibold leading-[1.2] text-[var(--color-ink)] group-hover:underline decoration-1 underline-offset-2">
        {noticia.titulo}
      </h3>
      <p className={`font-[family-name:var(--font-serif)] text-[14.5px] leading-relaxed text-[var(--color-ink-muted)] ${expanded ? '' : 'line-clamp-3'}`}>
        {noticia.resumo}
      </p>
      {Byline}
      {Acoes}
    </article>
  );
}
