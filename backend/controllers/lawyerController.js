const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../models/db');

const getAllLawyers = (req, res) => {
  const { specialization, location, search } = req.query;
  const db = getDb();

  let query = `
    SELECT u.id, u.name, u.email, u.created_at,
           lp.specialization, lp.experience, lp.location, lp.bio, lp.languages, lp.contact_email, lp.profile_status
    FROM users u
    INNER JOIN lawyer_profiles lp ON u.id = lp.user_id
    WHERE u.role = 'lawyer' AND lp.profile_status = 'published'
  `;//this is the reson why unless the prfile is publshed it is nto made pubic

  const params = [];

  if (specialization) {
    query += ` AND lp.specialization LIKE ?`;
    params.push(`%${specialization}%`);
  }

  if (location) {
    query += ` AND lp.location LIKE ?`;
    params.push(`%${location}%`);
  }

  if (search) {
    query += ` AND (u.name LIKE ? OR lp.specialization LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ` ORDER BY lp.experience DESC`;

  const lawyers = db.prepare(query).all(...params);
  res.json(lawyers);
};

const getLawyerById = (req, res) => {
  const db = getDb();

  const lawyer = db.prepare(`
    SELECT u.id, u.name, u.email, u.created_at,
           lp.specialization, lp.experience, lp.location, lp.bio, lp.languages, lp.contact_email, lp.profile_status
    FROM users u
    INNER JOIN lawyer_profiles lp ON u.id = lp.user_id
    WHERE u.id = ? AND u.role = 'lawyer'
  `).get(req.params.id);

  if (!lawyer) {
    return res.status(404).json({ error: 'Lawyer not found' });
  }

  res.json(lawyer);
};

const getMyProfile = (req, res) => {
  const db = getDb();

  const profile = db.prepare(
    'SELECT * FROM lawyer_profiles WHERE user_id = ?'
  ).get(req.user.id);

  if (!profile) {
    return res.status(404).json({ error: 'Profile not found' });
  }

  res.json(profile);
};

const upsertProfile = (req, res) => {
  const { specialization, experience, location, contact_email, bio, languages, profile_status } = req.body;
  const db = getDb();

  const existing = db.prepare(
    'SELECT id FROM lawyer_profiles WHERE user_id = ?'
  ).get(req.user.id);

  if (existing) {
    db.prepare(`
      UPDATE lawyer_profiles
      SET specialization=?, experience=?, location=?, contact_email=?, bio=?, languages=?, profile_status=?
      WHERE user_id=?
    `).run(
      specialization,
      experience || 0,
      location,
      contact_email,
      bio,
      languages,
      profile_status || 'draft',
      req.user.id
    );

  } else {
    db.prepare(`
      INSERT INTO lawyer_profiles
      (id, user_id, specialization, experience, location, contact_email, bio, languages, profile_status)
      VALUES (?,?,?,?,?,?,?,?,?)
    `).run(
      uuidv4(),
      req.user.id,
      specialization,
      experience || 0,
      location,
      contact_email,
      bio,
      languages,
      profile_status || 'draft'
    );
  }

  const profile = db.prepare(
    'SELECT * FROM lawyer_profiles WHERE user_id = ?'
  ).get(req.user.id);

  res.json({
    message: 'Profile saved',
    profile
  });
};

const getContactLogs = (req, res) => {
  const db = getDb();

  const contacts = db.prepare(`
    SELECT cc.*, u.name as client_name, u.email as client_email
    FROM client_contacts cc
    JOIN users u ON cc.client_id = u.id
    WHERE cc.lawyer_id = ?
    ORDER BY cc.timestamp DESC
  `).all(req.user.id);

  res.json(contacts);
};

const getContactStats = (req, res) => {
  const db = getDb();

  const total = db.prepare(
    'SELECT COUNT(*) as count FROM client_contacts WHERE lawyer_id = ?'
  ).get(req.user.id);

  const thisMonth = db.prepare(`
    SELECT COUNT(*) as count
    FROM client_contacts
    WHERE lawyer_id = ?
    AND timestamp >= date('now','start of month')
  `).get(req.user.id);

  const sessions = db.prepare(`
    SELECT COUNT(*) as count
    FROM chat_sessions
    WHERE lawyer_id = ?
    AND status = ?
  `).get(req.user.id, 'accepted');

  res.json({
    total: total.count,
    thisMonth: thisMonth.count,
    activeSessions: sessions.count
  });
};

module.exports = {
  getAllLawyers,
  getLawyerById,
  getMyProfile,
  upsertProfile,
  getContactLogs,
  getContactStats
};
/*
========================================
LAWYER CONTROLLER SUMMARY
========================================

This controller manages lawyer discovery, profiles, and interaction data.

MAIN FEATURES:

1. getAllLawyers:
   - Fetches all lawyers from database
   - Supports filtering by specialization, location, and search
   - Only shows published profiles
   - Sorted by experience (highest first)

2. getLawyerById:
   - Fetches detailed information of a specific lawyer
   - Used when client views a lawyer profile

3. getMyProfile:
   - Fetches profile of the logged-in lawyer
   - Used in lawyer dashboard

4. upsertProfile:
   - Creates or updates lawyer profile
   - If profile exists → UPDATE
   - If not → INSERT
   - Supports draft and published states

5. getContactLogs:
   - Fetches all client inquiries for a lawyer
   - Includes client name and email
   - Sorted by latest first

6. getContactStats:
   - Provides dashboard statistics:
     ✔ Total inquiries
     ✔ This month's inquiries
     ✔ Active chat sessions

CORE CONCEPTS:
- JOIN queries → combine users + lawyer_profiles
- Filtering → specialization, location, search
- Upsert logic → update or insert
- Dashboard analytics → counts & stats
- Profile status → draft / published

FLOW:
Client → Search Lawyers → View Profile →
Contact Lawyer / Chat →
Lawyer → Manage Profile →
View Contacts & Stats

IMPORTANCE:
This is the core discovery and profile management system
that connects clients with lawyers on the platform.

========================================
*/