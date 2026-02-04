# Backend API - Health & Wellness Platform

## Architecture Overview

This backend uses a **unified, centralized architecture** for all data access:

- **Single Access Point**: All database operations go through `core.supabase_client.get_supabase_admin()`
- **Service Role Key**: Backend uses `SUPABASE_SERVICE_ROLE_KEY` for full database access (bypasses RLS)
- **Simplified Authentication**: Frontend sends `user_id` as Bearer token, backend validates against `user_profiles` table
- **No SQLAlchemy**: Pure Supabase API for all operations

### Key Principles

1. ✅ **Centralized**: `get_supabase_admin()` is the ONLY way to access data
2. ✅ **Secure**: Service Role Key never exposed to frontend
3. ✅ **Simple**: No JWT validation, no complex auth flows
4. ✅ **Consistent**: All routers follow the same pattern

## Setup Instructions

### 1. Get Your Supabase API Keys

**CRITICAL**: The application requires valid Supabase JWT tokens. The keys must be obtained from your Supabase dashboard.

#### Steps to Get Real API Keys:

1. **Navigate to your Supabase project dashboard**:
   ```
   https://supabase.com/dashboard/project/nmwbfvvacilgyxbwvnqb/settings/api
   ```

2. **Copy the API keys** (they are JWT tokens starting with `eyJ`):
   - **anon/public key**: Used by frontend (~150-200 characters)
   - **service_role key**: Used by backend (~150-200 characters)

3. **Real keys look like this**:
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5td2Jmdnhxx...
   ```

#### Invalid Key Format (DO NOT USE):
```
sb_secret_vzUZjie6hy3CzoUUwq3muw_hX72Lhvu  ❌ WRONG FORMAT
sb_publishable_bv9N5FWT448fasDBMBD8Og_jM3cc4pj  ❌ WRONG FORMAT
```

### 2. Configure Environment Variables

1. **Copy the example file**:
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` and replace the placeholders**:
   ```bash
   # Open .env in your editor
   nano .env  # or vim, code, etc.
   ```

3. **Paste your real JWT tokens**:
   ```env
   SUPABASE_URL=https://nmwbfvvacilgyxbwvnqb.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5td2Jmdnhxx...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5td2Jmdnhxx...
   ```

### 3. Install Dependencies

```bash
# Make sure you're in the backend directory
cd /workspace/app/backend

# Install Python dependencies
uv pip install -r requirements.txt
```

### 4. Start the Backend

```bash
# Start the FastAPI server
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

The backend will be available at: `http://localhost:8001`

API documentation: `http://localhost:8001/docs`

## Troubleshooting

### Error: "Invalid API key"

**Symptom**: Backend logs show:
```
SupabaseException: Invalid API key
```

**Cause**: The API keys in `.env` are not valid JWT tokens.

**Solution**:
1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/nmwbfvvacilgyxbwvnqb/settings/api
2. Copy the **real JWT tokens** (they start with `eyJ` and are ~150-200 characters)
3. Update `.env` with the correct keys
4. Restart the backend

### Error: "User not found"

**Symptom**: 401 errors when accessing dashboard endpoints.

**Cause**: The `user_id` sent from frontend doesn't exist in `user_profiles` table.

**Solution**:
1. Check that the user exists in Supabase: `user_profiles` table
2. Verify the frontend is sending the correct `user_id` as Bearer token
3. Check backend logs for authentication details

### Error: "Connection refused"

**Symptom**: Frontend cannot connect to backend.

**Cause**: Backend is not running or wrong port.

**Solution**:
1. Make sure backend is running: `uvicorn main:app --host 0.0.0.0 --port 8001`
2. Check that port 8001 is not blocked by firewall
3. Verify frontend is configured to use `http://localhost:8001`

## Architecture Documentation

For detailed architecture information, see:
- `/workspace/app/backend/ARCHITECTURE.md` - Complete architecture guide
- `/workspace/app/backend/ARCHITECTURE_VALIDATION.md` - Validation report from Bob

## API Endpoints

### Authentication
- All endpoints require `Authorization: Bearer {user_id}` header
- Backend validates `user_id` against `user_profiles` table

### Dashboard Endpoints
- `GET /api/v1/dashboards/employee` - Employee dashboard data
- `GET /api/v1/dashboards/employee/evolution?months=6` - Personal evolution charts
- `GET /api/v1/dashboards/leader` - Team leader dashboard
- `GET /api/v1/dashboards/leader/team-evolution?months=6` - Team evolution charts
- `GET /api/v1/dashboards/hr` - HR dashboard
- `GET /api/v1/dashboards/hr/organization-evolution?months=12` - Organization evolution

### Biometric Indicators
- `GET /api/v1/biometric-indicators/ranges` - All indicator risk ranges
- `GET /api/v1/biometric-indicators/info/{indicator_code}` - Detailed indicator info

### Benefits Management
- `GET /api/v1/benefits/partner-benefits` - List all partner benefits
- `GET /api/v1/benefits/partner-benefits/{benefit_id}` - Get specific benefit
- `POST /api/v1/benefits/partner-benefits` - Create new benefit (admin)
- `PUT /api/v1/benefits/partner-benefits/{benefit_id}` - Update benefit (admin)
- `DELETE /api/v1/benefits/partner-benefits/{benefit_id}` - Delete benefit (admin)

## Development

### Code Structure

```
backend/
├── core/
│   ├── config.py              # Environment configuration
│   ├── supabase_client.py     # Centralized Supabase client
│   └── database.py            # Legacy (not used)
├── dependencies/
│   └── auth.py                # Simplified authentication
├── routers/
│   ├── dashboards.py          # Dashboard endpoints
│   ├── biometric_indicators.py # Biometric data endpoints
│   └── benefits_management.py  # Benefits CRUD endpoints
├── schemas/
│   └── auth.py                # Pydantic models
├── main.py                    # FastAPI application
├── requirements.txt           # Python dependencies
└── .env                       # Environment variables (create from .env.example)
```

### Adding New Endpoints

All new endpoints should follow this pattern:

```python
from fastapi import APIRouter, Depends, HTTPException
from core.supabase_client import get_supabase_admin
from dependencies.auth import get_current_user
from schemas.auth import UserResponse

router = APIRouter(prefix="/api/v1/your-endpoint", tags=["your-tag"])

@router.get("/")
async def your_endpoint(
    current_user: UserResponse = Depends(get_current_user)
):
    try:
        # Use centralized Supabase client
        supabase = get_supabase_admin()
        
        # Query data
        response = supabase.table('your_table')\
            .select('*')\
            .eq('user_id', str(current_user.id))\
            .execute()
        
        return {"data": response.data}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

### Key Rules

1. **ALWAYS use `get_supabase_admin()`** - Never create new Supabase clients
2. **NEVER use SQLAlchemy** - All data access through Supabase API
3. **NEVER expose Service Role Key** - Keep it in backend only
4. **ALWAYS validate user_id** - Use `Depends(get_current_user)`
5. **ALWAYS handle exceptions** - Return meaningful error messages

## Support

For architecture questions, refer to:
- `/workspace/app/backend/ARCHITECTURE.md`
- `/workspace/app/backend/ARCHITECTURE_VALIDATION.md`

For Supabase documentation:
- https://supabase.com/docs/reference/python/introduction