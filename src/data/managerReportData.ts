/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Master Data Repository: Relatório Institucional do Gestor (CVM 175 & ANBIMA)
 * Harpia Finance Asset Management - Fundo QuantLedger Multimercado FIM
 * Data Base: 13/08/2026 (Exercício Corrente de 2026 + Histórico 2024-2025 + Projeções 2026-2027)
 */

export interface FundIdentification {
  fundName: string;
  tradingCode: string;
  cnpj: string;
  anbimaCategory: string;
  cvmClassification: string;
  inceptionDate: string;
  referenceDate: string;
  benchmark: string;
  adminFiduciary: string;
  manager: string;
  custodian: string;
  auditor: string;
  currentNav: number; // R$ 171,698,335.00
  initialNav: number; // R$ 100,000,000.00
  currentQuota: number; // 1.716983
  initialQuota: number; // 1.000000
  managementFee: string;
  performanceFee: string;
  liquidity: string;
  minInvestment: string;
  targetAudience: string;
}

export const FUND_IDENTIFICATION: FundIdentification = {
  fundName: "Harpia QuantLedger Multimercado FIM CP",
  tradingCode: "HARP-QUANT-FIM",
  cnpj: "54.128.904/0001-82",
  anbimaCategory: "Multimercados Macro / Sistemático Quantitativo",
  cvmClassification: "Fundo de Investimento Multimercado - CVM 175 / Anexo Normativo I",
  inceptionDate: "02/01/2024",
  referenceDate: "13/08/2026",
  benchmark: "100% CDI (Taxa DI Over Cetip)",
  adminFiduciary: "BTG Pactual Serviços Financeiros DTVM S.A.",
  manager: "Harpia Finance Asset Management Ltda. (Gestão Quantitativa & IA)",
  custodian: "Banco B3 S.A. / B3 Clearinghouse",
  auditor: "PricewaterhouseCoopers (PwC) Auditores Independentes",
  currentNav: 171698335,
  initialNav: 100000000,
  currentQuota: 1.716983,
  initialQuota: 1.000000,
  managementFee: "1.80% a.a. (Projetada e provisionada diariamente)",
  performanceFee: "20.00% sobre o que exceder 100% do CDI (com linha d'água perpétua)",
  liquidity: "D+0 (Aplicação) | D+30 cotização / D+2 útil liquidação física e financeira",
  minInvestment: "R$ 10.000,00 (Investidores em Geral / Qualificados)",
  targetAudience: "Investidores Institucionais, Family Offices e Private Banking"
};

export interface MasterFundIndicator {
  metric: string;
  fundValue: string;
  benchmarkValue: string;
  excess: string;
  category: "PERFORMANCE" | "RISK" | "STATISTICS";
  description: string;
}

export const MASTER_FUND_INDICATORS: MasterFundIndicator[] = [
  { metric: "Rentabilidade 2026 (YTD)", fundValue: "+11.52%", benchmarkValue: "+5.48% (CDI)", excess: "+6.04% (+604 bps)", category: "PERFORMANCE", description: "Retorno acumulado no ano fiscal de 2026 até 13/08/2026." },
  { metric: "Rentabilidade 2025", fundValue: "+25.58%", benchmarkValue: "+11.30% (CDI)", excess: "+14.28% (+1.428 bps)", category: "PERFORMANCE", description: "Retorno fechado e auditado do exercício social de 2025." },
  { metric: "Rentabilidade 2024", fundValue: "+22.61%", benchmarkValue: "+10.65% (CDI)", excess: "+11.96% (+1.196 bps)", category: "PERFORMANCE", description: "Retorno fechado do primeiro exercício (2024)." },
  { metric: "Rentabilidade Acumulada (32 Meses)", fundValue: "+71.70%", benchmarkValue: "+30.73% (CDI)", excess: "+40.97% (+4.097 bps)", category: "PERFORMANCE", description: "Rentabilidade total desde o início da cotação base 100." },
  { metric: "Rentabilidade Anualizada", fundValue: "+22.84% a.a.", benchmarkValue: "+10.95% a.a.", excess: "+11.89% a.a.", category: "PERFORMANCE", description: "Taxa composta anualizada (CAGR) do portfólio." },
  { metric: "Índice Sharpe (12M)", fundValue: "1.82", benchmarkValue: "0.00 (Risk Free)", excess: "+1.82", category: "STATISTICS", description: "Retorno excedente ao CDI por unidade de volatilidade anualizada." },
  { metric: "Índice Sortino", fundValue: "2.34", benchmarkValue: "-", excess: "+2.34", category: "STATISTICS", description: "Sharpe penalizando exclusivamente a volatilidade negativa (Downside Risk)." },
  { metric: "Índice Calmar", fundValue: "2.28", benchmarkValue: "-", excess: "+2.28", category: "STATISTICS", description: "Retorno anualizado dividido pelo Máximo Drawdown histórico." },
  { metric: "Information Ratio (IR)", fundValue: "1.45", benchmarkValue: "-", excess: "+1.45", category: "STATISTICS", description: "Consistência de geração de alfa sobre o tracking error." },
  { metric: "Índice de Treynor", fundValue: "18.60%", benchmarkValue: "10.95%", excess: "+7.65%", category: "STATISTICS", description: "Retorno excedente por unidade de risco sistemático (Beta)." },
  { metric: "Beta vs Ibovespa", fundValue: "0.42", benchmarkValue: "1.00 (Ibov)", excess: "-0.58", category: "RISK", description: "Baixa correlação e sensibilidade moderada ao índice à vista." },
  { metric: "Volatilidade Anualizada (12M)", fundValue: "8.40% a.a.", benchmarkValue: "1.20% a.a.", excess: "+7.20%", category: "RISK", description: "Desvio padrão dos retornos diários anualizado." },
  { metric: "Máximo Drawdown Histórico", fundValue: "-4.85%", benchmarkValue: "-14.20% (Ibov)", excess: "+9.35% (Defesa)", category: "RISK", description: "Maior perda acumulada pico-ao-fundo ocorrida em Abril/2024." },
  { metric: "Tempo de Recuperação do Drawdown", fundValue: "28 dias", benchmarkValue: "142 dias (Ibov)", excess: "-114 dias", category: "RISK", description: "Velocidade de retorno ao High Watermark após choque de mercado." },
  { metric: "Value at Risk (VaR 95% - 1 Dia)", fundValue: "-0.92%", benchmarkValue: "-2.10% (Ibov)", excess: "+1.18% (Segurança)", category: "RISK", description: "Perda máxima esperada em 95% dos dias com modelagem paramétrica." },
  { metric: "Conditional VaR (CVaR 95% / Expected Shortfall)", fundValue: "-1.25%", benchmarkValue: "-3.45% (Ibov)", excess: "+2.20%", category: "RISK", description: "Perda média esperada nos 5% piores cenários de cauda." },
  { metric: "Meses Positivos / Total", fundValue: "31 / 32 (96.8%)", benchmarkValue: "32 / 32 (100% CDI)", excess: "Consistência", category: "STATISTICS", description: "Apenas 1 mês negativo em 32 meses de operação (Abril/24: -0.8%)." },
  { metric: "Índice de Liquidez Imediata (D+0)", fundValue: "15.20%", benchmarkValue: "10.00% (Mínimo)", excess: "+5.20%", category: "RISK", description: "Colchão de LFT / Operações Compromissadas para resgates." }
];

