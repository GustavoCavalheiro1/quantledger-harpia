from abc import ABC, abstractmethod
from typing import Dict, Any

class BaseScorer(ABC):
    """
    Abstract base class for all scoring models in the Harpia Finance Asset pipeline.
    """
    def __init__(self, name: str):
        self.name = name

    @abstractmethod
    def generate_score(self, asset_id: str, market_data: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generates a score between 0.0 and 100.0, along with model confidence,
        return contribution, risk contribution, and an explanation.
        """
        pass
