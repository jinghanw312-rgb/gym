# Security Specification - POWER-SPORTS

## 1. Data Invariants
- A sports log cannot exist without a `userId` matching the authenticated user.
- Timestamps must be server-generated (`request.time`).
- `category` and `name` must be valid strings.

## 2. Dirty Dozen Payloads (Rejections)
1. Write with someone else's `userId`.
2. Write with a client-side `timestamp` in the future.
3. Write without `category` or `name`.
4. Update an existing log's `userId` (Immortality check).
5. Update `timestamp` after creation.
6. Delete a log that doesn't belong to the user.
7. Injecting 1MB junk string into `name`.
8. Setting `kcal` to a negative number.
9. Reading all logs without being signed in.
10. Querying logs without a `userId` filter (Query Enforcer).
11. Injecting `isAdmin: true` into a user-editable field.
12. Attempting to update `score` with an invalid type (must be string).

## 3. Test Runner (Mock Logic)
- PASS: `update` fails if `userId` is changed.
- PASS: `create` fails if `request.auth.uid` != `data.userId`.
- PASS: `list` fails if query lacks `where("userId", "==", uid)`.
