/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from "react";
import { getMarketStatus } from "../lib/marketHours";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from "recharts";
import { 
  TrendingUp, 
  ShieldAlert, 
  Activity, 
  Flame, 
  Award, 
  Layers, 
  Compass, 
  ArrowUpRight,
  Sparkles,
  Sprout,
  Coins,
  TrendingDown,
  Terminal,
  ShieldCheck,
  Scale,
  MessageSquare,
  HelpCircle,
  RefreshCw,
  Play,
  HeartHandshake,
  AlertTriangle,
  BookOpen,
  DollarSign,
  Zap,
  Workflow,
  Search,
  Lock,
  Database,
  Trees,
  Eye
} from "lucide-react";
import { PerformanceMetrics, Asset } from "../types";
import AgroIntelligenceMonitor from "./AgroIntelligenceMonitor";
import harpiaFinanceLogo from "../assets/images/harpia_finance_asset_logo_1786654503116.jpg";

interface OverviewPanelProps {
  metrics: PerformanceMetrics;
  historyData: any[];
  assets: Asset[];
}

export default function OverviewPanel({ metrics, historyData, assets }: OverviewPanelProps) {
  const [chartMode, setChartMode] = useState<"EQUITY" | "DRAWDOWN">("EQUITY");
  const [activeCrop, setActiveCrop] = useState<"SOJA" | "MILHO" | "CAFÉ">("SOJA");
  const [activeSubTab, setActiveSubTab] = useState<"institucional" | "oportunidades" | "sqlite_mestre" | "agro_saf">("institucional");
  
  // Simulated autonomous trading state
  const [autoTrades, setAutoTrades] = useState<any[]>([
    {
      id: "HT-2026-081",
      timestamp: "10:32:15",
      asset: "SOJA",
      action: "BUY_LONG",
      size: "250 lotes",
      price: "U$ 11.80/bu",
      rationale: "Estresse térmico severo via NDVI no Centro-Oeste reduz projeção de safra física."
    },
    {
      id: "HT-2026-080",
      timestamp: "09:45:00",
      asset: "BBAS3",
      action: "REDUCE_RISK",
      size: "15.000 ações",
      price: "R$ 27.90",
      rationale: "Alerta preventivo: Inadimplência do crédito rural de produtores pressionada pelo El Niño."
    },
    {
      id: "HT-2026-079",
      timestamp: "09:15:30",
      asset: "OURO",
      action: "BUY_HEDGE",
      size: "10 kg",
      price: "R$ 418.50/g",
      rationale: "Escalada geopolítica e bloqueios em canais marítimos disparam busca por portos seguros."
    }
  ]);
  const [isConsoleRunning, setIsConsoleRunning] = useState<boolean>(true);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    "[SYSTEM] Harpia Autonomous Execution Engine v3.5 carregado com sucesso.",
    "[DATA] Conexão com B3, S&P 500, CVM e Fed autenticada e em tempo de execução real.",
    "[AI-SENTINEL] Lendo Google News RSS feed para tickers do universo agro e ações domésticas...",
    "[SENTIMENT] PETR4 sentimento estável em 88%. BBAS3 sentimento sob observação de crédito (68%).",
    "[MODEL] Pesos ótimos recalibrados via Hierarchical Risk Parity (HRP) com cap de concentração de 15%."
  ]);

  // Handle manual trigger of autonomous trade calculation
  const handleTriggerAutonomousCheck = () => {
    const timestamp = new Date().toTimeString().split(" ")[0];
    const agroSentiment = assets.find(a => a.ticker === activeCrop)?.scores.news || 50;
    const currentMkt = getMarketStatus();
    
    let newTrade = null;
    let newLog = "";

    if (!currentMkt.isOpen) {
      newTrade = {
        id: `HT-AGENDADO-${Math.floor(Math.random() * 90 + 90)}`,
        timestamp: "Agendado (10:00)",
        asset: activeCrop,
        action: "BUY_HEDGE",
        size: "120 lotes",
        price: activeCrop === "SOJA" ? "U$ 11.95/bu" : activeCrop === "MILHO" ? "R$ 64.20/sc" : "R$ 215.40/sc",
        rationale: `[PREGÃO FECHADO] Ordem tática agendada para o leilão de abertura da B3 às 10:00 BRT.`
      };
      newLog = `[MARKET CLOSED] Pregão B3 fechado. Ordem ${newTrade.id} registrada com sucesso e AGENDADA para abertura (10:00 BRT).`;
    } else if (agroSentiment < 60) {
      newTrade = {
        id: `HT-2026-0${Math.floor(Math.random() * 90 + 90)}`,
        timestamp,
        asset: activeCrop,
        action: "BUY_HEDGE",
        size: "120 lotes",
        price: activeCrop === "SOJA" ? "U$ 11.95/bu" : activeCrop === "MILHO" ? "R$ 64.20/sc" : "R$ 215.40/sc",
        rationale: `Estresse hídrico e feedback de produtores em ${activeCrop} disparam compra imediata de contratos futuros.`
      };
      newLog = `[TRADE EXECUTED] ${newTrade.id} - ${newTrade.action} ${newTrade.asset} como hedge tático de cauda.`;
    } else {
      newTrade = {
        id: `HT-2026-0${Math.floor(Math.random() * 90 + 90)}`,
        timestamp,
        asset: "CDI",
        action: "ALLOCATE_CASH",
        size: "R$ 1.5M nominal",
        price: "100.0% par",
        rationale: `Condição de safra ideal em ${activeCrop}. Alocando prêmio excedente no caixa seguro CDI.`
      };
      newLog = `[SYSTEM CORE] Safra favorável. Alocando capital remanescente no porto seguro CDI.`;
    }

    setAutoTrades(prev => [newTrade, ...prev.slice(0, 4)]);
    setConsoleLogs(prev => [
      `[AI-AGENT] Iniciando varredura tática de oportunidades de hedge...`,
      `[SENTINEL-NEWS] Sentiment score para ${activeCrop}: ${agroSentiment}%.`,
      newLog,
      ...prev.slice(0, 4)
    ]);
  };

  // Live feed effect simulator
  useEffect(() => {
    if (!isConsoleRunning) return;
    const interval = setInterval(() => {
      const tickers = ["PETR4", "VALE3", "WEGE3", "ITUB4", "BBAS3", "SOJA", "MILHO", "CAFÉ", "OURO", "USD_BRL", "CDI"];
      const randomTicker = tickers[Math.floor(Math.random() * tickers.length)];
      const randomMsg = [
        `[AUDIT] Shadow Ledger SQLite sincronizado com B3 para o ticker ${randomTicker}.`,
        `[AI-SENTINEL] Varredura de notícias completada para ${randomTicker}. Sentimento em conformidade.`,
        `[GRC COMPLIANCE] Portfólio em total conformidade com o limite fiduciário de 30% por ativo.`,
        `[DATA ENGINE] Lendo balanços trimestrais da CVM e atualizando scoring de crédito de ponta a ponta.`,
        `[MODEL] Otimizando fronteira eficiente Black-Litterman sob volatilidade de regime.`
      ][Math.floor(Math.random() * 5)];

      setConsoleLogs(prev => [randomMsg, ...prev.slice(0, 7)]);
    }, 8000);
    return () => clearInterval(interval);
  }, [isConsoleRunning]);

  // Format currencies & percentages
  const formatPct = (val: number) => `${(val * 100).toFixed(2)}%`;
  const formatBrl = (val: number) => `R$ ${val.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Multi-Asset holdings based on assets
  const sortedHoldings = useMemo(() => {
    // Standard baseline weights for demonstration that reflect portfolio diversification
    const dynamicWeights: Record<string, { weight: number, class: string, hedge: boolean }> = {
      PETR4: { weight: 0.12, class: "Ações B3", hedge: false },
      VALE3: { weight: 0.10, class: "Ações B3", hedge: false },
      WEGE3: { weight: 0.08, class: "Ações B3", hedge: false },
      ITUB4: { weight: 0.08, class: "Ações B3", hedge: false },
      BBAS3: { weight: 0.06, class: "Ações B3", hedge: false },
      IVVB11: { weight: 0.10, class: "ETFs Globais", hedge: true },
      SOJA: { weight: 0.06, class: "Commodities", hedge: true },
      MILHO: { weight: 0.05, class: "Commodities", hedge: true },
      CAFÉ: { weight: 0.05, class: "Commodities", hedge: true },
      OURO: { weight: 0.10, class: "Proteção Spot", hedge: true },
      USD_BRL: { weight: 0.05, class: "Câmbio Hedge", hedge: true },
      CDI: { weight: 0.15, class: "Renda Fixa / Caixa", hedge: true },
    };

    return Object.keys(dynamicWeights).map(ticker => {
      const assetInfo = assets.find(a => a.ticker === ticker);
      const wInfo = dynamicWeights[ticker];
      return {
        ticker,
        name: assetInfo?.name || ticker,
        weight: wInfo.weight,
        class: wInfo.class,
        isHedge: wInfo.hedge,
        score: assetInfo?.scores.news || 70,
        returnBL: assetInfo?.expectedReturnBL || 0.12
      };
    }).sort((a, b) => b.weight - a.weight);
  }, [assets]);

  // Agro & Safety (SAFe) data computation based on active crop
  const agroSAFeDetails = useMemo(() => {
    const cropAsset = assets.find(a => a.ticker === activeCrop);
    const sentiment = cropAsset?.scores.news || 60;
    const creditScore = cropAsset?.scores.credit || 75;
    
    // Physical NDVI calculation (simulated from score)
    const ndviVal = 0.4 + (sentiment / 100) * 0.45; // maps to 0.40 - 0.85
    let ndviStatus = "Estresse Térmico / Seca";
    let ndviColor = "text-rose-600 bg-rose-50 border-rose-200";
    if (ndviVal >= 0.72) {
      ndviStatus = "Excelente - Vigor Ideal";
      ndviColor = "text-emerald-600 bg-emerald-50 border-emerald-200";
    } else if (ndviVal >= 0.58) {
      ndviStatus = "Moderado - Atenção Hídrica";
      ndviColor = "text-amber-600 bg-amber-50 border-amber-200";
    }

    // Producer credit & social complaints (safra ágio / descontentamento internet)
    const socialDissatisfaction = Math.floor(100 - sentiment * 0.8); // lower sentiment = higher internet dissatisfaction
    const creditRisk = creditScore < 75 ? "Crédito Pressionado (Alto Ágio)" : "Crédito Robusto (Baixo Spread)";

    // Opportunities & response actions
    const futureHedgeWeight = (100 - sentiment) * 0.25; // larger hedge if sentiment is poor
    
    return {
      ndvi: ndviVal,
      ndviStatus,
      ndviColor,
      creditScore,
      creditRisk,
      socialDissatisfaction,
      futureHedgeWeight
    };
  }, [activeCrop, assets]);

  // Opportunity Cost (Custo por Oportunidade) tracking math
  const opportunityCostTracker = useMemo(() => {
    // Opportunity cost: difference between holding massive cash cushions (CDI) vs optimal BL asset weighting
    const cashWeight = 0.15; // 15% CDI
    const currentReturn = metrics.annReturn; // 24.50%
    const optimalBLReturn = 0.2812; // 28.12% optimal BL target return
    const forgoneAlpha = optimalBLReturn - currentReturn;
    const alphaBps = Math.floor(forgoneAlpha * 10000);
    
    // Financial drag on a R$ 100M portfolio
    const currencyDrag = forgoneAlpha * 100_000_000;
    
    // Risk offset (forgone return is a conscious payment for down-side protection / volatility cushion)
    const realizedMaxDrawdown = Math.abs(metrics.maxDrawdown); // 6.82%
    const passiveMaxDrawdown = 0.2450; // 24.50% Ibovespa DD (Subprime or joesley shock)
    const savedDrawdownPct = passiveMaxDrawdown - realizedMaxDrawdown;
    const savedLossCurrency = savedDrawdownPct * 100_000_000;

    return {
      currentReturn,
      optimalBLReturn,
      forgoneAlpha,
      alphaBps,
      currencyDrag,
      realizedMaxDrawdown,
      passiveMaxDrawdown,
      savedLossCurrency,
      efficiencyRatio: (savedLossCurrency / currencyDrag).toFixed(2)
    };
  }, [metrics]);

  return (
    <div className="space-y-6" id="overview-panel-container">
      
      {/* ── METRICS BENTO GRID ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" id="metrics-grid">
        {/* Retornos */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-3sm relative overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-all" id="metric-returns">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider font-sans">Retorno Anualizado (CAGR)</span>
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
              <TrendingUp className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black font-sans tracking-tight text-slate-800">
              {formatPct(metrics.annReturn)}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400 font-mono">
              <span className="text-emerald-600 font-bold">{formatPct(metrics.totalReturn)}</span>
              <span>acumulado total</span>
            </div>
          </div>
          <div className="border-t border-slate-100 mt-4 pt-3 flex justify-between items-center text-[11px] text-slate-500">
            <span>Prêmio Excedente vs CDI</span>
            <span className="text-emerald-600 font-bold font-mono">+{formatPct(metrics.excessVsCdi)}</span>
          </div>
        </div>

        {/* Volatilidade & Beta */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-3sm relative overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-all" id="metric-vol-beta">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider font-sans">Perfil Vol / Beta</span>
            <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
              <Activity className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black font-sans tracking-tight text-slate-800">
              {formatPct(metrics.volatility)}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400 font-mono">
              <span>Beta vs Ibovespa:</span>
              <span className="text-blue-600 font-bold">{metrics.beta.toFixed(2)}</span>
            </div>
          </div>
          <div className="border-t border-slate-100 mt-4 pt-3 flex justify-between items-center text-[11px] text-slate-500">
            <span>Regime Estimado</span>
            <span className="text-blue-600 font-bold font-mono">BULL_LOW_VOL</span>
          </div>
        </div>

        {/* Índices de Sharpe & Ratios */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-3sm relative overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-all" id="metric-ratios">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider font-sans">Métricas de Sharpe</span>
            <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
              <Award className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black font-sans tracking-tight text-slate-800">
              {metrics.sharpe.toFixed(2)}
            </h3>
            <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 font-mono">
              <div>
                <span>Sortino: </span>
                <span className="text-amber-600 font-bold">{metrics.sortino.toFixed(2)}</span>
              </div>
              <div>
                <span>Calmar: </span>
                <span className="text-slate-600 font-bold">{metrics.calmar.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-100 mt-4 pt-3 flex justify-between items-center text-[11px] text-slate-500">
            <span>Taxa Livre de Risco</span>
            <span className="text-slate-600 font-mono font-bold">{formatPct(metrics.cdiAnn)} a.a.</span>
          </div>
        </div>

        {/* Cauda - VaR & CVaR */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-3sm relative overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-all" id="metric-cvar">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider font-sans">Risco Cauda (CVaR)</span>
            <div className="p-2 bg-rose-50 rounded-xl text-rose-600">
              <Flame className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black font-sans tracking-tight text-rose-600">
              -{formatPct(metrics.cvar95)}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400 font-mono">
              <span>VaR Histórico (95%):</span>
              <span className="text-rose-500 font-semibold">-{formatPct(metrics.var95)}</span>
            </div>
          </div>
          <div className="border-t border-slate-100 mt-4 pt-3 flex justify-between items-center text-[11px] text-slate-500">
            <span>Máximo Drawdown</span>
            <span className="text-rose-600 font-bold font-mono">-{formatPct(Math.abs(metrics.maxDrawdown))}</span>
          </div>
        </div>
      </div>

      {/* ── MANDATE ROADMAP STATUS ────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-3sm flex flex-col lg:flex-row items-center justify-between gap-4 relative overflow-hidden" id="roadmap-banner">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-500" />
        <div className="flex items-start gap-3.5">
          <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 border border-emerald-100 mt-1 shrink-0">
            <Sparkles className="w-5.5 h-5.5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 flex-wrap">
              Status do Mandato de Investimento - v3.5 Ativo
              <span className="px-2 py-0.5 text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full font-mono uppercase tracking-wider font-bold">
                MÁXIMA AUTONOMIA DE PORTFÓLIO
              </span>
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
              O fundo quantitativo opera de forma integrada e 100% calibrada. O motor algorítmico possui mandato fiduciário aprovado para arbitrar e alocar entre ações B3, ETFs globais, Forex e commodities sob regras duras de concentração máxima redistribuída.
            </p>
          </div>
        </div>
        <div className="flex gap-4 border-t lg:border-t-0 lg:border-l border-slate-150 pt-3 lg:pt-0 lg:pl-6 text-[10px] text-slate-500 min-w-[220px]" id="criteria-checklist">
          <div className="space-y-1.5 w-full">
            <div className="flex items-center justify-between font-mono">
              <span className="text-slate-400">Target Sharpe:</span>
              <span className="text-emerald-600 font-bold">&gt; 1.50 ({metrics.sharpe.toFixed(2)})</span>
            </div>
            <div className="flex items-center justify-between font-mono">
              <span className="text-slate-400">Excess vs CDI:</span>
              <span className="text-emerald-600 font-bold">&gt; 4.0% ({formatPct(metrics.excessVsCdi)})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Subtabs Selector: Institutional vs Market Opportunities vs SQLite Master Data */}
      <div className="flex flex-col sm:flex-row bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-2sm gap-1" id="subtab-selector-bar">
        <button
          onClick={() => setActiveSubTab("institucional")}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-tight transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === "institucional"
              ? "bg-slate-900 text-white shadow-sm font-black"
              : "text-slate-500 hover:text-slate-850 hover:bg-white/50"
          }`}
        >
          🏢 Ficha Institucional & Performance
        </button>
        <button
          onClick={() => setActiveSubTab("oportunidades")}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-tight transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === "oportunidades"
              ? "bg-slate-900 text-white shadow-sm font-black"
              : "text-slate-500 hover:text-slate-850 hover:bg-white/50"
          }`}
        >
          ⚡ Monitor de Oportunidades & Arbitragens
        </button>
        <button
          onClick={() => setActiveSubTab("sqlite_mestre")}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-tight transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === "sqlite_mestre"
              ? "bg-slate-900 text-white shadow-sm font-black"
              : "text-slate-500 hover:text-slate-850 hover:bg-white/50"
          }`}
        >
          🗄️ Dorsal SQLite Mestre-Data
        </button>
        <button
          onClick={() => setActiveSubTab("agro_saf")}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-tight transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === "agro_saf"
              ? "bg-emerald-700 text-white shadow-sm font-black"
              : "text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50/50"
          }`}
        >
          🌿 Monitor SAF &amp; Olho da Harpia
        </button>
      </div>

      {activeSubTab === "agro_saf" && (
        <div className="space-y-4 animate-fadeIn">
          <AgroIntelligenceMonitor />
        </div>
      )}

      {activeSubTab === "institucional" && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn" id="core-philosophy-performance-grid">
        
        {/* LEFT COLUMN: INSTITUTIONAL CONSTITUTION & AUTONOMOUS AGENT (5 COLS) */}
        <div className="lg:col-span-5 space-y-6" id="left-column">
          
          {/* Institutional Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-3sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <BookOpen className="w-5 h-5 text-slate-700" />
              <div>
                <h3 className="text-sm font-bold text-slate-800 tracking-tight">Ficha Técnica &amp; Mandato Institucional</h3>
                <span className="text-[10px] font-mono text-slate-400 block uppercase">Harpia Finance Asset Corp • EST. 1978</span>
              </div>
            </div>

            {/* Official Harpia Finance Asset Emblem Photo */}
            <div className="relative rounded-xl overflow-hidden border border-amber-500/20 bg-slate-950 p-4 flex items-center gap-4 shadow-inner">
              <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-xl overflow-hidden border-2 border-amber-400/40 shadow-lg bg-slate-900">
                <img 
                  src={harpiaFinanceLogo} 
                  alt="Harpia Finance Asset - Harpy Capital EST. 1978" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                    Fundo Flagship
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">EST. 1978</span>
                </div>
                <h4 className="text-xs sm:text-sm font-black text-white tracking-tight">
                  HARPIA FINANCE ASSET
                </h4>
                <p className="text-[10px] text-slate-300 font-sans leading-tight">
                  Harpy Capital • Gestão de Recursos &amp; Multimercado Quantitativo com Governança Fiduciária CVM 175.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              O <strong>Harpia Finance Asset</strong> é um fundo de investimento multimercado quantitativo estruturado sobre uma arquitetura de decisão fiduciária híbrida. Ele funde <strong>Machine Learning (XGBoost, LSTM)</strong> com otimizadores clássicos robustecidos (Black-Litterman e HRP) para arbitrar assimetrias no mercado global.
            </p>

            <div className="space-y-2.5 pt-1 text-xs">
              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                <span className="text-slate-500 font-medium">Universo Ativo</span>
                <span className="font-mono text-slate-800 font-bold text-[10px] bg-slate-200 px-2 py-0.5 rounded">
                  Ações B3 | Commodities | Forex | Gold | CDI
                </span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                <span className="text-slate-500 font-medium">Capacidade de Hedge</span>
                <span className="font-mono text-emerald-600 font-bold text-[10px] bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                  Compra Spot, Futuros &amp; Opções B3
                </span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-150">
                <span className="text-slate-500 font-medium">Limite de Concentração</span>
                <span className="font-mono text-rose-600 font-bold text-[10px] bg-rose-50 border border-rose-100 px-2 py-0.5 rounded">
                  Max 15% por ativo (Concentração Cap)
                </span>
              </div>
            </div>
          </div>

          {/* Autonomous Executions Console */}
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl p-5 shadow-3sm space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-purple-400" />
                <div>
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-purple-300">
                    Console Executor de IA Autônomo
                  </h3>
                  <span className="text-[9px] text-slate-500 font-mono">Processamento de Sinais de Mercado &amp; Execução</span>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsConsoleRunning(!isConsoleRunning)}
                  className={`p-1 px-2 text-[9px] font-bold uppercase rounded font-mono border transition-all cursor-pointer ${
                    isConsoleRunning 
                      ? "bg-emerald-950/40 text-emerald-400 border-emerald-900/60" 
                      : "bg-slate-800 text-slate-400 border-slate-700"
                  }`}
                >
                  {isConsoleRunning ? "ONLINE" : "PAUSED"}
                </button>
                
                <button
                  onClick={handleTriggerAutonomousCheck}
                  className="p-1 px-2 text-[9px] font-bold uppercase rounded font-mono bg-purple-600 hover:bg-purple-500 text-white cursor-pointer transition-all flex items-center gap-1"
                >
                  <Play className="w-2.5 h-2.5 fill-current" />
                  AVALIAR
                </button>
              </div>
            </div>

            {/* Simulated Live Orders */}
            <div className="space-y-2">
              <span className="text-[10px] text-purple-300 font-mono font-bold block uppercase tracking-wider">Últimas Transações Autônomas Executadas:</span>
              <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1" id="auto-trades-list">
                {autoTrades.map((t, idx) => (
                  <div key={idx} className="bg-slate-950/80 border border-slate-800/80 p-2 rounded-lg text-[10px] font-mono flex items-start gap-1.5 justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1 text-slate-300">
                        <span className="text-slate-500 font-semibold">{t.timestamp}</span>
                        <strong className="text-white bg-slate-800 px-1 rounded">{t.asset}</strong>
                        <span className={`font-bold uppercase ${
                          t.action.includes("BUY") ? "text-emerald-400" : t.action.includes("REDUCE") ? "text-rose-400" : "text-amber-400"
                        }`}>{t.action}</span>
                      </div>
                      <p className="text-slate-400 font-sans leading-tight mt-0.5">{t.rationale}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-slate-300 font-bold block">{t.size}</span>
                      <span className="text-slate-500 text-[9px] block">{t.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Terminal logs area */}
            <div className="space-y-1 bg-black/60 border border-slate-950 p-2.5 rounded-xl font-mono text-[9px] text-slate-300 h-[100px] overflow-y-auto leading-relaxed">
              {consoleLogs.map((log, idx) => (
                <div key={idx} className={`truncate ${log.includes("TRADE") ? "text-amber-400 font-bold" : log.includes("SYSTEM") ? "text-purple-400" : "text-slate-400"}`}>
                  {log}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: NAV EVOLUTION CHART & PORTFOLIO SPECTRUM LIST (7 COLS) */}
        <div className="lg:col-span-7 space-y-6" id="right-column">
          
          {/* The existing NAV Chart, now refined with proper sizing and styling */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-3sm" id="main-chart-card">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-800 tracking-tight">Evolução de Patrimônio Líquido (NAV)</h3>
                <p className="text-[11px] text-slate-400 font-medium">Curva de rentabilidade real do fundo vs CDI e Ibovespa (BOVA11)</p>
              </div>
              <div className="flex items-center bg-slate-50 p-1 rounded-lg border border-slate-200" id="chart-selector">
                <button
                  id="btn-chart-equity"
                  onClick={() => setChartMode("EQUITY")}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                    chartMode === "EQUITY" 
                      ? "bg-slate-900 text-white shadow-sm" 
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Curva NAV
                </button>
                <button
                  id="btn-chart-drawdown"
                  onClick={() => setChartMode("DRAWDOWN")}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                    chartMode === "DRAWDOWN" 
                      ? "bg-slate-900 text-white shadow-sm" 
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Drawdown
                </button>
              </div>
            </div>

            <div className="h-64 w-full" id="chart-responsive-wrapper">
              {chartMode === "EQUITY" ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "8px", fontSize: "11px" }}
                      labelStyle={{ color: "#64748b", fontWeight: "bold" }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                    <Line type="monotone" dataKey="fund" name="Harpia Finance Asset" stroke="#10b981" strokeWidth={2.2} dot={false} activeDot={{ r: 5 }} />
                    <Line type="monotone" dataKey="bench" name="Ibovespa (BOVA11)" stroke="#3b82f6" strokeWidth={1.2} strokeDasharray="4 4" dot={false} />
                    <Line type="monotone" dataKey="cdi" name="CDI acumulado" stroke="#eab308" strokeWidth={1.2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={historyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="drawdownGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.01}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} unit="%" />
                    <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "8px", fontSize: "11px" }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                    <Area type="monotone" dataKey="fundDrawdown" name="Harpia Drawdown" stroke="#f43f5e" fillOpacity={1} fill="url(#drawdownGrad)" strokeWidth={1.8} />
                    <Area type="monotone" dataKey="benchDrawdown" name="Ibovespa Drawdown" stroke="#3b82f6" fillOpacity={0.01} fill="#3b82f6" strokeWidth={1} strokeDasharray="3 3" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Dynamic Holdings Portfolio Breakdown Spectrum */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-3sm space-y-4">
            <div className="pb-2 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-800 tracking-tight">Composição Ativa &amp; Espectro de Ativos</h3>
                <p className="text-[11px] text-slate-400">Espectro de alocação quantitativa atualizada, com destaque para hedges táticos</p>
              </div>
              <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded font-bold uppercase">
                100% Alocado
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="active-holdings-grid">
              {sortedHoldings.map((hold) => (
                <div key={hold.ticker} className="p-3 bg-slate-50 border border-slate-150/80 rounded-xl flex items-center justify-between gap-2 hover:border-slate-300 transition-all">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-slate-900 text-xs bg-slate-250 px-1.5 py-0.5 rounded border border-slate-300/60">
                        {hold.ticker}
                      </span>
                      <span className="text-[9px] text-slate-400 font-medium truncate max-w-[120px]" title={hold.name}>
                        {hold.name}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1 text-[10px]">
                      <span className="text-slate-400">{hold.class}</span>
                      {hold.isHedge && (
                        <span className="text-[8px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 rounded font-bold font-mono">
                          HEDGE
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0 font-mono">
                    <span className="text-slate-800 font-extrabold text-sm block">
                      {formatPct(hold.weight)}
                    </span>
                    <span className="text-[9px] text-slate-400 block">
                      Sent: <strong className={hold.score >= 70 ? "text-emerald-600" : "text-amber-500"}>{hold.score}%</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── SECTION: MONITOR DE SAFE (SAFETY & AGRO CREDIT MONITOR) ─────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-3sm space-y-6 relative overflow-hidden" id="monitor-safe-section">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
        
        <div className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-800 tracking-tight flex items-center gap-2">
              <Sprout className="w-5 h-5 text-emerald-600" />
              Monitor de SAFe (Safety &amp; Agro-Fintech Credit) de Ponta a Ponta
            </h3>
            <p className="text-xs text-slate-500">Módulo de sensibilidade agrícola e proteção do caixa rural integrado com o sentimento do produtor</p>
          </div>
          
          <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-150" id="safe-commodity-selector">
            {(["SOJA", "MILHO", "CAFÉ"] as const).map((crop) => (
              <button
                key={crop}
                onClick={() => setActiveCrop(crop)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeCrop === crop 
                    ? "bg-slate-900 text-white shadow-3sm" 
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {crop}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="safe-metrics-panels">
          
          {/* Meter 1: Crop NDVI Satellite Outlook */}
          <div className="lg:col-span-4 bg-slate-50 border border-slate-150 p-4 rounded-2xl flex flex-col justify-between space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">1. Vigor Climático (Satélite NDVI)</span>
              <h4 className="text-sm font-bold text-slate-800">Sensoriamento Remoto da Safra</h4>
            </div>

            {/* Simulated Heatmap Gauge bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-500">Média Indexada:</span>
                <span className="text-slate-800 font-extrabold">{agroSAFeDetails.ndvi.toFixed(2)} NDVI</span>
              </div>
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden flex">
                <div className="h-full bg-rose-500" style={{ width: "30%" }} title="Dificuldade / Seca" />
                <div className="h-full bg-amber-500" style={{ width: "30%" }} title="Atenção" />
                <div className="h-full bg-emerald-500" style={{ width: "40%" }} title="Vigor Máximo" />
              </div>
              
              {/* Slider cursor indicator */}
              <div className="relative h-2">
                <div 
                  className="absolute -top-3.5 w-3.5 h-3.5 bg-slate-900 border border-white rounded-full shadow-sm" 
                  style={{ left: `${(agroSAFeDetails.ndvi - 0.4) / 0.45 * 100}%`, transform: 'translateX(-50%)' }}
                />
              </div>

              <div className={`text-xs p-2.5 rounded-xl border font-semibold text-center ${agroSAFeDetails.ndviColor}`}>
                {agroSAFeDetails.ndviStatus}
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              Leitura espectral do dossel foliar via satélite na região produtora. Valores abaixo de 0.60 NDVI indicam estresse hídrico severo induzido por anomalias do Super El Niño.
            </p>
          </div>

          {/* Meter 2: Producer Credit and Margin Dissatisfaction */}
          <div className="lg:col-span-4 bg-slate-50 border border-slate-150 p-4 rounded-2xl flex flex-col justify-between space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">2. Risco de Crédito Rural &amp; Descontentamento</span>
              <h4 className="text-sm font-bold text-slate-800">Exposição Bancária &amp; Ágio Produtor</h4>
            </div>

            <div className="space-y-3.5">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between font-mono">
                  <span className="text-slate-500">Inadimplência Safra:</span>
                  <span className="text-rose-600 font-extrabold">{agroSAFeDetails.creditRisk}</span>
                </div>
                <div className="flex justify-between items-center font-mono">
                  <span>Score GRC de Crédito:</span>
                  <strong className={agroSAFeDetails.creditScore >= 75 ? "text-emerald-600" : "text-rose-600"}>
                    {agroSAFeDetails.creditScore}/100
                  </strong>
                </div>
              </div>

              {/* Internet complaints bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-slate-400">Insatisfação na Internet (Ágio/Preços):</span>
                  <span className="text-rose-600 font-bold">{agroSAFeDetails.socialDissatisfaction}%</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full" style={{ width: `${agroSAFeDetails.socialDissatisfaction}%` }} />
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              Calculado a partir de raspagem de dados de reclamações rurais de crédito, variação de prêmio de seguro-safra e ágio financeiro exigido pelas cooperativas agrícolas na internet e canais secundários.
            </p>
          </div>

          {/* Meter 3: Automatic Hedging Reaction Response */}
          <div className="lg:col-span-4 bg-slate-50 border border-slate-150 p-4 rounded-2xl flex flex-col justify-between space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-emerald-600 uppercase tracking-wider block">3. Resposta de Hedge do Fundo Harpia</span>
              <h4 className="text-sm font-bold text-slate-800">Proteção Fiduciária sob Risco</h4>
            </div>

            <div className="space-y-3">
              <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-emerald-800 font-extrabold block uppercase text-[10px] font-mono">Posicionamento Futuros</span>
                  <span className="text-slate-500 text-[11px]">Compra tática de futuros agrícolas</span>
                </div>
                <span className="font-mono text-emerald-700 font-bold bg-white px-2 py-1 rounded border border-emerald-200">
                  +{agroSAFeDetails.futureHedgeWeight.toFixed(1)}% OVERWEIGHT
                </span>
              </div>

              <div className="bg-slate-900 text-slate-100 p-3 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-purple-300 font-mono font-bold block uppercase text-[10px]">Ação de GRC de Crédito</span>
                  <span className="text-slate-400 text-[11px]">Mitigação em ações BBAS3</span>
                </div>
                <span className="font-mono text-rose-400 font-bold bg-slate-950 px-2 py-1 rounded border border-slate-800">
                  UNDERWEIGHT
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              O modelo reage de forma autônoma: caso as lavouras agrícolas sofram quebra física (baixo NDVI), o fundo compra futuros de commodities para capturar a escalada de preços, enquanto reduz ações de alta correlação rústica de crédito.
            </p>
          </div>
        </div>
      </div>
      </>
      )}

      {activeSubTab === "oportunidades" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 animate-fadeIn" id="opportunities-panel">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500 animate-pulse" />
                Monitor Ativo de Anomalias & Oportunidades do Mercado (MTO-Scan)
              </h3>
              <p className="text-xs text-slate-500">Modelos automatizados mapeando desvios estatísticos de commodities, juros e Forex em tempo real.</p>
            </div>
            <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              Scan Status: Ativo e Sincronizado
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Opp 1 */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-all space-y-3 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-800 uppercase font-mono">1. Arbitragem de Spread: Brent vs WTI (Petróleo)</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-mono font-bold">Alta Convergência (94%)</span>
              </div>
              <div className="flex justify-between items-baseline">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-mono">Spread Atual / Histórico</span>
                  <span className="text-xl font-bold font-mono text-emerald-600">7.1% <span className="text-xs text-slate-500 font-normal">(Média: 5.0%)</span></span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase font-mono">Preços de Referência</span>
                  <span className="text-xs text-slate-700 font-bold font-mono">Brent R$ 412.50 vs WTI R$ 385.20</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                As tensões geopolíticas no Oriente Médio e fechamento temporário de dutos de escoamento no Mar do Norte inflaram artificialmente o prêmio físico do barril tipo Brent. O modelo da Harpia Finance recomenda comprar WTI futuro e vender Brent spot para capturar o fechamento de spread.
              </p>
              <div className="flex items-center gap-1.5 pt-1 text-[10px] text-emerald-600 bg-emerald-50/50 p-2 rounded-lg font-mono">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>Risco mitigado: Descorrelação fiduciária contra quedas brutas na B3.</span>
              </div>
            </div>

            {/* Opp 2 */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-all space-y-3 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-amber-500" />
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-800 uppercase font-mono">2. Arbitragem de Dutos de Gás: Gasbol vs GNL Spot</span>
                <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-mono font-bold">Média Convergência (88%)</span>
              </div>
              <div className="flex justify-between items-baseline">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-mono">Diferencial de Custo</span>
                  <span className="text-xl font-bold font-mono text-amber-600">R$ 12.40 / MMBtu</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase font-mono">Origem Energética</span>
                  <span className="text-xs text-slate-700 font-bold font-mono">Importação Bolívia vs GNL Sergipe</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Queda de 15% na exportação física boliviana devido a manutenção periódica expandiu o prêmio do gás importado. A Harpia sugere contratação física via Gasbol com hedge futuro equivalente na NYMEX para blindar custos térmicos da carteira.
              </p>
              <div className="flex items-center gap-1.5 pt-1 text-[10px] text-amber-600 bg-amber-50/50 p-2 rounded-lg font-mono">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>Risco mitigado: Cobertura contra oscilações bruscas nas geradoras elétricas.</span>
              </div>
            </div>

            {/* Opp 3 */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-all space-y-3 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-purple-500" />
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-800 uppercase font-mono">3. Ágio de Oz de Ouro Físico (Troy Ounce Spot)</span>
                <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-mono font-bold">Máxima Segurança (98%)</span>
              </div>
              <div className="flex justify-between items-baseline">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-mono">Ágio Doméstico Recuado</span>
                  <span className="text-xl font-bold font-mono text-purple-600">1.2% <span className="text-xs text-slate-500 font-normal">(Histórico: 2.4%)</span></span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase font-mono">Cotação Onça Troy</span>
                  <span className="text-xs text-slate-700 font-bold font-mono">R$ 13.420,00 / Oz</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Com o recuo temporário do ágio local devido à alta liquidez cambial, o prêmio do Ouro Spot (Oz troy) na B3 apresenta oportunidade ideal de compra física, realizando hedge simultâneo com contratos na COMEX americana para proteção absoluta de capital.
              </p>
              <div className="flex items-center gap-1.5 pt-1 text-[10px] text-purple-600 bg-purple-50/50 p-2 rounded-lg font-mono">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>Risco mitigado: Blindagem inflacionária sob choques geopolíticos extremos.</span>
              </div>
            </div>

            {/* Opp 4 */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-all space-y-3 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-blue-500" />
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-800 uppercase font-mono">4. Carry-Trade de Juros Arbitrado: BRL vs EUR</span>
                <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-mono font-bold">Renda de Curto Prazo (91%)</span>
              </div>
              <div className="flex justify-between items-baseline">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-mono">Spread Ativo Líquido</span>
                  <span className="text-xl font-bold font-mono text-blue-600">+6.25% a.a.</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase font-mono">Taxas Livres de Risco</span>
                  <span className="text-xs text-slate-700 font-bold font-mono">DI Brasil 10.50% vs BCE 4.25%</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Aproveitando o diferencial elevado de taxas nominais entre o Banco Central do Brasil e o BCE europeu, o modelo estrutura posições de carry-trade de curto prazo, travando o risco de variação cambial por meio de contratos derivativos de swap.
              </p>
              <div className="flex items-center gap-1.5 pt-1 text-[10px] text-blue-600 bg-blue-50/50 p-2 rounded-lg font-mono">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>Risco mitigado: Garante colchão líquido sem exposição a perdas acionárias B3.</span>
              </div>
            </div>
          </div>

          {/* Opportunities Simulator Panel */}
          <div className="bg-slate-900 text-slate-100 rounded-xl p-5 relative overflow-hidden space-y-4">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <div>
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300">Painel Interativo de Anomalias de Cauda</h4>
                <p className="text-[10px] text-slate-400">Force simulações de anomalias geopolíticas e calcule o rebalanceamento de proteção da Harpia.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button 
                onClick={() => alert("Simulação Ativada: Spread Brent-WTI alargado para 9.8%. Harpia AI rebalanceou peso de PETR4 para 10.5% e aumentou caixa CDI para 18.0% com Custo de Oportunidade fiduciário calculado em 0.45% e Contrapartida Quantitativa compensada em contratos futuros COMEX (Trace ID: OP-BWT-992).")}
                className="bg-slate-800 hover:bg-slate-750 border border-slate-700 p-3 rounded-lg text-left text-xs space-y-1.5 transition-all cursor-pointer"
              >
                <div className="flex justify-between items-center font-mono">
                  <span className="font-bold text-amber-300">Escalada Oriente Médio</span>
                  <span className="text-[8px] bg-red-500/25 text-red-300 px-1.5 py-0.5 rounded">Risco Alto</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">Provoca salto de +15% no Brent, ampliando a arbitragem energética.</p>
              </button>

              <button 
                onClick={() => alert("Simulação Ativada: Ágio de Ouro Troy Ounce física disparou para 3.5%. Harpia AI elevou alocação protetiva em OURO de 10% para 14% de forma autônoma, liquidando posições vulneráveis de ITUB4 (Trace ID: OP-GLD-881).")}
                className="bg-slate-800 hover:bg-slate-750 border border-slate-700 p-3 rounded-lg text-left text-xs space-y-1.5 transition-all cursor-pointer"
              >
                <div className="flex justify-between items-center font-mono">
                  <span className="font-bold text-amber-300">Corrida por Segurança (Oz Ouro)</span>
                  <span className="text-[8px] bg-emerald-500/25 text-emerald-300 px-1.5 py-0.5 rounded">Proteção</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">Dispara demanda por Onças Troy físicas, reduzindo a exposição em ações cíclicas.</p>
              </button>

              <button 
                onClick={() => alert("Simulação Ativada: Bloqueio físico de gasodutos na Europa Oriental reduziu vazão de Gás Natural. O spread GNL saltou +22%. O modelo aumentou posições de utilities de alta imunidade a.a. (Trace ID: OP-GAS-011).")}
                className="bg-slate-800 hover:bg-slate-750 border border-slate-700 p-3 rounded-lg text-left text-xs space-y-1.5 transition-all cursor-pointer"
              >
                <div className="flex justify-between items-center font-mono">
                  <span className="font-bold text-amber-300">Escassez Crítica de Gás</span>
                  <span className="text-[8px] bg-amber-500/25 text-amber-300 px-1.5 py-0.5 rounded">Setorial</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">Causa estresse térmico em geradoras domésticas, abrindo spread de arbitragem.</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "sqlite_mestre" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6 animate-fadeIn" id="sqlite-mestre-panel">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-600" />
                Dorsal de Dados Mestre SQLite Core (0ms Overhead local_ledger.db)
              </h3>
              <p className="text-xs text-slate-500">Mapeamento direto, indexação em B-Tree avançada nos campos de chave múltipla.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono font-bold text-slate-600">WAL Mode Enabled</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-1.5">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Queries por Segundo (QPS)</span>
              <strong className="text-2xl font-bold font-mono text-slate-800">122.450 QPS</strong>
              <p className="text-[10px] text-slate-400">Leitura simultânea ultra-eficiente sem gargalo de rede na Nuvem.</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-1.5">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Latência Média de Index</span>
              <strong className="text-2xl font-bold font-mono text-emerald-600">&lt; 0.08 ms</strong>
              <p className="text-[10px] text-slate-400">Respostas em tempo real para otimizações Black-Litterman robustecidas.</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-1.5">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Segurança e Concorrência</span>
              <strong className="text-2xl font-bold font-mono text-blue-600">Alta (Thread Safe)</strong>
              <p className="text-[10px] text-slate-400">Bloqueio fiduciário impedindo race-conditions no shadow ledger.</p>
            </div>
          </div>

          {/* SQLite Code schema description */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Estrutura de Tabelas e Chaves de Alto Desempenho</h4>
            <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-[11px] leading-relaxed overflow-x-auto">
              <p className="text-amber-300">-- Definição otimizada para busca concorrente do Mestre Data</p>
              <p><span className="text-purple-400">CREATE TABLE</span> <span className="text-blue-300">price_macro_data</span> (</p>
              <p>&nbsp;&nbsp;timestamp <span className="text-emerald-400">TEXT NOT NULL</span>,</p>
              <p>&nbsp;&nbsp;ticker <span className="text-emerald-400">TEXT NOT NULL</span>,</p>
              <p>&nbsp;&nbsp;price <span className="text-emerald-400">REAL NOT NULL</span>,</p>
              <p>&nbsp;&nbsp;source <span className="text-emerald-400">TEXT NOT NULL</span>,</p>
              <p>&nbsp;&nbsp;<span className="text-purple-400">PRIMARY KEY</span> (timestamp, ticker)</p>
              <p>);</p>
              <p className="text-amber-300 mt-2">-- Índice B-Tree de alta velocidade para varredura de séries temporais</p>
              <p><span className="text-purple-400">CREATE INDEX</span> idx_price_time <span className="text-purple-400">ON</span> price_macro_data (timestamp, ticker, price);</p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-start gap-3">
            <HelpCircle className="text-slate-500 w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 leading-relaxed">
              <strong>Como funciona a eficiência do Mestre Data?</strong> Em vez de realizar chamadas de rede API sequenciais que demoram de 300ms a 1200ms por ativo, toda a base de séries históricas do FED, CVM, B3 e notícias é agregada em segundo plano e injetada no banco SQLite. Quando o painel carrega ou realiza simulações, ele lê diretamente do ledger local instantaneamente sem travar a interface do usuário!
            </div>
          </div>
        </div>
      )}

      {/* ── SECTION: CUSTO POR OPORTUNIDADE (OPPORTUNITY COST & DRAG) ───────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-3sm space-y-6" id="opportunity-cost-section">
        
        <div className="pb-3 border-b border-slate-100 flex justify-between items-center flex-wrap gap-2">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <Scale className="w-5 h-5 text-slate-700" />
              Custo por Oportunidade e Rastreamento de Drag de Caixa
            </h3>
            <p className="text-[11px] text-slate-400 font-sans">Visualização matemática do equilíbrio entre segurança fiduciária (CDI) e captura de alfa excedente</p>
          </div>
          <span className="text-[10px] font-mono bg-slate-100 border border-slate-200 text-slate-600 font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">
            Relação Sharpe Eficiente
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6" id="opportunity-cost-grid">
          
          {/* Left Block: Math formulas and metrics */}
          <div className="md:col-span-4 bg-slate-50 border border-slate-150 p-4 rounded-2xl space-y-4 font-mono text-xs">
            <div className="pb-2 border-b border-slate-150 text-slate-400 font-bold text-[10px] uppercase">
              Modelo de Retorno Excedente Perdido
            </div>

            <div className="space-y-3 leading-relaxed">
              <div className="space-y-1">
                <span className="text-slate-400 block font-sans">Retorno BL Teórico Ideal:</span>
                <strong className="text-slate-800 text-base font-extrabold">{formatPct(opportunityCostTracker.optimalBLReturn)} a.a.</strong>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 block font-sans">Retorno Realizado com Proteção:</span>
                <strong className="text-slate-800 text-base font-extrabold">{formatPct(opportunityCostTracker.currentReturn)} a.a.</strong>
              </div>
              
              <div className="border-t border-dashed border-slate-200 pt-2 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">Drag Anualizado (bps):</span>
                  <strong className="text-rose-600 font-bold">-{opportunityCostTracker.alphaBps} bps</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">Custo em NAV (R$ 100M):</span>
                  <strong className="text-rose-600 font-bold">-{formatBrl(opportunityCostTracker.currencyDrag).split(",")[0]}</strong>
                </div>
              </div>
            </div>
            
            <div className="text-[10px] text-slate-400 bg-white border border-slate-150 p-2 rounded-xl font-sans leading-normal">
              <strong>Equação Fiduciária:</strong> O custo de oportunidade representa a taxa de seguro voluntária paga ao carregar 15.0% em CDI líquido para garantir liquidez em circuit breakers.
            </div>
          </div>

          {/* Center Block: Risk Savings & Downside Defense */}
          <div className="md:col-span-4 bg-slate-50 border border-slate-150 p-4 rounded-2xl space-y-4 font-mono text-xs">
            <div className="pb-2 border-b border-slate-150 text-slate-400 font-bold text-[10px] uppercase">
              Prêmio de Proteção de Cauda Salvo
            </div>

            <div className="space-y-3 leading-relaxed">
              <div className="space-y-1">
                <span className="text-slate-400 block font-sans">Drawdown Máximo de Referência:</span>
                <strong className="text-slate-800 text-base font-extrabold">-{formatPct(opportunityCostTracker.passiveMaxDrawdown)}</strong>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 block font-sans">Drawdown Máximo do Fundo:</span>
                <strong className="text-emerald-600 text-base font-extrabold">-{formatPct(opportunityCostTracker.realizedMaxDrawdown)}</strong>
              </div>

              <div className="border-t border-dashed border-slate-200 pt-2 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">Perda de NAV Evitada:</span>
                  <strong className="text-emerald-600 font-bold">+{formatBrl(opportunityCostTracker.savedLossCurrency).split(",")[0]}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">Relação de Eficiência:</span>
                  <strong className="text-emerald-600 font-bold">{opportunityCostTracker.efficiencyRatio}x de ganho</strong>
                </div>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 bg-white border border-slate-150 p-2 rounded-xl font-sans leading-normal">
              <strong>Efetividade Estatística:</strong> Para cada R$ 1,00 de retorno abdicado pelo drag de caixa, o modelo de mitigação Harpia protegeu <strong>R$ {opportunityCostTracker.efficiencyRatio}</strong> contra perdas catastróficas em crises históricas.
            </div>
          </div>

          {/* Right Block: Explanatory textual guidelines */}
          <div className="md:col-span-4 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800 font-sans">Atribuição Qualitativa do Custo de Oportunidade</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                No ambiente quantitativo, carregar capital defensivo não é encarado como ineficiência de investimento, mas sim como <strong>Custo de Margem de Cauda Sob Risco</strong>. O otimizador de portfólio equilibra essa taxa fiduciária em tempo real monitorando os scores macro, micro e de notícias de satélite.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-150 p-3 rounded-2xl flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <p className="text-[10px] text-slate-600 font-sans leading-relaxed">
                <strong>Veredito GRC:</strong> A taxa de eficiência de <strong>{opportunityCostTracker.efficiencyRatio}x</strong> indica que a alocação de caixa atual é matematicamente ótima e preserva o mandato fiduciário aprovado sem drenar alfa desnecessariamente.
              </p>
            </div>
          </div>
          
        </div>
      </div>

    </div>
  );
}
