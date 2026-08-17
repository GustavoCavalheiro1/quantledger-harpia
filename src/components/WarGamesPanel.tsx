/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  ShieldAlert, 
  Flame, 
  HelpCircle, 
  Sliders, 
  MessageSquare, 
  CheckCircle2, 
  BadgeX, 
  TrendingDown,
  Info
} from "lucide-react";
import { Asset, StressScenario } from "../types";
import { HISTORICAL_SCENARIOS, ALLOCATION_STRATEGIES } from "../data/mockData";

interface WarGamesPanelProps {
  assets: Asset[];
}

export default function WarGamesPanel({ assets }: WarGamesPanelProps) {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("COVID_2020");
  const [customShocks, setCustomShocks] = useState<Record<string, number>>({
    PETR4: -20,
    VALE3: -20,
    WEGE3: -10,
    ITUB4: -15,
    BBAS3: -25,
    BOVA11: -18,
  });
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);

  // Current active scenario definition
  const activeScenario = HISTORICAL_SCENARIOS.find(s => s.id === selectedScenarioId) || HISTORICAL_SCENARIOS[0];

  // Active weights for HRP (which is the main strategy on screen)
  const currentWeights = ALLOCATION_STRATEGIES.HRP_OPTIMIZED;

  // Compute shocks in real-time
  const computeSimulation = () => {
    let totalPnl = 0;
    const shocksToUse = isCustomMode 
      ? Object.keys(customShocks).reduce((acc, key) => ({ ...acc, [key]: customShocks[key] / 100 }), {}) 
      : activeScenario.shocks;

    let worstAsset = "";
    let worstAssetLoss = 0;

    Object.keys(currentWeights).forEach(ticker => {
      const weight = currentWeights[ticker] || 0;
      const shock = (shocksToUse as Record<string, number>)[ticker] || 0;
      const contribution = weight * shock;
      totalPnl += contribution;

      if (shock < worstAssetLoss) {
        worstAssetLoss = shock;
        worstAsset = ticker;
      }
    });

    return {
      portfolioPnlPct: totalPnl * 100,
      worstAsset,
      worstAssetLoss: worstAssetLoss * 100,
      varShift: Math.abs(totalPnl) * 2.1 * 100 // simulated stress VaR
    };
  };

  const simulationResult = computeSimulation();

  const handleCustomShockChange = (ticker: string, val: number) => {
    setCustomShocks(prev => ({
      ...prev,
      [ticker]: val
    }));
  };

  const formatPct = (val: number) => `${val.toFixed(2)}%`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="war-games-panel">
      {/* ── LEFT COLUMN: SCENARIO SELECTOR & CUSTOM SHOCK SLIDERS (5 COLS) ───── */}
      <div className="lg:col-span-5 space-y-6" id="wg-left-column">
        {/* Mode Selector */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm" id="wg-mode-card">
          <h3 className="text-sm font-bold text-slate-800 mb-2 tracking-tight flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-emerald-600" />
            Configuração de Cenários de Estresse
          </h3>
          <p className="text-xs text-slate-500 mb-4">Escolha entre retroceder no tempo ou projetar choques macroeconômicos customizados.</p>
          
          <div className="flex bg-slate-50 p-1 rounded-lg border border-slate-200" id="wg-mode-toggles">
            <button
              id="wg-btn-mode-historical"
              onClick={() => setIsCustomMode(false)}
              className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
                !isCustomMode 
                  ? "bg-white text-slate-800 shadow-sm border border-slate-200/50" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Cenários Históricos
            </button>
            <button
              id="wg-btn-mode-custom"
              onClick={() => setIsCustomMode(true)}
              className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
                isCustomMode 
                  ? "bg-white text-slate-800 shadow-sm border border-slate-200/50" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Choques Customizados
            </button>
          </div>
        </div>

        {/* Historical Scenarios Selector */}
        {!isCustomMode ? (
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 animate-fadeIn shadow-sm" id="wg-scenarios-card">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Selecione uma Crise Histórica</h4>
            <div className="space-y-2" id="wg-historical-list">
              {HISTORICAL_SCENARIOS.map(scenario => (
                <button
                  key={scenario.id}
                  id={`wg-select-${scenario.id}`}
                  onClick={() => setSelectedScenarioId(scenario.id)}
                  className={`w-full p-4 rounded-xl text-left border transition-all flex flex-col ${
                    selectedScenarioId === scenario.id
                      ? "bg-rose-50 border-rose-200 text-rose-950 ring-1 ring-rose-100"
                      : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-800"
                  }`}
                >
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ShieldAlert className={`w-3.5 h-3.5 ${selectedScenarioId === scenario.id ? "text-rose-600" : "text-slate-400"}`} />
                    {scenario.name}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{scenario.description}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          // Custom Shock Sliders
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 animate-fadeIn shadow-sm" id="wg-custom-card">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Injetar Choques Específicos por Ativo (%)</h4>
            
            <div className="space-y-4" id="wg-custom-sliders-group">
              {assets.map(asset => (
                <div key={asset.ticker} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-500">{asset.ticker}</span>
                    <span className="text-rose-600 font-bold">{customShocks[asset.ticker]}%</span>
                  </div>
                  <input
                    type="range"
                    min="-80"
                    max="10"
                    step="1"
                    id={`slider-wg-${asset.ticker}`}
                    value={customShocks[asset.ticker]}
                    onChange={(e) => handleCustomShockChange(asset.ticker, parseInt(e.target.value))}
                    className="w-full accent-rose-500 h-1 bg-slate-100 rounded-lg cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── RIGHT COLUMN: WAR GAME RESULTS & RISK ADVISORY REPORT (7 COLS) ───── */}
      <div className="lg:col-span-7 space-y-6" id="wg-right-column">
        
        {/* Simulation Output Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm" id="wg-simulation-results-card">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800 tracking-tight">Simulação de Impacto Financeiro</h3>
              <p className="text-xs text-slate-500">Estimativa do P&L sob as condições de contorno selecionadas</p>
            </div>
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl">
              <Flame className="w-5 h-5" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6" id="wg-results-metrics">
            {/* PnL da Carteira */}
            <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl" id="wg-pnl-metric">
              <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">P&L do Portfólio</span>
              <h4 className={`text-2xl font-extrabold mt-1 font-mono ${simulationResult.portfolioPnlPct >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                {simulationResult.portfolioPnlPct >= 0 ? `+` : ``}{simulationResult.portfolioPnlPct.toFixed(2)}%
              </h4>
              <span className="text-[10px] text-slate-400 mt-0.5 block">NAV sob risco HRP</span>
            </div>

            {/* Pior Ativo */}
            <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl" id="wg-worst-asset-metric">
              <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">Ativo mais Afetado</span>
              <h4 className="text-xl font-bold mt-1 text-slate-850 font-mono">
                {simulationResult.worstAsset || "N/A"}
              </h4>
              <span className="text-xs text-rose-600 mt-1 font-mono font-medium block">
                {simulationResult.worstAssetLoss.toFixed(1)}% choque
              </span>
            </div>

            {/* Estresse VaR */}
            <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl" id="wg-stress-var-metric">
              <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">VaR de Estresse</span>
              <h4 className="text-xl font-bold mt-1 text-rose-600 font-mono">
                {simulationResult.varShift.toFixed(1)}%
              </h4>
              <span className="text-[10px] text-slate-400 mt-1 block">Incerteza implícita</span>
            </div>
          </div>

          {/* Shock Table display for quick reference */}
          <div className="mt-6 space-y-2" id="wg-shocks-grid-wrapper">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Grade de Choques Individuais Aplicada</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2" id="wg-shocks-grid">
              {assets.map(asset => {
                const shocksToUse = isCustomMode 
                  ? customShocks 
                  : Object.keys(activeScenario.shocks).reduce((acc, key) => ({ ...acc, [key]: activeScenario.shocks[key] * 100 }), {});
                const assetShock = (shocksToUse as Record<string, number>)[asset.ticker] || 0;
                return (
                  <div key={asset.ticker} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-center font-mono">
                    <span className="text-[10px] text-slate-500 uppercase">{asset.ticker}</span>
                    <span className={`block text-xs font-bold mt-1 ${assetShock >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {assetShock >= 0 ? `+` : ``}{assetShock.toFixed(0)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Chief Risk Officer AI Report */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 relative overflow-hidden shadow-sm" id="wg-cro-report-card">
          <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
          
          <div className="flex items-start gap-4">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 mt-1 shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-100 px-2 py-0.5 rounded-full font-mono uppercase tracking-wider font-semibold">
                  Chief Risk Officer AI
                </span>
                <span className="text-xs text-slate-400 font-mono">Simulação Virtual</span>
              </div>
              <h4 className="text-base font-bold text-slate-800 mt-1.5">Parecer Crítico do Comitê de Risco de IA</h4>
              <p className="text-xs text-slate-600 leading-relaxed mt-2 font-sans">
                {isCustomMode 
                  ? `ANÁLISE DE CHOQUE CUSTOMIZADO: Sob o vetor de choques injetado, o portfólio sofreria um impacto financeiro estimado de ${formatPct(simulationResult.portfolioPnlPct)}. O motor de estresse acusa que o VaR de cauda saltaria para ${formatPct(simulationResult.varShift)}. Recomenda-se a readequação dos clusters HRP para mitigar concentração nas classes exportadoras.` 
                  : activeScenario.riskCommitteeMemo}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