export interface MacroIndicatorRow {
  indicator: string;
  year2024: string;
  year2025: string;
  year2026Current: string;
  year2027Proj: string;
  macroImpact: string;
  fundStrategy: string;
}

export const MACRO_SCENARIO_DATA: MacroIndicatorRow[] = [
  {
    indicator: "Taxa Selic (Meta Copom)",
    year2024: "11.75% a.a.",
    year2025: "10.50% a.a.",
    year2026Current: "9.75% a.a.",
    year2027Proj: "9.00% a.a.",
    macroImpact: "Redução do custo de oportunidade da renda fixa, impulsionando alocação em ações de qualidade e títulos prefixados de prazo médio.",
    fundStrategy: "Aproveitamento do carrego em NTN-B 2030 (IPCA + 6.25%) e alocação estrutural em papéis cíclicos e de dividend yield robusto."
  },
  {
    indicator: "Inflação IPCA (Acumulado 12M)",
    year2024: "4.62%",
    year2025: "3.95%",
    year2026Current: "3.75%",
    year2027Proj: "3.50%",
    macroImpact: "Convergência da inflação em direção ao centro da meta do CMN, ancorando as expectativas de longo prazo e estabilizando curvas de juros.",
    fundStrategy: "Imunização patrimonial via ativos atrelados a inflação implícita e empresas com forte poder de repasse de preços."
  },
  {
    indicator: "Câmbio USD/BRL (Fechamento Médio)",
    year2024: "R$ 4.95",
    year2025: "R$ 5.20",
    year2026Current: "R$ 5.35",
    year2027Proj: "R$ 5.25",
    macroImpact: "Câmbio competitivo favorecendo receita de exportadoras de commodities (Petróleo, Minério, Agro) e manufatura avançada.",
    fundStrategy: "Exposição natural em PETR4, VALE3 e WEGE3 com hedge dinâmico em contratos futuros de Dólar (DOL) para neutralização de cauda."
  },
  {
    indicator: "Fed Funds Rate (EUA)",
    year2024: "5.50% a.a.",
    year2025: "4.75% a.a.",
    year2026Current: "4.25% a.a.",
    year2027Proj: "3.75% a.a.",
    macroImpact: "Ciclo de afrouxamento monetário do Federal Reserve atrai fluxo de capital estrangeiro para mercados emergentes da América Latina.",
    fundStrategy: "Posicionamento comprador em ativos de alta liquidez da B3 com fluxo institucional gringo crescente."
  },
  {
    indicator: "Petróleo Brent (US$ / Barril)",
    year2024: "US$ 82.50",
    year2025: "US$ 78.40",
    year2026Current: "US$ 81.20",
    year2027Proj: "US$ 76.00",
    macroImpact: "Estabilidade de oferta na OPEP+ e tensões geopolíticas no Oriente Médio sustentam preços médios acima do breakeven do pré-sal.",
    fundStrategy: "Alta convicção em PETR4 e PRIO3 devido ao custo de extração (lifting cost) ultracompetitivo (US$ 5.80 a US$ 8.20/bbl)."
  },
  {
    indicator: "Minério de Ferro 62% Fe (US$ / Ton)",
    year2024: "US$ 118.00",
    year2025: "US$ 102.50",
    year2026Current: "US$ 108.00",
    year2027Proj: "US$ 105.00",
    macroImpact: "Demanda resiliente por minério de alta pureza (Carajás) impulsionada pela descarbonização da siderurgia global e estímulos chineses.",
    fundStrategy: "Posição core em VALE3 focada em geração de fluxo de caixa livre (FCF yield > 11%) e retorno aos acionistas via recompras e dividendos."
  },
  {
    indicator: "PIB Brasil (Crescimento Anual)",
    year2024: "+2.90%",
    year2025: "+2.40%",
    year2026Current: "+2.60%",
    year2027Proj: "+2.30%",
    macroImpact: "Consumo das famílias sustentado pelo mercado de trabalho aquecido e safra agrícola recorde expandindo a renda disponível.",
    fundStrategy: "Sobreponderação em bancos comerciais (ITUB4, BBAS3) com baixa inadimplência e aceleração de crédito consignado e agro."
  }
];

