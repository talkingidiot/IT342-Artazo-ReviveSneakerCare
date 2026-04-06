# Quick GitHub Push Guide

## 🚀 First Time Setup (One Time Only)

```bash
# 1. Initialize git in project
git init

# 2. Add all files
git add .

# 3. Initial commit
git commit -m "initial: Setup REVIVE Sneaker Care platform"

# 4. Create repository on GitHub at https://github.com/new

# 5. Connect to GitHub
git remote add origin https://github.com/YOUR-USERNAME/revive-sneaker.git
git branch -M main
git push -u origin main
```

## 📤 Everyday Workflow (Use This Every Time)

### Before You Start Working
```bash
git pull origin main
```

### After Making Changes
```bash
# See what changed
git status
git diff

# Stage changes
git add .

# Commit with clear message
git commit -m "type: description"
# Examples:
# git commit -m "feat: Add authentication"
# git commit -m "fix: Resolve login button bug"
# git commit -m "docs: Update README"

# Push to GitHub
git push origin main
```

## 🔄 Feature Branch Workflow (Recommended for Teams)

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes and commit
git add .
git commit -m "feat: Your feature"

# Push branch
git push -u origin feature/your-feature

# On GitHub: Create Pull Request
# After approval: Merge and delete branch
```

## ✅ Pre-Push Checklist

- [ ] `npm start` works without errors
- [ ] `npm run build` succeeds
- [ ] `git diff` shows only intended changes
- [ ] `.env` is NOT included (should be in .gitignore)
- [ ] Commit message is clear and follows convention
- [ ] No console errors/warnings in browser

## 📝 Commit Message Convention

```
feat:    New feature (feat: Add login button)
fix:     Bug fix (fix: Resolve cart bug)
docs:    Documentation (docs: Update README)
style:   Code formatting (style: Format code)
refactor: Refactor code (refactor: Extract API client)
test:    Add tests (test: Add login tests)
chore:   Build/deps (chore: Update packages)
```

## 🛠️ Useful Commands

```bash
# View commit history
git log --oneline

# View recent commits
git log --oneline -10

# See all branches
git branch -a

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Check status
git status

# Delete a branch
git branch -d branch-name

# Stash changes temporarily
git stash
git stash pop
```

## ⚠️ DO NOT COMMIT

- `.env` - Environment variables (already in .gitignore)
- `node_modules/` - Dependencies
- `build/` - Production build
- `.DS_Store` - Mac files
- IDE config files

## 🆘 Common Issues & Fixes

### Port 3000 in use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Dependencies broken
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Need to update feature branch
```bash
git fetch origin
git rebase origin/main
git push -f origin feature-name
```

---

## ⚡ TL;DR - Super Quick Version

```bash
# First time
git init && git add . && git commit -m "initial: setup"
git remote add origin https://github.com/USERNAME/revive-sneaker.git
git push -u origin main

# Every other time
git pull origin main          # Get latest
git add .                     # Stage changes
git commit -m "type: desc"    # Commit
git push origin main          # Push to GitHub
```

**Questions? Read CONTRIBUTING.md or README.md**
