# TaskFlow — Full-Stack To-Do List Web Application

> **Academic Project for Web Application Development (WAD)**  
> Built with **React.js (Custom CSS)**, **Node.js**, **Express.js**, **MongoDB (Mongoose)**, **JWT Authentication**, and **Real-Time Timers**.

---

## 📌 Project Overview

**TaskFlow** is a modern, responsive full-stack task manager designed to help users track, organize, and complete their daily tasks. It features real-time countdown timers, Pomodoro focus integration, past-day historical performance tracking, visual completion stats, and multi-user JWT authentication.

---

## 🛠️ Technology Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend** | **React.js (v18+)** | Functional Components, Custom Hooks, Context API |
| **Styling** | **100% Vanilla CSS** | Custom CSS Design System, CSS Variables, Glassmorphism, Dark/Light Themes *(No Tailwind/Bootstrap)* |
| **Backend** | **Node.js & Express.js** | RESTful API, Route Modularization, Middleware Architecture |
| **Database** | **MongoDB & Mongoose** | Schema Validation, Foreign Key References, Indexing *(with automatic local JSON DB fallback)* |
| **Authentication** | **JWT & bcryptjs** | Salted password hashing (10 rounds), Stateless Bearer Token Authorization |
| **Audio** | **Web Audio API** | Programmatic in-browser sound synthesis for task and timer alerts *(100% offline)* |

---

## 📁 Project Folder Structure

```text
WAD/
├── package.json               # Root scripts
├── README.md                  # Complete documentation & Viva guide
├── server/                    # Node.js + Express Backend
│   ├── .env                   # Environment variables (PORT, MONGO_URI, JWT_SECRET)
│   ├── .env.example           # Template for environment variables
│   ├── package.json           # Backend dependencies
│   ├── server.js              # Express app entry point & middleware setup
│   ├── config/
│   │   └── db.js              # Mongoose DB connection & fallback detection
│   ├── models/
│   │   ├── User.js            # User Mongoose Schema (name, email, password, timestamps)
│   │   └── Task.js            # Task Mongoose Schema (title, priority, category, timers)
│   ├── middleware/
│   │   └── authMiddleware.js  # JWT Bearer Token verification middleware
│   ├── controllers/
│   │   ├── authController.js  # Signup, Login, and Profile handlers
│   │   └── taskController.js  # CRUD, Today, Pending, History, and Stats handlers
│   ├── routes/
│   │   ├── authRoutes.js      # /api/auth routes
│   │   └── taskRoutes.js      # /api/tasks routes
│   └── data/
│       ├── dbAdapter.js       # Unified data access layer (MongoDB & local JSON)
│       └── store.json         # Local JSON persistence store
│
└── client/                    # React.js Frontend (Vite)
    ├── index.html             # HTML5 template with Google Fonts
    ├── package.json           # Frontend dependencies
    ├── vite.config.js         # Vite bundler config with /api proxy
    └── src/
        ├── main.jsx           # React DOM root mounting
        ├── App.jsx            # Routing and global Context Providers
        ├── services/
        │   └── api.js         # Fetch API client with Bearer Token injector
        ├── utils/
        │   └── audio.js       # Web Audio API sound generator
        ├── context/
        │   ├── AuthContext.jsx  # User auth, token, and session state
        │   ├── ThemeContext.jsx # Dark / Light mode switcher state
        │   └── TaskContext.jsx  # Task CRUD, live ticker, and timer calculation
        ├── components/
        │   ├── Navbar.jsx              # Responsive header with navigation & badges
        │   ├── TaskCard.jsx            # Individual task card with timers & actions
        │   ├── TaskForm.jsx            # Modal dialog to create & edit tasks
        │   ├── TaskList.jsx            # Task list container with empty states
        │   ├── StatsWidget.jsx         # Summary metrics & daily progress bar
        │   ├── FilterBar.jsx           # Search input, category, priority & sorting
        │   ├── PomodoroModal.jsx       # Interactive Pomodoro circular focus timer
        │   ├── NotificationBanner.jsx  # Overdue task warning banner
        │   └── ProtectedRoute.jsx      # Unauthenticated route guard
        ├── pages/
        │   ├── LoginPage.jsx     # Sign In page with Demo Auto-fill
        │   ├── SignupPage.jsx    # User registration page
        │   ├── DashboardPage.jsx # Today's tasks + stats + quick add
        │   ├── PendingPage.jsx   # Incomplete tasks dedicated view
        │   ├── HistoryPage.jsx   # Past days browser with date picker & metrics
        │   └── ProfilePage.jsx   # Account details & app preferences
        └── styles/
            ├── index.css      # CSS Variables, Design Tokens, Global Resets
            ├── App.css        # Layout, Navbar, Buttons, Badges, Modals
            ├── Auth.css       # Glassmorphism Login/Signup cards
            ├── Dashboard.css  # Stats grid, Filters, Task cards, Animations
            ├── Timer.css      # Pomodoro circular SVG progress and controls
            └── History.css    # History selector, timeline, and metric boxes
```

