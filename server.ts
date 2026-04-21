import express from 'express';
import cors from 'cors';
import path from 'path';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Initialize Database
const dbPath = path.join(__dirname, 'database', 'unifest.db');
if (!fs.existsSync(path.join(__dirname, 'database'))) {
    fs.mkdirSync(path.join(__dirname, 'database'));
}

async function initDb() {
    const db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            password TEXT,
            department TEXT,
            year TEXT,
            role TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            description TEXT,
            venue TEXT,
            date TEXT,
            created_by INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(created_by) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS registrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            event_id INTEGER,
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id),
            FOREIGN KEY(event_id) REFERENCES events(id)
        );
    `);

    return db;
}

const dbPromise = initDb();

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password, department, year, role } = req.body;
    const db = await dbPromise;
    try {
        const result = await db.run(
            'INSERT INTO users (name, email, password, department, year, role) VALUES (?, ?, ?, ?, ?, ?)',
            [name, email, password, department, year, role]
        );
        const user = await db.get('SELECT * FROM users WHERE id = ?', [result.lastID]);
        res.status(201).json(user);
    } catch (err: any) {
        if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ message: 'Email already registered' });
        }
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const db = await dbPromise;
    const user = await db.get('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    res.json({ token: `token-${user.id}`, user });
});

// Event Routes
app.get('/api/events', async (req, res) => {
    const db = await dbPromise;
    const events = await db.all('SELECT * FROM events');
    res.json(events);
});

app.post('/api/events', async (req, res) => {
    const { name, description, venue, date } = req.body;
    const db = await dbPromise;
    const result = await db.run(
        'INSERT INTO events (name, description, venue, date, created_by) VALUES (?, ?, ?, ?, ?)',
        [name, description, venue, date, 1] // Mocked admin ID
    );
    const event = await db.get('SELECT * FROM events WHERE id = ?', [result.lastID]);
    res.status(201).json(event);
});

app.delete('/api/events/:id', async (req, res) => {
    const db = await dbPromise;
    await db.run('DELETE FROM events WHERE id = ?', [req.params.id]);
    res.json({ message: 'Deleted' });
});

// Registration Routes
app.get('/api/registrations', async (req, res) => {
    const db = await dbPromise;
    const registrations = await db.all(`
        SELECT r.*, u.name as user_name, u.email as user_email, e.name as event_name 
        FROM registrations r
        JOIN users u ON r.user_id = u.id
        JOIN events e ON r.event_id = e.id
    `);
    res.json(registrations);
});

app.post('/api/registrations', async (req, res) => {
    const { event_id } = req.body;
    const user_id = req.headers.authorization?.split('-')[1] || 1; // Basic mock auth
    const db = await dbPromise;
    const existing = await db.get('SELECT id FROM registrations WHERE user_id = ? AND event_id = ?', [user_id, event_id]);
    if (existing) {
        return res.status(400).json({ message: 'Already registered' });
    }
    const result = await db.run(
        'INSERT INTO registrations (user_id, event_id, status) VALUES (?, ?, ?)',
        [user_id, event_id, 'pending']
    );
    const registration = await db.get('SELECT * FROM registrations WHERE id = ?', [result.lastID]);
    res.status(201).json(registration);
});

app.patch('/api/registrations/:id', async (req, res) => {
    const { status } = req.body;
    const db = await dbPromise;
    await db.run('UPDATE registrations SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Updated' });
});

// Serve frontend
app.use(express.static(path.join(__dirname, 'frontend')));

// Fallback to index.html for SPA if needed (though we use separate pages)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Preview server running at http://0.0.0.0:${PORT}`);
});
