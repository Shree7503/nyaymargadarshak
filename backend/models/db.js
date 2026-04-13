const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

let db;

function getDb() {
  if (!db) {
    const dbDir = path.join(__dirname, '../../database');
    if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
    
    const dbPath = path.join(dbDir, 'nyay.db');
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    
    initTables(db);
    console.log('📦 Database connected:', dbPath);
  }
  return db;
}

function initTables(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT CHECK(role IN ('client','lawyer','admin')) DEFAULT 'client',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS lawyer_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      specialization TEXT,
      experience INTEGER DEFAULT 0,
      location TEXT,
      contact_email TEXT,
      bio TEXT,
      languages TEXT DEFAULT 'English,Hindi',
      profile_status TEXT CHECK(profile_status IN ('published','draft','pending')) DEFAULT 'draft',
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS client_contacts (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      lawyer_id TEXT NOT NULL,
      message TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(client_id) REFERENCES users(id),
      FOREIGN KEY(lawyer_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS legal_articles (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT,
      content TEXT,
      source_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS legal_updates (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      source TEXT,
      summary TEXT,
      url TEXT UNIQUE,
      published_date TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS law_sections (
      id TEXT PRIMARY KEY,
      law_name TEXT NOT NULL,
      section_number TEXT NOT NULL,
      section_title TEXT,
      simple_explanation TEXT,
      example_case TEXT
    );

    CREATE TABLE IF NOT EXISTS chat_sessions (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL,
      lawyer_id TEXT NOT NULL,
      status TEXT CHECK(status IN ('pending','accepted','declined')) DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(client_id) REFERENCES users(id),
      FOREIGN KEY(lawyer_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      sender_id TEXT NOT NULL,
      message TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(session_id) REFERENCES chat_sessions(id),
      FOREIGN KEY(sender_id) REFERENCES users(id)
    );
  `);
}

module.exports = { getDb };
//connects the backed to the database