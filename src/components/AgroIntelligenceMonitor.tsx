/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { 
  Globe, 
  MapPin, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  ShieldAlert, 
  Zap, 
  Compass, 
  Activity, 
  LineChart as ChartIcon,
  Sun,
  CloudSnow,
  Sprout,
  HeartHandshake,
  Eye,
  Scan,
  Trees,
  Leaf,
  Droplets,
  Layers,
  Sparkles,
  ShieldCheck,
  Flame,
  Maximize2
} from "lucide-react";
import harpiaSafImage from "../assets/images/harpia_saf_olho_monitor_1786654053038.jpg";

export type CropType = "SOJA" | "MILHO" | "CAFÉ" | "SAF";

interface AgroIntelligenceMonitorProps {
  onSyncSignal?: (commodity: CropType, ndvi: number, sentiment: number) => void;
}

export default function AgroIntelligenceMonitor({ onSyncSignal }: AgroIntelligenceMonitorProps) {
  const [selectedCrop, setSelectedCrop] = useState<CropType>("SAF");
  const [climateRegime, setClimateRegime] = useState<"NORMAL" | "EL_NINO_DRY" | "LA_NINA_FROST">("NORMAL");
  const [activeCell, setActiveCell] = useState<{ r: number; c: number; ndvi: number } | null>({ r: 1, c: 2, ndvi: 0.88 });
  
  // Olho da Harpia Cyber-HUD & Spectral Modes
  const [spectralMode, setSpectralMode] = useState<"NDVI" | "EVI_CANOPY" | "NDWI_WATER" | "CARBON_BIOMASS">("NDVI");
  const [harpiaEyeActive, setHarpiaEyeActive] = useState<boolean>(true);
  const [hudScanActive, setHudScanActive] = useState<boolean>(true);

  // Regional metadata for agricultural capitals & SAF biomes of Brazil
  const cropMetadata = useMemo(() => {
    return {
      SAF: {
        city: "Tomé-Açu - PA / Sul da Bahia (Cabruca)",
        biome: "Floresta Tropical Úmida & Mata Atlântica",
        lat: "-02.4167",
        lon: "-48.1500",
        alt: "45m",
        cultivar: "Policultivo Agroflorestal (Cacau + Açaí + Mogno + Nativas)",
        baseSentiment: 92,
        historicalYield: "2.400 kg Cacau/ha + 8.4 tCO2e/ha/ano",
        waterDemand: "auto-regulada (alta resiliência)",
        carbonStock: "240 tCO2e/ha armazenados",
        strata: [
          { level: "Estrato Emergente (>25m)", plants: "Mogno Brasileiro, Castanheira, Ipê Amarelo", canopyPct: 20 },
          { level: "Estrato Alto (15-25m)", plants: "Açaizeiro Nativo, Seringueira, Cupuaçu", canopyPct: 35 },
          { level: "Estrato Médio / Sub-bosque (5-15m)", plants: "Cacau Cabruca Fino, Café Arábica Sombreado", canopyPct: 30 },
          { level: "Estrato Baixo & Rasteiro (0-5m)", plants: "Adubação Verde, Inhame, Fungos & Matéria Orgânica", canopyPct: 15 }
        ]
      },
      SOJA: {
        city: "Sorriso - MT (Médio-Norte)",
        biome: "Cerrado Matogrossense",
        lat: "-12.5412",
        lon: "-55.7234",
        alt: "365m",
        cultivar: "TMG 2381 IPRO (Precoce)",
        baseSentiment: 74,
        historicalYield: "3.620 kg/ha",
        waterDemand: "alta",
        carbonStock: "18 tCO2e/ha temporário",
        strata: [
          { level: "Estrato Único (0-1.2m)", plants: "Glycine max (L.) Merr. Monocultura", canopyPct: 100 }
        ]
      },
      MILHO: {
        city: "Jataí - GO (Sudoeste)",
        biome: "Cerrado Centro-Oeste",
        lat: "-17.8811",
        lon: "-51.7245",
        alt: "708m",
        cultivar: "DKB 265 PRO4 (Safrinha)",
        baseSentiment: 68,
        historicalYield: "6.450 kg/ha",
        waterDemand: "moderada",
        carbonStock: "22 tCO2e/ha temporário",
        strata: [
          { level: "Estrato Único (0-2.5m)", plants: "Zea mays L. (Safrinha Irrigada)", canopyPct: 100 }
        ]
      },
      CAFÉ: {
        city: "Guaxupé - MG (Sul de Minas)",
        biome: "Mata Atlântica / Montanha",
        lat: "-21.3054",
        lon: "-46.7118",
        alt: "858m",
        cultivar: "Catuaí Vermelho IAC 144",
        baseSentiment: 82,
        historicalYield: "28 sacas/ha",
        waterDemand: "crítica",
        carbonStock: "55 tCO2e/ha perene",
        strata: [
          { level: "Dossel Cafezal (0-3m)", plants: "Coffea arabica com sombreamento parcial", canopyPct: 80 },
          { level: "Quebra-ventos (8-12m)", plants: "Grevíleas e Bananeiras", canopyPct: 20 }
        ]
      }
    };
  }, []);

  // Compute cell NDVI / Spectral values dynamically based on crop & regime
  const cellData = useMemo(() => {
    const rows = 4;
    const cols = 6;
    const grid: { r: number; c: number; ndvi: number; evi: number; ndwi: number; carbon: number; region: string; stress: boolean }[] = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        let baseNdvi = 0.78;
        let baseEvi = 0.65;
        let baseNdwi = 0.45;
        let baseCarbon = 35; // tCO2e

        if (selectedCrop === "SAF") {
          baseNdvi = 0.88;
          baseEvi = 0.82;
          baseNdwi = 0.62;
          baseCarbon = 240;
          if (climateRegime === "EL_NINO_DRY") {
            baseNdvi = 0.74; // SAF is resilient to droughts!
            baseEvi = 0.68;
            baseNdwi = 0.48;
          } else if (climateRegime === "LA_NINA_FROST") {
            baseNdvi = 0.80;
            baseEvi = 0.75;
            baseNdwi = 0.58;
          }
        } else if (climateRegime === "EL_NINO_DRY") {
          baseNdvi = selectedCrop === "SOJA" ? 0.35 : selectedCrop === "MILHO" ? 0.38 : 0.42;
          baseEvi = baseNdvi * 0.8;
          baseNdwi = 0.15;
          baseCarbon = selectedCrop === "CAFÉ" ? 48 : 12;
        } else if (climateRegime === "LA_NINA_FROST") {
          baseNdvi = selectedCrop === "SOJA" ? 0.45 : selectedCrop === "MILHO" ? 0.41 : 0.32;
          baseEvi = baseNdvi * 0.78;
          baseNdwi = 0.30;
          baseCarbon = selectedCrop === "CAFÉ" ? 40 : 15;
        }

        // Add subtle local natural variations
        const noise = Math.sin(r * 1.5 + c) * 0.04 + Math.cos(c * 2.1) * 0.03;
        let ndvi = parseFloat((baseNdvi + noise).toFixed(2));
        let evi = parseFloat((baseEvi + noise * 0.9).toFixed(2));
        let ndwi = parseFloat((baseNdwi + noise * 0.8).toFixed(2));
        let carbon = Math.round(baseCarbon + noise * 15);

        ndvi = Math.max(0.12, Math.min(0.98, ndvi));
        evi = Math.max(0.10, Math.min(0.95, evi));
        ndwi = Math.max(-0.10, Math.min(0.85, ndwi));

        // Highlight hot/stress spots
        const isStress = ndvi < 0.45;
        const regionLabel = selectedCrop === "SAF" ? `Gleba Agroflorestal ${String.fromCharCode(65 + r)}${c + 1}` : `Setor ${String.fromCharCode(65 + r)}${c + 1}`;

        grid.push({ r, c, ndvi, evi, ndwi, carbon, region: regionLabel, stress: isStress });
      }
    }

    return grid;
  }, [selectedCrop, climateRegime]);

  // Handle syncing of simulated satellite telemetries to the parent components
  const currentMetadata = cropMetadata[selectedCrop];
  const averageNdvi = useMemo(() => {
    const total = cellData.reduce((acc, cur) => acc + cur.ndvi, 0);
    return parseFloat((total / cellData.length).toFixed(2));
  }, [cellData]);

  // Direct correlated impact on Sentiment, expected yields, and price action
  const marketCorrelation = useMemo(() => {
    let priceDirection: "UP" | "DOWN" | "NEUTRAL" = "NEUTRAL";
    let sentimentOffset = 0;
    let expectedYieldPct = 100;
    let recommendation = "";

    if (selectedCrop === "SAF") {
      sentimentOffset = 15;
      expectedYieldPct = averageNdvi > 0.80 ? 112 : 98;
      priceDirection = "UP";
      recommendation = `[ATIVO DE BIOECONOMIA & CRÉDITO DE CARBONO] O SAF monitorado pelo Olho da Harpia exibe dossel florestal exuberante (NDVI: ${averageNdvi}, Estoque: ${currentMetadata.carbonStock}). Excelente geração de prêmio ESG, créditos de carbono premium e blindagem de risco microclimático.`;
    } else if (averageNdvi >= 0.72) {
      priceDirection = "DOWN";
      sentimentOffset = 18; // Positive outlook for supply, price falls due to high supply
      expectedYieldPct = 104;
      recommendation = `[EXCESSO DE OFERTA] O NDVI saudável de ${averageNdvi} indica safra plena de ${selectedCrop}. O comitê sugere travar posições curtas de proteção futura devido ao risco de compressão de margens na safra física.`;
    } else if (averageNdvi < 0.45) {
      priceDirection = "UP";
      sentimentOffset = -35; // Severe stress lowers sentiment (negative sentiment for credit/producers, spikes price due to crop failure)
      expectedYieldPct = 72;
      recommendation = `[RISCO DE CAUDA RURAL] Estresse hídrico severo detectado pelo Olho da Harpia em ${selectedCrop} (NDVI: ${averageNdvi}). Quebra física projeta repique imediato de contratos futuros. Posição compradora de hedge tático recomendada.`;
    } else {
      priceDirection = "NEUTRAL";
      sentimentOffset = 0;
      expectedYieldPct = 95;
      recommendation = `[VOLATILIDADE ESTÁVEL] Condição de vigor moderada dentro da curva histórica. Alocação fiduciária neutra balanceada em CDI e hedge tático leve.`;
    }

    const netSentiment = Math.max(10, Math.min(99, currentMetadata.baseSentiment + sentimentOffset));

    return {
      priceDirection,
      netSentiment,
      expectedYieldPct,
      recommendation
    };
  }, [averageNdvi, currentMetadata, selectedCrop]);

  const handleCellClick = (cell: { r: number; c: number; ndvi: number }) => {
    setActiveCell(cell);
    if (onSyncSignal) {
      onSyncSignal(selectedCrop, cell.ndvi, marketCorrelation.netSentiment);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl p-6 shadow-xl space-y-6" id="agro-intelligence-monitor">
      
      {/* ── CINEMATIC BANNER: OLHO DA HARPIA & SAF MONITORING ── */}
      <div className="relative rounded-2xl overflow-hidden border border-emerald-500/30 bg-slate-950 shadow-2xl">
        <div className="h-56 sm:h-64 lg:h-72 w-full relative">
          <img 
            src={harpiaSafImage} 
            alt="Olho da Harpia - Monitor de SAF e Ativos Florestais" 
            className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-1000"
            referrerPolicy="no-referrer"
          />
          
          {/* Futuristic Gradient & Cyber Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/40 to-transparent" />

          {/* Cybernetic HUD Scanning Reticle (Olho da Harpia) */}
          {hudScanActive && (
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-slate-950/80 backdrop-blur-md border border-cyan-500/50 p-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-pulse">
              <div className="relative flex items-center justify-center">
                <Scan className="w-7 h-7 text-cyan-400 animate-spin" style={{ animationDuration: '16s' }} />
                <Eye className="w-3.5 h-3.5 text-rose-500 absolute animate-ping" />
              </div>
              <div className="font-mono text-[10px] space-y-0.5">
                <span className="text-cyan-400 font-black block tracking-wider uppercase flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  OLHO DA HARPIA • HUD ATIVO
                </span>
                <span className="text-slate-300 block">Varredura Espectral Quântica Sentinel-2</span>
                <span className="text-emerald-400 font-bold block">Resolução: 10m/px • Biomassa Real-Time</span>
              </div>
            </div>
          )}

          {/* Left Hero Title & Description */}
          <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 space-y-2 z-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 rounded-full font-mono uppercase tracking-widest font-black flex items-center gap-1.5 backdrop-blur-sm">
                <Trees className="w-3 h-3 text-emerald-400" />
                SAF &amp; Bioeconomia Florestal
              </span>
              <span className="px-2.5 py-1 text-[9px] bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 rounded-full font-mono uppercase tracking-widest font-black flex items-center gap-1.5 backdrop-blur-sm">
                <Eye className="w-3 h-3 text-cyan-400" />
                Olho da Harpia Cyber-Vision
              </span>
              <span className="px-2 py-0.5 text-[9px] bg-slate-900/80 text-amber-300 border border-amber-500/30 rounded-md font-mono font-bold">
                CVM 175 ESG Tier-1
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              Monitor de SAF, Lavouras &amp; Olho da Harpia
            </h2>

            <p className="text-xs text-slate-200 max-w-3xl leading-relaxed hidden sm:block">
              Sensoriamento multiespectral orbital e de borda integrado: monitoramento contínuo de Sistemas Agroflorestais (SAF), lavouras de Soja, Milho, Café e dossel nativo, quantificando estresse hídrico, estoque de carbono e vigor vegetal.
            </p>
          </div>

        </div>
      </div>

      {/* ── HEADER CONTROLS: CROP & SAF SELECTORS ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-950/60 border border-emerald-800/80 rounded-xl text-emerald-400 shadow-inner">
            <Globe className="w-5 h-5 animate-spin" style={{ animationDuration: '40s' }} />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
              Selecione o Bioma / Cultura Florestal
            </h3>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">Sistemas Agroflorestais (SAF) consorciados e commodities agropecuárias</p>
          </div>
        </div>

        {/* Crop Selectors with SAF Highlight */}
        <div className="flex flex-wrap gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800" id="agro-crop-tabs">
          {[
            { id: "SAF", label: "🌳 SAF Agrofloresta", desc: "Cacau, Açaí & Nativas" },
            { id: "SOJA", label: "🌱 Soja B3", desc: "Sorriso MT" },
            { id: "MILHO", label: "🌽 Milho Futuro", desc: "Jataí GO" },
            { id: "CAFÉ", label: "☕ Café Arábica", desc: "Guaxupé MG" }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setSelectedCrop(item.id as CropType);
                setActiveCell(null);
              }}
              className={`px-3 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCrop === item.id 
                  ? item.id === "SAF" 
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/50 font-black border border-emerald-400"
                    : "bg-slate-800 text-emerald-400 shadow-sm border border-slate-700 font-black" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── SPECTRAL CHANNELS CONTROLLER (OLHO DA HARPIA) ── */}
      <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono font-bold text-slate-300 uppercase">
            Canal de Visão do Olho da Harpia:
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {[
            { id: "NDVI", label: "🌿 NDVI (Vigor Vegetal & Clorofila)", icon: Leaf },
            { id: "EVI_CANOPY", label: "🌳 EVI (Dossel & Folhagem)", icon: Trees },
            { id: "NDWI_WATER", label: "💧 NDWI (Balanço Hídrico)", icon: Droplets },
            { id: "CARBON_BIOMASS", label: "⚡ Biomassa & Carbono (tCO2e)", icon: Zap }
          ].map((mode) => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => setSpectralMode(mode.id as any)}
                className={`px-2.5 py-1 text-[11px] font-mono rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                  spectralMode === mode.id
                    ? "bg-cyan-950 text-cyan-300 border border-cyan-500/60 font-bold"
                    : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                <Icon className="w-3 h-3" />
                {mode.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── MAIN GRID SECTION ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Geographic metadata, Strata Breakdown & Climate Regimes (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Geospatial Metadata */}
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between text-slate-400 text-[10px] pb-2 border-b border-slate-800/80 uppercase">
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <MapPin className="w-3.5 h-3.5" />
                Georreferenciamento do Polígono
              </span>
              <span>{currentMetadata.biome}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 leading-relaxed">
              <div className="space-y-0.5">
                <span className="text-slate-500 block text-[9px] uppercase">Município / Polo:</span>
                <strong className="text-slate-200 font-sans">{currentMetadata.city}</strong>
              </div>
              <div className="space-y-0.5">
                <span className="text-slate-500 block text-[9px] uppercase">Sistema / Cultivar:</span>
                <strong className="text-slate-200">{currentMetadata.cultivar}</strong>
              </div>
              <div className="space-y-0.5">
                <span className="text-slate-500 block text-[9px] uppercase">Coordenadas GPS:</span>
                <strong className="text-emerald-400">{currentMetadata.lat}°, {currentMetadata.lon}°</strong>
              </div>
              <div className="space-y-0.5">
                <span className="text-slate-500 block text-[9px] uppercase">Estoque de Carbono:</span>
                <strong className="text-cyan-400 font-black">{currentMetadata.carbonStock}</strong>
              </div>
            </div>

            {/* SAF Strata Breakdown when SAF is selected */}
            {selectedCrop === "SAF" && currentMetadata.strata && (
              <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[10px] text-emerald-400 font-bold uppercase">
                  <span className="flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5" />
                    Estratificação Vertical do SAF
                  </span>
                  <span>4 Estratos Funcionais</span>
                </div>

                <div className="space-y-1.5">
                  {currentMetadata.strata.map((stratum, idx) => (
                    <div key={idx} className="p-2 bg-slate-900/60 rounded-lg border border-slate-800 text-[10px] space-y-0.5">
                      <div className="flex justify-between font-bold text-slate-200">
                        <span>{stratum.level}</span>
                        <span className="text-emerald-400">{stratum.canopyPct}% dossel</span>
                      </div>
                      <p className="text-slate-400 text-[9px]">{stratum.plants}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Climate Regime Selectors */}
          <div className="space-y-2 bg-slate-950/40 p-4 border border-slate-800 rounded-xl">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block font-mono flex items-center justify-between">
              <span>Simulação Microclimática</span>
              <span className="text-slate-500">Choque de Safra</span>
            </div>
            
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800 text-[10px] font-bold font-mono">
              <button
                onClick={() => setClimateRegime("NORMAL")}
                className={`py-2 rounded-md transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  climateRegime === "NORMAL" ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 font-bold shadow-sm" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <Sprout className="w-3 h-3" />
                Normal
              </button>
              <button
                onClick={() => setClimateRegime("EL_NINO_DRY")}
                className={`py-2 rounded-md transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  climateRegime === "EL_NINO_DRY" ? "bg-rose-950/80 text-rose-400 border border-rose-800/80 font-bold animate-pulse" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <Sun className="w-3 h-3" />
                El Niño (Seca)
              </button>
              <button
                onClick={() => setClimateRegime("LA_NINA_FROST")}
                className={`py-2 rounded-md transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  climateRegime === "LA_NINA_FROST" ? "bg-sky-950/80 text-sky-400 border border-sky-800/80 font-bold" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <CloudSnow className="w-3 h-3" />
                La Niña (Frio)
              </button>
            </div>
          </div>

          {/* Correlation Outcome */}
          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-3">
            <div className="text-[10px] text-purple-400 font-mono font-bold uppercase tracking-wider flex items-center gap-1">
              <Activity className="w-3.5 h-3.5" />
              Impacto no Sentimento &amp; Posicionamento
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[9px] block uppercase">Vigor Médio (NDVI)</span>
                <span className={`text-base font-extrabold ${averageNdvi < 0.45 ? "text-rose-400 animate-pulse" : "text-emerald-400"}`}>
                  {averageNdvi}
                </span>
              </div>
              <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[9px] block uppercase">Sentimento da Cultura</span>
                <span className={`text-base font-extrabold ${marketCorrelation.netSentiment < 60 ? "text-rose-400" : "text-emerald-400"}`}>
                  {marketCorrelation.netSentiment}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono pt-1">
              <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[9px] block uppercase">Direção de Preço Alvo</span>
                <span className="flex items-center gap-1 text-sm font-extrabold">
                  {marketCorrelation.priceDirection === "UP" && (
                    <>
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">ALTA FUTURA</span>
                    </>
                  )}
                  {marketCorrelation.priceDirection === "DOWN" && (
                    <>
                      <TrendingDown className="w-4 h-4 text-rose-400" />
                      <span className="text-rose-400">QUEDA FUTURA</span>
                    </>
                  )}
                  {marketCorrelation.priceDirection === "NEUTRAL" && (
                    <span className="text-slate-400">ESTÁVEL</span>
                  )}
                </span>
              </div>
              <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 text-[9px] block uppercase">Expectativa de Rendimento</span>
                <span className={`text-base font-extrabold ${marketCorrelation.expectedYieldPct < 90 ? "text-rose-400" : "text-emerald-400"}`}>
                  {marketCorrelation.expectedYieldPct}% do Esperado
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: GIS Heatmap Grid & Tactical Response (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Geospatial Matrix Heatmap */}
          <div className="space-y-2">
            <div className="flex justify-between items-center font-mono text-[10px] text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                Matriz Espectral do Dossel Foliar ({spectralMode})
              </span>
              <span>Clique no lote para inspecionar</span>
            </div>

            {/* 4x6 Geographic matrix */}
            <div className="grid grid-cols-6 gap-2 bg-slate-950 p-4 rounded-xl border border-slate-800">
              {cellData.map((cell) => {
                const isSelected = activeCell?.r === cell.r && activeCell?.c === cell.c;
                
                // Fine-tune background colors based on chosen spectral mode
                let displayVal = cell.ndvi.toFixed(2);
                let colorClass = "bg-emerald-600/85 hover:bg-emerald-500 text-white";

                if (spectralMode === "NDVI") {
                  displayVal = cell.ndvi.toFixed(2);
                  if (cell.ndvi < 0.40) colorClass = "bg-rose-700/90 hover:bg-rose-600 text-white border border-rose-500/30 animate-pulse";
                  else if (cell.ndvi < 0.58) colorClass = "bg-amber-600/85 hover:bg-amber-500 text-white border border-amber-500/20";
                  else if (cell.ndvi < 0.75) colorClass = "bg-emerald-700/80 hover:bg-emerald-600 text-slate-100";
                  else colorClass = "bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black";
                } else if (spectralMode === "EVI_CANOPY") {
                  displayVal = cell.evi.toFixed(2);
                  colorClass = cell.evi > 0.70 ? "bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold" : "bg-teal-800 hover:bg-teal-700 text-white";
                } else if (spectralMode === "NDWI_WATER") {
                  displayVal = cell.ndwi.toFixed(2);
                  colorClass = cell.ndwi > 0.40 ? "bg-sky-600 hover:bg-sky-500 text-white" : "bg-rose-800/80 text-white";
                } else if (spectralMode === "CARBON_BIOMASS") {
                  displayVal = `${cell.carbon}t`;
                  colorClass = cell.carbon > 150 ? "bg-purple-600 hover:bg-purple-500 text-white font-bold" : "bg-purple-900/70 text-slate-200";
                }

                return (
                  <button
                    key={`${cell.r}-${cell.c}`}
                    type="button"
                    onClick={() => handleCellClick(cell)}
                    className={`h-12 rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer relative ${colorClass} ${
                      isSelected ? "ring-2 ring-white scale-105 z-10 shadow-2xl font-bold" : "opacity-90"
                    }`}
                  >
                    <span className="text-[10px] font-mono leading-none">{displayVal}</span>
                    <span className="text-[7px] opacity-75 mt-0.5 font-sans truncate px-1">
                      {String.fromCharCode(65 + cell.r)}{cell.c + 1}
                    </span>
                    {cell.stress && (
                      <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Sector Analysis Info Card */}
          {activeCell && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="space-y-0.5">
                <span className="text-slate-500 text-[8px] uppercase block">Dossiê de Campo &amp; Polígono</span>
                <strong className="text-slate-200">
                  Lote {String.fromCharCode(65 + activeCell.r)}{activeCell.c + 1} ({selectedCrop})
                </strong>
              </div>
              <div className="space-y-0.5 text-center">
                <span className="text-slate-500 text-[8px] uppercase block">Índice Espectral</span>
                <strong className={activeCell.ndvi < 0.45 ? "text-rose-400" : "text-emerald-400"}>
                  NDVI {activeCell.ndvi} • {selectedCrop === "SAF" ? "Resiliência Máxima" : "Normal"}
                </strong>
              </div>
              <div className="space-y-0.5 text-right">
                <span className="text-slate-500 text-[8px] uppercase block">Status de Vigor</span>
                <strong className={activeCell.ndvi < 0.45 ? "text-rose-400" : "text-emerald-400"}>
                  {activeCell.ndvi < 0.40 ? "ESTRESSE HÍDRICO" : activeCell.ndvi < 0.60 ? "VIGOR MODERADO" : "DOSSEL PLENO (EXCELENTE)"}
                </strong>
              </div>
            </div>
          )}

          {/* Tactical Advice Action Memo */}
          <div className="bg-emerald-950/30 border border-emerald-800/60 p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-400 font-mono">
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-emerald-400" />
                Diretriz do Comitê de Risco de Commodities &amp; Bioeconomia
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Olho da Harpia Intelligence</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
              {marketCorrelation.recommendation}
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
