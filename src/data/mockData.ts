/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Asset, StressScenario, MarketRegime, DriftLog } from "../types";

export const INITIAL_ASSETS: Asset[] = [
  {
    ticker: "PETR4",
    name: "Petróleo Brasileiro S.A.",
    sector: "Energia",
    price: 38.45,
    adv: 1200000000,
    volatility: 0.28,
    spreadBps: 2.5,
    scores: { macro: 75, micro: 82, news: 88, credit: 68 },
    expectedReturnBL: 0.185,
    confidenceBL: 0.85,
    explanation: "Forte geração de caixa operacional, queda no endividamento líquido e sentimento de notícias positivo sobre dividendos.",
  },
  {
    ticker: "VALE3",
    name: "Vale S.A.",
    sector: "Materiais Básicos",
    price: 61.20,
    adv: 950000000,
    volatility: 0.24,
    spreadBps: 3.0,
    scores: { macro: 45, micro: 68, news: 52, credit: 85 },
    expectedReturnBL: 0.112,
    confidenceBL: 0.60,
    explanation: "Incerteza na demanda chinesa de minério mantém o score macro pressionado. Contudo, excelente balanço de crédito.",
  },
  {
    ticker: "WEGE3",
    name: "WEG S.A.",
    sector: "Bens Industriais",
    price: 43.15,
    adv: 450000000,
    volatility: 0.19,
    spreadBps: 4.0,
    scores: { macro: 80, micro: 94, news: 91, credit: 95 },
    expectedReturnBL: 0.218,
    confidenceBL: 0.90,
    explanation: "Líder global em motores elétricos. Excelente ROIC de 28% e forte crescimento contratado em energias renováveis e T&D nos EUA.",
  },
  {
    ticker: "ITUB4",
    name: "Itaú Unibanco Holding S.A.",
    sector: "Financeiro",
    price: 34.80,
    adv: 800000000,
    volatility: 0.16,
    spreadBps: 1.8,
    scores: { macro: 65, micro: 88, news: 76, credit: 98 },
    expectedReturnBL: 0.149,
    confidenceBL: 0.80,
    explanation: "Sólida carteira de crédito e inadimplência controlada. Perfil de crédito AAA e baixo beta fazem do Itaú o principal âncora.",
  },
  {
    ticker: "BBAS3",
    name: "Banco do Brasil S.A.",
    sector: "Financeiro",
    price: 27.90,
    adv: 600000000,
    volatility: 0.22,
    spreadBps: 2.2,
    scores: { macro: 70, micro: 85, news: 68, credit: 75 },
    expectedReturnBL: 0.162,
    confidenceBL: 0.75,
    explanation: "Múltiplos descontados (P/L 4x) e forte exposição ao agronegócio resiliente de exportação de soja e grãos.",
  },
  {
    ticker: "RENT3",
    name: "Localiza Rent a Car S.A.",
    sector: "Consumo Cíclico",
    price: 48.50,
    adv: 380000000,
    volatility: 0.26,
    spreadBps: 3.5,
    scores: { macro: 62, micro: 78, news: 65, credit: 80 },
    expectedReturnBL: 0.138,
    confidenceBL: 0.70,
    explanation: "Dominância de mercado em aluguel de frotas e seminovos, compensando pressão de depreciação cíclica de veículos.",
  },
  {
    ticker: "BBDC4",
    name: "Banco Bradesco S.A.",
    sector: "Financeiro",
    price: 15.20,
    adv: 520000000,
    volatility: 0.21,
    spreadBps: 2.0,
    scores: { macro: 55, micro: 70, news: 60, credit: 90 },
    expectedReturnBL: 0.125,
    confidenceBL: 0.65,
    explanation: "Reestruturação operacional em andamento com foco em canais digitais de alta escala e controle de PDD.",
  },
  {
    ticker: "ABEV3",
    name: "Ambev S.A.",
    sector: "Consumo Não Cíclico",
    price: 12.80,
    adv: 300000000,
    volatility: 0.15,
    spreadBps: 2.5,
    scores: { macro: 50, micro: 84, news: 58, credit: 96 },
    expectedReturnBL: 0.108,
    confidenceBL: 0.85,
    explanation: "Forte barreira de entrada e distribuição robusta. Excelente geração de caixa livre atua como colchão defensivo clássico.",
  },
  {
    ticker: "ELET3",
    name: "Centrais Elétricas Brasileiras S.A.",
    sector: "Utilidade Pública",
    price: 39.10,
    adv: 420000000,
    volatility: 0.23,
    spreadBps: 3.2,
    scores: { macro: 68, micro: 80, news: 72, credit: 82 },
    expectedReturnBL: 0.155,
    confidenceBL: 0.72,
    explanation: "Sinergias pós-privatização avançando com venda de ativos não-core e reestruturação de passivos contingentes.",
  },
  {
    ticker: "PRIO3",
    name: "PetroRio S.A.",
    sector: "Energia",
    price: 44.30,
    adv: 410000000,
    volatility: 0.32,
    spreadBps: 3.8,
    scores: { macro: 72, micro: 86, news: 78, credit: 70 },
    expectedReturnBL: 0.198,
    confidenceBL: 0.78,
    explanation: "Alta eficiência de extração em campos maduros. Lifting cost baixo de US$ 7.20/bbl protege contra oscilações severas do Brent.",
  },
  {
    ticker: "EMBR3",
    name: "Embraer S.A.",
    sector: "Bens Industriais",
    price: 37.60,
    adv: 350000000,
    volatility: 0.27,
    spreadBps: 4.2,
    scores: { macro: 85, micro: 90, news: 89, credit: 78 },
    expectedReturnBL: 0.215,
    confidenceBL: 0.88,
    explanation: "Demanda aquecida por jatos comerciais (E2) e de defesa (C-390). Backlog de pedidos firme garante receita dolarizada expressiva.",
  },
  {
    ticker: "JBSS3",
    name: "JBS S.A.",
    sector: "Consumo Não Cíclico",
    price: 30.50,
    adv: 290000000,
    volatility: 0.22,
    spreadBps: 3.0,
    scores: { macro: 60, micro: 82, news: 70, credit: 80 },
    expectedReturnBL: 0.142,
    confidenceBL: 0.74,
    explanation: "Portfólio geográfico de proteínas diversificado globalmente nos EUA e Austrália mitigando flutuações de custos locais.",
  },
  {
    ticker: "BOVA11",
    name: "iShares Ibovespa Index ETF",
    sector: "Índice de Referência",
    price: 124.50,
    adv: 1500000000,
    volatility: 0.18,
    spreadBps: 1.0,
    scores: { macro: 55, micro: 55, news: 55, credit: 55 },
    expectedReturnBL: 0.125,
    confidenceBL: 1.0,
    explanation: "Representação ponderada do Ibovespa. Usada como benchmark principal no teste de atribuição clássica e alocação.",
  },
  {
    ticker: "IVVB11",
    name: "iShares S&P 500 BRL ETF",
    sector: "Índice S&P 500",
    price: 285.00,
    adv: 1100000000,
    volatility: 0.17,
    spreadBps: 1.2,
    scores: { macro: 75, micro: 80, news: 72, credit: 92 },
    expectedReturnBL: 0.145,
    confidenceBL: 0.90,
    explanation: "Replicação local do índice norte-americano S&P 500 (B S500), capturando de forma direta o dólar e o mercado acionário global.",
  },
  {
    ticker: "SOJA",
    name: "Soja Chicago CME",
    sector: "Agronegócio",
    price: 11.80,
    adv: 250000000,
    volatility: 0.22,
    spreadBps: 3.5,
    scores: { macro: 60, micro: 70, news: 50, credit: 80 },
    expectedReturnBL: 0.140,
    confidenceBL: 0.75,
    explanation: "Monitoramento por satélite NDVI indica estresse térmico localizado no Sul, o que pode pressionar as cotações de grãos para cima.",
  },
  {
    ticker: "MILHO",
    name: "Milho B3 Futuro",
    sector: "Agronegócio",
    price: 64.20,
    adv: 180000000,
    volatility: 0.21,
    spreadBps: 4.5,
    scores: { macro: 58, micro: 72, news: 55, credit: 85 },
    expectedReturnBL: 0.132,
    confidenceBL: 0.70,
    explanation: "Expansão da safrinha brasileira amortecida por gargalos logísticos locais de armazenagem.",
  },
  {
    ticker: "CAFÉ",
    name: "Café Arábica B3",
    sector: "Agronegócio",
    price: 215.40,
    adv: 120000000,
    volatility: 0.25,
    spreadBps: 5.0,
    scores: { macro: 65, micro: 75, news: 60, credit: 88 },
    expectedReturnBL: 0.148,
    confidenceBL: 0.68,
    explanation: "Secas nas regiões produtoras de Minas Gerais limitam a produção, elevando o preço de contratos futuros na B3.",
  },
  {
    ticker: "OURO",
    name: "Ouro Spot (BM&F)",
    sector: "Defensivo",
    price: 418.50,
    adv: 90000000,
    volatility: 0.14,
    spreadBps: 6.0,
    scores: { macro: 82, micro: 50, news: 80, credit: 100 },
    expectedReturnBL: 0.115,
    confidenceBL: 0.85,
    explanation: "Ativo defensivo por excelência. Demanda de bancos centrais globais apoia preços contra pressões fiscais sistêmicas.",
  },
  {
    ticker: "USD_BRL",
    name: "Dólar Comercial",
    sector: "Câmbio",
    price: 5.48,
    adv: 4500000000,
    volatility: 0.13,
    spreadBps: 0.8,
    scores: { macro: 70, micro: 50, news: 65, credit: 100 },
    expectedReturnBL: 0.085,
    confidenceBL: 0.95,
    explanation: "Taxa de câmbio USD/BRL. Atua como hedge macro automático e vetor de sensibilidade global do portfólio.",
  },
  {
    ticker: "CDI",
    name: "Certificado de Depósito Interbancário",
    sector: "Renda Fixa",
    price: 1.00,
    adv: 10000000000,
    volatility: 0.01,
    spreadBps: 0.1,
    scores: { macro: 50, micro: 50, news: 50, credit: 100 },
    expectedReturnBL: 0.105,
    confidenceBL: 1.00,
    explanation: "Renda fixa e liquidez diária. Serve como colchão de capital e porto seguro no controle de risco cauda.",
  }
];

