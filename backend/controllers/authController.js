const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');//Universally Unique Identifier (UUID)
const { getDb } = require('../models/db');

const register = (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
  if (!['client', 'lawyer'].includes(role)) return res.status(400).json({ error: 'Invalid role' });

  const db = getDb();
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  const hashedPassword = bcrypt.hashSync(password, 12);
  const id = uuidv4();

  db.prepare('INSERT INTO users (id, name, email, password, role) VALUES (?,?,?,?,?)').run(id, name, email, hashedPassword, role);

  if (role === 'lawyer') {
    db.prepare('INSERT INTO lawyer_profiles (id, user_id, contact_email) VALUES (?,?,?)').run(uuidv4(), id, email);
  }

  const token = jwt.sign({ id, name, email, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ token, user: { id, name, email, role } });
};

const login = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = bcrypt.compareSync(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
};

const me = (req, res) => {
  const db = getDb();
  const user = db.prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
};

module.exports = { register, login, me };
/*
========================================
AUTH CONTROLLER SUMMARY
========================================

This controller handles user authentication and identity management.

MAIN FUNCTIONS:
1. register:
   - Accepts user details (name, email, password, role)
   - Validates input and checks for duplicate email
   - Hashes password using bcrypt for security
   - Stores user in database (users table)
   - If role is 'lawyer', creates entry in lawyer_profiles table
   - Generates JWT token for authentication
   - Returns token + user details

2. login:
   - Accepts email and password
   - Fetches user from database
   - Compares password using bcrypt
   - If valid, generates JWT token
   - Returns token + user details

3. me:
   - Uses user ID from JWT (req.user)
   - Fetches current logged-in user details from database
   - Returns user information

KEY CONCEPTS:
- bcrypt → used for secure password hashing
- JWT → used for authentication (stateless session)
- UUID → generates unique user IDs
- Role-based system → supports 'client' and 'lawyer'

FLOW:
User → Route → Controller → Database → JWT Token → Response

IMPORTANCE:
This is the core security layer of the application.
Without this, login, registration, and protected routes will not work.

========================================
*/