export interface RiskLimitCompliance {
  parameter: string;
  regulatoryLimitCVM175: string;
  fundInternalLimit: string;
  currentExposure: string;
  status: "CONFORME" | "ALERTA" | "ESTOURADO";
  description: string;
}

export const RISK_LIMITS_COMPLIANCE: RiskLimitCompliance[] = [
  {
    parameter: "Concentração por Emissor Privado",
    regulatoryLimitCVM175: "Máx. 20.00% do PL",
    fundInternalLimit: "Máx. 15.00% do PL",
    currentExposure: "12.80% (Itaú Unibanco)",
    status: "CONFORME",
    description: "Cumpre com folga o limite CVM 175 para mitigar risco específico de crédito e emissão."
  },
  {
    parameter: "Alavancagem Bruta (Derivativos + À Vista)",
    regulatoryLimitCVM175: "Máx. 150.00% do PL",
    fundInternalLimit: "Máx. 125.00% do PL",
    currentExposure: "108.50% do PL",
    status: "CONFORME",
    description: "Operações com derivativos exclusivamente destinadas a hedge e calibração de volatilidade."
  },
  {
    parameter: "Exposição Cambial Líquida",
    regulatoryLimitCVM175: "Máx. 30.00% do PL",
    fundInternalLimit: "Máx. 15.00% do PL",
    currentExposure: "8.50% (Dólar Futuro DOL)",
    status: "CONFORME",
    description: "Hedge sistemático para proteção contra variações cambiais abruptas."
  },
  {
    parameter: "Liquidez Imediata (D+0 / D+1)",
    regulatoryLimitCVM175: "Mín. 5.00% do PL",
    fundInternalLimit: "Mín. 10.00% do PL",
    currentExposure: "15.20% (LFT / Caixa Selic)",
    status: "CONFORME",
    description: "Reserva suficiente para cobrir pedidos de resgate sem desinvestimento forçado de ativos."
  },
  {
    parameter: "Exposição a Títulos da Dívida Pública (TPF)",
    regulatoryLimitCVM175: "Até 100.00% do PL",
    fundInternalLimit: "Entre 10% e 40%",
    currentExposure: "24.50% (NTN-B 2030 e LFT)",
    status: "CONFORME",
    description: "Alocação soberana que confere proteção real e liquidez primária ao fundo."
  },
  {
    parameter: "Value at Risk (VaR 95% Paramétrico 21D)",
    regulatoryLimitCVM175: "Monitoramento Obrigatório",
    fundInternalLimit: "Máx. -5.00%",
    currentExposure: "-3.85%",
    status: "CONFORME",
    description: "Métrica de risco de cauda calculada com decaimento exponencial EWMA."
  }
];

export interface ExecutedTradeRecord {
  tradeId: string;
  date: string;
  ticker: string;
  assetName: string;
  orderType: "COMPRA" | "VENDA" | "HEDGE" | "REBALANCEAMENTO" | "ROLAGEM";
  quantity: number;
  price: number;
  totalVolume: number;
  brokerB3: string;
  slippageBps: number;
  pnlGenerated: string;
  rationale: string;
}

