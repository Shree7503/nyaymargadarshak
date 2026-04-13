import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { Loader, Badge, EmptyState, FadeIn } from '../components/common/UI';
import api from '../utils/api';

const SOURCE_COLORS = {
  'Live Law': 'gold',
  'Bar and Bench': 'blue',
  'SC Observer': 'green',
  'Law Trend': 'gray',
};

export default function LegalUpdatesPage() {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [source, setSource] = useState('All');
  const [lastFetched, setLastFetched] = useState(null);

  const sources = ['All', ...new Set(updates.map(u => u.source).filter(Boolean))];

  const fetchUpdates = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/updates');
      setUpdates(data);
      setLastFetched(new Date());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUpdates(); }, []);

  const triggerScrape = async () => {
    setScraping(true);
    try {
      await api.post('/admin/scrape');
      await fetchUpdates();
    } catch (err) { console.error(err); }
    finally { setScraping(false); }
  };

  const filtered = source === 'All' ? updates : updates.filter(u => u.source === source);

  const formatDate = (d) => {
    try {
      return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch { return d; }
  };

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />
      <div className="pt-24 max-w-6xl mx-auto px-6 pb-16">
        {/* Header */}
        <FadeIn className="mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 border border-green-500/30 bg-green-500/5 px-4 py-2 rounded-full mb-6">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-green-400 text-xs font-medium uppercase tracking-wider">Live Data — Auto-refreshed every 6 hours</span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-3">
                Legal <span className="gold-gradient">Updates</span>
              </h1>
              <p className="text-gray-400 text-lg">
                Real-time legal news scraped from top Indian legal portals.
              </p>
              {lastFetched && (
                <p className="text-xs text-gray-600 mt-2">
                  Last fetched: {lastFetched.toLocaleTimeString('en-IN')}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={fetchUpdates} disabled={loading}
                className="btn-outline text-sm py-2 px-4 disabled:opacity-60">
                🔄 Refresh
              </button>
              <button onClick={triggerScrape} disabled={scraping}
                className="btn-gold text-sm py-2 px-4 disabled:opacity-60">
                {scraping ? '⏳ Scraping...' : '📡 Scrape Now'}
              </button>
            </div>
          </div>
        </FadeIn>

        {/* Source filter */}
        <FadeIn delay={0.1} className="flex flex-wrap gap-2 mb-8">
          {sources.map(s => (
            <button key={s} onClick={() => setSource(s)}
              className={`px-4 py-2 rounded-full text-sm border transition-all ${
                source === s ? 'bg-gold text-dark border-gold font-semibold' : 'border-dark-4 text-gray-400 hover:border-gold/40'
              }`}>{s}</button>
          ))}
        </FadeIn>

        {/* Stats bar */}
        <FadeIn delay={0.15} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Updates', value: updates.length },
            { label: 'Sources', value: new Set(updates.map(u => u.source)).size },
            { label: 'Today', value: updates.filter(u => new Date(u.created_at).toDateString() === new Date().toDateString()).length },
            { label: 'This Week', value: updates.filter(u => new Date(u.created_at) > new Date(Date.now() - 7 * 86400000)).length },
          ].map(stat => (
            <div key={stat.label} className="bg-dark-2 border border-dark-4 rounded-xl p-4 text-center">
              <p className="font-display text-2xl font-bold text-gold">{stat.value}</p>
              <p className="text-gray-500 text-xs mt-1">{stat.label}</p>
            </div>
          ))}
        </FadeIn>

        {loading ? <Loader text="Fetching latest legal updates..." /> : (
          filtered.length === 0 ? (
            <EmptyState icon="📡" title="No updates yet" desc="Click 'Scrape Now' to fetch the latest legal updates from news portals." />
          ) : (
            <div className="space-y-4">
              {filtered.map((update, i) => (
                <UpdateCard key={update.id} update={update} index={i} formatDate={formatDate} />
              ))}
            </div>
          )
        )}
      </div>
      <Footer />
    </div>
  );
}

function UpdateCard({ update, index, formatDate }) {
  const color = SOURCE_COLORS[update.source] || 'gray';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      whileHover={{ x: 4 }}
      className="bg-dark-2 border border-dark-4 rounded-xl p-5 hover:border-gold/20 transition-all group"
    >
      <div className="flex items-start gap-4">
        <div className="w-1 h-full min-h-[60px] bg-gold/30 rounded-full flex-shrink-0 group-hover:bg-gold transition-colors" />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge color={color}>{update.source || 'Unknown Source'}</Badge>
            {update.published_date && (
              <span className="text-xs text-gray-600">{formatDate(update.published_date)}</span>
            )}
          </div>

          <h3 className="text-white font-semibold text-base mb-2 group-hover:text-gold transition-colors line-clamp-2">
            {update.title}
          </h3>

          {update.summary && update.summary !== update.title && (
            <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">{update.summary}</p>
          )}

          {update.url && (
            <a
              href={update.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-gold text-xs mt-3 hover:underline"
              onClick={e => e.stopPropagation()}
            >
              Read full article →
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
