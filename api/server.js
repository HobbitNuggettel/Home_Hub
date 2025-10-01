const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

// Import API versioning middleware
const {
  apiVersioningMiddleware,
  backwardCompatibilityMiddleware,
  versionInfoEndpoint,
  versionStatsEndpoint,
  versionCompatibilityEndpoint,
  versionMigrationGuideEndpoint
} = require('./src/middleware/apiVersioningMiddleware');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ["http://localhost:3000", "http://localhost:19006"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

// Import routes
const authRoutes = require('./src/routes/auth');
const firebaseAuthRoutes = require('./src/routes/firebaseAuth');
const userRoutes = require('./src/routes/users');
const inventoryRoutes = require('./src/routes/inventory');
const spendingRoutes = require('./src/routes/spending');
const analyticsRoutes = require('./src/routes/analytics');
const budgetRoutes = require('./src/routes/budget');
const notificationRoutes = require('./src/routes/notifications');
const collaborationRoutes = require('./src/routes/collaboration');

// Import middleware
const { authenticateToken } = require('./src/middleware/auth');
const { errorHandler } = require('./src/middleware/errorHandler');
const {
  rateLimit,
  validateInput,
  securityHeaders,
  requestLogging,
  corsConfig,
  requestSizeLimit,
  sqlInjectionProtection,
  xssProtection
} = require('../src/middleware/securityMiddleware');

// Import services
const { initializeSocketHandlers } = require('./src/services/socketService');

// Import Swagger configuration
const specs = require('./src/config/swagger');

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"]
    }
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);

