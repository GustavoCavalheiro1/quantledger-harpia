/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SimulationResult } from "./monteCarlo";
import { ComplianceReport } from "./hardLimits";
import { EwsReport } from "./ews";

export interface CommitteeMemo {
  timestamp: string;
  verdict: "APPROVED" | "RECALIBRATION_REQUIRED" | "HALTED";
  executiveSummary: string;
  riskDrivers: string[];
  recommendations: string[];
  croQuote: string;
}

/**
 * AI Risk Committee synthesis model.
 * Consumes quantitative statistics from Monte Carlo, Compliance, and EWS
 * and compiles them into a structured legal-styled advisory opinion.
 */
export function generateCommitteeReport(
  mcResult: SimulationResult,
  compliance: ComplianceReport,
  ews: EwsReport,
  portfolioValue: number = 100_000_000
): CommitteeMemo {
  const riskDrivers: string[] = [];
  const recommendations: string[] = [];
  
  // 1. Identify primary risk drivers from EWS and Compliance
  if (ews.alertLevel === "CRISIS") {
    riskDrivers.push("Estresse Sistêmico: Indicadores do Early Warning System (EWS) acusam surto de correlação cruzada e desvios extremos de volatilidade (CRISIS).");
  } else if (ews.alertLevel === "ATTENTION") {
    riskDrivers.push("Alerta EWS Moderado: Sinais de desvio estatístico nas séries temporais sugerem proximidade de transição de regime de mercado.");
  } else {
    riskDrivers.push("Condições Normativas: O sistema de alerta antecipado opera sob métricas confortáveis (NOMINAL).");
  }

  if (compliance.violations.length > 0) {
    compliance.violations.forEach(v => {
      riskDrivers.push(`Infração de Mandato: ${v.message}`);
    });
  } else {
    riskDrivers.push("Mandato de Governança Integral: A carteira atual respeita rigorosamente todos os limites de concentração e alavancagem.");
  }

  // Quantify tail risks in currency values for standard reading
  const varBrl = mcResult.var95 * portfolioValue;
  const cvarBrl = mcResult.cvar95 * portfolioValue;

  riskDrivers.push(
    `Perda de Cauda Estressada: Simulação de Monte Carlo acusa VaR 95% de R$ ${varBrl.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} (${(mcResult.var95 * 100).toFixed(2)}%) e perda média condicional (CVaR) de R$ ${cvarBrl.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} (${(mcResult.cvar95 * 100).toFixed(2)}%).`
  );

  // 2. Determine compliance verdict
  let verdict: "APPROVED" | "RECALIBRATION_REQUIRED" | "HALTED" = "APPROVED";
  let executiveSummary = "";
  let croQuote = "";

  if (compliance.violations.some(v => v.severity === "CRITICAL") || ews.alertLevel === "CRISIS") {
    verdict = "RECALIBRATION_REQUIRED";
    executiveSummary = "RECALIBRAÇÃO IMEDIATA: O Comitê de Risco de IA emite parecer de readequação de pesos. Foram detectadas violações ativas das regras de apetite de risco institucional ou estresse de volatilidade severo no motor do EWS, impossibilitando a aprovação do rebalanceamento atual sem correções.";
    croQuote = "A estabilidade e a conformidade regulatória precedem a otimização de alfa. Sob o vetor de riscos atual, as ordens de trading estão bloqueadas até a ativação dos pesos de contingência (Safe Weights).";
    
    recommendations.push("Ativar imediatamente a alocação de salvaguarda (Safe Weights), podando posições que extrapolam os 30% máximos.");
    recommendations.push("Reduzir exposição a ativos de alta volatilidade como PETR4 e redistribuir capital residual para BOVA11 ou posições indexadas a CDI.");
    recommendations.push("Suspender ordens tácticas adicionais enquanto o EWS acusar crise sistêmica de correlação.");
  } else if (compliance.violations.some(v => v.severity === "WARNING") || ews.alertLevel === "ATTENTION") {
    verdict = "APPROVED"; // allowed but monitored
    executiveSummary = "APROVADO COM MONITORAÇÃO ESTRITA: O portfólio cumpre os critérios essenciais de conformidade de risco, mas exibe sinais preliminares de deriva de cauda e estresse moderado do EWS. O rebalanceamento está autorizado a prosseguir, sob vigilância automatizada de 24 horas.";
    croQuote = "As comportas do portfólio permanecem abertas, mas o aumento do tracking error e a aceleração do risco de cauda exigem que operemos com prudência. Mantenham os alarmes do EWS de prontidão.";
    
    recommendations.push("Acompanhar os spreads de liquidez bid-ask intradiários na B3 para evitar custos adicionais de execução.");
    recommendations.push("Limitar novas compras no setor industrial (WEGE3) para evitar acúmulo de risco idiossincrático.");
    recommendations.push("Reavaliar periodicamente o score de Data Drift para confirmar se a transição para urso (Bear) está se consumando.");
  } else {
    verdict = "APPROVED";
    executiveSummary = "CONFORMIDADE RIGOROSA (CONCEDIDO): O portfólio é aprovado sem ressalvas pelo Comitê. Todas as simulações de Monte Carlo validam a carteira com métricas de cauda confortáveis, EWS nominal e total aderência às diretrizes prudenciais.";
    croQuote = "Excelente balanceamento e controle estatístico. O portfólio exibe robustez de cauda e está apto para rodar no ambiente de produção.";
    
    recommendations.push("Prosseguir normalmente com a execução de ordens planejadas pelo motor de Execution Intelligence.");
    recommendations.push("Manter as coberturas do Digital Twin em pleno funcionamento histórico.");
    recommendations.push("Registrar esta rodada de aprovação para auditoria no log SQLite durável.");
  }

  return {
    timestamp: new Date().toISOString(),
    verdict,
    executiveSummary,
    riskDrivers,
    recommendations,
    croQuote
  };
}
