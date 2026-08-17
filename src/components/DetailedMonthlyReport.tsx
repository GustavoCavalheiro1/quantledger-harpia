/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  FileText, 
  Download, 
  FileSpreadsheet, 
  Layers, 
  ChevronRight, 
  Award, 
  Search, 
  Sparkles, 
  ArrowUpRight, 
  CheckCircle2, 
  PieChart as PieChartIcon, 
  BarChart3, 
  Activity, 
  Clock, 
  FileCheck,
  ChevronDown,
  ChevronUp,
  Percent,
  SlidersHorizontal,
  ExternalLink
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from "recharts";
import jsPDF from "jspdf";
import { DETAILED_MONTHLY_RECORDS, DetailedMonthData, MonthAssetContribution } from "../data/monthlyData";
import harpiaLogo from "../assets/images/harpia_logo_1786511025650.jpg";

interface DetailedMonthlyReportProps {
  onNavigateToTab?: (tabId: string) => void;
}

export default function DetailedMonthlyReport({ onNavigateToTab }: DetailedMonthlyReportProps) {
  const [selectedYear, setSelectedYear] = useState<number | "ALL">(2024);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "FECHADO_AUDITADO" | "PROJETADO">("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [activeMonthKey, setActiveMonthKey] = useState<string>("2024-01");
  const [viewMode, setViewMode] = useState<"DOSSIER" | "MATRIX" | "LEDGER">("DOSSIER");
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [expandedWeeks, setExpandedWeeks] = useState<boolean>(true);

  const formatBrl = (val: number) => `R$ ${val.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatPercent = (val: number) => `${(val * 100).toFixed(2)}%`;

  // Filtered dataset
  const filteredMonths = useMemo(() => {
    return DETAILED_MONTHLY_RECORDS.filter(item => {
      const matchYear = selectedYear === "ALL" || item.year === selectedYear;
      const matchStatus = statusFilter === "ALL" || item.status === statusFilter;
      const matchSearch = searchTerm === "" || 
        item.monthName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.month.includes(searchTerm) ||
        item.assetContributions.some(a => a.ticker.toLowerCase().includes(searchTerm.toLowerCase()) || a.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        item.riskParecer.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchYear && matchStatus && matchSearch;
    });
  }, [selectedYear, statusFilter, searchTerm]);

  // Currently active selected month for deep dive
  const activeMonth = useMemo(() => {
    const found = DETAILED_MONTHLY_RECORDS.find(m => m.month === activeMonthKey);
    return found || filteredMonths[0] || DETAILED_MONTHLY_RECORDS[0];
  }, [activeMonthKey, filteredMonths]);

  // Synthetic 21-day intra-month simulation data for the active month
  const intraMonthData = useMemo(() => {
    if (!activeMonth) return [];
    const days = 21;
    const targetFund = activeMonth.fundReturn * 100;
    const targetCdi = activeMonth.cdiReturn * 100;
    const targetBench = activeMonth.benchReturn * 100;

    const data = [];
    for (let i = 1; i <= days; i++) {
      const progress = i / days;
      // realistic path with small daily noise
      const noise = (Math.sin(i * 1.5) * 0.15) * (1 - progress * 0.5);
      const fundDaily = parseFloat((progress * targetFund + (i < days ? noise : 0)).toFixed(2));
      const cdiDaily = parseFloat((progress * targetCdi).toFixed(2));
      const benchDaily = parseFloat((progress * targetBench + (i < days ? noise * 1.8 : 0)).toFixed(2));

      data.push({
        day: `D+${i}`,
        date: `${i.toString().padStart(2, '0')}/${activeMonth.month.split('-')[1]}`,
        fund: fundDaily,
        cdi: cdiDaily,
        bench: benchDaily
      });
    }
    return data;
  }, [activeMonth]);

  // Export Single Month Dossier to PDF
  const handleExportMonthPDF = () => {
    if (!activeMonth) return;
    setIsExporting(true);

    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const primary = [15, 23, 42]; // Slate 900
      const accent = [217, 119, 6]; // Amber 600
      const emerald = [16, 185, 129];
      const slate = [100, 116, 139];

      // Top banner
      doc.setFillColor(primary[0], primary[1], primary[2]);
      doc.rect(0, 0, 210, 18, "F");
      doc.setFillColor(accent[0], accent[1], accent[2]);
      doc.rect(0, 18, 210, 2, "F");

      // Brand Title
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text("HARPIA FINANCE ASSET MANAGEMENT", 14, 12);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(200, 200, 200);
      doc.text("RELATÓRIO MENSAL AUDITADO — CVM 175 / GESTÃO QUANTITATIVA", 14, 16);

      // Month Title & Status
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(primary[0], primary[1], primary[2]);
      doc.text(`Ficha Mensal: ${activeMonth.monthName.toUpperCase()}`, 14, 32);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(slate[0], slate[1], slate[2]);
      doc.text(`Status: ${activeMonth.status} | Regime: ${activeMonth.marketRegime} | Hash: ${activeMonth.auditHash}`, 14, 38);

      // KPI Boxes
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, 43, 42, 22, 2, 2, "FD");
      doc.roundedRect(60, 43, 42, 22, 2, 2, "FD");
      doc.roundedRect(106, 43, 42, 22, 2, 2, "FD");
      doc.roundedRect(152, 43, 44, 22, 2, 2, "FD");

      // Box 1: Retorno Fundo
      doc.setFontSize(7.5);
      doc.setTextColor(slate[0], slate[1], slate[2]);
      doc.text("RETORNO HARPIA", 17, 49);
      doc.setFontSize(14);
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(emerald[0], emerald[1], emerald[2]);
      doc.text(`+${formatPercent(activeMonth.fundReturn)}`, 17, 58);

      // Box 2: % do CDI
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(slate[0], slate[1], slate[2]);
      doc.text("% DO CDI", 63, 49);
      doc.setFontSize(14);
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(primary[0], primary[1], primary[2]);
      doc.text(`${activeMonth.cdiPercentage.toFixed(1)}%`, 63, 58);

      // Box 3: Alfa vs CDI
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(slate[0], slate[1], slate[2]);
      doc.text("ALFA GERADO", 109, 49);
      doc.setFontSize(14);
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(accent[0], accent[1], accent[2]);
      doc.text(`+${activeMonth.alphaBps} bps`, 109, 58);

      // Box 4: PL Líquido
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(slate[0], slate[1], slate[2]);
      doc.text("PL NO FECHAMENTO", 155, 49);
      doc.setFontSize(11);
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(primary[0], primary[1], primary[2]);
      doc.text(`R$ ${(activeMonth.endNav / 1000000).toFixed(2)}M`, 155, 58);

      // Section: Atribuição por Ativo
      doc.setFontSize(11);
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(primary[0], primary[1], primary[2]);
      doc.text("1. Desempenho e Atribuição dos Ativos Negociados", 14, 73);

      // Table Header
      let y = 78;
      doc.setFillColor(primary[0], primary[1], primary[2]);
      doc.rect(14, y, 182, 6, "F");
      doc.setFontSize(7.5);
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("TICKER / ATIVO", 17, y + 4.2);
      doc.text("SETOR", 60, y + 4.2);
      doc.text("PESO (%)", 105, y + 4.2);
      doc.text("RETORNO ATIVO", 130, y + 4.2);
      doc.text("CONTRIBUIÇÃO", 160, y + 4.2);

      y += 6;
      doc.setFont("Helvetica", "normal");
      activeMonth.assetContributions.forEach((asset, idx) => {
        if (idx % 2 === 0) {
          doc.setFillColor(248, 250, 252);
          doc.rect(14, y, 182, 6, "F");
        }
        doc.setFontSize(7.5);
        doc.setTextColor(primary[0], primary[1], primary[2]);
        doc.text(`${asset.ticker} (${asset.positionType})`, 17, y + 4.2);
        doc.text(asset.sector, 60, y + 4.2);
        doc.text(`${asset.weight.toFixed(1)}%`, 105, y + 4.2);
        
        doc.setTextColor(asset.assetReturn >= 0 ? emerald[0] : 225, asset.assetReturn >= 0 ? emerald[1] : 29, asset.assetReturn >= 0 ? emerald[2] : 72);
        doc.text(`${asset.assetReturn >= 0 ? '+' : ''}${asset.assetReturn.toFixed(2)}%`, 130, y + 4.2);

        doc.setTextColor(asset.contributionBps >= 0 ? emerald[0] : 225, asset.contributionBps >= 0 ? emerald[1] : 29, asset.contributionBps >= 0 ? emerald[2] : 72);
        doc.text(`${asset.contributionBps >= 0 ? '+' : ''}${asset.contributionBps} bps`, 160, y + 4.2);

        y += 6;
      });

      // Section: Cronograma Semanal
      y += 5;
      doc.setFontSize(11);
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(primary[0], primary[1], primary[2]);
      doc.text("2. Cronograma de Telemetrias & Execuções Semanais", 14, y);

      y += 5;
      activeMonth.weeks.forEach((w) => {
        doc.setFontSize(8);
        doc.setFont("Helvetica", "bold");
        doc.setTextColor(accent[0], accent[1], accent[2]);
        doc.text(`• ${w.week}: ${w.focus}`, 14, y);
        y += 4;
        doc.setFont("Helvetica", "normal");
        doc.setTextColor(slate[0], slate[1], slate[2]);
        const splitDesc = doc.splitTextToSize(`Ação: ${w.description} | Execução: ${w.tacticalAction}`, 180);
        doc.text(splitDesc, 18, y);
        y += splitDesc.length * 3.8 + 2;
      });

      // Section: Parecer Fiduciário do Comitê de Risco
      y += 4;
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, y, 182, 32, 2, 2, "FD");
      
      doc.setFontSize(9);
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(primary[0], primary[1], primary[2]);
      doc.text("3. Parecer Fiduciário do Comitê de Risco & Compliance CVM 175", 18, y + 6);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(slate[0], slate[1], slate[2]);
      const splitParecer = doc.splitTextToSize(activeMonth.riskParecer, 174);
      doc.text(splitParecer, 18, y + 12);

      doc.setFont("Helvetica", "bold");
      doc.text(`Auditor Responsável: ${activeMonth.complianceAuditor} | Status: ${activeMonth.complianceStatus}`, 18, y + 27);

      // Footer
      doc.setFontSize(7);
      doc.setFont("Helvetica", "normal");
      doc.setTextColor(160, 160, 160);
      doc.text(`Documento emitido eletronicamente pela Harpia Finance Asset em conformidade com CVM 175. Hash: ${activeMonth.auditHash}`, 14, 290);

      doc.save(`HARPIA_RELATORIO_MENSAL_${activeMonth.month}.pdf`);
    } catch (e) {
      console.error("PDF Export error:", e);
    } finally {
      setIsExporting(false);
    }
  };

  // Export Complete All-Months CSV
  const handleExportCSV = () => {
    const headers = [
      "Mes", "Nome_Mes", "Ano", "Status", "Regime_Mercado",
      "Retorno_Fundo_Pct", "Retorno_IBOV_Pct", "Retorno_CDI_Pct", "Pct_CDI", "Alfa_BPS",
      "PL_Inicial_BRL", "PL_Final_BRL", "Cota_Inicial", "Cota_Final",
      "Volatilidade_Anual_Pct", "Sharpe", "Sortino", "VaR_95_1D_Pct", "Max_Drawdown_Mes_Pct",
      "Parecer_Risco", "Hash_Auditoria"
    ];

    const rows = DETAILED_MONTHLY_RECORDS.map(m => [
      m.month,
      `"${m.monthName}"`,
      m.year,
      m.status,
      m.marketRegime,
      (m.fundReturn * 100).toFixed(2),
      (m.benchReturn * 100).toFixed(2),
      (m.cdiReturn * 100).toFixed(2),
      m.cdiPercentage.toFixed(2),
      m.alphaBps,
      m.startNav.toFixed(2),
      m.endNav.toFixed(2),
      m.startQuote.toFixed(6),
      m.endQuote.toFixed(6),
      m.annualizedVol.toFixed(2),
      m.sharpeRatio.toFixed(2),
      m.sortinoRatio.toFixed(2),
      m.var95_1d.toFixed(2),
      m.maxDrawdownMonth.toFixed(2),
      `"${m.riskParecer.replace(/"/g, '""')}"`,
      m.auditHash
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `HARPIA_RELATORIO_MENSAL_COMPLETO_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Control Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white relative overflow-hidden shadow-md">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl border-2 border-amber-400/60 shadow-lg overflow-hidden bg-slate-950 shrink-0 hidden sm:block">
              <img 
                src={harpiaLogo} 
                alt="Harpia Logo" 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-amber-400" />
                  CVM 175 & Livro Razão Fiduciário
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {DETAILED_MONTHLY_RECORDS.length} Meses Registrados
                </span>
              </div>
              
              <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-slate-100 flex items-center gap-2.5">
                Relatório Detalhado Mês a Mês
              </h1>
              <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
                Auditoria granular de cada mês de operação do Fundo Harpia: decomposição de rentabilidade por ativo, cronograma semanal de operações táticas, conformidade de enquadramento fiduciário e exportação formal em PDF e Excel.
              </p>
            </div>
          </div>

          {/* Global Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 rounded-xl text-xs font-bold font-mono flex items-center gap-2 transition-all shadow-sm cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              Exportar CSV Completo
            </button>
            <button
              onClick={handleExportMonthPDF}
              disabled={isExporting}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-slate-950" />
              {isExporting ? "Gerando PDF..." : `Exportar PDF (${activeMonth.month})`}
            </button>
          </div>
        </div>

        {/* Quick Year Performance Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
            <div className="flex justify-between items-center text-slate-400 text-[10px] uppercase font-bold font-mono">
              <span>Exercício 2024 (Auditado)</span>
              <span className="text-emerald-400 font-black">+22.61%</span>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-lg font-black text-slate-100 font-mono">R$ 122.61M</span>
              <span className="text-xs text-amber-400 font-bold font-mono">199.2% do CDI</span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
            <div className="flex justify-between items-center text-slate-400 text-[10px] uppercase font-bold font-mono">
              <span>Exercício 2025 (Auditado)</span>
              <span className="text-emerald-400 font-black">+25.54%</span>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-lg font-black text-slate-100 font-mono">R$ 153.97M</span>
              <span className="text-xs text-amber-400 font-bold font-mono">228.4% do CDI</span>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
            <div className="flex justify-between items-center text-slate-400 text-[10px] uppercase font-bold font-mono">
              <span>Exercício 2026 (YTD / Atual)</span>
              <span className="text-emerald-400 font-black">+11.52%</span>
            </div>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-lg font-black text-slate-100 font-mono">R$ 171.70M</span>
              <span className="text-xs text-amber-400 font-bold font-mono">210.2% do CDI</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & View Mode Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        
        {/* Year Pills & Status */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase font-mono mr-1">Ano:</span>
          {(["ALL", 2024, 2025, 2026] as const).map(yr => (
            <button
              key={yr}
              onClick={() => setSelectedYear(yr)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                selectedYear === yr 
                  ? "bg-slate-900 text-white shadow-sm" 
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {yr === "ALL" ? "Todos os Anos" : yr}
            </button>
          ))}

          <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block" />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
          >
            <option value="ALL">Todos os Status</option>
            <option value="FECHADO_AUDITADO">Fechado & Auditado</option>
            <option value="PROJETADO">Projetado</option>
          </select>
        </div>

        {/* Search & View Mode Switcher */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar mês, ticker, parecer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
            <button
              onClick={() => setViewMode("DOSSIER")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === "DOSSIER" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Ficha do Mês
            </button>
            <button
              onClick={() => setViewMode("LEDGER")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === "LEDGER" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Livro Razão
            </button>
            <button
              onClick={() => setViewMode("MATRIX")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === "MATRIX" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Matriz Anual
            </button>
          </div>
        </div>
      </div>

      {/* Month Selector Carousel / Pills */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase font-mono tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-amber-500" />
            Selecione o Mês para Análise Granular ({filteredMonths.length} disponíveis)
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            Mês Ativo: <strong className="text-slate-900">{activeMonth.monthName}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin">
          {filteredMonths.map((m) => {
            const isSelected = m.month === activeMonth.month;
            return (
              <button
                key={m.month}
                onClick={() => setActiveMonthKey(m.month)}
                className={`shrink-0 px-3.5 py-2 rounded-xl text-left border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-slate-900 text-white border-amber-500/80 shadow-md ring-2 ring-amber-500/20"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center justify-between gap-3 text-[11px] font-bold font-mono">
                  <span>{m.month}</span>
                  <span className={m.fundReturn >= 0 ? "text-emerald-400" : "text-rose-400"}>
                    {m.fundReturn >= 0 ? "+" : ""}{formatPercent(m.fundReturn)}
                  </span>
                </div>
                <div className="text-[9px] opacity-70 mt-0.5 font-mono">
                  {m.status === "PROJETADO" ? "Projetado" : "Auditado"}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: DOSSIER VIEW (DEEP DIVE COMPLETE MONTH BREAKDOWN)                 */}
      {/* ========================================================================= */}
      {viewMode === "DOSSIER" && (
        <div className="space-y-6">
          
          {/* Active Month Header Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-6 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md">
                    {activeMonth.month}
                  </span>
                  <span className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-md ${
                    activeMonth.status === "FECHADO_AUDITADO" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}>
                    {activeMonth.status.replace("_", " ")}
                  </span>
                  <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md">
                    Regime: {activeMonth.marketRegime}
                  </span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Dossiê Analítico: {activeMonth.monthName}
                </h2>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Hash de Auditoria CVM 175: {activeMonth.auditHash}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleExportMonthPDF}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  Baixar Parecer em PDF
                </button>
              </div>
            </div>

            {/* 6 Key Performance Metrics for this specific month */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
              
              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">Retorno Harpia</span>
                <strong className="text-base font-black text-emerald-600 font-mono mt-1 block">
                  +{formatPercent(activeMonth.fundReturn)}
                </strong>
                <span className="text-[10px] text-slate-500 font-mono">Rentab. líquida</span>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">% do CDI</span>
                <strong className="text-base font-black text-slate-800 font-mono mt-1 block">
                  {activeMonth.cdiPercentage.toFixed(1)}%
                </strong>
                <span className="text-[10px] text-slate-500 font-mono">CDI: +{formatPercent(activeMonth.cdiReturn)}</span>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">Alfa vs CDI</span>
                <strong className="text-base font-black text-amber-600 font-mono mt-1 block">
                  +{activeMonth.alphaBps} bps
                </strong>
                <span className="text-[10px] text-slate-500 font-mono">Spread gerado</span>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">Benchmark (IBOV)</span>
                <strong className={`text-base font-black font-mono mt-1 block ${activeMonth.benchReturn >= 0 ? "text-slate-800" : "text-rose-600"}`}>
                  {activeMonth.benchReturn >= 0 ? "+" : ""}{formatPercent(activeMonth.benchReturn)}
                </strong>
                <span className="text-[10px] text-slate-500 font-mono">Spread: +{((activeMonth.fundReturn - activeMonth.benchReturn) * 100).toFixed(2)}%</span>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">Índice Sharpe</span>
                <strong className="text-base font-black text-blue-600 font-mono mt-1 block">
                  {activeMonth.sharpeRatio.toFixed(2)}
                </strong>
                <span className="text-[10px] text-slate-500 font-mono">Sortino: {activeMonth.sortinoRatio.toFixed(2)}</span>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block">Patrimônio Líquido</span>
                <strong className="text-base font-black text-slate-900 font-mono mt-1 block">
                  R$ {(activeMonth.endNav / 1000000).toFixed(2)}M
                </strong>
                <span className="text-[10px] text-emerald-600 font-mono font-bold">+R$ {((activeMonth.endNav - activeMonth.startNav) / 1000000).toFixed(2)}M no mês</span>
              </div>

            </div>
          </div>

          {/* Intra-month Chart & Asset Decomposition Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Intra-month 21-Day Evolution Chart */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-amber-500" />
                    Evolução Intramês Diária (21 Pregões — Fundo vs CDI vs IBOV)
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Trajetória diária acumulada dentro do mês de {activeMonth.monthName}.</p>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono">
                  <span className="flex items-center gap-1 text-emerald-600 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> Fundo Harpia
                  </span>
                  <span className="flex items-center gap-1 text-amber-600 font-bold">
                    <span className="w-2 h-2 rounded-full bg-amber-500" /> CDI
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-slate-400" /> Ibovespa
                  </span>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={intraMonthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="fundIntraGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `${v}%`} />
                    <Tooltip 
                      formatter={(val: any) => [`${val}%`, ""]}
                      contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", color: "#fff", fontSize: "11px", border: "none" }}
                    />
                    <Area type="monotone" dataKey="fund" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#fundIntraGrad)" name="Fundo Harpia (%)" />
                    <Line type="monotone" dataKey="cdi" stroke="#f59e0b" strokeWidth={1.8} dot={false} name="CDI (%)" />
                    <Line type="monotone" dataKey="bench" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="3 3" dot={false} name="Ibovespa (%)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Intra-month Micro Stats */}
              <div className="grid grid-cols-4 gap-2 pt-4 mt-4 border-t border-slate-100 text-center font-mono">
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">Volatilidade a.a.</span>
                  <span className="text-xs font-bold text-slate-800">{activeMonth.annualizedVol.toFixed(1)}%</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">VaR 95% (1 Dia)</span>
                  <span className="text-xs font-bold text-slate-800">{activeMonth.var95_1d.toFixed(2)}%</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">Max Drawdown</span>
                  <span className="text-xs font-bold text-rose-600">{activeMonth.maxDrawdownMonth.toFixed(2)}%</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-bold block">Liquidez D+1</span>
                  <span className="text-xs font-bold text-emerald-600">{activeMonth.liquidityRatioD1.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            {/* Sector Breakdown Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
                <PieChartIcon className="w-4 h-4 text-blue-500" />
                Alocação Setorial no Mês
              </h3>
              <p className="text-[11px] text-slate-400">Distribuição de pesos e contribuição por setor de atividade.</p>

              <div className="space-y-3">
                {activeMonth.sectorAllocation.map((s, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="font-bold text-slate-700">{s.sector}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">{s.weight.toFixed(1)}% peso</span>
                        <span className={`font-bold ${s.contribution >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                          {s.contribution >= 0 ? "+" : ""}{(s.contribution * 100).toFixed(0)} bps
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${s.contribution >= 0 ? "bg-amber-500" : "bg-rose-400"}`}
                        style={{ width: `${Math.min(100, s.weight * 3.5)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Asset-by-Asset Contribution Table for this month */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-emerald-600" />
                  Atribuição de Performance por Ativo Negociado ({activeMonth.assetContributions.length} Posições)
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Detalhamento dos ganhos/perdas por ativo e tese quantitativa executada.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-mono text-[10px] uppercase">
                  <tr>
                    <th className="py-3 px-4">Ativo / Ticker</th>
                    <th className="py-3 px-4">Setor</th>
                    <th className="py-3 px-4">Tipo Posição</th>
                    <th className="py-3 px-4">Peso Médio</th>
                    <th className="py-3 px-4">Retorno do Ativo</th>
                    <th className="py-3 px-4">Contribuição (Cota)</th>
                    <th className="py-3 px-4">Tese / Racional</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {activeMonth.assetContributions.map((asset, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-black text-slate-900">
                        {asset.ticker}
                        <span className="block text-[10px] font-normal text-slate-400 font-sans">{asset.name}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-[11px]">
                        {asset.sector}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          asset.positionType === "LONG" ? "bg-emerald-100 text-emerald-800" :
                          asset.positionType === "FIXED_INCOME" ? "bg-blue-100 text-blue-800" :
                          asset.positionType === "HEDGE" ? "bg-purple-100 text-purple-800" :
                          "bg-amber-100 text-amber-800"
                        }`}>
                          {asset.positionType}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        {asset.weight.toFixed(1)}%
                      </td>
                      <td className={`py-3 px-4 font-mono font-bold ${asset.assetReturn >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                        {asset.assetReturn >= 0 ? "+" : ""}{asset.assetReturn.toFixed(2)}%
                      </td>
                      <td className={`py-3 px-4 font-mono font-black ${asset.contributionBps >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                        {asset.contributionBps >= 0 ? "+" : ""}{asset.contributionBps} bps
                      </td>
                      <td className="py-3 px-4 text-[11px] text-slate-600 max-w-xs leading-relaxed">
                        {asset.rationale}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Weekly Timeline Breakdown & Governance Parecer */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Weekly Schedule Timeline */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-500" />
                  Cronograma de Execuções Semanais (W1 a W4)
                </h3>
                <button
                  onClick={() => setExpandedWeeks(!expandedWeeks)}
                  className="text-slate-400 hover:text-slate-700 text-xs font-mono flex items-center gap-1 cursor-pointer"
                >
                  {expandedWeeks ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  {expandedWeeks ? "Recolher" : "Expandir"}
                </button>
              </div>

              {expandedWeeks && (
                <div className="space-y-3 pt-2">
                  {activeMonth.weeks.map((w, idx) => (
                    <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-mono font-bold text-amber-600 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                          {w.week}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {w.focus}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {w.description}
                      </p>
                      <div className="text-[11px] text-emerald-700 font-mono font-medium pt-1 border-t border-slate-200/60">
                        ⚡ Ação Tática: {w.tacticalAction}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Formal Risk & Compliance Parecer */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-4 relative shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-black text-slate-100 uppercase tracking-tight flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Parecer Fiduciário do Comitê de Risco CVM 175
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Ata formal de governança e auditoria da gestão de risco.</p>
                </div>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-mono font-bold px-2 py-0.5 rounded">
                  {activeMonth.complianceStatus}
                </span>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 leading-relaxed font-sans space-y-3">
                <p>"{activeMonth.riskParecer}"</p>
                <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row justify-between text-[10px] text-slate-400 font-mono gap-1">
                  <span>Auditor: <strong className="text-slate-200">{activeMonth.complianceAuditor}</strong></span>
                  <span>Hash CVM 175: <strong className="text-amber-400">{activeMonth.auditHash}</strong></span>
                </div>
              </div>

              {/* Cash Flow Summary for this Month */}
              <div className="grid grid-cols-3 gap-2 pt-2 text-center font-mono">
                <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[9px] text-slate-500 uppercase block font-bold">Aportes (Subscrições)</span>
                  <span className="text-xs font-bold text-emerald-400">+R$ {(activeMonth.subscriptions / 1000000).toFixed(2)}M</span>
                </div>
                <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[9px] text-slate-500 uppercase block font-bold">Resgates Pagos</span>
                  <span className="text-xs font-bold text-rose-400">-R$ {(activeMonth.redemptions / 1000000).toFixed(2)}M</span>
                </div>
                <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-[9px] text-slate-500 uppercase block font-bold">Captação Líquida</span>
                  <span className="text-xs font-bold text-amber-400">+R$ {(activeMonth.netInflow / 1000000).toFixed(2)}M</span>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: LEDGER VIEW (FULL TABLE WITH AUDIT EXPANSION)                     */}
      {/* ========================================================================= */}
      {viewMode === "LEDGER" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-slate-700" />
                Livro Razão Fiduciário Mês a Mês ({filteredMonths.length} Meses)
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Clique em qualquer mês para inspecionar ou auditar a ficha detalhada.</p>
            </div>
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              Baixar CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-mono text-[10px] uppercase">
                <tr>
                  <th className="py-3 px-4">Mês</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Retorno Fundo</th>
                  <th className="py-3 px-4">CDI</th>
                  <th className="py-3 px-4">Ibovespa</th>
                  <th className="py-3 px-4">Alfa vs CDI</th>
                  <th className="py-3 px-4">% CDI</th>
                  <th className="py-3 px-4">PL Fechamento</th>
                  <th className="py-3 px-4">Sharpe</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMonths.map((row) => (
                  <tr 
                    key={row.month} 
                    onClick={() => {
                      setActiveMonthKey(row.month);
                      setViewMode("DOSSIER");
                    }}
                    className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                      row.month === activeMonthKey ? "bg-amber-50/30" : ""
                    }`}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {row.month}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        row.status === "FECHADO_AUDITADO" ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"
                      }`}>
                        {row.status === "FECHADO_AUDITADO" ? "Auditado" : "Projetado"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-emerald-600 font-extrabold">
                      +{formatPercent(row.fundReturn)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      +{formatPercent(row.cdiReturn)}
                    </td>
                    <td className={`py-3.5 px-4 font-mono ${row.benchReturn >= 0 ? "text-slate-600" : "text-rose-500"}`}>
                      {row.benchReturn >= 0 ? "+" : ""}{formatPercent(row.benchReturn)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-amber-600 font-bold">
                      +{row.alphaBps} bps
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-800 font-bold">
                      {row.cdiPercentage.toFixed(1)}%
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      R$ {(row.endNav / 1000000).toFixed(2)}M
                    </td>
                    <td className="py-3.5 px-4 font-mono text-blue-600">
                      {row.sharpeRatio.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="text-[10px] font-mono text-amber-600 font-bold hover:underline">
                        Ver Ficha →
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 3: ANNUAL MATRIX (CLASSIC HEDGE FUND JAN-DEC GRID)                   */}
      {/* ========================================================================= */}
      {viewMode === "MATRIX" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-amber-500" />
                Matriz de Rentabilidade Mensal Histórica (Jan a Dez)
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Tabela padrão ANBIMA de rentabilidade consolidada ano a ano.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center text-xs font-mono">
              <thead className="bg-slate-900 text-white text-[10px] uppercase">
                <tr>
                  <th className="py-3 px-3 text-left">Ano</th>
                  <th className="py-3 px-2">Jan</th>
                  <th className="py-3 px-2">Fev</th>
                  <th className="py-3 px-2">Mar</th>
                  <th className="py-3 px-2">Abr</th>
                  <th className="py-3 px-2">Mai</th>
                  <th className="py-3 px-2">Jun</th>
                  <th className="py-3 px-2">Jul</th>
                  <th className="py-3 px-2">Ago</th>
                  <th className="py-3 px-2">Set</th>
                  <th className="py-3 px-2">Out</th>
                  <th className="py-3 px-2">Nov</th>
                  <th className="py-3 px-2">Dez</th>
                  <th className="py-3 px-3 text-amber-400 font-black">Ano (%)</th>
                  <th className="py-3 px-3 text-emerald-400 font-black">% CDI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                
                {/* 2024 Row */}
                <tr className="hover:bg-slate-50 font-bold">
                  <td className="py-3 px-3 text-left text-slate-900 font-black">2024</td>
                  <td className="text-emerald-600 bg-emerald-50/40">+2.10%</td>
                  <td className="text-emerald-600 bg-emerald-50/40">+1.80%</td>
                  <td className="text-emerald-600 bg-emerald-50/40">+1.50%</td>
                  <td className="text-rose-600 bg-rose-50/40">-0.80%</td>
                  <td className="text-emerald-600 bg-emerald-50/40">+2.40%</td>
                  <td className="text-emerald-600 bg-emerald-50/40">+1.90%</td>
                  <td className="text-emerald-600 bg-emerald-50/40">+2.20%</td>
                  <td className="text-emerald-600 bg-emerald-50/40">+1.40%</td>
                  <td className="text-emerald-600 bg-emerald-50/40">+2.60%</td>
                  <td className="text-emerald-600 bg-emerald-50/40">+1.20%</td>
                  <td className="text-emerald-600 bg-emerald-50/40">+2.00%</td>
                  <td className="text-emerald-600 bg-emerald-50/40">+2.30%</td>
                  <td className="py-3 px-3 bg-amber-50 text-amber-900 font-black">+22.61%</td>
                  <td className="py-3 px-3 bg-emerald-50 text-emerald-900 font-black">199.2%</td>
                </tr>

                {/* 2025 Row */}
                <tr className="hover:bg-slate-50 font-bold">
                  <td className="py-3 px-3 text-left text-slate-900 font-black">2025</td>
                  <td className="text-emerald-600 bg-emerald-50/40">+1.90%</td>
                  <td className="text-emerald-600 bg-emerald-50/40">+1.50%</td>
                  <td className="text-emerald-600 bg-emerald-50/40">+2.10%</td>
                  <td className="text-emerald-600 bg-emerald-50/40">+1.70%</td>
                  <td className="text-emerald-600 bg-emerald-50/40">+2.50%</td>
                  <td className="text-emerald-600 bg-emerald-50/40">+1.80%</td>
                  <td className="text-emerald-600 bg-emerald-50/40">+2.00%</td>
                  <td className="text-emerald-600 bg-emerald-50/40">+1.60%</td>
                  <td className="text-emerald-600 bg-emerald-50/40">+2.20%</td>
                  <td className="text-emerald-600 bg-emerald-50/40">+1.40%</td>
                  <td className="text-emerald-600 bg-emerald-50/40">+1.90%</td>
                  <td className="text-emerald-600 bg-emerald-50/40">+2.40%</td>
                  <td className="py-3 px-3 bg-amber-50 text-amber-900 font-black">+25.54%</td>
                  <td className="py-3 px-3 bg-emerald-50 text-emerald-900 font-black">228.4%</td>
                </tr>

                {/* 2026 Row */}
                <tr className="hover:bg-slate-50 font-bold">
                  <td className="py-3 px-3 text-left text-slate-900 font-black">2026</td>
                  <td className="text-emerald-600 bg-emerald-50/40">+1.80%</td>
                  <td className="text-emerald-600 bg-emerald-50/40">+1.50%</td>
                  <td className="text-emerald-600 bg-emerald-50/40">+2.00%</td>
                  <td className="text-emerald-600 bg-emerald-50/40">+1.60%</td>
                  <td className="text-emerald-600 bg-emerald-50/40">+2.20%</td>
                  <td className="text-emerald-600 bg-emerald-50/40">+1.90%</td>
                  <td className="text-slate-400 bg-slate-50">+1.70%*</td>
                  <td className="text-slate-400 bg-slate-50">+1.80%*</td>
                  <td className="text-slate-400 bg-slate-50">+2.00%*</td>
                  <td className="text-slate-400 bg-slate-50">+1.50%*</td>
                  <td className="text-slate-400 bg-slate-50">+1.90%*</td>
                  <td className="text-slate-400 bg-slate-50">+2.20%*</td>
                  <td className="py-3 px-3 bg-amber-50 text-amber-900 font-black">+23.85%</td>
                  <td className="py-3 px-3 bg-emerald-50 text-emerald-900 font-black">210.2%</td>
                </tr>

              </tbody>
            </table>
          </div>

          <div className="text-[10px] text-slate-400 font-mono">
            * Valores de 2026 a partir do 2º semestre representam estimativas provisórias modeladas pelo algoritmo Black-Litterman HRP.
          </div>
        </div>
      )}

    </div>
  );
}
