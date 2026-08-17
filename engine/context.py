from typing import Dict, Any

class PipelineContext:
    """
    PipelineContext holds shared data, configurations, and indicators
    passed across the execution of different quantitative stages.
    """
    def __init__(self):
        self.data: Dict[str, Any] = {}
        self.context: Dict[str, Any] = {}
