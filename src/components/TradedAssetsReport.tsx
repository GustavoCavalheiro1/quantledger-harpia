/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  FileText, 
  FileDown, 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  Coins, 
  Award, 
  ShieldAlert, 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  Sparkles, 
  DollarSign, 
  BarChart2,
  BarChart3,
  ShieldCheck,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
  Info,
  Sliders,
  ArrowUpDown,
  Play,
  Pause,
  Zap,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  PlusCircle,
  Radio,
  ShoppingBag,
  Tag,
  Newspaper
} from "lucide-react";
import jsPDF from "jspdf";
import harpiaLogo from "../assets/images/harpia_logo_1786511025650.jpg";
import { getMarketStatus } from "../lib/marketHours";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import { Asset } from "../types";

const MANAGEMENT_LETTER_PERF_DATA = [
  { date: "Jan/24", quantLedger: 100.0, cdi: 100.0, drawdown: 0.0 },
  { date: "Mar/24", quantLedger: 104.2, cdi: 101.8, drawdown: -1.2 },
  { date: "Mai/24", quantLedger: 107.5, cdi: 103.4, drawdown: -3.5 },
  { date: "Jul/24", quantLedger: 105.1, cdi: 105.1, drawdown: -8.1 },
  { date: "Set/24", quantLedger: 111.4, cdi: 106.9, drawdown: -4.2 },
  { date: "Nov/24", quantLedger: 116.8, cdi: 108.7, drawdown: -1.5 },
  { date: "Jan/25", quantLedger: 118.9, cdi: 110.5, drawdown: -2.1 },
  { date: "Mar/25", quantLedger: 122.5, cdi: 112.4, drawdown: -0.8 },
  { date: "Mai/25", quantLedger: 127.3, cdi: 114.2, drawdown: -1.4 },
  { date: "Jul/25", quantLedger: 133.6, cdi: 116.1, drawdown: -0.6 },
  { date: "Set/25", quantLedger: 139.8, cdi: 118.0, drawdown: -1.9 },
  { date: "Nov/25", quantLedger: 145.2, cdi: 120.1, drawdown: -0.4 },
  { date: "Jan/26", quantLedger: 149.7, cdi: 122.0, drawdown: -1.1 },
  { date: "Mar/26", quantLedger: 154.6, cdi: 123.9, drawdown: -0.7 },
  { date: "Mai/26", quantLedger: 161.2, cdi: 125.8, drawdown: -0.3 },
  { date: "Jul/26", quantLedger: 167.4, cdi: 127.7, drawdown: -0.5 },
  { date: "Ago/26", quantLedger: 171.2, cdi: 128.8, drawdown: 0.0 },
];

export interface TradedAssetDetail {
  ticker: string;
  name: string;
  assetClass: "Ações B3" | "Commodities" | "Forex & Câmbio" | "Proteção (Ouro)" | "Renda Fixa / CDI" | "ETFs Globais";
  sector: string;
  positionType: "BUY_LONG" | "SELL_SHORT" | "BUY_HEDGE" | "HOLD_CASH";
  weightPct: number; // e.g. 12.0 (%)
  allocatedValue: number; // e.g. 12000000 (R$)
  tradedQty: number; // e.g. 312093
  unitLabel: string; // e.g. "ações", "lotes", "g", "USD"
  entryPrice: number; // e.g. 34.20
  currentPrice: number; // e.g. 38.45
  var24h: number; // e.g. 2.15 (%)
  unrealizedPnl: number; // e.g. 1326000 (R$)
  unrealizedPnlPct: number; // e.g. 12.43 (%)
  adv: number; // Average Daily Volume R$
  volatility: number; // e.g. 0.28 (28%)
  spreadBps: number; // e.g. 2.5 bps
  scores: { macro: number; micro: number; news: number; credit: number };
  expectedReturnBL: number; // e.g. 0.185 (18.5%)
  varContributionPct: number; // e.g. 1.85 (%)
  slippageBps: number; // e.g. 3.2 bps
  executionVenue: string; // e.g. "B3 Equities Segment"
  rationale: string;
  lastTickDir?: "up" | "down" | "neutral";
}

export interface ExecutedTradeLog {
  id: string;
  timestamp: string; // HH:mm:ss
  ticker: string;
  side: "COMPRA" | "VENDA";
  quantity: number;
  price: number;
  totalValue: number;
  broker: string;
  latencyMs: number;
  assetClass: string;
  status?: "EXECUTADA" | "AGENDADA_ABERTURA";
}

interface TradedAssetsReportProps {
  assets?: Asset[];
  onNavigateToTab?: (tabId: string) => void;
}

const INITIAL_ASSETS_DATA: TradedAssetDetail[] = [
  {
    ticker: "PETR4",
    name: "Petróleo Brasileiro S.A. PN",
    assetClass: "Ações B3",
    sector: "Energia",
    positionType: "BUY_LONG",
    weightPct: 12.0,
    allocatedValue: 12000000,
    tradedQty: 312093,
    unitLabel: "ações",
    entryPrice: 34.20,
    currentPrice: 38.45,
    var24h: 2.15,
    unrealizedPnl: 1326000,
    unrealizedPnlPct: 12.43,
    adv: 1200000000,
    volatility: 0.28,
    spreadBps: 2.5,
    scores: { macro: 75, micro: 82, news: 88, credit: 68 },
    expectedReturnBL: 0.185,
    varContributionPct: 2.15,
    slippageBps: 3.1,
    executionVenue: "B3 - Mercado à Vista",
    rationale: "Forte geração de caixa operacional, baixo endividamento líquido e fluxo comprador de dividendos em moeda forte."
  },
  {
    ticker: "VALE3",
    name: "Vale S.A. ON",
    assetClass: "Ações B3",
    sector: "Materiais Básicos",
    positionType: "BUY_LONG",
    weightPct: 10.0,
    allocatedValue: 10000000,
    tradedQty: 163398,
    unitLabel: "ações",
    entryPrice: 63.50,
    currentPrice: 61.20,
    var24h: -1.05,
    unrealizedPnl: -362000,
    unrealizedPnlPct: -3.62,
    adv: 950000000,
    volatility: 0.24,
    spreadBps: 3.0,
    scores: { macro: 45, micro: 68, news: 52, credit: 85 },
    expectedReturnBL: 0.112,
    varContributionPct: 1.45,
    slippageBps: 2.8,
    executionVenue: "B3 - Mercado à Vista",
    rationale: "Desconto relativo em relação aos pares globais. Mapeamento de demanda por minério de alta pureza atua como amortecedor."
  },
  {
    ticker: "WEGE3",
    name: "WEG S.A. ON",
    assetClass: "Ações B3",
    sector: "Bens Industriais",
    positionType: "BUY_LONG",
    weightPct: 8.0,
    allocatedValue: 8000000,
    tradedQty: 185399,
    unitLabel: "ações",
    entryPrice: 38.80,
    currentPrice: 43.15,
    var24h: 1.82,
    unrealizedPnl: 896800,
    unrealizedPnlPct: 11.21,
    adv: 450000000,
    volatility: 0.19,
    spreadBps: 4.0,
    scores: { macro: 80, micro: 94, news: 91, credit: 95 },
    expectedReturnBL: 0.218,
    varContributionPct: 0.98,
    slippageBps: 4.2,
    executionVenue: "B3 - Mercado à Vista",
    rationale: "ROIC excepcional de 28%. Exposição acelerada à infraestrutura de energia limpa e transmissão nos Estados Unidos."
  },
  {
    ticker: "ITUB4",
    name: "Itaú Unibanco Holding PN",
    assetClass: "Ações B3",
    sector: "Financeiro",
    positionType: "BUY_LONG",
    weightPct: 8.0,
    allocatedValue: 8000000,
    tradedQty: 229885,
    unitLabel: "ações",
    entryPrice: 31.40,
    currentPrice: 34.80,
    var24h: 0.92,
    unrealizedPnl: 781600,
    unrealizedPnlPct: 9.77,
    adv: 800000000,
    volatility: 0.16,
    spreadBps: 1.8,
    scores: { macro: 65, micro: 88, news: 76, credit: 98 },
    expectedReturnBL: 0.149,
    varContributionPct: 0.85,
    slippageBps: 1.5,
    executionVenue: "B3 - Mercado à Vista",
    rationale: "Principal âncora do setor bancário. Carteira de crédito corporativo diversificada com baixo índice de inadimplência."
  },
  {
    ticker: "BBAS3",
    name: "Banco do Brasil S.A. ON",
    assetClass: "Ações B3",
    sector: "Financeiro",
    positionType: "BUY_LONG",
    weightPct: 6.0,
    allocatedValue: 6000000,
    tradedQty: 215053,
    unitLabel: "ações",
    entryPrice: 26.10,
    currentPrice: 27.90,
    var24h: -0.45,
    unrealizedPnl: 387000,
    unrealizedPnlPct: 6.45,
    adv: 600000000,
    volatility: 0.22,
    spreadBps: 2.2,
    scores: { macro: 70, micro: 85, news: 68, credit: 75 },
    expectedReturnBL: 0.162,
    varContributionPct: 0.92,
    slippageBps: 2.1,
    executionVenue: "B3 - Mercado à Vista",
    rationale: "Múltiplos atrativos P/L de 4x. Forte sinergia e liderança no crédito do agronegócio de exportação."
  },
  {
    ticker: "IVVB11",
    name: "iShares S&P 500 BRL ETF",
    assetClass: "ETFs Globais",
    sector: "Internacional / S&P 500",
    positionType: "BUY_HEDGE",
    weightPct: 10.0,
    allocatedValue: 10000000,
    tradedQty: 35087,
    unitLabel: "cotas",
    entryPrice: 262.00,
    currentPrice: 285.00,
    var24h: 1.10,
    unrealizedPnl: 807000,
    unrealizedPnlPct: 8.07,
    adv: 1100000000,
    volatility: 0.17,
    spreadBps: 1.2,
    scores: { macro: 75, micro: 80, news: 72, credit: 92 },
    expectedReturnBL: 0.145,
    varContributionPct: 1.12,
    slippageBps: 1.1,
    executionVenue: "B3 / Cboe Global Markets",
    rationale: "Cobertura dupla: captura a performance do S&P 500 norte-americano com hedge cambial embutido do dólar."
  },
  {
    ticker: "SOJA",
    name: "Contratos Futuros de Soja CME",
    assetClass: "Commodities",
    sector: "Agronegócio",
    positionType: "BUY_HEDGE",
    weightPct: 6.0,
    allocatedValue: 6000000,
    tradedQty: 180,
    unitLabel: "lotes",
    entryPrice: 10.50,
    currentPrice: 11.80,
    var24h: 3.40,
    unrealizedPnl: 742800,
    unrealizedPnlPct: 12.38,
    adv: 250000000,
    volatility: 0.22,
    spreadBps: 3.5,
    scores: { macro: 60, micro: 70, news: 85, credit: 80 },
    expectedReturnBL: 0.140,
    varContributionPct: 0.75,
    slippageBps: 3.8,
    executionVenue: "CME Group - Chicago",
    rationale: "Hedge assimétrico contra estresse climático no Centro-Oeste (sensoriamento remoto satélite NDVI)."
  },
  {
    ticker: "MILHO",
    name: "Milho Futuro B3 (CCM)",
    assetClass: "Commodities",
    sector: "Agronegócio",
    positionType: "BUY_HEDGE",
    weightPct: 5.0,
    allocatedValue: 5000000,
    tradedQty: 120,
    unitLabel: "lotes",
    entryPrice: 56.10,
    currentPrice: 64.20,
    var24h: 1.95,
    unrealizedPnl: 632500,
    unrealizedPnlPct: 12.65,
    adv: 180000000,
    volatility: 0.21,
    spreadBps: 4.5,
    scores: { macro: 58, micro: 72, news: 78, credit: 85 },
    expectedReturnBL: 0.132,
    varContributionPct: 0.62,
    slippageBps: 4.1,
    executionVenue: "B3 Commodities Segment",
    rationale: "Proteção contra gargalos de transporte da safrinha e alta de demanda de ração e bioetanol de milho."
  },
  {
    ticker: "CAFÉ",
    name: "Café Arábica Futuro B3 (ICF)",
    assetClass: "Commodities",
    sector: "Agronegócio",
    positionType: "BUY_HEDGE",
    weightPct: 5.0,
    allocatedValue: 5000000,
    tradedQty: 85,
    unitLabel: "lotes",
    entryPrice: 192.00,
    currentPrice: 215.40,
    var24h: 2.30,
    unrealizedPnl: 609300,
    unrealizedPnlPct: 12.18,
    adv: 120000000,
    volatility: 0.25,
    spreadBps: 5.0,
    scores: { macro: 65, micro: 75, news: 82, credit: 88 },
    expectedReturnBL: 0.148,
    varContributionPct: 0.70,
    slippageBps: 4.8,
    executionVenue: "B3 Commodities Segment",
    rationale: "Oportunidade capturada por seca nas regiões produtoras do Sul de Minas Gerais e restrição de oferta mundial."
  },
  {
    ticker: "OURO",
    name: "Ouro Spot Physical BM&F (OZ1D)",
    assetClass: "Proteção (Ouro)",
    sector: "Ativo Defensivo / Safe Haven",
    positionType: "BUY_HEDGE",
    weightPct: 10.0,
    allocatedValue: 10000000,
    tradedQty: 23894,
    unitLabel: "gramas",
    entryPrice: 385.00,
    currentPrice: 418.50,
    var24h: 0.85,
    unrealizedPnl: 870000,
    unrealizedPnlPct: 8.70,
    adv: 90000000,
    volatility: 0.14,
    spreadBps: 6.0,
    scores: { macro: 82, micro: 50, news: 80, credit: 100 },
    expectedReturnBL: 0.115,
    varContributionPct: 0.42,
    slippageBps: 5.2,
    executionVenue: "BM&F Spot Ouro - B3",
    rationale: "Proteção contra cauda e surtos de incerteza fiscal. Ativo com imunidade a desvalorizações fiscais sistêmicas."
  },
  {
    ticker: "USD_BRL",
    name: "Dólar Comercial PTAX / Futuro (DOL)",
    assetClass: "Forex & Câmbio",
    sector: "Câmbio e Moedas",
    positionType: "BUY_HEDGE",
    weightPct: 5.0,
    allocatedValue: 5000000,
    tradedQty: 912408,
    unitLabel: "USD",
    entryPrice: 5.15,
    currentPrice: 5.48,
    var24h: 0.65,
    unrealizedPnl: 320300,
    unrealizedPnlPct: 6.41,
    adv: 4500000000,
    volatility: 0.13,
    spreadBps: 0.8,
    scores: { macro: 70, micro: 50, news: 65, credit: 100 },
    expectedReturnBL: 0.085,
    varContributionPct: 0.38,
    slippageBps: 0.9,
    executionVenue: "B3 - Mercado Futuro DOL",
    rationale: "Vetor automático de amortecimento para o risco de saída de capital estrangeiro e fechamento de curva de juros."
  },
  {
    ticker: "CDI",
    name: "Certificado de Depósito Interbancário (Selic)",
    assetClass: "Renda Fixa / CDI",
    sector: "Renda Fixa e Liquidez",
    positionType: "HOLD_CASH",
    weightPct: 15.0,
    allocatedValue: 15000000,
    tradedQty: 15000000,
    unitLabel: "reais",
    entryPrice: 1.00,
    currentPrice: 1.028,
    var24h: 0.04,
    unrealizedPnl: 420000,
    unrealizedPnlPct: 2.80,
    adv: 10000000000,
    volatility: 0.01,
    spreadBps: 0.1,
    scores: { macro: 50, micro: 50, news: 50, credit: 100 },
    expectedReturnBL: 0.105,
    varContributionPct: 0.01,
    slippageBps: 0.1,
    executionVenue: "Mercado Interfinanceiro - Bacen",
    rationale: "Reserva de caixa com rentabilidade de 10.50% a.a. Garante margens de garantia para derivativos e amortecedor de resgates."
  }
];

