/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  Cell,
  CartesianGrid
} from "recharts";
import { 
  Cpu, 
  Sliders, 
  MessageSquare, 
  CheckCircle2, 
  BadgeAlert,
  Zap,
  BarChart3,
  Dna,
  UserCheck,
  AlertTriangle,
  ShieldAlert,
  RefreshCw,
  Edit3,
  Save,
  Lock,
  Unlock,
  Percent,
  Info,
  ChevronDown,
  ChevronUp,
  RotateCcw
} from "lucide-react";
import { Asset } from "../types";
import { ALLOCATION_STRATEGIES } from "../data/mockData";

interface OptimizationPanelProps {
  assets: Asset[];
  onUpdateAssetScores: (ticker: string, newScores: Record<string, number>, expectedReturn?: number) => void;
}

const BENCHMARK_PRIORS: Record<string, number> = {
  BOVA11: 0.17, // Adjusted to ensure exact 1.0000 (100.0%) total baseline sum
  IVVB11: 0.14,
  PETR4: 0.10,
  VALE3: 0.10,
  ITUB4: 0.08,
  BBAS3: 0.06,
  RENT3: 0.04,
  BBDC4: 0.04,
  ABEV3: 0.04,
  ELET3: 0.04,
  WEGE3: 0.04,
  PRIO3: 0.03,
  EMBR3: 0.02,
  JBSS3: 0.02,
  SOJA: 0.02,
  MILHO: 0.02,
  CAFÉ: 0.02,
  USD_BRL: 0.01,
  OURO: 0.01,
  CDI: 0.00,
};

