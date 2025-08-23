# 📡 Home Hub - API Reference

This comprehensive guide covers all API endpoints, integration examples, and external service integrations for the Home Hub project.

---

## 🎯 **API OVERVIEW**

### **Available APIs**
The Home Hub platform integrates with multiple external services and provides internal APIs:

1. **🤖 AI Services API** - HuggingFace, Google Gemini integration
2. **🔥 Firebase API** - Authentication, database, and storage
3. **🌐 External Services** - Third-party integrations
4. **📱 Internal APIs** - Component and service interfaces

### **API Architecture**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Layer     │    │   External      │
│   Components    │◄──►│   Services      │◄──►│   Services      │
│                 │    │                 │    │                 │
│ • React Apps    │    │ • AI Services   │    │ • HuggingFace   │
│ • User Interface│    │ • Firebase      │    │ • Google Gemini │
│ • State Mgmt    │    │ • Data Layer    │    │ • Other APIs    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 🤖 **AI SERVICES API**

### **HuggingFace API Integration**

#### **Text Classification Endpoint**
```javascript
// POST /api/huggingface/classify
const classifyText = async (text, model = 'default') => {
  const response = await fetch('/api/huggingface/classify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      text,
      model,
      options: {
        return_all_scores: false,
        max_length: 512
      }
    })
  });
  
  return response.json();
};

// Usage Example
const category = await classifyText(
  'Grocery shopping at Walmart',
  'expense-classification'
);
```

#### **Text Generation Endpoint**
```javascript
// POST /api/huggingface/generate
const generateText = async (prompt, options = {}) => {
  const response = await fetch('/api/huggingface/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      prompt,
      max_length: options.maxLength || 100,
      temperature: options.temperature || 0.7,
      do_sample: options.doSample || true
    })
  });
  
  return response.json();
};

// Usage Example
const response = await generateText(
  'How can I save money on groceries?',
  { maxLength: 200, temperature: 0.8 }
);
```

### **Google Gemini API Integration**

#### **Content Generation Endpoint**
```javascript
// POST /api/gemini/generate
const generateContent = async (prompt, options = {}) => {
  const response = await fetch('/api/gemini/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GEMINI_API_KEY}`
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: options.temperature || 0.7,
        maxOutputTokens: options.maxTokens || 1024,
        topP: options.topP || 0.8,
        topK: options.topK || 40
      }
    })
  });
  
  return response.json();
};

