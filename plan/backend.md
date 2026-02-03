# Employee Leave Management System — Backend Implementation Plan (NestJS + Prisma)

> Goal: Deliver a small but production-minded CRUD web application demonstrating architecture, testing, security, and Git workflow best practices.

---

## 0) Guiding principles (thought process)

### What this exam is really evaluating
- **Clarity of architecture** (modules, separation of concerns, consistent patterns).
- **Correctness + safety** (auth, RBAC, validation, error handling).
- **Maintainability** (naming, DTOs, service-layer business rules, clean structure).
- **Verification** (unit tests that prove the most important rules).
- **Professional workflow** (branching + meaningful commits + documentation).

### Design decisions (and why)
1. **NestJS modules per domain**  
   - Keeps boundaries clear: `auth`, `users`, `leave-requests`.
2. **Service layer owns business rules**  
   - Controllers remain thin; services enforce workflow transitions and permissions.
3. **Prisma for DB safety and productivity**  
   - Parameterized queries by default, schema-driven, migration-friendly.
4. **DTO validation with whitelist + forbid**  
   - Prevents accidental mass assignment / unexpected fields.
5. **RBAC via `@Roles()` decorator + guard**  
   - Standard Nest pattern; easy to reason about.
6. **Consistent error shape**  
   - Centralized exception filter for predictable API responses.
7. **Tests target the highest-value rules**  
   - Status transitions + permissions: the core of the domain.

---

## 1) Bootstrapping & repo workflow (Git strategy)

### 1.1 Repository structure (mono-repo)
```
leave-management/
  backend/
  frontend/
  README.md
```

### 1.2 Branching strategy
- `main` (stable)
- Feature branches:
  - `feature/backend-bootstrap`
  - `feature/auth-rbac`
  - `feature/leave-requests`
  - `feature/testing-logging`
  - `feature/docs`

### 1.3 Commit plan (minimum 3, recommended 5+)
1. `chore(backend): bootstrap nest + prisma + env example`
2. `feat(auth): jwt login + bcrypt + roles guard`
3. `feat(leave): leave request CRUD + decision workflow`
4. `test: add unit tests for leave rules and roles guard`
5. `docs: add api docs, setup instructions, and design notes`

---

## 2) Project setup (Backend)

### 2.1 Create NestJS app
Commands (example):
- `nest new backend`
- Add packages:
  - Prisma: `prisma`, `@prisma/client`
  - Auth: `@nestjs/jwt`, `passport`, `passport-jwt`, `@nestjs/passport`
  - Validation: `class-validator`, `class-transformer`
  - Security: `bcrypt`
  - Optional rate limiting: `@nestjs/throttler`
  - Optional sanitization: (Nest generally relies on DTOs; avoid HTML rendering; keep strict DTOs)

### 2.2 Environment management
Create:
- `backend/.env` (ignored)
- `backend/.env.example` (committed)

Required env:
- `DATABASE_URL=postgresql://...`
- `JWT_SECRET=...`
- `JWT_EXPIRES_IN=3600s`
- `CORS_ORIGIN=http://localhost:5173`

### 2.3 Prisma bootstrap
- `npx prisma init`
- Define schema (see data model below)
- Run:
  - `npx prisma migrate dev --name init`
  - `npx prisma generate`

### 2.4 Seed script (recommended)

### 2.5 API documentation (Swagger / OpenAPI)
- Install:
  - `@nestjs/swagger` and `swagger-ui-express`
- Configure in `main.ts` to serve:
  - Swagger UI: `/api-docs`
  - OpenAPI JSON: `/api-docs-json` (or `/v1/api-docs` if you version routes)
- Add bearer auth scheme so reviewers can authorize and try protected endpoints from the UI.

Create an admin user to avoid manual DB work:
- `prisma/seed.ts` creates:
  - `admin@company.com` / password
  - optionally a sample `employee@company.com`

---

## 3) Domain modeling (Prisma schema)

### 3.1 Enums
- `Role`: `EMPLOYEE | HR | ADMIN`
- `LeaveStatus`: `PENDING | APPROVED | REJECTED | CANCELLED`
- `LeaveType`: `VL | SL | EL | UNPAID`

### 3.2 Models (minimum)
**User**
- `id` (cuid/uuid)
- `email` unique
- `passwordHash`
- `firstName`, `lastName`
- `role`
- `isActive` boolean
- timestamps

**LeaveRequest**
- `id`
- `userId` (FK User)
- `type`
- `startDate`, `endDate`
- `reason`
- `status`
- `decisionById` (nullable)
- `decisionNote` (nullable)
- `decidedAt` (nullable)
- timestamps

### 3.3 Business constraints (service-layer enforced)
- Employee can **create**, **view own**, **update/cancel only when PENDING**.
- HR/Admin can **list all**, **approve/reject only when PENDING**.
- Optional: prevent overlap with existing **APPROVED** leaves.

---

## 4) Backend architecture & folder structure

