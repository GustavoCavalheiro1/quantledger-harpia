/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from "react";
import { 
  TrendingUp, 
  Cpu, 
  Activity, 
  ShieldAlert, 
  BrainCircuit, 
  Layers, 
  HelpCircle,
  Database,
  Lock,
  Globe,
  Sparkles,
  Award,
  Shield,
  Newspaper,
  Menu,
  X,
  ChevronRight,
  CheckCircle2,
  Calendar,
  FileCheck,
  FileText,
  Trees
} from "lucide-react";
import { Asset, PerformanceMetrics } from "./types";
import { INITIAL_ASSETS, generateHistory } from "./data/mockData";
import OverviewPanel from "./components/OverviewPanel";
import OptimizationPanel from "./components/OptimizationPanel";
import AttributionPanel from "./components/AttributionPanel";
import WarGamesPanel from "./components/WarGamesPanel";
import DigitalTwinPanel from "./components/DigitalTwinPanel";
import RiskPanel from "./components/RiskPanel";
import DataManagerPanel from "./components/DataManagerPanel";
import NewsPanel from "./components/NewsPanel";
import SimulationPanel from "./components/SimulationPanel";
import TradedAssetsReport from "./components/TradedAssetsReport";
import DetailedMonthlyReport from "./components/DetailedMonthlyReport";
import ManagerExecutiveReport from "./components/ManagerExecutiveReport";
import AgroIntelligenceMonitor from "./components/AgroIntelligenceMonitor";
import harpiaLogo from "./assets/images/harpia_logo_1786511025650.jpg";