// Generate 100 historical days for charting
export const generateHistory = () => {
  const history = [];
  let fundValue = 100.0;
  let cdiValue = 100.0;
  let benchValue = 100.0;

  const baseDate = new Date("2026-02-15");

  for (let i = 0; i < 100; i++) {
    const currentDate = new Date(baseDate);
    currentDate.setDate(baseDate.getDate() + i);
    const dateStr = currentDate.toISOString().split("T")[0];

    // Simulating daily returns with different volatilities and drift
    // CDI (steady risk-free rate, approx 10.5% annualized, very low daily variance)
    const cdiDaily = 0.105 / 252;
    cdiValue *= (1 + cdiDaily);

    // Benchmark BOVA11 (Ibovespa - higher vol, moderate return)
    const benchDrift = 0.12 / 252;
    const benchVol = 0.18 / Math.sqrt(252);
    // Pseudo random walk
    const benchRand = Math.sin(i * 0.1) * 0.005 + (Math.cos(i * 0.25) * 0.008) + (Math.sin(i * 0.05) * 0.012);
    const benchDaily = benchDrift + benchRand;
    benchValue *= (1 + benchDaily);

    // Fund Portfolio (high return, optimized volatility, outperformance)
    const fundDrift = 0.245 / 252;
    const fundRand = Math.sin(i * 0.12) * 0.004 + (Math.cos(i * 0.23) * 0.006) + (Math.sin(i * 0.07) * 0.008);
    // Alpha boost based on regime shifts
    const alphaBoost = i > 40 && i < 70 ? 0.002 : 0.0005; 
    const fundDaily = fundDrift + fundRand + alphaBoost;
    fundValue *= (1 + fundDaily);

    // Drawdown Calculation
    // We need to keep track of previous peaks
    const maxFundSoFar = Math.max(...(history.map(h => h.fund) || []), fundValue);
    const maxBenchSoFar = Math.max(...(history.map(h => h.bench) || []), benchValue);
    const fundDd = ((fundValue / maxFundSoFar) - 1) * 100;
    const benchDd = ((benchValue / maxBenchSoFar) - 1) * 100;

    history.push({
      date: dateStr,
      fund: parseFloat(fundValue.toFixed(2)),
      cdi: parseFloat(cdiValue.toFixed(2)),
      bench: parseFloat(benchValue.toFixed(2)),
      fundDrawdown: parseFloat(fundDd.toFixed(2)),
      benchDrawdown: parseFloat(benchDd.toFixed(2)),
    });
  }
  return history;
};

