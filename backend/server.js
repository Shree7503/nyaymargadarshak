require('dotenv').config();
const express = require('express');
const cors = require('cors');//frontend bbackend communication
const cron = require('node-cron');//run scapper after every time
const { scrapeAndStore, seedFallbackUpdates } = require('./services/scraperService');

const app = express();

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'], credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/lawyers', require('./routes/lawyers'));
app.use('/api/contact', require('./routes/contacts'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api', require('./routes/legal'));


// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Scraper endpoint (manual trigger)
app.post('/api/admin/scrape', async (req, res) => {
  try {
    const count = await scrapeAndStore();
    res.json({ message: `Scraping complete. ${count} new updates added.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 404
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`⚖️  NyayMargadarshak API running on http://localhost:${PORT}`);
  
  // Seed fallback data on startup
  seedFallbackUpdates();

  // Run scraper on startup
  try {
    await scrapeAndStore();
  } catch (err) {
    console.log('Initial scrape skipped:', err.message);
  }

  // Schedule scraper every 6 hours
  cron.schedule('*/5 * * * *', async () => {
  console.log('⏰ Running scheduled scrape...');
  try {
    await scrapeAndStore();
  } catch (err) {
    console.error('Scheduled scrape failed:', err.message);
  }
});
  });