export const EXECUTED_TRADES_BOOK: ExecutedTradeRecord[] = [
  {
    tradeId: "TRD-2026-0811",
    date: "11/08/2026",
    ticker: "PETR4.SA",
    assetName: "Petrobras PN",
    orderType: "COMPRA",
    quantity: 120000,
    price: 39.40,
    totalVolume: 4728000,
    brokerB3: "BTG Pactual CTVM",
    slippageBps: 1.2,
    pnlGenerated: "+R$ 142.000 (+3.0%)",
    rationale: "Rebalanceamento do algoritmo HRP capturando anúncio de dividendo extraordinário de R$ 1,85/ação."
  },
  {
    tradeId: "TRD-2026-0805",
    date: "05/08/2026",
    ticker: "WEGE3.SA",
    assetName: "WEG S.A. ON",
    orderType: "COMPRA",
    quantity: 85000,
    price: 52.10,
    totalVolume: 4428500,
    brokerB3: "XP Investimentos CCTVM",
    slippageBps: 0.8,
    pnlGenerated: "+R$ 198.500 (+4.5%)",
    rationale: "Expansão de posição após vitória em leilão de infraestrutura eólica e baterias nos EUA."
  },
  {
    tradeId: "TRD-2026-0728",
    date: "28/07/2026",
    ticker: "ITUB4.SA",
    assetName: "Itaú Unibanco PN",
    orderType: "REBALANCEAMENTO",
    quantity: 110000,
    price: 35.80,
    totalVolume: 3938000,
    brokerB3: "Itaú Corretora de Valores",
    slippageBps: 0.5,
    pnlGenerated: "+R$ 88.000 (+2.2%)",
    rationale: "Ajuste fino de ponderação mantendo teto de concentração prudencial de 15%."
  },
  {
    tradeId: "TRD-2026-0715",
    date: "15/07/2026",
    ticker: "DOL_FUT",
    assetName: "Contrato Futuro Dólar B3",
    orderType: "HEDGE",
    quantity: 150,
    price: 5320.50,
    totalVolume: 7980750,
    brokerB3: "Santander CCTVM",
    slippageBps: 2.0,
    pnlGenerated: "+R$ 210.000 (Proteção)",
    rationale: "Rolagem de proteção cambial de cauda antes da reunião do FOMC nos Estados Unidos."
  },
  {
    tradeId: "TRD-2026-0620",
    date: "20/06/2026",
    ticker: "VALE3.SA",
    assetName: "Vale S.A. ON",
    orderType: "COMPRA",
    quantity: 90000,
    price: 63.50,
    totalVolume: 5715000,
    brokerB3: "Bradesco BBI CTVM",
    slippageBps: 1.5,
    pnlGenerated: "+R$ 261.000 (+4.6%)",
    rationale: "Entrada em nível de suporte após dados robustos de produção do 2T26 em Carajás."
  },
  {
    tradeId: "TRD-2026-0518",
    date: "18/05/2026",
    ticker: "EMBR3.SA",
    assetName: "Embraer ON",
    orderType: "COMPRA",
    quantity: 75000,
    price: 48.20,
    totalVolume: 3615000,
    brokerB3: "BTG Pactual CTVM",
    slippageBps: 1.1,
    pnlGenerated: "+R$ 412.500 (+11.4%)",
    rationale: "Aceleração de entregas comerciais E2 e novos contratos de defesa C-390 na Europa."
  },
  {
    tradeId: "TRD-2026-0410",
    date: "10/04/2026",
    ticker: "BBAS3.SA",
    assetName: "Banco do Brasil ON",
    orderType: "COMPRA",
    quantity: 130000,
    price: 28.90,
    totalVolume: 3757000,
    brokerB3: "BB Banco de Investimentos",
    slippageBps: 0.7,
    pnlGenerated: "+R$ 247.000 (+6.6%)",
    rationale: "Captura de valuation descontado (P/VP 0.78x) antes do anúncio do Plano Safra 2026/2027."
  },
  {
    tradeId: "TRD-2026-0302",
    date: "02/03/2026",
    ticker: "NTNB_2030",
    assetName: "Tesouro IPCA+ 2030",
    orderType: "COMPRA",
    quantity: 1200,
    price: 4450.00,
    totalVolume: 5340000,
    brokerB3: "BTG Pactual CTVM",
    slippageBps: 0.3,
    pnlGenerated: "+R$ 310.000 (+5.8%)",
    rationale: "Fixação de taxa real atraente de IPCA + 6.25% para imunização de passivo fiduciário."
  },
  {
    tradeId: "TRD-2025-1115",
    date: "15/11/2025",
    ticker: "PRIO3.SA",
    assetName: "PRIO ON",
    orderType: "COMPRA",
    quantity: 80000,
    price: 44.10,
    totalVolume: 3528000,
    brokerB3: "XP Investimentos CCTVM",
    slippageBps: 1.0,
    pnlGenerated: "+R$ 560.000 (+15.9%)",
    rationale: "Início do primeiro óleo no campo de Wahoo com redução drástica do lifting cost."
  },
  {
    tradeId: "TRD-2025-0820",
    date: "20/08/2025",
    ticker: "BBDC4.SA",
    assetName: "Bradesco PN",
    orderType: "COMPRA",
    quantity: 160000,
    price: 13.80,
    totalVolume: 2208000,
    brokerB3: "Ágora Investimentos",
    slippageBps: 0.9,
    pnlGenerated: "+R$ 288.000 (+13.0%)",
    rationale: "Tese de turnaround operacional com queda sequencial do custo de crédito e PDD."
  },
  {
    tradeId: "TRD-2024-0910",
    date: "10/09/2024",
    ticker: "PETR4.SA",
    assetName: "Petrobras PN",
    orderType: "COMPRA",
    quantity: 100000,
    price: 34.50,
    totalVolume: 3450000,
    brokerB3: "BTG Pactual CTVM",
    slippageBps: 1.4,
    pnlGenerated: "+R$ 490.000 (+14.2%)",
    rationale: "Alocação primária no fechamento do 3º trimestre com foco em dividendos."
  },
  {
    tradeId: "TRD-2024-0418",
    date: "18/04/2024",
    ticker: "IBOV_PUT",
    assetName: "Opção de Venda Ibovespa",
    orderType: "HEDGE",
    quantity: 250000,
    price: 1.85,
    totalVolume: 462500,
    brokerB3: "Itaú Corretora de Valores",
    slippageBps: 2.5,
    pnlGenerated: "+R$ 385.000 (+83.2%)",
    rationale: "Disparo automático do gatilho de proteção contra choque fiscal global, contendo o drawdown."
  }
];

export interface InvestmentThesisDetail {
  ticker: string;
  companyName: string;
  sector: string;
  weightInPortfolio: string;
  expectedAlphaBps: number;
  valuationMetrics: {
    pe: string; // P/L
    evEbitda: string;
    divYield: string;
    roe: string;
  };
  horizon2026Plus: string;
  coreThesisSummary: string;
  macroDrivers: string[];
  keyRisksAndHedges: string;
  blackLittermanScore: number;
}

