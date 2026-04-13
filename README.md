# ⚖️ NyayMargadarshak

> **Understand the Law. Connect with the Right Lawyer.**

A production-ready LegalTech platform connecting Indian citizens with lawyers while providing real-time legal updates through automated web scraping.

---

## 🏗️ Architecture

```
nyaymargadarshak/
├── frontend/          # React + Vite + TailwindCSS
├── backend/           # Node.js + Express + SQLite
├── scraper/           # Python web scraper service
└── database/          # SQLite database (auto-created)
```

**Tech Stack:**
- **Frontend:** React 18, Vite, TailwindCSS, Framer Motion, React Router, Axios
- **Backend:** Node.js, Express.js, JWT Auth, bcryptjs, node-cron, nodemailer
- **Database:** SQLite (better-sqlite3)
- **Scraper:** Python, BeautifulSoup4, feedparser, requests

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.8+ (for scraper)
- npm

### 1. Install all dependencies

```bash
# From project root
npm install

# Install frontend deps
cd frontend && npm install && cd ..

# Install backend deps
cd backend && npm install && cd ..
```

### 2. Set up Python scraper (optional but recommended)

```bash
cd scraper
pip install -r requirements.txt
cd ..
```

### 3. Configure environment

Edit `backend/.env`:
```env
PORT=5000
JWT_SECRET=your_super_secret_key_here
NODE_ENV=development

# Email (optional - for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

### 4. Start the platform

```bash
# From project root — starts both frontend and backend
npm run dev
```

This starts:
- **Backend API:** http://localhost:5000
- **Frontend:** http://localhost:5173

### 5. Run Python scraper (optional)

```bash
# One-time scrape
cd scraper && python scraper.py

# Or run the scheduler (scrapes every 6 hours)
cd scraper && python scheduler.py
```

> **Note:** The backend also has a built-in Node.js scraper that runs automatically every 6 hours using `node-cron`. Python scraper is for additional sources.

---

## 👥 User Roles

| Feature | Guest | Client | Lawyer |
|---------|-------|--------|--------|
| View Homepage | ✅ | ✅ | ✅ |
| Law Explorer | ✅ | ✅ | ✅ |
| Legal Articles | ✅ | ✅ | ✅ |
| Lawyer Directory | ✅ | ✅ | ✅ |
| Live Legal Updates | ❌ | ✅ | ✅ |
| Send Inquiry | ❌ | ✅ | ❌ |
| Client Dashboard | ❌ | ✅ | ❌ |
| Lawyer Dashboard | ❌ | ❌ | ✅ |
| Chat System | ❌ | ✅ | ✅ |
| Manage Profile | ❌ | ❌ | ✅ |

---

## 📡 API Endpoints

### Auth
```
POST /api/auth/register    — Register new user
POST /api/auth/login       — Login
GET  /api/auth/me          — Get current user (auth required)
```

### Lawyers
```
GET  /api/lawyers                — List all published lawyers
GET  /api/lawyers/:id            — Get lawyer profile
GET  /api/lawyers/me/profile     — Get my profile (lawyer)
POST /api/lawyers/profile        — Create/update profile (lawyer)
GET  /api/lawyers/me/contacts    — My inquiry logs (lawyer)
GET  /api/lawyers/me/stats       — My statistics (lawyer)
```

### Contacts & Chat
```
POST /api/contact           — Send inquiry to lawyer (client)
GET  /api/contact           — Get my contacts (auth)
POST /api/chat/request      — Request chat with lawyer (client)
POST /api/chat/accept/:id   — Accept chat request (lawyer)
POST /api/chat/decline/:id  — Decline chat request (lawyer)
GET  /api/chat/sessions     — List my sessions (auth)
POST /api/chat/messages     — Send message (auth)
GET  /api/chat/messages/:id — Get messages for session (auth)
```

### Legal Content
```
GET /api/articles           — Legal awareness articles
GET /api/articles/:id       — Single article
GET /api/updates            — Live scraped legal updates
GET /api/laws               — Law sections (filterable)
GET /api/laws/:id           — Single law section
GET /api/laws/names         — Available law names
```

### Admin
```
POST /api/admin/scrape      — Manually trigger scraping
GET  /api/health            — Health check
```

---

## 🔄 Scraper System

The platform uses **two scraping mechanisms:**

### 1. Node.js Built-in Scraper (Automatic)
- Runs on backend startup
- Scheduled every 6 hours via `node-cron`
- Fetches RSS feeds from Live Law, Bar and Bench, SC Observer, Law Trend
- Deduplicates by URL (INSERT OR IGNORE)
- Falls back to seeded content if scraping fails

### 2. Python Scraper (Optional, more powerful)
```bash
# Single run
python scraper.py

