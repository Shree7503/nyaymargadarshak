import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { Loader, Badge, EmptyState, FadeIn } from '../components/common/UI';
import api from '../utils/api';

const SPECIALIZATIONS = ['All', 'Criminal Law', 'Civil Law', 'Family Law', 'Property Law', 'Corporate Law', 'Cyber Law', 'Consumer Law', 'Tax Law', 'Labour Law'];

export default function LawyerDirectoryPage() {
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [specFilter, setSpecFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('');

  useEffect(() => {
    fetchLawyers();
  }, []);

  const fetchLawyers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/lawyers');
      setLawyers(data);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  const filtered = lawyers.filter(l => {
    const matchSearch = !search || l.name?.toLowerCase().includes(search.toLowerCase()) || l.specialization?.toLowerCase().includes(search.toLowerCase());
    const matchSpec = specFilter === 'All' || l.specialization?.toLowerCase().includes(specFilter.toLowerCase());
    const matchLoc = !locationFilter || l.location?.toLowerCase().includes(locationFilter.toLowerCase());
    return matchSearch && matchSpec && matchLoc;
  });

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />
      <div className="pt-24 max-w-7xl mx-auto px-6 pb-16">
        {/* Header */}
        <FadeIn className="mb-10">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-3">
            Find <span className="gold-gradient">Lawyers</span>
          </h1>
          <p className="text-gray-400 text-lg">Connect with verified legal professionals across India</p>
        </FadeIn>

        {/* Search & Filters */}
        <FadeIn delay={0.1} className="bg-dark-2 border border-dark-4 rounded-2xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input className="input" placeholder="🔍 Search by name or specialization..."
              value={search} onChange={e => setSearch(e.target.value)} />
            <input className="input" placeholder="📍 Filter by city or state..."
              value={locationFilter} onChange={e => setLocationFilter(e.target.value)} />
            <select className="input cursor-pointer" value={specFilter} onChange={e => setSpecFilter(e.target.value)}>
              {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Specialization pills */}
          <div className="flex flex-wrap gap-2 mt-4">
            {SPECIALIZATIONS.slice(1).map(s => (
              <button key={s}
                onClick={() => setSpecFilter(specFilter === s ? 'All' : s)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                  specFilter === s ? 'bg-gold text-dark border-gold' : 'border-dark-4 text-gray-400 hover:border-gold/40'
                }`}
              >{s}</button>
            ))}
          </div>
        </FadeIn>

        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-500 text-sm">
            {loading ? 'Loading...' : `${filtered.length} lawyer${filtered.length !== 1 ? 's' : ''} found`}
          </p>
          {filtered.length !== lawyers.length && (
            <button onClick={() => { setSearch(''); setSpecFilter('All'); setLocationFilter(''); }}
              className="text-xs text-gold hover:underline">Clear filters</button>
          )}
        </div>

        {loading ? <Loader text="Finding lawyers..." /> : (
          filtered.length === 0 ? (
            <EmptyState icon="👨‍⚖️" title="No lawyers found" desc="Try adjusting your search filters." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((lawyer, i) => (
                <LawyerCard key={lawyer.id} lawyer={lawyer} index={i} />
              ))}
            </div>
          )
        )}
      </div>
      <Footer />
    </div>
  );
}

function LawyerCard({ lawyer, index }) {
  const initials = lawyer.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';
  const expYears = lawyer.experience || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
    >
      <Link to={`/lawyers/${lawyer.id}`} className="block card group hover:border-gold/40 transition-all h-full">
        <div className="flex items-start gap-4 mb-4">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/30 flex items-center justify-center flex-shrink-0">
            <span className="font-display text-gold font-bold text-lg">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-lg font-semibold text-white group-hover:text-gold transition-colors truncate">
              {lawyer.name}
            </h3>
            <p className="text-gold/70 text-sm">{lawyer.specialization || 'General Practice'}</p>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          {lawyer.location && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>📍</span><span>{lawyer.location}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>⚖️</span><span>{expYears} year{expYears !== 1 ? 's' : ''} experience</span>
          </div>
          {lawyer.languages && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>🌐</span><span>{lawyer.languages}</span>
            </div>
          )}
        </div>

        {lawyer.bio && (
          <p className="text-gray-500 text-sm line-clamp-2 mb-4">{lawyer.bio}</p>
        )}

        <div className="flex items-center justify-between">
          <Badge color="green">Available</Badge>
          <span className="text-gold text-sm font-medium group-hover:translate-x-1 transition-transform inline-block">
            View Profile →
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
