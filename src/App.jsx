import { useState, useEffect, useRef } from "react";

const TOPICS = {
  mercado_ti: {
    label: "Mercado TI Brasil",
    icon: "💼",
    description: "Setor público, Mato Grosso e inovação"
  },
  ia_automacao: {
    label: "IA e Automação",
    icon: "🤖",
    description: "Modelos LLM, n8n e integrações"
  },
  hardware_ia: {
    label: "Hardware & IA",
    icon: "⚙️",
    description: "GPU, NVIDIA, TSMC e infraestrutura"
  },
  desenvolvimento: {
    label: "Desenvolvimento",
    icon: "💻",
    description: "FullStack, React, Python, DevOps"
  },
  infraestrutura: {
    label: "Infraestrutura",
    icon: "🌐",
    description: "Cloud, Linux, AWS, Data Centers"
  },
  startups_vc: {
    label: "Startups & VC",
    icon: "🚀",
    description: "Investimentos e rodadas de funding"
  },
  seguranca: {
    label: "Segurança Digital",
    icon: "🔒",
    description: "Cibersegurança e proteção de dados"
  },
  investimento_publico: {
    label: "Investimento Público",
    icon: "🏛️",
    description: "BNDES, Finep e fomento"
  },
  geral: {
    label: "Geral Tech",
    icon: "⚡",
    description: "Tendências gerais de tecnologia"
  }
};

