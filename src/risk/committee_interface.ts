/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SimulationResult } from "./monteCarlo";
import { ComplianceReport } from "./hardLimits";
import { EwsReport } from "./ews";
import { CommitteeMemo } from "./riskCommittee";

/**
 * Payload interface required for the AI Risk Committee evaluation.
 */
export interface AIAnalysisRequest {
  mcResult: SimulationResult;
  compliance: ComplianceReport;
  ews: EwsReport;
  portfolioValue: number;
  portfolioWeights: Record<string, number>;
  customPrompt?: string;
}

/**
 * Interface defining the Risk Committee AI.
 * It exposes methods to aggregate results from quantitative risk models
 * and generate executive advisory reports, preparing for Gemini AI integration.
 */
export interface IRiskCommitteeAI {
  /**
   * Synthesizes risk reports using Gemini AI or falls back to standard heuristic 
   * logic if the API key/server is not available.
   */
  evaluateRiskAIdriven(request: AIAnalysisRequest): Promise<CommitteeMemo>;

  /**
   * Constructs a formatted markdown prompt detailing the current portfolio metrics,
   * hard compliance violations, and early warning indicator alarms.
   */
  buildGeminiPrompt(request: AIAnalysisRequest): string;
}

/**
 * Concrete implementation of the Risk Committee AI Interface.
 * Orchestrates calls to server-side Gemini API or provides robust local fallbacks.
 */
export class RiskCommitteeAI implements IRiskCommitteeAI {
  /**
   * Builds the formatted prompt payload representing the full portfolio risk context.
   */
  public buildGeminiPrompt(request: AIAnalysisRequest): string {
    const { mcResult, compliance, ews, portfolioValue, portfolioWeights, customPrompt } = request;

    const weightsFormatted = Object.entries(portfolioWeights)
      .map(([ticker, w]) => `  - ${ticker}: ${(w * 100).toFixed(2)}%`)
      .join("\n");

    const violationsFormatted = compliance.violations.length > 0
      ? compliance.violations.map(v => `  - [${v.severity}] ${v.label}: ${v.message} (Value: ${v.currentValue.toFixed(4)})`).join("\n")
      : "  - Nenhuma violação ativa detectada.";

    const ewsIndicatorsFormatted = ews.indicators.length > 0
      ? ews.indicators.map(ind => `  - ${ind.code} (${ind.name}): ${ind.value.toFixed(4)} [Status: ${ind.status}]`).join("\n")
      : "  - Nenhum indicador ativo no EWS.";

    const varBrl = mcResult.var95 * portfolioValue;
    const cvarBrl = mcResult.cvar95 * portfolioValue;

    return `Você é o Diretor de Riscos (Chief Risk Officer - CRO) e o Presidente do Comitê de Risco de IA de um Hedge Fund Quantitativo de alta performance.
Analise os resultados do nosso motor quantitativo de simulação e do sistema de alerta precoce para emitir um parecer institucional com rigor matemático e conformidade legal brasileira (governança B3 e regulações CVM).

=== CONTEXTO DO PORTFÓLIO ===
- Valor de Referência sob Gestão (NAV): R$ ${portfolioValue.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
- Ativos e Alocações:
${weightsFormatted}

=== RESULTADOS: SIMULAÇÃO DE MONTE CARLO (30 Dias, GBM) ===
- Value-at-Risk (VaR 95%): ${(mcResult.var95 * 100).toFixed(2)}% (R$ ${varBrl.toLocaleString("pt-BR", { maximumFractionDigits: 0 })})
- Conditional Value-at-Risk (CVaR 95%): ${(mcResult.cvar95 * 100).toFixed(2)}% (R$ ${cvarBrl.toLocaleString("pt-BR", { maximumFractionDigits: 0 })})

=== RELATÓRIO DE COMPLIANCE (LIMITES ESTRITOS) ===
- Status de Conformidade: ${compliance.isCompliant ? "COMPLIANT" : "VIOLATION_DETECTED"}
- Violações:
${violationsFormatted}

=== SISTEMA DE ALERTA ANTECIPADO (EWS) ===
- Nível de Alerta Global: ${ews.alertLevel}
- Métricas Ativas:
${ewsIndicatorsFormatted}

${customPrompt ? `\n=== DIRETRIZ EXTRA DO USUÁRIO ===\n${customPrompt}\n` : ""}

=== INSTRUÇÕES DE FORMATAÇÃO ===
Retorne estritamente um JSON válido contendo os seguintes campos. Não inclua blocos markdown como \`\`\`json no início ou no fim do texto, responda apenas com o objeto JSON limpo:
{
  "timestamp": "ISO timestamp string",
  "verdict": "APPROVED" ou "RECALIBRATION_REQUIRED" ou "HALTED",
  "executiveSummary": "Parecer de risco extremamente polido, formal, analítico e de alto nível institucional em português (máximo de 4 parágrafos). Mencione os riscos sistêmicos e as métricas de Monte Carlo de forma elegante.",
  "riskDrivers": ["Lista detalhada com 3 a 5 gatilhos ou impulsionadores de risco identificados, quantificando impactos no portfólio."],
  "recommendations": ["Lista de 3 a 4 recomendações práticas e acionáveis de rebalanceamento ou hedges."],
  "croQuote": "Frase de efeito ou citação profissional do CRO sobre a situação de mercado atual."
}
`;
  }

