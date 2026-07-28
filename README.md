# Kanban Board — Task & Team Workload Tracker (POC)

Kanban Board is a full-stack, Kanban-style task management POC built with a **Node.js/Express + Sequelize (MySQL)** backend and a **React + Zustand** frontend. It features a responsive, light-theme interface designed for tracking tasks, assigning roles, and visualizing team workloads through database-level aggregates.

---

## Technical Stack & Architectural Decisions

### 1. Backend: Node.js, Express, & Sequelize ORM
- **Express.js:** Lightweight and unopinionated framework, allowing us to implement a clean directory structures (`controllers`, `models`, `routes`, `middleware`).
- **Sequelize ORM:** Simplifies interacting with MySQL, enabling strict data models, relational database associations (`User hasMany Tasks`), and secure parameterized query patterns.
- **MySQL Database:** Provides robust, transaction-safe relational storage. It allows us to write database-level grouping (`GROUP BY`) queries for generating high-performance team reports.

### 2. Frontend: React, Zustand, & Vanilla CSS
- **React (Vite):** A fast build environment delivering performance and hot-module replacement (HMR) for dynamic UI updates.
- **Zustand Store:** Our centralized state orchestrator. It manages user sessions, filters, and records, automatically attaching JWT headers to REST endpoints without prop-drilling.
- **Vanilla CSS (Glassmorphism):** Built from scratch to feature vibrant gradients, blur filters (`backdrop-filter`), hover actions, and custom elements. This avoids dependency overhead while guaranteeing a premium client impression.
- **Lucide React:** Used for crisp, light vector iconography (calendars, icons, buttons).

---

## Core Features Implemented

1. **Kanban board:** Three status lanes (`Todo`, `In Progress`, `Done`) displaying the current page of tasks. Includes support for HTML5 drag-and-drop actions to change statuses on the fly.
2. **Workload summary widget:** Groups counts of all tasks by user and status in a database-level query (`GET /reports/workload`), displaying them using a multi-colored workload ratio bar.
3. **Task CRUD & Client Validation:** Create, edit, and delete tasks. Validates form data locally (e.g. title is required, due date cannot be in the past) and checks assignee validity against the database.
4. **Auth & Sessions:** JWT-based register and login flows. Secured endpoints refuse requests lacking valid header tokens.
5. **Backend Filters & Pagination:** Queries tasks by status, assignee, and priority, returning database-level offset counts.
6. **DB Auto-Provisioning:** On backend startup, the Sequelize service checks if `jira_board_poc` exists. If not, it automatically runs `CREATE DATABASE` and seeds mock developers and tasks for instant visual interaction.

---

## Project Structure

```
JiraBoard/
├── backend/
│   ├── src/
│   │   ├── config/database.js  # DB creation & Sequelize client
│   │   ├── controllers/        # Route handlers (users, tasks, reports)
│   │   ├── middleware/         # Auth verify & schema validators
│   │   ├── models/             # Sequelize schemas (User, Task)
│   │   ├── routes/             # Route setups
│   │   ├── app.js              # Express middlewares & setups
│   │   └── server.js           # DB sync, seeds, & listener
│   ├── .env                    # DB/Server configuration variables
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/         # Board, card, modal, & auth forms
│   │   ├── store/              # Zustand global store
│   │   ├── App.css             # Main styling
│   │   ├── App.jsx             # Coordinator layout
│   │   ├── index.css           # Global layout & variables
│   │   └── main.jsx
│   ├── vite.config.js          # API proxy redirects
│   └── package.json
└── README.md
```

---

## Setup & Running Instructions

### Prerequisites
- **Node.js (v18+)** and **npm** installed.
- **MySQL** running locally on port `3306` with username `root` and password `root` (these defaults can be customized in `backend/.env`).

### Step 1: Configure & Start Backend
1. Open a terminal, navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. (Optional) Edit `backend/.env` to match your local MySQL credentials:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=jira_board_poc
   DB_USER=root
   DB_PASSWORD=root
   JWT_SECRET=supersecretjwttokenforpoc123!
   ```
4. Start the server (runs on `http://localhost:5000`):
   ```bash
   npm run start
   ```
   *(Note: On startup, the server automatically boots the database and populates seeds if it is empty!)*

### Step 2: Start Frontend
1. Open a second terminal, navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server (runs on `http://localhost:5173`):
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`.

### Seeding Accounts for the Demo
Use either of the following seeded user accounts to log in directly:
* **Admin Account:** `admin@company.com` / Password: `admin123` (Role: Admin)
* **Developer Account:** `john@company.com` / Password: `member123` (Role: Member)

---

## Assumptions & Design Choices
- **Authentication:** To align with standard internal tools, authentication is mandatory. Unauthenticated users are redirected to the Login card. Tokens are kept in `localStorage` for session persistence.
- **Page Filtering:** When filters are active, pagination handles matches on the database level. Task cards grouped in board columns represent tasks loaded for the *current page*.
- **Database Creation:** The MySQL database auto-creation script assumes the user `root` has permission to run `CREATE DATABASE` queries.

---

## What I'd Do With More Time (Roadmap Enhancements)

If this POC were extended to a full production release, the following features would be implemented:
1. **Real-time Sync (WebSockets):** Integrate Socket.io on the backend. Moving a task column or modifying cards would instantly update all active clients without reloading.
2. **Interactive Visual Reporting:** Replace the basic CSS ratio bars in the workload panel with interactive SVG charts (e.g., using Recharts) to analyze workloads by priority, backlog velocity, or sprint progress.
3. **Comprehensive Test Suite:**
   - **Backend:** Integration tests using `Supertest` and `Jest` to test validation middleware and endpoints.
   - **Frontend:** Component tests with `Vitest` and `React Testing Library`, and end-to-end tests using `Cypress` or `Playwright`.
4. **Enhanced Security:** Implement token revocation, HTTP-only cookie-based JWT storage (rather than `localStorage`), and rate-limiting middleware (`express-rate-limit`) on public authentication routers.
5. **Docker Compose:** Create a root `docker-compose.yml` to spin up MySQL, the Express API container, and the React client together with a single command (`docker-compose up`).
6. **Task Subtasks & Comments:** Add support for nested checkboxes (subtasks) on cards and an interactive comment log on task details.
