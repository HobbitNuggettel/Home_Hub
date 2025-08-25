# Home Hub API

A comprehensive RESTful API for the Home Hub smart home management platform, featuring real-time collaboration, inventory tracking, budget management, and advanced analytics.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Real-time Communication**: WebSocket support via Socket.IO for live collaboration
- **Comprehensive CRUD Operations**: Full CRUD for all major entities
- **Advanced Analytics**: Data insights, trends, and forecasting
- **Budget Management**: Multi-period budget planning and tracking
- **Notification System**: Smart notifications with user preferences
- **Collaboration Tools**: Real-time collaboration rooms and chat
- **API Documentation**: Interactive Swagger/OpenAPI documentation
- **Security**: Rate limiting, CORS, Helmet security headers
- **Error Handling**: Centralized error handling with detailed responses

## 🏗️ Architecture

```
api/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Business logic controllers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Data models
│   ├── routes/          # API route definitions
│   ├── services/        # Business services
│   └── utils/           # Utility functions
├── docs/                # Additional documentation
├── server.js            # Main server file
├── package.json         # Dependencies and scripts
└── README.md            # This file
```

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Real-time**: Socket.IO
- **Documentation**: Swagger/OpenAPI 3.0
- **Security**: Helmet, CORS, Rate Limiting
- **Authentication**: JWT, bcrypt
- **Validation**: Express-validator
- **Logging**: Morgan
- **File Processing**: Multer, Sharp
- **Utilities**: Moment.js, Lodash, UUID

## 📋 Prerequisites

- Node.js 16+ 
- npm or yarn
- MongoDB (for production) or Firebase (planned)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd api
npm install
```

### 2. Environment Configuration

Create a `.env` file in the `api` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:19006

# Database Configuration (for future use)
MONGODB_URI=mongodb://localhost:27017/homehub

# Firebase Configuration (for future use)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

# API Configuration
API_URL=http://localhost:5000
```

### 3. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:5000`

### 4. Access API Documentation

Visit `http://localhost:5000/api-docs` for interactive API documentation.

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify JWT token
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Password reset request

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/change-password` - Change password
- `GET /api/users/me/activity` - Get user activity
- `GET /api/users` - List users (admin only)
- `GET /api/users/:userId` - Get user by ID (admin only)
- `PUT /api/users/:userId` - Update user (admin only)
- `DELETE /api/users/:userId` - Delete user (admin only)

### Inventory
- `GET /api/inventory` - List inventory items
- `POST /api/inventory` - Create inventory item
- `GET /api/inventory/:itemId` - Get inventory item
- `PUT /api/inventory/:itemId` - Update inventory item
- `DELETE /api/inventory/:itemId` - Delete inventory item
- `GET /api/inventory/categories` - List categories
- `GET /api/inventory/analytics` - Get inventory analytics
- `POST /api/inventory/bulk` - Bulk operations

### Spending
- `GET /api/spending` - List spending transactions
- `POST /api/spending` - Create spending transaction
- `GET /api/spending/:transactionId` - Get transaction
- `PUT /api/spending/:transactionId` - Update transaction
- `DELETE /api/spending/:transactionId` - Delete transaction
- `GET /api/spending/categories` - List categories
- `GET /api/spending/analytics` - Get spending analytics
- `GET /api/spending/budget` - Get budget information
- `POST /api/spending/budget` - Set budget

### Budget
- `GET /api/budget` - List budgets
- `POST /api/budget` - Create budget
- `GET /api/budget/:budgetId` - Get budget
- `PUT /api/budget/:budgetId` - Update budget
- `DELETE /api/budget/:budgetId` - Delete budget
- `GET /api/budget/:budgetId/categories` - Get budget categories
- `POST /api/budget/:budgetId/track` - Track spending
- `GET /api/budget/:budgetId/alerts` - Get budget alerts

### Analytics
- `GET /api/analytics/overview` - Get analytics overview
- `GET /api/analytics/spending` - Get spending analytics
- `GET /api/analytics/inventory` - Get inventory analytics
- `GET /api/analytics/trends` - Get trend analysis
- `GET /api/analytics/forecasts` - Get predictive analytics
- `GET /api/analytics/export` - Export analytics data
- `GET /api/analytics/reports` - Get predefined reports

### Notifications
- `GET /api/notifications` - List notifications
- `GET /api/notifications/:notificationId` - Get notification
- `PATCH /api/notifications/:notificationId/read` - Mark as read
- `PATCH /api/notifications/:notificationId/archive` - Archive notification
- `PATCH /api/notifications/bulk/read` - Bulk mark as read
- `PATCH /api/notifications/bulk/archive` - Bulk archive
- `GET /api/notifications/settings` - Get notification preferences
- `PUT /api/notifications/settings` - Update notification preferences
- `POST /api/notifications/test` - Send test notification

### Collaboration
- `GET /api/collaboration/rooms` - List collaboration rooms
- `POST /api/collaboration/rooms` - Create collaboration room
- `GET /api/collaboration/rooms/:roomId` - Get collaboration room
- `GET /api/collaboration/rooms/:roomId/participants` - Get room participants
- `POST /api/collaboration/rooms/:roomId/participants` - Add participant
- `DELETE /api/collaboration/rooms/:roomId/participants/:participantId` - Remove participant
- `GET /api/collaboration/rooms/:roomId/chat` - Get chat messages
- `POST /api/collaboration/rooms/:roomId/chat` - Send chat message
- `GET /api/collaboration/rooms/:roomId/presence` - Get presence information
- `POST /api/collaboration/rooms/:roomId/presence` - Update presence status

## 🔌 Real-time Features

### Socket.IO Events

The API includes real-time capabilities via Socket.IO:

- **Connection Management**: User authentication and room joining
- **Collaboration**: Real-time document editing and chat
- **Presence**: User online/offline status
- **Notifications**: Real-time notification delivery
- **Data Updates**: Live data synchronization

### WebSocket Connection

```javascript
// Client-side connection
const socket = io('http://localhost:5000', {
  auth: {
    token: 'your-jwt-token'
  }
});

