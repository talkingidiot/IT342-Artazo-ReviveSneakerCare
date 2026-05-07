# Updated Project Structure

## Branch
- `refactor-vertical-slice-testing`

## Backend
- `backend/demo/src/main/java/com/sia/demo/controller`
- `backend/demo/src/main/java/com/sia/demo/service`
- `backend/demo/src/main/java/com/sia/demo/repository`
- `backend/demo/src/main/java/com/sia/demo/model`
- `backend/demo/src/main/java/com/sia/demo/security`
- `backend/demo/src/main/java/com/sia/demo/dto`

## Web Frontend
- `frontend/src/App.jsx`
- `frontend/src/GitHubLoginButton.jsx`
- `frontend/src/OAuth2Callback.jsx`
- `frontend/src/assets`

## Mobile App
- `mobile/app/src/main/java/com/sia/mobile/MainActivity.kt`

## Notes
- The system is still functionally organized by feature screens and workflows.
- The backend remains layered internally, but the current branch adds assignment documentation and regression evidence.
- For a full academic vertical-slice refactor, the next step would be moving backend feature code into feature-based packages such as `auth`, `booking`, `admin`, and `contact`.
