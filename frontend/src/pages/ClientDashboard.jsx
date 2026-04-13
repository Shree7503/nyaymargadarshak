import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/common/Navbar';
import { Loader, Badge, EmptyState, FadeIn, ErrorMsg, SuccessMsg } from '../components/common/UI';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';

const TABS = ['Overview', 'My Inquiries', 'Chat Sessions', 'Find Lawyers'];

export default function ClientDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('Overview');
  const [contacts, setContacts] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/contact').then(r => setContacts(r.data)),
      api.get('/chat/sessions').then(r => setSessions(r.data)),
      api.get('/lawyers').then(r => setLawyers(r.data.slice(0, 6))),
    ]).finally(() => setLoading(false));
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  const pendingSessions = sessions.filter(s => s.status === 'pending').length;
  const acceptedSessions = sessions.filter(s => s.status === 'accepted').length;

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />
      <div className="pt-24 max-w-7xl mx-auto px-6 pb-16">
        {/* Header */}
        <FadeIn className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-gold text-sm mb-1">Client Dashboard</p>
            <h1 className="font-display text-3xl font-bold text-white">Welcome, {user?.name} 👋</h1>
          </div>
          <div className="flex gap-3">
            <Link to="/legal-updates" className="btn-outline text-sm py-2 px-4">📡 Live Updates</Link>
            <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-red-400 transition-colors">Logout</button>
          </div>
        </FadeIn>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Inquiries Sent', value: contacts.length, icon: '📨' },
            { label: 'Pending Chats', value: pendingSessions, icon: '⏳' },
            { label: 'Active Chats', value: acceptedSessions, icon: '💬' },
            { label: 'Lawyers Available', value: lawyers.length, icon: '👨‍⚖️' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="bg-dark-2 border border-dark-4 rounded-xl p-5"
            >
              <p className="text-3xl mb-2">{s.icon}</p>
              <p className="font-display text-2xl font-bold text-white">{s.value}</p>
              <p className="text-gray-500 text-sm">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-dark-2 border border-dark-4 rounded-xl p-1 mb-8 overflow-x-auto">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                tab === t ? 'bg-gold text-dark' : 'text-gray-400 hover:text-white'
              }`}>{t}</button>
          ))}
        </div>

        {loading ? <Loader /> : (
          <>
            {tab === 'Overview' && <OverviewTab contacts={contacts} sessions={sessions} navigate={navigate} />}
            {tab === 'My Inquiries' && <InquiriesTab contacts={contacts} />}
            {tab === 'Chat Sessions' && <ChatSessionsTab sessions={sessions} navigate={navigate} />}
            {tab === 'Find Lawyers' && <FindLawyersTab lawyers={lawyers} />}
          </>
        )}
      </div>
    </div>
  );
}

function OverviewTab({ contacts, sessions, navigate }) {
  const accepted = sessions.filter(s => s.status === 'accepted');
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card">
        <h3 className="font-semibold text-white mb-4">Recent Inquiries</h3>
        {contacts.length === 0 ? (
          <EmptyState icon="📨" title="No inquiries yet" desc="Browse the lawyer directory and send your first inquiry." />
        ) : (
          <div className="space-y-3">
            {contacts.slice(0, 3).map(c => (
              <div key={c.id} className="bg-dark-3 rounded-lg p-3">
                <p className="text-white text-sm font-medium">{c.lawyer_name || 'Lawyer'}</p>
                <p className="text-gray-500 text-xs line-clamp-1 mt-1">{c.message}</p>
                <p className="text-gray-600 text-xs mt-1">{new Date(c.timestamp).toLocaleDateString('en-IN')}</p>
              </div>
            ))}
            {contacts.length > 3 && (
              <p className="text-gold text-sm cursor-pointer hover:underline">+{contacts.length - 3} more</p>
            )}
          </div>
        )}
        <Link to="/lawyers" className="btn-gold w-full text-center block mt-4 text-sm py-2">Find a Lawyer</Link>
      </div>

      <div className="card">
        <h3 className="font-semibold text-white mb-4">Active Chat Sessions</h3>
        {accepted.length === 0 ? (
          <EmptyState icon="💬" title="No active chats" desc="When a lawyer accepts your inquiry, chat will open here." />
        ) : (
          <div className="space-y-3">
            {accepted.map(s => (
              <div key={s.id} className="bg-dark-3 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-medium">{s.lawyer_name}</p>
                  <p className="text-gray-500 text-xs">{s.specialization}</p>
                </div>
                <button onClick={() => navigate(`/chat/${s.id}`)} className="btn-gold text-xs py-1 px-3">Open Chat</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function InquiriesTab({ contacts }) {
  if (contacts.length === 0) return <EmptyState icon="📨" title="No inquiries sent yet" desc="Browse the lawyer directory to get started." />;
  return (
    <div className="space-y-4">
      {contacts.map((c, i) => (
        <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
          className="card"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-white font-semibold">{c.lawyer_name || 'Lawyer'}</p>
              <p className="text-gold/70 text-sm">{c.specialization || 'Legal Professional'}</p>
              <p className="text-gray-400 text-sm mt-3 leading-relaxed">{c.message}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-gray-600 text-xs">{new Date(c.timestamp).toLocaleDateString('en-IN')}</p>
              <Badge color="blue">Sent</Badge>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function ChatSessionsTab({ sessions, navigate }) {
  if (sessions.length === 0) return <EmptyState icon="💬" title="No chat sessions" desc="Send an inquiry to a lawyer to start a chat request." />;
  const statusColor = { pending: 'gray', accepted: 'green', declined: 'red' };
  return (
    <div className="space-y-4">
      {sessions.map((s, i) => (
        <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
          className="card flex items-center justify-between gap-4"
        >
          <div>
            <p className="text-white font-semibold">{s.lawyer_name}</p>
            <p className="text-gray-500 text-sm">{s.specialization || 'Legal Professional'}</p>
            <p className="text-gray-600 text-xs mt-1">{new Date(s.created_at).toLocaleDateString('en-IN')}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge color={statusColor[s.status]}>{s.status}</Badge>
            {s.status === 'accepted' && (
              <button onClick={() => navigate(`/chat/${s.id}`)} className="btn-gold text-sm py-2 px-4">Open Chat</button>
            )}
            {s.status === 'declined' && (
              <p className="text-red-400/70 text-xs">Request declined</p>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function FindLawyersTab({ lawyers }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-semibold">Available Lawyers</h3>
        <Link to="/lawyers" className="text-gold text-sm hover:underline">View All →</Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {lawyers.map((l, i) => (
          <motion.div key={l.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Link to={`/lawyers/${l.id}`} className="block card hover:border-gold/40 transition-all group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-gold text-sm font-bold">{l.name?.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-white font-medium text-sm group-hover:text-gold transition-colors">{l.name}</p>
                  <p className="text-gray-500 text-xs">{l.specialization}</p>
                </div>
              </div>
              <div className="text-xs text-gray-600">📍 {l.location || 'Pan India'} • {l.experience || 0}y exp</div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
