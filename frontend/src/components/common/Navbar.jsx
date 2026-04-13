import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from "../../hooks/useAuth";


export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location]);

  const handleLogout = () => { logout(); navigate('/'); };

  const dashLink = user?.role === 'lawyer' ? '/lawyer/dashboard' : '/client/dashboard';

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-dark-1/95 backdrop-blur-md border-b border-dark-4' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <span className="text-2xl">⚖️</span>
          <div>
            <span className="font-display text-xl font-bold text-white group-hover:text-gold transition-colors">
              Nyay<span className="text-gold">Margadarshak</span>
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink to="/lawyers">Find Lawyers</NavLink>
          <NavLink to="/law-explorer">Law Explorer</NavLink>
          <NavLink to="/articles">Legal Awareness</NavLink>
          {isAuthenticated && <NavLink to="/legal-updates">Live Updates</NavLink>}
        </div>

        {/* Auth buttons */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link to={dashLink} className="text-sm text-gray-300 hover:text-gold transition-colors px-3 py-2">
                Dashboard
              </Link>
              <span className="text-xs text-gold border border-gold/30 px-2 py-1 rounded-full capitalize">
                {user.role}
              </span>
              <button onClick={handleLogout} className="btn-outline text-sm py-2 px-4">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-gray-300 hover:text-gold transition-colors px-3 py-2">Login</Link>
              <Link to="/register" className="btn-gold text-sm py-2 px-5">Register</Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-white p-2"
        >
          <div className={`w-6 h-0.5 bg-current transition-all ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
          <div className={`w-6 h-0.5 bg-current my-1.5 transition-all ${menuOpen ? 'opacity-0' : ''}`} />
          <div className={`w-6 h-0.5 bg-current transition-all ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-dark-1 border-b border-dark-4"
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              <MobileNavLink to="/lawyers">Find Lawyers</MobileNavLink>
              <MobileNavLink to="/law-explorer">Law Explorer</MobileNavLink>
              <MobileNavLink to="/articles">Legal Awareness</MobileNavLink>
              {isAuthenticated && <MobileNavLink to="/legal-updates">Live Updates</MobileNavLink>}
              <div className="border-t border-dark-4 pt-4">
                {isAuthenticated ? (
                  <>
                    <MobileNavLink to={dashLink}>Dashboard ({user.role})</MobileNavLink>
                    <button onClick={handleLogout} className="text-red-400 text-sm mt-2">Logout</button>
                  </>
                ) : (
                  <div className="flex gap-3">
                    <Link to="/login" className="btn-outline text-sm py-2 px-4 flex-1 text-center">Login</Link>
                    <Link to="/register" className="btn-gold text-sm py-2 px-4 flex-1 text-center">Register</Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

const NavLink = ({ to, children }) => {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Link to={to} className={`text-sm transition-colors relative group ${active ? 'text-gold' : 'text-gray-300 hover:text-white'}`}>
      {children}
      <span className={`absolute -bottom-1 left-0 h-px bg-gold transition-all ${active ? 'w-full' : 'w-0 group-hover:w-full'}`} />
    </Link>
  );
};

const MobileNavLink = ({ to, children }) => (
  <Link to={to} className="text-gray-300 hover:text-gold transition-colors text-sm py-1">{children}</Link>
);
