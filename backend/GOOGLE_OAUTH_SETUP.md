# Google OAuth Integration

This migration adds support for Google OAuth authentication to the ICPC website.

## Changes

### Schema Updates

- Added `googleId` field (unique) to User model for Google OAuth user identification
- Added `googleEmail` field to store the email from Google OAuth
- Made `password` field optional since OAuth users won't have a password

### Key Features

- Google Sign-In functionality
- Automatic user creation on first OAuth login
- Linking OAuth accounts with existing email addresses
- Auto-approval of Google OAuth users (can be configured)
- Full profile creation on OAuth signup

### New Files Added

- `src/config/passport.ts` - Passport.js configuration for Google Strategy
- `src/services/googleAuthService.ts` - Google OAuth logic and user management
- Updated `src/controllers/authController.ts` - Added Google callback handler
- Updated `src/routes/authRoutes.ts` - Added Google OAuth routes

### Environment Variables Required

Add these to your `.env` file:

```
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
SESSION_SECRET=<generate-a-secure-random-string>
FRONTEND_URL=http://localhost:3000
```

### API Endpoints

- `GET /api/auth/google` - Initiate Google Sign-In
- `GET /api/auth/google/callback` - Google OAuth callback (handled by Google)

### Frontend Integration

After Google authentication, users are redirected to:

```
{FRONTEND_URL}/auth/callback?token={JWT_TOKEN}&userId={USER_ID}
```

The frontend should extract the token and userId from the URL parameters and store the token for authenticated requests.

## Running the Migration

```bash
npm run prisma:migrate
```
