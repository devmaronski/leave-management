# Employee Leave Management System

A full-stack web application for managing employee leave requests with secure authentication, role-based access control, and comprehensive testing.

## Project Overview

Employees can file leave requests while HR/Admin users review, approve, or reject them. The system demonstrates best practices in architecture, security, testing, and Git workflow.

**Key Features:**
- Role-based access control (EMPLOYEE, HR, ADMIN)
- JWT authentication with secure password hashing
- RESTful API with Swagger documentation
- Responsive React UI with form validation
- PostgreSQL database with Prisma ORM
- Full TypeScript implementation

## Tech Stack

**Backend:** NestJS, PostgreSQL, Prisma ORM, JWT/Passport.js, class-validator, Swagger, Jest  
**Frontend:** React 18, TypeScript, Vite, shadcn/ui, Tailwind CSS, React Hook Form, Zod, Axios, TanStack Query, Vitest, Storybook  
**Tools:** Git, npm, ESLint, Prettier

## Security Approach

**Authentication & Authorization:**
- JWT-based authentication with bcrypt password hashing
- Role-based access control (RBAC) with three distinct roles
- Protected routes on both frontend and backend
- Secure token management and automatic cleanup on 401 errors

**API & Data Security:**
- CORS configuration with restricted origins
- Input validation using DTOs and class-validator
- Prisma ORM with prepared statements (SQL injection prevention)
- Environment variables for sensitive credentials
- Custom guards for route-level authorization

**Application Security:**
- TypeScript for type safety throughout
- Resource ownership validation (users can only access their own data)
- State machine logic for leave request status transitions
- Error handling without exposing sensitive information
- Request timeout and error boundaries for resilience

## Testing Strategy

**Backend (Jest):**
- Unit tests for services (auth, leave requests, users)
- Integration tests for controllers and API contracts
- E2E tests for complete user flows
- Commands: `npm run test`, `npm run test:cov`, `npm run test:e2e`

**Frontend (Vitest + React Testing Library):**
- Component tests with user interaction validation
- Integration tests for contexts and protected routes
- Storybook for visual testing and component documentation
- Commands: `npm run test`, `npm run test:ui`, `npm run coverage`

**Best Practices:** AAA pattern, proper mocking, dedicated seed data, CI-ready tests

## Prerequisites

- Node.js v18+
- npm v9+
- PostgreSQL v14+

## Quick Start

### 1. Clone & Install

```bash
git clone <repository-url>
cd leave-management

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Database Setup

```bash
createdb leave_management
cd backend
npx prisma migrate dev
npx prisma db seed
```

> **Note:** The `createdb` command creates a new PostgreSQL database. Ensure PostgreSQL is running before executing (`pg_isready` to verify). If you encounter permission issues, you may need to specify a user: `createdb -U postgres leave_management`

### 3. Environment Configuration

Create `backend/.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/leave_management?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="3600s"
CORS_ORIGIN="http://localhost:5173"
PORT=3000
NODE_ENV="development"
```

### 4. Run Applications

**Backend** (http://localhost:3000):
```bash
cd backend
npm run start:dev
```

**Frontend** (http://localhost:5173):
```bash
cd frontend
npm run dev
```

## Additional Resources

- **API Docs:** http://localhost:3000/api-docs (Swagger)
- **Database UI:** `npx prisma studio` → http://localhost:5555
- **Storybook:** `cd frontend && npm run storybook` → http://localhost:6006

## Test Users

| Email | Password | Role |
|-------|----------|------|
| admin@company.com | admin123 | ADMIN |
| hr@company.com | hr123456 | HR |
| employee@company.com | employee123 | EMPLOYEE |
