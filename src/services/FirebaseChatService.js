/**
 * Firebase Chat Storage Service for AI Conversations
 * Provides real-time chat storage, retrieval, and management
 * Optimized for Firebase free tier usage
 */

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  serverTimestamp,
  getDocs,
  getDoc,
  writeBatch,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';

class FirebaseChatService {
  constructor() {
    this.collections = {
      conversations: 'ai_conversations',
      messages: 'ai_messages',
      userSessions: 'user_sessions'
    };
    
    // Chat data structure optimization
    this.maxMessageLength = 1000; // Truncate long messages
    this.maxConversationAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    this.batchSize = 500; // Firestore batch limit
  }

  /**
   * Create a new AI conversation
   */
  async createConversation(userId, title = 'New Conversation', context = {}) {
    try {
      const conversationData = {
        userId,
        title: this.truncateText(title, 100),
        context,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        messageCount: 0,
        isActive: true,
        tags: this.extractTags(title),
        metadata: {
          platform: 'web',
          version: '1.0.0',
          features: Object.keys(context)
        }
      };

      const docRef = await addDoc(
        collection(db, this.collections.conversations), 
        conversationData
      );

      return {
        id: docRef.id,
        ...conversationData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

    } catch (error) {
      console.error('Failed to create conversation:', error);
      throw new Error('Failed to create conversation');
    }
  }

  /**
   * Add a message to an existing conversation
   */
  async addMessage(conversationId, messageData) {
    try {
      const message = {
        conversationId,
        content: this.truncateText(messageData.content, this.maxMessageLength),
        role: messageData.role, // 'user' or 'assistant'
        timestamp: serverTimestamp(),
        metadata: {
          tokens: messageData.content.length,
          model: messageData.model || 'default',
          responseTime: messageData.responseTime || 0
        }
      };

      // Add message to messages collection
      const messageRef = await addDoc(
        collection(db, this.collections.messages), 
        message
      );

      // Update conversation metadata
      await this.updateConversationMetadata(conversationId, {
        messageCount: messageData.messageCount || 1,
        updatedAt: serverTimestamp(),
        lastMessage: message.content.substring(0, 100)
      });

      return {
        id: messageRef.id,
        ...message,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('Failed to add message:', error);
      throw new Error('Failed to add message');
    }
  }

  /**
   * Get conversation with real-time updates
   */
  subscribeToConversation(conversationId, callback) {
    try {
      const conversationRef = doc(db, this.collections.conversations, conversationId);
      
      // Subscribe to conversation updates
      const unsubscribeConversation = onSnapshot(conversationRef, (doc) => {
        if (doc.exists()) {
          const conversation = { id: doc.id, ...doc.data() };
          callback({ type: 'conversation', data: conversation });
        }
      });

      // Subscribe to messages in the conversation
      const messagesQuery = query(
        collection(db, this.collections.messages),
        where('conversationId', '==', conversationId),
        orderBy('timestamp', 'asc')
      );

      const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
        const messages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback({ type: 'messages', data: messages });
      });

      // Return unsubscribe function
      return () => {
        unsubscribeConversation();
        unsubscribeMessages();
      };

    } catch (error) {
      console.error('Failed to subscribe to conversation:', error);
      throw new Error('Failed to subscribe to conversation');
    }
  }

  /**
   * Get user's conversations with pagination
   */
  async getUserConversations(userId, limit = 20, startAfter = null) {
    try {
      let q = query(
        collection(db, this.collections.conversations),
        where('userId', '==', userId),
        where('isActive', '==', true),
        orderBy('updatedAt', 'desc'),
        limit(limit)
      );

      if (startAfter) {
        q = query(q, startAfter(startAfter));
      }

      const snapshot = await getDocs(q);
      const conversations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return {
        conversations,
        hasMore: conversations.length === limit,
        lastDoc: snapshot.docs[snapshot.docs.length - 1]
      };

    } catch (error) {
      console.error('Failed to get user conversations:', error);
      throw new Error('Failed to get conversations');
    }
  }

  /**
   * Search conversations by content or tags
   */
  async searchConversations(userId, searchTerm, limit = 10) {
    try {
      // Get all user conversations (Firestore doesn't support full-text search in free tier)
      const { conversations } = await this.getUserConversations(userId, 100);
      
      // Client-side search for better performance
      const searchResults = conversations.filter(conv => {
        const searchLower = searchTerm.toLowerCase();
        return (
          conv.title.toLowerCase().includes(searchLower) ||
          conv.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
          conv.lastMessage?.toLowerCase().includes(searchLower)
        );
      });

      return searchResults.slice(0, limit);

    } catch (error) {
      console.error('Failed to search conversations:', error);
      throw new Error('Failed to search conversations');
    }
  }

