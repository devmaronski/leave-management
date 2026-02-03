# Employee Leave Management System — Frontend Implementation Plan (React)

> Goal: Provide a minimal but clean UI that demonstrates forms, validation, authenticated routing, role-based screens, and integration with the backend API.

---

## 0) Guiding principles (thought process)

### What the frontend should prove
- You can build a maintainable UI with:
  - consistent state/data fetching
  - form validation
  - protected routes
  - error handling and feedback
- Keep it **simple**: the backend carries most business logic.

### Design decisions (and why)
1. **React + Vite**  
   - fast setup, clean build output.
2. **React Router**  
   - standard routing.
3. **TanStack Query**  
   - best practice for server state: caching, retries, invalidation.
4. **React Hook Form + Zod**  
   - robust form validation with strong typing.
5. **Role-based routing**  
   - maps directly to RBAC rules in backend.

---

## 1) Project setup (Frontend)

### 1.1 Create app
- `npm create vite@latest frontend -- --template react-ts`
- Install:
  - `react-router-dom`
  - `@tanstack/react-query`
  - `axios`
  - `react-hook-form`
  - `zod`
  - `@hookform/resolvers`

Optional:
- UI library (keep minimal for exam; plain CSS or simple component styles is fine)

### 1.2 Environment variables
Create:
- `frontend/.env` (ignored if desired)
- `frontend/.env.example` (committed)

Required env:
- `VITE_API_BASE_URL=http://localhost:3000`

---

## 2) Frontend architecture & folder structure

### 2.1 Suggested structure
```
frontend/src/
  main.tsx
  app/
    App.tsx
    router.tsx
    providers.tsx
  api/
    axios.ts
    auth.api.ts
    users.api.ts
    leave.api.ts
  auth/
    AuthProvider.tsx
    useAuth.ts
    ProtectedRoute.tsx
    RoleRoute.tsx
  pages/
    LoginPage.tsx
    DashboardPage.tsx
    MyLeaveRequestsPage.tsx
    ManageLeaveRequestsPage.tsx
    UsersPage.tsx (optional)
  components/
    layout/
      AppShell.tsx
      Navbar.tsx
    common/
      Button.tsx
      Input.tsx
      Select.tsx
      Table.tsx
      Badge.tsx
      Toast.tsx (optional)
      ErrorState.tsx
      LoadingState.tsx
    leave/
      LeaveRequestForm.tsx
      LeaveRequestsTable.tsx
      DecisionModal.tsx
  types/
    models.ts
  utils/
    dates.ts
    errors.ts
```

### 2.2 Component responsibilities (documentation)

**AppShell / Navbar**
- Display navigation based on role:
  - Employee: My Leave Requests
  - HR/Admin: Manage Leave Requests
  - Admin: Users (optional)
- Show logged-in user and logout button.

**ProtectedRoute**
- Blocks unauthenticated users; redirects to `/login`.

**RoleRoute**
- Blocks users without required roles; shows a “Forbidden” page or redirects.

**LeaveRequestForm**
- Controlled form with validation:
  - leave type, start/end date, reason
- On submit, calls API and invalidates `myLeaveRequests` query.

**LeaveRequestsTable**
- Displays list with status badge.
- If `PENDING`, show actions:
  - Edit (optional)
  - Cancel

**DecisionModal**
- HR/Admin approve/reject with optional note.

**ErrorState / LoadingState**
- Standardize UX for async states.

---

## 3) Data flow and state management

### 3.1 Server state (TanStack Query)
Queries:
- `me` → `/auth/me`
- `myLeaveRequests` → `/leave-requests/mine`
- `allLeaveRequests` → `/leave-requests` (HR/Admin)
- `users` → `/users` (Admin optional)

Mutations:
- `login`
- `createLeaveRequest`
- `cancelLeaveRequest`
- `decideLeaveRequest`
- `createUser` / `deactivateUser` (optional)

### 3.2 Auth state (minimal, exam-friendly)
- Store `accessToken`:
  - simplest: localStorage (document tradeoffs)
  - better: memory + refresh-cookie (more work)
- `AuthProvider` handles:
  - `login()` stores token + fetches `me`
  - `logout()` clears token + query cache

### 3.3 Axios setup
- `axios.ts`:
  - baseURL from env
  - request interceptor adds `Authorization: Bearer <token>`
  - response interceptor normalizes error messages