// Usage Example
const advice = await generateContent(`
  I spend $800/month on groceries. How can I reduce this to $600/month?
  Provide 5 specific, actionable tips.
`, {
  temperature: 0.5,
  maxTokens: 500
});
```

#### **Multi-modal Content Generation**
```javascript
// POST /api/gemini/generate-multimodal
const generateMultimodalContent = async (text, image, options = {}) => {
  const response = await fetch('/api/gemini/generate-multimodal', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GEMINI_API_KEY}`
    },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: image // Base64 encoded image
            }
          }
        ]
      }],
      generationConfig: options
    })
  });
  
  return response.json();
};
```

---

## 🔥 **FIREBASE API INTEGRATION**

### **Authentication API**

#### **User Sign Up**
```javascript
// POST /api/auth/signup
const signUp = async (email, password, userData = {}) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      email, 
      password
    );
    
    // Create user profile in Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email,
      createdAt: serverTimestamp(),
      ...userData
    });
    
    return userCredential.user;
  } catch (error) {
    throw new Error(`Sign up failed: ${error.message}`);
  }
};
```

#### **User Sign In**
```javascript
// POST /api/auth/signin
const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth, 
      email, 
      password
    );
    
    return userCredential.user;
  } catch (error) {
    throw new Error(`Sign in failed: ${error.message}`);
  }
};
```

#### **User Sign Out**
```javascript
// POST /api/auth/signout
const signOut = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    throw new Error(`Sign out failed: ${error.message}`);
  }
};
```

### **Firestore Database API**

#### **Create Document**
```javascript
// POST /api/firestore/create
const createDocument = async (collection, data, documentId = null) => {
  try {
    const docRef = documentId 
      ? doc(db, collection, documentId)
      : doc(collection(db, collection));
    
    await setDoc(docRef, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return { id: docRef.id, success: true };
  } catch (error) {
    throw new Error(`Document creation failed: ${error.message}`);
  }
};

// Usage Example
const newItem = await createDocument('inventory', {
  name: 'Laptop',
  category: 'Electronics',
  quantity: 5,
  price: 999.99
});
```

#### **Read Document**
```javascript
// GET /api/firestore/read/:collection/:id
const readDocument = async (collection, documentId) => {
  try {
    const docRef = doc(db, collection, documentId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      throw new Error('Document not found');
    }
  } catch (error) {
    throw new Error(`Document read failed: ${error.message}`);
  }
};
```

#### **Update Document**
```javascript
// PUT /api/firestore/update/:collection/:id
const updateDocument = async (collection, documentId, updates) => {
  try {
    const docRef = doc(db, collection, documentId);
    
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    throw new Error(`Document update failed: ${error.message}`);
  }
};
```

#### **Delete Document**
```javascript
// DELETE /api/firestore/delete/:collection/:id
const deleteDocument = async (collection, documentId) => {
  try {
    const docRef = doc(db, collection, documentId);
    await deleteDoc(docRef);
    
    return { success: true };
  } catch (error) {
    throw new Error(`Document deletion failed: ${error.message}`);
  }
};
```

#### **Query Documents**
```javascript
// GET /api/firestore/query/:collection
const queryDocuments = async (collection, constraints = []) => {
  try {
    let q = collection(db, collection);
    
    // Apply query constraints
    constraints.forEach(constraint => {
      q = query(q, ...constraint);
    });
    
    const querySnapshot = await getDocs(q);
    const documents = [];
    
    querySnapshot.forEach(doc => {
      documents.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return documents;
  } catch (error) {
    throw new Error(`Query failed: ${error.message}`);
  }
};

// Usage Examples
// Get all inventory items
const allItems = await queryDocuments('inventory');

// Get items by category
const electronicsItems = await queryDocuments('inventory', [
  [where('category', '==', 'Electronics')]
]);

// Get items with price range
const expensiveItems = await queryDocuments('inventory', [
  [where('price', '>', 500)],
  [orderBy('price', 'desc')],
  [limit(10)]
]);
```

### **Firebase Storage API**

#### **Upload File**
```javascript
// POST /api/storage/upload
const uploadFile = async (file, path, metadata = {}) => {
  try {
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file, metadata);
    
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload progress: ' + progress + '%');
        },
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve({
              downloadURL,
              path,
              success: true
            });
          });
        }
      );
    });
  } catch (error) {
    throw new Error(`File upload failed: ${error.message}`);
  }
};

// Usage Example
const fileUpload = await uploadFile(
  imageFile,
  'inventory/images/laptop.jpg',
  {
    contentType: 'image/jpeg',
    customMetadata: {
      category: 'Electronics',
      uploadedBy: userId
    }
  }
);
```

#### **Download File**
```javascript
// GET /api/storage/download/:path
const downloadFile = async (path) => {
  try {
    const storageRef = ref(storage, path);
    const downloadURL = await getDownloadURL(storageRef);
    
    return downloadURL;
  } catch (error) {
    throw new Error(`File download failed: ${error.message}`);
  }
};
```

#### **Delete File**
```javascript
// DELETE /api/storage/delete/:path
const deleteFile = async (path) => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
    
    return { success: true };
  } catch (error) {
    throw new Error(`File deletion failed: ${error.message}`);
  }
};
```

---

## 🌐 **EXTERNAL SERVICES API**

### **Postman Collection Integration**

#### **API Testing Setup**
```javascript
// src/services/PostmanService.js
class PostmanService {
  constructor() {
    this.baseUrl = process.env.REACT_APP_POSTMAN_API_URL;
    this.apiKey = process.env.REACT_APP_POSTMAN_API_KEY;
  }

  async runCollection(collectionId, environmentId = null) {
    const response = await fetch(`${this.baseUrl}/collections/${collectionId}/runs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey
      },
      body: JSON.stringify({
        environment: environmentId,
        variables: {
          baseUrl: process.env.REACT_APP_API_BASE_URL,
          apiKey: process.env.REACT_APP_API_KEY
        }
      })
    });
    
    return response.json();
  }

  async getCollectionResults(runId) {
    const response = await fetch(`${this.baseUrl}/runs/${runId}`, {
      headers: {
        'X-API-Key': this.apiKey
      }
    });
    
    return response.json();
  }
}
```

### **Webhook Integration**

#### **Webhook Handler**
```javascript
// POST /api/webhooks/:service
const handleWebhook = async (req, res) => {
  const { service } = req.params;
  const payload = req.body;
  
  try {
    switch (service) {
      case 'inventory-update':
        await handleInventoryWebhook(payload);
        break;
      case 'expense-alert':
        await handleExpenseWebhook(payload);
        break;
      case 'ai-insight':
        await handleAIWebhook(payload);
        break;
      default:
        throw new Error(`Unknown webhook service: ${service}`);
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error(`Webhook handling failed: ${error.message}`);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};
```

---

## 📱 **INTERNAL API INTERFACES**

### **Component API Interface**

#### **Inventory Management API**
```javascript
// src/components/inventory/InventoryManagement.js
const InventoryManagement = () => {
  const {
    items,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
    searchItems,
    filterByCategory
  } = useInventory();

  // Component implementation
  return (
    <div>
      <InventoryForm onSubmit={addItem} />
      <InventoryList 
        items={items}
        onEdit={updateItem}
        onDelete={deleteItem}
        onSearch={searchItems}
        onFilter={filterByCategory}
      />
    </div>
  );
};
```

#### **Spending Tracker API**
```javascript
// src/components/spending/SpendingTracker.js
const SpendingTracker = () => {
  const {
    expenses,
    budgets,
    loading,
    error,
    addExpense,
    updateExpense,
    deleteExpense,
    addBudget,
    updateBudget,
    deleteBudget,
    getSpendingAnalytics
  } = useSpending();

  // Component implementation
  return (
    <div>
      <BudgetOverview 
        budgets={budgets}
        onAdd={addBudget}
        onEdit={updateBudget}
        onDelete={deleteBudget}
      />
      <ExpenseList 
        expenses={expenses}
        onAdd={addExpense}
        onEdit={updateExpense}
        onDelete={deleteExpense}
      />
      <SpendingAnalytics 
        analytics={getSpendingAnalytics()}
      />
    </div>
  );
};
```

### **Hook API Interface**

#### **useInventory Hook**
```javascript
// src/hooks/useInventory.js
export const useInventory = (options = {}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addItem = async (itemData) => {
    setLoading(true);
    try {
      const newItem = await createDocument('inventory', itemData);
      setItems(prev => [...prev, newItem]);
      return newItem;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (id, updates) => {
    setLoading(true);
    try {
      await updateDocument('inventory', id, updates);
      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      ));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id) => {
    setLoading(true);
    try {
      await deleteDocument('inventory', id);
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const searchItems = (query) => {
    return items.filter(item => 
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
    );
  };

  const filterByCategory = (category) => {
    return items.filter(item => item.category === category);
  };

  return {
    items,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
    searchItems,
    filterByCategory
  };
};
```

---

## 🔒 **API SECURITY**

### **Authentication & Authorization**
```javascript
// API middleware for authentication
const authenticateRequest = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Authentication token required' 
      });
    }
    
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      error: 'Invalid authentication token' 
    });
  }
};

