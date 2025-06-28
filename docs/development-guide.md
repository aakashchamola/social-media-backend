# 👨‍💻 Development Setup & Workflow Guide

## 🏗️ **Project Architecture Overview**

This social media backend follows a **modular MVC architecture** with clean separation of concerns:

### **📁 Core Architecture Components**
```
src/
├── 🎯 app.js              # Entry point: Express + Apollo GraphQL server
├── 🔧 controllers/        # Business logic layer
├── 🗄️ models/            # Data access layer  
├── 🛣️ routes/            # REST API endpoints
├── 🌐 graphql/           # GraphQL schema & resolvers
├── 🛡️ middleware/        # Authentication & validation
└── ⚙️ utils/             # Shared utilities & services
```

### **🔄 Request Flow**
1. **Client Request** → Express Router
2. **Authentication** → JWT Middleware (if protected)
3. **Validation** → Joi Schema Validation
4. **Controller** → Business Logic Processing
5. **Model** → Database Query Execution
6. **Response** → JSON/GraphQL Response

---

## 🛠️ **Development Environment Setup**

### **📋 Prerequisites & System Requirements**

```bash
# Required Software (verified versions)
Node.js >= 16.0.0         # JavaScript runtime
PostgreSQL >= 12.0         # Primary database
npm >= 8.0.0              # Package manager
Git >= 2.30.0             # Version control

# Optional but Recommended
Postman                    # API testing
VS Code                    # Code editor with extensions
```

### **🔧 Step-by-Step Installation**

#### **1. Project Setup**
```bash
# Clone repository
git clone <repository-url>
cd social-media-backend

# Install all dependencies
npm install

# Verify installation
npm list --depth=0
```

#### **2. PostgreSQL Database Setup**
```bash
# Install PostgreSQL (if not already installed)
# macOS: brew install postgresql
# Ubuntu: sudo apt-get install postgresql postgresql-contrib
# Windows: Download from postgresql.org

# Start PostgreSQL service
# macOS: brew services start postgresql
# Ubuntu: sudo systemctl start postgresql
# Windows: Use Services app

# Create database
createdb social_media_db

# Verify database connection
psql -d social_media_db -c "SELECT version();"
```

#### **3. Environment Configuration**
```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your configuration:
nano .env
```

**Required Environment Variables:**
```bash
# Server Configuration
PORT=8000                              # Server port (3000 or 8000)
NODE_ENV=development                   # Environment mode

# Database Configuration
DB_HOST=localhost                      # Database host
DB_PORT=5432                          # PostgreSQL port
DB_NAME=social_media_db               # Database name
DB_USER=your_postgres_username        # Database user
DB_PASSWORD=your_postgres_password    # Database password

# Security Configuration
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=24h                    # Token expiration

# Logging Configuration  
LOG_LEVEL=verbose                     # verbose, critical, or error
```

#### **4. Database Schema Initialization**
```bash
# Initialize database tables and constraints
npm run setup:db

# This script will:
# ✅ Create all required tables (users, posts, comments, likes, follows)
# ✅ Set up foreign key relationships
# ✅ Create performance indexes
# ✅ Insert sample data for testing

# Verify tables were created
psql -d social_media_db -c "\dt"
```

#### **5. Start Development Server**
```bash
# Development mode with auto-reload (recommended)
npm run dev

# Alternative start modes:
npm start                    # Production mode
npm run start:verbose        # Verbose logging
npm run start:critical       # Error-only logging

# Server will start on: http://localhost:8000
```

---

## 🧪 **Testing & Quality Assurance**

### **🔍 Automated Testing Suite**

#### **Comprehensive API Tests**
```bash
# Make test script executable (first time only)
chmod +x test-complete.sh

# Run complete test suite
./test-complete.sh

# The test suite validates:
# ✅ User registration & authentication flow
# ✅ JWT token generation & validation
# ✅ User search & pagination
# ✅ Follow/unfollow functionality
# ✅ Post creation & scheduling
# ✅ Personalized feed generation
# ✅ Like/unlike operations
# ✅ Comment CRUD operations
# ✅ GraphQL queries & mutations
# ✅ Error handling & edge cases
```