export const INVESTMENT_THESES_DATA: InvestmentThesisDetail[] = [
  {
    ticker: "PETR4.SA",
    companyName: "Petróleo Brasileiro S.A. (Petrobras)",
    sector: "Petróleo, Gás e Biocombustíveis",
    weightInPortfolio: "14.50%",
    expectedAlphaBps: 380,
    valuationMetrics: {
      pe: "4.2x",
      evEbitda: "2.8x",
      divYield: "14.20% a.a.",
      roe: "26.50%"
    },
    horizon2026Plus: "2026 — 2028: Expansão de produção no pré-sal (Búzios e Mero) com geração maciça de FCF e dividendos resilientes.",
    coreThesisSummary: "A Petrobras mantém uma das estruturas de custos de extração mais baixas do planeta (lifting cost abaixo de US$ 6/barril no pré-sal). Mesmo sob flutuação do barril de petróleo, o yield de proventos projetado e o desconto em relação aos pares globais (Chevron e ExxonMobil) oferecem margem de segurança excepcional.",
    macroDrivers: [
      "Breakeven operacional do pré-sal em US$ 30/barril garante fluxo de caixa positivo em qualquer ciclo.",
      "Projetos FPSO de classe mundial entrando em operação comercial no horizonte 2026-2027.",
      "Política fiduciária de dividendos ordinários + extraordinários blindada por governança corporativa."
    ],
    keyRisksAndHedges: "Risco de intervenção em preços de combustíveis. Mitigado por hedge de cauda em derivativos e contratos de opções.",
    blackLittermanScore: 92
  },
  {
    ticker: "VALE3.SA",
    companyName: "Vale S.A.",
    sector: "Mineração & Materiais Básicos",
    weightInPortfolio: "13.20%",
    expectedAlphaBps: 220,
    valuationMetrics: {
      pe: "5.4x",
      evEbitda: "3.6x",
      divYield: "10.80% a.a.",
      roe: "22.10%"
    },
    horizon2026Plus: "2026 — 2028: Domínio no fornecimento de minério de ferro de alta pureza (65% Fe) para siderurgia de baixo carbono.",
    coreThesisSummary: "Líder global indiscutível em minério de alta qualidade. A transição energética das siderúrgicas mundiais exige teores elevados de ferro para fornos elétricos a arco, conferindo à Vale um prêmio estrutural sobre o preço spot internacional, além de funcionar como um hedge natural atrelado à divisa norte-americana.",
    macroDrivers: [
      "Prêmio de qualidade do produto de Carajás garante margens EBITDA superiores a 45%.",
      "Geração de caixa livre resiliente com programa ativo de recompra de ações que impulsiona o LPA.",
      "Receita 100% dolarizada que protege o patrimônio do fundo em cenários de estresse cambial local."
    ],
    keyRisksAndHedges: "Desaceleração da atividade imobiliária na Ásia. Mitigada pela flexibilidade de alocação de pelotas e briófitas.",
    blackLittermanScore: 84
  },
  {
    ticker: "ITUB4.SA",
    companyName: "Itaú Unibanco Holding S.A.",
    sector: "Serviços Financeiros / Bancos Múltiplos",
    weightInPortfolio: "14.80%",
    expectedAlphaBps: 412,
    valuationMetrics: {
      pe: "7.8x",
      evEbitda: "N/A",
      divYield: "8.60% a.a.",
      roe: "22.80%"
    },
    horizon2026Plus: "2026 — 2028: Líder absoluto em rentabilidade bancária no hemisfério sul, acelerando ganhos de produtividade com IA.",
    coreThesisSummary: "O Itaú Unibanco apresenta a melhor gestão de risco de crédito do mercado brasileiro. Com a Selic em patamar moderado, o spread bancário líquido (NIM) expande com inadimplência decrescente, enquanto a digitalização reduz continuamente o índice de eficiência operacional para patamares recordes.",
    macroDrivers: [
      "Inadimplência de curto e longo prazo (NPL > 90d) mantida em mínimos históricos de 2.4%.",
      "Forte presença no segmento Corporate e Wealth Management com receitas de serviços crescentes.",
      "Distribuição contínua de Juros sobre Capital Próprio (JCP) e dividendos complementares."
    ],
    keyRisksAndHedges: "Aumento de tributação bancária ou concorrência fintech. Mitigado por carteira diversificada e escala tecnológica.",
    blackLittermanScore: 95
  },
  {
    ticker: "WEGE3.SA",
    companyName: "WEG S.A.",
    sector: "Bens de Capital & Equipamentos Elétricos",
    weightInPortfolio: "12.50%",
    expectedAlphaBps: 340,
    valuationMetrics: {
      pe: "26.5x",
      evEbitda: "18.2x",
      divYield: "3.20% a.a.",
      roe: "31.40%"
    },
    horizon2026Plus: "2026 — 2028: Captura da eletrificação global, datacenters de IA, mobilidade elétrica e energia renovável nos EUA/Europa.",
    coreThesisSummary: "Empresa de classe mundial com histórico de crescimento composto de lucro (CAGR 18.5% ao longo das últimas décadas). O pipeline de pedidos para transformadores industriais, baterias de armazenamento e motores de alta eficiência segue com visibilidade de receitas até 2028.",
    macroDrivers: [
      "Expansão internacional nos Estados Unidos, México e Europa atendendo à infraestrutura de redes elétricas.",
      "Demanda explosiva por sistemas elétricos para infraestrutura de computação de Inteligência Artificial.",
      "Retorno sobre capital investido (ROIC) superior a 30% há mais de 10 anos consecutivos."
    ],
    keyRisksAndHedges: "Múltiplos de valuation relativamente elevados. Mitigado pela consistência inabalável de entrega de resultados.",
    blackLittermanScore: 91
  },
  {
    ticker: "PRIO3.SA",
    companyName: "PRIO S.A. (PetroRio)",
    sector: "Petróleo Júnior & E&P Offshore",
    weightInPortfolio: "8.40%",
    expectedAlphaBps: 450,
    valuationMetrics: {
      pe: "6.1x",
      evEbitda: "3.2x",
      divYield: "6.50% a.a.",
      roe: "28.90%"
    },
    horizon2026Plus: "2026 — 2028: Ramp-up pleno de Wahoo e Albacora Leste elevando a produção diária para mais de 135 mil barris.",
    coreThesisSummary: "A melhor operadora independente de campos maduros do Brasil. Capacidade comprovada de revitalizar reservatórios reduzindo o custo unitário de extração (lifting cost para US$ 7.50/bbl). A desalavancagem rápida abre espaço para dividendos extraordinários e novas fusões e aquisições.",
    macroDrivers: [
      "Crescimento orgânico de produção com conexão submarina (tie-back) de alta rentabilidade.",
      "Geração de caixa livre projetada superior a 18% do valor de mercado para 2026/2027.",
      "Equipe de engenharia e gestão de excelência focada em alocação estrita de capital."
    ],
    keyRisksAndHedges: "Atrasos em licenciamentos ambientais do Ibama. Mitigado pela maturidade dos ativos já em operação.",
    blackLittermanScore: 88
  },
  {
    ticker: "EMBR3.SA",
    companyName: "Embraer S.A.",
    sector: "Aeroespacial & Defesa",
    weightInPortfolio: "7.90%",
    expectedAlphaBps: 390,
    valuationMetrics: {
      pe: "14.2x",
      evEbitda: "7.5x",
      divYield: "2.80% a.a.",
      roe: "16.40%"
    },
    horizon2026Plus: "2026 — 2028: Ciclo recorde de entregas comerciais E-Jets E2, expansão do C-390 na OTAN e monetização da Eve Air Mobility.",
    coreThesisSummary: "A Embraer vive o seu momento operacional mais virtuoso da história. A carteira de pedidos firmes (Backlog) ultrapassa US$ 21 bilhões. O cargueiro militar C-390 Millennium consolidou-se como substituto padrão do Hércules C-130 na OTAN (compras por Portugal, Holanda, Áustria, Suécia e Coreia do Sul).",
    macroDrivers: [
      "Aumento dos orçamentos globais de defesa favorece vendas militares de alta margem.",
      "Falta de aeronaves comerciais no mercado global (problemas em Boeing e Airbus) acelera vendas do E195-E2.",
      "Liderança pioneira em certificação de aeronaves elétricas urbanas (eVTOL Eve)."
    ],
    keyRisksAndHedges: "Gargalos nas cadeias de suprimento de turbinas aeronáuticas. Mitigado por parcerias de longo prazo com a Pratt & Whitney.",
    blackLittermanScore: 90
  },
  {
    ticker: "BBAS3.SA",
    companyName: "Banco do Brasil S.A.",
    sector: "Serviços Financeiros / Bancos",
    weightInPortfolio: "9.20%",
    expectedAlphaBps: 325,
    valuationMetrics: {
      pe: "4.1x",
      evEbitda: "N/A",
      divYield: "10.40% a.a.",
      roe: "21.50%"
    },
    horizon2026Plus: "2026 — 2028: Protagonismo no agronegócio nacional com a maior carteira rural do país e múltiplos em patamares atrativos.",
    coreThesisSummary: "O Banco do Brasil alia escala descomunal com o menor custo de captação do sistema bancário (funding via poupança e depósitos à vista). O agronegócio brasileiro segue como locomotiva de exportação, mantendo a inadimplência do setor em níveis historicamente baixos.",
    macroDrivers: [
      "Plano Safra recorde canalizando recursos para custeio e investimentos agrícolas de alta rentabilidade.",
      "Preço sobre Valor Patrimonial (P/VP) de apenas 0.78x oferece expressivo desconto patrimonial.",
      "Payout garantido de 45% a 50% distribuído trimestralmente."
    ],
    keyRisksAndHedges: "Risco de interferência governamental em linhas subsidiadas. Mitigado por governança do estatuto e conselho independente.",
    blackLittermanScore: 86
  },
  {
    ticker: "NTNB_2030",
    companyName: "Tesouro IPCA+ com Juros Semestrais 2030 (NTN-B)",
    sector: "Títulos Públicos Federais / Renda Fixa Soberana",
    weightInPortfolio: "12.50%",
    expectedAlphaBps: 180,
    valuationMetrics: {
      pe: "N/A",
      evEbitda: "N/A",
      divYield: "IPCA + 6.25% a.a.",
      roe: "Taxa Real Garantida"
    },
    horizon2026Plus: "2026 — 2030: Âncora de convexidade, garantindo proteção contra surpresas inflacionárias e fechamento da curva de juros.",
    coreThesisSummary: "Alocação soberana que trava uma taxa de juros real excepcionalmente alta (IPCA + 6.25% ao ano). Além de remunerar o capital com risco de crédito soberano zero, proporciona ganho adicional de marcação a mercado à medida que o ciclo de cortes de juros se consolida.",
    macroDrivers: [
      "Blindagem absoluta do poder de compra do patrimônio contra qualquer repique inflacionário.",
      "Garantia fiduciária de liquidez imediata para atendimento de resgates de cotistas.",
      "Convexidade assimétrica: ganho expressivo de capital em caso de fechamento da taxa de juros futura."
    ],
    keyRisksAndHedges: "Volatilidade pontual de marcação a mercado em caso de ruído fiscal. Carregamento até o vencimento neutraliza perdas.",
    blackLittermanScore: 94
  },
  {
    ticker: "HEDGE_DOL_OURO",
    companyName: "Estratégia Sintética de Proteção (Dólar Futuro & Ouro B3)",
    sector: "Hedge Cambial & Metais Preciosos",
    weightInPortfolio: "7.00%",
    expectedAlphaBps: 150,
    valuationMetrics: {
      pe: "N/A",
      evEbitda: "N/A",
      divYield: "N/A",
      roe: "Seguro de Portfólio"
    },
    horizon2026Plus: "2026 — 2028: Posição sistemática de seguro contra choques geopolíticos internacionais e eventos de cauda na B3.",
    coreThesisSummary: "Instrumento tático de mitigação de risco administrado por algoritmos quânticos. Permite que o fundo mantenha posições long em ações de alto beta sem violar os limites estritos de volatilidade e Drawdown exigidos pelo regulamento fiduciário.",
    macroDrivers: [
      "Correlação negativa em momentos de pânico e aversão global a risco (Flight to Safety).",
      "Proteção de liquidez que permite ao gestor comprar ativos descontados no ápice do estresse.",
      "Custo de carregamento otimizado via operações estruturadas de opções."
    ],
    keyRisksAndHedges: "Custo de oportunidade em cenários de rali generalizado. Rebalanceado diariamente para evitar erosão de alfa.",
    blackLittermanScore: 89
  }
];