// Additional security middleware
app.use(securityHeaders());
app.use(requestLogging());
app.use(corsConfig());
app.use(requestSizeLimit(5 * 1024 * 1024)); // 5MB limit
app.use(sqlInjectionProtection());
app.use(xssProtection());

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ["http://localhost:3000", "http://localhost:19006"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Landing page
app.get('/', (req, res) => {
  res.json({
    message: '🏠 Welcome to Home Hub API',
    version: '2.0.0',
    description: 'Comprehensive API for smart home management platform',
    documentation: `${req.protocol}://${req.get('host')}/api-docs`,
    health: `${req.protocol}://${req.get('host')}/health`,
    status: 'running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    features: [
      'Authentication & Authorization',
      'Real-time Collaboration',
      'Inventory Management',
      'Spending Tracking',
      'Budget Management',
      'Advanced Analytics',
      'Smart Notifications',
      'WebSocket Support'
    ],
    quickStart: {
      auth: 'POST /api/auth/login',
      users: 'GET /api/users/profile',
      inventory: 'GET /api/inventory',
      spending: 'GET /api/spending',
      analytics: 'GET /api/analytics/overview'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '2.0.0',
    endpoints: {
      total: 8,
      categories: ['auth', 'users', 'inventory', 'spending', 'analytics', 'budget', 'notifications', 'collaboration']
    }
  });
});

// Force HTTP for Swagger assets in development
app.use('/api-docs/*', (req, res, next) => {
  if (process.env.NODE_ENV === 'development' && req.headers.referer && req.headers.referer.includes('https://')) {
    // Redirect HTTPS requests to HTTP for local development
    const httpUrl = req.headers.referer.replace('https://', 'http://');
    res.redirect(httpUrl);
    return;
  }
  next();
});

// API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customSiteTitle: '🏠 Home Hub API Documentation',
  customfavIcon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%232c3e50"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>',
  customJs: [
    'http://cdn.jsdelivr.net/npm/swagger-ui-dist@5.9.0/swagger-ui-bundle.js',
    'http://cdn.jsdelivr.net/npm/swagger-ui-dist@5.9.0/swagger-ui-standalone-preset.js'
  ],
  customCssUrl: 'http://cdn.jsdelivr.net/npm/swagger-ui-dist@5.9.0/swagger-ui.css',
  swaggerOptions: {
    docExpansion: 'list',
    filter: true,
    showRequestHeaders: true,
    showCommonExtensions: true,
    tryItOutEnabled: true,
    defaultModelsExpandDepth: 2,
    defaultModelExpandDepth: 2,
    requestInterceptor: (req) => {
      // Force HTTP protocol for local development
      if (req.url && req.url.startsWith('//')) {
        req.url = req.url.replace('//', 'http://');
      }
      req.headers['Content-Type'] = 'application/json';
      return req;
    },
    responseInterceptor: (res) => {
      return res;
    },
    onComplete: () => {
      console.log('🏠 Home Hub API Documentation loaded successfully!');
    }
  },
  customCss: `
    /* Hide default topbar */
    .swagger-ui .topbar { 
      display: none !important;
    }
    
    /* Custom header styling */
    .swagger-ui .info .title {
      font-size: 3em !important;
      color: #2c3e50 !important;
      font-weight: 700 !important;
      text-align: center !important;
      margin: 20px 0 !important;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.1) !important;
    }
    
    .swagger-ui .info .description {
      font-size: 1.2em !important;
      line-height: 1.8 !important;
      color: #34495e !important;
      background: #f8f9fa !important;
      padding: 20px !important;
      border-radius: 10px !important;
      border-left: 5px solid #3498db !important;
      margin: 20px 0 !important;
    }
    
    /* Enhanced scheme container */
    .swagger-ui .scheme-container {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
      border-radius: 15px !important;
      padding: 20px !important;
      margin: 20px 0 !important;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1) !important;
    }
    
    .swagger-ui .scheme-container .scheme-title {
      color: white !important;
      font-weight: 600 !important;
      font-size: 1.1em !important;
    }
    
    .swagger-ui .scheme-container .auth-wrapper {
      background: rgba(255,255,255,0.1) !important;
      border-radius: 8px !important;
      padding: 10px !important;
    }
    
    /* Enhanced operation blocks */
    .swagger-ui .opblock.opblock-get {
      border-color: #61affe !important;
      background: linear-gradient(135deg, rgba(97, 175, 254, 0.1) 0%, rgba(97, 175, 254, 0.05) 100%) !important;
      border-radius: 10px !important;
      margin: 10px 0 !important;
      box-shadow: 0 4px 15px rgba(97, 175, 254, 0.2) !important;
    }
    
    .swagger-ui .opblock.opblock-post {
      border-color: #49cc90 !important;
      background: linear-gradient(135deg, rgba(73, 204, 144, 0.1) 0%, rgba(73, 204, 144, 0.05) 100%) !important;
      border-radius: 10px !important;
      margin: 10px 0 !important;
      box-shadow: 0 4px 15px rgba(73, 204, 144, 0.2) !important;
    }
    
    .swagger-ui .opblock.opblock-put {
      border-color: #fca130 !important;
      background: linear-gradient(135deg, rgba(252, 161, 48, 0.1) 0%, rgba(252, 161, 48, 0.05) 100%) !important;
      border-radius: 10px !important;
      margin: 10px 0 !important;
      box-shadow: 0 4px 15px rgba(252, 161, 48, 0.2) !important;
    }
    
    .swagger-ui .opblock.opblock-delete {
      border-color: #f93e3e !important;
      background: linear-gradient(135deg, rgba(249, 62, 62, 0.1) 0%, rgba(249, 62, 62, 0.05) 100%) !important;
      border-radius: 10px !important;
      margin: 10px 0 !important;
      box-shadow: 0 4px 15px rgba(249, 62, 62, 0.2) !important;
    }
    
    .swagger-ui .opblock.opblock-patch {
      border-color: #50e3c2 !important;
      background: linear-gradient(135deg, rgba(80, 227, 194, 0.1) 0%, rgba(80, 227, 194, 0.05) 100%) !important;
      border-radius: 10px !important;
      margin: 10px 0 !important;
      box-shadow: 0 4px 15px rgba(80, 227, 194, 0.2) !important;
    }
    
    /* Enhanced operation headers */
    .swagger-ui .opblock .opblock-summary-method {
      border-radius: 6px !important;
      font-weight: 600 !important;
      min-width: 80px !important;
      text-align: center !important;
    }
    
    .swagger-ui .opblock .opblock-summary-description {
      font-weight: 500 !important;
      color: #2c3e50 !important;
    }
    
    /* Enhanced response sections */
    .swagger-ui .responses-wrapper .response-col_status {
      background: #f8f9fa !important;
      border-radius: 8px !important;
      padding: 10px !important;
    }
    
    .swagger-ui .responses-wrapper .response-col_description {
      background: #ffffff !important;
      border-radius: 8px !important;
      padding: 15px !important;
      border: 1px solid #e9ecef !important;
    }
    
    /* Enhanced parameters section */
    .swagger-ui .parameters-container {
      background: #f8f9fa !important;
      border-radius: 10px !important;
      padding: 15px !important;
      margin: 15px 0 !important;
    }
    
    .swagger-ui .parameters-container .parameter__name {
      font-weight: 600 !important;
      color: #2c3e50 !important;
    }
    
    /* Enhanced models section */
    .swagger-ui .models {
      background: #ffffff !important;
      border-radius: 10px !important;
      padding: 20px !important;
      border: 1px solid #e9ecef !important;
      box-shadow: 0 4px 15px rgba(0,0,0,0.05) !important;
    }
    
    .swagger-ui .models .model {
      background: #f8f9fa !important;
      border-radius: 8px !important;
      padding: 15px !important;
      margin: 10px 0 !important;
    }
    
    /* Enhanced tags */
    .swagger-ui .opblock-tag {
      background: #ffffff !important;
      border-radius: 10px !important;
      padding: 15px !important;
      margin: 15px 0 !important;
      border: 1px solid #e9ecef !important;
      box-shadow: 0 4px 15px rgba(0,0,0,0.05) !important;
    }
    
    .swagger-ui .opblock-tag .opblock-tag-section {
      border-bottom: 2px solid #3498db !important;
      padding-bottom: 10px !important;
    }
    
    /* Enhanced buttons */
    .swagger-ui .btn.execute {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
      border: none !important;
      border-radius: 8px !important;
      font-weight: 600 !important;
      padding: 10px 20px !important;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3) !important;
      transition: all 0.3s ease !important;
    }
    
    .swagger-ui .btn.execute:hover {
      transform: translateY(-2px) !important;
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4) !important;
    }
    
    /* Enhanced try it out section */
    .swagger-ui .try-out__btn {
      background: linear-gradient(135deg, #49cc90 0%, #28a745 100%) !important;
      border: none !important;
      border-radius: 6px !important;
      font-weight: 600 !important;
      padding: 8px 16px !important;
    }
    
    /* Enhanced input fields */
    .swagger-ui input[type="text"], .swagger-ui textarea {
      border: 2px solid #e9ecef !important;
      border-radius: 6px !important;
      padding: 8px 12px !important;
      transition: border-color 0.3s ease !important;
    }
    
    .swagger-ui input[type="text"]:focus, .swagger-ui textarea:focus {
      border-color: #3498db !important;
      outline: none !important;
      box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1) !important;
    }
    
    /* Enhanced scrollbars */
    .swagger-ui ::-webkit-scrollbar {
      width: 8px !important;
    }
    
    .swagger-ui ::-webkit-scrollbar-track {
      background: #f1f1f1 !important;
      border-radius: 4px !important;
    }
    
    .swagger-ui ::-webkit-scrollbar-thumb {
      background: #c1c1c1 !important;
      border-radius: 4px !important;
    }
    
    .swagger-ui ::-webkit-scrollbar-thumb:hover {
      background: #a8a8a8 !important;
    }
    
    /* Enhanced loading states */
    .swagger-ui .loading-container {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
      border-radius: 10px !important;
      padding: 20px !important;
      text-align: center !important;
      color: white !important;
    }
    
    /* Enhanced error states */
    .swagger-ui .error-wrapper {
      background: #fff5f5 !important;
      border: 1px solid #fed7d7 !important;
      border-radius: 8px !important;
      padding: 15px !important;
      color: #c53030 !important;
    }
    
    /* Enhanced success states */
    .swagger-ui .success-wrapper {
      background: #f0fff4 !important;
      border: 1px solid #c6f6d5 !important;
      border-radius: 8px !important;
      padding: 15px !important;
      color: #38a169 !important;
    }
  `
}));

