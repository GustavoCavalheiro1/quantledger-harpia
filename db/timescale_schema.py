import os
import logging
import psycopg2
from psycopg2.extras import execute_values
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("TimescaleSchema")

def get_connection():
    """
    Establishes and returns a connection to the TimescaleDB/PostgreSQL database.
    Supports connection via a full database URL or individual connection parameters.
    """
    database_url = os.getenv("TIMESCALE_DATABASE_URL")
    if database_url:
        try:
            logger.info("Connecting to database using database URL...")
            return psycopg2.connect(database_url)
        except Exception as e:
            logger.warning(f"Failed to connect using URL: {e}. Trying individual parameters...")
    
    # Fallback to individual credentials
    host = os.getenv("TIMESCALE_DB_HOST", "localhost")
    port = os.getenv("TIMESCALE_DB_PORT", "5432")
    database = os.getenv("TIMESCALE_DB_NAME", "postgres")
    user = os.getenv("TIMESCALE_DB_USER", "postgres")
    password = os.getenv("TIMESCALE_DB_PASSWORD", "")
    sslmode = os.getenv("TIMESCALE_DB_SSLMODE", "prefer")
    
    logger.info(f"Connecting to database {database} at {host}:{port} as user {user}...")
    return psycopg2.connect(
        host=host,
        port=port,
        database=database,
        user=user,
        password=password,
        sslmode=sslmode
    )

def init_db():
    """
    Initializes the database schema by creating the asset_prices table and 
    converting it into a TimescaleDB hypertable.
    Uses graceful fallbacks for environments without the timescaledb extension.
    """
    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor()
        
        # 1. Try to create TimescaleDB extension if possible
        try:
            cur.execute("CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;")
            conn.commit()
            logger.info("TimescaleDB extension verified/created.")
        except Exception as e:
            conn.rollback()
            logger.warning(f"Could not create timescaledb extension (probably running on standard PostgreSQL): {e}")
        
        # 2. Create asset_prices table
        create_table_query = """
        CREATE TABLE IF NOT EXISTS asset_prices (
            time TIMESTAMP WITH TIME ZONE NOT NULL,
            ticker VARCHAR(12) NOT NULL,
            price NUMERIC(18, 6) NOT NULL,
            volume BIGINT DEFAULT 0,
            PRIMARY KEY (time, ticker)
        );
        """
        cur.execute(create_table_query)
        conn.commit()
        logger.info("Table 'asset_prices' verified/created.")
        
        # 3. Try to convert to hypertable (TimescaleDB specific feature)
        try:
            # We check if it is already a hypertable first or use if_not_exists
            cur.execute("SELECT create_hypertable('asset_prices', 'time', if_not_exists => TRUE);")
            conn.commit()
            logger.info("Table 'asset_prices' converted to TimescaleDB hypertable successfully.")
        except Exception as e:
            conn.rollback()
            logger.warning(f"Could not convert to hypertable (this is normal if running standard PostgreSQL): {e}")
            
        cur.close()
    except Exception as e:
        logger.error(f"Error initializing TimescaleDB/PostgreSQL database: {e}")
        if conn:
            conn.rollback()
        raise e
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    logger.info("Starting TimescaleDB Schema Initialization...")
    init_db()
    logger.info("Initialization completed successfully.")
