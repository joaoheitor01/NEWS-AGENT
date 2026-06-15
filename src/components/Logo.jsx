// Monograma TNA (recriação vetorial adaptável ao tema via currentColor).
// Para usar a arte exata: troque por <img src="/logo.png"> claro / "/logo-dark.png" escuro.
export default function Logo({ className = '', title = 'Tech News Agent' }) {
  return (
    <svg viewBox="0 0 132 92" className={className} role="img" aria-label={title} fill="none">
      {/* órbita / sinal */}
      <path d="M8 58 C 44 45, 88 45, 124 38" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="8" cy="58" r="3.1" fill="currentColor" />
      <circle cx="124" cy="38" r="3.1" fill="currentColor" />
      {/* monograma */}
      <text
        x="66" y="64" textAnchor="middle"
        fontFamily="var(--font-serif)" fontWeight="700" fontSize="56" letterSpacing="-6"
        fill="currentColor"
      >
        TNA
      </text>
    </svg>
  );
}
