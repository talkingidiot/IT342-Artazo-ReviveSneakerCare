# Frontend-Backend Connection Setup

## Overview
The frontend is now connected to the backend for login and register functionality. The API client is located in `src/api.js`.

## Configuration

### Setting the Backend URL
You can configure the backend API URL in two ways:

#### Option 1: Environment Variable (Recommended)
Create a `.env` file in the `revive-sneaker/` directory:
```
REACT_APP_API_URL=http://localhost:5000/api
```

#### Option 2: Default (if no .env is set)
By default, it uses: `http://localhost:5000/api`

## Backend API Requirements

Your backend must have the following endpoints:

### 1. Login Endpoint
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response Success (200):**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

**Response Error (4xx/5xx):**
```json
{
  "message": "Invalid email or password"
}
```

### 2. Register Endpoint
**POST** `/api/auth/register`

**Request Body:**
```json
{
  "name": "User Name",
  "email": "user@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Response Success (200/201):**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

**Response Error (4xx/5xx):**
```json
{
  "message": "Email already exists"
}
```

## Frontend Features Implemented

1. **Login Modal**
   - Email and password fields
   - Submit button with loading state
   - Error/success messages
   - Toggle to switch between login and register modes

2. **Register Modal**
   - Name, email, password, and confirm password fields
   - Password validation (must match)
   - Submit button with loading state
   - Error/success messages
   - Toggle to switch back to login mode

3. **Authentication Token**
   - Automatically stored in localStorage on successful login/register
   - Retrievable via `authAPI.getAuthToken()`
   - Removable via `authAPI.logout()`

## Using the API Client

```javascript
import { authAPI } from "./api";

// Login
try {
  const response = await authAPI.login("user@example.com", "password");
  console.log("User:", response.user);
} catch (error) {
  console.error("Login failed:", error.message);
}

// Register
try {
  const response = await authAPI.register("John Doe", "john@example.com", "pass123", "pass123");
  console.log("User:", response.user);
} catch (error) {
  console.error("Registration failed:", error.message);
}

// Get stored token
const token = authAPI.getAuthToken();

// Logout
authAPI.logout();
```

## Example Backend Implementation (Node.js/Express)

```javascript
const express = require('express');
const app = express();

app.use(express.json());

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Validate credentials against your database
  // Hash password comparison, etc.
  
  if (validCredentials) {
    const token = generateJWT(user); // Your JWT generation logic
    res.json({ 
      token, 
      user: { id: user.id, email: user.email, name: user.name } 
    });
  } else {
    res.status(401).json({ message: "Invalid email or password" });
  }
});

// Register endpoint
app.post('/api/auth/register', (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  
  // Validate input
  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }
  
  // Check if user exists, hash password, save to database
  
  const token = generateJWT(newUser);
  res.status(201).json({ 
    token, 
    user: { id: newUser.id, email: newUser.email, name: newUser.name } 
  });
});

app.listen(5000, () => console.log("Server running on port 5000"));
```

## CORS Configuration

Make sure your backend has CORS enabled to allow requests from the frontend:

```javascript
// Node.js/Express example
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:3000', // or your frontend URL
  credentials: true
}));
```

## Testing

1. Start your backend server (ensure it's running on the configured URL)
2. Start your frontend: `npm start`
3. Click the login button in the navbar
4. Test login and registration functionality

## Next Steps

After successful login/register:
- Store user information in a global state or context
- Add authenticated routes protection
- Include the JWT token in subsequent API requests (in Authorization header)
- Implement logout functionality