export default function App() {
  const [activeTab, setActiveTab] = useState<"OVERVIEW" | "MANAGER_REPORT" | "OPTIMIZATION" | "ATTRIBUTION" | "WAR_GAMES" | "TWIN" | "RISK" | "DATA_ENGINE" | "NEWS" | "SIMULATION" | "TRADED_ASSETS" | "MONTHLY_REPORT" | "AGRO_MONITOR">("OVERVIEW");
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Real-time tick engine: updates traded assets prices & NAV continuously in real-time
  useEffect(() => {
    const timer = setInterval(() => {
      setAssets(prev => prev.map(asset => {
        // 45% chance of price fluctuation per tick
        if (Math.random() > 0.55) {
          const deltaPct = (Math.random() - 0.48) * 0.0025; // ~ ±0.12%
          const updatedPrice = Number(Math.max(0.1, asset.price * (1 + deltaPct)).toFixed(2));
          return {
            ...asset,
            price: updatedPrice
          };
        }
        return asset;
      }));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Compute live portfolio NAV & PnL connected directly to traded assets
  const { liveNav, liveDailyPnl, liveReturnPct } = useMemo(() => {
    const initialCapital = 100000000;
    let totalUnrealizedPnl = 0;
    assets.forEach(a => {
      const baseShares = a.ticker === "SOJA" || a.ticker === "MILHO" || a.ticker === "CAFÉ"
        ? 50000
        : 250000;
      const baseEntryPrice = a.price * 0.94; // reference entry price ~6% below current
      totalUnrealizedPnl += (a.price - baseEntryPrice) * baseShares;
    });
    const computedNav = initialCapital + totalUnrealizedPnl;
    const returnPct = Number(((totalUnrealizedPnl / initialCapital) * 100).toFixed(2));
    return {
      liveNav: computedNav,
      liveDailyPnl: totalUnrealizedPnl,
      liveReturnPct: returnPct
    };
  }, [assets]);

  // Load historical charting data
  const historyData = useMemo(() => generateHistory(), []);

  // Compute portfolio-wide summary metrics dynamically from assets
  const metrics = useMemo<PerformanceMetrics>(() => {
    const totalReturn = 0.2854 + (liveReturnPct / 100); // connected to live return
    const annReturn = 0.2450 + (liveReturnPct / 200);
    const cdiAnn = 0.1050;
    const excessVsCdi = annReturn - cdiAnn;
    const volatility = 0.1385;
    const maxDrawdown = -0.0682;
    const var95 = 0.0185;
    const cvar95 = 0.0264;
    const sharpe = excessVsCdi / volatility;
    const sortino = excessVsCdi / 0.0820;
    const calmar = annReturn / Math.abs(maxDrawdown);
    const beta = 0.65;

    return {
      totalReturn,
      annReturn,
      cdiAnn,
      excessVsCdi,
      volatility,
      maxDrawdown,
      var95,
      cvar95,
      sharpe: Number(sharpe.toFixed(2)),
      sortino: Number(sortino.toFixed(2)),
      calmar: Number(calmar.toFixed(2)),
      beta,
      criteriaMet: true
    };
  }, [assets, liveReturnPct]);

  // Handle dynamic asset score and view changes from the Optimizer Panel
  const handleUpdateAssetScores = (ticker: string, newScores: Record<string, number>, expectedReturn?: number) => {
    setAssets(prevAssets => {
      return prevAssets.map(asset => {
        if (asset.ticker === ticker) {
          // Adjust expected return and confidence dynamically
          const updatedReturn = expectedReturn !== undefined ? expectedReturn : asset.expectedReturnBL;
          const avgScore = (newScores.macro + newScores.micro + newScores.news + newScores.credit) / 4;
          const confidence = 0.5 + (avgScore / 100) * 0.45; // map to 0.5 - 0.95 range
          
          // Dynamically adjust the LLM rationale for higher/lower scores to make it feel alive!
          let text = asset.explanation;
          if (newScores.news > 85) {
            text = `O motor de LLM detectou uma explosão de sentimento positivo nas mídias sociais e portais secundários, justificando um aumento expressivo de peso táctico no portfólio.`;
          } else if (newScores.news < 40) {
            text = `A cobertura de notícias exibe viés pessimista recente. O comitê de IA sugere postura conservadora e proteção de lucros neste papel.`;
          }

          return {
            ...asset,
            scores: {
              macro: newScores.macro,
              micro: newScores.micro,
              news: newScores.news,
              credit: newScores.credit
            },
            expectedReturnBL: updatedReturn,
            confidenceBL: confidence,
            explanation: text
          };
        }
        return asset;
      });
    });
  };

  type TabType = "OVERVIEW" | "MANAGER_REPORT" | "OPTIMIZATION" | "ATTRIBUTION" | "WAR_GAMES" | "TWIN" | "RISK" | "DATA_ENGINE" | "NEWS" | "SIMULATION" | "TRADED_ASSETS" | "MONTHLY_REPORT" | "AGRO_MONITOR";

  interface NavItem {
    id: TabType;
    label: string;
    desc: string;
    icon: React.ElementType;
    badge: string;
  }

  interface NavGroup {
    title: string;
    items: NavItem[];
  }

  // Grouped Navigation Items Configuration
  const navGroups: NavGroup[] = [
    {
      title: "GESTÃO & RELATÓRIOS DO GESTOR",
      items: [
        {
          id: "OVERVIEW",
          label: "Performance & NAV",
          desc: "Retornos, CDI & Métricas Quânticas",
          icon: TrendingUp,
          badge: "+19.91%"
        },
        {
          id: "MANAGER_REPORT",
          label: "Relatório do Gestor (Master)",
          desc: "Planilhas, Riscos, Macro, Trades & Teses (2026+)",
          icon: FileText,
          badge: "CVM 175"
        },
        {
          id: "MONTHLY_REPORT",
          label: "Relatório Mês a Mês",
          desc: "Auditoria Granular de Cada Mês",
          icon: Calendar,
          badge: "Ficha & PDF"
        },
        {
          id: "OPTIMIZATION",
          label: "Otimizador de Carteira",
          desc: "Alocação MVO & Weight Caps",
          icon: Cpu,
          badge: "IA"
        },
        {
          id: "ATTRIBUTION",
          label: "Atribuição de Alfa & Risco",
          desc: "Decomposição HHI & Fatores",
          icon: BrainCircuit,
          badge: "Alfa 6.8%"
        }
      ]
    },
    {
      title: "RISCO & GOVERNANÇA",
      items: [
        {
          id: "RISK",
          label: "Governança de Risco (GRC)",
          desc: "Limites CVM 175 & Safe Weights",
          icon: Shield,
          badge: "Compliance"
        },
        {
          id: "WAR_GAMES",
          label: "War Games (Estresse)",
          desc: "Choques Históricos & Monte Carlo",
          icon: ShieldAlert,
          badge: "Choques"
        },
        {
          id: "TWIN",
          label: "Digital Twin (Shadow Ledger)",
          desc: "Espelhamento de Execuções B3",
          icon: Activity,
          badge: "Ao Vivo"
        }
      ]
    },
    {
      title: "INTELIGÊNCIA & MODELAGEM",
      items: [
        {
          id: "NEWS",
          label: "Central de Notícias",
          desc: "Sentinel AI & Análise Macro",
          icon: Newspaper,
          badge: "Sentinel"
        },
        {
          id: "SIMULATION",
          label: "Simulação Quantitativa",
          desc: "Monte Carlo & Projeção de Cenários",
          icon: Award,
          badge: "Motor"
        },
        {
          id: "DATA_ENGINE",
          label: "Maestro Data Engine",
          desc: "Catálogo B3 & Backtester",
          icon: Database,
          badge: "Full Data"
        },
        {
          id: "TRADED_ASSETS",
          label: "Relatório de Ativos",
          desc: "Carta do Gestor CVM 175 (8 pág)",
          icon: Sparkles,
          badge: "Execuções"
        },
        {
          id: "AGRO_MONITOR",
          label: "Monitor SAF & Olho da Harpia",
          desc: "Sensoriamento Satélite & Bioeconomia",
          icon: Trees,
          badge: "SAF & Olho"
        }
      ]
    }
  ];

  // Get active item details for top bar display
  const currentNav = navGroups.flatMap(g => g.items).find(item => item.id === activeTab);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col lg:flex-row font-sans selection:bg-slate-900 selection:text-white" id="quantledger-app-root">
      
      {/* ── MOBILE HEADER BAR (Toggles Sidebar on Mobile) ────────────────────── */}
      <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between text-white shrink-0 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-amber-400/60 shadow-md shrink-0 bg-slate-950">
            <img 
              src={harpiaLogo} 
              alt="Harpia Finance Asset" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-white font-sans">
              HARPIA FINANCE ASSET
            </h1>
            <p className="text-[10px] text-amber-400 font-bold font-mono uppercase tracking-wider">Hedge Fund Quantitativo</p>
          </div>
        </div>

        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          aria-label="Alternar Menu Lateral"
        >
          {mobileMenuOpen ? <X className="w-6 h-6 text-amber-400" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* ── LATERAL SIDEBAR NAVIGATION MENU ─────────────────────────────────── */}
      <aside 
        className={`fixed lg:sticky top-0 left-0 h-screen w-80 bg-slate-900 border-r border-slate-800 text-slate-100 flex flex-col z-50 transition-transform duration-300 shadow-2xl shrink-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        id="app-sidebar"
      >
        {/* BRAND HEADER SECTION - ENHANCED LOGO & LARGER TYPOGRAPHY */}
        <div className="p-6 border-b border-slate-800/80 bg-slate-950/60 flex flex-col items-start gap-4">
          <div className="flex items-center gap-4 w-full">
            {/* Enlarged Logo Badge */}
            <div className="w-16 h-16 rounded-2xl border-2 border-amber-400/70 shadow-xl overflow-hidden bg-slate-950 shrink-0 group transition-all duration-300 hover:scale-105 hover:border-amber-300">
              <img 
                src={harpiaLogo} 
                alt="Harpia Finance Asset Logo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  v3.5 Live
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Sistema Conectado ao Vivo" />
              </div>
              
              {/* Larger Brand Title */}
              <h1 className="text-xl font-black tracking-tight text-white font-sans leading-none drop-shadow-sm">
                HARPIA FINANCE
              </h1>
              <p className="text-xs font-extrabold text-amber-400 tracking-wider uppercase mt-1 font-sans">
                ASSET MANAGEMENT
              </p>
            </div>
          </div>

          <div className="w-full pt-1 border-t border-slate-800/50">
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
              Hedge Fund Quantitativo de Alta Performance &amp; Inteligência Artificial B3
            </p>
          </div>
        </div>

        {/* INTERACTIVE NAVIGATION MENU LIST */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800" id="sidebar-navigation">
          {navGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-2">
              <div className="px-3 flex items-center justify-between text-[10px] font-extrabold tracking-widest text-slate-400 uppercase font-mono">
                <span>{group.title}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
              </div>

              <div className="space-y-1">
                {group.items.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      id={`nav-btn-${item.id.toLowerCase()}`}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full group relative text-left transition-all duration-200 cursor-pointer rounded-xl ${
                        isActive
                          ? "bg-slate-800/90 text-white font-bold shadow-md border-l-4 border-amber-400 pl-3.5 pr-3 py-3"
                          : "text-slate-300 hover:text-white hover:bg-slate-800/50 font-medium pl-4 pr-3 py-2.5"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                            isActive ? "text-amber-400" : "text-slate-400 group-hover:text-slate-200"
                          }`} />
                          
                          <div className="truncate">
                            <span className={`block text-xs font-sans tracking-tight ${
                              isActive ? "text-white font-extrabold" : "text-slate-200"
                            }`}>
                              {item.label}
                            </span>
                            <span className="block text-[10px] text-slate-400 font-normal truncate">
                              {item.desc}
                            </span>
                          </div>
                        </div>

                        {/* Interactive Badge Indicator */}
                        <div className="flex items-center gap-1 shrink-0">
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                            isActive 
                              ? "bg-amber-400/20 text-amber-300 border border-amber-400/30" 
                              : "bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-200"
                          }`}>
                            {item.badge}
                          </span>
                          <ChevronRight className={`w-3 h-3 transition-transform ${
                            isActive ? "text-amber-400 translate-x-0.5" : "text-slate-600 opacity-0 group-hover:opacity-100"
                          }`} />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* SIDEBAR FOOTER: SYSTEM & AUM SUMMARY */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 font-mono text-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-[10px]">
            <span>AUM SOB GESTÃO</span>
            <span className="text-emerald-400 font-bold">R$ {(liveNav / 1000000).toFixed(1)}M</span>
          </div>
          <div className="flex items-center justify-between text-slate-400 text-[10px]">
            <span>REGIME</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> BULL_LOW_VOL
            </span>
          </div>
          <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> CVM 175 Compliant
            </span>
            <span className="text-slate-400">WAL SQLite</span>
          </div>
        </div>
      </aside>

      {/* Backdrop overlay for mobile menu */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden animate-fadeIn"
        />
      )}

      {/* ── RIGHT MAIN CONTENT VIEWPORT ───────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* TOP BAR / LIVE INDICATORS HEADER */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0 shadow-xs" id="app-topbar">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
              <span className="text-slate-400 font-bold uppercase tracking-wider">Harpia Asset</span>
              <span>/</span>
              <span className="text-amber-700 font-bold bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded text-[11px]">
                {currentNav?.label}
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              {currentNav?.label}
            </h2>
          </div>

          {/* Live Status Indicators */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono" id="live-indicators">
            {/* AUM */}
            <div className="text-right bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-lg">
              <span className="text-slate-400 text-[10px] block">AUM Sob Gestão (Tempo Real)</span>
              <span className="text-slate-800 font-bold">R$ {liveNav.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>

            {/* Regime */}
            <div className="text-right bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-lg">
              <span className="text-slate-400 text-[10px] block">Regime de Mercado</span>
              <span className="text-emerald-600 font-bold flex items-center justify-end gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                BULL_LOW_VOL
              </span>
            </div>

            {/* Engine Status */}
            <div className="text-right bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-lg hidden sm:block">
              <span className="text-slate-400 text-[10px] block">Digital Twin &amp; Ativos</span>
              <span className="text-emerald-600 font-bold flex items-center justify-end gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Conectado ao Vivo ({assets.length} Ativos)
              </span>
            </div>
          </div>
        </header>

        {/* MAIN PANEL CONTENT DISPLAY */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col space-y-6" id="main-content-display">
          {activeTab === "OVERVIEW" && (
            <OverviewPanel metrics={metrics} historyData={historyData} assets={assets} />
          )}

          {activeTab === "MANAGER_REPORT" && (
            <ManagerExecutiveReport onNavigateToTab={(tab) => setActiveTab(tab as any)} />
          )}

          {activeTab === "MONTHLY_REPORT" && (
            <DetailedMonthlyReport onNavigateToTab={(t) => setActiveTab(t as any)} />
          )}

          {activeTab === "OPTIMIZATION" && (
            <OptimizationPanel assets={assets} onUpdateAssetScores={handleUpdateAssetScores} />
          )}

          {activeTab === "ATTRIBUTION" && (
            <AttributionPanel />
          )}

          {activeTab === "WAR_GAMES" && (
            <WarGamesPanel assets={assets} />
          )}

          {activeTab === "TWIN" && (
            <DigitalTwinPanel assets={assets} />
          )}

          {activeTab === "RISK" && (
            <RiskPanel assets={assets} />
          )}

          {activeTab === "DATA_ENGINE" && (
            <DataManagerPanel />
          )}

          {activeTab === "NEWS" && (
            <NewsPanel />
          )}

          {activeTab === "SIMULATION" && (
            <SimulationPanel assets={assets} liveNav={liveNav} />
          )}

          {activeTab === "TRADED_ASSETS" && (
            <TradedAssetsReport assets={assets} onNavigateToTab={(tab) => setActiveTab(tab as any)} />
          )}

          {activeTab === "AGRO_MONITOR" && (
            <AgroIntelligenceMonitor />
          )}
        </main>

        {/* INSTITUTIONAL FOOTER */}
        <footer className="bg-slate-900 border-t border-slate-800 px-6 py-4 text-[10px] text-slate-400 font-sans mt-auto" id="app-footer">
          <div className="max-w-7xl w-full mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-amber-400" />
              <span>Shadow Ledger Audit: <strong className="text-white">COMPLIANT</strong> (WAL SQLite Cache-First Log)</span>
            </div>
            <div className="text-center md:text-right text-slate-400">
              <span>Harpia Finance Asset Corp. Propostas e dados simulados para homologação de infraestrutura quantitativa CVM 175. © 2026.</span>
            </div>
          </div>
        </footer>

      </div>

    </div>
  );
}
