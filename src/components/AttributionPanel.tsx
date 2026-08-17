/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid,
  Cell
} from "recharts";
import { 
  Layers, 
  Activity, 
  BrainCircuit, 
  TrendingUp, 
  CheckCircle2, 
  Percent, 
  BarChart3,
  Scale,
  Sparkles
} from "lucide-react";
import { ClassicAttribution, RiskAttribution, AIAttribution } from "../types";

// Static premium datasets for classical and risk attribution
const BRINSON_DATA: ClassicAttribution[] = [
  { ticker: "PETR4", portfolioWeight: 0.16, benchmarkWeight: 0.25, assetReturn: 0.224, allocationEffect: 0.0089, selectionEffect: 0.0125, interactionEffect: -0.0020 },
  { ticker: "VALE3", portfolioWeight: 0.08, benchmarkWeight: 0.30, assetReturn: -0.045, allocationEffect: 0.0112, selectionEffect: -0.0050, interactionEffect: 0.0021 },
  { ticker: "WEGE3", portfolioWeight: 0.18, benchmarkWeight: 0.10, assetReturn: 0.328, allocationEffect: 0.0162, selectionEffect: 0.0245, interactionEffect: 0.0042 },
  { ticker: "ITUB4", portfolioWeight: 0.26, benchmarkWeight: 0.20, assetReturn: 0.142, allocationEffect: -0.0015, selectionEffect: 0.0110, interactionEffect: 0.0012 },
  { ticker: "BBAS3", portfolioWeight: 0.12, benchmarkWeight: 0.15, assetReturn: 0.185, allocationEffect: 0.0024, selectionEffect: 0.0085, interactionEffect: -0.0010 },
  { ticker: "CDI", portfolioWeight: 0.20, benchmarkWeight: 0.00, assetReturn: 0.105, allocationEffect: 0.0050, selectionEffect: 0.0000, interactionEffect: 0.0000 },
];

const RISK_DATA: RiskAttribution[] = [
  { ticker: "PETR4", weight: 0.16, componentVar: 0.0084, componentCvar: 0.0125, marginalContribution: 0.0525, riskPercentage: 28.5 },
  { ticker: "VALE3", weight: 0.08, componentVar: 0.0036, componentCvar: 0.0054, marginalContribution: 0.0450, riskPercentage: 12.2 },
  { ticker: "WEGE3", weight: 0.18, componentVar: 0.0072, componentCvar: 0.0108, marginalContribution: 0.0400, riskPercentage: 24.5 },
  { ticker: "ITUB4", weight: 0.26, componentVar: 0.0068, componentCvar: 0.0098, marginalContribution: 0.0262, riskPercentage: 23.1 },
  { ticker: "BBAS3", weight: 0.12, componentVar: 0.0034, componentCvar: 0.0048, marginalContribution: 0.0283, riskPercentage: 11.7 },
  { ticker: "CDI", weight: 0.20, componentVar: 0.0000, componentCvar: 0.0000, marginalContribution: 0.0000, riskPercentage: 0.0 },
];

const AI_ATTRIBUTION_MODELS: AIAttribution[] = [
  { 
    modelName: "News Sentiment (LLM)", 
    contribution: 0.0145, 
    hitRatio: 0.78, 
    status: "ACTIVE",
    description: "Extrai scores de otimismo de relatórios institucionais, notícias setoriais e transcrições de resultados trimestrais da B3."
  },
  { 
    modelName: "Fundamentalist XGBoost", 
    contribution: 0.0210, 
    hitRatio: 0.72, 
    status: "ACTIVE",
    description: "Árvores de decisão impulsionadas por gradiente. Mapeia discrepâncias entre múltiplos de valuation histórico e retorno setorial."
  },
  { 
    modelName: "LSTM Neural Networks", 
    contribution: 0.0115, 
    hitRatio: 0.64, 
    status: "PASSIVE",
    description: "Rede neural recorrente de longo/curto prazo especializada em capturar momentum intraday e suavizar séries financeiras."
  },
  { 
    modelName: "Dynamic Meta-Learner", 
    contribution: 0.0095, 
    hitRatio: 0.82, 
    status: "OVERWEIGHTED",
    description: "Combinação dinâmica dos preditores base. Reajusta os pesos de cada modelo conforme o Regime de Mercado estimado (HMM)."
  }
];