// Role-based authorization
const authorizeRole = (requiredRole) => {
  return (req, res, next) => {
    if (req.user.role !== requiredRole) {
      return res.status(403).json({ 
        error: 'Insufficient permissions' 
      });
    }
    next();
  };
};
```

### **Rate Limiting**
```javascript
// Rate limiting middleware
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply to specific routes
app.use('/api/ai/', rateLimiter);
app.use('/api/firebase/', rateLimiter);
```

### **Input Validation**
```javascript
// Input validation middleware
const validateInput = (schema) => {
  return (req, res, next) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      return res.status(400).json({ 
        error: 'Invalid input data', 
        details: error.errors 
      });
    }
  };
};

// Usage example
const inventorySchema = z.object({
  name: z.string().min(1).max(100),
  category: z.string().min(1),
  quantity: z.number().min(0),
  price: z.number().min(0)
});

app.post('/api/inventory', 
  validateInput(inventorySchema), 
  createInventoryItem
);
```

---

## 📊 **API MONITORING & ANALYTICS**

### **Performance Monitoring**
```javascript
// API performance tracking
const trackAPIPerformance = (req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const { method, url, statusCode } = req;
    
    // Log API performance metrics
    console.log(`API ${method} ${url} - ${statusCode} - ${duration}ms`);
    
    // Send to analytics service
    analytics.track('api_request', {
      method,
      url,
      statusCode,
      duration,
      timestamp: new Date().toISOString()
    });
  });
  
  next();
};
```

### **Error Tracking**
```javascript
// Global error handler
const errorHandler = (error, req, res, next) => {
  console.error('API Error:', error);
  
  // Send to error tracking service
  errorTracking.captureException(error, {
    extra: {
      url: req.url,
      method: req.method,
      user: req.user?.uid,
      body: req.body
    }
  });
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
};
```

---

## 🧪 **API TESTING**

### **Unit Testing**
```javascript
// src/services/__tests__/HuggingFaceService.test.js
import { HuggingFaceService } from '../HuggingFaceService';

