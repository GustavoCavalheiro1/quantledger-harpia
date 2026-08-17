import sqlite3
import os
import sys
import random
from datetime import datetime, timedelta

# Setup inline clean logging
def log_info(msg):
    print(f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S')} [INFO] - {msg}")

def log_warning(msg):
    print(f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S')} [WARNING] - {msg}")

def log_error(msg):
    print(f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S')} [ERROR] - {msg}")

# Define SQLite Path matching providers/dual_writer.py
DB_DIR = os.path.dirname(os.path.abspath(__file__))
SQLITE_PATH = os.path.join(DB_DIR, "local_ledger.db")

def create_sqlite_schema():
    """Ensure SQLite table schema exists and is clean."""
    log_info(f"Initializing SQLite database at: {SQLITE_PATH}")
    os.makedirs(DB_DIR, exist_ok=True)
    conn = sqlite3.connect(SQLITE_PATH)
    cur = conn.cursor()
    
    # Core table for all asset prices and macro metrics
    cur.execute("""
    CREATE TABLE IF NOT EXISTS asset_prices (
        time TEXT NOT NULL,
        ticker TEXT NOT NULL,
        price REAL NOT NULL,
        volume INTEGER DEFAULT 0,
        PRIMARY KEY (time, ticker)
    );
    """)
    
    # Metadata catalog table for all available tickers
    cur.execute("""
    CREATE TABLE IF NOT EXISTS asset_catalog (
        ticker TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,       -- 'B3', 'SP500', 'BACEN', 'FED'
        currency TEXT NOT NULL,   -- 'BRL', 'USD', 'PERCENT'
        description TEXT
    );
    """)
    
    conn.commit()
    conn.close()
    log_info("SQLite schemas for 'asset_prices' and 'asset_catalog' verified/created.")

def get_asset_catalog_data():
    """Returns catalog descriptions of all integrated financial indicators."""
    return [
        # B3 Equities
        ("PETR4", "Petrobras PN", "B3", "BRL", "Petróleo Brasileiro S.A. Preferenciais - Ativo Líder B3"),
        ("VALE3", "Vale S.A. ON", "B3", "BRL", "Vale S.A. Ordinárias - Líder Global em Mineração de Ferro"),
        ("WEGE3", "WEG S.A. ON", "B3", "BRL", "WEG S.A. Ordinárias - Indústria, Motores e Automação de Alta Eficiência"),
        ("ITUB4", "Itaú Unibanco PN", "B3", "BRL", "Itaú Unibanco Holding S.A. Preferenciais - Maior Banco Privado do Brasil"),
        ("BBAS3", "Banco do Brasil ON", "B3", "BRL", "Banco do Brasil S.A. Ordinárias - Instituição Financeira Estatal"),
        ("BOVA11", "iShares Ibovespa ETF", "B3", "BRL", "Fundo de Índice que replica o desempenho do Ibovespa"),
        ("B3SA3", "B3 S.A. ON", "B3", "BRL", "B3 S.A. - Brasil, Bolsa, Balcão - Operadora da Bolsa Brasileira"),
        
        # S&P 500 Equities via YFinance
        ("AAPL", "Apple Inc.", "SP500", "USD", "Apple Inc. - Consumer Electronics and Software Giant"),
        ("MSFT", "Microsoft Corp.", "SP500", "USD", "Microsoft Corporation - Enterprise Software & Cloud Leader"),
        ("GOOGL", "Alphabet Inc.", "SP500", "USD", "Alphabet Inc. Class A - Search Engine & Digital Ads King"),
        ("AMZN", "Amazon.com Inc.", "SP500", "USD", "Amazon.com Inc. - E-commerce and AWS Infrastructure Platform"),
        ("TSLA", "Tesla Inc.", "SP500", "USD", "Tesla, Inc. - Electric Vehicles & Clean Energy Solutions"),
        ("NVDA", "NVIDIA Corp.", "SP500", "USD", "NVIDIA Corporation - GPU & AI Chip Superpower"),
        ("SPY", "SPDR S&P 500 ETF Trust", "SP500", "USD", "ETF tracking the performance of the S&P 500 Index"),
        
        # BACEN (Central Bank of Brazil)
        ("SELIC", "Taxa SELIC Over", "BACEN", "PERCENT", "Taxa Básica de Juros da Economia Brasileira (Anualizada)"),
        ("IPCA", "Inflação IPCA Mensal", "BACEN", "PERCENT", "Índice Nacional de Preços ao Consumidor Amplo - IPCA"),
        ("CDI", "Taxa CDI Diária", "BACEN", "PERCENT", "Certificado de Depósito Interbancário - Taxa Média Equivalente"),
        
        # Federal Reserve (Fed)
        ("EFFR", "Effective Federal Funds Rate", "FED", "PERCENT", "US Central Bank Policy rate (annualized average)"),
        ("US_CPI", "US CPI Monthly Inflation", "FED", "PERCENT", "US Consumer Price Index - Monthly Core Inflation Rate"),
        ("US_TREASURY_10Y", "US 10-Year Treasury Yield", "FED", "PERCENT", "Yield of the United States 10-Year Government Bond")
    ]

def generate_historical_prices():
    """Generates 90 days of realistic daily historical data for each asset."""
    random.seed(42)  # For reproducible historical trends
    price_models = {
        # Ticker: (Initial Price, Daily Drift, Daily Vol, Default Volume)
        "PETR4": (33.50, 0.0005, 0.018, 5000000),
        "VALE3": (66.80, -0.0002, 0.015, 3500000),
        "WEGE3": (41.20, 0.0008, 0.013, 2000000),
        "ITUB4": (32.40, 0.0003, 0.012, 4500000),
        "BBAS3": (26.80, 0.0006, 0.016, 3000000),
        "BOVA11": (122.50, 0.0002, 0.010, 8000000),
        "B3SA3": (11.80, -0.0001, 0.017, 4000000),
        
        "AAPL": (180.50, 0.0006, 0.012, 45000000),
        "MSFT": (415.20, 0.0007, 0.011, 20000000),
        "GOOGL": (168.40, 0.0005, 0.013, 25000000),
        "AMZN": (178.90, 0.0008, 0.014, 30000000),
        "TSLA": (185.00, -0.0005, 0.028, 85000000),
        "NVDA": (820.00, 0.0025, 0.030, 48000000),
        "SPY": (508.50, 0.0003, 0.008, 60000000),
        
        # Macro indicators (Step models with small daily variations)
        "SELIC": (0.1050, 0.0, 0.0001, 0),         # 10.50% basic rate
        "IPCA": (0.0038, 0.0, 0.0002, 0),          # ~0.38% monthly inflation
        "CDI": (0.1044, 0.0, 0.0001, 0),           # Slightly below Selic Over
        
        "EFFR": (0.0533, 0.0, 0.00005, 0),         # ~5.33% US benchmark
        "US_CPI": (0.0022, 0.0, 0.0001, 0),        # ~0.22% US monthly inflation
        "US_TREASURY_10Y": (0.0425, 0.0001, 0.0005, 0) # 4.25% treasury yield
    }
    
    historical_records = []
    base_date = datetime.now() - timedelta(days=90)
    
    # Initialize running price state
    running_prices = {ticker: model[0] for ticker, model in price_models.items()}
    
    for i in range(91):
        day = base_date + timedelta(days=i)
        
        # Skip weekends for stocks, but let macro rate exist or carry over
        is_weekend = day.weekday() >= 5
        
        for ticker, model in price_models.items():
            curr_val = running_prices[ticker]
            is_macro = ticker in ["SELIC", "IPCA", "CDI", "EFFR", "US_CPI", "US_TREASURY_10Y"]
            
            if is_weekend and not is_macro:
                continue  # Stocks do not trade on weekends
                
            # Evolve prices using Geometric Brownian Motion (GBM) or Mean-reverting Walk
            drift = model[1]
            vol = model[2]
            base_vol = model[3] if len(model) > 3 else 0
            
            if is_macro:
                # Macro rates change in small discrete steps occasionally
                if random.random() < 0.05: # 5% chance of macroeconomic change
                    shock = random.normalvariate(0, 0.01) * vol
                    curr_val = max(0.0, curr_val + shock)
            else:
                # Equity stock path
                shock = random.normalvariate(0, 1) * vol
                curr_val = curr_val * (1 + drift + shock)
                curr_val = max(0.1, curr_val) # Prevent zero prices
                
            running_prices[ticker] = curr_val
            
            # Formulate volume with randomized variation
            volume = 0
            if not is_macro:
                volume = int(base_vol * random.uniform(0.7, 1.4))
                
            historical_records.append({
                "time": day.strftime("%Y-%m-%d 18:00:00"),
                "ticker": ticker,
                "price": curr_val,
                "volume": volume
            })
            
    return historical_records

def seed_all():
    """Populate SQLite database with financial assets & indices."""
    create_sqlite_schema()
    
    catalog = get_asset_catalog_data()
    records = generate_historical_prices()
    
    # 1. Populate Catalog in SQLite
    log_info(f"Seeding {len(catalog)} assets into asset_catalog SQLite table...")
    sqlite_conn = sqlite3.connect(SQLITE_PATH)
    sqlite_cur = sqlite_conn.cursor()
    
    sqlite_cur.executemany("""
    INSERT OR REPLACE INTO asset_catalog (ticker, name, type, currency, description)
    VALUES (?, ?, ?, ?, ?);
    """, catalog)
    sqlite_conn.commit()
    log_info("asset_catalog seeded in SQLite successfully.")
    
    # 2. Populate Prices in SQLite
    log_info(f"Seeding {len(records)} price records into SQLite 'asset_prices'...")
    formatted_sqlite_prices = [(r["time"], r["ticker"], r["price"], r["volume"]) for r in records]
    
    sqlite_cur.executemany("""
    INSERT OR REPLACE INTO asset_prices (time, ticker, price, volume)
    VALUES (?, ?, ?, ?);
    """, formatted_sqlite_prices)
    sqlite_conn.commit()
    sqlite_conn.close()
    log_info("asset_prices seeded in SQLite successfully.")
    
    # 3. Synchronize with TimescaleDB/PostgreSQL if library is available
    try:
        import psycopg2
        from psycopg2.extras import execute_batch
        
        # Check environment variables
        database_url = os.getenv("TIMESCALE_DATABASE_URL")
        if not database_url:
            log_warning("TimescaleDB URL environment variable not set. Skipping Timescale sync.")
            return

        log_info("Connecting to TimescaleDB for synchronization...")
        timescale_conn = psycopg2.connect(database_url)
        timescale_cur = timescale_conn.cursor()
        
        # Create catalog table in Postgres if not exists
        timescale_cur.execute("""
        CREATE TABLE IF NOT EXISTS asset_catalog (
            ticker VARCHAR(12) PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            type VARCHAR(20) NOT NULL,
            currency VARCHAR(10) NOT NULL,
            description TEXT
        );
        """)
        timescale_conn.commit()
        
        # Seed catalog in Postgres
        timescale_cur.executemany("""
        INSERT INTO asset_catalog (ticker, name, type, currency, description)
        VALUES (%s, %s, %s, %s, %s)
        ON CONFLICT (ticker) DO UPDATE SET
            name = EXCLUDED.name,
            type = EXCLUDED.type,
            currency = EXCLUDED.currency,
            description = EXCLUDED.description;
        """, catalog)
        timescale_conn.commit()
        
        # Seed price series in Postgres
        timescale_query = """
        INSERT INTO asset_prices (time, ticker, price, volume)
        VALUES (%s, %s, %s, %s)
        ON CONFLICT (time, ticker) DO UPDATE SET
            price = EXCLUDED.price,
            volume = EXCLUDED.volume;
        """
        
        execute_batch(timescale_cur, timescale_query, formatted_sqlite_prices)
        timescale_conn.commit()
        timescale_conn.close()
        log_info("✓ TimescaleDB sync completed successfully!")
    except ImportError:
        log_warning("psycopg2-binary not installed in Python. Skipping TimescaleDB cloud sync (normal in local-only environments).")
    except Exception as e:
        log_warning(f"Could not connect to TimescaleDB: {e}. Local SQLite copy initialized perfectly.")

if __name__ == "__main__":
    print("=====================================================")
    print("     STARTING COHESIVE FINANCIAL DATA SEEDING")
    print("=====================================================")
    seed_all()
    print("=====================================================")
    print("          MARKET DATABASE SEEDED PERFECTLY")
    print("=====================================================")