  /**
   * Update conversation metadata
   */
  async updateConversationMetadata(conversationId, updates) {
    try {
      const conversationRef = doc(db, this.collections.conversations, conversationId);
      await updateDoc(conversationRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Failed to update conversation metadata:', error);
      throw new Error('Failed to update conversation');
    }
  }

  /**
   * Archive/delete conversation
   */
  async archiveConversation(conversationId) {
    try {
      const conversationRef = doc(db, this.collections.conversations, conversationId);
      await updateDoc(conversationRef, {
        isActive: false,
        archivedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Failed to archive conversation:', error);
      throw new Error('Failed to archive conversation');
    }
  }

  /**
   * Clean up old conversations (maintenance)
   */
  async cleanupOldConversations(userId) {
    try {
      const cutoffDate = new Date(Date.now() - this.maxConversationAge);
      const cutoffTimestamp = Timestamp.fromDate(cutoffDate);

      const q = query(
        collection(db, this.collections.conversations),
        where('userId', '==', userId),
        where('updatedAt', '<', cutoffTimestamp),
        where('isActive', '==', false)
      );

      const snapshot = await getDocs(q);
      
      if (snapshot.empty) return { deleted: 0 };

      // Use batch operations for efficiency
      const batch = writeBatch(db);
      const conversationsToDelete = [];

      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
        conversationsToDelete.push(doc.id);
      });

      // Delete associated messages
      for (const convId of conversationsToDelete) {
        const messagesQuery = query(
          collection(db, this.collections.messages),
          where('conversationId', '==', convId)
        );
        const messagesSnapshot = await getDocs(messagesQuery);
        
        messagesSnapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
      }

      await batch.commit();

      return { deleted: conversationsToDelete.length };

    } catch (error) {
      console.error('Failed to cleanup old conversations:', error);
      throw new Error('Failed to cleanup conversations');
    }
  }

  /**
   * Get conversation statistics
   */
  async getConversationStats(userId) {
    try {
      const { conversations } = await this.getUserConversations(userId, 1000);
      
      const stats = {
        totalConversations: conversations.length,
        activeConversations: conversations.filter(c => c.isActive).length,
        totalMessages: conversations.reduce((sum, c) => sum + (c.messageCount || 0), 0),
        averageMessagesPerConversation: 0,
        oldestConversation: null,
        newestConversation: null
      };

      if (conversations.length > 0) {
        stats.averageMessagesPerConversation = stats.totalMessages / stats.totalConversations;
        
        const sortedByDate = conversations.sort((a, b) => 
          new Date(a.createdAt) - new Date(b.createdAt)
        );
        
        stats.oldestConversation = sortedByDate[0];
        stats.newestConversation = sortedByDate[sortedByDate.length - 1];
      }

      return stats;

    } catch (error) {
      console.error('Failed to get conversation stats:', error);
      throw new Error('Failed to get statistics');
    }
  }

  /**
   * Export conversation data
   */
  async exportConversation(conversationId) {
    try {
      const conversationRef = doc(db, this.collections.conversations, conversationId);
      const conversationDoc = await getDoc(conversationRef);
      
      if (!conversationDoc.exists()) {
        throw new Error('Conversation not found');
      }

      const conversation = { id: conversationDoc.id, ...conversationDoc.data() };
      
      // Get all messages
      const messagesQuery = query(
        collection(db, this.collections.messages),
        where('conversationId', '==', conversationId),
        orderBy('timestamp', 'asc')
      );
      
      const messagesSnapshot = await getDocs(messagesQuery);
      const messages = messagesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return {
        conversation,
        messages,
        exportDate: new Date(),
        format: 'json'
      };

    } catch (error) {
      console.error('Failed to export conversation:', error);
      throw new Error('Failed to export conversation');
    }
  }

  /**
   * Utility: Truncate text to specified length
   */
  truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  /**
   * Utility: Extract tags from text
   */
  extractTags(text) {
    if (!text) return [];
    
    // Simple tag extraction (can be enhanced with AI)
    const words = text.toLowerCase().split(/\s+/);
    const commonTags = ['shopping', 'expense', 'recipe', 'inventory', 'budget', 'meal'];
    
    return words.filter(word => 
      commonTags.includes(word) && word.length > 2
    ).slice(0, 5); // Limit to 5 tags
  }

  /**
   * Get service status and limits
   */
  getServiceStatus() {
    return {
      service: 'Firebase Chat Service',
      status: 'active',
      collections: this.collections,
      limits: {
        maxMessageLength: this.maxMessageLength,
        maxConversationAge: this.maxConversationAge,
        batchSize: this.batchSize
      }
    };
  }
}

export default new FirebaseChatService();

