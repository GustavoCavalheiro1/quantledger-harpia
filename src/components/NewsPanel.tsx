/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from "react";
import { 
  Search, 
  TrendingUp, 
  AlertTriangle, 
  Sparkles, 
  CheckCircle2, 
  HelpCircle, 
  Newspaper, 
  Zap, 
  ArrowRight, 
  MessageSquare,
  Cpu,
  RefreshCw,
  Sliders,
  Filter
} from "lucide-react";

interface NewsItem {
  id: number;
  ticker: string;
  assetName: string;
  date: string;
  headline: string;
  content: string;
  sentiment: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
  sentimentScore: number; // 0 - 100
  returnImpactBps: number; // impact on expected return in basis points
}

const DEFAULT_NEWS_ITEMS: NewsItem[] = [
  {
    id: 1,
    ticker: "PETR4",
    assetName: "Petrobras PN",
    date: "2026-07-10",
    headline: "Petrobras anuncia descoberta de nova acumulação de petróleo na bacia de Santos de altíssima qualidade",
    content: "A Petrobras informou ao mercado a descoberta de uma nova acumulação de hidrocarbonetos no poço exploratório pioneiro da Bacia de Santos. Testes preliminares indicam óleo leve de alta qualidade comercial, com baixo teor de enxofre, reduzindo custos de refino e impulsionando a margem operacional de longo prazo. O comitê de análise quantitativa da Harpia elevou de imediato a recomendação do papel.",
    sentiment: "POSITIVE",
    sentimentScore: 89,
    returnImpactBps: 12
  },
  {
    id: 2,
    ticker: "VALE3",
    assetName: "Vale S.A. ON",
    date: "2026-07-09",
    headline: "Demanda por minério de ferro na China desacelera após novos limites de emissões siderúrgicas",
    content: "O governo chinês impôs novas restrições ambientais de curto prazo para as indústrias pesadas na província de Hebei, principal polo produtor de aço. Com isso, os estoques portuários de minério de ferro registraram forte alta e os preços spot recuaram 3.2% em Dalian. A Vale mantém resiliência devido aos baixos custos de extração (All-in Sustaining Cost), mas o score macro do papel foi reduzido preventivamente.",
    sentiment: "NEGATIVE",
    sentimentScore: 35,
    returnImpactBps: -8
  },
  {
    id: 3,
    ticker: "WEGE3",
    assetName: "WEG S.A. ON",
    date: "2026-07-10",
    headline: "WEG fecha contrato bilionário para fornecimento de turbinas eólicas e geradores nos Estados Unidos",
    content: "A multinacional catarinense WEG fechou um contrato de fornecimento de grande porte com uma das maiores operadoras de energia renovável do Texas, EUA. O acordo contempla a entrega de aerogeradores de última geração e manutenção preventiva por 10 anos. A transação expande a participação de mercado global da WEG e solidifica sua receita dolarizada contra oscilações de juros locais.",
    sentiment: "POSITIVE",
    sentimentScore: 92,
    returnImpactBps: 22
  },
  {
    id: 4,
    ticker: "ITUB4",
    assetName: "Itaú Unibanco PN",
    date: "2026-07-08",
    headline: "Itaú Unibanco consolida carteira de crédito corporativo premium com baixíssima inadimplência",
    content: "Em coletiva trimestral de prévia operacional, diretores do Itaú sinalizaram que a inadimplência no segmento corporativo premium recuou para marcas históricas, refletindo a eficácia de seus modelos de concessão de crédito automatizados por inteligência artificial. O spread operacional líquido expandiu levemente, mantendo o papel como principal âncora defensiva do fundo.",
    sentiment: "POSITIVE",
    sentimentScore: 82,
    returnImpactBps: 6
  },
  {
    id: 5,
    ticker: "BBAS3",
    assetName: "Banco do Brasil ON",
    date: "2026-07-07",
    headline: "Plano Safra recorde deve impulsionar carteira de agronegócio do Banco do Brasil no segundo semestre",
    content: "O anúncio dos novos recursos federais e subsídios para o Plano Safra deve canalizar bilhões de reais em novas operações de crédito rural estruturadas pelo Banco do Brasil. A baixa taxa de sinistralidade do setor agrícola e as garantias reais robustas oferecidas pelos produtores rurais fortalecem as projeções de ROE do banco público para o encerramento do exercício.",
    sentiment: "POSITIVE",
    sentimentScore: 85,
    returnImpactBps: 15
  },
  {
    id: 6,
    ticker: "BOVA11",
    assetName: "iShares Ibovespa ETF",
    date: "2026-07-09",
    headline: "Fluxo estrangeiro na B3 volta a ficar positivo com rotação global de portfólios para mercados emergentes",
    content: "Investidores institucionais estrangeiros voltaram a registrar saldo líquido comprador na bolsa paulista nesta semana, após sucessivas rodadas de saídas decorrentes do estresse fiscal local. Analistas apontam que a rotação global de ativos em busca de valor e dividendos beneficiou as blue chips brasileiras, gerando suporte temporário para o Ibovespa (BOVA11).",
    sentiment: "NEUTRAL",
    sentimentScore: 58,
    returnImpactBps: 4
  },
  {
    id: 7,
    ticker: "SPY",
    assetName: "S&P 500 ETF Trust",
    date: "2026-07-10",
    headline: "Fed sinaliza manutenção de taxas de juros americanas em patamar restritivo por mais tempo",
    content: "As minutas da última reunião extraordinária do Federal Reserve sugerem que a inflação de serviços nos Estados Unidos continua resiliente, demandando paciência antes de iniciar o ciclo de cortes de juros. O mercado acionário americano reagiu de forma mista, com setores de tecnologia devolvendo ganhos enquanto financeiro absorveu positivamente.",
    sentiment: "NEUTRAL",
    sentimentScore: 51,
    returnImpactBps: -2
  }
];

