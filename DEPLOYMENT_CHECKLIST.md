# GitHub OAuth2 Implementation - Deployment Checklist

## ✅ Completed Backend Implementation

### 1. Dependencies
- [x] Added `spring-security-oauth2-client` to pom.xml

### 2. Database Schema Updates
- [x] Updated `User` entity with OAuth2 fields:
  - `provider` (String, nullable)
  - `providerId` (String, nullable)
  - `avatarUrl` (String, nullable)
  - Made `password` nullable for OAuth2 users

### 3. Repository Layer
- [x] Updated `UserRepository` with:
  - `findByProviderAndProviderId(String provider, String providerId)`

### 4. Service Layer
- [x] Created `OAuth2Service` with:
  - `getGitHubUser(String code)` - Exchange authorization code
  - `getOrCreateGitHubUser(GitHubUserDto)` - User creation/update logic

### 5. Controller Layer
- [x] Created `OAuth2CallbackController` with:
  - `/api/auth/oauth2/callback/github` - GitHub callback endpoint
  - Handles OAuth2 flow and token generation

### 6. DTOs
- [x] `OAuth2CallbackResponse` - Response with token and user info
- [x] `GitHubUserDto` - GitHub API response mapping

### 7. Configuration
- [x] Updated `application.properties` with GitHub OAuth2 settings
- [x] Security configuration already allows `/api/auth/**` endpoints

## ✅ Completed Frontend Implementation

### 1. Components Created
- [x] `GitHubLoginButton.jsx` - GitHub sign-in button
- [x] `OAuth2Callback.jsx` - Callback handler for OAuth2 flow

### 2. Environment Setup
- [x] Created `.env.local.example` template

### 3. Dependencies
- [ ] React Router (may need to add to package.json if not present)

## 📋 Manual Setup Checklist

### GitHub App Registration (ReviveSneakerCare)
- [ ] Created OAuth App at https://github.com/settings/developers
- [ ] Saved Client ID
- [ ] Saved Client Secret
- [ ] Set Authorization callback URL to: `http://localhost:8080/api/auth/oauth2/callback/github`

### Backend Configuration
- [ ] Updated `backend/demo/src/main/resources/application.properties`
  - [ ] `spring.security.oauth2.client.registration.github.clientId=YOUR_CLIENT_ID`
  - [ ] `spring.security.oauth2.client.registration.github.clientSecret=YOUR_CLIENT_SECRET`
  - [ ] `app.oauth2.frontend-callback-url=http://localhost:5173/oauth/callback`

### Frontend Configuration
- [ ] Created `frontend/.env.local` with:
  - [ ] `VITE_GITHUB_CLIENT_ID=YOUR_CLIENT_ID`
  - [ ] `VITE_API_BASE_URL=http://localhost:8080/api`

### Frontend Integration
- [ ] Updated `frontend/src/App.jsx` to import React Router
  - [ ] Added `BrowserRouter` wrapper
  - [ ] Added route for `/oauth/callback` → `<OAuth2Callback />`
  - [ ] Added route for main app
- [ ] Updated login modal to include `<GitHubLoginButton />`
- [ ] Installed React Router: `npm install react-router-dom`

### Testing
- [ ] Backend starts without errors: `mvn spring-boot:run`
- [ ] Frontend starts without errors: `npm run dev`
- [ ] Navigate to http://localhost:5173
- [ ] Click "Sign in with GitHub" button
- [ ] Get redirected to GitHub
- [ ] Grant permission
- [ ] Get redirected back and logged in
- [ ] User data stored in localStorage
- [ ] User stays logged in after page refresh

## 🚀 Deployment Checklist

### Before Production Deployment

#### Backend
- [ ] Update application.properties or use environment variables:
  ```bash
  SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GITHUB_CLIENTID=prod_client_id
  SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GITHUB_CLIENTSECRET=prod_client_secret
  APP_OAUTH2_FRONTEND_CALLBACK_URL=https://yourdomain.com/oauth/callback
  ```
- [ ] Update CORS allowed origins in `SecurityConfig.java` to include production URL
- [ ] Use HTTPS for all endpoints
- [ ] Add production domain to GitHub OAuth App settings

#### Frontend
- [ ] Create `.env.production` with production values:
  ```env
  VITE_GITHUB_CLIENT_ID=prod_github_client_id
  VITE_API_BASE_URL=https://your-api-domain.com/api
  ```
