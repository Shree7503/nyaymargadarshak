import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { Loader, ErrorMsg } from '../components/common/UI';
import api from '../utils/api';

export default function ChatPage() {
  const { sessionId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [session, setSessions] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);
  const pollRef = useRef(null);

  const fetchSession = async () => {
    try {
      const { data } = await api.get('/chat/sessions');
      const found = data.find(s => s.id === sessionId);
      if (!found) { setError('Session not found'); return; }
      setSessions(found);
      if (found.status !== 'accepted') { setError('This chat session is not active.'); }
    } catch (err) { setError('Failed to load session.'); }
  };

  const fetchMessages = async () => {
    try {
      const { data } = await api.get(`/chat/messages/${sessionId}`);
      setMessages(data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    const init = async () => {
      await fetchSession();
      await fetchMessages();
      setLoading(false);
    };
    init();

    // Poll for new messages every 3 seconds
    pollRef.current = setInterval(fetchMessages, 3000);
    return () => clearInterval(pollRef.current);
  }, [sessionId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      await api.post('/chat/messages', { session_id: sessionId, message: input.trim() });
      setInput('');
      await fetchMessages();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send message.');
    } finally { setSending(false); }
  };

  const otherParty = session ? (
    user?.role === 'client' ? { name: session.lawyer_name, role: 'Lawyer' }
    : { name: session.client_name, role: 'Client' }
  ) : null;

  if (loading) return (
    <div className="min-h-screen bg-dark flex items-center justify-center">
      <Loader text="Loading chat..." />
    </div>
  );

  return (
    <div className="min-h-screen bg-dark flex flex-col">
      {/* Chat header */}
      <div className="bg-dark-1 border-b border-dark-4 px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition-colors text-sm">← Back</button>
        <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center">
          <span className="text-gold font-bold">{otherParty?.name?.charAt(0)}</span>
        </div>
        <div className="flex-1">
          <p className="text-white font-semibold">{otherParty?.name || 'Chat'}</p>
          <p className="text-gray-500 text-xs">{otherParty?.role} • Secure Chat</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-green-400 text-xs">Live</span>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-6">
          <ErrorMsg message={error} />
          <Link to={user?.role === 'lawyer' ? '/lawyer/dashboard' : '/client/dashboard'} className="btn-outline text-sm mt-4 inline-block">
            Back to Dashboard
          </Link>
        </div>
      )}

      {!error && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 max-w-4xl mx-auto w-full">
            {messages.length === 0 && (
              <div className="text-center py-16">
                <div className="text-5xl mb-3">👋</div>
                <p className="text-gray-400">Chat started! Send your first message.</p>
                <p className="text-gray-600 text-sm mt-2">Messages are private between you and {otherParty?.name}.</p>
              </div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((msg, i) => {
                const isMe = msg.sender_id === user?.id;
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                      {!isMe && (
                        <span className="text-xs text-gray-500 ml-1">{msg.sender_name}</span>
                      )}
                      <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        isMe
                          ? 'bg-gold text-dark-1 rounded-br-sm'
                          : 'bg-dark-3 text-white border border-dark-4 rounded-bl-sm'
                      }`}>
                        {msg.message}
                      </div>
                      <span className={`text-xs text-gray-600 ${isMe ? 'text-right' : 'text-left'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="bg-dark-1 border-t border-dark-4 p-4">
            <form onSubmit={sendMessage} className="max-w-4xl mx-auto flex gap-3">
              <input
                className="input flex-1"
                placeholder="Type your message..."
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={sending}
                autoFocus
              />
              <button
                type="submit"
                disabled={!input.trim() || sending}
                className="btn-gold px-6 py-3 disabled:opacity-50 flex items-center gap-2"
              >
                {sending ? '...' : 'Send'} <span>→</span>
              </button>
            </form>
            <p className="text-center text-xs text-gray-700 mt-2 max-w-4xl mx-auto">
              ⚖️ This is a secure consultation channel. All messages are stored privately.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