export default function AttributionPanel() {
  const [activeTab, setActiveTab] = useState<"BRINSON" | "RISK" | "AI">("BRINSON");

  const formatPct = (val: number) => `${(val * 100).toFixed(2)}%`;
  const formatBps = (val: number) => `${(val * 10000).toFixed(0)} bps`;

  return (
    <div className="space-y-6" id="attribution-panel">
      {/* Tab Switchers */}
      <div className="flex border-b border-slate-200" id="attribution-tab-headers">
        <button
          id="tab-brinson"
          onClick={() => setActiveTab("BRINSON")}
          className={`px-5 py-3 text-sm font-semibold border-b-2 -mb-px transition-all flex items-center gap-2 ${
            activeTab === "BRINSON"
              ? "border-emerald-500 text-emerald-600 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Scale className="w-4 h-4" />
          Atribuição Clássica (Brinson)
        </button>
        <button
          id="tab-risk"
          onClick={() => setActiveTab("RISK")}
          className={`px-5 py-3 text-sm font-semibold border-b-2 -mb-px transition-all flex items-center gap-2 ${
            activeTab === "RISK"
              ? "border-emerald-500 text-emerald-600 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Activity className="w-4 h-4" />
          Decomposição de Risco Marginal
        </button>
        <button
          id="tab-ai"
          onClick={() => setActiveTab("AI")}
          className={`px-5 py-3 text-sm font-semibold border-b-2 -mb-px transition-all flex items-center gap-2 ${
            activeTab === "AI"
              ? "border-emerald-500 text-emerald-600 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <BrainCircuit className="w-4 h-4" />
          Atribuição de Alfa por IA
        </button>
      </div>

      {/* ── TAB CONTENT: BRINSON CLASSIC ──────────────────────────────────────── */}
      {activeTab === "BRINSON" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn" id="brinson-content">
          {/* Brinson Table */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 overflow-x-auto shadow-sm" id="brinson-table-card">
            <h3 className="text-sm font-bold text-slate-800 mb-1 tracking-tight flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-600" />
              Modelo Brinson-Fachler de Atribuição de Performance
            </h3>
            <p className="text-xs text-slate-500 mb-4">Mede a geração de retorno ativo dividida por decisões de Alocação, Seleção e Interação de ativos.</p>
            
            <table className="min-w-full text-xs text-slate-600 font-sans" id="brinson-table">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 font-mono text-left">
                  <th className="py-2.5">Ticker</th>
                  <th className="py-2.5 text-right">Wp (Fundo)</th>
                  <th className="py-2.5 text-right">Wb (Índice)</th>
                  <th className="py-2.5 text-right">Retorno Ativo</th>
                  <th className="py-2.5 text-right text-emerald-600">Efeito Alocação</th>
                  <th className="py-2.5 text-right text-blue-600">Efeito Seleção</th>
                  <th className="py-2.5 text-right">Efeito Interação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {BRINSON_DATA.map((row) => (
                  <tr key={row.ticker} className="hover:bg-slate-50/50">
                    <td className="py-3 font-mono font-bold text-slate-800">{row.ticker}</td>
                    <td className="py-3 text-right font-mono">{(row.portfolioWeight * 100).toFixed(0)}%</td>
                    <td className="py-3 text-right font-mono">{(row.benchmarkWeight * 100).toFixed(0)}%</td>
                    <td className="py-3 text-right font-mono">{(row.assetReturn * 100).toFixed(1)}%</td>
                    <td className="py-3 text-right font-mono text-emerald-600 font-medium">
                      {row.allocationEffect >= 0 ? `+${formatPct(row.allocationEffect)}` : formatPct(row.allocationEffect)}
                    </td>
                    <td className="py-3 text-right font-mono text-blue-600 font-medium">
                      {row.selectionEffect >= 0 ? `+${formatPct(row.selectionEffect)}` : formatPct(row.selectionEffect)}
                    </td>
                    <td className="py-3 text-right font-mono text-slate-550">
                      {row.interactionEffect >= 0 ? `+${formatPct(row.interactionEffect)}` : formatPct(row.interactionEffect)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Brinson Sidebar Chart */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-sm" id="brinson-chart-card">
            <div>
              <h4 className="text-sm font-bold text-slate-800 mb-2">Visão Consolidada de Efeitos</h4>
              <p className="text-xs text-slate-500 mb-4">Atribuição agregada do retorno ativo contra o Ibovespa</p>
              
              <div className="h-44 w-full" id="brinson-barchart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: "Alocação", valor: 4.22, cor: "#10b981" },
                      { name: "Seleção", valor: 5.15, cor: "#3b82f6" },
                      { name: "Interação", valor: 0.55, cor: "#64748b" }
                    ]}
                    layout="vertical"
                    margin={{ top: 0, right: 10, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} opacity={0.7} />
                    <XAxis type="number" stroke="#64748b" fontSize={10} tickLine={false} unit="%" />
                    <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#cbd5e1", borderRadius: "8px", boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)" }} />
                    <Bar dataKey="valor" radius={[0, 4, 4, 0]}>
                      {[
                        <Cell key="cell-0" fill="#10b981" />,
                        <Cell key="cell-1" fill="#3b82f6" />,
                        <Cell key="cell-2" fill="#64748b" />
                      ]}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl mt-4" id="brinson-insight">
              <h5 className="text-xs font-bold text-slate-700 font-mono uppercase mb-1">Racional de Performance</h5>
              <p className="text-xs text-slate-600 leading-relaxed">
                O modelo identificou que o <strong>Efeito Seleção (+5.15%)</strong> foi o principal motor de geração de Alfa do fundo, consolidando a escolha de ativos da IA como um sucesso tático superior ao rebalanceamento setorial do índice.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB CONTENT: RISK DECOMPOSITION ───────────────────────────────────── */}
      {activeTab === "RISK" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn" id="risk-content">
          {/* Risk Table */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 overflow-x-auto shadow-sm" id="risk-table-card">
            <h3 className="text-sm font-bold text-slate-800 mb-1 tracking-tight flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              Tabela de Atribuição de Risco Marginal (MCR)
            </h3>
            <p className="text-xs text-slate-500 mb-4 font-sans">Mede a contribuição exata de cada papel no VaR e CVaR diários do fundo baseado na matriz de covariância histórica.</p>

            <table className="min-w-full text-xs text-slate-600 font-sans" id="risk-table">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 font-mono text-left">
                  <th className="py-2.5">Ticker</th>
                  <th className="py-2.5 text-right">Peso Real</th>
                  <th className="py-2.5 text-right text-rose-600">VaR Marginal</th>
                  <th className="py-2.5 text-right text-rose-600">CVaR Marginal</th>
                  <th className="py-2.5 text-right">MCR (sigma)</th>
                  <th className="py-2.5 text-right text-blue-600">Participação de Risco (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {RISK_DATA.map((row) => (
                  <tr key={row.ticker} className="hover:bg-slate-50/50">
                    <td className="py-3 font-mono font-bold text-slate-800">{row.ticker}</td>
                    <td className="py-3 text-right font-mono">{(row.weight * 100).toFixed(0)}%</td>
                    <td className="py-3 text-right font-mono text-rose-600">{(row.componentVar * 100).toFixed(2)}%</td>
                    <td className="py-3 text-right font-mono text-rose-700">{(row.componentCvar * 100).toFixed(2)}%</td>
                    <td className="py-3 text-right font-mono">{row.marginalContribution.toFixed(4)}</td>
                    <td className="py-3 text-right font-mono text-blue-600 font-semibold">{row.riskPercentage.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Risk Sidebar Concentration */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 space-y-4 flex flex-col justify-between shadow-sm" id="risk-concentration-card">
            <div>
              <h4 className="text-sm font-bold text-slate-800 mb-2">Concentração de Risco HHI</h4>
              <p className="text-xs text-slate-500 mb-4">Índice Herfindahl-Hirschman do risco do portfólio</p>

              {/* HHI Metric */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center" id="hhi-box">
                <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">HHI do Risco</span>
                <h3 className="text-2xl font-extrabold text-slate-850 mt-1">0.1824</h3>
                <span className="text-xs text-emerald-600 font-mono mt-1 block">✓ Altamente Diversificado</span>
              </div>
            </div>

            <div className="space-y-3" id="risk-warnings">
              <h5 className="text-xs font-bold text-rose-600 font-mono uppercase">Alertas de Cauda Ativos</h5>
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg flex gap-2" id="tail-warning-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1 shrink-0" />
                <p className="text-[11px] text-slate-600 leading-normal">
                  <strong>PETR4 (28.5% do risco)</strong> exibe concentração marginal moderada devido à alta volatilidade regulatória. O modelo HRP já subpesou o papel mitigando esse efeito.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB CONTENT: AI SENTINEL ALPHA ────────────────────────────────────── */}
      {activeTab === "AI" && (
        <div className="space-y-6 animate-fadeIn" id="ai-attribution-content">
          {/* Bento Cards of Models */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" id="ai-models-grid">
            {AI_ATTRIBUTION_MODELS.map((model) => (
              <div 
                key={model.modelName} 
                className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden"
                id={`ai-model-${model.modelName.replace(/\s+/g, '-').toLowerCase()}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[10px] font-mono uppercase tracking-wider">{model.status}</span>
                  <div className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-[10px] font-mono">
                    Hit Ratio: {(model.hitRatio * 100).toFixed(0)}%
                  </div>
                </div>

                <div className="my-4">
                  <h4 className="text-sm font-bold text-slate-800">{model.modelName}</h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-3">{model.description}</p>
                </div>

                <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">Alfa Gerado</span>
                  <span className="text-base font-extrabold text-emerald-600 font-mono">+{formatBps(model.contribution)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* AI Synergy Box */}
          <div className="bg-white border border-slate-200 p-5 rounded-xl flex flex-col md:flex-row gap-5 items-center justify-between shadow-sm" id="ai-synergy-card">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-150 mt-1">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-800">Sinergia da Inteligência Artificial</h4>
                <p className="text-xs text-slate-600 mt-1 max-w-3xl">
                  A combinação adaptativa dos scores do Sentinel News (LLM) e dos modelos preditivos fundamentalistas pelo Meta-Learner gerou um prêmio de alfa incremental total de <strong>5.65% (565 bps)</strong> no período. Isso isola o retorno gerado pelas decisões exclusivas da IA do retorno passivo de mercado e do CDI de carregamento.
                </p>
              </div>
            </div>
            <div className="text-center md:text-right border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 pl-0 md:pl-6 shrink-0" id="total-ai-alpha-box">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono block">Alfa Total de IA</span>
              <h3 className="text-2xl font-black text-emerald-600 font-mono mt-0.5">+565 bps</h3>
              <span className="text-[10px] text-slate-500">Anualizado Líquido</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
