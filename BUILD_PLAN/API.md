# API Documentation - Reviews-Maker

## 🔗 Base URL

```
Development:  http://localhost:3000/api/v1
Production:   https://reviews-maker.com/api/v1
```

---

## 🔐 Authentication

### Headers Required

```
Authorization: Bearer <token>
Content-Type: application/json
```

### Login

**POST** `/auth/login`

```json
Request:
{
  "email": "user@example.com",
  "password": "password123"
}

Response (200):
{
  "success": true,
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "tier": "amateur"
  },
  "token": "jwt-token-here"
}
```

### Register

**POST** `/auth/register`

```json
Request:
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}

Response (201):
{
  "success": true,
  "user": { ... },
  "token": "jwt-token-here"
}
```

### OAuth Discord

**GET** `/auth/oauth/discord`

Redirects to Discord login.

---

## 📋 Reviews API

### List Reviews

**GET** `/reviews`

**Query Parameters:**
- `page=1` (pagination)
- `limit=20` (items per page)
- `type=flower` (filter by type)
- `search=term` (search name/cultivar)

```json
Response (200):
{
  "success": true,
  "data": [
    {
      "id": "review-123",
      "type": "flower",
      "name": "Blue Dream",
      "cultivar": "Blue Dream Clone",
      "isPublic": true,
      "createdAt": "2026-01-13T10:00:00Z",
      "rating": 8.5
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150
  }
}
```

### Get Review

**GET** `/reviews/:id`

```json
Response (200):
{
  "success": true,
  "data": {
    "id": "review-123",
    "type": "flower",
    "name": "Blue Dream",
    "cultivar": "Blue Dream Clone",
    "data": {
      "generalInfo": { ... },
      "visual": { ... },
      "odors": { ... },
      "taste": { ... },
      "effects": { ... },
      "pipelines": { ... }
    },
    "isPublic": true,
    "createdAt": "2026-01-13T10:00:00Z",
    "updatedAt": "2026-01-13T11:00:00Z"
  }
}
```

### Create Review

**POST** `/reviews`

```json
Request:
{
  "type": "flower",
  "name": "Blue Dream",
  "data": {
    "generalInfo": {
      "cultivar": "Blue Dream Clone",
      "farm": "Local Farm",
      "type": "Sativa-dominant"
    },
    "visual": { ... },
    "odors": { ... }
  },
  "isPublic": false
}

Response (201):
{
  "success": true,
  "data": {
    "id": "review-123",
    ...
  }
}
```

### Update Review

**PUT** `/reviews/:id`

```json
Request:
{
  "name": "Blue Dream v2",
  "data": { ... }
}

Response (200):
{
  "success": true,
  "data": { ... }
}
```

### Delete Review

**DELETE** `/reviews/:id`

```json
Response (200):
{
  "success": true,
  "message": "Review deleted"
}
```

---

## 📤 Exports API

### Create Export

**POST** `/exports`

```json
Request:
{
  "reviewId": "review-123",
  "template": "compact",
  "format": "png",
  "options": {
    "width": 1080,
    "height": 1080
  }
}

Response (201):
{
  "success": true,
  "data": {
    "id": "export-456",
    "reviewId": "review-123",
    "fileUrl": "https://cdn.example.com/exports/export-456.png",
    "format": "png",
    "createdAt": "2026-01-13T10:00:00Z"
  }
}
```

### List Exports

**GET** `/exports`

```json
Response (200):
{
  "success": true,
  "data": [
    {
      "id": "export-456",
      "reviewId": "review-123",
      "fileUrl": "https://cdn.example.com/exports/export-456.png",
      "format": "png",
      "createdAt": "2026-01-13T10:00:00Z"
    }
  ]
}
```

### Download Export

**GET** `/exports/:id/download`

Returns file directly.

---

## 👤 Users API

### Get Profile

**GET** `/users/profile`

```json
Response (200):
{
  "success": true,
  "data": {
    "id": "user-123",
    "email": "user@example.com",
    "name": "John Doe",
    "tier": "amateur",
    "avatar": "https://...",
    "createdAt": "2025-01-01T10:00:00Z"
  }
}
```

### Update Profile

**PUT** `/users/profile`

```json
Request:
{
  "name": "John Doe Updated",
  "avatar": "image-url"
}

Response (200):
{
  "success": true,
  "data": { ... }
}
```

