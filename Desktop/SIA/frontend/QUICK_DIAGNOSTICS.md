# Quick Start: Testing Your Connection

## 📊 Use Diagnostics to Identify Issues

### Option 1: Via Browser Console (Fastest)

1. Open `http://localhost:3000` in browser
2. Press `F12` to open DevTools
3. Click "Console" tab
4. Paste and run this:

```javascript
// Check backend connection
authAPI.testConnection().then(r => {
  if (r.connected) {
    console.log('✓ Backend is running!');
  } else {
    console.log('✗ Backend not reachable:', r.error);
  }
})
```

### Option 2: Via Diagnostics Component

Add this to your `src/App.js` temporarily:

```javascript
import DiagnosticsPage from './DiagnosticsPage';

// Inside your App component, add a route or button:
<DiagnosticsPage />
```

Or just replace the LoginModal temporarily to see diagnostics.

## 🔍 What to Check

### Backend Connection
```javascript
// In browser console
fetch('http://localhost:8080/api/health')
  .then(r => r.json())
  .then(d => console.log('✓ Backend response:', d))
  .catch(e => console.log('✗ Error:', e.message))
```

**Expected: 200 OK response**
**If error: Backend is not running**

### Database Connection
```javascript
// Try to register
fetch('http://localhost:8080/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Test User',
    email: 'test' + Date.now() + '@example.com',
    password: 'password123'
  })
})
.then(r => r.json())
.then(d => {
  console.log('Status:', d.token ? '✓ Success' : '✗ Failed');
  console.log('Response:', d);
})
.catch(e => console.log('✗ Error:', e.message))
```

**Expected: Token in response**
**If error: Check Supabase credentials**

### Data in Supabase
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Run: `SELECT * FROM users;`
4. Should see the registered user

## ✅ Success Indicators

- ✓ Backend health check returns 200 OK
- ✓ Register returns token in response
- ✓ Token stored in localStorage
- ✓ User appears in Supabase console
- ✓ No CORS errors in console

## ❌ Common Issues

### "Cannot reach localhost:8080"
- **Fix:** Start backend: `.\mvnw.cmd spring-boot:run`

### "Email already exists"
- **Fix:** Use unique email each time (include timestamp)

### "No token in response"
- **Fix:** Check backend logs for errors
- **Fix:** Verify Supabase credentials

### "User doesn't appear in Supabase"
- **Fix:** Backend not saving to database
- **Fix:** Check backend logs for SQL errors
- **Fix:** Verify database tables exist

## 🛠️ Backend Logs

Look for these messages when starting backend:

```
✓ "Hibernate: create table users ..."
✓ "Started ReviveApplication in X seconds"
✗ "Connection refused" → Supabase unreachable
✗ "Invalid username/password" → Wrong credentials
```

## 📋 Checklist

- [ ] Backend running on 8080
- [ ] Frontend running on 3000
- [ ] Supabase credentials correct
- [ ] Database tables exist
- [ ] Can reach backend from frontend
- [ ] Register returns token
- [ ] User appears in Supabase
- [ ] No console errors

## 🚀 Once Everything Works

1. Remove DiagnosticsPage from App.js
2. Implement proper error handling in LoginModal
3. Add user context/state management
4. Test production build

---

**Run diagnostics first, then report specific errors for targeted fixes!**
