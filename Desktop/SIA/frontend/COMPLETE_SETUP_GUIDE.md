# Complete Setup Guide - Frontend & Backend

## Current Status

✅ **Frontend**: Running on `http://localhost:3000`
❌ **Backend**: Not running (needs to be started)

## Prerequisites

Before starting, ensure you have:

1. **Java Development Kit (JDK)**
   ```powershell
   java -version
   # Should show Java 11 or higher
   ```

2. **MySQL Database**
   - Must be running on `localhost:3306`
   - Username: `root`
   - Password: `123456`
   - Database: `revive`

3. **Maven** (or use the included mvnw wrapper)
   ```powershell
   mvn -version
   # Or use: mvnw.cmd
   ```

## Step-by-Step Setup

### Step 1: Verify MySQL is Running

**Windows - Check if MySQL is running:**
```powershell
# Open Services (services.msc) and look for MySQL service
# Or test connection with:
mysql -u root -p123456 -e "SELECT 1;"
```

If MySQL is not running, you need to start it. The connection string in backend shows:
```
jdbc:mysql://localhost:3306/revive
```

### Step 2: Verify Database Exists

```powershell
# Login to MySQL
mysql -u root -p123456

# Inside MySQL, run:
SHOW DATABASES;
# Should see: revive (or create it)

# If revive database doesn't exist, create it:
CREATE DATABASE revive;
USE revive;
```

### Step 3: Start the Backend

**Option A: Using Maven Wrapper (Recommended)**
```powershell
cd C:\Users\AIRON KIT ARTAZO\Desktop\SIA\demo
.\mvnw.cmd spring-boot:run
```

**Option B: Using Maven (if installed)**
```powershell
cd C:\Users\AIRON KIT ARTAZO\Desktop\SIA\demo
mvn spring-boot:run
```

**Option C: Build then run JAR**
```powershell
cd C:\Users\AIRON KIT ARTAZO\Desktop\SIA\demo
.\mvnw.cmd clean package -DskipTests
java -jar target/revive-*.jar
```

### Step 4: Verify Backend is Running

Once you see startup messages, open a new PowerShell and test:

```powershell
# Test health endpoint
Invoke-WebRequest -Uri "http://localhost:8080/api/health" -Method GET

# Should return 200 OK
```

### Step 5: Test Frontend-Backend Connection

1. Open `http://localhost:3000` in your browser
2. Open Browser DevTools (F12)
3. Go to Console tab
4. Paste the test commands:

```javascript
// Test 1: Check backend connectivity
fetch('http://localhost:8080/api/health')
  .then(r => r.json())
  .then(d => console.log('✓ Backend OK:', d))
  .catch(e => console.error('✗ Backend error:', e.message))

// Test 2: Try register (with unique email each time)
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
  console.log('✓ Register response:', d);
  localStorage.setItem('authToken', d.token);
  localStorage.setItem('user', JSON.stringify(d));
})
.catch(e => console.error('✗ Register error:', e.message))

// Test 3: Check localStorage
console.log('Token:', localStorage.getItem('authToken'));
console.log('User:', localStorage.getItem('user'));
```

### Step 6: Test Login/Register UI

1. Click "LOG IN" button in navbar
2. Try registering with:
   - Name: Your Name
   - Email: unique@email.com
   - Password: password123 (8+ chars required)
3. Click "SIGN UP"
4. If successful, modal closes and user is logged in
5. Check DevTools > Application > LocalStorage to see stored token

## Environment Configuration

The frontend is configured to connect to:
```
REACT_APP_API_URL=http://localhost:8080/api
```

**To change this**, create `.env` file in `revive-sneaker/`:
```
REACT_APP_API_URL=http://localhost:8080/api
```

## Backend Configuration

Located at: `demo/src/main/resources/application.properties`

```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/revive
spring.datasource.username=root
spring.datasource.password=123456

# JWT
app.jwt.secret=replace-this-with-a-long-random-secret-key-at-least-32-bytes
app.jwt.expiration-ms=86400000

# Server
server.port=8080
```

## Running Both Services

### Terminal 1 - Backend
```powershell
cd C:\Users\AIRON KIT ARTAZO\Desktop\SIA\demo
.\mvnw.cmd spring-boot:run
# Waits for: "Started ReviveApplication in X seconds"
```

### Terminal 2 - Frontend  
```powershell
cd C:\Users\AIRON KIT ARTAZO\Desktop\SIA\frontend\revive-sneaker
npm start
# Opens browser at localhost:3000
```

## Troubleshooting

### Backend won't start

**Error: "MySQL Connection refused"**
- MySQL is not running
- Check MySQL service is started
- Verify credentials: root / 123456
- Verify database `revive` exists

**Error: "Port 8080 already in use"**
- Another app is using port 8080
- Kill the process: `netstat -ano | findstr :8080`
- Or change backend port in `application.properties`

**Error: "Java not found"**
- Install JDK 11 or higher
- Add Java to PATH environment variable

### Frontend won't connect to backend

**Error: "CORS error" in console**
- Backend CORS is already configured for localhost:3000
- Check backend is running on port 8080
- Verify no proxy is interfering

**Error: "Network error" when registering**
- Backend is not running
- Check backend terminal for errors
- Verify MySQL is running

### Port Issues

**Check what's using a port:**
```powershell
netstat -ano | findstr :3000    # Frontend port
netstat -ano | findstr :8080    # Backend port
netstat -ano | findstr :3306    # MySQL port
```

**Kill process using a port:**
```powershell
# Replace PID with the actual process ID
taskkill /PID <PID> /F
```

## Verification Checklist

- [ ] MySQL running on port 3306
- [ ] Database `revive` exists
- [ ] Backend compiles without errors
- [ ] Backend starts on port 8080
- [ ] Backend health check works
- [ ] Frontend running on port 3000
- [ ] Can see login button in navbar
- [ ] Can open login modal
- [ ] Can register new account
- [ ] Token appears in localStorage
- [ ] User data appears in localStorage

## Next Steps

1. **Once connection works:**
   - Test all login/register scenarios
   - Check error messages
   - Verify token storage

2. **Optional improvements:**
   - Add logout button
   - Display user name in navbar
   - Create protected routes
   - Add loading states globally

3. **Before production:**
   - Change JWT secret
   - Use strong database password
   - Configure CORS for production domain
   - Set up HTTPS

## Files Reference

```
C:\Users\AIRON KIT ARTAZO\Desktop\SIA\
├── demo/                          # Backend (Java Spring Boot)
│   ├── src/main/resources/
│   │   └── application.properties  # Configuration
│   ├── mvnw.cmd                    # Maven wrapper (Windows)
│   └── pom.xml                     # Dependencies
│
└── frontend/                       # Frontend (React)
    └── revive-sneaker/
        ├── src/
        │   ├── App.js              # Main app with LoginModal
        │   ├── api.js              # API client
        │   └── index.js            # Entry point
        ├── .env                    # Configuration (create this)
        └── package.json            # Dependencies
```

## Quick Start Commands

```powershell
# Terminal 1 - Start Backend
cd C:\Users\AIRON KIT ARTAZO\Desktop\SIA\demo
.\mvnw.cmd spring-boot:run

# Terminal 2 - Start Frontend  
cd C:\Users\AIRON KIT ARTAZO\Desktop\SIA\frontend\revive-sneaker
npm start

# Then open http://localhost:3000 in browser
```

---

**Need help?** Check the console output for specific error messages!