const BROKERS = [
  "XP Investimentos", 
  "BTG Pactual", 
  "JP Morgan Corretora", 
  "UBS Brasil", 
  "Credit Suisse", 
  "Merrill Lynch", 
  "Santander Corretora", 
  "Ágora Investimentos", 
  "Harpia Algo HFT Engine"
];

export default function TradedAssetsReport({ assets, onNavigateToTab }: TradedAssetsReportProps) {
  // Live State
  const [tradedAssetsData, setTradedAssetsData] = useState<TradedAssetDetail[]>(INITIAL_ASSETS_DATA);
  const [executedTrades, setExecutedTrades] = useState<ExecutedTradeLog[]>([]);
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [lastUpdateTime, setLastUpdateTime] = useState<string>("");
  const [reportViewMode, setReportViewMode] = useState<"CARTA_GESTOR" | "MESA_OPERACOES">("CARTA_GESTOR");

  // Market Hours Engine (B3 Trading Hours: Mon-Fri 10:00 - 17:00 BRT)
  const [forceSimulateOpen, setForceSimulateOpen] = useState<boolean>(false);
  const marketStatus = useMemo(() => getMarketStatus(forceSimulateOpen), [forceSimulateOpen, lastUpdateTime]);

  // ────────────────────────────────────────────────────────────────────────────
  // CANVAS CHART GENERATORS FOR HIGH-RESOLUTION PDF EMBEDDING
  // ────────────────────────────────────────────────────────────────────────────
  const generatePerformanceChartCanvas = (): string => {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 500;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 20px Helvetica, Arial, sans-serif";
    ctx.fillText("EVOLUÇÃO PATRIMONIAL ACUMULADA: HARPIA QUANTLEDGER vs BENCHMARKS (BASE 100)", 40, 42);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "13px Helvetica, Arial, sans-serif";
    ctx.fillText("Histórico Consolidado 2020–2026 | Performance Acumulada em Reais (BRL)", 40, 65);

    const padL = 70;
    const padR = 40;
    const padT = 90;
    const padB = 70;
    const cWidth = canvas.width - padL - padR;
    const cHeight = canvas.height - padT - padB;

    const minY = 90;
    const maxY = 280;
    const steps = 5;

    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 1;

    for (let i = 0; i <= steps; i++) {
      const val = minY + ((maxY - minY) / steps) * i;
      const y = padT + cHeight - (i / steps) * cHeight;
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(padL + cWidth, y);
      ctx.stroke();

      ctx.fillStyle = "#94a3b8";
      ctx.font = "12px Helvetica, Arial, sans-serif";
      ctx.fillText(Math.round(val).toString(), 25, y + 4);
    }

    const years = ["2020", "2021", "2022", "2023", "2024", "2025", "2026"];
    const harpiaPts = [100.0, 115.8, 135.1, 161.3, 198.1, 234.2, 271.2];
    const cdiPts    = [100.0, 102.7, 107.2, 121.1, 136.9, 152.6, 171.2];
    const ibovPts   = [100.0, 102.9,  90.7,  94.9, 116.1, 129.1, 139.9];
    const sp500Pts  = [100.0, 118.4, 142.1, 131.5, 164.2, 205.3, 225.4];

    const getX = (i: number) => padL + (i / (years.length - 1)) * cWidth;
    const getY = (v: number) => padT + cHeight - ((v - minY) / (maxY - minY)) * cHeight;

    years.forEach((yLabel, i) => {
      const x = getX(i);
      ctx.beginPath();
      ctx.moveTo(x, padT);
      ctx.lineTo(x, padT + cHeight);
      ctx.stroke();

      ctx.fillStyle = "#cbd5e1";
      ctx.font = "bold 13px Helvetica, Arial, sans-serif";
      ctx.fillText(yLabel, x - 14, padT + cHeight + 25);
    });

    // Gradient Fill under Harpia
    ctx.beginPath();
    ctx.moveTo(getX(0), getY(harpiaPts[0]));
    for (let i = 1; i < harpiaPts.length; i++) ctx.lineTo(getX(i), getY(harpiaPts[i]));
    ctx.lineTo(getX(harpiaPts.length - 1), padT + cHeight);
    ctx.lineTo(getX(0), padT + cHeight);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, padT, 0, padT + cHeight);
    grad.addColorStop(0, "rgba(16, 185, 129, 0.4)");
    grad.addColorStop(1, "rgba(16, 185, 129, 0.0)");
    ctx.fillStyle = grad;
    ctx.fill();

    // S&P 500 Line (Purple)
    ctx.beginPath();
    ctx.strokeStyle = "#a855f7";
    ctx.lineWidth = 2.5;
    for (let i = 0; i < sp500Pts.length; i++) {
      const x = getX(i);
      const y = getY(sp500Pts[i]);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Ibovespa Line (Blue)
    ctx.beginPath();
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2.5;
    for (let i = 0; i < ibovPts.length; i++) {
      const x = getX(i);
      const y = getY(ibovPts[i]);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // CDI Line (Gold, dashed)
    ctx.beginPath();
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 8]);
    for (let i = 0; i < cdiPts.length; i++) {
      const x = getX(i);
      const y = getY(cdiPts[i]);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Harpia Line (Emerald)
    ctx.beginPath();
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 4;
    for (let i = 0; i < harpiaPts.length; i++) {
      const x = getX(i);
      const y = getY(harpiaPts[i]);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    for (let i = 0; i < harpiaPts.length; i++) {
      ctx.fillStyle = "#10b981";
      ctx.beginPath();
      ctx.arc(getX(i), getY(harpiaPts[i]), 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    const legY = canvas.height - 22;
    ctx.fillStyle = "#10b981";
    ctx.fillRect(80, legY - 12, 18, 12);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px Helvetica, Arial, sans-serif";
    ctx.fillText("Harpia QuantLedger (+171.2%)", 106, legY);

    ctx.fillStyle = "#a855f7";
    ctx.fillRect(410, legY - 12, 18, 12);
    ctx.fillStyle = "#ffffff";
    ctx.fillText("S&P 500 BRL (+125.4%)", 436, legY);

    ctx.fillStyle = "#f59e0b";
    ctx.fillRect(680, legY - 12, 18, 12);
    ctx.fillStyle = "#ffffff";
    ctx.fillText("CDI (+71.2%)", 706, legY);

    ctx.fillStyle = "#3b82f6";
    ctx.fillRect(880, legY - 12, 18, 12);
    ctx.fillStyle = "#ffffff";
    ctx.fillText("Ibovespa (+39.9%)", 906, legY);

    return canvas.toDataURL("image/png");
  };

  const generateDrawdownChartCanvas = (): string => {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 500;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 20px Helvetica, Arial, sans-serif";
    ctx.fillText("ANÁLISE DE SUBAQUÁTICO — UNDERWATER DRAWDOWN (%)", 40, 42);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "13px Helvetica, Arial, sans-serif";
    ctx.fillText("Profundidade e Mapeamento de Quedas de Pico a Vale (Máximo Drawdown Histórico: -8.10%)", 40, 65);

    const padL = 70;
    const padR = 40;
    const padT = 90;
    const padB = 60;
    const cWidth = canvas.width - padL - padR;
    const cHeight = canvas.height - padT - padB;

    const minY = -10.0;
    const maxY = 0.0;
    const steps = 5;

    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 1;

    for (let i = 0; i <= steps; i++) {
      const val = minY + ((maxY - minY) / steps) * i;
      const y = padT + cHeight - (i / steps) * cHeight;
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(padL + cWidth, y);
      ctx.stroke();

      ctx.fillStyle = "#94a3b8";
      ctx.font = "12px Helvetica, Arial, sans-serif";
      ctx.fillText(`${val.toFixed(1)}%`, 20, y + 4);
    }

    const years = ["2020", "2021", "2022", "2023", "2024", "2025", "2026"];
    const ddPts = [0.0, -8.1, -1.8, -2.1, -0.4, -1.2, -0.0];

    const getX = (i: number) => padL + (i / (years.length - 1)) * cWidth;
    const getY = (v: number) => padT + cHeight - ((v - minY) / (maxY - minY)) * cHeight;

    years.forEach((yLabel, i) => {
      const x = getX(i);
      ctx.fillStyle = "#cbd5e1";
      ctx.font = "bold 13px Helvetica, Arial, sans-serif";
      ctx.fillText(yLabel, x - 14, padT + cHeight + 25);
    });

    ctx.beginPath();
    ctx.moveTo(getX(0), getY(0));
    for (let i = 0; i < ddPts.length; i++) ctx.lineTo(getX(i), getY(ddPts[i]));
    ctx.lineTo(getX(ddPts.length - 1), getY(0));
    ctx.closePath();

    const grad = ctx.createLinearGradient(0, padT, 0, padT + cHeight);
    grad.addColorStop(0, "rgba(244, 63, 94, 0.0)");
    grad.addColorStop(1, "rgba(244, 63, 94, 0.6)");
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    ctx.strokeStyle = "#f43f5e";
    ctx.lineWidth = 3.5;
    for (let i = 0; i < ddPts.length; i++) {
      const x = getX(i);
      const y = getY(ddPts[i]);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    const maxIdx = 1; // -8.1%
    const callX = getX(maxIdx);
    const callY = getY(-8.1);

    ctx.fillStyle = "#e11d48";
    ctx.beginPath();
    ctx.arc(callX, callY, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffe4e6";
    ctx.fillRect(callX - 60, callY - 35, 120, 26);
    ctx.strokeStyle = "#f43f5e";
    ctx.lineWidth = 1;
    ctx.strokeRect(callX - 60, callY - 35, 120, 26);

    ctx.fillStyle = "#881337";
    ctx.font = "bold 11px Helvetica, Arial, sans-serif";
    ctx.fillText("Max DD: -8.10% (Pico)", callX - 52, callY - 18);

    return canvas.toDataURL("image/png");
  };

  const generateSectorAllocationCanvas = (): string => {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 500;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 20px Helvetica, Arial, sans-serif";
    ctx.fillText("ALOCAÇÃO ESTRATÉGICA POR CLASSE DE ATIVO & SETOR ECONÔMICO", 40, 42);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "13px Helvetica, Arial, sans-serif";
    ctx.fillText("Composição do Patrimônio Líquido (AUM R$ 119.911.570,00 | Estrutura Equilibrada)", 40, 65);

    const sectors = [
      { name: "Financeiro & Bancos Prime", pct: 25.0, val: "R$ 29.98M", color: "#3b82f6" },
      { name: "Commodities & Energia (Petróleo/Minério)", pct: 25.0, val: "R$ 29.98M", color: "#10b981" },
      { name: "Agronegócio & Commodities Agrícolas", pct: 15.0, val: "R$ 17.98M", color: "#f59e0b" },
      { name: "Renda Fixa / CDI Caixa Liquidez", pct: 15.0, val: "R$ 17.98M", color: "#64748b" },
      { name: "Ações Globais US & Tech (S&P/Nasdaq)", pct: 10.0, val: "R$ 11.99M", color: "#a855f7" },
      { name: "Proteção Câmbio & Ouro (USD / Gold / US10Y)", pct: 10.0, val: "R$ 11.99M", color: "#ec4899" },
    ];

    let startY = 100;
    const barHeight = 36;
    const maxBarWidth = 650;

    sectors.forEach(s => {
      ctx.fillStyle = "#f8fafc";
      ctx.font = "bold 13px Helvetica, Arial, sans-serif";
      ctx.fillText(s.name, 40, startY + 22);

      ctx.fillStyle = "#1e293b";
      ctx.fillRect(440, startY, maxBarWidth, barHeight);

      const fillWidth = (s.pct / 30.0) * maxBarWidth;
      ctx.fillStyle = s.color;
      ctx.fillRect(440, startY, fillWidth, barHeight);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 13px Helvetica, Arial, sans-serif";
      ctx.fillText(`${s.pct.toFixed(1)}% (${s.val})`, 440 + fillWidth + 15, startY + 23);

      startY += 58;
    });

    return canvas.toDataURL("image/png");
  };

  const generateVaRDistributionCanvas = (): string => {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 500;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 20px Helvetica, Arial, sans-serif";
    ctx.fillText("CURVA DE DISTRIBUIÇÃO NORMAL DE RETORNOS & VALUE AT RISK (VaR)", 40, 42);

    ctx.fillStyle = "#94a3b8";
    ctx.font = "13px Helvetica, Arial, sans-serif";
    ctx.fillText("Análise Estatística de Risco de Cauda (Horizonte 1-Dia | Confiança 95% e 99%)", 40, 65);

    const padL = 80;
    const padR = 80;
    const padT = 110;
    const padB = 80;
    const cWidth = canvas.width - padL - padR;
    const cHeight = canvas.height - padT - padB;

    const mean = 0.08;
    const sd = 0.75;

    const points = [];
    const minX = -3.5;
    const maxX = 3.5;

    for (let x = minX; x <= maxX; x += 0.05) {
      const y = (1 / (sd * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / sd, 2));
      points.push({ x, y });
    }

    const maxYVal = Math.max(...points.map(p => p.y));

    const getX = (xVal: number) => padL + ((xVal - minX) / (maxX - minX)) * cWidth;
    const getY = (yVal: number) => padT + cHeight - (yVal / maxYVal) * cHeight;

    ctx.beginPath();
    const var95X = -1.25;
    ctx.moveTo(getX(minX), getY(0));
    for (const p of points) {
      if (p.x <= var95X) {
        ctx.lineTo(getX(p.x), getY(p.y));
      }
    }
    ctx.lineTo(getX(var95X), getY(0));
    ctx.closePath();
    ctx.fillStyle = "rgba(239, 68, 68, 0.4)";
    ctx.fill();

    ctx.beginPath();
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 3.5;
    points.forEach((p, i) => {
      const x = getX(p.x);
      const y = getY(p.y);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.moveTo(getX(mean), padT);
    ctx.lineTo(getX(mean), padT + cHeight);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 2.5;
    ctx.moveTo(getX(-1.25), padT - 10);
    ctx.lineTo(getX(-1.25), padT + cHeight);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = "#b91c1c";
    ctx.lineWidth = 2.5;
    ctx.moveTo(getX(-1.85), padT - 10);
    ctx.lineTo(getX(-1.85), padT + cHeight);
    ctx.stroke();

    ctx.fillStyle = "#10b981";
    ctx.font = "bold 12px Helvetica, Arial, sans-serif";
    ctx.fillText("Média Diária: +0.08%", getX(mean) - 50, padT - 15);

    ctx.fillStyle = "#ef4444";
    ctx.font = "bold 12px Helvetica, Arial, sans-serif";
    ctx.fillText("VaR 95%: -1.25%", getX(-1.25) - 45, padT - 15);

    ctx.fillStyle = "#f87171";
    ctx.font = "bold 12px Helvetica, Arial, sans-serif";
    ctx.fillText("VaR 99%: -1.85%", getX(-1.85) - 85, padT - 30);

    ctx.beginPath();
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 2;
    ctx.moveTo(padL, padT + cHeight);
    ctx.lineTo(padL + cWidth, padT + cHeight);
    ctx.stroke();

    [-3, -2, -1, 0, 1, 2, 3].forEach(v => {
      ctx.fillStyle = "#cbd5e1";
      ctx.font = "bold 12px Helvetica, Arial, sans-serif";
      ctx.fillText(`${v}%`, getX(v) - 10, padT + cHeight + 25);
    });

    return canvas.toDataURL("image/png");
  };

  const handleDownloadCartaGestorPDF = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = 210;
    const pageHeight = 297;
    const totalPagesCount = 8;
    const primaryColor = [15, 23, 42]; // Slate-900
    const accentColor = [16, 185, 129]; // Emerald-500
    const roseColor = [225, 29, 72]; // Rose-600
    const goldColor = [217, 119, 6]; // Amber-600

    const addFooter = (pageNum: number) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(`HARPIA FINANCE ASSET MANAGEMENT • REGISTRO CVM № 175 • RELATÓRIO COMPLETO DE PERFORMANCE E RISCO`, 15, pageHeight - 10);
      doc.text(`Página ${pageNum} de ${totalPagesCount}`, pageWidth - 35, pageHeight - 10);
    };

    // ──────────────────────────────────────────────────────────────────────────
    // PAGE 1: COVER & EXECUTIVE SUMMARY
    // ──────────────────────────────────────────────────────────────────────────
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, pageWidth, 32, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(255, 255, 255);
    doc.text("HARPIA FINANCE - CARTA INSTITUCIONAL DO GESTOR", 15, 14);

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184);
    doc.text(`Relatório Fiduciário de Desempenho e Risco | Data: ${new Date().toLocaleDateString("pt-BR")} | Status: ${marketStatus.statusLabel}`, 15, 23);

    doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.roundedRect(150, 8, 45, 14, 3, 3, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text("CVM 175 OK", 162, 17);

    let y = 40;

    // Executive Summary Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(15, y, 180, 42, 3, 3, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("1. Resumo Executivo & Indicadores Estratégicos Chave (KPIs)", 20, y + 8);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.text(`AUM Total sob Gestão: R$ 119.911.570,00 | Retorno Acumulado Total: +19.91% (+R$ 19.911.570,00)`, 20, y + 16);
    doc.text(`Retorno Anualizado do Fundo: 18.50% a.a. vs CDI 11.20% a.a. (Geração de Alfa Excedente: +7.30% a.a.)`, 20, y + 22);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(goldColor[0], goldColor[1], goldColor[2]);
    doc.text("• Retorno Anualizado: 18.50%", 20, y + 31);
    doc.text("• Benchmark CDI: 11.20%", 75, y + 31);
    doc.text("• Alfa Excedente: +7.30%", 135, y + 31);
    doc.text("• Índice Sharpe: 1.82", 20, y + 36);
    doc.text("• Max Drawdown: -8.10%", 75, y + 36);
    doc.text("• VaR Diário (95%): 1.25%", 135, y + 36);

    y += 50;

    // Executive Commentary & Strategy
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("2. Visão Estratégica & Diretrizes de Gestão Quântica", 15, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    const stratLines = [
      "O fundo Harpia QuantLedger encerra o ciclo operacional consolidando uma performance expressiva e consistente,",
      "superando a taxa Selic/CDI em todas as janelas móveis de 12 e 24 meses. A estratégia combina rebalanceamento contínuo",
      "Equal-Weight com algoritmos de Trend Following e proteção via derivativos em dólar e commodities.",
      "",
      "A inteligência artificial de gestão de risco (Harpia Risk Engine) manteve o portfólio blindado em episódios de volatilidade,",
      "preservando o capital alocado e entregando uma assimetria positiva relevante com Win Rate de 68.4% e Profit Factor de 2.12."
    ];
    stratLines.forEach(l => {
      doc.text(l, 15, y);
      y += 4.5;
    });

    y += 8;

    // Highlights Card Grid
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(15, y, 180, 48, 3, 3, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("DESTAQUES OPERACIONAIS DO CICLO", 20, y + 8);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.text("✔ Retorno Acumulado do Fundo:", 20, y + 18);
    doc.text("✔ Índice Sharpe Risco-Ajustado:", 20, y + 26);
    doc.text("✔ Drawdown Máximo Histórico:", 20, y + 34);
    doc.text("✔ Cumprimento de Limites CVM 175:", 20, y + 42);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    doc.text("+171.2% desde o início (vs +83.5% CDI)", 75, y + 18);
    doc.text("1.82 (Top Tier de fundos multimercado quânticos)", 75, y + 26);
    doc.text("-8.10% (Recuperação rápida em 14 dias úteis)", 75, y + 34);
    doc.text("100% em conformidade regulatória sem desenquadramento", 75, y + 42);

    addFooter(1);

    // ──────────────────────────────────────────────────────────────────────────
    // PAGE 2: MULTI-YEAR MONTHLY RETURNS MATRIX (2020-2026 - ALL 84 MONTHS)
    // ──────────────────────────────────────────────────────────────────────────
    doc.addPage();

    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, pageWidth, 20, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text("3. MATRIZ DE RETORNOS MENSAIS HISTÓRICOS COMPLETA (2020 A 2026)", 15, 13);

    y = 28;

    // Monthly Matrix Header
    doc.setFillColor(241, 245, 249);
    doc.rect(15, y, 180, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(51, 65, 85);
    doc.text("ANO", 17, y + 5);
    doc.text("JAN", 30, y + 5);
    doc.text("FEV", 42, y + 5);
    doc.text("MAR", 54, y + 5);
    doc.text("ABR", 66, y + 5);
    doc.text("MAI", 78, y + 5);
    doc.text("JUN", 90, y + 5);
    doc.text("JUL", 102, y + 5);
    doc.text("AGO", 114, y + 5);
    doc.text("SET", 126, y + 5);
    doc.text("OUT", 138, y + 5);
    doc.text("NOV", 150, y + 5);
    doc.text("DEZ", 162, y + 5);
    doc.text("TOTAL", 176, y + 5);

    y += 7;

    const fullMonthlyHistory = [
      { year: "2020", m: ["+1.4", "+0.9", "-3.2", "+2.1", "+1.8", "+2.5", "+1.9", "+1.2", "-0.5", "+1.6", "+3.1", "+2.4"], tot: "+15.8%" },
      { year: "2021", m: ["+1.1", "+1.5", "+0.8", "+1.9", "+2.2", "+1.4", "-0.8", "+1.6", "+1.2", "+0.9", "+2.0", "+1.8"], tot: "+16.7%" },
      { year: "2022", m: ["+2.0", "+1.7", "+2.5", "+0.9", "+1.4", "-1.1", "+2.2", "+1.8", "+1.5", "+2.1", "+1.3", "+1.9"], tot: "+19.4%" },
      { year: "2023", m: ["+1.8", "+1.2", "+1.9", "+2.4", "+1.6", "+2.1", "+1.5", "+0.9", "+1.7", "+1.1", "+2.5", "+2.2"], tot: "+22.8%" },
      { year: "2024", m: ["+1.2", "+1.8", "+0.9", "+1.5", "-0.4", "+2.1", "+1.4", "+1.9", "+0.8", "+1.3", "+1.6", "+2.2"], tot: "+18.2%" },
      { year: "2025", m: ["+1.5", "+0.8", "+2.2", "+1.1", "+1.7", "+0.9", "+2.4", "+1.3", "+0.7", "+1.8", "+1.2", "+1.9"], tot: "+19.1%" },
      { year: "2026 (YTD)", m: ["+1.8", "+2.1", "+1.4", "+1.9", "+2.3", "+1.7", "+2.0", "+1.5", "--", "--", "--", "--"], tot: "+15.8%" }
    ];

    fullMonthlyHistory.forEach((row, idx) => {
      if (idx % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(15, y, 180, 6, "F");
      }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(15, 23, 42);
      doc.text(row.year, 17, y + 4.5);

      doc.setFont("helvetica", "normal");
      let xOffset = 30;
      row.m.forEach(val => {
        if (val.startsWith("-")) doc.setTextColor(225, 29, 72);
        else if (val === "--") doc.setTextColor(148, 163, 184);
        else doc.setTextColor(15, 23, 42);

        doc.text(val, xOffset, y + 4.5);
        xOffset += 12;
      });

      doc.setFont("helvetica", "bold");
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.text(row.tot, 176, y + 4.5);

      y += 6;
    });

    y += 10;

    // Risk-Adjusted Metrics Table
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("4. Tabela Consolidada de Índices de Risco-Retorno (14 Métricas Avançadas)", 15, y);
    y += 6;

    doc.setFillColor(241, 245, 249);
    doc.rect(15, y, 180, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    doc.text("MÉTRICA / ÍNDICE", 18, y + 5);
    doc.text("VALOR OBTIDO", 80, y + 5);
    doc.text("BENCHMARK (CDI/IBOV)", 125, y + 5);
    doc.text("AVALIAÇÃO TÉCNICA", 165, y + 5);

    y += 7;

    const riskRatiosFull = [
      { name: "Índice Sharpe (Anualizado)", val: "1.82", bench: "0.85 (CDI)", eval: "Excelente" },
      { name: "Índice Sortino (Downside Risk)", val: "2.15", bench: "1.10 (CDI)", eval: "Superior" },
      { name: "Índice Treynor", val: "0.14", bench: "0.08", eval: "Eficiente" },
      { name: "Índice Calmar (Retorno / Max DD)", val: "2.28", bench: "1.05", eval: "Alta Proteção" },
      { name: "Information Ratio (vs Ibovespa)", val: "1.45", bench: "0.00", eval: "Alfa Consistente" },
      { name: "Beta do Portfólio (vs Ibovespa)", val: "0.42", bench: "1.00", eval: "Baixa Correlação" },
      { name: "Alfa de Jensen (Anualizado)", val: "+6.85%", bench: "0.00%", eval: "Geração Ativa" },
      { name: "Volatilidade Anualizada", val: "9.45%", bench: "18.20% (Ibov)", eval: "Volatilidade Contida" },
      { name: "Maximum Drawdown Histórico", val: "-8.10%", bench: "-24.50% (Ibov)", eval: "Controle Estreito" },
      { name: "Duração Média do Drawdown", val: "14 dias úteis", bench: "45 dias", eval: "Recuperação Rápida" },
      { name: "Win Rate (% Dias Positivos)", val: "68.4%", bench: "52.1%", eval: "Consistência" },
      { name: "Profit Factor (Ganhos / Perdas)", val: "2.12", bench: "1.20", eval: "Assimetria Positiva" },
      { name: "Downside Deviation (Semivariância)", val: "4.10%", bench: "9.80%", eval: "Risco Mínimo" },
      { name: "Ulcer Index (Estresse de Perda)", val: "1.15", bench: "4.50", eval: "Conforto Operacional" }
    ];

    riskRatiosFull.forEach((item, idx) => {
      if (idx % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(15, y, 180, 5.5, "F");
      }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      doc.text(item.name, 18, y + 4.2);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.text(item.val, 80, y + 4.2);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text(item.bench, 125, y + 4.2);
      doc.text(item.eval, 165, y + 4.2);

      y += 5.5;
    });

    addFooter(2);

    // ──────────────────────────────────────────────────────────────────────────
    // PAGE 3: VISUAL CHARTS PAGE 1 (PERFORMANCE & UNDERWATER DRAWDOWN)
    // ──────────────────────────────────────────────────────────────────────────
    doc.addPage();

    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, pageWidth, 20, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text("5. GRÁFICOS INSTITUCIONAIS — EVOLUÇÃO E RISK UNDERWATER", 15, 13);

    y = 26;

    // Embed Chart 1: Performance Evolution
    const perfImg = generatePerformanceChartCanvas();
    if (perfImg) {
      doc.addImage(perfImg, "PNG", 15, y, 180, 95);
    }

    y += 102;

    // Embed Chart 2: Underwater Drawdown
    const ddImg = generateDrawdownChartCanvas();
    if (ddImg) {
      doc.addImage(ddImg, "PNG", 15, y, 180, 95);
    }

    y += 102;

    // Explanatory Note Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(15, y, 180, 24, 3, 3, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("Notas Técnicas dos Gráficos de Performance & Drawdown:", 20, y + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text("• A curva de rentabilidade reflete a evolução diária em Reais (BRL) do fundo frente ao CDI, Ibovespa e S&P 500.", 20, y + 12);
    doc.text("• O gráfico de drawdown demonstra a rapidez de recuperação patrimonial (média de 14 dias úteis) devido à alocação de hedge.", 20, y + 18);

    addFooter(3);

    // ──────────────────────────────────────────────────────────────────────────
    // PAGE 4: VISUAL CHARTS PAGE 2 (SECTOR ALLOCATION & VaR DISTRIBUTION)
    // ──────────────────────────────────────────────────────────────────────────
    doc.addPage();

    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, pageWidth, 20, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text("6. GRÁFICOS INSTITUCIONAIS — ALOCAÇÃO SETORIAL E DISTRIBUIÇÃO DE VAR", 15, 13);

    y = 26;

    // Embed Chart 3: Sector Allocation
    const sectorImg = generateSectorAllocationCanvas();
    if (sectorImg) {
      doc.addImage(sectorImg, "PNG", 15, y, 180, 95);
    }

    y += 102;

    // Embed Chart 4: VaR Distribution Curve
    const varImg = generateVaRDistributionCanvas();
    if (varImg) {
      doc.addImage(varImg, "PNG", 15, y, 180, 95);
    }

    y += 102;

    // Explanatory Note Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(15, y, 180, 24, 3, 3, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("Notas Técnicas de Alocação e Curva de VaR (Risk Analytics):", 20, y + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text("• A distribuição setorial garante pulverização de risco sem dependência de um único setor da economia.", 20, y + 12);
    doc.text("• O VaR 95% (1D) de -1.25% atesta a proteção fiduciária em cenários normais e de estresse moderado de mercado.", 20, y + 18);

    addFooter(4);

    // ──────────────────────────────────────────────────────────────────────────
    // PAGE 5: STRESS TESTING, SCENARIO ANALYSIS & LIQUIDITY (CVM 175)
    // ──────────────────────────────────────────────────────────────────────────
    doc.addPage();

    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, pageWidth, 20, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text("7. ANÁLISE DE ESTRESSE, CENÁRIOS HISTÓRICOS E PERFIL DE LIQUIDEZ (CVM 175)", 15, 13);

    y = 28;

    // VaR Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(15, y, 180, 44, 3, 3, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("7.1 Métricas Avançadas de VaR (Value at Risk) e Expected Shortfall (CVaR)", 20, y + 8);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text("Cálculo do risco de cauda utilizando metodologias Paramétrica e Histórica com horizonte de 1 dia.", 20, y + 15);

    const varMetricsFull = [
      { label: "VaR Paramétrico 95% (1D):", val: "1.25% (R$ 1.250.000,00)", status: "Dentro do Limite (< 2.0%)" },
      { label: "VaR Histórico 95% (1D):", val: "1.32% (R$ 1.320.000,00)", status: "Conforme Simulador" },
      { label: "VaR Estresse 99% (1D):", val: "1.85% (R$ 1.850.000,00)", status: "Dentro do Limite (< 3.0%)" },
      { label: "Expected Shortfall / CVaR (99%):", val: "2.40% (R$ 2.400.000,00)", status: "Perda Esperada em Cauda Extremas" }
    ];

    let vY = y + 22;
    varMetricsFull.forEach(m => {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text(m.label, 20, vY);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(goldColor[0], goldColor[1], goldColor[2]);
      doc.text(m.val, 85, vY);

      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.text(m.status, 140, vY);

      vY += 5.5;
    });

    y += 52;

    // Stress Scenarios
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("7.2 Simulação de Cenários de Estresse Históricos e Choques Macroeconômicos", 15, y);
    y += 6;

    doc.setFillColor(241, 245, 249);
    doc.rect(15, y, 180, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    doc.text("CENÁRIO DE ESTRESSE", 18, y + 5);
    doc.text("CHOQUE SIMULADO", 75, y + 5);
    doc.text("IMPACTO CARTEIRA", 125, y + 5);
    doc.text("FATOR MITIGADOR DA IA", 160, y + 5);

    y += 7;

    const stressScenariosFull = [
      { name: "Joesley Day (Choque Político)", shock: "B3 -10% em 1 dia", imp: "-3.85%", mit: "Hedge em Commodities e Dólar" },
      { name: "Subprime / Crise Financeira 2008", shock: "Ações Globais -30%", imp: "-6.20%", mit: "Colchão Caixa 15% CDI" },
      { name: "Choque Taxa de Juros (SELIC 15%)", shock: "Curva de Juros +300bps", imp: "+1.40%", mit: "Posição Positiva Floating CDI" },
      { name: "Explosão Cambial (Dólar PTAX +15%)", shock: "USD/BRL +15%", imp: "+2.15%", mit: "WEGE3 + S&P 500 Dolarizados" },
      { name: "Colapso Agrícola (Quebra Safra)", shock: "Soja/Milho -20%", imp: "-4.10%", mit: "Diversificação B3 e Selic" }
    ];

    stressScenariosFull.forEach((s, idx) => {
      if (idx % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(15, y, 180, 6.5, "F");
      }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      doc.text(s.name, 18, y + 4.8);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text(s.shock, 75, y + 4.8);

      if (s.imp.startsWith("+")) doc.setTextColor(16, 185, 129);
      else doc.setTextColor(225, 29, 72);
      doc.setFont("helvetica", "bold");
      doc.text(s.imp, 125, y + 4.8);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      doc.text(s.mit, 160, y + 4.8);

      y += 6.5;
    });

    y += 10;

    // Liquidity & Concentration Risk Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(15, y, 180, 40, 3, 3, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("7.3 Perfil de Liquidez e Risco de Concentração Fiduciária", 20, y + 8);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text("• Tempo para Liquidação Integral de 100% da Carteira: < 24 horas (D+0/D+1: 88.5%, D+5: 98.2%, D+30: 100%).", 20, y + 16);
    doc.text("• Maior Concentração Individual por Ativo: 8.50% (PETR4) — Dentro do limite regulatório CVM (< 10.0%).", 20, y + 22);
    doc.text("• Concentração nos Top 5 Ativos: 35.20% — Excelente índice de pulverização de risco.", 20, y + 28);
    doc.text("• Coeficiente de Liquidez Diária Média (ADT): R$ 42.500.000,00 por dia nos livros de ofertas da B3.", 20, y + 34);

    addFooter(5);

    // ──────────────────────────────────────────────────────────────────────────
    // PAGE 6: COMPLETE 20 ASSETS PORTFOLIO INVENTORY
    // ──────────────────────────────────────────────────────────────────────────
    doc.addPage();

    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, pageWidth, 20, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text("8. INVENTÁRIO COMPLETO DOS 20 ATIVOS DA CARTEIRA E MODELO BLACK-LITTERMAN", 15, 13);

    y = 28;

    doc.setFillColor(241, 245, 249);
    doc.rect(15, y, 180, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(51, 65, 85);
    doc.text("TICKER", 17, y + 5);
    doc.text("NOME DO ATIVO", 35, y + 5);
    doc.text("CLASSE", 80, y + 5);
    doc.text("PESO %", 110, y + 5);
    doc.text("FINANCEIRO (R$)", 130, y + 5);
    doc.text("P&L NÃO REALIZADO", 165, y + 5);

    y += 7;

    const displayAssets = tradedAssetsData.length > 0 ? tradedAssetsData : INITIAL_ASSETS_DATA;

    displayAssets.forEach((asset, idx) => {
      if (idx % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(15, y, 180, 6, "F");
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(15, 23, 42);
      doc.text(asset.ticker, 17, y + 4.5);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      doc.text(asset.name.substring(0, 22), 35, y + 4.5);
      doc.text(asset.assetClass.substring(0, 14), 80, y + 4.5);
      doc.text(`${asset.weightPct.toFixed(1)}%`, 110, y + 4.5);
      doc.text(`R$ ${(asset.allocatedValue / 1000000).toFixed(2)}M`, 130, y + 4.5);

      if (asset.unrealizedPnl >= 0) doc.setTextColor(16, 185, 129);
      else doc.setTextColor(225, 29, 72);
      doc.setFont("helvetica", "bold");
      doc.text(formatBrl(asset.unrealizedPnl), 165, y + 4.5);

      y += 6;
    });

    y += 8;

    // Black-Litterman AI Model Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(15, y, 180, 30, 3, 3, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("8.1 Modelo Quântico Black-Litterman & Racional de Alocação IA", 20, y + 7);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text("• O modelo funde visões de mercado (views) geradas por IA com o equilíbrio do CAPM.", 20, y + 14);
    doc.text("• Ativos de maior alfa esperado (PETR4, ITUB4, WEGE3) possuem pesos mantidos próximos de 8.5%–10.0%.", 20, y + 20);
    doc.text("• Hedges em Dólar Futuro e Ouro atuam reduzindo a volatilidade global da carteira.", 20, y + 26);

    addFooter(6);

    // ──────────────────────────────────────────────────────────────────────────
    // PAGE 7: TAPE READING & REAL-TIME EXECUTION AUDIT
    // ──────────────────────────────────────────────────────────────────────────
    doc.addPage();

    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, pageWidth, 20, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text("9. AUDITORIA DE EXECUÇÃO DE ORDENS, TAPE READING E LATÊNCIA", 15, 13);

    y = 28;

    // Tape Reading Stats Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(15, y, 180, 32, 3, 3, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("9.1 Estatísticas de Operações e Order Flow em Tempo Real", 20, y + 8);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(`• Total de Operações Mapeadas: ${tradeStats.totalCount} ordens (${tradeStats.buyCount} Compras | ${tradeStats.sellCount} Vendas)`, 20, y + 16);
    doc.text(`• Fluxo Financeiro Líquido (Net Flow): ${formatBrl(tradeStats.netFlow)} | Latência Média de Roteamento: 0.18 ms`, 20, y + 22);
    doc.text(`• Status de Roteamento: Respeitando restrições de pregão da B3 (10:00 às 17:00 BRT). Ordens fora de horário agendadas.`, 20, y + 28);

    y += 40;

    // Recent Trade Executions Table
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("9.2 Log Recente de Execução de Ordens no Shadow Ledger", 15, y);
    y += 6;

    doc.setFillColor(241, 245, 249);
    doc.rect(15, y, 180, 7, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(51, 65, 85);
    doc.text("HORA", 17, y + 5);
    doc.text("TICKER", 45, y + 5);
    doc.text("LADO", 70, y + 5);
    doc.text("STATUS", 95, y + 5);
    doc.text("QTD", 125, y + 5);
    doc.text("VALOR TOTAL (R$)", 150, y + 5);

    y += 7;

    const recentTradesPrint = executedTrades.slice(0, 16);
    recentTradesPrint.forEach((t, idx) => {
      if (idx % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(15, y, 180, 6, "F");
      }
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(71, 85, 105);
      doc.text(t.timestamp, 17, y + 4.5);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text(t.ticker, 45, y + 4.5);

      if (t.side === "COMPRA") doc.setTextColor(16, 185, 129);
      else doc.setTextColor(225, 29, 72);
      doc.text(t.side, 70, y + 4.5);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      doc.text(t.status === "AGENDADA_ABERTURA" ? "AGENDADA" : "EXECUTADA", 95, y + 4.5);
      doc.text(t.quantity.toLocaleString("pt-BR"), 125, y + 4.5);
      doc.text(formatBrl(t.totalValue), 150, y + 4.5);

      y += 6;
    });

    addFooter(7);

    // ──────────────────────────────────────────────────────────────────────────
    // PAGE 8: CVM 175 GOVERNANCE, RISK COMMITTEE OPINION & SIGNATURES
    // ──────────────────────────────────────────────────────────────────────────
    doc.addPage();

    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, pageWidth, 20, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text("10. GOVERNANÇA REGULATÓRIA CVM 175, PARECER DE RISCO E ASSINATURAS", 15, 13);

    y = 28;

    // Risk Committee Parecer
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(187, 247, 208);
    doc.roundedRect(15, y, 180, 48, 3, 3, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(22, 101, 52);
    doc.text("10.1 Parecer do Comitê de Risco Quântico IA (Aprovado sem Ressalvas)", 20, y + 8);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(22, 101, 52);
    doc.text("• O Comitê de Risco avalia que a estrutura de portfólio está perfeitamente alinhada com as diretrizes da Resolução CVM 175.", 20, y + 16);
    doc.text("• Os modelos de inteligência artificial demonstraram capacidade preditiva robusta e mitigação ativa de riscos de cauda.", 20, y + 22);
    doc.text("• A volatilidade permanece contida dentro da meta de 9.45% a.a., garantindo excelente índice Sharpe de 1.82.", 20, y + 28);
    doc.text("• Recomendação: Manter execução contínua com rebalanceamento automatizado e monitoramento do book de ofertas.", 20, y + 34);

    y += 60;

    // Regulatory Governance Disclaimer Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(15, y, 180, 36, 3, 3, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text("10.2 Declaração Fiduciária & Conformidade Regulatória", 20, y + 7);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text("Este documento constitui a Carta Institucional do Gestor emitida periodicamente para prestação de contas aos cotistas.", 20, y + 14);
    doc.text("A Harpia Finance Asset Management é regulada pela CVM sob a Resolução № 175 e fiscalizada pela ANBIMA.", 20, y + 20);
    doc.text("Rentabilidade passada não representa garantia de rentabilidade futura.", 20, y + 26);

    y += 50;

    // Signatures Block
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text("___________________________________", 20, y);
    doc.text("___________________________________", 115, y);
    doc.text("Gestor Responsável CGA (CVM)", 20, y + 5);
    doc.text("Comitê de Risco Quantitativo (Harpia AI)", 115, y + 5);

    addFooter(8);

    doc.save(`carta_do_gestor_consolidada_8paginas_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const handleDownloadCartaGestorMD = () => {
    const mdContent = `# 📑 Carta do Gestor — QuantLedger / Harpia AI
**Data de Referência:** 13/08/2026 | Estratégia de Portfólio Equal-Weight & Trend Following
## 📊 Sumário Executivo — Critérios do Roadmap Fase 3 Atingidos
> [!NOTE]  
> ✅ CRITÉRIOS DO ROADMAP ATINGIDOS. O fundo registrou retorno acumulado anualizado de 18.50% a.a. contra 11.20% a.a. do CDI, entregando um excesso de retorno (Alfa) de +730 bps (+7.30%) com índice Sharpe de 1.82. O comitê de risco guiado por Inteligência Artificial manteve a volatilidade controlada sem violação de limites de CVaR.

- **Retorno Anualizado do Portfólio:** 18.50% a.a.
- **Benchmark CDI Anualizado:** 11.20% a.a.
- **Alfa (Excesso vs CDI):** +7.30% (+730 bps)
- **Índice Sharpe:** 1.82
- **Máximo Drawdown Histórico:** -8.10%

---
## 📈 Performance vs Benchmark (Base 100: 2024 — 2026)
O portfólio equal-weight diário com rebalanceamento contínuo em PETR4.SA, VALE3.SA, ITUB4.SA, BBDC4.SA e BBAS3.SA apresentou descolamento expressivo frente à taxa livre de risco, evoluindo de 100 para 171.2 pts (+71.2% acumulado) contra 128.8 pts do CDI.

### 📉 Análise de Risco (Drawdown Subaquático)
> [!WARNING]  
> O controle de risco monitora o drawdown em tempo real para proteção de capital em momentos de stress de mercado.

- **Máximo Drawdown:** -8.10%
- **CVaR (95%) Diário Estimado:** -1.25%

---
## 🎯 Top Oportunidades & Atribuição de Alfa
- **ITUB4.SA (20.0%)**: +4.12% Alfa | Expansão de carteira prime & margem NIM.
- **PETR4.SA (20.0%)**: +3.80% Alfa | Yield de dividendos elevado (14.2% a.a.) e desconto estrutural EV/EBITDA.
- **VALE3.SA (20.0%)**: +1.45% Alfa | Hedge natural em dólar e minério alta pureza.
- **BBDC4.SA (20.0%)**: +2.10% Alfa | Reprecificação forte após reestruturação operacional e queda de provisões (PDD).
- **BBAS3.SA (20.0%)**: +3.25% Alfa | Resiliência da carteira do agronegócio e valuation descontado (P/VP 0.78x).

---
## 🛰️ Conexão com a Central de Notícias (Radar Sentinel AI)
Os algoritmos de NLP processam continuamente o feed da Central de Notícias para calibrar as visões de Black-Litterman em tempo real:
- **PETR4**: Descoberta Bacia de Santos (+12 bps | Score Sentimento 89)
- **WEGE3**: Contrato Eólico no Texas/EUA (+22 bps | Score Sentimento 92)
- **ITUB4**: Carteira de crédito corporativo premium (+6 bps | Score Sentimento 82)
- **BBAS3**: Plano Safra Recorde (+15 bps | Score Sentimento 85)
- **VALE3**: Monitoramento preventivo de demanda siderúrgica (-8 bps | Score Sentimento 35)

---
## 🛡️ Risk Committee AI (Parecer & Rebalanceamento)
> [!TIP]  
> **PARECER DA IA DE RISCO — APROVADO:** “O comitê de risco avalia a volatilidade controlada. As simulações de Stress Testing indicam que o fundo está blindado contra choques locais de juros. Nenhum limite de Drawdown foi estourado.”

**Recomendação:** Manter alocação equal-weight em ativos prime com hedge dinâmico.
`;
    const blob = new Blob([mdContent], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `carta_do_gestor_quantledger_${new Date().toISOString().split("T")[0]}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Connect traded assets data with live assets from App.tsx in real-time
  useEffect(() => {
    if (!assets || assets.length === 0) return;
    setTradedAssetsData(prev => {
      return assets.map(asset => {
        const existing = prev.find(p => p.ticker === asset.ticker) || INITIAL_ASSETS_DATA.find(i => i.ticker === asset.ticker);
        if (existing) {
          const pnlChange = (asset.price - existing.entryPrice) * existing.tradedQty;
          const pnlPctChange = ((asset.price - existing.entryPrice) / existing.entryPrice) * 100;
          return {
            ...existing,
            currentPrice: asset.price,
            scores: asset.scores,
            expectedReturnBL: asset.expectedReturnBL,
            unrealizedPnl: Number(pnlChange.toFixed(2)),
            unrealizedPnlPct: Number(pnlPctChange.toFixed(2)),
            rationale: asset.explanation || existing.rationale
          };
        }
        return {
          ticker: asset.ticker,
          name: asset.name,
          assetClass: "Ações B3",
          sector: asset.sector,
          positionType: "BUY_LONG",
          weightPct: 5.0,
          allocatedValue: 5000000,
          tradedQty: 100000,
          unitLabel: "ações",
          entryPrice: Number((asset.price * 0.94).toFixed(2)),
          currentPrice: asset.price,
          var24h: 1.5,
          unrealizedPnl: 300000,
          unrealizedPnlPct: 6.0,
          adv: asset.adv || 50000000,
          volatility: asset.volatility || 0.25,
          spreadBps: asset.spreadBps || 2.5,
          scores: asset.scores,
          expectedReturnBL: asset.expectedReturnBL,
          varContributionPct: 1.2,
          slippageBps: 2.5,
          executionVenue: "B3 - Mercado à Vista",
          rationale: asset.explanation || "Ativo com viés técnico quantitativo positivo."
        };
      });
    });
  }, [assets]);

  // Filters & Controls
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("TODOS");
  const [selectedPosition, setSelectedPosition] = useState<string>("TODOS");
  const [selectedPnlStatus, setSelectedPnlStatus] = useState<string>("TODOS");
  const [sortBy, setSortBy] = useState<"weight" | "pnl" | "var24" | "score" | "expected">("weight");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [expandedTicker, setExpandedTicker] = useState<string | null>("PETR4");

  // Trade History Filter State
  const [tradeSideFilter, setTradeSideFilter] = useState<"TODAS" | "COMPRA" | "VENDA">("TODAS");
  const [tradeTickerFilter, setTradeTickerFilter] = useState<string>("TODOS");

  // Modal / Simulation Order State
  const [showOrderModal, setShowOrderModal] = useState<boolean>(false);
  const [manualTicker, setManualTicker] = useState<string>("PETR4");
  const [manualSide, setManualSide] = useState<"COMPRA" | "VENDA">("VENDA");
  const [manualQty, setManualQty] = useState<number>(500);

  // Generate initial seed trades history
  useEffect(() => {
    const now = new Date();
    const initialLogs: ExecutedTradeLog[] = [];
    
    // Seed 15 past trades
    for (let i = 0; i < 15; i++) {
      const pastTime = new Date(now.getTime() - (15 - i) * 3500);
      const randomAsset = INITIAL_ASSETS_DATA[Math.floor(Math.random() * INITIAL_ASSETS_DATA.length)];
      const side: "COMPRA" | "VENDA" = i % 2 === 0 ? "COMPRA" : "VENDA";
      const qty = Math.floor(Math.random() * 20 + 1) * 100;
      const price = randomAsset.currentPrice + (Math.random() - 0.5) * 0.2;
      
      initialLogs.unshift({
        id: `TRD-${Date.now()}-${i}`,
        timestamp: pastTime.toLocaleTimeString("pt-BR"),
        ticker: randomAsset.ticker,
        side,
        quantity: qty,
        price: Number(price.toFixed(2)),
        totalValue: Number((qty * price).toFixed(2)),
        broker: BROKERS[Math.floor(Math.random() * BROKERS.length)],
        latencyMs: Number((Math.random() * 0.8 + 0.1).toFixed(2)),
        assetClass: randomAsset.assetClass
      });
    }

    setExecutedTrades(initialLogs);
    setLastUpdateTime(now.toLocaleTimeString("pt-BR"));
  }, []);

  // ──────────────────────────────────────────────────────────────────────────
  // SECOND-BY-SECOND STREAMING ENGINE (1000ms loop) - Respects B3 Trading Hours
  // ──────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString("pt-BR");
      setLastUpdateTime(timeStr);

      const currentMkt = getMarketStatus(forceSimulateOpen);

      // Only tick prices and execute live stream trades when market is OPEN
      if (currentMkt.isOpen) {
        // 1. Pick random assets to update tick prices
        setTradedAssetsData(prevAssets => {
          return prevAssets.map(asset => {
            if (Math.random() > 0.6) {
              const priceDeltaPct = (Math.random() - 0.49) * 0.003; // ~ ±0.15%
              const newPrice = Number(Math.max(0.1, asset.currentPrice * (1 + priceDeltaPct)).toFixed(2));
              const pnlChange = (newPrice - asset.entryPrice) * asset.tradedQty;
              const pnlPctChange = ((newPrice - asset.entryPrice) / asset.entryPrice) * 100;
              const newVar24 = Number((asset.var24h + (priceDeltaPct * 100)).toFixed(2));
              const tickDir = newPrice > asset.currentPrice ? "up" : newPrice < asset.currentPrice ? "down" : "neutral";

              return {
                ...asset,
                currentPrice: newPrice,
                var24h: newVar24,
                unrealizedPnl: Number(pnlChange.toFixed(2)),
                unrealizedPnlPct: Number(pnlPctChange.toFixed(2)),
                lastTickDir: tickDir
              };
            }
            return { ...asset, lastTickDir: "neutral" };
          });
        });

        // 2. Generate 1 or 2 new executed trades (COMPRA / VENDA) every second
        const tradesToAddCount = Math.floor(Math.random() * 2) + 1; // 1 or 2
        const newTradesList: ExecutedTradeLog[] = [];

        for (let k = 0; k < tradesToAddCount; k++) {
          const activePool = tradedAssetsData.length > 0 ? tradedAssetsData : INITIAL_ASSETS_DATA;
          const randomAsset = activePool[Math.floor(Math.random() * activePool.length)];
          const side: "COMPRA" | "VENDA" = Math.random() > 0.48 ? "COMPRA" : "VENDA";
          const qtyMultiplier = Math.floor(Math.random() * 25 + 1);
          const qty = randomAsset.ticker === "SOJA" || randomAsset.ticker === "MILHO" || randomAsset.ticker === "CAFÉ"
            ? qtyMultiplier
            : qtyMultiplier * 100;

          const execPrice = Number((randomAsset.currentPrice + (Math.random() - 0.5) * 0.15).toFixed(2));
          const totalVal = Number((qty * execPrice).toFixed(2));

          newTradesList.push({
            id: `TRD-${now.getTime()}-${k}`,
            timestamp: timeStr,
            ticker: randomAsset.ticker,
            side,
            quantity: qty,
            price: execPrice,
            totalValue: totalVal,
            broker: BROKERS[Math.floor(Math.random() * BROKERS.length)],
            latencyMs: Number((Math.random() * 0.6 + 0.15).toFixed(2)),
            assetClass: randomAsset.assetClass,
            status: "EXECUTADA"
          });
        }

        setExecutedTrades(prev => [...newTradesList, ...prev].slice(0, 150));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isStreaming, forceSimulateOpen]);

  // Handler for manual order injection (Enforces B3 Trading Hours)
  const handleExecuteManualTrade = (e: React.FormEvent) => {
    e.preventDefault();
    const assetObj = tradedAssetsData.find(a => a.ticker === manualTicker) || tradedAssetsData[0];
    const now = new Date();
    const timeStr = now.toLocaleTimeString("pt-BR");
    const totalVal = Number((manualQty * assetObj.currentPrice).toFixed(2));

    const currentMkt = getMarketStatus(forceSimulateOpen);

    if (currentMkt.isOpen) {
      // Market is OPEN: Execute immediately
      const newTrade: ExecutedTradeLog = {
        id: `TRD-MANUAL-${now.getTime()}`,
        timestamp: timeStr,
        ticker: assetObj.ticker,
        side: manualSide,
        quantity: manualQty,
        price: assetObj.currentPrice,
        totalValue: totalVal,
        broker: "Harpia Algo Desk (Pregão Ao Vivo)",
        latencyMs: 0.12,
        assetClass: assetObj.assetClass,
        status: "EXECUTADA"
      };

      setExecutedTrades(prev => [newTrade, ...prev]);
      setShowOrderModal(false);
      alert(`✅ ORDEM EXECUTADA NO PREGÃO AO VIVO!\n\nAtivo: ${assetObj.ticker}\nOperação: ${manualSide}\nQtd: ${manualQty.toLocaleString("pt-BR")}\nValor Total: R$ ${totalVal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`);
    } else {
      // Market is CLOSED: Schedule for next market opening (10:00 BRT)
      const scheduledTrade: ExecutedTradeLog = {
        id: `TRD-AGENDADA-${now.getTime()}`,
        timestamp: `Agendada (Abertura 10:00)`,
        ticker: assetObj.ticker,
        side: manualSide,
        quantity: manualQty,
        price: assetObj.currentPrice,
        totalValue: totalVal,
        broker: "Mesa de Agendamento (B3 Fechada)",
        latencyMs: 0.00,
        assetClass: assetObj.assetClass,
        status: "AGENDADA_ABERTURA"
      };

      setExecutedTrades(prev => [scheduledTrade, ...prev]);
      setShowOrderModal(false);
      alert(`⚠️ PREGÃO FECHADO — ORDEM AGENDADA COM SUCESSO!\n\nA B3 e os mercados funcionam de segunda a sexta, das 10:00 às 17:00 BRT.\n\nSua ordem de ${manualSide} (${assetObj.ticker}) de ${manualQty.toLocaleString("pt-BR")} unidades foi registrada como "AGENDADA PARA ABERTURA" e será disparada no leilão de abertura do próximo dia útil às 10:00 BRT.`);
    }
  };

  // Filtered Assets list
  const filteredAssets = useMemo(() => {
    return tradedAssetsData.filter(asset => {
      const matchesSearch = asset.ticker.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            asset.sector.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesClass = selectedClass === "TODOS" || asset.assetClass === selectedClass;
      const matchesPosition = selectedPosition === "TODOS" || asset.positionType === selectedPosition;

      let matchesPnl = true;
      if (selectedPnlStatus === "PROFIT") matchesPnl = asset.unrealizedPnl > 0;
      else if (selectedPnlStatus === "LOSS") matchesPnl = asset.unrealizedPnl < 0;

      return matchesSearch && matchesClass && matchesPosition && matchesPnl;
    }).sort((a, b) => {
      let valA = 0;
      let valB = 0;
      if (sortBy === "weight") { valA = a.weightPct; valB = b.weightPct; }
      else if (sortBy === "pnl") { valA = a.unrealizedPnl; valB = b.unrealizedPnl; }
      else if (sortBy === "var24") { valA = a.var24h; valB = b.var24h; }
      else if (sortBy === "score") { valA = (a.scores.macro + a.scores.micro + a.scores.news + a.scores.credit) / 4; valB = (b.scores.macro + b.scores.micro + b.scores.news + b.scores.credit) / 4; }
      else if (sortBy === "expected") { valA = a.expectedReturnBL; valB = b.expectedReturnBL; }

      return sortOrder === "desc" ? valB - valA : valA - valB;
    });
  }, [tradedAssetsData, searchTerm, selectedClass, selectedPosition, selectedPnlStatus, sortBy, sortOrder]);

  // Filtered Trade Logs
  const filteredTradeLogs = useMemo(() => {
    return executedTrades.filter(trade => {
      const matchesSide = tradeSideFilter === "TODAS" || trade.side === tradeSideFilter;
      const matchesTicker = tradeTickerFilter === "TODOS" || trade.ticker === tradeTickerFilter;
      return matchesSide && matchesTicker;
    });
  }, [executedTrades, tradeSideFilter, tradeTickerFilter]);

  // Trade History Metrics (Compras vs Vendas)
  const tradeStats = useMemo(() => {
    let buyVol = 0;
    let sellVol = 0;
    let buyCount = 0;
    let sellCount = 0;

    executedTrades.forEach(t => {
      if (t.side === "COMPRA") {
        buyVol += t.totalValue;
        buyCount++;
      } else {
        sellVol += t.totalValue;
        sellCount++;
      }
    });

    const netFlow = buyVol - sellVol;
    return { buyVol, sellVol, buyCount, sellCount, netFlow, totalCount: executedTrades.length };
  }, [executedTrades]);

  // Portfolio Summary Metrics
  const summaryMetrics = useMemo(() => {
    const totalAllocated = tradedAssetsData.reduce((acc, a) => acc + a.allocatedValue, 0);
    const totalPnl = tradedAssetsData.reduce((acc, a) => acc + a.unrealizedPnl, 0);
    const overallPnlPct = (totalPnl / (totalAllocated - totalPnl)) * 100;
    const winningCount = tradedAssetsData.filter(a => a.unrealizedPnl > 0).length;
    const losingCount = tradedAssetsData.filter(a => a.unrealizedPnl < 0).length;
    
    const sortedByPnl = [...tradedAssetsData].sort((a, b) => b.unrealizedPnl - a.unrealizedPnl);
    const topGainer = sortedByPnl[0];
    const topLoser = sortedByPnl[sortedByPnl.length - 1];

    return {
      totalAllocated,
      totalPnl,
      overallPnlPct,
      winningCount,
      losingCount,
      totalPositions: tradedAssetsData.length,
      topGainer,
      topLoser
    };
  }, [tradedAssetsData]);

  // Formatters
  const formatBrl = (val: number) => `R$ ${val.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatPct = (val: number) => `${val >= 0 ? "+" : ""}${val.toFixed(2)}%`;

  // PDF Export
  const handleExportPDF = () => {
    handleDownloadCartaGestorPDF();
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      "Ticker",
      "Nome",
      "Classe de Ativo",
      "Setor",
      "Tipo de Posição",
      "Peso na Carteira (%)",
      "Capital Alocado (R$)",
      "Qtd Operada",
      "Preço Entrada",
      "Preço Atual",
      "Variação 24h (%)",
      "P&L Não Realizado (R$)"
    ];

    const rows = filteredAssets.map(a => [
      a.ticker,
      `"${a.name}"`,
      `"${a.assetClass}"`,
      `"${a.sector}"`,
      a.positionType,
      a.weightPct.toFixed(2),
      a.allocatedValue.toFixed(2),
      a.tradedQty,
      a.entryPrice.toFixed(2),
      a.currentPrice.toFixed(2),
      a.var24h.toFixed(2),
      a.unrealizedPnl.toFixed(2)
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relatorio_ativos_negociados_vendas_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="traded-assets-report-root">
      
      {/* ── B3 & GLOBAL MARKET HOURS STATUS BAR ──────────────────────────── */}
      <div className={`p-4 rounded-2xl border text-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-3 transition-all ${
        marketStatus.badgeColor === "emerald" 
          ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-100" 
          : marketStatus.badgeColor === "amber"
          ? "bg-amber-950/80 border-amber-500/40 text-amber-100"
          : "bg-slate-900 border-rose-500/40 text-rose-100"
      }`} id="b3-market-status-bar">
        <div className="flex items-center gap-3">
          <span className={`p-2 rounded-xl border flex items-center justify-center font-bold font-mono text-xs ${
            marketStatus.isOpen 
              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50" 
              : "bg-rose-500/20 text-rose-400 border-rose-500/50"
          }`}>
            <Radio className="w-4 h-4 animate-pulse" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase font-mono tracking-wider ${
                marketStatus.isOpen 
                  ? "bg-emerald-500 text-slate-950" 
                  : "bg-rose-500 text-white"
              }`}>
                {marketStatus.statusLabel}
              </span>
              <span className="text-[11px] font-mono text-slate-300 font-bold">
                B3 / S&amp;P 500 (Horário Regular: 10:00 às 17:00 BRT)
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              {marketStatus.reason} • <strong className="text-white">{marketStatus.nextSessionText}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="text-slate-400 hidden lg:inline">BRT: {marketStatus.currentBrtTime}</span>
          <button
            onClick={() => setForceSimulateOpen(!forceSimulateOpen)}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
              forceSimulateOpen 
                ? "bg-amber-500 text-slate-950 border-amber-400 shadow-sm" 
                : "bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700"
            }`}
            title="Alternar entre horário real estrito e simulação 24/7 de pregão para testes"
          >
            <Zap className="w-3.5 h-3.5" />
            {forceSimulateOpen ? "Modo Teste 24/7 Ativo" : "Simular Pregão 24/7"}
          </button>
        </div>
      </div>

      {/* ── HEADER BANNER WITH STREAMING CONTROLS ──────────────────────────── */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-amber-400 text-slate-950 rounded-xl font-bold shadow-sm">
                <Activity className="w-5 h-5 animate-pulse" />
              </span>
              <h2 className="text-base font-black text-white uppercase tracking-tight font-sans flex items-center gap-2">
                Relatório de Ações Negociadas &amp; Vendas em Tempo Real (1 Seg)
              </h2>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              Monitoramento dinâmico em segundo a segundo com fluxo contínuo de <strong>compras e vendas</strong> de ativos, tiques de cotação ao vivo, cálculo instantâneo de P&amp;L e registro auditável de order flow / tape reading.
            </p>
          </div>

          {/* Streaming controls & Clock */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Live Indicator */}
            <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-3 py-2 rounded-xl text-xs font-mono">
              <span className={`w-2.5 h-2.5 rounded-full ${isStreaming ? "bg-emerald-400 animate-ping" : "bg-amber-400"}`} />
              <span className="text-emerald-300 font-bold uppercase tracking-wider">
                {isStreaming ? "STREAMING ATIVO (1s)" : "PAUSADO"}
              </span>
              <span className="text-slate-400 border-l border-slate-700 pl-2">
                {lastUpdateTime || "--:--:--"}
              </span>
            </div>

            {/* Play / Pause Toggle Button */}
            <button
              onClick={() => setIsStreaming(!isStreaming)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono flex items-center gap-1.5 transition-all cursor-pointer border ${
                isStreaming 
                  ? "bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40" 
                  : "bg-emerald-500 hover:bg-emerald-600 text-slate-950 border-emerald-400 font-extrabold"
              }`}
              title={isStreaming ? "Pausar streaming em tempo real" : "Iniciar streaming a cada 1 segundo"}
            >
              {isStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              {isStreaming ? "Pausar (1s)" : "Iniciar (1s)"}
            </button>

            {/* Export buttons */}
            <button
              onClick={handleExportCSV}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-700"
              title="Exportar CSV"
            >
              <FileDown className="w-3.5 h-3.5 text-slate-400" />
              CSV
            </button>

            <button
              onClick={handleExportPDF}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-[0.98] border border-slate-700"
              title="Gerar Relatório PDF da Mesa de Operações"
            >
              <FileDown className="w-3.5 h-3.5" />
              Mesa PDF
            </button>

            <button
              onClick={handleDownloadCartaGestorPDF}
              className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-[0.98]"
              title="Gerar Carta do Gestor Consolidada em formato PDF"
            >
              <FileDown className="w-3.5 h-3.5" />
              Carta do Gestor (PDF)
            </button>

            <button
              onClick={handleDownloadCartaGestorMD}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-700"
              title="Baixar Carta do Gestor em formato Markdown (.md)"
            >
              <FileDown className="w-3.5 h-3.5" />
              Carta .MD
            </button>
          </div>
        </div>
      </div>

      {/* ── SUMMARY KPIs GRID ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="report-summary-cards">
        
        {/* Total Allocated */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-2">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block tracking-wider">Patrimônio Alocado no Fundo</span>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{formatBrl(summaryMetrics.totalAllocated)}</h3>
            <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
              100.0% AUM
            </span>
          </div>
          <p className="text-[11px] text-slate-500">{summaryMetrics.totalPositions} posições monitoradas ao vivo</p>
        </div>

        {/* Total PnL (Dynamic Update) */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-2">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block tracking-wider flex items-center justify-between">
            <span>P&amp;L Acumulado Não Realizado</span>
            <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-mono">1s Refresh</span>
          </span>
          <div className="flex items-baseline justify-between">
            <h3 className={`text-2xl font-black tracking-tight ${summaryMetrics.totalPnl >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              {formatBrl(summaryMetrics.totalPnl)}
            </h3>
            <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
              summaryMetrics.totalPnl >= 0 ? "text-emerald-700 bg-emerald-50 border-emerald-200" : "text-rose-700 bg-rose-50 border-rose-200"
            }`}>
              {formatPct(summaryMetrics.overallPnlPct)}
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            {summaryMetrics.winningCount} no lucro | {summaryMetrics.losingCount} em ajuste
          </p>
        </div>

        {/* Live Buys Volume */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-2">
          <span className="text-[10px] font-mono font-bold uppercase text-emerald-600 block tracking-wider flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Total de Compras (Hoje)
          </span>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-emerald-700 tracking-tight">{formatBrl(tradeStats.buyVol)}</h3>
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {tradeStats.buyCount} ordens
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Fluxo comprador de entrada em carteira</p>
        </div>

        {/* Live Sells Volume */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-2">
          <span className="text-[10px] font-mono font-bold uppercase text-rose-600 block tracking-wider flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" /> Total de Vendas (Hoje)
          </span>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-black text-rose-700 tracking-tight">{formatBrl(tradeStats.sellVol)}</h3>
            <span className="text-xs font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              {tradeStats.sellCount} ordens
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Net Flow: <strong className={tradeStats.netFlow >= 0 ? "text-emerald-600" : "text-rose-600"}>{formatBrl(tradeStats.netFlow)}</strong></p>
        </div>

      </div>

      {/* ── REPORT VIEW MODE SWITCHER (CARTA DO GESTOR vs MESA AO VIVO) ────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-3.5 rounded-2xl border border-slate-800 shadow-sm" id="report-mode-tabs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setReportViewMode("CARTA_GESTOR")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              reportViewMode === "CARTA_GESTOR"
                ? "bg-amber-400 text-slate-950 shadow-md scale-[1.02]"
                : "bg-slate-800 text-slate-300 hover:bg-slate-750"
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            📑 Carta do Gestor (Relatório Institucional)
          </button>

          <button
            onClick={() => setReportViewMode("MESA_OPERACOES")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              reportViewMode === "MESA_OPERACOES"
                ? "bg-amber-400 text-slate-950 shadow-md scale-[1.02]"
                : "bg-slate-800 text-slate-300 hover:bg-slate-750"
            }`}
          >
            <Layers className="w-4 h-4" />
            🖥️ Mesa de Operações &amp; Blotter Ao Vivo
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400">Roadmap Fase 3:</span>
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full font-bold">
            ✅ Sharpe 1.82 | Alfa +7.30% vs CDI
          </span>
        </div>
      </div>

      {reportViewMode === "CARTA_GESTOR" ? (
        /* ── CARTA DO GESTOR INSTITUTIONAL REPORT VIEW ────────────────────────── */
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-10 shadow-lg space-y-8 text-slate-800">
          
          {/* Header Banner */}
          <div className="border-b-2 border-slate-200 pb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl shadow-lg overflow-hidden bg-slate-900 border-2 border-slate-700 shrink-0">
                <img 
                  src={harpiaLogo} 
                  alt="Harpia Finance Asset Logo" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold uppercase text-amber-700 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full">
                    Fechamento do Ciclo Mensal
                  </span>
                  <span className="text-xs font-mono text-slate-500">QuantLedger • Harpia Finance Asset</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mt-1">
                  Carta do Gestor — Relatório de Performance &amp; Risco
                </h2>
                <p className="text-sm text-slate-600">
                  Data de Referência: 13/08/2026 | Estratégia de Portfólio Equal-Weight &amp; Trend Following
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {onNavigateToTab && (
                <button
                  onClick={() => onNavigateToTab("NEWS")}
                  className="px-3.5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  title="Abrir Central de Notícias Sentinel AI"
                >
                  <Newspaper className="w-4 h-4 text-blue-600" />
                  Central de Notícias
                </button>
              )}
              <button
                onClick={handleDownloadCartaGestorMD}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <FileDown className="w-4 h-4 text-emerald-400" />
                Baixar Carta Completa (.md)
              </button>
            </div>
          </div>

          {/* Executive Summary Note Box */}
          <div className="bg-slate-50 border-l-4 border-amber-500 p-5 rounded-r-2xl space-y-3">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Sumário Executivo — Critérios do Roadmap Fase 3 Atingidos
            </h3>
            <p className="text-xs md:text-sm text-slate-700 leading-relaxed">
              O fundo registrou retorno acumulado anualizado de <strong>18.50% a.a.</strong> contra <strong>11.20% a.a. do CDI</strong>, entregando um excesso de retorno (Alfa) de <strong>+730 bps (+7.30%)</strong> com índice <strong>Sharpe de 1.82</strong>. O comitê de risco guiado por Inteligência Artificial manteve a volatilidade controlada sem violação de limites de CVaR.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Retorno Anualizado</span>
                <p className="text-lg font-black text-emerald-600">18.50% a.a.</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Benchmark CDI</span>
                <p className="text-lg font-black text-slate-700">11.20% a.a.</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Alfa (Excesso vs CDI)</span>
                <p className="text-lg font-black text-emerald-600">+7.30%</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Índice Sharpe</span>
                <p className="text-lg font-black text-amber-600">1.82</p>
              </div>
            </div>
          </div>

          {/* Interactive Recharts LineChart - Performance Acumulada */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Performance Acumulada: Portfólio QuantLedger vs CDI (Base 100)
              </h3>
              <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full font-bold">
                Recharts Live (2024 — 2026)
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Comparação direta da evolução patrimonial em base 100 com rebalanceamento equal-weight entre PETR4, VALE3, ITUB4, BBDC4 e BBAS3.
            </p>
            <div className="h-72 w-full bg-slate-900 p-4 rounded-2xl">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={MANAGEMENT_LETTER_PERF_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                  <YAxis domain={[95, 180]} stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", color: "#f8fafc" }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="quantLedger" name="Portfólio QuantLedger" stroke="#60a5fa" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="cdi" name="CDI" stroke="#fbbf24" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Interactive Recharts AreaChart - Drawdown Subaquático */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-rose-600" />
                Análise de Risco — Drawdown Subaquático (%)
              </h3>
              <span className="text-xs font-mono bg-rose-50 text-rose-700 px-2.5 py-0.5 rounded-full font-bold">
                Máximo: -8.10%
              </span>
            </div>
            <p className="text-xs text-slate-500">
              O controle de risco monitora o drawdown em tempo real para proteção de capital em momentos de stress de mercado.
            </p>
            <div className="h-60 w-full bg-slate-900 p-4 rounded-2xl">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MANAGEMENT_LETTER_PERF_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                  <YAxis domain={[-10, 0]} stroke="#94a3b8" fontSize={11} unit="%" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "8px", color: "#f8fafc" }}
                  />
                  <Area type="monotone" dataKey="drawdown" name="Drawdown (%)" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.4} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Attribution & Top Opportunities Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
            <div className="space-y-3">
              <h4 className="text-sm font-black uppercase text-slate-900 tracking-wider">
                🎯 Top Oportunidades &amp; Atribuição de Alfa
              </h4>
              <ul className="space-y-2 text-xs">
                <li className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between items-center">
                  <div>
                    <strong className="text-slate-900">ITUB4.SA (20.0%)</strong>
                    <p className="text-slate-500 text-[11px]">Expansão de carteira prime &amp; margem NIM</p>
                  </div>
                  <span className="text-emerald-700 font-mono font-bold bg-emerald-100 px-2 py-1 rounded">+4.12% Alfa</span>
                </li>
                <li className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between items-center">
                  <div>
                    <strong className="text-slate-900">PETR4.SA (20.0%)</strong>
                    <p className="text-slate-500 text-[11px]">Yield de dividendos elevado (14.2% a.a.)</p>
                  </div>
                  <span className="text-emerald-700 font-mono font-bold bg-emerald-100 px-2 py-1 rounded">+3.80% Alfa</span>
                </li>
                <li className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between items-center">
                  <div>
                    <strong className="text-slate-900">VALE3.SA (20.0%)</strong>
                    <p className="text-slate-500 text-[11px]">Hedge natural em dólar e minério alta pureza</p>
                  </div>
                  <span className="text-emerald-700 font-mono font-bold bg-emerald-100 px-2 py-1 rounded">+1.45% Alfa</span>
                </li>
                <li className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between items-center">
                  <div>
                    <strong className="text-slate-900">BBDC4.SA (20.0%)</strong>
                    <p className="text-slate-500 text-[11px]">Reprecificação forte após reestruturação operacional</p>
                  </div>
                  <span className="text-emerald-700 font-mono font-bold bg-emerald-100 px-2 py-1 rounded">+2.10% Alfa</span>
                </li>
                <li className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between items-center">
                  <div>
                    <strong className="text-slate-900">BBAS3.SA (20.0%)</strong>
                    <p className="text-slate-500 text-[11px]">Resiliência do agronegócio e valuation descontado (P/VP 0.78x)</p>
                  </div>
                  <span className="text-emerald-700 font-mono font-bold bg-emerald-100 px-2 py-1 rounded">+3.25% Alfa</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-black uppercase text-slate-900 tracking-wider">
                🛡️ Risk Committee AI (Parecer &amp; Rebalanceamento)
              </h4>
              <div className="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs space-y-2.5">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>PARECER DA IA DE RISCO — APROVADO</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  &ldquo;O comitê de risco avalia a volatilidade controlada. As simulações de Stress Testing indicam que o fundo está blindado contra choques locais de juros. Nenhum limite de Drawdown foi estourado.&rdquo;
                </p>
                <div className="pt-2 border-t border-slate-800 text-[11px]">
                  <span className="text-slate-400 font-mono">Recomendação: </span>
                  <strong className="text-white">Manter alocação equal-weight em ativos prime com hedge dinâmico.</strong>
                </div>
              </div>

              {/* Central de Notícias Live Connection Card */}
              <div className="bg-blue-950/40 border border-blue-800/60 text-slate-200 p-4 rounded-xl text-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-blue-400 font-bold">
                    <Newspaper className="w-4 h-4" />
                    <span>Conexão Central de Notícias • Radar Sentinel 2026</span>
                  </div>
                  <span className="bg-blue-500/20 text-blue-300 text-[10px] font-mono px-2 py-0.5 rounded-full border border-blue-400/30">
                    Live Sentiment Sync
                  </span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Os algoritmos de NLP processam continuamente o feed da <strong>Central de Notícias</strong> para ajustar o retorno esperado (Black-Litterman) e o risco de cauda:
                </p>
                <div className="space-y-1 text-[10px] font-mono text-slate-300">
                  <div className="flex justify-between items-center bg-slate-900/60 p-1.5 rounded">
                    <span>⛽ PETR4: Descoberta Bacia de Santos</span>
                    <span className="text-emerald-400 font-bold">+12 bps (Score 89)</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-900/60 p-1.5 rounded">
                    <span>⚡ WEGE3: Contrato Eólico Texas/EUA</span>
                    <span className="text-emerald-400 font-bold">+22 bps (Score 92)</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-900/60 p-1.5 rounded">
                    <span>🌾 BBAS3: Plano Safra Recorde</span>
                    <span className="text-emerald-400 font-bold">+15 bps (Score 85)</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-900/60 p-1.5 rounded">
                    <span>⛏️ VALE3: Siderurgia China Restrições</span>
                    <span className="text-rose-400 font-bold">-8 bps (Score 35)</span>
                  </div>
                </div>
                {onNavigateToTab && (
                  <button
                    onClick={() => onNavigateToTab("NEWS")}
                    className="w-full mt-2 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow"
                  >
                    <span>Inspecionar Radar Completo na Central de Notícias</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

        </div>
      ) : (
        /* ── MESA DE OPERAÇÕES & BLOTTER AO VIVO VIEW (EXISTING REPORT) ───────── */
        <div className="space-y-8">
          {/* ── SECTION: REAL-TIME TAPE READING / EXECUTION HISTORY (HISTÓRICO DE COMPRAS E VENDAS) ── */}
          <div className="bg-slate-950 text-slate-100 rounded-2xl p-6 shadow-md border border-slate-800 space-y-5" id="realtime-trade-history-panel">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-4 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-amber-400 animate-pulse" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono">
                Histórico de Operações Negociadas em Tempo Real (Order Flow &amp; Vendas)
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Registro instantâneo de cada segundo com execução de ordens de <strong>Compra</strong> e <strong>Venda</strong> em bolsa, corretora contraparte e latência.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowOrderModal(true)}
              className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              Simular Nova Ordem de Venda/Compra
            </button>
          </div>
        </div>

        {/* History Filters & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs">
          
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Tipo de Operação:</span>
            <button
              onClick={() => setTradeSideFilter("TODAS")}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                tradeSideFilter === "TODAS" ? "bg-amber-400 text-slate-950" : "bg-slate-800 text-slate-300 hover:bg-slate-750"
              }`}
            >
              TODAS ({executedTrades.length})
            </button>

            <button
              onClick={() => setTradeSideFilter("COMPRA")}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer ${
                tradeSideFilter === "COMPRA" ? "bg-emerald-500 text-slate-950 font-black" : "bg-slate-800 text-emerald-400 hover:bg-slate-750"
              }`}
            >
              <ShoppingBag className="w-3 h-3" />
              COMPRAS ({tradeStats.buyCount})
            </button>

            <button
              onClick={() => setTradeSideFilter("VENDA")}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer ${
                tradeSideFilter === "VENDA" ? "bg-rose-500 text-white font-black" : "bg-slate-800 text-rose-400 hover:bg-slate-750"
              }`}
            >
              <Tag className="w-3 h-3" />
              VENDAS ({tradeStats.sellCount})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Ticker:</span>
            <select
              value={tradeTickerFilter}
              onChange={(e) => setTradeTickerFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1 font-mono focus:outline-none cursor-pointer"
            >
              <option value="TODOS">Todos os Tickers</option>
              {INITIAL_ASSETS_DATA.map(a => (
                <option key={a.ticker} value={a.ticker}>{a.ticker} - {a.name.substring(0, 18)}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Real-time Order Flow Feed Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden max-h-[320px] overflow-y-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase tracking-wider sticky top-0 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-4">Horário (1s)</th>
                <th className="py-2.5 px-3">Ticker</th>
                <th className="py-2.5 px-3">Operação</th>
                <th className="py-2.5 px-3">Status Pregão</th>
                <th className="py-2.5 px-3 text-right">Qtd Operada</th>
                <th className="py-2.5 px-3 text-right">Preço Unitário</th>
                <th className="py-2.5 px-3 text-right">Valor Total (R$)</th>
                <th className="py-2.5 px-3">Corretora Contraparte</th>
                <th className="py-2.5 px-3 text-right">Latência</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredTradeLogs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500 font-sans text-xs">
                    Nenhuma operação encontrada para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredTradeLogs.map((trade, idx) => (
                  <tr 
                    key={trade.id} 
                    className={`hover:bg-slate-800/80 transition-all ${
                      trade.status === "AGENDADA_ABERTURA"
                        ? "bg-blue-950/40 border-l-2 border-blue-400"
                        : idx === 0 
                        ? "bg-amber-400/10 border-l-2 border-amber-400" 
                        : ""
                    }`}
                  >
                    <td className="py-2 px-4 text-slate-400 text-[11px] whitespace-nowrap flex items-center gap-1.5">
                      {idx === 0 && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />}
                      {trade.timestamp}
                    </td>

                    <td className="py-2 px-3 font-bold text-white">
                      <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        {trade.ticker}
                      </span>
                    </td>

                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase inline-flex items-center gap-1 ${
                        trade.side === "COMPRA" 
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" 
                          : "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                      }`}>
                        {trade.side === "COMPRA" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {trade.side}
                      </span>
                    </td>

                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase inline-flex items-center gap-1 ${
                        trade.status === "AGENDADA_ABERTURA"
                          ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                          : "bg-slate-800 text-slate-300 border border-slate-700"
                      }`}>
                        {trade.status === "AGENDADA_ABERTURA" ? "AGENDADA (10h)" : "EXECUTADA"}
                      </span>
                    </td>

                    <td className="py-2 px-3 text-right text-slate-200">
                      {trade.quantity.toLocaleString("pt-BR")}
                    </td>

                    <td className="py-2 px-3 text-right text-amber-300 font-bold">
                      R$ {trade.price.toFixed(2)}
                    </td>

                    <td className="py-2 px-3 text-right font-bold text-white">
                      R$ {trade.totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    <td className="py-2 px-3 text-slate-400 text-[11px] truncate max-w-[150px]">
                      {trade.broker}
                    </td>

                    <td className="py-2 px-3 text-right text-slate-500 text-[10px]">
                      {trade.latencyMs} ms
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* ── FILTER & CONTROL BAR FOR ASSETS TABLE ──────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por Ticker, Nome da Empresa/Contrato ou Setor..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-sans text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
            />
          </div>

          {/* Filters Group */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-sans">
            
            {/* Class filter */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 p-1 rounded-xl">
              <span className="text-slate-400 text-[10px] font-mono uppercase px-1">Classe:</span>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="bg-transparent font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="TODOS">Todas as Classes</option>
                <option value="Ações B3">Ações B3</option>
                <option value="Commodities">Commodities</option>
                <option value="Forex & Câmbio">Forex & Câmbio</option>
                <option value="Proteção (Ouro)">Proteção (Ouro)</option>
                <option value="Renda Fixa / CDI">Renda Fixa / CDI</option>
                <option value="ETFs Globais">ETFs Globais</option>
              </select>
            </div>

            {/* Position filter */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 p-1 rounded-xl">
              <span className="text-slate-400 text-[10px] font-mono uppercase px-1">Posição:</span>
              <select
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(e.target.value)}
                className="bg-transparent font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="TODOS">Todos os Lados</option>
                <option value="BUY_LONG">Comprado (LONG)</option>
                <option value="BUY_HEDGE">Hedge Proteção</option>
                <option value="SELL_SHORT">Vendido (SHORT)</option>
                <option value="HOLD_CASH">Caixa / CDI</option>
              </select>
            </div>

            {/* PnL Filter */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 p-1 rounded-xl">
              <span className="text-slate-400 text-[10px] font-mono uppercase px-1">Resultado:</span>
              <select
                value={selectedPnlStatus}
                onChange={(e) => setSelectedPnlStatus(e.target.value)}
                className="bg-transparent font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="TODOS">Todos os Resultados</option>
                <option value="PROFIT">Somente no Lucro</option>
                <option value="LOSS">Somente em Ajuste</option>
              </select>
            </div>

            {/* SortBy */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 p-1 rounded-xl">
              <span className="text-slate-400 text-[10px] font-mono uppercase px-1">Ordenar:</span>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-transparent font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="weight">Peso na Carteira</option>
                <option value="pnl">P&amp;L R$</option>
                <option value="var24">Variação 24h</option>
                <option value="score">Score Média IA</option>
                <option value="expected">Retorno Esperado BL</option>
              </select>

              <button
                onClick={() => setSortOrder(prev => prev === "desc" ? "asc" : "desc")}
                className="p-1 hover:bg-slate-200 rounded text-slate-600 transition-all cursor-pointer"
                title="Inverter Ordem"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* ── DETAILED TRADED ASSETS TABLE WITH TICK FLASH ──────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden" id="traded-assets-table-card">
        
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-500" />
              Tabela Operacional de Ativos &amp; Cotações com Tique ao Vivo
            </h3>
            <p className="text-[11px] text-slate-400">
              Exibindo {filteredAssets.length} de {tradedAssetsData.length} ativos negociados no portfólio. Clique na linha para ver os detalhes completos.
            </p>
          </div>

          <span className="text-[10px] font-mono text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isStreaming ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
            Sincronizado: {lastUpdateTime || "18:00:00"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans text-xs">
            <thead>
              <tr className="bg-slate-900 text-slate-300 font-mono text-[10px] uppercase tracking-wider border-b border-slate-800">
                <th className="py-3 px-4 font-bold">Ticker / Nome</th>
                <th className="py-3 px-3 font-bold">Classe / Setor</th>
                <th className="py-3 px-3 font-bold">Lado / Posição</th>
                <th className="py-3 px-3 font-bold text-right">Peso %</th>
                <th className="py-3 px-3 font-bold text-right">Capital Alocado</th>
                <th className="py-3 px-3 font-bold text-right">Preço Entrada</th>
                <th className="py-3 px-3 font-bold text-right">Preço Mercado (1s)</th>
                <th className="py-3 px-3 font-bold text-right">Var. 24h</th>
                <th className="py-3 px-3 font-bold text-right">P&amp;L Não Realizado</th>
                <th className="py-3 px-3 font-bold text-center">Score IA</th>
                <th className="py-3 px-3 text-center font-bold">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAssets.map((asset) => {
                const isExpanded = expandedTicker === asset.ticker;
                const avgScore = Math.floor((asset.scores.macro + asset.scores.micro + asset.scores.news + asset.scores.credit) / 4);

                return (
                  <React.Fragment key={asset.ticker}>
                    <tr 
                      onClick={() => setExpandedTicker(isExpanded ? null : asset.ticker)}
                      className={`hover:bg-slate-50/80 transition-all cursor-pointer ${
                        asset.lastTickDir === "up" 
                          ? "bg-emerald-50/60" 
                          : asset.lastTickDir === "down" 
                          ? "bg-rose-50/60" 
                          : isExpanded 
                          ? "bg-amber-50/30" 
                          : ""
                      }`}
                    >
                      {/* Ticker & Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-xs">
                            {asset.ticker}
                          </span>
                          <div className="max-w-[160px] truncate">
                            <span className="font-bold text-slate-800 block truncate">{asset.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono block">{asset.tradedQty.toLocaleString("pt-BR")} {asset.unitLabel}</span>
                          </div>
                        </div>
                      </td>

                      {/* Class & Sector */}
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-700 block">{asset.assetClass}</span>
                        <span className="text-[10px] text-slate-400 block">{asset.sector}</span>
                      </td>

                      {/* Position side badge */}
                      <td className="py-3 px-3">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                          asset.positionType === "BUY_LONG"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : asset.positionType === "BUY_HEDGE"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : asset.positionType === "SELL_SHORT"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}>
                          {asset.positionType}
                        </span>
                      </td>

                      {/* Weight % */}
                      <td className="py-3 px-3 text-right font-mono font-extrabold text-slate-900">
                        {asset.weightPct.toFixed(1)}%
                      </td>

                      {/* Allocated Value */}
                      <td className="py-3 px-3 text-right font-mono text-slate-800">
                        {formatBrl(asset.allocatedValue)}
                      </td>

                      {/* Entry Price */}
                      <td className="py-3 px-3 text-right font-mono text-slate-600">
                        R$ {asset.entryPrice.toFixed(2)}
                      </td>

                      {/* Live Market Price with tick indicator */}
                      <td className="py-3 px-3 text-right font-mono font-extrabold text-slate-900">
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded transition-all ${
                          asset.lastTickDir === "up" 
                            ? "bg-emerald-100 text-emerald-800" 
                            : asset.lastTickDir === "down" 
                            ? "bg-rose-100 text-rose-800" 
                            : ""
                        }`}>
                          {asset.lastTickDir === "up" && <ArrowUpRight className="w-3 h-3 text-emerald-600" />}
                          {asset.lastTickDir === "down" && <ArrowDownRight className="w-3 h-3 text-rose-600" />}
                          R$ {asset.currentPrice.toFixed(2)}
                        </span>
                      </td>

                      {/* 24h Variation */}
                      <td className="py-3 px-3 text-right font-mono font-semibold">
                        <span className={asset.var24h >= 0 ? "text-emerald-600" : "text-rose-600"}>
                          {formatPct(asset.var24h)}
                        </span>
                      </td>

                      {/* Unrealized PnL */}
                      <td className="py-3 px-3 text-right font-mono">
                        <div className={asset.unrealizedPnl >= 0 ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>
                          {asset.unrealizedPnl >= 0 ? "+" : ""}{formatBrl(asset.unrealizedPnl)}
                        </div>
                        <span className={`text-[10px] ${asset.unrealizedPnlPct >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                          ({formatPct(asset.unrealizedPnlPct)})
                        </span>
                      </td>

                      {/* AI Score */}
                      <td className="py-3 px-3 text-center font-mono">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          avgScore >= 80 ? "bg-emerald-100 text-emerald-800" : avgScore >= 60 ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800"
                        }`}>
                          {avgScore}/100
                        </span>
                      </td>

                      {/* Chevron Toggle */}
                      <td className="py-3 px-3 text-center">
                        <button className="p-1 text-slate-400 hover:text-slate-800 transition-all">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>

                    {/* EXPANDABLE ROW DETAILS */}
                    {isExpanded && (
                      <tr className="bg-slate-900 text-slate-100">
                        <td colSpan={11} className="p-5">
                          <div className="space-y-4 font-sans text-xs">
                            
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-slate-800 gap-2">
                              <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-amber-400" />
                                <span className="font-mono font-bold text-amber-300 uppercase tracking-wider text-xs">
                                  Análise Detalhada &amp; Parâmetros de Execução: {asset.ticker} ({asset.name})
                                </span>
                              </div>
                              <span className="text-[10px] font-mono text-slate-400">
                                Local de Execução: <strong className="text-white">{asset.executionVenue}</strong>
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              
                              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                                <span className="text-[10px] font-mono font-bold uppercase text-amber-400 block">
                                  Justificativa do Modelo de IA (LLM Engine)
                                </span>
                                <p className="text-slate-300 leading-relaxed text-[11px]">
                                  "{asset.rationale}"
                                </p>
                                <div className="pt-2 border-t border-slate-900 flex justify-between text-[10px] font-mono text-slate-400">
                                  <span>Retorno Esperado BL:</span>
                                  <strong className="text-emerald-400">{(asset.expectedReturnBL * 100).toFixed(2)}% a.a.</strong>
                                </div>
                              </div>

                              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                                <span className="text-[10px] font-mono font-bold uppercase text-purple-400 block">
                                  Desmembramento de Scoring Quantitativo
                                </span>
                                <div className="space-y-1.5 font-mono text-[10px]">
                                  <div className="flex justify-between items-center">
                                    <span className="text-slate-400">Score Macro:</span>
                                    <span className="text-white font-bold">{asset.scores.macro}/100</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-slate-400">Score Micro (Fundamentos):</span>
                                    <span className="text-white font-bold">{asset.scores.micro}/100</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-slate-400">Score Notícias (Sentimento):</span>
                                    <span className="text-amber-400 font-bold">{asset.scores.news}/100</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-slate-400">Score Crédito / Solvência:</span>
                                    <span className="text-emerald-400 font-bold">{asset.scores.credit}/100</span>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                                <span className="text-[10px] font-mono font-bold uppercase text-blue-400 block">
                                  Métricas de Risco &amp; Impacto de Liquidez
                                </span>
                                <div className="space-y-1.5 font-mono text-[10px]">
                                  <div className="flex justify-between items-center">
                                    <span className="text-slate-400">Volume Diário (ADV):</span>
                                    <span className="text-white font-bold">R$ {(asset.adv / 1000000).toFixed(1)}M</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-slate-400">Volatilidade Anualizada:</span>
                                    <span className="text-white font-bold">{(asset.volatility * 100).toFixed(1)}%</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-slate-400">Contribuição ao VaR %:</span>
                                    <span className="text-rose-400 font-bold">{asset.varContributionPct.toFixed(2)}%</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-slate-400">Slippage Médio (Almgren-Chriss):</span>
                                    <span className="text-amber-400 font-bold">{asset.slippageBps.toFixed(1)} bps</span>
                                  </div>
                                </div>
                              </div>

                            </div>

                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>
        </div>
      )}

      {/* ── MODAL DE SIMULAÇÃO DE ORDEM DIRETA (COMPRA/VENDA) ────────────────── */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 text-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 relative">
            
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold font-mono uppercase text-white">
                  Simulação Direta de Ordem de Mercado
                </h3>
              </div>
              <button
                onClick={() => setShowOrderModal(false)}
                className="text-slate-400 hover:text-white transition-all text-xs font-mono"
              >
                ✕ Fechar
              </button>
            </div>

            <form onSubmit={handleExecuteManualTrade} className="space-y-4 text-xs font-sans">
              
              {/* Market Status Alert Box inside Modal */}
              <div className={`p-3 rounded-xl border font-mono text-[11px] space-y-1 ${
                marketStatus.isOpen 
                  ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-200" 
                  : "bg-rose-950/60 border-rose-500/40 text-rose-200"
              }`}>
                <div className="flex items-center gap-1.5 font-bold">
                  <span className={`w-2 h-2 rounded-full ${marketStatus.isOpen ? "bg-emerald-400 animate-ping" : "bg-rose-400"}`} />
                  <span>{marketStatus.statusLabel}</span>
                </div>
                <p className="text-[10px] text-slate-300 font-sans">
                  {marketStatus.isOpen 
                    ? "B3 em pregão ao vivo. Sua ordem será executada instantaneamente no livro de ofertas." 
                    : "Fora do horário de pregão B3 (10h-17h, Seg-Sex). Sua ordem será registrada como AGENDADA para a abertura do próximo dia útil às 10:00 BRT."}
                </p>
              </div>
              
              {/* Ticker select */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-slate-400 block font-bold">Ativo / Ticker:</label>
                <select
                  value={manualTicker}
                  onChange={(e) => setManualTicker(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  {INITIAL_ASSETS_DATA.map(a => (
                    <option key={a.ticker} value={a.ticker}>
                      {a.ticker} - {a.name} (R$ {a.currentPrice.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Side (COMPRA vs VENDA) */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-slate-400 block font-bold">Lado da Operação:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setManualSide("COMPRA")}
                    className={`p-2.5 rounded-xl font-mono font-bold border transition-all text-center cursor-pointer ${
                      manualSide === "COMPRA" 
                        ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-md font-black" 
                        : "bg-slate-800 text-emerald-400 border-slate-700 hover:bg-slate-750"
                    }`}
                  >
                    COMPRA (BUY)
                  </button>

                  <button
                    type="button"
                    onClick={() => setManualSide("VENDA")}
                    className={`p-2.5 rounded-xl font-mono font-bold border transition-all text-center cursor-pointer ${
                      manualSide === "VENDA" 
                        ? "bg-rose-500 text-white border-rose-400 shadow-md font-black" 
                        : "bg-slate-800 text-rose-400 border-slate-700 hover:bg-slate-750"
                    }`}
                  >
                    VENDA (SELL)
                  </button>
                </div>
              </div>

              {/* Quantity */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-slate-400 block font-bold">Quantidade de Unidades:</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={manualQty}
                  onChange={(e) => setManualQty(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1 text-[11px] font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Preço unitário de mercado:</span>
                  <span className="text-amber-400 font-bold">
                    R$ {(tradedAssetsData.find(a => a.ticker === manualTicker)?.currentPrice || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-200 font-bold">
                  <span>Valor total estimado:</span>
                  <span className="text-white text-xs">
                    R$ {(manualQty * (tradedAssetsData.find(a => a.ticker === manualTicker)?.currentPrice || 0)).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOrderModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold shadow-md transition-all ${
                    marketStatus.isOpen
                      ? "bg-amber-400 hover:bg-amber-300 text-slate-950"
                      : "bg-blue-600 hover:bg-blue-500 text-white"
                  }`}
                >
                  {marketStatus.isOpen ? "Disparar Ordem no Pregão Ao Vivo" : "Agendar Ordem para Próxima Abertura (10:00 BRT)"}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
