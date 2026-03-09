# Frontend-Backend Connection Guide (Java Spring Boot)

## Overview

Your frontend is now fully integrated with your Java Spring Boot backend for login and register functionality. The connection uses JWT tokens for authentication.

## Backend Details

### Technology
- **Framework**: Spring Boot 3.x
- **Language**: Java
- **Database**: MySQL (localhost:3306)
- **Authentication**: JWT (JSON Web Tokens)
- **Port**: 8080 (default)

### Database Configuration
From your `application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/revive
spring.datasource.username=root
spring.datasource.password=123456
```

### JWT Configuration
```properties
app.jwt.secret=replace-this-with-a-long-random-secret-key-at-least-32-bytes
app.jwt.expiration-ms=86400000  # 24 hours
```

### CORS Configuration
Your backend already allows requests from:
- `http://localhost:5173` (Vite)
- `http://localhost:3000` (React)

## API Endpoints

### 1. Login
**URL**: `POST http://localhost:8080/api/auth/login`

**Request**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response** (200 OK):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "CLIENT",
  "name": "User Name",
  "email": "user@example.com"
}
```

**Error** (400/401):
```json
{
  "message": "Invalid credentials"
}
```

### 2. Register
**URL**: `POST http://localhost:8080/api/auth/register`

**Request**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response** (200/201):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "CLIENT",
  "name": "John Doe",
  "email": "john@example.com"
}
```

**Error** (400):
```json
{
  "message": "Email is already registered"
}
```

### Password Requirements
- **Minimum length**: 8 characters
- **Maximum length**: 100 characters
- No special character requirements (enforced at backend)

## Frontend Configuration

### 1. Create `.env` file
In `revive-sneaker/` directory, create a `.env` file:

```bash
# Copy from .env.example
REACT_APP_API_URL=http://localhost:8080/api
```

### 2. Running the Frontend
```bash
cd revive-sneaker
npm start
```

This starts the React dev server on `http://localhost:3000`

## Using the Authentication

### Login/Register Modal
- Click the "LOG IN" button in the navbar to open the modal
- Toggle between Login and Sign Up modes
- The modal handles all authentication automatically

### Accessing User Data
After successful login/register, user information is stored in localStorage:

```javascript
import { authAPI } from "./api";

// Get current user
const user = authAPI.getCurrentUser();
console.log(user);
// Output: { name: "John", email: "john@example.com", role: "CLIENT" }

// Get auth token (for other API calls)
const token = authAPI.getAuthToken();

// Check if authenticated
if (authAPI.isAuthenticated()) {
  // Make authenticated requests
}

// Logout
authAPI.logout();
```

### Making Authenticated API Requests
For protected endpoints, include the JWT token:

```javascript
const token = authAPI.getAuthToken();

fetch('http://localhost:8080/api/orders', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

## Your Backend Endpoints

Your backend has the following protected routes:

### Admin Routes (`/api/admin/**`)
- Requires `ADMIN` role

### Client Routes (`/api/client/**`)
- Requires `CLIENT` role

### Authenticated Routes (`/api/orders/**`)
- Requires valid JWT token

### Public Routes
- `/api/auth/login` ✓
- `/api/auth/register` ✓
- `/api/health`
- `/h2-console/**`
- `/uploads/**`

## Testing the Connection

1. **Start MySQL** (ensure database is running)
2. **Start Backend**:
   ```bash
   cd demo
   ./mvnw spring-boot:run
   # or
   mvn spring-boot:run
   ```
   Backend runs on `http://localhost:8080`

3. **Start Frontend**:
   ```bash
   cd frontend/revive-sneaker
   npm install  # if not already done
   npm start
   ```
   Frontend runs on `http://localhost:3000`

4. **Test Login/Register**:
   - Click "LOG IN" button
   - Register a new account
   - Login with the account
   - Check browser DevTools > Application > LocalStorage for stored token and user data

## Error Handling

The frontend displays error messages directly in the modal:

### Common Errors
1. **"Email is already registered"** - Use a different email
2. **"Invalid credentials"** - Check email/password
3. **"Password must be at least 8 characters"** - Use longer password
4. **Network errors** - Check if backend is running on port 8080

## Security Notes

### What's Already Implemented
✓ JWT token-based authentication
✓ Password hashing (BCrypt)
✓ CORS configured for frontend
✓ Stateless session management
✓ Token expiration (24 hours)

### Frontend Security
✓ Tokens stored in localStorage
✓ Tokens cleared on logout
✓ User data cached locally for quick access
✓ Error messages safe (no sensitive data exposed)

### Backend Security
✓ Passwords never returned in responses
✓ Email validated and normalized (lowercase)
✓ Roles-based access control (ADMIN/CLIENT)
✓ JWT signature verification on each request

## User Roles

Your system has two roles:

### CLIENT (Default for new registrations)
- Can create orders
- Can view their orders
- Can access client endpoints

### ADMIN
- Can manage orders
- Can update order status
- Can approve quotes
- Can access admin endpoints

To make a user ADMIN, manually update the database:
```sql
UPDATE user SET role = 'ADMIN' WHERE email = 'admin@example.com';
```

## File Structure

```
frontend/revive-sneaker/
├── src/
│   ├── App.js (LoginModal component)
│   ├── api.js (API client - handles all auth calls)
│   └── ...
├── .env.example (configuration template)
├── package.json
└── ...
```

## Next Steps

1. **Test the connection** - Register and login
2. **Store user context** - Use React Context or Redux to manage auth state globally
3. **Protect routes** - Create private routes that require authentication
4. **Add auth header** - Include JWT token in all API requests
5. **Refresh tokens** - Implement token refresh before expiration (optional)
6. **Update UI** - Show user name/role in navbar when logged in

## Troubleshooting

### Backend not connecting
- Ensure MySQL is running on port 3306
- Check `application.properties` credentials
- Verify backend is on port 8080
- Check browser console for CORS errors

### "CORS error"
- Backend CORS is already configured for localhost:3000
- For production, update `SecurityConfig.java` with your domain

### "Invalid token"
- Token expired (24 hours) - User needs to login again
- Token malformed - Clear localStorage and re-login
- JWT secret mismatch - Ensure backend `app.jwt.secret` is properly set

## Questions?

All authentication is now connected! The frontend automatically:
- ✓ Sends requests to correct endpoint
- ✓ Handles JWT tokens
- ✓ Validates passwords (8+ chars)
- ✓ Stores user data in localStorage
- ✓ Shows error/success messages
