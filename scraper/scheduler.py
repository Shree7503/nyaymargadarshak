"""
NyayMargadarshak Scraper Scheduler
Runs the scraper automatically every N hours.
"""
import time
import logging
from datetime import datetime
from scraper import run_scraper
from sources import SCRAPE_INTERVAL_HOURS

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
log = logging.getLogger(__name__)

def main():
    log.info(f"⏰ Scheduler started. Will scrape every {SCRAPE_INTERVAL_HOURS} hours.")
    
    # Run immediately on start
    run_scraper()
    
    interval_seconds = SCRAPE_INTERVAL_HOURS * 3600
    
    while True:
        next_run = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        log.info(f"💤 Next scrape in {SCRAPE_INTERVAL_HOURS} hours (at ~{next_run})")
        time.sleep(interval_seconds)
        run_scraper()

if __name__ == '__main__':
    main()
