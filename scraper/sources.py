"""
Legal news sources for NyayMargadarshak web scraper.
"""

RSS_SOURCES = [
    {
        "name": "Live Law",
        "url": "https://www.livelaw.in/rss/top-stories",
        "type": "rss"
    },
    {
        "name": "Bar and Bench",
        "url": "https://www.barandbench.com/feed",
        "type": "rss"
    },
    {
        "name": "Law Trend",
        "url": "https://lawtrend.in/feed",
        "type": "rss"
    },
    {
        "name": "SC Observer",
        "url": "https://www.scobserver.in/feed",
        "type": "rss"
    },
    {
        "name": "India Code",
        "url": "https://www.indiacode.nic.in/",
        "type": "html"
    },
]

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; NyayMargadarshak/1.0; +https://nyaymargadarshak.in)",
    "Accept": "application/rss+xml, application/xml, text/xml, */*",
}

SCRAPE_INTERVAL_HOURS = 6
DB_PATH = "../database/nyay.db"