export const HISTORICAL_SCENARIOS: StressScenario[] = [
  {
    id: "COVID_2020",
    name: "Joio da Crise - COVID-19 (Março 2020)",
    description: "Simula o pânico sistêmico de liquidez global, circuit breakers sequenciais na B3 e depreciação acentuada de ativos de risco, com disparada de volatilidade.",
    shocks: {
      PETR4: -0.60,
      VALE3: -0.35,
      WEGE3: -0.30,
      ITUB4: -0.42,
      BBAS3: -0.50,
      BOVA11: -0.45,
    },
    worstAsset: "PETR4",
    portfolioPnlPct: -39.5,
    varShift: 245.0,
    riskCommitteeMemo: "ALERTA DE CAUDA PESADA: O choque de COVID-19 causaria uma perda extrema na carteira de ações devido à alta correlação sistêmica no estouro da vol. Recomendação: Elevar imediatamente a posição CDI para 45% do portfólio para absorver choques de margem de garantia.",
  },
  {
    id: "JOESLEY_2017",
    name: "Risco Político - Joesley Day (Maio 2017)",
    description: "Vazamento de gravações comprometendo a presidência brasileira, gerando pânico nos mercados de juros futuros e queda abrupta do Ibovespa em um único dia.",
    shocks: {
      PETR4: -0.15,
      VALE3: -0.06,
      WEGE3: -0.04,
      ITUB4: -0.12,
      BBAS3: -0.20,
      BOVA11: -0.09,
    },
    worstAsset: "BBAS3",
    portfolioPnlPct: -11.4,
    varShift: 75.0,
    riskCommitteeMemo: "NOTA ANALÍTICA: Bancos públicos sofrem impacto direto devido ao prêmio de risco governamental. WEGE3 e VALE3 amorteceriam consideravelmente o choque por conta da receita dolarizada. O modelo HRP se provaria defensivo comparado ao Benchmark puro.",
  },
  {
    id: "SELIC_SHOCK_UP_5",
    name: "Aperto de Juros Extremo (+5.0% Selic)",
    description: "Elevação forçada na taxa Selic real devido ao estresse inflacionário fiscal, gerando esmagamento de múltiplos de ações de crescimento e fuga para renda fixa.",
    shocks: {
      PETR4: -0.08,
      VALE3: -0.02,
      WEGE3: -0.25,
      ITUB4: -0.05,
      BBAS3: -0.04,
      BOVA11: -0.12,
    },
    worstAsset: "WEGE3",
    portfolioPnlPct: -8.8,
    varShift: 45.0,
    riskCommitteeMemo: "AVALIAÇÃO DO COMITÊ: WEGE3, apesar de robusta, sofre contração expressiva de múltiplos de valuation (P/L) em ambientes de taxa de juros alta. O setor financeiro (ITUB4/BBAS3) exibe resiliência pelas margens de spread que se beneficiam de juros altos.",
  },
  {
    id: "GLOBAL_LEHMAN_2008",
    name: "Crise Lehman Brothers (Subprime 2008)",
    description: "Secagem do crédito global e quebra de instituições financeiras globais, levando à paralisia do comércio internacional e colapso de commodities.",
    shocks: {
      PETR4: -0.58,
      VALE3: -0.62,
      WEGE3: -0.40,
      ITUB4: -0.48,
      BBAS3: -0.52,
      BOVA11: -0.55,
    },
    worstAsset: "VALE3",
    portfolioPnlPct: -48.2,
    varShift: 310.0,
    riskCommitteeMemo: "ALERTA CRÍTICO: Ativos cíclicos exportadores sofrem o maior baque de demanda sistêmica global. A preservação de caixa em CDI é o único reduto seguro. Sugere-se a estruturação de opções PUT de proteção longa de BOVA11 fora-do-dinheiro como seguro cauda.",
  },
  {
    id: "EL_NINO_AGRO",
    name: "Super El Niño & Estresse Climático no Agro",
    description: "Seca severa no Centro-Oeste e calor recorde na região produtora, provocando perda de rendimento de soja e milho safrinha tardio, estresse foliar NDVI e quebra da florada de café. Alta inadimplência de crédito de produtores e alta de preços dos futuros agrícolas.",
    shocks: {
      PETR4: -0.05,
      VALE3: -0.02,
      WEGE3: -0.03,
      ITUB4: -0.04,
      BBAS3: -0.18, // heavy agricultural credit book exposure
      BOVA11: -0.08,
      IVVB11: -0.02,
      SOJA: 0.40,  // physical supply shock surges prices
      MILHO: 0.35,
      CAFÉ: 0.30,
      USD_BRL: 0.12, // export currency pressure
      OURO: 0.05,
      CDI: 0.02
    },
    worstAsset: "BBAS3",
    portfolioPnlPct: 6.8, // positive because of heavy agricultural long hedge
    varShift: 85.0,
    riskCommitteeMemo: "ANÁLISE CLIMÁTICA DO AGRO: O estresse de seca decorrente do El Niño eleva os riscos de crédito na carteira rural do Banco do Brasil (BBAS3). No entanto, o hedge tático direto em contratos futuros de Soja, Milho e Café atua como vetor de ganho assimétrico, compensando perdas acionárias de beta tradicional e de crédito produtor."
  },
  {
    id: "GEOPOLITICAL_WAR",
    name: "Conflito Global, Guerra de Atrito & Choque Logístico",
    description: "Escalada de tensões geopolíticas no Oriente Médio e Europa Oriental, provocando bloqueios sequenciais em estreitos marítimos essenciais. Disparada imediata do petróleo Brent, aversão extrema a riscos globais e fuga massiva de capitais emergentes.",
    shocks: {
      PETR4: 0.30, // massive surge due to Brent oil spike
      VALE3: -0.15,
      WEGE3: -0.12,
      ITUB4: -0.16,
      BBAS3: -0.14,
      BOVA11: -0.14,
      IVVB11: 0.15, // captures dollar appreciation and SP500 hedge
      SOJA: 0.18,  // global grain supply chain blockages
      MILHO: 0.12,
      CAFÉ: 0.10,
      USD_BRL: 0.20, // major dollar breakout against Real
      OURO: 0.25,  // flight to gold as ultimate safe haven
      CDI: 0.04
    },
    worstAsset: "ITUB4",
    portfolioPnlPct: 8.5, // protected by dollar, gold, petroleum and agricultural commodities hedge
    varShift: 145.0,
    riskCommitteeMemo: "AVALIAÇÃO DE RISCO GEOPOLÍTICO: A escalada armada gera aversão generalizada, mas o portfólio quantitativo Harpia mitiga o contágio por meio de sua alocação estratégica em ouro (OURO), dólar (USD_BRL), posições dolarizadas (IVVB11) e ativos energéticos (PETR4). O portfólio demonstra excelente imunidade cauda."
  },
  {
    id: "GLOBAL_STAGFLATION",
    name: "Estagflação Global & Aperto Sincronizado",
    description: "Combinação tóxica de crescimento econômico estagnado, inflação de custos persistente e juros altos nos bancos centrais do G10, acarretando contração global severa de múltiplos patrimoniais.",
    shocks: {
      PETR4: -0.12,
      VALE3: -0.15,
      WEGE3: -0.28, // high P/E multiple contraction
      ITUB4: -0.08,
      BBAS3: -0.10,
      BOVA11: -0.15,
      IVVB11: -0.12,
      SOJA: -0.05,
      MILHO: -0.04,
      CAFÉ: -0.03,
      USD_BRL: 0.05,
      OURO: 0.12,
      CDI: 0.16 // benefits directly from high domestic Selic yields
    },
    worstAsset: "WEGE3",
    portfolioPnlPct: -10.2,
    varShift: 90.0,
    riskCommitteeMemo: "RECOMENDAÇÃO TÁTICA: Em cenários estagflacionários, as empresas de crescimento (WEGE3, RENT3) sofrem re-rating agressivo de juros descontados. O comitê recomenda rotacionar capital taticamente para posições em CDI (Selic) e Ouro, reduzindo a exposição a ações domésticas de alto beta."
  }
];

