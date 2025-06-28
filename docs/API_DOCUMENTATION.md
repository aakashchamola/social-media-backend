# 📖 Social Media Backend - Complete API Documentation

## 🏗️ **Architecture Overview**

This backend provides a comprehensive social media platform with:
- **🔗 Dual API Implementation**: Complete REST API + GraphQL schema
- **🔐 JWT Authentication**: Secure token-based authentication system
- **👥 Social Features**: User search, follow/unfollow, personalized feed
- **📝 Content Management**: Posts, comments, likes with moderation controls
- **⏰ Advanced Features**: Scheduled post publishing, background processing
- **🛡️ Production-Ready**: Input validation, error handling, security middleware

---

## 🚀 **Quick Setup Guide**

### **Prerequisites**
```bash
# Required software versions
Node.js >= 16.0.0
PostgreSQL >= 12.0
npm >= 8.0.0
```

### **Installation Steps**

1. **📦 Install Dependencies**
   ```bash
   cd social-media-backend
   npm install
   ```

2. **🗄️ Database Configuration**
   ```bash
   # Create PostgreSQL database
   createdb social_media_db
   
   # Copy environment template
   cp .env.example .env
   
   # Edit .env with your credentials:
   # DB_HOST=localhost
   # DB_PORT=5432
   # DB_NAME=social_media_db
   # DB_USER=your_username
   # DB_PASSWORD=your_password
   # JWT_SECRET=your_secure_jwt_secret
   ```

3. **🔧 Initialize Database Schema**
   ```bash
   npm run setup:db
   ```

4. **🚀 Start the Server**
   ```bash
   # Development mode (auto-reload)
   npm run dev
   
   # Production mode
   npm start
   
   # Verbose logging mode
   npm run start:verbose
   ```

5. **✅ Verify Installation**
   ```bash
   # Test health endpoint
   curl http://localhost:3000/health
   
   # Expected response:
   # {"status":"OK","timestamp":"2025-01-28T12:00:00.000Z"}
   ```

---

## 📡 **REST API Reference**

### **🌐 Base Configuration**
- **Base URL**: `http://localhost:3000/api`
- **Content-Type**: `application/json` (for POST/PUT/PATCH requests)
- **Authentication**: `Authorization: Bearer <jwt_token>` (for protected endpoints)
- **Error Format**: `{"error": "Error message", "status": 400}`

---

### **🔐 Authentication Endpoints**

