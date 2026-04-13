import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { ErrorMsg } from '../components/common/UI';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: params.get('role') || 'client' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const user = await register(form.name, form.email, form.password, form.role);
      navigate(user.role === 'lawyer' ? '/lawyer/dashboard' : '/client/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen hero-bg grid-pattern flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-3xl">⚖️</span>
            <span className="font-display text-2xl font-bold">Nyay<span className="text-gold">Margadarshak</span></span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-gray-400">Join India's legal awareness platform</p>
        </div>

        <div className="card">
          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {['client', 'lawyer'].map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setForm(p => ({ ...p, role: r }))}
                className={`p-4 rounded-xl border-2 transition-all text-center ${
                  form.role === r
                    ? 'border-gold bg-gold/10 text-gold'
                    : 'border-dark-4 text-gray-400 hover:border-dark-3'
                }`}
              >
                <div className="text-2xl mb-1">{r === 'client' ? '👤' : '👨‍⚖️'}</div>
                <div className="text-sm font-semibold capitalize">{r}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {r === 'client' ? 'Seek legal help' : 'Offer legal services'}
                </div>
              </button>
            ))}
          </div>

          {error && <div className="mb-4"><ErrorMsg message={error} /></div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input className="input" placeholder="Arjun Sharma" required
                value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label className="label">Email Address</label>
              <input type="email" className="input" placeholder="you@example.com" required
                value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" className="input" placeholder="Min 6 characters" minLength={6} required
                value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
            </div>
            <button type="submit" disabled={loading} className="btn-gold w-full mt-2 disabled:opacity-60">
              {loading ? 'Creating account...' : `Register as ${form.role === 'client' ? 'Client' : 'Lawyer'}`}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-gold hover:text-gold-light transition-colors">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
