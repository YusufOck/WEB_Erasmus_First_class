# 🎓 Erasmus Web Development Project

**Author:** Mehmet Yusuf Ocak  
**Course/Goal:** Erasmus Selection Web Development Task 

## 📖 Project Overview
This project is a Full-Stack web application developed to fulfill the 5-stage requirement for an Erasmus web development exam. It strictly follows the 9 essential criteria requested by the instructor (Design, UX, Navigation, Content, Essential Info, Multilanguage, Mobile, Speed, Content Update). 

The application serves as a **Personal Portfolio** and a **Reading List Manager**, powered by a local REST API and integrated with external data sources.

## 🚀 Features & Requirements Fulfilled
1. **Design:** Premium *Glassmorphism* aesthetics with smooth gradients and hover animations.
2. **UX:** Client-side form validation, loading spinners, and feedback messages.
3. **Navigation:** Sticky top navigation bar with smooth scrolling to functional sections.
4. **Multilanguage (TR/EN):** Instant localization toggle between English and Turkish. State is preserved via `localStorage`.
5. **Theme Switcher:** Day/Night mode toggle that dynamically adjusts UI color variables.
6. **Mobile Responsive:** Built with Flexbox & CSS Grid, adapting flawlessly to all screen sizes.
7. **External API (Stage 2):** Asynchronous `fetch` integration with **Open Library API** to search and discover books dynamically.
8. **Internal REST API (Stage 3):** Custom Node.js & Express API for database operations.
9. **Speed & Updates:** Vanilla JavaScript on the frontend ensures lightning-fast DOM manipulation and asynchronous content updates without refreshing the page.

## 🛠️ Tech Stack
- **Frontend:** HTML5, CSS3 (Glassmorphism), Vanilla JavaScript (ES6)
- **Backend:** Node.js, Express.js, CORS
- **Database:** SQLite3

## 🔌 REST API Endpoints (Local Backend)
The backend runs on `http://localhost:3000` and provides the following full CRUD endpoints:

| Method | Endpoint | Description | Payload (JSON) | Status Codes |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/books` | Retrieves all books in the reading list. | *None* | 200 (OK), 500 (Error) |
| **POST** | `/api/books` | Adds a new book to the database. | `{ "title": "...", "author": "..." }` | 201 (Created), 400 (Bad Request) |
| **PUT** | `/api/books/:id` | Updates an existing book's data. | `{ "title": "...", "author": "...", "status": "..." }` | 200 (OK), 404 (Not Found) |
| **DELETE**| `/api/books/:id` | Deletes a book from the reading list. | *None* | 200 (OK), 404 (Not Found) |

## ⚙️ How to Run Locally

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation Steps
1. Navigate to the project root directory (`Web_project_erasmus`) via terminal.
2. Install the required Node dependencies:
   ```bash
   npm install
   ```
3. Start the Express server:
   ```bash
   node server.js
   ```
4. Open your web browser and navigate to:
   ```text
   http://localhost:3000
   ```

*(Note: The SQLite database file `reading_list.db` will be automatically generated upon the first run.)*

## 📝 About
Developed by Mehmet Yusuf Ocak to demonstrate proficiency in Full-Stack Web Development, API Integration, and UI/UX Design principles.