#### **Register New User**
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",        # Required: 3-30 chars, alphanumeric + underscore
  "email": "john@example.com",  # Required: valid email format
  "password": "securepass123",  # Required: min 6 characters
  "full_name": "John Doe"       # Required: 1-100 characters
}
```

**Response (201):**
```json
{
  "message": "User created successfully",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "full_name": "John Doe",
    "created_at": "2025-01-28T12:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### **User Login**
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "johndoe",       # Required: username or email
  "password": "securepass123"  # Required: user's password
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "full_name": "John Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### **Get Current User Profile**
```http
GET /api/auth/profile
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "full_name": "John Doe",
    "created_at": "2025-01-28T12:00:00.000Z"
  },
  "stats": {
    "posts_count": 5,
    "followers_count": 12,
    "following_count": 8
  }
}
```

---

### **👥 User Management Endpoints**

#### **Search Users**
```http
GET /api/users/search?name=john&limit=20&offset=0
Authorization: Bearer <jwt_token> (optional)
```

**Query Parameters:**
- `name` (required): Search term for username or full name
- `limit` (optional): Results per page (default: 20, max: 100)
- `offset` (optional): Number of results to skip (default: 0)

**Response (200):**
```json
{
  "users": [
    {
      "id": 1,
      "username": "johndoe",
      "full_name": "John Doe",
      "followers_count": 12,
      "following_count": 8,
      "is_following": false  # Only if authenticated
    }
  ],
  "total": 1,
  "limit": 20,
  "offset": 0
}
```

#### **Follow User**
```http
POST /api/users/follow/{user_id}
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "message": "Successfully followed user",
  "following": true
}
```

#### **Unfollow User**
```http
DELETE /api/users/follow/{user_id}
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "message": "Successfully unfollowed user",
  "following": false
}
```

#### **Get User Profile**
```http
GET /api/users/{user_id}
Authorization: Bearer <jwt_token> (optional)
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "username": "johndoe",
    "full_name": "John Doe",
    "created_at": "2025-01-28T12:00:00.000Z",
    "followers_count": 12,
    "following_count": 8,
    "posts_count": 5,
    "is_following": false  # Only if authenticated
  }
}
```

---

### **📝 Post Management Endpoints**

#### **Create New Post**
```http
POST /api/posts
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "content": "This is my new post!",     # Required: 1-500 characters
  "media_url": "https://example.com/image.jpg",  # Optional: valid URL
  "comments_enabled": true,             # Optional: default true
  "scheduled_for": "2025-01-29T15:00:00.000Z"  # Optional: future timestamp
}
```

**Response (201):**
```json
{
  "message": "Post created successfully",
  "post": {
    "id": 1,
    "content": "This is my new post!",
    "media_url": "https://example.com/image.jpg",
    "comments_enabled": true,
    "scheduled_for": "2025-01-29T15:00:00.000Z",
    "status": "scheduled",  # or "published"
    "created_at": "2025-01-28T12:00:00.000Z",
    "author": {
      "id": 1,
      "username": "johndoe",
      "full_name": "John Doe"
    }
  }
}
```

#### **Get Personalized Feed**
```http
GET /api/posts/feed?page=1&limit=20
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Posts per page (default: 20, max: 100)

**Response (200):**
```json
{
  "posts": [
    {
      "id": 1,
      "content": "This is my new post!",
      "media_url": "https://example.com/image.jpg",
      "comments_enabled": true,
      "created_at": "2025-01-28T12:00:00.000Z",
      "author": {
        "id": 2,
        "username": "alice",
        "full_name": "Alice Smith"
      },
      "likes_count": 5,
      "comments_count": 3,
      "liked_by_user": true
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 15,
  "has_more": false
}
```

#### **Get Single Post**
```http
GET /api/posts/{post_id}
Authorization: Bearer <jwt_token> (optional)
```

#### **Delete Post**
```http
DELETE /api/posts/{post_id}
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "message": "Post deleted successfully"
}
```

---

### **❤️ Like System Endpoints**

#### **Like Post**
```http
POST /api/likes/post/{post_id}
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "message": "Post liked successfully",
  "liked": true,
  "likes_count": 6
}
```

#### **Unlike Post**
```http
DELETE /api/likes/post/{post_id}
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "message": "Post unliked successfully",
  "liked": false,
  "likes_count": 5
}
```

---

### **💬 Comment System Endpoints**

#### **Create Comment**
```http
POST /api/comments/post/{post_id}
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "content": "Great post! Thanks for sharing."  # Required: 1-500 chars
}
```

**Response (201):**
```json
{
  "message": "Comment created successfully",
  "comment": {
    "id": 1,
    "content": "Great post! Thanks for sharing.",
    "created_at": "2025-01-28T12:00:00.000Z",
    "updated_at": "2025-01-28T12:00:00.000Z",
    "author": {
      "id": 1,
      "username": "johndoe",
      "full_name": "John Doe"
    },
    "post_id": 1
  }
}
```

#### **Get Post Comments**
```http
GET /api/comments/post/{post_id}?limit=20&offset=0
```

#### **Update Comment**
```http
PUT /api/comments/{comment_id}
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "content": "Updated comment text here."
}
```

#### **Delete Comment**
```http
DELETE /api/comments/{comment_id}
Authorization: Bearer <jwt_token>
```

---

## 🌐 **GraphQL API**

### **Endpoint**: `http://localhost:3000/graphql`

#### **🔍 Available Queries**
```graphql
# Get current user profile
query {
  me {
    id
    username
    full_name
    email
    stats {
      posts_count
      followers_count
      following_count
    }
  }
}

# Get user by ID
query {
  user(id: 1) {
    id
    username
    full_name
    followers_count
    following_count
  }
}

# Get personalized feed
query {
  feed(limit: 20, offset: 0) {
    id
    content
    media_url
    created_at
    author {
      username
      full_name
    }
    likes_count
    comments_count
    liked_by_user
  }
}

# Search users
query {
  searchUsers(name: "john", limit: 10) {
    id
    username
    full_name
    followers_count
  }
}
```

