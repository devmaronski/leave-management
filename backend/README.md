# Backend - Leave Management System API

NestJS REST API for the Leave Management System with PostgreSQL and Prisma.

## Technology Stack

- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe JavaScript
- **Prisma** - Next-generation ORM
- **PostgreSQL** - Relational database
- **Passport JWT** - Authentication
- **Swagger** - API documentation
- **class-validator** - DTO validation
- **bcrypt** - Password hashing

## Database Schema

### User Model
- `id` - Unique identifier (CUID)
- `email` - Unique email address
- `passwordHash` - Hashed password
- `firstName` - User's first name
- `lastName` - User's last name
- `role` - User role (EMPLOYEE, HR, ADMIN)
- `isActive` - Account status
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

### LeaveRequest Model
- `id` - Unique identifier (CUID)
- `userId` - Reference to user
- `type` - Leave type (VL, SL, EL, UNPAID)
- `startDate` - Leave start date
- `endDate` - Leave end date
- `reason` - Leave reason
- `status` - Request status (PENDING, APPROVED, REJECTED, CANCELLED)
- `decisionById` - User who made the decision
- `decisionNote` - Decision notes
- `decidedAt` - Decision timestamp
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

## Development Commands

```bash
# Development mode with hot reload
npm run start:dev

# Build for production
npm run build

# Run production build
npm run start:prod

# Run tests
npm run test

# Run tests with coverage
npm run test:cov

# Lint code
npm run lint

# Format code
npm run format
```

## Database Commands

```bash
# Generate Prisma Client
npx prisma generate

# Create a new migration
npx prisma migrate dev --name <migration-name>

# Reset database
npx prisma migrate reset

# Seed database
npx prisma db seed

# Open Prisma Studio
npx prisma studio
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `JWT_SECRET` | Secret key for JWT tokens | Required |
| `JWT_EXPIRES_IN` | JWT token expiration time | `3600s` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:5173` |
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode | `development` |

## Troubleshooting

### Database Connection Issues

If you encounter database connection errors:

1. Verify PostgreSQL is running:
```bash
pg_isready
```

2. Check your `DATABASE_URL` in `.env`

3. Ensure the database exists:
```bash
psql -U postgres -l
```

### Port Already in Use

If port 3000 is already in use:

1. Kill the process:
```bash
lsof -ti:3000 | xargs kill -9
```

2. Or change the port in `.env`:
```env
PORT=3001
```

### Prisma Client Issues

If you encounter Prisma Client errors:

1. Regenerate the client:
```bash
npx prisma generate
```

2. Clear node_modules and reinstall:
```bash
rm -rf node_modules
npm install
```
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
