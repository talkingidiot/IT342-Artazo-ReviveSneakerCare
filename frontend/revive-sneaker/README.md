# REVIVE - Sneaker Care Service Platform

A modern web application for booking and managing professional sneaker cleaning and restoration services.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Running the Application](#running-the-application)
- [Building for Production](#building-for-production)
- [Project Structure](#project-structure)
- [Authentication](#authentication)
- [API Integration](#api-integration)
- [GitHub Best Practices](#github-best-practices)
- [Contributing](#contributing)

## ✨ Features

- **User Authentication**: Secure login and registration with JWT tokens
- **Service Browsing**: Browse sneaker care services with detailed descriptions and pricing
- **Shopping Cart**: Add services to cart and manage quantities
- **Responsive Design**: Mobile-friendly interface with elegant UI
- **User Dashboard**: View account information and services after login
- **Service Booking**: Book sneaker care services online
- **Role-Based Access**: Admin and Client roles for different access levels
- **Persistent Authentication**: Remember user session across page refreshes

## 🛠️ Tech Stack

**Frontend:**
- React 19.2.4 - UI library
- React DOM 19.2.4 - React rendering
- React Scripts 5.0.1 - Build tools and development server
- CSS-in-JS - Inline styling (no external CSS framework)

**Backend:**
- Java Spring Boot 3.x
- Spring Data JPA / Hibernate ORM
- PostgreSQL Database
- JWT Authentication with BCrypt

**Infrastructure:**
- Supabase PostgreSQL (aws-1-ap-south-1.pooler.supabase.com:5432)

## 📦 Prerequisites

Before running this project, ensure you have:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** (v6 or higher) - Included with Node.js
- **Git** - [Download](https://git-scm.com/)
- Backend API running on `http://localhost:8080` (Java Spring Boot)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/revive-sneaker.git
cd revive-sneaker
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Verify Installation

```bash
npm start
```

The application opens at `http://localhost:3000`

## ⚙️ Environment Setup

### Create Environment Variables

```bash
cp .env.example .env
```

Add your backend API URL:

```env
REACT_APP_API_URL=http://localhost:8080/api
```

**Important:** Do not commit `.env` files - they're in `.gitignore`

## ▶️ Running the Application

### Development Mode

```bash
npm start
```

- Starts dev server at `http://localhost:3000`
- Auto-reloads on file changes
- Shows lint errors in console

### Test Mode

```bash
npm test
```

### Production Build

```bash
npm run build
```

Optimized build in `build/` folder ready for deployment

## 📁 Project Structure

```
revive-sneaker/
├── public/
│   ├── index.html
│   ├── manifest.json
│   └── robots.txt
├── src/
│   ├── App.js              # Main component with auth
│   ├── App.css             # Global styles
│   ├── index.js            # Entry point
│   ├── api.js              # API client
│   └── ...other files
├── .env.example            # Environment template
├── .gitignore              # Git ignore rules
├── package.json            # Dependencies
└── README.md               # This file
```

## 🔐 Authentication

### Login Flow
1. User enters email and password
2. Frontend sends POST to `/auth/login`
3. Backend validates and returns JWT token
4. Token stored in localStorage
5. Dashboard displayed

### Registration Flow
1. User fills registration form
2. Password validated (minimum 8 characters)
3. POST to `/auth/register`
4. User created with hashed password
5. AUTO-LOGGED IN with token

### API Endpoints

**Login:**
```http
POST /auth/login
{ "email": "user@example.com", "password": "password123" }
```

**Register:**
```http
POST /auth/register
{ "name": "John", "email": "john@example.com", "password": "password123" }
```

## 📤 GitHub Push Guide - Best Practices

### Step 1: Initial Setup

```bash
# Initialize git (if new)
git init

# Add all files
git add .

# First commit
git commit -m "initial: Setup REVIVE Sneaker Care platform"
```

### Step 2: Connect to GitHub

```bash
# Add remote repository
git remote add origin https://github.com/your-username/revive-sneaker.git

# Set main branch
git branch -M main

# Push to GitHub
git push -u origin main
```

### Step 3: Commit Best Practices

**Use clear commit messages with prefixes:**

```bash
git commit -m "feat: Add user authentication system"
git commit -m "fix: Resolve login button click issue"
git commit -m "docs: Update README with setup instructions"
git commit -m "style: Fix Dashboard component styling"
git commit -m "refactor: Extract API client module"
```

**Commit Types:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Code style/formatting
- `refactor:` Code refactoring
- `test:` Add/update tests
- `chore:` Build process, dependencies

### Step 4: Before Each Push

```bash
# 1. Check status
git status

# 2. Review changes
git diff

# 3. Pull latest changes
git pull origin main

# 4. Test locally
npm start
npm run build

# 5. Commit changes
git add .
git commit -m "type: descriptive message"

# 6. Push to GitHub
git push origin main
```

### Step 5: Feature Branch Workflow (Recommended)

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "feat: Add new feature"

# Push branch
git push -u origin feature/new-feature

# On GitHub: Create Pull Request
# After review and approval: Merge to main
```

### Step 6: What NOT to Commit

These files are already in `.gitignore`:
- `.env` - Environment variables with secrets
- `node_modules/` - Dependencies
- `.DS_Store` - macOS files
- `build/` - Production build
- `.vscode/` - IDE config

**Verify before committing:**
```bash
# Check what will be ignored
git check-ignore -v *

# Verify .env is ignored
git check-ignore .env
```

### Step 7: Useful Git Commands

```bash
# View commit history
git log --oneline

# View specific changes
git show commit-hash

# Undo last commit (keep changes)
git reset --soft HEAD~1

# View all branches
git branch -a

# Delete branch
git branch -d feature-branch

# Sync with remote
git fetch origin
git rebase origin/main

# Stash uncommitted changes
git stash
git stash pop
```

### Step 8: Pull Request Process

When contributing changes:

1. **Push feature branch**
2. **Create Pull Request on GitHub** with:
   - Descriptive title
   - Description of changes
   - Related issue numbers
3. **Request review**
4. **Address feedback**
5. **Merge to main** after approval

## ✅ Pre-Push Checklist

Before pushing to GitHub:

- [ ] Run `npm start` - App starts without errors
- [ ] Run `npm run build` - Production build succeeds
- [ ] `git status` - Only intended files are staged
- [ ] `.env` is NOT committed (check .gitignore)
- [ ] `node_modules/` is NOT committed
- [ ] Commit message is clear and descriptive
- [ ] Tested login/register functionality
- [ ] No console errors or warnings

## 🤝 Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'feat: Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📝 License

MIT License - See LICENSE file for details

## 🆘 Troubleshooting

**Port 3000 already in use:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Dependencies not installing:**
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Backend connection issues:**
- Ensure backend running on `http://localhost:8080`
- Check `.env` has correct API URL
- Verify CORS settings in backend

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
