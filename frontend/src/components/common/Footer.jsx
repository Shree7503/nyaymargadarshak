import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-dark-4 bg-dark-1 mt-24">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">⚖️</span>
              <span className="font-display text-xl font-bold">
                Nyay<span className="text-gold">Margadarshak</span>
              </span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              Empowering Indian citizens with legal knowledge and connecting them with the right legal professionals.
            </p>
            <div className="mt-4 text-xs text-gray-600">
              <p>⚠️ This platform provides legal information, not legal advice.</p>
              <p>Always consult a qualified lawyer for specific legal matters.</p>
            </div>
          </div>

          <div>
            <h4 className="text-gold text-sm font-semibold mb-4 uppercase tracking-wider">Explore</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/lawyers" className="hover:text-gold transition-colors">Find Lawyers</Link></li>
              <li><Link to="/law-explorer" className="hover:text-gold transition-colors">Law Explorer</Link></li>
              <li><Link to="/articles" className="hover:text-gold transition-colors">Legal Awareness</Link></li>
              <li><Link to="/legal-updates" className="hover:text-gold transition-colors">Legal Updates</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-gold text-sm font-semibold mb-4 uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/register?role=client" className="hover:text-gold transition-colors">Register as Client</Link></li>
              <li><Link to="/register?role=lawyer" className="hover:text-gold transition-colors">Register as Lawyer</Link></li>
              <li><Link to="/login" className="hover:text-gold transition-colors">Login</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-dark-4 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-600 text-xs">
            © {new Date().getFullYear()} NyayMargadarshak. Built for legal awareness in India.
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>Legal updates refreshed every 6 hours</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
