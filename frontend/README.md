# Leave Management System - Frontend

React + TypeScript frontend for the Employee Leave Management System.

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS 3
- **UI Components**: shadcn/ui (Radix + Tailwind)
- **Routing**: React Router 7
- **State Management**: React Query (server state) + Context API (auth state)
- **HTTP Client**: Axios
- **Forms**: React Hook Form + Zod
- **Component Docs**: Storybook 8

## Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running on `http://localhost:3000`

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env to set VITE_API_BASE_URL if backend runs on different port
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```
   App runs at `http://localhost:5173`

4. **Run Storybook** (component documentation)
   ```bash
   npm run storybook
   ```
   Storybook runs at `http://localhost:6006`

## Project Structure

```
src/
├── api/                 # Axios client and API endpoint functions
├── components/
│   ├── ui/             # shadcn/ui base components
│   ├── layout/         # Layout components (Navbar, Sidebar, etc.)
│   ├── common/         # Shared feature components
│   └── leave/          # Leave management components
├── contexts/           # React Context providers (auth)
├── hooks/              # Custom React hooks
├── pages/              # Route page components
├── routes/             # Route guards and protection
├── types/              # TypeScript type definitions
└── utils/              # Helper functions
```

## Development Workflow

### Bootstrap Phase - COMPLETE ✅
- ✅ Vite + React + TypeScript setup
- ✅ Tailwind CSS + shadcn/ui components
- ✅ React Router with protected route architecture
- ✅ TanStack Query provider
- ✅ Axios client with interceptor stubs
- ✅ AuthContext shell
- ✅ Storybook with baseline component stories
- ✅ Folder structure and path aliases

### Phase B - Auth Foundation - COMPLETE ✅
- ✅ Complete AuthContext implementation with token persistence
- ✅ Login form with React Hook Form + Zod validation
- ✅ Axios interceptors for JWT attachment and 401 handling
- ✅ Protected routing with LoadingSpinner
- ✅ Role-based navigation in Navbar
- ✅ Dashboard shell with user info
- ✅ Toast notifications with sonner
- ✅ Unit tests for auth logic
- ✅ Storybook stories for auth components

### Next Steps (Phases C-F)
- **Phase C**: Employee leave workflow (forms, tables, API integration)
- **Phase D**: HR/Admin workflow (approval/rejection)
- **Phase E**: Optional admin users UI
- **Phase F**: Polish + documentation

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run storybook` - Start Storybook
- `npm run build-storybook` - Build Storybook static site

## Architecture Decisions

### Why React Query?
- Industry standard for server state management
- Built-in caching, refetching, and error handling
- Reduces boilerplate for API calls

### Why shadcn/ui?
- Copy-paste components (no package dependency lock-in)
- Built on Radix UI (accessible primitives)
- Tailwind-based (consistent with project styling)
- Easy customization

### Why Context API for Auth?
- Simple, lightweight state management for auth
- No need for heavy state library (Zustand/Redux) for single concern
- React Query handles all server state

### Token Storage Strategy
- **Current**: JWT access token stored in `localStorage`
- **Rationale**: Simple implementation suitable for exam/demo context
  - Survives page refreshes without complex cookie handling
  - Backend validates all requests with JWT signature
  - Straightforward implementation reduces exam time pressure
- **Known Risk**: Vulnerable to XSS attacks (malicious scripts can read localStorage)
- **Mitigations**:
  - React escapes all user content by default
  - No use of `dangerouslySetInnerHTML`
  - Backend validates all tokens and implements rate limiting
  - Strict Content Security Policy (CSP) in production
- **Production Alternative**: 
  - Store refresh token in httpOnly cookie (immune to XSS)
  - Keep short-lived access token in memory (lost on refresh)
  - Use refresh endpoint to restore session automatically

## Authentication Flow

### Login Process
1. User submits email/password via LoginForm (with Zod validation)
2. `AuthContext.login()` calls `/auth/login` endpoint
3. Backend returns JWT access token
4. Token stored in `localStorage` as `access_token`
5. `getCurrentUser()` fetches user data from `/auth/me`
6. User state updated in AuthContext
7. Redirect to dashboard

### Session Restoration
1. On app mount, AuthContext checks for `access_token` in localStorage
2. If token exists, TanStack Query calls `/auth/me` to restore user data
3. LoadingSpinner shown during restore
4. User redirected to appropriate page based on auth state

### Authenticated Requests
1. Axios request interceptor reads token from localStorage
2. Attaches `Authorization: Bearer <token>` header to all requests
3. Backend validates JWT on each request

### Logout Process
1. User clicks logout button in Navbar
2. `AuthContext.logout()` removes token from localStorage
3. User state cleared
4. TanStack Query cache cleared
5. Redirect to login page

### Automatic Logout on 401
1. Axios response interceptor detects 401 status
2. Token removed from localStorage
3. Custom `auth:logout` event dispatched
4. AuthContext listener clears user state and cache
5. User redirected to login (via ProtectedRoute guard)

### Protected Routes
- ProtectedRoute wrapper checks `isAuthenticated` from AuthContext
- Shows LoadingSpinner while auth state is loading
- Redirects to `/login` if not authenticated
- Renders children (protected content) if authenticated

### Role-Based Access Control
- RoleGuard component checks user role against allowed roles
- Shows "Access Denied" message if role not permitted
- Navbar conditionally renders links based on user role:
  - EMPLOYEE: Dashboard, My Leave Requests
  - HR: Dashboard, Manage Leave
  - ADMIN: Dashboard, Manage Leave, Users

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:3000` |