### 4.1 Structure
```
backend/src/
  main.ts
  app.module.ts

  common/
    prisma/
      prisma.module.ts
      prisma.service.ts
    decorators/
      roles.decorator.ts
    guards/
      jwt-auth.guard.ts
      roles.guard.ts
    filters/
      http-exception.filter.ts
    interceptors/
      logging.interceptor.ts
    utils/
      pagination.ts

  auth/
    auth.module.ts
    auth.controller.ts
    auth.service.ts
    dto/
      login.dto.ts
      register.dto.ts (optional)
    jwt.strategy.ts

  users/
    users.module.ts
    users.controller.ts
    users.service.ts
    dto/
      create-user.dto.ts
      update-user.dto.ts

  leave-requests/
    leave-requests.module.ts
    leave-requests.controller.ts
    leave-requests.service.ts
    dto/
      create-leave.dto.ts
      update-leave.dto.ts
      decide-leave.dto.ts
```

### 4.2 Responsibilities (documentation for components)
**Controller**
- HTTP wiring, params parsing, guards, DTO validation.
- Should NOT contain business rules beyond trivial checks.

**Service**
- Domain logic and rules:
  - status transitions
  - permission checks
  - overlap checks
  - DB transactions if needed

**PrismaService**
- Single gateway for DB; supports enabling query logging if desired.

**Guards**
- `JwtAuthGuard`: validates JWT and attaches `req.user`
- `RolesGuard`: enforces `@Roles()` metadata

**Filters / Interceptors**
- `HttpExceptionFilter`: consistent error response
- `LoggingInterceptor`: request duration and status logging

---

## 5) Security plan (backend)

### 5.1 Authentication
- JWT access tokens
- Password hashing with `bcrypt` (10–12 salt rounds)
- `isActive` check in auth flow (reject deactivated users)

### 5.2 Authorization (RBAC)
- Roles: `EMPLOYEE`, `HR`, `ADMIN`
- Policies:
  - HR can decide leaves, view all
  - Admin can manage users and also decide leaves
  - Employee limited to own leave requests

### 5.3 Input validation & sanitization
- Global validation pipe:
  - `whitelist: true`
  - `forbidNonWhitelisted: true`
  - `transform: true`
- DTO constraints:
  - `IsEmail`, `MinLength`, `MaxLength`
  - `IsEnum` for enums
  - `IsDateString` for date fields
- Prevent XSS by:
  - Treating `reason` as plain text
  - Never returning HTML
  - Frontend renders text normally (React escapes)

### 5.4 Rate limiting (optional)
- Apply throttler globally or at least to `/auth/login`:
  - Example: 10 requests/minute

### 5.5 Secrets
- `.env` never committed
- `.env.example` provides safe template
- Document security choices in README

---

## 6) Error handling & logging

### 6.1 Error response standard
Return shape (example):
```json
{
  "message": "Validation failed",
  "errorCode": "VALIDATION_ERROR",
  "details": ["startDate must be a valid ISO date string"]
}
```

### 6.2 Exception mapping
- `BadRequestException` for validation/business rule violation
- `UnauthorizedException` for auth failure
- `ForbiddenException` for RBAC violations
- `NotFoundException` for missing resources
- `ConflictException` for overlaps/duplicates

### 6.3 Logging
- Use Nest Logger
- Log:
  - request method/path/status/duration (interceptor)
  - key domain actions:
    - leave filed
    - leave approved/rejected
    - user created/deactivated

---

## 7) API design & endpoint documentation

> This project exposes **Swagger UI** at `/api-docs` and an **OpenAPI spec** suitable for reuse in tools like Postman and Spring Boot (springdoc-openapi).


### 7.1 Auth endpoints
#### `POST /auth/login`
- Purpose: authenticate and issue JWT
- Body:
  - `email`, `password`
- Responses:
  - `200`: `{ accessToken, user }`
  - `401`: invalid credentials / inactive user

#### `GET /auth/me`
- Purpose: get current session user
- Auth: Bearer JWT
- Response: `{ id, email, role, firstName, lastName }`

Optional:
- `POST /auth/register` (if allowing self-registration; otherwise admin creates users)

---

### 7.2 Users endpoints (Admin-focused)
#### `GET /users`
- Purpose: list users with filters + pagination
- Auth: ADMIN or HR (optional)
- Query:
  - `role`, `isActive`, `page`, `limit`
- Response: `{ data: User[], meta: { page, limit, total } }`

#### `POST /users`
- Purpose: create a user (employee/hr)
- Auth: ADMIN
- Body: `{ email, password, firstName, lastName, role }`
- Security: hash password

#### `PATCH /users/:id`
- Purpose: update user profile
- Auth:
  - ADMIN can update anyone
  - user can update self (limit fields)
- Body: `{ firstName?, lastName? }` (restrict by role)

#### `PATCH /users/:id/deactivate`
- Purpose: deactivate account
- Auth: ADMIN
- Result: sets `isActive=false`

---

### 7.3 Leave requests endpoints
#### `POST /leave-requests`
- Purpose: employee files leave request
- Auth: EMPLOYEE
- Body:
  - `type`, `startDate`, `endDate`, `reason`