export const ALL_REGIMES = [
  {
    id: MarketRegime.BULL_LOW_VOL,
    name: "Bull Market - Baixa Volatilidade",
    weights: { XGBoost: 0.50, LightGBM: 0.30, LSTM: 0.20 },
    description: "Cenário favorável onde modelos de Machine Learning lineares e árvores de decisão aproveitam momentum estável com baixo ruído.",
  },
  {
    id: MarketRegime.BEAR_HIGH_VOL,
    name: "Bear Market - Alta Volatilidade",
    weights: { TFT: 0.60, LSTM: 0.30, XGBoost: 0.10 },
    description: "Regime defensivo onde redes neurais temporais (TFT/LSTM) capturam padrões de pânico e reversão de tendência complexas.",
  },
  {
    id: MarketRegime.CRISIS,
    name: "Regime de Crise Sistêmica",
    weights: { TFT: 0.80, XGBoost: 0.10, LightGBM: 0.10 },
    description: "Alta incerteza estrutural. Modelo de atenção temporal (Temporal Fusion Transformer) ganha peso máximo para priorizar horizonte de curto prazo.",
  },
  {
    id: MarketRegime.SIDEWAYS,
    name: "Regime Lateralizado (Ranger)",
    weights: { LSTM: 0.40, XGBoost: 0.40, LightGBM: 0.20 },
    description: "Mercado sem tendência definida. Modelos osciladores de aprendizado profundo (LSTM) alternam posições para explorar reversão à média.",
  }
];

