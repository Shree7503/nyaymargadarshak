const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../models/db');
const emailService = require('../services/emailService');
// Import the shared helper so chat session creation is always validated/idempotent
const { createChatSession } = require('./chatController');

const sendContact = async (req, res) => {
  const { lawyer_id, message } = req.body;
  if (!lawyer_id || !message) return res.status(400).json({ error: 'Lawyer ID and message required' });

  // Reject early if the JWT user id is missing — avoids FK violation with empty string
  if (!req.user?.id) {
    return res.status(401).json({ error: 'Authenticated user id is missing from token' });
  }

  const db = getDb();
  const lawyer = db.prepare(`
    SELECT u.name, u.email, lp.contact_email 
    FROM users u JOIN lawyer_profiles lp ON u.id = lp.user_id 
    WHERE u.id = ? AND u.role = 'lawyer'
  `).get(lawyer_id);

  if (!lawyer) return res.status(404).json({ error: 'Lawyer not found' });

  // Insert the contact log
  const contactId = uuidv4();
  db.prepare('INSERT INTO client_contacts (id, client_id, lawyer_id, message) VALUES (?,?,?,?)')
    .run(contactId, req.user.id, lawyer_id, message);

  // Create (or reuse) a chat session using the shared validated helper.
  // This replaces the old raw INSERT that had no duplicate check and no FK
  // pre-validation, and used double-quoted string literals.
  let sessionId;
  try {
    const { session } = createChatSession(db, req.user.id, lawyer_id);
    sessionId = session.id;
  } catch (err) {
    // Chat session failure is non-fatal — contact was already recorded
    console.error('[sendContact] chat session creation failed:', err.message);
  }

  // Send email notification (non-fatal, without await to prevent Axios timeouts)
  const client = db.prepare('SELECT name, email FROM users WHERE id = ?').get(req.user.id);
  emailService.sendInquiryNotification(
    lawyer.contact_email || lawyer.email,
    lawyer.name,
    client.name,
    message
  ).catch(err => {
    console.error('[sendContact] Email failed:', err.message);
  });

  res.status(201).json({ message: 'Inquiry sent successfully', contactId, sessionId });
};

const getMyContacts = (req, res) => {
  const db = getDb();
  let contacts;
  if (req.user.role === 'lawyer') {
    contacts = db.prepare(`
      SELECT cc.*, u.name as client_name, u.email as client_email
      FROM client_contacts cc JOIN users u ON cc.client_id = u.id
      WHERE cc.lawyer_id = ? ORDER BY cc.timestamp DESC
    `).all(req.user.id);
  } else {
    contacts = db.prepare(`
      SELECT cc.*, u.name as lawyer_name, u.email as lawyer_email, lp.specialization
      FROM client_contacts cc JOIN users u ON cc.lawyer_id = u.id
      LEFT JOIN lawyer_profiles lp ON u.id = lp.user_id
      WHERE cc.client_id = ? ORDER BY cc.timestamp DESC
    `).all(req.user.id);
  }
  res.json(contacts);
};

module.exports = { sendContact, getMyContacts };
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