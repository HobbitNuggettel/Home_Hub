# 🚀 Home Hub API Documentation

## Overview

The Home Hub API is a comprehensive RESTful API built with Express.js that provides backend services for the Home Hub application. It includes 14 API categories with full CRUD operations, authentication, security, and performance optimizations.

## 🏗️ Architecture

### Technology Stack
- **Framework**: Express.js 4.18.2
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS, Rate Limiting
- **Performance**: Compression, Response Time Monitoring
- **Testing**: Jest, Supertest
- **Documentation**: Swagger/OpenAPI

### API Categories

1. **Authentication** (`/api/auth`) - User registration, login, profile management
2. **Users** (`/api/users`) - User management and settings
3. **Inventory** (`/api/inventory`) - Household inventory management
4. **Spending** (`/api/spending`) - Expense tracking and reports
5. **Analytics** (`/api/analytics`) - Data analytics and insights
6. **Budget** (`/api/budget`) - Budget planning and management
7. **Notifications** (`/api/notifications`) - User notifications
8. **Collaboration** (`/api/collaboration`) - Multi-user collaboration
9. **Weather** (`/api/weather`) - Weather data and forecasts
10. **Recipes** (`/api/recipes`) - Recipe management and meal planning
11. **Shopping** (`/api/shopping`) - Shopping list management
12. **Maintenance** (`/api/maintenance`) - Home maintenance tracking
13. **AI Services** (`/api/ai`) - AI-powered features
14. **Smart Home** (`/api/smart-home`) - Smart home device management
15. **Settings** (`/api/settings`) - User preferences and configuration

## 🔧 Performance Optimizations

### Compression
- **Gzip compression** for responses > 1KB
- **Configurable compression level** (level 6 for balanced performance)
- **Selective compression** with filter options

### Rate Limiting
- **1000 requests per 15 minutes** per IP
- **Skip rate limiting** for health checks and static assets
- **Configurable limits** for different endpoint types

### Response Time Monitoring
- **Automatic slow request detection** (>1000ms)
- **Request timing middleware** for performance analysis
- **Optimized logging** for production environments

## 🛡️ Security Features

### Authentication
- **JWT-based authentication** with configurable expiration
- **Password hashing** using bcryptjs
- **Token validation** on protected routes

### Input Validation
- **SQL injection protection** with input sanitization
- **XSS prevention** with content filtering
- **Data type validation** and range checking
- **Required field validation**

### Security Headers
- **Helmet.js** for security headers
- **CORS configuration** with allowed origins
- **Content Security Policy** (CSP)
- **X-Frame-Options** and XSS protection

## 📊 API Endpoints

### Public Endpoints

#### Health Check
```http
GET /health
```
Returns server health status and uptime information.

#### API Status
```http
GET /api/status
```
Returns comprehensive API status including all available endpoints.

#### Weather Test
```http
GET /api/weather/test
```
Public weather API test endpoint (no authentication required).

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123",
  "displayName": "User Name"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

#### Get User Profile
```http
GET /api/auth/profile
Authorization: Bearer <jwt-token>
```

### Inventory Management

#### Get All Items
```http
GET /api/inventory
Authorization: Bearer <jwt-token>
```

#### Create New Item
```http
POST /api/inventory
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "name": "Item Name",
  "category": "Category",
  "quantity": 1,
  "price": 10.99,
  "expiryDate": "2024-12-31"
}
```

#### Get Categories
```http
GET /api/inventory/categories
Authorization: Bearer <jwt-token>
```

### Weather Services

#### Current Weather
```http
GET /api/weather/current?location=San Francisco
Authorization: Bearer <jwt-token>
```

#### Weather Forecast
```http
GET /api/weather/forecast?location=San Francisco
Authorization: Bearer <jwt-token>
```

#### Air Quality
```http
GET /api/weather/air-quality?location=San Francisco
Authorization: Bearer <jwt-token>
```

### Recipe Management

#### Get All Recipes
```http
GET /api/recipes
Authorization: Bearer <jwt-token>
```

#### Get Recipe Categories
```http
GET /api/recipes/categories
Authorization: Bearer <jwt-token>
```

#### Create Recipe
```http
POST /api/recipes
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "name": "Recipe Name",
  "category": "Dinner",
  "ingredients": ["ingredient1", "ingredient2"],
  "instructions": "Step by step instructions",
  "prepTime": 30,
  "cookTime": 45
}
```

## 🧪 Testing

### Test Suites

#### API Endpoint Tests
```bash
npm run test:api
```
Comprehensive tests for all API endpoints including:
- Public endpoints
- Authentication flows
- CRUD operations
- Error handling
- Performance benchmarks

#### Performance Tests
```bash
npm run test:performance
```
Performance testing including:
- Response time validation
- Load testing
- Memory usage monitoring
- Concurrent request handling

#### Security Tests
```bash
npm run test:security
```
Security testing including:
- Authentication security
- Input validation
- Rate limiting
- CORS security
- Security headers

### Running All Tests
```bash
npm test
```

### Test Coverage
```bash
npm run test:coverage
```

## 📈 Monitoring and Logging

### Request Logging
- **Morgan middleware** for HTTP request logging
- **Optimized logging** for production environments
- **Skip logging** for health checks and static assets

### Performance Monitoring
- **Response time tracking** for all requests
- **Slow request detection** and logging
- **Memory usage monitoring**

### Error Handling
- **Centralized error handling** with custom error types
- **Graceful error responses** without sensitive information exposure
- **Request validation** with detailed error messages

## 🔄 API Versioning

### Version Support
- **v1 API** (`/api/v1/`) - Current stable version
- **Legacy API** (`/api/`) - Backward compatibility
- **Version info endpoint** (`/api/version-info`)

### Migration Support
- **Backward compatibility** middleware
- **Version statistics** and usage tracking
- **Migration guides** for API updates

## 🚀 Deployment

### Environment Configuration
```bash
# Required environment variables
PORT=5001
JWT_SECRET=your-secret-key
NODE_ENV=production
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
```

### Production Optimizations
- **Compression enabled** for all responses
- **Rate limiting** configured for production load
- **Security headers** optimized for production
- **Error handling** configured for production environment

### Docker Support
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5001
CMD ["npm", "start"]
```

## 📚 API Documentation

### Swagger UI
Access the interactive API documentation at:
```
http://localhost:5001/api-docs
```

### OpenAPI Specification
The API follows OpenAPI 3.0 specification with:
- **Complete endpoint documentation**
- **Request/response schemas**
- **Authentication requirements**
- **Example requests and responses**

## 🔧 Development

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Code Quality
- **ESLint** configuration for code quality
- **Prettier** for code formatting
- **Jest** for comprehensive testing
- **Supertest** for API testing

## 📞 Support

For API support and questions:
- **Documentation**: http://localhost:5001/api-docs
- **Health Check**: http://localhost:5001/health
- **API Status**: http://localhost:5001/api/status

## 🔄 Changelog

### Version 2.0.0
- ✅ Complete API backend implementation
- ✅ Performance optimizations with compression
- ✅ Comprehensive testing suite
- ✅ Security enhancements
- ✅ Zero ESLint warnings
- ✅ Organized sidebar navigation
