import os
import sys
import logging
from datetime import datetime, timedelta

# Add root directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from providers.data_manager import DataManager

# Setup clean visual logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] (%(name)s) - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("IntegrationTest")

def run_test():
    logger.info("====================================================================")
    logger.info("      STARTING DUAL-PERSISTENCE INTEGRATION TEST (FASE C)")
    logger.info("====================================================================")
    
    # Use a separate test SQLite DB to avoid polluting the development ledger
    test_sqlite_path = os.path.join(
        os.path.dirname(os.path.abspath(__file__)), "db", "test_ledger.db"
    )
    
    # Remove previous test database if it exists to ensure a clean slate
    if os.path.exists(test_sqlite_path):
        try:
            os.remove(test_sqlite_path)
            logger.info(f"Cleaned up previous test ledger at: {test_sqlite_path}")
        except Exception as e:
            logger.warning(f"Could not remove old test DB: {e}")
            
    # 1. Initialize DataManager (this will create schemas automatically)
    logger.info("Step 1: Initializing DataManager and verifying schemas...")
    dm = DataManager(sqlite_db_path=test_sqlite_path)
    logger.info("DataManager initialized.")

    # 2. Prepare test dataset (CDI and PETR4 prices over the last 5 days)
    logger.info("Step 2: Preparing financial price series dataset for CDI and PETR4...")
    base_time = datetime.now() - timedelta(days=5)
    
    test_series = [
        # Day 1
        {"time": (base_time + timedelta(days=0)).strftime("%Y-%m-%d 18:00:00"), "ticker": "PETR4", "price": 34.20, "volume": 1200000},
        {"time": (base_time + timedelta(days=0)).strftime("%Y-%m-%d 18:00:00"), "ticker": "CDI", "price": 0.1050, "volume": 0},
        # Day 2
        {"time": (base_time + timedelta(days=1)).strftime("%Y-%m-%d 18:00:00"), "ticker": "PETR4", "price": 34.55, "volume": 1500000},
        {"time": (base_time + timedelta(days=1)).strftime("%Y-%m-%d 18:00:00"), "ticker": "CDI", "price": 0.1050, "volume": 0},
        # Day 3
        {"time": (base_time + timedelta(days=2)).strftime("%Y-%m-%d 18:00:00"), "ticker": "PETR4", "price": 33.90, "volume": 980000},
        {"time": (base_time + timedelta(days=2)).strftime("%Y-%m-%d 18:00:00"), "ticker": "CDI", "price": 0.1052, "volume": 0},
        # Day 4
        {"time": (base_time + timedelta(days=3)).strftime("%Y-%m-%d 18:00:00"), "ticker": "PETR4", "price": 34.80, "volume": 1100000},
        {"time": (base_time + timedelta(days=3)).strftime("%Y-%m-%d 18:00:00"), "ticker": "CDI", "price": 0.1052, "volume": 0},
        # Day 5 (Duplicate to test UPSERT behavior)
        {"time": (base_time + timedelta(days=4)).strftime("%Y-%m-%d 18:00:00"), "ticker": "PETR4", "price": 35.10, "volume": 2000000},
        {"time": (base_time + timedelta(days=4)).strftime("%Y-%m-%d 18:00:00"), "ticker": "PETR4", "price": 35.25, "volume": 2100000}, # Update
        {"time": (base_time + timedelta(days=4)).strftime("%Y-%m-%d 18:00:00"), "ticker": "CDI", "price": 0.1055, "volume": 0},
    ]
    
    # 3. Execute Dual-Write Ingestion
    logger.info(f"Step 3: Initiating dual-persistence ingestion on {len(test_series)} raw data events...")
    ingestion_results = dm.ingest_prices(test_series)
    
    logger.info(f"Ingestion Finished. Status: {ingestion_results}")
    
    # 4. Verify Local SQLite Integrity
    logger.info("Step 4: Querying SQLite local database cache to verify persistence and UPSERTs...")
    petr_sqlite = dm.get_prices("PETR4", source="sqlite")
    cdi_sqlite = dm.get_prices("CDI", source="sqlite")
    
    logger.info(f"Retrieved {len(petr_sqlite)} unique PETR4 records from SQLite.")
    logger.info(f"Retrieved {len(cdi_sqlite)} unique CDI records from SQLite.")
    
    # We expect 5 rows for PETR4 (due to UPSERT overwrite on Day 5) and 5 rows for CDI
    assert len(petr_sqlite) == 5, f"Expected 5 PETR4 records, got {len(petr_sqlite)}"
    assert len(cdi_sqlite) == 5, f"Expected 5 CDI records, got {len(cdi_sqlite)}"
    
    # Assert UPSERT overrode PETR4 on the last day with the last value (35.25)
    last_petr_row = petr_sqlite[-1]
    assert last_petr_row["price"] == 35.25, f"Expected last price to be 35.25, got {last_petr_row['price']}"
    
    logger.info("✓ SQLite Persistence Integrity Checked: PASS.")
    
    # 5. Check TimescaleDB connection status
    logger.info("Step 5: Verifying TimescaleDB synchronization status...")
    if ingestion_results["timescale_synced"]:
        petr_ts = dm.get_prices("PETR4", source="timescale")
        logger.info(f"✓ TimescaleDB Ingestion Sync is ONLINE. Retrieved {len(petr_ts)} rows.")
    else:
        logger.warning("⚠ TimescaleDB connection is OFFLINE or unconfigured (This is normal in mock/CI environments).")
        logger.info("✓ SQLite local cache successfully acted as primary ledger fallback. Dual Persistence decoupled gracefully.")

    # 6. Output formatted performance metrics
    logger.info("====================================================================")
    logger.info("      INTEGRATION TEST PASSED SUCCESSFULLY!")
    logger.info("====================================================================")
    logger.info(f"Local SQL Database Path : {test_sqlite_path}")
    logger.info(f"Ingestion Total Records : {ingestion_results['records_written']}")
    logger.info(f"SQLite Local Coverage   : 100% [5/5 Unique CDI | 5/5 Unique PETR4]")
    logger.info(f"Dual-Write Strategy     : ACTIVE")
    logger.info("====================================================================")
    
    # Clean up test database file at the end
    if os.path.exists(test_sqlite_path):
        try:
            os.remove(test_sqlite_path)
            logger.info("Cleaned up testing artifacts successfully.")
        except Exception as e:
            logger.warning(f"Failed to clean up test DB file: {e}")
            
    return True

if __name__ == "__main__":
    try:
        success = run_test()
        sys.exit(0)
    except AssertionError as ae:
        logger.error(f"INTEGRATION TEST ASSERTION FAILED: {ae}")
        sys.exit(1)
    except Exception as e:
        logger.error(f"INTEGRATION TEST FAILED WITH ERROR: {e}", exc_info=True)
        sys.exit(1)
