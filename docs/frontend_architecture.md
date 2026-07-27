# Frontend Architecture — Task & Team Workload Tracker

This document provides a detailed architectural overview of the React + Zustand frontend.

---

## 1. SPA Architecture & Component Topology

The client is built using React (Vite) as a Single Page Application (SPA). It uses a clean, light-theme layout inspired by standard agile tools (such as Jira or Trello).

```
[ App.jsx ] ── (Main Coordinator)
    ├── [ LoginForm.jsx ] (Rendered if token is absent)
    ├── [ Header ] (Sign-out and user profile details)
    ├── [ FilterBar.jsx ] (Page offsets, search selectors)
    ├── [ Board Columns ] (Flexbox Columns: Todo, Progress, Done)
    │       └── [ TaskCard.jsx ] (Draggable items with overdue alerts)
    ├── [ WorkloadWidget.jsx ] (Team workload proportional ratio bars)
    └── [ TaskModal.jsx ] (Modal form with client-side validations)
```

---

## 2. State Management: Zustand

Instead of heavy Redux templates or React Context providers (which cause global component re-renders), the client uses **Zustand** for centralized state management.

### Store Schema (`useBoardStore.js`)
* **State Values:**
  * `token`: Active JWT session token (saved in `localStorage` for session persistence).
  * `currentUser`: Object containing name, email, and role of the logged-in user.
  * `tasks`: Slice of tasks returned by the active page query.
  * `users`: List of all registered team members (used in assignee selectors).
  * `workloadReport`: Data metrics array returned from `/reports/workload`.
  * `filters`: Query parameters (`assigneeId`, `priority`, `page`, `limit`).
  * `totalPages` / `totalItems`: Metadata values supporting pagination.
  * `isLoading` / `error`: Centralized state indicators for visual loading indicators and alerts.
* **Actions:**
  * `login(email, password)` / `register(...)`: Performs authentication, stores credentials, and bootstraps data.
  * `fetchTasks()`: Queries the Express API, sending active filters as URL parameters.
  * `createTask(data)` / `deleteTask(id)`: Invokes the API, then updates local tasks and workload reports.
  * `updateTask(id, data)`: Patches changes. Updates the card *locally* in the store array instantly to prevent visual UI flicker, while re-fetching backend aggregates in the background.

---

## 3. Light Theme Design System (Vanilla CSS)

The UI uses a **clean Light Theme** designed to look intuitive and professional. All styles are defined in `index.css` and `App.css`:

* **Color Palette:** Based on soft grays and clean primary accents:
  * Main background: Soft light gray (`#f4f5f7`).
  * Columns: Flat grayish panels (`#e9ebf0`).
  * Task cards: Pure white blocks (`#ffffff`) with subtle borders (`#dfe1e6`) and soft shadows (`rgba(9, 30, 66, 0.25)`).
* **Typography:** Modern clean sans-serif typeface (`Inter`) imported from Google Fonts, prioritizing readability.
* **Buttons & Inputs:** Uses flat borders, solid gray/blue backgrounds, and soft focus states to look natural and professional.

---

## 4. Component Breakdown & Interactions

### Board Columns & Drag-and-Drop Flow
The board uses native **HTML5 Drag and Drop APIs** for moving tasks across columns. This avoids heavy external drag libraries:

```
[TaskCard (draggable)]
   └─ onDragStart: Save taskId into DataTransfer
   
          [BoardColumn (droppable)]
             ├─ onDragOver: preventDefault() to allow dropping
             ├─ onDragEnter/Leave: toggle highlight CSS class
             └─ onDrop: Retrieve taskId, trigger updateTask(id, { status: ColumnStatus })
```

### Task Cards
* Displays title, priority pill, assignee initials avatar, and due date.
* Automatically evaluates if the task's deadline is in the past:
  `isOverdue = dueDate && new Date(dueDate) < new Date().setHours(0,0,0,0) && status !== 'Done'`
  If true, styles the deadline text in red with a calendar icon.
* Double-clicking a card opens the editing form.

### Workload Summary Widget
* Consumes the `workloadReport` state.
* Maps and groups statistics for *every* user in the database (ensuring zero-state team members who have 0 tasks are still listed in the report).
* Draws a segmented proportional bar (`Todo` in blue, `In Progress` in orange, `Done` in green) for each developer, allowing managers to inspect team capacity instantly.

### Task Creation & Edit Modal
* Centralized modal handling both creations and edits.
* Client-side validation:
  * Title is required.
  * Due Date (if provided) is split and checked locally to verify it does not fall in the past compared to the local calendar.

---

## 5. API Proxy & Integration Layer

To prevent CORS header blockages during development, the Vite dev server uses a proxy layer. When the React app calls `/tasks`, `/users`, or `/reports`, Vite's development server redirects the request to `http://localhost:5000` in the background:

```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/users': 'http://localhost:5000',
      '/tasks': 'http://localhost:5000',
      '/reports': 'http://localhost:5000',
    }
  }
})
```
All API operations automatically bundle the JWT Bearer header:
`Authorization: Bearer <token>`
This ensures requests are securely verified.
