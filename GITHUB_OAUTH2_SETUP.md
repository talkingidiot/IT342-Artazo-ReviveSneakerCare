# GitHub OAuth2 Implementation Guide

## Phase 1: GitHub App Registration

### Step 1: Register GitHub OAuth Application
1. Go to GitHub Settings → Developer settings → OAuth Apps → New OAuth App
2. Fill in the application form:
   - **Application name**: ReviveSneakerCare
   - **Homepage URL**: `http://localhost:5173` (development)
   - **Authorization callback URL**: `http://localhost:8080/api/auth/oauth2/callback/github`
3. You'll receive:
   - **Client ID**: Save this
   - **Client Secret**: Save this securely

### Step 2: Update application.properties
Add the following configuration:
```properties
# GitHub OAuth2 Configuration
spring.security.oauth2.client.registration.github.clientId=YOUR_CLIENT_ID
spring.security.oauth2.client.registration.github.clientSecret=YOUR_CLIENT_SECRET
spring.security.oauth2.client.registration.github.redirectUri={baseUrl}/api/auth/oauth2/callback/github
spring.security.oauth2.client.registration.github.scope=user:email
spring.security.oauth2.client.provider.github.authorizationUri=https://github.com/login/oauth/authorize
spring.security.oauth2.client.provider.github.tokenUri=https://github.com/login/oauth/access_token
spring.security.oauth2.client.provider.github.userInfoUri=https://api.github.com/user
spring.security.oauth2.client.provider.github.userNameAttribute=login

# OAuth2 Frontend Redirect
app.oauth2.frontend-callback-url=http://localhost:5173/oauth/callback
```

## Phase 2: Backend Implementation

### 1. Add Dependency to pom.xml
```xml
<dependency>
    <groupId>org.springframework.security</groupId>
    <artifactId>spring-security-oauth2-client</artifactId>
</dependency>
```

### 2. Update User Model
Add OAuth2 provider fields to support both email/password and OAuth2 authentication.

### 3. Create DTOs for OAuth2 responses
- `OAuth2AuthResponse`: Response with token and user info
- `OAuth2UserDto`: GitHub user information

### 4. Create OAuth2 Service
- `OAuth2Service`: Handle OAuth2 user creation/retrieval
- Implement custom `OAuth2UserService`

### 5. Create OAuth2 Callback Endpoint
- `/api/auth/oauth2/callback/github`: Handle OAuth2 callback
- Extract authorization code, exchange for token
- Create/update user in database
- Generate JWT token

### 6. Update Security Configuration
- Configure OAuth2 login
- Handle OAuth2 success/failure
- Update endpoint permissions

## Phase 3: Frontend Implementation

### 1. Create Login Component Updates
- Add "Sign in with GitHub" button
- Link to OAuth2 authorization endpoint

### 2. Create OAuth2 Callback Handler
- Handle redirect from GitHub
- Extract authorization code and state
- Call backend to verify and get JWT token
- Store token and user info
- Redirect to home page

### 3. Update React App State
- Detect OAuth2 login vs email/password login
- Display appropriate user info

## Security Considerations
- ✅ Use HTTPS in production
- ✅ Store secrets in environment variables
- ✅ Validate CSRF state parameter
- ✅ Secure JWT token storage
- ✅ Use refresh tokens for better security
- ✅ Validate all OAuth2 parameters

## Testing Flow
1. Click "Sign in with GitHub" button
2. Redirected to GitHub authorization page
3. User permits app access
4. Redirected to callback endpoint with code
5. Backend exchanges code for user info
6. Backend creates/updates user and generates JWT
7. Frontend stores JWT and redirects to home
