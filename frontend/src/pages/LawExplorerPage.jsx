import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { Loader, Badge, EmptyState, FadeIn } from '../components/common/UI';
import api from '../utils/api';

const LAW_COLORS = {
  'Bharatiya Nyaya Sanhita': 'gold',
  'Bharatiya Nagarik Suraksha Sanhita': 'blue',
  'Bharatiya Sakshya Adhiniyam': 'green',
};

export default function LawExplorerPage() {
  const [laws, setLaws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeLaw, setActiveLaw] = useState('All');
  const [expanded, setExpanded] = useState(null);
  const lawNames = ['All', 'Bharatiya Nyaya Sanhita', 'Bharatiya Nagarik Suraksha Sanhita', 'Bharatiya Sakshya Adhiniyam'];

  useEffect(() => {
    api.get('/laws').then(r => setLaws(r.data)).finally(() => setLoading(false));
  }, []);

  const filtered = laws.filter(l => {
    const matchLaw = activeLaw === 'All' || l.law_name === activeLaw;
    const matchSearch = !search || l.section_title?.toLowerCase().includes(search.toLowerCase())
      || l.section_number?.includes(search)
      || l.simple_explanation?.toLowerCase().includes(search.toLowerCase());
    return matchLaw && matchSearch;
  });

  const grouped = filtered.reduce((acc, l) => {
    if (!acc[l.law_name]) acc[l.law_name] = [];
    acc[l.law_name].push(l);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />
      <div className="pt-24 max-w-6xl mx-auto px-6 pb-16">
        {/* Header */}
        <FadeIn className="mb-10">
          <div className="inline-flex items-center gap-2 border border-gold/30 bg-gold/5 px-4 py-2 rounded-full mb-6">
            <span className="text-gold text-xs font-medium uppercase tracking-wider">Public Law Explorer</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-3">
            Simplified <span className="gold-gradient">Indian Law</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl">
            Understand the Bharatiya Nyaya Sanhita, BNSS, and BSA in plain language — with real-world examples.
          </p>
        </FadeIn>

        {/* Search */}
        <FadeIn delay={0.1} className="mb-6">
          <input
            className="input max-w-lg text-base"
            placeholder="🔍 Search sections, topics, or section numbers..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </FadeIn>

        {/* Law tabs */}
        <FadeIn delay={0.15} className="flex flex-wrap gap-2 mb-8">
          {lawNames.map(name => (
            <button
              key={name}
              onClick={() => setActiveLaw(name)}
              className={`px-4 py-2 rounded-full text-sm border transition-all ${
                activeLaw === name
                  ? 'bg-gold text-dark border-gold font-semibold'
                  : 'border-dark-4 text-gray-400 hover:border-gold/40 hover:text-white'
              }`}
            >
              {name === 'All' ? 'All Laws' :
               name === 'Bharatiya Nyaya Sanhita' ? 'BNS (Criminal)' :
               name === 'Bharatiya Nagarik Suraksha Sanhita' ? 'BNSS (Procedure)' :
               'BSA (Evidence)'}
            </button>
          ))}
        </FadeIn>

        {loading ? <Loader text="Loading law sections..." /> : (
          Object.keys(grouped).length === 0 ? (
            <EmptyState icon="📜" title="No sections found" desc="Try a different search term." />
          ) : (
            Object.entries(grouped).map(([lawName, sections]) => (
              <div key={lawName} className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-gold rounded-full" />
                  <div>
                    <h2 className="font-display text-2xl font-bold text-white">{lawName}</h2>
                    <p className="text-gray-500 text-sm">{sections.length} section{sections.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {sections.map((section, i) => (
                    <LawCard
                      key={section.id}
                      section={section}
                      index={i}
                      expanded={expanded === section.id}
                      onToggle={() => setExpanded(expanded === section.id ? null : section.id)}
                      color={LAW_COLORS[lawName]}
                    />
                  ))}
                </div>
              </div>
            ))
          )
        )}
      </div>
      <Footer />
    </div>
  );
}

function LawCard({ section, index, expanded, onToggle, color = 'gold' }) {
  const colorMap = {
    gold: 'text-gold border-gold/40 bg-gold/5',
    blue: 'text-blue-400 border-blue-400/40 bg-blue-400/5',
    green: 'text-green-400 border-green-400/40 bg-green-400/5',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className="bg-dark-2 border border-dark-4 rounded-xl overflow-hidden hover:border-gold/20 transition-all"
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 p-5 text-left"
      >
        <span className={`font-mono text-sm font-medium px-3 py-1 rounded-lg border ${colorMap[color]} flex-shrink-0`}>
          § {section.section_number}
        </span>
        <span className="text-white font-medium flex-1">{section.section_title}</span>
        <motion.span
          animate={{ rotate: expanded ? 180 : 0 }}
          className="text-gray-500 flex-shrink-0"
        >▼</motion.span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-5 pb-5 border-t border-dark-4 pt-4 space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Plain Language Explanation</p>
                <p className="text-gray-300 leading-relaxed">{section.simple_explanation}</p>
              </div>
              {section.example_case && (
                <div className="bg-dark-3 border border-dark-4 rounded-xl p-4">
                  <p className="text-xs text-gold uppercase tracking-wider mb-2">📋 Example Case</p>
                  <p className="text-gray-400 text-sm italic leading-relaxed">{section.example_case}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
