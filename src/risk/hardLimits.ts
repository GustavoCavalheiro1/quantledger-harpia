/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface RiskLimits {
  maxWeightPerAsset: number; // e.g., 0.30 (30% maximum allocation per asset)
  maxCvar95: number;         // e.g., 0.04 (4.0% max CVaR)
  maxVolatility: number;     // e.g., 0.15 (15.0% max annual volatility)
  maxBeta: number;           // e.g., 0.75 (0.75 max Beta vs market)
  maxLeverage: number;       // e.g., 1.0 (No leverage, sum of weights = 1)
}

export const INSTITUTIONAL_LIMITS: RiskLimits = {
  maxWeightPerAsset: 0.30, 
  maxCvar95: 0.035, // 3.5% CVaR limit
  maxVolatility: 0.14, // 14% Annual Vol limit
  maxBeta: 0.70, // 0.70 Beta limit
  maxLeverage: 1.0
};

export interface LimitViolation {
  metric: keyof RiskLimits | string;
  label: string;
  limitValue: number;
  currentValue: number;
  severity: "WARNING" | "CRITICAL";
  message: string;
}

export interface ComplianceReport {
  isCompliant: boolean;
  violations: LimitViolation[];
  summaryMessage: string;
}

/**
 * Validates a weight map and risk metrics against Institutional Hard Limits.
 */
export function checkCompliance(
  weights: Record<string, number>,
  volatility: number,
  cvar95: number,
  beta: number,
  limits: RiskLimits = INSTITUTIONAL_LIMITS
): ComplianceReport {
  const violations: LimitViolation[] = [];

  // 1. Check weight concentration limit (per asset)
  Object.entries(weights).forEach(([ticker, weight]) => {
    if (weight > limits.maxWeightPerAsset) {
      violations.push({
        metric: `weight_${ticker}`,
        label: `Concentração - ${ticker}`,
        limitValue: limits.maxWeightPerAsset,
        currentValue: weight,
        severity: "CRITICAL",
        message: `O ativo ${ticker} possui alocação de ${(weight * 100).toFixed(1)}%, violando o limite de concentração de ${(limits.maxWeightPerAsset * 100).toFixed(1)}%.`
      });
    }
  });

  // 2. Check CVaR limit
  if (cvar95 > limits.maxCvar95) {
    violations.push({
      metric: "maxCvar95",
      label: "Risco de Cauda (CVaR 95%)",
      limitValue: limits.maxCvar95,
      currentValue: cvar95,
      severity: "CRITICAL",
      message: `O CVaR de cauda do portfólio está em ${(cvar95 * 100).toFixed(2)}%, excedendo o limite rígido de ${(limits.maxCvar95 * 100).toFixed(2)}%.`
    });
  }

  // 3. Check Volatility limit
  if (volatility > limits.maxVolatility) {
    violations.push({
      metric: "maxVolatility",
      label: "Volatilidade Anualizada",
      limitValue: limits.maxVolatility,
      currentValue: volatility,
      severity: "WARNING",
      message: `A volatilidade estimada está em ${(volatility * 100).toFixed(1)}%, ultrapassando o limite prudencial de ${(limits.maxVolatility * 100).toFixed(1)}%.`
    });
  }

  // 4. Check Beta limit
  if (beta > limits.maxBeta) {
    violations.push({
      metric: "maxBeta",
      label: "Exposição Beta de Mercado",
      limitValue: limits.maxBeta,
      currentValue: beta,
      severity: "WARNING",
      message: `O Beta sistêmico do portfólio está em ${beta.toFixed(2)}, acima do apetite máximo de ${limits.maxBeta.toFixed(2)}.`
    });
  }

  // 5. Check Leverage / Sum of weights limit
  const sumWeights = Object.values(weights).reduce((sum, w) => sum + w, 0);
  if (sumWeights > limits.maxLeverage + 0.005) {
    violations.push({
      metric: "maxLeverage",
      label: "Alavancagem Total",
      limitValue: limits.maxLeverage,
      currentValue: sumWeights,
      severity: "CRITICAL",
      message: `A alavancagem total de ${(sumWeights * 100).toFixed(1)}% viola o limite rígido de não-alavancagem (${(limits.maxLeverage * 100).toFixed(1)}%).`
    });
  }

  const isCompliant = violations.length === 0;
  const summaryMessage = isCompliant
    ? "CONFORMIDADE CONFIRMADA: O portfólio está em estrita conformidade com os limites rígidos do mandato de governança."
    : `VIOLAÇÃO DETECTADA: O portfólio viola ${violations.length} diretriz(es) de governança de risco institucional.`;

  return {
    isCompliant,
    violations,
    summaryMessage
  };
}

/**
 * Remediates non-compliant weights into compliant, mandated "Safe Weights".
 * Clips excess allocations and redistributes the residual capital to the cash/lowest-risk asset (e.g. BOVA11/CDI or normalized).
 */
export function generateSafeWeights(
  weights: Record<string, number>,
  limits: RiskLimits = INSTITUTIONAL_LIMITS
): Record<string, number> {
  const safeWeights: Record<string, number> = {};
  const maxAllowed = limits.maxWeightPerAsset; // 0.30

  // 1. Initial clip
  Object.entries(weights).forEach(([ticker, w]) => {
    safeWeights[ticker] = Math.min(w, maxAllowed);
  });

  // 2. Normalize sum to 1.0
  let currentSum = Object.values(safeWeights).reduce((sum, val) => sum + val, 0);
  if (currentSum > 0) {
    Object.keys(safeWeights).forEach(ticker => {
      safeWeights[ticker] = safeWeights[ticker] / currentSum;
    });
  }

  // 3. Re-cap any element that exceeded limit after normalization and redistribute excess
  for (let iter = 0; iter < 5; iter++) {
    let excess = 0;
    let uncappedTickers: string[] = [];
    
    Object.keys(safeWeights).forEach(ticker => {
      if (safeWeights[ticker] > maxAllowed) {
        excess += safeWeights[ticker] - maxAllowed;
        safeWeights[ticker] = maxAllowed;
      } else if (safeWeights[ticker] < maxAllowed) {
        uncappedTickers.push(ticker);
      }
    });

    if (excess <= 0.00001 || uncappedTickers.length === 0) break;

    const addPerAsset = excess / uncappedTickers.length;
    uncappedTickers.forEach(ticker => {
      safeWeights[ticker] = Math.min(maxAllowed, safeWeights[ticker] + addPerAsset);
    });
  }

  // 4. Final rounding adjustment to guarantee sum === 1.0
  const finalSum = Object.values(safeWeights).reduce((sum, val) => sum + val, 0);
  if (finalSum > 0 && Math.abs(finalSum - 1.0) > 0.0001) {
    const diff = 1.0 - finalSum;
    const adjustKey = Object.keys(safeWeights).find(k => safeWeights[k] + diff <= maxAllowed) || Object.keys(safeWeights)[0];
    safeWeights[adjustKey] = Math.max(0, safeWeights[adjustKey] + diff);
  }

  // Round values to clean 4 decimal places (e.g. 0.1667)
  Object.keys(safeWeights).forEach(ticker => {
    safeWeights[ticker] = Math.round(safeWeights[ticker] * 10000) / 10000;
  });

  return safeWeights;
}
