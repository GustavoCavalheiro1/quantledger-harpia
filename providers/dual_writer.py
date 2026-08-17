import os
import sqlite3
import logging
from datetime import datetime
from dotenv import load_dotenv
import sys

# Add root folder to sys.path to ensure absolute imports work correctly
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db.timescale_schema import get_connection, init_db

load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("DualWriter")

class DualWriter:
    """
    DualWriter implements dual persistence for financial price time series.
    It writes data simultaneously to a local SQLite database (for fast cached reads/contingency)
    and a remote TimescaleDB/PostgreSQL instance (for high-performance historical analysis and scale).
    """
    
    def __init__(self, sqlite_db_path=None):
        if sqlite_db_path is None:
            # Put the SQLite database in a 'db' directory in the project root
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            db_dir = os.path.join(base_dir, "db")
            os.makedirs(db_dir, exist_ok=True)
            self.sqlite_db_path = os.path.join(db_dir, "local_ledger.db")
        else:
            self.sqlite_db_path = sqlite_db_path
            
        logger.info(f"Initialized DualWriter. Local SQLite path: {self.sqlite_db_path}")

    def init_sqlite(self):
        """
        Creates the local SQLite database schema.
        """
        conn = None
        try:
            conn = sqlite3.connect(self.sqlite_db_path)
            cur = conn.cursor()
            create_table_query = """
            CREATE TABLE IF NOT EXISTS asset_prices (
                time TEXT NOT NULL,
                ticker TEXT NOT NULL,
                price REAL NOT NULL,
                volume INTEGER DEFAULT 0,
                PRIMARY KEY (time, ticker)
            );
            """
            cur.execute(create_table_query)
            conn.commit()
            logger.info("Local SQLite table 'asset_prices' verified/created.")
        except Exception as e:
            logger.error(f"Error initializing SQLite database: {e}")
            raise e
        finally:
            if conn:
                conn.close()

    def init_all(self):
        """
        Initializes both SQLite and TimescaleDB database schemas.
        """
        logger.info("Initializing dual-persistence schemas...")
        # Initialize SQLite
        self.init_sqlite()
        
        # Initialize TimescaleDB
        try:
            init_db()
            logger.info("TimescaleDB initialization succeeded.")
        except Exception as e:
            logger.warning(f"TimescaleDB initialization could not connect or failed: {e}. SQLite will serve as primary local copy.")

    def write_prices(self, records):
        """
        Writes price records to both SQLite and TimescaleDB.
        
        Parameters:
        records (list of dict): A list of dictionaries, where each dict has:
            - 'time': datetime object or string (ISO-8601)
            - 'ticker': str (e.g., 'PETR4', 'CDI')
            - 'price': float
            - 'volume': int (optional, default 0)
            
        Returns:
        dict: Ingestion status showing successes and failures for each database target.
        """
        if not records:
            logger.info("No records provided to write_prices.")
            return {"sqlite": True, "timescale": True, "count": 0}
            
        formatted_records = []
        for r in records:
            # Standardize time format to string for SQLite and timestamp/string for Timescale
            dt = r['time']
            if isinstance(dt, datetime):
                dt_str = dt.isoformat()
            else:
                dt_str = str(dt)
                
            ticker = r['ticker']
            price = float(r['price'])
            volume = int(r.get('volume', 0))
            formatted_records.append((dt_str, ticker, price, volume))
            
        # 1. Write to SQLite (Local/Persistent Cache)
        sqlite_success = False
        sqlite_conn = None
        try:
            sqlite_conn = sqlite3.connect(self.sqlite_db_path)
            sqlite_cur = sqlite_conn.cursor()
            
            sqlite_query = """
            INSERT OR REPLACE INTO asset_prices (time, ticker, price, volume)
            VALUES (?, ?, ?, ?)
            """
            sqlite_cur.executemany(sqlite_query, formatted_records)
            sqlite_conn.commit()
            sqlite_success = True
            logger.info(f"Successfully inserted {len(records)} records into local SQLite database.")
        except Exception as e:
            logger.error(f"Failed to write to local SQLite database: {e}")
            if sqlite_conn:
                sqlite_conn.rollback()
        finally:
            if sqlite_conn:
                sqlite_conn.close()

        # 2. Write to TimescaleDB (Remote/Scale Target)
        timescale_success = False
        timescale_conn = None
        try:
            timescale_conn = get_connection()
            timescale_cur = timescale_conn.cursor()
            
            timescale_query = """
            INSERT INTO asset_prices (time, ticker, price, volume)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (time, ticker) DO UPDATE SET
                price = EXCLUDED.price,
                volume = EXCLUDED.volume;
            """
            
            # Using execute_batch for higher performance on bulk inserts
            from psycopg2.extras import execute_batch
            execute_batch(timescale_cur, timescale_query, formatted_records)
            timescale_conn.commit()
            timescale_success = True
            logger.info(f"Successfully inserted {len(records)} records into TimescaleDB.")
        except Exception as e:
            # Log the error but do not fail completely, allowing SQLite-only fallback if TimescaleDB is offline
            logger.error(f"Failed to write to TimescaleDB (PostgreSQL): {e}")
            if timescale_conn:
                timescale_conn.rollback()
        finally:
            if timescale_conn:
                timescale_conn.close()
                
        return {
            "sqlite": sqlite_success,
            "timescale": timescale_success,
            "count": len(records)
        }

    def fetch_all_sqlite(self, ticker=None):
        """
        Helper method to retrieve ingested rows from SQLite.
        """
        conn = None
        try:
            conn = sqlite3.connect(self.sqlite_db_path)
            cur = conn.cursor()
            if ticker:
                cur.execute("SELECT time, ticker, price, volume FROM asset_prices WHERE ticker = ? ORDER BY time ASC", (ticker,))
            else:
                cur.execute("SELECT time, ticker, price, volume FROM asset_prices ORDER BY time ASC")
            return cur.fetchall()
        except Exception as e:
            logger.error(f"Error querying SQLite database: {e}")
            return []
        finally:
            if conn:
                conn.close()

if __name__ == "__main__":
    logger.info("Testing DualWriter instantiation...")
    writer = DualWriter()
    writer.init_all()
    logger.info("Test finished.")
