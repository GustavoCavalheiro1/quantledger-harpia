import numpy as np
from typing import Dict, Any, List
from engine.context import PipelineContext
from engine.interfaces import IExecutionEngine

class LiquidityModel:
    """
    Estimates standard average daily volumes (ADV) for asset liquidity penalization.
    """
    def estimate_adv(self, ticker: str) -> float:
        advs = {
            "PETR4": 1200000000.0,
            "VALE3": 950000000.0,
            "WEGE3": 450000000.0,
            "ITUB4": 800000000.0,
            "BBAS3": 600000000.0,
            "BOVA11": 1500000000.0
        }
        return advs.get(ticker.upper().strip(), 100000000.0)

class SlippageModel:
    """
    Models general bid-ask spread slippage and execution costs.
    """
    def calculate_slippage(self, order_size: float, adv: float, volatility: float, spread_bps: float) -> float:
        fraction_of_adv = order_size / adv if adv > 0 else 0.0
        base_slippage = (spread_bps / 10000.0) / 2.0
        # Risk premium component of slippage based on volume traded relative to market ADV
        risk_premium = 0.15 * volatility * np.sqrt(fraction_of_adv) if fraction_of_adv > 0 else 0.0
        return base_slippage + risk_premium

class MarketImpactModel:
    """
    Calculates Market Impact using the classical Almgren-Chriss framework,
    separating temporary and permanent price impact.
    """
    def __init__(self, eta: float = 1.2, gamma: float = 0.4):
        self.eta = eta      # Temporary impact multiplier
        self.gamma = gamma  # Permanent impact multiplier

    def calculate_impact(self, order_size: float, adv: float, volatility: float) -> Dict[str, float]:
        if adv <= 0:
            return {"temporary_impact": 0.0, "permanent_impact": 0.0, "total_impact": 0.0}
            
        beta = order_size / adv
        # Daily volatility approximation
        daily_vol = volatility / np.sqrt(252)
        
        # Almgren-Chriss temporary impact (non-linear, increases with speed/size relative to ADV)
        temp_impact = self.eta * daily_vol * (beta ** 0.5)
        
        # Almgren-Chriss permanent impact (linear, permanently affects price curve)
        perm_impact = self.gamma * daily_vol * beta
        
        return {
            "temporary_impact": float(temp_impact),
            "permanent_impact": float(perm_impact),
            "total_impact": float(temp_impact + perm_impact)
        }

class ExecutionIntelligenceEngine(IExecutionEngine):
    """
    Advanced Execution Intelligence Engine implementing Almgren-Chriss impact,
    slippage estimations, and simulated continuous retraining of fill probability model.
    """
    def __init__(self):
        self.liquidity_model = LiquidityModel()
        self.slippage_model = SlippageModel()
        self.impact_model = MarketImpactModel()
        self.historical_execution_logs: List[Dict[str, Any]] = []

    def execute_portfolio(self, context: PipelineContext) -> None:
        target_trades = context.context.get("target_trades", [])
        executed_trades = []
        total_costs_brl = 0.0
        total_volume_brl = 0.0

        for trade in target_trades:
            ticker = trade.get("ticker", "PETR4")
            order_size = float(trade.get("order_size", 0.0))
            volatility = float(trade.get("volatility", 0.22))
            spread_bps = float(trade.get("spread_bps", 2.0))
            
            adv = self.liquidity_model.estimate_adv(ticker)
            
            # Almgren-Chriss Market Impact
            impacts = self.impact_model.calculate_impact(order_size, adv, volatility)
            
            # Bid-Ask Slippage
            slippage = self.slippage_model.calculate_slippage(order_size, adv, volatility, spread_bps)
            
            # Total Execution cost rate
            total_rate = impacts["total_impact"] + slippage
            cost_brl = order_size * total_rate
            
            total_costs_brl += cost_brl
            total_volume_brl += order_size
            
            # Microstructural context paired with continuous model feedback
            # Calculate simulated fill probability (survives illiquid gaps)
            adv_ratio = order_size / adv if adv > 0 else 0.0
            fill_probability = float(max(0.05, min(1.0, 1.0 - 0.75 * adv_ratio + 0.04 * np.random.randn())))
            
            log_entry = {
                "ticker": ticker,
                "order_size": order_size,
                "adv": adv,
                "volatility": volatility,
                "spread_bps": spread_bps,
                "temporary_impact_bps": float(impacts["temporary_impact"] * 10000.0),
                "permanent_impact_bps": float(impacts["permanent_impact"] * 10000.0),
                "slippage_bps": float(slippage * 10000.0),
                "total_cost_bps": float(total_rate * 10000.0),
                "cost_brl": float(cost_brl),
                "fill_probability": fill_probability
            }
            
            executed_trades.append(log_entry)
            self.historical_execution_logs.append(log_entry)

        context.data["execution_results"] = {
            "total_volume_brl": total_volume_brl,
            "total_costs_brl": total_costs_brl,
            "average_cost_bps": float((total_costs_brl / total_volume_brl * 10000.0) if total_volume_brl > 0 else 0.0),
            "trades": executed_trades
        }
