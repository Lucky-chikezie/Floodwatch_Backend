# FloodWatch Backend

Backend API for FloodWatch, a community-powered flood early warning platform. Users report flooding in real time, nearby users verify reports, and the map/feed stay updated automatically. Built for Group 6's FloodWatch MVP1.

**Live API:** https://floodwatch-backend-82y3.onrender.com
**Repo:** https://github.com/Lucky-chikezie/Floodwatch_Backend

> Note: the live URL is hosted on Render's free tier, which spins down after inactivity. The first request after idle time can take 20–50 seconds while it wakes up — this is expected, not a bug.

## Tech Stack

- Node.js + Express
- MongoDB (via Mongoose), hosted on MongoDB Atlas
- Cloudinary for photo storage
- OpenWeatherMap for rainfall/weather data
- node-cron for scheduled report decay
- JWT (jsonwebtoken) + bcryptjs for authentication
- Resend for transactional (OTP) emails
- google-auth-library for Google Sign-In

## Features

| Feature | Status |
|---|---|
| Flood Reporting (with photo upload) | ✅ |
| Community Feed | ✅ |
| Community Verification (self-verify blocked) | ✅ |
| Interactive Map data | ✅ |
| Search by Location | ✅ |
| Automatic Report Decay | ✅ |
| Weather Alerts | ✅ |
| Weather-Triggered Flood Reporting | ✅ |
| Sign Up / Login (JWT) | ✅ |
| Email OTP Verification | ✅ |
| Resend OTP | ✅ |
| Forgot / Reset Password | ✅ |
| Google Sign-In | ✅ (code complete; awaiting frontend integration test) |
| SMS OTP | Planned, not yet built |

## Getting Started (Local Setup)

1. Clone the repo:
   ```
   git clone https://github.com/Lucky-chikezie/Floodwatch_Backend.git
   cd Floodwatch_Backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root folder with:
   ```
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   OPENWEATHER_API_KEY=your_openweather_key
   JWT_SECRET=your_random_secret_string
   RESEND_API_KEY=your_resend_api_key
   GOOGLE_CLIENT_ID=your_google_oauth_client_id
   ```

4. Run the server:
   ```
   npm run dev
   ```

   Server runs on `http://localhost:5000` by default.

> Note for deployment: Render (and most hosts) do not read your local `.env` file — environment variables must also be added directly in the hosting platform's dashboard.

## API Endpoints

Base URL (local): `http://localhost:5000`
Base URL (live): `https://floodwatch-backend-82y3.onrender.com`

### Auth

**Sign Up**
`POST /api/auth/signup`
```json
{ "name": "Jane Doe", "email": "jane@example.com", "password": "yourpassword" }
```
Creates the user (unverified) and sends a 6-digit OTP to their email. Returns `201` with a message — no token yet, since the account isn't verified.

**Verify OTP**
`POST /api/auth/verify-otp`
```json
{ "email": "jane@example.com", "otp": "123456" }
```
Marks the account verified and returns a JWT token. OTP expires 10 minutes after signup.

**Resend OTP**
`POST /api/auth/resend-otp`
```json
{ "email": "jane@example.com" }
```
Generates and sends a fresh OTP if the account isn't already verified.

**Login**
`POST /api/auth/login`
```json
{ "email": "jane@example.com", "password": "yourpassword" }
```
Returns a JWT token. Blocked with `403` if the account hasn't been OTP-verified yet.

**Forgot Password**
`POST /api/auth/forgot-password`
```json
{ "email": "jane@example.com" }
```
Sends a separate reset OTP to the user's email.

**Reset Password**
`POST /api/auth/reset-password`
```json
{ "email": "jane@example.com", "otp": "123456", "newPassword": "newpassword456" }
```

**Google Sign-In**
`POST /api/auth/google-signin`
```json
{ "idToken": "the_id_token_from_google_sdk" }
```
Verifies the token with Google, then creates or logs in the matching user. Returns a JWT token like the other auth routes.

> Note: OTP emails currently send via Resend's sandbox sender, which only delivers to the email address registered on the Resend account until a custom domain is verified. Full delivery to arbitrary user emails requires domain verification — flag this before relying on it for real users.

### Reports

**Create a report** — requires auth
`POST /api/reports`
Header: `Authorization: Bearer <token>`
Content-Type: `multipart/form-data`

| Field | Type | Required |
|---|---|---|
| severity | text (`Low`, `Medium`, `High`) | yes |
| description | text | no |
| longitude | text | yes |
| latitude | text | yes |
| photo | file | no |

**Get all reports (Community Feed / Map data)**
`GET /api/reports`
Returns all reports, newest first. No auth required.

**Search reports by location**
`GET /api/reports/search?longitude={lng}&latitude={lat}&radius={meters}`
`radius` is optional, defaults to 5000 (5km).

**Verify a report** — requires auth
`PATCH /api/reports/:id/verify`
Header: `Authorization: Bearer <token>`
```json
{ "vote": "yes" }
```
`vote` accepts `yes`, `no`, or `notSure`. Auto-marks `Verified` after 3 `yes` votes. Returns `403` if the logged-in user is the one who created the report — users can't verify their own reports.

### Weather

**Get weather / rainfall data for a location**
`GET /api/weather?latitude={lat}&longitude={lng}`
Returns current weather plus a `triggerReportPrompt` flag — `true` when rainfall crosses the heavy-rainfall threshold, signaling the frontend to prompt the user to report flooding.

## Authentication

Protected routes require this header:
```
Authorization: Bearer <token>
```
Tokens are JWTs valid for 30 days, issued on signup verification, login, or Google sign-in.

| Status | Message | Cause |
|---|---|---|
| 401 | Not authorized, no token | Header missing or malformed |
| 401 | Not authorized, invalid token | Token expired, corrupted, or signed with a different secret |
| 401 | Not authorized, user not found | Token valid but user no longer exists |

## Report Statuses

- `Unverified` — newly submitted, awaiting confirmations
- `Verified` — received 3+ "yes" confirmations
- `Resolved` — automatically marked after a verified report goes quiet for an extended period

## Automatic Decay

A scheduled job (node-cron) runs hourly to:
- Remove `Unverified` reports older than 1 hour with no confirmations
- Mark `Verified` reports untouched for 12+ hours as `Resolved`

## Deployment

Hosted on Render, connected directly to this GitHub repo. Pushing to `main` triggers an automatic redeploy. Environment variables are configured separately in the Render dashboard (Environment tab) — they are not read from the local `.env` file.

## Notes for Frontend Integration

- All location fields use standard `longitude, latitude` order (GeoJSON convention).
- Photo uploads return a Cloudinary-hosted URL in the `photoUrl` field.
- Map integration on the product side has moved from Google Maps to Mapbox; report location data is provider-agnostic and works with either.
- Product decision: dropped "Current Area" from the map search UI — only "Search Area" remains.
- Map should visually distinguish Verified vs Unverified reports.
- Product is confirmed to be a web app, not a native mobile app.
-