#### **Individual Component Testing**
```bash
# Test health endpoint
curl http://localhost:8000/health

# Test user registration
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "full_name": "Test User"
  }'

# Test authentication
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

### **🌐 GraphQL Testing**

#### **GraphQL Playground**
- **URL**: `http://localhost:8000/graphql`
- **Features**: 
  - Interactive query builder
  - Schema introspection
  - Auto-completion
  - Query validation
  - Documentation explorer

#### **Sample GraphQL Queries**
```graphql
# Test authentication
mutation {
  login(username: "testuser", password: "password123") {
    token
    user {
      id
      username
      full_name
    }
  }
}

# Test user profile (requires authentication header)
query {
  me {
    id
    username
    full_name
    stats {
      posts_count
      followers_count
      following_count
    }
  }
}
```

### **📮 Postman Collection**
```bash
# Import ready-to-use collection
# File: docs/api-collection.json
# Features:
# ✅ Pre-configured requests for all endpoints
# ✅ Automatic authentication token management
# ✅ Environment variables for different stages
# ✅ Test scripts for response validation
```

---

## 🐛 **Debugging & Troubleshooting**

### **📝 Logging Configuration**

#### **Log Levels**
```bash
# Verbose logging (development)
npm run start:verbose
# Shows: All requests, SQL queries, detailed errors

# Critical logging (production)
npm run start:critical  
# Shows: Only critical errors and warnings

# Custom log level in .env
LOG_LEVEL=verbose    # verbose | critical | error
```

#### **Log Format**
```
[2025-01-28 12:00:00] [VERBOSE] POST /api/auth/login - Success
[2025-01-28 12:00:01] [CRITICAL] Database connection failed: Connection timeout
```

### **🔧 Common Development Issues**

#### **Database Connection Problems**
```bash
# Check PostgreSQL status
pg_isready

# Test connection manually
psql -h localhost -p 5432 -U your_username -d social_media_db

# Common fixes:
# 1. Verify PostgreSQL is running
# 2. Check DB credentials in .env
# 3. Ensure database exists
# 4. Verify network connectivity
```

#### **Port Already in Use**
```bash
# Find process using port
lsof -ti:8000

# Kill process
lsof -ti:8000 | xargs kill -9

# Alternative: Change PORT in .env
PORT=3001
```

#### **JWT Token Issues**
```bash
# Debug JWT tokens at: https://jwt.io
# Common issues:
# 1. JWT_SECRET mismatch
# 2. Token expiration
# 3. Invalid token format
# 4. Missing Authorization header

# Test token generation:
node -e "
const jwt = require('jsonwebtoken');
const token = jwt.sign({id: 1}, 'your_secret');
console.log('Token:', token);
"
```

#### **Module Not Found Errors**
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check Node.js version
node --version  # Should be >= 16.0.0
```

---

## 🗄️ **Database Management**

### **📊 Schema Overview**
```sql
-- Core Tables:
users       # User accounts and profiles
posts       # Content with media and scheduling
comments    # Post comments with moderation
likes       # Post likes with uniqueness constraints
follows     # User follow relationships

-- Key Features:
-- ✅ Foreign key constraints for data integrity
-- ✅ Indexes on frequently queried columns
-- ✅ Soft delete functionality (posts)
-- ✅ Automatic timestamp tracking
-- ✅ Unique constraints for business rules
```

### **🔧 Database Operations**
```bash
# Reset database (destructive)
npm run setup:db

# Manual table inspection
psql -d social_media_db

# View table structure
\d users
\d posts
\d comments

# Check indexes
\di

# View foreign key constraints
\d+ posts
```

### **📈 Performance Monitoring**
```sql
-- Check query performance
EXPLAIN ANALYZE SELECT * FROM posts 
JOIN users ON posts.user_id = users.id 
WHERE posts.created_at > NOW() - INTERVAL '1 day';

-- Monitor active connections
SELECT count(*) FROM pg_stat_activity;

