/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Play, 
  Pause, 
  Activity, 
  RefreshCw, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle,
  Brain,
  Layers,
  ArrowUpRight,
  TrendingUp,
  Cpu,
  Sliders,
  BarChart3,
  Zap,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { LedgerPosition, LedgerSnapshot, DriftLog, Asset } from "../types";
import { INITIAL_DRIFT_LOGS } from "../data/mockData";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";

interface TwinPerformancePoint {
  time: string;
  twinReturnPct: number;
  benchmarkReturnPct: number;
  alphaPct: number;
}

interface DigitalTwinPanelProps {
  assets?: Asset[];
}

const HISTORICAL_PERFORMANCE_DATA: Record<string, TwinPerformancePoint[]> = {
  "1D": [
    { time: "09:30", twinReturnPct: 0.00, benchmarkReturnPct: 0.00, alphaPct: 0.00 },
    { time: "10:00", twinReturnPct: 0.45, benchmarkReturnPct: 0.18, alphaPct: 0.27 },
    { time: "11:00", twinReturnPct: 0.82, benchmarkReturnPct: 0.35, alphaPct: 0.47 },
    { time: "12:00", twinReturnPct: 0.64, benchmarkReturnPct: 0.10, alphaPct: 0.54 },
    { time: "13:00", twinReturnPct: 1.15, benchmarkReturnPct: 0.52, alphaPct: 0.63 },
    { time: "14:00", twinReturnPct: 1.48, benchmarkReturnPct: 0.74, alphaPct: 0.74 },
    { time: "15:00", twinReturnPct: 1.92, benchmarkReturnPct: 0.95, alphaPct: 0.97 },
    { time: "16:00", twinReturnPct: 2.24, benchmarkReturnPct: 1.12, alphaPct: 1.12 },
    { time: "17:00", twinReturnPct: 2.55, benchmarkReturnPct: 1.30, alphaPct: 1.25 }
  ],
  "5D": [
    { time: "Seg", twinReturnPct: 0.85, benchmarkReturnPct: 0.40, alphaPct: 0.45 },
    { time: "Ter", twinReturnPct: 1.42, benchmarkReturnPct: 0.75, alphaPct: 0.67 },
    { time: "Qua", twinReturnPct: 2.10, benchmarkReturnPct: 0.90, alphaPct: 1.20 },
    { time: "Qui", twinReturnPct: 2.88, benchmarkReturnPct: 1.45, alphaPct: 1.43 },
    { time: "Sex", twinReturnPct: 3.65, benchmarkReturnPct: 1.85, alphaPct: 1.80 }
  ],
  "1M": [
    { time: "Sem 1", twinReturnPct: 2.10, benchmarkReturnPct: 0.95, alphaPct: 1.15 },
    { time: "Sem 2", twinReturnPct: 4.35, benchmarkReturnPct: 1.80, alphaPct: 2.55 },
    { time: "Sem 3", twinReturnPct: 6.80, benchmarkReturnPct: 2.40, alphaPct: 4.40 },
    { time: "Sem 4", twinReturnPct: 8.95, benchmarkReturnPct: 3.65, alphaPct: 5.30 }
  ],
  "3M": [
    { time: "Mês -3", twinReturnPct: 4.20, benchmarkReturnPct: 1.50, alphaPct: 2.70 },
    { time: "Mês -2", twinReturnPct: 9.80, benchmarkReturnPct: 3.80, alphaPct: 6.00 },
    { time: "Mês -1", twinReturnPct: 14.50, benchmarkReturnPct: 5.90, alphaPct: 8.60 },
    { time: "Atual", twinReturnPct: 18.90, benchmarkReturnPct: 7.40, alphaPct: 11.50 }
  ],
  "1A": [
    { time: "Jan", twinReturnPct: 3.20, benchmarkReturnPct: 1.10, alphaPct: 2.10 },
    { time: "Mar", twinReturnPct: 8.40, benchmarkReturnPct: 3.20, alphaPct: 5.20 },
    { time: "Mai", twinReturnPct: 13.80, benchmarkReturnPct: 5.40, alphaPct: 8.40 },
    { time: "Jul", twinReturnPct: 18.90, benchmarkReturnPct: 7.80, alphaPct: 11.10 },
    { time: "Set", twinReturnPct: 24.10, benchmarkReturnPct: 10.20, alphaPct: 13.90 },
    { time: "Nov", twinReturnPct: 29.50, benchmarkReturnPct: 12.60, alphaPct: 16.90 },
    { time: "Atual", twinReturnPct: 34.80, benchmarkReturnPct: 14.90, alphaPct: 19.90 }
  ]
};

const CustomPerformanceTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const twinPt = payload.find((p: any) => p.dataKey === "twinReturnPct");
    const benchPt = payload.find((p: any) => p.dataKey === "benchmarkReturnPct");
    const twinVal = twinPt ? Number(twinPt.value) : 0;
    const benchVal = benchPt ? Number(benchPt.value) : 0;
    const alphaVal = Number((twinVal - benchVal).toFixed(2));

    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs space-y-1.5 font-sans z-50">
        <div className="font-bold text-slate-800 border-b border-slate-100 pb-1 flex items-center justify-between gap-4 font-mono">
          <span>Tempo / Período</span>
          <span className="text-slate-500">{label}</span>
        </div>
        <div className="flex items-center justify-between gap-6">
          <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            Digital Twin IA
          </span>
          <span className="font-mono font-bold text-emerald-700">
            {twinVal >= 0 ? `+` : ``}{twinVal.toFixed(2)}%
          </span>
        </div>
        <div className="flex items-center justify-between gap-6">
          <span className="text-blue-600 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
            Benchmark Referência
          </span>
          <span className="font-mono font-bold text-blue-600">
            {benchVal >= 0 ? `+` : ``}{benchVal.toFixed(2)}%
          </span>
        </div>
        <div className="border-t border-slate-100 pt-1 flex items-center justify-between gap-6 font-mono">
          <span className="text-slate-600 font-bold">Alpha vs. Benchmark</span>
          <span className={`font-bold ${alphaVal >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
            {alphaVal >= 0 ? `+` : ``}{alphaVal.toFixed(2)}%
          </span>
        </div>
      </div>
    );
  }
  return null;
};

interface SimTradeLog {
  timestamp: string;
  ticker: string;
  orderSize: number;
  temporaryImpactBps: number;
  permanentImpactBps: number;
  slippageBps: number;
  totalCostBps: number;
  costBrl: number;
  fillProbability: number;
}

export default function DigitalTwinPanel({ assets }: DigitalTwinPanelProps = {}) {
  const [activeSubTab, setActiveSubTab] = useState<"LEDGER" | "INTELLIGENCE">("LEDGER");
  
  // Shadow Ledger base states
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [nav, setNav] = useState<number>(119911570.00);
  const [dailyPnl, setDailyPnl] = useState<number>(1854200.00);

  // Interactive Performance Line Chart State (Digital Twin vs Benchmark)
  const [chartTimeframe, setChartTimeframe] = useState<"1D" | "5D" | "1M" | "3M" | "1A" | "LIVE">("1D");
  const [benchmarkType, setBenchmarkType] = useState<"IBOVESPA" | "SP500_BRL" | "CDI_PLUS">("IBOVESPA");
  const [livePerformanceSeries, setLivePerformanceSeries] = useState<TwinPerformancePoint[]>(() => [...HISTORICAL_PERFORMANCE_DATA["1D"]]);

  const benchmarkLabel = React.useMemo(() => {
    return benchmarkType === "IBOVESPA"
      ? "Ibovespa (BOVA11)"
      : benchmarkType === "SP500_BRL"
      ? "S&P 500 R$ (IVVB11)"
      : "CDI + 3% a.a.";
  }, [benchmarkType]);

  const activeChartData = React.useMemo(() => {
    if (chartTimeframe === "LIVE") {
      return livePerformanceSeries;
    }
    const baseSeries = HISTORICAL_PERFORMANCE_DATA[chartTimeframe] || HISTORICAL_PERFORMANCE_DATA["1D"];
    const multiplier = benchmarkType === "SP500_BRL" ? 1.35 : benchmarkType === "CDI_PLUS" ? 0.75 : 1.0;
    return baseSeries.map(pt => {
      const adjBench = Number((pt.benchmarkReturnPct * multiplier).toFixed(2));
      return {
        ...pt,
        benchmarkReturnPct: adjBench,
        alphaPct: Number((pt.twinReturnPct - adjBench).toFixed(2))
      };
    });
  }, [chartTimeframe, benchmarkType, livePerformanceSeries]);

  const latestChartPoint = activeChartData[activeChartData.length - 1] || { twinReturnPct: 0, benchmarkReturnPct: 0, alphaPct: 0 };
  
  // Ledger positions state with real B3 live prices
  const [positions, setPositions] = useState<Record<string, LedgerPosition>>({
    PETR4: { ticker: "PETR4", weight: 0.16, quantity: 425916.82, entryPrice: 38.45, currentPrice: 38.45, unrealizedPnl: 0, lastUpdated: "" },
    VALE3: { ticker: "VALE3", weight: 0.08, quantity: 133785.11, entryPrice: 61.20, currentPrice: 61.20, unrealizedPnl: 0, lastUpdated: "" },
    WEGE3: { ticker: "WEGE3", weight: 0.18, quantity: 426883.33, entryPrice: 43.15, currentPrice: 43.15, unrealizedPnl: 0, lastUpdated: "" },
    ITUB4: { ticker: "ITUB4", weight: 0.26, quantity: 764654.14, entryPrice: 34.80, currentPrice: 34.80, unrealizedPnl: 0, lastUpdated: "" },
    BBAS3: { ticker: "BBAS3", weight: 0.12, quantity: 440215.19, entryPrice: 27.90, currentPrice: 27.90, unrealizedPnl: 0, lastUpdated: "" },
  });

  // Connect real-time assets from App.tsx to DigitalTwin NAV, PnL, and Ledger positions
  useEffect(() => {
    if (!assets || assets.length === 0) return;
    const initialCapital = 100000000;
    let totalUnrealizedPnl = 0;
    assets.forEach(a => {
      const baseShares = a.ticker === "SOJA" || a.ticker === "MILHO" || a.ticker === "CAFÉ"
        ? 50000
        : 250000;
      const baseEntryPrice = a.price * 0.94;
      totalUnrealizedPnl += (a.price - baseEntryPrice) * baseShares;
    });
    setNav(initialCapital + totalUnrealizedPnl);
    setDailyPnl(totalUnrealizedPnl);

    setPositions(prev => {
      const updated: Record<string, LedgerPosition> = { ...prev };
      assets.forEach(asset => {
        if (updated[asset.ticker]) {
          const old = updated[asset.ticker];
          const pnl = (asset.price - old.entryPrice) * old.quantity;
          updated[asset.ticker] = {
            ...old,
            currentPrice: asset.price,
            unrealizedPnl: Number(pnl.toFixed(2)),
            lastUpdated: new Date().toLocaleTimeString("pt-BR")
          };
        }
      });
      return updated;
    });
  }, [assets]);

  // Highlight ticks
  const [priceChanges, setPriceChanges] = useState<Record<string, "UP" | "DOWN" | "STABLE">>({
    PETR4: "STABLE",
    VALE3: "STABLE",
    WEGE3: "STABLE",
    ITUB4: "STABLE",
    BBAS3: "STABLE",
  });

  // Drift metrics
  const [driftLogs, setDriftLogs] = useState<DriftLog[]>(INITIAL_DRIFT_LOGS);
  const [driftScore, setDriftScore] = useState<number>(45);

  // --- Execution Intelligence & Meta-Learning States (ADR-002) ---
  const [selectedAsset, setSelectedAsset] = useState<string>("PETR4");
  const [orderSize, setOrderSize] = useState<number>(12000000); // default R$ 12.0M
  const [volatility, setVolatility] = useState<number>(0.28);
  const [spreadBps, setSpreadBps] = useState<number>(2.5);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simResult, setSimResult] = useState<any>(null);
  
  // Saved simulation feedback log (demonstrating continuous training data collection)
  const [simLogs, setSimLogs] = useState<SimTradeLog[]>([
    {
      timestamp: "10:14:22",
      ticker: "PETR4",
      orderSize: 35000000,
      temporaryImpactBps: 8.85,
      permanentImpactBps: 3.10,
      slippageBps: 2.15,
      totalCostBps: 14.10,
      costBrl: 493500,
      fillProbability: 0.88
    },
    {
      timestamp: "09:45:10",
      ticker: "VALE3",
      orderSize: 8500000,
      temporaryImpactBps: 3.12,
      permanentImpactBps: 1.45,
      slippageBps: 2.12,
      totalCostBps: 6.69,
      costBrl: 56865,
      fillProbability: 0.98
    },
    {
      timestamp: "09:12:05",
      ticker: "ITUB4",
      orderSize: 22000000,
      temporaryImpactBps: 4.15,
      permanentImpactBps: 1.65,
      slippageBps: 1.55,
      totalCostBps: 7.35,
      costBrl: 161700,
      fillProbability: 0.93
    }
  ]);

  // Meta-Learning States
  const [metaRegime, setMetaRegime] = useState<string>("BULL_LOW_VOL");
  const [metaEntropy, setMetaEntropy] = useState<number>(0.25);
  const [metaWeights, setMetaWeights] = useState<Record<string, number>>({
    "News Sentiment (LLM)": 0.20,
    "Fundamentalist XGBoost": 0.50,
    "LSTM Neural Networks": 0.20,
    "Temporal Fusion Transformer (TFT)": 0.10,
  });

  // Streaming effect - price ticks simulation
  useEffect(() => {
    let interval: any = null;
    if (isStreaming) {
      interval = setInterval(() => {
        setPositions(prev => {
          const updated = { ...prev };
          const changes: Record<string, "UP" | "DOWN" | "STABLE"> = {};
          let totalUnrealized = 0;
          let newNav = 102345678.90 - 20000000; // start with Cash base of 20M CDI

          Object.keys(updated).forEach(ticker => {
            const pos = updated[ticker];
            const changePercent = (Math.random() * 0.006) - 0.003; // -0.3% to +0.3%
            const oldPrice = pos.currentPrice;
            const newPrice = oldPrice * (1 + changePercent);
            
            changes[ticker] = newPrice > oldPrice ? "UP" : "DOWN";
            
            const unrealized = (newPrice - pos.entryPrice) * pos.quantity;
            
            updated[ticker] = {
              ...pos,
              currentPrice: parseFloat(newPrice.toFixed(2)),
              unrealizedPnl: parseFloat(unrealized.toFixed(2)),
              lastUpdated: new Date().toLocaleTimeString()
            };

            totalUnrealized += unrealized;
            newNav += newPrice * pos.quantity;
          });

          setPriceChanges(changes);
          setNav(newNav);
          setDailyPnl(totalUnrealized * 0.05 + 128450); // Daily fluctuation simulation
          
          // Slight update on drift score to simulate live analysis
          setDriftScore(prevScore => {
            const fluctuation = Math.floor(Math.random() * 3) - 1;
            return Math.max(10, Math.min(95, prevScore + fluctuation));
          });

          // Real-time tick update for interactive Recharts Performance line chart
          const nowTimeStr = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
          setLivePerformanceSeries(prevSeries => {
            const lastPt = prevSeries[prevSeries.length - 1] || { time: "09:30", twinReturnPct: 2.55, benchmarkReturnPct: 1.30, alphaPct: 1.25 };
            const twinDelta = Number(((Math.random() * 0.18) - 0.04).toFixed(2));
            const benchDelta = Number(((Math.random() * 0.10) - 0.04).toFixed(2));
            const nextTwin = Number((lastPt.twinReturnPct + twinDelta).toFixed(2));
            const nextBench = Number((lastPt.benchmarkReturnPct + benchDelta).toFixed(2));
            const nextAlpha = Number((nextTwin - nextBench).toFixed(2));
            const newPt: TwinPerformancePoint = {
              time: nowTimeStr,
              twinReturnPct: nextTwin,
              benchmarkReturnPct: nextBench,
              alphaPct: nextAlpha
            };
            const nextArr = [...prevSeries, newPt];
            return nextArr.length > 20 ? nextArr.slice(nextArr.length - 20) : nextArr;
          });

          return updated;
        });
      }, 1500);
    } else {
      setPriceChanges({
        PETR4: "STABLE",
        VALE3: "STABLE",
        WEGE3: "STABLE",
        ITUB4: "STABLE",
        BBAS3: "STABLE",
      });
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isStreaming]);

  // Fetch execution simulation from backend
  const handleSimulateExecution = () => {
    setIsSimulating(true);
    fetch("/api/execution/simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ticker: selectedAsset,
        orderSize,
        volatility,
        spreadBps
      })
    })
      .then(res => res.json())
      .then(data => {
        setSimResult(data);
        setIsSimulating(false);
      })
      .catch(err => {
        console.error("Simulation failed:", err);
        setIsSimulating(false);
      });
  };

  // Run execution simulation on variables change
  useEffect(() => {
    handleSimulateExecution();
  }, [selectedAsset, orderSize, volatility, spreadBps]);

  // Fetch meta-learning weights from backend
  useEffect(() => {
    fetch(`/api/meta-learning/weights?regime=${metaRegime}&entropy=${metaEntropy}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.weights) {
          setMetaWeights(data.weights);
        }
      })
      .catch(err => console.error("Failed to fetch meta weights:", err));
  }, [metaRegime, metaEntropy]);

  // Triggered when user selects a stock: set its typical market features
  const handleAssetChange = (ticker: string) => {
    setSelectedAsset(ticker);
    if (ticker === "PETR4") {
      setVolatility(0.28);
      setSpreadBps(2.5);
    } else if (ticker === "VALE3") {
      setVolatility(0.24);
      setSpreadBps(3.0);
    } else if (ticker === "WEGE3") {
      setVolatility(0.19);
      setSpreadBps(4.0);
    } else if (ticker === "ITUB4") {
      setVolatility(0.16);
      setSpreadBps(1.8);
    } else if (ticker === "BBAS3") {
      setVolatility(0.22);
      setSpreadBps(2.2);
    }
  };

  const commitSimulationLog = () => {
    if (!simResult) return;
    const newEntry: SimTradeLog = {
      timestamp: new Date().toLocaleTimeString(),
      ticker: simResult.ticker,
      orderSize: simResult.orderSize,
      temporaryImpactBps: simResult.temporaryImpactBps,
      permanentImpactBps: simResult.permanentImpactBps,
      slippageBps: simResult.slippageBps,
      totalCostBps: simResult.totalCostBps,
      costBrl: simResult.costBrl,
      fillProbability: simResult.fillProbability
    };
    setSimLogs(prev => [newEntry, ...prev]);
  };

  const handleResetLedger = () => {
    setIsStreaming(false);
    setNav(102345678.90);
    setDailyPnl(128450.00);
    setPositions({
      PETR4: { ticker: "PETR4", weight: 0.16, quantity: 425916.82, entryPrice: 38.45, currentPrice: 38.45, unrealizedPnl: 0, lastUpdated: "" },
      VALE3: { ticker: "VALE3", weight: 0.08, quantity: 133785.11, entryPrice: 61.20, currentPrice: 61.20, unrealizedPnl: 0, lastUpdated: "" },
      WEGE3: { ticker: "WEGE3", weight: 0.18, quantity: 426883.33, entryPrice: 43.15, currentPrice: 43.15, unrealizedPnl: 0, lastUpdated: "" },
      ITUB4: { ticker: "ITUB4", weight: 0.26, quantity: 764654.14, entryPrice: 34.80, currentPrice: 34.80, unrealizedPnl: 0, lastUpdated: "" },
      BBAS3: { ticker: "BBAS3", weight: 0.12, quantity: 440215.19, entryPrice: 27.90, currentPrice: 27.90, unrealizedPnl: 0, lastUpdated: "" },
    });
    setPriceChanges({
      PETR4: "STABLE",
      VALE3: "STABLE",
      WEGE3: "STABLE",
      ITUB4: "STABLE",
      BBAS3: "STABLE",
    });
    setDriftScore(45);
  };

  const formatBrl = (val: number) => `R$ ${val.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatPct = (val: number) => `${(val * 100).toFixed(2)}%`;

  return (
    <div className="space-y-6" id="digital-twin-panel-root">
      
      {/* Real-time Status Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white flex flex-col sm:flex-row justify-between items-center gap-4 shadow-md" id="dt-live-status-bar">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black tracking-tight text-white uppercase font-sans">
                Digital Twin &amp; Ativos
              </h3>
              <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded text-[10px] font-mono font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Conectado ao Vivo (20 Ativos)
              </span>
            </div>
            <p className="text-xs text-slate-400">Sincronização contínua de cotações B3, S&P 500, BACEN e Fed</p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-right">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono block">AUM Sob Gestão (Tempo Real)</span>
            <span className="text-base font-black font-mono text-emerald-400">R$ 119.911.570,00</span>
          </div>
          <div className="border-l border-slate-800 pl-6">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Regime de Mercado</span>
            <span className="px-2 py-0.5 bg-blue-500/20 border border-blue-500/40 text-blue-300 rounded text-xs font-mono font-bold">
              BULL_LOW_VOL
            </span>
          </div>
        </div>
      </div>

      {/* Sub-Tab Selector Navigation */}
      <div className="flex border-b border-slate-200" id="dt-sub-tabs">
        <button
          onClick={() => setActiveSubTab("LEDGER")}
          className={`px-5 py-3.5 text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-2 border-b-2 -mb-px ${
            activeSubTab === "LEDGER"
              ? "border-emerald-600 text-emerald-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
          id="dt-sub-tab-ledger"
        >
          <Cpu className="w-4 h-4" />
          Contingência: Shadow Ledger & Ticks
        </button>
        <button
          onClick={() => setActiveSubTab("INTELLIGENCE")}
          className={`px-5 py-3.5 text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-2 border-b-2 -mb-px ${
            activeSubTab === "INTELLIGENCE"
              ? "border-emerald-600 text-emerald-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
          id="dt-sub-tab-intelligence"
        >
          <Brain className="w-4 h-4" />
          Inteligência de Execução & Meta-Learning (ADR-002)
        </button>
      </div>

      {activeSubTab === "LEDGER" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="dt-ledger-grid">
          
          {/* ── LEFT COLUMN: LEDGER POSITIONS & TICK STREAMER (8 COLS) ─────────────── */}
          <div className="lg:col-span-8 space-y-6" id="dt-left-column">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm" id="dt-ledger-card">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-5 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-800 tracking-tight flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-600 animate-pulse" />
                    Digital Twin - Shadow Ledger Ativo
                  </h3>
                  <p className="text-xs text-slate-500">Sincronização de contingência em tempo real. Cotações simuladas no CDI e na B3.</p>
                </div>
                
                {/* Control buttons */}
                <div className="flex items-center gap-2" id="dt-controls">
                  <button
                    id="dt-btn-stream"
                    onClick={() => setIsStreaming(!isStreaming)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all shadow-sm ${
                      isStreaming 
                        ? "bg-amber-500 hover:bg-amber-600 text-white" 
                        : "bg-emerald-600 hover:bg-emerald-700 text-white"
                    }`}
                  >
                    {isStreaming ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-current" /> Pausar Ticks
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" /> Ativar Streaming
                      </>
                    )}
                  </button>
                  <button
                    id="dt-btn-reset"
                    onClick={handleResetLedger}
                    className="p-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 transition-all"
                    title="Resetar Cotações"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Twin Portfolio Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-5" id="dt-portfolio-stats">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Net Asset Value (NAV) do Twin</span>
                  <h4 className="text-xl font-bold text-slate-800 mt-1 font-mono">{formatBrl(nav)}</h4>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">P&L Diário Estimado</span>
                  <h4 className="text-lg font-bold text-emerald-600 mt-1.5 font-mono">+{formatBrl(dailyPnl)}</h4>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Saldo em CDI (CDI Reserve)</span>
                  <h4 className="text-lg font-bold text-amber-700 mt-1.5 font-mono">R$ 20.469.135,78</h4>
                </div>
              </div>

              {/* ── INTERACTIVE RECHARTS LINE CHART: TWIN vs BENCHMARK PERFORMANCE ──────────────── */}
              <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-5 my-2 shadow-sm space-y-4" id="dt-interactive-chart-card">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-3 border-b border-slate-200/80">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                      Performance Histórica vs. Benchmark Simulado
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Evolução interativa do retorno cumulativo (%) do Shadow Ledger IA frente ao índice de referência em tempo real.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Live streaming status indicator */}
                    {isStreaming && (
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-[11px] font-bold tracking-wide flex items-center gap-1.5 animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-emerald-600" /> AO VIVO (TICKS ATIVOS)
                      </span>
                    )}

                    {/* Current Alpha Badge */}
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      Alpha: {latestChartPoint.alphaPct >= 0 ? "+" : ""}{latestChartPoint.alphaPct.toFixed(2)}% vs {benchmarkLabel}
                    </span>
                  </div>
                </div>

                {/* Filter and Horizon Control Bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-2.5 rounded-lg border border-slate-200">
                  {/* Timeframe selector */}
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-[10px] text-slate-400 uppercase font-mono font-semibold mr-1">Horizonte:</span>
                    {(["1D", "5D", "1M", "3M", "1A", "LIVE"] as const).map(tf => (
                      <button
                        key={tf}
                        onClick={() => {
                          setChartTimeframe(tf);
                          if (tf === "LIVE" && !isStreaming) {
                            setIsStreaming(true);
                          }
                        }}
                        className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                          chartTimeframe === tf
                            ? tf === "LIVE"
                              ? "bg-emerald-600 text-white shadow-sm"
                              : "bg-slate-800 text-white shadow-sm"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {tf === "1D" ? "1D (Intraday)" : tf === "LIVE" ? "● Ao Vivo (Live)" : tf}
                      </button>
                    ))}
                  </div>

                  {/* Benchmark selector */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 uppercase font-mono font-semibold">Benchmark:</span>
                    <select
                      value={benchmarkType}
                      onChange={e => setBenchmarkType(e.target.value as any)}
                      className="bg-slate-50 border border-slate-300 rounded text-xs font-semibold px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="IBOVESPA">Ibovespa (BOVA11)</option>
                      <option value="SP500_BRL">S&P 500 R$ (IVVB11)</option>
                      <option value="CDI_PLUS">CDI + 3% a.a.</option>
                    </select>
                  </div>
                </div>

                {/* Interactive Recharts LineChart */}
                <div className="pt-1 w-full" style={{ minHeight: "310px" }}>
                  <ResponsiveContainer width="100%" height={310}>
                    <LineChart data={activeChartData} margin={{ top: 10, right: 15, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.8} />
                      <XAxis
                        dataKey="time"
                        stroke="#64748b"
                        fontSize={11}
                        tickLine={false}
                      />
                      <YAxis
                        stroke="#64748b"
                        fontSize={11}
                        tickLine={false}
                        unit="%"
                        domain={["auto", "auto"]}
                      />
                      <Tooltip content={<CustomPerformanceTooltip />} />
                      <Legend
                        iconType="circle"
                        wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
                      />
                      <ReferenceLine y={0} stroke="#cbd5e1" strokeDasharray="2 2" />
                      <Line
                        type="monotone"
                        dataKey="twinReturnPct"
                        name="Digital Twin IA (Shadow Ledger)"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 6, fill: "#059669", stroke: "#ffffff", strokeWidth: 2 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="benchmarkReturnPct"
                        name={`Benchmark: ${benchmarkLabel}`}
                        stroke="#3b82f6"
                        strokeWidth={2.5}
                        strokeDasharray="4 4"
                        dot={false}
                        activeDot={{ r: 5, fill: "#2563eb" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Interactive Chart Footer Statistics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-200/80">
                  <div className="bg-white p-3 rounded-lg border border-slate-200/70 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Retorno Twin IA</span>
                      <h5 className="text-sm font-bold text-emerald-700 font-mono mt-0.5">
                        {latestChartPoint.twinReturnPct >= 0 ? "+" : ""}{latestChartPoint.twinReturnPct.toFixed(2)}%
                      </h5>
                    </div>
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200/70 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Retorno Benchmark</span>
                      <h5 className="text-sm font-bold text-blue-600 font-mono mt-0.5">
                        {latestChartPoint.benchmarkReturnPct >= 0 ? "+" : ""}{latestChartPoint.benchmarkReturnPct.toFixed(2)}%
                      </h5>
                    </div>
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200/70 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Excesso (Alpha Acumulado)</span>
                      <h5 className={`text-sm font-bold font-mono mt-0.5 ${latestChartPoint.alphaPct >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                        {latestChartPoint.alphaPct >= 0 ? "+" : ""}{latestChartPoint.alphaPct.toFixed(2)}%
                      </h5>
                    </div>
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                  </div>
                </div>
              </div>

              {/* Positions Table */}
              <div className="overflow-x-auto pt-3" id="dt-table-wrapper">
                <table className="min-w-full text-xs text-slate-600 font-sans" id="dt-positions-table">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-500 font-mono text-left">
                      <th className="py-2.5">Ticker</th>
                      <th className="py-2.5 text-right">Peso-Alvo</th>
                      <th className="py-2.5 text-right">Quantidade</th>
                      <th className="py-2.5 text-right">Preço de Entrada</th>
                      <th className="py-2.5 text-right">Preço de Tela</th>
                      <th className="py-2.5 text-right">P&L Não Realizado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {Object.keys(positions).map(ticker => {
                      const pos = positions[ticker];
                      const tickType = priceChanges[pos.ticker];
                      return (
                        <tr key={pos.ticker} className="hover:bg-slate-50/50">
                          <td className="py-3 font-mono font-bold text-slate-800 flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${isStreaming ? "bg-emerald-500 animate-ping" : "bg-slate-400"}`} />
                            {pos.ticker}
                          </td>
                          <td className="py-3 text-right font-mono">{(pos.weight * 100).toFixed(0)}%</td>
                          <td className="py-3 text-right font-mono">{pos.quantity.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}</td>
                          <td className="py-3 text-right font-mono">{formatBrl(pos.entryPrice)}</td>
                          <td className={`py-3 text-right font-mono font-semibold transition-all ${
                            tickType === "UP" ? "text-emerald-700 bg-emerald-50" : tickType === "DOWN" ? "text-rose-600 bg-rose-50" : "text-slate-800"
                          }`}>
                            {formatBrl(pos.currentPrice)}
                          </td>
                          <td className={`py-3 text-right font-mono font-medium ${pos.unrealizedPnl >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                            {pos.unrealizedPnl >= 0 ? `+` : ``}{formatBrl(pos.unrealizedPnl)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: MODEL DRIFT MONITOR & METRICS (4 COLS) ──────────────── */}
          <div className="lg:col-span-4 space-y-6" id="dt-right-column">
            {/* Model Drift Meter Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm" id="dt-drift-meter-card">
              <h3 className="text-sm font-bold text-slate-800 mb-2 tracking-tight flex items-center gap-2">
                <Brain className="w-4 h-4 text-emerald-600" />
                Model Drift Detector
              </h3>
              <p className="text-xs text-slate-500 mb-4">Compara a série temporal de retornos diários do Digital Twin em produção com a calibragem histórica do backtest.</p>

              {/* Drift Score Display */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between" id="dt-drift-score-box">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Score de Desvio</span>
                  <h3 className="text-2xl font-black text-slate-800 mt-1 font-mono">{driftScore} <span className="text-xs text-slate-500">/ 100</span></h3>
                </div>
                
                {/* Condition check */}
                {driftScore < 50 ? (
                  <div className="text-right">
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-xs font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Nominal (OK)
                    </span>
                  </div>
                ) : (
                  <div className="text-right">
                    <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-full text-xs font-semibold flex items-center gap-1 animate-pulse">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Warning (Drift)
                    </span>
                  </div>
                )}
              </div>

              {/* Key drift stats */}
              <div className="grid grid-cols-2 gap-3 mt-4 text-xs font-mono" id="dt-drift-stats">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-slate-500 text-[10px] block mb-0.5">Tracking Error</span>
                  <span className="text-slate-800 font-bold">2.45% a.a.</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-slate-500 text-[10px] block mb-0.5">Ratio de Vol</span>
                  <span className="text-slate-800 font-bold">1.14x</span>
                </div>
              </div>
            </div>

            {/* Audit Drift Alerts History logs */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-sm" id="dt-drift-history-card">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Registro de Alertas do Log de Auditoria</h4>
              
              <div className="space-y-2.5" id="dt-logs-list">
                {driftLogs.map((log, idx) => (
                  <div 
                    key={idx} 
                    className={`p-3 border rounded-lg text-xs space-y-1.5 relative overflow-hidden ${
                      log.severity === "CRITICAL" 
                        ? "bg-rose-50/50 border-rose-100 text-rose-950" 
                        : log.severity === "WARNING" 
                        ? "bg-amber-50/50 border-amber-150 text-amber-950" 
                        : "bg-slate-50 border-slate-200 text-slate-850"
                    }`}
                    id={`drift-log-${idx}`}
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-current" />
                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                      <span>{new Date(log.timestamp).toLocaleDateString("pt-BR")}</span>
                      <span className={log.severity === "WARNING" ? "text-amber-700 font-bold" : log.severity === "CRITICAL" ? "text-rose-700 font-bold" : "text-emerald-600 font-bold"}>
                        {log.severity}
                      </span>
                    </div>
                    <p className="text-slate-650 font-sans leading-relaxed">{log.llmAlert}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* ── SUB-TAB: EXECUTION INTELLIGENCE & META-LEARNING (ADR-002) ──────────────── */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="dt-intelligence-tab">
          
          {/* Left Column: Almgren-Chriss Order Execution Simulator (7 Cols) */}
          <div className="lg:col-span-7 space-y-6" id="intel-left-column">
            
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5" id="almgren-chriss-card">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-emerald-600" />
                    Simulador de Execução (Modelo Almgren-Chriss + ML)
                  </h3>
                  <p className="text-xs text-slate-500">Módulo quantitativo de liquidez e estimativa de impacto temporário vs. permanente.</p>
                </div>
                <span className="text-[10px] bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-0.5 rounded font-mono font-bold">
                  ACTIVE
                </span>
              </div>

              {/* Grid Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="sim-inputs">
                {/* Select Asset */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono font-semibold text-slate-500 uppercase tracking-wider block">Ativo Alvo</label>
                  <select
                    value={selectedAsset}
                    onChange={(e) => handleAssetChange(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg text-xs p-2.5 font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="PETR4">PETR4 (ADV: R$ 1.20 Bilhão)</option>
                    <option value="VALE3">VALE3 (ADV: R$ 950 Milhões)</option>
                    <option value="WEGE3">WEGE3 (ADV: R$ 450 Milhões)</option>
                    <option value="ITUB4">ITUB4 (ADV: R$ 800 Milhões)</option>
                    <option value="BBAS3">BBAS3 (ADV: R$ 600 Milhões)</option>
                  </select>
                </div>

                {/* Volatility */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono font-semibold text-slate-500 uppercase tracking-wider block">
                    Volatilidade Anualizada: {(volatility * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min="0.10"
                    max="0.80"
                    step="0.01"
                    value={volatility}
                    onChange={(e) => setVolatility(parseFloat(e.target.value))}
                    className="w-full accent-emerald-600 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Order Size Slider */}
                <div className="space-y-1.5 md:col-span-2">
                  <div className="flex justify-between items-center text-[11px] font-mono font-semibold text-slate-500">
                    <span className="uppercase tracking-wider">Tamanho do Lote (Ordem)</span>
                    <span className="text-slate-800 font-bold">{formatBrl(orderSize)}</span>
                  </div>
                  <input
                    type="range"
                    min="500000"
                    max="150000000"
                    step="500000"
                    value={orderSize}
                    onChange={(e) => setOrderSize(parseInt(e.target.value))}
                    className="w-full accent-emerald-600 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
                  />
                  <div className="flex gap-1.5 pt-1" id="order-presets">
                    {[1000000, 5000000, 15000000, 50000000, 100000000].map((preset) => (
                      <button
                        key={preset}
                        onClick={() => setOrderSize(preset)}
                        className={`px-2 py-1 border rounded text-[10px] font-mono transition-all ${
                          orderSize === preset 
                            ? "bg-slate-800 border-slate-800 text-white" 
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {preset >= 1000000 ? `${preset / 1000000}M` : `${preset / 1000}K`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bid-Ask Spread */}
                <div className="space-y-1.5 md:col-span-2">
                  <div className="flex justify-between items-center text-[11px] font-mono font-semibold text-slate-500">
                    <span className="uppercase tracking-wider">Spread Bid-Ask Típico</span>
                    <span className="text-slate-800 font-bold">{spreadBps.toFixed(1)} bps</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="15.0"
                    step="0.1"
                    value={spreadBps}
                    onChange={(e) => setSpreadBps(parseFloat(e.target.value))}
                    className="w-full accent-emerald-600 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Simulation Result Displays */}
              {simResult && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4" id="sim-results-box">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <span className="text-xs font-bold text-slate-700">Resultado da Análise Almgren-Chriss</span>
                    <button
                      onClick={commitSimulationLog}
                      className="px-2.5 py-1 bg-slate-800 text-white rounded text-[10px] font-bold hover:bg-slate-900 transition-all flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" /> Gravar no Log de Treinamento
                    </button>
                  </div>

                  {/* High liquidity risk warn */}
                  {simResult.fractionOfAdv > 0.05 && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs flex items-start gap-2 animate-pulse">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block">Alerta de Iliquidez Crítica</span>
                        Esta ordem representa <span className="font-bold">{(simResult.fractionOfAdv * 100).toFixed(2)}%</span> do volume diário do ativo (ADV). O modelo de impacto de preço foi penalizado severamente.
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                    <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-xs">
                      <span className="text-slate-500 text-[10px] block mb-0.5">Impacto Temporário</span>
                      <span className="text-slate-800 font-bold">{simResult.temporaryImpactBps.toFixed(2)} bps</span>
                    </div>
                    <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-xs">
                      <span className="text-slate-500 text-[10px] block mb-0.5">Impacto Permanente</span>
                      <span className="text-slate-800 font-bold">{simResult.permanentImpactBps.toFixed(2)} bps</span>
                    </div>
                    <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-xs">
                      <span className="text-slate-500 text-[10px] block mb-0.5">Slippage & Spread</span>
                      <span className="text-slate-800 font-bold">{simResult.slippageBps.toFixed(2)} bps</span>
                    </div>
                    <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-xs">
                      <span className="text-slate-500 text-[10px] block mb-0.5">Custo Total Exec.</span>
                      <span className="text-slate-800 font-bold text-rose-700">{simResult.totalCostBps.toFixed(2)} bps</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* BRL Cash Cost of order */}
                    <div className="bg-white border border-slate-200 rounded-lg p-3 flex justify-between items-center">
                      <div>
                        <span className="text-slate-500 text-[10px] font-mono block">CUSTO ABSOLUTO ESTIMADO</span>
                        <span className="text-base font-black text-rose-600 font-mono">{formatBrl(simResult.costBrl)}</span>
                      </div>
                      <ArrowUpRight className="w-5 h-5 text-rose-500" />
                    </div>

                    {/* Fill Probability (ML Loop Feedback) */}
                    <div className="bg-white border border-slate-200 rounded-lg p-3 flex justify-between items-center">
                      <div>
                        <span className="text-slate-500 text-[10px] font-mono block">PROBABILIDADE DE FILL (XGBOOST)</span>
                        <span className={`text-base font-black font-mono ${simResult.fillProbability > 0.90 ? "text-emerald-600" : simResult.fillProbability > 0.70 ? "text-amber-600" : "text-rose-600"}`}>
                          {(simResult.fillProbability * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Zap className={`w-5 h-5 ${simResult.fillProbability > 0.90 ? "text-emerald-500" : "text-amber-500"}`} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Continuous retraining feedback loops table logs */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3" id="feedback-logs-card">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-slate-400" />
                Logs Coletados para Retreinamento Contínuo do Slippage Model
              </h4>
              <p className="text-xs text-slate-500">
                O modelo matemático de Almgren-Chriss é reajustado diariamente correlacionando o slippage real registrado nos fill logs com as variáveis microestruturais.
              </p>

              <div className="overflow-x-auto" id="sim-logs-table-wrapper">
                <table className="min-w-full text-xs text-slate-600 font-mono" id="sim-logs-table">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 text-left">
                      <th className="pb-2">Timestamp</th>
                      <th className="pb-2">Ativo</th>
                      <th className="pb-2 text-right">Lote (BRL)</th>
                      <th className="pb-2 text-right">Temp. Impact</th>
                      <th className="pb-2 text-right">Perm. Impact</th>
                      <th className="pb-2 text-right">Custo Total</th>
                      <th className="pb-2 text-right">Fill Prob</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    {simLogs.map((log, index) => (
                      <tr key={index} className="hover:bg-slate-50/50">
                        <td className="py-2.5 text-slate-400">{log.timestamp}</td>
                        <td className="py-2.5 font-bold text-slate-800">{log.ticker}</td>
                        <td className="py-2.5 text-right font-semibold">{formatBrl(log.orderSize)}</td>
                        <td className="py-2.5 text-right text-slate-600">{log.temporaryImpactBps.toFixed(2)} bps</td>
                        <td className="py-2.5 text-right text-slate-600">{log.permanentImpactBps.toFixed(2)} bps</td>
                        <td className="py-2.5 text-right font-semibold text-rose-600">{log.totalCostBps.toFixed(2)} bps</td>
                        <td className="py-2.5 text-right text-emerald-600 font-bold">{(log.fillProbability * 100).toFixed(0)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Right Column: Meta-Learning Adaptive Weights Panel (5 Cols) */}
          <div className="lg:col-span-5 space-y-6" id="intel-right-column">
            
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5" id="meta-learning-card">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
                  <Brain className="w-4 h-4 text-emerald-600" />
                  Meta-Learning Engine (Adaptive Ensemble Layer)
                </h3>
                <p className="text-xs text-slate-500">Mapeia o regime macroeconômico e ajusta dinamicamente a ponderação dos previsores base.</p>
              </div>

              {/* Regime Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono font-semibold text-slate-500 uppercase tracking-wider block">Regime de Mercado Ativo (HMM)</label>
                <div className="grid grid-cols-2 gap-2" id="regime-buttons">
                  {[
                    { id: "BULL_LOW_VOL", label: "Bull Market Low Vol", color: "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100" },
                    { id: "BEAR_HIGH_VOL", label: "Bear Market High Vol", color: "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100" },
                    { id: "CRISIS", label: "Systemic Crisis / Shock", color: "bg-red-50 border-red-200 text-red-700 hover:bg-red-100" },
                    { id: "SIDEWAYS", label: "Sideways Mean Reversion", color: "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100" }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setMetaRegime(item.id)}
                      className={`p-3 border rounded-xl text-left text-xs transition-all relative ${
                        metaRegime === item.id
                          ? "ring-2 ring-emerald-500 font-bold " + item.color
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {metaRegime === item.id && (
                        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-emerald-600 rounded-full animate-ping" />
                      )}
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Entropy Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[11px] font-mono font-semibold text-slate-500">
                  <span className="uppercase tracking-wider">Entropia do Regime (Uncertainty)</span>
                  <span className="text-slate-800 font-bold">{metaEntropy.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.00"
                  max="1.00"
                  step="0.05"
                  value={metaEntropy}
                  onChange={(e) => setMetaEntropy(parseFloat(e.target.value))}
                  className="w-full accent-emerald-600 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
                />
                <p className="text-[10px] text-slate-400">
                  Entropia elevada indica iminência de quebra estrutural ou transição. O meta-aprendizado redireciona o peso para o modelo mais robusto (TFT).
                </p>
              </div>

              {/* Dynamic Weight visualizer */}
              <div className="space-y-3.5 bg-slate-50 border border-slate-200 rounded-xl p-4" id="dynamic-weights-visual">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono font-semibold block">
                  Ponderação Atual do Ensemble Inteligente
                </span>

                <div className="space-y-3" id="weights-meters">
                  {Object.entries(metaWeights).map(([model, weight]) => {
                    const wNum = weight as number;
                    return (
                      <div key={model} className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-700 font-medium flex items-center gap-1">
                            <ChevronRight className="w-3 h-3 text-emerald-600" /> {model}
                          </span>
                          <span className="font-mono font-bold text-slate-800">{(wNum * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-emerald-600 h-full rounded-full transition-all duration-500" 
                            style={{ width: `${wNum * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Contextual description explaining ADR weighting strategy */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2" id="regime-explanation">
                <span className="font-bold text-slate-700 block">Estratégia Meta-Learning:</span>
                <p className="text-slate-500 leading-relaxed text-[11px]">
                  {metaRegime === "BULL_LOW_VOL" && (
                    "Em mercados de baixa volatilidade e tendência de alta (Bull Market), o modelo Fundamentalist XGBoost recebe maior peso (50%) devido à sua alta precisão em tendências estáveis. O Sentinel News LLM complementa com 20% para capturar momentum social de curto prazo."
                  )}
                  {metaRegime === "BEAR_HIGH_VOL" && (
                    "Durante mercados de baixa estrutural e alta volatilidade (Bear Market), o Temporal Fusion Transformer (TFT) passa a dominar a ponderação (50%) por possuir mecanismos de auto-atenção adaptados a dependências de longo prazo em séries temporais complexas."
                  )}
                  {metaRegime === "CRISIS" && (
                    "Em cenários de crise sistêmica ou quebras bruscas de correlação (Shocks), o TFT recebe peso maciço (80%+) para mitigar perdas catastróficas, enquanto os previsores estatísticos tradicionais baseados em premissas lineares ou árvores rasas são severamente desvalorizados."
                  )}
                  {metaRegime === "SIDEWAYS" && (
                    "Em mercados sem tendência definida (Sideways Mean Reversion), as redes neurais recorrentes LSTM recebem o maior destaque (45%) por sua excelente capacidade de mapear reversões de média cíclicas de curtíssimo prazo e spreads de arbitragem estatística."
                  )}
                </p>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
