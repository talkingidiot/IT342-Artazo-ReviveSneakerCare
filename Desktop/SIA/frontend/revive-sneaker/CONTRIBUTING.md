# Contributing Guide - REVIVE Sneaker Care Platform

Thank you for your interest in contributing to REVIVE! This guide will help you follow best practices when submitting code to this repository.

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Git Workflow](#git-workflow)
3. [Commit Conventions](#commit-conventions)
4. [Code Style](#code-style)
5. [Testing Before Push](#testing-before-push)
6. [Pull Request Process](#pull-request-process)
7. [Common Issues](#common-issues)

## Getting Started

### 1. Fork and Clone

```bash
# Fork on GitHub, then clone
git clone https://github.com/your-username/revive-sneaker.git
cd revive-sneaker

# Add upstream remote to sync with main repo
git remote add upstream https://github.com/original-owner/revive-sneaker.git
```

### 2. Create Feature Branch

```bash
# Update main branch
git fetch upstream
git checkout main
git rebase upstream/main

# Create feature branch
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/authentication` - New feature
- `fix/login-button` - Bug fix
- `docs/readme-update` - Documentation
- `refactor/api-client` - Code refactoring

## Git Workflow

### Step-by-Step Workflow

```bash
# 1. Make sure you're on main and updated
git checkout main
git pull upstream main

# 2. Create feature branch from main
git checkout -b feature/your-feature

# 3. Make your changes
# (edit files...)

# 4. Check what changed
git status
git diff

# 5. Stage your changes
git add .
# or stage specific files
git add src/api.js src/App.js

# 6. Commit with good message
git commit -m "feat: Add new authentication feature"

# 7. Push to your fork
git push origin feature/your-feature

# 8. Create Pull Request on GitHub
```

### Update Your Feature Branch

If main branch has new commits:

```bash
# Fetch latest from upstream
git fetch upstream

# Rebase your branch on main
git rebase upstream/main

# If conflicts, resolve them, then:
git add .
git rebase --continue

# Force push to your fork (only for your branch)
git push -f origin feature/your-feature
```

## Commit Conventions

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Example Commits

```bash
# Simple feature
git commit -m "feat: Add login button to homepage"

# Bug fix
git commit -m "fix: Resolve cart item removal bug"

# With scope
git commit -m "feat(auth): Implement JWT token refresh"

# Detailed commit
git commit -m "feat: Add service search functionality

- Implements full-text search
- Adds filter by category
- Updates API integration

Closes #123"
```

### Type Guidelines

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation only (README, comments)
- **style**: Code formatting (no logic changes)
- **refactor**: Code reorganization (no feature/fix)
- **test**: Add/update tests
- **chore**: Dependencies, build config
- **perf**: Performance improvements

### Subject Guidelines

- Use imperative mood: "add" not "added" or "adds"
- Don't capitalize first letter
- No period at end
- Limit to 50 characters
- Reference issue: "fix: Resolve #123 login bug"

### Body Guidelines (Optional)

- Wrap at 72 characters
- Explain WHAT and WHY, not HOW
- Reference issues and PRs
- Example:

```
feat: Add password strength indicator

This adds a real-time password strength meter to the registration form
to help users create stronger passwords. Uses color-coded feedback
(red, yellow, green) based on password entropy.

Closes #456
Related to #123
```

## Code Style

### React Component Style

```javascript
// Use clear, descriptive names
function LoginForm({ onSubmit, isLoading }) {
  // ...
}

// Use constants for magic numbers
const MIN_PASSWORD_LENGTH = 8;

// Use meaningful variable names
const isAuthenticated = authAPI.isAuthenticated();

// Format JSX nicely
return (
  <div>
    <button>Click me</button>
  </div>
);
```

### Comments

```javascript
// Good: Explain why, not what
// JWT tokens expire after 24 hours, so we check on app load
const token = localStorage.getItem('authToken');

// Avoid: Explaining obvious code
// Get the token from localStorage
const token = localStorage.getItem('authToken');
```

## Testing Before Push

### Run These Tests Before Every Push

```bash
# 1. Start the app (should have no errors)
npm start
# Check browser console for errors
# Test login/register manually

# 2. Build for production (should succeed)
npm run build

# 3. View all changes
git diff

# 4. Review commits
git log --oneline -5

# 5. Check git status
git status
```

### Critical Checks

Before pushing, ensure:
- [ ] App starts with `npm start` - NO errors
- [ ] Production build succeeds - `npm run build`
- [ ] NO `.env` file committed (in .gitignore)
- [ ] NO `node_modules/` committed (in .gitignore)
- [ ] Commit messages are clear
- [ ] Manually tested the feature in browser
- [ ] Console has NO errors/warnings
- [ ] Code follows project style

## Pull Request Process

### Creating a Pull Request

1. **Push your feature branch:**
   ```bash
   git push origin feature/your-feature
   ```

2. **On GitHub, click "New Pull Request"**

3. **Fill in the PR template:**
   ```markdown
   ## Description
   Brief description of what this PR does
   
   ## Type of Change
   - [ ] New feature
   - [ ] Bug fix
   - [ ] Breaking change
   - [ ] Documentation update
   
   ## Changes Made
   - Added X component
   - Fixed Y bug
   - Updated Z documentation
   
   ## Testing
   - Tested login flow with valid credentials
   - Tested with invalid credentials
   - Verified cart functionality
   
   ## Screenshots (if applicable)
   ![Login modal](screenshot.png)
   
   ## Related Issues
   Closes #123
   
   ## Notes
   Any additional context
   ```

4. **Request reviewers**

5. **Address feedback:**
   - Make requested changes
   - Commit: `git commit -m "review: Address feedback"`
   - Push: `git push origin feature/your-feature`

6. **After approval, merge:**
   - Use "Squash and merge" for clean history
   - Or "Create a merge commit" for detailed history

## Common Issues

### Issue: "Your branch is ahead of origin/main by 3 commits"

```bash
# This is normal for a feature branch
# Just make sure your PR is up to date before merging

git fetch upstream
git rebase upstream/main
git push -f origin feature/your-feature
```

### Issue: Merge Conflicts

```bash
# If you have conflicts when rebasing
git fetch upstream
git rebase upstream/main

# Conflicts will appear in editor
# Fix the conflicts, then:
git add .
git rebase --continue
git push -f origin feature/your-feature
```

### Issue: ".env accidentally committed"

```bash
# Remove from git history (don't do this if secrets are exposed)
git rm --cached .env
git commit -m "chore: Remove .env from tracking"
git push

# Create new .env locally (never commit!)
```

### Issue: "npm install failed"

```bash
# Clear npm cache
npm cache clean --force

# Delete lock files
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Issue: "Port 3000 already in use"

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

## Questions?

- Check the main [README.md](README.md)
- Open an issue on GitHub
- Contact the maintainers

---

**Thank you for contributing to REVIVE! 🙏**
