import { Database } from 'sqlite';
import config from './config.ts';

// Ensure directory exists
try {
    Deno.mkdirSync('tmp', { recursive: true });
} catch (e) {
    if (!(e instanceof Deno.errors.AlreadyExists)) {
        throw e;
    }
}

export const db = new Database(Deno.env.get('DB') || config.DB);

// Initialize schema
db.prepare(`
  CREATE TABLE IF NOT EXISTS transactions (
    id         INTEGER PRIMARY KEY,
    amount     INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);
