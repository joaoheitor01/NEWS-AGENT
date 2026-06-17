import { useState } from 'react';
import { topicMeta } from '../lib/topics';
import { tempoRelativo, linkSeguro, truncar } from '../lib/format';
import Logo from './Logo';

// Bloco editorial de notícia. variant: 'lead' (destaque) | 'standard'.
export default function NewsBlock({ noticia, variant = 'standard', expanded, onToggle, onSave, isSaved, onShare }) {
  const [imgErro, setImgErro] = useState(false);
  const secao = topicMeta(noticia.topico).long;
  const temImagem = noticia.imagem && !imgErro;
  const isLead = variant === 'lead';
  const href = linkSeguro(noticia.link);
  const tituloTxt = noticia.emoji ? `${noticia.emoji} ${noticia.titulo}` : noticia.titulo;

  // "Por dentro da notícia" (estilo briefing) — só quando há pontos e está expandido.
  const Pontos = expanded && noticia.pontos?.length > 0 ? (
    <div className="mt-1 flex flex-col gap-2">
      <span className="font-[family-name:var(--font-sans)] text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-ink-faint)]">
        🔍 Por dentro da notícia
      </span>
      <ul className="flex flex-col gap-1.5">
        {noticia.pontos.map((p, i) => (
          <li key={i} className="font-[family-name:var(--font-serif)] text-[14px] leading-relaxed text-[var(--color-ink-muted)]">
            {p.rotulo && <strong className="font-semibold text-[var(--color-ink)]">{p.rotulo}: </strong>}
            {p.texto}
          </li>
        ))}
      </ul>
    </div>
  ) : null;

  const Kicker = (
    <div className="flex items-center gap-2 font-[family-name:var(--font-sans)] text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-accent)]">
      <span>{secao}</span>
      {noticia.impacto === 'alto' && (
        <span className="text-[var(--color-danger)]">• Destaque</span>
      )}
    </div>
  );

  // Sempre renderiza um bloco de imagem: a foto real ou, quando ausente/quebrada,
  // um fallback neutro (logo TNA sobre um leve gradiente do tema). Mesma proporção
  // nos dois casos, então o layout do card não muda de altura.
  const Imagem = temImagem ? (
    <div className={`overflow-hidden bg-[var(--color-section)] ${isLead ? 'aspect-[16/9]' : 'aspect-[3/2]'}`}>
      <img
        src={noticia.imagem}
        alt=""
        loading="lazy"
        onError={() => setImgErro(true)}
        className="h-full w-full object-cover grayscale-[15%] transition-all duration-300 group-hover:grayscale-0 group-hover:scale-[1.02]"
      />
    </div>
  ) : (
    <div
      aria-hidden="true"
      className={`flex items-center justify-center overflow-hidden border border-[var(--color-border)] ${isLead ? 'aspect-[16/9]' : 'aspect-[3/2]'}`}
      style={{ backgroundImage: 'linear-gradient(135deg, var(--color-section) 0%, var(--color-bg) 100%)' }}
    >
      <Logo className={`w-auto text-[var(--color-ink-faint)] opacity-40 ${isLead ? 'h-12' : 'h-9'}`} />
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
        <div className="md:order-2">{Imagem}</div>
        <div className="flex flex-col gap-3 md:order-1 md:self-center">
          {Kicker}
          <h2 className="font-[family-name:var(--font-serif)] text-[26px] sm:text-[32px] font-semibold leading-[1.12] tracking-[-0.01em] text-[var(--color-ink)] group-hover:text-black">
            {tituloTxt}
          </h2>
          <p className="font-[family-name:var(--font-serif)] text-[16px] leading-relaxed text-[var(--color-ink-muted)]">
            {expanded ? noticia.resumo : truncar(noticia.resumo, 240)}
          </p>
          {Pontos}
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
        {tituloTxt}
      </h3>
      <p className="font-[family-name:var(--font-serif)] text-[14.5px] leading-relaxed text-[var(--color-ink-muted)]">
        {expanded ? noticia.resumo : truncar(noticia.resumo, 170)}
      </p>
      {Pontos}
      {Byline}
      {Acoes}
    </article>
  );
}