function NewsCard({ noticia, index, onExpand, expanded }) {
  const impactColor = {
    alto: "#ff4d6d",
    médio: "#ffd60a",
    curto: "#06d6a0",
  };

  const empresaIcons = {
    Google: "G",
    Microsoft: "M",
    Anthropic: "A",
    OpenAI: "O",
    GitHub: "⌥",
    Meta: "◈",
    Apple: "",
    default: "◆",
  };

  const icon = empresaIcons[noticia.empresa] || empresaIcons.default;
  const color = impactColor[noticia.impacto] || "#06d6a0";

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: `1px solid rgba(255,255,255,0.08)`,
        borderLeft: `3px solid ${color}`,
        borderRadius: "12px",
        padding: "20px 24px",
        marginBottom: "16px",
        cursor: "pointer",
        transition: "all 0.25s ease",
        animation: `slideIn 0.4s ease ${index * 0.1}s both`,
        position: "relative",
        overflow: "hidden",
      }}
      onClick={() => onExpand(index)}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.06)";
        e.currentTarget.style.transform = "translateX(4px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.03)";
        e.currentTarget.style.transform = "translateX(0)";
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
        <div
          style={{
            width: "42px",
            height: "42px",
            borderRadius: "10px",
            background: `${color}20`,
            border: `1px solid ${color}40`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
            flexShrink: 0,
            fontWeight: "700",
            color: color,
          }}
        >
          {icon}
        </div>

        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "6px",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                fontFamily: "'Space Mono', monospace",
                color: color,
                background: `${color}15`,
                padding: "2px 8px",
                borderRadius: "4px",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              {noticia.empresa || "TECH"}
            </span>
            <span
              style={{
                fontSize: "11px",
                color: "rgba(255,255,255,0.3)",
                fontFamily: "'Space Mono', monospace",
              }}
            >
              {noticia.fonte}
            </span>
            <span
              style={{
                fontSize: "11px",
                color: "rgba(255,255,255,0.2)",
                fontFamily: "'Space Mono', monospace",
              }}
            >
              · {noticia.data}
            </span>
          </div>

          <h3
            style={{
              margin: "0 0 8px 0",
              fontSize: "15px",
              fontFamily: "'Syne', sans-serif",
              fontWeight: "700",
              color: "rgba(255,255,255,0.92)",
              lineHeight: "1.4",
            }}
          >
            {noticia.titulo}
          </h3>

          {expanded && (
            <div style={{ animation: "fadeIn 0.3s ease" }}>
              <p
                style={{
                  margin: "0 0 14px 0",
                  fontSize: "13.5px",
                  color: "rgba(255,255,255,0.6)",
                  lineHeight: "1.6",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {noticia.resumo}
              </p>
              <a
                href={noticia.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "12px",
                  color: color,
                  textDecoration: "none",
                  fontFamily: "'Space Mono', monospace",
                  background: `${color}10`,
                  border: `1px solid ${color}30`,
                  padding: "6px 12px",
                  borderRadius: "6px",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `${color}20`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = `${color}10`;
                }}
              >
                ↗ Ler notícia completa
              </a>
            </div>
          )}

          {!expanded && (
            <p
              style={{
                margin: 0,
                fontSize: "13px",
                color: "rgba(255,255,255,0.4)",
                fontFamily: "'DM Sans', sans-serif",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {noticia.resumo}
            </p>
          )}
        </div>

        <div
          style={{
            fontSize: "12px",
            color: "rgba(255,255,255,0.2)",
            transition: "transform 0.2s",
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            flexShrink: 0,
          }}
        >
          ▾
        </div>
      </div>
    </div>
  );
}

export default function NewsAgent() {
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [log, setLog] = useState([]);
  const [hora, setHora] = useState(new Date());
  const [fetched, setFetched] = useState(false);
  const [cacheMoment, setCacheMoment] = useState(null);
  const [usandoCache, setUsandoCache] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const logRef = useRef(null);

  // Verifica cache ao montar o componente
  useEffect(() => {
    const cacheData = localStorage.getItem('noticias_cache');
    const cacheTs = localStorage.getItem('noticias_cache_ts');
    
    if (cacheData && cacheTs) {
      const cachedTime = new Date(cacheTs);
      const agora = new Date();
      const horasPassadas = (agora - cachedTime) / (1000 * 60 * 60);
      
      // Se cache tem menos de 8 horas, usa automaticamente
      if (horasPassadas < 8) {
        try {
          const noticias = JSON.parse(cacheData);
          setNoticias(noticias);
          setCacheMoment(cachedTime);
          setFetched(true);
          addLog(`[CACHE] Notícias carregadas do histórico`, "info");
        } catch (e) {
          console.error('Erro ao parsear cache:', e);
        }
      }
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setHora(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [log]);

  const addLog = (msg, type = "info") => {
    const colors = {
      info: "rgba(255,255,255,0.4)",
      success: "#06d6a0",
      error: "#ff4d6d",
      warn: "#ffd60a",
      system: "#818cf8",
    };
    setLog((prev) => [
      ...prev,
      { msg, color: colors[type], id: Date.now() + Math.random() },
    ]);
  };

  const buscarNoticias = async () => {
    try {
      addLog("▶ Buscando notícias da IA...", "system");
      const response = await fetch("/api/noticias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: selectedTopic }),
      });

      if (!response.ok) {
        throw new Error(`Falha na matriz (Status ${response.status})`);
      }

      const data = await response.json();

      if (data.erro) {
        addLog(`✗ ${data.erro}`, "warn");
        return null;
      }

      const { noticias: noticiasRecebidas } = data;
      
      if (!noticiasRecebidas || noticiasRecebidas.length === 0) {
        addLog(`✗ Nenhuma notícia retornada`, "warn");
        return null;
      }

      // Salva no localStorage
      localStorage.setItem('noticias_cache', JSON.stringify(noticiasRecebidas));
      localStorage.setItem('noticias_cache_ts', new Date().toISOString());

      addLog(`✓ ${noticiasRecebidas.length} notícias carregadas e salvas`, "success");
      return noticiasRecebidas;
    } catch (err) {
      addLog(`✗ Erro ao buscar notícias: ${err.message}`, "error");
      return null;
    }
  };

  const carregarDosalvadas = () => {
    const cacheData = localStorage.getItem('noticias_cache');
    const cacheTs = localStorage.getItem('noticias_cache_ts');
    
    if (!cacheData || !cacheTs) {
      addLog(`✗ Nenhuma notícia salva encontrada`, "warn");
      return;
    }

    try {
      const noticiasRecuperadas = JSON.parse(cacheData);
      setNoticias(noticiasRecuperadas);
      setCacheMoment(new Date(cacheTs));
      setUsandoCache(true);
      setFetched(true);
      addLog(`✓ Notícias salvas carregadas`, "success");
    } catch (e) {
      addLog(`✗ Erro ao carregar salvas: ${e.message}`, "error");
    }
  };

  const buscarTodasNoticias = async () => {
    setLoading(true);
    setNoticias([]);
    setLog([]);
    setFetched(false);
    setUsandoCache(false);
    setExpandedIndex(null);
    setCacheMoment(null);

    addLog("▶ AGENTE TECH NEWS INICIADO", "system");
    addLog(
      `⏰ ${hora.toLocaleString("pt-BR")} — Buscando notícias...`,
      "info"
    );
    addLog("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "info");

    const resultados = await buscarNoticias();

    addLog("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", "info");
    
    if (resultados && resultados.length > 0) {
      setNoticias(resultados);
      addLog(
        `✅ ${resultados.length} notícias carregadas. Bom dia!`,
        "success"
      );
    } else {
      addLog(`✗ Não foi possível carregar notícias`, "error");
    }
    
    setLoading(false);
    setFetched(true);
  };

  const handleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const greetingHour = hora.getHours();
  const greeting =
    greetingHour < 12
      ? "Bom dia"
      : greetingHour < 18
        ? "Boa tarde"
        : "Boa noite";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap');
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        body { background: #080b14; }
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-16px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "#080b14",
          color: "white",
          fontFamily: "'DM Sans', sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            position: "fixed",
            top: "-200px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "600px",
            height: "400px",
            background:
              "radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            maxWidth: "760px",
            margin: "0 auto",
            padding: "40px 20px 60px",
            position: "relative",
          }}
        >
          <div style={{ marginBottom: "40px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    background: "linear-gradient(135deg, #6366f1, #818cf8)",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "18px",
                  }}
                >
                  ◈
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "11px",
                      fontFamily: "'Space Mono', monospace",
                      color: "#6366f1",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                    }}
                  >
                    Tech News Agent
                  </div>
                  <div
                    style={{
                      fontSize: "20px",
                      fontFamily: "'Syne', sans-serif",
                      fontWeight: "800",
                      color: "white",
                      lineHeight: 1.1,
                    }}
                  >
                    {greeting}, João Heitor
                  </div>
                </div>
              </div>

              <div
                style={{
                  textAlign: "right",
                  fontFamily: "'Space Mono', monospace",
                }}
              >
                <div
                  style={{
                    fontSize: "22px",
                    color: "white",
                    fontWeight: "700",
                  }}
                >
                  {hora.toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>
                  {hora.toLocaleDateString("pt-BR", {
                    weekday: "short",
                    day: "2-digit",
                    month: "short",
                  })}
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
                marginBottom: "24px",
              }}
            >
              <button
                onClick={() => setSelectedTopic(null)}
                style={{
                  fontSize: "12px",
                  fontFamily: "'Space Mono', monospace",
                  color: selectedTopic === null ? "#6366f1" : "rgba(255,255,255,0.35)",
                  background: selectedTopic === null ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.04)",
                  border: selectedTopic === null ? "1px solid rgba(99,102,241,0.3)" : "1px solid rgba(255,255,255,0.08)",
                  padding: "6px 12px",
                  borderRadius: "20px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (selectedTopic !== null) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedTopic !== null) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  }
                }}
              >
                ⭐ Todos os tópicos
              </button>
              
              {Object.entries(TOPICS).map(([key, topic]) => (
                <button
                  key={key}
                  onClick={() => setSelectedTopic(key)}
                  title={topic.description}
                  style={{
                    fontSize: "12px",
                    fontFamily: "'Space Mono', monospace",
                    color: selectedTopic === key ? "white" : "rgba(255,255,255,0.5)",
                    background: selectedTopic === key ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.04)",
                    border: selectedTopic === key ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(255,255,255,0.08)",
                    padding: "6px 12px",
                    borderRadius: "20px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                  onMouseEnter={(e) => {
                    if (selectedTopic !== key) {
                      e.currentTarget.style.background = "rgba(99,102,241,0.1)";
                      e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedTopic !== key) {
                      e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                      e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                    }
                  }}
                >
                  {topic.icon} {topic.label}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button
                onClick={buscarTodasNoticias}
                disabled={loading}
                style={{
                  flex: 1,
                  minWidth: "200px",
                  padding: "14px 24px",
                  background: loading
                    ? "rgba(99,102,241,0.15)"
                    : "linear-gradient(135deg, #6366f1, #818cf8)",
                  border: loading ? "1px solid rgba(99,102,241,0.3)" : "none",
                  borderRadius: "12px",
                  color: "white",
                  fontSize: "14px",
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: "700",
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  transition: "all 0.2s",
                  letterSpacing: "0.02em",
                }}
                onMouseEnter={(e) => {
                  if (!loading) e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {loading ? (
                  <>
                    <span
                      style={{
                        display: "inline-block",
                        width: "14px",
                        height: "14px",
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTopColor: "white",
                        borderRadius: "50%",
                        animation: "spin 0.8s linear infinite",
                      }}
                    />
                    Buscando notícias com IA...
                  </>
                ) : (
                  <>◈ {fetched ? "Atualizar Notícias" : "Buscar Notícias do Dia"}</>
                )}
              </button>

              {localStorage.getItem('noticias_cache') && (
                <button
                  onClick={carregarDosalvadas}
                  disabled={loading}
                  style={{
                    flex: 1,
                    minWidth: "150px",
                    padding: "14px 24px",
                    background: usandoCache
                      ? "rgba(6,214,160,0.15)"
                      : "rgba(255,255,255,0.05)",
                    border: usandoCache 
                      ? "1px solid rgba(6,214,160,0.3)"
                      : "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    color: usandoCache ? "#06d6a0" : "rgba(255,255,255,0.6)",
                    fontSize: "14px",
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: "700",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    transition: "all 0.2s",
                    letterSpacing: "0.02em",
                  }}
                  onMouseEnter={(e) => {
                    if (!usandoCache) {
                      e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!usandoCache) {
                      e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                    }
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  📌 Ver salvas
                  {cacheMoment && (
                    <span
                      style={{
                        fontSize: "10px",
                        background: usandoCache ? "rgba(6,214,160,0.2)" : "rgba(255,255,255,0.1)",
                        padding: "2px 6px",
                        borderRadius: "3px",
                        fontFamily: "'Space Mono', monospace",
                      }}
                    >
                      {cacheMoment.toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>

          {log.length > 0 && (
            <div
              ref={logRef}
              style={{
                background: "rgba(0,0,0,0.4)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: "10px",
                padding: "16px",
                marginBottom: "24px",
                maxHeight: "140px",
                overflowY: "auto",
                fontFamily: "'Space Mono', monospace",
              }}
            >
              {log.map((l) => (
                <div
                  key={l.id}
                  style={{
                    fontSize: "11px",
                    color: l.color,
                    marginBottom: "3px",
                    animation: "fadeIn 0.2s ease",
                  }}
                >
                  {l.msg}
                </div>
              ))}
              {loading && (
                <div
                  style={{
                    fontSize: "11px",
                    color: "#6366f1",
                    animation: "pulse 1s infinite",
                  }}
                >
                  ▌
                </div>
              )}
            </div>
          )}

          {noticias.length > 0 && (
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    fontFamily: "'Space Mono', monospace",
                    color: "rgba(255,255,255,0.3)",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  {noticias.length} notícia{noticias.length !== 1 ? "s" : ""} encontrada{noticias.length !== 1 ? "s" : ""}
                </div>
                <div
                  style={{
                    flex: 1,
                    height: "1px",
                    background: "rgba(255,255,255,0.06)",
                  }}
                />
                <div
                  style={{
                    fontSize: "11px",
                    fontFamily: "'Space Mono', monospace",
                    color: "rgba(255,255,255,0.2)",
                  }}
                >
                  clique para expandir
                </div>
              </div>

              {noticias.map((n, i) => (
                <NewsCard
                  key={i}
                  noticia={n}
                  index={i}
                  expanded={expandedIndex === i}
                  onExpand={handleExpand}
                />
              ))}
            </div>
          )}

          {!loading && noticias.length === 0 && !fetched && (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                color: "rgba(255,255,255,0.2)",
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>◈</div>
              <div
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: "16px",
                  color: "rgba(255,255,255,0.4)",
                  marginBottom: "8px",
                }}
              >
                Pronto para começar o dia
              </div>
              <div
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: "12px",
                }}
              >
                Clique no botão acima para buscar as notícias
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}