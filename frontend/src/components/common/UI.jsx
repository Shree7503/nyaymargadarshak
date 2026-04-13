import React from 'react';
import { motion } from 'framer-motion';

export const Loader = ({ text = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center py-24 gap-4">
    <div className="w-12 h-12 border-2 border-dark-4 border-t-gold rounded-full animate-spin" />
    <p className="text-gray-500 text-sm">{text}</p>
  </div>
);

export const ErrorMsg = ({ message }) => (
  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
    ⚠️ {message}
  </div>
);

export const SuccessMsg = ({ message }) => (
  <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-green-400 text-sm">
    ✅ {message}
  </div>
);

export const Badge = ({ children, color = 'gold' }) => {
  const colors = {
    gold: 'bg-gold/10 text-gold border-gold/30',
    green: 'bg-green-500/10 text-green-400 border-green-500/30',
    red: 'bg-red-500/10 text-red-400 border-red-500/30',
    gray: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border font-medium ${colors[color]}`}>
      {children}
    </span>
  );
};

export const FadeIn = ({ children, delay = 0, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay, ease: 'easeOut' }}
    className={className}
  >
    {children}
  </motion.div>
);

export const ScaleIn = ({ children, delay = 0, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.4, delay, ease: 'easeOut' }}
    className={className}
  >
    {children}
  </motion.div>
);

export const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

export const SectionTitle = ({ title, subtitle, center = false }) => (
  <div className={`mb-12 ${center ? 'text-center' : ''}`}>
    <h2 className="section-title mb-3">{title}</h2>
    {subtitle && <p className="text-gray-400 text-lg max-w-2xl">{subtitle}</p>}
  </div>
);

export const EmptyState = ({ icon = '📭', title, desc }) => (
  <div className="text-center py-16">
    <div className="text-5xl mb-4">{icon}</div>
    <h3 className="text-white text-lg font-semibold mb-2">{title}</h3>
    {desc && <p className="text-gray-500 text-sm">{desc}</p>}
  </div>
);
