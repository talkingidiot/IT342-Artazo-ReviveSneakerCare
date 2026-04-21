@echo off
REM GitHub OAuth2 Integration - Quick Start Script for Windows

echo ==================================
echo GitHub OAuth2 Setup Helper
echo ==================================
echo.

REM Check if we're in the right directory
if not exist "pom.xml" if not exist "package.json" (
    echo Error: Please run this script from the project root directory
    pause
    exit /b 1
)

echo Step 1: GitHub OAuth App Registration
echo =======================================
echo 1. Go to: https://github.com/settings/developers
echo 2. Click 'New OAuth App'
echo 3. Fill in:
echo    - Application name: ReviveSneakerCare
echo    - Homepage URL: http://localhost:5173
echo    - Authorization callback URL: http://localhost:8080/api/auth/oauth2/callback/github
echo 4. Save your Client ID and Client Secret
echo.

set /p confirm="Have you registered the GitHub OAuth App? (y/n): "
if /i not "%confirm%"=="y" (
    exit /b 1
)

echo.
echo Step 2: Configure Backend
echo ==========================

if exist "backend\demo\src\main\resources\application.properties" (
    set /p CLIENT_ID="Enter your GitHub Client ID: "
    set /p CLIENT_SECRET="Enter your GitHub Client Secret: "
    
    REM Check if configuration already exists
    findstr /M "spring.security.oauth2.client.registration.github.clientId" "backend\demo\src\main\resources\application.properties" >nul
    if %errorlevel%==0 (
        echo GitHub OAuth2 configuration already exists in application.properties
    ) else (
        echo Please manually add to backend\demo\src\main\resources\application.properties:
        echo spring.security.oauth2.client.registration.github.clientId=%CLIENT_ID%
        echo spring.security.oauth2.client.registration.github.clientSecret=%CLIENT_SECRET%
    )
) else (
    echo application.properties not found
)

echo.
echo Step 3: Configure Frontend
echo ==========================

if exist "frontend\.env.local" (
    echo frontend\.env.local already exists
) else (
    set /p CLIENT_ID="Enter your GitHub Client ID (again): "
    
    (
        echo # GitHub OAuth2 Credentials
        echo VITE_GITHUB_CLIENT_ID=%CLIENT_ID%
        echo # Backend API URL
        echo VITE_API_BASE_URL=http://localhost:8080/api
    ) > frontend\.env.local
    
    echo Created frontend\.env.local
)

echo.
echo Step 4: Install Dependencies
echo ==============================

REM Check and install backend dependencies
if exist "backend\demo\pom.xml" (
    set /p install_backend="Run 'mvn clean install' for backend? (y/n): "
    if /i "%install_backend%"=="y" (
        cd backend\demo
        call mvn clean install
        cd ..\..
    )
)

REM Check and install frontend dependencies
if exist "frontend\package.json" (
    set /p install_frontend="Run 'npm install' for frontend? (y/n): "
    if /i "%install_frontend%"=="y" (
        cd frontend
        call npm install
        cd ..
    )
)

echo.
echo ==================================
echo Setup Complete! 
echo ==================================
echo.
echo Next steps:
echo 1. Start Backend: cd backend\demo ^&^& mvn spring-boot:run
echo 2. Start Frontend: cd frontend ^&^& npm run dev
echo 3. Open: http://localhost:5173
echo 4. Click 'Sign in with GitHub' to test
echo.
echo For more details, see GITHUB_OAUTH2_COMPLETE_SETUP.md
echo.
pause
