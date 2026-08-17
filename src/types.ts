/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum MarketRegime {
  BULL_LOW_VOL = "BULL_LOW_VOL",
  BEAR_HIGH_VOL = "BEAR_HIGH_VOL",
  CRISIS = "CRISIS",
  SIDEWAYS = "SIDEWAYS"
}

export interface Asset {
  ticker: string;
  name: string;
  sector: string;
  price: number;
  adv: number; // Average Daily Volume in BRL
  volatility: number; // Annualized volatility (e.g. 0.22)
  spreadBps: number; // Bid-ask spread in bps
  scores: {
    macro: number; // 0 - 100
    micro: number; // 0 - 100
    news: number;  // 0 - 100 (LLM Sentiment)
    credit: number; // 0 - 100
  };
  expectedReturnBL: number; // Black-Litterman expected return
  confidenceBL: number; // Black-Litterman view confidence (0.0 - 1.0)
  explanation: string; // LLM-generated rationale
}

export interface PerformanceMetrics {
  totalReturn: number;
  annReturn: number;
  cdiAnn: number;
  excessVsCdi: number;
  volatility: number;
  maxDrawdown: number;
  var95: number;
  cvar95: number;
  sharpe: number;
  sortino: number;
  calmar: number;
  beta: number;
  criteriaMet: boolean;
}

export interface ClassicAttribution {
  ticker: string;
  portfolioWeight: number;
  benchmarkWeight: number;
  assetReturn: number;
  allocationEffect: number;
  selectionEffect: number;
  interactionEffect: number;
}

export interface RiskAttribution {
  ticker: string;
  weight: number;
  componentVar: number; // VaR contribution in currency/bps
  componentCvar: number; // CVaR contribution
  marginalContribution: number; // MCR
  riskPercentage: number; // Percentage of total portfolio risk
}

export interface AIAttribution {
  modelName: string; // News LLM Sentiment, XGBoost, LSTM, Meta-Learner
  contribution: number; // Alpha contribution in bps/percent
  hitRatio: number; // % of correct direction predictions
  status: "ACTIVE" | "PASSIVE" | "OVERWEIGHTED";
  description: string;
}

export interface StressScenario {
  id: string;
  name: string;
  description: string;
  shocks: Record<string, number>; // ticker -> percentage shock (e.g. -0.45)
  worstAsset: string;
  portfolioPnlPct: number;
  varShift: number;
  riskCommitteeMemo: string;
}

export interface LedgerPosition {
  ticker: string;
  weight: number;
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  unrealizedPnl: number;
  lastUpdated: string;
}

export interface LedgerSnapshot {
  timestamp: string;
  nav: number;
  positions: Record<string, LedgerPosition>;
  cashPct: number;
  totalUnrealizedPnl: number;
  dailyReturn: number;
  cumulativeReturn: number;
  regime: MarketRegime;
}

export interface DriftLog {
  timestamp: string;
  trackingError: number;
  volRatio: number; // Realized / Expected
  returnDeviation: number;
  driftScore: number; // 0 to 100
  severity: "OK" | "WARNING" | "CRITICAL";
  llmAlert: string;
}