describe('HuggingFaceService', () => {
  let service;
  
  beforeEach(() => {
    service = new HuggingFaceService();
  });

  test('classifies text correctly', async () => {
    const mockResponse = { label: 'FOOD', score: 0.95 };
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve(mockResponse)
    });

    const result = await service.classifyText('Grocery shopping');
    expect(result.label).toBe('FOOD');
    expect(result.score).toBeGreaterThan(0.9);
  });
});
```

### **Integration Testing**
```javascript
// src/services/__tests__/FirebaseService.integration.test.js
import { FirebaseService } from '../FirebaseService';

describe('FirebaseService Integration', () => {
  let service;
  
  beforeEach(() => {
    service = new FirebaseService();
  });

  test('creates and reads document', async () => {
    const testData = { name: 'Test Item', category: 'Test' };
    
    // Create document
    const created = await service.createDocument('test', testData);
    expect(created.success).toBe(true);
    
    // Read document
    const read = await service.readDocument('test', created.id);
    expect(read.name).toBe(testData.name);
    expect(read.category).toBe(testData.category);
  });
});
```

---

## 📚 **API DOCUMENTATION**

### **OpenAPI/Swagger Specification**
```yaml
# openapi.yaml
openapi: 3.0.0
info:
  title: Home Hub API
  version: 1.0.0
  description: Comprehensive home management platform API

paths:
  /api/inventory:
    get:
      summary: Get inventory items
      parameters:
        - name: category
          in: query
          schema:
            type: string
      responses:
        '200':
          description: List of inventory items
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/InventoryItem'
    
    post:
      summary: Create inventory item
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/InventoryItemInput'
      responses:
        '201':
          description: Item created successfully

components:
  schemas:
    InventoryItem:
      type: object
      properties:
        id:
          type: string
        name:
          type: string
        category:
          type: string
        quantity:
          type: number
        price:
          type: number
```

---

## 🚀 **API ROADMAP**

### **Phase 1: Core APIs ✅ COMPLETED**
- [x] Firebase integration
- [x] Basic AI services
- [x] Component interfaces
- [x] Authentication system

### **Phase 2: Advanced APIs 🟡 IN PROGRESS**
- [ ] GraphQL API
- [ ] Real-time subscriptions
- [ ] Advanced AI models
- [ ] Performance optimization

### **Phase 3: Enterprise APIs 🟢 PLANNED**
- [ ] Multi-tenant support
- [ ] Advanced analytics
- [ ] Third-party integrations
- [ ] API versioning

---

**Last Updated**: December 2024  
**Status**: 🚀 **COMPREHENSIVE API REFERENCE READY!** 📡

---

> 💡 **Pro Tip**: Always test your API integrations thoroughly and implement proper error handling. Good API design makes your application more reliable and maintainable!
