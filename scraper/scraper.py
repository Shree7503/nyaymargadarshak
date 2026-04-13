"""
NyayMargadarshak Web Scraper
Scrapes legal news from Indian legal portals and stores in SQLite.
"""

import sqlite3
import uuid
import os
import sys
import logging
from datetime import datetime

try:
    import requests
    import feedparser
    from bs4 import BeautifulSoup
except ImportError:
    print("Missing dependencies. Run: pip install requests feedparser beautifulsoup4")
    sys.exit(1)

from sources import RSS_SOURCES, HEADERS, DB_PATH

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[logging.StreamHandler()]
)
log = logging.getLogger(__name__)

def get_db_connection():
    db_path = os.path.join(os.path.dirname(__file__), DB_PATH)
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def url_exists(conn, url):
    cur = conn.execute("SELECT 1 FROM legal_updates WHERE url = ?", (url,))
    return cur.fetchone() is not None

def insert_update(conn, title, source, summary, url, published_date):
    if url_exists(conn, url):
        return False
    try:
        conn.execute(
            "INSERT INTO legal_updates (id, title, source, summary, url, published_date) VALUES (?,?,?,?,?,?)",
            (str(uuid.uuid4()), title[:500], source, summary[:1000], url, published_date)
        )
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False

def scrape_rss(source):
    """Scrape an RSS/Atom feed."""
    log.info(f"Scraping RSS: {source['name']} ← {source['url']}")
    items_added = 0
    
    try:
        resp = requests.get(source['url'], headers=HEADERS, timeout=15)
        resp.raise_for_status()
        
        feed = feedparser.parse(resp.content)
        conn = get_db_connection()
        
        for entry in feed.entries[:15]:
            title = getattr(entry, 'title', '').strip()
            url = getattr(entry, 'link', '').strip()
            
            if not title or not url:
                continue
            
            # Get summary - strip HTML tags
            summary_raw = getattr(entry, 'summary', '') or getattr(entry, 'description', '') or title
            soup = BeautifulSoup(summary_raw, 'html.parser')
            summary = soup.get_text(separator=' ').strip()[:800]
            
            # Parse date
            published = None
            if hasattr(entry, 'published_parsed') and entry.published_parsed:
                published = datetime(*entry.published_parsed[:6]).isoformat()
            elif hasattr(entry, 'updated_parsed') and entry.updated_parsed:
                published = datetime(*entry.updated_parsed[:6]).isoformat()
            else:
                published = datetime.utcnow().isoformat()
            
            added = insert_update(conn, title, source['name'], summary, url, published)
            if added:
                items_added += 1
                log.info(f"  ✅ Added: {title[:60]}...")
        
        conn.close()
        
    except requests.RequestException as e:
        log.error(f"  ❌ Request failed for {source['name']}: {e}")
    except Exception as e:
        log.error(f"  ❌ Error scraping {source['name']}: {e}")
    
    return items_added

def scrape_html(source):
    """Scrape an HTML page for legal updates."""
    log.info(f"Scraping HTML: {source['name']} ← {source['url']}")
    items_added = 0
    
    try:
        resp = requests.get(source['url'], headers=HEADERS, timeout=15)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.content, 'html.parser')
        
        # Generic extraction of article links
        articles = soup.find_all('a', href=True)
        conn = get_db_connection()
        
        for a in articles[:20]:
            title = a.get_text(strip=True)
            url = a['href']
            
            if not title or len(title) < 20:
                continue
            if not url.startswith('http'):
                url = source['url'].rstrip('/') + '/' + url.lstrip('/')
            
            summary = title
            published = datetime.utcnow().isoformat()
            
            added = insert_update(conn, title, source['name'], summary, url, published)
            if added:
                items_added += 1
        
        conn.close()
        
    except Exception as e:
        log.error(f"  ❌ Error scraping HTML {source['name']}: {e}")
    
    return items_added

def run_scraper():
    log.info("=" * 60)
    log.info("⚖️  NyayMargadarshak Scraper Starting...")
    log.info(f"   Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    log.info("=" * 60)
    
    total_added = 0
    
    for source in RSS_SOURCES:
        if source['type'] == 'rss':
            total_added += scrape_rss(source)
        elif source['type'] == 'html':
            total_added += scrape_html(source)
    
    log.info("=" * 60)
    log.info(f"✅ Scraping complete. {total_added} new updates added.")
    log.info("=" * 60)
    return total_added

if __name__ == '__main__':
    run_scraper()