- Rules:
  - startDate <= endDate
  - optional overlap check

#### `GET /leave-requests/mine`
- Purpose: employee views own leave requests
- Auth: EMPLOYEE
- Query: `page`, `limit`, `status` optional

#### `PATCH /leave-requests/:id`
- Purpose: employee updates their own request
- Auth: EMPLOYEE
- Rules:
  - only owner
  - only if status = PENDING
- Body: `{ type?, startDate?, endDate?, reason? }`

#### `POST /leave-requests/:id/cancel`
- Purpose: employee cancels own pending request
- Auth: EMPLOYEE
- Rules:
  - only owner
  - only if status = PENDING
- Result: status -> CANCELLED

#### `GET /leave-requests`
- Purpose: HR/Admin views all requests
- Auth: HR or ADMIN
- Query:
  - `status`, `userId`, date range, `page`, `limit`

#### `POST /leave-requests/:id/decision`
- Purpose: HR/Admin approves/rejects
- Auth: HR or ADMIN
- Body: `{ decision: "APPROVED"|"REJECTED", note? }`
- Rules:
  - only if status = PENDING
- Result:
  - status set accordingly
  - decisionById, decidedAt, decisionNote set

---

## 8) Backend implementation sequence (step-by-step)

### Phase A — Bootstrap (feature/backend-bootstrap)
1. Create Nest app, standardize lint/format (optional).
2. Add `PrismaModule` + `PrismaService`.
3. Add `.env.example`, config loading.
4. Implement seed script.
5. Add global validation pipe and base exception filter wiring.

Deliverable:
- Server starts, connects to DB, seed works.

### Phase A.5 — API Documentation (Swagger / OpenAPI)
1. Install Swagger tooling:
   - `@nestjs/swagger` and `swagger-ui-express`
2. Configure Swagger in `main.ts`:
   - Title, version, description
   - Add **Bearer JWT** security scheme
   - Serve Swagger UI at `/api-docs`
3. Document controllers and DTOs:
   - `@ApiTags()` per module
   - `@ApiBearerAuth()` for protected routes
   - `@ApiOperation()`, `@ApiResponse()` for key endpoints
   - `@ApiProperty()` / `@ApiPropertyOptional()` for DTO schemas
4. Expose the OpenAPI JSON:
   - available at `/api-docs-json` (or default `/api-docs` + internal route depending on setup)
5. README: add **API Documentation** section:
   - Swagger UI URL
   - OpenAPI export notes for Postman / Spring Boot (springdoc-openapi)

Deliverable:
- Interactive API docs available locally and kept in sync with code.

### Phase B — Auth + RBAC (feature/auth-rbac)
1. Create `auth` module:
   - login endpoint
   - JWT strategy
2. Add password hashing with bcrypt.
3. Create roles decorator + roles guard.
4. Add `GET /auth/me`.

Deliverable:
- Can login with seeded admin and receive token.
- Protected route works and checks roles.

### Phase C — Users module (feature/users)
1. Admin create user endpoint.
2. List users with pagination.
3. Deactivate user endpoint.
4. Ensure auth rejects deactivated users.

Deliverable:
- Admin can manage employees.

### Phase D — Leave Requests (feature/leave-requests)
1. Employee create leave request.
2. Employee list mine + update pending + cancel pending.
3. HR/Admin list all + approve/reject endpoint.
4. Business rules enforced in service.

Deliverable:
- Full workflow works end-to-end via Postman.

### Phase E — Logging + rate limiter (feature/testing-logging)
1. Logging interceptor (method/path/status/duration).
2. Optional: throttler on login.

Deliverable:
- Observable logs; basic rate limits.

### Phase F — Testing (feature/testing-logging)
Write at least 3 unit tests (Jest):
1. Leave cannot be updated after approval.
2. Decision endpoint updates status and metadata.
3. Roles guard denies unauthorized role.

Deliverable:
- `npm test` passes.

### Phase G — Documentation (feature/docs)
1. Update root README (or backend README) with setup.
2. Add API docs (this file can be referenced).
3. Add security/testing explanation.

Deliverable:
- Clear submission-quality documentation.

---

## 9) Unit test plan (details)

### Test 1 — Update restriction
**Scenario:** Employee tries to update leave request with status `APPROVED`  
**Expected:** service throws `BadRequestException` or `ForbiddenException` (choose consistent rule).

### Test 2 — HR decision writes metadata
**Scenario:** HR approves a pending request  
**Expected:** `status=APPROVED`, `decisionById=hrId`, `decidedAt != null`

### Test 3 — RolesGuard
**Scenario:** Endpoint requires `ADMIN` but user role is `EMPLOYEE`  
**Expected:** `ForbiddenException`

---

## 10) Definition of done (backend)
- All required endpoints implemented
- JWT auth + RBAC enforced
- DTO validation enabled globally
- Passwords hashed, secrets in env
- 3+ unit tests passing
- Logging present
- Documentation clear enough to run in <10 minutes

