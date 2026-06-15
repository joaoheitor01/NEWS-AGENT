import { useState } from 'react';
import { topicMeta } from '../lib/topics';
import { tempoRelativo } from '../lib/format';

const IMPACTO_STYLE = {
  alto:  { label: 'ALTO',  bg: 'rgba(255,107,133,0.14)', fg: '#ff8fa3' },
  médio: { label: 'MÉDIO', bg: 'rgba(255,209,102,0.14)', fg: '#ffd166' },
  medio: { label: 'MÉDIO', bg: 'rgba(255,209,102,0.14)', fg: '#ffd166' },
  baixo: { label: 'BAIXO', bg: 'rgba(92,200,255,0.12)',  fg: '#5cc8ff' },
};

export default function NewsCard({ noticia, expanded, onToggle, onSave, isSaved, onShare }) {
  const [imgErro, setImgErro] = useState(false);
  const topo = topicMeta(noticia.topico);
  const impacto = IMPACTO_STYLE[noticia.impacto] || IMPACTO_STYLE['médio'];
  const temImagem = noticia.imagem && !imgErro;

  return (
    <article
      onClick={onToggle}
      className="group relative flex items-stretch gap-0 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] transition-all duration-200 hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-2)] cursor-pointer animate-[var(--animate-fade-up)]"
    >
      {/* Barra de acento por tópico */}
      <span className="w-1 shrink-0" style={{ backgroundColor: topo.color }} aria-hidden="true" />

      {/* Thumbnail */}
      <div className="hidden sm:flex w-24 md:w-28 shrink-0 items-center justify-center border-r border-[var(--color-border)] bg-[var(--color-surface-2)] overflow-hidden">
        {temImagem ? (
          <img
            src={noticia.imagem}
            alt=""
            loading="lazy"
            onError={() => setImgErro(true)}
            className="h-full w-full object-cover opacity-90 transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span
            className="material-symbols-outlined text-3xl"
            style={{ color: topo.color }}
            aria-hidden="true"
          >
            {topo.icon}
          </span>
        )}
      </div>

      {/* Conteúdo */}
      <div className="flex flex-1 flex-col gap-1.5 p-4 min-w-0">
        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest">
          <span style={{ color: topo.color }}>{noticia.fonte || 'TECH'}</span>
          <span className="text-[var(--color-ink-faint)]">{noticia.pais === 'US' ? '🌐' : '🇧🇷'}</span>
          <span
            className="rounded-full px-2 py-0.5 leading-none"
            style={{ backgroundColor: impacto.bg, color: impacto.fg }}
          >
            {impacto.label}
          </span>
          <span className="ml-auto font-normal text-[var(--color-ink-faint)] normal-case tracking-normal">
            {tempoRelativo(noticia.data)}
          </span>
        </div>

        <h3
          className="font-[family-name:var(--font-display)] text-base md:text-lg font-semibold leading-snug text-[var(--color-ink)] transition-colors group-hover:text-white"
        >
          {noticia.titulo}
        </h3>

        <p className={`text-sm leading-relaxed text-[var(--color-ink-muted)] ${expanded ? '' : 'line-clamp-2'}`}>
          {noticia.resumo}
        </p>

        {expanded && (
          <div className="mt-2 flex flex-wrap items-center gap-2 animate-[var(--animate-fade-up)]">
            <a
              href={noticia.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-all hover:brightness-125"
              style={{ color: topo.color, borderColor: topo.color, backgroundColor: `${topo.color}1a` }}
            >
              <span className="material-symbols-outlined text-base">open_in_new</span>
              Ler completa
            </a>
            {onShare && (
              <button
                onClick={(e) => { e.stopPropagation(); onShare(noticia); }}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border-strong)] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[var(--color-ink-muted)] transition-all hover:bg-white/5"
              >
                <span className="material-symbols-outlined text-base">share</span>
                Compartilhar
              </button>
            )}
          </div>
        )}
      </div>

      {/* Salvar */}
      <button
        onClick={(e) => { e.stopPropagation(); onSave(noticia); }}
        className="shrink-0 px-3 text-[var(--color-ink-muted)] transition-all hover:text-[var(--color-brand)] hover:scale-110"
        aria-pressed={isSaved}
        aria-label={isSaved ? 'Remover dos salvos' : 'Salvar notícia'}
        title={isSaved ? 'Remover dos salvos' : 'Salvar notícia'}
      >
        <span
          className="material-symbols-outlined"
          style={{ fontVariationSettings: `'FILL' ${isSaved ? 1 : 0}`, color: isSaved ? 'var(--color-brand)' : undefined }}
        >
          bookmark
        </span>
      </button>
    </article>
  );
}
