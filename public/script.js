document.addEventListener('DOMContentLoaded', () => {
    // --- STAGE 1: FORM VALIDATION & STAGE 3: BACKEND POST ---
    const form = document.getElementById('addBookForm');
    const titleInput = document.getElementById('bookTitle');
    const authorInput = document.getElementById('bookAuthor');
    const titleError = document.getElementById('titleError');
    const authorError = document.getElementById('authorError');
    const formFeedback = document.getElementById('formFeedback');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Reset errors
        titleError.textContent = '';
        authorError.textContent = '';
        formFeedback.textContent = '';
        formFeedback.className = 'feedback-msg';

        let isValid = true;

        if (!titleInput.value.trim()) {
            titleError.textContent = 'Kitap başlığı boş bırakılamaz.';
            isValid = false;
        }

        if (!authorInput.value.trim()) {
            authorError.textContent = 'Yazar ismi boş bırakılamaz.';
            isValid = false;
        }

        if (isValid) {
            // Stage 3: POST to Backend API
            try {
                const response = await fetch('/api/books', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: titleInput.value.trim(),
                        author: authorInput.value.trim()
                    })
                });

                if (response.ok) {
                    formFeedback.textContent = 'Kitap başarıyla listeye eklendi!';
                    formFeedback.classList.add('success');
                    form.reset();
                    fetchReadingList(); // Listeyi yenile
                } else {
                    throw new Error('Sunucu hatası');
                }
            } catch (err) {
                formFeedback.textContent = 'Hata: Kitap eklenemedi.';
                formFeedback.classList.add('error');
            }
        }
    });

    // --- STAGE 3: FETCH READING LIST FROM BACKEND (GET & DELETE) ---
    const readingListContainer = document.getElementById('readingList');

    async function fetchReadingList() {
        try {
            const response = await fetch('/api/books');
            const data = await response.json();
            
            readingListContainer.innerHTML = '';
            
            if (data.length === 0) {
                readingListContainer.innerHTML = '<p style="color: #94a3b8;">Listeniz şu an boş.</p>';
                return;
            }

            data.forEach(book => {
                const bookDiv = document.createElement('div');
                bookDiv.className = 'book-item';
                bookDiv.innerHTML = `
                    <div class="book-item-info">
                        <strong>${book.title}</strong>
                        <span>${book.author}</span>
                    </div>
                    <button class="delete-btn" onclick="deleteBook(${book.id})">Sil</button>
                `;
                readingListContainer.appendChild(bookDiv);
            });
        } catch (error) {
            readingListContainer.innerHTML = '<p class="error-text">Liste yüklenirken bir hata oluştu.</p>';
        }
    }

    // Silme işlemi globale alınıyor HTML'den çağrılabilmesi için
    window.deleteBook = async function(id) {
        if(confirm('Bu kitabı silmek istediğinize emin misiniz?')) {
            try {
                const response = await fetch(`/api/books/${id}`, { method: 'DELETE' });
                if(response.ok) {
                    fetchReadingList();
                } else {
                    alert('Silme işlemi başarısız oldu.');
                }
            } catch (error) {
                alert('Silme işlemi sırasında hata oluştu.');
            }
        }
    };

    // Sayfa yüklendiğinde listeyi çek
    fetchReadingList();

    // --- STAGE 2: OPEN LIBRARY API USAGE (SEARCH) ---
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchQuery');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const apiError = document.getElementById('apiError');
    const searchResults = document.getElementById('searchResults');

    searchBtn.addEventListener('click', async () => {
        const query = searchInput.value.trim();
        if (!query) return;

        // Arayüzü resetle
        searchResults.innerHTML = '';
        apiError.classList.add('hidden');
        loadingIndicator.classList.remove('hidden');

        try {
            // Open Library API'ye Fetch İsteği
            const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=4`);
            
            if (!response.ok) {
                throw new Error('API isteği başarısız oldu. Durum kodu: ' + response.status);
            }

            const data = await response.json();
            loadingIndicator.classList.add('hidden');

            if (data.docs.length === 0) {
                searchResults.innerHTML = '<p style="color:#94a3b8;">Sonuç bulunamadı.</p>';
                return;
            }

            // Gelen verileri ekrana çiz
            data.docs.forEach(book => {
                const card = document.createElement('div');
                card.className = 'api-book-card';
                
                const coverUrl = book.cover_i 
                    ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` 
                    : 'https://via.placeholder.com/150x200/1e293b/94a3b8?text=Kapak+Yok';

                const authorName = book.author_name ? book.author_name[0] : 'Bilinmeyen Yazar';

                card.innerHTML = `
                    <img src="${coverUrl}" alt="${book.title} Cover">
                    <h4 style="color:#f8fafc; font-size:1rem; margin-bottom:0.3rem">${book.title}</h4>
                    <p style="color:#94a3b8; font-size:0.85rem">${authorName}</p>
                `;
                searchResults.appendChild(card);
            });

        } catch (error) {
            loadingIndicator.classList.add('hidden');
            apiError.textContent = 'Bir hata oluştu: ' + error.message;
            apiError.classList.remove('hidden');
        }
    });
});
