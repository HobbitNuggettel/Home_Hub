# 📊 Data Storage Guide - Where Your Data Lives

**Last Updated:** September 29, 2025  
**Status:** Complete Storage Documentation

---

## 🗄️ **Primary Data Storage: Firebase**

All your application data is stored in **Google Firebase Cloud Services**. Firebase is a secure, scalable cloud platform owned by Google.

---

## 🔐 **Storage Locations**

### **1. Firebase Firestore (Main Database)**

**Location:** Cloud-based NoSQL database  
**Region:** Set in your Firebase project settings  
**Structure:** Document-based (JSON-like)

#### **Database Structure:**
```
Firebase Firestore
└── users/ (collection)
    └── {userId}/ (document)
        ├── profile/          # User profile information
        ├── inventory/        # All inventory items
        ├── recipes/          # Saved recipes
        ├── expenses/         # Spending records
        ├── shoppingLists/    # Shopping lists
        ├── households/       # Household/collaboration data
        ├── settings/         # User preferences
        └── usage/            # Usage statistics
```

---

## 📦 **What Data is Stored Where**

### **1. User Profile Data**
**Location:** `Firestore: /users/{userId}/profile`

**Stored Information:**
```json
{
  "displayName": "Your Name",
  "email": "your@email.com",
  "phoneNumber": "+1234567890",
  "photoData": "base64_image_data",
  "dateOfBirth": "1990-01-01",
  "preferences": {
    "theme": "dark",
    "language": "en",
    "timezone": "UTC",
    "currency": "USD",
    "notifications": { ... }
  },
  "privacy": {
    "profileVisibility": "private",
    "dataSharing": false,
    "analytics": true
  },
  "createdAt": "timestamp",
  "updatedAt": "timestamp",
  "lastLoginAt": "timestamp"
}
```

---

### **2. Inventory Items**
**Location:** `Firestore: /users/{userId}/inventory`

**Each Item Stores:**
```json
{
  "id": "item_unique_id",
  "name": "Product Name",
  "description": "Product description",
  "category": "Electronics",
  "subcategory": "Laptops",
  "brand": "Apple",
  "model": "MacBook Pro",
  "quantity": 1,
  "unit": "pieces",
  "price": 1299.99,
  "currency": "USD",
  "purchaseDate": "2024-01-15",
  "expiryDate": null,
  "location": "Home Office",
  "room": "Office",
  "shelf": "Desk",
  "barcode": "123456789",
  "sku": "SKU123",
  "image": "image_url_or_base64",
  "thumbnail": "compressed_thumbnail",
  "tags": ["electronics", "computer"],
  "notes": "Additional notes",
  "status": "active",
  "warranty": {
    "duration": 12,
    "unit": "months",
    "expiryDate": "2025-01-15",
    "provider": "Apple"
  },
  "maintenance": {
    "lastService": "2024-06-01",
    "nextService": "2024-12-01",
    "interval": 6,
    "notes": "Check battery health"
  },
  "createdAt": "timestamp",
  "updatedAt": "timestamp",
  "createdBy": "userId",
  "updatedBy": "userId"
}
```

**Data Per Item:** ~1-5 KB  
**Typical Storage:** 100 items = 100-500 KB

---

### **3. Recipes**
**Location:** `Firestore: /users/{userId}/recipes`

