import { useState, useEffect, useRef } from "react";

const TOPICS = {
  ia: { label: "AI", shortLabel: "Inteligência Artificial", icon: "sensors" },
  hardware: { label: "HARDWARE", shortLabel: "Hardware", icon: "developer_board" },
  cyber: { label: "CYBER", shortLabel: "Cibersegurança", icon: "security" },
  chips: { label: "CHIPS", shortLabel: "Semicondutores", icon: "memory" },
  web3: { label: "WEB3", shortLabel: "Web3", icon: "language" },
};

const CATEGORY_COLORS = {
  "AI & Neural Labs": { primary: "#c4c0ff", dark: "#8881ff" },
  "Cybersecurity": { primary: "#ffb86f", dark: "#cf7e12" },
  "Hardware / Chips": { primary: "#c8c6c8", dark: "#474649" },
};

function NewsCard({ noticia, index, onExpand, expanded, onSave, isSaved, showBookmark = false }) {
  const categoryColor = CATEGORY_COLORS[noticia.empresa] || { primary: "#c4c0ff", dark: "#8881ff" };
  
  return (
    <article className="group flex items-stretch bg-surface-container-low border border-white/5 rounded-xl overflow-hidden hover:bg-surface-container transition-all cursor-pointer">
      <div className="w-1.5" style={{ backgroundColor: categoryColor.primary }}></div>
      <div className="p-sm flex items-center justify-center bg-surface-container-high border-r border-white/5">
        <div className="w-12 h-12 flex items-center justify-center rounded-lg" style={{ backgroundColor: `${categoryColor.primary}33`, color: categoryColor.primary }}>
          <span className="material-symbols-outlined" data-weight="fill">{noticia.icon || "sensors"}</span>
        </div>
      </div>
      <div className="p-md flex flex-col flex-1 gap-xs">
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: categoryColor.primary }}>
            {noticia.empresa || "TECH"}
          </span>
          <span className="text-[10px] text-on-surface-variant">{noticia.data || "now"}</span>
        </div>
        <h4 className="font-headline-md text-headline-md leading-tight group-hover:opacity-80 transition-colors" style={{ color: noticia.titleColor || "white" }}>
          {noticia.titulo}
        </h4>
        <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
          {noticia.resumo}
        </p>
        {expanded && (
          <div className="mt-sm">
            {noticia.imagem && (
              <img src={noticia.imagem} alt={noticia.titulo} className="w-full h-40 object-cover rounded-lg mb-sm opacity-70" />
            )}
            <a
              href={noticia.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-xs text-[12px] font-bold uppercase tracking-widest px-md py-xs rounded-full border transition-all"
              style={{
                color: categoryColor.primary,
                borderColor: categoryColor.primary,
                backgroundColor: `${categoryColor.primary}15`,
              }}
            >
              ↗ Ler completa
            </a>
          </div>
        )}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onSave(index);
        }}
        className="px-sm py-sm text-lg transition-all hover:scale-110"
        title={showBookmark ? "Remover dos salvos" : (isSaved ? "Remover dos salvos" : "Salvar notícia")}
      >
        {showBookmark ? (
          <span className="material-symbols-outlined">{isSaved ? "bookmark" : "bookmark_border"}</span>
        ) : (
          isSaved ? "❤️" : "🤍"
        )}
      </button>
    </article>
  );
}

