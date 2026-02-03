# Frontend - Leave Management System

React + TypeScript frontend with secure authentication and role-based access control.

## Tech Stack

- **React 18** + TypeScript - Modern React with type safety
- **Vite 6** - Fast build tool and dev server
- **Tailwind CSS 3** + shadcn/ui - Utility-first styling with accessible components
- **React Router 7** - Client-side routing with protected routes
- **TanStack Query** - Server state management with caching
- **Axios** - HTTP client with interceptors
- **React Hook Form** + Zod - Form handling with schema validation
- **Storybook 8** - Component documentation and testing
- **Vitest** + React Testing Library - Unit and integration testing

## Features

### Authentication & Authorization
- JWT-based authentication with token persistence
- Role-based access control (EMPLOYEE, HR, ADMIN)
- Protected routes with automatic redirects
- Session restoration on page refresh
- Automatic logout on token expiration (401)
- Secure password validation with Zod schemas

### Leave Management
- Create, update, and cancel leave requests
- View personal leave history with pagination
- Filter leave requests by status and date range
- Approve/reject leave requests (HR/Admin only)
- Real-time form validation
- Error handling with retry functionality

### UI/UX
- Responsive design with Tailwind CSS
- Toast notifications for user feedback
- Loading states and error boundaries
- Accessible components (Radix UI primitives)
- Component documentation in Storybook

## Prerequisites

- Node.js 18+
- npm 9+
- Backend API running on `http://localhost:3000`

## Setup

```bash
# Install dependencies
npm install

# Configure environment (optional)
# Create .env file and set VITE_API_BASE_URL if backend runs on different port
cp .env.example .env

# Run development server
npm run dev
```

App runs at `http://localhost:5173`

## Project Structure

```
src/
├── api/                 # Axios client and API functions
├── components/
│   ├── ui/             # shadcn/ui base components
│   ├── layout/         # Layout components (Navbar, AppShell)
│   ├── common/         # Shared components (LoadingSpinner, ErrorBoundary)
│   ├── leave/          # Leave management components
│   └── users/          # User management components
├── contexts/           # React Context (AuthContext)
├── hooks/              # Custom React hooks
├── pages/              # Route page components
├── routes/             # Route guards (ProtectedRoute, RoleGuard)
├── schemas/            # Zod validation schemas
├── types/              # TypeScript type definitions
├── constants/          # Constants and configuration
├── config/             # Environment configuration
└── utils/              # Helper functions
```

## Development Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run coverage

# Run Storybook
npm run storybook

# Lint code
npm run lint
```

## Authentication Flow

**Login Process:**
1. User submits credentials via LoginForm (Zod validation)
2. `AuthContext.login()` calls `/auth/login` endpoint
3. JWT access token stored in `localStorage`
4. User data fetched from `/auth/me` and stored in context
5. Redirect to dashboard

**Session Restoration:**
- On app mount, AuthContext checks for token in localStorage
- If exists, TanStack Query fetches user data from `/auth/me`
- LoadingSpinner shown during restoration

**Authenticated Requests:**
- Axios interceptor attaches `Authorization: Bearer <token>` header
- Backend validates JWT on each request

**Automatic Logout:**
- Axios interceptor detects 401 status
- Token removed, user state cleared, cache invalidated
- Redirect to login page

**Protected Routes:**
- `ProtectedRoute` wrapper checks authentication status
- `RoleGuard` component enforces role-based access
- Navbar conditionally renders links based on user role

## Token Storage Strategy

**Current Implementation:** JWT stored in `localStorage`

**Rationale:**
- Simple implementation suitable for demo/exam context
- Survives page refreshes without complex cookie handling
- Backend validates all requests with JWT signatures

**Security Considerations:**
- Vulnerable to XSS attacks (malicious scripts can read localStorage)
- Mitigated by React's default XSS protection and CSP headers
- Backend implements rate limiting and token validation

**Production Alternative:**
- Store refresh token in httpOnly cookie (immune to XSS)
- Keep short-lived access token in memory
- Automatic session restoration via refresh endpoint

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:3000` |

## Troubleshooting

### API Connection Issues
- Verify backend is running on `http://localhost:3000`
- Check CORS configuration in backend `.env`
- Inspect network tab for failed requests

### Build Errors
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`

### Storybook Issues
- Rebuild Storybook: `npm run build-storybook`
- Clear cache: `rm -rf storybook-static`
