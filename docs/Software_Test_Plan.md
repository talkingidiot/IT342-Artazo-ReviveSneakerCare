# Software Test Plan

## Project Information
- Project: Revive Sneaker Care
- Scope: Web frontend, Spring Boot backend, Android mobile app
- Goal: Validate that the refactored application still works after restructuring and UI cleanup

## Functional Requirements Coverage
| ID | Requirement | Covered By |
|---|---|---|
| FR-01 | Client can view services | Web home/services section, mobile services screen |
| FR-02 | Client can book a service | Web booking modal, mobile booking screen |
| FR-03 | Client can upload shoe photos | Web and mobile booking upload flow |
| FR-04 | Client can choose payment method | GCash/BPI payment selection |
| FR-05 | Client can upload payment proof | Screenshot upload before submit |
| FR-06 | Client can view branch/location | Web branch section, mobile branches screen |
| FR-07 | User authentication works | Login/register flow |
| FR-08 | Admin order operations work | Backend admin endpoints and mobile admin screen |
| FR-09 | Backend persists data | Spring Boot tests and runtime checks |

## Test Cases
| TC | Scenario | Expected Result |
|---|---|---|
| TC-01 | Open web app home page | Services and branch sections render correctly |
| TC-02 | Open booking modal | Form fields and payment options render cleanly |
| TC-03 | Select GCash payment | GCash QR displays and screenshot upload becomes available |
| TC-04 | Select BPI payment | BPI QR displays and screenshot upload becomes available |
| TC-05 | Submit without login | User receives login requirement message |
| TC-06 | Submit without photos | User receives photo validation message |
| TC-07 | Submit without payment proof | User receives payment screenshot validation message |
| TC-08 | Submit valid booking | Booking is accepted and success state appears |
| TC-09 | Start backend tests | Spring Boot context loads successfully |
| TC-10 | Build frontend | Production bundle builds without errors |
| TC-11 | Build mobile app | Android debug APK builds successfully |

## Test Scripts / Test Steps
### Web Booking Flow
1. Open the web app.
2. Go to Services.
3. Open a booking form.
4. Fill in all required fields.
5. Select GCash or BPI.
6. Upload 1 to 3 shoe photos.
7. Upload payment proof.
8. Submit the booking.
9. Confirm the success message appears.

### Backend Smoke Test
1. Run `mvnw.cmd test` in `backend/demo`.
2. Confirm the Spring context test passes.

### Frontend Build Test
1. Run `npm run build` in `frontend`.
2. Confirm Vite finishes successfully.

### Mobile Build Test
1. Run `gradlew.bat :app:assembleDebug` in `mobile`.
2. Confirm the debug build completes successfully.

## Automated Test Cases
- Backend: `backend/demo/src/test/java/com/sia/demo/ReviveApplicationTests.java`
- Frontend: production build verification via Vite build
- Mobile: Android debug build verification via Gradle assemble

## Regression Criteria
- All existing features remain accessible after refactor
- No build errors in backend, frontend, or mobile
- Booking flow accepts valid submissions and blocks invalid ones
- Location, payment, and branch assets still render correctly
