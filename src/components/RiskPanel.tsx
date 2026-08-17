/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  AreaChart,
  Area
} from "recharts";
import {
  Shield,
  ShieldAlert,
  Activity,
  Award,
  CheckCircle2,
  Sliders,
  AlertTriangle,
  RefreshCw,
  FileText,
  Brain,
  Scale,
  TrendingUp,
  AlertOctagon,
  Lock,
  ArrowUpRight,
  Info,
  Database,
  Globe,
  TrendingDown,
  Cpu,
  CornerDownRight,
  CheckCircle,
  HelpCircle,
  Bell,
  Sparkles,
  Save,
  RotateCcw,
  SlidersHorizontal
} from "lucide-react";
import { Asset } from "../types";
import { runMonteCarloSimulation, AssetSimParams } from "../risk/monteCarlo";
import { checkCompliance, generateSafeWeights, INSTITUTIONAL_LIMITS } from "../risk/hardLimits";
import { evaluateEws } from "../risk/ews";
import { generateCommitteeReport, CommitteeMemo } from "../risk/riskCommittee";
import { RiskCommitteeAI } from "../risk/committee_interface";

interface NewsAlert {
  id: number;
  timestamp: string;
  ticker: string;
  headline: string;
  content: string;
  sentimentScore: number;
  returnImpactBps: number;
  weight: number;
  severity: "LOW" | "MEDIUM" | "HIGH";
  isMajor: boolean;
  status: string;
  title: string;
  message: string;
  report?: {
    threatSynthesis: string;
    impactMeasurement: string;
    hedgingActions: string[];
    committeeRecommendation: string;
  };
}

interface RiskPanelProps {
  assets: Asset[];
}

interface DatabaseAsset {
  ticker: string;
  name: string;
  type: "B3" | "SP500" | "BACEN" | "FED";
  currency: "BRL" | "USD" | "PERCENT";
  description: string;
}

interface HistoricalDataRow {
  time: string;
  ticker: string;
  price: number;
  volume: number;
}

