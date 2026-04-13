import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { ErrorMsg } from '../components/common/UI';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'lawyer' ? '/lawyer/dashboard' : '/client/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen hero-bg grid-pattern flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-3xl">⚖️</span>
            <span className="font-display text-2xl font-bold">Nyay<span className="text-gold">Margadarshak</span></span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400">Sign in to your account</p>
        </div>

        <div className="card">
          {error && <div className="mb-4"><ErrorMsg message={error} /></div>}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <input type="email" className="input" placeholder="you@example.com" required
                value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" className="input" placeholder="Your password" required
                value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
            </div>
            <button type="submit" disabled={loading} className="btn-gold w-full mt-6 disabled:opacity-60">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-gold hover:text-gold-light transition-colors">Register here</Link>
          </p>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-dark-3 rounded-lg border border-dark-4">
            <p className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wider">Demo Accounts</p>
            <div className="space-y-1 text-xs text-gray-400">
              <p>📧 Register a new account to try the platform</p>
              <p>Choose <span className="text-gold">Client</span> or <span className="text-gold">Lawyer</span> role</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