---

## 4) Route map (role-based)

### Public
- `/login`

### Authenticated
- `/dashboard` (all roles)

### Employee
- `/leave-requests` (MyLeaveRequestsPage)

### HR/Admin
- `/manage/leave-requests` (ManageLeaveRequestsPage)

### Admin (optional)
- `/users`

---

## 5) Form validation and error handling

### 5.1 Login form schema (Zod)
- `email`: valid email
- `password`: min length

### 5.2 Leave request form schema
- `type`: enum
- `startDate`, `endDate`: ISO date strings
- `reason`: min 3, max 500
- Cross-field validation:
  - `startDate <= endDate`

### 5.3 Error mapping (best practice)
Create `utils/errors.ts`:
- parse backend error shape:
  - show `message`
  - if `details` is array, list them under the form

---

## 6) API endpoint documentation (frontend perspective)

> These mirror the backend routes and define what each UI screen needs.

### 6.1 Auth
- `POST /auth/login`
  - used by LoginPage
- `GET /auth/me`
  - used on app load to restore session

### 6.2 Employee — leave requests
- `POST /leave-requests`
  - LeaveRequestForm
- `GET /leave-requests/mine?page=&limit=&status=`
  - LeaveRequestsTable
- `POST /leave-requests/:id/cancel`
  - Cancel button

Optional:
- `PATCH /leave-requests/:id` (edit pending)

### 6.3 HR/Admin — manage leave requests
- `GET /leave-requests?status=PENDING&page=&limit=`
  - ManageLeaveRequestsPage list
- `POST /leave-requests/:id/decision`
  - DecisionModal approve/reject

### 6.4 Admin — users (optional UI)
- `GET /users?page=&limit=&role=&isActive=`
- `POST /users`
- `PATCH /users/:id/deactivate`

---

## 7) Frontend implementation sequence (step-by-step)

### Phase A — Bootstrap (feature/frontend-bootstrap)
1. Create Vite React TS app
2. Setup router and app shell
3. Setup Axios client
4. Setup React Query provider

Deliverable:
- App runs, routing works.

### Phase B — Auth (feature/frontend-auth)
1. Build LoginPage
2. Implement AuthProvider with token storage
3. Add ProtectedRoute + RoleRoute
4. Implement `/dashboard` with role-aware navigation

Deliverable:
- Login works; restricted routes enforced.

### Phase C — Employee leave workflow (feature/frontend-employee-leave)
1. Build MyLeaveRequestsPage:
   - LeaveRequestForm
   - LeaveRequestsTable
2. Hook up API:
   - create request
   - list mine
   - cancel pending
3. Improve UX:
   - disable submit while loading
   - show toast/inline message on success

Deliverable:
- Employee can file and manage their own requests.

### Phase D — HR/Admin workflow (feature/frontend-hr-admin)
1. Build ManageLeaveRequestsPage:
   - table of pending requests
   - DecisionModal approve/reject
2. Query invalidation after decisions

Deliverable:
- HR/Admin can approve/reject.

### Phase E — Optional Admin Users UI (feature/frontend-admin-users)
1. Simple UsersPage:
   - list users
   - create user form
   - deactivate action
2. Keep minimal to avoid scope creep.

### Phase F — UI polish + documentation (feature/docs)
1. Add README instructions:
   - env setup
   - run commands
2. Document tradeoffs:
   - token storage approach
   - what’s implemented vs planned

---

## 8) Security considerations (frontend)
- Avoid storing sensitive info beyond token.
- React escapes text by default; do not render raw HTML.
- Validate inputs with Zod before sending.
- If using localStorage for token:
  - document XSS risk
  - mitigate by strict backend validation and no HTML injection points
  - (optional) mention that httpOnly refresh cookie is preferred for production.

---

## 9) Smoke testing plan (frontend)
1. Login with seeded admin and employee accounts.
2. Employee:
   - file leave request
   - confirm appears in list
   - cancel while pending
3. HR/Admin:
   - open manage page
   - approve or reject a pending request
   - confirm status updates
4. Role checks:
   - employee cannot access manage page
   - HR cannot access admin users page (if built)

---

## 10) Definition of done (frontend)
- Login + protected routes
- Employee leave filing + list + cancel
- HR/Admin approve/reject flow
- Form validation + error display
- Clear documentation + setup instructions