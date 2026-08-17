from typing import Dict, Any, List

class MetaLearningEngine:
    """
    Ensemble Meta-Learning engine that dynamically shifts weighting between forecasters
    (Fundamentalist XGBoost, LSTM Neural Networks, Sentinel News Sentiment, TFT)
    based on the active market regime detected by the Markov Regime Switch model.
    """
    def __init__(self):
        # Base model weighting matrices for each market regime
        self.regime_allocation = {
            "BULL_LOW_VOL": {
                "News Sentiment (LLM)": 0.20,
                "Fundamentalist XGBoost": 0.50,
                "LSTM Neural Networks": 0.20,
                "Temporal Fusion Transformer (TFT)": 0.10
            },
            "BEAR_HIGH_VOL": {
                "News Sentiment (LLM)": 0.10,
                "Fundamentalist XGBoost": 0.10,
                "LSTM Neural Networks": 0.30,
                "Temporal Fusion Transformer (TFT)": 0.50
            },
            "CRISIS": {
                "News Sentiment (LLM)": 0.05,
                "Fundamentalist XGBoost": 0.05,
                "LSTM Neural Networks": 0.10,
                "Temporal Fusion Transformer (TFT)": 0.80
            },
            "SIDEWAYS": {
                "News Sentiment (LLM)": 0.15,
                "Fundamentalist XGBoost": 0.30,
                "LSTM Neural Networks": 0.45,
                "Temporal Fusion Transformer (TFT)": 0.10
            }
        }

    def evaluate_weights(self, active_regime: str, entropy: float = 0.25) -> Dict[str, float]:
        """
        Dynamically adjusts predictive weights.
        When entropy (regime change likelihood / uncertainty) is high, the model shifts 
        concentration to highly hierarchical or attention-based deep architectures (like TFT).
        """
        regime = active_regime.upper().strip()
        if regime not in self.regime_allocation:
            regime = "BULL_LOW_VOL"
            
        weights = self.regime_allocation[regime].copy()
        
        # High entropy structural shift compensation
        if entropy > 0.40:
            excess_entropy = min(1.0, entropy) - 0.40
            tft_boost = float(0.25 * excess_entropy)
            
            # Reduce other models proportionally to boost TFT
            non_tft_sum = sum(v for k, v in weights.items() if k != "Temporal Fusion Transformer (TFT)")
            if non_tft_sum > 0:
                for model in list(weights.keys()):
                    if model != "Temporal Fusion Transformer (TFT)":
                        weights[model] = float(max(0.02, weights[model] - (weights[model] / non_tft_sum) * tft_boost))
                
            weights["Temporal Fusion Transformer (TFT)"] = float(min(0.95, weights["Temporal Fusion Transformer (TFT)"] + tft_boost))
            
        # Normalize weights to ensure they sum exactly to 1.0
        total = sum(weights.values())
        if total > 0:
            for k in weights:
                weights[k] = float(weights[k] / total)
                
        return weights
