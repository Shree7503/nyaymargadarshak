import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { Loader, Badge, ErrorMsg, SuccessMsg, FadeIn } from '../components/common/UI';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';

export default function LawyerProfilePage() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [lawyer, setLawyer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/lawyers/${id}`)
      .then(r => setLawyer(r.data))
      .catch(() => setError('Lawyer not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleContact = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { navigate('/login'); return; }
    if (user?.role !== 'client') { setError('Only clients can send inquiries.'); return; }

    setSending(true); setError(''); setSuccess('');
    try {
      await api.post('/contact', { lawyer_id: id, message });
      setSuccess('Your inquiry has been sent! The lawyer will respond via the dashboard.');
      setMessage('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send message.');
    } finally { setSending(false); }
  };

  if (loading) return <div className="min-h-screen bg-dark"><Navbar /><Loader text="Loading profile..." /></div>;
  if (!lawyer) return <div className="min-h-screen bg-dark flex items-center justify-center"><p className="text-gray-400">Lawyer not found.</p></div>;

  const initials = lawyer.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />
      <div className="pt-24 max-w-5xl mx-auto px-6 pb-16">
        <Link to="/lawyers" className="text-gray-400 hover:text-gold transition-colors text-sm mb-8 inline-block">
          ← Back to Directory
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <FadeIn className="lg:col-span-2">
            <div className="card mb-6">
              <div className="flex items-start gap-6 mb-6">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/30 flex items-center justify-center flex-shrink-0">
                  <span className="font-display text-gold font-bold text-3xl">{initials}</span>
                </div>
                <div className="flex-1">
                  <h1 className="font-display text-3xl font-bold text-white mb-1">{lawyer.name}</h1>
                  <p className="text-gold text-lg mb-2">{lawyer.specialization || 'General Practice'}</p>
                  <Badge color="green">Available for consultation</Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <InfoBox icon="⚖️" label="Experience" value={`${lawyer.experience || 0} years`} />
                <InfoBox icon="📍" label="Location" value={lawyer.location || 'Pan India'} />
                <InfoBox icon="🌐" label="Languages" value={lawyer.languages || 'English, Hindi'} />
              </div>

              {lawyer.bio && (
                <div className="border-t border-dark-4 pt-6">
                  <h3 className="text-white font-semibold mb-3">About</h3>
                  <p className="text-gray-400 leading-relaxed">{lawyer.bio}</p>
                </div>
              )}
            </div>

            {/* Specialization details */}
            <div className="card">
              <h3 className="text-white font-semibold mb-4">Specialization Areas</h3>
              <div className="flex flex-wrap gap-2">
                {(lawyer.specialization || 'General Practice').split(',').map(s => (
                  <Badge key={s} color="gold">{s.trim()}</Badge>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Contact Form */}
          <FadeIn delay={0.15}>
            <div className="card sticky top-28">
              <h2 className="font-display text-xl font-semibold text-white mb-6">
                Send an Inquiry
              </h2>

              {success && <div className="mb-4"><SuccessMsg message={success} /></div>}
              {error && <div className="mb-4"><ErrorMsg message={error} /></div>}

              {!isAuthenticated ? (
                <div className="text-center py-6">
                  <div className="text-4xl mb-3">🔐</div>
                  <p className="text-gray-400 text-sm mb-4">Login to send an inquiry to this lawyer</p>
                  <Link to="/login" className="btn-gold w-full block text-center">Login to Contact</Link>
                  <Link to="/register" className="btn-outline w-full block text-center mt-3">Register Free</Link>
                </div>
              ) : user?.role === 'lawyer' ? (
                <p className="text-gray-400 text-sm text-center py-4">Lawyers cannot send inquiries to other lawyers.</p>
              ) : (
                <form onSubmit={handleContact} className="space-y-4">
                  <div>
                    <label className="label">Your Message</label>
                    <textarea
                      className="input resize-none"
                      rows={5}
                      placeholder={`Describe your legal matter for ${lawyer.name}...`}
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" disabled={sending} className="btn-gold w-full disabled:opacity-60">
                    {sending ? 'Sending...' : 'Send Inquiry'}
                  </button>
                  <p className="text-xs text-gray-600 text-center">
                    The lawyer will receive an email notification and can accept or decline your chat request.
                  </p>
                </form>
              )}

              {/* Contact info */}
              {lawyer.contact_email && (
                <div className="mt-6 pt-6 border-t border-dark-4">
                  <p className="text-xs text-gray-600 mb-1">Direct Contact</p>
                  <p className="text-sm text-gold">{lawyer.contact_email}</p>
                </div>
              )}
            </div>
          </FadeIn>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function InfoBox({ icon, label, value }) {
  return (
    <div className="bg-dark-3 rounded-xl p-4">
      <p className="text-2xl mb-1">{icon}</p>
      <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">{label}</p>
      <p className="text-white text-sm font-medium">{value}</p>
    </div>
  );
}
