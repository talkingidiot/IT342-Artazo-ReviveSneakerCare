# GitHub OAuth2 Integration - Complete Setup Guide

## Part 1: GitHub App Registration

### 1. Register Your GitHub OAuth App
1. Go to **GitHub Settings** → **Developer settings** → **OAuth Apps** → **New OAuth App**
2. Fill in the following details:
   - **Application name**: ReviveSneakerCare
   - **Homepage URL**: `http://localhost:5173`
   - **Authorization callback URL**: `http://localhost:8080/api/auth/oauth2/callback/github`
3. GitHub will provide you:
   - **Client ID**: Copy and save this
   - **Client Secret**: Copy and save this securely

### 2. Create Environment Files

#### Backend (.env or application.properties)
In `backend/demo/src/main/resources/application.properties`, update:
```properties
spring.security.oauth2.client.registration.github.clientId=YOUR_GITHUB_CLIENT_ID
spring.security.oauth2.client.registration.github.clientSecret=YOUR_GITHUB_CLIENT_SECRET
app.oauth2.frontend-callback-url=http://localhost:5173/oauth/callback
```

#### Frontend (.env.local)
Create `frontend/.env.local`:
```env
VITE_GITHUB_CLIENT_ID=YOUR_GITHUB_CLIENT_ID
VITE_API_BASE_URL=http://localhost:8080/api
```

## Part 2: Backend Implementation (COMPLETED)

✅ **Added OAuth2 Client Dependency** to `pom.xml`
- `spring-security-oauth2-client`

✅ **Updated User Model** to support OAuth2
- `provider`: Which provider (github, email, etc.)
- `providerId`: Provider's unique ID
- `avatarUrl`: Profile picture from provider
- `password`: Made nullable for OAuth2 users

✅ **Created OAuth2 Service** (`OAuth2Service.java`)
- Exchanges authorization code for access token
- Fetches user information from GitHub API
- Creates/updates users in database

✅ **Created OAuth2 Callback Controller** (`OAuth2CallbackController.java`)
- Handles redirect from GitHub
- Generates JWT token
- Redirects to frontend with token and user data

✅ **Updated Application Properties**
- GitHub OAuth2 credentials
- Frontend callback URL

## Part 3: Frontend Implementation

### 3.1 Update environment variables
Create `.env.local` in the `frontend/` directory:
```
VITE_GITHUB_CLIENT_ID=YOUR_CLIENT_ID
VITE_API_BASE_URL=http://localhost:8080/api
```

### 3.2 Install React Router (if not already installed)
```bash
cd frontend
npm install react-router-dom
```

### 3.3 Update App.jsx to include OAuth2 callback route

Add this import at the top:
```javascript
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { OAuth2Callback } from "./OAuth2Callback";
import { GitHubLoginButton } from "./GitHubLoginButton";
```

Update your routing to include:
```javascript
<Routes>
  <Route path="/oauth/callback" element={<OAuth2Callback />} />
  <Route path="/" element={<YourMainApp />} />
</Routes>
```

### 3.4 Add GitHub Login Button to LoginModal

In your LoginModal component, add after the regular login button:
```javascript
import { GitHubLoginButton } from "./GitHubLoginButton";

// Inside LoginModal:
<GitHubLoginButton />
```

## Part 4: Complete OAuth2 Flow

### Step-by-Step Flow:
1. **User clicks "Sign in with GitHub"** button
2. **Redirects to GitHub** authorization page (`https://github.com/login/oauth/authorize?...`)
3. **User grants permission** on GitHub
4. **GitHub redirects back** to your backend callback endpoint with authorization code
5. **Backend** exchanges code for access token and fetches user info
6. **Backend** creates/updates user in database and generates JWT token
7. **Backend redirects** frontend callback page with token in URL
8. **Frontend** stores token and user data in localStorage
9. **Frontend** redirects to home page - user is logged in!

