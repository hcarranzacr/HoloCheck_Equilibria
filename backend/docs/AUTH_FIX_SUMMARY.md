# Authentication Fix Summary

## Problem
The `/api/v1/auth/token/exchange` endpoint was returning 404 "Not Found" error.

## Root Cause
1. **Missing AuthService class**: The `services/auth.py` file only had standalone functions but the `routers/auth.py` was trying to import `AuthService` class
2. **Wrong table name**: Auth service was trying to use `users` table which doesn't exist in Supabase. The actual table is `user_profiles`
3. **Missing oidc_states table**: The OIDC flow requires a temporary storage table for state/nonce/code_verifier

## Solution Applied

### 1. Created AuthService Class
Added complete `AuthService` class to `/workspace/app/backend/services/auth.py` with methods:
- `store_oidc_state()` - Store OIDC flow temporary data
- `get_and_delete_oidc_state()` - Retrieve and cleanup OIDC state
- `get_or_create_user()` - Get or create user from OIDC claims
- `issue_app_token()` - Issue JWT token for authenticated users

### 2. Updated Database Table References
Changed all references from `users` table to `user_profiles` table:
- Updated `get_or_create_user()` to use `user_profiles`
- Updated `initialize_admin_user()` to use `user_profiles`
- Updated `get_user_by_email()` to use `user_profiles`
- Updated `create_or_update_user()` to use `user_profiles`
- Mapped `user_profiles` columns correctly:
  - `full_name` → `name` in User model
  - `user_id` → `id` in User model

### 3. Database Schema Required

**IMPORTANT**: The following SQL must be executed in Supabase SQL Editor:

```sql
-- Create oidc_states table for storing temporary OIDC flow data
CREATE TABLE IF NOT EXISTS public.oidc_states (
    id BIGSERIAL PRIMARY KEY,
    state TEXT NOT NULL UNIQUE,
    nonce TEXT NOT NULL,
    code_verifier TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_oidc_states_state ON public.oidc_states(state);
CREATE INDEX IF NOT EXISTS idx_oidc_states_expires_at ON public.oidc_states(expires_at);
```

## Current Status

✅ **Fixed Issues:**
- AuthService class created and properly implemented
- Auth router successfully loads and includes all endpoints
- `/api/v1/auth/token/exchange` endpoint now exists in the route table
- All auth endpoints properly mapped to `user_profiles` table

⚠️ **Manual Action Required:**
- Execute the SQL above in Supabase SQL Editor to create `oidc_states` table
- Without this table, OIDC login flow will fail (but token exchange endpoint will work)

## Verification

Run this to verify the fix:
```bash
cd /workspace/app/backend && python3 -c "
import sys
sys.path.insert(0, '.')
from main import app
routes = [route.path for route in app.routes]
print('Auth routes:', [r for r in routes if 'auth' in r])
print('Token exchange exists:', '/api/v1/auth/token/exchange' in routes)
"
```

Expected output:
```
Auth routes: ['/api/v1/auth/login', '/api/v1/auth/callback', '/api/v1/auth/token/exchange', '/api/v1/auth/me', '/api/v1/auth/logout']
Token exchange exists: True
```

## Next Steps

1. Execute the SQL in Supabase SQL Editor
2. Test the `/api/v1/auth/token/exchange` endpoint
3. If issues persist, check backend logs for detailed error messages