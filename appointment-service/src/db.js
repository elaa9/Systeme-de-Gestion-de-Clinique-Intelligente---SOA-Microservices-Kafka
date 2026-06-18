const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'appointments.db');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS appointments (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    doctor TEXT NOT NULL,
    date TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING',
    created_at TEXT DEFAULT (datetime('now'))
  )
`);

module.exports = db;
