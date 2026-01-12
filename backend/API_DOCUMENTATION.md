

# ICPC Website API Documentation v2

**Base URL**: `http://localhost:5000/api/`  
**Version**: 2.0.1  
**Authentication**: JWT Bearer Token

---

## Table of Contents
1. [Authentication](#authentication)
2. [Profile Management](#profile-management)
3. [Task Management](#task-management)
4. [Contest Management](#contest-management)
5. [Sessions & Workshops](#sessions--workshops)
6. [Blog Management](#blog-management)
7. [Announcements](#announcements)
8. [Alumni](#alumni)
9. [Gamification](#gamification)
10. [AI Chatbot](#ai-chatbot)
11. [Error Responses](#error-responses)
12. [Health & Status](#health--status)

---

## Authentication

### Register User
**POST** `/auth/register`

Create a new user account.

**Request Body**:
```json
{
  "email": "student@example.com",
  "password": "securepassword123",
  "role": "STUDENT"
}
```
**Field Details**:
- `email` (string, required): Valid email address
- `password` (string, required): Minimum 8 characters
- `role` (string, optional): One of `STUDENT`, `ADMIN`, `ALUMNI` (default: `STUDENT`)

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "clx123abc456",
    "email": "student@example.com"
  }
}
```
**Note**: New accounts require admin approval before login.

---

### Login
**POST** `/auth/login`

Authenticate and receive JWT token.

**Request Body**:
```json
{
  "email": "student@example.com",
  "password": "securepassword123"
}
```
**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "clx123abc456",
      "email": "student@example.com",
      "role": "STUDENT"
    }
  }
}
```
**Token Usage**: Include in subsequent requests as:
```
Authorization: Bearer <token>
```

---

### Approve User (Admin Only)
**POST** `/auth/approve/:id`

Approve a pending user registration.

**Headers**:
```
Authorization: Bearer <admin_token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "clx123abc456",
    "approved": true
  }
}
```

---



## Profile Management

### Create/Update Profile
**POST** `/profile`

Create or update user profile information.

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "name": "John Doe",
  "branch": "CSE",
  "year": 3,
  "contact": "+91-9876543210",
  "handles": {
    "leetcode": "johndoe",
    "codeforces": "john_coder",
    "github": "johndoe"
  }
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "profile123",
    "userId": "clx123abc456",
    "name": "John Doe",
    "branch": "CSE",
    "year": 3,
    "contact": "+91-9876543210",
    "handles": {
      "leetcode": "johndoe",
      "codeforces": "john_coder",
      "github": "johndoe"
    }
  }
}
```

---

### Get Profile
**GET** `/profile`

Retrieve current user's profile.

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "profile123",
    "userId": "clx123abc456",
    "name": "John Doe",
    "branch": "CSE",
    "year": 3,
    "contact": "+91-9876543210",
    "handles": {
      "leetcode": "johndoe",
      "codeforces": "john_coder"
    }
  }
}
```

---



## Contest Management

### Create Contest (Admin Only)
**POST** `/contests`

Create a new programming contest.

**Headers**:
```
Authorization: Bearer <admin_token>
```

**Request Body**:
```json
{
  "title": "Weekly Contest #1",
  "timer": 7200,
  "problems": []
}
```
**Field Details**:
- `title` (string, required): Contest name
- `timer` (number, optional): Duration in seconds
- `problems` (array, optional): Array of problem objects

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "contest123",
    "title": "Weekly Contest #1",
    "timer": 7200,
    "problems": [],
    "createdAt": "2025-11-28T10:00:00.000Z"
  }
}
```

---

### Add Problem to Contest (Admin Only)
**POST** `/contests/:id/problems`

Add a problem to an existing contest.

**Headers**:
```
Authorization: Bearer <admin_token>
```

**Request Body**:
```json
{
  "name": "Problem A",
  "description": "Given an array...",
  "testCases": [
    {
      "input": "1 2 3",
      "output": "6"
    }
  ]
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "contest123",
    "problems": [
      {
        "name": "Problem A",
        "description": "Given an array...",
        "testCases": [...]
      }
    ]
  }
}
```

---

### List Contests
**GET** `/contests`

Get all contests (public endpoint).

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "contest123",
      "title": "Weekly Contest #1",
      "timer": 7200,
      "createdAt": "2025-11-28T10:00:00.000Z"
    }
  ]
}
```

---



## Task Management

### Create Task (Admin Only)
**POST** `/tasks`

Create a new DSA task/problem assignment.

**Headers**:
```
Authorization: Bearer <admin_token>
```

**Request Body**:
```json
{
  "title": "Two Sum Problem",
  "description": "Solve the Two Sum problem on LeetCode",
  "points": 10,
  "dueDate": "2025-12-31T23:59:59Z"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "task123",
    "title": "Two Sum Problem",
    "description": "Solve the Two Sum problem on LeetCode",
    "points": 10,
    "dueDate": "2025-12-31T23:59:59.000Z",
    "createdAt": "2025-11-28T10:00:00.000Z"
  }
}
```

---

### Submit Task
**POST** `/tasks/:taskId/submit`

Submit a task completion link.

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "link": "https://leetcode.com/submissions/detail/123456/"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "submission123",
    "taskId": "task123",
    "userId": "clx123abc456",
    "link": "https://leetcode.com/submissions/detail/123456/",
    "verified": true,
    "points": 10,
    "createdAt": "2025-11-28T10:30:00.000Z"
  }
}
```

---



## Sessions & Workshops

### Create Session (Admin Only)
**POST** `/sessions`

Create a new workshop or session.

**Headers**:
```
Authorization: Bearer <admin_token>
```

**Request Body**:
```json
{
  "title": "DSA Workshop",
  "details": "Introduction to Dynamic Programming",
  "date": "2025-12-01T18:00:00Z"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "session123",
    "title": "DSA Workshop",
    "details": "Introduction to Dynamic Programming",
    "date": "2025-12-01T18:00:00.000Z",
    "attendees": [],
    "createdAt": "2025-11-28T10:00:00.000Z"
  }
}
```

---



## Announcements

### Create Announcement (Admin Only)
**POST** `/announcements`

Post a new announcement.

**Headers**:
```
Authorization: Bearer <admin_token>
```

**Request Body**:
```json
{
  "title": "Contest Tomorrow!",
  "details": "Don't forget to register for tomorrow's contest"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "announcement123",
    "title": "Contest Tomorrow!",
    "details": "Don't forget to register...",
    "createdAt": "2025-11-28T10:00:00.000Z"
  }
}
```

---



## Gamification

### Get Leaderboard
**GET** `/gamification/leaderboard`

Get the points leaderboard.

**Query Parameters**:
- `period` (optional): `month`, `semester`, or `all` (default: `all`)

**Example**: `/gamification/leaderboard?period=month`

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "position": 1,
      "userId": "clx123abc456",
      "email": "student@example.com",
      "name": "John Doe",
      "points": 150
    }
  ]
}
```

---

### List Badges
**GET** `/gamification/badges`

Get all available badges and their requirements.

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "first_submit",
      "title": "First Submission",
      "description": "Awarded for making your first verified submission",
      "rule": {
        "type": "submission_count",
        "min": 1
      }
    }
  ]
}
```

---



## Alumni

### Register Alumni
**POST** `/alumni/register`

Register as an alumni user.

**Request Body**:
```json
{
  "email": "alumni@example.com",
  "password": "securepassword123",
  "name": "Jane Doe",
  "batch": "2020",
  "company": "Google"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "alum123",
    "email": "alumni@example.com",
    "role": "ALUMNI",
    "approved": false
  }
}
```

---

### List Alumni
**GET** `/alumni`

Get all approved alumni.

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "alum123",
      "email": "alumni@example.com",
      "role": "ALUMNI",
      "approved": true
    }
  ]
}
```

