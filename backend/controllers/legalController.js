const { getDb } = require('../models/db');

const getArticles = (req, res) => {
  const db = getDb();
  const { category } = req.query;
  let query = 'SELECT * FROM legal_articles';
  const params = [];
  if (category) { query += ' WHERE category = ?'; params.push(category); }
  query += ' ORDER BY created_at DESC';
  res.json(db.prepare(query).all(...params));
};

const getArticleById = (req, res) => {
  const db = getDb();
  const article = db.prepare('SELECT * FROM legal_articles WHERE id = ?').get(req.params.id);
  if (!article) return res.status(404).json({ error: 'Article not found' });
  res.json(article);
};

const getUpdates = (req, res) => {
  const db = getDb();
  const updates = db.prepare('SELECT * FROM legal_updates ORDER BY created_at DESC LIMIT 50').all();
  res.json(updates);
};

const getLaws = (req, res) => {
  const db = getDb();
  const { law_name, search } = req.query;
  let query = 'SELECT * FROM law_sections';
  const params = [];
  const conditions = [];

  if (law_name) { conditions.push('law_name = ?'); params.push(law_name); }
  if (search) { conditions.push('(section_title LIKE ? OR simple_explanation LIKE ? OR section_number LIKE ?)'); params.push(`%${search}%`, `%${search}%`, `%${search}%`); }

  if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
  query += ' ORDER BY law_name, CAST(section_number AS INTEGER)';

  res.json(db.prepare(query).all(...params));
};

const getLawById = (req, res) => {
  const db = getDb();
  const law = db.prepare('SELECT * FROM law_sections WHERE id = ?').get(req.params.id);
  if (!law) return res.status(404).json({ error: 'Law section not found' });
  res.json(law);
};

const getLawNames = (req, res) => {
  const db = getDb();
  const names = db.prepare('SELECT DISTINCT law_name FROM law_sections').all();
  res.json(names.map(n => n.law_name));
};

module.exports = { getArticles, getArticleById, getUpdates, getLaws, getLawById, getLawNames };
