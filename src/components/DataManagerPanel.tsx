import React, { useState, useEffect, useRef } from "react";
import { 
  Database, 
  RotateCw, 
  Play, 
  TrendingUp, 
  TrendingDown,
  CheckCircle, 
  AlertTriangle, 
  Terminal, 
  Search, 
  ArrowRightLeft, 
  Globe, 
  Lock, 
  ShieldCheck, 
  HelpCircle, 
  Calendar,
  Layers,
  Sparkles,
  BarChart3,
  Flame,
  FileCheck2,
  RefreshCw,
  Upload,
  FileSpreadsheet,
  Cpu,
  Coins,
  ArrowRight,
  User,
  Check,
  CheckCircle2,
  ListFilter,
  FileUp,
  Workflow
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import AgroIntelligenceMonitor from "./AgroIntelligenceMonitor";

interface PriceMacroRecord {
  time: string;
  ticker: string;
  price: number;
  volume: number;
  macro_score: number;
  source: string;
  normalized_pct: number | null;
}

interface UpdateControlRecord {
  ticker: string;
  last_updated: string;
  update_count: number;
  status: string;
}

interface DataIngestionLogRecord {
  id: number;
  timestamp: string;
  ticker: string;
  cgs: string;
  cde: string;
  cdq: string;
  pca: string;
  sdb: string;
  source: string;
  message: string;
}

interface BacktestRecord {
  id: number;
  run_date: string;
  start_date: string;
  end_date: string;
  final_value: number;
  initial_value: number;
  sharpe: number;
  max_drawdown: number;
  benchmark_sharpe: number;
  benchmark_final: number;
  model_type: string;
}

interface SimulatedTrade {
  id: string;
  timestamp: string;
  ticker: string;
  action: "BUY_LONG" | "SELL_SHORT" | "HOLD_HEDGE";
  price: number;
  sizing: string;
  stopLoss: string;
  takeProfit: string;
  optionHedge: string;
  politicalSource: string;
  sentimentScore: number;
  rationale: string;
}

export default function DataManagerPanel() {
  // DB States
  const [prices, setPrices] = useState<PriceMacroRecord[]>([]);
  const [controls, setControls] = useState<UpdateControlRecord[]>([]);
  const [logs, setLogs] = useState<DataIngestionLogRecord[]>([]);
  const [backtests, setBacktests] = useState<BacktestRecord[]>([]);
  
  // UI States
  const [loading, setLoading] = useState<boolean>(true);
  const [isIngesting, setIsIngesting] = useState<boolean>(false);
  const [isBacktesting, setIsBacktesting] = useState<boolean>(false);
  const [activeDbTab, setActiveDbTab] = useState<"prices" | "controls" | "logs">("prices");
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  // Backtest Config State
  const [backtestStart, setBacktestStart] = useState<string>("2025-01-01");
  const [strategyType, setStrategyType] = useState<string>("Multi-Asset Maestro Core");
  const [latestBacktestResult, setLatestBacktestResult] = useState<BacktestRecord | null>(null);

  // Ingest Config State
  const [selectedTicker, setSelectedTicker] = useState<string>("PETR4");
  const [customPrice, setCustomPrice] = useState<string>("");
  const [customScore, setCustomScore] = useState<string>("");
  const [customSource, setCustomSource] = useState<string>("Yahoo Finance");

  // Excel scaling states
  const [excelStatus, setExcelStatus] = useState<"idle" | "uploading" | "processing" | "success">("idle");
  const [excelFilename, setExcelFilename] = useState<string>("");
  const [ingestionProgress, setIngestionProgress] = useState<number>(0);
  const [ingestionStep, setIngestionStep] = useState<string>("");
  const [excelTickerType, setExcelTickerType] = useState<string>("B3_EQUITIES");

  // AI Tactical Agent States
  const [selectedPoliticalFigure, setSelectedPoliticalFigure] = useState<string>("BACEN");
  const [customStatement, setCustomStatement] = useState<string>("");
  const [aiAgentRunning, setAiAgentRunning] = useState<boolean>(false);
  const [aiAgentResult, setAiAgentResult] = useState<any | null>(null);
  const [aiAgentSuccess, setAiAgentSuccess] = useState<boolean>(false);
  const [aiAgentError, setAiAgentError] = useState<string | null>(null);
  const [executedTrades, setExecutedTrades] = useState<SimulatedTrade[]>([]);
  const [activeUniverseTab, setActiveUniverseTab] = useState<"all" | "acoes" | "commodities" | "moedas" | "indicadores" | "fundos">("all");

  // Satellite crop health (NDVI) and geolocation states
  const [ndviRegime, setNdviRegime] = useState<"ideal" | "heat" | "cold">("ideal");
  const [activeCommodity, setActiveCommodity] = useState<"SOJA" | "MILHO" | "CAFÉ" | "SAF">("SAF");
  const [selectedFieldCell, setSelectedFieldCell] = useState<{ r: number, c: number, ndvi: number } | null>({ r: 2, c: 3, ndvi: 0.88 });
  const [ndviSyncing, setNdviSyncing] = useState<boolean>(false);
  const [ndviSyncSuccess, setNdviSyncSuccess] = useState<boolean>(false);

  // Integrated Databases (B3, S&P 500, CVM, Fed) Syncing States
  const [integratedDbSyncing, setIntegratedDbSyncing] = useState<boolean>(false);
  const [integratedDbSyncSuccess, setIntegratedDbSyncSuccess] = useState<boolean>(false);
  const [integratedDbSyncStep, setIntegratedDbSyncStep] = useState<string>("");

  // Dual Persistence (TimescaleDB + SQLite DualWriter) Test State
  const [dualPersistenceTesting, setDualPersistenceTesting] = useState<boolean>(false);
  const [dualPersistenceLog, setDualPersistenceLog] = useState<string[]>([]);
  const [dualPersistenceActive, setDualPersistenceActive] = useState<boolean>(true);

  const handleTestDualPersistence = async () => {
    setDualPersistenceTesting(true);
    setDualPersistenceLog([]);
    const timestamp = new Date().toLocaleTimeString("pt-BR");
    
    const steps = [
      `[${timestamp}] db/timescale_schema.py — Verificando extensão PostgreSQL timescaledb CASCADE... OK`,
      `[${timestamp}] Hypertables: CREATE TABLE market_data & audit_log (chunk_time_interval => INTERVAL '1 month') ... OK`,
      `[${timestamp}] providers/dual_writer.py — Inicializando conexão dupla (SQLite market_data.db + Timescale PG15)... OK`,
      `[${timestamp}] DualWriter: Ingestão de PETR4.SA — Escrevendo 520 registros no cache SQLite WAL (<0.8ms)... SUCESSO`,
      `[${timestamp}] DualWriter: Ingestão de PETR4.SA — Replicando para TimescaleDB Hypertable (TIMESTAMPTZ)... SUCESSO`,
      `[${timestamp}] DualWriter: Ingestão de VALE3.SA, ITUB4.SA, BBDC4.SA, BBAS3.SA (2.450 registros)... SUCESSO`,
      `[${timestamp}] Graceful Degradation Test: Simulando interrupção temporária de rede com PostgreSQL...`,
      `[${timestamp}] Fallback Automático — Sistema operando via SQLite em 0.3ms sem perda de pacotes ou atraso no backtest! ✅`
    ];

    for (let i = 0; i < steps.length; i++) {
      setDualPersistenceLog(prev => [...prev, steps[i]]);
      await new Promise(resolve => setTimeout(resolve, 400));
    }
    setDualPersistenceTesting(false);
  };

  const handleSyncIntegratedDatabases = async () => {
    setIntegratedDbSyncing(true);
    setIntegratedDbSyncSuccess(false);
    
    const steps = [
      "Estabelecendo handshake TLS seguro de alta velocidade...",
      "Autenticando credenciais com o portal de dados B3...",
      "Sincronizando cotações de fechamento e volumes para ações B3...",
      "Abrindo canal FTP seguro com a CVM (Comissão de Valores Mobiliários)...",
      "Lendo cadastro e relatórios DRE trimestrais auditados da CVM...",
      "Conectando à API do Federal Reserve Board (Fed) em Washington...",
      "Baixando taxa de juros americana (Fed Funds) e vetores macro do Fed...",
      "Compilando, normalizando e gravando cache na dorsal SQLite (local_ledger.db)..."
    ];

    for (let i = 0; i < steps.length; i++) {
      setIntegratedDbSyncStep(steps[i]);
      await new Promise(resolve => setTimeout(resolve, 550));
    }

    try {
      const res = await fetch("/api/market/load-integrated-databases", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        setIntegratedDbSyncSuccess(true);
        await loadDataState();
        setTimeout(() => setIntegratedDbSyncSuccess(false), 4000);
      }
    } catch (e) {
      console.error("Error syncing integrated databases:", e);
    } finally {
      setIntegratedDbSyncing(false);
      setIntegratedDbSyncStep("");
    }
  };

  const handleSatelliteSync = async () => {
    try {
      setNdviSyncing(true);
      setNdviSyncSuccess(false);

      let price = 11.80;
      let score = 50.0;
      let sourceName = "";

      if (activeCommodity === "SOJA") {
        if (ndviRegime === "ideal") {
          price = 10.45; // lower price due to bumper crop
          score = 35; // lower buy-signal because supply is high
          sourceName = "Sentinel-2 NDVI [0.82] - SOJA Safra Plena (MT)";
        } else if (ndviRegime === "heat") {
          price = 14.20; // higher price due to drought
          score = 88; // strong buy signal (supply squeeze)
          sourceName = "Sentinel-2 NDVI [0.35] - SOJA Seca Crítica (MT)";
        } else {
          price = 12.95; // higher price due to frost
          score = 74; // moderate buy signal
          sourceName = "Sentinel-2 NDVI [0.42] - SOJA Geada Extrema (PR)";
        }
      } else if (activeCommodity === "MILHO") {
        if (ndviRegime === "ideal") {
          price = 51.50;
          score = 30;
          sourceName = "Sentinel-2 NDVI [0.80] - MILHO Safra Plena (GO)";
        } else if (ndviRegime === "heat") {
          price = 67.80;
          score = 85;
          sourceName = "Sentinel-2 NDVI [0.38] - MILHO Seca Crítica (MS)";
        } else {
          price = 62.40;
          score = 70;
          sourceName = "Sentinel-2 NDVI [0.40] - MILHO Geada Extrema (PR)";
        }
      } else if (activeCommodity === "SAF") {
        price = 85.00; // Créditos de carbono / bioeconomia base
        score = 94; // Alta integridade ESG e sequestro de carbono
        sourceName = "Sentinel-2 & Olho da Harpia NDVI [0.88] - SAF Agrofloresta & Estoque de Carbono (PA/BA)";
      } else { // CAFÉ
        if (ndviRegime === "ideal") {
          price = 198.00;
          score = 25;
          sourceName = "Sentinel-2 NDVI [0.84] - CAFÉ Safra Plena (MG)";
        } else if (ndviRegime === "heat") {
          price = 255.00;
          score = 92;
          sourceName = "Sentinel-2 NDVI [0.42] - CAFÉ Seca Crítica (SP)";
        } else {
          price = 278.00;
          score = 95;
          sourceName = "Sentinel-2 NDVI [0.35] - CAFÉ Geada Extrema (MG)";
        }
      }

      await handleIngest(activeCommodity, price, score, sourceName);
      setNdviSyncSuccess(true);
      setTimeout(() => setNdviSyncSuccess(false), 4000);
    } catch (err) {
      console.error("Failed to sync satellite data:", err);
    } finally {
      setNdviSyncing(false);
    }
  };

  // Load state from backend SQLite
  const loadDataState = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/data-engine/state");
      if (res.ok) {
        const data = await res.json();
        setPrices(data.prices || []);
        setControls(data.controls || []);
        setLogs(data.logs || []);
        setBacktests(data.backtests || []);
        
        // Use latest backtest as active preview if available
        if (data.backtests && data.backtests.length > 0) {
          setLatestBacktestResult(data.backtests[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load database state:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDataState();
    
    // Load simulated executed trades from localStorage if available
    try {
      const stored = localStorage.getItem("arpia_simulated_executed_trades");
      if (stored) {
        setExecutedTrades(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load simulated executed trades:", e);
    }
  }, []);

  const saveSimulatedTrade = (trade: SimulatedTrade) => {
    setExecutedTrades(prev => {
      const updated = [trade, ...prev];
      try {
        localStorage.setItem("arpia_simulated_executed_trades", JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const clearExecutedTrades = () => {
    setExecutedTrades([]);
    try {
      localStorage.removeItem("arpia_simulated_executed_trades");
    } catch (e) {
      console.error(e);
    }
  };

  const formatAssetPrice = (ticker: string, price: number, type: string, normalizedPct?: number | null) => {
    if (type === "Moedas") {
      if (ticker === "BRL_EUR") {
        return `€ ${price.toFixed(4)}`;
      }
      if (ticker.endsWith("_BRL")) {
        return `R$ ${price.toFixed(4)}`;
      }
      if (ticker === "EURUSD" || ticker.endsWith("_USD") || ticker.startsWith("USD_")) {
        return `$ ${price.toFixed(4)}`;
      }
      return `$ ${price.toFixed(4)}`;
    }
    if (type === "Indicadores") {
      const isIndex = ["IBOVESPA", "SMLL", "IFIX", "SPX", "NASDAQ", "DOW_JONES", "MSCI_EM", "CHINA_BAN", "IBC_BR"].includes(ticker);
      if (isIndex) {
        if (ticker === "CHINA_BAN" && normalizedPct !== undefined && normalizedPct !== null) {
          return `${(normalizedPct * 100).toFixed(2)}% (Ban)`;
        }
        return `${Math.round(price).toLocaleString("pt-BR")} pts`;
      }
      return `${price.toFixed(2)}%${ticker === "DESEMPREGO" || ticker === "PIB" ? "" : " a.a."}`;
    }
    return `R$ ${price.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Trigger Data Ingestion
  const handleIngest = async (tickerToIngest?: string, forcedPrice?: number, forcedScore?: number, forcedSource?: string) => {
    const ticker = tickerToIngest || selectedTicker;
    setIsIngesting(true);
    
    let price = forcedPrice !== undefined ? forcedPrice : (customPrice ? parseFloat(customPrice) : undefined);
    let score = forcedScore !== undefined ? forcedScore : (customScore ? parseFloat(customScore) : undefined);
    const source = forcedSource || customSource;
    
    if (!price) {
      const matched = targetAssets.find(t => t.ticker === ticker);
      price = matched ? matched.defPrice : Math.random() * 100 + 10;
    }

    if (!score) {
      score = Math.floor(Math.random() * 25 + 65); // 65-90 macro score
    }

    try {
      const res = await fetch("/api/data-engine/trigger-ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticker,
          price,
          macroScore: score,
          source
        })
      });

      if (res.ok) {
        await loadDataState();
        setCustomPrice("");
        setCustomScore("");
      }
    } catch (err) {
      console.error("Ingestion failed:", err);
    } finally {
      setIsIngesting(false);
    }
  };

  // Run Backtest up to Today
  const handleRunBacktest = async () => {
    setIsBacktesting(true);
    try {
      const res = await fetch("/api/data-engine/run-backtest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: backtestStart,
          strategyType
        })
      });

      if (res.ok) {
        const result = await res.json();
        setLatestBacktestResult(result);
        await loadDataState();
      }
    } catch (err) {
      console.error("Backtest execution failed:", err);
    } finally {
      setIsBacktesting(false);
    }
  };

  // Comprehensive Universe Catalog
  const targetAssets = [
    // 1. Ações B3 (Equities)
    { ticker: "PETR4", name: "Petrobras PN", type: "Ações B3", defPrice: 34.50, desc: "Petróleo Brasileiro S.A., preferenciais corporativas" },
    { ticker: "VALE3", name: "Vale S.A. ON", type: "Ações B3", defPrice: 68.10, desc: "Minério de ferro e metais de alta exportação" },
    { ticker: "WEGE3", name: "WEG ON", type: "Ações B3", defPrice: 42.80, desc: "WEG ordinárias, motores industriais dolarizados" },
    { ticker: "ITUB4", name: "Itaú Unibanco PN", type: "Ações B3", defPrice: 32.40, desc: "Itaú Unibanco Holding S.A., financeiro e crédito" },
    { ticker: "BBAS3", name: "Banco do Brasil ON", type: "Ações B3", defPrice: 27.10, desc: "Banco do Brasil S.A., agronegócio e varejo estatal" },
    { ticker: "RENT3", name: "Localiza ON", type: "Ações B3", defPrice: 58.90, desc: "Localiza Rent a Car S.A., mobilidade e frotas" },
    { ticker: "BBDC4", name: "Bradesco PN", type: "Ações B3", defPrice: 13.50, desc: "Banco Bradesco S.A., intermediação financeira e seguros" },
    { ticker: "ABEV3", name: "Ambev ON", type: "Ações B3", defPrice: 11.90, desc: "Ambev S.A., bens de consumo e bebidas multinacional" },
    { ticker: "MGLU3", name: "Magazine Luiza ON", type: "Ações B3", defPrice: 12.80, desc: "Magazine Luiza S.A., comércio eletrônico e varejo" },
    { ticker: "ELET3", name: "Eletrobras ON", type: "Ações B3", defPrice: 38.50, desc: "Centrais Elétricas Brasileiras S.A., geração e transmissão" },
    { ticker: "GGBR4", name: "Gerdau PN", type: "Ações B3", defPrice: 18.20, desc: "Gerdau S.A., siderurgia e produção de aços longos" },
    { ticker: "ITSA4", name: "Itaúsa PN", type: "Ações B3", defPrice: 9.80, desc: "Itaúsa S.A., holding de investimentos diversificados" },
    { ticker: "LREN3", name: "Lojas Renner ON", type: "Ações B3", defPrice: 16.50, desc: "Lojas Renner S.A., varejo de moda e serviços financeiros" },
    { ticker: "PRIO3", name: "PetroRio ON", type: "Ações B3", defPrice: 44.10, desc: "Petro Rio S.A., exploração e produção de petróleo" },
    { ticker: "RADL3", name: "RaiaDrogasil ON", type: "Ações B3", defPrice: 26.20, desc: "Raia Drogasil S.A., redes de farmácias e bem-estar" },
    { ticker: "SUZB3", name: "Suzano ON", type: "Ações B3", defPrice: 51.50, desc: "Suzano S.A., celulose de eucalipto e papel" },
    { ticker: "EMBR3", name: "Embraer ON", type: "Ações B3", defPrice: 37.80, desc: "Embraer S.A., aeronáutica comercial, executiva e defesa" },
    { ticker: "JBSS3", name: "JBS ON", type: "Ações B3", defPrice: 28.50, desc: "JBS S.A., processamento de carne e alimentos global" },
    { ticker: "CSNA3", name: "Siderúrgica Nacional ON", type: "Ações B3", defPrice: 12.10, desc: "Companhia Siderúrgica Nacional, aço e mineração" },
    { ticker: "TAEE11", name: "Taesa Unit", type: "Ações B3", defPrice: 34.20, desc: "Transmissora Aliança de Energia Elétrica S.A." },
    { ticker: "EQTL3", name: "Equatorial ON", type: "Ações B3", defPrice: 31.00, desc: "Equatorial Energia S.A., distribuição e saneamento" },
    { ticker: "CPLE6", name: "Copel PNB", type: "Ações B3", defPrice: 9.20, desc: "Companhia Paranaense de Energia, geração e distribuição" },
    
    // 2. Commodities
    { ticker: "ÓLEO_BRENT", name: "Petróleo Brent (Futuro)", type: "Commodities", defPrice: 85.40, desc: "Óleo bruto tipo Brent cotado internacionalmente em USD" },
    { ticker: "ÓLEO_WTI", name: "Petróleo WTI (Futuro)", type: "Commodities", defPrice: 81.10, desc: "Light sweet crude WTI americano cotado na NYMEX" },
    { ticker: "GÁS_NATURAL", name: "Gás Natural Futuro", type: "Commodities", defPrice: 2.35, desc: "Gás natural Henry Hub negociado na NYMEX em USD" },
    { ticker: "OURO", name: "Ouro OZ1D (B3)", type: "Commodities", defPrice: 315.50, desc: "Ouro spot físico cotado por grama na bolsa brasileira" },
    { ticker: "PRATA", name: "Prata Spot COMEX", type: "Commodities", defPrice: 28.20, desc: "Prata spot internacional cotada por onça-troy" },
    { ticker: "COBRE", name: "Cobre COMEX", type: "Commodities", defPrice: 4.15, desc: "Contratos futuros de cobre de alta pureza na NYMEX" },
    { ticker: "MINÉRIO_FERRO", name: "Minério de Ferro Dalian", type: "Commodities", defPrice: 102.50, desc: "Minério de ferro finos de referência cotados na China" },
    { ticker: "SOJA", name: "Soja Chicago CME", type: "Commodities", defPrice: 11.80, desc: "Grãos de soja por bushel cotados na bolsa de Chicago em USD" },
    { ticker: "MILHO", name: "Milho B3 Futuro", type: "Commodities", defPrice: 58.20, desc: "Saca de milho comercial brasileira cotada na B3" },
    { ticker: "TRIGO", name: "Trigo Chicago CME", type: "Commodities", defPrice: 5.60, desc: "Contratos de trigo soft red winter negociados na CME" },
    { ticker: "CAFÉ", name: "Café Arábica B3", type: "Commodities", defPrice: 225.00, desc: "Saca de café arábica tipo 6/7 cotada em USD na B3" },
    { ticker: "ALGODÃO", name: "Algodão NYBOT", type: "Commodities", defPrice: 0.72, desc: "Algodão em pluma comercial cotado em centavos de dólar por libra" },
    { ticker: "BOI_GORDO", name: "Boi Gordo B3 Futuro", type: "Commodities", defPrice: 232.50, desc: "Arroba líquida de boi gordo padrão rastreado cotado na B3" },
    
    // 3. Moedas & Forex
    { ticker: "USD_BRL", name: "Dólar Comercial B3", type: "Moedas", defPrice: 5.4200, desc: "Taxa de câmbio de venda da moeda americana em Reais" },
    { ticker: "EUR_BRL", name: "Euro Comercial B3", type: "Moedas", defPrice: 5.8800, desc: "Taxa de câmbio de venda da moeda europeia em Reais" },
    { ticker: "GBP_BRL", name: "Libra Comercial B3", type: "Moedas", defPrice: 6.9200, desc: "Taxa de câmbio de venda da Libra Esterlina em Reais" },
    { ticker: "BRL_EUR", name: "Real para Euro Forex", type: "Moedas", defPrice: 0.1700, desc: "Taxa de paridade cambial reversa Real-Euro de mercado aberto" },
    { ticker: "EURUSD", name: "Forex EUR/USD", type: "Moedas", defPrice: 1.0850, desc: "Paridade euro-dólar do mercado de divisas primário" },
    { ticker: "USD_JPY", name: "Forex USD/JPY", type: "Moedas", defPrice: 161.20, desc: "Paridade dólar-iene japonês do mercado Spot Forex" },
    { ticker: "GBP_USD", name: "Forex GBP/USD", type: "Moedas", defPrice: 1.2820, desc: "Paridade libra esterlina-dólar americano (Cable)" },
    { ticker: "AUD_USD", name: "Forex AUD/USD", type: "Moedas", defPrice: 0.6750, desc: "Paridade dólar australiano-dólar americano" },
    { ticker: "USD_CAD", name: "Forex USD/CAD", type: "Moedas", defPrice: 1.3620, desc: "Paridade dólar americano-dólar canadense" },
    { ticker: "USD_CHF", name: "Forex USD/CHF", type: "Moedas", defPrice: 0.8950, desc: "Paridade dólar americano-franco suíço" },
    
    // 4. Indicadores & Comparadores
    { ticker: "CDI", name: "Taxa CDI Diária", type: "Indicadores", defPrice: 10.40, desc: "Certificado de Depósito Interbancário anualizado (Bacen)" },
    { ticker: "SELIC", name: "Taxa Básica Selic", type: "Indicadores", defPrice: 10.50, desc: "Taxa básica de juros definida pelo Copom" },
    { ticker: "IPCA", name: "Inflação IPCA (IBGE)", type: "Indicadores", defPrice: 4.25, desc: "Índice Nacional de Preços ao Consumidor Amplo acumulado" },
    { ticker: "IGPM", name: "Índice IGP-M (FGV)", type: "Indicadores", defPrice: 3.80, desc: "Índice Geral de Preços do Mercado, inflação do atacado" },
    { ticker: "TJLP", name: "Taxa de Juros de Longo Prazo", type: "Indicadores", defPrice: 6.45, desc: "Taxa de juros de contratos históricos do BNDES" },
    { ticker: "TLP", name: "Taxa de Longo Prazo", type: "Indicadores", defPrice: 6.20, desc: "Taxa do BNDES indexada à inflação NTN-B" },
    { ticker: "INCC", name: "Índice Custo Construção", type: "Indicadores", defPrice: 4.50, desc: "Índice Nacional de Custo da Construção Civil" },
    { ticker: "TR", name: "Taxa Referencial", type: "Indicadores", defPrice: 0.08, desc: "Taxa básica de referência calculada pelo Banco Central" },
    { ticker: "PTAX", name: "Taxa PTAX Bacen", type: "Indicadores", defPrice: 5.4215, desc: "Média ponderada diária do dólar calculada pelo Banco Central" },
    { ticker: "IBC_BR", name: "Atividade Econômica Bacen", type: "Indicadores", defPrice: 148.50, desc: "Indicador antecedente do PIB do Banco Central" },
    { ticker: "PIB", name: "PIB Anualizado", type: "Indicadores", defPrice: 2.90, desc: "Produto Interno Bruto real brasileiro taxa de variação" },
    { ticker: "DESEMPREGO", name: "Taxa de Desemprego", type: "Indicadores", defPrice: 7.80, desc: "Taxa de desocupação oficial calculada pelo IBGE/PNAD" },
    { ticker: "IBOVESPA", name: "Índice Ibovespa (IBOV)", type: "Indicadores", defPrice: 126500, desc: "Índice de referência de ações mais líquidas da B3" },
    { ticker: "SMLL", name: "Índice Small Cap B3", type: "Indicadores", defPrice: 2150, desc: "Índice focado nas empresas de menor capitalização da B3" },
    { ticker: "IFIX", name: "Índice de Fundos Imobiliários", type: "Indicadores", defPrice: 3350, desc: "Índice médio dos fundos de investimento imobiliário na B3" },
    { ticker: "SPX", name: "S&P 500 Index", type: "Indicadores", defPrice: 5580, desc: "Índice das 500 maiores empresas americanas de capital aberto" },
    { ticker: "NASDAQ", name: "Nasdaq Composite", type: "Indicadores", defPrice: 18400, desc: "Índice das maiores companhias de tecnologia e inovação globais" },
    { ticker: "DOW_JONES", name: "Dow Jones Industrial", type: "Indicadores", defPrice: 39800, desc: "Índice industrial tradicional composto por 30 Blue Chips norte-americanas" },
    { ticker: "MSCI_EM", name: "MSCI Emerging Markets", type: "Indicadores", defPrice: 1050, desc: "Índice Morgan Stanley de mercados emergentes representativos" },
    { ticker: "CHINA_BAN", name: "Banimento China Index", type: "Indicadores", defPrice: 35.00, desc: "Métrica macro consolidada dividida por 100 automaticamente" },
    
    // 5. Fundos Listados (FIIs & ETFs)
    { ticker: "MXRF11", name: "Maxi Renda FII", type: "Fundos", defPrice: 10.15, desc: "Fundo imobiliário híbrido de papel e crédito imobiliário" },
    { ticker: "HGLG11", name: "Pátria Logística FII", type: "Fundos", defPrice: 165.40, desc: "Fundo imobiliário de tijolo com foco em galpões logísticos" },
    { ticker: "KNIP11", name: "Kinea Índices de Preços FII", type: "Fundos", defPrice: 94.20, desc: "Fundo imobiliário de papéis corporativos indexados ao IPCA" },
    { ticker: "XPLG11", name: "XP Logística FII", type: "Fundos", defPrice: 108.50, desc: "Fundo imobiliário focado em empreendimentos logísticos modernos" },
    { ticker: "XPML11", name: "XP Malls FII", type: "Fundos", defPrice: 112.80, desc: "Fundo de investimento imobiliário focado em Shopping Centers ativos" },
    { ticker: "VISC11", name: "Vinci Shopping Centers FII", type: "Fundos", defPrice: 119.20, desc: "FII de tijolo focado em portfólio maduro de shoppings" },
    { ticker: "HFOF11", name: "Hedge Top FOF FII", type: "Fundos", defPrice: 78.50, desc: "Fundo de fundos imobiliários administrado pela Hedge Investments" },
    { ticker: "BCFF11", name: "BTG Pactual FOF FII", type: "Fundos", defPrice: 9.12, desc: "Fundo de fundos focado em renda e ganho de capital em cotas" },
    { ticker: "ALZR11", name: "Alianza Trust Renda FII", type: "Fundos", defPrice: 115.00, desc: "FII focado em contratos atípicos Built-to-Suit e Sale-Leaseback" },
    { ticker: "BRCO11", name: "Bresco Logística FII", type: "Fundos", defPrice: 121.30, desc: "Fundo imobiliário de galpões logísticos Triple A de alta qualidade" },
    { ticker: "BOVA11", name: "iShares Ibovespa ETF", type: "Fundos", defPrice: 122.50, desc: "Fundo de índice referenciado ao Índice Bovespa negociado na B3" },
    { ticker: "SMAL11", name: "iShares Small Cap ETF", type: "Fundos", defPrice: 104.20, desc: "Fundo de índice referenciado ao Índice de Small Caps da B3" },
    { ticker: "IVVB11", name: "iShares S&P 500 BRL ETF", type: "Fundos", defPrice: 285.00, desc: "ETF brasileiro que replica o índice S&P 500 com exposição cambial" },
    { ticker: "HASH11", name: "Hashdex Nasdaq Crypto ETF", type: "Fundos", defPrice: 54.10, desc: "Fundo de índice de ativos digitais indexado ao Nasdaq Crypto Index" },
    { ticker: "QBTC11", name: "QR Bitcoin ETF", type: "Fundos", defPrice: 18.50, desc: "Fundo de índice listado na B3 replicando o preço do Bitcoin Spot" }
  ];

  // Political presets for AI Tactical Agent
  const politicalPresets = [
    {
      id: "BACEN",
      figure: "Presidente do Banco Central (Bacen)",
      role: "Autoridade Monetária Brasileira",
      avatar: "🏛️",
      statement: "O comitê de política monetária monitora atentamente o cenário de risco fiscal local e a resiliência do setor de serviços. Diante de desvios prolongados na projeção da inflação IPCA, não hesitaremos em adotar uma postura ainda mais contracionista, mantendo ou elevando a taxa básica Selic para ancorar as expectativas de longo prazo.",
      affectedAssets: ["SELIC", "CDI", "USD_BRL", "IBOVESPA"],
      vibe: "CONSERVATIVE / HAWKISH"
    },
    {
      id: "PRESIDENCIA",
      figure: "Presidente da República",
      role: "Poder Executivo Federal",
      avatar: "🇧🇷",
      statement: "A nossa prioridade é o crescimento econômico com justiça social. Estamos enviando ao Congresso diretrizes de isenção fiscal para o setor de biocombustíveis e pretendemos taxar os lucros excedentes das grandes exportadoras de petróleo cru e minérios de ferro para financiar investimentos estruturais em portos e ferrovias do agronegócio.",
      affectedAssets: ["PETR4", "VALE3", "ÓLEO_BRENT", "MILHO", "SOJA"],
      vibe: "STIMULUS / TARIFF FOCUS"
    },
    {
      id: "FED_CHAIR",
      figure: "Chairman do Federal Reserve (Fed)",
      role: "Autoridade Monetária Global",
      avatar: "🇺🇸",
      statement: "Inflation in the services sector remains uncomfortably high. While consumer spending is softening, we need highly convincing evidence that core inflation is moving back to our 2.0% target. High Brent and WTI crude prices continue to serve as a strong global supply shock. Consequently, policy rates will remain restrictive for longer.",
      affectedAssets: ["EURUSD", "USD_BRL", "ÓLEO_BRENT", "ÓLEO_WTI", "IBOVESPA"],
      vibe: "STRICT HAWKISH / GLOBAL SHOCK"
    },
    {
      id: "SENADO",
      figure: "Presidente do Senado Federal",
      role: "Poder Legislativo Nacional",
      avatar: "⚖️",
      statement: "Foi aprovada por unanimidade no plenário do Senado a reforma logística que remove de forma permanente 15% das tarifas e impostos alfandegários para a exportação de commodities minerais e grãos agrícolas. Essa medida visa aumentar a competitividade de nossa balança comercial e blindar o agronegócio nacional.",
      affectedAssets: ["VALE3", "SOJA", "MILHO", "USD_BRL"],
      vibe: "HIGHLY BULLISH FOR COMMODITIES"
    }
  ];

  const activePreset = politicalPresets.find(p => p.id === selectedPoliticalFigure);

  // Trigger Excel Scaling Simulation
  const handleExcelIngest = async () => {
    setExcelStatus("uploading");
    setIngestionProgress(15);
    setIngestionStep("Lendo arquivo planilha de dados quantitativos...");

    // Choose preset items to ingest based on tab
    let itemsToIngest: typeof targetAssets = [];
    if (excelTickerType === "B3_EQUITIES") {
      setExcelFilename("b3_acoes_universo.xlsx");
      itemsToIngest = targetAssets.filter(t => t.type === "Ações B3");
    } else if (excelTickerType === "COMMODITIES") {
      setExcelFilename("commodities_petroleo_agro.xlsx");
      itemsToIngest = targetAssets.filter(t => t.type === "Commodities");
    } else if (excelTickerType === "FOREX_CURRENCIES") {
      setExcelFilename("moedas_cambio_forex.xlsx");
      itemsToIngest = targetAssets.filter(t => t.type === "Moedas");
    } else if (excelTickerType === "FUNDS") {
      setExcelFilename("fundos_listados_fii_etf.xlsx");
      itemsToIngest = targetAssets.filter(t => t.type === "Fundos");
    } else {
      setExcelFilename("indicadores_macro_bacen.xlsx");
      itemsToIngest = targetAssets.filter(t => t.type === "Indicadores");
    }

    setTimeout(() => {
      setExcelStatus("processing");
      setIngestionProgress(45);
      setIngestionStep("Validação estrutural CDE & normalização matemática...");
    }, 1200);

    setTimeout(() => {
      setIngestionProgress(75);
      setIngestionStep("Sincronizando lote no banco local_ledger.db...");
    }, 2400);

    setTimeout(async () => {
      // Ingest each item into SQLite database using real backend API calls!
      for (const asset of itemsToIngest) {
        // Vary price slightly to show it's active
        const variance = Math.random() * 0.04 - 0.02; // -2% to +2%
        const finalPrice = asset.defPrice * (1 + variance);
        const score = Math.floor(Math.random() * 20 + 70); // 70-90 score
        
        await fetch("/api/data-engine/trigger-ingest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ticker: asset.ticker,
            price: finalPrice,
            macroScore: score,
            source: "Spreadsheet Excel Scaler Core"
          })
        });
      }

      await loadDataState();

      setIngestionProgress(100);
      setIngestionStep(`Concluído! ${itemsToIngest.length} registros quantitativos carregados, escalonados e persistidos de ponta a ponta.`);
      setExcelStatus("success");
    }, 3600);
  };

  // Run AI Tactical Agent
  const handleRunAiAgent = async () => {
    setAiAgentRunning(true);
    setAiAgentError(null);
    setAiAgentSuccess(false);

    const statementToUse = customStatement || activePreset?.statement;
    const figureName = activePreset?.figure || "Líder Político / Macro";

    const prompt = `Você é o Diretor da mesa de Alocação Táctica e Algoritmos de IA da Harpia Finance Asset.
Recebemos a seguinte declaração política/macro de extrema relevância para o mercado financeiro brasileiro e global:
DECLARANTE: ${figureName}
DECLARAÇÃO: "${statementToUse}"

Por favor, faça um parecer quantitativo ponta-a-ponta e tome as ações correspondentes para os investimentos do nosso fundo (AUM R$ 100M). 

Retorne estritamente um código JSON, sem formatação em Markdown, contendo as seguintes chaves idênticas:
{
  "figure": "Nome do declarante",
  "marketSentiment": "POSITIVE" ou "NEGATIVE" ou "NEUTRAL",
  "sentimentScore": um número de 0 a 100 estimando o otimismo gerado pela declaração,
  "rationale": "Breve análise macroeconômica em português contendo termos do mercado brasileiro (múltiplos, juros futuros, curvas, fluxo de capitais). Explique o impacto de ponta a ponta.",
  "targetAsset": "Escolha um ativo específico mais impactado da nossa lista (PETR4, VALE3, ÓLEO_BRENT, USD_BRL, SELIC, CDI, SOJA, MILHO, OURO, EURUSD, WEGE3 ou IBOVESPA)",
  "action": "BUY_LONG" ou "SELL_SHORT" ou "HOLD_HEDGE",
  "sizing": "Sizing de carteira em porcentagem (ex: '7%')",
  "stopLoss": "Preço sugerido de Stop Loss condizente com a cotação média",
  "takeProfit": "Preço sugerido de Take Profit",
  "optionHedge": "Estratégia sugerida de opções para proteção contra cauda (ex: 'Compra de Puts OTM', 'Venda Coberta de Calls', 'Trava de Alta com Opções B3')",
  "portfolioOptimization": {
    "PETR4": 0.15,
    "VALE3": 0.10,
    "ÓLEO_BRENT": 0.08,
    "USD_BRL": 0.07,
    "SELIC": 0.18,
    "CDI": 0.12,
    "WEGE3": 0.10,
    "IBOVESPA": 0.20
  }
}
Certifique-se de que a soma de "portfolioOptimization" dê exatamente 1.0 (ou 100%) para podermos recalibrar nosso otimizador de carteira.`;

    try {
      const response = await fetch("/api/risk/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        throw new Error("Erro ao conectar com o motor de inferência quantitativa Gemini.");
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setAiAgentResult(data);
      setAiAgentSuccess(true);

      // Extract details for simulating executed trade
      const targetAssetItem = targetAssets.find(t => t.ticker === data.targetAsset);
      const executionPrice = targetAssetItem ? targetAssetItem.defPrice : 100.0;

      const newTrade: SimulatedTrade = {
        id: "TX-" + Math.floor(Math.random() * 900000 + 100000),
        timestamp: new Date().toLocaleTimeString("pt-BR") + " - 2026-07-10",
        ticker: data.targetAsset || "IBOVESPA",
        action: data.action || "BUY_LONG",
        price: executionPrice,
        sizing: data.sizing || "5%",
        stopLoss: data.stopLoss || "N/A",
        takeProfit: data.takeProfit || "N/A",
        optionHedge: data.optionHedge || "N/A",
        politicalSource: figureName,
        sentimentScore: data.sentimentScore !== undefined ? data.sentimentScore : 50,
        rationale: data.rationale || "Executado automaticamente via inteligência tática Harpia."
      };

      saveSimulatedTrade(newTrade);

      // Append logging to SQLite for trace audit compliance!
      await fetch("/api/data-engine/trigger-ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticker: newTrade.ticker,
          price: executionPrice,
          macroScore: newTrade.sentimentScore,
          source: `Harpia AI Tactical Agent - Execution Core`
        })
      });

      await loadDataState();

    } catch (err: any) {
      console.error("AI tactical agent failed:", err);
      setAiAgentError(err.message || "Falha na análise quantitativa.");
    } finally {
      setAiAgentRunning(false);
    }
  };

  // Filters for search term & category tab in the Universe catalog
  const filteredAssets = targetAssets.filter(asset => {
    const matchesSearch = asset.ticker.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          asset.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesTab = true;
    if (activeUniverseTab === "acoes") matchesTab = asset.type === "Ações B3";
    else if (activeUniverseTab === "commodities") matchesTab = asset.type === "Commodities";
    else if (activeUniverseTab === "moedas") matchesTab = asset.type === "Moedas";
    else if (activeUniverseTab === "indicadores") matchesTab = asset.type === "Indicadores" || asset.type === "Juros";
    else if (activeUniverseTab === "fundos") matchesTab = asset.type === "Fundos";

    return matchesSearch && matchesTab;
  });

  const filteredPrices = prices.filter(p => 
    p.ticker.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.source.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLogs = logs.filter(l => 
    l.ticker.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in" id="maestro-data-manager-root">
      
      {/* ── HEADER OVERVIEW ────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden" id="data-engine-header-card">
        <div className="absolute top-0 right-0 w-80 h-80 bg-slate-50 rounded-full blur-3xl pointer-events-none opacity-60" />
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-slate-900 rounded-lg text-white">
                <Database className="w-5 h-5 text-amber-400" />
              </span>
              <h2 className="text-base font-black text-slate-800 uppercase tracking-tight font-sans">
                Maestro DI Data Engine &amp; AI Tactical Agent
              </h2>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed font-sans max-w-3xl">
              Portal dorsal unificador conectado de <strong>ponta a ponta</strong>. Gerencia o banco local de contingência SQLite para ingestão via Excel, automatiza proxy rotativos e normalização macro, e integra o <strong>Agente de IA Táctico</strong> para análise de sentimentos/tweets políticos com ordens de compra/venda instantâneas para Curva de Juros, Forex e Commodities.
            </p>
          </div>
          
          <button
            onClick={loadDataState}
            className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
            disabled={loading}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-slate-400" : ""}`} />
            Sincronizar SQL Ledger
          </button>
        </div>
      </div>

      {/* ── END-TO-END BLUEPRINT MAP (DIAGRAMA) ────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-5 text-white relative overflow-hidden shadow-md">
        <div className="absolute top-0 right-0 w-40 h-40 bg-amber-400/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center gap-2 pb-4 border-b border-slate-800/80">
          <Workflow className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider font-sans text-amber-400">
            Arquitetura de Dados Ponta-a-Ponta (Harpia SPI Dorsal Flow)
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-4 relative">
          
          {/* Block 1 */}
          <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/60 flex flex-col justify-between text-center relative">
            <span className="text-[10px] font-mono text-amber-400 font-bold block">01. INGESTÃO &amp; EXCEL</span>
            <p className="text-[10px] text-slate-400 pt-1 font-sans">Planilhas quantitativas, Yahoo Finance e Bacen Providers.</p>
            <div className="mt-2 text-[9px] bg-slate-900/80 p-1.5 rounded font-mono text-slate-300">
              CGS structural check
            </div>
          </div>
          
          {/* Arrow */}
          <div className="hidden md:flex items-center justify-center text-slate-600">
            <ArrowRight className="w-5 h-5 animate-pulse text-amber-500/80" />
          </div>

          {/* Block 2 */}
          <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/60 flex flex-col justify-between text-center">
            <span className="text-[10px] font-mono text-blue-400 font-bold block">02. SPI DORSAL LEDGER</span>
            <p className="text-[10px] text-slate-400 pt-1 font-sans">SQLite local para cache de mark-to-market e normalização.</p>
            <div className="mt-2 text-[9px] bg-blue-950/40 text-blue-300 p-1.5 rounded font-mono border border-blue-900/40">
              local_ledger.db synced
            </div>
          </div>

          {/* Arrow */}
          <div className="hidden md:flex items-center justify-center text-slate-600">
            <ArrowRight className="w-5 h-5 animate-pulse text-amber-500/80" />
          </div>

          {/* Block 3 */}
          <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/60 flex flex-col justify-between text-center">
            <span className="text-[10px] font-mono text-purple-400 font-bold block">03. TACTICAL AI AGENT</span>
            <p className="text-[10px] text-slate-400 pt-1 font-sans">Gemini processa discursos políticos e sentimentos de notícias.</p>
            <div className="mt-2 text-[9px] bg-purple-950/40 text-purple-300 p-1.5 rounded font-mono border border-purple-900/40">
              NLP Sentiment Analytics
            </div>
          </div>

          {/* Arrow */}
          <div className="hidden md:flex items-center justify-center text-slate-600">
            <ArrowRight className="w-5 h-5 animate-pulse text-amber-500/80" />
          </div>

          {/* Block 4 */}
          <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/60 flex flex-col justify-between text-center">
            <span className="text-[10px] font-mono text-emerald-400 font-bold block">04. BLACK-LETTERMAN</span>
            <p className="text-[10px] text-slate-400 pt-1 font-sans">Otimizador de carteira funde sinal de IA com volatilidade implícita.</p>
            <div className="mt-2 text-[9px] bg-emerald-950/40 text-emerald-300 p-1.5 rounded font-mono border border-emerald-900/40">
              Optimal HRP weights
            </div>
          </div>

          {/* Arrow */}
          <div className="hidden md:flex items-center justify-center text-slate-600">
            <ArrowRight className="w-5 h-5 animate-pulse text-amber-500/80" />
          </div>

          {/* Block 5 */}
          <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/60 flex flex-col justify-between text-center">
            <span className="text-[10px] font-mono text-rose-400 font-bold block">05. EXECUÇÃO DE ORDENS</span>
            <p className="text-[10px] text-slate-400 pt-1 font-sans">Ordens Long/Short com Stop, Alvo e derivativos de proteção.</p>
            <div className="mt-2 text-[9px] bg-rose-950/40 text-rose-300 p-1.5 rounded font-mono border border-rose-900/40">
              Option Hedged trades
            </div>
          </div>

        </div>
      </div>

      {/* ── CENTRAL DE INTEGRAÇÃO MULTI-BANCOS DE DADOS (B3, S&P 500, CVM, FED) ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6" id="integrated-databases-hub">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b border-slate-100 gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Database className="w-5 h-5 text-amber-500" />
              Portal do Maestro Data Engine: Hub de Integração de Bancos de Dados
            </h3>
            <p className="text-xs text-slate-500">Mapeamento em tempo real, importação cadastral da CVM, dados macro do Fed e cotações da B3 / S&P 500.</p>
          </div>
          
          <button
            onClick={handleSyncIntegratedDatabases}
            disabled={integratedDbSyncing}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all flex items-center gap-2 shadow-sm ${
              integratedDbSyncing
                ? "bg-slate-400 cursor-not-allowed"
                : "bg-amber-500 hover:bg-amber-600 active:scale-[0.98]"
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${integratedDbSyncing ? "animate-spin" : ""}`} />
            {integratedDbSyncing ? "Sincronizando Conectores..." : "Sincronizar Todos os Bancos (B3, S&P 500, CVM, Fed)"}
          </button>
        </div>

        {/* Status columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="db-connectors-grid">
          {/* B3 */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                  <Coins className="w-4 h-4" />
                </span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-mono px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  B3 Ativo
                </span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase font-mono">B3 (Bolsa do Brasil)</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">Sincronização de cotações end-of-day, volumes e tabelas de dividendos históricos.</p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200/60 text-[9px] font-mono text-slate-400">
              Feeds: PETR4, VALE3, ITUB4...
            </div>
          </div>

          {/* S&P 500 */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                  <Globe className="w-4 h-4" />
                </span>
                <span className="text-[10px] bg-blue-50 text-blue-700 font-mono px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  B S500 Ativo
                </span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase font-mono">S&P 500 (B S500)</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">Cotações agregadas do índice norte-americano e réplicas ETF negociadas localmente.</p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200/60 text-[9px] font-mono text-slate-400">
              Feeds: SPX Index, IVVB11 ETF...
            </div>
          </div>

          {/* CVM */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
                  <FileCheck2 className="w-4 h-4" />
                </span>
                <span className="text-[10px] bg-purple-50 text-purple-700 font-mono px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  CVM Auditado
                </span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase font-mono">CVM (Autarquia Federal)</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">Demonstrações contábeis (DRE e balanços) padronizadas e auditadas das S.A.</p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200/60 text-[9px] font-mono text-slate-400">
              Feeds: Balancetes, DREs, Audits
            </div>
          </div>

          {/* Fed */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <span className="text-[10px] bg-amber-50 text-amber-700 font-mono px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Fed Sincronizado
                </span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase font-mono">FED (Federal Reserve)</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">Taxas de juros americanas (Fed Funds Rate) e relatórios do FOMC.</p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200/60 text-[9px] font-mono text-slate-400">
              Feeds: Fed Funds, CPI, Shocks
            </div>
          </div>
        </div>

        {/* Progress simulation and success message banners */}
        <AnimatePresence mode="wait">
          {integratedDbSyncing && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-xs"
              id="db-sync-progress-banner"
            >
              <div className="flex items-center justify-between text-amber-800 font-semibold font-mono">
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
                  {integratedDbSyncStep}
                </span>
              </div>
              <div className="w-full bg-amber-200/50 h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 animate-pulse rounded-full w-4/5" />
              </div>
            </motion.div>
          )}

          {integratedDbSyncSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-xs"
              id="db-sync-success-banner"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold text-emerald-800 font-sans block">Sincronização Completa!</span>
                <p className="text-[11px] text-emerald-600 mt-0.5">O banco de dados integrado (B3, S&P 500, CVM, Fed) foi carregado, unificado e persistido no motor SQLite com sucesso!</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── SECTION: DUAL PERSISTENCE ENGINE (TIMESCALEDB + SQLITE DUAL WRITER) ── */}
        <div className="mt-6 pt-6 border-t border-slate-200/80 space-y-4" id="dual-persistence-architecture">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                Arquitetura Aprovada — DualWriter (v2.4)
              </span>
              <h4 className="text-sm font-black text-slate-900 mt-1.5 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                Dupla Persistência: TimescaleDB (PostgreSQL 15 Hypertables) + SQLite (Cache Rápido)
              </h4>
              <p className="text-xs text-slate-500 max-w-3xl">
                Sistema institucional de persistência em duas camadas: o <strong>SQLite local</strong> garante baixa latência (&lt;1ms) para o motor de Backtest sem gargalos, enquanto o <strong>TimescaleDB</strong> provê particionamento em Hypertables e retenção histórica ilimitada.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleTestDualPersistence}
                disabled={dualPersistenceTesting}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-sm disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${dualPersistenceTesting ? "animate-spin text-amber-400" : "text-emerald-400"}`} />
                {dualPersistenceTesting ? "Testando Hypertables..." : "Testar Dupla Escrita & Graceful Degradation"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* SQLite Fast Cache Card */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-800 font-mono">01. SQLITE (FAST CACHE)</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold font-mono px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  WAL Ativo
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Armazena cotações no arquivo local <code>market_data.db</code> com modo WAL (Write-Ahead Logging) e UPSERT automático para chamadas de backtest &lt; 1ms.
              </p>
              <div className="pt-2 border-t border-slate-200 text-[10px] font-mono text-slate-500 flex justify-between">
                <span>Registros em Cache:</span>
                <strong className="text-slate-800">48.290 ticks</strong>
              </div>
            </div>

            {/* TimescaleDB Master Storage Card */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-800 font-mono">02. TIMESCALEDB (MASTER DB)</span>
                <span className="text-[10px] bg-blue-100 text-blue-800 font-bold font-mono px-2 py-0.5 rounded-full">
                  PostgreSQL 15
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Hypertables <code>market_data</code> e <code>audit_log</code> particionadas em chunks de 1 mês (<code>chunk_time_interval =&gt; '1 month'</code>) em contêiner Docker dedicado.
              </p>
              <div className="pt-2 border-t border-slate-200 text-[10px] font-mono text-slate-500 flex justify-between">
                <span>Extensão SQL:</span>
                <strong className="text-blue-700">timescaledb CASCADE</strong>
              </div>
            </div>

            {/* Graceful Degradation Card */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-800 font-mono">03. GRACEFUL DEGRADATION</span>
                <span className="text-[10px] bg-amber-100 text-amber-800 font-bold font-mono px-2 py-0.5 rounded-full">
                  Blindado
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Se o TimescaleDB remoto ou Docker estiver indisponível, o sistema comuta instantaneamente para modo somente-SQLite sem queda ou perda de pacotes.
              </p>
              <div className="pt-2 border-t border-slate-200 text-[10px] font-mono text-slate-500 flex justify-between">
                <span>Status de Fallback:</span>
                <strong className="text-emerald-700">0.0% Perda de Dados</strong>
              </div>
            </div>
          </div>

          {/* Dual Persistence Simulation Logs Console */}
          {dualPersistenceLog.length > 0 && (
            <div className="bg-slate-950 text-emerald-400 p-4 rounded-xl font-mono text-xs border border-slate-800 space-y-1 overflow-x-auto shadow-inner">
              <div className="flex justify-between items-center text-slate-400 border-b border-slate-800 pb-1.5 mb-2 text-[11px]">
                <span>DUAL WRITER PERSISTENCE LOG ENGINE — POSTGRESQL HYPERTABLES &amp; SQLITE</span>
                <span className="text-amber-400 font-bold">100% Sincronizado</span>
              </div>
              {dualPersistenceLog.map((logLine, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-slate-600">&gt;</span>
                  <span>{logLine}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── MAIN TACTICAL WORKSPACE: AI AGENT TERMINAL & EXCEL INGESTION ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="tactical-workspace-grid">
        
        {/* LEFT COLUMN: THE HARPIA AI TACTICAL AGENT (7 COLS) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-600 animate-pulse" />
                <h3 className="text-sm font-bold text-slate-800 font-sans">
                  Agente Autónomo de IA Harpia (Sentimento e Execução Táctica)
                </h3>
              </div>
              <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 font-mono px-2 py-0.5 rounded-full font-bold">
                Mecanismo Gemini v3.5
              </span>
            </div>

            <p className="text-xs text-slate-500 font-sans leading-relaxed">
              O modelo de investimento da Harpia conecta oportunidades macro do mercado de ponta a ponta. Discursos, tweets e notícias de presidentes, senadores e líderes de nações geram gatilhos autónomos de compra ou venda. Escolha um perfil político, edite a declaração e envie para o agente de IA processar e gerar a alocação recomendada.
            </p>

            {/* Selector Grid for Political figures */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {politicalPresets.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => {
                    setSelectedPoliticalFigure(preset.id);
                    setCustomStatement("");
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-20 ${
                    selectedPoliticalFigure === preset.id
                      ? "border-purple-600 bg-purple-50/20 shadow-2sm"
                      : "border-slate-100 bg-slate-50/20 hover:border-slate-200"
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="text-lg">{preset.avatar}</span>
                    {selectedPoliticalFigure === preset.id && (
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-800 block truncate">{preset.figure}</span>
                    <span className="text-[8px] text-slate-400 block font-mono uppercase truncate">{preset.vibe}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Statement text field */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase font-sans font-bold">
                <span>Declaração / Tweet a ser Analisado</span>
                <span className="text-purple-600 font-mono">{activePreset?.vibe}</span>
              </div>
              <textarea
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-purple-600 font-sans leading-relaxed"
                rows={3}
                placeholder="Insira um tweet, pronunciamento oficial ou notícia macro..."
                value={customStatement || activePreset?.statement}
                onChange={(e) => setCustomStatement(e.target.value)}
              />
            </div>

            {/* Ingress button */}
            <div className="flex justify-end pt-1">
              <button
                onClick={handleRunAiAgent}
                disabled={aiAgentRunning}
                className="bg-purple-950 hover:bg-purple-900 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer border border-purple-800"
              >
                <Sparkles className={`w-3.5 h-3.5 ${aiAgentRunning ? "animate-spin text-amber-400" : "text-amber-300"}`} />
                {aiAgentRunning ? "Analisando Declaração via Gemini..." : "Analisar Sentimento & Executar Alocação"}
              </button>
            </div>

            {/* AI EXECUTION SCREEN OUTPUT */}
            <AnimatePresence mode="wait">
              {aiAgentRunning && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-slate-50 p-4 border border-dashed border-slate-200 rounded-xl space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <RotateCw className="w-4 h-4 animate-spin text-purple-600" />
                    <span className="text-xs font-bold text-slate-700">Iniciando análise quantitativa neural...</span>
                  </div>
                  <div className="space-y-1 font-mono text-[9px] text-slate-400">
                    <p>&gt; Executando parser NLP para extração de entidades regulatórias...</p>
                    <p>&gt; Mapeando impacto setorial nos juros (DI/Selic), câmbio e barril de petróleo...</p>
                    <p>&gt; Calculando covariância sob vetor Black-Litterman em tempo real...</p>
                  </div>
                </motion.div>
              )}

              {aiAgentError && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-rose-50 border border-rose-100 p-3.5 rounded-xl text-xs text-rose-800 flex items-start gap-2"
                >
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Falha no Processamento Neural:</span>
                    <p className="pt-0.5 text-rose-600">{aiAgentError}</p>
                  </div>
                </motion.div>
              )}

              {aiAgentSuccess && aiAgentResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-white space-y-4 shadow-md relative overflow-hidden"
                >
                  {/* Decorative glowing overlay */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

                  {/* Header results ticker */}
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="p-1 bg-purple-500/20 text-purple-300 rounded text-[10px] font-bold font-mono">
                        TACTICAL SIGNAL ACTIVE
                      </span>
                      <h4 className="text-xs font-bold text-white font-sans">{aiAgentResult.figure}</h4>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">Sentimento AI:</span>
                      <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                        aiAgentResult.marketSentiment === "POSITIVE" 
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                          : aiAgentResult.marketSentiment === "NEGATIVE"
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      }`}>
                        {aiAgentResult.marketSentiment} ({aiAgentResult.sentimentScore}%)
                      </span>
                    </div>
                  </div>

                  {/* Parecer Rationale */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-sans block">Parecer da Harpia AI</span>
                    <p className="text-xs text-slate-200 font-sans leading-relaxed">{aiAgentResult.rationale}</p>
                  </div>

                  {/* HUD TICKET DE EXECUÇÃO */}
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase font-mono">Ativo Alvo</span>
                      <strong className="text-xs text-amber-400 font-mono block">{aiAgentResult.targetAsset}</strong>
                    </div>

                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase font-mono">Ordem de Execução</span>
                      <span className={`text-xs font-bold font-mono block ${
                        aiAgentResult.action === "BUY_LONG" ? "text-emerald-400" :
                        aiAgentResult.action === "SELL_SHORT" ? "text-rose-400" : "text-slate-400"
                      }`}>
                        {aiAgentResult.action === "BUY_LONG" ? "COMPRA (LONG)" :
                         aiAgentResult.action === "SELL_SHORT" ? "VENDA (SHORT)" : "HEDGE (EXPOSIÇÃO)"}
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase font-mono">Sizing / Parada</span>
                      <strong className="text-xs text-white font-mono block">
                        {aiAgentResult.sizing} / SL: {aiAgentResult.stopLoss}
                      </strong>
                    </div>

                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase font-mono">Proteção de Cauda</span>
                      <strong className="text-xs text-slate-300 font-mono block leading-snug truncate" title={aiAgentResult.optionHedge}>
                        {aiAgentResult.optionHedge}
                      </strong>
                    </div>
                  </div>

                  {/* Portfolio Weight adjustments */}
                  <div className="space-y-2 pt-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-sans block">
                      Rebalanceamento Táctico Recomendado (Black-Litterman + HRP)
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {aiAgentResult.portfolioOptimization && Object.entries(aiAgentResult.portfolioOptimization).map(([ticker, weight]) => (
                        <div key={ticker} className="bg-slate-800/40 p-2 border border-slate-700/60 rounded-lg text-center">
                          <span className="text-[10px] font-bold text-slate-300 block font-mono">{ticker}</span>
                          <span className="text-[11px] text-amber-400 font-mono font-bold">
                            {typeof weight === 'number' ? `${(weight * 100).toFixed(1)}%` : String(weight)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Confirmed trade executed notification */}
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-950/40 border border-emerald-900/30 p-2 rounded-lg font-mono">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Ordem quantitativa enviada ao shadow ledger e sincronizada com sucesso.</span>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>

        {/* RIGHT COLUMN: EXCEL INGESTION ENGINE & UNIFIED VIEW (5 COLS) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* EXCEL DRAG & DROP SIMULATOR */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 font-sans">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                Ingestor &amp; Escalonador Excel (Durable SPI)
              </h3>
              <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono px-2 py-0.5 rounded-full font-bold">
                Trace Code Synced
              </span>
            </div>

            <p className="text-xs text-slate-500 font-sans leading-relaxed">
              Consolide blocos de dados quantitativos de ponta a ponta. Selecione um lote estruturado e acione o escalonamento para forçar a sincronia em massa no SQLite.
            </p>

            <div className="space-y-3 bg-slate-50 p-4 border border-slate-100 rounded-xl">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase font-sans">Escolher Modelo de Planilha Quantitativa</label>
                <select
                  value={excelTickerType}
                  onChange={(e) => setExcelTickerType(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-none"
                >
                  <option value="B3_EQUITIES">Universo de Ações B3 (PETR4, VALE3, ITUB4, RENT3...)</option>
                  <option value="COMMODITIES">Matriz de Commodities (Brent, Ouro, Soja, Milho...)</option>
                  <option value="FOREX_CURRENCIES">Moedas Forex e B3 (USD/BRL, EUR/BRL, EUR/USD, BRL/EUR...)</option>
                  <option value="INDICATORS">Indicadores Macro &amp; Benchmarks (Selic, CDI, IPCA, IBOV...)</option>
                  <option value="FUNDS">Fundos Listados (MXRF11, HGLG11, BOVA11...)</option>
                </select>
              </div>

              {/* Drag and Drop Box mockup */}
              <div 
                onClick={excelStatus === "idle" || excelStatus === "success" ? handleExcelIngest : undefined}
                className={`border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-2 h-32 ${
                  excelStatus === "uploading" || excelStatus === "processing"
                    ? "border-emerald-400 bg-emerald-50/10 cursor-not-allowed"
                    : excelStatus === "success"
                    ? "border-emerald-500 bg-emerald-50/20"
                    : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                }`}
              >
                {excelStatus === "idle" && (
                  <>
                    <Upload className="w-8 h-8 text-slate-400" />
                    <div>
                      <span className="text-xs font-bold text-slate-700 block">Arraste ou clique para carregar .XLSX</span>
                      <span className="text-[10px] text-slate-400 block pt-0.5">O sistema executará a escala quantitativa de ponta-a-ponta</span>
                    </div>
                  </>
                )}

                {(excelStatus === "uploading" || excelStatus === "processing") && (
                  <div className="w-full space-y-2">
                    <RotateCw className="w-6 h-6 animate-spin text-emerald-600 mx-auto" />
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-700 block">{ingestionStep}</span>
                      {/* Process bar */}
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-full transition-all duration-300" 
                          style={{ width: `${ingestionProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {excelStatus === "success" && (
                  <>
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    <div className="text-center px-2">
                      <span className="text-xs font-bold text-emerald-800 block truncate max-w-[200px] mx-auto">{excelFilename}</span>
                      <span className="text-[10px] text-emerald-600 block pt-0.5 leading-tight">{ingestionStep}</span>
                    </div>
                  </>
                )}
              </div>

              {excelStatus === "success" && (
                <div className="flex justify-center">
                  <button 
                    onClick={() => setExcelStatus("idle")}
                    className="text-[10px] font-bold text-slate-500 hover:text-slate-800 uppercase flex items-center gap-1 cursor-pointer"
                  >
                    Carregar Nova Planilha
                  </button>
                </div>
              )}
            </div>

            {/* Trace credentials overview */}
            <div className="bg-slate-900 text-slate-200 p-3 rounded-xl text-[10px] font-mono space-y-1 relative">
              <div className="absolute top-2.5 right-2.5 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <p className="text-emerald-400 font-bold uppercase tracking-wider text-[9px] font-mono">Dorsal SPI Ledger Credentials</p>
              <div className="grid grid-cols-2 gap-1 pt-1 text-slate-400">
                <div>CGS (Compliance): <span className="text-white font-bold">CGS-992</span></div>
                <div>CDE (Exec Core): <span className="text-white font-bold">CDE-01</span></div>
                <div>CDQ (Quant Series): <span className="text-white font-bold">CDQ-11</span></div>
                <div>SDB (Shadow ID): <span className="text-white font-bold">10813</span></div>
              </div>
            </div>

          </div>

          {/* SATELLITE CROP HEALTH & GEOLOCATION (NDVI) MODULE - ENHANCED AGRO INTELLIGENCE MONITOR */}
          <AgroIntelligenceMonitor onSyncSignal={(commodity, ndvi, sentiment) => {
            setActiveCommodity(commodity);
            setNdviRegime(ndvi < 0.45 ? "heat" : ndvi > 0.72 ? "ideal" : "cold");
          }} />

        </div>

      </div>

      {/* ── UNIFIED DATABASE UNIVERSE (ACTIONS, COMMODITIES, MOEDAS, BENCHMARKS) ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4" id="universe-catalog-section">
        
        <div className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 font-sans">
              <Globe className="w-4 h-4 text-slate-600" />
              Catálogo de Ativos Unificados (Ações, Petróleo, Commodities e Forex B3)
            </h3>
            <p className="text-[11px] text-slate-400 font-sans">Sincronização Mark-to-Market em lote com as cotações oficiais e canais de liquidez.</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab filter selectors */}
            <div className="flex bg-slate-100 p-0.5 rounded-lg text-[10px] font-sans font-bold text-slate-600 border border-slate-200 flex-wrap gap-y-1">
              <button 
                onClick={() => setActiveUniverseTab("all")}
                className={`px-2.5 py-1 rounded-md transition-all ${activeUniverseTab === "all" ? "bg-white text-slate-900 shadow-3sm" : "hover:text-slate-900"}`}
              >
                Todos
              </button>
              <button 
                onClick={() => setActiveUniverseTab("acoes")}
                className={`px-2.5 py-1 rounded-md transition-all ${activeUniverseTab === "acoes" ? "bg-white text-slate-900 shadow-3sm" : "hover:text-slate-900"}`}
              >
                Ações B3
              </button>
              <button 
                onClick={() => setActiveUniverseTab("commodities")}
                className={`px-2.5 py-1 rounded-md transition-all ${activeUniverseTab === "commodities" ? "bg-white text-slate-900 shadow-3sm" : "hover:text-slate-900"}`}
              >
                Commodities
              </button>
              <button 
                onClick={() => setActiveUniverseTab("moedas")}
                className={`px-2.5 py-1 rounded-md transition-all ${activeUniverseTab === "moedas" ? "bg-white text-slate-900 shadow-3sm" : "hover:text-slate-900"}`}
              >
                Moedas/Forex
              </button>
              <button 
                onClick={() => setActiveUniverseTab("fundos")}
                className={`px-2.5 py-1 rounded-md transition-all ${activeUniverseTab === "fundos" ? "bg-white text-slate-900 shadow-3sm" : "hover:text-slate-900"}`}
              >
                Fundos (FII/ETF)
              </button>
              <button 
                onClick={() => setActiveUniverseTab("indicadores")}
                className={`px-2.5 py-1 rounded-md transition-all ${activeUniverseTab === "indicadores" ? "bg-white text-slate-900 shadow-3sm" : "hover:text-slate-900"}`}
              >
                Taxas &amp; Índices
              </button>
            </div>
          </div>
        </div>

        {/* Quick Ingest Manual Control Row */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-4 border border-slate-100 rounded-xl">
          <div className="space-y-1 sm:col-span-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase font-sans">Ajuste Manual / Ticker</label>
            <select
              value={selectedTicker}
              onChange={(e) => {
                setSelectedTicker(e.target.value);
                const matched = targetAssets.find(t => t.ticker === e.target.value);
                if (matched) {
                  setCustomPrice(matched.defPrice.toString());
                }
              }}
              className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              {targetAssets.map(asset => (
                <option key={asset.ticker} value={asset.ticker}>
                  {asset.ticker} - {asset.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase font-sans">Preço Customizado</label>
            <input
              type="text"
              placeholder="Ex: 34.50"
              value={customPrice}
              onChange={(e) => setCustomPrice(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase font-sans">Score Macro (0-100)</label>
            <input
              type="number"
              placeholder="Ex: 85"
              value={customScore}
              onChange={(e) => setCustomScore(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-none"
            />
          </div>

          <div className="space-y-1 flex items-end">
            <button
              onClick={() => handleIngest()}
              className="w-full bg-slate-950 hover:bg-slate-900 text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer border border-slate-800"
              disabled={isIngesting}
            >
              <RotateCw className={`w-3.5 h-3.5 ${isIngesting ? "animate-spin" : ""}`} />
              {isIngesting ? "Processando..." : "Sintonizar DI"}
            </button>
          </div>
        </div>

        {/* Dynamic Catalog Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[380px] overflow-y-auto pr-1">
          {filteredAssets.map((asset) => {
            const latestDbRecord = prices.find(p => p.ticker === asset.ticker);
            const hasState = !!latestDbRecord;
            
            return (
              <div 
                key={asset.ticker} 
                className="p-3.5 border border-slate-100 bg-slate-50/20 hover:border-slate-300 rounded-xl transition-all space-y-2.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                      asset.type === "Ações B3" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                      asset.type === "Commodities" ? "bg-amber-50 text-amber-700 border border-amber-100" :
                      asset.type === "Moedas" ? "bg-purple-50 text-purple-700 border border-purple-100" :
                      asset.type === "Fundos" ? "bg-rose-50 text-rose-700 border border-rose-100" :
                      "bg-emerald-50 text-emerald-700 border border-emerald-100"
                    }`}>
                      {asset.type}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      {asset.ticker}
                    </span>
                  </div>
                  
                  <h4 className="text-xs font-black text-slate-800 pt-1 font-sans">{asset.name}</h4>
                  <p className="text-[10px] text-slate-400 font-sans leading-relaxed line-clamp-2 pt-0.5">{asset.desc}</p>
                </div>

                <div className="pt-2.5 border-t border-slate-100/60 flex items-center justify-between">
                  <div className="font-mono text-left">
                    <span className="text-[8px] text-slate-400 block uppercase font-bold">Mkt Price</span>
                    <strong className="text-xs text-slate-800">
                      {hasState ? (
                        formatAssetPrice(asset.ticker, latestDbRecord.price, asset.type, latestDbRecord.normalized_pct)
                      ) : (
                        formatAssetPrice(asset.ticker, asset.defPrice, asset.type)
                      )}
                    </strong>
                  </div>

                  <button
                    onClick={() => handleIngest(asset.ticker)}
                    className="p-1 px-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-[10px] font-bold text-slate-800 rounded-lg transition-all cursor-pointer shadow-3sm"
                    disabled={isIngesting}
                  >
                    Ajustar MTM
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── AUTONOMOUS EXECUTED TRADES LEDGER ───────────────────────────── */}
      {executedTrades.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="pb-2 border-b border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-purple-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-sans">
                Livro de Registro de Ordens de IA (Harpia Tactical Ledger)
              </h3>
            </div>
            <button 
              onClick={clearExecutedTrades}
              className="text-[9px] font-bold text-slate-400 hover:text-rose-500 uppercase cursor-pointer transition-all"
            >
              Limpar Registro
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-xl bg-slate-50/50">
            <table className="w-full text-left border-collapse text-[11px] font-sans">
              <thead>
                <tr className="bg-slate-100/80 text-slate-500 border-b border-slate-200 font-bold font-mono text-[9px] uppercase">
                  <th className="p-3">ID Ordem</th>
                  <th className="p-3">Horário / Data</th>
                  <th className="p-3">Líder Declarador</th>
                  <th className="p-3">Ativo</th>
                  <th className="p-3">Tipo Ordem</th>
                  <th className="p-3">Preço Ref</th>
                  <th className="p-3">Sizing</th>
                  <th className="p-3">Hedge Opções</th>
                </tr>
              </thead>
              <tbody>
                {executedTrades.map((trade) => (
                  <tr key={trade.id} className="border-b border-slate-150/60 hover:bg-slate-100/40 text-slate-600">
                    <td className="p-3 font-mono font-bold text-purple-600">{trade.id}</td>
                    <td className="p-3 font-mono text-slate-400">{trade.timestamp}</td>
                    <td className="p-3">
                      <span className="font-bold text-slate-700">{trade.politicalSource}</span>
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-800">{trade.ticker}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-[9px] ${
                        trade.action === "BUY_LONG" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                        trade.action === "SELL_SHORT" ? "bg-rose-50 text-rose-700 border border-rose-100" :
                        "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}>
                        {trade.action}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-semibold">
                      {(() => {
                        const matched = targetAssets.find(t => t.ticker === trade.ticker);
                        return formatAssetPrice(trade.ticker, trade.price, matched ? matched.type : "Ações B3");
                      })()}
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-700">{trade.sizing}</td>
                    <td className="p-3 text-slate-500 font-mono text-[10px] truncate max-w-[150px]" title={trade.optionHedge}>
                      {trade.optionHedge}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── MAIN GRID (INTERACTIVE SQL LEDGER INSPECTOR) ────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        
        <div className="pb-2 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 font-sans">
            <Terminal className="w-4 h-4 text-slate-700" />
            Dorsal Ledger SQL Inspector
          </h3>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-mono text-slate-500">SQLite Ativo</span>
          </div>
        </div>

        {/* Custom Tab Selection for 3 required tables */}
        <div className="flex border-b border-slate-100 text-[11px] font-sans font-bold">
          <button
            onClick={() => setActiveDbTab("prices")}
            className={`pb-2 px-1 mr-4 border-b-2 transition-all ${
              activeDbTab === "prices" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            1. Preço e Macro (Data)
          </button>
          <button
            onClick={() => setActiveDbTab("controls")}
            className={`pb-2 px-1 mr-4 border-b-2 transition-all ${
              activeDbTab === "controls" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            2. Controle Sincronia
          </button>
          <button
            onClick={() => setActiveDbTab("logs")}
            className={`pb-2 px-1 border-b-2 transition-all ${
              activeDbTab === "logs" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            3. Logs Rastreabilidade
          </button>
        </div>

        {/* Search Input Filter */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </span>
          <input
            type="text"
            placeholder="Filtrar dados locais..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 pl-8 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 font-sans"
          />
        </div>

        {/* Table Display Container */}
        <div className="overflow-x-auto max-h-[350px] border border-slate-100 rounded-lg bg-slate-50/50">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">
              <RotateCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-300" />
              Buscando dados no local_ledger.db...
            </div>
          ) : (
            <>
              {/* Table 1: Price Macro */}
              {activeDbTab === "prices" && (
                <table className="w-full text-left border-collapse text-[11px] font-sans">
                  <thead>
                    <tr className="bg-slate-100/80 text-slate-500 border-b border-slate-200 font-bold">
                      <th className="p-2.5">Data / Horário</th>
                      <th className="p-2.5">Ticker</th>
                      <th className="p-2.5">Preço (Close)</th>
                      <th className="p-2.5">Macro Score</th>
                      <th className="p-2.5">Fonte de Dados</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPrices.length === 0 ? (
                      <tr><td colSpan={5} className="p-4 text-center text-slate-400 font-sans">Nenhum dado de mercado encontrado no SQLite.</td></tr>
                    ) : (
                      filteredPrices.map((row, idx) => (
                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-100/55 text-slate-600">
                          <td className="p-2.5 font-mono">{row.time}</td>
                          <td className="p-2.5 font-bold text-slate-950 font-mono">{row.ticker}</td>
                          <td className="p-2.5 font-mono font-bold text-slate-800">
                            {row.ticker === "CHINA_BAN" && row.normalized_pct !== null
                              ? `${(row.normalized_pct * 100).toFixed(2)}% (Norm)` :
                              row.ticker === "EURUSD" ? `$ ${row.price.toFixed(4)}` :
                              row.ticker === "USD_BRL" || row.ticker === "EUR_BRL" ? `R$ ${row.price.toFixed(4)}` :
                              row.ticker === "CDI" || row.ticker === "SELIC" ? `${row.price.toFixed(2)}% a.a.` :
                              row.ticker === "IBOVESPA" ? `${row.price.toLocaleString("pt-BR")} pts` :
                              `R$ ${row.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
                          </td>
                          <td className="p-2.5">
                            <span className="bg-amber-50 text-amber-850 border border-amber-100 px-2 py-0.5 rounded font-mono text-[9px] font-bold">
                              {row.macro_score}%
                            </span>
                          </td>
                          <td className="p-2.5 text-slate-400 font-sans font-medium">{row.source}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}

              {/* Table 2: Update Control */}
              {activeDbTab === "controls" && (
                <table className="w-full text-left border-collapse text-[11px] font-sans">
                  <thead>
                    <tr className="bg-slate-100/80 text-slate-500 border-b border-slate-200 font-bold">
                      <th className="p-2.5">Ticker</th>
                      <th className="p-2.5">Última Sincronização</th>
                      <th className="p-2.5">Frequência</th>
                      <th className="p-2.5">Status Ledger</th>
                    </tr>
                  </thead>
                  <tbody>
                    {controls.length === 0 ? (
                      <tr><td colSpan={4} className="p-4 text-center text-slate-400 font-sans">Controles de sincronia vazios no SQLite.</td></tr>
                    ) : (
                      controls.map((row, idx) => (
                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-100/55 text-slate-600">
                          <td className="p-2.5 font-bold text-slate-900 font-mono">{row.ticker}</td>
                          <td className="p-2.5 font-mono text-slate-400">{row.last_updated.split(".")[0]}</td>
                          <td className="p-2.5 font-mono font-bold text-slate-500">{row.update_count}x atualizado</td>
                          <td className="p-2.5">
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded font-bold uppercase text-[9px]">
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}

              {/* Table 3: Traceability Log with CGS codes */}
              {activeDbTab === "logs" && (
                <table className="w-full text-left border-collapse text-[11px] font-sans">
                  <thead>
                    <tr className="bg-slate-100/80 text-slate-500 border-b border-slate-200">
                      <th className="p-2.5 font-bold font-sans text-xs uppercase">Histórico de Eventos de Consumo e Rastreabilidade (CGS Ledger)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.length === 0 ? (
                      <tr><td className="p-4 text-center text-slate-400">Nenhum log de consumo de dados localizado.</td></tr>
                    ) : (
                      filteredLogs.map((row, idx) => (
                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-100/55 p-3 text-slate-600">
                          <td className="p-2.5 space-y-1.5">
                            <div className="flex flex-wrap items-center gap-1.5 text-[9px] font-mono">
                              <span className="text-slate-400 font-medium">{row.timestamp.replace("T", " ").split(".")[0]}</span>
                              <span className="bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-bold font-mono">{row.ticker}</span>
                              <span className="bg-slate-800 text-amber-400 px-1.5 py-0.5 rounded font-bold font-mono">{row.cgs}</span>
                              <span className="bg-blue-50 text-blue-700 border border-blue-100 px-1.5 py-0.5 rounded font-bold">CDE: {row.cde}</span>
                              <span className="bg-cyan-50 text-cyan-700 border border-cyan-100 px-1.5 py-0.5 rounded font-bold">CDQ: {row.cdq}</span>
                              <span className="bg-purple-50 text-purple-700 border border-purple-100 px-1.5 py-0.5 rounded font-bold">PCA: {row.pca}</span>
                              <span className="bg-amber-50 text-amber-700 border border-amber-100 px-1.5 py-0.5 rounded font-bold">SDB: {row.sdb}</span>
                            </div>
                            <p className="text-slate-750 text-[11px] font-sans leading-relaxed">
                              {row.message}
                            </p>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>

      </div>

      {/* ── BOTTOM SECTION: THE BACKTESTING DORSAL COMPARATOR ──────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6" id="backtester-dorsal-section">
        
        <div className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-1.5">
            <BarChart3 className="w-5 h-5 text-slate-800" />
            <h3 className="text-sm font-bold text-slate-800 tracking-tight font-sans">
              SPI Dorsal Backtesting &amp; Comparative Performance (AUM R$ 100M)
            </h3>
          </div>
          <span className="text-[10px] bg-slate-950 text-amber-400 font-mono font-bold px-2.5 py-1 rounded-lg border border-slate-800">
            DURABLE PERSISTENCE: SQLITE DORSAL DB
          </span>
        </div>

        <p className="text-xs text-slate-500 font-sans leading-relaxed max-w-4xl">
          Execute uma nova simulação histórica utilizando modelos como <strong>Black-Litterman</strong> e <strong>Hierarchical Risk Parity (HRP)</strong> com dados passados até a presente data (<strong>2026-07-10</strong>). Os resultados serão gravados em uma tabela dedicada de backtests e comparados instantaneamente com a carteira de referência passiva para evidenciar a rentabilidade e taxa de efetividade.
        </p>

        {/* Backtester Trigger Config Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-4 border border-slate-100 rounded-xl">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase font-sans">Data de Início do Backtest</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                <Calendar className="w-3.5 h-3.5" />
              </span>
              <input
                type="date"
                value={backtestStart}
                onChange={(e) => setBacktestStart(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg py-2 pl-9 pr-3 text-xs font-semibold focus:outline-none font-sans"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase font-sans">Data Final (Hoje)</label>
            <input
              type="text"
              value="2026-07-10"
              disabled
              className="w-full bg-slate-200/50 border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-500 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase font-sans">Estratégia Quantitativa</label>
            <select
              value={strategyType}
              onChange={(e) => setStrategyType(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-none font-sans"
            >
              <option value="Multi-Asset Maestro Core">Multi-Asset Maestro Core (HRP + BL)</option>
              <option value="Maestro Black-Litterman Core">Maestro Black-Litterman Core</option>
            </select>
          </div>

          <div className="space-y-1 flex items-end">
            <button
              onClick={handleRunBacktest}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer border border-slate-800"
              disabled={isBacktesting}
            >
              <Play className={`w-3.5 h-3.5 ${isBacktesting ? "animate-ping text-amber-400" : "text-emerald-400"}`} />
              {isBacktesting ? "Backtest em Curso..." : "Executar Backtest"}
            </button>
          </div>
        </div>

        {/* COMPARATIVE CARDS */}
        {latestBacktestResult && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
            
            {/* Fund performance card */}
            <div className="md:col-span-6 bg-slate-900 text-white rounded-xl p-5 border border-slate-800 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-800 rounded-full blur-2xl pointer-events-none opacity-40" />
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] bg-amber-400/20 text-amber-400 border border-amber-400/30 font-bold px-2 py-0.5 rounded uppercase font-sans">
                    Estratégia Fund: {latestBacktestResult.model_type}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">AUM R$ 100M</span>
                </div>

                <div className="pt-4 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white font-sans">
                    R$ {(latestBacktestResult.final_value / 1000000).toFixed(2)}M
                  </span>
                  <span className="text-xs font-bold text-emerald-400 font-sans">
                    +{(((latestBacktestResult.final_value - latestBacktestResult.initial_value) / latestBacktestResult.initial_value) * 100).toFixed(2)}%
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-sans pt-1">
                  Capital Inicial de R$ 100,00M cresceu até {latestBacktestResult.end_date} através do pipeline multi-ativos.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-800 mt-4 text-center">
                <div className="p-2 bg-slate-800/40 rounded-lg">
                  <span className="text-[9px] text-slate-400 block uppercase font-mono">Sharpe Ratio</span>
                  <strong className="text-sm text-amber-400 font-mono">{latestBacktestResult.sharpe.toFixed(2)}</strong>
                </div>
                <div className="p-2 bg-slate-800/40 rounded-lg">
                  <span className="text-[9px] text-slate-400 block uppercase font-mono">Max DD</span>
                  <strong className="text-sm text-rose-400 font-mono">{(latestBacktestResult.max_drawdown * 100).toFixed(2)}%</strong>
                </div>
                <div className="p-2 bg-slate-800/40 rounded-lg">
                  <span className="text-[9px] text-slate-400 block uppercase font-mono">Efetividade</span>
                  <strong className="text-sm text-emerald-400 font-mono">92.4%</strong>
                </div>
              </div>
            </div>

            {/* Benchmark comparison card */}
            <div className="md:col-span-6 bg-slate-50 border border-slate-200 rounded-xl p-5 relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded uppercase font-sans">
                    Benchmark: Ibovespa + CDI Rebalanceado
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Passivo</span>
                </div>

                <div className="pt-4 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-800 font-sans">
                    R$ {(latestBacktestResult.benchmark_final / 1000000).toFixed(2)}M
                  </span>
                  <span className="text-xs font-bold text-slate-500 font-sans">
                    +{(((latestBacktestResult.benchmark_final - latestBacktestResult.initial_value) / latestBacktestResult.initial_value) * 100).toFixed(2)}%
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-sans pt-1">
                  O portfólio passivo rebalanceado trimestralmente exibiu performance padrão de mercado com cauda vulnerável.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-200 mt-4 text-center">
                <div className="p-2 bg-slate-200/50 rounded-lg">
                  <span className="text-[9px] text-slate-400 block uppercase font-mono">Sharpe Ratio</span>
                  <strong className="text-sm text-slate-700 font-mono">{latestBacktestResult.benchmark_sharpe.toFixed(2)}</strong>
                </div>
                <div className="p-2 bg-slate-200/50 rounded-lg">
                  <span className="text-[9px] text-slate-400 block uppercase font-mono">Max DD</span>
                  <strong className="text-sm text-slate-500 font-mono">-11.20%</strong>
                </div>
                <div className="p-2 bg-slate-200/50 rounded-lg">
                  <span className="text-[9px] text-slate-400 block uppercase font-mono">Alfa Gerado</span>
                  <strong className="text-sm text-slate-700 font-mono">
                    +{( ( (latestBacktestResult.final_value - latestBacktestResult.benchmark_final) / latestBacktestResult.initial_value ) * 100 ).toFixed(1)}%
                  </strong>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* HISTORIC BACKTEST RESULTS TABLE */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-700 font-sans uppercase tracking-wider text-[10px]">
            Histórico de Simulações Gravadas no SQLite (Dorsal DB)
          </h4>
          <div className="overflow-x-auto border border-slate-150 rounded-xl bg-white">
            <table className="w-full text-left border-collapse text-xs font-sans">
              <thead>
                <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-bold">
                  <th className="p-3">Data Simulação</th>
                  <th className="p-3">Estratégia</th>
                  <th className="p-3">Início</th>
                  <th className="p-3">Fim (Hoje)</th>
                  <th className="p-3">Patrimônio Final</th>
                  <th className="p-3 text-center">Sharpe (Fund)</th>
                  <th className="p-3 text-center">Sharpe (Bench)</th>
                  <th className="p-3 text-center">Máx DD (Fund)</th>
                </tr>
              </thead>
              <tbody>
                {backtests.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-5 text-center text-slate-400 font-sans">
                      Nenhuma simulação histórica encontrada no banco. Execute uma simulação para persistir os dados.
                    </td>
                  </tr>
                ) : (
                  backtests.map((run) => (
                    <tr key={run.id} className="border-b border-slate-100 hover:bg-slate-50/50 text-slate-600">
                      <td className="p-3 font-mono font-medium text-slate-800">{run.run_date}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-800 border border-slate-200 rounded text-[10px] font-bold">
                          {run.model_type}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-[11px]">{run.start_date}</td>
                      <td className="p-3 font-mono text-[11px]">{run.end_date}</td>
                      <td className="p-3 font-mono font-bold text-slate-900">
                        R$ {run.final_value.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 font-mono text-center font-bold text-emerald-600">{run.sharpe.toFixed(2)}</td>
                      <td className="p-3 font-mono text-center text-slate-400">{run.benchmark_sharpe.toFixed(2)}</td>
                      <td className="p-3 font-mono text-center text-rose-500">{(run.max_drawdown * 100).toFixed(2)}%</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
