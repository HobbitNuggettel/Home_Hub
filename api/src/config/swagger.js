const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '🏠 Home Hub API',
      version: '2.0.0',
      description: `
## 🚀 Smart Home Management Platform API

**Home Hub API** provides comprehensive backend services for managing your smart home ecosystem:

### ✨ **Core Features**
- **🔐 Authentication & Authorization** - Secure user management with JWT
- **⚡ Real-time Collaboration** - Live collaboration rooms and chat
- **📦 Inventory Management** - Track household items and supplies
- **💰 Spending Tracking** - Monitor expenses and financial health
- **📊 Budget Management** - Multi-period budget planning and tracking
- **📈 Advanced Analytics** - Data insights, trends, and forecasting
- **🔔 Smart Notifications** - Intelligent alerts and reminders
- **🌐 WebSocket Support** - Real-time updates and live data

### 🛠️ **Technical Features**
- **RESTful Design** - Clean, intuitive API endpoints
- **Real-time Communication** - Socket.IO integration
- **Comprehensive Security** - Rate limiting, CORS, authentication
- **Interactive Documentation** - Swagger/OpenAPI 3.0
- **Error Handling** - Detailed error responses and validation
- **Performance Optimized** - Efficient data processing and caching

### 🚀 **Quick Start**
1. **Get API Key**: Register at \`/api/auth/register\`
2. **Authenticate**: Login at \`/api/auth/login\`
3. **Explore**: Use the interactive documentation below
4. **Integrate**: Connect your apps with the provided endpoints

### 📚 **Documentation**
- **Interactive Docs**: Explore endpoints below
- **Code Examples**: Available in each endpoint
- **Response Schemas**: Detailed data structures
- **Error Codes**: Comprehensive error handling
      `,
      contact: {
        name: '🏠 Home Hub Development Team',
        email: 'dev@homehub.com',
        url: 'https://homehub.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5001',
        description: 'Development server (Local) - HTTP'
      },
      {
        url: 'https://api.homehub.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token for authentication'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Unique user identifier' },
            email: { type: 'string', format: 'email', description: 'User email address' },
            displayName: { type: 'string', description: 'User display name' },
            role: { type: 'string', enum: ['user', 'admin'], description: 'User role' },
            isActive: { type: 'boolean', description: 'Whether user account is active' },
            createdAt: { type: 'string', format: 'date-time', description: 'Account creation timestamp' },
            updatedAt: { type: 'string', format: 'date-time', description: 'Last update timestamp' }
          },
          required: ['id', 'email', 'displayName', 'role']
        },
        InventoryItem: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Unique item identifier' },
            name: { type: 'string', description: 'Item name' },
            description: { type: 'string', description: 'Item description' },
            category: { type: 'string', description: 'Item category' },
            quantity: { type: 'integer', minimum: 0, description: 'Current quantity in stock' },
            minQuantity: { type: 'integer', minimum: 0, description: 'Minimum quantity threshold' },
            location: { type: 'string', description: 'Storage location' },
            value: { type: 'number', minimum: 0, description: 'Item value' },
            userId: { type: 'string', description: 'Owner user ID' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          },
          required: ['id', 'name', 'category', 'quantity', 'userId']
        },
        SpendingTransaction: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Unique transaction identifier' },
            amount: { type: 'number', minimum: 0, description: 'Transaction amount' },
            category: { type: 'string', description: 'Spending category' },
            description: { type: 'string', description: 'Transaction description' },
            date: { type: 'string', format: 'date', description: 'Transaction date' },
            userId: { type: 'string', description: 'Owner user ID' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          },
          required: ['id', 'amount', 'category', 'date', 'userId']
        },
        Budget: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Unique budget identifier' },
            name: { type: 'string', description: 'Budget name' },
            amount: { type: 'number', minimum: 0, description: 'Total budget amount' },
            period: { type: 'string', enum: ['weekly', 'monthly', 'quarterly', 'yearly'], description: 'Budget period' },
            startDate: { type: 'string', format: 'date', description: 'Budget start date' },
            endDate: { type: 'string', format: 'date', description: 'Budget end date' },
            categories: { type: 'array', items: { type: 'object' }, description: 'Budget category allocations' },
            status: { type: 'string', enum: ['active', 'inactive', 'completed'], description: 'Budget status' },
            userId: { type: 'string', description: 'Owner user ID' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          },
          required: ['id', 'name', 'amount', 'period', 'startDate', 'userId']
        },
        Notification: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Unique notification identifier' },
            type: { type: 'string', enum: ['info', 'warning', 'error', 'success', 'alert'], description: 'Notification type' },
            title: { type: 'string', description: 'Notification title' },
            message: { type: 'string', description: 'Notification message' },
            category: { type: 'string', enum: ['system', 'budget', 'inventory', 'spending', 'reminder', 'alert'], description: 'Notification category' },
            priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'], description: 'Notification priority' },
            status: { type: 'string', enum: ['unread', 'read', 'archived'], description: 'Notification status' },
            actionUrl: { type: 'string', description: 'URL for action when notification is clicked' },
            metadata: { type: 'object', description: 'Additional notification data' },
            userId: { type: 'string', description: 'Recipient user ID' },
            createdAt: { type: 'string', format: 'date-time' },
            readAt: { type: 'string', format: 'date-time' },
            expiresAt: { type: 'string', format: 'date-time' }
          },
          required: ['id', 'type', 'title', 'message', 'category', 'userId']
        },
        CollaborationRoom: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Unique room identifier' },
            name: { type: 'string', description: 'Room name' },
            description: { type: 'string', description: 'Room description' },
            type: { type: 'string', enum: ['document', 'inventory', 'budget', 'general'], description: 'Room type' },
            ownerId: { type: 'string', description: 'Room owner user ID' },
            participants: { type: 'array', items: { type: 'object' }, description: 'Room participants' },
            status: { type: 'string', enum: ['active', 'inactive', 'archived'], description: 'Room status' },
            lastActivity: { type: 'string', format: 'date-time', description: 'Last activity timestamp' },
            participantCount: { type: 'integer', minimum: 1, description: 'Number of participants' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          },
          required: ['id', 'name', 'type', 'ownerId']
        },
        AnalyticsData: {
          type: 'object',
          properties: {
            period: { type: 'string', description: 'Analytics time period' },
            metrics: { type: 'object', description: 'Key performance metrics' },
            trends: { type: 'object', description: 'Trend analysis data' },
            insights: { type: 'array', items: { type: 'object' }, description: 'Data insights and recommendations' },
            charts: { type: 'object', description: 'Chart data for visualization' },
            timestamp: { type: 'string', format: 'date-time', description: 'Data generation timestamp' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', description: 'Request success status' },
            message: { type: 'string', description: 'Error message' },
            error: { type: 'string', description: 'Error type' },
            details: { type: 'object', description: 'Additional error details' },
            timestamp: { type: 'string', format: 'date-time', description: 'Error timestamp' }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', description: 'Request success status' },
            message: { type: 'string', description: 'Success message' },
            data: { type: 'object', description: 'Response data' },
            timestamp: { type: 'string', format: 'date-time', description: 'Response timestamp' }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Access token is missing or invalid',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        ForbiddenError: {
          description: 'User does not have permission to access this resource',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        NotFoundError: {
          description: 'The requested resource was not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        ValidationError: {
          description: 'Request validation failed',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        ServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'JWT-based authentication endpoints'
      },
      {
        name: 'Firebase Authentication',
        description: 'Firebase-based authentication and user management'
      },
      {
        name: 'Users',
        description: 'User management and profile operations'
      },
      {
        name: 'Inventory',
        description: 'Inventory item management and tracking'
      },
      {
        name: 'Spending',
        description: 'Spending transaction management and tracking'
      },
      {
        name: 'Budget',
        description: 'Budget planning and management'
      },
      {
        name: 'Analytics',
        description: 'Data analytics and insights'
      },
      {
        name: 'Notifications',
        description: 'User notification management'
      },
      {
        name: 'Collaboration',
        description: 'Real-time collaboration features'
      },
      {
        name: 'Weather',
        description: 'Weather data and analytics endpoints'
      },
      {
        name: 'Recipes',
        description: 'Recipe management and meal planning'
      },
      {
        name: 'Shopping',
        description: 'Shopping list management and AI suggestions'
      },
      {
        name: 'Maintenance',
        description: 'Home maintenance tracking and scheduling'
      },
      {
        name: 'AI Services',
        description: 'AI-powered features and intelligent assistance'
      },
      {
        name: 'Smart Home',
        description: 'Smart home device management and automation'
      },
      {
        name: 'Settings',
        description: 'User preferences and system configuration'
      }
    ],
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/middleware/*.js',
    './server.js'
  ]
};

const specs = swaggerJsdoc(options);

module.exports = specs;