export interface FullHistoricalMasterRow {
  period: string;
  fundNavBrl: number;
  fundReturnPct: number;
  cdiReturnPct: number;
  ibovReturnPct: number;
  ipcaPct: number;
  alphaCdiBps: number;
  quotaValue: number;
  status: "FECHADO_AUDITADO" | "EM_ANDAMENTO" | "PROJETADO";
}

export const FULL_HISTORICAL_MASTER_DATA: FullHistoricalMasterRow[] = [
  // 2024
  { period: "2024-01", fundNavBrl: 102100000, fundReturnPct: 2.10, cdiReturnPct: 0.97, ibovReturnPct: -4.79, ipcaPct: 0.42, alphaCdiBps: 113, quotaValue: 1.021000, status: "FECHADO_AUDITADO" },
  { period: "2024-02", fundNavBrl: 103937800, fundReturnPct: 1.80, cdiReturnPct: 0.89, ibovReturnPct: 0.99, ipcaPct: 0.83, alphaCdiBps: 91, quotaValue: 1.039378, status: "FECHADO_AUDITADO" },
  { period: "2024-03", fundNavBrl: 105496867, fundReturnPct: 1.50, cdiReturnPct: 0.91, ibovReturnPct: -0.71, ipcaPct: 0.16, alphaCdiBps: 59, quotaValue: 1.054969, status: "FECHADO_AUDITADO" },
  { period: "2024-04", fundNavBrl: 104652892, fundReturnPct: -0.80, cdiReturnPct: 0.88, ibovReturnPct: -1.70, ipcaPct: 0.38, alphaCdiBps: -168, quotaValue: 1.046529, status: "FECHADO_AUDITADO" },
  { period: "2024-05", fundNavBrl: 107164561, fundReturnPct: 2.40, cdiReturnPct: 0.89, ibovReturnPct: -3.05, ipcaPct: 0.46, alphaCdiBps: 151, quotaValue: 1.071646, status: "FECHADO_AUDITADO" },
  { period: "2024-06", fundNavBrl: 109200687, fundReturnPct: 1.90, cdiReturnPct: 0.87, ibovReturnPct: 1.48, ipcaPct: 0.21, alphaCdiBps: 103, quotaValue: 1.092007, status: "FECHADO_AUDITADO" },
  { period: "2024-07", fundNavBrl: 111603102, fundReturnPct: 2.20, cdiReturnPct: 0.91, ibovReturnPct: 3.02, ipcaPct: 0.38, alphaCdiBps: 129, quotaValue: 1.116031, status: "FECHADO_AUDITADO" },
  { period: "2024-08", fundNavBrl: 113165545, fundReturnPct: 1.40, cdiReturnPct: 0.88, ibovReturnPct: 6.54, ipcaPct: -0.02, alphaCdiBps: 52, quotaValue: 1.131655, status: "FECHADO_AUDITADO" },
  { period: "2024-09", fundNavBrl: 116107849, fundReturnPct: 2.60, cdiReturnPct: 0.89, ibovReturnPct: -3.08, ipcaPct: 0.44, alphaCdiBps: 171, quotaValue: 1.161078, status: "FECHADO_AUDITADO" },
  { period: "2024-10", fundNavBrl: 117501143, fundReturnPct: 1.20, cdiReturnPct: 0.90, ibovReturnPct: -1.60, ipcaPct: 0.56, alphaCdiBps: 30, quotaValue: 1.175011, status: "FECHADO_AUDITADO" },
  { period: "2024-11", fundNavBrl: 119851165, fundReturnPct: 2.00, cdiReturnPct: 0.89, ibovReturnPct: -0.80, ipcaPct: 0.36, alphaCdiBps: 111, quotaValue: 1.198512, status: "FECHADO_AUDITADO" },
  { period: "2024-12", fundNavBrl: 122607741, fundReturnPct: 2.30, cdiReturnPct: 0.92, ibovReturnPct: -0.50, ipcaPct: 0.40, alphaCdiBps: 138, quotaValue: 1.226077, status: "FECHADO_AUDITADO" },
  
  // 2025
  { period: "2025-01", fundNavBrl: 124937288, fundReturnPct: 1.90, cdiReturnPct: 0.91, ibovReturnPct: 2.10, ipcaPct: 0.35, alphaCdiBps: 99, quotaValue: 1.249373, status: "FECHADO_AUDITADO" },
  { period: "2025-02", fundNavBrl: 126811347, fundReturnPct: 1.50, cdiReturnPct: 0.88, ibovReturnPct: -0.40, ipcaPct: 0.42, alphaCdiBps: 62, quotaValue: 1.268113, status: "FECHADO_AUDITADO" },
  { period: "2025-03", fundNavBrl: 129474385, fundReturnPct: 2.10, cdiReturnPct: 0.90, ibovReturnPct: 1.80, ipcaPct: 0.28, alphaCdiBps: 120, quotaValue: 1.294744, status: "FECHADO_AUDITADO" },
  { period: "2025-04", fundNavBrl: 131675449, fundReturnPct: 1.70, cdiReturnPct: 0.89, ibovReturnPct: 0.90, ipcaPct: 0.31, alphaCdiBps: 81, quotaValue: 1.316754, status: "FECHADO_AUDITADO" },
  { period: "2025-05", fundNavBrl: 134967335, fundReturnPct: 2.50, cdiReturnPct: 0.91, ibovReturnPct: 3.20, ipcaPct: 0.25, alphaCdiBps: 159, quotaValue: 1.349673, status: "FECHADO_AUDITADO" },
  { period: "2025-06", fundNavBrl: 137396747, fundReturnPct: 1.80, cdiReturnPct: 0.88, ibovReturnPct: 1.10, ipcaPct: 0.18, alphaCdiBps: 92, quotaValue: 1.373967, status: "FECHADO_AUDITADO" },
  { period: "2025-07", fundNavBrl: 140144681, fundReturnPct: 2.00, cdiReturnPct: 0.90, ibovReturnPct: 2.40, ipcaPct: 0.30, alphaCdiBps: 110, quotaValue: 1.401447, status: "FECHADO_AUDITADO" },
  { period: "2025-08", fundNavBrl: 142386995, fundReturnPct: 1.60, cdiReturnPct: 0.89, ibovReturnPct: 0.60, ipcaPct: 0.22, alphaCdiBps: 71, quotaValue: 1.423870, status: "FECHADO_AUDITADO" },
  { period: "2025-09", fundNavBrl: 145519508, fundReturnPct: 2.20, cdiReturnPct: 0.91, ibovReturnPct: 1.90, ipcaPct: 0.34, alphaCdiBps: 129, quotaValue: 1.455195, status: "FECHADO_AUDITADO" },
  { period: "2025-10", fundNavBrl: 147556781, fundReturnPct: 1.40, cdiReturnPct: 0.88, ibovReturnPct: -0.20, ipcaPct: 0.40, alphaCdiBps: 52, quotaValue: 1.475568, status: "FECHADO_AUDITADO" },
  { period: "2025-11", fundNavBrl: 150360359, fundReturnPct: 1.90, cdiReturnPct: 0.89, ibovReturnPct: 1.50, ipcaPct: 0.33, alphaCdiBps: 101, quotaValue: 1.503604, status: "FECHADO_AUDITADO" },
  { period: "2025-12", fundNavBrl: 153969007, fundReturnPct: 2.40, cdiReturnPct: 0.92, ibovReturnPct: 2.80, ipcaPct: 0.39, alphaCdiBps: 148, quotaValue: 1.539690, status: "FECHADO_AUDITADO" },

  // 2026 (Ano Corrente)
  { period: "2026-01", fundNavBrl: 156740449, fundReturnPct: 1.80, cdiReturnPct: 0.90, ibovReturnPct: 1.20, ipcaPct: 0.32, alphaCdiBps: 90, quotaValue: 1.567404, status: "FECHADO_AUDITADO" },
  { period: "2026-02", fundNavBrl: 159091555, fundReturnPct: 1.50, cdiReturnPct: 0.88, ibovReturnPct: 0.80, ipcaPct: 0.38, alphaCdiBps: 62, quotaValue: 1.590916, status: "FECHADO_AUDITADO" },
  { period: "2026-03", fundNavBrl: 162273386, fundReturnPct: 2.00, cdiReturnPct: 0.91, ibovReturnPct: 2.50, ipcaPct: 0.29, alphaCdiBps: 109, quotaValue: 1.622734, status: "FECHADO_AUDITADO" },
  { period: "2026-04", fundNavBrl: 164869760, fundReturnPct: 1.60, cdiReturnPct: 0.89, ibovReturnPct: 0.40, ipcaPct: 0.30, alphaCdiBps: 71, quotaValue: 1.648698, status: "FECHADO_AUDITADO" },
  { period: "2026-05", fundNavBrl: 168496894, fundReturnPct: 2.20, cdiReturnPct: 0.90, ibovReturnPct: 2.90, ipcaPct: 0.26, alphaCdiBps: 130, quotaValue: 1.684969, status: "FECHADO_AUDITADO" },
  { period: "2026-06", fundNavBrl: 171698335, fundReturnPct: 1.90, cdiReturnPct: 0.88, ibovReturnPct: 1.60, ipcaPct: 0.22, alphaCdiBps: 102, quotaValue: 1.716983, status: "FECHADO_AUDITADO" },
  { period: "2026-07", fundNavBrl: 174617206, fundReturnPct: 1.70, cdiReturnPct: 0.89, ibovReturnPct: 1.40, ipcaPct: 0.25, alphaCdiBps: 81, quotaValue: 1.746172, status: "EM_ANDAMENTO" },
  { period: "2026-08", fundNavBrl: 177760315, fundReturnPct: 1.80, cdiReturnPct: 0.90, ibovReturnPct: 1.50, ipcaPct: 0.24, alphaCdiBps: 90, quotaValue: 1.777603, status: "EM_ANDAMENTO" },
  
  // Projeções 2026 Fim de Ano & 2027
  { period: "2026-09 (Proj)", fundNavBrl: 181315521, fundReturnPct: 2.00, cdiReturnPct: 0.89, ibovReturnPct: 1.80, ipcaPct: 0.28, alphaCdiBps: 111, quotaValue: 1.813155, status: "PROJETADO" },
  { period: "2026-10 (Proj)", fundNavBrl: 184035253, fundReturnPct: 1.50, cdiReturnPct: 0.88, ibovReturnPct: 0.90, ipcaPct: 0.32, alphaCdiBps: 62, quotaValue: 1.840353, status: "PROJETADO" },
  { period: "2026-11 (Proj)", fundNavBrl: 187531922, fundReturnPct: 1.90, cdiReturnPct: 0.89, ibovReturnPct: 1.60, ipcaPct: 0.30, alphaCdiBps: 101, quotaValue: 1.875319, status: "PROJETADO" },
  { period: "2026-12 (Proj)", fundNavBrl: 191657624, fundReturnPct: 2.20, cdiReturnPct: 0.91, ibovReturnPct: 2.10, ipcaPct: 0.35, alphaCdiBps: 129, quotaValue: 1.916576, status: "PROJETADO" },
  { period: "2027-1S (Proj)", fundNavBrl: 206990234, fundReturnPct: 8.00, cdiReturnPct: 4.80, ibovReturnPct: 7.20, ipcaPct: 1.75, alphaCdiBps: 320, quotaValue: 2.069902, status: "PROJETADO" },
  { period: "2027-2S (Proj)", fundNavBrl: 224584403, fundReturnPct: 8.50, cdiReturnPct: 4.70, ibovReturnPct: 7.80, ipcaPct: 1.65, alphaCdiBps: 380, quotaValue: 2.245844, status: "PROJETADO" }
];
