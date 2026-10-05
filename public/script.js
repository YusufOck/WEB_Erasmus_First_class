document.addEventListener('DOMContentLoaded', () => {
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
            titleError.textContent = 'Book title cannot be empty.';
            isValid = false;
        }

        if (!authorInput.value.trim()) {
            authorError.textContent = 'Author name cannot be empty.';
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
                    formFeedback.textContent = 'Book successfully added to the list!';
                    formFeedback.classList.add('success');
                    form.reset();
                    fetchReadingList();
                } else {
                    throw new Error('Server error');
                }
            } catch (err) {
                formFeedback.textContent = 'Error: Failed to add book.';
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
                readingListContainer.innerHTML = '<p style="color: var(--text-secondary);">Your reading list is currently empty.</p>';
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
                    <button class="delete-btn" onclick="deleteBook(${book.id})">Delete</button>
                `;
                readingListContainer.appendChild(bookDiv);
            });
        } catch (error) {
            readingListContainer.innerHTML = '<p class="error-text">An error occurred while loading the list.</p>';
        }
    }

    window.deleteBook = async function(id) {
        if(confirm('Are you sure you want to delete this book?')) {
            try {
                const response = await fetch(`/api/books/${id}`, { method: 'DELETE' });
                if(response.ok) {
                    fetchReadingList();
                } else {
                    alert('Deletion failed.');
                }
            } catch (error) {
                alert('An error occurred during deletion.');
            }
        }
    };

    // Initial load
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

        // Reset UI
        searchResults.innerHTML = '';
        apiError.classList.add('hidden');
        loadingIndicator.classList.remove('hidden');

        try {
            // Fetch Request
            const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=4`);
            
            if (!response.ok) {
                throw new Error('API request failed. Status: ' + response.status);
            }

            const data = await response.json();
            loadingIndicator.classList.add('hidden');

            if (data.docs.length === 0) {
                searchResults.innerHTML = '<p style="color: var(--text-secondary);">No results found.</p>';
                return;
            }

            // Render Results
            data.docs.forEach(book => {
                const card = document.createElement('div');
                card.className = 'api-book-card';
                
                const coverUrl = book.cover_i 
                    ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` 
                    : 'https://via.placeholder.com/150x200/1e293b/94a3b8?text=No+Cover';

                const authorName = book.author_name ? book.author_name[0] : 'Unknown Author';

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
            apiError.textContent = 'An error occurred: ' + error.message;
            apiError.classList.remove('hidden');
        }
    });
});
