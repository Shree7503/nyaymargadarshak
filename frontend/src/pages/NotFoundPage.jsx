import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-dark hero-bg flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <div className="text-8xl mb-6">⚖️</div>
        <h1 className="font-display text-6xl font-bold text-gold mb-4">404</h1>
        <h2 className="font-display text-2xl text-white mb-4">Page Not Found</h2>
        <p className="text-gray-400 mb-8 max-w-sm mx-auto">
          The page you're looking for doesn't exist. It may have been moved or deleted.
        </p>
        <Link to="/" className="btn-gold inline-block">Return Home →</Link>
      </motion.div>
    </div>
  );
}