#### **⚡ Available Mutations**
```graphql
# User login
mutation {
  login(username: "johndoe", password: "password123") {
    token
    user {
      id
      username
      full_name
    }
  }
}

# Create post
mutation {
  createPost(content: "My new post!", comments_enabled: true) {
    id
    content
    created_at
    author {
      username
    }
  }
}

# Like post
mutation {
  likePost(postId: 1) {
    liked
    likes_count
  }
}

# Follow user
mutation {
  followUser(userId: 2) {
    following
    message
  }
}

# Create comment
mutation {
  createComment(postId: 1, content: "Great post!") {
    id
    content
    author {
      username
    }
  }
}
```

---

## 🧪 **Testing & Validation**

### **🔧 Automated Testing**
```bash
# Run comprehensive test suite
./test-complete.sh

# The script tests:
# ✅ User registration & authentication
# ✅ User search & follow functionality
# ✅ Post creation & feed generation
# ✅ Like & comment systems
# ✅ Both REST & GraphQL APIs
# ✅ Error handling & edge cases
```

### **🌐 GraphQL Playground**
- **URL**: `http://localhost:3000/graphql`
- **Features**: Interactive query builder, schema introspection, documentation
- **Authentication**: Add `Authorization: Bearer <token>` in HTTP headers

### **📮 Postman Collection**
- **File**: `docs/api-collection.json`
- **Import**: Ready-to-use collection with pre-configured requests
- **Authentication**: Automatic token management for protected endpoints

---

## 🛡️ **Error Handling & Status Codes**

### **📋 HTTP Status Codes**
| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST (resource created) |
| 400 | Bad Request | Invalid input validation |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | Valid token but insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource (username, email) |
| 500 | Server Error | Internal server error |

### **📝 Error Response Format**
```json
{
  "error": "Validation failed",
  "details": {
    "username": "Username must be at least 3 characters",
    "email": "Please provide a valid email address"
  },
  "status": 400
}
```

---

## 🔐 **Authentication Flow**

### **🎯 JWT Token Usage**
1. **Register** or **Login** to receive JWT token
2. **Include token** in Authorization header: `Bearer <token>`
3. **Token expires** in 24 hours (configurable)
4. **Refresh** by logging in again

### **🛡️ Protected Endpoints**
All endpoints requiring `Authorization: Bearer <token>`:
- User profile, follow/unfollow
- Post creation, deletion
- Commenting, liking
- Personalized feed access

---

## ⚡ **Performance & Limits**

### **📊 Rate Limits & Pagination**
- **Default page size**: 20 items
- **Maximum page size**: 100 items
- **Search results**: Paginated with offset/limit
- **Feed generation**: Optimized queries with database indexing

### **🗄️ Database Optimization**
- **Connection pooling**: Efficient connection management
- **Indexed columns**: Fast queries on user_id, post_id, created_at
- **Foreign key constraints**: Data integrity enforcement
- **Soft deletes**: Data preservation for analytics

---

## 🔍 **Troubleshooting**

### **🚨 Common Issues**

**Database Connection Error:**
```bash
# Check PostgreSQL is running
pg_isready

# Verify database exists
psql -d social_media_db -c "SELECT version();"
```

**JWT Token Issues:**
```bash
# Verify token in JWT debugger: https://jwt.io
# Check JWT_SECRET in .env matches server configuration
```

**Port Already in Use:**
```bash
# Kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or change PORT in .env file
```

---

## 📞 **API Support**

For technical support:
1. **📖 Check Documentation**: Review endpoint specifications
2. **🧪 Run Tests**: Execute `./test-complete.sh` for validation
3. **🔍 Debug Logs**: Use `npm run start:verbose` for detailed logging
4. **🌐 GraphQL Playground**: Test queries interactively at `/graphql`
