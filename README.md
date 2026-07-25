# FloodWatch Backend

Backend API for FloodWatch, a community-powered flood early warning platform. Users report flooding in real time, nearby users confirm reports, and the map/feed stay updated automatically. Built for Group 6's FloodWatch MVP1.

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
- Brevo (HTTP API) for transactional OTP emails
- google-auth-library for Google Sign-In

## Features

| Feature | Status |
|---|---|
| Flood Reporting (with photo upload) | Done |
| Community Feed | Done |
| Community Confirmation (self-confirm blocked, duplicate-confirm blocked) | Done |
| Delete Report (owner-only) | Done |
| Interactive Map data | Done |
| Search by Location | Done |
| Automatic Report Decay | Done |
| Weather Alerts | Done |
| Weather-Triggered Flood Reporting | Done |
| Sign Up / Login (JWT) | Done |
| Email OTP Verification | Done |
| Resend OTP | Done |
| Forgot Password / Verify Reset OTP / Reset Password | Done |
| Google Sign-In | Code complete; awaiting frontend integration test |
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
   BREVO_API_KEY=your_brevo_api_key
   EMAIL_USER=your_brevo_verified_sender_email
   GOOGLE_CLIENT_ID=your_google_oauth_client_id
   ```

4. Run the server:
   ```
   npm run dev
   ```

   Server runs on `http://localhost:5000` by default.

> Note for deployment: Render (and most hosts) do not read your local `.env` file — every one of the variables above must also be added directly in the hosting platform's Environment tab, or auth/email features will fail even though local testing works.

## API Endpoints

Base URL (local): `http://localhost:5000`
Base URL (live): `https://floodwatch-backend-82y3.onrender.com`

### Auth

**Sign Up** — `POST /api/auth/signup`
```json
{ "name": "Jane Doe", "email": "jane@example.com", "password": "yourpassword" }
```
Creates the user (unverified) and sends a 6-digit OTP to their email via Brevo. If the OTP email fails to send, the user record is automatically deleted so the same email can be retried cleanly.

**Verify OTP** — `POST /api/auth/verify-otp`
```json
{ "email": "jane@example.com", "otp": "123456" }
```
Marks the account verified and returns a JWT token. OTP expires 10 minutes after signup.

**Resend OTP** — `POST /api/auth/resend-otp`
```json
{ "email": "jane@example.com" }
```

**Login** — `POST /api/auth/login`
```json
{ "email": "jane@example.com", "password": "yourpassword" }
```
Blocked with `403` if the account hasn't been OTP-verified yet.

**Forgot Password** — `POST /api/auth/forgot-password`
```json
{ "email": "jane@example.com" }
```
Sends a reset OTP to the user's email.

**Verify Reset OTP** — `POST /api/auth/verify-reset-otp`
```json
{ "email": "jane@example.com", "otp": "123456" }
```
Confirms the reset OTP is valid without changing the password — powers a separate "Verify Code" screen before the "New Password" screen.

**Reset Password** — `POST /api/auth/reset-password`
```json
{ "email": "jane@example.com", "otp": "123456", "newPassword": "newpassword456" }
```

**Google Sign-In** — `POST /api/auth/google-signin`
```json
{ "idToken": "the_id_token_from_google_sdk" }
```
Verifies the token with Google, then creates or logs in the matching user.

### Reports

**Create a report** — requires auth
`POST /api/reports`
Header: `Authorization: Bearer <token>`
Content-Type: `multipart/form-data`

| Field | Type | Required |
|---|---|---|
| waterLevel | text (`Low`, `Medium`, `High`) | yes |
| description | text | no |
| longitude | text | yes |
| latitude | text | yes |
| photo | file | no |

**Get all reports (Community Feed / Map data)**
`GET /api/reports` — no auth required, newest first.

**Search reports by location**
`GET /api/reports/search?longitude={lng}&latitude={lat}&radius={meters}` — `radius` optional, defaults to 5000 (5km).

**Confirm a report** — requires auth
`PATCH /api/reports/:id/confirm`
```json
{ "vote": "yes" }
```
`vote` accepts `yes`, `no`, or `notSure`. Auto-marks `Verified` after 3 `yes` votes.
- Returns `403` if the logged-in user created the report.
- Returns `403` if the logged-in user already confirmed this report before.

**Delete a report** — requires auth
`DELETE /api/reports/:id`
Only the report's creator can delete it; returns `403` otherwise.

### Weather

**Get weather / rainfall data for a location**
`GET /api/weather?latitude={lat}&longitude={lng}`
Returns current weather plus a `triggerReportPrompt` flag — `true` when rainfall crosses the heavy-rainfall threshold.

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
- OTP emails are sent via Brevo and confirmed working to any real email address.
-
