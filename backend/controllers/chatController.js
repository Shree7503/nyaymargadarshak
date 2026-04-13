const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../models/db');


function createChatSession(db, clientId, lawyerId) {
  // Guard: both IDs must be non-empty strings
  if (!clientId || typeof clientId !== 'string' || clientId.trim() === '') {
    throw new Error('client_id is missing or empty');
  }
  if (!lawyerId || typeof lawyerId !== 'string' || lawyerId.trim() === '') {
    throw new Error('lawyer_id is missing or empty');
  }

  // Guard: verify client exists in users table (prevents FK violation)
  const clientExists = db.prepare("SELECT id FROM users WHERE id = ? AND role = 'client'").get(clientId);
  if (!clientExists) throw new Error(`No client user found with id: ${clientId}`);

  // Guard: verify lawyer exists in users table (prevents FK violation)
  const lawyerExists = db.prepare("SELECT id FROM users WHERE id = ? AND role = 'lawyer'").get(lawyerId);
  if (!lawyerExists) throw new Error(`No lawyer user found with id: ${lawyerId}`);

  // Idempotency: if an open (pending or accepted) session already exists, return it
  // NOTE: string literals use single quotes — double quotes in SQLite WHERE clauses
  // are interpreted as column name identifiers and cause "no such column" errors.
  const existing = db.prepare(
    "SELECT * FROM chat_sessions WHERE client_id = ? AND lawyer_id = ? AND status IN ('pending', 'accepted')"
  ).get(clientId, lawyerId);

  if (existing) return { session: existing, alreadyExisted: true };

  const id = uuidv4();
  db.prepare(
    "INSERT INTO chat_sessions (id, client_id, lawyer_id, status) VALUES (?, ?, ?, 'pending')"
  ).run(id, clientId, lawyerId);

  const session = db.prepare('SELECT * FROM chat_sessions WHERE id = ?').get(id);
  return { session, alreadyExisted: false };
}

// POST /api/chat/request
// Called directly by the client (separate from the contact form flow).
const requestChat = (req, res) => {
  const { lawyer_id } = req.body;

  if (!lawyer_id) {
    return res.status(400).json({ error: 'lawyer_id is required' });
  }

  // req.user.id comes from JWT — if it is somehow falsy, reject early
  if (!req.user?.id) {
    return res.status(401).json({ error: 'Authenticated user id is missing from token' });
  }

  try {
    const db = getDb();
    const { session, alreadyExisted } = createChatSession(db, req.user.id, lawyer_id);
    const status = alreadyExisted ? 200 : 201;
    return res.status(status).json({ session, alreadyExisted });
  } catch (err) {
    console.error('[requestChat] error:', err.message);
    return res.status(400).json({ error: err.message });
  }
};

