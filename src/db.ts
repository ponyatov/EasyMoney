import { DB } from 'https://deno.land/x/sqlite@v3.8/mod.ts';

export const db = new DB('tmp/easymoney.db');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS transactions (
    id         INTEGER PRIMARY KEY,
    amount     INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);
