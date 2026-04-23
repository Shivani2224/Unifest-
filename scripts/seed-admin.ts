import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'database', 'unifest.db');

const db = await open({ filename: dbPath, driver: sqlite3.Database });

const existing = await db.get('SELECT id FROM users WHERE email = ?', ['admin@unifest.com']);
if (existing) {
    console.log(`Admin already exists (id=${existing.id})`);
    process.exit(0);
}

const result = await db.run(
    'INSERT INTO users (name, email, password, department, year, role) VALUES (?, ?, ?, ?, ?, ?)',
    ['Admin', 'admin@unifest.com', 'admin123', 'Administration', 'N/A', 'admin']
);
console.log(`Admin created (id=${result.lastID}) — email: admin@unifest.com, password: admin123`);