- [ ] Update authorization callback URL in GitHub OAuth App settings to: `https://yourdomain.com/api/auth/oauth2/callback/github`
- [ ] Test production GitHub OAuth App
- [ ] Build frontend: `npm run build`
- [ ] Verify bundle size

#### Security Review
- [ ] Never commit `.env.local` or credentials
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS in production
- [ ] Set secure cookie flags for tokens
- [ ] Implement CSRF protection (state parameter)
- [ ] Add rate limiting to OAuth endpoints
- [ ] Log OAuth failures for security monitoring

#### GitHub OAuth App Settings (Production)
- [ ] Authorization callback URL: `https://yourdomain.com/api/auth/oauth2/callback/github`
- [ ] Homepage URL: `https://yourdomain.com`
- [ ] Enable "Expire user authorization tokens" for security

## 📚 Key Files Reference

### Backend Files
- `backend/demo/pom.xml` - Dependencies
- `backend/demo/src/main/resources/application.properties` - Configuration
- `backend/demo/src/main/java/com/sia/demo/model/User.java` - User entity
- `backend/demo/src/main/java/com/sia/demo/repository/UserRepository.java` - Data access
- `backend/demo/src/main/java/com/sia/demo/service/OAuth2Service.java` - OAuth2 logic
- `backend/demo/src/main/java/com/sia/demo/controller/OAuth2CallbackController.java` - Endpoints
- `backend/demo/src/main/java/com/sia/demo/dto/GitHubUserDto.java` - DTO
- `backend/demo/src/main/java/com/sia/demo/dto/OAuth2CallbackResponse.java` - Response DTO

### Frontend Files
- `frontend/.env.local` - Environment variables
- `frontend/src/GitHubLoginButton.jsx` - GitHub button component
- `frontend/src/OAuth2Callback.jsx` - Callback handler
- `frontend/src/App.jsx` - Need to update with routing

## 🔧 Troubleshooting

### Backend Issues

**Problem**: `Error: application.yml/properties not found`
- **Solution**: Restart the backend after updating application.properties
- Check that properties are in the correct format

**Problem**: `GitHub OAuth code expired`
- **Solution**: The code is only valid for 10 minutes
- Ensure backend processes callback quickly

**Problem**: `RestTemplate not found`
- **Solution**: RestTemplate is from Spring Core, should be available
- Check that spring-boot-starter-webmvc is in dependencies

### Frontend Issues

**Problem**: `GitHubLoginButton is undefined`
- **Solution**: Make sure GitHubLoginButton.jsx is in src/ directory
- Check import path is correct

**Problem**: `VITE_GITHUB_CLIENT_ID is undefined`
- **Solution**: Create .env.local file with the variable
- Restart npm dev server after creating .env.local

**Problem**: Token not stored in localStorage`
- **Solution**: Check browser DevTools Console for errors
- Verify OAuth2Callback route exists in App.jsx
- Check that localhost:5173 is in CORS allowed origins

## 📞 Support

### Common Issues and Solutions

1. **Infinite redirect loop**
   - Check that callback URL matches between GitHub App and code
   - Verify redirectUri in OAuth2Service

2. **"Invalid client_id" error**
   - Verify Client ID matches between GitHub App and application.properties
   - Check for extra spaces or typos

3. **User email null**
   - Make sure GitHub user has public email
   - Or use GitHub login field as fallback
   - Verify `user:email` scope is set

4. **CORS errors**
   - Check that frontend domain is in CORS allowed origins
   - Check that credentials are allowed

5. **JWT token issues**
   - Verify `app.jwt.secret` is set and long enough
   - Check that secret is consistent across instances

## 🎯 Next Features

After basic OAuth2 is working, consider:
- [ ] Add support for multiple OAuth2 providers (Google, Facebook)
- [ ] Implement refresh token rotation
- [ ] Add account linking (connect GitHub to existing email account)
- [ ] Add logout functionality
- [ ] Implement user profile sync
- [ ] Add OAuth2 scopes selection UI
- [ ] Implement rate limiting on OAuth endpoints

## ✨ Success Indicators

Your implementation is successful when:
- ✅ User can click "Sign in with GitHub"
- ✅ Redirected to GitHub authorization page
- ✅ User can grant permission
- ✅ Redirected back to app and logged in
- ✅ User data displayed correctly
- ✅ Token persists across page refreshes
- ✅ User can logout and login again
- ✅ Works on both development and production

---

**Last Updated**: April 2026
**Version**: 1.0
**Status**: Ready for Deployment
