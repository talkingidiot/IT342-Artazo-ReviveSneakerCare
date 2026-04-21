#!/bin/bash

# GitHub OAuth2 Integration - Quick Start Script
# This script helps you set up GitHub OAuth2 authentication

echo "=================================="
echo "GitHub OAuth2 Setup Helper"
echo "=================================="
echo ""

# Check if we're in the right directory
if [ ! -f "pom.xml" ] && [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "Step 1: GitHub OAuth App Registration"
echo "======================================="
echo "1. Go to: https://github.com/settings/developers"
echo "2. Click 'New OAuth App'"
echo "3. Fill in:"
echo "   - Application name: ReviveSneakerCare"
echo "   - Homepage URL: http://localhost:5173"
echo "   - Authorization callback URL: http://localhost:8080/api/auth/oauth2/callback/github"
echo "4. Save your Client ID and Client Secret"
echo ""

read -p "Have you registered the GitHub OAuth App? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

echo ""
echo "Step 2: Configure Backend"
echo "========================="

# Check if backend config file exists
if [ -f "backend/demo/src/main/resources/application.properties" ]; then
    read -p "Enter your GitHub Client ID: " CLIENT_ID
    read -sp "Enter your GitHub Client Secret: " CLIENT_SECRET
    echo ""
    
    # Check if already configured
    if grep -q "spring.security.oauth2.client.registration.github.clientId" backend/demo/src/main/resources/application.properties; then
        echo "✅ GitHub OAuth2 configuration already exists in application.properties"
    else
        echo "⚠️  Please manually add to backend/demo/src/main/resources/application.properties:"
        echo "spring.security.oauth2.client.registration.github.clientId=$CLIENT_ID"
        echo "spring.security.oauth2.client.registration.github.clientSecret=$CLIENT_SECRET"
    fi
else
    echo "❌ application.properties not found"
fi

echo ""
echo "Step 3: Configure Frontend"
echo "=========================="

# Create .env.local for frontend
if [ -f "frontend/.env.local" ]; then
    echo "⚠️  frontend/.env.local already exists"
else
    read -p "Enter your GitHub Client ID (again): " CLIENT_ID
    
    cat > frontend/.env.local << EOF
VITE_GITHUB_CLIENT_ID=$CLIENT_ID
VITE_API_BASE_URL=http://localhost:8080/api
EOF
    
    echo "✅ Created frontend/.env.local"
fi

echo ""
echo "Step 4: Install Dependencies"
echo "============================="

# Check and install backend dependencies
if [ -f "backend/demo/pom.xml" ]; then
    read -p "Run 'mvn clean install' for backend? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cd backend/demo
        mvn clean install
        cd ../..
    fi
fi

# Check and install frontend dependencies
if [ -f "frontend/package.json" ]; then
    read -p "Run 'npm install' for frontend? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cd frontend
        npm install
        cd ..
    fi
fi

echo ""
echo "=================================="
echo "Setup Complete! 🎉"
echo "=================================="
echo ""
echo "Next steps:"
echo "1. Start Backend: cd backend/demo && mvn spring-boot:run"
echo "2. Start Frontend: cd frontend && npm run dev"
echo "3. Open: http://localhost:5173"
echo "4. Click 'Sign in with GitHub' to test"
echo ""
echo "For more details, see GITHUB_OAUTH2_COMPLETE_SETUP.md"
