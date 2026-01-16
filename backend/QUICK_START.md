# Google OAuth - Quick Reference Guide

## 📋 One-Page Quick Start

### 1️⃣ Get Google Credentials (5 minutes)

```bash
# Visit: https://console.cloud.google.com/
# 1. Create new project
# 2. Enable Google+ API
# 3. Create OAuth 2.0 credentials (Web application)
# 4. Set redirect URI: http://localhost:5001/api/auth/google/callback
# 5. Copy Client ID and Client Secret
```

### 2️⃣ Setup Environment (2 minutes)

```bash
# Generate session secret
openssl rand -base64 32

# Edit .env file and add:
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
SESSION_SECRET=generated-secret-above
FRONTEND_URL=http://localhost:3000
```

### 3️⃣ Install & Migrate (3 minutes)

```bash
# Install new dependencies
npm install

# Run database migration
npm run prisma:migrate
```

### 4️⃣ Test Locally (1 minute)

```bash
# Start server
npm run dev

# In browser, visit:
# http://localhost:5000/api/auth/google
```

---

## 🔧 Common Commands

### Setup Commands

```bash
# Install dependencies
npm install

# Run database migration
npm run prisma:migrate

# Generate secure secret
openssl rand -base64 32
```

### Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Test the application
npm test
```

### Google OAuth Flow

```bash
# 1. Initiate Google OAuth
curl -X GET http://localhost:5000/api/auth/google

# 2. After user logs in, they get redirected with token:
# http://localhost:3000/auth/callback?token=JWT_TOKEN&userId=USER_ID

# 3. Use token for authenticated requests
curl -H "Authorization: Bearer JWT_TOKEN" \
  http://localhost:5000/api/profile
```

---

## 📝 Environment Variables

### Required for Google OAuth

```env
GOOGLE_CLIENT_ID=<from-google-cloud>
GOOGLE_CLIENT_SECRET=<from-google-cloud>
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
SESSION_SECRET=<generate-with-openssl>
FRONTEND_URL=http://localhost:3000
```

### Existing (Keep unchanged)

```env
DATABASE_URL=<your-db-url>
JWT_SECRET=<your-jwt-secret>
PORT=<your-port>
NODE_ENV=<development-or-production>
```

---

## 🚀 API Endpoints

### Start Google Sign-In

```
GET /api/auth/google
```

### Callback (Automatic)

```
GET /api/auth/google/callback?code=...&state=...
```

### Use Token in Requests

```
GET /api/profile
Authorization: Bearer <JWT_TOKEN>
```

---

## 📚 Documentation Files

| File                                                 | Purpose                  | Read Time |
| ---------------------------------------------------- | ------------------------ | --------- |
| [GOOGLE_AUTH_SETUP.md](GOOGLE_AUTH_SETUP.md)         | Complete setup guide     | 15 min    |
| [GOOGLE_AUTH_API.md](GOOGLE_AUTH_API.md)             | API documentation        | 10 min    |
| [GOOGLE_AUTH_CHECKLIST.md](GOOGLE_AUTH_CHECKLIST.md) | Implementation checklist | 5 min     |

---

## 🛠️ Troubleshooting

### Issue: "Missing Google credentials"

```
✓ Check GOOGLE_CLIENT_ID is set
✓ Check GOOGLE_CLIENT_SECRET is set
✓ Restart server after changing .env
```

### Issue: "Redirect URI Mismatch"

```
✓ Copy exact URL from GOOGLE_CALLBACK_URL
✓ Add same URL to Google Cloud Console
✓ Include /api/auth/google/callback
```

### Issue: "User not created"

```
✓ Check database connection
✓ Run: npm run prisma:migrate
✓ Check server logs for errors
```

### Issue: "Token not received"

```
✓ Check FRONTEND_URL is correct
✓ Check browser console for redirects
✓ Check server logs for errors
```

---

## 💡 Quick Tips

### Testing Locally

```javascript
// In browser console after redirect:
const params = new URLSearchParams(window.location.search);
console.log("Token:", params.get("token"));
```

### Using Token in Axios

```javascript
import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:5000/api",
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

### Using Token in Fetch

```javascript
const token = localStorage.getItem("authToken");

fetch("http://localhost:5000/api/profile", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

---

## 🔐 Security Checklist

- ✅ Never commit GOOGLE_CLIENT_SECRET to git
- ✅ Use strong SESSION_SECRET (generate with openssl)
- ✅ Use HTTPS in production
- ✅ Set secure cookies in production (auto-done)
- ✅ Rotate secrets regularly
- ✅ Monitor failed login attempts

---

## 📈 Production Deployment

### Update URLs

```env
# Change from localhost
GOOGLE_CALLBACK_URL=https://your-domain.com/api/auth/google/callback
FRONTEND_URL=https://your-frontend.com
```

### Add Callback URL to Google Cloud

```
https://your-domain.com/api/auth/google/callback
```

### Verify

```bash
# Test callback in production
curl -X GET https://your-domain.com/api/auth/google
```

---

## 📞 Getting Help

1. **Setup Issues** → Read [GOOGLE_AUTH_SETUP.md](GOOGLE_AUTH_SETUP.md)
2. **API Issues** → Read [GOOGLE_AUTH_API.md](GOOGLE_AUTH_API.md)
3. **Check Logs** → Look in server output for errors
4. **Verify Env** → `echo $GOOGLE_CLIENT_ID`

---

## ✨ What You Get

✅ Google Sign-In button support
✅ Automatic user creation
✅ JWT token generation
✅ Secure session management
✅ Auto-linking existing accounts
✅ Profile auto-creation
✅ Full production readiness

---

## 🎯 Next Steps

1. Get credentials from Google Cloud → 5 min
2. Add to .env file → 2 min
3. Run npm install && npm run prisma:migrate → 3 min
4. Start server and test → 2 min
5. Integrate with frontend → 10 min

**Total Time**: ~20-30 minutes

---

**Quick Links:**

- 🔗 [Google Cloud Console](https://console.cloud.google.com/)
- 📖 [Setup Guide](./GOOGLE_AUTH_SETUP.md)
- 📚 [API Docs](./GOOGLE_AUTH_API.md)
- ✅ [Checklist](./GOOGLE_AUTH_CHECKLIST.md)

**Status**: ✨ Ready to use!
