/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Componente Mestre: Relatório Institucional do Gestor (CVM 175 & ANBIMA)
 * Harpia Finance Asset Management - Fundo QuantLedger Multimercado FIM
 * Horizonte de Dados: 2026 em diante + Séries Históricas (2024-2025) e Projeções (2026-2027)
 */

import React, { useState, useMemo } from "react";
import {
  FileText,
  FileDown,
  Download,
  Share2,
  TrendingUp,
  TrendingDown,
  Shield,
  ShieldCheck,
  Globe,
  DollarSign,
  Activity,
  Layers,
  Sparkles,
  ChevronRight,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Award,
  BarChart3,
  Calendar,
  Building2,
  ArrowUpRight,
  Scale,
  Cpu,
  Target,
  ExternalLink,
  BookOpen,
  PieChart,
  RefreshCw,
  Copy,
  Check
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area
} from "recharts";
import jsPDF from "jspdf";
import harpiaLogo from "../assets/images/harpia_logo_1786511025650.jpg";
import VerdeExecutiveReportPDF from "./VerdeExecutiveReportPDF";
import {
  FUND_IDENTIFICATION,
  MASTER_FUND_INDICATORS,
  MACRO_SCENARIO_DATA,
  RISK_LIMITS_COMPLIANCE,
  EXECUTED_TRADES_BOOK,
  INVESTMENT_THESES_DATA,
  FULL_HISTORICAL_MASTER_DATA,
  ExecutedTradeRecord,
  InvestmentThesisDetail
} from "../data/managerReportData";

interface ManagerExecutiveReportProps {
  onNavigateToTab?: (tabId: string) => void;
}