**Each Recipe Stores:**
```json
{
  "id": "recipe_unique_id",
  "name": "Chocolate Chip Cookies",
  "description": "Classic recipe",
  "cuisine": "American",
  "category": "dessert",
  "difficulty": "easy",
  "prepTime": 15,
  "cookTime": 12,
  "totalTime": 27,
  "servings": 24,
  "calories": 150,
  "image": "recipe_image",
  "thumbnail": "recipe_thumbnail",
  "ingredients": [
    {
      "name": "Flour",
      "amount": 2,
      "unit": "cups",
      "notes": "All-purpose"
    }
  ],
  "instructions": [
    {
      "step": 1,
      "instruction": "Preheat oven to 350°F",
      "duration": 0,
      "temperature": 350
    }
  ],
  "nutrition": {
    "calories": 150,
    "protein": 2,
    "carbs": 20,
    "fat": 7,
    "fiber": 1,
    "sugar": 12,
    "sodium": 100
  },
  "tags": ["dessert", "baking"],
  "dietary": ["vegetarian"],
  "source": "Family Recipe",
  "sourceUrl": "",
  "notes": "Mom's favorite",
  "rating": 5,
  "reviews": [],
  "favorites": 10,
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

**Data Per Recipe:** ~2-10 KB  
**Typical Storage:** 50 recipes = 100-500 KB

---

### **4. Expenses/Spending**
**Location:** `Firestore: /users/{userId}/expenses`

**Each Expense Stores:**
```json
{
  "id": "expense_unique_id",
  "description": "Grocery shopping",
  "amount": 127.50,
  "currency": "USD",
  "category": "Food & Dining",
  "subcategory": "Groceries",
  "date": "2024-09-29",
  "merchant": "Whole Foods",
  "location": "123 Main St",
  "paymentMethod": "Credit Card",
  "account": "Chase Sapphire",
  "receipt": "receipt_image",
  "thumbnail": "receipt_thumbnail",
  "tags": ["groceries", "weekly"],
  "notes": "Weekly shopping",
  "recurring": {
    "isRecurring": false,
    "frequency": "weekly",
    "interval": 1,
    "endDate": null
  },
  "budget": {
    "budgetId": "monthly_food_budget",
    "budgetCategory": "Food"
  },
  "tax": {
    "taxable": true,
    "taxAmount": 7.50,
    "taxRate": 0.0625
  },
  "status": "completed",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

**Data Per Expense:** ~1-3 KB  
**Typical Storage:** 200 expenses = 200-600 KB

---

### **5. Shopping Lists**
**Location:** `Firestore: /users/{userId}/shoppingLists`

**Each List Stores:**
```json
{
  "id": "list_unique_id",
  "name": "Weekly Groceries",
  "description": "Weekly shopping list",
  "items": [
    {
      "id": "item_id",
      "name": "Milk",
      "quantity": 2,
      "unit": "gallons",
      "category": "Dairy",
      "priority": "high",
      "price": 3.99,
      "store": "Whole Foods",
      "notes": "Organic",
      "completed": false
    }
  ],
  "budget": 150.00,
  "totalEstimated": 127.50,
  "totalSpent": 0,
  "store": "Whole Foods",
  "status": "active",
  "sharedWith": ["userId2", "userId3"],
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

**Data Per List:** ~2-5 KB  
**Typical Storage:** 10 lists = 20-50 KB

---

### **6. Household/Collaboration**
**Location:** `Firestore: /users/{userId}/households`

**Each Household Stores:**
```json
{
  "id": "household_unique_id",
  "name": "Smith Family",
  "description": "Our home",
  "members": [
    {
      "userId": "user123",
      "name": "John Smith",
      "email": "john@email.com",
      "role": "owner",
      "permissions": ["all"],
      "joinedAt": "timestamp"
    }
  ],
  "owner": "userId",
  "invitations": [],
  "settings": {
    "visibility": "private",
    "allowInvitations": true
  },
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

---

### **7. User Settings**
**Location:** `Firestore: /users/{userId}/settings`

**Stores:**
```json
{
  "theme": "dark",
  "language": "en",
  "timezone": "America/New_York",
  "currency": "USD",
  "dateFormat": "MM/DD/YYYY",
  "timeFormat": "12h",
  "notifications": {
    "email": {
      "enabled": true,
      "frequency": "immediate",
      "types": {
        "reminders": true,
        "updates": true,
        "marketing": false
      }
    },
    "push": {
      "enabled": true,
      "types": {
        "reminders": true,
        "updates": true,
        "social": true
      }
    }
  },
  "privacy": {
    "profileVisibility": "private",
    "dataSharing": false,
    "analytics": true
  },
  "backup": {
    "enabled": true,
    "frequency": "weekly",
    "lastBackup": "timestamp"
  }
}
```

---

### **8. Usage Statistics**
**Location:** `Firestore: /users/{userId}/usage`

**Tracks:**
```json
{
  "totalItems": 156,
  "totalRecipes": 28,
  "totalExpenses": 245,
  "totalShoppingLists": 12,
  "totalHouseholds": 1,
  "storageUsed": 52428800,
  "storageLimit": 1073741824,
  "apiCalls": {
    "daily": 150,
    "monthly": 3500,
    "lastReset": "timestamp"
  },
  "features": {
    "aiAssistant": 45,
    "imageUploads": 12,
    "dataExports": 3
  },
  "lastActivity": "timestamp"
}
```

---

## 🖼️ **Image Storage**

### **Firebase Storage (Images & Files)**

**Location:** `Firebase Storage: /users/{userId}/images/`

**What's Stored:**
- Product photos (inventory items)
- Recipe images
- Receipt images
- Profile photos
- Document attachments

**Storage Structure:**
```
Firebase Storage
└── users/
    └── {userId}/
        ├── inventory/
        │   ├── item_123_image.jpg
        │   └── item_123_thumbnail.jpg
        ├── recipes/
        │   ├── recipe_456_image.jpg
        │   └── recipe_456_thumbnail.jpg
        ├── receipts/
        │   └── expense_789_receipt.jpg
        └── profile/
            └── avatar.jpg
```

**Image Optimization:**
- Original images compressed
- Thumbnails generated (max 200x200)
- Images optimized for web (<500KB)
- Optional cloud storage (Cloudinary/Imgur)

---

## 🔄 **Real-time Database (Optional)**

**Location:** `Firebase Realtime Database`

**Used For:**
- Real-time collaboration updates
- Live activity tracking
- Chat messages (AI Assistant)
- Presence detection
- Real-time notifications

**Structure:**
```
Firebase Realtime Database
└── realtime/
    └── {userId}/
        ├── presence/
        ├── activity/
        └── chat/
```

---

## 🌐 **Third-Party Storage (Optional)**

### **1. Cloudinary (Image CDN)**
**If Enabled:** Images stored in Cloudinary cloud
**Used For:** Large images, automatic optimization
**Cost:** Free tier available

### **2. Imgur (Image Hosting)**
**If Enabled:** Images uploaded to Imgur
**Used For:** Image sharing, backup storage
**Cost:** Free

### **3. Hugging Face (AI Processing)**
**Used For:** AI model inference only
**Data Sent:** Temporary (not stored)
**Privacy:** Processing only, no storage

### **4. Google Gemini (AI Processing)**
**Used For:** AI suggestions and analysis
**Data Sent:** Temporary (not stored)
**Privacy:** Processing only, no storage

---

## 📍 **Local Storage (Browser)**

### **Browser LocalStorage**

**Location:** Your web browser's local storage  
**Stored Data:**
```javascript
localStorage:
- Theme preference (light/dark)
- Language preference
- Recent searches
- UI state (expanded menus, etc.)
- Cached data for offline access
- Session tokens (encrypted)
```

**Size Limit:** ~5-10 MB per domain  
**Persistence:** Until manually cleared

### **Session Storage**

**Location:** Browser session storage  
**Stored Data:**
```javascript
sessionStorage:
- Temporary UI state
- Form data (unsaved)
- Navigation history
- Active filters
```

**Persistence:** Until browser tab closed

### **IndexedDB (Browser Database)**

**Location:** Browser's local database  
**Used For:**
- Offline data caching
- Large dataset storage
- PWA functionality
- Background sync queue

**Size Limit:** ~50-100 MB (varies by browser)

---

## 🔒 **Security & Privacy**

### **Data Encryption:**
```
✅ In Transit: TLS/SSL encryption (HTTPS)
✅ At Rest: Firebase encryption (AES-256)
✅ Authentication: Firebase Auth tokens
✅ Authorization: Firestore security rules
```

### **Access Control:**
```
✅ User-specific data isolation
✅ Role-based permissions
✅ No cross-user data access
✅ Secure API keys (environment variables)
```

### **Privacy:**
```
✅ No data shared with third parties
✅ Optional analytics (can be disabled)
✅ EU GDPR compliant
✅ Data export available
✅ Data deletion available
```

---

## 📊 **Storage Limits**

### **Firebase Free Tier (Spark Plan):**
```
Firestore:
- Storage: 1 GB
- Reads: 50,000/day
- Writes: 20,000/day
- Deletes: 20,000/day

Firebase Storage:
- Storage: 5 GB
- Downloads: 1 GB/day
- Uploads: 1 GB/day

Realtime Database:
- Storage: 1 GB
- Downloads: 10 GB/month
```

### **Typical User Storage:**
```
Average User:
- Firestore: 50-200 MB
- Storage (Images): 100-500 MB
- Total: 150-700 MB

Heavy User:
- Firestore: 200-500 MB
- Storage (Images): 1-2 GB
- Total: 1.2-2.5 GB
```

---

## 🔍 **How to View Your Data**

### **1. Firebase Console:**
```
1. Visit: https://console.firebase.google.com
2. Select your project
3. Navigate to Firestore Database
4. Browse your data by collection
```

### **2. App Settings:**
```
Home Hub → Settings → Data & Privacy
- View storage usage
- Export data
- Delete data
- Download backup
```

### **3. Developer Tools:**
```
Browser Console:
Application → Storage → Firebase
- View cached data
- Check local storage
- Inspect IndexedDB
```

---

## 📤 **Data Export**

### **Export Your Data:**
```javascript
Home Hub → Settings → Data Export
- Export all data to JSON
- Export specific modules (Inventory, Recipes, etc.)
- Download as CSV
- Backup to Google Drive (if integrated)
```

### **Export Includes:**
- All inventory items
- All recipes
- All expenses
- Shopping lists
- Settings
- Profile data

**Format:** JSON or CSV  
**Size:** Varies by data amount

---

## 🗑️ **Data Deletion**

### **Delete Your Data:**
```
Home Hub → Settings → Account → Delete Account
- Permanently deletes all Firestore data
- Removes all images from Storage
- Deletes user authentication
- Cannot be undone
```

### **Partial Deletion:**
```
- Delete individual items
- Clear specific collections
- Remove old data (older than X days)
- Clean up unused images
```

---

## 📊 **Storage Monitoring**

### **Check Your Storage:**
```javascript
Home Hub → Settings → Storage
- Firestore usage: X MB / 1 GB
- Image storage: X MB / 5 GB
- Total: X MB / 6 GB
- Percentage used: X%
```

### **Optimize Storage:**
```
✅ Compress images before upload
✅ Delete old/unused data
✅ Remove duplicate items
✅ Archive old expenses
✅ Clean up cached data
```

---

## 🌍 **Data Location**

### **Firebase Region:**
Your data is stored in Firebase's data centers. Region depends on your Firebase project configuration:

**Common Regions:**
- `us-central1` (Iowa, USA)
- `us-east1` (South Carolina, USA)
- `us-west1` (Oregon, USA)
- `europe-west1` (Belgium, EU)
- `asia-east1` (Taiwan, Asia)

**To Check:** Firebase Console → Project Settings → Default GCP resource location

---

## 🔐 **Data Backup**

### **Automatic Backups:**
```
Firebase: Automatic daily backups (if enabled)
Frequency: Daily at 2 AM UTC
Retention: 7 days
Location: Same region as primary
```

### **Manual Backups:**
```
Home Hub → Settings → Backup
- Export all data to JSON
- Download local copy
- Save to Google Drive
- Email backup link
```

---

## 📝 **Summary**

### **Your Data Lives In:**

1. **Firebase Firestore** (Main database)
   - User profile
   - Inventory items
   - Recipes
   - Expenses
   - Shopping lists
   - Settings

2. **Firebase Storage** (Images & files)
   - Product photos
   - Recipe images
   - Receipts
   - Avatars

3. **Firebase Realtime Database** (Live updates)
   - Real-time collaboration
   - Chat messages
   - Activity tracking

4. **Browser Local Storage** (Preferences)
   - Theme settings
   - UI state
   - Cached data

5. **Optional: Third-party** (Images)
   - Cloudinary (CDN)
   - Imgur (Hosting)

---

## ✅ **Key Points**

```
✅ All data encrypted in transit and at rest
✅ User-specific data isolation
✅ No third-party data sharing
✅ GDPR compliant
✅ Export anytime
✅ Delete anytime
✅ Backed up daily
✅ Secure authentication
✅ Region-specific storage
✅ Free tier generous limits
```

---

## 🔗 **Related Documentation**

- [FIREBASE_SETUP.md](FIREBASE_SETUP.md) - Firebase configuration
- [SECURITY_FIXES.md](SECURITY_FIXES.md) - Security measures
- [TECHNICAL_REFERENCE.md](TECHNICAL_REFERENCE.md) - Technical architecture
- [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) - System overview

---

**Questions?** Check Firebase Console or Home Hub Settings for detailed storage information.

*Last Updated: September 29, 2025*  
*Status: Complete Storage Guide*
