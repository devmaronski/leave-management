# Employee Leave Management System

A full-stack web application for managing employee leave requests, built to demonstrate best practices in architecture, security, testing, and Git workflow.

---

## Project Overview

The **Employee Leave Management System** allows employees to file leave requests and enables HR/Admin users to review, approve, or reject them.

The system demonstrates:
- Secure authentication and role-based access control (RBAC)
- Clean CRUD APIs with business rules
- Proper validation, error handling, and logging
- A clear Git workflow with meaningful commits
- Practical frontend-backend integration

---

## Architecture

This repository uses a **simple monorepo structure** with separate frontend and backend applications to keep concerns isolated and setup straightforward.


```
leave-management/
├── backend/          # NestJS REST API
├── frontend/         # React (Vite) client
└── README.md
```

Each application has its own:
- `package.json`
- `.gitignore`
- environment configuration


## Features

- Role-based access control (Employee, HR, Admin)
- Database: PostgreSQL with Prisma ORM
- API Documentation with Swagger
- JWT authentication setup
- Full TypeScript implementation

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v18 or higher)
- npm (v9 or higher)
- PostgreSQL (v14 or higher)

## Local Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd leave-management
```

### 2. Backend Setup

Navigate to backend directory and install dependencies:

```bash
cd backend
npm install
```

### 3. Configure Environment

Create `.env` file in the backend directory:

```bash
cp .env.example .env
```

Update the `.env` file with your PostgreSQL credentials:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/leave_management?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="3600s"
CORS_ORIGIN="http://localhost:5173"
PORT=3000
NODE_ENV="development"
```

### 4. Database Setup

Create the database:
```bash
createdb leave_management
```

Run migrations:
```bash
npx prisma migrate dev
```

Seed test data:
```bash
npx prisma db seed
```

Test users created:
- Admin: `admin@company.com` / `admin123`
- HR: `hr@company.com` / `hr123`
- Employee: `employee@company.com` / `employee123`

## Running Locally

Start the development server:

```bash
cd backend
npm run start:dev
```

The server will start on `http://localhost:3000`

### Access Swagger Documentation

Open your browser:
```
http://localhost:3000/api-docs
```

### Access Prisma Studio

To view and manage database records:

```bash
cd backend
npx prisma studio
```

Opens at `http://localhost:5555`

## Documentation

For detailed backend documentation including database schema, development commands, and troubleshooting, see [Backend README](./backend/README.md).

## Test Users

| Email | Password | Role |
|-------|----------|------|
| admin@company.com | admin123 | ADMIN |
| hr@company.com | hr123 | HR |
| employee@company.com | employee123 | EMPLOYEE |