export default function ManagerExecutiveReport({ onNavigateToTab }: ManagerExecutiveReportProps) {
  // State for active report tab
  const [activeSection, setActiveSection] = useState<"OVERVIEW" | "MACRO" | "RISK" | "TRADES" | "THESES" | "HISTORICAL" | "VERDE_DOSSIE">("OVERVIEW");
  
  // State for search and filters
  const [tradeSearchTerm, setTradeSearchTerm] = useState("");
  const [tradeTypeFilter, setTradeTypeFilter] = useState("ALL");
  const [thesisFilterSector, setThesisFilterSector] = useState("ALL");
  const [selectedThesis, setSelectedThesis] = useState<InvestmentThesisDetail>(INVESTMENT_THESES_DATA[0]);
  
  // Copy notification state
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // Formatter helpers
  const formatBrl = (val: number) => `R$ ${val.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatQuota = (val: number) => val.toLocaleString("pt-BR", { minimumFractionDigits: 6, maximumFractionDigits: 6 });

  // Filtered trades
  const filteredTrades = useMemo(() => {
    return EXECUTED_TRADES_BOOK.filter(trade => {
      const matchesSearch = 
        trade.ticker.toLowerCase().includes(tradeSearchTerm.toLowerCase()) ||
        trade.assetName.toLowerCase().includes(tradeSearchTerm.toLowerCase()) ||
        trade.tradeId.toLowerCase().includes(tradeSearchTerm.toLowerCase()) ||
        trade.rationale.toLowerCase().includes(tradeSearchTerm.toLowerCase());
      
      const matchesType = tradeTypeFilter === "ALL" || trade.orderType === tradeTypeFilter;
      return matchesSearch && matchesType;
    });
  }, [tradeSearchTerm, tradeTypeFilter]);

  // Filtered theses
  const filteredTheses = useMemo(() => {
    if (thesisFilterSector === "ALL") return INVESTMENT_THESES_DATA;
    return INVESTMENT_THESES_DATA.filter(t => t.sector.toLowerCase().includes(thesisFilterSector.toLowerCase()));
  }, [thesisFilterSector]);

  // Export Planilha CSV
  const handleExportCSV = () => {
    let csv = "DATA;PERIODO;NAV_PATRIMONIO_LIQUIDO;COTA;RETORNO_FUNDO_PCT;CDI_PCT;IBOV_PCT;IPCA_PCT;ALFA_CDI_BPS;STATUS\n";
    FULL_HISTORICAL_MASTER_DATA.forEach(row => {
      csv += `${row.period};${row.period};${row.fundNavBrl};${row.quotaValue};${row.fundReturnPct}%;${row.cdiReturnPct}%;${row.ibovReturnPct}%;${row.ipcaPct}%;${row.alphaCdiBps};${row.status}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Harpia_QuantLedger_Planilha_Mestra_2026_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy Executive Summary
  const handleCopySummary = () => {
    const summaryText = `📑 RELATÓRIO DO GESTOR — HARPIA QUANTLEDGER FIM CP (CVM 175)
Data de Referência: 13/08/2026 | Gestão: Harpia Finance Asset Management
Patrimônio Líquido: R$ 171.698.335,00 | Cota Atual: 1,716983

📊 PERFORMANCE CONSOLIDADA:
- Rentabilidade 2026 (YTD): +11,52% (vs CDI +5,48% | Alfa +604 bps)
- Rentabilidade 2025: +25,58% (vs CDI +11,30% | Alfa +1.428 bps)
- Rentabilidade 2024: +22,61% (vs CDI +10,65% | Alfa +1.196 bps)
- Acumulado (32 Meses): +71,70% (vs CDI +30,73% | Excesso: +40,97%)
- Sharpe Ratio (12M): 1,82 | Sortino: 2,34 | Calmar: 2,28 | Volatilidade: 8,40% a.a.
- Máximo Drawdown Histórico: -4,85% (Recuperação em 28 dias)

🌐 VISÃO MACRO 2026+:
- Selic em convergência para 9,75% a.a. com inflação IPCA ancorada em 3,75%.
- Fed Funds rate em afrouxamento monetário sustentando influxo de capital estrangeiro.
- Carregamento de NTN-B 2030 em IPCA + 6,25% e alocação core em PETR4, VALE3, ITUB4 e WEGE3.

🛡️ GOVERNANÇA & CVM 175:
- Concentração por emissor: 12,8% (Limite Máx: 20%) — 100% Conforme.
- Alavancagem Bruta: 108,5% (Limite Máx: 150%) — 100% Conforme.
- Liquidez Imediata (D+0/D+1): 15,2% em LFT/Caixa — 100% Conforme.`;

    navigator.clipboard.writeText(summaryText);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 3000);
  };

  // Export High-Fidelity PDF Institucional Timbrado
  const handleExportPDF = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    const primaryColor = [15, 23, 42]; // #0f172a
    const accentColor = [16, 185, 129]; // #10b981
    const grayColor = [100, 116, 139]; // #64748b

    // Header bar
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 16, "F");
    doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.rect(0, 16, 210, 2.5, "F");

    // Title
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("HARPIA FINANCE ASSET MANAGEMENT", 20, 36);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text("RELATÓRIO INSTITUCIONAL DO GESTOR — CVM 175 / ANBIMA", 20, 42);
    doc.text(`Data Base: 13/08/2026 | Fundo: Harpia QuantLedger Multimercado FIM CP | CNPJ: 54.128.904/0001-82`, 20, 48);

    doc.setDrawColor(226, 232, 240);
    doc.line(20, 52, 190, 52);

    // Box de Resumo Executivo
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(20, 56, 170, 42, 3, 3, "F");
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("1. DESTAQUES EXECUTIVOS & PATRIMÔNIO LÍQUIDO", 25, 64);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text(`• Patrimônio Líquido (PL): R$ 171.698.335,00 (Evolução de +71.70% desde o início em Jan/2024)`, 25, 71);
    doc.text(`• Cota Atual: R$ 1,716983 | Valor Inicial da Cota: R$ 1,000000 | Benchmark: 100% CDI`, 25, 77);
    doc.text(`• Rentabilidade 2026 (YTD): +11.52% (vs CDI +5.48% | Alfa Gerado: +604 bps)`, 25, 83);
    doc.text(`• Índice Sharpe (12M): 1.82 | Sortino: 2.34 | Calmar: 2.28 | Volatilidade Anualizada: 8.40% a.a.`, 25, 89);

    // Tabela de Indicadores
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("2. INDICADORES DE PERFORMANCE & RISCO QUANTITATIVO", 20, 108);

    let yPos = 116;
    doc.setFillColor(15, 23, 42);
    doc.rect(20, yPos - 5, 170, 7, "F");
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text("MÉTRICA / INDICADOR", 25, yPos);
    doc.text("FUNDO HARPIA", 95, yPos);
    doc.text("BENCHMARK (CDI)", 135, yPos);
    doc.text("EXCESSO / ALFA", 168, yPos);

    yPos += 7;
    doc.setFont("Helvetica", "normal");
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);

    MASTER_FUND_INDICATORS.slice(0, 10).forEach((ind, i) => {
      if (i % 2 === 0) {
        doc.setFillColor(241, 245, 249);
        doc.rect(20, yPos - 4.5, 170, 6, "F");
      }
      doc.text(ind.metric, 25, yPos);
      doc.text(ind.fundValue, 95, yPos);
      doc.text(ind.benchmarkValue, 135, yPos);
      doc.text(ind.excess, 168, yPos);
      yPos += 6;
    });

    // Enquadramento CVM 175
    yPos += 8;
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.text("3. GOVERNANÇA FIDUCIÁRIA & ENQUADRAMENTO CVM 175", 20, yPos);
    yPos += 7;

    RISK_LIMITS_COMPLIANCE.slice(0, 4).forEach(lim => {
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(`• ${lim.parameter}:`, 25, yPos);
      doc.setFont("Helvetica", "normal");
      doc.text(`Exposição Atual: ${lim.currentExposure} (Limite CVM 175: ${lim.regulatoryLimitCVM175}) — Status: [${lim.status}]`, 68, yPos);
      yPos += 5.5;
    });

    // Assinaturas de Gestão
    yPos = 245;
    doc.setDrawColor(203, 213, 225);
    doc.line(25, yPos, 90, yPos);
    doc.line(120, yPos, 185, yPos);

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("Harpia Finance Asset Management", 25, yPos + 4);
    doc.text("Comitê de Risco & Compliance CVM 175", 120, yPos + 4);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text("Gestor de Recursos Autorizado CVM", 25, yPos + 8);
    doc.text("Auditoria e Verificação Independente", 120, yPos + 8);

    // Footer
    doc.setFontSize(7);
    doc.text("Documento gerado automaticamente pelo Sistema de Inteligência Quântica Harpia AI — 13/08/2026", 20, 285);
    doc.text("Página 1 de 1", 175, 285);

    doc.save(`Relatorio_do_Gestor_Harpia_2026_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="space-y-6" id="manager-executive-report-module">
      
      {/* ── 1. INSTITUTIONAL HEADER & BADGES ────────────────────────────────────────── */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-emerald-400/60 shadow-lg bg-slate-950 shrink-0">
              <img
                src={harpiaLogo}
                alt="Harpia Asset Management"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  CVM 175 / ANBIMA
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  CNPJ: {FUND_IDENTIFICATION.cnpj}
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Ano Corrente: 2026
                </span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
                Relatório Institucional do Gestor
                <Sparkles className="w-5 h-5 text-emerald-400" />
              </h1>
              <p className="text-slate-400 text-xs lg:text-sm mt-1 max-w-2xl">
                {FUND_IDENTIFICATION.fundName} • Estratégia Macro Quantitativa Sistemática com Inteligência Artificial, Black-Litterman e Carrego Soberano.
              </p>
            </div>
          </div>

          {/* Quick Action Export Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            <button
              onClick={handleCopySummary}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              title="Copiar Sumário Executivo Formatado"
            >
              {copiedSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
              <span>{copiedSuccess ? "Copiado!" : "Copiar Sumário"}</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              title="Exportar Planilha Completa de Séries e Indicadores (.CSV)"
            >
              <Download className="w-4 h-4 text-blue-400" />
              <span>Exportar Planilha (.CSV)</span>
            </button>

            <button
              onClick={handleExportPDF}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md hover:shadow-emerald-900/30 cursor-pointer"
              title="Baixar Relatório Timbrado do Gestor em PDF (A4)"
            >
              <FileDown className="w-4 h-4 text-white" />
              <span>Baixar Relatório (PDF)</span>
            </button>
          </div>
        </div>

        {/* Top KPI Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">Patrimônio Líquido</span>
            <div className="text-base lg:text-lg font-bold text-white font-mono mt-0.5">
              R$ 171,70M
            </div>
            <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-0.5 mt-0.5">
              <TrendingUp className="w-3 h-3" /> +71,70% desde Jan/24
            </span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">Cota Atual</span>
            <div className="text-base lg:text-lg font-bold text-white font-mono mt-0.5">
              R$ 1,716983
            </div>
            <span className="text-[10px] text-slate-400">Base 1,000000</span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">Rentab. 2026 (YTD)</span>
            <div className="text-base lg:text-lg font-bold text-emerald-400 font-mono mt-0.5">
              +11,52%
            </div>
            <span className="text-[10px] text-emerald-300 font-mono">Alfa: +604 bps vs CDI</span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">Índice Sharpe (12M)</span>
            <div className="text-base lg:text-lg font-bold text-amber-300 font-mono mt-0.5">
              1.82
            </div>
            <span className="text-[10px] text-slate-400">Sortino: 2.34</span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">Volatilidade (12M)</span>
            <div className="text-base lg:text-lg font-bold text-blue-300 font-mono mt-0.5">
              8,40% a.a.
            </div>
            <span className="text-[10px] text-slate-400">Beta: 0.42</span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">Max Drawdown</span>
            <div className="text-base lg:text-lg font-bold text-rose-400 font-mono mt-0.5">
              -4,85%
            </div>
            <span className="text-[10px] text-emerald-400 font-medium">Recuperado em 28d</span>
          </div>
        </div>
      </div>

      {/* ── 2. SECTION NAVIGATION TABS ────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-sm flex flex-wrap items-center gap-1.5">
        <button
          onClick={() => setActiveSection("OVERVIEW")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeSection === "OVERVIEW"
              ? "bg-slate-900 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>1. Indicadores & Planilha Mestra</span>
        </button>

        <button
          onClick={() => setActiveSection("MACRO")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeSection === "MACRO"
              ? "bg-slate-900 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>2. Visão Macro (2026+)</span>
        </button>

        <button
          onClick={() => setActiveSection("RISK")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeSection === "RISK"
              ? "bg-slate-900 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>3. Riscos & CVM 175</span>
        </button>

        <button
          onClick={() => setActiveSection("TRADES")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeSection === "TRADES"
              ? "bg-slate-900 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>4. Livro de Operações (Trades)</span>
        </button>

        <button
          onClick={() => setActiveSection("THESES")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeSection === "THESES"
              ? "bg-slate-900 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <Target className="w-4 h-4" />
          <span>5. Teses por Ativo (2026+)</span>
        </button>

        <button
          onClick={() => setActiveSection("HISTORICAL")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeSection === "HISTORICAL"
              ? "bg-slate-900 text-white shadow-md"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>6. Séries Históricas & Projeções</span>
        </button>

        <button
          onClick={() => setActiveSection("VERDE_DOSSIE")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeSection === "VERDE_DOSSIE"
              ? "bg-slate-900 text-white shadow-md font-extrabold"
              : "text-slate-800 bg-amber-50/70 border border-amber-200/80 hover:bg-amber-100/80"
          }`}
        >
          <Award className="w-4 h-4 text-amber-500" />
          <span>7. Relatório Oficial de Gestão (PDF / CVM 175)</span>
        </button>
      </div>

      {/* ── SECTION 1: OVERVIEW & MASTER INDICATORS ─────────────────────────────────── */}
      {activeSection === "OVERVIEW" && (
        <div className="space-y-6">
          {/* Performance Chart vs Benchmark */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  Evolução do Patrimônio Líquido e Rentabilidade Comparada (2024 — 2026)
                </h3>
                <p className="text-xs text-slate-500">
                  Desempenho histórico do Fundo Harpia QuantLedger vs 100% CDI e Ibovespa (Valores em R$ Milhões)
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
                Alfa Acumulado: +4.097 bps
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={FULL_HISTORICAL_MASTER_DATA.filter(d => !d.status.includes("PROJETADO"))}>
                  <defs>
                    <linearGradient id="fundGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="cdiGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="period" stroke="#94a3b8" fontSize={11} />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    domain={[95000000, 185000000]}
                    tickFormatter={(v) => `R$ ${(v / 1000000).toFixed(0)}M`}
                  />
                  <Tooltip
                    formatter={(value: any, name: any) => [
                      formatBrl(Number(value)),
                      name === "fundNavBrl" ? "Fundo Harpia (PL)" : "Referência"
                    ]}
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "10px", color: "#f8fafc" }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="fundNavBrl"
                    name="Patrimônio Líquido Fundo (R$)"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#fundGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Indicators Table Grid */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Quadro de Indicadores Institucionais & Risco Quântico
                </h3>
                <p className="text-xs text-slate-500">
                  Tabela consolidada com todas as métricas exigidas por alocadores institucionais e regulamento CVM 175
                </p>
              </div>
              <button
                onClick={handleExportCSV}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer self-start"
              >
                <Download className="w-3.5 h-3.5" />
                Baixar Planilha
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 uppercase font-bold tracking-wider text-[10px] border-y border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Indicador / Métrica</th>
                    <th className="py-3 px-4">Categoria</th>
                    <th className="py-3 px-4 text-right">Fundo Harpia</th>
                    <th className="py-3 px-4 text-right">Benchmark (CDI)</th>
                    <th className="py-3 px-4 text-right">Excesso / Alfa</th>
                    <th className="py-3 px-4">Descrição e Metodologia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {MASTER_FUND_INDICATORS.map((ind, i) => (
                    <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-sans font-semibold text-slate-900">
                        {ind.metric}
                      </td>
                      <td className="py-3 px-4 font-sans">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ind.category === "PERFORMANCE" ? "bg-emerald-50 text-emerald-700" :
                          ind.category === "RISK" ? "bg-rose-50 text-rose-700" : "bg-blue-50 text-blue-700"
                        }`}>
                          {ind.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        {ind.fundValue}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-500">
                        {ind.benchmarkValue}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-700">
                        {ind.excess}
                      </td>
                      <td className="py-3 px-4 font-sans text-slate-600 text-[11px]">
                        {ind.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── SECTION 2: MACROECONOMIC SCENARIO ──────────────────────────────────────── */}
      {activeSection === "MACRO" && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <Globe className="w-6 h-6 text-blue-400" />
              <h3 className="text-xl font-bold text-white">
                Cenário Macroeconômico Consolidado (2026 em diante & Histórico)
              </h3>
            </div>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-3xl">
              Análise dos fatores macroeconômicos globais e domésticos que orientam a calibração de pesos no modelo <strong>Black-Litterman</strong> e nos algoritmos de <strong>Hierarchical Risk Parity (HRP)</strong> do Fundo Harpia.
            </p>
          </div>

          {/* Macro Data Table */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h4 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-600" />
              Projeções Macroeconômicas Estruturadas (2024 — 2027)
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 uppercase font-bold tracking-wider text-[10px] border-y border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Indicador Macro</th>
                    <th className="py-3 px-3 text-center">2024 (Realizado)</th>
                    <th className="py-3 px-3 text-center">2025 (Realizado)</th>
                    <th className="py-3 px-3 text-center bg-blue-50/60 text-blue-900">2026 (Atual)</th>
                    <th className="py-3 px-3 text-center">2027 (Projetado)</th>
                    <th className="py-3 px-4">Impacto Macroeconômico</th>
                    <th className="py-3 px-4">Estratégia do Fundo Harpia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {MACRO_SCENARIO_DATA.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {row.indicator}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-slate-600">
                        {row.year2024}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-slate-600">
                        {row.year2025}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-blue-700 bg-blue-50/40">
                        {row.year2026Current}
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-slate-500">
                        {row.year2027Proj}
                      </td>
                      <td className="py-3 px-4 text-slate-700 text-[11px] leading-relaxed">
                        {row.macroImpact}
                      </td>
                      <td className="py-3 px-4 text-slate-900 font-medium text-[11px] leading-relaxed bg-emerald-50/30">
                        {row.fundStrategy}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── SECTION 3: RISK GOVERNANCE & CVM 175 ──────────────────────────────────── */}
      {activeSection === "RISK" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase">VaR Paramétrico (95% - 21D)</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono">-3.85%</div>
              <p className="text-[11px] text-slate-500 mt-1">Limite Máximo Interno: -5.00% (Margem de +1.15%)</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase">Conditional VaR (CVaR 95%)</span>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono">-1.25%</div>
              <p className="text-[11px] text-slate-500 mt-1">Perda esperada nos 5% piores cenários de cauda</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-semibold uppercase">Liquidez Imediata (D+0 / D+1)</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-700 font-mono">15.20%</div>
              <p className="text-[11px] text-slate-500 mt-1">Colchão de R$ 26,09M em LFT & Caixa Selic</p>
            </div>
          </div>

          {/* Compliance Limits Table */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h4 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-600" />
              Enquadramento Regulatório & Limites Fiduciários CVM 175
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 uppercase font-bold tracking-wider text-[10px] border-y border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Parâmetro de Risco</th>
                    <th className="py-3 px-4">Limite CVM 175</th>
                    <th className="py-3 px-4">Limite Interno Harpia</th>
                    <th className="py-3 px-4">Exposição Atual</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4">Observação de Compliance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {RISK_LIMITS_COMPLIANCE.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {row.parameter}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {row.regulatoryLimitCVM175}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {row.fundInternalLimit}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {row.currentExposure}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {row.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-[11px]">
                        {row.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Parecer do Comitê */}
            <div className="mt-6 bg-slate-50 border border-slate-200 rounded-xl p-4">
              <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Parecer do Comitê de Risco & Compliance (13/08/2026)
              </h5>
              <p className="text-xs text-slate-700 leading-relaxed">
                “O Comitê de Risco avaliou a aderência dos modelos quantitativos e atesta que o Fundo Harpia QuantLedger FIM CP encontra-se <strong>100% enquadrado em todos os limites estabelecidos pela Resolução CVM 175</strong> e pelo Código ANBIMA de Administração de Recursos de Terceiros. Os testes de estresse de choque fiscal (+200 bps nos juros e desvalorização cambial de 15%) demonstram plena capacidade de absorção de perdas sem comprometimento do capital fiduciário.”
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── SECTION 4: EXECUTED TRADES BOOK ───────────────────────────────────────── */}
      {activeSection === "TRADES" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Livro Razão de Operações & Execuções B3 (2024 — 2026)
                </h3>
                <p className="text-xs text-slate-500">
                  Registro detalhado de ordens executadas, slippage, contrapartes e P&L gerado
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar por ticker, corretora ou tese..."
                    value={tradeSearchTerm}
                    onChange={(e) => setTradeSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 w-64"
                  />
                </div>

                <select
                  value={tradeTypeFilter}
                  onChange={(e) => setTradeTypeFilter(e.target.value)}
                  className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none cursor-pointer"
                >
                  <option value="ALL">Todos os Tipos de Ordem</option>
                  <option value="COMPRA">Apenas Compras</option>
                  <option value="VENDA">Apenas Vendas</option>
                  <option value="HEDGE">Apenas Hedge</option>
                  <option value="REBALANCEAMENTO">Rebalanceamento</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 uppercase font-bold tracking-wider text-[10px] border-y border-slate-200">
                  <tr>
                    <th className="py-3 px-4">ID / Data</th>
                    <th className="py-3 px-4">Ativo / Ticker</th>
                    <th className="py-3 px-4">Tipo de Ordem</th>
                    <th className="py-3 px-4 text-right">Qtd</th>
                    <th className="py-3 px-4 text-right">Preço Médio</th>
                    <th className="py-3 px-4 text-right">Volume Total</th>
                    <th className="py-3 px-4">Corretora B3</th>
                    <th className="py-3 px-4 text-right">Slippage</th>
                    <th className="py-3 px-4 text-right">P&L Gerado</th>
                    <th className="py-3 px-4">Racional da Operação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {filteredTrades.map((t) => (
                    <tr key={t.tradeId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{t.tradeId}</span>
                        <span className="text-[10px] text-slate-500 font-sans">{t.date}</span>
                      </td>
                      <td className="py-3 px-4">
                        <strong className="text-slate-900">{t.ticker}</strong>
                        <span className="text-[10px] text-slate-500 block font-sans">{t.assetName}</span>
                      </td>
                      <td className="py-3 px-4 font-sans">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.orderType === "COMPRA" ? "bg-emerald-100 text-emerald-800" :
                          t.orderType === "HEDGE" ? "bg-purple-100 text-purple-800" :
                          t.orderType === "REBALANCEAMENTO" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"
                        }`}>
                          {t.orderType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-800">
                        {t.quantity.toLocaleString("pt-BR")}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-800">
                        {formatBrl(t.price)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        {formatBrl(t.totalVolume)}
                      </td>
                      <td className="py-3 px-4 font-sans text-slate-600 text-[11px]">
                        {t.brokerB3}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-500">
                        {t.slippageBps} bps
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-700">
                        {t.pnlGenerated}
                      </td>
                      <td className="py-3 px-4 font-sans text-slate-600 text-[11px] max-w-xs">
                        {t.rationale}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── SECTION 5: INVESTMENT THESES (2026+) ──────────────────────────────────── */}
      {activeSection === "THESES" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: List of Theses */}
            <div className="lg:col-span-1 space-y-2.5">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Teses de Investimento ({INVESTMENT_THESES_DATA.length})</span>
                  <Target className="w-4 h-4 text-emerald-600" />
                </h4>
                <p className="text-[11px] text-slate-500 mb-3">
                  Selecione um ativo para inspecionar os múltiplos, valuation e horizonte 2026+.
                </p>

                <div className="space-y-1.5 max-h-[520px] overflow-y-auto pr-1">
                  {filteredTheses.map((thesis) => (
                    <button
                      key={thesis.ticker}
                      onClick={() => setSelectedThesis(thesis)}
                      className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                        selectedThesis.ticker === thesis.ticker
                          ? "bg-slate-900 text-white border-slate-900 shadow-md"
                          : "bg-slate-50 hover:bg-slate-100 text-slate-900 border-slate-200"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <strong className="text-xs font-mono font-bold block">{thesis.ticker}</strong>
                          <span className={`text-[10px] ${selectedThesis.ticker === thesis.ticker ? "text-slate-300" : "text-slate-500"}`}>
                            {thesis.companyName}
                          </span>
                        </div>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          selectedThesis.ticker === thesis.ticker ? "bg-emerald-500 text-slate-950" : "bg-emerald-100 text-emerald-800"
                        }`}>
                          {thesis.weightInPortfolio}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[10px]">
                        <span className={selectedThesis.ticker === thesis.ticker ? "text-slate-400" : "text-slate-500"}>
                          Score BL: {thesis.blackLittermanScore}/100
                        </span>
                        <span className={`font-bold ${selectedThesis.ticker === thesis.ticker ? "text-emerald-400" : "text-emerald-700"}`}>
                          +{thesis.expectedAlphaBps} bps Alfa
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Detailed Active Thesis Card */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-extrabold text-slate-900 font-mono">{selectedThesis.ticker}</h3>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                        {selectedThesis.sector}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{selectedThesis.companyName}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase block">Peso na Carteira</span>
                      <span className="text-base font-bold text-slate-900 font-mono">{selectedThesis.weightInPortfolio}</span>
                    </div>
                    <div className="text-right bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                      <span className="text-[10px] text-emerald-700 uppercase block font-bold">Alfa Projetado</span>
                      <span className="text-base font-bold text-emerald-800 font-mono">+{selectedThesis.expectedAlphaBps} bps</span>
                    </div>
                  </div>
                </div>

                {/* Valuation Metrics Grid */}
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                    Múltiplos de Valuation & Eficiência Financeira
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                      <span className="text-[10px] text-slate-500 uppercase block">Preço / Lucro (P/L)</span>
                      <span className="text-base font-bold text-slate-900 font-mono mt-0.5">{selectedThesis.valuationMetrics.pe}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                      <span className="text-[10px] text-slate-500 uppercase block">EV / EBITDA</span>
                      <span className="text-base font-bold text-slate-900 font-mono mt-0.5">{selectedThesis.valuationMetrics.evEbitda}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                      <span className="text-[10px] text-slate-500 uppercase block">Dividend Yield</span>
                      <span className="text-base font-bold text-emerald-700 font-mono mt-0.5">{selectedThesis.valuationMetrics.divYield}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                      <span className="text-[10px] text-slate-500 uppercase block">ROE (Rentabilidade)</span>
                      <span className="text-base font-bold text-blue-700 font-mono mt-0.5">{selectedThesis.valuationMetrics.roe}</span>
                    </div>
                  </div>
                </div>

                {/* Horizon 2026+ Note */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider block mb-1">
                    🎯 Horizonte de Convicção (2026 em diante)
                  </span>
                  <p className="text-xs text-blue-950 font-medium leading-relaxed">
                    {selectedThesis.horizon2026Plus}
                  </p>
                </div>

                {/* Core Thesis Text */}
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                    Racional Quantitativo & Fundamentalista da Gestão
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                    {selectedThesis.coreThesisSummary}
                  </p>
                </div>

                {/* Macro Drivers */}
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                    Catalisadores e Gatilhos de Valor (Drivers)
                  </h4>
                  <ul className="space-y-2">
                    {selectedThesis.macroDrivers.map((driver, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{driver}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Risk & Hedge */}
                <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-3.5 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <strong className="text-amber-900">Monitoramento de Risco & Hedge Ativo: </strong>
                    <span className="text-amber-800">{selectedThesis.keyRisksAndHedges}</span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SECTION 6: HISTORICAL SERIES & PROJECTIONS ────────────────────────────── */}
      {activeSection === "HISTORICAL" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                  Série Histórica Consolidada Mês a Mês & Projeções (2024 — 2027)
                </h3>
                <p className="text-xs text-slate-500">
                  Histórico contábil auditado com desdobramento de cotas, rentabilidade vs CDI, Ibovespa e IPCA
                </p>
              </div>
              <button
                onClick={handleExportCSV}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer self-start"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                Exportar Série (.CSV)
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 uppercase font-bold tracking-wider text-[10px] border-y border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Mês / Exercício</th>
                    <th className="py-3 px-4 text-right">Patrimônio Líquido (PL)</th>
                    <th className="py-3 px-4 text-right">Valor da Cota</th>
                    <th className="py-3 px-4 text-right bg-emerald-50/50 text-emerald-950 font-bold">Retorno Fundo</th>
                    <th className="py-3 px-4 text-right">CDI</th>
                    <th className="py-3 px-4 text-right">Ibovespa</th>
                    <th className="py-3 px-4 text-right">IPCA</th>
                    <th className="py-3 px-4 text-right">Alfa (CDI)</th>
                    <th className="py-3 px-4 text-center">Auditoria / Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {FULL_HISTORICAL_MASTER_DATA.map((row) => (
                    <tr
                      key={row.period}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        row.status === "PROJETADO" ? "bg-amber-50/30 opacity-90" : ""
                      }`}
                    >
                      <td className="py-3 px-4 font-sans font-bold text-slate-900">
                        {row.period}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        {formatBrl(row.fundNavBrl)}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-700">
                        {formatQuota(row.quotaValue)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-700 bg-emerald-50/30">
                        {row.fundReturnPct >= 0 ? `+${row.fundReturnPct.toFixed(2)}%` : `${row.fundReturnPct.toFixed(2)}%`}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600">
                        +{row.cdiReturnPct.toFixed(2)}%
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600">
                        {row.ibovReturnPct >= 0 ? `+${row.ibovReturnPct.toFixed(2)}%` : `${row.ibovReturnPct.toFixed(2)}%`}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-500">
                        +{row.ipcaPct.toFixed(2)}%
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-800">
                        {row.alphaCdiBps >= 0 ? `+${row.alphaCdiBps} bps` : `${row.alphaCdiBps} bps`}
                      </td>
                      <td className="py-3 px-4 text-center font-sans">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          row.status === "FECHADO_AUDITADO" ? "bg-emerald-100 text-emerald-800" :
                          row.status === "EM_ANDAMENTO" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800 border border-amber-200"
                        }`}>
                          {row.status === "FECHADO_AUDITADO" ? "Auditado PwC" :
                           row.status === "EM_ANDAMENTO" ? "Em Aberto" : "Projeção AI"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── SECTION 7: DOSSIÊ INSTITUCIONAL ESTILO VERDE ASSET MANAGEMENT (CVM 175) ── */}
      {activeSection === "VERDE_DOSSIE" && (
        <div className="space-y-6 animate-fade-in" id="verde-dossie-section">
          <VerdeExecutiveReportPDF 
            initialFund="MULTIMERCADO"
            simulationMonth="2026-07"
            onNavigateToSimulation={() => onNavigateToTab ? onNavigateToTab("simulation") : undefined}
          />
        </div>
      )}

      {/* ── FOOTER DISCLOSURE ──────────────────────────────────────────────────────── */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-[11px] text-slate-500 leading-relaxed">
        <p>
          <strong>Aviso Legal & Regulatório (CVM 175):</strong> A rentabilidade passada não representa garantia de rentabilidade futura. Fundos de investimento não contam com garantia do administrador, do gestor, de qualquer mecanismo de seguro ou do Fundo Garantidor de Créditos (FGC). Leia a lâmina de informações essenciais e o regulamento antes de investir. Supervisão e Fiscalização: Comissão de Valores Mobiliários (CVM).
        </p>
      </div>

    </div>
  );
}
