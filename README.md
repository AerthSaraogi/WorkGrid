# WorkGrid — Team Task & Incident Management System

A production-quality, full-stack **Jira-like** internal team task and incident management application, built as a portfolio/interview project for a Full Stack Software Developer role.

---

## 📐 Architecture Overview

```
WorkGrid/
├── backend/                    # ASP.NET Core Web API (.NET 8)
│   ├── WorkGrid.Api/
│   │   ├── Controllers/        # REST API endpoints
│   │   ├── Data/               # EF Core DbContext + seeding
│   │   ├── DTOs/               # Request/Response models
│   │   ├── Entities/           # Domain models
│   │   ├── Middleware/         # Global exception handling
│   │   ├── Repositories/       # Generic + specific repos
│   │   └── Services/           # Business logic layer
│   └── WorkGrid.Tests/         # xUnit integration tests
├── frontend/                   # React + TypeScript + Vite
│   └── src/
│       ├── components/         # Reusable UI components
│       ├── context/            # AuthContext (JWT state)
│       ├── hooks/              # useAuth, useProjects, useTasks
│       ├── pages/              # Route-level page components
│       ├── services/           # Axios API client
│       └── types/              # TypeScript types
├── docker-compose.yml          # Full stack Docker setup
└── README.md
```

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS |
| **State / Forms** | React Context, React Hook Form, Zod |
| **HTTP Client** | Axios (with JWT interceptors) |
| **Backend** | ASP.NET Core 8 Web API |
| **ORM** | Entity Framework Core 8 |
| **Auth** | JWT Bearer tokens, BCrypt password hashing |
| **Database** | SQLite (dev) / PostgreSQL (prod/Docker) |
| **Testing** | xUnit, EF Core InMemory |
| **DevOps** | Docker, Docker Compose, Nginx |
| **Docs** | Swagger / OpenAPI |

---

## ✅ Features Implemented

### Authentication & RBAC
- Register / Login with JWT tokens
- 4 roles: **ADMIN**, **MANAGER**, **DEVELOPER**, **VIEWER**
- Token persisted in localStorage with auto-refresh on app load
- 401/403 handled globally — redirects to login

### Projects
- CRUD for projects (role-gated: Admin/Manager create, Admin deletes)
- Task count and open task count per project
- Search/filter projects by name

### Tasks & Incidents
- Create tasks/incidents with priority, type, status, assignee, due date
- Paginated task list with debounced search + multi-filter (status, priority, type)
- Overdue highlighting in red
- `PATCH` endpoints for partial updates (status, priority, assignee)

### Comments & History
- Add comments on tasks (Developer+ only)
- Full activity timeline (status changes, assignments, comments)
- History auto-appended on every state change

### Dashboard
- Global stats: total projects, tasks, by-status counts
- Critical incident panel with live pulse indicator
- Recent tasks and activity timeline

### UI/UX
- Dark mode, glassmorphism design system
- Responsive sidebar + top nav layout
- Animated badges, hover effects, smooth transitions
- Role-based UI (buttons/controls hidden based on role)

---

## 🛠️ Local Development

### Prerequisites
- Node.js 20+
- .NET 8 SDK
- (Optional) Docker + Docker Compose

### Backend

```bash
cd backend
dotnet restore
dotnet run --project WorkGrid.Api/WorkGrid.Api.csproj --launch-profile http
# Runs on http://localhost:5000
# Swagger: http://localhost:5000/swagger
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
# API proxied to http://localhost:5000
```

### Run Tests

```bash
cd backend
dotnet test
```

---

## 🐳 Docker (Full Stack)

```bash
docker-compose up --build
# Frontend: http://localhost:80
# API:      http://localhost:5000
```

---

## 🔐 Seed Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@workgrid.io | Password123! |
| Manager | manager@workgrid.io | Password123! |
| Developer | dev1@workgrid.io | Password123! |
| Viewer | viewer@workgrid.io | Password123! |

---

## 📡 REST API Summary

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/api/auth/register` | POST | Register new user | Public |
| `/api/auth/login` | POST | Login, returns JWT | Public |
| `/api/auth/me` | GET | Get current user | All |
| `/api/auth/users` | GET | List all users | All |
| `/api/projects` | GET/POST | List/create projects | All/Manager+ |
| `/api/projects/:id` | GET/PUT/DELETE | Project CRUD | All/Manager+/Admin |
| `/api/projects/:id/tasks` | GET | Paginated task list | All |
| `/api/tasks` | POST | Create task | Manager+ |
| `/api/tasks/:id` | GET/PUT/DELETE | Task CRUD | All/Manager+/Admin |
| `/api/tasks/:id/status` | PATCH | Update status | Developer+ |
| `/api/tasks/:id/priority` | PATCH | Update priority | Manager+ |
| `/api/tasks/:id/assignee` | PATCH | Update assignee | Manager+ |
| `/api/tasks/:id/comments` | GET/POST | Comments | All/Developer+ |
| `/api/tasks/:id/history` | GET | Audit trail | All |
| `/api/dashboard` | GET | Global analytics | All |
| `/api/dashboard/project/:id` | GET | Per-project analytics | All |

---

## 🧪 Test Coverage

8 xUnit tests covering:
- User registration and login
- Duplicate email rejection
- JWT token validation
- Task CRUD (create, update status, delete)
- Role-based access enforcement

---

## 📂 Key Files for Interview Walkthrough

| File | What to discuss |
|------|----------------|
| [`AppDbContext.cs`](backend/WorkGrid.Api/Data/AppDbContext.cs) | EF Core relationships, indexes |
| [`TaskService.cs`](backend/WorkGrid.Api/Services/TaskService.cs) | Business logic, RBAC, audit trail |
| [`Program.cs`](backend/WorkGrid.Api/Program.cs) | DI setup, JWT config, middleware |
| [`AuthContext.tsx`](frontend/src/context/AuthContext.tsx) | JWT in React, global auth state |
| [`useTasks.ts`](frontend/src/hooks/useTasks.ts) | Custom hook pattern, API integration |
| [`ProjectDetailPage.tsx`](frontend/src/pages/ProjectDetailPage.tsx) | Debounced search, pagination, filtering |
| [`TaskDetailPage.tsx`](frontend/src/pages/TaskDetailPage.tsx) | Inline updates, comments, timeline |