---

## Blog Management

### Create Blog
**POST** `/blogs`

Submit a blog post for approval.

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "title": "My ICPC Journey",
  "content": "This is my experience participating in ICPC..."
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "blog123",
    "authorId": "clx123abc456",
    "title": "My ICPC Journey",
    "content": "This is my experience...",
    "approved": false,
    "comments": [],
    "createdAt": "2025-11-28T10:00:00.000Z"
  }
}
```

---



## AI Chatbot

### Chat with AI
**POST** `/ai/chat`

Ask the AI assistant for help.

**Headers**:
```
Authorization: Bearer <token>
```

**Request Body**:
```json
{
  "prompt": "Explain dynamic programming in simple terms"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "reply": "Dynamic programming is a method for solving complex problems..."
  }
}
```

**Note**: Requires `OPENAI_API_KEY` to be configured.

---



## Error Responses

### Standard Error Format
All errors follow this format:
```json
{
  "success": false,
  "error": "Error message here"
}
```

### Common HTTP Status Codes
| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request succeeded |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 422 | Unprocessable Entity | Validation error |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Service temporarily unavailable |

### Error Examples
**Validation Error (422)**:
```json
{
  "success": false,
  "error": {
    "errors": [
      {
        "msg": "Valid email required",
        "param": "email",
        "location": "body"
      }
    ]
  }
}
```
**Unauthorized (401)**:
```json
{
  "success": false,
  "error": "No token provided"
}
```
**Forbidden (403)**:
```json
{
  "success": false,
  "error": "Admin only"
}
```
**Rate Limit (429)**:
```json
{
  "success": false,
  "error": "Too many requests from this IP, please try again later."
}
```

---

## Health & Status

### Health Check
**GET** `/health`

Check API health status.

**Response** (200 OK):
```json
{
  "status": "OK",
  "timestamp": "2025-11-28T10:00:00.000Z"
}
```

---

### Swagger UI

Interactive API documentation is available at:

**URL**: `/api/docs/ui`

---

_Last updated: January 13, 2026_

---


---

## Authentication
Most endpoints require a valid JWT token in the `Authorization` header:
```
Authorization: Bearer <token>
```

## Error Handling
All errors return a JSON object with `error` and `message` fields. Example:
```json
{
  "error": true,
  "message": "Invalid credentials"
}
```

## Example Usage
**Login:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```
**Response:**
```json
{
  "token": "<jwt-token>",
  "user": { "id": "...", "email": "..." }
}
```

---

For detailed request/response schemas, see the [Swagger documentation](../swagger.json).

---

_Last updated: January 13, 2026_

---

## Swagger UI

Interactive API documentation is available at:

**URL**: `http://localhost:5000/api/docs/ui`

---

## Testing with cURL

### Example: Register and Login Flow

```bash
# 1. Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# 2. Admin approves (replace USER_ID and ADMIN_TOKEN)
curl -X POST http://localhost:5000/api/auth/approve/USER_ID \
  -H "Authorization: Bearer ADMIN_TOKEN"

# 3. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# 4. Create profile (replace TOKEN)
curl -X POST http://localhost:5000/api/profile \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","branch":"CSE","year":3,"contact":"1234567890"}'
```

---

## Postman Collection

Import the provided `postman_collection.json` file located in the backend directory for ready-to-use API requests.

---

## Support

For issues or questions:
- Check the [README.md](../README.md)
- Review the [STRUCTURE.md](../STRUCTURE.md) for codebase navigation
- Open an issue in the repository

**Version**: 1.0.0  
**Last Updated**: November 28, 2025
