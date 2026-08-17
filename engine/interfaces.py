from abc import ABC, abstractmethod
from typing import Any
from engine.context import PipelineContext

class IDataProvider(ABC):
    @abstractmethod
    def load_market_data(self, context: PipelineContext) -> None:
        pass

class IFeatureStore(ABC):
    @abstractmethod
    def generate_features(self, context: PipelineContext) -> None:
        pass

class IScoringEngine(ABC):
    @abstractmethod
    def generate_scores(self, context: PipelineContext) -> None:
        pass

class IViewEngine(ABC):
    @abstractmethod
    def generate_views(self, context: PipelineContext) -> None:
        pass

class IForecaster(ABC):
    @abstractmethod
    def forecast_returns(self, context: PipelineContext) -> None:
        pass

class IPortfolioOptimizer(ABC):
    @abstractmethod
    def optimize(self, context: PipelineContext) -> None:
        pass

class IRiskEngine(ABC):
    @abstractmethod
    def evaluate_risk(self, context: PipelineContext) -> None:
        pass

class IExecutionEngine(ABC):
    @abstractmethod
    def execute_portfolio(self, context: PipelineContext) -> None:
        pass

class IExplainabilityEngine(ABC):
    @abstractmethod
    def generate_explainability(self, context: PipelineContext) -> None:
        pass

class IReportingEngine(ABC):
    @abstractmethod
    def calculate_performance(self, context: PipelineContext) -> None:
        pass
