const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname, '../../database');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(path.join(dbDir, 'nyay.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const initSQL = `
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
`;

db.exec(initSQL);

// Seed law sections
const existingLaws = db.prepare('SELECT COUNT(*) as count FROM law_sections').get();
if (existingLaws.count === 0) {
  const insertLaw = db.prepare(`INSERT INTO law_sections (id, law_name, section_number, section_title, simple_explanation, example_case) VALUES (?,?,?,?,?,?)`);
  const { v4: uuidv4 } = require('uuid');
  
  const laws = [
    // Bharatiya Nyaya Sanhita (BNS)
    ['bns-1', 'Bharatiya Nyaya Sanhita', '102', 'Culpable Homicide', 'Causing death of a person by doing an act with intention of causing death or knowing that the act is likely to cause death.', 'A person intentionally pushes someone off a building causing their death.'],
    ['bns-2', 'Bharatiya Nyaya Sanhita', '103', 'Murder', 'Culpable homicide is murder if done with intention to cause death, or causing such bodily injury as is likely to cause death.', 'A person shoots another with a gun intending to kill them.'],
    ['bns-3', 'Bharatiya Nyaya Sanhita', '115', 'Voluntarily causing grievous hurt', 'Causing grievous hurt such as permanent disfiguration, loss of limb, or injury endangering life.', 'Someone throws acid on another person causing permanent disfigurement.'],
    ['bns-4', 'Bharatiya Nyaya Sanhita', '303', 'Theft', 'Dishonestly taking any movable property out of the possession of any person without their consent.', 'A person pickpockets a wallet from a crowded market.'],
    ['bns-5', 'Bharatiya Nyaya Sanhita', '308', 'Extortion', 'Putting a person in fear of injury to that person, to any other person, or to property, and inducing them to deliver property or valuable security.', 'A person threatens to harm someone unless they hand over money.'],
    ['bns-6', 'Bharatiya Nyaya Sanhita', '316', 'Criminal Breach of Trust', 'Dishonest misappropriation or conversion of property entrusted to a person for their own use.', 'An employee embezzles company funds entrusted to them.'],
    ['bns-7', 'Bharatiya Nyaya Sanhita', '318', 'Cheating', 'Deceiving a person and inducing them to deliver property or to do something they would not have done otherwise.', 'A person sells fake gold jewellery by claiming it is genuine.'],
    ['bns-8', 'Bharatiya Nyaya Sanhita', '324', 'Mischief', 'Causing destruction of property or diminishing its value or utility.', 'A person deliberately vandalizes a car parked on the street.'],
    // BNSS
    ['bnss-1', 'Bharatiya Nagarik Suraksha Sanhita', '35', 'Arrest without warrant', 'Police can arrest without warrant when person commits cognizable offence or is suspected of committing one.', 'Police arrest a suspect found committing robbery without needing to first obtain a warrant.'],
    ['bnss-2', 'Bharatiya Nagarik Suraksha Sanhita', '43', 'Rights of arrested person', 'Every arrested person has the right to be informed of grounds of arrest, right to bail, and right to consult a legal practitioner.', 'When arrested, a person must be told why they are being arrested and they can call a lawyer.'],
    ['bnss-3', 'Bharatiya Nagarik Suraksha Sanhita', '58', 'Bail in bailable offences', 'When a person accused of a bailable offence is arrested, they shall be released on bail if they are ready and willing to give bail.', 'A person arrested for a minor traffic violation must be released on bail as a matter of right.'],
    ['bnss-4', 'Bharatiya Nagarik Suraksha Sanhita', '173', 'First Information Report (FIR)', 'Every information relating to cognizable offence must be recorded in writing by the officer in charge.', 'A person reports theft to the police and the officer must register an FIR immediately.'],
    // BSA
    ['bsa-1', 'Bharatiya Sakshya Adhiniyam', '57', 'Facts which need not be proved', 'Facts known to the court need not be proved – these are facts of which courts take judicial notice.', 'A court does not need evidence that India became independent on 15 August 1947.'],
    ['bsa-2', 'Bharatiya Sakshya Adhiniyam', '63', 'Electronic records', 'Electronic records are admissible as evidence if they satisfy prescribed conditions of authenticity.', 'WhatsApp messages and emails can be presented as evidence in court if properly certified.'],
    ['bsa-3', 'Bharatiya Sakshya Adhiniyam', '111', 'Burden of proof', 'The burden of proof lies on the person who asserts the affirmative of an issue.', 'The prosecution must prove the accused committed a crime; the accused does not have to prove innocence.'],
  ];
  
  const insertMany = db.transaction((items) => {
    for (const item of items) insertLaw.run(...item);
  });
  insertMany(laws);
}

// Seed legal articles
const existingArticles = db.prepare('SELECT COUNT(*) as count FROM legal_articles').get();
if (existingArticles.count === 0) {
  const { v4: uuidv4 } = require('uuid');
  const insertArticle = db.prepare(`INSERT INTO legal_articles (id, title, category, content, source_url) VALUES (?,?,?,?,?)`);
  const articles = [
    [uuidv4(), 'Understanding Your Right to Remain Silent', 'Constitutional Rights', 'Under Article 20(3) of the Indian Constitution, no person accused of any offence shall be compelled to be a witness against himself. This right protects you during police interrogation. You have the right to remain silent and not answer questions that may incriminate you. Always consult a lawyer before making any statement to the police.', 'https://legislative.gov.in'],
    [uuidv4(), 'How to File an FIR: A Step-by-Step Guide', 'Criminal Law', 'An FIR (First Information Report) is the first step in the criminal justice process. You have the right to file an FIR at any police station. If police refuse to register an FIR, you can approach the Superintendent of Police or file a complaint before a Magistrate. Under Section 173 of BNSS, police must register cognizable offences without delay.', 'https://mha.gov.in'],
    [uuidv4(), 'Consumer Rights Under Consumer Protection Act 2019', 'Consumer Law', 'The Consumer Protection Act 2019 gives consumers six fundamental rights: right to safety, right to information, right to choose, right to be heard, right to redressal, and right to consumer education. You can file a complaint before the District Consumer Forum for amounts up to ₹50 lakhs.', 'https://consumeraffairs.nic.in'],
    [uuidv4(), 'Understanding Anticipatory Bail in India', 'Criminal Law', 'Anticipatory bail (Section 484 BNSS) is a direction to release a person on bail, issued in anticipation of an arrest. You can apply for anticipatory bail if you have reason to believe you may be arrested for a non-bailable offence. It gives you protection before an actual arrest.', 'https://legislative.gov.in'],
    [uuidv4(), 'Property Rights of Women Under Hindu Law', 'Property Law', 'After the 2005 amendment to the Hindu Succession Act, daughters have equal coparcenary rights in ancestral property just like sons. Women can inherit, own, and dispose of property independently. Married women can claim rights in both parental and matrimonial property.', 'https://indiacode.nic.in'],
    [uuidv4(), 'Cyber Crime: How to Protect Yourself and Report', 'Cyber Law', 'Cyber crimes are covered under the Information Technology Act 2000 and relevant provisions of BNS. If you face online fraud, hacking, or cyber harassment, report to the National Cyber Crime Reporting Portal (cybercrime.gov.in). Keep evidence like screenshots and transaction records.', 'https://cybercrime.gov.in'],
  ];
  const insertMany = db.transaction((items) => {
    for (const item of items) insertArticle.run(...item);
  });
  insertMany(articles);
}

console.log('✅ Database initialized successfully');
db.close();
//creates rhe database