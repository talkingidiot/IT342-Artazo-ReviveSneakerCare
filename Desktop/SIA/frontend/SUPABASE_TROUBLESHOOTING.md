# Supabase Connection Troubleshooting

## Issue Identified

**Frontend shows "Login Successful" but data is not saved to Supabase**

### Root Causes

1. **Supabase credentials in `application.properties` may be invalid or expired**
2. **Network connection from backend to Supabase may be failing**
3. **Database tables may not exist in Supabase**
4. **Frontend is not validating that data actually saved**

## What I Added to Fix This

### 1. Enhanced API Client (`src/api.js`)
- ✅ Added detailed console logging
- ✅ Added `testConnection()` method to verify backend is reachable
- ✅ Better error messages from backend responses
- ✅ Connection diagnostics

### 2. Diagnostics Page (`src/DiagnosticsPage.js`)
- ✅ Test backend connection
- ✅ Test register with real API call
- ✅ Test login
- ✅ Check localStorage
- ✅ View all logs in real-time

## How to Use the Diagnostics

1. **Import DiagnosticsPage in your App.js:**
   ```javascript
   import DiagnosticsPage from './DiagnosticsPage';
   // Then render: <DiagnosticsPage />
   ```

2. **Or open browser DevTools Console and run:**
   ```javascript
   authAPI.testConnection().then(r => console.log('Connection result:', r))
   ```

3. **Check the browser console for logs:**
   - See which API endpoint is being called
   - See actual responses from backend
   - See where the error occurs

## Steps to Fix Supabase Connection

### Step 1: Verify Supabase Credentials
Check your `demo/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://aws-1-ap-south-1.pooler.supabase.com:5432/postgres
spring.datasource.username=postgres.ndzptenfxpuvswrfrwfm
spring.datasource.password=JbbQ_tX&tY/9cU2
```

**Are these credentials correct?**
- ✓ Login to Supabase Dashboard
- ✓ Go to Settings > Database
- ✓ Copy the exact connection string
- ✓ Copy the exact password

### Step 2: Verify Database Tables Exist
The backend uses Hibernate with `ddl-auto=update`, so tables should auto-create. But verify in Supabase:

```sql
SELECT * FROM information_schema.tables 
WHERE table_schema = 'public';
```

Should see: `users` table

### Step 3: Check Backend Logs
When you start the backend, look for:
- ✓ "Started ReviveApplication"
- ✓ "Hibernate: create table users"
- ✓ No database connection errors

### Step 4: Test Connection from Backend
Run this query directly in Supabase to test connectivity:

```bash
# From terminal, test PostgreSQL connection
psql -h aws-1-ap-south-1.pooler.supabase.com -U postgres.ndzptenfxpuvswrfrwfm -d postgres -c "SELECT 1"
```

### Step 5: Use Diagnostics to Test
1. Start frontend and backend
2. Go to `http://localhost:3000`
3. Open DevTools Console
4. Click "Test Backend Connection"
5. Click "Test Register"
6. **Check if data appears in Supabase Dashboard**

## What to Look for in Error Messages

### "Connection refused"
- Supabase is down or unreachable
- Check your internet connection
- Verify Supabase service is running

### "Invalid credentials"
- Username/password are wrong
- Connection string is wrong
- Try resetting Supabase password

### "Table 'users' doesn't exist"
- Hibernate DDL didn't run
- Try adding user manually through Supabase console
- Check Hibernate logs

### "Timeout connecting"
- Network issue to Supabase
- Firewall blocking connection
- Check Supabase IP whitelist settings

## Debugging Steps

### 1. Check Backend Console Output
When registering/logging in, backend should log:
```
Hibernate: insert into users (created_at, email, name, password, role) values (?, ?, ?, ?, ?)
```

### 2. Check Supabase Browser
- Open Supabase Dashboard
- Go to SQL Editor
- Run: `SELECT * FROM users;`
- Should see registered users

### 3. Check JWT Token
If registration succeeds but returns no token:
- Check JWT secret is set
- Check JWT configuration in backend

### 4. Enable SQL Query Logging
In `application.properties`, ensure:
```properties
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
```

## Test Commands for DevTools Console

```javascript
// Test 1: Check if backend is reachable
fetch('http://localhost:8080/api/health')
  .then(r => r.json())
  .then(d => console.log('Backend OK:', d))
  .catch(e => console.log('Backend Error:', e.message))

// Test 2: Register a user
fetch('http://localhost:8080/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Test',
    email: 'test' + Date.now() + '@example.com',
    password: 'password123'
  })
})
.then(r => {
  console.log('Status:', r.status);
  return r.json();
})
.then(d => console.log('Response:', d))
.catch(e => console.log('Error:', e.message))

// Test 3: Check localStorage
console.log('Token:', localStorage.getItem('authToken'))
console.log('User:', localStorage.getItem('user'))
```

## File Updates Made

1. ✅ `src/api.js` - Added logging and testConnection()
2. ✅ `src/DiagnosticsPage.js` - Created diagnostics component
3. This guide - Troubleshooting steps

## Next Steps

1. **Verify Supabase credentials** are correct and not expired
2. **Test backend connectivity** using diagnostics
3. **Check Supabase console** to see if users are being saved
4. **Check backend logs** for SQL queries and errors
5. **Run diagnostics page** to get detailed error messages

## Connection Flow

```
Frontend (Register/Login)
    ↓
API Client (api.js)
    ↓
Backend (http://localhost:8080/api/auth/register)
    ↓
Hibernate ORM
    ↓
PostgreSQL Driver (org.postgresql)
    ↓
Supabase PostgreSQL
```

**Any step failing will prevent data from saving. Use diagnostics to find which step is breaking.**