# Continuous scheduler
python scheduler.py
```

Scraper sources:
- **Live Law** — livelaw.in RSS
- **Bar and Bench** — barandbench.com RSS
- **Law Trend** — lawtrend.in RSS
- **SC Observer** — scobserver.in RSS

---

## 💾 Database Schema

```sql
users           — id, name, email, password, role, created_at
lawyer_profiles — id, user_id, specialization, experience, location, bio, languages, profile_status
client_contacts — id, client_id, lawyer_id, message, timestamp
legal_articles  — id, title, category, content, source_url, created_at
legal_updates   — id, title, source, summary, url, published_date, created_at
law_sections    — id, law_name, section_number, section_title, simple_explanation, example_case
chat_sessions   — id, client_id, lawyer_id, status (pending/accepted/declined), created_at
messages        — id, session_id, sender_id, message, timestamp
```

---

## 🎨 Features

### 🏠 Homepage
- Hero section with animated gold gradient typography
- Feature showcase with scroll animations
- Law preview cards
- Scraper status indicator
- Lawyer registration CTA

### ⚖️ Law Explorer (Public)
- Browse BNS, BNSS, BSA sections
- Expandable accordion with plain-language explanations
- Real case examples
- Search and filter by law code

### 👨‍⚖️ Lawyer Directory (Public)
- Search by name, specialization, location
- Filter pills for quick category filtering
- Lawyer profile cards with initials avatar
- Ratings and experience display

### 💼 Client Dashboard
- Send inquiries to lawyers
- Track chat session status (pending/accepted/declined)
- Access live legal updates
- Quick lawyer finder

### ⚖️ Lawyer Dashboard
- Profile editor with publish/draft toggle
- Real-time inquiry notifications
- Accept/decline chat requests
- View active chat sessions
- Statistics overview

### 💬 Chat System
- Real-time polling (3-second interval)
- Message timestamps
- Lawyer accept/decline flow
- Private per-session conversations
- Mobile-responsive chat UI

### 📡 Live Legal Updates
- Scraped from top Indian legal portals
- Source badge coloring
- Manual re-scrape trigger
- Update statistics
- External article links

---

## 🔐 Security

- JWT tokens with 7-day expiry
- bcrypt password hashing (12 rounds)
- Role-based access control middleware
- Protected API routes
- Input validation
- CORS configuration

---

## 📧 Email Notifications

Configure SMTP in `backend/.env` to enable email notifications when clients contact lawyers.

For Gmail: Use App Password (not your regular password).
For development: Uses Ethereal Mail (fake SMTP) automatically.

---

## 🚀 Production Deployment

```bash
# Build frontend
cd frontend && npm run build

# Serve with PM2
npm install -g pm2
cd backend && pm2 start server.js --name nyay-api

# Serve frontend with nginx or similar
```

---

## 📝 Laws Covered (Pre-seeded)

### Bharatiya Nyaya Sanhita (BNS)
- § 102 — Culpable Homicide
- § 103 — Murder
- § 115 — Grievous Hurt
- § 303 — Theft
- § 308 — Extortion
- § 316 — Criminal Breach of Trust
- § 318 — Cheating
- § 324 — Mischief

### Bharatiya Nagarik Suraksha Sanhita (BNSS)
- § 35 — Arrest Without Warrant
- § 43 — Rights of Arrested Person
- § 58 — Bail in Bailable Offences
- § 173 — FIR Registration

### Bharatiya Sakshya Adhiniyam (BSA)
- § 57 — Judicial Notice
- § 63 — Electronic Records
- § 111 — Burden of Proof

---

## 🛠️ Development

```bash
# Backend only
cd backend && npm run dev

# Frontend only
cd frontend && npm run dev

# Both (from root)
npm run dev

# Run Python scraper once
cd scraper && python scraper.py

# Trigger scrape via API
curl -X POST http://localhost:5000/api/admin/scrape
```

---

*NyayMargadarshak — Empowering Indian citizens with legal knowledge since 2024*