### Get Stats

**GET** `/users/stats`

```json
Response (200):
{
  "success": true,
  "data": {
    "totalReviews": 15,
    "totalExports": 42,
    "reviewsByType": {
      "flower": 8,
      "hash": 4,
      "concentrate": 2,
      "edible": 1
    },
    "averageRating": 7.8,
    "likes": 250,
    "comments": 45
  }
}
```

---

## 🧬 Genetics API

### List Cultivars

**GET** `/genetics/cultivars`

```json
Response (200):
{
  "success": true,
  "data": [
    {
      "id": "cultivar-123",
      "name": "Blue Dream",
      "breeder": "DJ Short",
      "type": "Sativa-dominant",
      "parents": ["Blueberry", "Haze"],
      "isPublic": true
    }
  ]
}
```

### Create Cultivar

**POST** `/genetics/cultivars`

```json
Request:
{
  "name": "New Strain",
  "breeder": "My Breeder",
  "parents": ["Parent1", "Parent2"],
  "type": "Hybrid"
}

Response (201):
{
  "success": true,
  "data": { ... }
}
```

---

## 📁 Upload API

### Upload Image

**POST** `/uploads/image` (multipart/form-data)

```
Form Data:
- file: <image file>
- type: "review" | "profile"

Response (200):
{
  "success": true,
  "fileUrl": "https://cdn.example.com/images/abc123.jpg"
}
```

### Upload Document

**POST** `/uploads/document` (multipart/form-data)

```
Form Data:
- file: <pdf/doc file>
- documentType: "kyc" | "license"

Response (200):
{
  "success": true,
  "fileUrl": "https://cdn.example.com/documents/abc123.pdf"
}
```

---

## 🎨 Gallery API

### List Public Reviews

**GET** `/gallery`

**Query Parameters:**
- `page=1`
- `sort=latest` | `popular` | `trending`
- `type=flower`
- `search=term`

```json
Response (200):
{
  "success": true,
  "data": [ ... ],
  "pagination": { ... }
}
```

### Like Review

**POST** `/gallery/:reviewId/like`

```json
Response (200):
{
  "success": true,
  "message": "Liked"
}
```

### Unlike Review

**DELETE** `/gallery/:reviewId/like`

```json
Response (200):
{
  "success": true,
  "message": "Unlike"
}
```

### Comment on Review

**POST** `/gallery/:reviewId/comments`

```json
Request:
{
  "text": "Great review!"
}

Response (201):
{
  "success": true,
  "data": {
    "id": "comment-123",
    "text": "Great review!",
    "authorId": "user-456",
    "createdAt": "2026-01-13T10:00:00Z"
  }
}
```

---

## ⚖️ Legal API

### Age Verification

**POST** `/legal/verify-age`

```json
Request:
{
  "birthDate": "1990-01-15"
}

Response (200):
{
  "success": true,
  "isAdult": true
}
```

### Accept Terms

**POST** `/legal/accept-terms`

```json
Request:
{
  "termsVersion": "1.0"
}

Response (200):
{
  "success": true,
  "message": "Terms accepted"
}
```

---

## ❌ Error Responses

### Standard Error Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### Common Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (not authenticated) |
| 403 | Forbidden (not permitted) |
| 404 | Not Found |
| 409 | Conflict (duplicate) |
| 429 | Too Many Requests (rate limit) |
| 500 | Server Error |

---

## 📊 Rate Limits

```
General API:     100 requests / 15 minutes
Auth:            5 attempts / hour
Upload:          10 files / hour (per user)
Gallery:         1000 requests / hour
```

---

## 🔗 Webhook Events (Future)

```
review.created
review.updated
review.deleted
review.published
comment.created
like.added
export.completed
```

---

## 🧪 Testing with cURL

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123"}'

# Get token from response, then use:
TOKEN="jwt-token-here"

# Get reviews
curl -X GET http://localhost:3000/api/reviews \
  -H "Authorization: Bearer $TOKEN"

# Create review
curl -X POST http://localhost:3000/api/reviews \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"flower","name":"Test",...}'
```

---

## 📚 Testing Tools

- **Postman**: https://www.postman.com
- **Insomnia**: https://insomnia.rest
- **Thunder Client**: VS Code extension
- **cURL**: Command line tool

---

**Dernière mise à jour**: 13 Jan 2026
