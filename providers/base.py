"""
providers/base.py — Classe base para todos os provedores de dados e integração com DualWriter.
"""
import logging
import sqlite3
import pandas as pd
from datetime import datetime
from providers.dual_writer import DualWriter

logger = logging.getLogger(__name__)

class BaseProvider:
    def __init__(self, db_path: str = "local_ledger.db", max_delay: int = 5, max_retries: int = 3, cache_days: int = 30):
        self.db_path = db_path
        self.max_delay = max_delay
        self.max_retries = max_retries
        self.cache_days = cache_days
        self._writer = DualWriter(db_path)

    def _save_to_cache(self, ticker: str, df: pd.DataFrame, source: str) -> None:
        """Persiste os dados remotos no SQLite e no TimescaleDB com upsert/graceful fallback via DualWriter."""
        if df is None or df.empty:
            return
        self._writer.save(ticker, df, source)
        logger.info(f"Cache atualizado: {ticker} ({source}) — {len(df)} registros via DualWriter.")

    def _throttle(self) -> None:
        pass
