import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { useAuth } from '../hooks/useAuth';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] } })
};

const AnimSection = ({ children, className = '' }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div ref={ref} variants={fadeUp} initial="hidden" animate={inView ? 'visible' : 'hidden'} className={className}>
      {children}
    </motion.div>
  );
};

const FEATURES = [
  { icon: '📚', title: 'Legal Awareness', desc: 'Understand your rights with simplified explanations of Indian law.' },
  { icon: '⚖️', title: 'Law Explorer', desc: 'Browse BNS, BNSS, and BSA sections with real-world examples.' },
  { icon: '👨‍⚖️', title: 'Find Lawyers', desc: 'Discover verified lawyers by specialization and location.' },
  { icon: '📡', title: 'Live Legal Updates', desc: 'Real-time updates scraped from top Indian legal news portals.' },
];

const STATS = [
  { value: '3+', label: 'Major Law Codes' },
  { value: '15+', label: 'Law Sections Explained' },
  { value: '6h', label: 'Update Frequency' },
  { value: '100%', label: 'Free to Use' },
];

const LAW_BADGES = ['Bharatiya Nyaya Sanhita', 'BNSS 2023', 'Bharatiya Sakshya Adhiniyam', 'Consumer Rights', 'Cyber Law', 'Property Law'];

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />

      {/* Hero */}
      <section className="hero-bg grid-pattern relative overflow-hidden min-h-screen flex items-center">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-gold/3 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-24 pb-16 relative">
          <div className="max-w-4xl">
            {/* Tag */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 border border-gold/30 bg-gold/5 px-4 py-2 rounded-full mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
              <span className="text-gold text-xs font-medium tracking-wider uppercase">India's Legal Awareness Platform</span>
            </motion.div>

            <motion.h1
              variants={fadeUp} custom={1} initial="hidden" animate="visible"
              className="font-display text-5xl md:text-7xl font-bold leading-tight mb-6"
            >
              Understand the Law.{' '}
              <span className="gold-gradient">Connect</span> with the Right Lawyer.
            </motion.h1>

            <motion.p
              variants={fadeUp} custom={2} initial="hidden" animate="visible"
              className="text-gray-400 text-xl leading-relaxed mb-10 max-w-2xl"
            >
              NyayMargadarshak bridges the gap between citizens and justice — with real-time legal updates, 
              simplified law explanations, and direct access to verified legal professionals.
            </motion.p>

            <motion.div
              variants={fadeUp} custom={3} initial="hidden" animate="visible"
              className="flex flex-wrap gap-4"
            >
              {!isAuthenticated ? (
                <>
                  <Link to="/register" className="btn-gold text-base px-8 py-4 inline-block">
                    Get Started Free →
                  </Link>
                  <Link to="/law-explorer" className="btn-outline text-base px-8 py-4 inline-block">
                    Explore Laws
                  </Link>
                </>
              ) : (
                <>
                  <Link to={user?.role === 'lawyer' ? '/lawyer/dashboard' : '/client/dashboard'} className="btn-gold text-base px-8 py-4 inline-block">
                    My Dashboard →
                  </Link>
                  <Link to="/legal-updates" className="btn-outline text-base px-8 py-4 inline-block">
                    Live Updates
                  </Link>
                </>
              )}
            </motion.div>

            {/* Law badges */}
            <motion.div
              variants={fadeUp} custom={4} initial="hidden" animate="visible"
              className="flex flex-wrap gap-2 mt-10"
            >
              {LAW_BADGES.map(b => (
                <span key={b} className="text-xs bg-dark-3 border border-dark-4 text-gray-400 px-3 py-1 rounded-full">
                  {b}
                </span>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-gray-600 text-xs">Scroll to explore</span>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-px h-8 bg-gradient-to-b from-gold/40 to-transparent"
          />
        </motion.div>
      </section>

      {/* Stats */}
      <section className="border-y border-dark-4 bg-dark-1">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s, i) => (
            <AnimSection key={i} className="text-center">
              <div className="font-display text-4xl font-bold text-gold mb-1">{s.value}</div>
              <div className="text-gray-500 text-sm">{s.label}</div>
            </AnimSection>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <AnimSection className="text-center mb-16">
          <h2 className="section-title mb-4">Everything You Need for Legal Clarity</h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            From understanding your rights to finding the right lawyer — all in one place.
          </p>
        </AnimSection>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((f, i) => (
            <AnimSection key={i}>
              <motion.div
                whileHover={{ y: -4, borderColor: 'rgba(212,175,55,0.4)' }}
                className="card h-full transition-all cursor-default"
              >
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-display text-lg font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            </AnimSection>
          ))}
        </div>
      </section>

      {/* Law Explorer preview */}
      <section className="py-24 bg-dark-1 border-y border-dark-4">
        <div className="max-w-7xl mx-auto px-6">
          <AnimSection>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
              <div>
                <h2 className="section-title mb-3">Public Law Explorer</h2>
                <p className="text-gray-400">Simplified explanations of Indian criminal law for every citizen.</p>
              </div>
              <Link to="/law-explorer" className="btn-outline whitespace-nowrap">Explore All Sections →</Link>
            </div>
          </AnimSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { law: 'BNS § 303', title: 'Theft', desc: 'Taking property without consent is theft — punishable under the new code.' },
              { law: 'BNSS § 43', title: 'Rights of Arrested Person', desc: 'Every arrested person must be told why they are being arrested.' },
              { law: 'BSA § 63', title: 'Electronic Records as Evidence', desc: 'WhatsApp messages and emails can be used as legal evidence.' },
            ].map((item, i) => (
              <AnimSection key={i}>
                <motion.div whileHover={{ scale: 1.02 }} className="card">
                  <span className="font-mono text-gold text-xs mb-2 block">{item.law}</span>
                  <h4 className="font-display text-lg font-semibold text-white mb-2">{item.title}</h4>
                  <p className="text-gray-500 text-sm">{item.desc}</p>
                </motion.div>
              </AnimSection>
            ))}
          </div>
        </div>
      </section>

      {/* Lawyer CTA */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <AnimSection>
          <div className="relative overflow-hidden rounded-2xl bg-dark-2 border border-gold/20 p-12 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent pointer-events-none" />
            <div className="relative">
              <div className="text-5xl mb-6">👨‍⚖️</div>
              <h2 className="section-title mb-4">Are You a Lawyer?</h2>
              <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
                Join NyayMargadarshak to reach clients across India. Build your profile, receive inquiries, and manage your practice online.
              </p>
              <Link to="/register?role=lawyer" className="btn-gold text-base px-10 py-4 inline-block">
                Join as a Lawyer →
              </Link>
            </div>
          </div>
        </AnimSection>
      </section>

      {/* Legal Updates teaser */}
      <section className="py-24 bg-dark-1 border-t border-dark-4">
        <div className="max-w-7xl mx-auto px-6">
          <AnimSection>
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 bg-dark-3 border border-dark-4 px-4 py-2 rounded-full mb-6">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs text-gray-400">Auto-updated every 6 hours</span>
                </div>
                <h2 className="section-title mb-4">Real-Time Legal Updates</h2>
                <p className="text-gray-400 text-lg mb-6 leading-relaxed">
                  Our Python scraper continuously fetches the latest legal news from Live Law, Bar and Bench, 
                  and other top Indian legal portals — keeping you always informed.
                </p>
                {isAuthenticated ? (
                  <Link to="/legal-updates" className="btn-gold inline-block">View Live Updates →</Link>
                ) : (
                  <Link to="/register" className="btn-gold inline-block">Register to Access →</Link>
                )}
              </div>
              <div className="flex-1 space-y-3">
                {['Supreme Court updates', 'High Court judgements', 'New legislation alerts', 'Legal policy changes'].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 bg-dark-2 border border-dark-4 rounded-xl p-4"
                  >
                    <div className="w-2 h-2 rounded-full bg-gold flex-shrink-0" />
                    <span className="text-gray-300 text-sm">{item}</span>
                    <span className="ml-auto text-xs text-gray-600">Live</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </AnimSection>
        </div>
      </section>

      <Footer />
    </div>
  );
}
