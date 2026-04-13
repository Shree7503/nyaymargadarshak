import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/common/Navbar';
import { Loader, Badge, EmptyState, FadeIn, ErrorMsg, SuccessMsg } from '../components/common/UI';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';

const TABS = ['Overview', 'Edit Profile', 'Inquiries', 'Chat Sessions'];
const SPECIALIZATIONS = ['Criminal Law', 'Civil Law', 'Family Law', 'Property Law', 'Corporate Law', 'Cyber Law', 'Consumer Law', 'Tax Law', 'Labour Law', 'Constitutional Law', 'Intellectual Property', 'Immigration Law'];

export default function LawyerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('Overview');
  const [profile, setProfile] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    try {
      const [profileRes, contactsRes, sessionsRes, statsRes] = await Promise.all([
        api.get('/lawyers/me/profile').catch(() => ({ data: null })),
        api.get('/lawyers/me/contacts').catch(() => ({ data: [] })),
        api.get('/chat/sessions').catch(() => ({ data: [] })),
        api.get('/lawyers/me/stats').catch(() => ({ data: {} })),
      ]);
      setProfile(profileRes.data);
      setContacts(contactsRes.data);
      setSessions(sessionsRes.data);
      setStats(statsRes.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleAccept = async (sessionId) => {
    await api.post(`/chat/accept/${sessionId}`);
    await fetchAll();
  };

  const handleDecline = async (sessionId) => {
    await api.post(`/chat/decline/${sessionId}`);
    await fetchAll();
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const pendingSessions = sessions.filter(s => s.status === 'pending');
  const acceptedSessions = sessions.filter(s => s.status === 'accepted');

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />
      <div className="pt-24 max-w-7xl mx-auto px-6 pb-16">
        {/* Header */}
        <FadeIn className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-gold text-sm mb-1">Lawyer Dashboard</p>
            <h1 className="font-display text-3xl font-bold text-white">Welcome, {user?.name} ⚖️</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge color={profile?.profile_status === 'published' ? 'green' : 'gray'}>
                {profile?.profile_status || 'Draft'}
              </Badge>
              {profile?.specialization && <span className="text-gray-500 text-sm">{profile.specialization}</span>}
            </div>
          </div>
          <div className="flex gap-3">
            <Link to="/legal-updates" className="btn-outline text-sm py-2 px-4">📡 Live Updates</Link>
            <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-red-400 transition-colors">Logout</button>
          </div>
        </FadeIn>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Inquiries', value: stats.total || 0, icon: '📨' },
            { label: 'This Month', value: stats.thisMonth || 0, icon: '📅' },
            { label: 'Pending Requests', value: pendingSessions.length, icon: '⏳' },
            { label: 'Active Chats', value: acceptedSessions.length, icon: '💬' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="bg-dark-2 border border-dark-4 rounded-xl p-5"
            >
              <p className="text-3xl mb-2">{s.icon}</p>
              <p className="font-display text-2xl font-bold text-gold">{s.value}</p>
              <p className="text-gray-500 text-sm">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Pending requests alert */}
        {pendingSessions.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-gold/10 border border-gold/30 rounded-xl p-4 mb-6 flex items-center gap-3"
          >
            <span className="text-gold text-xl animate-pulse">🔔</span>
            <p className="text-gold text-sm font-medium">
              You have {pendingSessions.length} pending chat request{pendingSessions.length !== 1 ? 's' : ''}. Review them in the Chat Sessions tab.
            </p>
            <button onClick={() => setTab('Chat Sessions')} className="ml-auto btn-gold text-xs py-1 px-3">Review</button>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-dark-2 border border-dark-4 rounded-xl p-1 mb-8 overflow-x-auto">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all relative ${
                tab === t ? 'bg-gold text-dark' : 'text-gray-400 hover:text-white'
              }`}
            >
              {t}
              {t === 'Chat Sessions' && pendingSessions.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                  {pendingSessions.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? <Loader /> : (
          <>
            {tab === 'Overview' && <OverviewTab contacts={contacts} sessions={sessions} profile={profile} navigate={navigate} />}
            {tab === 'Edit Profile' && <EditProfileTab profile={profile} userEmail={user?.email} onSaved={fetchAll} />}
            {tab === 'Inquiries' && <InquiriesTab contacts={contacts} />}
            {tab === 'Chat Sessions' && (
              <ChatSessionsTab
                sessions={sessions}
                onAccept={handleAccept}
                onDecline={handleDecline}
                navigate={navigate}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function OverviewTab({ contacts, sessions, profile, navigate }) {
  const accepted = sessions.filter(s => s.status === 'accepted');
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card">
        <h3 className="font-semibold text-white mb-4">Recent Inquiries</h3>
        {contacts.length === 0 ? (
          <EmptyState icon="📨" title="No inquiries yet" desc="Complete your profile and publish it to receive inquiries." />
        ) : (
          <div className="space-y-3">
            {contacts.slice(0, 4).map(c => (
              <div key={c.id} className="bg-dark-3 rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <p className="text-white text-sm font-medium">{c.client_name}</p>
                  <p className="text-gray-600 text-xs">{new Date(c.timestamp).toLocaleDateString('en-IN')}</p>
                </div>
                <p className="text-gray-500 text-xs line-clamp-2 mt-1">{c.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h3 className="font-semibold text-white mb-4">Profile Status</h3>
        {!profile ? (
          <EmptyState icon="👤" title="No profile yet" desc="Set up your lawyer profile to appear in the directory." />
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Status</span>
              <Badge color={profile.profile_status === 'published' ? 'green' : 'gray'}>{profile.profile_status}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Specialization</span>
              <span className="text-white text-sm">{profile.specialization || '—'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Experience</span>
              <span className="text-white text-sm">{profile.experience || 0} years</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Location</span>
              <span className="text-white text-sm">{profile.location || '—'}</span>
            </div>
          </div>
        )}
        {accepted.length > 0 && (
          <div className="mt-4 pt-4 border-t border-dark-4">
            <h4 className="text-white text-sm font-medium mb-3">Active Chats</h4>
            {accepted.map(s => (
              <div key={s.id} className="flex items-center justify-between bg-dark-3 rounded-lg p-3 mb-2">
                <p className="text-white text-sm">{s.client_name}</p>
                <button onClick={() => navigate(`/chat/${s.id}`)} className="btn-gold text-xs py-1 px-3">Open</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EditProfileTab({ profile, userEmail, onSaved }) {
  const [form, setForm] = useState({
    specialization: profile?.specialization || '',
    experience: profile?.experience || '',
    location: profile?.location || '',
    contact_email: profile?.contact_email || userEmail || '',
    bio: profile?.bio || '',
    languages: profile?.languages || 'English,Hindi',
    profile_status: profile?.profile_status || 'draft',
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setSuccess(''); setError('');
    try {
      await api.post('/lawyers/profile', { ...form, experience: parseInt(form.experience) || 0 });
      setSuccess('Profile saved successfully!');
      onSaved();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save profile.');
    } finally { setSaving(false); }
  };

  return (
    <div className="max-w-2xl">
      <div className="card">
        <h3 className="font-display text-xl font-semibold text-white mb-6">Edit Lawyer Profile</h3>
        {success && <div className="mb-4"><SuccessMsg message={success} /></div>}
        {error && <div className="mb-4"><ErrorMsg message={error} /></div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Specialization</label>
              <select className="input cursor-pointer" value={form.specialization}
                onChange={e => setForm(p => ({ ...p, specialization: e.target.value }))}>
                <option value="">Select specialization...</option>
                {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Years of Experience</label>
              <input type="number" className="input" placeholder="e.g. 5" min={0} max={60}
                value={form.experience} onChange={e => setForm(p => ({ ...p, experience: e.target.value }))} />
            </div>
            <div>
              <label className="label">City / Location</label>
              <input className="input" placeholder="e.g. Mumbai, Maharashtra"
                value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
            </div>
            <div>
              <label className="label">Contact Email</label>
              <input type="email" className="input" placeholder="contact@email.com"
                value={form.contact_email} onChange={e => setForm(p => ({ ...p, contact_email: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="label">Languages Spoken</label>
            <input className="input" placeholder="e.g. English,Hindi,Marathi"
              value={form.languages} onChange={e => setForm(p => ({ ...p, languages: e.target.value }))} />
          </div>
          <div>
            <label className="label">Professional Bio</label>
            <textarea className="input resize-none" rows={4}
              placeholder="Describe your expertise, experience, and approach to legal practice..."
              value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} />
          </div>
          <div>
            <label className="label">Profile Status</label>
            <div className="grid grid-cols-3 gap-3">
              {['draft', 'published'].map(s => (
                <button key={s} type="button"
                  onClick={() => setForm(p => ({ ...p, profile_status: s }))}
                  className={`p-3 rounded-xl border-2 text-sm transition-all capitalize ${
                    form.profile_status === s ? 'border-gold bg-gold/10 text-gold' : 'border-dark-4 text-gray-400'
                  }`}
                >
                  {s === 'published' ? '✅ Published' : '📝 Draft'}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-2">Set to "Published" to appear in the lawyer directory.</p>
          </div>
          <button type="submit" disabled={saving} className="btn-gold w-full disabled:opacity-60">
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}

function InquiriesTab({ contacts }) {
  if (contacts.length === 0) return <EmptyState icon="📨" title="No inquiries yet" desc="Once clients send you messages, they'll appear here." />;
  return (
    <div className="space-y-4">
      {contacts.map((c, i) => (
        <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
          className="card"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="w-10 h-10 rounded-full bg-dark-3 border border-dark-4 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">{c.client_name?.charAt(0)}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-white font-semibold">{c.client_name}</p>
                <p className="text-gray-600 text-xs">{new Date(c.timestamp).toLocaleDateString('en-IN')}</p>
              </div>
              <p className="text-gray-500 text-xs mb-2">{c.client_email}</p>
              <p className="text-gray-300 text-sm leading-relaxed">{c.message}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function ChatSessionsTab({ sessions, onAccept, onDecline, navigate }) {
  const pending = sessions.filter(s => s.status === 'pending');
  const accepted = sessions.filter(s => s.status === 'accepted');
  const declined = sessions.filter(s => s.status === 'declined');

  return (
    <div className="space-y-8">
      {/* Pending */}
      {pending.length > 0 && (
        <div>
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            Pending Requests ({pending.length})
          </h3>
          <div className="space-y-3">
            {pending.map((s, i) => (
              <motion.div key={s.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="card border-yellow-400/20"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-white font-medium">{s.client_name}</p>
                    <p className="text-gray-500 text-sm">{s.client_email}</p>
                    <p className="text-gray-600 text-xs">{new Date(s.created_at).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => onDecline(s.id)}
                      className="border border-red-500/30 text-red-400 hover:bg-red-500/10 px-4 py-2 rounded-lg text-sm transition-all">
                      Decline
                    </button>
                    <button onClick={() => onAccept(s.id)} className="btn-gold text-sm py-2 px-4">
                      Accept Chat
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Active */}
      {accepted.length > 0 && (
        <div>
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400" />
            Active Chats ({accepted.length})
          </h3>
          <div className="space-y-3">
            {accepted.map((s, i) => (
              <motion.div key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                className="card border-green-400/20 flex items-center justify-between gap-4"
              >
                <div>
                  <p className="text-white font-medium">{s.client_name}</p>
                  <p className="text-gray-500 text-sm">{s.client_email}</p>
                </div>
                <button onClick={() => navigate(`/chat/${s.id}`)} className="btn-gold text-sm py-2 px-4">
                  Open Chat
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Declined */}
      {declined.length > 0 && (
        <div>
          <h3 className="text-white font-semibold mb-4 text-gray-500">Declined ({declined.length})</h3>
          <div className="space-y-2">
            {declined.map(s => (
              <div key={s.id} className="card opacity-50 flex items-center justify-between">
                <p className="text-gray-400 text-sm">{s.client_name}</p>
                <Badge color="red">Declined</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {sessions.length === 0 && <EmptyState icon="💬" title="No chat sessions" desc="Pending requests from clients will appear here." />}
    </div>
  );
}
