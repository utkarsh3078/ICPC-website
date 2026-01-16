# Google OAuth API Documentation

## Endpoints

### 1. Initiate Google Sign-In

Redirects the user to Google's OAuth consent screen.

**Endpoint**: `GET /api/auth/google`

**Description**: Starts the Google OAuth flow by redirecting to Google's login page.

**Parameters**: None

**Response**: Redirect to Google login page

**Example**:

```bash
curl -X GET http://localhost:5000/api/auth/google
```

**Frontend Usage**:

```html
<a href="http://localhost:5000/api/auth/google" class="btn btn-google">
  Sign in with Google
</a>
```

---

### 2. Google OAuth Callback

Handles the callback from Google after authentication.

**Endpoint**: `GET /api/auth/google/callback`

**Description**: This endpoint is automatically called by Google after user authentication. It processes the OAuth token, creates/retrieves the user, and redirects to the frontend with a JWT token.

**Query Parameters**:

- `code` (string): Authorization code from Google (automatically provided)
- `state` (string): State parameter for security (automatically provided)

**Response**: Redirect to frontend with JWT token

```
{FRONTEND_URL}/auth/callback?token={JWT_TOKEN}&userId={USER_ID}
```

**Success Response**:

- Status: 302 (Redirect)
- Location: `http://localhost:3000/auth/callback?token=eyJhbGc...&userId=user123`

**Error Response**:

- Status: 302 (Redirect to login)
- Location: `/login`

**Example Flow**:

1. User clicks "Sign in with Google" → redirected to `/api/auth/google`
2. User logs in with Google → Google redirects to `/api/auth/google/callback`
3. Server processes auth → redirects to `{FRONTEND_URL}/auth/callback?token=...&userId=...`
4. Frontend receives token and userId

---

## User Response Schema

When a user is created or retrieved through Google OAuth, they have the following structure:

```json
{
  "id": "clp123456789",
  "email": "user@gmail.com",
  "googleId": "123456789012345678901",
  "googleEmail": "user@gmail.com",
  "password": null,
  "role": "STUDENT",
  "approved": true,
  "createdAt": "2024-01-16T10:30:00Z",
  "profile": {
    "id": "prof123456789",
    "userId": "clp123456789",
    "name": "John Doe",
    "branch": "",
    "year": 1,
    "contact": "",
    "handles": null,
    "graduationYear": null,
    "company": null,
    "position": null,
    "location": null,
    "bio": null,
    "linkedIn": null
  }
}
```

---

## JWT Token Usage

After receiving the JWT token from the callback, use it for authenticated requests:

**Request Header**:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Example Request**:

```bash
curl -X GET http://localhost:5000/api/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Token Structure**:

```json
{
  "id": "user_id",
  "role": "STUDENT",
  "iat": 1705417800,
  "exp": 1706022600
}
```

**Token Validity**: 7 days from creation

---

## Error Responses

### Google Credentials Not Configured

```
Response: 401 Unauthorized
{
  "message": "Authentication failed"
}
```

### Invalid State Parameter

```
Response: 302 Redirect
Location: /login
```

### User Creation Failed

```
Response: 401 Unauthorized
{
  "message": "Authentication failed"
}
```

---

## Integration Examples

### React Frontend Example

```typescript
// pages/auth/callback.tsx
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuthStore } from "@/store/useAuthStore";

export default function AuthCallback() {
  const router = useRouter();
  const { setToken, setUser } = useAuthStore();

  useEffect(() => {
    const { token, userId } = router.query;

    if (token && userId) {
      // Store token and user ID
      localStorage.setItem("authToken", token as string);
      localStorage.setItem("userId", userId as string);
      setToken(token as string);

      // Redirect to dashboard
      router.push("/dashboard");
    } else {
      // No token received, redirect to login
      router.push("/login");
    }
  }, [router.query]);

  return <div>Processing login...</div>;
}
```

### Axios Interceptor for Token

```typescript
// lib/axios.ts
import axios from "axios";

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
```

### Sign In with Google Button

```typescript
// components/GoogleSignInButton.tsx
export function GoogleSignInButton() {
  const handleGoogleSignIn = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };

  return (
    <button onClick={handleGoogleSignIn} className="btn btn-google">
      Sign in with Google
    </button>
  );
}
```

---

## Flow Diagram

```
┌─────────────────┐
│   User Clicks   │
│ "Sign in with   │
│    Google"      │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│ GET /api/auth/google        │
│ (Redirect to Google)        │
└────────┬────────────────────┘
         │
         ▼
    ┌─────────────┐
    │ Google      │
    │ Login Page  │
    └────┬────────┘
         │
    User Authenticates
         │
         ▼
┌─────────────────────────────────┐
│ GET /api/auth/google/callback   │
│ (Process auth & create user)    │
└────────┬────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│ Redirect to Frontend with JWT Token  │
│ {FRONTEND_URL}/auth/callback         │
│ ?token={JWT}&userId={ID}             │
└────────┬─────────────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Frontend Receives Token     │
│ Stores & Redirects to       │
│ Dashboard                   │
└─────────────────────────────┘
```

---

## Testing with Postman

Since OAuth requires a browser for the Google login UI, you can test the endpoints:

1. **OAuth Flow**: Follow the flow in a browser

   - Visit: `http://localhost:5000/api/auth/google`
   - Complete Google login
   - Check redirect URL for token and userId

2. **Verify Token Works**: After getting token from callback
   ```
   GET http://localhost:5000/api/profile
   Header: Authorization: Bearer {YOUR_TOKEN}
   ```

---

## Linking OAuth to Existing Accounts

When a user authenticates with Google OAuth, the system:

1. **First Check**: Looks for existing user by `googleId`
2. **Second Check**: If not found, looks for user by email
3. **Link Account**: If user exists by email, links the Google OAuth account
4. **Create New**: If no user exists, creates a new user with Google OAuth

This allows existing users to link their Google account to their existing profile.

---

## Best Practices

1. **Always use HTTPS in production** for OAuth callbacks
2. **Never log or expose JWT tokens** in console/logs
3. **Set token expiration** appropriately (default: 7 days)
4. **Validate token on backend** before processing requests
5. **Store tokens securely** in frontend (avoid localStorage for sensitive data in production)
6. **Refresh tokens periodically** for long sessions
7. **Use secure cookie settings** (`httpOnly`, `secure`, `sameSite`)

---

## Troubleshooting

### "Redirect URI Mismatch"

- **Issue**: The redirect URI doesn't match Google Cloud Console settings
- **Solution**:
  - Ensure `GOOGLE_CALLBACK_URL` in `.env` matches Google Console configuration
  - Include `/api/auth/google/callback` in Google Cloud Console

### "Invalid Client ID"

- **Issue**: `GOOGLE_CLIENT_ID` is missing or incorrect
- **Solution**: Verify credentials in Google Cloud Console

### Token not received after callback

- **Issue**: User is redirected but token is missing
- **Solution**: Check server logs for errors during user creation

### Session issues

- **Issue**: User not staying logged in
- **Solution**: Ensure `SESSION_SECRET` is properly configured

---

For more information, see [GOOGLE_AUTH_SETUP.md](./GOOGLE_AUTH_SETUP.md)
