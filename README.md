# Ice Berg - Media Deep Lore Search Engine

An intelligent tool that searches for movies, TV shows, music, games, or books and generates AI-powered dossiers of obscure facts, hidden easter eggs, production secrets, and forgotten history. Instead of surface-level Wikipedia summaries, it digs into Reddit threads, Gearspace forums, Discogs comments, and niche interviews to unearth "bottom-of-the-iceberg" content.

---

## Features

- **Media Deep Lore Search** - Search across 5 media types (movies, TV shows, music, games, books) with type-specific AI prompts
- **AI-Generated Dossiers** - Uses Groq (Llama 3.3 70B) to synthesize raw search data into structured, fact-heavy reports
- **Music-Specific Lore** - Dedicated prompt tuned for production geekery, gear models, Reddit rabbit holes, and untold stories
- **Trending Searches** - Top searched topics tracked via Redis sorted sets with image thumbnails, type badges, and search counts
- **Personal Library** - Save dossiers to your library for later viewing (JWT-authenticated)
- **JWT Authentication** - Register and login to access library features
- **Responsive Design** - Tailwind CSS-powered dark theme UI

---

## Tech Stack

### Backend
- **Runtime:** Node.js, Express
- **Database:** MongoDB with Mongoose ODM
- **Cache:** Redis Cloud (sorted sets for trending, key-value for summaries)
- **AI/LLM:** Groq SDK (Llama 3.3 70B via Groq Cloud)
- **Search:** SERPAPI (Google search for deep-cut content)
- **Media APIs:** TMDB (movies/TV), iTunes Search (music), RAWG (games), OpenLibrary (books)
- **Auth:** JWT, bcryptjs, cookie-parser
- **Scheduling:** node-cron (monthly trending reset)

### Frontend
- **Framework:** React 18 with Vite
- **Routing:** React Router v6
- **HTTP Client:** Axios with JWT interceptor
- **Markdown Rendering:** react-markdown
- **Styling:** Tailwind CSS

---

## Prerequisites

- Node.js (v16+) and npm
- MongoDB (local or Atlas)
- Redis (local or cloud instance)
- API keys for external services (see below)

---

## API Keys Required

| Service | Purpose | Sign Up |
|---------|---------|---------|
| Groq | LLM inference for dossier generation | https://console.groq.com |
| SERPAPI | Google search scraping | https://serpapi.com |
| TMDB | Movie/TV metadata and posters | https://www.themoviedb.org/settings/api |
| RAWG | Game metadata and images | https://rawg.io/apidocs |
| MongoDB Atlas | Database | https://www.mongodb.com/atlas |
| Redis Cloud | Trending cache | https://redis.com/try-free |

---

## Backend Setup

### 1. Navigate and install dependencies
```bash
cd server
npm install
```

### 2. Configure environment
Create a `.env` file in `server/`:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key

GROQ_API_KEY=your_groq_api_key
SERPAPI_API_KEY=your_serpapi_key
TMDB_API_KEY=your_tmdb_api_key
RAWG_API_KEY=your_rawg_api_key

REDIS_URL=your_redis_connection_string
```

### 3. Start the backend server
```bash
npm run dev
```
The server will start at `http://localhost:5000`.

---

## Frontend Setup

### 1. Navigate and install dependencies
```bash
cd client
npm install
```

### 2. Configure environment
Create a `.env` file in `client/`:
```env
VITE_API_BASE_URL=http://localhost:5000
```

### 3. Start the frontend dev server
```bash
npm run dev
```
The client will start at `http://localhost:5173`.

---

## Usage

1. Open the frontend URL (usually `http://localhost:5173`).
2. Select a media type from the dropdown (Movie, TV Show, Music, Game, Book).
3. Enter a search query (e.g., "Aphex Twin", "Inception", "Elden Ring").
4. View the AI-generated deep-lore dossier with sections like Production Geekery, Untold Stories, Hidden Easter Eggs, Cut Content, and Legal Battles.
5. Click "Save to Library" (requires login) to archive the dossier.
6. Browse your saved dossiers from the Library page.
7. Explore trending searches on the home page.

---

## Project Structure

```
caek/
├── server/
│   ├── config/
│   │   ├── connectDB.js          - MongoDB connection
│   │   └── connectRedis.js       - Redis connection (unused, ES module)
│   ├── controllers/
│   │   ├── authController.js     - Register/login/logout
│   │   ├── libraryController.js  - CRUD for saved dossiers
│   │   └── mediaController.js    - Search and trending handlers
│   ├── middlewares/
│   │   ├── authMiddleware.js     - JWT verification
│   │   └── errorHandler.js       - Global error handler
│   ├── models/
│   │   ├── User.js               - User schema
│   │   └── MediaLibrary.js       - Saved dossier schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── libraryRoutes.js
│   │   └── mediaRoutes.js
│   ├── services/
│   │   ├── simpleDossierService.js  - Core orchestrator (search -> AI -> output)
│   │   ├── groqService.js           - LLM text extraction
│   │   ├── serpApiservice.js        - Google search via SERPAPI
│   │   ├── mediaService.js          - TMDB, iTunes, RAWG, OpenLibrary wrappers
│   │   └── redisService.js          - Trending tracking (sorted sets + key-value)
│   ├── cron/
│   │   └── decayTrending.js         - Monthly trending reset job
│   └── server.js                    - Express entry point
├── client/
│   └── src/
│       ├── api/
│       │   └── axiosClient.js       - Axios instance with JWT interceptor
│       ├── components/
│       │   ├── common/Spinner.jsx
│       │   ├── layout/Navbar.jsx
│       │   ├── library/SavedMediaCard.jsx
│       │   └── media/
│       │       ├── MediaSearchBar.jsx
│       │       └── MediaResultCard.jsx
│       ├── context/AuthContext.jsx
│       ├── pages/
│       │   ├── Media.jsx
│       │   ├── Library.jsx
│       │   ├── Login.jsx
│       │   └── Register.jsx
│       └── App.jsx
└── README.md
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive JWT cookie |
| POST | `/api/auth/logout` | Clear auth cookie |
| GET | `/api/auth/me` | Get current user info |

### Media Search
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/media/core-identity` | Get basic metadata (poster, rating, genre) |
| POST | `/api/media/dossier-simple` | Generate deep-lore dossier |
| GET | `/api/media/trending` | Get top 10 trending searches |

### Library (authenticated)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/library/media` | Get all saved dossiers |
| POST | `/api/library/media` | Save a new dossier |
| GET | `/api/library/media/check/:title` | Check if title is already saved |
| GET | `/api/library/media/:id` | Get single dossier |
| DELETE | `/api/library/media/:id` | Delete a saved dossier |

---

## How It Works

1. User selects a media type and enters a search query.
2. The backend builds a type-specific search query targeting niche sources (Reddit, Gearspace, Discogs, fan wikis, obscure interviews).
3. SERPAPI performs a Google search and returns raw text + images.
4. The raw text is injected into a crafted prompt (generic deep-lore prompt or music-specific prompt).
5. Groq's Llama 3.3 70B generates a structured dossier with concrete facts.
6. The result is returned as Markdown and rendered on the frontend.
7. Trending searches are tracked via Redis sorted sets (`ZINCRBY`).

---

## License

MIT# iceberg