---

## 🚀 How to Run the Project Locally

### Prerequisites
- **Node.js** (v18 or newer installed)
- **MongoDB Atlas Connection** — A free MongoDB Atlas Cloud Database URI configured in `server/.env` as `MONGO_URI`.

---

## 🌐 Cloud Deployment Guide (MongoDB Atlas + Render / Vercel)

### Step 1: Create a Free MongoDB Atlas Cloud Database
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up for a free account.
2. Create a new **Free (M0) Cluster**.
3. Navigate to **Security -> Database Access**:
   - Click **Add New Database User**.
   - Set a username and password (e.g. `wad_user` and `secure_password123`).
4. Navigate to **Security -> Network Access**:
   - Click **Add IP Address** -> Select **Allow Access from Anywhere** (`0.0.0.0/0`).
5. Navigate to **Database -> Connect**:
   - Choose **Drivers** (Node.js).
   - Copy your connection string:
     ```text
     mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/wad_todolist?retryWrites=true&w=majority
     ```

---

### Step 2: Deploy Backend to Render / Railway
1. Push your repository to GitHub.
2. Log into [Render](https://render.com) and create a **New Web Service** linked to your repository.
3. Set the Root Directory to `server` (or keep root).
4. Configure Build & Start Commands:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. Add **Environment Variables** in the Render Dashboard:
   - `MONGO_URI`: `mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/wad_todolist?retryWrites=true&w=majority`
   - `PORT`: `5000`
   - `JWT_SECRET`: `your_secure_jwt_secret_key`
   - `CLIENT_URL`: `https://your-frontend-domain.vercel.app`
6. Click **Deploy**. Copy your live backend URL (e.g., `https://wad-todolist-api.onrender.com`).

---

### Step 3: Deploy Frontend to Vercel / Netlify
1. Log into [Vercel](https://vercel.com) and import your GitHub repository.
2. Set Root Directory to `client`.
3. Framework Preset: **Vite**.
4. Configure **Environment Variables**:
   - `VITE_API_URL`: `https://wad-todolist-api.onrender.com`
5. Click **Deploy**.
6. **Verify Data Persistence:** Log into your deployed web app, create/update/delete tasks, refresh the browser, and restart the backend. All data persists permanently in MongoDB Atlas!

---

### Step 4: Local Development Setup
1. Copy `.env.example` to `server/.env` and update `MONGO_URI` with your MongoDB Atlas string or local MongoDB URI.
2. Start backend server:
   ```bash
   cd server && npm install && npm run dev
   ```
3. In a second terminal, start client app:
   ```bash
   cd client && npm install && npm run dev
   ```
4. Open your browser at `http://localhost:5173`.

---

### Quick Demo Credentials (Pre-configured for Viva)
- **Email:** `demo@wad.edu`
- **Password:** `wad123456`
*(You can also click the "Fill Demo Credentials" button on the Login page to autofill instantly!)*

---

## 📡 REST API Documentation

All routes under `/api/tasks/*` require an HTTP header:  
`Authorization: Bearer <your_jwt_token>`

| Method | Endpoint | Description | Request Body | Auth Required |
| :--- | :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/signup` | Register a new user | `{ name, email, password }` | ❌ No |
| `POST` | `/api/auth/login` | Authenticate user & get JWT | `{ email, password }` | ❌ No |
| `GET` | `/api/auth/profile` | Get logged-in user profile | None | ✅ Yes |
| `GET` | `/api/tasks` | Get today's tasks for logged-in user | None (`?date=YYYY-MM-DD` optional) | ✅ Yes |
| `GET` | `/api/tasks/pending` | Get only incomplete tasks for today | None | ✅ Yes |
| `GET` | `/api/tasks/history` | Get past dates summary or specific day | `?date=YYYY-MM-DD` optional | ✅ Yes |
| `GET` | `/api/tasks/stats` | Get metrics (total, done, pending, %) | None | ✅ Yes |
| `POST` | `/api/tasks` | Create a new task | `{ title, description, priority, category, dueDate, dueTime }` | ✅ Yes |
| `PUT` | `/api/tasks/:id` | Update task fields / toggle complete | `{ title, isCompleted, pomodoroMinutes, ... }` | ✅ Yes |
| `DELETE` | `/api/tasks/:id` | Delete a task | None | ✅ Yes |
| `GET` | `/api/health` | Server health check | None | ❌ No |

---

## 🎓 Academic Viva & Presentation Guide

### 1. What is the Authentication Architecture?
- **Stateless JWT Tokens:** When a user logs in via `POST /api/auth/login`, the server verifies the password using `bcrypt.compare()`.
- Upon verification, the server generates a signed JSON Web Token with a payload `{ id: user._id }` signed by `process.env.JWT_SECRET`.
- The client stores this token in `localStorage` and attaches it to every subsequent request in the `Authorization: Bearer <token>` header.
- The `authMiddleware.js` verifies the token cryptographically on every protected endpoint.

### 2. How is Multi-Tenancy / Data Security Handled?
- Every task document in the database has a `userId` field referencing the `User` document.
- In `taskController.js`, all database queries enforce `{ userId: req.user._id }`. This guarantees that **User A can never read, update, or delete User B's tasks**.

### 3. How do the Real-Time Timers and Overdue Detection Work?
- `TaskContext.jsx` runs a 30-second interval ticker that updates a `currentTime` React state.
- The `getTaskTimerStatus()` helper calculates the difference between `dueDate + dueTime` and `currentTime`.
- If the current time surpasses the task's due time and `isCompleted === false`, the task is dynamically tagged with an **"Overdue"** badge, and a notification banner appears.

### 4. How is the Pomodoro Focus Timer Implemented?
- The Pomodoro technique (25 min focus / 5 min short break / 15 min rest) is rendered with a dynamic SVG circular progress ring using `strokeDashoffset`.
- When the timer completes, the Web Audio API generates a pleasant chime without needing external MP3 audio files.
- Completed focus minutes are sent to the backend and stored in `pomodoroMinutes` on the task.

### 5. Why Custom CSS instead of Tailwind or Bootstrap?
- For academic Web Application Development (WAD), writing **100% custom CSS** demonstrates mastery of:
  - **CSS Custom Properties (Variables):** Used for instant dark/light theme switching (`--bg-app`, `--text-main`, etc.).
  - **Flexbox & CSS Grid:** Responsive multi-column layouts without frameworks.
  - **Glassmorphism & Micro-animations:** Modern visual polish with `backdrop-filter: blur()`, hover transitions, and keyframe animations.
