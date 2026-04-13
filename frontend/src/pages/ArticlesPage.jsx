import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { Loader, Badge, EmptyState, FadeIn } from '../components/common/UI';
import api from '../utils/api';

const CATEGORIES = ['All', 'Constitutional Rights', 'Criminal Law', 'Consumer Law', 'Property Law', 'Cyber Law', 'Family Law'];

export default function ArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.get('/articles').then(r => setArticles(r.data)).finally(() => setLoading(false));
  }, []);

  const filtered = category === 'All' ? articles : articles.filter(a => a.category === category);

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />
      <div className="pt-24 max-w-6xl mx-auto px-6 pb-16">
        <FadeIn className="mb-10">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-3">
            Legal <span className="gold-gradient">Awareness</span>
          </h1>
          <p className="text-gray-400 text-lg">Essential legal knowledge every Indian citizen should know.</p>
        </FadeIn>

        {/* Category filter */}
        <FadeIn delay={0.1} className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-4 py-2 rounded-full text-sm border transition-all ${
                category === c ? 'bg-gold text-dark border-gold font-semibold' : 'border-dark-4 text-gray-400 hover:border-gold/40'
              }`}
            >{c}</button>
          ))}
        </FadeIn>

        {loading ? <Loader text="Loading articles..." /> : (
          filtered.length === 0 ? <EmptyState icon="📄" title="No articles found" /> : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((article, i) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  whileHover={{ y: -4 }}
                  className="card cursor-pointer group hover:border-gold/40"
                  onClick={() => setSelected(article)}
                >
                  <Badge color="gold">{article.category}</Badge>
                  <h3 className="font-display text-lg font-semibold text-white mt-3 mb-2 group-hover:text-gold transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-gray-500 text-sm line-clamp-3 leading-relaxed">
                    {article.content?.substring(0, 150)}...
                  </p>
                  <p className="text-gold text-sm mt-4 font-medium">Read more →</p>
                </motion.div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Article Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-dark-1 border border-dark-4 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-8"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <Badge color="gold">{selected.category}</Badge>
                <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-white text-2xl leading-none">×</button>
              </div>
              <h2 className="font-display text-2xl font-bold text-white mb-4">{selected.title}</h2>
              <p className="text-gray-400 leading-relaxed whitespace-pre-wrap">{selected.content}</p>
              {selected.source_url && (
                <p className="mt-6 pt-6 border-t border-dark-4 text-xs text-gray-600">
                  Source: <a href={selected.source_url} target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">{selected.source_url}</a>
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