export default function App() {
  const [noticias, setNoticias] = useState([]);
  const [noticiasOriginais, setNoticiasOriginais] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [log, setLog] = useState([]);
  const [hora, setHora] = useState(new Date());
  const [fetched, setFetched] = useState(false);
  const [selectedTab, setSelectedTab] = useState("ia");
  const [noticiasSalvas, setNoticiasSalvas] = useState([]);
  const [currentView, setCurrentView] = useState("home"); // "home", "ia", "hardware", "cyber", "chips", "web3", "salvos"
  const logRef = useRef(null);

  // Carrega notícias salvas do localStorage ao montar
  useEffect(() => {
    const salvasData = localStorage.getItem('noticias_salvas');
    if (salvasData) {
      try {
        const salvas = JSON.parse(salvasData);
        setNoticiasSalvas(salvas);
      } catch (e) {
        console.error('Erro ao carregar salvas:', e);
      }
    }
  }, []);

  // Atualiza hora a cada segundo
  useEffect(() => {
    const timer = setInterval(() => setHora(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-scroll do log
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [log]);

  // Filtra notícias baseado na aba selecionada
  useEffect(() => {
    if (noticiasOriginais.length > 0) {
      const topicKeywords = {
        ia: ["AI", "IA", "inteligência artificial", "neural", "GPT", "transformer", "LLM", "machine learning"],
        hardware: ["hardware", "GPU", "NVIDIA", "processor", "chip", "ARM", "Intel", "benchmark"],
        cyber: ["cyber", "segurança", "cibersegurança", "encryption", "quantum", "NIST", "cryptographic", "ransomware"],
        chips: ["chip", "TSMC", "semiconductor", "2nm", "processo", "nanômetros", "node", "foundries"],
        web3: ["web3", "blockchain", "crypto", "descentralizado", "DeFi", "NFT", "web 3"]
      };

      const keywords = topicKeywords[selectedTab] || [];
      const noticiasFiltradasPorTab = noticiasOriginais.filter(n => {
        const textoCompleto = `${n.titulo} ${n.resumo}`.toLowerCase();
        return keywords.some(keyword => textoCompleto.includes(keyword.toLowerCase()));
      });

      setNoticias(noticiasFiltradasPorTab.length > 0 ? noticiasFiltradasPorTab : noticiasOriginais);
      setExpandedIndex(null);
    }
  }, [selectedTab, noticiasOriginais]);

  const addLog = (msg) => {
    setLog((prev) => [...prev, { msg, id: Date.now() + Math.random() }]);
  };

  const salvarNoticia = (index, fromSalvos = false) => {
    const noticia = fromSalvos ? noticiasSalvas[index] : noticias[index];
    const jaExiste = noticiasSalvas.some(n => n.link === noticia.link);
    
    let novasSalvas;
    if (jaExiste) {
      novasSalvas = noticiasSalvas.filter(n => n.link !== noticia.link);
      addLog("✓ Notícia removida dos salvos");
    } else {
      novasSalvas = [...noticiasSalvas, noticia];
      addLog("✓ Notícia salva com sucesso");
    }
    
    setNoticiasSalvas(novasSalvas);
    localStorage.setItem('noticias_salvas', JSON.stringify(novasSalvas));
  };

  const estaRemovido = (link) => {
    return noticiasSalvas.some(n => n.link === link);
  };

  const buscarNoticias = async () => {
    setLoading(true);
    setNoticias([]);
    setNoticiasOriginais([]);
    setLog([]);
    setFetched(false);
    setExpandedIndex(null);

    addLog("▶ initializing neural news crawler...");
    addLog("▶ scanning 42 sub-sectors for alpha signals");
    addLog("▶ filtering noise: 12.4k raw inputs processed");
    
    try {
      const response = await fetch("/api/noticias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: selectedTab }),
      });

      if (!response.ok) {
        throw new Error(`Falha na matriz (Status ${response.status})`);
      }

      const data = await response.json();

      if (data.erro) {
        addLog(`✗ ${data.erro}`);
        setLoading(false);
        setFetched(true);
        return;
      }

      const { noticias: noticiasRecebidas } = data;
      
      if (!noticiasRecebidas || noticiasRecebidas.length === 0) {
        addLog(`✗ Nenhuma notícia retornada`);
        setLoading(false);
        setFetched(true);
        return;
      }

      // Adiciona imagens e ícones às notícias
      const noticiasComImagens = noticiasRecebidas.map((n, idx) => {
        const imagens = [
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCFuDq1X-GIPf2koag6UEw-rSu0EOuoUfE6i9TIRWbN4HlElaAL7OUq4rVfXbL5jR0cQDyeMhwkuB5OsGZ-9sCt2NQpAr4NEXHXd0Qp-Zr5f9DxypXDO9KbiTVXGRlTdXPTfmksfRKloZthSRPo1jrHM3oOLPxIu8ezzYmkXy9QWfNZ5WZJnb1wF-0t2SFa7gE9QdoEEe46GQyW2JucEEL-W0PvYhVQDvXsULgh1u52dvkbMAAbUyWBgTW07mgI18mkX9OXKIt6hMo",
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCoedg2Yz4aoDJpEQGYyKAZZ--AnE5HscRpovlT6ctAuCWZuTesvt_ctvNO1rEO7a0zGnZXvBRkvHp7EkJU8YU5uRcFSAfsF8VA9_qSQjV213rb66nftM1495ibkCUg6am0THv3AmqYWftxPpmHojgB4tSP79hb8je550hNoV51e4jVKzjSERjHrbKy-AxctOQZDkhHeXOlFtK0B3HU1zlYziQN-aUD2JW9kYQk6WfzaAG0Nxystea1YJLOQ30Dg1ZS_v0dw0KLcHo"
        ];
        return {
          ...n,
          imagem: imagens[idx % imagens.length],
          icon: ["sensors", "terminal", "developer_board"][idx % 3],
          titleColor: ["white", "white", "white"][idx % 3],
        };
      });

      setNoticiasOriginais(noticiasComImagens);
      setNoticias(noticiasComImagens);
      localStorage.setItem('noticias_cache', JSON.stringify(noticiasComImagens));
      localStorage.setItem('noticias_cache_ts', new Date().toISOString());
      addLog(`✅ ${noticiasRecebidas.length} notícias carregadas com sucesso`);
    } catch (err) {
      addLog(`✗ Erro: ${err.message}`);
    }
    
    setLoading(false);
    setFetched(true);
  };

  const goToHome = () => {
    setCurrentView("home");
    setNoticias([]);
    setNoticiasOriginais([]);
    setLog([]);
    setFetched(false);
  };

  const goToTab = (tab) => {
    setCurrentView(tab);
    setSelectedTab(tab);
  };

  const goToSalvos = () => {
    setCurrentView("salvos");
  };

  const greetingHour = hora.getHours();
  const greeting = greetingHour < 12 ? "Bom dia" : greetingHour < 18 ? "Boa tarde" : "Boa noite";

  const isHome = currentView === "home";

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
          background-color: #0a0a0c;
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 32px 32px;
          font-family: 'Space Grotesk', sans-serif;
        }
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
      `}</style>

      <div className="dark min-h-screen bg-[#0a0a0c] text-on-surface selection:bg-primary-container selection:text-on-primary-container">
        {/* Top Navigation Bar - Tabs */}
        <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 py-4 bg-[#0a0a0c]/80 backdrop-blur-md border-b border-white/10">
          <div className="flex items-center gap-8">
            <button 
              onClick={goToHome}
              className="text-xl font-black tracking-tighter text-[#7c73ff] hover:opacity-80 transition-opacity cursor-pointer" 
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              TECH NEWS AGENT
            </button>
            <div className="hidden md:flex gap-6 items-center">
              {Object.entries(TOPICS).map(([key, topic]) => (
                <button
                  key={key}
                  onClick={() => goToTab(key)}
                  className="font-['Space_Grotesk'] uppercase tracking-widest text-xs font-bold transition-colors pb-1"
                  style={{
                    color: currentView === key ? "#7c73ff" : "#9ca3af",
                    borderBottom: currentView === key ? "2px solid #7c73ff" : "none",
                  }}
                >
                  {topic.label}
                </button>
              ))}
            </div>
          </div>
          <button className="material-symbols-outlined text-gray-400 cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-all">person</button>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-6 pt-32 pb-32 flex flex-col gap-8">
          {/* Header Info - Only on Home */}
          {isHome && (
            <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                <h2 className="font-headline-lg text-headline-lg text-primary">TECH NEWS AGENT</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {greeting}, João Heitor
                </p>
              </div>
              <div className="text-right">
                <div className="font-headline-xl text-headline-xl tracking-tighter leading-none">
                  {hora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </div>
                <div className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">
                  {hora.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" })}
                </div>
              </div>
            </section>
          )}

          {/* Home View */}
          {isHome && (
            <>
              {/* Topic Buttons (Static Filters) */}
              <nav className="flex flex-wrap justify-center gap-3">
                {Object.entries(TOPICS).map(([key, topic]) => (
                  <button
                    key={key}
                    onClick={() => goToTab(key)}
                    className="px-6 py-3 rounded-full border border-outline-variant hover:border-primary transition-colors text-label-caps uppercase font-bold"
                    style={{
                      backgroundColor: "rgb(31, 31, 39)",
                      borderColor: "#47454f",
                      color: "rgba(200, 198, 216, 1)",
                    }}
                  >
                    {topic.shortLabel}
                  </button>
                ))}
              </nav>

              {/* Action Buttons */}
              <div className="flex flex-col md:flex-row gap-4">
                <button
                  onClick={buscarNoticias}
                  disabled={loading}
                  className="flex-1 py-4 bg-primary text-on-primary font-headline-md text-headline-md rounded-xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined">add</span>
                  {loading ? "Buscando..." : "+ Atualizar Notícias"}
                </button>
                <button
                  onClick={goToSalvos}
                  className="flex-1 py-4 border border-outline text-on-surface font-headline-md text-headline-md rounded-xl hover:bg-white/5 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">bookmark</span>
                  Ver salvas
                </button>
              </div>

              {/* Terminal Box */}
              <div className="bg-[#0e0d15] rounded-xl border border-white/5 shadow-inner px-6 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="font-label-caps text-[10px] text-green-500/70 tracking-widest uppercase">Live Agent Stream</span>
                </div>
                <div ref={logRef} className="font-mono text-sm text-green-400/90 leading-relaxed max-h-40 overflow-y-auto">
                  {log.length === 0 ? (
                    <>
                      <p>&gt; initializing neural news crawler...</p>
                      <p>&gt; scanning 42 sub-sectors for alpha signals</p>
                      <p>&gt; filtering noise: 12.4k raw inputs processed</p>
                      <p className="animate-pulse">&gt; waiting for manual trigger...</p>
                    </>
                  ) : (
                    log.map((l) => (
                      <p key={l.id}>&gt; {l.msg}</p>
                    ))
                  )}
                  {loading && <p className="animate-pulse">&gt; processing...</p>}
                </div>
              </div>

              {/* Image Cards (System Health & Market Sentiment) */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-surface-container-high/40 border border-white/5 rounded-xl p-6 flex flex-col gap-2">
                  <img 
                    className="w-full h-32 object-cover rounded-lg mb-2 opacity-60"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFuDq1X-GIPf2koag6UEw-rSu0EOuoUfE6i9TIRWbN4HlElaAL7OUq4rVfXbL5jR0cQDyeMhwkuB5OsGZ-9sCt2NQpAr4NEXHXd0Qp-Zr5f9DxypXDO9KbiTVXGRlTdXPTfmksfRKloZthSRPo1jrHM3oOLPxIu8ezzYmkXy9QWfNZ5WZJnb1wF-0t2SFa7gE9QdoEEe46GQyW2JucEEL-W0PvYhVQDvXsULgh1u52dvkbMAAbUyWBgTW07mgI18mkX9OXKIt6hMo"
                    alt="System Health"
                  />
                  <h5 className="font-headline-md text-headline-md text-primary">System Health</h5>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Active scrapers: 142. Proxy latency: 24ms. Signal-to-noise ratio: Optimal.</p>
                </div>
                <div className="bg-surface-container-high/40 border border-white/5 rounded-xl p-6 flex flex-col gap-2">
                  <img 
                    className="w-full h-32 object-cover rounded-lg mb-2 opacity-60"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCoedg2Yz4aoDJpEQGYyKAZZ--AnE5HscRpovlT6ctAuCWZuTesvt_ctvNO1rEO7a0zGnZXvBRkvHp7EkJU8YU5uRcFSAfsF8VA9_qSQjV213rb66nftM1495ibkCUg6am0THv3AmqYWftxPpmHojgB4tSP79hb8je550hNoV51e4jVKzjSERjHrbKy-AxctOQZDkhHeXOlFtK0B3HU1zlYziQN-aUD2JW9kYQk6WfzaAG0Nxystea1YJLOQ30Dg1ZS_v0dw0KLcHo"
                    alt="Market Sentiment"
                  />
                  <h5 className="font-headline-md text-headline-md text-tertiary">Market Sentiment</h5>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">AI sector bullish (+4.2%). Crypto sideways. Hardware supply chains stabilizing.</p>
                </div>
              </section>
            </>
          )}

          {/* Tab Views */}
          {!isHome && (
            <>
              {/* Action Buttons */}
              <div className="flex flex-col md:flex-row gap-4">
                <button
                  onClick={buscarNoticias}
                  disabled={loading}
                  className="flex-1 py-4 bg-primary text-on-primary font-headline-md text-headline-md rounded-xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined">add</span>
                  {loading ? "Buscando..." : "+ Atualizar Notícias"}
                </button>
                <button
                  onClick={goToSalvos}
                  className="flex-1 py-4 border border-outline text-on-surface font-headline-md text-headline-md rounded-xl hover:bg-white/5 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">bookmark</span>
                  Ver salvas
                </button>
              </div>

              {/* Terminal Box */}
              <div className="bg-[#0e0d15] rounded-xl border border-white/5 shadow-inner px-6 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="font-label-caps text-[10px] text-green-500/70 tracking-widest uppercase">Live Agent Stream</span>
                </div>
                <div ref={logRef} className="font-mono text-sm text-green-400/90 leading-relaxed max-h-40 overflow-y-auto">
                  {log.length === 0 ? (
                    <>
                      <p>&gt; initializing neural news crawler...</p>
                      <p>&gt; scanning 42 sub-sectors for alpha signals</p>
                      <p>&gt; filtering noise: 12.4k raw inputs processed</p>
                      <p className="animate-pulse">&gt; waiting for manual trigger...</p>
                    </>
                  ) : (
                    log.map((l) => (
                      <p key={l.id}>&gt; {l.msg}</p>
                    ))
                  )}
                  {loading && <p className="animate-pulse">&gt; processing...</p>}
                </div>
              </div>

              {/* News List */}
              {noticias.length > 0 && (
                <section className="flex flex-col gap-4">
                  <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">{noticias.length} notícias encontradas</h3>
                  {noticias.map((n, i) => (
                    <div key={i} onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}>
                      <NewsCard
                        noticia={n}
                        index={i}
                        expanded={expandedIndex === i}
                        onExpand={() => {}}
                        onSave={salvarNoticia}
                        isSaved={estaRemovido(n.link)}
                        showBookmark={false}
                      />
                    </div>
                  ))}
                </section>
              )}
            </>
          )}

          {/* Salvos View */}
          {currentView === "salvos" && (
            <section className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">
                  {noticiasSalvas.length} notícia{noticiasSalvas.length !== 1 ? "s" : ""} salva{noticiasSalvas.length !== 1 ? "s" : ""}
                </h3>
                {noticiasSalvas.length > 0 && (
                  <button
                    onClick={() => {
                      setNoticiasSalvas([]);
                      localStorage.removeItem('noticias_salvas');
                      addLog("✓ Todos os salvos foram removidos");
                    }}
                    className="px-4 py-2 text-sm font-bold rounded-lg transition-all"
                    style={{
                      color: "rgba(255,77,109,0.9)",
                      backgroundColor: "rgba(255,77,109,0.1)",
                      border: "1px solid rgba(255,77,109,0.2)"
                    }}
                  >
                    Limpar tudo
                  </button>
                )}
              </div>

              {noticiasSalvas.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-on-surface-variant">Nenhuma notícia salva ainda</p>
                </div>
              ) : (
                noticiasSalvas.map((n, i) => (
                  <div key={i} onClick={() => setExpandedIndex(expandedIndex === `salvo_${i}` ? null : `salvo_${i}`)}>
                    <NewsCard
                      noticia={n}
                      index={i}
                      expanded={expandedIndex === `salvo_${i}`}
                      onExpand={() => {}}
                      onSave={() => salvarNoticia(i, true)}
                      isSaved={true}
                      showBookmark={true}
                    />
                  </div>
                ))
              )}
            </section>
          )}
        </main>

        {/* Bottom Navigation (Mobile) */}
        <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-16 px-4 bg-[#0a0a0c]/90 backdrop-blur-lg border-t border-white/10">
          <button onClick={goToHome} className="flex flex-col items-center justify-center text-[#7c73ff] bg-white/5 rounded-xl px-3 py-1">
            <span className="material-symbols-outlined" data-weight="fill">sensors</span>
            <span className="font-['Space_Grotesk'] text-[10px] font-medium">Home</span>
          </button>
          <a href="#" className="flex flex-col items-center justify-center text-gray-500 hover:text-white transition-transform active:scale-95">
            <span className="material-symbols-outlined">trending_up</span>
            <span className="font-['Space_Grotesk'] text-[10px] font-medium">Trends</span>
          </a>
          <a href="#" className="flex flex-col items-center justify-center text-gray-500 hover:text-white transition-transform active:scale-95">
            <span className="material-symbols-outlined">code</span>
            <span className="font-['Space_Grotesk'] text-[10px] font-medium">Terminal</span>
          </a>
          <a href="#" className="flex flex-col items-center justify-center text-gray-500 hover:text-white transition-transform active:scale-95">
            <span className="material-symbols-outlined">person</span>
            <span className="font-['Space_Grotesk'] text-[10px] font-medium">Account</span>
          </a>
        </nav>
      </div>
    </>
  );
}