## Testing

### Unit Tests
Run all unit tests:
```bash
npm run test
```

Current test coverage:
- AuthContext login/logout logic
- ProtectedRoute guard behavior
- Token persistence in localStorage

### Smoke Test Checklist (Phase B - Authentication)

#### Login Flow
- [ ] Navigate to `/login` — form renders with email/password fields
- [ ] Submit empty form — validation errors display inline
- [ ] Submit invalid email — shows "Invalid email address"
- [ ] Submit with wrong credentials — shows backend error message
- [ ] Submit with correct credentials — redirects to `/dashboard`
- [ ] Verify token stored in localStorage (DevTools → Application)

#### Session Persistence
- [ ] Login successfully, refresh page — user remains logged in
- [ ] Close tab, reopen app — session restored (no re-login required)
- [ ] Clear localStorage, refresh — redirects to login

#### Protected Routes
- [ ] While logged out, navigate to `/dashboard` — redirects to `/login`
- [ ] Login as EMPLOYEE, manually navigate to `/manage/leave-requests` — shows "Access Denied"
- [ ] Login as HR, navigate to `/users` — shows "Access Denied"
- [ ] Login as ADMIN — can access all routes

#### Navigation & Logout
- [ ] Login as EMPLOYEE — navbar shows "Dashboard" + "My Leave Requests"
- [ ] Login as HR — navbar shows "Dashboard" + "Manage Leave"
- [ ] Login as ADMIN — navbar shows "Dashboard" + "Manage Leave" + "Users"
- [ ] Click logout button — clears user, redirects to login, localStorage token removed

#### Error Handling
- [ ] Backend server down — shows network error toast
- [ ] API returns 401 mid-session (simulate by invalidating token) — auto-logout triggered

#### Storybook
- [ ] Run `npm run storybook` — server starts
- [ ] Navigate to LoginForm stories — see default, validation errors, loading states
- [ ] Navigate to LoadingSpinner story — spinner animates
- [ ] Navigate to ErrorState story — see default and with retry button

## Contributing

1. Create feature branch from `main`
2. Make small, logical commits
3. Run linting before commit: `npm run lint`
4. Document new components in Storybook
5. Update this README if adding new setup steps

## Intentionally Deferred

The following are NOT yet implemented (planned for Phases C-F):
- Leave request forms and tables (Employee view)
- Leave request approval/rejection workflow (HR/Admin)
- User management UI (Admin only)
- Advanced filtering and pagination
- Data export functionality
- Email notifications
- Leave balance tracking
- Comprehensive error boundaries

Phase B (Auth Foundation) is now complete with:
- ✅ Full authentication flow
- ✅ Token management and persistence
- ✅ Protected routing and role guards
- ✅ Login form with validation
- ✅ Dashboard with role-aware navigation

      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