export default function OptimizationPanel({ assets, onUpdateAssetScores }: OptimizationPanelProps) {
  const [selectedStrategy, setSelectedStrategy] = useState<"BENCHMARK" | "BLACK_LITTERMAN" | "HRP_OPTIMIZED" | "CUSTOM_WEIGHTS">("HRP_OPTIMIZED");
  const [activeAssetTicker, setActiveAssetTicker] = useState<string>("PETR4");
  const [weightCap, setWeightCap] = useState<number>(0.15); // default 15% max weight limit
  const [showWeightTable, setShowWeightTable] = useState<boolean>(true);

  // Custom weights editable by the user for testing the 100% validation check
  const [customWeights, setCustomWeights] = useState<Record<string, number>>(() => {
    return { ...BENCHMARK_PRIORS };
  });

  // Draft state for new scores before submission (enforces 100% weight sum check before submitting)
  const [draftScoresMap, setDraftScoresMap] = useState<Record<string, { macro: number; micro: number; news: number; credit: number }>>({});
  const [draftReturnsMap, setDraftReturnsMap] = useState<Record<string, number>>({});
  const [submissionFeedback, setSubmissionFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Get active asset details
  const activeAsset = assets.find(a => a.ticker === activeAssetTicker) || assets[0];

  const activeDraftScores = draftScoresMap[activeAsset.ticker] || activeAsset.scores;
  const activeDraftReturn = draftReturnsMap[activeAsset.ticker] !== undefined ? draftReturnsMap[activeAsset.ticker] : activeAsset.expectedReturnBL;

  const hasPendingScoreChanges = 
    draftScoresMap[activeAsset.ticker] !== undefined ||
    draftReturnsMap[activeAsset.ticker] !== undefined;

  // Dynamic weights calculation engine
  const computedWeights = useMemo(() => {
    if (selectedStrategy === "CUSTOM_WEIGHTS") {
      return customWeights;
    }

    let weights: Record<string, number> = {};

    if (selectedStrategy === "BENCHMARK") {
      weights = { ...BENCHMARK_PRIORS };
    } 
    else if (selectedStrategy === "BLACK_LITTERMAN") {
      let rawWeights: Record<string, number> = {};
      assets.forEach(asset => {
        const prior = BENCHMARK_PRIORS[asset.ticker] || 0.01;
        // Combine Expected Return BL and Confidence BL (baseline expected return is 12%)
        const diff = asset.expectedReturnBL - 0.12;
        const adjustment = 0.5 * diff * asset.confidenceBL;
        rawWeights[asset.ticker] = asset.ticker === "CDI" ? 0 : Math.max(0.005, prior + adjustment);
      });

      const rawSum = Object.values(rawWeights).reduce<number>((a, b) => a + Number(b), 0);
      assets.forEach(asset => {
        weights[asset.ticker] = rawSum > 0 ? (rawWeights[asset.ticker] / rawSum) : (BENCHMARK_PRIORS[asset.ticker] || 0);
      });
    } 
    else {
      // HRP_OPTIMIZED (Inverse Volatility Parity + 20% Liquidity Cushion in CDI)
      weights["CDI"] = 0.20;
      let rawInvVols: Record<string, number> = {};
      let sumInvVol = 0;

      assets.forEach(asset => {
        if (asset.ticker !== "CDI") {
          const vol = asset.volatility || 0.20;
          const invVol = 1 / vol;
          rawInvVols[asset.ticker] = invVol;
          sumInvVol += invVol;
        }
      });

      assets.forEach(asset => {
        if (asset.ticker !== "CDI") {
          weights[asset.ticker] = sumInvVol > 0 ? (0.80 * (rawInvVols[asset.ticker] / sumInvVol)) : 0.04;
        }
      });
    }

    // Apply the concentration limit (weightCap) redistribution loop
    if (selectedStrategy !== "BENCHMARK") {
      weights = applyConcentrationLimit(weights, weightCap);
    }

    return weights;
  }, [selectedStrategy, assets, weightCap, customWeights]);

  // Total Portfolio Weight Sum (%)
  const currentTotalWeightPct = useMemo(() => {
    const sum = Object.values(computedWeights).reduce<number>((a, b) => a + Number(b), 0);
    return Number((sum * 100).toFixed(2));
  }, [computedWeights]);

  // Exactly 100.0% validation check (with 0.05% floating point tolerance)
  const isAllocationValid = useMemo(() => {
    return Math.abs(currentTotalWeightPct - 100.0) <= 0.05;
  }, [currentTotalWeightPct]);

  // Weight cap limits and proportional redistribution algorithm
  function applyConcentrationLimit(w: Record<string, number>, maxCap: number): Record<string, number> {
    let capped = { ...w };
    let tickers = Object.keys(capped);
    
    for (let iter = 0; iter < 10; iter++) {
      let excess = 0;
      let sumUncapped = 0;
      
      tickers.forEach(ticker => {
        if (ticker !== "CDI") {
          if (capped[ticker] > maxCap) {
            excess += (capped[ticker] - maxCap);
            capped[ticker] = maxCap;
          } else {
            sumUncapped += capped[ticker];
          }
        }
      });
      
      if (excess <= 0.0001) {
        break;
      }
      
      let redistributedAny = false;
      tickers.forEach(ticker => {
        if (ticker !== "CDI" && capped[ticker] < maxCap) {
          const prop = capped[ticker] / sumUncapped;
          const add = excess * prop;
          if (capped[ticker] + add > maxCap) {
            excess -= (maxCap - capped[ticker]);
            capped[ticker] = maxCap;
          } else {
            capped[ticker] += add;
            excess -= add;
          }
          redistributedAny = true;
        }
      });
      
      if (!redistributedAny || excess > 0.0001) {
        if (capped["CDI"] !== undefined) {
          capped["CDI"] += excess;
        }
        break;
      }
    }
    
    // Normalize to exact 1.0 sum
    const finalSum = Object.values(capped).reduce<number>((a, b) => a + Number(b), 0);
    if (finalSum > 0 && Math.abs(finalSum - 1.0) > 0.0001) {
      tickers.forEach(t => {
        capped[t] = capped[t] / finalSum;
      });
    }

    return capped;
  }

  // Format data for Recharts BarChart using the newly calculated weights
  const allocationChartData = Object.keys(computedWeights).map(ticker => {
    return {
      ticker,
      peso: computedWeights[ticker] * 100,
      bench: BENCHMARK_PRIORS[ticker] ? BENCHMARK_PRIORS[ticker] * 100 : 0
    };
  });

  // Handle draft score changes from user slider input
  const handleScoreChange = (type: "macro" | "micro" | "news" | "credit", val: number) => {
    setDraftScoresMap(prev => ({
      ...prev,
      [activeAsset.ticker]: {
        ...activeDraftScores,
        [type]: val
      }
    }));
    setSubmissionFeedback(null);
  };

  const handleReturnSliderChange = (val: number) => {
    setDraftReturnsMap(prev => ({
      ...prev,
      [activeAsset.ticker]: val
    }));
    setSubmissionFeedback(null);
  };

  // Handle manual weight modification in the validation table
  const handleCustomWeightChange = (ticker: string, newPct: number) => {
    const numericPct = isNaN(newPct) ? 0 : Math.max(0, newPct);
    const newWeightDecimal = numericPct / 100;
    
    // Switch to CUSTOM_WEIGHTS if not already
    if (selectedStrategy !== "CUSTOM_WEIGHTS") {
      const initialCustom = { ...computedWeights, [ticker]: newWeightDecimal };
      setCustomWeights(initialCustom);
      setSelectedStrategy("CUSTOM_WEIGHTS");
    } else {
      setCustomWeights(prev => ({ ...prev, [ticker]: newWeightDecimal }));
    }
    setSubmissionFeedback(null);
  };

  // One-click proportional normalization to 100.0%
  const handleNormalizeWeights = () => {
    const currentSum = Object.values(computedWeights).reduce<number>((a, b) => a + Number(b), 0);
    if (currentSum === 0) return;
    
    const normalized: Record<string, number> = {};
    Object.keys(computedWeights).forEach(ticker => {
      normalized[ticker] = computedWeights[ticker] / currentSum;
    });
    setCustomWeights(normalized);
    setSelectedStrategy("CUSTOM_WEIGHTS");
    setSubmissionFeedback({
      type: "success",
      message: "Alocação normalizada com sucesso para exatamente 100.0% (proporção balanceada)."
    });
  };

  // Submit new scores to the quantitative model WITH 100% portfolio weight validation check
  const handleSubmitNewScores = () => {
    if (!isAllocationValid) {
      setSubmissionFeedback({
        type: "error",
        message: `Erro de Validação: Não é possível submeter novos scores. A soma dos pesos dos ativos no painel é ${currentTotalWeightPct.toFixed(2)}% (divergência de ${(currentTotalWeightPct - 100).toFixed(2)}%). A soma deve ser exatamente 100.0% para submissão.`
      });
      return;
    }

    const scoresToSubmit = draftScoresMap[activeAsset.ticker] || activeAsset.scores;
    const returnToSubmit = draftReturnsMap[activeAsset.ticker] !== undefined ? draftReturnsMap[activeAsset.ticker] : activeAsset.expectedReturnBL;

    // Apply scores to active asset
    onUpdateAssetScores(activeAsset.ticker, scoresToSubmit, returnToSubmit);

    setSubmissionFeedback({
      type: "success",
      message: `Novos scores e alocação (${currentTotalWeightPct.toFixed(1)}% validada) submetidos ao motor Bayesiano com sucesso!`
    });

    // Clear draft state for this asset after successful submission
    setDraftScoresMap(prev => {
      const copy = { ...prev };
      delete copy[activeAsset.ticker];
      return copy;
    });
    setDraftReturnsMap(prev => {
      const copy = { ...prev };
      delete copy[activeAsset.ticker];
      return copy;
    });
  };

  // Reset unsaved draft scores for active asset
  const handleResetDraft = () => {
    setDraftScoresMap(prev => {
      const copy = { ...prev };
      delete copy[activeAsset.ticker];
      return copy;
    });
    setDraftReturnsMap(prev => {
      const copy = { ...prev };
      delete copy[activeAsset.ticker];
      return copy;
    });
    setSubmissionFeedback({
      type: "success",
      message: "Ajustes pendentes deste ativo foram revertidos para os valores de mercado."
    });
  };

  const formatPct = (val: number) => `${val.toFixed(1)}%`;

  return (
    <div className="space-y-6" id="optimization-panel-root">
      
      {/* ── MANDATORY PORTFOLIO WEIGHT VALIDATION BANNER (SOMA = 100.0%) ──────── */}
      <div 
        className={`rounded-2xl p-4 border shadow-sm transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          isAllocationValid
            ? "bg-emerald-50/80 border-emerald-300 text-emerald-950"
            : "bg-rose-50 border-rose-300 text-rose-950 shadow-rose-100"
        }`}
        id="portfolio-weight-validation-banner"
      >
        <div className="flex items-start gap-3">
          <div className={`p-2.5 rounded-xl shrink-0 ${
            isAllocationValid ? "bg-emerald-600 text-white" : "bg-rose-600 text-white animate-pulse"
          }`}>
            {isAllocationValid ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black uppercase tracking-wider font-mono">
                Validador de Entrada de Dados (Alocação Mandatória = 100.0%)
              </span>
              <span className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full border ${
                isAllocationValid 
                  ? "bg-emerald-600 text-white border-emerald-700" 
                  : "bg-rose-600 text-white border-rose-700 animate-bounce"
              }`}>
                SOMA ATUAL: {currentTotalWeightPct.toFixed(2)}%
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed max-w-3xl font-sans">
              {isAllocationValid ? (
                <>
                  <strong className="text-emerald-800 font-semibold">Alocação Válida:</strong> Os pesos dos ativos somam exatamente 100.0%. A submissão dos novos scores para o motor Bayesiano está habilitada.
                </>
              ) : (
                <>
                  <strong className="text-rose-800 font-semibold">Submissão Bloqueada:</strong> A soma dos pesos da carteira está em <strong>{currentTotalWeightPct.toFixed(2)}%</strong> (divergência de {(currentTotalWeightPct - 100).toFixed(2)}%). Ajuste os pesos para exatamente 100.0% antes de submeter novos scores.
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          {!isAllocationValid && (
            <button
              onClick={handleNormalizeWeights}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm font-mono"
              title="Equilibrar todos os pesos proporcionalmente para 100.0%"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Normalizar para 100.0%
            </button>
          )}

          <button
            onClick={() => setShowWeightTable(!showWeightTable)}
            className="px-3 py-2 bg-white/80 hover:bg-white text-slate-800 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-600" />
            {showWeightTable ? "Ocultar Tabela de Pesos" : "Editar Pesos (% Ativos)"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="optimization-panel-grid">
        
        {/* ── LEFT COLUMN: STRATEGY CONFIG & CHARTS (7 COLS) ────────────────────── */}
        <div className="lg:col-span-7 space-y-6" id="opt-left-column">
          {/* Strategy Selector & Weight Concentration Cap controls */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm" id="strategy-selector-card">
            <h3 className="text-base font-bold text-slate-800 mb-1 tracking-tight flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-600" />
              Seletor de Modelo de Alocação Quantitativo
            </h3>
            <p className="text-xs text-slate-500 mb-4">Selecione o motor matemático utilizado para pesar os ativos no portfólio</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5" id="strategy-modes-grid">
              {/* Benchmark */}
              <button
                id="opt-btn-benchmark"
                onClick={() => setSelectedStrategy("BENCHMARK")}
                className={`p-3.5 rounded-xl text-left border transition-all flex flex-col justify-between ${
                  selectedStrategy === "BENCHMARK"
                    ? "bg-slate-100 border-slate-300 text-slate-800 shadow-sm ring-1 ring-slate-200"
                    : "bg-slate-50/50 border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-700"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider font-mono">Ibovespa</span>
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                </div>
                <div>
                  <h4 className={`text-sm font-semibold ${selectedStrategy === "BENCHMARK" ? "text-slate-900" : "text-slate-700"}`}>Capitalização</h4>
                  <p className="text-[11px] text-slate-500 mt-1">Peso de mercado B3.</p>
                </div>
              </button>

              {/* Black-Litterman */}
              <button
                id="opt-btn-bl"
                onClick={() => setSelectedStrategy("BLACK_LITTERMAN")}
                className={`p-3.5 rounded-xl text-left border transition-all flex flex-col justify-between ${
                  selectedStrategy === "BLACK_LITTERMAN"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-900 shadow-sm ring-1 ring-emerald-100"
                    : "bg-slate-50/50 border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-700"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider font-mono text-emerald-600">Bayesiano</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <div>
                  <h4 className={`text-sm font-semibold ${selectedStrategy === "BLACK_LITTERMAN" ? "text-emerald-950" : "text-slate-700"}`}>Black-Litterman</h4>
                  <p className="text-[11px] text-slate-500 mt-1">Visões IA + Convicção.</p>
                </div>
              </button>

              {/* HRP */}
              <button
                id="opt-btn-hrp"
                onClick={() => setSelectedStrategy("HRP_OPTIMIZED")}
                className={`p-3.5 rounded-xl text-left border transition-all flex flex-col justify-between ${
                  selectedStrategy === "HRP_OPTIMIZED"
                    ? "bg-blue-50 border-blue-200 text-blue-900 shadow-sm ring-1 ring-blue-100"
                    : "bg-slate-50/50 border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-700"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider font-mono text-blue-600">Hierárquico</span>
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                </div>
                <div>
                  <h4 className={`text-sm font-semibold ${selectedStrategy === "HRP_OPTIMIZED" ? "text-blue-950" : "text-slate-700"}`}>HRP + CDI</h4>
                  <p className="text-[11px] text-slate-500 mt-1">Clustering + 20% Caixa.</p>
                </div>
              </button>

              {/* Custom Weights / Editable Mode */}
              <button
                id="opt-btn-custom"
                onClick={() => setSelectedStrategy("CUSTOM_WEIGHTS")}
                className={`p-3.5 rounded-xl text-left border transition-all flex flex-col justify-between ${
                  selectedStrategy === "CUSTOM_WEIGHTS"
                    ? "bg-amber-50 border-amber-300 text-amber-950 shadow-sm ring-1 ring-amber-200"
                    : "bg-slate-50/50 border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-700"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider font-mono text-amber-700">Manual (100%)</span>
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                </div>
                <div>
                  <h4 className={`text-sm font-semibold ${selectedStrategy === "CUSTOM_WEIGHTS" ? "text-amber-950" : "text-slate-700"}`}>Edição Manual</h4>
                  <p className="text-[11px] text-slate-500 mt-1">Pesos customizáveis.</p>
                </div>
              </button>
            </div>

            {/* New Weight Capping / Concentration Limit slider */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3" id="weight-cap-control">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-slate-500" />
                    Mitigação de Riscos de Concentração (Weight Cap)
                  </h4>
                  <p className="text-[11px] text-slate-500">Ajusta o limite máximo de peso concentrado por papel para dispersar risco cauda.</p>
                </div>
                <span className="text-xs font-bold bg-slate-900 text-white font-mono px-2 py-0.5 rounded-full">
                  Cap: {formatPct(weightCap * 100)}
                </span>
              </div>
              
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0.10"
                  max="0.30"
                  step="0.01"
                  id="slider-weight-cap"
                  value={weightCap}
                  disabled={selectedStrategy === "BENCHMARK" || selectedStrategy === "CUSTOM_WEIGHTS"}
                  onChange={(e) => setWeightCap(parseFloat(e.target.value))}
                  className={`flex-1 h-1 rounded-lg cursor-pointer accent-slate-900 ${
                    (selectedStrategy === "BENCHMARK" || selectedStrategy === "CUSTOM_WEIGHTS") ? "opacity-30 cursor-not-allowed bg-slate-200" : "bg-slate-200"
                  }`}
                />
                <span className={`text-[10px] font-mono font-bold uppercase ${
                  (selectedStrategy === "BENCHMARK" || selectedStrategy === "CUSTOM_WEIGHTS") ? "text-slate-400" : "text-emerald-600"
                }`}>
                  {selectedStrategy === "BENCHMARK" || selectedStrategy === "CUSTOM_WEIGHTS" ? "Inativo neste modo" : "Mitigação Ativa"}
                </span>
              </div>
            </div>
          </div>

          {/* Allocation Bar Chart */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm" id="opt-chart-card">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h4 className="text-sm font-bold text-slate-800 tracking-tight">Comparativo de Pesos Alocados (%)</h4>
                <p className="text-xs text-slate-500">Pesos propostos pelo modelo vs pesos de mercado do Ibovespa (Benchmark)</p>
              </div>
            </div>

            <div className="h-64 w-full" id="opt-barchart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={allocationChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.7} />
                  <XAxis dataKey="ticker" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit="%" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#ffffff", borderColor: "#cbd5e1", borderRadius: "8px", boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)" }}
                    itemStyle={{ fontSize: "12px", color: "#0f172a" }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
                  <Bar dataKey="peso" name="Harpia Finance Asset Alocação" fill={selectedStrategy === "HRP_OPTIMIZED" ? "#3b82f6" : "#10b981"} radius={[4, 4, 0, 0]}>
                    {allocationChartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.ticker === "CDI" ? "#eab308" : (selectedStrategy === "HRP_OPTIMIZED" ? "#3b82f6" : "#10b981")} 
                      />
                    ))}
                  </Bar>
                  <Bar dataKey="bench" name="Benchmark Ibovespa" fill="#94a3b8" fillOpacity={0.6} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ── INTERACTIVE ASSET WEIGHTS TABLE WITH 100% SUM VALIDATOR ─────── */}
          {showWeightTable && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4" id="opt-weights-table-card">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
                    <Edit3 className="w-4 h-4 text-emerald-600" />
                    Tabela de Validação e Edição Manual de Pesos (%)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Ajuste os percentuais para testar a validação de soma = 100%. A alteração de qualquer campo ativa o modo &quot;Edição Manual&quot;.
                  </p>
                </div>

                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold ${
                  isAllocationValid 
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                    : "bg-rose-50 text-rose-700 border-rose-300 animate-pulse"
                }`}>
                  <span>SOMA TOTAL:</span>
                  <span className="text-sm font-black">{currentTotalWeightPct.toFixed(2)}%</span>
                  {isAllocationValid ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
                </div>
              </div>

              <div className="max-h-64 overflow-y-auto pr-1 border border-slate-100 rounded-xl">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-slate-900 text-slate-300 text-[10px] uppercase tracking-wider sticky top-0 border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Ticker</th>
                      <th className="py-2.5 px-3">Nome do Ativo</th>
                      <th className="py-2.5 px-3">Classe</th>
                      <th className="py-2.5 px-3 text-right">Peso Anterior (%)</th>
                      <th className="py-2.5 px-3 text-right">Peso Alocado (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {assets.map(asset => {
                      const weightPctVal = Number(((computedWeights[asset.ticker] || 0) * 100).toFixed(2));
                      const priorPctVal = Number(((BENCHMARK_PRIORS[asset.ticker] || 0) * 100).toFixed(2));
                      const isSelected = asset.ticker === activeAssetTicker;

                      return (
                        <tr 
                          key={asset.ticker}
                          className={`hover:bg-slate-50/80 transition-all ${isSelected ? "bg-emerald-50/60 font-semibold" : ""}`}
                        >
                          <td className="py-2 px-3 font-bold text-slate-900">
                            <button
                              onClick={() => setActiveAssetTicker(asset.ticker)}
                              className="hover:underline text-emerald-700 font-bold"
                            >
                              {asset.ticker}
                            </button>
                          </td>
                          <td className="py-2 px-3 text-slate-600 font-sans truncate max-w-[140px]">
                            {asset.name}
                          </td>
                          <td className="py-2 px-3 text-slate-500 text-[11px]">
                            {asset.sector}
                          </td>
                          <td className="py-2 px-3 text-right text-slate-400">
                            {priorPctVal.toFixed(1)}%
                          </td>
                          <td className="py-1.5 px-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                value={weightPctVal}
                                onChange={(e) => handleCustomWeightChange(asset.ticker, parseFloat(e.target.value))}
                                className={`w-18 text-right bg-white border rounded-lg px-2 py-1 font-mono font-bold text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all ${
                                  !isAllocationValid ? "border-rose-300 text-rose-800 bg-rose-50/30" : "border-slate-300 text-slate-900"
                                }`}
                              />
                              <span className="text-slate-400">%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className={`sticky bottom-0 font-bold text-xs border-t ${
                    isAllocationValid ? "bg-emerald-50 text-emerald-900" : "bg-rose-50 text-rose-900"
                  }`}>
                    <tr>
                      <td colSpan={3} className="py-2.5 px-3 uppercase text-[11px]">
                        {isAllocationValid ? "✓ Alocação Válida (Soma = 100.0%)" : "⚠️ Erro de Validação: A soma difere de 100%"}
                      </td>
                      <td className="py-2.5 px-3 text-right">Total:</td>
                      <td className="py-2.5 px-3 text-right font-black text-sm">
                        {currentTotalWeightPct.toFixed(2)}%
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN: ASSET VIEW & IA SIGNALS (5 COLS) ────────────────────── */}
        <div className="lg:col-span-5 space-y-6" id="opt-right-column">
          {/* Ticker Selector List */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm" id="opt-tickers-card">
            <h3 className="text-sm font-bold text-slate-800 mb-3">Selecione o Ativo para Ajustar Sinais de IA</h3>
            <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1" id="opt-tickers-grid">
              {assets.map(asset => (
                <button
                  key={asset.ticker}
                  id={`opt-ticker-${asset.ticker}`}
                  onClick={() => setActiveAssetTicker(asset.ticker)}
                  className={`py-2 px-1.5 rounded-lg text-center border font-mono text-[10px] font-semibold transition-all ${
                    activeAssetTicker === asset.ticker
                      ? "bg-slate-900 border-slate-950 text-white shadow-sm ring-1 ring-slate-950"
                      : "bg-slate-50/50 border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-800"
                  }`}
                >
                  {asset.ticker}
                </button>
              ))}
            </div>
          </div>

          {/* AI Scores and Sliders for Active Asset */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-5 shadow-sm" id="opt-ai-dashboard-card">
            <div className="flex justify-between items-start pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs text-emerald-600 uppercase font-mono tracking-wider font-semibold">Motor Bayesiano</span>
                <h4 className="text-base font-bold text-slate-800 mt-0.5">{activeAsset.ticker} - {activeAsset.name}</h4>
                <p className="text-xs text-slate-500">{activeAsset.sector}</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Alocação Atual</span>
                <h5 className="text-sm font-extrabold text-slate-800 font-mono">{formatPct((computedWeights[activeAsset.ticker] || 0) * 100)}</h5>
              </div>
            </div>

            {/* Sinais Real-time Sliders */}
            <div className="space-y-4" id="ai-sliders-group">
              <div className="flex justify-between items-center">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" />
                  Sinais Analíticos do Meta-Learner (0-100)
                </h5>
                {hasPendingScoreChanges && (
                  <span className="text-[10px] font-mono bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">
                    Rascunho não Submetido
                  </span>
                )}
              </div>

              {/* Macro */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-500">Score de Conjuntura Macro</span>
                  <span className="text-slate-800 font-bold">{activeDraftScores.macro}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  id="slider-macro"
                  value={activeDraftScores.macro}
                  onChange={(e) => handleScoreChange("macro", parseInt(e.target.value))}
                  className="w-full accent-emerald-500 h-1 bg-slate-100 rounded-lg cursor-pointer"
                />
              </div>

              {/* Micro */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-500">Fundamentos Micro (Balancete)</span>
                  <span className="text-slate-800 font-bold">{activeDraftScores.micro}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  id="slider-micro"
                  value={activeDraftScores.micro}
                  onChange={(e) => handleScoreChange("micro", parseInt(e.target.value))}
                  className="w-full accent-emerald-500 h-1 bg-slate-100 rounded-lg cursor-pointer"
                />
              </div>

              {/* News Sentiment */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-emerald-700 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-emerald-500 fill-emerald-500" /> Sentimento de Notícias (LLM)
                  </span>
                  <span className="text-slate-800 font-bold">{activeDraftScores.news}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  id="slider-news"
                  value={activeDraftScores.news}
                  onChange={(e) => handleScoreChange("news", parseInt(e.target.value))}
                  className="w-full accent-emerald-500 h-1 bg-slate-100 rounded-lg cursor-pointer"
                />
              </div>

              {/* Credit Score */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-500">Avaliação de Risco de Crédito</span>
                  <span className="text-slate-800 font-bold">{activeDraftScores.credit}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  id="slider-credit"
                  value={activeDraftScores.credit}
                  onChange={(e) => handleScoreChange("credit", parseInt(e.target.value))}
                  className="w-full accent-emerald-500 h-1 bg-slate-100 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Expected Return and Confidence output */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3" id="bl-posterior-indicators">
              <h5 className="text-xs font-bold text-slate-700 uppercase font-mono tracking-wider">Visão Black-Litterman Estimada</h5>
              
              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <span className="text-slate-500 block mb-0.5">Retorno Esperado:</span>
                  <span className="text-emerald-600 font-extrabold text-sm">{(activeDraftReturn * 100).toFixed(2)}% a.a.</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Convicção da IA:</span>
                  <span className="text-slate-800 font-bold">{(activeAsset.confidenceBL * 100).toFixed(0)}%</span>
                </div>
              </div>

              {/* Sliders for return adjustment */}
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                  <span>Retorno Esperado Ajustado (Posterior)</span>
                  <span className="text-slate-800 font-semibold">{(activeDraftReturn * 100).toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min="-10"
                  max="40"
                  step="1"
                  id="slider-expected-return"
                  value={(activeDraftReturn * 100).toFixed(0)}
                  onChange={(e) => handleReturnSliderChange(parseFloat(e.target.value) / 100)}
                  className="w-full accent-blue-600 h-1 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* ── MANDATORY SCORE SUBMISSION & 100% VALIDATION ENFORCEMENT BOX ── */}
            <div className="p-4 rounded-xl border space-y-3 bg-slate-900 text-white border-slate-800 shadow-md" id="submit-scores-validation-box">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase font-mono tracking-wider text-slate-300 flex items-center gap-1.5">
                  {isAllocationValid ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4 text-rose-400" />}
                  Validação para Submissão
                </span>
                <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded ${
                  isAllocationValid ? "bg-emerald-500 text-slate-950" : "bg-rose-500 text-white"
                }`}>
                  {isAllocationValid ? "100.0% VÁLIDO" : `ERRO SOMA: ${currentTotalWeightPct.toFixed(1)}%`}
                </span>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                {isAllocationValid
                  ? "A alocação da carteira cumpre o mandato de 100.0%. Clique abaixo para gravar os novos scores e rebalancear o portfólio."
                  : `A submissão está bloqueada porque a soma dos pesos dos ativos está em ${currentTotalWeightPct.toFixed(2)}%. A soma deve ser exatamente 100.0%.`}
              </p>

              {/* Feedback alert message if user clicked or performed action */}
              {submissionFeedback && (
                <div className={`p-3 rounded-lg text-xs font-sans flex items-start gap-2 ${
                  submissionFeedback.type === "success" 
                    ? "bg-emerald-500/20 text-emerald-200 border border-emerald-500/30" 
                    : "bg-rose-500/20 text-rose-200 border border-rose-500/30"
                }`}>
                  {submissionFeedback.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />}
                  <span>{submissionFeedback.message}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  id="btn-submit-new-scores"
                  onClick={handleSubmitNewScores}
                  disabled={!isAllocationValid}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer font-mono ${
                    isAllocationValid
                      ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-sm"
                      : "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60"
                  }`}
                  title={isAllocationValid ? "Submeter scores para recálculo do motor quantitativo" : "A submissão está bloqueada: os pesos devem somar exatamente 100.0%"}
                >
                  {isAllocationValid ? <Save className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  {isAllocationValid ? "Submeter Novos Scores e Rebalancear" : `Submissão Bloqueada (${currentTotalWeightPct.toFixed(1)}%)`}
                </button>

                {hasPendingScoreChanges && (
                  <button
                    type="button"
                    onClick={handleResetDraft}
                    className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all cursor-pointer"
                    title="Desfazer ajustes pendentes deste ativo"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* LLM Generated Narrative box */}
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl space-y-1.5 relative overflow-hidden" id="llm-narrative-card">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
              <h5 className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                Parecer Técnico do Gestor (Gerado por LLM)
              </h5>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                &quot;{activeAsset.explanation}&quot;
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