  /**
   * Evaluates the risk status using server-side Gemini API or falls back to heuristic computation.
   */
  public async evaluateRiskAIdriven(request: AIAnalysisRequest): Promise<CommitteeMemo> {
    try {
      // Create a signal or controller to timeout after 8 seconds
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const prompt = this.buildGeminiPrompt(request);

      const response = await fetch("/api/risk/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const result = await response.json();
        if (result && result.verdict) {
          return {
            timestamp: result.timestamp || new Date().toISOString(),
            verdict: result.verdict,
            executiveSummary: result.executiveSummary,
            riskDrivers: result.riskDrivers || [],
            recommendations: result.recommendations || [],
            croQuote: result.croQuote || "A prudência é a guardiã suprema do capital.",
          };
        }
      }
    } catch (e) {
      console.warn("AI Risk Committee server call failed, falling back to local synthesis engine:", e);
    }

    // Heuristic fallback if server is unreachable or fails
    return this.fallbackHeuristic(request);
  }

  /**
   * Robust local fallback synthesis in case the server-side LLM is unavailable.
   */
  private fallbackHeuristic(request: AIAnalysisRequest): CommitteeMemo {
    const { mcResult, compliance, ews, portfolioValue } = request;
    
    const riskDrivers: string[] = [];
    const recommendations: string[] = [];

    const varPct = (mcResult.var95 * 100).toFixed(2);
    const cvarPct = (mcResult.cvar95 * 100).toFixed(2);
    const varBrl = mcResult.var95 * portfolioValue;
    const cvarBrl = mcResult.cvar95 * portfolioValue;

    // Determine verdict
    let verdict: "APPROVED" | "RECALIBRATION_REQUIRED" | "HALTED" = "APPROVED";
    let executiveSummary = "";
    let croQuote = "";

    if (compliance.violations.some(v => v.severity === "CRITICAL") || ews.alertLevel === "CRISIS") {
      verdict = "RECALIBRATION_REQUIRED";
      executiveSummary = `RECALIBRAÇÃO CRÍTICA EXIGIDA: O Comitê de Risco AI emite um parecer de readequação de emergência. A carteira apresenta infrações de limite estrito ou o sistema Early Warning System (EWS) aponta estresse de nível crítico no mercado. As projeções de cauda via simulação de Monte Carlo indicam um CVaR 95% de R$ ${cvarBrl.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} (${cvarPct}%), excedendo as margens conservadoras permitidas pela governança.`;
      croQuote = "Diante de quebras ativas de limite e correlação alarmante do mercado, os trading desks estão ordenados a pausar a execução até a retração segura do VaR.";
      
      riskDrivers.push(`Estresse Crítico EWS: Indicador global opera sob status de ${ews.alertLevel}, refletindo choques sistêmicos e dispersão.`);
      riskDrivers.push(`Quebra de Mandato: Foram detectadas ${compliance.violations.length} infrações prudenciais.`);
      riskDrivers.push(`Exposição Cauda Monte Carlo: Perda média condicional (CVaR) projetada de R$ ${cvarBrl.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}.`);

      recommendations.push("Executar a alocação de salvaguarda (Safe Weights) reduzindo concentração acima de 30%.");
      recommendations.push("Transferir margem excedente de ativos voláteis como PETR4 para ativos mais estáveis como BOVA11 ou posições remuneradas em CDI.");
      recommendations.push("Iniciar hedge tático através de opções de venda (puts) ou venda de índice futuro na B3.");
    } else if (compliance.violations.some(v => v.severity === "WARNING") || ews.alertLevel === "ATTENTION") {
      verdict = "APPROVED";
      executiveSummary = `APROVADO COM MONITORAÇÃO ATIVA: O Comitê aprova o portfólio, mas registra alertas relevantes de desvio de volatilidade e elevação estatística de risco. O VaR 95% de R$ ${varBrl.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} (${varPct}%) está dentro dos limites, mas a proximidade com níveis de corte exige acompanhamento rigoroso e logs horários das métricas do EWS.`;
      croQuote = "As ordens de alocação estão liberadas, contanto que as mesas limitem a alavancagem intradiária e fiquem vigilantes aos spreads.";

      riskDrivers.push(`Alerta Moderado EWS: Transição estatística de regime sinalizada pelo aumento sutil na volatilidade histórica.`);
      riskDrivers.push(`Atitude Preventiva: O CVaR de ${cvarPct}% aproxima-se do limiar de alerta, embora sem quebrar as diretrizes governamentais.`);

      recommendations.push("Conduzir rebalanceamento com dispersão controlada para mitigar custos de transação.");
      recommendations.push("Verificar volatilidade intradiária de WEGE3 e ITUB4 e moderar novas exposições setoriais.");
      recommendations.push("Avaliar se o índice do FED de juros americanos (EFFR) afetará o fluxo de capital estrangeiro na B3.");
    } else {
      verdict = "APPROVED";
      executiveSummary = `APROVAÇÃO INTEGRAL (NOMINAL): Portfólio aprovado com excelente governança. O motor quantitativo valida a carteira com métricas excepcionais de controle de risco, VaR nominal controlado e Early Warning System em patamares tranquilos. Total aderência regulatória atestada para produção.`;
      croQuote = "Excelente balanceamento e estabilidade estatística. O portfólio exibe robustez impecável para o ciclo atual.";

      riskDrivers.push("Condições de Equilíbrio: Alertas do EWS operam sob bandeira verde (NOMINAL).");
      riskDrivers.push("Mandato Blindado: Nenhuma infração de alocação ou volatilidade ativa.");
      riskDrivers.push(`Cauda Saudável: Risco de perda extrema sob total controle estatístico (VaR: ${varPct}%).`);

      recommendations.push("Dar andamento às ordens eletrônicas de rebalanceamento programadas.");
      recommendations.push("Documentar a aprovação regulatória no ledger local SQLite.");
      recommendations.push("Registrar as simulações para reavaliação de backtesting no final do mês.");
    }

    return {
      timestamp: new Date().toISOString(),
      verdict,
      executiveSummary,
      riskDrivers,
      recommendations,
      croQuote,
    };
  }
}
