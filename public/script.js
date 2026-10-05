document.addEventListener('DOMContentLoaded', () => {
    // --- DICTIONARY ---
    const i18n = {
        en: {
            nav_profile: "Profile",
            nav_add: "Add Book",
            nav_list: "Reading List",
            nav_search: "Search API",
            subtitle: "Computer Engineering Student | AI & Robotics Researcher",
            skills_title: "Skills",
            add_book_title: "Add Book to Reading List",
            book_title_label: "Book Title",
            book_title_placeholder: "e.g. 1984",
            author_label: "Author",
            author_placeholder: "e.g. George Orwell",
            btn_add_list: "Add to List",
            my_list_title: "My Reading List (API Connected)",
            loading_data: "Loading data...",
            discover_title: "Open Library - Discover Books",
            search_placeholder: "Search by book title (e.g. Lord of the Rings)",
            btn_search_api: "Search API",
            searching_wait: "Searching, please wait...",
            error_title_empty: "Book title cannot be empty.",
            error_author_empty: "Author name cannot be empty.",
            success_add: "Book successfully added to the list!",
            error_server: "Server error",
            error_add_failed: "Error: Failed to add book.",
            empty_list: "Your reading list is currently empty.",
            error_load_list: "An error occurred while loading the list.",
            btn_delete: "Delete",
            confirm_delete: "Are you sure you want to delete this book?",
            delete_failed: "Deletion failed.",
            delete_error: "An error occurred during deletion.",
            no_results: "No results found.",
            unknown_author: "Unknown Author",
            error_api_req: "API request failed. Status: ",
            error_api_occurred: "An error occurred: "
        },
        tr: {
            nav_profile: "Profil",
            nav_add: "Kitap Ekle",
            nav_list: "Okuma Listesi",
            nav_search: "API'de Ara",
            subtitle: "Bilgisayar Mühendisliği Öğrencisi | Yapay Zeka ve Robotik Araştırmacısı",
            skills_title: "Yetenekler",
            add_book_title: "Okuma Listesine Kitap Ekle",
            book_title_label: "Kitap Başlığı",
            book_title_placeholder: "Örn: 1984",
            author_label: "Yazar",
            author_placeholder: "Örn: George Orwell",
            btn_add_list: "Listeye Ekle",
            my_list_title: "Okuma Listem (API Bağlantılı)",
            loading_data: "Veriler yükleniyor...",
            discover_title: "Open Library - Kitap Keşfet",
            search_placeholder: "Kitap ismi ile ara (Örn: Lord of the Rings)",
            btn_search_api: "API'de Ara",
            searching_wait: "Arama yapılıyor, lütfen bekleyin...",
            error_title_empty: "Kitap başlığı boş bırakılamaz.",
            error_author_empty: "Yazar ismi boş bırakılamaz.",
            success_add: "Kitap başarıyla listeye eklendi!",
            error_server: "Sunucu hatası",
            error_add_failed: "Hata: Kitap eklenemedi.",
            empty_list: "Listeniz şu an boş.",
            error_load_list: "Liste yüklenirken bir hata oluştu.",
            btn_delete: "Sil",
            confirm_delete: "Silmek istediğinize emin misiniz?",
            delete_failed: "Silme işlemi başarısız oldu.",
            delete_error: "Silme işlemi sırasında hata oluştu.",
            no_results: "Sonuç bulunamadı.",
            unknown_author: "Bilinmeyen Yazar",
            error_api_req: "API isteği başarısız oldu. Durum: ",
            error_api_occurred: "Bir hata oluştu: "
        }
    };

    let currentLang = localStorage.getItem('lang') || 'en';
    const langBtn = document.getElementById('langToggle');

    function updateLanguage() {
        // Toggle btn text indicates the *other* language you can switch to
        langBtn.textContent = currentLang === 'en' ? 'TR' : 'EN';
        document.documentElement.lang = currentLang;

        // Update static DOM elements
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (i18n[currentLang][key]) {
                el.textContent = i18n[currentLang][key];
            }
        });

        // Update placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (i18n[currentLang][key]) {
                el.placeholder = i18n[currentLang][key];
            }
        });
        
        // Re-render dynamic list if needed
        fetchReadingList();
    }

    langBtn.addEventListener('click', () => {
        currentLang = currentLang === 'en' ? 'tr' : 'en';
        localStorage.setItem('lang', currentLang);
        updateLanguage();
    });

    // --- THEME TOGGLE LOGIC ---
    const toggleSwitch = document.getElementById('checkbox');
    const currentTheme = localStorage.getItem('theme');

    if (currentTheme) {
        document.documentElement.setAttribute('data-theme', currentTheme);
        if (currentTheme === 'light') {
            toggleSwitch.checked = true;
        }
    }

    toggleSwitch.addEventListener('change', function(e) {
        if (e.target.checked) {
            document.documentElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        }    
    });

    // Helper to get translated string
    function t(key) {
        return i18n[currentLang][key] || key;
    }

    // --- STAGE 1: FORM VALIDATION & STAGE 3: BACKEND POST ---
    const form = document.getElementById('addBookForm');
    const titleInput = document.getElementById('bookTitle');
    const authorInput = document.getElementById('bookAuthor');
    const titleError = document.getElementById('titleError');
    const authorError = document.getElementById('authorError');
    const formFeedback = document.getElementById('formFeedback');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        titleError.textContent = '';
        authorError.textContent = '';
        formFeedback.textContent = '';
        formFeedback.className = 'feedback-msg';

        let isValid = true;

        if (!titleInput.value.trim()) {
            titleError.textContent = t('error_title_empty');
            isValid = false;
        }

        if (!authorInput.value.trim()) {
            authorError.textContent = t('error_author_empty');
            isValid = false;
        }

        if (isValid) {
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
                    formFeedback.textContent = t('success_add');
                    formFeedback.classList.add('success');
                    form.reset();
                    fetchReadingList();
                } else {
                    throw new Error(t('error_server'));
                }
            } catch (err) {
                formFeedback.textContent = t('error_add_failed');
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
                readingListContainer.innerHTML = `<p style="color: var(--text-secondary);">${t('empty_list')}</p>`;
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
                    <button class="delete-btn" onclick="deleteBook(${book.id})">${t('btn_delete')}</button>
                `;
                readingListContainer.appendChild(bookDiv);
            });
        } catch (error) {
            readingListContainer.innerHTML = `<p class="error-text">${t('error_load_list')}</p>`;
        }
    }

    window.deleteBook = async function(id) {
        if(confirm(t('confirm_delete'))) {
            try {
                const response = await fetch(`/api/books/${id}`, { method: 'DELETE' });
                if(response.ok) {
                    fetchReadingList();
                } else {
                    alert(t('delete_failed'));
                }
            } catch (error) {
                alert(t('delete_error'));
            }
        }
    };

    // --- STAGE 2: OPEN LIBRARY API USAGE (SEARCH) ---
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchQuery');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const apiError = document.getElementById('apiError');
    const searchResults = document.getElementById('searchResults');

    searchBtn.addEventListener('click', async () => {
        const query = searchInput.value.trim();
        if (!query) return;

        searchResults.innerHTML = '';
        apiError.classList.add('hidden');
        loadingIndicator.classList.remove('hidden');

        try {
            const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=4`);
            
            if (!response.ok) {
                throw new Error(t('error_api_req') + response.status);
            }

            const data = await response.json();
            loadingIndicator.classList.add('hidden');

            if (data.docs.length === 0) {
                searchResults.innerHTML = `<p style="color: var(--text-secondary);">${t('no_results')}</p>`;
                return;
            }

            data.docs.forEach(book => {
                const card = document.createElement('div');
                card.className = 'api-book-card';
                
                const coverUrl = book.cover_i 
                    ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` 
                    : 'https://via.placeholder.com/150x200/1e293b/94a3b8?text=No+Cover';

                const authorName = book.author_name ? book.author_name[0] : t('unknown_author');

                card.innerHTML = `
                    <img src="${coverUrl}" alt="${book.title} Cover">
                    <div>
                        <h4 style="color:var(--text-primary); font-size:1rem; margin-bottom:0.3rem">${book.title}</h4>
                        <p style="color:var(--text-secondary); font-size:0.85rem">${authorName}</p>
                    </div>
                `;
                searchResults.appendChild(card);
            });

        } catch (error) {
            loadingIndicator.classList.add('hidden');
            apiError.textContent = t('error_api_occurred') + error.message;
            apiError.classList.remove('hidden');
        }
    });

    // Initialize translations & fetch list
    updateLanguage();
});
