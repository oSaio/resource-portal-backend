const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serves files from public folder

const db = new Database('database.db');

// Create database tables
db.exec(`
  CREATE TABLE IF NOT EXISTS resources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT DEFAULT 'Available'
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    resource_id INTEGER,
    user_name TEXT NOT NULL,
    booking_date TEXT NOT NULL,
    status TEXT DEFAULT 'Pending'
  );
`);

// Seed default items if empty
const count = db.prepare('SELECT count(*) as count FROM resources').get().count;
if (count === 0) {
  const insert = db.prepare('INSERT INTO resources (name, category) VALUES (?, ?)');
  insert.run('Dell XPS 15 Laptop', 'Laptops');
  insert.run('Meta Quest 3 VR Headset', 'VR/AR Equipment');
  insert.run('iPad Pro 12.9"', 'Tablets');
  insert.run('Study Room 3B', 'Rooms');
}

// Routes
app.get('/api/resources', (req, res) => {
  const resources = db.prepare('SELECT * FROM resources').all();
  res.json(resources);
});

app.post('/api/bookings', (req, res) => {
  const { resource_id, user_name, booking_date } = req.body;

  if (!resource_id || !user_name || !booking_date) {
    return res.status(400).json({ error: 'Please provide all required fields.' });
  }

  const stmt = db.prepare(
    'INSERT INTO bookings (resource_id, user_name, booking_date) VALUES (?, ?, ?)'
  );
  const result = stmt.run(resource_id, user_name, booking_date);

  res.status(201).json({ message: 'Booking requested!', bookingId: result.lastInsertRowid });
});

app.get('/api/bookings', (req, res) => {
  const bookings = db.prepare(`
    SELECT bookings.id, bookings.user_name, bookings.booking_date, bookings.status, resources.name as resource_name
    FROM bookings
    JOIN resources ON bookings.resource_id = resources.id
  `).all();
  res.json(bookings);
});

// DELETE a booking by ID
app.delete('/api/bookings/:id', (req, res) => {
  const { id } = req.params;
  const stmt = db.prepare('DELETE FROM bookings WHERE id = ?');
  const result = stmt.run(id);

  if (result.changes > 0) {
    res.json({ message: 'Booking deleted successfully.' });
  } else {
    res.status(404).json({ error: 'Booking not found.' });
  }
});

// DELETE a resource/item by ID
app.delete('/api/resources/:id', (req, res) => {
  const { id } = req.params;

  // Optional: Clean up associated bookings first
  db.prepare('DELETE FROM bookings WHERE resource_id = ?').run(id);

  const stmt = db.prepare('DELETE FROM resources WHERE id = ?');
  const result = stmt.run(id);

  if (result.changes > 0) {
    res.json({ message: 'Resource deleted successfully.' });
  } else {
    res.status(404).json({ error: 'Resource not found.' });
  }
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});