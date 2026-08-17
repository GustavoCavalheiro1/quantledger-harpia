/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MonthAssetContribution {
  ticker: string;
  name: string;
  sector: string;
  weight: number; // in %
  assetReturn: number; // in %
  contributionBps: number; // in bps (+45 bps = +0.45%)
  positionType: "LONG" | "SHORT" | "HEDGE" | "FIXED_INCOME";
  rationale: string;
}

export interface DetailedMonthData {
  month: string; // e.g. "2024-01"
  monthName: string; // e.g. "Janeiro / 2024"
  year: number;
  status: "FECHADO_AUDITADO" | "FECHADO" | "PROJETADO";
  marketRegime: "BULL_LOW_VOL" | "COMMODITY_RALLY" | "HIGH_VOL_STRESS" | "SIDEWAYS" | "SELIC_PIVOT";
  
  // Performance
  fundReturn: number; // 0.021 = 2.10%
  benchReturn: number; // Ibovespa
  cdiReturn: number; // CDI
  cdiPercentage: number; // e.g. 216 (% of CDI)
  alphaBps: number; // e.g. 113 bps (+1.13%)
  
  // NAV & Quotes
  startNav: number;
  endNav: number;
  startQuote: number;
  endQuote: number;
  netInflow: number;
  subscriptions: number;
  redemptions: number;
  
  // Risk Metrics
  annualizedVol: number; // in %
  sharpeRatio: number;
  sortinoRatio: number;
  var95_1d: number; // in %
  maxDrawdownMonth: number; // in %
  betaIbov: number;
  liquidityRatioD1: number; // in %
  
  // Weekly Breakdown
  weeks: {
    week: string; // "Semana 1 (01/01 a 07/01)"
    focus: string;
    description: string;
    tacticalAction: string;
  }[];
  
  // Top Asset Contributions
  assetContributions: MonthAssetContribution[];
  
  // Sector Breakdown
  sectorAllocation: {
    sector: string;
    weight: number;
    contribution: number;
  }[];
  
  // Risk Committee & Audit Opinion
  riskParecer: string;
  complianceAuditor: string;
  complianceStatus: "ENQUADRADO_100%" | "ALERTA_PREVENTIVO" | "REBALANCEADO";
  auditHash: string;
}

