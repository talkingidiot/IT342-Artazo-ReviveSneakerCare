# SIA Admin Mobile (Kotlin)

This is a new Android app scaffold in Kotlin (Jetpack Compose) with:
- `Orders` tab (`GET /api/admin/orders`)
- `Monthly Sales` tab (`GET /api/admin/orders/sales/monthly?month=YYYY-MM`)

## Open in Android Studio
1. Open Android Studio.
2. Click **Open** and select: `C:\Users\AIRON KIT ARTAZO\Desktop\SIA\mobile`
3. Let Gradle sync finish.
4. Run on emulator/device.

## Important for local backend
- If backend runs on your PC at `http://localhost:8080`, use:
  - `http://10.0.2.2:8080/api` (Android Emulator)
- Paste your **admin JWT token** in the app.

## Default admin creds in backend seed
- Email: `admin@revive.local`
- Password: `Admin1234!`

Login from your web app/backend first to get JWT token, then use that token in mobile.