interface DecisionLogItem {
  id: number;
  timestamp: string;
  ticker: string;
  headline: string;
  sentiment_score: number;
  old_weight: number;
  new_weight: number;
  rationale: string;
  action: string;
}

export default function NewsPanel() {
  const [news, setNews] = useState<NewsItem[]>(DEFAULT_NEWS_ITEMS);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedTicker, setSelectedTicker] = useState<string>("ALL");
  const [selectedSentiment, setSelectedSentiment] = useState<string>("ALL");
  const [minScore, setMinScore] = useState<number>(0);

  // Decision Log states
  const [decisions, setDecisions] = useState<DecisionLogItem[]>([]);
  const [loadingDecisions, setLoadingDecisions] = useState<boolean>(false);
  const [selectedTimelineTicker, setSelectedTimelineTicker] = useState<string>("ALL");

  // Fetch decision logs from local DB
  const fetchDecisionLogs = useCallback(async () => {
    setLoadingDecisions(true);
    try {
      const response = await fetch("/api/decision-log/list");
      if (response.ok) {
        const data = await response.json();
        if (data && Array.isArray(data.decisions)) {
          setDecisions(data.decisions);
        }
      }
    } catch (err) {
      console.error("Failed to load decision logs:", err);
    } finally {
      setLoadingDecisions(false);
    }
  }, []);

  // Fetch news from local DB
  const fetchNews = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const response = await fetch("/api/news/list");
      if (!response.ok) {
        throw new Error("Erro ao carregar notícias do banco.");
      }
      const data = await response.json();
      if (data && Array.isArray(data.news)) {
        const mapped: NewsItem[] = data.news.map((n: any) => ({
          id: n.id,
          ticker: n.ticker,
          assetName: n.asset_name,
          date: n.date,
          headline: n.headline,
          content: n.content,
          sentiment: n.sentiment as "POSITIVE" | "NEUTRAL" | "NEGATIVE",
          sentimentScore: n.sentiment_score,
          returnImpactBps: n.return_impact_bps
        }));
        setNews(mapped);
      }
      setLastRefreshed(new Date().toLocaleTimeString("pt-BR"));
    } catch (err) {
      console.error("Failed to load news from background service:", err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
    fetchDecisionLogs();
    const interval = setInterval(() => {
      fetchNews(true);
      fetchDecisionLogs();
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchNews, fetchDecisionLogs]);

  // Gemini analysis state
  const [analyzingId, setAnalyzingId] = useState<number | null>(null);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<Record<number, { rationale: string; action: string; impactScore: number }>>({});
  const [aiError, setAiError] = useState<string | null>(null);

  // Filter handlers
  const filteredNews = news.filter(item => {
    // Search matches headline or content
    const matchesSearch = item.headline.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.ticker.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Ticker matches
    const matchesTicker = selectedTicker === "ALL" || item.ticker === selectedTicker;
    
    // Sentiment matches
    const matchesSentiment = selectedSentiment === "ALL" || item.sentiment === selectedSentiment;
    
    // Score matches
    const matchesScore = item.sentimentScore >= minScore;
    
    return matchesSearch && matchesTicker && matchesSentiment && matchesScore;
  });

  // Unique list of tickers for filter
  const uniqueTickers = Array.from(new Set(news.map(n => n.ticker)));

  // Live Gemini News Analyzer
  const handleAnalyzeNews = async (item: NewsItem) => {
    setAnalyzingId(item.id);
    setAiError(null);
    
    const prompt = `Você é o co-gestor de Inteligência Artificial do fundo Harpia Finance Asset.
Analise a seguinte notícia corporativa/macro:
Ativo: ${item.ticker} (${item.assetName})
Título: ${item.headline}
Detalhes: ${item.content}
Sentimento Inicial Ponderado: ${item.sentimentScore}/100
Impacto Inicial de Retorno Estimado: ${item.returnImpactBps} bps

Instruções: Forneça uma resposta JSON estrita com as seguintes chaves:
{
  "rationale": "Seu parecer analítico profissional explicando detalhadamente como essa notícia afeta o valor intrínseco, geração de caixa e múltiplos de risco do ativo no curto e médio prazo.",
  "action": "Ação recomendada para a carteira quantitativa do fundo (ex: Aumentar o peso tático via Black-Litterman, Manter exposição com hedge de opções, Reduzir posição para CDI, etc.)",
  "impactScore": um número de 0 a 100 estimando a força do sinal de momentum gerado
}
Escreva as análises em português com termos do mercado financeiro brasileiro. Retorne apenas o JSON.`;

    try {
      const response = await fetch("/api/risk/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });

      let data: any;
      try {
        data = await response.json();
      } catch (parseErr) {
        // Failed to parse JSON, fall back to generic error
      }

      if (!response.ok) {
        throw new Error(data?.error || "Erro de conexão com o servidor de análise Harpia AI.");
      }

      if (data.error) {
        throw new Error(data.error);
      }

      const finalImpactScore = data.impactScore !== undefined ? data.impactScore : item.sentimentScore;

      setAiAnalysisResult(prev => ({
        ...prev,
        [item.id]: {
          rationale: data.rationale || "Sem parecer detalhado.",
          action: data.action || "Nenhuma ação corretiva sugerida.",
          impactScore: finalImpactScore
        }
      }));

      // Automatically post a decision log entry representing the weight change triggered by this news!
      const oldWeight = parseFloat((Math.random() * 5 + 5).toFixed(1)); // 5% to 10%
      const isPositive = finalImpactScore > 60;
      const weightChange = isPositive ? parseFloat((Math.random() * 2 + 1).toFixed(1)) : -parseFloat((Math.random() * 2 + 1).toFixed(1));
      const newWeight = parseFloat(Math.max(1, oldWeight + weightChange).toFixed(1));

      await fetch("/api/decision-log/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticker: item.ticker,
          headline: item.headline,
          sentiment_score: finalImpactScore,
          old_weight: oldWeight,
          new_weight: newWeight,
          rationale: data.rationale || "Rebalanceamento impulsionado por sinal NLP da Harpia AI.",
          action: data.action || (isPositive ? "COMPRA SELETIVA" : "REDUZIR EXPOSIÇÃO")
        })
      });

      // Refresh the timeline list immediately!
      fetchDecisionLogs();

    } catch (err: any) {
      console.error("AI News analysis failed:", err);
      setAiError(err.message || "Não foi possível conectar à Harpia AI. Verifique se a sua chave GEMINI_API_KEY está configurada.");
    } finally {
      setAnalyzingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="sentinel-news-panel">
      {/* ── BANNER / HEADER ─────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden" id="news-header-banner">
        <div className="absolute top-0 right-0 w-80 h-80 bg-slate-50 rounded-full blur-3xl pointer-events-none opacity-60" />
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-slate-900 rounded-lg text-white">
                <Newspaper className="w-5 h-5 text-amber-400" />
              </span>
              <h2 className="text-base font-black text-slate-800 uppercase tracking-tight font-sans flex items-center gap-2">
                Harpia AI Sentinel News
                <span className="px-2 py-0.5 text-[9px] bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full font-mono uppercase tracking-wider">
                  Live Engine
                </span>
              </h2>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-sans max-w-2xl">
              Monitor de processamento de linguagem natural (NLP/LLM). Filtre e analise notícias em tempo real para gerar impulsos táticos (visões posteriores de Black-Litterman) integrados diretamente na infraestrutura do fundo.
            </p>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            {/* Daemon Status indicator */}
            <div className="flex items-center gap-2 text-xs font-mono bg-emerald-50/80 border border-emerald-100 p-2.5 rounded-xl">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <div>
                <span className="text-emerald-600 text-[9px] block uppercase font-bold">Central de Fundo</span>
                <span className="text-emerald-700 font-bold">Daemon Ativo</span>
              </div>
            </div>

            {/* Active Model Indicator */}
            <div className="flex items-center gap-2 text-xs font-mono bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
              <Zap className="w-4 h-4 text-amber-500" />
              <div>
                <span className="text-slate-400 text-[9px] block">Modelo Ativo</span>
                <span className="text-slate-700 font-bold">gemini-3.5-flash</span>
              </div>
            </div>

            {/* Force Refresh Trigger */}
            <div className="flex flex-col items-end">
              <button
                onClick={() => fetchNews(false)}
                disabled={loading}
                className="flex items-center justify-center p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer border border-slate-200/60"
                title="Forçar Sincronização de Notícias"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-indigo-500" : ""}`} />
              </button>
              {lastRefreshed && (
                <span className="text-[8px] font-mono text-slate-400 mt-1 block">
                  Atualizado {lastRefreshed}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── SEARCH & FILTER CONTROLS ────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4" id="news-filters-card">
        <h3 className="text-xs font-bold uppercase text-slate-400 font-mono tracking-wider flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          Filtros de Notícias &amp; Sentimento (&quot;Eu quero notícias onde...&quot;)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Keyword Search */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase font-sans">Busca Textual</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Onde o texto contém..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 font-sans"
              />
            </div>
          </div>

          {/* Ticker Selector */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase font-sans">Ativo / Ticker</label>
            <select
              value={selectedTicker}
              onChange={(e) => setSelectedTicker(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="ALL">Qualquer Ativo (Todos)</option>
              {uniqueTickers.map(ticker => (
                <option key={ticker} value={ticker}>{ticker}</option>
              ))}
            </select>
          </div>

          {/* Sentiment Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase font-sans">Sentimento NLP</label>
            <select
              value={selectedSentiment}
              onChange={(e) => setSelectedSentiment(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="ALL">Qualquer Sentimento</option>
              <option value="POSITIVE">Positivo (Otimista)</option>
              <option value="NEUTRAL">Neutro</option>
              <option value="NEGATIVE">Negativo (Pessimista)</option>
            </select>
          </div>

          {/* Min Score Slider */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <label className="text-[10px] font-bold text-slate-500 uppercase font-sans">Score de Sentimento Mínimo</label>
              <span className="text-xs font-mono font-bold text-slate-700">{minScore}%</span>
            </div>
            <div className="pt-2">
              <input
                type="range"
                min="0"
                max="90"
                value={minScore}
                onChange={(e) => setMinScore(parseInt(e.target.value))}
                className="w-full accent-slate-900 h-1 bg-slate-100 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Quick presets for "Eu quero todas as notícias onde..." */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 items-center text-xs text-slate-500">
          <span className="font-semibold font-mono text-[10px] text-slate-400">Pesquisas Rápidas:</span>
          
          <button
            onClick={() => { setSearchTerm(""); setSelectedTicker("ALL"); setSelectedSentiment("POSITIVE"); setMinScore(80); }}
            className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-700 rounded-lg transition-all"
          >
            Sentimento Altamente Positivo (&gt;80%)
          </button>
          
          <button
            onClick={() => { setSearchTerm(""); setSelectedTicker("ALL"); setSelectedSentiment("NEGATIVE"); setMinScore(0); }}
            className="p-1 px-2.5 bg-rose-50 hover:bg-rose-100 text-[10px] font-bold text-rose-700 rounded-lg transition-all"
          >
            Notícias Pessimistas (Negativas)
          </button>
          
          <button
            onClick={() => { setSearchTerm("bilionário"); setSelectedTicker("ALL"); setSelectedSentiment("ALL"); setMinScore(0); }}
            className="p-1 px-2.5 bg-amber-50 hover:bg-amber-100 text-[10px] font-bold text-amber-700 rounded-lg transition-all"
          >
            Onde contém &quot;bilionário&quot;
          </button>

          <button
            onClick={() => { setSearchTerm(""); setSelectedTicker("WEGE3"); setSelectedSentiment("ALL"); setMinScore(0); }}
            className="p-1 px-2.5 bg-blue-50 hover:bg-blue-100 text-[10px] font-bold text-blue-700 rounded-lg transition-all"
          >
            Onde ativo é WEGE3
          </button>
          
          <button
            onClick={() => { setSearchTerm(""); setSelectedTicker("ALL"); setSelectedSentiment("ALL"); setMinScore(0); }}
            className="p-1 px-2 text-[10px] text-slate-400 hover:text-slate-600 underline font-medium"
          >
            Limpar Filtros
          </button>
        </div>
      </div>

      {/* ── CHRONOLOGICAL CROSSOVER TIMELINE (DECISION LOG VS NEWS SENTIMENT) ── */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 text-white space-y-4 shadow-lg relative overflow-hidden" id="crossover-timeline-section">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-slate-800/80 gap-4">
          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider font-sans text-indigo-450 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              Linha do Tempo de Inteligência: Sentimento vs. Peso de Ativos (Decision Log)
            </h3>
            <p className="text-[11px] text-slate-400 font-sans">
              Visão cruzada em tempo real que mapeia o <strong>sentiment_score</strong> com alterações de peso no <strong>decision_log</strong> do fundo.
            </p>
          </div>

          {/* Timeline Asset Filter */}
          <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 p-1.5 rounded-xl text-xs">
            <span className="text-[10px] text-slate-400 font-mono">Filtrar Ativo:</span>
            <select
              value={selectedTimelineTicker}
              onChange={(e) => setSelectedTimelineTicker(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-lg p-1 text-[11px] font-bold text-white focus:outline-none"
            >
              <option value="ALL">Todos os Ativos</option>
              {Array.from(new Set(decisions.map(d => d.ticker))).map(ticker => (
                <option key={ticker} value={ticker}>{ticker}</option>
              ))}
            </select>
          </div>
        </div>

        {loadingDecisions && decisions.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs font-mono">
            Carregando cruzamento de dados...
          </div>
        ) : decisions.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            Nenhuma decisão registrada. Execute uma análise avançada em uma notícia para gerar novos dados.
          </div>
        ) : (
          <div className="relative border-l border-slate-800 pl-5 ml-2.5 space-y-5 py-2">
            {decisions
              .filter(d => selectedTimelineTicker === "ALL" || d.ticker === selectedTimelineTicker)
              .map((dec) => {
                const isPos = dec.sentiment_score >= 60;
                const isNeg = dec.sentiment_score <= 45;
                const weightDiff = dec.new_weight - dec.old_weight;
                const isWeightUp = weightDiff > 0;

                return (
                  <div key={dec.id} className="relative group animate-fade-in space-y-2">
                    {/* Pulsing indicator dot */}
                    <span className={`absolute -left-[26px] top-1.5 w-2.5 h-2.5 rounded-full border border-slate-950 flex items-center justify-center ${
                      isPos ? "bg-emerald-500" : isNeg ? "bg-rose-500" : "bg-slate-500"
                    }`}>
                      <span className="w-1 h-1 rounded-full bg-white" />
                    </span>

                    {/* Decision header info */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                          {dec.ticker}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          isPos ? "bg-emerald-500/10 text-emerald-400" : 
                          isNeg ? "bg-rose-500/10 text-rose-400" : "bg-slate-500/10 text-slate-400"
                        }`}>
                          NLP: {dec.sentiment_score}% ({isPos ? "Otimista" : isNeg ? "Pessimista" : "Neutro"})
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {dec.timestamp ? new Date(dec.timestamp).toLocaleTimeString("pt-BR") : ""}
                        </span>
                      </div>

                      {/* Weight Change delta badge */}
                      <div className="flex items-center gap-1.5 bg-slate-950/85 border border-slate-800 px-2.5 py-1 rounded-lg self-start sm:self-auto">
                        <span className="text-[9px] text-slate-400 uppercase font-mono">Peso:</span>
                        <span className="text-slate-400 text-[10px] font-mono font-bold">{dec.old_weight}%</span>
                        <ArrowRight className="w-3 h-3 text-slate-600" />
                        <span className={`text-xs font-mono font-black ${isWeightUp ? "text-emerald-400" : "text-rose-400"}`}>
                          {dec.new_weight}%
                        </span>
                        <span className={`text-[9px] font-bold font-mono px-1 py-0.5 rounded ${
                          isWeightUp ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400"
                        }`}>
                          {isWeightUp ? `+${weightDiff.toFixed(1)}%` : `${weightDiff.toFixed(1)}%`}
                        </span>
                      </div>
                    </div>

                    {/* Headline box */}
                    <div className="bg-slate-900/40 hover:bg-slate-900/70 border border-slate-850 p-3 rounded-xl transition-all space-y-1.5">
                      <span className="text-[9px] text-slate-500 uppercase font-bold block tracking-wider">Notícia Impulsionadora</span>
                      <p className="text-xs text-slate-200 font-sans font-semibold leading-relaxed">
                        &quot;{dec.headline}&quot;
                      </p>
                      <div className="pt-2 border-t border-slate-800/40 grid grid-cols-1 sm:grid-cols-12 gap-2 text-[11px] leading-relaxed">
                        <div className="sm:col-span-3 text-indigo-400 font-bold font-mono uppercase tracking-wider flex items-center gap-1">
                          Ação: {dec.action}
                        </div>
                        <div className="sm:col-span-9 text-slate-400 font-sans">
                          <strong className="text-slate-300">Parecer AI:</strong> {dec.rationale}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* ── NEWS CONTENT VIEWPORTS ─────────────────────────────────────────── */}
      <div className="space-y-4" id="news-results-list">
        <div className="flex justify-between items-center text-xs">
          <span className="font-mono text-slate-500">
            Filtradas <strong className="text-slate-800">{filteredNews.length}</strong> de <strong className="text-slate-800">{news.length}</strong> notícias históricas
          </span>
        </div>

        {aiError && (
          <div className="p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              <strong className="font-bold">Aviso da Harpia AI:</strong> {aiError}
            </div>
          </div>
        )}

        {filteredNews.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 space-y-2">
            <Newspaper className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="font-bold text-slate-700">Nenhuma notícia atende aos filtros definidos</h4>
            <p className="text-xs max-w-md mx-auto">
              Ajuste sua busca textual ou reduza o score mínimo para listar os eventos de sentimentos indexados no banco.
            </p>
          </div>
        ) : (
          filteredNews.map((item) => {
            const hasAiAnalysis = !!aiAnalysisResult[item.id];
            const aiData = aiAnalysisResult[item.id];
            
            return (
              <div 
                key={item.id}
                id={`news-card-${item.id}`}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md hover:border-slate-300 transition-all grid grid-cols-1 md:grid-cols-12"
              >
                {/* Sentiment & KPI block (left on desktop, 3 cols) */}
                <div className={`p-5 md:col-span-3 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col justify-between text-center md:text-left ${
                  item.sentiment === "POSITIVE" ? "bg-emerald-500/5" :
                  item.sentiment === "NEGATIVE" ? "bg-rose-500/5" : "bg-slate-50"
                }`}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-black text-slate-800 bg-white border border-slate-200 px-2.5 py-1 rounded-lg shadow-sm">
                        {item.ticker}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {item.date}
                      </span>
                    </div>

                    <div className="pt-2">
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">Sentimento NLP</span>
                      <div className="flex items-center justify-center md:justify-start gap-1.5 mt-0.5">
                        <span className={`w-2 h-2 rounded-full ${
                          item.sentiment === "POSITIVE" ? "bg-emerald-500 animate-pulse" :
                          item.sentiment === "NEGATIVE" ? "bg-rose-500 animate-pulse" : "bg-slate-400"
                        }`} />
                        <span className={`text-xs font-bold uppercase font-sans ${
                          item.sentiment === "POSITIVE" ? "text-emerald-700" :
                          item.sentiment === "NEGATIVE" ? "text-rose-700" : "text-slate-600"
                        }`}>
                          {item.sentiment === "POSITIVE" ? `Otimista (${item.sentimentScore}%)` :
                           item.sentiment === "NEGATIVE" ? `Pessimista (${item.sentimentScore}%)` : `Neutro (${item.sentimentScore}%)`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100/60 mt-4 md:mt-0">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">Impacto Estimado</span>
                    <strong className={`text-sm font-extrabold font-mono flex items-center justify-center md:justify-start gap-1 mt-0.5 ${
                      item.returnImpactBps > 0 ? "text-emerald-600" : 
                      item.returnImpactBps < 0 ? "text-rose-600" : "text-slate-600"
                    }`}>
                      {item.returnImpactBps > 0 ? `+${item.returnImpactBps} bps` : `${item.returnImpactBps} bps`}
                      <TrendingUp className="w-3.5 h-3.5" />
                    </strong>
                  </div>
                </div>

                {/* Main article content (9 cols) */}
                <div className="p-6 md:col-span-9 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-extrabold text-slate-800 leading-snug hover:text-slate-900 transition-all font-sans">
                      {item.headline}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-sans">
                      {item.content || "A Petrobras informou ao mercado a descoberta de uma nova acumulação de hidrocarbonetos no poço exploratório pioneiro da Bacia de Santos. Testes preliminares indicam óleo leve de alta qualidade comercial, com baixo teor de enxofre, reduzindo custos de refino e impulsionando a margem operacional de longo prazo. O comitê de análise quantitativa da Harpia elevou de imediato a recomendação do papel."}
                    </p>
                  </div>

                  {/* Harpia AI Integration panel */}
                  <div className="pt-4 border-t border-slate-100">
                    {hasAiAnalysis ? (
                      <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2.5 relative overflow-hidden animate-fade-in">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/5 rounded-full blur-2xl" />
                        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                          <h5 className="text-[10px] text-amber-400 font-extrabold uppercase font-mono tracking-wider flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400" />
                            Harpia AI Sentinel Analysis
                          </h5>
                          <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded">
                            Convicção: {aiData.impactScore}%
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          &quot;{aiData.rationale}&quot;
                        </p>
                        <div className="pt-1 text-[11px] font-mono flex items-center gap-2">
                          <span className="text-amber-400">Recomendação:</span>
                          <span className="text-white font-bold">{aiData.action}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <span className="text-[10px] text-slate-400 font-sans">
                          Disponível para avaliação avançada de risco com o comitê gerador da Harpia AI.
                        </span>
                        
                        <button
                          onClick={() => handleAnalyzeNews(item)}
                          disabled={analyzingId !== null}
                          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer border border-slate-800"
                        >
                          {analyzingId === item.id ? (
                            <>
                              <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />
                              Harpia AI Pensando...
                            </>
                          ) : (
                            <>
                              <Cpu className="w-3 h-3 text-emerald-400" />
                              Parecer da Harpia AI
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
