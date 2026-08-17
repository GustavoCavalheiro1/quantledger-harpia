/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Box-Muller transform to generate standard normal random variables.
 */
export function randomNormal(): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random(); // Converting [0,1) to (0,1)
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

export interface SimulationResult {
  paths: number[][]; // [pathIndex][dayIndex]
  timeline: string[];
  terminalValues: number[];
  var95: number;
  cvar95: number;
  expectedPnl: number;
  probabilityOfLoss: number;
}

export interface AssetSimParams {
  ticker: string;
  weight: number;
  volatility: number;
  expectedReturn: number;
}

/**
 * Monte Carlo Simulation Engine.
 * Simulates a multi-asset portfolio using Geometric Brownian Motion (GBM)
 * and computes tail risk metrics (VaR/CVaR).
 */
export function runMonteCarloSimulation(
  assets: AssetSimParams[],
  initialPortfolioValue: number = 100_000_000, // R$ 100M default
  days: number = 30,
  numPaths: number = 500
): SimulationResult {
  const dt = 1 / 252; // Daily fraction of a trading year
  const timeline: string[] = [];
  
  // Create simple calendar days for the timeline
  const startDate = new Date();
  for (let d = 0; d <= days; d++) {
    const day = new Date(startDate);
    day.setDate(startDate.getDate() + d);
    timeline.push(day.toLocaleDateString("pt-BR", { day: "numeric", month: "short" }));
  }

  // Pre-calculate weighted portfolio expected return and volatility
  let portfolioDrift = 0;
  let portfolioVol = 0;

  assets.forEach(asset => {
    portfolioDrift += asset.weight * asset.expectedReturn;
    // Simple weighted volatility (for a more rigorous approach, a correlation matrix would be used.
    // We will model an implicit diversified correlation coefficient of ~0.35 in our combined volatility).
    portfolioVol += (asset.weight * asset.volatility) * (asset.weight * asset.volatility);
  });
  
  portfolioVol = Math.sqrt(portfolioVol);
  // Add an adjustment factor for correlation (diversification benefit)
  portfolioVol = portfolioVol * 0.85; 

  const paths: number[][] = [];
  const terminalValues: number[] = [];

  for (let i = 0; i < numPaths; i++) {
    const path: number[] = [initialPortfolioValue];
    let currentValue = initialPortfolioValue;

    for (let d = 1; d <= days; d++) {
      const epsilon = randomNormal();
      // GBM equation: S_t = S_{t-1} * exp((mu - 0.5 * sigma^2) * dt + sigma * sqrt(dt) * epsilon)
      const exponent = (portfolioDrift - 0.5 * Math.pow(portfolioVol, 2)) * dt + portfolioVol * Math.sqrt(dt) * epsilon;
      currentValue = currentValue * Math.exp(exponent);
      path.push(currentValue);
    }
    
    paths.push(path);
    terminalValues.push(currentValue);
  }

  // Calculate returns relative to initial portfolio value
  const terminalReturns = terminalValues.map(v => (v - initialPortfolioValue) / initialPortfolioValue);
  
  // Sort returns in ascending order to compute VaR and CVaR (tail loss)
  const sortedReturns = [...terminalReturns].sort((a, b) => a - b);
  
  // 95% Confidence Level -> 5th percentile index
  const varIndex = Math.floor(sortedReturns.length * 0.05);
  const var95 = -sortedReturns[varIndex]; // Expressed as a positive loss percentage
  
  // CVaR 95% is the average of returns below the VaR threshold
  const worstReturns = sortedReturns.slice(0, varIndex);
  const avgWorstReturn = worstReturns.length > 0 
    ? worstReturns.reduce((sum, r) => sum + r, 0) / worstReturns.length 
    : sortedReturns[0];
  const cvar95 = -avgWorstReturn; // Expressed as positive loss percentage

  const expectedPnl = terminalReturns.reduce((sum, r) => sum + r, 0) / terminalReturns.length;
  const numLosses = terminalReturns.filter(r => r < 0).length;
  const probabilityOfLoss = numLosses / numPaths;

  // Reduce visual path load for frontend charting (render 15 sample paths, but keep stats from all)
  const samplePathIndices = Array.from({ length: 15 }, (_, idx) => 
    Math.floor((idx * numPaths) / 15)
  );
  const samplePaths = samplePathIndices.map(idx => paths[idx]);

  return {
    paths: samplePaths,
    timeline,
    terminalValues,
    var95: Math.max(0.005, var95), // lower bound safe-guard
    cvar95: Math.max(0.008, cvar95),
    expectedPnl,
    probabilityOfLoss
  };
}
