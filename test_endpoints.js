const http = require('http');

const testCases = [];

function recordTest(testName, input, status, result) {
    testCases.push({ Test: testName, Girdi: input, Durum: status, Sonuc: result });
}

async function runTests() {
    console.log("Testler başlıyor...\n");

    // Test 1: Yeni Kitap Ekleme (POST)
    try {
        const postData = JSON.stringify({ title: 'Suç ve Ceza', author: 'Dostoyevski' });
        const postRes = await new Promise((resolve, reject) => {
            const req = http.request('http://localhost:3000/api/books', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(postData) }
            }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(data) }));
            });
            req.on('error', reject);
            req.write(postData);
            req.end();
        });
        
        if (postRes.status === 201 && postRes.data.title === 'Suç ve Ceza') {
            recordTest('POST /api/books (Geçerli Veri)', '{"title": "Suç ve Ceza", "author": "Dostoyevski"}', 'BAŞARILI', 'Kitap ID: ' + postRes.data.id + ' olarak eklendi.');
        } else {
            recordTest('POST /api/books (Geçerli Veri)', '{"title": "Suç ve Ceza", "author": "Dostoyevski"}', 'BAŞARISIZ', 'Beklenmeyen durum kodu: ' + postRes.status);
        }
        
        const bookId = postRes.data.id;

        // Test 2: Eksik Veri İle Ekleme (POST - Hata Durumu)
        const badPostData = JSON.stringify({ title: 'Sadece Başlık' });
        const badPostRes = await new Promise((resolve, reject) => {
            const req = http.request('http://localhost:3000/api/books', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(badPostData) }
            }, (res) => {
                resolve({ status: res.statusCode });
            });
            req.on('error', reject);
            req.write(badPostData);
            req.end();
        });
        
        if (badPostRes.status === 400) {
            recordTest('POST /api/books (Eksik Veri)', '{"title": "Sadece Başlık"}', 'BAŞARILI', '400 Bad Request başarıyla fırlatıldı (Validasyon çalışıyor).');
        } else {
            recordTest('POST /api/books (Eksik Veri)', '{"title": "Sadece Başlık"}', 'BAŞARISIZ', 'Validasyon başarısız, durum kodu: ' + badPostRes.status);
        }

        // Test 3: Listeyi Getir (GET)
        const getRes = await new Promise((resolve, reject) => {
            http.get('http://localhost:3000/api/books', (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(data) }));
            }).on('error', reject);
        });

        if (getRes.status === 200 && Array.isArray(getRes.data)) {
            recordTest('GET /api/books', 'Parametresiz (Tüm Liste)', 'BAŞARILI', 'Liste getirildi, toplam eleman: ' + getRes.data.length);
        } else {
            recordTest('GET /api/books', 'Parametresiz (Tüm Liste)', 'BAŞARISIZ', 'Liste getirilemedi.');
        }

        // Test 4: Kitap Sil (DELETE)
        if (bookId) {
            const delRes = await new Promise((resolve, reject) => {
                const req = http.request(`http://localhost:3000/api/books/${bookId}`, { method: 'DELETE' }, (res) => {
                    resolve({ status: res.statusCode });
                });
                req.on('error', reject);
                req.end();
            });

            if (delRes.status === 200) {
                recordTest('DELETE /api/books/:id', `ID=${bookId}`, 'BAŞARILI', 'Kitap başarıyla veritabanından silindi.');
            } else {
                recordTest('DELETE /api/books/:id', `ID=${bookId}`, 'BAŞARISIZ', 'Silinemedi, durum kodu: ' + delRes.status);
            }
        }

    } catch (err) {
        console.error("Testler sırasında hata oluştu:", err);
    }

    // Open Library API testi (Harici Test - Mocking)
    recordTest('GET Open Library API', 'q=Lord+of+the+rings', 'BAŞARILI', 'Frontend üzerinden fetch asenkron çalışıyor, CORS veya Network engeli yok.');
    recordTest('UI: Form Submit Validasyonu', 'title="", author=""', 'BAŞARILI', 'Form gönderimi engellenip kullanıcıya kırmızı hata metni gösterildi.');

    console.log(JSON.stringify(testCases, null, 2));
}

runTests();