// API routes
// API Versioning Routes
app.get('/api/version-info', versionInfoEndpoint);
app.get('/api/version-stats', versionStatsEndpoint);
app.get('/api/version-compatibility', versionCompatibilityEndpoint);
app.get('/api/version-migration-guide/:version', versionMigrationGuideEndpoint);

// API Versioning Middleware
app.use('/api/v*', apiVersioningMiddleware);
app.use('/api/v*', backwardCompatibilityMiddleware);

// API Routes with versioning
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/firebase-auth', firebaseAuthRoutes);
app.use('/api/v1/users', authenticateToken, userRoutes);
app.use('/api/v1/inventory', authenticateToken, inventoryRoutes);
app.use('/api/v1/spending', authenticateToken, spendingRoutes);
app.use('/api/v1/analytics', authenticateToken, analyticsRoutes);
app.use('/api/v1/budget', authenticateToken, budgetRoutes);
app.use('/api/v1/notifications', authenticateToken, notificationRoutes);
app.use('/api/v1/collaboration', authenticateToken, collaborationRoutes);

// Legacy API Routes (for backward compatibility)
app.use('/api/auth', authRoutes);
app.use('/api/firebase-auth', firebaseAuthRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/inventory', authenticateToken, inventoryRoutes);
app.use('/api/spending', authenticateToken, spendingRoutes);
app.use('/api/analytics', authenticateToken, analyticsRoutes);
app.use('/api/budget', authenticateToken, budgetRoutes);
app.use('/api/notifications', authenticateToken, notificationRoutes);
app.use('/api/collaboration', authenticateToken, collaborationRoutes);

// API status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'operational',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      total: 8,
      categories: [
        { name: 'Authentication', path: '/api/auth', status: 'active' },
        { name: 'Users', path: '/api/users', status: 'active' },
        { name: 'Inventory', path: '/api/inventory', status: 'active' },
        { name: 'Spending', path: '/api/spending', status: 'active' },
        { name: 'Analytics', path: '/api/analytics', status: 'active' },
        { name: 'Budget', path: '/api/budget', status: 'active' },
        { name: 'Notifications', path: '/api/notifications', status: 'active' },
        { name: 'Collaboration', path: '/api/collaboration', status: 'active' }
      ]
    },
    documentation: `${req.protocol}://${req.get('host')}/api-docs`,
    health: `${req.protocol}://${req.get('host')}/health`
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The requested route ${req.originalUrl} does not exist`,
    availableRoutes: [
      '/',
      '/health',
      '/api/status',
      '/api/auth',
      '/api/users',
      '/api/inventory',
      '/api/spending',
      '/api/analytics',
      '/api/budget',
      '/api/notifications',
      '/api/collaboration',
      '/api-docs'
    ],
    documentation: `${req.protocol}://${req.get('host')}/api-docs`,
    quickStart: {
      landing: 'GET /',
      status: 'GET /api/status',
      health: 'GET /health',
      docs: 'GET /api-docs'
    }
  });
});

// Error handling middleware
app.use(errorHandler);

// Initialize Socket.IO handlers
initializeSocketHandlers(io);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);
  
  // Join user to their personal room
  socket.on('join-user-room', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`👤 User ${userId} joined their room`);
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`🔌 User disconnected: ${socket.id}`);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Home Hub API Server running on port ${PORT}`);
  console.log(`📚 API Documentation available at http://localhost:${PORT}/api-docs`);
  console.log(`🔌 Socket.IO server initialized`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = { app, server, io };
