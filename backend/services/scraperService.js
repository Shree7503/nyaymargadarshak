const { getDb } = require('../models/db');
const { v4: uuidv4 } = require('uuid');
const https = require('https');
const http = require('http');

// Fetch URL using Node http/https
const fetchUrl = (url) => {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;

    const req = client.get(
      url,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 NyayMargadarshak/1.0'
        },
        timeout: 10000
      },
      (res) => {
        let data = '';

        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      }
    );

    req.on('error', reject);

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
};


// Parse RSS
const parseRSS = (xml, sourceName) => {

  const items = [];

  const matches =
    xml.match(/<item[^>]*>([\s\S]*?)<\/item>/gi) ||
    xml.match(/<entry[^>]*>([\s\S]*?)<\/entry>/gi) ||
    [];

  for (const item of matches.slice(0, 50)) {

    const title =
      (item.match(/<title[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/i) || [])[1]?.trim();

    const link =
      (item.match(/<link[^>]*>(.*?)<\/link>/i) ||
        item.match(/<link[^>]*href="([^"]+)"/i) || [])[1]?.trim();

    const description =
      (item.match(/<description[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i) ||
        item.match(/<summary[^>]*>([\s\S]*?)<\/summary>/i) || [])[1]?.trim();

    const pubDate =
      (item.match(/<pubDate>(.*?)<\/pubDate>/i) ||
        item.match(/<published>(.*?)<\/published>/i) || [])[1]?.trim();

    if (title && link) {

      items.push({
        title: title.replace(/<[^>]+>/g, '').substring(0, 200),

        url: link.replace(/<[^>]+>/g, '').trim(),

        summary: description
          ? description.replace(/<[^>]+>/g, '').substring(0, 400)
          : title,

        source: sourceName,

        published_date: pubDate || new Date().toISOString()
      });
    }
  }

  return items;
};



// MUCH MORE NEWS SOURCES
const SOURCES = [

  { url: 'https://www.livelaw.in/rss/top-stories', name: 'Live Law' },
  { url: 'https://www.barandbench.com/feed', name: 'Bar and Bench' },
  { url: 'https://lawtrend.in/feed', name: 'Law Trend' },
  { url: 'https://www.scobserver.in/feed', name: 'SC Observer' },

  { url: 'https://indianexpress.com/section/india/law-and-justice/feed/', name: 'Indian Express Law' },
  { url: 'https://theprint.in/tag/supreme-court/feed/', name: 'The Print Law' },
  { url: 'https://www.thehindu.com/news/national/feeder/default.rss', name: 'The Hindu Law' },
  { url: 'https://blog.ipleaders.in/feed/', name: 'iPleaders' },
  { url: 'https://legallyindia.com/feed', name: 'Legally India' }

];



// Scrape and store
const scrapeAndStore = async () => {

  const db = getDb();

  let inserted = 0;

  for (const source of SOURCES) {

    try {

      console.log(`🔎 Scraping: ${source.name}`);

      const xml = await fetchUrl(source.url);

      const items = parseRSS(xml, source.name);

      const insertStmt = db.prepare(`
        INSERT OR IGNORE INTO legal_updates
        (id, title, source, summary, url, published_date)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      for (const item of items) {

        const result = insertStmt.run(
          uuidv4(),
          item.title,
          item.source,
          item.summary,
          item.url,
          item.published_date
        );

        if (result.changes > 0) inserted++;
      }

    } catch (err) {

      console.error(`❌ Failed to scrape ${source.name}:`, err.message);

    }
  }

  console.log(`✅ Scraping complete. ${inserted} new updates added.`);

  return inserted;
};



// Fallback seed
const seedFallbackUpdates = () => {

  const db = getDb();

  const count = db.prepare('SELECT COUNT(*) as c FROM legal_updates').get();

  if (count.c > 0) return;

  const updates = [

    {
      title: 'Supreme Court clarifies bail guidelines',
      source: 'Live Law',
      summary: 'Supreme Court has issued updated guidelines regarding bail procedures.',
      url: 'https://www.livelaw.in/',
      published_date: new Date().toISOString()
    },

    {
      title: 'New criminal law reforms under Bharatiya Nyaya Sanhita',
      source: 'Bar and Bench',
      summary: 'India’s new criminal law reforms replace IPC with BNS.',
      url: 'https://www.barandbench.com/',
      published_date: new Date().toISOString()
    }

  ];

  const insertStmt = db.prepare(`
    INSERT OR IGNORE INTO legal_updates
    (id, title, source, summary, url, published_date)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const u of updates) {

    insertStmt.run(
      uuidv4(),
      u.title,
      u.source,
      u.summary,
      u.url,
      u.published_date
    );
  }

  console.log('Fallback legal updates seeded');

};



module.exports = {
  scrapeAndStore,
  seedFallbackUpdates
};