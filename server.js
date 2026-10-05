const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
// Statik dosyaları (HTML, CSS, JS) sun
app.use(express.static(path.join(__dirname, 'public')));

// --- REST API ENDPOINT'LERİ (AŞAMA 3) ---

// GET: Tüm kitapları getir
app.get('/api/books', (req, res) => {
    db.all('SELECT * FROM books', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// POST: Yeni kitap ekle
app.post('/api/books', (req, res) => {
    const { title, author, status } = req.body;
    if (!title || !author) {
        return res.status(400).json({ error: 'Başlık ve yazar zorunludur.' });
    }
    const stmt = db.prepare('INSERT INTO books (title, author, status) VALUES (?, ?, ?)');
    stmt.run([title, author, status || 'Okunmadı'], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: this.lastID, title, author, status: status || 'Okunmadı' });
    });
});

// PUT: Kitap durumunu güncelle
app.put('/api/books/:id', (req, res) => {
    const { title, author, status } = req.body;
    db.run(
        'UPDATE books SET title = ?, author = ?, status = ? WHERE id = ?',
        [title, author, status, req.params.id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ error: 'Kitap bulunamadı.' });
            res.json({ message: 'Kitap güncellendi.' });
        }
    );
});

// DELETE: Kitap sil
app.delete('/api/books/:id', (req, res) => {
    db.run('DELETE FROM books WHERE id = ?', req.params.id, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Kitap bulunamadı.' });
        res.json({ message: 'Kitap silindi.' });
    });
});

app.listen(PORT, () => {
    console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor...`);
});
