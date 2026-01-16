# Google OAuth Integration Setup Guide

## Overview

This guide walks you through setting up Google OAuth authentication for the ICPC website backend.

## Prerequisites

- Google Cloud Console account
- Backend project setup with Node.js and npm

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown and select "New Project"
3. Enter project name (e.g., "ICPC Website")
4. Click "Create"

## Step 2: Enable Google+ API

1. In the Google Cloud Console, navigate to "APIs & Services" > "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth Client ID"
3. If prompted, configure the OAuth consent screen first:
   - Choose "External" user type
   - Fill in the required fields:
     - App name: ICPC Website
     - User support email: your-email@example.com
     - Developer contact: your-email@example.com
   - Add required scopes: `email` and `profile`
   - Add test users (your test email accounts)
4. Return to Credentials and create OAuth Client ID:
   - Application type: Web application
   - Name: "ICPC Backend"
   - Authorized redirect URIs:
     ```
     http://localhost:5000/api/auth/google/callback
     https://your-production-domain.com/api/auth/google/callback
     ```
5. Click "Create"
6. Copy your Client ID and Client Secret

## Step 4: Configure Environment Variables

Add the following to your `.env` file:

```env
# Google OAuth
GOOGLE_CLIENT_ID=<your-client-id>
GOOGLE_CLIENT_SECRET=<your-client-secret>
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Session
SESSION_SECRET=generate-a-secure-random-string-using-openssl-rand-base64-32

# Frontend (adjust based on your setup)
FRONTEND_URL=http://localhost:3000
```

### Generate a Secure Session Secret

```bash
openssl rand -base64 32
```

## Step 5: Install Dependencies

```bash
npm install
```

This will install the new OAuth-related packages:

- `passport`: Authentication middleware
- `passport-google-oauth20`: Google OAuth strategy
- `express-session`: Session management

## Step 6: Run Database Migration

```bash
npm run prisma:migrate
```

This will update your database schema to include Google OAuth fields.

## Step 7: Start the Server

```bash
npm run dev
```

## API Endpoints

### Initiate Google Sign-In

```
GET /api/auth/google
```

This endpoint redirects users to Google's login page.

### Google OAuth Callback

```
GET /api/auth/google/callback
```

This endpoint is called by Google after the user authenticates. It:

1. Verifies the Google authentication
2. Creates or retrieves the user
3. Generates a JWT token
4. Redirects to the frontend with the token

## Frontend Integration

### Adding Google Sign-In Button

```html
<a href="http://localhost:5000/api/auth/google" class="btn btn-primary">
  Sign in with Google
</a>
```

### Handling the Callback

After Google authentication, the user will be redirected to:

```
http://localhost:3000/auth/callback?token=JWT_TOKEN&userId=USER_ID
```

Your frontend should:

1. Extract `token` and `userId` from URL parameters
2. Store the token in localStorage or a cookie
3. Use the token for subsequent API requests (include in Authorization header)

Example JavaScript:

```javascript
// In your auth callback page component
const params = new URLSearchParams(window.location.search);
const token = params.get("token");
const userId = params.get("userId");

if (token) {
  localStorage.setItem("authToken", token);
  localStorage.setItem("userId", userId);
  // Redirect to dashboard or home
  window.location.href = "/dashboard";
}
```

## How It Works

1. **User clicks "Sign in with Google"**

   - User is redirected to `/api/auth/google`

2. **Google Authentication**

   - User logs in with their Google account on Google's servers

3. **Callback Processing**

   - Google redirects back to `/api/auth/google/callback`
   - Passport verifies the authentication
   - Backend finds or creates the user in the database
   - JWT token is generated
   - User is redirected to frontend with token and userId

4. **Token Usage**
   - Frontend stores the JWT token
   - Token is sent with each request in the Authorization header:
     ```
     Authorization: Bearer <JWT_TOKEN>
     ```

## User Creation and Approval

By default, Google OAuth users are **automatically approved**. This can be changed by modifying the `findOrCreateGoogleUser` function in `googleAuthService.ts`:

```typescript
// Change this line:
approved: true,  // <- Change to false for manual approval
```

## Database Schema Changes

The User model now has:

- `googleId` (String, unique): Google's user ID
- `googleEmail` (String): Email from Google
- `password` (String?, optional): Now optional for OAuth users

## Security Considerations

1. **HTTPS in Production**: Always use HTTPS for OAuth callbacks
2. **Session Security**: The `SESSION_SECRET` should be strong and unique
3. **Token Expiration**: JWT tokens expire after 7 days by default
4. **Secure Cookies**: Cookies are marked as `httpOnly` and `secure` in production

## Troubleshooting

### "Missing Google credentials" warning

- Ensure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set in your .env file

### "Invalid redirect URI"

- Check that the callback URL in your .env matches the one registered in Google Cloud Console

### "User not found" after callback

- Check database connection and Prisma client initialization

### Session not persisting

- Ensure `SESSION_SECRET` is set in your .env file
- Check that express-session middleware is properly initialized

## Testing Locally

1. Start your backend server:

   ```bash
   npm run dev
   ```

2. In your frontend, create a button that links to:

   ```
   http://localhost:5000/api/auth/google
   ```

3. Click the button and go through the Google login flow

4. You should be redirected back to your frontend with a token

## Production Deployment

Before deploying to production:

1. Update `GOOGLE_CALLBACK_URL` in your .env to your production domain:

   ```env
   GOOGLE_CALLBACK_URL=https://your-domain.com/api/auth/google/callback
   ```

2. Add the production callback URL to your Google Cloud Console credentials

3. Update `FRONTEND_URL` to your production frontend domain:

   ```env
   FRONTEND_URL=https://your-frontend-domain.com
   ```

4. Ensure all environment variables are properly set on your production server

5. Deploy the database migrations

## Additional Resources

- [Passport.js Documentation](http://www.passportjs.org/)
- [Passport Google OAuth 2.0 Strategy](https://www.passportjs.org/packages/passport-google-oauth20/)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Express Session Documentation](https://github.com/expressjs/session)

---

**Note**: Keep your `GOOGLE_CLIENT_SECRET` secure and never commit it to version control. Always use environment variables for sensitive credentials.