export const INITIAL_DRIFT_LOGS: DriftLog[] = [
  {
    timestamp: "2026-07-09T18:00:00Z",
    trackingError: 0.0185,
    volRatio: 1.05,
    returnDeviation: 0.012,
    driftScore: 12,
    severity: "OK",
    llmAlert: "Sincronização perfeita. O Digital Twin está capturando de forma precisa os spreads e custos de corretagem da B3 calibrados pelo backtest.",
  },
  {
    timestamp: "2026-07-10T10:00:00Z",
    trackingError: 0.0340,
    volRatio: 1.35,
    returnDeviation: -0.045,
    driftScore: 45,
    severity: "WARNING",
    llmAlert: "DESVIO DETECTADO: A volatilidade intraday do ativo WEGE3 saltou inesperadamente, gerando um Tracking Error anualizado de 3.4%. O motor de liquidez sugere monitorar o fluxo institucional.",
  }
];

// Pre-computed allocation strategies for comparative visualizers
export const ALLOCATION_STRATEGIES = {
  BENCHMARK: {
    BOVA11: 0.18,
    IVVB11: 0.14,
    PETR4: 0.10,
    VALE3: 0.10,
    ITUB4: 0.08,
    BBAS3: 0.06,
    RENT3: 0.04,
    BBDC4: 0.04,
    ABEV3: 0.04,
    ELET3: 0.04,
    WEGE3: 0.04,
    PRIO3: 0.03,
    EMBR3: 0.02,
    JBSS3: 0.02,
    SOJA: 0.02,
    MILHO: 0.02,
    CAFÉ: 0.02,
    USD_BRL: 0.01,
    OURO: 0.01,
    CDI: 0.00
  } as Record<string, number>,
  BLACK_LITTERMAN: {
    BOVA11: 0.12,
    IVVB11: 0.15,
    PETR4: 0.12,
    VALE3: 0.05,
    ITUB4: 0.10,
    BBAS3: 0.08,
    RENT3: 0.04,
    BBDC4: 0.03,
    ABEV3: 0.03,
    ELET3: 0.05,
    WEGE3: 0.08,
    PRIO3: 0.04,
    EMBR3: 0.05,
    JBSS3: 0.02,
    SOJA: 0.01,
    MILHO: 0.01,
    CAFÉ: 0.01,
    USD_BRL: 0.01,
    OURO: 0.00,
    CDI: 0.00
  } as Record<string, number>,
  HRP_OPTIMIZED: {
    BOVA11: 0.08,
    IVVB11: 0.10,
    PETR4: 0.05,
    VALE3: 0.04,
    ITUB4: 0.08,
    BBAS3: 0.05,
    RENT3: 0.04,
    BBDC4: 0.05,
    ABEV3: 0.06,
    ELET3: 0.04,
    WEGE3: 0.07,
    PRIO3: 0.03,
    EMBR3: 0.03,
    JBSS3: 0.04,
    SOJA: 0.01,
    MILHO: 0.01,
    CAFÉ: 0.01,
    USD_BRL: 0.01,
    OURO: 0.00,
    CDI: 0.20 // 20% guardado em CDI para colchão de liquidez/risco estrutural
  } as Record<string, number>
};