export const DETAILED_MONTHLY_RECORDS: DetailedMonthData[] = [
  // ── 2024 ─────────────────────────────────────────────────────────────
  {
    month: "2024-01",
    monthName: "Janeiro / 2024",
    year: 2024,
    status: "FECHADO_AUDITADO",
    marketRegime: "BULL_LOW_VOL",
    fundReturn: 0.0210,
    benchReturn: 0.0080,
    cdiReturn: 0.0097,
    cdiPercentage: 216.5,
    alphaBps: 113,
    startNav: 100000000,
    endNav: 102100000,
    startQuote: 1.000000,
    endQuote: 1.021000,
    netInflow: 3500000,
    subscriptions: 4800000,
    redemptions: 1300000,
    annualizedVol: 8.4,
    sharpeRatio: 1.85,
    sortinoRatio: 2.30,
    var95_1d: 0.62,
    maxDrawdownMonth: -0.45,
    betaIbov: 0.52,
    liquidityRatioD1: 22.5,
    weeks: [
      {
        week: "Semana 1 (02 a 05/01)",
        focus: "Posicionamento Estratégico de Início de Exercício",
        description: "Alocação do capital inicial seguindo o modelo Black-Litterman com sobreponderação em PETR4 e VALE3.",
        tacticalAction: "Montagem de posições Long em exportadoras e Renda Fixa NTN-B."
      },
      {
        week: "Semana 2 (08 a 12/01)",
        focus: "Captura de Prêmio de Juros e Títulos Públicos",
        description: "Ajuste na curva DI de médio prazo e compra de NTN-B IPCA+ 5.80% para garantir colchão defensivo.",
        tacticalAction: "Alocação de 25% do PL em títulos soberanos atrelados ao IPCA."
      },
      {
        week: "Semana 3 (15 a 19/01)",
        focus: "Hedge Cambial e Proteção Geopolítica",
        description: "Monitoramento de volatilidade no Golfo de Áden com trava em opções de Dólar (DOL) e Ouro.",
        tacticalAction: "Ativação de 3.5% de hedge tático em contratos futuros de Dólar."
      },
      {
        week: "Semana 4 (22 a 31/01)",
        focus: "Fechamento Positivo e Consolidação de NAV",
        description: "Rali no setor bancário impulsiona ITUB4. Rebalanceamento automatizado HRP sem fricção de liquidez.",
        tacticalAction: "Execução algorítmica de encerramento de posições de curto prazo com ganho realizado."
      }
    ],
    assetContributions: [
      { ticker: "PETR4", name: "Petróleo Brasileiro S.A.", sector: "Energia", weight: 14.5, assetReturn: 5.8, contributionBps: 84, positionType: "LONG", rationale: "Forte geração de FCF e expectativas de dividendos extraordinários." },
      { ticker: "WEGE3", name: "WEG S.A.", sector: "Bens Industriais", weight: 12.0, assetReturn: 4.2, contributionBps: 50, positionType: "LONG", rationale: "Expansão da carteira de pedidos no exterior e motores elétricos." },
      { ticker: "ITUB4", name: "Itaú Unibanco Holding", sector: "Financeiro", weight: 11.5, assetReturn: 3.5, contributionBps: 40, positionType: "LONG", rationale: "Inadimplência sob controle e robustez na carteira de grandes empresas." },
      { ticker: "NTN-B", name: "Tesouro IPCA+ 2029", sector: "Renda Fixa Soberana", weight: 25.0, assetReturn: 1.1, contributionBps: 27, positionType: "FIXED_INCOME", rationale: "Carregamento de taxa real favorável e amortecimento de volatilidade." },
      { ticker: "VALE3", name: "Vale S.A.", sector: "Materiais Básicos", weight: 10.0, assetReturn: -1.2, contributionBps: -12, positionType: "LONG", rationale: "Leve recuo no preço spot do minério de ferro em Qingdao." },
      { ticker: "OURO", name: "Ouro Futuro (OZ1D)", sector: "Hedge Geopolítico", weight: 4.0, assetReturn: 2.8, contributionBps: 11, positionType: "HEDGE", rationale: "Proteção contra tensões no Oriente Médio." },
      { ticker: "BBAS3", name: "Banco do Brasil S.A.", sector: "Financeiro", weight: 8.0, assetReturn: 3.1, contributionBps: 25, positionType: "LONG", rationale: "Desempenho robusto da carteira agro e múltiplos comprimidos." }
    ],
    sectorAllocation: [
      { sector: "Renda Fixa / Caixa", weight: 28.0, contribution: 0.32 },
      { sector: "Energia & Petróleo", weight: 18.5, contribution: 0.95 },
      { sector: "Financeiro / Bancos", weight: 19.5, contribution: 0.65 },
      { sector: "Bens Industriais", weight: 15.0, contribution: 0.58 },
      { sector: "Materiais Básicos", weight: 10.0, contribution: -0.12 },
      { sector: "Hedge Cambial / Ouro", weight: 9.0, contribution: 0.18 }
    ],
    riskParecer: "Alocação do primeiro mês do ano em estrita conformidade com a Resolução CVM 175. Nível de volatilidade anualizada realizada de 8.4%, confortavelmente abaixo do teto de 12.0% a.a. Sem qualquer evento de desenquadramento passivo ou ativo.",
    complianceAuditor: "Comitê Fiduciário Harpia Finance / D. Carvalho (CFA)",
    complianceStatus: "ENQUADRADO_100%",
    auditHash: "SHA256-HP2401-987A1E65F"
  },
  {
    month: "2024-02",
    monthName: "Fevereiro / 2024",
    year: 2024,
    status: "FECHADO_AUDITADO",
    marketRegime: "BULL_LOW_VOL",
    fundReturn: 0.0180,
    benchReturn: -0.0050,
    cdiReturn: 0.0089,
    cdiPercentage: 202.2,
    alphaBps: 91,
    startNav: 102100000,
    endNav: 103937800,
    startQuote: 1.021000,
    endQuote: 1.039378,
    netInflow: 2800000,
    subscriptions: 3500000,
    redemptions: 700000,
    annualizedVol: 7.9,
    sharpeRatio: 1.92,
    sortinoRatio: 2.45,
    var95_1d: 0.58,
    maxDrawdownMonth: -0.38,
    betaIbov: 0.48,
    liquidityRatioD1: 24.0,
    weeks: [
      {
        week: "Semana 1 (01 a 07/02)",
        focus: "Expansão em Bens Industriais e Tecnologia",
        description: "Aumento de alocação em WEGE3 e EMBR3 após divulgação de resultados preliminares favoráveis.",
        tacticalAction: "Subida do peso em WEGE3 para 13.5% do portfólio."
      },
      {
        week: "Semana 2 (08 a 16/02)",
        focus: "Período de Carnaval e Redução Preventiva de Beta",
        description: "Ajuste na carteira para reduzir exposição direcional durante o fechamento estendido da B3.",
        tacticalAction: "Alocação adicional em compromissadas DI remuneradas a 100.5% do CDI."
      },
      {
        week: "Semana 3 (19 a 23/02)",
        focus: "Safra de Balanços 4T23",
        description: "Resultados sólidos do setor bancário confirmam tese de expansão do ROE de ITUB4.",
        tacticalAction: "Captura de dividendos e reaplicação no modelo quantitativo."
      },
      {
        week: "Semana 4 (26 a 29/02)",
        focus: "Descolamento Positivo do Benchmark",
        description: "Fundo encerra o mês com +1.80% enquanto o Ibovespa recua -0.50%, gerando 230 bps de alfa vs bolsa.",
        tacticalAction: "Rebalanceamento do peso tático de commodities."
      }
    ],
    assetContributions: [
      { ticker: "WEGE3", name: "WEG S.A.", sector: "Bens Industriais", weight: 13.5, assetReturn: 6.4, contributionBps: 86, positionType: "LONG", rationale: "Resultados trimestrais acima do consenso de mercado com margens recordes." },
      { ticker: "EMBR3", name: "Embraer S.A.", sector: "Bens Industriais", weight: 8.0, assetReturn: 7.2, contributionBps: 58, positionType: "LONG", rationale: "Anúncio de novos contratos para aeronaves comerciais e cargueiros militares." },
      { ticker: "ITUB4", name: "Itaú Unibanco Holding", sector: "Financeiro", weight: 11.0, assetReturn: 2.8, contributionBps: 31, positionType: "LONG", rationale: "Crescimento contínuo da margem financeira com clientes." },
      { ticker: "PETR4", name: "Petróleo Brasileiro S.A.", sector: "Energia", weight: 13.0, assetReturn: 1.5, contributionBps: 20, positionType: "LONG", rationale: "Preço do Brent sustentado acima de US$ 80/barril." },
      { ticker: "CDI/Caixa", name: "Operações Compromissadas", sector: "Renda Fixa", weight: 26.0, assetReturn: 0.89, contributionBps: 23, positionType: "FIXED_INCOME", rationale: "Remuneração estável da liquidez de curto prazo." }
    ],
    sectorAllocation: [
      { sector: "Bens Industriais", weight: 21.5, contribution: 1.44 },
      { sector: "Financeiro / Bancos", weight: 18.0, contribution: 0.48 },
      { sector: "Renda Fixa / Caixa", weight: 26.0, contribution: 0.23 },
      { sector: "Energia & Petróleo", weight: 15.5, contribution: 0.35 },
      { sector: "Agronegócio / Commodities", weight: 12.0, contribution: 0.12 },
      { sector: "Hedge / Ouro", weight: 7.0, contribution: -0.05 }
    ],
    riskParecer: "Excelente comportamento do modelo HRP na proteção de capital durante a queda do Ibovespa. Índice Sharpe mensal atinge 1.92. Parâmetros de risco calibrados com sucesso.",
    complianceAuditor: "Comitê Fiduciário Harpia Finance / M. Siqueira",
    complianceStatus: "ENQUADRADO_100%",
    auditHash: "SHA256-HP2402-45A9B810C"
  },
  {
    month: "2024-03",
    monthName: "Março / 2024",
    year: 2024,
    status: "FECHADO_AUDITADO",
    marketRegime: "COMMODITY_RALLY",
    fundReturn: 0.0150,
    benchReturn: 0.0120,
    cdiReturn: 0.0091,
    cdiPercentage: 164.8,
    alphaBps: 59,
    startNav: 103937800,
    endNav: 105496867,
    startQuote: 1.039378,
    endQuote: 1.054969,
    netInflow: 4100000,
    subscriptions: 5200000,
    redemptions: 1100000,
    annualizedVol: 8.1,
    sharpeRatio: 1.78,
    sortinoRatio: 2.15,
    var95_1d: 0.60,
    maxDrawdownMonth: -0.52,
    betaIbov: 0.55,
    liquidityRatioD1: 23.5,
    weeks: [
      {
        week: "Semana 1 (01 a 08/03)",
        focus: "Reativação do Ciclo de Commodities",
        description: "Estímulos fiscais na Ásia provocam repique nos preços de metais e grãos.",
        tacticalAction: "Aumento gradual da posição em VALE3 e PRIO3."
      },
      {
        week: "Semana 2 (11 a 15/03)",
        focus: "Super Quarta (Copom e Fed)",
        description: "Banco Central corta Selic em 50 bps conforme precificado. Fed sinaliza cautela nos juros americanos.",
        tacticalAction: "Manutenção da duration da renda fixa em 2.4 anos."
      },
      {
        week: "Semana 3 (18 a 22/03)",
        focus: "Entrada em Posições de Ouro Spot",
        description: "Máximas históricas no ouro internacional reforçam papel de diversificador descorrelacionado.",
        tacticalAction: "Alocação tática de 4.5% do PL em OZ1D."
      },
      {
        week: "Semana 4 (25 a 29/03)",
        focus: "Fechamento do 1º Trimestre (1T24)",
        description: "Fundo conclui 1T24 com rentabilidade acumulada de +5.50% (vs +2.80% do CDI e +1.50% do Ibovespa).",
        tacticalAction: "Emissão de relatório trimestral aos cotistas."
      }
    ],
    assetContributions: [
      { ticker: "PRIO3", name: "PetroRio S.A.", sector: "Energia", weight: 9.0, assetReturn: 6.8, contributionBps: 61, positionType: "LONG", rationale: "Expansão de produção no campo de Frade e sinergias operacionais." },
      { ticker: "PETR4", name: "Petróleo Brasileiro S.A.", sector: "Energia", weight: 12.5, assetReturn: 3.2, contributionBps: 40, positionType: "LONG", rationale: "Dividend yield elevado sustentando cotações." },
      { ticker: "OURO", name: "Ouro Spot / B3", sector: "Hedge Geopolítico", weight: 4.5, assetReturn: 8.5, contributionBps: 38, positionType: "HEDGE", rationale: "Forte rali do ouro nos mercados globais para novos patamares históricos." },
      { ticker: "VALE3", name: "Vale S.A.", sector: "Materiais Básicos", weight: 11.0, assetReturn: 2.1, contributionBps: 23, positionType: "LONG", rationale: "Recuperação dos embarques de minério de ferro de alta pureza." }
    ],
    sectorAllocation: [
      { sector: "Energia & Petróleo", weight: 21.5, contribution: 1.01 },
      { sector: "Renda Fixa / Caixa", weight: 25.0, contribution: 0.23 },
      { sector: "Materiais Básicos", weight: 13.5, contribution: 0.28 },
      { sector: "Bens Industriais", weight: 16.0, contribution: 0.35 },
      { sector: "Financeiro / Bancos", weight: 16.0, contribution: 0.22 },
      { sector: "Hedge Cambial / Ouro", weight: 8.0, contribution: 0.42 }
    ],
    riskParecer: "Patrimônio sob gestão ultrapassa R$ 105 milhões. Auditoria sem ressalvas na marcação a mercado dos ativos da carteira.",
    complianceAuditor: "Comitê Fiduciário Harpia Finance / D. Carvalho (CFA)",
    complianceStatus: "ENQUADRADO_100%",
    auditHash: "SHA256-HP2403-77F83D219"
  },
  {
    month: "2024-04",
    monthName: "Abril / 2024",
    year: 2024,
    status: "FECHADO_AUDITADO",
    marketRegime: "HIGH_VOL_STRESS",
    fundReturn: -0.0080,
    benchReturn: -0.0170,
    cdiReturn: 0.0088,
    cdiPercentage: -90.9,
    alphaBps: -168,
    startNav: 105496867,
    endNav: 104652892,
    startQuote: 1.054969,
    endQuote: 1.046529,
    netInflow: 1500000,
    subscriptions: 2300000,
    redemptions: 800000,
    annualizedVol: 10.5,
    sharpeRatio: 1.42,
    sortinoRatio: 1.65,
    var95_1d: 0.85,
    maxDrawdownMonth: -1.25,
    betaIbov: 0.45,
    liquidityRatioD1: 27.5,
    weeks: [
      {
        week: "Semana 1 (01 a 05/04)",
        focus: "Choque de Juros Globais (Treasuries)",
        description: "Dados de inflação nos EUA forçam repique nas taxas de 10 anos (US 10Y para 4.65%).",
        tacticalAction: "Redução de exposição a ações cíclicas domésticas."
      },
      {
        week: "Semana 2 (08 a 12/04)",
        focus: "Ativação de Stop Preventivo e Hedge Dólar",
        description: "O modelo algorítmico detecta aumento de correlação cruzada e aciona trava em futuros de Dólar.",
        tacticalAction: "Aumento do colchão de liquidez para 27.5% do PL."
      },
      {
        week: "Semana 3 (15 a 19/04)",
        focus: "Absorção de Volatilidade de Mercado",
        description: "Ibovespa afunda -1.70% no mês; o Fundo Harpia limita o drawdown a -0.80%, protegendo o patrimônio.",
        tacticalAction: "Manutenção rigorosa dos limites de VaR diário."
      },
      {
        week: "Semana 4 (22 a 30/04)",
        focus: "Estabilização e Preparação para Reversão",
        description: "Reabertura de oportunidades em ativos com múltiplos deprimidos e alta taxa de dividendo.",
        tacticalAction: "Acúmulo de papéis defensivos de utilidade pública (ELET3)."
      }
    ],
    assetContributions: [
      { ticker: "DOL_HEDGE", name: "Dólar Futuro (Hedge)", sector: "Hedge Cambial", weight: 6.5, assetReturn: 3.8, contributionBps: 25, positionType: "HEDGE", rationale: "Ganhos cambiais amorteceram a queda generalizada das ações brasileiras." },
      { ticker: "CDI/Caixa", name: "Operações Compromissadas", sector: "Renda Fixa", weight: 27.5, assetReturn: 0.88, contributionBps: 24, positionType: "FIXED_INCOME", rationale: "Retorno da renda fixa atuou como colchão fiduciário." },
      { ticker: "PETR4", name: "Petróleo Brasileiro S.A.", sector: "Energia", weight: 12.0, assetReturn: -3.5, contributionBps: -42, positionType: "LONG", rationale: "Ruídos sobre política de dividendos extraordinários geraram volatilidade." },
      { ticker: "VALE3", name: "Vale S.A.", sector: "Materiais Básicos", weight: 10.5, assetReturn: -4.8, contributionBps: -50, positionType: "LONG", rationale: "Ajuste corretivo no setor de commodities metálicas." }
    ],
    sectorAllocation: [
      { sector: "Renda Fixa / Caixa", weight: 27.5, contribution: 0.24 },
      { sector: "Hedge Cambial / Ouro", weight: 9.5, contribution: 0.35 },
      { sector: "Utilidade Pública / Energia", weight: 15.0, contribution: -0.15 },
      { sector: "Financeiro / Bancos", weight: 17.0, contribution: -0.32 },
      { sector: "Bens Industriais", weight: 18.0, contribution: -0.42 },
      { sector: "Materiais Básicos", weight: 13.0, contribution: -0.50 }
    ],
    riskParecer: "Drawdown temporário de -0.80% perfeitamente contido dentro das bandas de tolerância de risco (-4.0%). A ativação tempestiva do hedge cambial evitou perdas severas sofridas pelo mercado amplo.",
    complianceAuditor: "Comitê Fiduciário Harpia Finance / M. Siqueira",
    complianceStatus: "ENQUADRADO_100%",
    auditHash: "SHA256-HP2404-512E99A31"
  },
  {
    month: "2024-05",
    monthName: "Maio / 2024",
    year: 2024,
    status: "FECHADO_AUDITADO",
    marketRegime: "BULL_LOW_VOL",
    fundReturn: 0.0240,
    benchReturn: 0.0150,
    cdiReturn: 0.0089,
    cdiPercentage: 269.7,
    alphaBps: 151,
    startNav: 104652892,
    endNav: 107164561,
    startQuote: 1.046529,
    endQuote: 1.071646,
    netInflow: 3800000,
    subscriptions: 4900000,
    redemptions: 1100000,
    annualizedVol: 8.2,
    sharpeRatio: 1.88,
    sortinoRatio: 2.38,
    var95_1d: 0.61,
    maxDrawdownMonth: -0.41,
    betaIbov: 0.54,
    liquidityRatioD1: 22.0,
    weeks: [
      {
        week: "Semana 1 (01 a 10/05)",
        focus: "Forte Recuperação Liderada por Energia e Indústria",
        description: "Reabertura de compras em PETR4 e WEGE3 após balanços do 1T24 superarem estimativas.",
        tacticalAction: "Desmontagem gradual do hedge de dólar com lucro."
      },
      {
        week: "Semana 2 (13 a 17/05)",
        focus: "Fluxo de Capital Estrangeiro Positivo",
        description: "Investidores institucionais globais aceleram alocações em ações brasileiras de alta liquidez.",
        tacticalAction: "Elevação da exposição acionária para 62% do PL."
      },
      {
        week: "Semana 3 (20 a 24/05)",
        focus: "Expansão de Margens Bancárias",
        description: "Bancos reportam inadimplência em queda e ROE em expansão.",
        tacticalAction: "Aporte em ITUB4 e BBAS3."
      },
      {
        week: "Semana 4 (27 a 31/05)",
        focus: "Fechamento com Nova Máxima Histórica",
        description: "Fundo bate +2.40% no mês e atinge patrimônio recorde de R$ 107.1M.",
        tacticalAction: "Rebalanceamento automático de lucros para o caixa CDI."
      }
    ],
    assetContributions: [
      { ticker: "PETR4", name: "Petróleo Brasileiro S.A.", sector: "Energia", weight: 14.0, assetReturn: 7.2, contributionBps: 101, positionType: "LONG", rationale: "Anúncio de dividendos regulares e aumento na produção do pré-sal." },
      { ticker: "WEGE3", name: "WEG S.A.", sector: "Bens Industriais", weight: 13.0, assetReturn: 5.8, contributionBps: 75, positionType: "LONG", rationale: "Crescimento contínuo nas divisões solar, eólica e T&D." },
      { ticker: "ITUB4", name: "Itaú Unibanco Holding", sector: "Financeiro", weight: 12.0, assetReturn: 3.9, contributionBps: 47, positionType: "LONG", rationale: "Melhoria do mix de crédito e forte captação de clientes premium." },
      { ticker: "PRIO3", name: "PetroRio S.A.", sector: "Energia", weight: 8.5, assetReturn: 4.6, contributionBps: 39, positionType: "LONG", rationale: "Avanço no licenciamento ambiental do campo de Wahoo." }
    ],
    sectorAllocation: [
      { sector: "Energia & Petróleo", weight: 22.5, contribution: 1.40 },
      { sector: "Bens Industriais", weight: 20.0, contribution: 0.88 },
      { sector: "Financeiro / Bancos", weight: 19.0, contribution: 0.62 },
      { sector: "Renda Fixa / Caixa", weight: 22.0, contribution: 0.20 },
      { sector: "Materiais Básicos", weight: 11.5, contribution: 0.15 },
      { sector: "Hedge / Ouro", weight: 5.0, contribution: 0.05 }
    ],
    riskParecer: "Recuperação expressiva do valor da cota com geração de +151 bps de alfa sobre o CDI. Governança e enquadramento CVM 175 auditados e aprovados.",
    complianceAuditor: "Comitê Fiduciário Harpia Finance / D. Carvalho (CFA)",
    complianceStatus: "ENQUADRADO_100%",
    auditHash: "SHA256-HP2405-33C14F98E"
  },
  {
    month: "2024-06",
    monthName: "Junho / 2024",
    year: 2024,
    status: "FECHADO_AUDITADO",
    marketRegime: "BULL_LOW_VOL",
    fundReturn: 0.0190,
    benchReturn: 0.0040,
    cdiReturn: 0.0087,
    cdiPercentage: 218.4,
    alphaBps: 103,
    startNav: 107164561,
    endNav: 109200687,
    startQuote: 1.071646,
    endQuote: 1.092007,
    netInflow: 3100000,
    subscriptions: 4200000,
    redemptions: 1100000,
    annualizedVol: 7.8,
    sharpeRatio: 1.95,
    sortinoRatio: 2.50,
    var95_1d: 0.57,
    maxDrawdownMonth: -0.35,
    betaIbov: 0.50,
    liquidityRatioD1: 24.5,
    weeks: [
      {
        week: "Semana 1 (03 a 07/06)",
        focus: "Manutenção da Taxa Selic e Carregamento de CDI",
        description: "Copom interrompe ciclo de cortes; taxa básica em 10.50% favorece posições de renda fixa.",
        tacticalAction: "Manutenção do colchão de 25% em NTN-B e LFT."
      },
      {
        week: "Semana 2 (10 a 14/06)",
        focus: "Desempenho de Exportadoras Industriais",
        description: "WEGE3 e EMBR3 continuam apresentando forte demanda e fluxo de ordens institucionais.",
        tacticalAction: "Realização parcial de lucros para recomposição de liquidez."
      },
      {
        week: "Semana 3 (17 a 21/06)",
        focus: "Redução Preventiva de Volatilidade Semestral",
        description: "Ajuste na matriz de covariância pelo algoritmo HRP para o fechamento de semestre.",
        tacticalAction: "Calibração dos pesos ótimos de risco."
      },
      {
        week: "Semana 4 (24 a 28/06)",
        focus: "Encerramento do 1º Semestre (1S24)",
        description: "Fundo encerra 1S24 com rentabilidade consolidada de +9.20% (vs +5.40% do CDI e -2.30% do Ibovespa).",
        tacticalAction: "Publicação da Carta Semestral aos Investidores."
      }
    ],
    assetContributions: [
      { ticker: "WEGE3", name: "WEG S.A.", sector: "Bens Industriais", weight: 13.0, assetReturn: 4.5, contributionBps: 59, positionType: "LONG", rationale: "Inovação tecnológica e aceleração de contratos nos EUA." },
      { ticker: "EMBR3", name: "Embraer S.A.", sector: "Bens Industriais", weight: 8.5, assetReturn: 6.1, contributionBps: 52, positionType: "LONG", rationale: "Certificação europeia de aeronaves de defesa amplia faturamento." },
      { ticker: "PETR4", name: "Petróleo Brasileiro S.A.", sector: "Energia", weight: 13.5, assetReturn: 2.8, contributionBps: 38, positionType: "LONG", rationale: "Estabilidade nos preços de combustíveis e fluxo constante." },
      { ticker: "NTN-B", name: "Tesouro IPCA+ 2029", sector: "Renda Fixa", weight: 24.5, assetReturn: 1.1, contributionBps: 27, positionType: "FIXED_INCOME", rationale: "Carregamento de juro real." }
    ],
    sectorAllocation: [
      { sector: "Bens Industriais", weight: 21.5, contribution: 1.11 },
      { sector: "Energia & Petróleo", weight: 21.0, contribution: 0.58 },
      { sector: "Renda Fixa / Caixa", weight: 24.5, contribution: 0.27 },
      { sector: "Financeiro / Bancos", weight: 17.5, contribution: 0.35 },
      { sector: "Agronegócio / Commodities", weight: 10.5, contribution: 0.15 },
      { sector: "Hedge / Ouro", weight: 5.0, contribution: 0.04 }
    ],
    riskParecer: "Fechamento semestral concluído com excelência fiduciária. Rentabilidade de +9.20% supera o benchmark em 11.5 pontos percentuais.",
    complianceAuditor: "Comitê Fiduciário Harpia Finance / M. Siqueira",
    complianceStatus: "ENQUADRADO_100%",
    auditHash: "SHA256-HP2406-89B72C411"
  },
  // ── 2024 (2º Semestre) ────────────────────────────────────────────────
  {
    month: "2024-07",
    monthName: "Julho / 2024",
    year: 2024,
    status: "FECHADO_AUDITADO",
    marketRegime: "BULL_LOW_VOL",
    fundReturn: 0.0220,
    benchReturn: 0.0110,
    cdiReturn: 0.0091,
    cdiPercentage: 241.8,
    alphaBps: 129,
    startNav: 109200687,
    endNav: 111603102,
    startQuote: 1.092007,
    endQuote: 1.116031,
    netInflow: 4200000,
    subscriptions: 5500000,
    redemptions: 1300000,
    annualizedVol: 8.0,
    sharpeRatio: 1.90,
    sortinoRatio: 2.40,
    var95_1d: 0.59,
    maxDrawdownMonth: -0.40,
    betaIbov: 0.52,
    liquidityRatioD1: 23.0,
    weeks: [
      { week: "Semana 1", focus: "Início do 2º Semestre", description: "Rebalanceamento algorítmico do modelo de fatores de risco.", tacticalAction: "Reabastecimento de posições em commodities." },
      { week: "Semana 2", focus: "Rali de Energia e Petróleo", description: "Alta no Brent internacional beneficia posições em PETR4 e PRIO3.", tacticalAction: "Manutenção do peso Long em óleo e gás." },
      { week: "Semana 3", focus: "Entrada de Fluxo Institucional", description: "Captação líquida recorde amplia patrimônio para R$ 111.6M.", tacticalAction: "Alocação eficiente do novo capital sem gerar slippage." },
      { week: "Semana 4", focus: "Fechamento Positivo", description: "Fundo entrega +2.20% no mês, mantendo consistência de alfa.", tacticalAction: "Ajuste de travas de proteção." }
    ],
    assetContributions: [
      { ticker: "PETR4", name: "Petrobras", sector: "Energia", weight: 14.0, assetReturn: 6.5, contributionBps: 91, positionType: "LONG", rationale: "Forte geração de caixa e dividendos." },
      { ticker: "ITUB4", name: "Itaú Unibanco", sector: "Financeiro", weight: 12.0, assetReturn: 4.1, contributionBps: 49, positionType: "LONG", rationale: "Resultados consistentes." },
      { ticker: "WEGE3", name: "WEG S.A.", sector: "Bens Industriais", weight: 13.0, assetReturn: 3.5, contributionBps: 45, positionType: "LONG", rationale: "Crescimento contínuo." }
    ],
    sectorAllocation: [
      { sector: "Energia & Petróleo", weight: 22.0, contribution: 1.15 },
      { sector: "Financeiro / Bancos", weight: 19.0, contribution: 0.65 },
      { sector: "Bens Industriais", weight: 19.5, contribution: 0.55 },
      { sector: "Renda Fixa / Caixa", weight: 23.0, contribution: 0.21 },
      { sector: "Materiais Básicos", weight: 11.5, contribution: 0.14 },
      { sector: "Hedge / Ouro", weight: 5.0, contribution: 0.05 }
    ],
    riskParecer: "Liquidez diária mantida acima de 23%. Sem desenquadramentos.",
    complianceAuditor: "Comitê Fiduciário Harpia Finance / D. Carvalho (CFA)",
    complianceStatus: "ENQUADRADO_100%",
    auditHash: "SHA256-HP2407-7711AE901"
  },
  {
    month: "2024-08",
    monthName: "Agosto / 2024",
    year: 2024,
    status: "FECHADO_AUDITADO",
    marketRegime: "SIDEWAYS",
    fundReturn: 0.0140,
    benchReturn: 0.0020,
    cdiReturn: 0.0088,
    cdiPercentage: 159.1,
    alphaBps: 52,
    startNav: 111603102,
    endNav: 113165545,
    startQuote: 1.116031,
    endQuote: 1.131655,
    netInflow: 2500000,
    subscriptions: 3400000,
    redemptions: 900000,
    annualizedVol: 7.5,
    sharpeRatio: 1.82,
    sortinoRatio: 2.25,
    var95_1d: 0.55,
    maxDrawdownMonth: -0.32,
    betaIbov: 0.46,
    liquidityRatioD1: 25.0,
    weeks: [
      { week: "Semana 1", focus: "Rotação Defensiva", description: "Migração tática para ativos de baixa volatilidade.", tacticalAction: "Aporte em ABEV3 e ELET3." },
      { week: "Semana 2", focus: "Manutenção do Hedge Cambial", description: "Proteção contra oscilações de moedas emergentes.", tacticalAction: "Travas de dólar mantidas." },
      { week: "Semana 3", focus: "Execução Algorítmica", description: "Ordens HFT capturam micro-distorções de spread na B3.", tacticalAction: "Ganhos em arbitragem estatística." },
      { week: "Semana 4", focus: "Fechamento Estável", description: "Retorno positivo de +1.40% superando o CDI e bolsa.", tacticalAction: "Consolidação de lucros." }
    ],
    assetContributions: [
      { ticker: "ELET3", name: "Eletrobras", sector: "Utilidade Pública", weight: 9.0, assetReturn: 4.8, contributionBps: 43, positionType: "LONG", rationale: "Sinergias pós-privatização." },
      { ticker: "WEGE3", name: "WEG", sector: "Bens Industriais", weight: 12.5, assetReturn: 3.1, contributionBps: 39, positionType: "LONG", rationale: "Resiliência operacional." },
      { ticker: "CDI", name: "Renda Fixa", sector: "Caixa", weight: 25.0, assetReturn: 0.88, contributionBps: 22, positionType: "FIXED_INCOME", rationale: "Rendimento estável." }
    ],
    sectorAllocation: [
      { sector: "Bens Industriais", weight: 20.0, contribution: 0.65 },
      { sector: "Utilidade Pública", weight: 15.0, contribution: 0.48 },
      { sector: "Renda Fixa / Caixa", weight: 25.0, contribution: 0.22 },
      { sector: "Financeiro / Bancos", weight: 18.0, contribution: 0.35 },
      { sector: "Energia", weight: 16.0, contribution: 0.25 },
      { sector: "Hedge / Ouro", weight: 6.0, contribution: 0.05 }
    ],
    riskParecer: "Comitê de Risco autoriza continuidade da estratégia defensiva.",
    complianceAuditor: "Comitê Fiduciário Harpia Finance / M. Siqueira",
    complianceStatus: "ENQUADRADO_100%",
    auditHash: "SHA256-HP2408-1122BB445"
  },
  {
    month: "2024-09",
    monthName: "Setembro / 2024",
    year: 2024,
    status: "FECHADO_AUDITADO",
    marketRegime: "BULL_LOW_VOL",
    fundReturn: 0.0260,
    benchReturn: 0.0180,
    cdiReturn: 0.0089,
    cdiPercentage: 292.1,
    alphaBps: 171,
    startNav: 113165545,
    endNav: 116107849,
    startQuote: 1.131655,
    endQuote: 1.161078,
    netInflow: 4800000,
    subscriptions: 6100000,
    redemptions: 1300000,
    annualizedVol: 8.5,
    sharpeRatio: 2.05,
    sortinoRatio: 2.68,
    var95_1d: 0.64,
    maxDrawdownMonth: -0.42,
    betaIbov: 0.58,
    liquidityRatioD1: 22.0,
    weeks: [
      { week: "Semana 1", focus: "Corte de Juros pelo Fed (50 bps)", description: "Início do ciclo de afrouxamento monetário nos EUA dispara rali global de ativos de risco.", tacticalAction: "Aumento de exposição acionária para 65%." },
      { week: "Semana 2", focus: "Pacote de Estímulos na China", description: "Autoridades chinesas anunciam medidas de liquidez, impulsionando VALE3 e commodities.", tacticalAction: "Aporte em VALE3 e setor agro." },
      { week: "Semana 3", focus: "Rali Acelerado na B3", description: "Bolsa brasileira sobe com forte entrada de capital externo.", tacticalAction: "Captura de ganhos em papéis cíclicos." },
      { week: "Semana 4", focus: "Mês Recorde do Ano", description: "Fundo fecha o mês com +2.60% de valorização e alfa de 171 bps vs CDI.", tacticalAction: "Rebalanceamento do portfólio." }
    ],
    assetContributions: [
      { ticker: "VALE3", name: "Vale S.A.", sector: "Materiais Básicos", weight: 12.0, assetReturn: 8.5, contributionBps: 102, positionType: "LONG", rationale: "Estímulos econômicos na China impulsionam minério." },
      { ticker: "PETR4", name: "Petrobras", sector: "Energia", weight: 13.5, assetReturn: 5.2, contributionBps: 70, positionType: "LONG", rationale: "Fluxo comprador institucional." },
      { ticker: "WEGE3", name: "WEG", sector: "Bens Industriais", weight: 13.0, assetReturn: 4.8, contributionBps: 62, positionType: "LONG", rationale: "Contratos de exportação." }
    ],
    sectorAllocation: [
      { sector: "Materiais Básicos", weight: 18.0, contribution: 1.25 },
      { sector: "Energia & Petróleo", weight: 21.0, contribution: 0.95 },
      { sector: "Bens Industriais", weight: 19.0, contribution: 0.72 },
      { sector: "Renda Fixa / Caixa", weight: 22.0, contribution: 0.20 },
      { sector: "Financeiro / Bancos", weight: 15.0, contribution: 0.38 },
      { sector: "Hedge / Ouro", weight: 5.0, contribution: 0.05 }
    ],
    riskParecer: "Retorno acumulado no ano atinge +16.10%, superando o Ibovespa em mais de 14 pontos percentuais.",
    complianceAuditor: "Comitê Fiduciário Harpia Finance / D. Carvalho (CFA)",
    complianceStatus: "ENQUADRADO_100%",
    auditHash: "SHA256-HP2409-5566DD789"
  },
  {
    month: "2024-10",
    monthName: "Outubro / 2024",
    year: 2024,
    status: "FECHADO_AUDITADO",
    marketRegime: "SIDEWAYS",
    fundReturn: 0.0120,
    benchReturn: -0.0030,
    cdiReturn: 0.0090,
    cdiPercentage: 133.3,
    alphaBps: 30,
    startNav: 116107849,
    endNav: 117501143,
    startQuote: 1.161078,
    endQuote: 1.175011,
    netInflow: 2100000,
    subscriptions: 3100000,
    redemptions: 1000000,
    annualizedVol: 7.9,
    sharpeRatio: 1.82,
    sortinoRatio: 2.28,
    var95_1d: 0.58,
    maxDrawdownMonth: -0.45,
    betaIbov: 0.48,
    liquidityRatioD1: 24.0,
    weeks: [
      { week: "Semana 1", focus: "Cautela Pré-Eleições nos EUA", description: "Mercados globais entram em compasso de espera.", tacticalAction: "Reforço de posições defensivas." },
      { week: "Semana 2", focus: "Desempenho Sólido de Renda Fixa", description: "CDI e títulos IPCA+ garantem estabilidade do fundo.", tacticalAction: "Manutenção do colchão de liquidez." },
      { week: "Semana 3", focus: "Proteção contra Queda da Bolsa", description: "Ibovespa recua mas a carteira preserva ganhos.", tacticalAction: "Travas táticas ativas." },
      { week: "Semana 4", focus: "Fechamento Resiliente", description: "Mais um mês positivo (+1.20%), acumulando +17.5% no ano.", tacticalAction: "Rebalanceamento do portfólio." }
    ],
    assetContributions: [
      { ticker: "ITUB4", name: "Itaú Unibanco", sector: "Financeiro", weight: 12.0, assetReturn: 2.8, contributionBps: 34, positionType: "LONG", rationale: "Balanço defensivo." },
      { ticker: "ABEV3", name: "Ambev", sector: "Consumo", weight: 8.0, assetReturn: 3.5, contributionBps: 28, positionType: "LONG", rationale: "Geração de caixa." },
      { ticker: "NTN-B", name: "Tesouro IPCA+", sector: "Renda Fixa", weight: 25.0, assetReturn: 1.0, contributionBps: 25, positionType: "FIXED_INCOME", rationale: "Taxa real de juros." }
    ],
    sectorAllocation: [
      { sector: "Renda Fixa / Caixa", weight: 26.0, contribution: 0.25 },
      { sector: "Financeiro / Bancos", weight: 18.0, contribution: 0.40 },
      { sector: "Bens Industriais", weight: 18.0, contribution: 0.32 },
      { sector: "Consumo / Agro", weight: 15.0, contribution: 0.28 },
      { sector: "Energia", weight: 15.0, contribution: 0.20 },
      { sector: "Hedge / Ouro", weight: 8.0, contribution: 0.05 }
    ],
    riskParecer: "Blindagem de risco executada com sucesso durante volatilidade eleitoral internacional.",
    complianceAuditor: "Comitê Fiduciário Harpia Finance / M. Siqueira",
    complianceStatus: "ENQUADRADO_100%",
    auditHash: "SHA256-HP2410-9988CC221"
  },
  {
    month: "2024-11",
    monthName: "Novembro / 2024",
    year: 2024,
    status: "FECHADO_AUDITADO",
    marketRegime: "BULL_LOW_VOL",
    fundReturn: 0.0200,
    benchReturn: 0.0140,
    cdiReturn: 0.0089,
    cdiPercentage: 224.7,
    alphaBps: 111,
    startNav: 117501143,
    endNav: 119851165,
    startQuote: 1.175011,
    endQuote: 1.198512,
    netInflow: 3900000,
    subscriptions: 5100000,
    redemptions: 1200000,
    annualizedVol: 8.1,
    sharpeRatio: 1.96,
    sortinoRatio: 2.55,
    var95_1d: 0.60,
    maxDrawdownMonth: -0.36,
    betaIbov: 0.52,
    liquidityRatioD1: 23.5,
    weeks: [
      { week: "Semana 1", focus: "Definição Eleitoral nos EUA", description: "Redução de incerteza global impulsiona bolsas.", tacticalAction: "Elevação de alocação em industriais e exportadoras." },
      { week: "Semana 2", focus: "Avanço de PETR4 e WEGE3", description: "Balanços corporativos do 3T24 mostram resiliência de margens.", tacticalAction: "Captura de dividendos." },
      { week: "Semana 3", focus: "Aportes Institucionais", description: "Entrada expressiva de novos cotistas institucionais.", tacticalAction: "Alocação eficiente do capital." },
      { week: "Semana 4", focus: "Prévia do Fechamento Anual", description: "Fundo aproxima-se da marca de R$ 120M sob gestão.", tacticalAction: "Preparação para o encerramento do exercício." }
    ],
    assetContributions: [
      { ticker: "WEGE3", name: "WEG S.A.", sector: "Bens Industriais", weight: 13.0, assetReturn: 5.5, contributionBps: 72, positionType: "LONG", rationale: "Resultados do 3T24." },
      { ticker: "PETR4", name: "Petrobras", sector: "Energia", weight: 13.0, assetReturn: 4.8, contributionBps: 62, positionType: "LONG", rationale: "Dividendos atrativos." },
      { ticker: "EMBR3", name: "Embraer", sector: "Bens Industriais", weight: 8.5, assetReturn: 6.2, contributionBps: 53, positionType: "LONG", rationale: "Novos pedidos de defesa." }
    ],
    sectorAllocation: [
      { sector: "Bens Industriais", weight: 21.5, contribution: 1.25 },
      { sector: "Energia & Petróleo", weight: 21.0, contribution: 0.85 },
      { sector: "Financeiro / Bancos", weight: 18.0, contribution: 0.45 },
      { sector: "Renda Fixa / Caixa", weight: 23.5, contribution: 0.22 },
      { sector: "Materiais Básicos", weight: 11.0, contribution: 0.18 },
      { sector: "Hedge / Ouro", weight: 5.0, contribution: 0.05 }
    ],
    riskParecer: "Aprovada atualização de parâmetros de volatilidade para o encerramento de 2024.",
    complianceAuditor: "Comitê Fiduciário Harpia Finance / D. Carvalho (CFA)",
    complianceStatus: "ENQUADRADO_100%",
    auditHash: "SHA256-HP2411-3344EE556"
  },
  {
    month: "2024-12",
    monthName: "Dezembro / 2024",
    year: 2024,
    status: "FECHADO_AUDITADO",
    marketRegime: "BULL_LOW_VOL",
    fundReturn: 0.0230,
    benchReturn: 0.0100,
    cdiReturn: 0.0092,
    cdiPercentage: 250.0,
    alphaBps: 138,
    startNav: 119851165,
    endNav: 122607741,
    startQuote: 1.198512,
    endQuote: 1.226077,
    netInflow: 4500000,
    subscriptions: 5800000,
    redemptions: 1300000,
    annualizedVol: 7.8,
    sharpeRatio: 2.10,
    sortinoRatio: 2.75,
    var95_1d: 0.56,
    maxDrawdownMonth: -0.30,
    betaIbov: 0.50,
    liquidityRatioD1: 24.0,
    weeks: [
      { week: "Semana 1", focus: "Rally de Fim de Ano", description: "Fechamento de posições institucionais impulsiona ações de alta liquidez.", tacticalAction: "Captura de ganhos em blue chips." },
      { week: "Semana 2", focus: "Distribuição de Proventos", description: "JCP e dividendos de PETR4, ITUB4 e BBAS3 creditados no fundo.", tacticalAction: "Reinvestimento nos modelos quantitativos." },
      { week: "Semana 3", focus: "Ajuste Fiscal e Liquidez", description: "Otimização tributária de carteira e travamento de posições.", tacticalAction: "Aporte em caixa CDI." },
      { week: "Semana 4", focus: "Conclusão do Exercício de 2024", description: "Fundo conclui 2024 com rentabilidade anual de +22.61% (vs +11.35% do CDI e +4.20% do Ibovespa).", tacticalAction: "Emissão de Carta Anual aos Cotistas." }
    ],
    assetContributions: [
      { ticker: "PETR4", name: "Petrobras", sector: "Energia", weight: 13.5, assetReturn: 6.0, contributionBps: 81, positionType: "LONG", rationale: "Dividendos e proventos de fim de ano." },
      { ticker: "ITUB4", name: "Itaú Unibanco", sector: "Financeiro", weight: 12.0, assetReturn: 4.8, contributionBps: 58, positionType: "LONG", rationale: "Anúncio de JCP extraordinário." },
      { ticker: "WEGE3", name: "WEG S.A.", sector: "Bens Industriais", weight: 13.0, assetReturn: 4.2, contributionBps: 55, positionType: "LONG", rationale: "Continuidade do crescimento." }
    ],
    sectorAllocation: [
      { sector: "Energia & Petróleo", weight: 22.0, contribution: 1.10 },
      { sector: "Bens Industriais", weight: 21.0, contribution: 0.85 },
      { sector: "Financeiro / Bancos", weight: 18.5, contribution: 0.70 },
      { sector: "Renda Fixa / Caixa", weight: 24.0, contribution: 0.23 },
      { sector: "Materiais Básicos", weight: 10.5, contribution: 0.15 },
      { sector: "Hedge / Ouro", weight: 4.0, contribution: 0.07 }
    ],
    riskParecer: "Exercício de 2024 encerrado com desempenho espetacular: +22.61% (quase o dobro do CDI). Auditoria sem ressalvas.",
    complianceAuditor: "Comitê Fiduciário Harpia Finance / M. Siqueira",
    complianceStatus: "ENQUADRADO_100%",
    auditHash: "SHA256-HP2412-FINAL-AUDIT"
  },

  // ── 2025 ─────────────────────────────────────────────────────────────
  {
    month: "2025-01",
    monthName: "Janeiro / 2025",
    year: 2025,
    status: "FECHADO_AUDITADO",
    marketRegime: "BULL_LOW_VOL",
    fundReturn: 0.0190,
    benchReturn: 0.0070,
    cdiReturn: 0.0091,
    cdiPercentage: 208.8,
    alphaBps: 99,
    startNav: 122607741,
    endNav: 124937288,
    startQuote: 1.226077,
    endQuote: 1.249373,
    netInflow: 4100000,
    subscriptions: 5400000,
    redemptions: 1300000,
    annualizedVol: 8.0,
    sharpeRatio: 1.92,
    sortinoRatio: 2.45,
    var95_1d: 0.58,
    maxDrawdownMonth: -0.38,
    betaIbov: 0.51,
    liquidityRatioD1: 23.5,
    weeks: [
      { week: "Semana 1", focus: "Abertura de 2025", description: "Início do novo ciclo de investimentos com alocação otimizada HRP.", tacticalAction: "Rebalanceamento em blue chips." },
      { week: "Semana 2", focus: "Commodities e Energia", description: "Valorização sustentada do setor de energia.", tacticalAction: "Manutenção do peso Long em óleo e gás." },
      { week: "Semana 3", focus: "Alocação em Renda Fixa", description: "Compra de títulos soberanos para garantia de liquidez.", tacticalAction: "Alocação em NTN-B." },
      { week: "Semana 4", focus: "Fechamento Positivo", description: "PL atinge R$ 124.9M com rentabilidade de +1.90%.", tacticalAction: "Consolidação de cotas." }
    ],
    assetContributions: [
      { ticker: "PETR4", name: "Petrobras", sector: "Energia", weight: 13.5, assetReturn: 5.2, contributionBps: 70, positionType: "LONG", rationale: "Produção no pré-sal." },
      { ticker: "WEGE3", name: "WEG", sector: "Bens Industriais", weight: 13.0, assetReturn: 4.1, contributionBps: 53, positionType: "LONG", rationale: "Expansão internacional." },
      { ticker: "ITUB4", name: "Itaú Unibanco", sector: "Financeiro", weight: 12.0, assetReturn: 3.2, contributionBps: 38, positionType: "LONG", rationale: "Qualidade do crédito." }
    ],
    sectorAllocation: [
      { sector: "Energia & Petróleo", weight: 22.0, contribution: 0.95 },
      { sector: "Bens Industriais", weight: 21.0, contribution: 0.78 },
      { sector: "Financeiro / Bancos", weight: 18.0, contribution: 0.52 },
      { sector: "Renda Fixa / Caixa", weight: 24.0, contribution: 0.22 },
      { sector: "Materiais Básicos", weight: 11.0, contribution: 0.15 },
      { sector: "Hedge / Ouro", weight: 4.0, contribution: 0.05 }
    ],
    riskParecer: "Mandato de alocação renovado sem restrições pelo Comitê de Risco.",
    complianceAuditor: "Comitê Fiduciário Harpia Finance / D. Carvalho (CFA)",
    complianceStatus: "ENQUADRADO_100%",
    auditHash: "SHA256-HP2501-8899AA112"
  },
  {
    month: "2025-06",
    monthName: "Junho / 2025",
    year: 2025,
    status: "FECHADO_AUDITADO",
    marketRegime: "BULL_LOW_VOL",
    fundReturn: 0.0180,
    benchReturn: 0.0060,
    cdiReturn: 0.0088,
    cdiPercentage: 204.5,
    alphaBps: 92,
    startNav: 134967335,
    endNav: 137396747,
    startQuote: 1.349673,
    endQuote: 1.373967,
    netInflow: 3800000,
    subscriptions: 5000000,
    redemptions: 1200000,
    annualizedVol: 7.9,
    sharpeRatio: 1.94,
    sortinoRatio: 2.50,
    var95_1d: 0.57,
    maxDrawdownMonth: -0.34,
    betaIbov: 0.49,
    liquidityRatioD1: 24.0,
    weeks: [
      { week: "Semana 1", focus: "Fechamento do Semestre", description: "Balanço fiduciário semestral com rentabilidade de +10.2% no 1S25.", tacticalAction: "Rebalanceamento HRP." },
      { week: "Semana 2", focus: "Manutenção de Caixa", description: "Reserva de oportunidade ampliada.", tacticalAction: "Aporte em compromissadas DI." },
      { week: "Semana 3", focus: "Estabilidade de Papéis Defensivos", description: "Bancos e utilidades públicas sustentam ganhos.", tacticalAction: "Posições mantidas." },
      { week: "Semana 4", focus: "Auditoria Semestral", description: "PL atinge marco de R$ 137.3M.", tacticalAction: "Emissão de parecer fiduciário." }
    ],
    assetContributions: [
      { ticker: "WEGE3", name: "WEG S.A.", sector: "Bens Industriais", weight: 13.0, assetReturn: 4.8, contributionBps: 62, positionType: "LONG", rationale: "Consistência de margens." },
      { ticker: "PETR4", name: "Petrobras", sector: "Energia", weight: 13.0, assetReturn: 3.5, contributionBps: 45, positionType: "LONG", rationale: "Geração de FCF." },
      { ticker: "ITUB4", name: "Itaú Unibanco", sector: "Financeiro", weight: 12.0, assetReturn: 3.0, contributionBps: 36, positionType: "LONG", rationale: "Inadimplência controlada." }
    ],
    sectorAllocation: [
      { sector: "Bens Industriais", weight: 21.0, contribution: 0.85 },
      { sector: "Energia & Petróleo", weight: 21.0, contribution: 0.65 },
      { sector: "Financeiro / Bancos", weight: 18.5, contribution: 0.50 },
      { sector: "Renda Fixa / Caixa", weight: 24.0, contribution: 0.22 },
      { sector: "Materiais Básicos", weight: 11.5, contribution: 0.14 },
      { sector: "Hedge / Ouro", weight: 4.0, contribution: 0.04 }
    ],
    riskParecer: "Parecer Fiduciário semestral aprovado por unanimidade pelo conselho.",
    complianceAuditor: "Comitê Fiduciário Harpia Finance / M. Siqueira",
    complianceStatus: "ENQUADRADO_100%",
    auditHash: "SHA256-HP2506-SEMESTRAL-OK"
  },
  {
    month: "2025-12",
    monthName: "Dezembro / 2025",
    year: 2025,
    status: "FECHADO_AUDITADO",
    marketRegime: "BULL_LOW_VOL",
    fundReturn: 0.0240,
    benchReturn: 0.0130,
    cdiReturn: 0.0092,
    cdiPercentage: 260.9,
    alphaBps: 148,
    startNav: 150360359,
    endNav: 153969007,
    startQuote: 1.503604,
    endQuote: 1.539690,
    netInflow: 5200000,
    subscriptions: 6800000,
    redemptions: 1600000,
    annualizedVol: 8.0,
    sharpeRatio: 2.15,
    sortinoRatio: 2.80,
    var95_1d: 0.58,
    maxDrawdownMonth: -0.28,
    betaIbov: 0.51,
    liquidityRatioD1: 24.5,
    weeks: [
      { week: "Semana 1", focus: "Fechamento Anual de 2025", description: "Conclusão de mais um ano consecutivo superando amplamente o CDI (+25.5% vs +11.2%).", tacticalAction: "Rebalanceamento anual." },
      { week: "Semana 2", focus: "Distribuição e Proventos", description: "Aporte de proventos no fundo.", tacticalAction: "Reinvestimento nos modelos." },
      { week: "Semana 3", focus: "PL Atinge R$ 153.9M", description: "Crescimento sustentável sob governança CVM 175.", tacticalAction: "Auditoria fiscal." },
      { week: "Semana 4", focus: "Conclusão do Exercício", description: "Emissão de relatório auditado a todos os cotistas.", tacticalAction: "Homologação do ano." }
    ],
    assetContributions: [
      { ticker: "PETR4", name: "Petrobras", sector: "Energia", weight: 14.0, assetReturn: 6.2, contributionBps: 87, positionType: "LONG", rationale: "Dividendos do exercício." },
      { ticker: "WEGE3", name: "WEG S.A.", sector: "Bens Industriais", weight: 13.5, assetReturn: 5.0, contributionBps: 68, positionType: "LONG", rationale: "Liderança de mercado." },
      { ticker: "ITUB4", name: "Itaú Unibanco", sector: "Financeiro", weight: 12.0, assetReturn: 4.2, contributionBps: 50, positionType: "LONG", rationale: "Geração de lucro líquido recorde." }
    ],
    sectorAllocation: [
      { sector: "Energia & Petróleo", weight: 22.5, contribution: 1.15 },
      { sector: "Bens Industriais", weight: 21.5, contribution: 0.90 },
      { sector: "Financeiro / Bancos", weight: 18.0, contribution: 0.65 },
      { sector: "Renda Fixa / Caixa", weight: 23.5, contribution: 0.23 },
      { sector: "Materiais Básicos", weight: 10.5, contribution: 0.16 },
      { sector: "Hedge / Ouro", weight: 4.0, contribution: 0.06 }
    ],
    riskParecer: "Desempenho anual de 2025 consagrado com retorno de +25.5%, Sharpe de 2.15 e máxima proteção de capital.",
    complianceAuditor: "Comitê Fiduciário Harpia Finance / D. Carvalho (CFA)",
    complianceStatus: "ENQUADRADO_100%",
    auditHash: "SHA256-HP2512-ANNUAL-REPORT"
  },

  // ── 2026 ─────────────────────────────────────────────────────────────
  {
    month: "2026-01",
    monthName: "Janeiro / 2026",
    year: 2026,
    status: "FECHADO_AUDITADO",
    marketRegime: "BULL_LOW_VOL",
    fundReturn: 0.0180,
    benchReturn: 0.0060,
    cdiReturn: 0.0090,
    cdiPercentage: 200.0,
    alphaBps: 90,
    startNav: 153969007,
    endNav: 156740449,
    startQuote: 1.539690,
    endQuote: 1.567404,
    netInflow: 4600000,
    subscriptions: 6200000,
    redemptions: 1600000,
    annualizedVol: 7.9,
    sharpeRatio: 1.95,
    sortinoRatio: 2.50,
    var95_1d: 0.58,
    maxDrawdownMonth: -0.35,
    betaIbov: 0.50,
    liquidityRatioD1: 24.0,
    weeks: [
      { week: "Semana 1", focus: "Início do Ciclo 2026", description: "Alocação do novo exercício baseada em inteligência artificial e Black-Litterman.", tacticalAction: "Montagem da carteira anual." },
      { week: "Semana 2", focus: "Títulos Públicos e IPCA+", description: "Garantia de carregamento real favorável.", tacticalAction: "Aporte em NTN-B 2030." },
      { week: "Semana 3", focus: "Desempenho de Papéis Exportadores", description: "WEGE3 e EMBR3 lideram altas na B3.", tacticalAction: "Manutenção do peso Long." },
      { week: "Semana 4", focus: "Fechamento Positivo", description: "PL atinge R$ 156.7M.", tacticalAction: "Consolidação de cotas." }
    ],
    assetContributions: [
      { ticker: "WEGE3", name: "WEG S.A.", sector: "Bens Industriais", weight: 13.5, assetReturn: 4.8, contributionBps: 65, positionType: "LONG", rationale: "Demanda aquecida por infraestrutura elétrica." },
      { ticker: "PETR4", name: "Petrobras", sector: "Energia", weight: 13.0, assetReturn: 3.8, contributionBps: 49, positionType: "LONG", rationale: "Geração de caixa estável." },
      { ticker: "ITUB4", name: "Itaú Unibanco", sector: "Financeiro", weight: 12.0, assetReturn: 3.1, contributionBps: 37, positionType: "LONG", rationale: "Crescimento contínuo de receita de serviços." }
    ],
    sectorAllocation: [
      { sector: "Bens Industriais", weight: 22.0, contribution: 0.88 },
      { sector: "Energia & Petróleo", weight: 21.0, contribution: 0.68 },
      { sector: "Financeiro / Bancos", weight: 18.0, contribution: 0.52 },
      { sector: "Renda Fixa / Caixa", weight: 24.0, contribution: 0.22 },
      { sector: "Materiais Básicos", weight: 11.0, contribution: 0.15 },
      { sector: "Hedge / Ouro", weight: 4.0, contribution: 0.05 }
    ],
    riskParecer: "Alocação do novo exercício de 2026 aprovada sem restrições.",
    complianceAuditor: "Comitê Fiduciário Harpia Finance / D. Carvalho (CFA)",
    complianceStatus: "ENQUADRADO_100%",
    auditHash: "SHA256-HP2601-7788AA334"
  },
  {
    month: "2026-06",
    monthName: "Junho / 2026",
    year: 2026,
    status: "FECHADO_AUDITADO",
    marketRegime: "BULL_LOW_VOL",
    fundReturn: 0.0190,
    benchReturn: 0.0070,
    cdiReturn: 0.0088,
    cdiPercentage: 215.9,
    alphaBps: 102,
    startNav: 168496894,
    endNav: 171698335,
    startQuote: 1.684969,
    endQuote: 1.716983,
    netInflow: 4800000,
    subscriptions: 6400000,
    redemptions: 1600000,
    annualizedVol: 7.8,
    sharpeRatio: 1.98,
    sortinoRatio: 2.55,
    var95_1d: 0.57,
    maxDrawdownMonth: -0.32,
    betaIbov: 0.49,
    liquidityRatioD1: 24.5,
    weeks: [
      { week: "Semana 1", focus: "Encerramento do Semestre 1S26", description: "Fechamento oficial do primeiro semestre de 2026.", tacticalAction: "Rebalanceamento HRP." },
      { week: "Semana 2", focus: "PL Ultrapassa R$ 171 Milhões", description: "Marco histórico de capital sob gestão com auditoria fiduciária.", tacticalAction: "Aporte em caixa CDI." },
      { week: "Semana 3", focus: "Resiliência Operacional", description: "Modelos quantitativos entregam consistência máxima de retorno.", tacticalAction: "Manutenção de pesos." },
      { week: "Semana 4", focus: "Emissão de Parecer Consolidado", description: "Carta Semestral CVM 175 homologada com sucesso.", tacticalAction: "Publicação do relatório." }
    ],
    assetContributions: [
      { ticker: "PETR4", name: "Petrobras", sector: "Energia", weight: 14.0, assetReturn: 4.8, contributionBps: 67, positionType: "LONG", rationale: "Pré-sal e alta eficiência." },
      { ticker: "WEGE3", name: "WEG S.A.", sector: "Bens Industriais", weight: 13.5, assetReturn: 4.5, contributionBps: 61, positionType: "LONG", rationale: "Inovação tecnológica contínua." },
      { ticker: "ITUB4", name: "Itaú Unibanco", sector: "Financeiro", weight: 12.0, assetReturn: 3.4, contributionBps: 41, positionType: "LONG", rationale: "Rentabilidade sólida." }
    ],
    sectorAllocation: [
      { sector: "Energia & Petróleo", weight: 22.0, contribution: 0.85 },
      { sector: "Bens Industriais", weight: 21.5, contribution: 0.78 },
      { sector: "Financeiro / Bancos", weight: 18.0, contribution: 0.52 },
      { sector: "Renda Fixa / Caixa", weight: 24.5, contribution: 0.22 },
      { sector: "Materiais Básicos", weight: 10.0, contribution: 0.12 },
      { sector: "Hedge / Ouro", weight: 4.0, contribution: 0.05 }
    ],
    riskParecer: "Fechamento oficial de semestre com parecer fiduciário totalmente aprovado. PL de R$ 171.6M.",
    complianceAuditor: "Comitê Fiduciário Harpia Finance / M. Siqueira",
    complianceStatus: "ENQUADRADO_100%",
    auditHash: "SHA256-HP2606-SEMESTRAL-OK"
  },
  {
    month: "2026-08",
    monthName: "Agosto / 2026",
    year: 2026,
    status: "PROJETADO",
    marketRegime: "BULL_LOW_VOL",
    fundReturn: 0.0180,
    benchReturn: 0.0060,
    cdiReturn: 0.0090,
    cdiPercentage: 200.0,
    alphaBps: 90,
    startNav: 174617206,
    endNav: 177760315,
    startQuote: 1.746172,
    endQuote: 1.777603,
    netInflow: 4200000,
    subscriptions: 5800000,
    redemptions: 1600000,
    annualizedVol: 8.0,
    sharpeRatio: 1.95,
    sortinoRatio: 2.50,
    var95_1d: 0.58,
    maxDrawdownMonth: -0.35,
    betaIbov: 0.50,
    liquidityRatioD1: 24.0,
    weeks: [
      { week: "Semana 1", focus: "Projeção Provisória de Agosto", description: "Modelagem Black-Litterman projetada com base em preços vigentes da B3.", tacticalAction: "Manutenção de pesos calculados." },
      { week: "Semana 2", focus: "Monitoramento de Notícias AI Sentinel", description: "Varredura contínua de sentimento de notícias sobre a safra agro e Petrobras.", tacticalAction: "Supervisão automatizada." },
      { week: "Semana 3", focus: "Curva DI e Inflação", description: "Carregamento de CDI de 0.90% a.m.", tacticalAction: "Preservação de liquidez." },
      { week: "Semana 4", focus: "Fechamento Estimado", description: "Projeção de NAV de R$ 177.7M.", tacticalAction: "Projeção HRP ativa." }
    ],
    assetContributions: [
      { ticker: "PETR4", name: "Petrobras", sector: "Energia", weight: 14.0, assetReturn: 4.5, contributionBps: 63, positionType: "LONG", rationale: "Projeção de fluxo operacional." },
      { ticker: "WEGE3", name: "WEG S.A.", sector: "Bens Industriais", weight: 13.5, assetReturn: 4.2, contributionBps: 57, positionType: "LONG", rationale: "Modelo de crescimento contínuo." },
      { ticker: "ITUB4", name: "Itaú Unibanco", sector: "Financeiro", weight: 12.0, assetReturn: 3.3, contributionBps: 40, positionType: "LONG", rationale: "Solidez bancária." }
    ],
    sectorAllocation: [
      { sector: "Energia & Petróleo", weight: 22.0, contribution: 0.80 },
      { sector: "Bens Industriais", weight: 21.5, contribution: 0.75 },
      { sector: "Financeiro / Bancos", weight: 18.0, contribution: 0.50 },
      { sector: "Renda Fixa / Caixa", weight: 24.5, contribution: 0.22 },
      { sector: "Materiais Básicos", weight: 10.0, contribution: 0.12 },
      { sector: "Hedge / Ouro", weight: 4.0, contribution: 0.05 }
    ],
    riskParecer: "Projeção Provisória - Comitê de Risco Harpia AI.",
    complianceAuditor: "Comitê Fiduciário Harpia Finance / D. Carvalho (CFA)",
    complianceStatus: "ENQUADRADO_100%",
    auditHash: "SHA256-HP2608-PROJECTED"
  }
];
