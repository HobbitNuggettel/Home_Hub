import { 
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  endBefore,
  startAt,
  endAt,
  onSnapshot,
  writeBatch,
  runTransaction,
  increment,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  Timestamp,
  GeoPoint,
  FieldValue,
  QuerySnapshot,
  DocumentSnapshot,
  DocumentData,
  Query,
  OrderByDirection,
  WhereFilterOp,
  DocumentReference,
  CollectionReference
} from 'firebase/firestore';
import { db } from './config';

// Firestore Service Class
class FirestoreService {
  constructor() {
    this.batch = null;
    this.transaction = null;
    this.listeners = new Map();
  }

  // Collection References
  getCollectionRef(collectionName) {
    return collection(db, collectionName);
  }

  getDocumentRef(collectionName, documentId) {
    return doc(db, collectionName, documentId);
  }

  // Basic CRUD Operations
  async createDocument(collectionName, data, documentId = null) {
    try {
      let docRef;
      
      if (documentId) {
        // Create with specific ID
        docRef = this.getDocumentRef(collectionName, documentId);
        await setDoc(docRef, {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } else {
        // Create with auto-generated ID
        docRef = this.getDocumentRef(collectionName);
        await addDoc(docRef, {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      
      return {
        success: true,
        id: docRef.id,
        message: 'Document created successfully!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  async readDocument(collectionName, documentId) {
    try {
      const docRef = this.getDocumentRef(collectionName, documentId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          success: true,
          data: { id: docSnap.id, ...docSnap.data() },
          message: 'Document retrieved successfully!'
        };
      } else {
        return {
          success: false,
          error: 'Document not found',
          code: 'not-found'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  async updateDocument(collectionName, documentId, updates) {
    try {
      const docRef = this.getDocumentRef(collectionName, documentId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      return {
        success: true,
        message: 'Document updated successfully!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  async deleteDocument(collectionName, documentId) {
    try {
      const docRef = this.getDocumentRef(collectionName, documentId);
      await deleteDoc(docRef);
      
      return {
        success: true,
        message: 'Document deleted successfully!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  // Query Operations
  async queryDocuments(collectionName, options = {}) {
    try {
      let q = this.getCollectionRef(collectionName);
      
      // Apply where clauses
      if (options.where) {
        options.where.forEach(condition => {
          q = query(q, where(condition.field, condition.operator, condition.value));
        });
      }
      
      // Apply ordering
      if (options.orderBy) {
        options.orderBy.forEach(order => {
          q = query(q, orderBy(order.field, order.direction || 'asc'));
        });
      }
      
      // Apply limit
      if (options.limit) {
        q = query(q, limit(options.limit));
      }
      
      // Apply pagination
      if (options.startAfter) {
        q = query(q, startAfter(options.startAfter));
      }
      
      if (options.startAt) {
        q = query(q, startAt(options.startAt));
      }
      
      if (options.endBefore) {
        q = query(q, endBefore(options.endBefore));
      }
      
      if (options.endAt) {
        q = query(q, endAt(options.endAt));
      }
      
      const querySnapshot = await getDocs(q);
      const documents = [];
      
      querySnapshot.forEach((doc) => {
        documents.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return {
        success: true,
        data: documents,
        count: documents.length,
        message: 'Query executed successfully!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  // Real-time Listeners
  addDocumentListener(collectionName, documentId, callback, options = {}) {
    const docRef = this.getDocumentRef(collectionName, documentId);
    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        callback({
          success: true,
          data: { id: doc.id, ...doc.data() }
        });
      } else {
        callback({
          success: false,
          error: 'Document not found'
        });
      }
    }, (error) => {
      callback({
        success: false,
        error: error.message,
        code: error.code
      });
    }, options);
    
    const listenerId = `${collectionName}_${documentId}`;
    this.listeners.set(listenerId, unsubscribe);
    
    return listenerId;
  }

  addCollectionListener(collectionName, callback, options = {}) {
    let q = this.getCollectionRef(collectionName);
    
    // Apply query options
    if (options.where) {
      options.where.forEach(condition => {
        q = query(q, where(condition.field, condition.operator, condition.value));
      });
    }
    
    if (options.orderBy) {
      options.orderBy.forEach(order => {
        q = query(q, orderBy(order.field, order.direction || 'asc'));
      });
    }
    
    if (options.limit) {
      q = query(q, limit(options.limit));
    }
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const documents = [];
      querySnapshot.forEach((doc) => {
        documents.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      callback({
        success: true,
        data: documents,
        count: documents.length
      });
    }, (error) => {
      callback({
        success: false,
        error: error.message,
        code: error.code
      });
    });
    
    const listenerId = `collection_${collectionName}`;
    this.listeners.set(listenerId, unsubscribe);
    
    return listenerId;
  }

  removeListener(listenerId) {
    const unsubscribe = this.listeners.get(listenerId);
    if (unsubscribe) {
      unsubscribe();
      this.listeners.delete(listenerId);
      return true;
    }
    return false;
  }

  removeAllListeners() {
    this.listeners.forEach(unsubscribe => unsubscribe());
    this.listeners.clear();
  }

  // Batch Operations
  startBatch() {
    this.batch = writeBatch(db);
    return this.batch;
  }

  addToBatch(collectionName, documentId, data, operation = 'set') {
    if (!this.batch) {
      throw new Error('Batch not started. Call startBatch() first.');
    }
    
    const docRef = this.getDocumentRef(collectionName, documentId);
    
    switch (operation) {
      case 'set':
        this.batch.set(docRef, {
          ...data,
          updatedAt: serverTimestamp()
        });
        break;
      case 'update':
        this.batch.update(docRef, {
          ...data,
          updatedAt: serverTimestamp()
        });
        break;
      case 'delete':
        this.batch.delete(docRef);
        break;
      default:
        throw new Error(`Invalid operation: ${operation}`);
    }
  }

  async commitBatch() {
    if (!this.batch) {
      throw new Error('Batch not started. Call startBatch() first.');
    }
    
    try {
      await this.batch.commit();
      this.batch = null;
      
      return {
        success: true,
        message: 'Batch committed successfully!'
      };
    } catch (error) {
      this.batch = null;
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  // Transaction Operations
  async runTransaction(updateFunction) {
    try {
      const result = await runTransaction(db, updateFunction);
      return {
        success: true,
        data: result,
        message: 'Transaction completed successfully!'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  // Field Value Operations
  incrementField(amount = 1) {
    return increment(amount);
  }

  addToArray(...elements) {
    return arrayUnion(...elements);
  }

  removeFromArray(...elements) {
    return arrayRemove(...elements);
  }

  getServerTimestamp() {
    return serverTimestamp();
  }

  createGeoPoint(latitude, longitude) {
    return new GeoPoint(latitude, longitude);
  }

  createTimestamp(seconds, nanoseconds) {
    return new Timestamp(seconds, nanoseconds);
  }

  // Utility Methods
  async documentExists(collectionName, documentId) {
    try {
      const docRef = this.getDocumentRef(collectionName, documentId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists();
    } catch (error) {
      return false;
    }
  }

  async getDocumentCount(collectionName, options = {}) {
    try {
      const result = await this.queryDocuments(collectionName, options);
      if (result.success) {
        return result.count;
      }
      return 0;
    } catch (error) {
      return 0;
    }
  }

  async searchDocuments(collectionName, searchField, searchTerm, options = {}) {
    // Note: Firestore doesn't support full-text search natively
    // This is a basic implementation using '>=', '<=' for prefix matching
    const searchOptions = {
      ...options,
      where: [
        ...(options.where || []),
        {
          field: searchField,
          operator: '>=',
          value: searchTerm
        },
        {
          field: searchField,
          operator: '<=',
          value: searchTerm + '\uf8ff'
        }
      ]
    };
    
    return this.queryDocuments(collectionName, searchOptions);
  }

  // Data Validation and Sanitization
  sanitizeData(data) {
    const sanitized = {};
    
    Object.keys(data).forEach(key => {
      const value = data[key];
      
      // Handle special Firestore types
      if (value === undefined) {
        return; // Skip undefined values
      }
      
      if (value === null) {
        sanitized[key] = null;
        return;
      }
      
      if (typeof value === 'object' && !Array.isArray(value)) {
        // Recursively sanitize nested objects
        sanitized[key] = this.sanitizeData(value);
      } else {
        sanitized[key] = value;
      }
    });
    
    return sanitized;
  }

  // Error Handling
  getFirestoreErrorMessage(errorCode) {
    const errorMessages = {
      'permission-denied': 'You do not have permission to perform this operation.',
      'unauthenticated': 'You must be authenticated to perform this operation.',
      'not-found': 'The requested document or collection was not found.',
      'already-exists': 'A document with this ID already exists.',
      'resource-exhausted': 'The operation was rejected because the system has insufficient resources.',
      'failed-precondition': 'The operation was rejected because the system is not in a state required for the operation\'s execution.',
      'aborted': 'The operation was aborted, typically due to a concurrency issue.',
      'out-of-range': 'The operation was attempted past the valid range.',
      'unimplemented': 'The operation is not implemented or not supported/enabled.',
      'internal': 'Internal errors. Means some invariants expected by the underlying system have been broken.',
      'unavailable': 'The service is currently unavailable.',
      'data-loss': 'Unrecoverable data loss or corruption.',
      'deadline-exceeded': 'The deadline expired before the operation could complete.',
      'invalid-argument': 'Client specified an invalid argument.',
      'permission-denied': 'The caller does not have permission to execute the specified operation.',
      'resource-exhausted': 'Some resource has been exhausted, perhaps a per-user quota, or perhaps the entire file system is out of space.',
      'failed-precondition': 'The operation was rejected because the system is not in a state required for the operation\'s execution.',
      'aborted': 'The operation was aborted, typically due to a concurrency issue.',
      'out-of-range': 'The operation was attempted past the valid range.',
      'unimplemented': 'The operation is not implemented or not supported/enabled.',
      'internal': 'Internal errors. Means some invariants expected by the underlying system have been broken.',
      'unavailable': 'The service is currently unavailable.',
      'data-loss': 'Unrecoverable data loss or corruption.',
      'deadline-exceeded': 'The deadline expired before the operation could complete.'
    };
    
    return errorMessages[errorCode] || 'An unexpected error occurred. Please try again.';
  }
}

// Create and export singleton instance
export const firestoreService = new FirestoreService();

// Note: All methods are available through the firestoreService instance

export default firestoreService;
