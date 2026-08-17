import os
import sys
import logging
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Add root folder to sys.path to ensure absolute imports work correctly
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from providers.dual_writer import DualWriter

load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("DataManager")

class DataManager:
    """
    DataManager coordinates ingestion, formatting, and querying of market data.
    It sits on top of the DualWriter, preparing data packages and abstracting
    away the complexity of simultaneous SQLite (local cache) and TimescaleDB 
    (historical scale) operations.
    """
    
    def __init__(self, sqlite_db_path=None):
        self.writer = DualWriter(sqlite_db_path=sqlite_db_path)
        # Ensure all database tables and hypertables are set up on initialization
        self.writer.init_all()

    def ingest_prices(self, raw_data):
        """
        Ingests lists of raw market prices, validates types, and forwards them
        to the DualWriter for dual persistence.
        
        Parameters:
        raw_data (list of dict): Each dict must contain:
            - 'time': str, datetime, or date representation
            - 'ticker': str (e.g., 'PETR4', 'CDI')
            - 'price': float
            - 'volume': int (optional)
        """
        validated_records = []
        for i, item in enumerate(raw_data):
            try:
                # 1. Parse date/time
                raw_time = item.get("time")
                if isinstance(raw_time, (datetime, datetime.date)):
                    parsed_time = raw_time
                elif isinstance(raw_time, str):
                    # Handle common ISO-8601 or YYYY-MM-DD formats
                    for fmt in ("%Y-%m-%dT%H:%M:%S", "%Y-%m-%d %H:%M:%S", "%Y-%m-%d", "%Y-%m-%dT%H:%M:%S%z"):
                        try:
                            parsed_time = datetime.strptime(raw_time.split(".")[0].split("+")[0], fmt)
                            break
                        except ValueError:
                            continue
                    else:
                        raise ValueError(f"Could not parse timestamp string: {raw_time}")
                else:
                    raise TypeError(f"Unsupported timestamp type: {type(raw_time)}")
                
                # 2. Parse ticker and price
                ticker = str(item["ticker"]).upper().strip()
                price = float(item["price"])
                volume = int(item.get("volume", 0))
                
                validated_records.append({
                    "time": parsed_time,
                    "ticker": ticker,
                    "price": price,
                    "volume": volume
                })
            except KeyError as e:
                logger.error(f"Missing required field in raw_data index {i}: {e}")
            except Exception as e:
                logger.error(f"Validation error in raw_data index {i} ({item}): {e}")
                
        if not validated_records:
            logger.warning("No valid records found in batch for ingestion.")
            return {"status": "skipped", "records_written": 0}
            
        logger.info(f"Ingesting {len(validated_records)} validated price points...")
        res = self.writer.write_prices(validated_records)
        
        return {
            "status": "completed",
            "records_written": res["count"],
            "sqlite_synced": res["sqlite"],
            "timescale_synced": res["timescale"]
        }

    def get_prices(self, ticker, source="sqlite"):
        """
        Queries historical prices from either SQLite or TimescaleDB.
        
        Parameters:
        ticker (str): The symbol of the asset to look up (e.g. 'PETR4', 'CDI')
        source (str): 'sqlite' or 'timescale'
        
        Returns:
        list of dict: List of dicts with price data ordered chronologically.
        """
        ticker = ticker.upper().strip()
        
        if source.lower() == "timescale":
            # Direct query to TimescaleDB
            from db.timescale_schema import get_connection
            conn = None
            try:
                conn = get_connection()
                cur = conn.cursor()
                query = "SELECT time, ticker, price, volume FROM asset_prices WHERE ticker = %s ORDER BY time ASC;"
                cur.execute(query, (ticker,))
                rows = cur.fetchall()
                cur.close()
                return [{"time": r[0].isoformat() if isinstance(r[0], datetime) else str(r[0]), "ticker": r[1], "price": float(r[2]), "volume": r[3]} for r in rows]
            except Exception as e:
                logger.error(f"Error querying TimescaleDB for {ticker}: {e}. Falling back to local SQLite cache.")
                # Fallback to sqlite source if Timescale fails
                source = "sqlite"
            finally:
                if conn:
                    conn.close()
                    
        if source.lower() == "sqlite":
            rows = self.writer.fetch_all_sqlite(ticker)
            return [{"time": r[0], "ticker": r[1], "price": float(r[2]), "volume": r[3]} for r in rows]
            
        logger.error(f"Unknown database source: {source}")
        return []

    def load_sample_market_data(self):
        """
        Generates and ingests historical seed data for PETR4 (Equity) and CDI (Daily Rate) 
        to test integrated connections and prepare standard sandbox simulation records.
        """
        logger.info("Generating and loading standard sandbox seed data for PETR4 and CDI...")
        
        # We generate daily data for the past 10 business days
        sample_data = []
        base_date = datetime.now() - timedelta(days=10)
        
        petr4_prices = [32.50, 32.85, 33.10, 32.70, 32.40, 32.95, 33.30, 33.55, 33.20, 33.80]
        cdi_rates = [0.1045, 0.1045, 0.1045, 0.1045, 0.1045, 0.1050, 0.1050, 0.1050, 0.1050, 0.1050] # 10.50% annualized represented daily
        
        for i in range(10):
            day = base_date + timedelta(days=i)
            # Skip weekends for realistic financial timelines
            if day.weekday() >= 5:
                continue
                
            # PETR4 Equity stock
            sample_data.append({
                "time": day.strftime("%Y-%m-%d 18:00:00"),
                "ticker": "PETR4",
                "price": petr4_prices[i % len(petr4_prices)],
                "volume": 1250000 + (i * 50000)
            })
            
            # CDI benchmark rate index
            sample_data.append({
                "time": day.strftime("%Y-%m-%d 18:00:00"),
                "ticker": "CDI",
                "price": cdi_rates[i % len(cdi_rates)],
                "volume": 0 # No volume for indices
            })
            
        return self.ingest_prices(sample_data)

if __name__ == "__main__":
    logger.info("Initializing DataManager...")
    dm = DataManager()
    res = dm.load_sample_market_data()
    logger.info(f"Ingestion response: {res}")
    
    petr_sqlite = dm.get_prices("PETR4", source="sqlite")
    logger.info(f"Retrieved {len(petr_sqlite)} PETR4 rows from local SQLite cache.")
