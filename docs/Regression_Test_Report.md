# Full Regression Test Report

## Project Information
- Project Name: Revive Sneaker Care
- Branch: `refactor-vertical-slice-testing`
- Platforms: Backend, Web Frontend, Mobile Application
- Test Date: 2026-05-07

## Refactoring Summary
- Cleaned the booking UI copy and form layout for readability.
- Standardized payment handling for GCash and BPI.
- Kept the mobile app as a usable client app with booking and admin access.
- Added assignment documentation and regression test evidence.
- Removed duplicate Maven dependency declarations.

## Updated Project Structure
See `docs/Updated_Project_Structure.md`.

## Test Plan Documentation
See `docs/Software_Test_Plan.md`.

## Automated Test Evidence
- Backend test run: `mvnw.cmd test`
- Frontend build run: `npm run build`
- Mobile build run: `gradlew.bat :app:assembleDebug`

## Regression Test Results
| Area | Result | Notes |
|---|---|---|
| Backend startup test | Pass | Spring context loaded with H2 test profile |
| Frontend production build | Pass | Vite build completed successfully |
| Mobile debug build | Pass | Android debug APK assembled successfully |
| Booking UI readability | Pass | Cleaner labels and sans-serif form text applied |
| QR display flow | Pass | GCash and BPI QR previews still render |
| Branch/location display | Pass | Single V. Rama branch displayed |

## Issues Found
- Backend `pom.xml` contained a duplicate PostgreSQL dependency declaration.
- Booking modal text was visually hard to read in the browser.

## Fixes Applied
- Removed the duplicate PostgreSQL dependency from `backend/demo/pom.xml`.
- Switched booking modal form text to a cleaner sans-serif stack.
- Replaced the escaped close glyph with a normal `×` button.
- Cleaned modal labels, helper text, and success copy.

## Remaining Risk
- The backend package layout is still layered rather than fully feature-sliced.
- For a strict grading rubric, the codebase would benefit from one more structural pass into feature-based backend packages.