// Join user room
socket.emit('join-user-room', userId);

// Listen for real-time updates
socket.on('notification', (data) => {
  console.log('New notification:', data);
});

socket.on('collaboration_update', (data) => {
  console.log('Collaboration update:', data);
});
```

## 🔐 Authentication & Security

### JWT Authentication

All protected endpoints require a valid JWT token in the Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

### Role-Based Access Control

- **User**: Basic access to own data
- **Admin**: Full access to all data and user management

### Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS Protection**: Configurable allowed origins
- **Helmet Security**: Security headers and CSP
- **Input Validation**: Request validation and sanitization
- **Error Handling**: Secure error responses

## 📊 Data Models

### Core Entities

- **User**: Authentication and profile information
- **InventoryItem**: Household items and supplies
- **SpendingTransaction**: Financial transactions
- **Budget**: Budget planning and tracking
- **Notification**: User notifications and alerts
- **CollaborationRoom**: Real-time collaboration spaces

### Relationships

- Users own InventoryItems, SpendingTransactions, and Budgets
- Users participate in CollaborationRooms
- Notifications are sent to specific Users
- Analytics aggregate data from multiple entities

## 🧪 Testing

### Run Tests

```bash
npm test
```

### Test Coverage

```bash
npm run test:coverage
```

### API Testing

```bash
npm run test:api
```

## 📝 Development

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with hot reload
- `npm test` - Run test suite
- `npm run lint` - Run ESLint
- `npm run docs` - Generate API documentation
- `npm run seed` - Seed database with sample data
- `npm run migrate` - Run database migrations

### Code Style

The project uses ESLint for code quality. Run `npm run lint` to check for issues.

### Environment Variables

All configuration is done through environment variables. See the `.env` example above.

## 🚀 Deployment

### Production Build

```bash
npm run build
npm start
```

### Environment Variables

Set production environment variables:

```env
NODE_ENV=production
PORT=5000
JWT_SECRET=your-production-jwt-secret
ALLOWED_ORIGINS=https://yourdomain.com
```

### Docker Deployment

```bash
docker build -t homehub-api .
docker run -p 5000:5000 homehub-api
```

## 🔧 Configuration

### Server Configuration

- **Port**: Configurable via `PORT` environment variable
- **Environment**: Development/Production modes
- **CORS**: Configurable allowed origins
- **Rate Limiting**: Configurable request limits

### Security Configuration

- **JWT**: Configurable expiration and secret
- **CORS**: Configurable allowed origins and credentials
- **Rate Limiting**: Configurable windows and limits
- **Helmet**: Security headers and CSP configuration

## 📈 Performance

### Optimization Features

- **Rate Limiting**: Prevents API abuse
- **Caching**: Response caching for static data
- **Compression**: Response compression
- **Connection Pooling**: Database connection optimization
- **Async Operations**: Non-blocking I/O operations

### Monitoring

- **Health Check**: `/health` endpoint for monitoring
- **Logging**: Structured logging with Morgan
- **Error Tracking**: Centralized error handling
- **Performance Metrics**: Response time tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Development Guidelines

- Follow the existing code style
- Add comprehensive tests for new features
- Update documentation for API changes
- Use conventional commit messages
- Ensure all endpoints are documented

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: Visit `/api-docs` for interactive API documentation
- **Issues**: Report bugs and feature requests via GitHub Issues
- **Discussions**: Join community discussions on GitHub Discussions

## 🔮 Roadmap

### Phase 2 (Current)
- ✅ Core API endpoints
- ✅ Real-time collaboration
- ✅ Authentication system
- ✅ Basic analytics

### Phase 3 (Planned)
- 🔄 Database integration
- 🔄 Advanced analytics
- 🔄 Machine learning features
- 🔄 Mobile app integration

### Phase 4 (Future)
- 📋 AI-powered insights
- 📋 IoT device integration
- 📋 Advanced reporting
- 📋 Enterprise features

---

**Home Hub API** - Building the future of smart home management 🏠✨
