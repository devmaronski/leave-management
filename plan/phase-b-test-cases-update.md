# Phase B Test Cases Update

## Summary of Changes

Added explicit **Test Cases** subsections to Commits 2, 4, and 6 in the Phase B implementation plan. Each subsection includes:
- Testing philosophy emphasizing minimal mocking
- Table with scenario, input/setup, and expected behavior
- Focus on business rules and actual behavior

---

## Modified Sections

### Commit 2: Add RolesGuard Tests (TDD - Write Tests First)

```bash
mkdir -p src/common/guards
```

#### Test Cases

**Testing Philosophy**
- Minimize mocking to focus on actual behavior
- Use stub Reflector instead of jest.spyOn for framework boundaries
- Inline ExecutionContext per test for clarity
- Test business rules, not implementation details

| Scenario | Input/Setup | Expected Behavior |
|----------|-------------|-------------------|
| No roles required | Route has no `@Roles()` decorator; Reflector returns `undefined` | Guard returns `true` (allows access) |
| User has required role | Route requires `[Role.ADMIN]`; user has `role: Role.ADMIN` | Guard returns `true` (allows access) |
| User lacks required role | Route requires `[Role.ADMIN]`; user has `role: Role.EMPLOYEE` | Guard throws `ForbiddenException` |
| User has one of multiple roles | Route requires `[Role.HR, Role.ADMIN]`; user has `role: Role.HR` | Guard returns `true` (allows access) |

---

### Commit 4: Add AuthService Tests (TDD - Write Tests First)

```bash
mkdir -p src/auth/dto src/auth/strategies
```

#### Test Cases

**Testing Philosophy**
- Use minimal stubs for PrismaService and JwtService (framework boundaries)
- Test core business logic: password validation, user state checks, token generation
- Avoid mocking bcrypt behavior where possible; use real bcrypt in integration tests

| Scenario | Input/Setup | Expected Behavior |
|----------|-------------|-------------------|
| Valid credentials | User exists, password matches hash, user is active | Returns `User` object |
| User not found | Email doesn't exist in database | Returns `null` |
| Invalid password | User exists but password doesn't match hash | Returns `null` |
| Inactive user | User exists, password matches, but `isActive: false` | Returns `null` |
| Login success | Valid user object provided | Returns JWT token and sanitized user data (no password) |

---

### Commit 6: Add AuthController Tests

#### Test Cases

**Testing Philosophy**
- Mock AuthService only (framework boundary)
- Test controller logic: validation flow, error handling, response mapping
- Keep tests focused on HTTP layer concerns

| Scenario | Input/Setup | Expected Behavior |
|----------|-------------|-------------------|
| Valid login | `validateUser` returns user; `login` returns token | Controller returns `{ accessToken, user }` with status 200 |
| Invalid credentials | `validateUser` returns `null` | Controller throws `UnauthorizedException` |
| Get current user | JWT guard attaches user to request | Controller returns user object from `@CurrentUser()` decorator |

---

## Testing Philosophy Summary

1. **Minimize Mocking**: Only mock at framework boundaries (Prisma, JWT, Reflector)
2. **Focus on Behavior**: Test business rules and actual outcomes, not implementation details
3. **Clarity Over DRY**: Inline context setup in each test for explicitness
4. **Avoid False Confidence**: Don't mock what you can test directly
5. **Real Dependencies**: Prefer real instances (e.g., bcrypt) in integration tests

---

## Commit History (Unchanged)

```
* feat(auth): add rate limiting to login endpoint
* test(auth): add auth controller unit tests
* feat(auth): implement auth module with jwt login and bcrypt
* test(auth): add auth service unit tests
* feat(auth): implement roles guard
* test(auth): add roles guard unit tests
* feat(auth): add roles decorator and current-user decorator  ✓ (committed)
```
