/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface EwsIndicator {
  name: string;
  code: string;
  value: number;
  threshold: number;
  status: "OK" | "WARNING" | "CRITICAL";
  description: string;
}

export interface EwsAlarm {
  timestamp: string;
  code: string;
  title: string;
  message: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
}

export interface EwsReport {
  overallScore: number; // 0 to 100
  alertLevel: "NOMINAL" | "ATTENTION" | "CRISIS";
  indicators: EwsIndicator[];
  activeAlarms: EwsAlarm[];
}

export const SAMPLE_EWS_HISTORY: EwsAlarm[] = [
  {
    timestamp: new Date(Date.now() - 4 * 3600_000 * 24).toISOString(), // 4 days ago
    code: "VOL_DRIFT",
    title: "Deriva de Volatilidade de PETR4",
    message: "A volatilidade implícita de curto prazo de PETR4 superou em 1.45x a média de 30 dias após ruídos sobre distribuição de caixa.",
    severity: "MEDIUM"
  },
  {
    timestamp: new Date(Date.now() - 2 * 3600_000 * 24).toISOString(), // 2 days ago
    code: "CORR_SURGE",
    title: "Surto de Correlação Setorial",
    message: "A correlação cruzada média entre ativos financeiros e materiais básicos subiu de 0.22 para 0.48, reduzindo o benefício de diversificação HRP.",
    severity: "MEDIUM"
  },
  {
    timestamp: new Date(Date.now() - 12 * 3600_000).toISOString(), // 12h ago
    code: "DATA_DRIFT",
    title: "Data Drift - Sinais de Sentimento",
    message: "Desvio estatístico detectado no fluxo de scores diários de LLM Sentiment. Sinais com cauda de desvio de regime macroeconômico.",
    severity: "LOW"
  }
];

/**
 * Computes a live EWS evaluation based on portfolio properties.
 */
export function evaluateEws(
  avgCorrelation: number = 0.35,
  realizedVolRatio: number = 1.12, // realized / expected
  cvarAcceleration: number = 0.05, // change speed in tail risk
  dataDriftScore: number = 24       // scale 0-100
): EwsReport {
  const indicators: EwsIndicator[] = [];
  let scoreSum = 0;

  // 1. Cross-Correlation Indicator
  const corrStatus = avgCorrelation > 0.60 ? "CRITICAL" : avgCorrelation > 0.45 ? "WARNING" : "OK";
  indicators.push({
    name: "Correlação Cruzada Média",
    code: "CORR_SURGE",
    value: avgCorrelation,
    threshold: 0.45,
    status: corrStatus,
    description: "Mede o grau de acoplamento dos ativos. Correlações muito altas destroem a eficiência da carteira hierárquica (HRP)."
  });
  scoreSum += corrStatus === "CRITICAL" ? 30 : corrStatus === "WARNING" ? 15 : 0;

  // 2. Volatility Ratio
  const volStatus = realizedVolRatio > 1.35 ? "CRITICAL" : realizedVolRatio > 1.15 ? "WARNING" : "OK";
  indicators.push({
    name: "Deriva de Volatilidade (RVol / EVol)",
    code: "VOL_DRIFT",
    value: realizedVolRatio,
    threshold: 1.15,
    status: volStatus,
    description: "Razão entre a volatilidade realizada nos últimos dias contra a prevista pelo modelo clássico. Valores acima de 1.15x sinalizam instabilidade."
  });
  scoreSum += volStatus === "CRITICAL" ? 30 : volStatus === "WARNING" ? 15 : 0;

  // 3. Tail Risk Speed (CVaR Acceleration)
  const speedStatus = cvarAcceleration > 0.15 ? "CRITICAL" : cvarAcceleration > 0.08 ? "WARNING" : "OK";
  indicators.push({
    name: "Aceleração do Tail Risk (CVaR)",
    code: "TAIL_SPEED",
    value: cvarAcceleration,
    threshold: 0.08,
    status: speedStatus,
    description: "Taxa de variação do risco de cauda CVaR de uma semana para outra. Acelerações indicam choques estruturais iminentes."
  });
  scoreSum += speedStatus === "CRITICAL" ? 25 : speedStatus === "WARNING" ? 10 : 0;

  // 4. Data Drift Score
  const driftStatus = dataDriftScore > 50 ? "CRITICAL" : dataDriftScore > 30 ? "WARNING" : "OK";
  indicators.push({
    name: "Desvio Estatístico de Dados (Data Drift)",
    code: "DATA_DRIFT",
    value: dataDriftScore,
    threshold: 30,
    status: driftStatus,
    description: "Score quantitativo do desvio entre as distribuições das features em tempo real versus as de calibração histórica."
  });
  scoreSum += driftStatus === "CRITICAL" ? 15 : driftStatus === "WARNING" ? 5 : 0;

  // Compute final risk evaluation score (0-100)
  const overallScore = Math.min(100, Math.max(5, scoreSum));
  
  const alertLevel = overallScore > 50 
    ? "CRISIS" 
    : overallScore > 25 
    ? "ATTENTION" 
    : "NOMINAL";

  // Filter or augment alarms
  const activeAlarms: EwsAlarm[] = [...SAMPLE_EWS_HISTORY];
  
  if (alertLevel === "CRISIS") {
    activeAlarms.unshift({
      timestamp: new Date().toISOString(),
      code: "CRITICAL_SYSTEMIC_ALERT",
      title: "ALERTA CRÍTICO: Risco Sistêmico de Cauda Elevado",
      message: "Múltiplos indicadores EWS romperam as barreiras de controle. Risco sistêmico de cauda acelerado com perda de correlação e deriva de vol.",
      severity: "HIGH"
    });
  } else if (alertLevel === "ATTENTION" && !activeAlarms.some(a => a.code === "SYSTEMIC_ALERT")) {
    activeAlarms.unshift({
      timestamp: new Date().toISOString(),
      code: "SYSTEMIC_ALERT",
      title: "ATENÇÃO: Desvio Moderado das Condições Normais",
      message: "Deriva de volatilidade e elevação marginal na correlação cruzada ativaram o regime de monitoramento estrito do comitê.",
      severity: "MEDIUM"
    });
  }

  return {
    overallScore,
    alertLevel,
    indicators,
    activeAlarms
  };
}
