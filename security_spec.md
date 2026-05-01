# Security Spec

## Data Invariants
1. A wardrobe item cannot exist without a valid userId that matches the authenticated user.
2. The user profile must contain basic identity fields and belongs strictly to the user.
3. Users can only fetch and list their own wardrobe items.
4. Updates to wardrobe items are strictly limited to `isFavorite` toggle.

## The "Dirty Dozen" Payloads
1. User Profile Creation with extra fields -> Fail (Schema Size Constraint)
2. User Profile Creation with wrong `userId` -> Fail (Identity mismatch)
3. Wardrobe Item Creation without userId -> Fail (Missing Required Key)
4. Wardrobe Item Creation with wrong `userId` -> Fail (Identity mismatch)
5. Wardrobe Item Creation missing `analysis` -> Fail (Schema Constraint)
6. Wardrobe Item Creation with 2MB base64 string -> Fail (Denial of Wallet Constraint, 1MB limit check)
7. Wardrobe Item Update with extra fields -> Fail (`hasOnly` gate bypass)
8. Wardrobe Item Update with wrong `userId` -> Fail (Immutability Constraint)
9. Orphaned Wardrobe Item -> Fail (Master Gate relational check: user doc must exist)
10. Blanket reads on `/users` -> Fail (No list queries allowed on root)
11. Reading another user's Wardrobe Item -> Fail (Identity check)
12. Attempting to execute `get` without being signed in -> Fail (isSignedIn gate)