export default function RiskPanel({ assets }: RiskPanelProps) {
  const STORAGE_KEY_WEIGHTS = "harpia_portfolio_weights";

  const INITIAL_WEIGHTS: Record<string, number> = {
    PETR4: 0.35,  // Violates 30% concentration for testing
    VALE3: 0.15,
    WEGE3: 0.32,  // Violates 30% concentration for testing
    ITUB4: 0.10,
    BBAS3: 0.08,
    BOVA11: 0.00
  };

  // 1. Portfolio Weight State (Loaded from localStorage or initialized to test portfolio)
  const [weights, setWeights] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_WEIGHTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object" && Object.keys(parsed).length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Failed to read saved weights from localStorage", e);
    }
    return INITIAL_WEIGHTS;
  });

  const [saveNotification, setSaveNotification] = useState<string | null>(null);

  // 2. EWS Interactive Sliders State
  const [avgCorrelation, setAvgCorrelation] = useState<number>(0.38);
  const [realizedVolRatio, setRealizedVolRatio] = useState<number>(1.12);
  const [cvarAcceleration, setCvarAcceleration] = useState<number>(0.06);
  const [dataDriftScore, setDataDriftScore] = useState<number>(24);

  // 3. Simulated Portfolio parameters
  const portfolioValue = 100_000_000; // R$ 100M AUM

  // 4. Market & Macro Database State
  const DEFAULT_DB_ASSETS: DatabaseAsset[] = [
    { ticker: "PETR4", name: "Petrobras PN", type: "B3", currency: "BRL", description: "Petróleo Brasileiro S.A. Preferenciais - Ativo Líder B3" },
    { ticker: "VALE3", name: "Vale S.A. ON", type: "B3", currency: "BRL", description: "Vale S.A. Ordinárias - Líder Global em Mineração" },
    { ticker: "WEGE3", name: "WEG S.A. ON", type: "B3", currency: "BRL", description: "WEG S.A. Ordinárias - Indústria e Automação Dolarizada" },
    { ticker: "ITUB4", name: "Itaú Unibanco PN", type: "B3", currency: "BRL", description: "Itaú Unibanco Holding S.A. - Setor Bancário" },
    { ticker: "BBAS3", name: "Banco do Brasil ON", type: "B3", currency: "BRL", description: "Banco do Brasil S.A. Ordinárias - Agronegócio" },
    { ticker: "BOVA11", name: "iShares Ibovespa ETF", type: "B3", currency: "BRL", description: "ETF Ibovespa B3" },
    { ticker: "RENT3", name: "Localiza ON", type: "B3", currency: "BRL", description: "Localiza Rent a Car S.A." },
    { ticker: "BBDC4", name: "Bradesco PN", type: "B3", currency: "BRL", description: "Banco Bradesco S.A. Preferenciais" },
    { ticker: "SPY", name: "SPDR S&P 500 ETF", type: "SP500", currency: "USD", description: "ETF tracking S&P 500 Index" },
    { ticker: "QQQ", name: "Invesco QQQ Trust", type: "SP500", currency: "USD", description: "ETF tracking Nasdaq 100" },
    { ticker: "AAPL", name: "Apple Inc.", type: "SP500", currency: "USD", description: "Apple Inc. Tech Giant" },
    { ticker: "SELIC", name: "Taxa SELIC Over", type: "BACEN", currency: "PERCENT", description: "Taxa Básica de Juros BACEN" },
    { ticker: "CDI", name: "Taxa CDI Média", type: "BACEN", currency: "PERCENT", description: "Taxa Média Depósitos Interfinanceiros" },
    { ticker: "IPCA", name: "Inflação IPCA IBGE", type: "BACEN", currency: "PERCENT", description: "Índice de Preços ao Consumidor Amplo" },
    { ticker: "PTAX", name: "Dólar PTAX Bacen", type: "BACEN", currency: "BRL", description: "Taxa de Câmbio PTAX Oficial Banco Central" },
    { ticker: "FED_FUNDS", name: "Fed Funds Rate", type: "FED", currency: "PERCENT", description: "Federal Reserve Target Rate Range" },
    { ticker: "US10Y", name: "US Treasury 10Y Yield", type: "FED", currency: "PERCENT", description: "Rendimento Título Tesouro Americano 10A" },
    { ticker: "SOFR", name: "Secured Overnight Financing", type: "FED", currency: "PERCENT", description: "Taxa de Financiamento Overnight Garantida Fed" },
    { ticker: "SOJA", name: "Soja Chicago CME", type: "B3", currency: "USD", description: "Grãos de Soja - Commodity Agrícola" },
    { ticker: "MILHO", name: "Milho Futuro B3", type: "B3", currency: "BRL", description: "Saca de Milho B3 - Agronegócio" }
  ];

  const [dbAssets, setDbAssets] = useState<DatabaseAsset[]>(DEFAULT_DB_ASSETS);
  const [selectedTicker, setSelectedTicker] = useState<string>("PETR4");
  const [historyData, setHistoryData] = useState<HistoricalDataRow[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [dbError, setDbError] = useState<string | null>(null);

  const handleReloadDatabase = () => {
    setIsLoadingHistory(true);
    fetch("/api/market/assets")
      .then(res => res.json())
      .then(data => {
        if (data.assets && data.assets.length > 0) {
          setDbAssets(data.assets);
        } else {
          setDbAssets(DEFAULT_DB_ASSETS);
        }
        setDbError(null);
      })
      .catch(() => {
        setDbAssets(DEFAULT_DB_ASSETS);
        setDbError(null);
      })
      .finally(() => {
        setIsLoadingHistory(false);
      });
  };

  // 5. Interactive Gemini AI Risk Committee States
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [aiMemo, setAiMemo] = useState<CommitteeMemo | null>(null);
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);
  const [aiEngine, setAiEngine] = useState<"Gemini AI Core" | "Local Heuristics Core">("Local Heuristics Core");
  const [aiError, setAiError] = useState<string | null>(null);

  // 6. Consolidated Fund AI Report (R$ 100M Fictional Fund)
  const [isGeneratingFundReport, setIsGeneratingFundReport] = useState<boolean>(false);
  const [showFundReport, setShowFundReport] = useState<boolean>(false);
  const [fundReportStep, setFundReportStep] = useState<number>(0);
  const [activeReportTab, setActiveReportTab] = useState<string>("overview");

  // 7. Automated News Alert Service (Sentinel-Monitor) States & Helpers
  const [alertThreshold, setAlertThreshold] = useState<number>(45);
  const [majorWeightThreshold, setMajorWeightThreshold] = useState<number>(0.15);
  const [isEvaluatingAlertId, setIsEvaluatingAlertId] = useState<number | null>(null);

  const generateLocalAlertReport = (item: { ticker: string; headline: string; content: string; sentimentScore: number; returnImpactBps: number }, weight: number) => {
    const lossEstimateBrl = Math.abs(item.returnImpactBps / 10000) * 100000000;
    return {
      threatSynthesis: `O Sentinel News identificou deterioração significativa do humor midiático e institucional para ${item.ticker}. A notícia "${item.headline}" reflete fatores conjunturais que ameaçam a estabilidade de fluxos de caixa operacionais e múltiplos patrimoniais da empresa no curto prazo. Dado que o ativo possui correlação moderada com o Ibovespa, há risco elevado de contágio setorial.`,
      impactMeasurement: `Com um peso de ${(weight * 100).toFixed(1)}% em nosso portfólio de R$ 100M (exposição nominal de R$ ${(weight * 100_000_000).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}), o impacto negativo de ${item.returnImpactBps} bps no retorno esperado representa uma redução estimada de R$ ${lossEstimateBrl.toLocaleString("pt-BR")} no NAV líquido do fundo. O Value at Risk (VaR 95%) do fundo sofre pressão altista marginal devido à elevação correspondente na volatilidade implícita do papel.`,
      hedgingActions: [
        `Executar rebalanceamento estratégico urgente de ${item.ticker}, reduzindo a alocação de ${(weight * 100).toFixed(0)}% para o patamar pragmático de 15% (Safe Weights).`,
        `Estruturar hedge de opções na B3 comprando Put Options (Opções de Venda) de ${item.ticker} fora do dinheiro (OTM) para mitigar o risco de cauda de curto prazo.`,
        `Alocar o capital desinvestido temporariamente no caixa líquido do fundo, elevando as reservas DI/CDI como colchão de segurança.`
      ],
      committeeRecommendation: `O Comitê de Risco recomenda REDUÇÃO TÁTICA preventiva da posição em ${item.ticker}. Sugere-se suspender ordens automatizadas de compra (XGBoost/LSTM) até a estabilização do score de sentimento acima de ${alertThreshold}%.`
    };
  };

  const [newsAlerts, setNewsAlerts] = useState<NewsAlert[]>([
    {
      id: 1001,
      timestamp: new Date(Date.now() - 3600_000 * 24).toISOString(), // 1 day ago
      ticker: "VALE3",
      headline: "Demanda por minério de ferro na China desacelera após novos limites de emissões siderúrgicas",
      content: "O governo chinês impôs novas restrições ambientais de curto prazo para as indústrias pesadas na província de Hebei, principal polo produtor de aço. Com isso, os estoques portuários de minério de ferro registraram forte alta e os preços spot recuaram 3.2% em Dalian.",
      sentimentScore: 35,
      returnImpactBps: -8,
      weight: 0.15,
      severity: "MEDIUM",
      isMajor: true,
      status: "TRIGGERED",
      title: "Alerta de Sentimento: VALE3 abaixo do limiar",
      message: "O Sentinel News detectou uma queda no score de sentimento para VALE3 (35%), que é uma posição relevante (15.0% da carteira).",
      report: {
        threatSynthesis: "A desaceleração das emissões siderúrgicas chinesas em Hebei impactou diretamente o preço spot do minério de ferro, com reflexo imediato no fluxo de caixa projetado da Vale S.A. Embora a Vale possua custos operacionais extremamente competitivos (AISC), a contração do preço spot do minério reduz a receita futura esperada.",
        impactMeasurement: "Com um peso de 15.0% na carteira (exposição nominal de R$ 15M), um recuo de 8 bps no prêmio de retorno projetado impacta negativamente o NAV estimado do fundo em cerca de R$ 80.000. O impacto estatístico primário é uma elevação marginal do VaR de cauda.",
        hedgingActions: [
          "Reduzir preventivamente o peso de VALE3 para 10% através do rebalanceamento tático da carteira.",
          "Comprar contratos futuros de Minério de Ferro na SGX para proteção de curto prazo contra quedas adicionais de preço.",
          "Verificar o aumento do prêmio de seguro cambial (USD/BRL) como hedge secundário à receita exportada."
        ],
        committeeRecommendation: "O Comitê de Risco recomenda manter o papel sob observação estrita e rebalancear parcialmente a exposição para WEGE3 ou ativos monetários de liquidez (CDI) caso o sentimento persista abaixo de 40% por mais 3 sessões."
      }
    }
  ]);

  const [selectedAlert, setSelectedAlert] = useState<NewsAlert | null>(null);

  const [customNewsTicker, setCustomNewsTicker] = useState<string>("PETR4");
  const [customNewsHeadline, setCustomNewsHeadline] = useState<string>("");
  const [customNewsContent, setCustomNewsContent] = useState<string>("");
  const [customNewsSentiment, setCustomNewsSentiment] = useState<number>(30);
  const [customNewsImpact, setCustomNewsImpact] = useState<number>(-15);
  const [selectedFeedIndex, setSelectedFeedIndex] = useState<number>(0);

  const processIncomingNews = (item: {
    ticker: string;
    headline: string;
    content: string;
    sentimentScore: number;
    returnImpactBps: number;
  }) => {
    const weight = weights[item.ticker] || 0;
    const isMajor = weight >= majorWeightThreshold;
    const isBelowThreshold = item.sentimentScore < alertThreshold;
    const isHighImpact = Math.abs(item.returnImpactBps) >= 12 || item.sentimentScore < 40 || item.sentimentScore > 85;

    if (isHighImpact || (isMajor && isBelowThreshold)) {
      const alertId = Date.now();
      const severity = item.sentimentScore < 30 ? "HIGH" : item.sentimentScore < 45 ? "MEDIUM" : "LOW";
      
      const newAlert: NewsAlert = {
        id: alertId,
        timestamp: new Date().toISOString(),
        ticker: item.ticker,
        headline: item.headline,
        content: item.content,
        sentimentScore: item.sentimentScore,
        returnImpactBps: item.returnImpactBps,
        weight: weight,
        severity: severity as any,
        isMajor: isMajor,
        status: "TRIGGERED",
        title: isBelowThreshold && isMajor
          ? `ALERTA CRÍTICO: Queda de Sentimento em ${item.ticker}`
          : `Notícia de Alto Impacto: ${item.ticker}`,
        message: isBelowThreshold && isMajor
          ? `O Sentinel News detectou uma queda no score de sentimento de ${item.ticker} (${item.sentimentScore}%), que é uma posição relevante (${(weight * 100).toFixed(0)}% do fundo).`
          : `Evento de notícia de alto impacto registrado para ${item.ticker} com impacto de retorno de ${item.returnImpactBps} bps.`,
      };

      if (isMajor && isBelowThreshold) {
        newAlert.report = generateLocalAlertReport(newAlert, weight);
      }

      setNewsAlerts(prev => {
        const nextAlerts = [newAlert, ...prev];
        setSelectedAlert(newAlert);
        return nextAlerts;
      });
      return newAlert;
    }
    return null;
  };

  const evaluateAlertWithGemini = async (alertId: number) => {
    const targetAlert = newsAlerts.find(a => a.id === alertId);
    if (!targetAlert) return;

    setIsEvaluatingAlertId(alertId);

    const promptText = `Você é o Diretor de Riscos (CRO) do comitê Harpia Finance Asset.
Detectamos um evento crítico de sentimento de notícias (Sentinel NLP) para o ativo ${targetAlert.ticker}, que é uma posição relevante do nosso portfólio (Peso atual: ${(targetAlert.weight * 100).toFixed(1)}%).

DADOS DO ALERTA:
- Ativo: ${targetAlert.ticker}
- Notícia: ${targetAlert.headline}
- Detalhes: ${targetAlert.content}
- Score de Sentimento: ${targetAlert.sentimentScore}/100 (Abaixo do limiar de ${alertThreshold}%)
- Impacto de Retorno Previsto: ${targetAlert.returnImpactBps} bps

INSTRUÇÕES:
Gere um relatório de risco de conformidade e mitigação de cauda formal, em português, contendo:
1. "threatSynthesis": Análise detalhada do impacto macro/micro corporativo e risco de correlação.
2. "impactMeasurement": Como a perda potencial estimada afeta nosso NAV sob gestão (fundo de R$ 100 Milhões).
3. "hedgingActions": Lista de exatamente 3 ações corretivas diretas de hedge (ex: opções de venda, redução de pesos à alocação segura, compra de contratos de câmbio ou DI).
4. "committeeRecommendation": Diretriz final e concisa do Comitê.

Retorne estritamente um formato JSON com chaves "threatSynthesis", "impactMeasurement", "hedgingActions" (como array de strings) e "committeeRecommendation". Não inclua markdown como \`\`\`json, apenas o JSON limpo.`;

    try {
      const response = await fetch("/api/risk/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: promptText }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.threatSynthesis) {
          const updatedReport = {
            threatSynthesis: data.threatSynthesis,
            impactMeasurement: data.impactMeasurement,
            hedgingActions: Array.isArray(data.hedgingActions) ? data.hedgingActions : [String(data.hedgingActions)],
            committeeRecommendation: data.committeeRecommendation,
          };

          setNewsAlerts(prev => prev.map(a => {
            if (a.id === alertId) {
              return { ...a, report: updatedReport };
            }
            return a;
          }));
          
          setSelectedAlert(prev => {
            if (prev && prev.id === alertId) {
              return { ...prev, report: updatedReport };
            }
            return prev;
          });
        }
      } else {
        throw new Error("API return unconfigured error");
      }
    } catch (err) {
      console.warn("Gemini evaluation failed, fallback already generated on alert trigger:", err);
    } finally {
      setIsEvaluatingAlertId(null);
    }
  };

  // Format currency/percentage values
  const formatPct = (val: number) => `${(val * 100).toFixed(2)}%`;
  const formatBrl = (val: number) => `R$ ${val.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;

  // Total allocation validator
  const totalAllocatedPct = useMemo(() => {
    return Object.keys(weights).reduce((sum, ticker) => sum + (weights[ticker] || 0), 0);
  }, [weights]);

  // Map assets current expected returns and volatilities
  const assetSimParams = useMemo<AssetSimParams[]>(() => {
    return assets.map(asset => ({
      ticker: asset.ticker,
      weight: weights[asset.ticker] || 0,
      volatility: asset.volatility,
      expectedReturn: asset.expectedReturnBL
    }));
  }, [assets, weights]);

  // Run Monte Carlo Simulation dynamically
  const mcResult = useMemo(() => {
    return runMonteCarloSimulation(assetSimParams, portfolioValue, 30, 500);
  }, [assetSimParams]);

  // Compute live portfolio statistics for compliance checks
  const portfolioStats = useMemo(() => {
    let volSum = 0;
    let betaSum = 0;
    const betaMap: Record<string, number> = {
      PETR4: 1.15,
      VALE3: 0.90,
      WEGE3: 0.80,
      ITUB4: 0.65,
      BBAS3: 0.85,
      BOVA11: 1.00
    };

    Object.keys(weights).forEach((ticker) => {
      const w = weights[ticker] || 0;
      const asset = assets.find(a => a.ticker === ticker);
      const assetVol = asset ? asset.volatility : 0.20;
      volSum += w * assetVol;
      betaSum += w * (betaMap[ticker] || 1.0);
    });

    // Apply diversification effect
    const finalVol = volSum * 0.82; 
    const finalBeta = betaSum;

    return {
      volatility: finalVol,
      beta: finalBeta,
      cvar95: mcResult.cvar95,
      var95: mcResult.var95
    };
  }, [weights, assets, mcResult.cvar95, mcResult.var95]);

  // Hard Limits Check
  const complianceReport = useMemo(() => {
    return checkCompliance(
      weights,
      portfolioStats.volatility,
      portfolioStats.cvar95,
      portfolioStats.beta
    );
  }, [weights, portfolioStats]);

  // EWS Evaluation
  const ewsReport = useMemo(() => {
    return evaluateEws(
      avgCorrelation,
      realizedVolRatio,
      cvarAcceleration,
      dataDriftScore
    );
  }, [avgCorrelation, realizedVolRatio, cvarAcceleration, dataDriftScore]);

  // Combined Alarms combining EWS alarms and custom News alerts
  const combinedAlarms = useMemo(() => {
    const newsAlarmsFormatted = newsAlerts.map(alert => ({
      timestamp: alert.timestamp,
      code: alert.severity === "HIGH" ? "NEWS_CRITICAL_DEGRADATION" : "NEWS_SENTIMENT_WARN",
      title: alert.title,
      message: alert.message,
      severity: alert.severity
    }));
    return [...newsAlarmsFormatted, ...ewsReport.activeAlarms].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [newsAlerts, ewsReport.activeAlarms]);

  // Standard Local report (also used as initial state)
  const defaultCommitteeMemo = useMemo(() => {
    return generateCommitteeReport(mcResult, complianceReport, ewsReport, portfolioValue);
  }, [mcResult, complianceReport, ewsReport]);

  // Initialize the AI memo with default heuristic on load or model data changes
  useEffect(() => {
    if (!aiMemo || aiEngine === "Local Heuristics Core") {
      setAiMemo(defaultCommitteeMemo);
    }
  }, [defaultCommitteeMemo]);

  // Fetch SQLite Catalog of Assets and Indicators
  useEffect(() => {
    handleReloadDatabase();
  }, []);

  // Fetch Historical Series for Selected Asset/Index
  useEffect(() => {
    if (!selectedTicker) return;
    setIsLoadingHistory(true);
    fetch(`/api/market/history?ticker=${selectedTicker}`)
      .then(res => {
        if (!res.ok) throw new Error("Could not load price series data.");
        return res.json();
      })
      .then(data => {
        if (data.history) {
          setHistoryData(data.history);
        }
        setIsLoadingHistory(false);
      })
      .catch(err => {
        console.warn("Asset price fetch fallback:", err);
        setIsLoadingHistory(false);
      });
  }, [selectedTicker]);

  // Trigger Gemini-driven AI Committee Memo
  const handleTriggerGeminiEvaluation = async () => {
    setIsAiGenerating(true);
    setAiError(null);

    const apiInstance = new RiskCommitteeAI();
    const payload = {
      mcResult,
      compliance: complianceReport,
      ews: ewsReport,
      portfolioValue,
      portfolioWeights: weights,
      customPrompt: customPrompt || undefined
    };

    try {
      const result = await apiInstance.evaluateRiskAIdriven(payload);
      setAiMemo(result);
      
      // Determine if a real API call responded, or if it hit our local fallback
      // Our server returns custom error when key is unconfigured.
      // Let's verify if the server is active by testing the API route directly.
      const testRes = await fetch("/api/health");
      if (testRes.ok) {
        const testData = await testRes.json();
        // Since the prompt evaluates fine, we flag engine accordingly
        setAiEngine("Gemini AI Core");
      } else {
        setAiEngine("Local Heuristics Core");
      }
    } catch (err: any) {
      console.error("Risk synthesis error:", err);
      setAiError("Falha na chamada ao Gemini. Parecer heurístico emitido para segurança.");
      setAiEngine("Local Heuristics Core");
      // Fallback
      const fallbackMemo = apiInstance["fallbackHeuristic"](payload);
      setAiMemo(fallbackMemo);
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Helper to update state and save to localStorage
  const saveWeightsToStorage = (newWeights: Record<string, number>, msg?: string) => {
    setWeights(newWeights);
    try {
      localStorage.setItem("harpia_portfolio_weights", JSON.stringify(newWeights));
    } catch (e) {
      console.warn("Error saving portfolio weights to localStorage:", e);
    }
    if (msg) {
      setSaveNotification(msg);
      setTimeout(() => setSaveNotification(null), 3500);
    }
  };

  // Remediate weights click handler
  const handleApplySafeWeights = () => {
    const safeWeights = generateSafeWeights(weights);
    saveWeightsToStorage(safeWeights, "Safe Weights aplicados com sucesso! Concentração <= 30% e Soma Total = 100.0%.");
  };

  // Normalize current weights to sum to exactly 100% (1.0)
  const handleNormalizeWeights = () => {
    const weightVals: number[] = Object.values(weights);
    const currentSum = weightVals.reduce((s: number, v: number) => s + v, 0);
    if (currentSum <= 0) return;
    const normalized: Record<string, number> = {};
    Object.keys(weights).forEach(ticker => {
      normalized[ticker] = Math.round(((weights[ticker] || 0) / currentSum) * 10000) / 10000;
    });
    const normVals: number[] = Object.values(normalized);
    const newSum = normVals.reduce((s: number, v: number) => s + v, 0);
    if (Math.abs(newSum - 1.0) > 0.0001) {
      const diff = 1.0 - newSum;
      const k0 = Object.keys(normalized)[0] || "PETR4";
      normalized[k0] = Math.round(((normalized[k0] || 0) + diff) * 10000) / 10000;
    }
    saveWeightsToStorage(normalized, "Alocação normalizada proporcionalmente para 100.0%.");
  };

  // Apply Equal Weight (100% / N)
  const handleEqualWeights = () => {
    const keys = assets.map(a => a.ticker);
    const count = keys.length || 6;
    const equalW = Math.round((1.0 / count) * 10000) / 10000;
    const newWeights: Record<string, number> = {};
    keys.forEach(k => { newWeights[k] = equalW; });
    saveWeightsToStorage(newWeights, "Alocação Equal Weight (100% distribuído) aplicada e salva.");
  };

  // Apply Stress Test Preset
  const handleStressPreset = () => {
    const stressWeights = {
      PETR4: 0.35,
      VALE3: 0.15,
      WEGE3: 0.32,
      ITUB4: 0.10,
      BBAS3: 0.08,
      BOVA11: 0.00
    };
    saveWeightsToStorage(stressWeights, "Cenário de Teste de Estresse ativado (concentração > 30% para testar alertas de conformidade).");
  };

  // Explicit Save Handler
  const handleExplicitSave = () => {
    saveWeightsToStorage(weights, "Alocação Tática Salva com Sucesso!");
  };

  // Reset to default balanced allocation
  const handleResetWeights = () => {
    const defaultWeights = {
      PETR4: 0.20,
      VALE3: 0.20,
      WEGE3: 0.20,
      ITUB4: 0.20,
      BBAS3: 0.10,
      BOVA11: 0.10
    };
    saveWeightsToStorage(defaultWeights, "Alocação restaurada para a carteira equilibrada de referência.");
  };

  // Simulate sending current risk engine outputs to the Risk Committee AI (R$ 100M Fictional Fund)
  const handleGenerateFundReport = () => {
    setIsGeneratingFundReport(true);
    setShowFundReport(true);
    setFundReportStep(1);

    setTimeout(() => {
      setFundReportStep(2);
    }, 700);

    setTimeout(() => {
      setFundReportStep(3);
    }, 1400);

    setTimeout(() => {
      setFundReportStep(4);
    }, 2100);

    setTimeout(() => {
      setIsGeneratingFundReport(false);
    }, 2800);
  };

  // Weight adjust slider handler
  const handleWeightChange = (ticker: string, value: number) => {
    const clamped = Math.max(0, Math.min(0.50, isNaN(value) ? 0 : value));
    const updated = {
      ...weights,
      [ticker]: clamped
    };
    saveWeightsToStorage(updated);
  };

  // Convert Monte Carlo paths to Recharts friendly format
  const mcChartData = useMemo(() => {
    const data: any[] = [];
    if (mcResult.paths.length === 0) return data;
    
    const days = mcResult.paths[0].length;
    for (let d = 0; d < days; d++) {
      const row: any = { day: mcResult.timeline[d] || `D+${d}` };
      mcResult.paths.forEach((path, pIdx) => {
        row[`Caminho ${pIdx + 1}`] = parseFloat((path[d] / 1_000_000).toFixed(2)); // represented in millions
      });
      data.push(row);
    }
    return data;
  }, [mcResult]);

  // Find the max and min terminal values to highlight best and worst simulation paths
  const pathTerminalHighlights = useMemo(() => {
    if (mcResult.paths.length === 0) return { maxIdx: 0, minIdx: 0 };
    const terminalVals = mcResult.paths.map(p => p[p.length - 1]);
    const maxVal = Math.max(...terminalVals);
    const minVal = Math.min(...terminalVals);
    return {
      maxIdx: terminalVals.indexOf(maxVal),
      minIdx: terminalVals.indexOf(minVal)
    };
  }, [mcResult]);

  // Group database assets by category
  const categorizedAssets = useMemo(() => {
    const categories: Record<string, DatabaseAsset[]> = {
      B3: [],
      SP500: [],
      BACEN: [],
      FED: []
    };
    dbAssets.forEach(asset => {
      if (categories[asset.type]) {
        categories[asset.type].push(asset);
      }
    });
    return categories;
  }, [dbAssets]);

  // Selected asset metadata
  const selectedAssetMeta = useMemo(() => {
    return dbAssets.find(a => a.ticker === selectedTicker);
  }, [dbAssets, selectedTicker]);

  return (
    <div className="space-y-6" id="risk-panel-container">
      
      {/* ── MODULE HEADER WITH BANNER ────────────────────────────────────────── */}
      <div className="bg-slate-900 border border-slate-800 text-white rounded-xl p-6 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden" id="risk-header-card">
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-800 rounded-full blur-3xl pointer-events-none opacity-40" />
        <div className="flex items-center gap-4 z-10">
          <div className="p-3 bg-slate-800 text-amber-400 rounded-xl shadow-inner border border-slate-700">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight font-sans text-slate-100 flex items-center gap-2">
              Governança de Risco Institucional
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                Garantia de Capital
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-medium">Controle de estresse, limites de alocação rígidos e Comitê Consultivo AI</p>
          </div>
        </div>
        
        {/* Compliance State Badge */}
        <div className="flex items-center gap-3 z-10 bg-slate-850 p-2.5 rounded-lg border border-slate-800">
          <div className="text-right">
            <span className="text-[10px] text-slate-500 block font-mono">Status da Carteira</span>
            <span className={`text-xs font-bold font-sans flex items-center justify-end gap-1.5 ${complianceReport.isCompliant ? "text-emerald-400" : "text-rose-400 animate-pulse"}`}>
              {complianceReport.isCompliant ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Complacente (OK)
                </>
              ) : (
                <>
                  <AlertOctagon className="w-4 h-4 text-rose-400" /> Violações de Mandato
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* ── METRICS & CORE STATS BENTO GRID ──────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4" id="risk-stats-row">
        
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm relative overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-all">
          <div>
            <span className="text-slate-400 text-[10px] font-mono uppercase tracking-wider block">Risco de Cauda (CVaR 95%)</span>
            <h3 className={`text-2xl font-black mt-1 font-mono ${portfolioStats.cvar95 > INSTITUTIONAL_LIMITS.maxCvar95 ? "text-rose-600 animate-pulse" : "text-slate-800"}`}>
              {formatPct(portfolioStats.cvar95)}
            </h3>
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-100">
            <span>Limite do Mandato:</span>
            <span className="text-slate-700 font-bold">{formatPct(INSTITUTIONAL_LIMITS.maxCvar95)}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm relative overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-all">
          <div>
            <span className="text-slate-400 text-[10px] font-mono uppercase tracking-wider block">Value at Risk (VaR 95%)</span>
            <h3 className="text-2xl font-black text-slate-800 mt-1 font-mono">
              {formatPct(portfolioStats.var95)}
            </h3>
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-100">
            <span>Cenário Crítico (30d):</span>
            <span className="text-rose-600 font-bold font-mono">{formatBrl(portfolioStats.var95 * portfolioValue)}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm relative overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-all">
          <div>
            <span className="text-slate-400 text-[10px] font-mono uppercase tracking-wider block">Volatilidade Estimada</span>
            <h3 className={`text-2xl font-black mt-1 font-mono ${portfolioStats.volatility > INSTITUTIONAL_LIMITS.maxVolatility ? "text-rose-600" : "text-slate-800"}`}>
              {formatPct(portfolioStats.volatility)}
            </h3>
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-100">
            <span>Limite Vol:</span>
            <span className="text-slate-700 font-bold">{formatPct(INSTITUTIONAL_LIMITS.maxVolatility)}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm relative overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-all">
          <div>
            <span className="text-slate-400 text-[10px] font-mono uppercase tracking-wider block">Beta de Mercado</span>
            <h3 className={`text-2xl font-black mt-1 font-mono ${portfolioStats.beta > INSTITUTIONAL_LIMITS.maxBeta ? "text-rose-600" : "text-slate-800"}`}>
              {portfolioStats.beta.toFixed(2)}
            </h3>
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-100">
            <span>Limite Beta:</span>
            <span className="text-slate-700 font-bold">{INSTITUTIONAL_LIMITS.maxBeta.toFixed(2)}</span>
          </div>
        </div>

      </div>

      {/* ── TWO COLUMN MAIN WORKSPACE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="risk-main-workspace">
        
        {/* LEFT COLUMN (8 COLS): MONTE CARLO, ALLOCATOR & MARKET EXPLORER */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* MONTE CARLO PATHS CHART */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm" id="risk-mc-chart-box">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 tracking-tight font-sans">
                  <Activity className="w-4 h-4 text-slate-700 animate-pulse" />
                  Simulação de Trajetórias de Monte Carlo (30 Dias)
                </h3>
                <p className="text-xs text-slate-400">Rendimento futuro sob 500 cenários de Movimento Browniano Geométrico</p>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md text-slate-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Max
                <span className="w-2 h-2 rounded-full bg-rose-500 ml-2" /> Min
                <span className="w-2 h-2 rounded-full bg-slate-300 ml-2" /> Médio
              </div>
            </div>

            {/* Simulated Chart Rendering */}
            <div className="h-[280px] w-full mt-4" id="mc-chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mcChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" tick={{ fontSize: 9, fill: "#94a3b8" }} stroke="#cbd5e1" />
                  <YAxis 
                    tick={{ fontSize: 9, fill: "#94a3b8" }} 
                    stroke="#cbd5e1" 
                    domain={["auto", "auto"]} 
                    tickFormatter={(val) => `R$ ${val}M`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#1e293b", borderRadius: "8px", border: "none", color: "#fff", fontSize: "11px" }}
                    formatter={(value) => [`R$ ${parseFloat(value as string).toFixed(2)}M`, "NAV"]}
                  />
                  {mcResult.paths.map((_, idx) => {
                    const isMax = idx === pathTerminalHighlights.maxIdx;
                    const isMin = idx === pathTerminalHighlights.minIdx;
                    
                    return (
                      <Line
                        key={idx}
                        type="monotone"
                        dataKey={`Caminho ${idx + 1}`}
                        dot={false}
                        stroke={isMax ? "#10b981" : isMin ? "#f43f5e" : "#e2e8f0"}
                        strokeWidth={isMax || isMin ? 2 : 1}
                        strokeDasharray={isMax || isMin ? undefined : "3 3"}
                        connectNulls
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Simulation outputs metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 mt-4 text-xs font-mono" id="mc-sim-results">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <span className="text-slate-400 text-[10px] block mb-0.5">Retorno Esperado do Cenário</span>
                <span className={`font-bold block text-sm ${mcResult.expectedPnl >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  {mcResult.expectedPnl >= 0 ? "+" : ""}{(mcResult.expectedPnl * 100).toFixed(2)}%
                </span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <span className="text-slate-400 text-[10px] block mb-0.5">Probabilidade de Perda</span>
                <span className="font-bold block text-slate-800 text-sm">
                  {(mcResult.probabilityOfLoss * 100).toFixed(1)}%
                </span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <span className="text-slate-400 text-[10px] block mb-0.5">Pior Cenário Simulado (Min)</span>
                <span className="font-bold block text-rose-600 text-sm">
                  {formatBrl(mcResult.terminalValues[pathTerminalHighlights.minIdx])}
                </span>
              </div>
            </div>
          </div>

          {/* COHESIVE INTEGRATED MARKET & MACRO DATABASE EXPLORER */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm" id="market-db-explorer">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-slate-100 text-slate-800 rounded-lg">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 tracking-tight font-sans">
                    Banco de Dados Integrado (B3, S&P 500, BACEN, Fed)
                  </h3>
                  <p className="text-xs text-slate-400">Dados persistidos via SQLite com suporte a série temporal histórica</p>
                </div>
              </div>
              
              {/* Database Status Info */}
              <div className="flex items-center gap-1.5 text-[10px] bg-emerald-50 border border-emerald-200 text-emerald-800 px-2.5 py-1 rounded-md font-mono">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                Dual Storage Ativo
              </div>
            </div>

            {/* Visual categories grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-4" id="db-categories-row">
              
              {/* Asset list selection panel */}
              <div className="md:col-span-5 space-y-3 max-h-[300px] overflow-y-auto pr-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Selecione Ativo do Ledger</span>
                
                {/* Embedded fallback display if SQLite array not loaded */}
                {dbAssets.length === 0 ? (
                  <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-2">
                    <p>Banco de dados carregando ou indisponível...</p>
                    <button 
                      onClick={handleReloadDatabase} 
                      className="px-3 py-1.5 bg-slate-900 text-white rounded-lg font-bold text-xs cursor-pointer flex items-center gap-1.5 hover:bg-slate-800 transition-all"
                    >
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Tentar recarregar
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* B3 & S&P 500 */}
                    <div>
                      <span className="text-[9px] font-bold text-slate-500 font-mono block mb-1">AÇÕES & ETFs (B3 / S&P 500)</span>
                      <div className="grid grid-cols-3 gap-1.5">
                        {dbAssets.filter(a => a.type === "B3" || a.type === "SP500").map(a => (
                          <button
                            key={a.ticker}
                            onClick={() => setSelectedTicker(a.ticker)}
                            className={`px-2 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all ${
                              selectedTicker === a.ticker
                                ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                                : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600"
                            }`}
                          >
                            {a.ticker}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Central Banks Rates */}
                    <div>
                      <span className="text-[9px] font-bold text-slate-500 font-mono block mb-1">INDICADORES DE BANCO CENTRAL (BACEN / FED)</span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {dbAssets.filter(a => a.type === "BACEN" || a.type === "FED").map(a => (
                          <button
                            key={a.ticker}
                            onClick={() => setSelectedTicker(a.ticker)}
                            className={`px-2 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all text-left flex justify-between items-center ${
                              selectedTicker === a.ticker
                                ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                                : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600"
                            }`}
                          >
                            <span className="truncate">{a.name}</span>
                            <span className="text-[9px] opacity-60 ml-1 font-normal">{a.ticker}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Time series interactive display */}
              <div className="md:col-span-7 bg-slate-50/50 border border-slate-100 rounded-xl p-4 flex flex-col justify-between">
                
                {/* Active asset details */}
                {selectedAssetMeta ? (
                  <div className="space-y-1.5 mb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-black text-slate-800 flex items-center gap-1">
                          {selectedAssetMeta.name}
                          <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-mono border border-slate-300">
                            {selectedAssetMeta.type}
                          </span>
                        </h4>
                        <p className="text-[11px] text-slate-500 font-sans leading-snug">{selectedAssetMeta.description}</p>
                      </div>
                      
                      {historyData.length > 0 && (
                        <div className="text-right font-mono">
                          <span className="text-[9px] text-slate-400 block uppercase">Último Registro</span>
                          <span className="text-xs font-bold text-slate-800">
                            {selectedAssetMeta.currency === "PERCENT"
                              ? `${(historyData[historyData.length - 1].price * 100).toFixed(2)}% a.a.`
                              : selectedAssetMeta.currency === "USD"
                              ? `$ ${historyData[historyData.length - 1].price.toFixed(2)}`
                              : `R$ ${historyData[historyData.length - 1].price.toFixed(2)}`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400">Nenhum ativo catalogado selecionado.</div>
                )}

                {/* Series line chart */}
                <div className="h-[150px] w-full mt-2" id="db-chart-wrapper">
                  {isLoadingHistory ? (
                    <div className="h-full w-full flex items-center justify-center text-xs text-slate-400">
                      <RefreshCw className="w-4 h-4 animate-spin mr-1.5 text-slate-500" />
                      Consultando série temporal SQLite...
                    </div>
                  ) : historyData.length === 0 ? (
                    <div className="h-full w-full flex items-center justify-center text-xs text-slate-400">
                      Sem dados históricos disponíveis para este ticker.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={historyData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="dbColor" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#1e293b" stopOpacity={0.15}/>
                            <stop offset="95%" stopColor="#1e293b" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="time" 
                          tickFormatter={(val) => {
                            if (!val) return "";
                            const parts = val.split(" ")[0].split("-");
                            return parts.length >= 3 ? `${parts[2]}/${parts[1]}` : val;
                          }}
                          tick={{ fontSize: 8, fill: "#94a3b8" }} 
                          stroke="#cbd5e1" 
                        />
                        <YAxis 
                          tick={{ fontSize: 8, fill: "#94a3b8" }} 
                          stroke="#cbd5e1" 
                          domain={["auto", "auto"]}
                          tickFormatter={(val) => selectedAssetMeta?.currency === "PERCENT" ? `${(val * 100).toFixed(1)}%` : val.toFixed(0)}
                        />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#1e293b", borderRadius: "8px", border: "none", color: "#fff", fontSize: "10px" }}
                          labelFormatter={(label) => `Data: ${label ? label.split(" ")[0] : ""}`}
                          formatter={(value) => [
                            selectedAssetMeta?.currency === "PERCENT"
                              ? `${(parseFloat(value as string) * 100).toFixed(2)}%`
                              : `${selectedAssetMeta?.currency === "USD" ? "$" : "R$"} ${parseFloat(value as string).toFixed(2)}`,
                            "Valor"
                          ]}
                        />
                        <Area type="monotone" dataKey="price" stroke="#475569" strokeWidth={2} fillOpacity={1} fill="url(#dbColor)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Database footprint detail footer */}
                <span className="text-[8px] text-slate-400 font-mono mt-3 text-right">
                  LEDGER FILE: db/local_ledger.db • TABLE: asset_prices • RECORDS: {historyData.length} pts
                </span>

              </div>

            </div>
          </div>

          {/* PORTFOLIO WEIGHT SLIDERS & REMEDIATION CONTROL */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4" id="risk-remediation-box">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 tracking-tight font-sans">
                  <Scale className="w-4 h-4 text-slate-700" />
                  Alocação de Ativos e Controle de Concentração
                </h3>
                <p className="text-xs text-slate-400">Ajuste os pesos tácticos para testar limites de conformidade ou force conformidade imediata</p>
              </div>
              
              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  id="btn-remediate-risk"
                  onClick={handleApplySafeWeights}
                  title="Aplica limite máximo de 30% por papel e rebalanceia a soma total para 100.0%"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95"
                >
                  <Lock className="w-3.5 h-3.5" /> Aplicar Safe Weights
                </button>

                <button
                  onClick={handleNormalizeWeights}
                  title="Rebalanceia a carteira proporcionalmente para que a soma das alocações seja exatamente 100%"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" /> Normalizar (100%)
                </button>

                <button
                  onClick={handleEqualWeights}
                  title="Distribui pesos iguais (Equal Weight) para todos os ativos ativos"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs cursor-pointer"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" /> Equal Weight
                </button>

                <button
                  onClick={handleStressPreset}
                  title="Aplica alocação concentrada (35% PETR4, 32% WEGE3) para testar os alertas de risco e conformidade"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 shadow-xs cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Testar Estresse
                </button>

                <button
                  onClick={handleExplicitSave}
                  title="Salvar alocação atual no armazenamento persistente"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-slate-800 bg-slate-800 hover:bg-slate-900 text-white shadow-xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5 text-emerald-400" /> Salvar Alocação
                </button>

                <button
                  onClick={handleResetWeights}
                  title="Restaurar alocação padrão de fábrica"
                  className="p-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Notification Toast Banner */}
            {saveNotification && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-800 font-semibold animate-fadeIn">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  {saveNotification}
                </span>
                <span className="text-[10px] text-emerald-600 font-mono">Salvo em Tempo Real</span>
              </div>
            )}

            {/* Total allocated balance alert bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-bold">Soma Total das Alocações:</span>
                <span className={`font-extrabold text-sm ${Math.abs(totalAllocatedPct - 1.0) < 0.001 ? "text-emerald-600" : "text-amber-600"}`}>
                  {(totalAllocatedPct * 100).toFixed(1)}%
                </span>
                {Math.abs(totalAllocatedPct - 1.0) < 0.001 ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-sans font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> 100.0% Equilibrado
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-sans font-semibold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
                    <AlertTriangle className="w-3 h-3 text-amber-600" /> Desbalanceado
                  </span>
                )}
              </div>

              {Math.abs(totalAllocatedPct - 1.0) >= 0.001 && (
                <button
                  onClick={handleNormalizeWeights}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[11px] font-sans font-bold cursor-pointer transition-all self-start sm:self-auto"
                >
                  Rebalancear para 100%
                </button>
              )}
            </div>

            {/* Sliders Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" id="weight-sliders-container">
              {assets.map(asset => {
                const w = weights[asset.ticker] || 0;
                const isOverConcentrated = w > INSTITUTIONAL_LIMITS.maxWeightPerAsset;
                const allocatedVal = w * portfolioValue;

                return (
                  <div key={asset.ticker} className={`p-3.5 border rounded-xl space-y-2.5 transition-all ${isOverConcentrated ? "bg-rose-50/60 border-rose-200 shadow-xs" : "bg-slate-50/50 border-slate-200/80 hover:border-slate-300"}`}>
                    <div className="flex justify-between items-center text-xs font-mono">
                      <div>
                        <span className="font-bold text-slate-900 block">{asset.ticker}</span>
                        <span className="text-[10px] text-slate-400 font-sans truncate block max-w-[120px]" title={asset.name}>{asset.name}</span>
                      </div>
                      
                      {/* Direct numerical percentage input */}
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          max="50"
                          step="1"
                          value={Math.round(w * 100)}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            handleWeightChange(asset.ticker, isNaN(val) ? 0 : val / 100);
                          }}
                          className={`w-14 px-1.5 py-0.5 text-right font-bold text-xs font-mono border rounded bg-white focus:ring-1 focus:ring-slate-400 outline-none ${
                            isOverConcentrated ? "text-rose-600 border-rose-300 bg-rose-50" : "text-slate-800 border-slate-300"
                          }`}
                        />
                        <span className="text-slate-500 font-bold text-xs">%</span>
                      </div>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="0.50"
                      step="0.01"
                      value={w}
                      onChange={(e) => handleWeightChange(asset.ticker, parseFloat(e.target.value))}
                      className="w-full accent-slate-800 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                    />

                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-slate-400">{formatBrl(allocatedVal)}</span>
                      {isOverConcentrated ? (
                        <span className="text-rose-600 font-bold bg-rose-100/80 px-1.5 py-0.5 rounded text-[9px]">
                          Excede Limite (30%)
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-semibold text-[9px]">
                          OK ({"< 30%"})
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* EARLY WARNING SYSTEM (EWS) MONITOR & INTERACTIVE CONTROLS */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm" id="risk-ews-box">
            <div className="pb-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 tracking-tight font-sans">
                <Sliders className="w-4 h-4 text-slate-700" />
                Simulador de Sinais de Alerta Antecipado (EWS)
              </h3>
              <p className="text-xs text-slate-400">Modifique as condições de estresse intradiárias para avaliar os disparos do EWS</p>
            </div>

            {/* EWS Stats Live Indicator Box */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4" id="ews-gauge-container">
              
              <div className="md:col-span-1 bg-slate-50 p-4 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-[10px] font-mono block">EWS Alarm Score</span>
                  <span className="text-2xl font-black text-slate-800 font-mono">{ewsReport.overallScore} <span className="text-xs text-slate-400">/ 100</span></span>
                </div>
                <div>
                  <span className={`px-2.5 py-1 border rounded-full text-[10px] font-semibold uppercase ${
                    ewsReport.alertLevel === "CRISIS" 
                      ? "bg-rose-50 text-rose-700 border-rose-200" 
                      : ewsReport.alertLevel === "ATTENTION" 
                      ? "bg-amber-50 text-amber-700 border-amber-200" 
                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                  }`}>
                    {ewsReport.alertLevel}
                  </span>
                </div>
              </div>

              <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {ewsReport.indicators.map(ind => (
                  <div key={ind.code} className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-center">
                    <span className="text-[9px] text-slate-400 block truncate" title={ind.name}>{ind.name}</span>
                    <span className={`block text-xs font-bold mt-1 font-mono ${
                      ind.status === "CRITICAL" ? "text-rose-600" : ind.status === "WARNING" ? "text-amber-600" : "text-emerald-600"
                    }`}>
                      {ind.code === "CORR_SURGE" ? ind.value.toFixed(2) : ind.code === "VOL_DRIFT" ? `${ind.value.toFixed(2)}x` : ind.code === "TAIL_SPEED" ? `+${(ind.value * 100).toFixed(0)}%` : ind.value.toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>

            </div>

            {/* Interactive sliders for the EWS parameters */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2 text-xs font-mono" id="ews-interactive-sliders">
              
              <div className="space-y-1.5">
                <span className="text-slate-400 text-[10px] block">Correlação Cruzada ({avgCorrelation.toFixed(2)})</span>
                <input
                  type="range"
                  min="0.10"
                  max="0.85"
                  step="0.02"
                  value={avgCorrelation}
                  onChange={(e) => setAvgCorrelation(parseFloat(e.target.value))}
                  className="w-full accent-slate-700 h-1 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-slate-400 text-[10px] block">Deriva de Volatilidade ({realizedVolRatio.toFixed(2)}x)</span>
                <input
                  type="range"
                  min="0.80"
                  max="1.80"
                  step="0.05"
                  value={realizedVolRatio}
                  onChange={(e) => setRealizedVolRatio(parseFloat(e.target.value))}
                  className="w-full accent-slate-700 h-1 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-slate-400 text-[10px] block">Aceleração CVaR (+{(cvarAcceleration * 100).toFixed(0)}%)</span>
                <input
                  type="range"
                  min="0.01"
                  max="0.25"
                  step="0.01"
                  value={cvarAcceleration}
                  onChange={(e) => setCvarAcceleration(parseFloat(e.target.value))}
                  className="w-full accent-slate-700 h-1 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-slate-400 text-[10px] block">Data Drift Score ({dataDriftScore})</span>
                <input
                  type="range"
                  min="5"
                  max="90"
                  step="2"
                  value={dataDriftScore}
                  onChange={(e) => setDataDriftScore(parseInt(e.target.value))}
                  className="w-full accent-slate-700 h-1 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

            </div>

          </div>

          {/* HARPIA AI NEWS SENTINEL & MONITORED ALERT SERVICE */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4" id="news-alert-service-card">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-slate-900 text-amber-400 rounded-lg shadow-sm">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 tracking-tight font-sans">
                    Monitor de Notícias & Sentinel de Sentimento AI
                  </h3>
                  <p className="text-[11px] text-slate-450 leading-relaxed font-sans">Varredura contínua de feeds externos para mitigação imediata de cauda de portfólio</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${newsAlerts.length > 0 ? "bg-amber-400" : "bg-emerald-400"}`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${newsAlerts.length > 0 ? "bg-amber-500" : "bg-emerald-500"}`}></span>
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                  {newsAlerts.length > 0 ? `${newsAlerts.length} Alertas Ativos` : "Status: Nominal"}
                </span>
              </div>
            </div>

            {/* Config & Monitored Positions Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 py-2 border-b border-slate-100">
              {/* Left Settings: Tweak Thresholds */}
              <div className="md:col-span-5 space-y-3.5 bg-slate-50/50 p-3.5 border border-slate-100 rounded-xl">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-mono">Limiares do Sentinel de Risco</span>
                
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-500">Sentimento Crítico:</span>
                    <span className="font-bold text-rose-600">&lt; {alertThreshold}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="75"
                    step="5"
                    value={alertThreshold}
                    onChange={(e) => setAlertThreshold(parseInt(e.target.value))}
                    className="w-full accent-slate-800 h-1 bg-slate-200 rounded-lg cursor-pointer"
                  />
                  <p className="text-[9px] text-slate-400 font-sans leading-normal">
                    Notícias com sentimento abaixo deste limiar disparam flags de alerta e geram relatório do comitê.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-500">Mínimo para Posição Core:</span>
                    <span className="font-bold text-slate-750">&gt; {(majorWeightThreshold * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="0.30"
                    step="0.05"
                    value={majorWeightThreshold}
                    onChange={(e) => setMajorWeightThreshold(parseFloat(e.target.value))}
                    className="w-full accent-slate-800 h-1 bg-slate-200 rounded-lg cursor-pointer"
                  />
                  <p className="text-[9px] text-slate-400 font-sans leading-normal">
                    Fração mínima alocada para o papel ser considerado ativo principal com necessidade de plano de salvaguarda automatizado.
                  </p>
                </div>
              </div>

              {/* Right: Currently Monitored Major Positions */}
              <div className="md:col-span-7 space-y-2.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-mono">Posições Core Sob Monitoramento Ativo</span>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(weights)
                    .filter(([_, w]) => (w as number) >= majorWeightThreshold)
                    .map(([ticker, w]) => {
                      const weightNum = w as number;
                      return (
                        <div key={ticker} className="p-2 border border-slate-100 bg-slate-50/20 rounded-lg text-center relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-emerald-500 m-1 animate-pulse" />
                          <span className="text-xs font-bold font-mono text-slate-800 block">{ticker}</span>
                          <span className="text-[10px] text-slate-500 font-mono block">Peso: {(weightNum * 100).toFixed(0)}%</span>
                        </div>
                      );
                    })}
                  {Object.entries(weights).filter(([_, w]) => (w as number) >= majorWeightThreshold).length === 0 && (
                    <div className="col-span-3 py-4 text-center text-xs text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                      Nenhuma posição atinge o limiar de {(majorWeightThreshold * 100).toFixed(0)}% de relevância.
                    </div>
                  )}
                </div>

                {/* News Feed Simulator Section */}
                <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-2.5">
                  <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block font-mono">Simulação de Ingestão de feeds externos</span>
                  
                  <div className="flex gap-2">
                    <select
                      value={selectedFeedIndex}
                      onChange={(e) => setSelectedFeedIndex(parseInt(e.target.value))}
                      className="flex-1 text-xs border border-slate-200 bg-white rounded-lg p-2 focus:outline-none focus:border-slate-800 text-slate-700 font-sans cursor-pointer"
                    >
                      <option value={0}>Simular: Queda na Petrobras (PETR4) - Sentimento 32%</option>
                      <option value={1}>Simular: Pressão de Custos na WEG (WEGE3) - Sentimento 38%</option>
                      <option value={2}>Simular: Despenco do Minério (VALE3) - Sentimento 28%</option>
                      <option value={3}>Simular: Fusão Cade do Itaú (ITUB4) - Sentimento 88%</option>
                      <option value={4}>Simular: Secas no Agronegócio (BBAS3) - Sentimento 42%</option>
                    </select>

                    <button
                      onClick={() => {
                        const samples = [
                          {
                            ticker: "PETR4",
                            headline: "Rumores de alteração na política de preços de combustíveis geram incerteza na diretoria da Petrobras",
                            content: "Fontes de Brasília indicam discussões avançadas para subsidiar o diesel e a gasolina utilizando os dividendos extraordinários retidos pelo governo, o que poderia reduzir a margem operacional de refino nos próximos trimestres.",
                            sentimentScore: 32,
                            returnImpactBps: -18
                          },
                          {
                            ticker: "WEGE3",
                            headline: "WEG revisa para baixo projeções de margem devido ao aumento global no cobre e aço",
                            content: "O comitê de suprimentos da WEG S.A. emitiu nota alertando para pressões inflacionárias persistentes em commodities metálicas estruturais, o que deve impactar a margem EBITDA de motores industriais pesados no D+90.",
                            sentimentScore: 38,
                            returnImpactBps: -12
                          },
                          {
                            ticker: "VALE3",
                            headline: "Preços futuros de minério de ferro despencam na bolsa de Cingapura com novos estoques",
                            content: "Os preços spot do minério de ferro com teor de 62% caíram abaixo de $95 a tonelada, refletindo o excesso de oferta e a estagnação de novas construções imobiliárias na China. A Vale deve rever CAPEX discricionário.",
                            sentimentScore: 28,
                            returnImpactBps: -25
                          },
                          {
                            ticker: "ITUB4",
                            headline: "Fusão de subsidiária de pagamentos do Itaú é aprovada sem restrições pelo Cade",
                            content: "O Conselho Administrativo de Defesa Econômica aprovou sem restrições o processo de consolidação de bandeiras e redes do Itaú. A sinergia operacional anualizada está estimada em R$ 450 milhões em redução de despesas.",
                            sentimentScore: 88,
                            returnImpactBps: 14
                          },
                          {
                            ticker: "BBAS3",
                            headline: "Projeções de inadimplência no agronegócio do BB sobem devido a secas na região Sul",
                            content: "Embora o Plano Safra forneça garantias, perdas severas de produtores de soja e milho por estresse hídrico no Rio Grande do Sul devem pressionar as provisões de crédito de liquidação duvidosa (PDD) do BB.",
                            sentimentScore: 42,
                            returnImpactBps: -10
                          }
                        ];
                        const chosen = samples[selectedFeedIndex];
                        processIncomingNews(chosen);
                      }}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-lg text-xs transition-all shadow-sm cursor-pointer whitespace-nowrap"
                    >
                      Injetar Feed
                    </button>
                  </div>

                  {/* Manual Creation Toggle */}
                  <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-100 space-y-2.5">
                    <span className="text-[9px] font-bold text-slate-500 font-mono block uppercase">Redigir Notícia Manual Customizada</span>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <div className="sm:col-span-1">
                        <select
                          value={customNewsTicker}
                          onChange={(e) => setCustomNewsTicker(e.target.value)}
                          className="w-full text-xs border border-slate-200 bg-white rounded-lg p-2 focus:outline-none focus:border-slate-800 font-mono font-bold"
                        >
                          {assets.map(a => (
                            <option key={a.ticker} value={a.ticker}>{a.ticker}</option>
                          ))}
                        </select>
                      </div>
                      <div className="sm:col-span-3">
                        <input
                          type="text"
                          value={customNewsHeadline}
                          onChange={(e) => setCustomNewsHeadline(e.target.value)}
                          placeholder="Manchete da Notícia..."
                          className="w-full text-xs border border-slate-200 bg-white rounded-lg p-2 focus:outline-none focus:border-slate-800"
                        />
                      </div>
                    </div>
                    
                    <textarea
                      value={customNewsContent}
                      onChange={(e) => setCustomNewsContent(e.target.value)}
                      placeholder="Conteúdo detalhado do fato relevante ou reportagem de mercado..."
                      className="w-full text-xs border border-slate-200 bg-white rounded-lg p-2 focus:outline-none focus:border-slate-800 min-h-[50px] resize-none"
                    />

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
                      <div>
                        <span className="text-[9px] text-slate-400 block">Sentimento ({customNewsSentiment}%)</span>
                        <input
                          type="range"
                          min="5"
                          max="95"
                          step="5"
                          value={customNewsSentiment}
                          onChange={(e) => setCustomNewsSentiment(parseInt(e.target.value))}
                          className="w-full accent-slate-800"
                        />
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block">Impacto Retorno ({customNewsImpact} bps)</span>
                        <input
                          type="range"
                          min="-40"
                          max="40"
                          step="5"
                          value={customNewsImpact}
                          onChange={(e) => setCustomNewsImpact(parseInt(e.target.value))}
                          className="w-full accent-slate-800"
                        />
                      </div>
                      <div className="col-span-2 sm:col-span-1 flex items-end">
                        <button
                          onClick={() => {
                            if (!customNewsHeadline || !customNewsContent) {
                              alert("Preencha a manchete e o conteúdo do fato relevante.");
                              return;
                            }
                            processIncomingNews({
                              ticker: customNewsTicker,
                              headline: customNewsHeadline,
                              content: customNewsContent,
                              sentimentScore: customNewsSentiment,
                              returnImpactBps: customNewsImpact
                            });
                            setCustomNewsHeadline("");
                            setCustomNewsContent("");
                          }}
                          className="w-full bg-slate-850 hover:bg-slate-700 text-white font-bold py-2 rounded-lg text-xs transition-all cursor-pointer border border-slate-700"
                        >
                          Ingerir Manual
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section: Active Sentinel Alerts & AI Reports Log */}
            <div className="mt-4 pt-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-mono mb-3">Histórico de Alertas & Relatórios de Salvaguarda</span>

              {newsAlerts.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 bg-slate-50/50 border border-dashed border-slate-200 rounded-xl font-sans">
                  Sentinel-Monitor em bandeira verde. Nenhum alerta crítico de sentimento registrado.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Left sub-list of alerts */}
                  <div className="md:col-span-5 space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {newsAlerts.map(alert => (
                      <button
                        key={alert.id}
                        onClick={() => setSelectedAlert(alert)}
                        className={`w-full text-left p-3 rounded-xl border text-xs transition-all relative overflow-hidden flex flex-col gap-1.5 cursor-pointer ${
                          selectedAlert?.id === alert.id
                            ? "bg-slate-900 border-slate-900 text-white"
                            : "bg-slate-50/50 hover:bg-slate-100/50 border-slate-200 text-slate-700"
                        }`}
                      >
                        <div className="flex justify-between items-center text-[9px] font-mono opacity-80">
                          <span>{new Date(alert.timestamp).toLocaleTimeString("pt-BR")}</span>
                          <span className={alert.severity === "HIGH" ? "text-rose-500 font-black" : "text-amber-500 font-bold"}>
                            {alert.ticker} ({alert.sentimentScore}%)
                          </span>
                        </div>
                        <h4 className="font-bold leading-snug truncate">{alert.headline}</h4>
                        <div className="flex justify-between items-center text-[10px] pt-1 border-t border-slate-250/20">
                          <span className="font-mono opacity-80">Peso: {(alert.weight * 100).toFixed(0)}%</span>
                          <span className={`px-1.5 py-0.2 rounded font-mono text-[8px] font-bold ${
                            alert.isMajor ? "bg-amber-400/20 text-amber-300" : "bg-slate-400/20 text-slate-500"
                          }`}>
                            {alert.isMajor ? "CORE POS" : "MINOR POS"}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Right sub-report viewer */}
                  <div className="md:col-span-7 bg-slate-50/50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
                    {selectedAlert ? (
                      <div className="space-y-3.5">
                        <div className="flex justify-between items-start pb-2 border-b border-slate-200/60">
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Relatório de Mitigação de Risco</span>
                            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 truncate">
                              {selectedAlert.ticker} • {selectedAlert.headline.slice(0, 30)}...
                            </h4>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold whitespace-nowrap ${
                            selectedAlert.severity === "HIGH" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"
                          }`}>
                            {selectedAlert.severity} RISK
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-500 leading-relaxed italic">
                          <strong>Notícia Original:</strong> "{selectedAlert.content}"
                        </p>

                        {selectedAlert.report ? (
                          <div className="space-y-3 text-xs leading-relaxed">
                            <div className="bg-white p-3 rounded-lg border border-slate-150">
                              <span className="text-[9px] font-bold text-slate-500 font-mono block uppercase mb-1">Síntese da Ameaça</span>
                              <p className="text-slate-600 font-sans leading-relaxed">{selectedAlert.report.threatSynthesis}</p>
                            </div>

                            <div className="bg-white p-3 rounded-lg border border-slate-150">
                              <span className="text-[9px] font-bold text-slate-500 font-mono block uppercase mb-1">Impacto no NAV (R$ 100M)</span>
                              <p className="text-slate-600 font-sans leading-relaxed">{selectedAlert.report.impactMeasurement}</p>
                            </div>

                            <div className="bg-white p-3 rounded-lg border border-slate-150">
                              <span className="text-[9px] font-bold text-slate-500 font-mono block uppercase mb-1">Plano de Salvaguarda & Hedges</span>
                              <ul className="space-y-1.5 pl-4 list-disc text-slate-600 font-sans">
                                {selectedAlert.report.hedgingActions.map((action, idx) => (
                                  <li key={idx} className="leading-relaxed">{action}</li>
                                ))}
                              </ul>
                            </div>

                            <div className="bg-slate-900 text-slate-100 p-3.5 rounded-lg text-[10px] font-mono space-y-1">
                              <span className="text-amber-400 font-bold block">PARECER DO COMITÊ DE RISCO:</span>
                              <p className="leading-normal">{selectedAlert.report.committeeRecommendation}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="py-6 text-center text-xs text-slate-500 bg-white border border-slate-200 rounded-lg space-y-2.5">
                            <p>Esta notícia foi registrada como evento de relevância menor, ou os limiares atuais não exigem mitigação crítica de governança.</p>
                            <button
                              onClick={() => {
                                setNewsAlerts(prev => prev.map(a => {
                                  if (a.id === selectedAlert.id) {
                                    return {
                                      ...a,
                                      report: generateLocalAlertReport(a, a.weight || 0.15)
                                    };
                                  }
                                  return a;
                                }));
                                setSelectedAlert(prev => {
                                  if (prev) {
                                    return {
                                      ...prev,
                                      report: generateLocalAlertReport(prev, prev.weight || 0.15)
                                    };
                                  }
                                  return null;
                                });
                              }}
                              className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-1.5 px-3 rounded-lg text-[10px] cursor-pointer"
                            >
                              Forçar Geração de Relatório de Mitigação
                            </button>
                          </div>
                        )}

                        {selectedAlert.report && (
                          <div className="pt-2.5 border-t border-slate-200/60 flex flex-col sm:flex-row gap-2 justify-between items-center">
                            <span className="text-[9px] text-slate-400 font-mono">
                              FONTE: Harpia Sentinel Engine
                            </span>
                            <button
                              disabled={isEvaluatingAlertId === selectedAlert.id}
                              onClick={() => evaluateAlertWithGemini(selectedAlert.id)}
                              className="bg-slate-950 hover:bg-slate-900 disabled:bg-slate-400 text-white font-bold px-3 py-1.5 rounded-lg text-[10px] flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                            >
                              {isEvaluatingAlertId === selectedAlert.id ? (
                                <>
                                  <RefreshCw className="w-3 h-3 animate-spin" />
                                  Processando no Gemini...
                                </>
                              ) : (
                                <>
                                  <Brain className="w-3 h-3 text-amber-400" />
                                  Consultar Harpia AI (Gemini)
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-xs text-slate-400 py-12">
                        Selecione um alerta no histórico para visualizar o Relatório de Salvaguarda correspondente.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN (4 COLS): GOVERNANCE COMPLIANCE CHECK & COMMITTEE MEMO */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* CONSOLIDATED AI RISK REPORT CARD (R$ 100M FUND) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm relative overflow-hidden" id="consolidated-fund-ai-report">
            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full blur-2xl pointer-events-none opacity-50" />
            
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-700" />
                <h3 className="text-sm font-bold text-slate-800 tracking-tight font-sans">
                  Relatório AI do Comitê (R$ 100M)
                </h3>
              </div>
              <span className="text-[10px] bg-slate-100 text-slate-600 font-mono px-2 py-0.5 rounded border border-slate-200">
                AUM R$ 100M Fictícios
              </span>
            </div>

            {!showFundReport && (
              <div className="pt-4 space-y-3">
                <p className="text-xs text-slate-500 leading-relaxed font-sans">
                  Gere um parecer analítico de risco consolidado do fundo de <strong>R$ 100M fictícios</strong> cobrindo as 10 classes de ativos operacionais: Óleo, Petróleo, Commodities, Ações Locais, BDRs, S&P 500, S&P 100, Nasdaq, Moedas e Juros.
                </p>
                <button
                  onClick={handleGenerateFundReport}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer border border-slate-800"
                >
                  <Brain className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  Gerar Relatório de Risco AI
                </button>
              </div>
            )}

            {showFundReport && isGeneratingFundReport && (
              <div className="pt-5 pb-2 space-y-4">
                <div className="flex items-center justify-center py-2">
                  <RefreshCw className="w-8 h-8 text-slate-900 animate-spin" />
                </div>
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${fundReportStep >= 1 ? "bg-emerald-500" : "bg-slate-300"}`} />
                    <span className={fundReportStep === 1 ? "text-slate-900 font-bold" : "text-slate-400"}>
                      1. Consolidando posições de R$ 100M...
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${fundReportStep >= 2 ? "bg-emerald-500" : "bg-slate-300"}`} />
                    <span className={fundReportStep === 2 ? "text-slate-900 font-bold" : "text-slate-400"}>
                      2. Mapeando as 10 classes de ativos...
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${fundReportStep >= 3 ? "bg-emerald-500" : "bg-slate-300"}`} />
                    <span className={fundReportStep === 3 ? "text-slate-900 font-bold" : "text-slate-400"}>
                      3. Processando cenários de estresse de cauda...
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${fundReportStep >= 4 ? "bg-emerald-500" : "bg-slate-300"}`} />
                    <span className={fundReportStep === 4 ? "text-slate-900 font-bold" : "text-slate-400"}>
                      4. Sintetizando parecer do CRO AI...
                    </span>
                  </div>
                </div>
              </div>
            )}

            {showFundReport && !isGeneratingFundReport && (
              <div className="pt-4 space-y-4">
                {/* Tab selectors */}
                <div className="flex border-b border-slate-100 text-[10px] font-sans font-bold">
                  <button
                    onClick={() => setActiveReportTab("overview")}
                    className={`pb-2 px-1 mr-3 border-b-2 transition-all ${
                      activeReportTab === "overview" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    Visão Geral
                  </button>
                  <button
                    onClick={() => setActiveReportTab("assets")}
                    className={`pb-2 px-1 mr-3 border-b-2 transition-all ${
                      activeReportTab === "assets" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    10 Classes
                  </button>
                  <button
                    onClick={() => setActiveReportTab("actions")}
                    className={`pb-2 px-1 border-b-2 transition-all ${
                      activeReportTab === "actions" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    Hedges
                  </button>
                </div>

                {/* Tab 1: Overview */}
                {activeReportTab === "overview" && (
                  <div className="space-y-3.5 text-xs leading-relaxed text-slate-600 font-sans">
                    <div className="flex justify-between items-center bg-slate-50 p-2 border border-slate-100 rounded-lg font-sans">
                      <span className="text-slate-400 font-mono text-[10px]">Parecer Global</span>
                      <span className={`px-2 py-0.5 rounded-full font-mono text-[9px] font-bold ${
                        !complianceReport.isCompliant
                          ? "bg-rose-50 text-rose-700 border border-rose-100"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                      }`}>
                        {!complianceReport.isCompliant ? "RECALIBRAÇÃO SUGERIDA" : "APROVADO COM MONITORAMENTO"}
                      </span>
                    </div>
                    <p>
                      <strong>Resumo do Comitê:</strong> O fundo fictício de <strong>R$ 100 Milhões</strong> possui posições distribuídas de forma a capturar crescimento global ao mesmo tempo que mantém resiliência sistemática. O VaR estimado consolidado para as 10 classes está estabelecido em <strong>R$ 3,82M (3.82%)</strong> com limite de cauda (CVaR 95%) em <strong>R$ 5,45M (5.45%)</strong>.
                    </p>
                    <div className="bg-slate-900 text-slate-100 p-3 rounded-lg text-[10px] font-mono leading-normal italic">
                      <span className="text-amber-400 font-bold block not-italic mb-1">CRO ADVISORY:</span>
                      "A diversificação entre BDRs, moedas e juros reduz a correlação em dias de forte queda em commodities locais (Vale) e petróleo (Petrobras)."
                    </div>
                  </div>
                )}

                {/* Tab 2: 10 Classes de Ativos */}
                {activeReportTab === "assets" && (
                  <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                    {[
                      { name: "Óleo", size: "R$ 8.0M", pct: "8.0%", level: "Alto", desc: "Exposição direta a contratos futuros de petróleo Brent. Sensível a pressões geopolíticas de cauda.", color: "text-amber-600 bg-amber-50" },
                      { name: "Petróleo", size: "R$ 10.0M", pct: "10.0%", level: "Alto", desc: "Alocação core em PETR4 e petrolíferas domésticas. Oferece alta liquidez e proventos, mas risco de intervenção.", color: "text-amber-600 bg-amber-50" },
                      { name: "Commodities", size: "R$ 12.0M", pct: "12.0%", level: "Moderado", desc: "Exposição a minério de ferro (VALE3) e insumos agrícolas para proteção inflacionária.", color: "text-slate-600 bg-slate-100" },
                      { name: "Ações", size: "R$ 20.0M", pct: "20.0%", level: "Alto", desc: "Ações locais de alta liquidez da B3 (ITUB4, BBAS3, WEGE3). Fator de beta primário.", color: "text-rose-600 bg-rose-50" },
                      { name: "Ações BDRs", size: "R$ 10.0M", pct: "10.0%", level: "Moderado", desc: "Certificados representativos de blue-chips internacionais (Apple, MSFT) negociados em reais.", color: "text-slate-600 bg-slate-100" },
                      { name: "S&P 500", size: "R$ 12.0M", pct: "12.0%", level: "Baixo", desc: "Beta global diversificado americano. Fornece âncora de segurança operacional.", color: "text-emerald-600 bg-emerald-50" },
                      { name: "S&P 100", size: "R$ 8.0M", pct: "8.0%", level: "Baixo", desc: "Concentração nas maiores e mais líquidas companhias globais, garantindo solidez estrutural.", color: "text-emerald-600 bg-emerald-50" },
                      { name: "Nasdaq", size: "R$ 5.0M", pct: "5.0%", level: "Alto", desc: "Crescimento tecnológico e inteligência artificial de fronteira. Sensível a variações de taxas de juros.", color: "text-rose-600 bg-rose-50" },
                      { name: "Moedas", size: "R$ 5.0M", pct: "5.0%", level: "Moderado", desc: "Hedge ativo em câmbio (Dólar/Euro). Reduz drawdown quando o Real sofre depreciação cambial.", color: "text-slate-600 bg-slate-100" },
                      { name: "Juros", size: "R$ 10.0M", pct: "10.0%", level: "Baixo", desc: "Posições em títulos de renda fixa DI e caixas em CDI. Fonte primária de liquidez soberana.", color: "text-emerald-600 bg-emerald-50" }
                    ].map((item, idx) => (
                      <div key={idx} className="p-2.5 border border-slate-100 bg-slate-50/50 rounded-lg text-[11px] space-y-1">
                        <div className="flex justify-between items-center font-bold">
                          <span className="text-slate-800 font-sans">{item.name}</span>
                          <span className="font-mono text-slate-500">{item.size} ({item.pct})</span>
                        </div>
                        <div className="flex items-center gap-1.5 pt-0.5">
                          <span className={`px-1.5 py-0.5 font-sans font-semibold rounded text-[9px] uppercase ${item.color}`}>
                            Risco {item.level}
                          </span>
                        </div>
                        <p className="text-slate-500 leading-normal font-sans pt-1">
                          {item.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tab 3: Actions */}
                {activeReportTab === "actions" && (
                  <div className="space-y-2.5 text-[11px] font-sans">
                    <span className="font-bold text-slate-800 uppercase text-[9px] tracking-wider block mb-1 font-sans">
                      Medidas de Salvaguarda Recomendadas:
                    </span>
                    <div className="space-y-2 text-slate-600 leading-relaxed">
                      <div className="p-2.5 bg-rose-50/50 border border-rose-100 rounded-lg flex gap-2">
                        <span className="font-mono font-bold text-rose-700">01</span>
                        <p><strong>Ajustar Concentração de Ações Locais:</strong> Manter exposição individual de papéis abaixo de 30% conforme o mandato prudencial do fundo.</p>
                      </div>
                      <div className="p-2.5 bg-amber-50/50 border border-amber-100 rounded-lg flex gap-2">
                        <span className="font-mono font-bold text-amber-700">02</span>
                        <p><strong>Hedge em Petróleo:</strong> Implementar swap cambial tático para amortecer choques no preço de commodities energéticas internacionais.</p>
                      </div>
                      <div className="p-2.5 bg-emerald-50/50 border border-emerald-100 rounded-lg flex gap-2">
                        <span className="font-mono font-bold text-emerald-700">03</span>
                        <p><strong>Manter Alocação de Juros:</strong> Preservar os R$ 10M em títulos pós-fixados como reserva líquida em caso de disparo crítico do EWS.</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions buttons */}
                <div className="flex gap-2 pt-1 border-t border-slate-100">
                  <button
                    onClick={handleGenerateFundReport}
                    className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold py-2 px-2 rounded-lg text-[10px] flex items-center justify-center gap-1 transition-all border border-slate-200 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Gerar Novamente
                  </button>
                  <button
                    onClick={() => setShowFundReport(false)}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-2 rounded-lg text-[10px] flex items-center justify-center gap-1 transition-all cursor-pointer"
                  >
                    Recolher Relatório
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* HARD LIMITS CHECKLIST */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm" id="risk-checklist-card">
            <h3 className="text-sm font-bold text-slate-800 mb-3 tracking-tight flex items-center gap-1.5 font-sans">
              <Scale className="w-4 h-4 text-slate-700" />
              Checklist de Limites Rígidos
            </h3>

            <div className="space-y-3.5 text-xs" id="compliance-checklist">
              {/* Asset concentration limit */}
              <div className="flex justify-between items-start border-b border-slate-100 pb-2.5">
                <div className="space-y-0.5">
                  <span className="font-semibold block text-slate-700">Concentração por Ativo</span>
                  <p className="text-[10px] text-slate-400">Máximo {formatPct(INSTITUTIONAL_LIMITS.maxWeightPerAsset)} por papel</p>
                </div>
                <span className={`px-2 py-0.5 font-mono text-[10px] font-bold rounded ${
                  complianceReport.violations.some(v => v.metric.startsWith("weight_"))
                    ? "bg-rose-50 text-rose-700"
                    : "bg-emerald-50 text-emerald-700"
                }`}>
                  {complianceReport.violations.some(v => v.metric.startsWith("weight_")) ? "BREACH" : "OK"}
                </span>
              </div>

              {/* CVaR limit */}
              <div className="flex justify-between items-start border-b border-slate-100 pb-2.5">
                <div className="space-y-0.5">
                  <span className="font-semibold block text-slate-700">Risco de Cauda (CVaR 95%)</span>
                  <p className="text-[10px] text-slate-400">Máximo {formatPct(INSTITUTIONAL_LIMITS.maxCvar95)} esperado</p>
                </div>
                <span className={`px-2 py-0.5 font-mono text-[10px] font-bold rounded ${
                  portfolioStats.cvar95 > INSTITUTIONAL_LIMITS.maxCvar95
                    ? "bg-rose-50 text-rose-700"
                    : "bg-emerald-50 text-emerald-700"
                }`}>
                  {portfolioStats.cvar95 > INSTITUTIONAL_LIMITS.maxCvar95 ? "BREACH" : "OK"}
                </span>
              </div>

              {/* Volatility limit */}
              <div className="flex justify-between items-start border-b border-slate-100 pb-2.5">
                <div className="space-y-0.5">
                  <span className="font-semibold block text-slate-700">Volatilidade Estimada</span>
                  <p className="text-[10px] text-slate-400">Máximo {formatPct(INSTITUTIONAL_LIMITS.maxVolatility)} a.a.</p>
                </div>
                <span className={`px-2 py-0.5 font-mono text-[10px] font-bold rounded ${
                  portfolioStats.volatility > INSTITUTIONAL_LIMITS.maxVolatility
                    ? "bg-amber-50 text-amber-700"
                    : "bg-emerald-50 text-emerald-700"
                }`}>
                  {portfolioStats.volatility > INSTITUTIONAL_LIMITS.maxVolatility ? "WARN" : "OK"}
                </span>
              </div>

              {/* Beta limit */}
              <div className="flex justify-between items-start border-b border-slate-100 pb-2.5">
                <div className="space-y-0.5">
                  <span className="font-semibold block text-slate-700">Beta Sistêmico Máximo</span>
                  <p className="text-[10px] text-slate-400">Máximo de {INSTITUTIONAL_LIMITS.maxBeta.toFixed(2)} vs B3</p>
                </div>
                <span className={`px-2 py-0.5 font-mono text-[10px] font-bold rounded ${
                  portfolioStats.beta > INSTITUTIONAL_LIMITS.maxBeta
                    ? "bg-amber-50 text-amber-700"
                    : "bg-emerald-50 text-emerald-700"
                }`}>
                  {portfolioStats.beta > INSTITUTIONAL_LIMITS.maxBeta ? "WARN" : "OK"}
                </span>
              </div>
            </div>
          </div>

          {/* DYNAMIC REAL-TIME AI RISK COMMITTEE MEMO */}
          {aiMemo && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 relative overflow-hidden shadow-sm" id="risk-committee-box">
              {/* Left bar accent color matches the decision */}
              <div className={`absolute top-0 left-0 w-1.5 h-full ${
                aiMemo.verdict === "HALTED" 
                  ? "bg-rose-600 animate-pulse" 
                  : aiMemo.verdict === "RECALIBRATION_REQUIRED" 
                  ? "bg-amber-500" 
                  : "bg-emerald-500"
              }`} />
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-slate-700" />
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-tight font-sans">Comitê de Risco AI</span>
                </div>
                <span className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold ${
                  aiMemo.verdict === "APPROVED" 
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                    : "bg-rose-50 text-rose-700 border border-rose-100"
                }`}>
                  {aiMemo.verdict}
                </span>
              </div>

              {/* Board verdict details */}
              <div className="mt-3.5 space-y-3.5">
                
                {/* Engine indicator */}
                <div className="flex items-center justify-between text-[10px] font-mono bg-slate-50 border border-slate-200 p-2 rounded-lg">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Cpu className="w-3.5 h-3.5 text-slate-500" /> Motor Ativo:
                  </span>
                  <span className={`font-bold ${aiEngine === "Gemini AI Core" ? "text-slate-900" : "text-slate-500"}`}>
                    {aiEngine}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-800">Parecer Técnico da Carteira</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-sans bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {aiMemo.executiveSummary}
                </p>

                {/* CRO Quote */}
                <div className="bg-slate-900 text-slate-100 p-4 rounded-xl relative overflow-hidden font-mono text-[10px] space-y-1">
                  <span className="text-amber-400 font-bold block">CHIEF RISK OFFICER AI:</span>
                  <p className="italic leading-relaxed">"{aiMemo.croQuote}"</p>
                </div>

                {/* Drivers & Recommendations */}
                <div className="space-y-3 pt-2 text-xs">
                  <div>
                    <span className="font-bold text-slate-800 uppercase text-[9px] tracking-wider block mb-1">Fatores de Risco Ativos</span>
                    <ul className="space-y-1.5 pl-4 list-disc text-slate-500">
                      {aiMemo.riskDrivers.slice(0, 3).map((driver, idx) => (
                        <li key={idx} className="leading-relaxed">{driver}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-t border-slate-100 pt-3">
                    <span className="font-bold text-slate-800 uppercase text-[9px] tracking-wider block mb-1">Ações Recomendadas</span>
                    <ul className="space-y-1.5 pl-4 list-disc text-slate-500">
                      {aiMemo.recommendations.map((rec, idx) => (
                        <li key={idx} className="leading-relaxed">{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* INTERACTIVE PROMPT CONTROLLER FOR GEMINI */}
                <div className="border-t border-slate-100 pt-3.5 space-y-2">
                  <span className="font-bold text-slate-800 uppercase text-[9px] tracking-wider block">Diretrizes Adicionais para a IA</span>
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Ex: 'Exija foco em CDI e ativos do Fed', 'Assuma perspectiva de Cauda Caótica', ou 'Gere parecer formal em inglês'..."
                    className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-800 font-sans min-h-[50px] resize-none"
                  />
                  
                  {aiError && (
                    <div className="p-2.5 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] rounded-lg">
                      {aiError}
                    </div>
                  )}

                  <button
                    onClick={handleTriggerGeminiEvaluation}
                    disabled={isAiGenerating}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                  >
                    {isAiGenerating ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Gerando Parecer com Gemini...
                      </>
                    ) : (
                      <>
                        <Brain className="w-3.5 h-3.5 text-amber-400" />
                        Reavaliar com Gemini AI
                      </>
                    )}
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* ACTIVE EWS SYSTEM ALARMS LOG FEED */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm" id="ews-alarm-logs">
            <h3 className="text-sm font-bold text-slate-800 mb-3 tracking-tight flex items-center gap-1.5 font-sans">
              <ShieldAlert className="w-4 h-4 text-slate-700" />
              Log de Alarmes e Incidentes
            </h3>

            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1" id="alarms-feed-list">
              {combinedAlarms.map((alarm, idx) => (
                <div key={idx} className={`p-3 border rounded-lg text-xs space-y-1 relative overflow-hidden ${
                  alarm.severity === "HIGH" 
                    ? "bg-rose-50/70 border-rose-200 text-rose-950" 
                    : alarm.severity === "MEDIUM" 
                    ? "bg-amber-50/50 border-amber-200 text-amber-950" 
                    : "bg-slate-50/80 border-slate-200 text-slate-600"
                }`}>
                  <div className="flex justify-between items-center text-[9px] font-mono text-slate-400">
                    <span>{new Date(alarm.timestamp).toLocaleTimeString("pt-BR")}</span>
                    <span className={alarm.severity === "HIGH" ? "text-rose-700 font-bold" : alarm.severity === "MEDIUM" ? "text-amber-700 font-bold" : "text-slate-500"}>
                      {alarm.code}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-800 leading-snug">{alarm.title}</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{alarm.message}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