// POST /api/chat/accept/:id
const acceptChat = (req, res) => {
  const db = getDb();
  const session = db.prepare('SELECT * FROM chat_sessions WHERE id = ?').get(req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  if (session.lawyer_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

  // Single-quoted string literal — fixes "no such column: accepted" error
  db.prepare("UPDATE chat_sessions SET status = 'accepted' WHERE id = ?").run(req.params.id);
  res.json({ message: 'Chat accepted', sessionId: req.params.id });
};

// POST /api/chat/decline/:id
const declineChat = (req, res) => {
  const db = getDb();
  const session = db.prepare('SELECT * FROM chat_sessions WHERE id = ?').get(req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  if (session.lawyer_id !== req.user.id) return res.status(403).json({ error: 'Not authorized' });

  // Single-quoted string literal
  db.prepare("UPDATE chat_sessions SET status = 'declined' WHERE id = ?").run(req.params.id);
  res.json({ message: 'Chat declined' });
};

// GET /api/chat/sessions
const getSessions = (req, res) => {
  const db = getDb();
  let sessions;
  if (req.user.role === 'lawyer') {
    sessions = db.prepare(`
      SELECT cs.*, u.name AS client_name, u.email AS client_email
      FROM chat_sessions cs
      JOIN users u ON cs.client_id = u.id
      WHERE cs.lawyer_id = ?
      ORDER BY cs.created_at DESC
    `).all(req.user.id);
  } else {
    sessions = db.prepare(`
      SELECT cs.*, u.name AS lawyer_name, lp.specialization
      FROM chat_sessions cs
      JOIN users u ON cs.lawyer_id = u.id
      LEFT JOIN lawyer_profiles lp ON u.id = lp.user_id
      WHERE cs.client_id = ?
      ORDER BY cs.created_at DESC
    `).all(req.user.id);
  }
  res.json(sessions);
};

// POST /api/chat/messages
const sendMessage = (req, res) => {
  const { session_id, message } = req.body;
  if (!session_id || !message) {
    return res.status(400).json({ error: 'session_id and message are required' });
  }

  const db = getDb();
  const session = db.prepare('SELECT * FROM chat_sessions WHERE id = ?').get(session_id);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  // Single-quoted literal — avoids "no such column: accepted"
  if (session.status !== 'accepted') {
    return res.status(403).json({ error: 'Chat not yet accepted by the lawyer' });
  }
  if (session.client_id !== req.user.id && session.lawyer_id !== req.user.id) {
    return res.status(403).json({ error: 'You are not a participant in this session' });
  }

  const id = uuidv4();
  db.prepare(
    'INSERT INTO messages (id, session_id, sender_id, message) VALUES (?, ?, ?, ?)'
  ).run(id, session_id, req.user.id, message);

  const msg = db.prepare(`
    SELECT m.*, u.name AS sender_name, u.role AS sender_role
    FROM messages m JOIN users u ON m.sender_id = u.id
    WHERE m.id = ?
  `).get(id);
  res.status(201).json(msg);
};

// GET /api/chat/messages/:session_id
const getMessages = (req, res) => {
  const { session_id } = req.params;
  const db = getDb();
  const session = db.prepare('SELECT * FROM chat_sessions WHERE id = ?').get(session_id);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  if (session.client_id !== req.user.id && session.lawyer_id !== req.user.id) {
    return res.status(403).json({ error: 'You are not a participant in this session' });
  }
  const messages = db.prepare(`
    SELECT m.*, u.name AS sender_name, u.role AS sender_role
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    WHERE m.session_id = ?
    ORDER BY m.timestamp ASC
  `).all(session_id);
  res.json(messages);
};

module.exports = { requestChat, acceptChat, declineChat, getSessions, sendMessage, getMessages, createChatSession };
/*
========================================
CHAT CONTROLLER SUMMARY
========================================

This controller manages the chat system between clients and lawyers.

MAIN FEATURES:
1. requestChat:
   - Client sends a chat request to a lawyer
   - Creates a new session with status 'pending'
   - Prevents duplicate active sessions

2. acceptChat:
   - Lawyer accepts the chat request
   - Updates session status to 'accepted'

3. declineChat:
   - Lawyer rejects the chat request
   - Updates session status to 'declined'

4. getSessions:
   - Fetches all chat sessions for logged-in user
   - Lawyers see client details
   - Clients see lawyer details

5. sendMessage:
   - Allows sending messages in a chat session
   - Only allowed if session is 'accepted'
   - Stores messages in database

6. getMessages:
   - Fetches all messages of a session
   - Only accessible to participants
   - Messages sorted in chronological order

CORE CONCEPTS:
- chat_sessions table → manages chat relationships
- messages table → stores individual messages
- status system → pending, accepted, declined
- authorization → only valid users can access chat
- validation → ensures correct data input

FLOW:
Client → Request Chat → Session Created →
Lawyer Accepts → Chat Starts →
Messages Sent → Messages Retrieved

IMPORTANCE:
This is the core interaction feature of the platform,
enabling secure communication between clients and lawyers.

========================================
*/