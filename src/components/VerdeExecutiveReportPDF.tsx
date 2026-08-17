/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Componente: Relatório de Gestão & Resumo Gerencial no Padrão Verde Asset Management
 * Layout, Tipografia e Estrutura idênticos ao PDF Institucional CVM 175
 * Integração com dados dinâmicos da Simulação Quantitativa e Séries Históricas
 */

import React, { useState, useMemo, useRef } from "react";
import {
  FileText,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Shield,
  Layers,
  Sparkles,
  RefreshCw,
  Eye,
  Sliders,
  CheckCircle2,
  Calendar,
  Building2,
  BarChart2,
  FileCheck,
  Copy,
  Check,
  Award
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  Cell,
  ReferenceLine
} from "recharts";
import jsPDF from "jspdf";
import harpiaFinanceLogo from "../assets/images/harpia_finance_asset_logo_1786654503116.jpg";

export type FundType = "MULTIMERCADO" | "ACOES_BR" | "ACOES_GLOBAIS";

interface VerdeExecutiveReportPDFProps {
  initialFund?: FundType;
  simulationMonth?: string;
  onNavigateToSimulation?: () => void;
}

export default function VerdeExecutiveReportPDF({
  initialFund = "MULTIMERCADO",
  simulationMonth = "2026-07",
  onNavigateToSimulation
}: VerdeExecutiveReportPDFProps) {
  const [selectedFund, setSelectedFund] = useState<FundType>(initialFund);
  const [activePage, setActivePage] = useState<number>(1);
  const [selectedMonth, setSelectedMonth] = useState<string>(simulationMonth);
  const [viewMode, setViewMode] = useState<"SINGLE_PAGE" | "ALL_PAGES">("SINGLE_PAGE");
  const [copied, setCopied] = useState(false);

  // Month labels helper
  const formatMonthName = (m: string) => {
    const parts = m.split("-");
    const year = parts[0];
    const monthNum = parseInt(parts[1], 10);
    const months = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    return `${months[monthNum - 1]} de ${year}`;
  };

  // Fund configurations based on the 3 Harpia Finance Asset PDFs
  const fundConfigs = {
    MULTIMERCADO: {
      name: "HARPIA FIF CIC MULTIMERCADO RL",
      shortName: "Harpia Multimercado",
      typeLabel: "Fundo Multimercado Macro",
      anbimaCategory: "Multimercado Macro",
      cnpj: "22.187.946/0001-41",
      inceptionDate: "21/mai/2015*",
      legacyDate: "02/jan/1997",
      benchmark: "CDI",
      benchLabel: "CDI",
      admFee: "1,50% sobre o patrimônio líquido do fundo, apropriada diariamente, com pagamento mensal",
      perfFee: "20% que exceder a 100% do CDI",
      minApp: "R$ 5.000,00",
      minBal: "R$ 5.000,00",
      minMov: "R$ 2.000,00",
      quoteApp: "D+0",
      quoteRed: "D+1",
      liqRed: "D+0",
      carencia: "Não há",
      tributacao: "Longo Prazo",
      taxaSaida: "Não há",
      status: "Fechado para novas aplicações",
      admin: "Intrag Distribuidora De Títulos E Valores Mobiliários Ltda.",
      gestor: "Harpia Finance Asset Management S.A.",
      targetAudience: "Fundo destinado ao público em geral, observados os valores mínimos de aplicação inicial, permanência e movimentação constantes no prospecto.",
      description: "Estratégia multimercado flagship lançada em 1997, sob chancela Harpy Capital. Atua no mercado brasileiro e internacional de ações, renda fixa e moedas sob gestão quantitativa e fundamentalista com governança CVM 175.",
      // Desempenho do Mês
      monthReturn: 1.09,
      monthBench: 1.22,
      monthIbov: 3.47,
      ytdReturn: 8.18,
      ytdBench: 8.14,
      ytdIbov: 10.47,
      ret12m: 16.81,
      bench12m: 14.71,
      annualizedReturn: 21.93,
      annualizedBench: 13.54,
      volAnual: 8.47,
      volBench: 0.37,
      sharpe: 0.99,
      posMonths: 290,
      negMonths: 64,
      aboveBenchMonths: 218,
      belowBenchMonths: 136,
      maxMonthReturn: 63.45,
      minMonthReturn: -11.46,
      currentPl: "882.907.778,00",
      avg12mPl: "863.986.666,52",
      cumFundTotal: 34422.93,
      cumBenchTotal: 4123.91,
      // Breakdown table
      breakdown: {
        currencies: {
          dolar: { month: -0.04, ytd: 0.90 },
          moedas: { month: 0.00, ytd: -0.06 },
          total: { month: -0.04, ytd: 0.84 }
        },
        fixedIncome: {
          diPre: { month: 0.00, ytd: 0.07 },
          cupomCambial: { month: 0.00, ytd: 0.00 },
          rfInflacao: { month: 0.19, ytd: 0.04 },
          globalRates: { month: -0.14, ytd: 0.02 },
          credito: { month: 0.02, ytd: -1.04 },
          total: { month: 0.07, ytd: -0.90 }
        },
        equities: {
          total: { month: 0.11, ytd: 1.56 }
        },
        consolidated: {
          cdi: { month: 1.22, ytd: 8.14 },
          currenciesRF: { month: -0.09, ytd: -0.64 },
          equities: { month: 0.11, ytd: 1.56 },
          custos: { month: -0.14, ytd: -0.87 },
          total: { month: 1.09, ytd: 8.18 }
        }
      },
      waterfallData: [
        { name: "CDI", value: 8.14, base: 0, isTotal: false, display: "8,14%" },
        { name: "Book Ações", value: 1.56, base: 8.14, isTotal: false, display: "+1,56%" },
        { name: "Book Moedas", value: 0.84, base: 9.70, isTotal: false, display: "+0,84%" },
        { name: "Outros", value: -0.58, base: 9.96, isTotal: false, display: "-0,58%" },
        { name: "Book Renda Fixa", value: -0.90, base: 9.06, isTotal: false, display: "-0,90%" },
        { name: "Custos", value: -0.87, base: 8.18, isTotal: false, display: "-0,87%" },
        { name: "TOTAL", value: 8.18, base: 0, isTotal: true, display: "8,18%" }
      ]
    },
    ACOES_BR: {
      name: "HARPIA AM AÇÕES FIC FIF AÇÕES RL",
      shortName: "Harpia Ações Brasil",
      typeLabel: "Fundo de Ações Livre",
      anbimaCategory: "Ações Livre",
      cnpj: "23.243.536/0001-33",
      inceptionDate: "21/fev/2017",
      legacyDate: "21/fev/2017",
      benchmark: "IBOVESPA",
      benchLabel: "Ibovespa",
      admFee: "2,00% sobre o patrimônio líquido do fundo, apropriada diariamente, com pagamento mensal",
      perfFee: "20% do que exceder o IBOVESPA a.a.",
      minApp: "R$ 10.000,00",
      minBal: "R$ 10.000,00",
      minMov: "R$ 5.000,00",
      quoteApp: "D+1",
      quoteRed: "D+29",
      liqRed: "D+31",
      carencia: "Não há",
      tributacao: "Ações",
      taxaSaida: "10% dos valores líquidos resgatados",
      status: "Aberto para novas aplicações",
      admin: "BNY Mellon Serviços Financeiros DTVM S.A.",
      gestor: "Harpia Finance Asset Management S.A.",
      targetAudience: "O FUNDO é destinado a receber aplicações do público em geral, observados os valores mínimos de aplicação inicial, de movimentação e saldo de permanência.",
      description: "Estratégia de ações que busca retornos consistentes e preservação de capital por meio de uma carteira de investimentos em ações e instrumentos de renda fixa e câmbio. O processo de gestão se baseia em forte análise fundamentalista.",
      monthReturn: 0.77,
      monthBench: 3.47,
      monthIbov: 3.47,
      ytdReturn: 3.25,
      ytdBench: 10.47,
      ytdIbov: 10.47,
      ret12m: 24.43,
      bench12m: 33.76,
      annualizedReturn: 16.07,
      annualizedBench: 15.27,
      volAnual: 23.19,
      volBench: 18.50,
      sharpe: 0.85,
      posMonths: 72,
      negMonths: 41,
      aboveBenchMonths: 65,
      belowBenchMonths: 48,
      maxMonthReturn: 18.29,
      minMonthReturn: -31.47,
      currentPl: "39.619.962,10",
      avg12mPl: "43.799.803,20",
      cumFundTotal: 63.54,
      cumBenchTotal: 157.78,
      breakdown: {
        currencies: {
          dolar: { month: 0.00, ytd: 0.00 },
          moedas: { month: 0.00, ytd: 0.00 },
          total: { month: 0.00, ytd: 0.00 }
        },
        fixedIncome: {
          diPre: { month: 0.00, ytd: 0.00 },
          cupomCambial: { month: 0.00, ytd: 0.00 },
          rfInflacao: { month: 0.05, ytd: 0.20 },
          globalRates: { month: 0.00, ytd: 0.00 },
          credito: { month: 0.00, ytd: 0.00 },
          total: { month: 0.05, ytd: 0.20 }
        },
        equities: {
          total: { month: 0.84, ytd: 3.92 }
        },
        consolidated: {
          cdi: { month: 1.22, ytd: 8.14 },
          currenciesRF: { month: 0.05, ytd: 0.20 },
          equities: { month: 0.84, ytd: 3.92 },
          custos: { month: -0.12, ytd: -0.87 },
          total: { month: 0.77, ytd: 3.25 }
        }
      },
      waterfallData: [
        { name: "IBOV", value: 10.47, base: 0, isTotal: false, display: "10,47%" },
        { name: "Petrobras/Prio", value: 2.15, base: 10.47, isTotal: false, display: "+2,15%" },
        { name: "Utilities/Copel", value: 1.40, base: 12.62, isTotal: false, display: "+1,40%" },
        { name: "Construção/Tenda", value: -1.25, base: 12.77, isTotal: false, display: "-1,25%" },
        { name: "Juros/Alpha", value: -8.65, base: 4.12, isTotal: false, display: "-8,65%" },
        { name: "Custos", value: -0.87, base: 3.25, isTotal: false, display: "-0,87%" },
        { name: "TOTAL", value: 3.25, base: 0, isTotal: true, display: "3,25%" }
      ]
    },
    ACOES_GLOBAIS: {
      name: "HARPIA AM MUNDI AÇÕES GLOBAIS BRL FIF AÇÕES RL",
      shortName: "Harpia Mundi Globais",
      typeLabel: "Ações Investimento no Exterior",
      anbimaCategory: "Ações Investimento no Exterior",
      cnpj: "37.013.129/0001-44",
      inceptionDate: "29/jun/2020",
      legacyDate: "29/jun/2020",
      benchmark: "MSCI ACWI em BRL",
      benchLabel: "MSCI ACWI",
      admFee: "1,50% sobre o patrimônio líquido do fundo, apropriada diariamente, com pagamento mensal",
      perfFee: "10% do que exceder o MSCI ACWI Net Total Return USD Index",
      minApp: "R$ 1.000,00",
      minBal: "R$ 500,00",
      minMov: "R$ 500,00",
      quoteApp: "D+1",
      quoteRed: "D+5 (dias corridos)",
      liqRed: "D+5 úteis após a cotização",
      carencia: "Não há",
      tributacao: "Ações",
      taxaSaida: "Não há",
      status: "Aberto para novas aplicações",
      admin: "Intrag Distribuidora De Títulos E Valores Mobiliários Ltda.",
      gestor: "Harpia Finance Asset Management S.A.",
      targetAudience: "O FUNDO é destinado exclusivamente a receber aplicações de investidores qualificados, assim definidos nos termos da regulamentação em vigor na CVM.",
      description: "Estratégia de ações global, com foco em análise 100% fundamentalista. O produto é local, denominado em Reais e hedgeado contra a variação do Dólar, proporcionando proteção contra depreciação cambial.",
      monthReturn: -3.45,
      monthBench: 0.08,
      monthIbov: 3.47,
      ytdReturn: 2.07,
      ytdBench: 11.33,
      ytdIbov: 10.47,
      ret12m: 9.50,
      bench12m: 22.11,
      annualizedReturn: 16.07,
      annualizedBench: 15.27,
      volAnual: 16.13,
      volBench: 13.64,
      sharpe: 0.34,
      posMonths: 46,
      negMonths: 27,
      aboveBenchMonths: 40,
      belowBenchMonths: 33,
      maxMonthReturn: 10.38,
      minMonthReturn: -8.40,
      currentPl: "77.979.673,27",
      avg12mPl: "81.336.551,17",
      cumFundTotal: 147.25,
      cumBenchTotal: 137.10,
      breakdown: {
        currencies: {
          dolar: { month: -0.10, ytd: -0.45 },
          moedas: { month: 0.00, ytd: 0.00 },
          total: { month: -0.10, ytd: -0.45 }
        },
        fixedIncome: {
          diPre: { month: 0.00, ytd: 0.00 },
          cupomCambial: { month: 0.00, ytd: 0.00 },
          rfInflacao: { month: 0.00, ytd: 0.00 },
          globalRates: { month: 0.00, ytd: 0.00 },
          credito: { month: 0.00, ytd: 0.00 },
          total: { month: 0.00, ytd: 0.00 }
        },
        equities: {
          total: { month: -3.22, ytd: 2.65 }
        },
        consolidated: {
          cdi: { month: 0.08, ytd: 11.33 },
          currenciesRF: { month: -0.10, ytd: -0.45 },
          equities: { month: -3.22, ytd: 2.65 },
          custos: { month: -0.13, ytd: -0.13 },
          total: { month: -3.45, ytd: 2.07 }
        }
      },
      waterfallData: [
        { name: "MSCI ACWI", value: 11.33, base: 0, isTotal: false, display: "11,33%" },
        { name: "Amazon/Cloud", value: 2.80, base: 11.33, isTotal: false, display: "+2,80%" },
        { name: "Semis & AI Vol", value: -4.10, base: 10.03, isTotal: false, display: "-4,10%" },
        { name: "FTAI/Leasing", value: -3.20, base: 6.83, isTotal: false, display: "-3,20%" },
        { name: "Hedges/Câmbio", value: -4.63, base: 2.20, isTotal: false, display: "-4,63%" },
        { name: "Custos", value: -0.13, base: 2.07, isTotal: false, display: "-0,13%" },
        { name: "TOTAL", value: 2.07, base: 0, isTotal: true, display: "2,07%" }
      ]
    }
  };

  const currentConfig = fundConfigs[selectedFund];

  // Matriz de rentabilidade histórica completa (1997 a 2026 como no PDF Verde)
  const historicalMatrixData = [
    { year: 2026, jan: 3.03, fev: 1.44, mar: 0.05, abr: 2.71, mai: 0.33, jun: -0.69, jul: 1.09, ago: "-", set: "-", out: "-", nov: "-", dez: "-", acumAno: 8.18, cdiAno: 8.14, acumFdo: "34.422,93", acumCdi: "4.123,91" },
    { year: 2025, jan: 1.64, fev: 0.55, mar: 0.58, abr: 1.90, mai: 1.31, jun: 0.97, jul: 0.22, ago: 2.27, set: 1.99, out: 1.41, nov: 1.06, dez: 1.01, acumAno: 15.94, cdiAno: 14.31, acumFdo: "31.811,05", acumCdi: "3.805,79" },
    { year: 2024, jan: -0.28, fev: 0.89, mar: 1.52, abr: -3.83, mai: 2.53, jun: 1.66, jul: 1.44, ago: 0.72, set: 1.70, out: -0.18, nov: 3.29, dez: 2.20, acumAno: 12.10, cdiAno: 10.87, acumFdo: "27.422,96", acumCdi: "3.316,75" },
    { year: 2023, jan: 2.74, fev: 0.04, mar: -0.41, abr: -0.03, mai: 0.89, jun: 1.62, jul: 2.24, ago: 0.00, set: 0.85, out: -0.42, nov: 2.91, dez: 3.32, acumAno: 14.53, cdiAno: 13.05, acumFdo: "24.451,62", acumCdi: "2.981,65" },
    { year: 2022, jan: 1.49, fev: 1.32, mar: 4.19, abr: 1.02, mai: 1.31, jun: -1.86, jul: 1.54, ago: 2.34, set: -0.46, out: 3.51, nov: -0.30, dez: 0.93, acumAno: 15.93, cdiAno: 12.37, acumFdo: "21.336,72", acumCdi: "2.625,98" },
    { year: 2021, jan: 0.68, fev: -0.24, mar: 1.47, abr: 1.20, mai: 0.58, jun: -0.21, jul: -2.16, ago: 0.33, set: -0.12, out: -4.39, nov: -0.24, dez: 2.14, acumAno: -1.13, cdiAno: 4.40, acumFdo: "18.390,98", acumCdi: "2.325,83" },
    { year: 2020, jan: -0.19, fev: -2.86, mar: -11.46, abr: 8.61, mai: 2.52, jun: 0.91, jul: 2.05, ago: 1.33, set: -1.22, out: -0.49, nov: 4.45, dez: 1.49, acumAno: 3.94, cdiAno: 2.77, acumFdo: "18.601,56", acumCdi: "2.223,70" },
    { year: 2019, jan: 3.77, fev: 0.09, mar: 0.42, abr: 0.86, mai: 1.28, jun: 1.49, jul: 0.44, ago: 0.18, set: 1.30, out: 0.89, nov: 0.00, dez: 1.92, acumAno: 13.33, cdiAno: 5.97, acumFdo: "17.893,01", acumCdi: "2.161,12" },
    { year: 2018, jan: 3.05, fev: 0.12, mar: 0.58, abr: -0.18, mai: -1.80, jun: 0.29, jul: 1.10, ago: 0.70, set: -0.30, out: 3.77, nov: 0.55, dez: -0.13, acumAno: 7.91, cdiAno: 6.42, acumFdo: "15.776,46", acumCdi: "2.033,78" },
    { year: 2017, jan: 0.11, fev: 1.35, mar: 1.11, abr: 0.43, mai: -0.88, jun: 0.45, jul: 1.89, ago: 0.37, set: 0.51, out: -0.38, nov: -0.43, dez: 0.62, acumAno: 5.25, cdiAno: 9.95, acumFdo: "14.612,59", acumCdi: "1.904,99" }
  ];

  // Cumulative performance chart series (Log/Scale curve matching Verde PDF)
  const chartPerformanceData = useMemo(() => {
    return [
      { date: "jan-97", fund: 0, cdi: 0 },
      { date: "jan-99", fund: 135, cdi: 100 },
      { date: "jan-01", fund: 405, cdi: 135 },
      { date: "jan-03", fund: 1288, cdi: 304 },
      { date: "jan-05", fund: 1945, cdi: 459 },
      { date: "jan-07", fund: 3316, cdi: 619 },
      { date: "jan-09", fund: 4705, cdi: 788 },
      { date: "jan-11", fund: 6042, cdi: 988 },
      { date: "jan-13", fund: 8572, cdi: 1174 },
      { date: "jan-15", fund: 12041, cdi: 1499 },
      { date: "jan-17", fund: 14612, cdi: 1904 },
      { date: "jan-19", fund: 17893, cdi: 2161 },
      { date: "jan-21", fund: 18390, cdi: 2325 },
      { date: "jan-23", fund: 24451, cdi: 2981 },
      { date: "jan-25", fund: 31811, cdi: 3805 },
      { date: "jul-26", fund: 34422, cdi: 4123 }
    ];
  }, []);

  // Volatility 40 days rolling average data
  const chartVolData = useMemo(() => {
    return [
      { date: "1997", fundVol: 24, cdiVol: 0.8 },
      { date: "1999", fundVol: 48, cdiVol: 1.2 },
      { date: "2002", fundVol: 22, cdiVol: 0.5 },
      { date: "2005", fundVol: 14, cdiVol: 0.4 },
      { date: "2008", fundVol: 38, cdiVol: 0.6 },
      { date: "2011", fundVol: 16, cdiVol: 0.4 },
      { date: "2014", fundVol: 12, cdiVol: 0.3 },
      { date: "2016", fundVol: 15, cdiVol: 0.4 },
      { date: "2018", fundVol: 14, cdiVol: 0.3 },
      { date: "2020", fundVol: 28, cdiVol: 0.2 },
      { date: "2022", fundVol: 11, cdiVol: 0.4 },
      { date: "2024", fundVol: 9.2, cdiVol: 0.4 },
      { date: "2026", fundVol: 8.47, cdiVol: 0.37 }
    ];
  }, []);

  // Copy Summary text
  const handleCopyText = () => {
    const text = `VERDE / HARPIA FIF CIC MULTIMERCADO RL — Relatório de Gestão (${formatMonthName(selectedMonth)})
Desempenho: Fundo ${currentConfig.monthReturn > 0 ? "+" : ""}${currentConfig.monthReturn}% (YTD: ${currentConfig.ytdReturn}%) | CDI ${currentConfig.monthBench}% (YTD: ${currentConfig.ytdBench}%)
PL Atual: R$ ${currentConfig.currentPl} | Volatilidade: ${currentConfig.volAnual}% a.a. | Sharpe: ${currentConfig.sharpe}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // High-Fidelity 4-Page PDF Exporter matching Verde Asset style exactly
  const handleExportVerdePDF = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    const darkTeal = [27, 63, 56]; // #1b3f38
    const limeAccent = [0, 168, 107]; // #00a86b
    const textDark = [30, 41, 59];
    const textGray = [100, 116, 139];
    const lightBg = [237, 245, 242]; // #edf5f2

    // Helper: Draw Header Bar
    const drawHeader = (pageTitle: string, showBigLogo = true) => {
      // Top bar
      doc.setFillColor(darkTeal[0], darkTeal[1], darkTeal[2]);
      doc.rect(10, 8, 190, 18, "F");

      // Gold badge accent on right
      doc.setFillColor(212, 175, 55);
      doc.circle(185, 17, 5, "F");
      doc.setFillColor(15, 23, 42);
      doc.circle(185, 17, 3.5, "F");

      // Brand Text
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(255, 255, 255);
      doc.text("HARPIA FINANCE ASSET", 15, 18);
      doc.setFontSize(7);
      doc.setFont("Helvetica", "normal");
      doc.setTextColor(200, 220, 210);
      doc.text("HARPY CAPITAL • GESTÃO DE RECURSOS • EST. 1978", 15, 23);
    };

    // Helper: Draw Bottom Disclaimer & ANBIMA
    const drawFooter = (pageNum: number) => {
      doc.setDrawColor(203, 213, 225);
      doc.line(10, 270, 200, 270);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(5.5);
      doc.setTextColor(120, 130, 140);
      const disclaimer = "A Harpia Finance Asset Management S.A. (\"Harpia\") não comercializa e nem distribui cotas de fundos ou qualquer outro ativo financeiro. Este relatório mensal retrata as opiniões da Harpia acerca da estratégia e gestão do fundo e não deve ser entendido como oferta, recomendação ou análise de investimento. Rentabilidade obtida no passado não representa garantia de resultados futuros. A rentabilidade divulgada não é líquida de impostos. O investimento em Fundo não é garantido pelo FGC. Supervisão e Fiscalização: Comissão de Valores Mobiliários (CVM). Contato Institucional: institucional@harpiaasset.com.br.";
      doc.text(doc.splitTextToSize(disclaimer, 160), 10, 274);

      // ANBIMA Badge Mock
      doc.setFillColor(220, 235, 225);
      doc.rect(174, 272, 26, 12, "F");
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(6);
      doc.setTextColor(0, 100, 60);
      doc.text("ANBIMA", 177, 277);
      doc.setFontSize(4.5);
      doc.setFont("Helvetica", "normal");
      doc.text("Gestão de Recursos", 176, 281);

      // Page number and month
      doc.setFontSize(7);
      doc.setTextColor(80, 90, 100);
      doc.text(`${formatMonthName(selectedMonth)}`, 10, 290);
      doc.text(`${pageNum}`, 198, 290);
    };

    // ── PAGE 1: CARTA DO GESTOR (PARTE 1) ──────────────────────────────────
    drawHeader("PÁGINA 1");

    // Title
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(darkTeal[0], darkTeal[1], darkTeal[2]);
    doc.text(currentConfig.name, 10, 36);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(60, 70, 80);
    doc.text("Relatório de Gestão", 10, 42);
    doc.text(formatMonthName(selectedMonth), 10, 47);

    // Performance Box
    doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
    doc.rect(10, 52, 190, 18, "F");

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(darkTeal[0], darkTeal[1], darkTeal[2]);
    doc.text("Desempenho", 15, 58);
    doc.text(`${formatMonthName(selectedMonth)}`, 110, 58);
    doc.text("Acumulado 2026", 160, 58);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text("Harpia Finance Asset", 15, 64);
    doc.text(`${currentConfig.monthReturn.toFixed(2)}%`, 115, 64);
    doc.text(`${currentConfig.ytdReturn.toFixed(2)}%`, 165, 64);

    doc.text(currentConfig.benchmark, 15, 68);
    doc.text(`${currentConfig.monthBench.toFixed(2)}%`, 115, 68);
    doc.text(`${currentConfig.ytdBench.toFixed(2)}%`, 165, 68);

    doc.setFontSize(6.5);
    doc.setTextColor(textGray[0], textGray[1], textGray[2]);
    doc.text("Para mais informações relevantes à análise da rentabilidade deste Fundo - tais como taxa de administração, taxa de performance, consulte o Resumo Gerencial.", 10, 75);

    // Letter Text (Paragraphs)
    let curY = 84;
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8.8);
    doc.setTextColor(40, 50, 60);

    const p1 = `O fundo Harpia teve em ${formatMonthName(selectedMonth).toLowerCase()} ganhos em ações no Brasil e em hedges no mercado de juros. As perdas vieram de bolsa global, metais preciosos e juro real americano.`;
    doc.text(doc.splitTextToSize(p1, 190), 10, curY);
    curY += 14;

    const p2 = "O cenário global foi marcado por bastante volatilidade ao longo do mês, explicado por três diferentes dinâmicas se combinando de maneiras inesperadas. A primeira diz respeito ao ciclo de investimentos em Inteligência Artificial. Vimos uma correção significativa na franja mais especulativa das ações ligadas ao boom de AI, bem representado pela queda no mês de -22.2% do Kospi (bolsa coreana) ou de -20.6% no SOX (índice de semicondutores nos EUA). Não vemos mudanças relevantes nos fundamentos do tema, pelo contrário. Mas os aspectos mais técnicos, especialmente a alavancagem crescente de investidores no tema (inclusive usando instrumentos como ETFs duas ou três vezes alavancados), tornou esse pedaço do mercado inerentemente frágil a qualquer pequena mudança. Vemos uma situação técnica bastante mais limpa após a correção e continuamos engajados no tema Inteligência Artificial.";
    doc.text(doc.splitTextToSize(p2, 190), 10, curY);
    curY += 58;

    const p3 = "A segunda dinâmica determinante para os humores do mercado girou em torno do Federal Reserve americano e a decisão que seria tomada em sua reunião. O mercado foi para a reunião com uma importante divisão de opiniões, entre aqueles que não viam espaço para altas de juros e aqueles que interpretaram os sinais do banco central como indicativos de busca por mais credibilidade. Essa divisão pôde ser vista tanto na renda fixa (que embutiu quase duas altas e meia de juros nos preços até a reunião) quanto no fortalecimento do Dólar. Ao fim e ao cabo a autoridade monetária não entregou alta de juros (apesar de três dissensos na votação, por si só algo raríssimo) e soou menos duro na entrevista subsequente. O mercado retirou boa parte do prêmio que havia colocado e vimos uma dinâmica de Dólar mais fraco nos dias seguintes.";
    doc.text(doc.splitTextToSize(p3, 190), 10, curY);

    drawFooter(1);

    // ── PAGE 2: CARTA DO GESTOR (PARTE 2) ──────────────────────────────────
    doc.addPage();
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(darkTeal[0], darkTeal[1], darkTeal[2]);
    doc.text(currentConfig.name, 10, 15);
    doc.setFont("Helvetica", "normal");
    doc.text("Relatório de gestão", 10, 20);

    // Logo on right
    doc.setFillColor(limeAccent[0], limeAccent[1], limeAccent[2]);
    doc.triangle(190, 12, 196, 16, 190, 20, "F");
    doc.setFillColor(darkTeal[0], darkTeal[1], darkTeal[2]);
    doc.triangle(194, 10, 200, 15, 194, 20, "F");

    curY = 32;
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8.8);
    doc.setTextColor(40, 50, 60);

    const p4 = "Por fim, a terceira dinâmica relevante do mês foi o retorno do conflito no Irã, com renovados ataques no estreito de Ormuz e novos bombardeios na região. Os iranianos continuam a busca por impor seu controle sobre o fluxo no estreito - com cobranças de pedágio – e os americanos buscam minimizar isso. O mercado de petróleo reagiu com alta de +23.5% no barril de Brent no mês. Acreditamos que essa incerteza vai continuar, mas o excesso de oferta de óleo no mundo é uma realidade inescapável no médio prazo. Por outro lado, vale mencionar que esse superávit não se reflete nos produtos refinados como gasolina e diesel. O mundo tropeça rumo a uma realidade de excesso de petróleo cru e falta estrutural de capacidade de refino.";
    doc.text(doc.splitTextToSize(p4, 190), 10, curY);
    curY += 46;

    const p5 = "O Brasil viu performance surpreendentemente resiliente ao longo de um mês com tantas forças diferentes. A bolsa subiu +3.5% depois de quatro meses seguidos de correção, e os juros tiveram correção importante por conta de dados de inflação mais bem comportados. A temporada eleitoral se anuncia como fator dominante para os mercados nos próximos meses, e devemos ver uma maior volatilidade ao sabor do boato ou da pesquisa do dia.";
    doc.text(doc.splitTextToSize(p5, 190), 10, curY);
    curY += 34;

    const p6 = "O fundo manteve sua exposição em renda variável no Brasil e global. Na renda fixa local não temos posições direcionais. Nos EUA mantivemos a posição aplicada em juro real. Também continuamos alocados em ouro e prata. Os hedges estruturais do portfólio foram mantidos, assim como a alocação de crédito local.";
    doc.text(doc.splitTextToSize(p6, 190), 10, curY);
    curY += 28;

    const p7 = "As maiores contribuições positivas no mês vieram de Petrobras e Prio e as negativas de Tenda e Cury. Nossas maiores posições são Equatorial, Petrobras e Copel.";
    doc.text(doc.splitTextToSize(p7, 190), 10, curY);

    drawFooter(2);

    // ── PAGE 3: BREAKDOWN — RESULTADOS DO FUNDO ─────────────────────────────
    doc.addPage();
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(darkTeal[0], darkTeal[1], darkTeal[2]);
    doc.text(currentConfig.name, 10, 15);
    doc.setFont("Helvetica", "normal");
    doc.text("Relatório de gestão", 10, 20);

    // Mini Logo
    doc.setFillColor(limeAccent[0], limeAccent[1], limeAccent[2]);
    doc.triangle(190, 12, 196, 16, 190, 20, "F");
    doc.setFillColor(darkTeal[0], darkTeal[1], darkTeal[2]);
    doc.triangle(194, 10, 200, 15, 194, 20, "F");

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(darkTeal[0], darkTeal[1], darkTeal[2]);
    doc.text("Breakdown — Resultados do Fundo", 10, 32);

    // Table Header
    doc.setFillColor(darkTeal[0], darkTeal[1], darkTeal[2]);
    doc.rect(10, 38, 95, 8, "F");
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text("Resultado Real do Fundo — Rentabilidade ex CDI", 12, 43);
    doc.text("Mês", 75, 43);
    doc.text("Acumulado", 88, 43);

    // Rows
    const tableRows = [
      { name: "I) Book Moedas", isHeader: true },
      { name: "  Dólar", month: "-0,04", ytd: "0,90" },
      { name: "  Moedas", month: "0,00", ytd: "-0,06" },
      { name: "Resultado Moedas", month: "-0,04", ytd: "0,84", isBold: true },
      { name: "II) Book Renda Fixa", isHeader: true },
      { name: "  DI pré", month: "0,00", ytd: "0,07" },
      { name: "  Cupom cambial", month: "0,00", ytd: "0,00" },
      { name: "  RF Inflação", month: "0,19", ytd: "0,04" },
      { name: "  Global Rates", month: "-0,14", ytd: "0,02" },
      { name: "  Crédito", month: "0,02", ytd: "-1,04" },
      { name: "Resultado Renda Fixa", month: "0,07", ytd: "-0,90", isBold: true },
      { name: "III) Book Ações", isHeader: true },
      { name: "Resultado Ações", month: "0,11", ytd: "1,56", isBold: true },
      { name: "─────────────────────────────", isDiv: true },
      { name: "CDI", month: "1,22", ytd: "8,14", isGray: true },
      { name: "Moedas(I) + Renda Fixa(II) + Outros", month: "-0,09", ytd: "-0,64", isGray: true },
      { name: "Ações(III)", month: "0,11", ytd: "1,56", isGray: true },
      { name: "Custos", month: "-0,14", ytd: "-0,87", isGray: true },
      { name: "Resultado do Fundo", month: "1,09", ytd: "8,18", isTotal: true }
    ];

    let tY = 50;
    tableRows.forEach(r => {
      if (r.isHeader) {
        doc.setFillColor(230, 240, 235);
        doc.rect(10, tY - 4, 95, 5, "F");
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(darkTeal[0], darkTeal[1], darkTeal[2]);
        doc.text(r.name, 12, tY);
      } else if (r.isTotal) {
        doc.setFillColor(darkTeal[0], darkTeal[1], darkTeal[2]);
        doc.rect(10, tY - 4, 95, 6, "F");
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.text(r.name, 12, tY);
        doc.text(r.month || "", 75, tY);
        doc.text(r.ytd || "", 90, tY);
      } else if (r.isDiv) {
        doc.setDrawColor(200, 210, 220);
        doc.line(10, tY, 105, tY);
      } else {
        doc.setFont("Helvetica", r.isBold ? "bold" : "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(r.isBold ? 15 : 60, r.isBold ? 23 : 70, r.isBold ? 42 : 80);
        doc.text(r.name, 12, tY);
        doc.text(r.month || "", 75, tY);
        doc.text(r.ytd || "", 90, tY);
      }
      tY += 5.2;
    });

    // Waterfall Chart Representation on Right Side
    doc.setDrawColor(220, 230, 225);
    doc.rect(115, 38, 85, 140);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(darkTeal[0], darkTeal[1], darkTeal[2]);
    doc.text("Contribuição por Book (Waterfall)", 120, 46);

    // Waterfall Bars Simulation in PDF
    const wfBars = [
      { label: "CDI", val: "+8,14%", h: 65, y: 115, color: [27, 63, 56] },
      { label: "Ações", val: "+1,56%", h: 18, y: 100, color: [0, 168, 107] },
      { label: "Moedas", val: "+0,84%", h: 10, y: 90, color: [0, 168, 107] },
      { label: "Outros", val: "-0,58%", h: -8, y: 92, color: [220, 38, 38] },
      { label: "R.Fixa", val: "-0,90%", h: -12, y: 100, color: [220, 38, 38] },
      { label: "Custos", val: "-0,87%", h: -11, y: 110, color: [220, 38, 38] },
      { label: "TOTAL", val: "8,18%", h: 66, y: 115, color: [27, 63, 56] }
    ];

    let bx = 120;
    wfBars.forEach(b => {
      doc.setFillColor(b.color[0], b.color[1], b.color[2]);
      const barHeight = Math.abs(b.h);
      const topY = b.h > 0 ? b.y - barHeight : b.y;
      doc.rect(bx, topY, 8, barHeight, "F");

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(5.5);
      doc.setTextColor(50, 60, 70);
      doc.text(b.label, bx, 130);
      doc.setFont("Helvetica", "bold");
      doc.text(b.val, bx - 1, topY - 2);
      bx += 11;
    });

    drawFooter(3);

    // ── PAGE 4: RESUMO GERENCIAL (FICHA TÉCNICA) ───────────────────────────
    doc.addPage();
    drawHeader("RESUMO GERENCIAL");

    // Title
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(darkTeal[0], darkTeal[1], darkTeal[2]);
    doc.text(currentConfig.name, 10, 34);
    doc.setFontSize(10);
    doc.text("Resumo Gerencial", 10, 39);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("31/jul/2026", 10, 44);

    // Strategy description & Target
    doc.setFontSize(6.5);
    doc.setTextColor(40, 50, 60);
    doc.text(doc.splitTextToSize(currentConfig.description, 95), 10, 50);

    doc.setFont("Helvetica", "bold");
    doc.text("Público-alvo", 115, 50);
    doc.setFont("Helvetica", "normal");
    doc.text(doc.splitTextToSize(currentConfig.targetAudience, 85), 115, 54);

    // Split Box: Características vs Performance
    let splitY = 70;
    doc.setFillColor(darkTeal[0], darkTeal[1], darkTeal[2]);
    doc.rect(10, splitY, 95, 6, "F");
    doc.rect(110, splitY, 90, 6, "F");

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text("Características", 12, splitY + 4.2);
    doc.text("Performance", 112, splitY + 4.2);
    doc.text("Fundo", 172, splitY + 4.2);
    doc.text(currentConfig.benchmark, 188, splitY + 4.2);

    // Details Grid
    let gY = splitY + 10;
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(40, 50, 60);

    const caracs = [
      ["CNPJ", currentConfig.cnpj],
      ["Data de Início", currentConfig.inceptionDate],
      ["Aplicação mínima", currentConfig.minApp],
      ["Saldo mínimo", currentConfig.minBal],
      ["Movimentação mínima", currentConfig.minMov],
      ["Cota", "Fechamento"],
      ["Cota de aplicação", currentConfig.quoteApp],
      ["Cota de resgate", currentConfig.quoteRed],
      ["Liquidação de resgate", currentConfig.liqRed],
      ["Tributação aplicável", currentConfig.tributacao],
      ["Taxa Global / Adm", "1,50% a.a."],
      ["Taxa de performance", currentConfig.perfFee]
    ];

    const perfs = [
      ["Retorno anualizado", `${currentConfig.annualizedReturn}%`, `${currentConfig.annualizedBench}%`],
      ["Desvio padrão anualizado", `${currentConfig.volAnual}%`, `${currentConfig.volBench}%`],
      ["Índice de Sharpe", `${currentConfig.sharpe}`, "-"],
      ["Rentabilidade 12 meses", `${currentConfig.ret12m}%`, `${currentConfig.bench12m}%`],
      ["Número de meses positivos", `${currentConfig.posMonths}`, "-"],
      ["Número de meses negativos", `${currentConfig.negMonths}`, "-"],
      ["Meses acima do CDI", `${currentConfig.aboveBenchMonths}`, "-"],
      ["Meses abaixo do CDI", `${currentConfig.belowBenchMonths}`, "-"],
      ["Maior rentabilidade mensal", `${currentConfig.maxMonthReturn}%`, "3,28%"],
      ["Menor rentabilidade mensal", `${currentConfig.minMonthReturn}%`, "0,13%"],
      ["Patrimônio Líquido (R$)", `R$ ${currentConfig.currentPl}`, "-"],
      ["PL Médio 12M (R$)", `R$ ${currentConfig.avg12mPl}`, "-"]
    ];

    for (let i = 0; i < Math.max(caracs.length, perfs.length); i++) {
      if (i % 2 === 0) {
        doc.setFillColor(245, 248, 246);
        doc.rect(10, gY - 3.5, 95, 4.5, "F");
        doc.rect(110, gY - 3.5, 90, 4.5, "F");
      }
      if (caracs[i]) {
        doc.text(caracs[i][0], 12, gY);
        doc.text(caracs[i][1], 55, gY);
      }
      if (perfs[i]) {
        doc.text(perfs[i][0], 112, gY);
        doc.text(perfs[i][1], 170, gY);
        doc.text(perfs[i][2], 188, gY);
      }
      gY += 4.5;
    }

    // Historical Monthly Matrix Table
    let mY = gY + 6;
    doc.setFillColor(darkTeal[0], darkTeal[1], darkTeal[2]);
    doc.rect(10, mY, 190, 5, "F");
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(255, 255, 255);
    doc.text("Rentabilidades (%) Históricas Mês a Mês", 12, mY + 3.5);
    doc.text("Jan   Fev   Mar   Abr   Mai   Jun   Jul   Ago   Set   Out   Nov   Dez |  Acum.Ano   CDI | Acum.Fdo   Acum.CDI", 50, mY + 3.5);

    mY += 8;
    historicalMatrixData.slice(0, 7).forEach((hRow, idx) => {
      if (idx % 2 === 0) {
        doc.setFillColor(245, 248, 246);
        doc.rect(10, mY - 3, 190, 4, "F");
      }
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(5.8);
      doc.setTextColor(darkTeal[0], darkTeal[1], darkTeal[2]);
      doc.text(`${hRow.year}`, 12, mY);

      doc.setFont("Helvetica", "normal");
      doc.setTextColor(40, 50, 60);
      const rowLine = `${hRow.jan}  ${hRow.fev}  ${hRow.mar}  ${hRow.abr}  ${hRow.mai}  ${hRow.jun}  ${hRow.jul}  ${hRow.ago}  ${hRow.set}  ${hRow.out}  ${hRow.nov}  ${hRow.dez}  |  ${hRow.acumAno}%  ${hRow.cdiAno}% | ${hRow.acumFdo}  ${hRow.acumCdi}`;
      doc.text(rowLine, 48, mY);
      mY += 4;
    });

    drawFooter(4);

    // Save and download PDF
    doc.save(`Relatorio_de_Gestao_${currentConfig.shortName.replace(/\s+/g, "_")}_${selectedMonth}.pdf`);
  };

  return (
    <div className="space-y-6">
      
      {/* ── TOP CONTROL BAR & FUND SELECTOR ────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Fund Switcher Tabs */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              Seletor de Fundo Institucional (Harpia Finance Asset Management)
            </span>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={() => setSelectedFund("MULTIMERCADO")}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  selectedFund === "MULTIMERCADO"
                    ? "bg-[#1b3f38] text-white shadow-md shadow-emerald-950/20"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                HARPIA MULTIMERCADO RL
              </button>

              <button
                onClick={() => setSelectedFund("ACOES_BR")}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  selectedFund === "ACOES_BR"
                    ? "bg-[#1b3f38] text-white shadow-md shadow-emerald-950/20"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                HARPIA AÇÕES FIC FIA
              </button>

              <button
                onClick={() => setSelectedFund("ACOES_GLOBAIS")}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  selectedFund === "ACOES_GLOBAIS"
                    ? "bg-[#1b3f38] text-white shadow-md shadow-emerald-950/20"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                HARPIA MUNDI GLOBAIS BRL
              </button>
            </div>
          </div>

          {/* Actions: Month, View Mode & Export PDF */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Month select */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer text-xs"
              >
                <option value="2026-07">Julho de 2026</option>
                <option value="2026-08">Agosto de 2026</option>
                <option value="2026-06">Junho de 2026</option>
                <option value="2026-05">Maio de 2026</option>
                <option value="2025-12">Dezembro de 2025</option>
                <option value="2024-12">Dezembro de 2024</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode("SINGLE_PAGE")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === "SINGLE_PAGE" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Páginas (1-4)
              </button>
              <button
                onClick={() => setViewMode("ALL_PAGES")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === "ALL_PAGES" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Ver Todas
              </button>
            </div>

            {/* Copy Button */}
            <button
              onClick={handleCopyText}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Copiar Texto do Relatório"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
              {copied ? "Copiado" : "Copiar"}
            </button>

            {/* Download PDF Button */}
            <button
              onClick={handleExportVerdePDF}
              className="px-4 py-2 bg-[#1b3f38] hover:bg-[#15342e] text-white rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-md shadow-emerald-950/20 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              Baixar Relatório em PDF (A4 Timbrado)
            </button>
          </div>

        </div>

        {/* Page Switcher Tabs when in SINGLE_PAGE mode */}
        {viewMode === "SINGLE_PAGE" && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActivePage(1)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activePage === 1 ? "bg-emerald-100 text-emerald-900 border border-emerald-300" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Pág 1: Carta do Gestor (Macro & IA)
              </button>
              <button
                onClick={() => setActivePage(2)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activePage === 2 ? "bg-emerald-100 text-emerald-900 border border-emerald-300" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Pág 2: Petróleo, Brasil & Posições
              </button>
              <button
                onClick={() => setActivePage(3)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activePage === 3 ? "bg-emerald-100 text-emerald-900 border border-emerald-300" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Pág 3: Breakdown & Waterfall
              </button>
              <button
                onClick={() => setActivePage(4)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activePage === 4 ? "bg-emerald-100 text-emerald-900 border border-emerald-300" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                Pág 4: Resumo Gerencial (CVM 175)
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <button
                disabled={activePage === 1}
                onClick={() => setActivePage(p => Math.max(1, p - 1))}
                className="p-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span>Página {activePage} de 4</span>
              <button
                disabled={activePage === 4}
                onClick={() => setActivePage(p => Math.min(4, p + 1))}
                className="p-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── RENDERING SIMULATED A4 PAGES (IDENTICAL TO VERDE PDF) ───────────────── */}
      <div className="flex flex-col items-center gap-8 py-4 bg-slate-200/60 rounded-3xl p-4 lg:p-8">

        {/* ════ PAGE 1 ════ */}
        {(viewMode === "ALL_PAGES" || activePage === 1) && (
          <div className="w-full max-w-[850px] bg-white border border-slate-300 rounded-none shadow-2xl p-8 sm:p-12 relative font-sans text-slate-800">
            
            {/* Top Brand Banner Header */}
            <div className="bg-[#1b3f38] text-white p-4 flex items-center justify-between mb-8 -mx-8 sm:-mx-12 -mt-8 sm:-mt-12">
              <div className="flex items-center gap-3">
                <img
                  src={harpiaFinanceLogo}
                  alt="Harpia Finance Asset"
                  className="w-10 h-10 rounded-full object-cover border border-amber-300/40 shadow-sm"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h1 className="text-base font-extrabold tracking-tight font-sans">HARPIA FINANCE ASSET</h1>
                  <p className="text-[10px] text-emerald-200 font-mono tracking-widest uppercase">Harpy Capital • Gestão de Recursos</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <span className="text-lg font-black tracking-widest block font-sans text-amber-300">HARPIA</span>
                  <span className="text-[8px] tracking-widest text-emerald-200 block -mt-1 uppercase">asset management</span>
                </div>
              </div>
            </div>

            {/* Fund Title & Month */}
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-black text-[#1b3f38] font-sans tracking-tight">
                {currentConfig.name}
              </h2>
              <div className="flex items-center gap-3 text-sm text-slate-600 font-medium mt-1">
                <span>Relatório de Gestão</span>
                <span>•</span>
                <span className="font-bold text-[#1b3f38]">{formatMonthName(selectedMonth)}</span>
              </div>
            </div>

            {/* Desempenho Table Box */}
            <div className="bg-[#edf5f2] rounded-none border-y border-[#1b3f38]/20 p-4 mb-3">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left font-bold text-[#1b3f38] border-b border-[#1b3f38]/20 pb-2">
                    <th className="py-1">Desempenho</th>
                    <th className="py-1 text-center">{formatMonthName(selectedMonth)}</th>
                    <th className="py-1 text-right">Acumulado 2026</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1b3f38]/10 text-slate-800">
                  <tr className="font-bold">
                    <td className="py-2">Harpia Finance Asset</td>
                    <td className="py-2 text-center">{currentConfig.monthReturn > 0 ? `${currentConfig.monthReturn.toFixed(2)}%` : `${currentConfig.monthReturn.toFixed(2)}%`}</td>
                    <td className="py-2 text-right">{currentConfig.ytdReturn.toFixed(2)}%</td>
                  </tr>
                  <tr className="text-slate-600">
                    <td className="py-2">{currentConfig.benchmark}</td>
                    <td className="py-2 text-center">{currentConfig.monthBench.toFixed(2)}%</td>
                    <td className="py-2 text-right">{currentConfig.ytdBench.toFixed(2)}%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed mb-6 italic">
              Para mais informações relevantes à análise da rentabilidade deste Fundo - tais como taxa de administração, taxa de performance, rentabilidade “mês a mês” ou PL médio, consulte o Resumo Gerencial ao final deste material.
            </p>

            {/* Body Text */}
            <div className="space-y-4 text-xs sm:text-[13px] text-slate-800 leading-[1.65] text-justify font-sans">
              <p>
                O fundo Harpia teve em {formatMonthName(selectedMonth).toLowerCase()} ganhos em ações no Brasil e em hedges no mercado de juros. As perdas vieram de bolsa global, metais preciosos e juro real americano.
              </p>
              <p>
                O cenário global foi marcado por bastante volatilidade ao longo do mês, explicado por três diferentes dinâmicas se combinando de maneiras inesperadas. A primeira diz respeito ao ciclo de investimentos em <strong>Inteligência Artificial</strong>. Vimos uma correção significativa na franja mais especulativa das ações ligadas ao boom de AI, bem representado pela queda no mês de -22.2% do Kospi (bolsa coreana) ou de -20.6% no SOX (índice de semicondutores nos EUA). Não vemos mudanças relevantes nos fundamentos do tema, pelo contrário. Mas os aspectos mais técnicos, especialmente a alavancagem crescente de investidores no tema (inclusive usando instrumentos como ETFs duas ou três vezes alavancados), tornou esse pedaço do mercado inerentemente frágil a qualquer pequena mudança. Vemos uma situação técnica bastante mais limpa após a correção de julho e continuamos engajados no tema Inteligência Artificial.
              </p>
              <p>
                A segunda dinâmica determinante para os humores do mercado girou em torno do <strong>Federal Reserve americano</strong> e a decisão que seria tomada em sua reunião. O mercado foi para a reunião com uma importante divisão de opiniões, entre aqueles que não viam espaço para altas de juros e aqueles que interpretaram os sinais do banco central como indicativos de busca por mais credibilidade. Essa divisão pôde ser vista tanto na renda fixa (que embutiu quase duas altas e meia de juros nos preços até a reunião) quanto no fortalecimento do Dólar. Ao fim e ao cabo a autoridade monetária não entregou alta de juros (apesar de três dissensos na votação, por si só algo raríssimo) e soou menos duro na entrevista subsequente. O mercado retirou boa parte do prêmio que havia colocado e vimos uma dinâmica de Dólar mais fraco nos dias seguintes, ajudada por dados mais fracos de emprego.
              </p>
            </div>

            {/* Bottom Disclaimer & Regulatory Stamp */}
            <div className="mt-12 pt-4 border-t border-slate-200 text-[9px] text-slate-500 leading-normal">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <p className="max-w-[580px]">
                  A Harpia Finance Asset Management S.A. (“Harpia”) não comercializa e nem distribui cotas de fundos ou qualquer outro ativo financeiro. Este relatório mensal retrata as opiniões da Harpia acerca da estratégia e gestão do fundo e não deve ser entendido como oferta, recomendação ou análise de investimento. Rentabilidade obtida no passado não representa garantia de resultados futuros. Supervisão e Fiscalização: Comissão de Valores Mobiliários (CVM).
                </p>
                <div className="border border-emerald-600 bg-emerald-50 px-2 py-1 rounded text-center shrink-0">
                  <span className="text-[10px] font-bold text-emerald-900 block">ANBIMA</span>
                  <span className="text-[8px] text-emerald-700">Autorregulação Gestão de Recursos</span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 text-slate-400">
                <span>{formatMonthName(selectedMonth)}</span>
                <span>1</span>
              </div>
            </div>

          </div>
        )}

        {/* ════ PAGE 2 ════ */}
        {(viewMode === "ALL_PAGES" || activePage === 2) && (
          <div className="w-full max-w-[850px] bg-white border border-slate-300 rounded-none shadow-2xl p-8 sm:p-12 relative font-sans text-slate-800">
            
            {/* Top Micro Header */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200">
              <div>
                <span className="text-xs font-bold text-[#1b3f38] block">{currentConfig.name}</span>
                <span className="text-[11px] text-slate-500">Relatório de gestão</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-4 bg-emerald-600" />
                <div className="w-3 h-4 bg-[#1b3f38]" />
              </div>
            </div>

            {/* Body Content */}
            <div className="space-y-4 text-xs sm:text-[13px] text-slate-800 leading-[1.65] text-justify font-sans">
              <p>
                Por fim, a terceira dinâmica relevante do mês foi o <strong>retorno do conflito no Irã</strong>, com renovados ataques no estreito de Ormuz e novos bombardeios na região. Os iranianos continuam a busca por impor seu controle sobre o fluxo no estreito - com cobranças de pedágio – e os americanos buscam minimizar isso. A realidade militar torna difícil que a posição dos EUA prevaleça. O mercado de petróleo reagiu com alta de <strong>+23.5% no barril de Brent</strong> no mês. Acreditamos que essa incerteza vai continuar, mas o excesso de oferta de óleo no mundo é uma realidade inescapável no médio prazo. Por outro lado, vale mencionar que esse superávit não se reflete nos produtos refinados como gasolina e diesel. O mundo tropeça rumo a uma realidade de excesso de petróleo cru e falta estrutural de capacidade de refino.
              </p>
              <p>
                <strong>O Brasil viu performance surpreendentemente resiliente</strong> ao longo de um mês com tantas forças diferentes. A bolsa subiu <strong>+3.5%</strong> depois de quatro meses seguidos de correção, e os juros tiveram correção importante por conta de dados de inflação mais bem comportados. A temporada eleitoral se anuncia como fator dominante para os mercados nos próximos meses, e devemos ver uma maior volatilidade ao sabor do boato ou da pesquisa do dia.
              </p>
              <p>
                <strong>Posicionamento da Carteira:</strong> O fundo manteve sua exposição em renda variável no Brasil e global. Na renda fixa local não temos posições direcionais. Nos EUA mantivemos a posição aplicada em juro real. Também continuamos alocados em ouro e prata. Os hedges estruturais do portfólio foram mantidos, assim como a alocação de crédito local.
              </p>
              <p>
                As maiores contribuições positivas no mês vieram de <strong>Petrobras e Prio</strong> e as negativas de Tenda e Cury. Nossas maiores posições são <strong>Equatorial, Petrobras e Copel</strong>.
              </p>
            </div>

            {/* Additional Thematic Callout Box */}
            <div className="mt-8 bg-slate-50 border-l-4 border-[#1b3f38] p-4 text-xs">
              <span className="font-bold text-[#1b3f38] block mb-1">Síntese Estratégica & Convicções:</span>
              <p className="text-slate-600 leading-relaxed">
                Concentramos as nossas posições em teses de maior convicção, com prêmios de retorno acima de 300 bps sobre a NTN-B, capacidade de repasse de inflação e menor suscetibilidade a uma desaceleração de atividade em 2027. Continuamos com as apostas em bond proxies de alta qualidade.
              </p>
            </div>

            {/* Bottom Disclaimer */}
            <div className="mt-20 pt-4 border-t border-slate-200 text-[9px] text-slate-500 leading-normal">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <p className="max-w-[580px]">
                  A Harpia Finance Asset Management S.A. (“Harpia”) não comercializa e nem distribui cotas de fundos. Supervisão e Fiscalização: Comissão de Valores Mobiliários (CVM).
                </p>
                <div className="border border-emerald-600 bg-emerald-50 px-2 py-1 rounded text-center shrink-0">
                  <span className="text-[10px] font-bold text-emerald-900 block">ANBIMA</span>
                  <span className="text-[8px] text-emerald-700">Autorregulação Gestão de Recursos</span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 text-slate-400">
                <span>{formatMonthName(selectedMonth)}</span>
                <span>2</span>
              </div>
            </div>

          </div>
        )}

        {/* ════ PAGE 3 ════ */}
        {(viewMode === "ALL_PAGES" || activePage === 3) && (
          <div className="w-full max-w-[850px] bg-white border border-slate-300 rounded-none shadow-2xl p-8 sm:p-12 relative font-sans text-slate-800">
            
            {/* Top Micro Header */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200">
              <div>
                <span className="text-xs font-bold text-[#1b3f38] block">{currentConfig.name}</span>
                <span className="text-[11px] text-slate-500">Relatório de gestão</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-4 bg-emerald-600" />
                <div className="w-3 h-4 bg-[#1b3f38]" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-lg font-black text-[#1b3f38] font-sans tracking-tight mb-6 pb-2 border-b-2 border-[#1b3f38]">
              Breakdown — Resultados do Fundo
            </h2>

            {/* Split Grid: Breakdown Table (Left) + Waterfall Bar Chart (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              
              {/* Left: Decomposed Table */}
              <div className="space-y-4">
                <div className="border border-slate-200 overflow-hidden text-xs">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#1b3f38] text-white font-bold text-[11px]">
                        <th className="py-2 px-3 text-left">Resultado Real Harpia Asset — Rentabilidade ex CDI</th>
                        <th className="py-2 px-2 text-center">{formatMonthName(selectedMonth).split(" ")[0]}</th>
                        <th className="py-2 px-2 text-right">Acumulado 2026</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
                      
                      {/* I) Book Moedas */}
                      <tr className="bg-slate-100/80 font-bold text-[#1b3f38]">
                        <td colSpan={3} className="py-1.5 px-3">I) Book Moedas</td>
                      </tr>
                      <tr>
                        <td className="py-1 px-3 pl-6">Dólar</td>
                        <td className="py-1 px-2 text-center text-rose-700">-0,04%</td>
                        <td className="py-1 px-2 text-right text-emerald-700">+0,90%</td>
                      </tr>
                      <tr>
                        <td className="py-1 px-3 pl-6">Moedas</td>
                        <td className="py-1 px-2 text-center text-slate-600">0,00%</td>
                        <td className="py-1 px-2 text-right text-rose-700">-0,06%</td>
                      </tr>
                      <tr className="font-bold bg-slate-50">
                        <td className="py-1.5 px-3">Resultado Moedas</td>
                        <td className="py-1.5 px-2 text-center text-rose-700">-0,04%</td>
                        <td className="py-1.5 px-2 text-right text-emerald-700">+0,84%</td>
                      </tr>

                      {/* II) Book Renda Fixa */}
                      <tr className="bg-slate-100/80 font-bold text-[#1b3f38]">
                        <td colSpan={3} className="py-1.5 px-3">II) Book Renda Fixa</td>
                      </tr>
                      <tr>
                        <td className="py-1 px-3 pl-6">DI pré</td>
                        <td className="py-1 px-2 text-center text-slate-600">0,00%</td>
                        <td className="py-1 px-2 text-right text-emerald-700">+0,07%</td>
                      </tr>
                      <tr>
                        <td className="py-1 px-3 pl-6">Cupom cambial</td>
                        <td className="py-1 px-2 text-center text-slate-600">0,00%</td>
                        <td className="py-1 px-2 text-right text-slate-600">0,00%</td>
                      </tr>
                      <tr>
                        <td className="py-1 px-3 pl-6">RF Inflação</td>
                        <td className="py-1 px-2 text-center text-emerald-700">+0,19%</td>
                        <td className="py-1 px-2 text-right text-emerald-700">+0,04%</td>
                      </tr>
                      <tr>
                        <td className="py-1 px-3 pl-6">Global Rates</td>
                        <td className="py-1 px-2 text-center text-rose-700">-0,14%</td>
                        <td className="py-1 px-2 text-right text-emerald-700">+0,02%</td>
                      </tr>
                      <tr>
                        <td className="py-1 px-3 pl-6">Crédito</td>
                        <td className="py-1 px-2 text-center text-emerald-700">+0,02%</td>
                        <td className="py-1 px-2 text-right text-rose-700">-1,04%</td>
                      </tr>
                      <tr className="font-bold bg-slate-50">
                        <td className="py-1.5 px-3">Resultado Renda Fixa</td>
                        <td className="py-1.5 px-2 text-center text-emerald-700">+0,07%</td>
                        <td className="py-1.5 px-2 text-right text-rose-700">-0,90%</td>
                      </tr>

                      {/* III) Book Ações */}
                      <tr className="bg-slate-100/80 font-bold text-[#1b3f38]">
                        <td colSpan={3} className="py-1.5 px-3">III) Book Ações</td>
                      </tr>
                      <tr className="font-bold bg-slate-50">
                        <td className="py-1.5 px-3">Resultado Ações</td>
                        <td className="py-1.5 px-2 text-center text-emerald-700">+0,11%</td>
                        <td className="py-1.5 px-2 text-right text-emerald-700">+1,56%</td>
                      </tr>

                      {/* Consolidação */}
                      <tr className="border-t-2 border-slate-300">
                        <td className="py-1 px-3 font-semibold text-slate-700">CDI</td>
                        <td className="py-1 px-2 text-center font-semibold text-slate-700">1,22%</td>
                        <td className="py-1 px-2 text-right font-semibold text-slate-700">8,14%</td>
                      </tr>
                      <tr>
                        <td className="py-1 px-3 text-slate-600">Moedas(I) + Renda Fixa(II) + Outros</td>
                        <td className="py-1 px-2 text-center text-rose-700">-0,09%</td>
                        <td className="py-1 px-2 text-right text-rose-700">-0,64%</td>
                      </tr>
                      <tr>
                        <td className="py-1 px-3 text-slate-600">Ações(III)</td>
                        <td className="py-1 px-2 text-center text-emerald-700">+0,11%</td>
                        <td className="py-1 px-2 text-right text-emerald-700">+1,56%</td>
                      </tr>
                      <tr>
                        <td className="py-1 px-3 text-slate-600">Custos</td>
                        <td className="py-1 px-2 text-center text-rose-700">-0,14%</td>
                        <td className="py-1 px-2 text-right text-rose-700">-0,87%</td>
                      </tr>
                      <tr className="bg-[#1b3f38] text-white font-bold text-[11px]">
                        <td className="py-2 px-3">Resultado do Fundo</td>
                        <td className="py-2 px-2 text-center">1,09%</td>
                        <td className="py-2 px-2 text-right">8,18%</td>
                      </tr>

                    </tbody>
                  </table>
                </div>

                <p className="text-[10px] text-slate-500 italic">
                  Para todos os ativos que utilizamos caixa, as rentabilidades expressas acima já são reais (ex CDI).
                </p>
              </div>

              {/* Right: Waterfall Chart */}
              <div className="border border-slate-200 p-4 bg-slate-50/50">
                <span className="text-xs font-bold text-[#1b3f38] block mb-3 text-center uppercase tracking-wider">
                  Decomposição Acumulada 2026 (Gráfico Cascata)
                </span>
                
                <div className="h-[340px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={currentConfig.waterfallData}
                      margin={{ top: 20, right: 10, left: -20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 9, fill: "#475569" }}
                        interval={0}
                        angle={-20}
                        textAnchor="end"
                      />
                      <YAxis tick={{ fontSize: 9, fill: "#64748b" }} domain={[0, 12]} unit="%" />
                      <Tooltip
                        formatter={(val: any, name: any, item: any) => [`${item.payload.display}`, "Contribuição"]}
                        contentStyle={{ fontSize: "11px", borderRadius: "8px" }}
                      />
                      <ReferenceLine y={0} stroke="#94a3b8" />
                      <Bar dataKey="value" name="Contribuição">
                        {currentConfig.waterfallData.map((entry, index) => {
                          let color = "#1b3f38";
                          if (entry.isTotal) color = "#1b3f38";
                          else if (entry.value > 0) color = "#00a86b";
                          else color = "#e11d48";
                          return <Cell key={`cell-${index}`} fill={color} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-200 text-center text-[10px]">
                  <div className="p-1.5 bg-emerald-50 rounded border border-emerald-200">
                    <span className="text-emerald-800 font-bold block">+1,56%</span>
                    <span className="text-emerald-600">Alfa Ações</span>
                  </div>
                  <div className="p-1.5 bg-blue-50 rounded border border-blue-200">
                    <span className="text-blue-800 font-bold block">+0,84%</span>
                    <span className="text-blue-600">Moedas & Dólar</span>
                  </div>
                  <div className="p-1.5 bg-[#1b3f38]/10 rounded border border-[#1b3f38]/30">
                    <span className="text-[#1b3f38] font-bold block">8,18%</span>
                    <span className="text-slate-600">Total Fundo</span>
                  </div>
                </div>

              </div>

            </div>

            {/* Bottom Disclaimer */}
            <div className="mt-12 pt-4 border-t border-slate-200 text-[9px] text-slate-500 leading-normal">
              <div className="flex items-center justify-between text-slate-400">
                <span>{formatMonthName(selectedMonth)}</span>
                <span>3</span>
              </div>
            </div>

          </div>
        )}

        {/* ════ PAGE 4: RESUMO GERENCIAL (FICHA TÉCNICA CVM 175) ════ */}
        {(viewMode === "ALL_PAGES" || activePage === 4) && (
          <div className="w-full max-w-[850px] bg-white border border-slate-300 rounded-none shadow-2xl p-8 sm:p-12 relative font-sans text-slate-800">
            
            {/* Header Banner */}
            <div className="bg-[#1b3f38] text-white p-4 flex items-center justify-between mb-6 -mx-8 sm:-mx-12 -mt-8 sm:-mt-12">
              <div className="flex items-center gap-3">
                <div className="w-3 h-8 bg-emerald-400" />
                <div>
                  <h1 className="text-base font-extrabold tracking-tight font-sans">{currentConfig.name}</h1>
                  <p className="text-[10px] text-emerald-200 font-mono tracking-widest uppercase">Resumo Gerencial • 31/jul/2026</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-5 bg-emerald-500 clip-triangle" />
                <div className="w-4 h-5 bg-white/90 clip-triangle" />
              </div>
            </div>

            {/* Strategy Description & Target Audience */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 text-[11px] leading-relaxed text-slate-700">
              <div className="md:col-span-2">
                <p>{currentConfig.description}</p>
                <p className="text-[9px] text-slate-400 mt-2">
                  * Calculado desde a constituição do fundo em {currentConfig.legacyDate} até 31/jul/2026.
                </p>
              </div>
              <div className="bg-slate-50 p-3 border-l-2 border-[#1b3f38]">
                <strong className="text-[#1b3f38] block mb-1">Público-alvo:</strong>
                <p className="text-[10px] text-slate-600">{currentConfig.targetAudience}</p>
              </div>
            </div>

            {/* Split Table: Características vs Performance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              
              {/* Características */}
              <div className="border border-slate-200 text-xs">
                <div className="bg-[#1b3f38] text-white font-bold px-3 py-1.5 text-[11px]">
                  Características
                </div>
                <div className="divide-y divide-slate-100 text-[10px]">
                  <div className="flex justify-between p-1.5 bg-slate-50 font-medium"><span>CNPJ</span><span className="font-mono">{currentConfig.cnpj}</span></div>
                  <div className="flex justify-between p-1.5"><span>Data de início</span><span>{currentConfig.inceptionDate}</span></div>
                  <div className="flex justify-between p-1.5 bg-slate-50"><span>Aplicação mínima</span><span>{currentConfig.minApp}</span></div>
                  <div className="flex justify-between p-1.5"><span>Saldo mínimo</span><span>{currentConfig.minBal}</span></div>
                  <div className="flex justify-between p-1.5 bg-slate-50"><span>Movimentação mínima</span><span>{currentConfig.minMov}</span></div>
                  <div className="flex justify-between p-1.5"><span>Cota</span><span>Fechamento</span></div>
                  <div className="flex justify-between p-1.5 bg-slate-50"><span>Cota de aplicação</span><span>{currentConfig.quoteApp}</span></div>
                  <div className="flex justify-between p-1.5"><span>Cota de resgate</span><span>{currentConfig.quoteRed}</span></div>
                  <div className="flex justify-between p-1.5 bg-slate-50"><span>Liquidação de resgate</span><span>{currentConfig.liqRed}</span></div>
                  <div className="flex justify-between p-1.5"><span>Carência para resgate</span><span>{currentConfig.carencia}</span></div>
                  <div className="flex justify-between p-1.5 bg-slate-50"><span>Tributação aplicável</span><span>{currentConfig.tributacao}</span></div>
                  <div className="flex justify-between p-1.5"><span>Taxa Global / Adm</span><span>1,50% a.a.</span></div>
                  <div className="flex justify-between p-1.5 bg-emerald-50/60 font-semibold text-emerald-950"><span>Taxa de performance</span><span>{currentConfig.perfFee}</span></div>
                </div>
              </div>

              {/* Performance */}
              <div className="border border-slate-200 text-xs">
                <div className="bg-[#1b3f38] text-white font-bold px-3 py-1.5 text-[11px] flex justify-between">
                  <span>Performance</span>
                  <span className="space-x-4">
                    <span>Fundo</span>
                    <span>{currentConfig.benchmark}</span>
                  </span>
                </div>
                <div className="divide-y divide-slate-100 text-[10px]">
                  <div className="flex justify-between p-1.5 bg-slate-50"><span>Retorno anualizado</span><span className="font-bold text-emerald-800">{currentConfig.annualizedReturn}%</span><span className="text-slate-600">{currentConfig.annualizedBench}%</span></div>
                  <div className="flex justify-between p-1.5"><span>Desvio padrão anualizado</span><span className="font-bold">{currentConfig.volAnual}%</span><span className="text-slate-600">{currentConfig.volBench}%</span></div>
                  <div className="flex justify-between p-1.5 bg-slate-50"><span>Índice de Sharpe</span><span className="font-bold">{currentConfig.sharpe}</span><span>-</span></div>
                  <div className="flex justify-between p-1.5"><span>Rentabilidade 12 meses</span><span className="font-bold text-emerald-800">{currentConfig.ret12m}%</span><span className="text-slate-600">{currentConfig.bench12m}%</span></div>
                  <div className="flex justify-between p-1.5 bg-slate-50"><span>Número de meses positivos</span><span className="font-bold">{currentConfig.posMonths}</span><span>-</span></div>
                  <div className="flex justify-between p-1.5"><span>Número de meses negativos</span><span className="font-bold">{currentConfig.negMonths}</span><span>-</span></div>
                  <div className="flex justify-between p-1.5 bg-slate-50"><span>Meses acima de 100% do CDI</span><span className="font-bold text-emerald-800">{currentConfig.aboveBenchMonths}</span><span>-</span></div>
                  <div className="flex justify-between p-1.5"><span>Maior rentabilidade mensal</span><span className="text-emerald-700 font-bold">{currentConfig.maxMonthReturn}%</span><span>3,28%</span></div>
                  <div className="flex justify-between p-1.5 bg-slate-50"><span>Menor rentabilidade mensal</span><span className="text-rose-700 font-bold">{currentConfig.minMonthReturn}%</span><span>0,13%</span></div>
                  <div className="flex justify-between p-1.5 font-bold"><span>Patrimônio Líquido</span><span>R$ {currentConfig.currentPl}</span></div>
                  <div className="flex justify-between p-1.5 bg-slate-50 text-slate-600"><span>PL Médio 12 Meses</span><span>R$ {currentConfig.avg12mPl}</span></div>
                </div>
              </div>

            </div>

            {/* Charts Section: Cumulative Performance & Volatility */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              
              {/* Chart 1: Cumulative Performance */}
              <div className="border border-slate-200 p-3 bg-white">
                <span className="text-[10px] font-bold text-[#1b3f38] uppercase tracking-wider block mb-2 text-center">
                  Rentabilidade Acumulada: Fundo x CDI
                </span>
                <div className="h-[140px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartPerformanceData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={{ fontSize: 7, fill: "#64748b" }} />
                      <YAxis tick={{ fontSize: 7, fill: "#64748b" }} domain={[0, 36000]} unit="%" />
                      <Tooltip contentStyle={{ fontSize: "10px" }} />
                      <Line type="monotone" dataKey="fund" name="Fundo Verde" stroke="#00a86b" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="cdi" name="CDI" stroke="#94a3b8" strokeWidth={1.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Volatility 40d */}
              <div className="border border-slate-200 p-3 bg-white">
                <span className="text-[10px] font-bold text-[#1b3f38] uppercase tracking-wider block mb-2 text-center">
                  Volatilidade Anualizada (Desvio Padrão - Média 40d)
                </span>
                <div className="h-[140px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartVolData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={{ fontSize: 7, fill: "#64748b" }} />
                      <YAxis tick={{ fontSize: 7, fill: "#64748b" }} domain={[0, 50]} unit="%" />
                      <Tooltip contentStyle={{ fontSize: "10px" }} />
                      <Line type="monotone" dataKey="fundVol" name="Vol Fundo" stroke="#1b3f38" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="cdiVol" name="Vol CDI" stroke="#cbd5e1" strokeWidth={1} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* Historical Monthly Matrix Table */}
            <div className="border border-slate-200 overflow-x-auto text-[9.5px]">
              <div className="bg-[#1b3f38] text-white font-bold px-3 py-1 text-[10px]">
                Rentabilidades (%) Históricas Mês a Mês (1997 - 2026)
              </div>
              <table className="w-full text-right divide-y divide-slate-100 font-mono">
                <thead className="bg-slate-100 text-slate-700 font-bold text-[8.5px] uppercase">
                  <tr>
                    <th className="py-1 px-1.5 text-left font-sans">Ano</th>
                    <th className="py-1 px-1">Jan</th>
                    <th className="py-1 px-1">Fev</th>
                    <th className="py-1 px-1">Mar</th>
                    <th className="py-1 px-1">Abr</th>
                    <th className="py-1 px-1">Mai</th>
                    <th className="py-1 px-1">Jun</th>
                    <th className="py-1 px-1">Jul</th>
                    <th className="py-1 px-1">Ago</th>
                    <th className="py-1 px-1">Set</th>
                    <th className="py-1 px-1">Out</th>
                    <th className="py-1 px-1">Nov</th>
                    <th className="py-1 px-1">Dez</th>
                    <th className="py-1 px-1.5 font-bold text-slate-900 bg-emerald-50 font-sans">Acum.Ano</th>
                    <th className="py-1 px-1.5 font-sans">CDI</th>
                    <th className="py-1 px-1.5 text-slate-900">Acum.Fdo</th>
                    <th className="py-1 px-1.5 text-slate-500">Acum.CDI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {historicalMatrixData.map((row) => (
                    <tr key={row.year} className="hover:bg-slate-50/80">
                      <td className="py-1 px-1.5 text-left font-bold font-sans text-slate-900">{row.year}</td>
                      <td className={`py-1 px-1 ${typeof row.jan === "number" && row.jan < 0 ? "text-rose-700 font-bold" : ""}`}>{row.jan}</td>
                      <td className={`py-1 px-1 ${typeof row.fev === "number" && row.fev < 0 ? "text-rose-700 font-bold" : ""}`}>{row.fev}</td>
                      <td className={`py-1 px-1 ${typeof row.mar === "number" && row.mar < 0 ? "text-rose-700 font-bold" : ""}`}>{row.mar}</td>
                      <td className={`py-1 px-1 ${typeof row.abr === "number" && row.abr < 0 ? "text-rose-700 font-bold" : ""}`}>{row.abr}</td>
                      <td className={`py-1 px-1 ${typeof row.mai === "number" && row.mai < 0 ? "text-rose-700 font-bold" : ""}`}>{row.mai}</td>
                      <td className={`py-1 px-1 ${typeof row.jun === "number" && row.jun < 0 ? "text-rose-700 font-bold" : ""}`}>{row.jun}</td>
                      <td className={`py-1 px-1 ${typeof row.jul === "number" && row.jul < 0 ? "text-rose-700 font-bold" : ""}`}>{row.jul}</td>
                      <td className={`py-1 px-1 ${typeof row.ago === "number" && row.ago < 0 ? "text-rose-700 font-bold" : ""}`}>{row.ago}</td>
                      <td className={`py-1 px-1 ${typeof row.set === "number" && row.set < 0 ? "text-rose-700 font-bold" : ""}`}>{row.set}</td>
                      <td className={`py-1 px-1 ${typeof row.out === "number" && row.out < 0 ? "text-rose-700 font-bold" : ""}`}>{row.out}</td>
                      <td className={`py-1 px-1 ${typeof row.nov === "number" && row.nov < 0 ? "text-rose-700 font-bold" : ""}`}>{row.nov}</td>
                      <td className={`py-1 px-1 ${typeof row.dez === "number" && row.dez < 0 ? "text-rose-700 font-bold" : ""}`}>{row.dez}</td>
                      <td className="py-1 px-1.5 font-bold text-emerald-800 bg-emerald-50/50">{row.acumAno}%</td>
                      <td className="py-1 px-1.5 text-slate-600">{row.cdiAno}%</td>
                      <td className="py-1 px-1.5 font-bold text-slate-800">{row.acumFdo}</td>
                      <td className="py-1 px-1.5 text-slate-500">{row.acumCdi}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom Disclaimer */}
            <div className="mt-8 pt-4 border-t border-slate-200 text-[9px] text-slate-500 leading-normal">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <p className="max-w-[580px]">
                  A Harpia Finance Asset Management S.A. (“Harpia”) não comercializa e nem distribui cotas de fundos. Supervisão e Fiscalização: Comissão de Valores Mobiliários (CVM).
                </p>
                <div className="border border-emerald-600 bg-emerald-50 px-2 py-1 rounded text-center shrink-0">
                  <span className="text-[10px] font-bold text-emerald-900 block">ANBIMA</span>
                  <span className="text-[8px] text-emerald-700">Autorregulação Gestão de Recursos</span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 text-slate-400">
                <span>{formatMonthName(selectedMonth)}</span>
                <span>4</span>
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
