

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../../database/nyay.db');
if (!fs.existsSync(dbPath)) {
  console.log('No database found at', dbPath, '— nothing to migrate.');
  process.exit(0);
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
// Run migration WITHOUT foreign_keys = ON so we can delete the bad rows first
db.pragma('foreign_keys = OFF');

console.log('=== NyayMargadarshak chat_sessions migration ===\n');

// ── 1. Delete rows with empty or NULL client_id / lawyer_id ────────────────
const badRows = db.prepare(
  "SELECT id, client_id, lawyer_id, status FROM chat_sessions WHERE client_id IS NULL OR client_id = '' OR lawyer_id IS NULL OR lawyer_id = ''"
).all();

if (badRows.length > 0) {
  console.log(`Found ${badRows.length} corrupt row(s) with empty IDs — deleting:`);
  badRows.forEach(r => console.log(`  id=${r.id}  client_id="${r.client_id}"  lawyer_id="${r.lawyer_id}"`));
  db.prepare(
    "DELETE FROM chat_sessions WHERE client_id IS NULL OR client_id = '' OR lawyer_id IS NULL OR lawyer_id = ''"
  ).run();
  console.log('  ✅ Deleted.\n');
} else {
  console.log('✅ No empty-ID rows found.\n');
}

// ── 2. Delete rows whose client_id or lawyer_id has no matching user ────────
const orphanedRows = db.prepare(`
  SELECT cs.id, cs.client_id, cs.lawyer_id
  FROM chat_sessions cs
  WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = cs.client_id)
     OR NOT EXISTS (SELECT 1 FROM users WHERE id = cs.lawyer_id)
`).all();

if (orphanedRows.length > 0) {
  console.log(`Found ${orphanedRows.length} orphaned row(s) with no matching user — deleting:`);
  orphanedRows.forEach(r => console.log(`  id=${r.id}  client_id=${r.client_id}  lawyer_id=${r.lawyer_id}`));
  const ids = orphanedRows.map(r => r.id);
  // also remove their messages first
  const msgDel = db.prepare('DELETE FROM messages WHERE session_id = ?');
  ids.forEach(id => msgDel.run(id));
  const sessDel = db.prepare('DELETE FROM chat_sessions WHERE id = ?');
  ids.forEach(id => sessDel.run(id));
  console.log('  ✅ Deleted (including their messages).\n');
} else {
  console.log('✅ No orphaned rows found.\n');
}

// ── 3. Remove duplicate sessions — keep the oldest per (client_id, lawyer_id) ─
const dupes = db.prepare(`
  SELECT client_id, lawyer_id, COUNT(*) as cnt
  FROM chat_sessions
  GROUP BY client_id, lawyer_id
  HAVING cnt > 1
`).all();

if (dupes.length > 0) {
  console.log(`Found ${dupes.length} duplicate pair(s) — keeping oldest row each:`);
  const keepStmt  = db.prepare("SELECT id FROM chat_sessions WHERE client_id=? AND lawyer_id=? ORDER BY created_at ASC LIMIT 1");
  const deleteStmt = db.prepare("DELETE FROM chat_sessions WHERE client_id=? AND lawyer_id=? AND id != ?");
  dupes.forEach(({ client_id, lawyer_id }) => {
    const keeper = keepStmt.get(client_id, lawyer_id);
    const result = deleteStmt.run(client_id, lawyer_id, keeper.id);
    console.log(`  pair (${client_id}, ${lawyer_id}) → kept ${keeper.id}, removed ${result.changes} duplicate(s)`);
  });
  console.log('  ✅ Done.\n');
} else {
  console.log('✅ No duplicate sessions found.\n');
}

// ── 4. Fix status values stuck at NULL due to the double-quote bug ───────────
// The old UPDATE SET status="accepted" used "accepted" as a column identifier
// in SQLite, which is a no-op — the column stays as its previous value.
// Any session whose status is NULL (SQLite default when CHECK doesn't fire) or
// something unexpected should be reset to 'pending' so the lawyer can re-act.
const nullStatus = db.prepare(
  "SELECT id, status FROM chat_sessions WHERE status IS NULL OR status NOT IN ('pending','accepted','declined')"
).all();

if (nullStatus.length > 0) {
  console.log(`Found ${nullStatus.length} row(s) with invalid status — resetting to 'pending':`);
  nullStatus.forEach(r => console.log(`  id=${r.id}  status=${JSON.stringify(r.status)}`));
  db.prepare(
    "UPDATE chat_sessions SET status = 'pending' WHERE status IS NULL OR status NOT IN ('pending','accepted','declined')"
  ).run();
  console.log("  ✅ Reset to 'pending'.\n");
} else {
  console.log('✅ All status values are valid.\n');
}

// ── 5. Re-enable FK enforcement and verify ──────────────────────────────────
db.pragma('foreign_keys = ON');
console.log('Foreign key enforcement re-enabled.');

// Quick integrity check
const integrity = db.pragma('foreign_key_check(chat_sessions)');
if (integrity.length === 0) {
  console.log('✅ chat_sessions passes foreign key check.\n');
} else {
  console.warn('⚠️  Remaining FK violations (investigate manually):', integrity);
}

db.close();
console.log('=== Migration complete ===');
/*
SUMMARY — migrate_chat.js

This script is used to clean and fix corrupted chat data in the database.

It solves 3 major issues:
1. Deletes chats with missing client_id or lawyer_id
2. Removes chats linked to users that no longer exist
3. Eliminates duplicate chat sessions (keeps only one per client-lawyer pair)
4. Fixes incorrect or NULL status values by resetting them to 'pending'
5. Re-enables foreign key checks and verifies database integrity

In short:
This script ensures that the chat system data is clean, valid, and consistent.

Usage:
Run once using → node backend/scripts/migrate_chat.js
*/