-- View slow queries (if logging enabled)
SELECT query, mean_time FROM pg_stat_statements 
ORDER BY mean_time DESC LIMIT 10;
```

---

## 🚀 **Development Workflow**

### **📋 Development Best Practices**

#### **1. Code Organization**
```bash
# Follow existing patterns:
# ✅ Controllers: Business logic only
# ✅ Models: Database operations only  
# ✅ Routes: Endpoint definitions only
# ✅ Utils: Reusable helper functions
# ✅ Middleware: Cross-cutting concerns
```

#### **2. API Development Flow**
```bash
# For new endpoints:
1. Define route in routes/
2. Implement controller logic
3. Add model methods if needed
4. Update validation schemas
5. Add to GraphQL schema (if applicable)
6. Write tests
7. Update documentation
```

#### **3. Database Changes**
```bash
# For schema changes:
1. Update sql/schema.sql
2. Create migration script (if needed)
3. Test with fresh database
4. Update model methods
5. Run test suite
```

### **🔄 Git Workflow**
```bash
# Create feature branch
git checkout -b feature/user-search-improvements

# Make changes with descriptive commits
git add .
git commit -m "feat: add pagination to user search endpoint"

# Test before pushing
./test-complete.sh

# Push and create pull request
git push origin feature/user-search-improvements
```

### **📦 Dependency Management**
```bash
# Add new dependency
npm install package-name

# Add dev dependency
npm install --save-dev package-name

# Update dependencies (carefully)
npm update

# Audit for vulnerabilities
npm audit
npm audit fix
```

---

## 🔧 **Available NPM Scripts**

```bash
# Development & Production
npm start                # Production server
npm run dev             # Development with nodemon auto-reload
npm run start:verbose   # Verbose logging mode
npm run start:critical  # Critical errors only

# Database Management
npm run setup:db        # Initialize/reset database schema

# Testing & Quality
./test-complete.sh      # Run comprehensive test suite
npm run lint            # Code linting (if configured)
npm run format          # Code formatting (if configured)

# Utilities
npm list --depth=0      # List installed packages
npm outdated            # Check for package updates
```

---

## 📚 **Additional Resources**

### **📖 Documentation Links**
- **API Documentation**: `docs/API_DOCUMENTATION.md`
- **Project Structure**: Root `README.md`
- **Environment Setup**: `.env.example`
- **Database Schema**: `sql/schema.sql`

### **🔗 External Resources**
- **Express.js Documentation**: https://expressjs.com/
- **Apollo GraphQL**: https://www.apollographql.com/docs/
- **PostgreSQL Documentation**: https://www.postgresql.org/docs/
- **JWT.io**: https://jwt.io/ (token debugging)
- **Postman Learning**: https://learning.postman.com/

### **🛡️ Security Considerations**
```bash
# Production checklist:
# ✅ Change default JWT_SECRET
# ✅ Use environment variables for secrets
# ✅ Enable HTTPS in production
# ✅ Configure CORS properly
# ✅ Set up rate limiting
# ✅ Enable SQL injection protection (already implemented)
# ✅ Use helmet middleware (already configured)
```

---

## 📞 **Getting Help**

### **🔍 Debugging Steps**
1. **Check logs**: Use verbose logging mode
2. **Test endpoints**: Use Postman or curl
3. **Verify database**: Check table contents
4. **Test authentication**: Verify JWT tokens
5. **Run test suite**: Execute `./test-complete.sh`

### **📝 Common Questions**

**Q: How do I add a new API endpoint?**
A: Follow the pattern in existing routes → controllers → models

**Q: How do I test GraphQL queries?**
A: Use the GraphQL playground at `/graphql`

**Q: How do I reset the database?**
A: Run `npm run setup:db` (Warning: This deletes all data)

**Q: How do I change the port?**
A: Update `PORT` in `.env` file

**Q: How do I enable/disable logging?**
A: Set `LOG_LEVEL` in `.env` to `verbose`, `critical`, or `error`

---

## 🏆 **Development Success Checklist**

Before considering your development environment ready:

- ✅ **Database**: PostgreSQL running and accessible
- ✅ **Environment**: All `.env` variables configured
- ✅ **Dependencies**: All npm packages installed
- ✅ **Schema**: Database tables created successfully
- ✅ **Server**: Application starts without errors
- ✅ **Health Check**: `/health` endpoint responds OK
- ✅ **Authentication**: Can register and login users
- ✅ **API Testing**: Basic CRUD operations work
- ✅ **GraphQL**: Playground accessible and functional
- ✅ **Test Suite**: `./test-complete.sh` passes
- ✅ **Documentation**: API docs accessible and accurate

---

**🎯 Ready to start developing? Run `npm run dev` and visit `http://localhost:8000/health` to confirm everything is working!**
