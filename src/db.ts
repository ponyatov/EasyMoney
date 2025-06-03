import { Database } from 'sqlite';

export const db = new Database('easymoney.db');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS transactions (
    id         INTEGER PRIMARY KEY,
    amount     INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);