## Part 5: Update Your Login Component

Example updated login modal with GitHub:

```javascript
function LoginModal({ onClose }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const response = await apiRequest("/auth/login", {
        method: "POST",
        body: form,
      });
      localStorage.setItem(AUTH_TOKEN_KEY, response.token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify({
        name: response.name,
        email: response.email,
        provider: "email",
      }));
      window.location.reload(); // Refresh to show logged in state
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // ... existing modal code ...
    <GitHubLoginButton /> {/* Add this line */}
  );
}
```

## Part 6: Testing

### Test GitHub OAuth Login:
1. Start your backend: `mvn spring-boot:run` (from `backend/demo/`)
2. Start your frontend: `npm run dev` (from `frontend/`)
3. Go to http://localhost:5173
4. Click "Sign in with GitHub"
5. Login with your GitHub account
6. Grant permissions
7. You should be redirected back and logged in!

## Part 7: Production Deployment

### Before deploying to production:
1. Update Authorization callback URL in GitHub OAuth App settings
2. Change `app.oauth2.frontend-callback-url` to production frontend URL
3. Use environment variables for secrets (never commit credentials)
4. Use HTTPS in production
5. Add production domain to CORS configuration

### Environment Variables for Production:
```bash
SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GITHUB_CLIENTID=prod_client_id
SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GITHUB_CLIENTSECRET=prod_client_secret
APP_OAUTH2_FRONTEND_CALLBACK_URL=https://yourdomain.com/oauth/callback
```

## Troubleshooting

### Issue: "Invalid redirect URI"
- **Solution**: Make sure the callback URL in your code matches exactly what's registered in GitHub OAuth App settings

### Issue: "Authorization code expired"
- **Solution**: The code is only valid for a few minutes. Ensure your backend processes it quickly

### Issue: "User email is null from GitHub"
- **Solution**: Add `user:email` scope in GitHub OAuth App - some users have private emails
- **Fallback**: Use GitHub's login field as email if needed

### Issue: Token not stored in localStorage
- **Solution**: Check browser console for errors, verify callback route exists in your app

## Security Checklist

- ✅ Never expose Client Secret in frontend code
- ✅ Always use HTTPS in production
- ✅ Validate CSRF state parameter (optional but recommended)
- ✅ Store JWT tokens securely (consider httpOnly cookies for production)
- ✅ Set appropriate JWT expiration time
- ✅ Use refresh tokens for long-lived sessions
- ✅ Validate all user input from OAuth provider

## Files Modified/Created

**Backend:**
- ✅ `pom.xml` - Added OAuth2 client dependency
- ✅ `src/main/java/com/sia/demo/model/User.java` - Added OAuth2 fields
- ✅ `src/main/java/com/sia/demo/repository/UserRepository.java` - Added OAuth2 query method
- ✅ `src/main/java/com/sia/demo/service/OAuth2Service.java` - New OAuth2 service
- ✅ `src/main/java/com/sia/demo/controller/OAuth2CallbackController.java` - New callback endpoint
- ✅ `src/main/java/com/sia/demo/dto/OAuth2CallbackResponse.java` - New DTO
- ✅ `src/main/java/com/sia/demo/dto/GitHubUserDto.java` - New DTO
- ✅ `src/main/resources/application.properties` - Added OAuth2 config

**Frontend:**
- ✅ `src/GitHubLoginButton.jsx` - New GitHub login button component
- ✅ `src/OAuth2Callback.jsx` - New OAuth2 callback handler

**Configuration:**
- 📝 `frontend/.env.local` - To be created with GitHub Client ID

## Next Steps

1. ✅ Register GitHub OAuth App
2. ✅ Add credentials to application.properties
3. ✅ Create .env.local in frontend folder
4. ✅ Update App.jsx with routing
5. ✅ Test the flow
6. ✅ Deploy to production

Congratulations! Your GitHub OAuth2 authentication is ready! 🎉
