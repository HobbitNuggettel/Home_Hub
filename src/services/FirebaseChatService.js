/**
 * Enhanced Firebase Chat Storage Service for AI Conversations
 * Provides comprehensive chat storage, retrieval, and management
 * Optimized for Firebase free tier usage with advanced features
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
  startAfter,
  endBefore,
  onSnapshot,
  serverTimestamp,
  getDocs,
  getDoc,
  writeBatch,
  Timestamp,
  arrayUnion,
  arrayRemove,
  increment
} from 'firebase/firestore';
import { db } from '../firebase/config.js';
// import { firebaseAnalyticsService } from '../firebase.js';

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
          responseTime: messageData.responseTime || 0,
          attachments: messageData.attachments || [],
          sentiment: messageData.sentiment || 'neutral',
          language: messageData.language || 'en'
        }
      };

      // Add message to messages collection
      const messageRef = await addDoc(
        collection(db, this.collections.messages), 
        message
      );

      // Update conversation metadata
      await this.updateConversationMetadata(conversationId, {
        messageCount: increment(1),
        updatedAt: serverTimestamp(),
        lastMessage: message.content.substring(0, 100),
        lastMessageTime: message.timestamp
      });

      // Log analytics
      firebaseAnalyticsService.logEvent('chat_message_added', {
        conversation_id: conversationId,
        message_role: messageData.role,
        message_length: messageData.content.length,
        has_attachments: messageData.attachments ? messageData.attachments.length > 0 : false
      });

      // Update conversation metadata
      await this.updateConversationMetadata(conversationId, {
        messageCount: messageData.messageCount || 1,
        updatedAt: serverTimestamp(),
        lastMessage: message.content.substring(0, 100)
      });

      return {
        id: messageRef.id,
        ...message,
        timestamp: new Date(),
        createdAt: new Date()
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
   * Save message with enhanced metadata
   */
  async saveMessage(message, userId) {
    try {
      const messageData = {
        userId,
        content: this.truncateText(message.content, this.maxMessageLength),
        role: message.role || 'user',
        timestamp: serverTimestamp(),
        conversationId: message.conversationId,
        metadata: {
          tokens: message.content.length,
          model: message.model || 'default',
          responseTime: message.responseTime || 0,
          attachments: message.attachments || [],
          sentiment: message.sentiment || 'neutral',
          language: message.language || 'en',
          platform: message.platform || 'web',
          userAgent: message.userAgent || navigator.userAgent
        }
      };

      const messageRef = await addDoc(
        collection(db, this.collections.messages),
        messageData
      );

      // Log analytics
      firebaseAnalyticsService.logEvent('chat_message_saved', {
        user_id: userId,
        message_role: message.role,
        message_length: message.content.length,
        conversation_id: message.conversationId
      });

      return {
        success: true,
        messageId: messageRef.id,
        message: { id: messageRef.id, ...messageData },
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Failed to save message:', error);
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  /**
   * Get chat history with advanced pagination and filtering
   */
  async getChatHistory(userId, options = {}) {
    try {
      const {
        limit = 50,
        offset = 0,
        conversationId = null,
        startDate = null,
        endDate = null,
        role = null,
        searchQuery = null,
        sortBy = 'timestamp',
        sortOrder = 'desc'
      } = options;

      let messagesQuery = query(
        collection(db, this.collections.messages),
        where('userId', '==', userId)
      );

      // Apply filters
      if (conversationId) {
        messagesQuery = query(messagesQuery, where('conversationId', '==', conversationId));
      }

      if (role) {
        messagesQuery = query(messagesQuery, where('role', '==', role));
      }

      if (startDate) {
        messagesQuery = query(messagesQuery, where('timestamp', '>=', new Date(startDate)));
      }

      if (endDate) {
        messagesQuery = query(messagesQuery, where('timestamp', '<=', new Date(endDate)));
      }

      // Apply sorting
      messagesQuery = query(
        messagesQuery,
        orderBy(sortBy, sortOrder),
        limit(limit)
      );

      // Apply offset for pagination
      if (offset > 0) {
        // Note: Firestore doesn't support offset directly, this is a simplified approach
        // For production, consider using cursor-based pagination
      }

      const messagesSnapshot = await getDocs(messagesQuery);
      const messages = messagesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Apply search filter if provided
      let filteredMessages = messages;
      if (searchQuery) {
        filteredMessages = messages.filter(message =>
          message.content.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // Log analytics
      firebaseAnalyticsService.logEvent('chat_history_retrieved', {
        user_id: userId,
        messages_count: filteredMessages.length,
        filters_applied: Object.keys(options).length
      });

      return {
        success: true,
        messages: filteredMessages,
        total: filteredMessages.length,
        hasMore: filteredMessages.length === limit,
        pagination: {
          limit,
          offset,
          total: filteredMessages.length
        }
      };
    } catch (error) {
      console.error('Failed to get chat history:', error);
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  /**
   * Update existing message with enhanced capabilities
   */
  async updateMessage(messageId, updates) {
    try {
      const messageRef = doc(db, this.collections.messages, messageId);

      // Get current message to validate updates
      const currentMessage = await getDoc(messageRef);
      if (!currentMessage.exists()) {
        throw new Error('Message not found');
      }

      const updateData = {
        ...updates,
        updatedAt: serverTimestamp(),
        editCount: increment(1),
        lastEditTime: serverTimestamp()
      };

      // Preserve original content for edit history
      if (updates.content && updates.content !== currentMessage.data().content) {
        updateData.editHistory = arrayUnion({
          previousContent: currentMessage.data().content,
          editTime: serverTimestamp(),
          editReason: updates.editReason || 'user_edit'
        });
      }

      await updateDoc(messageRef, updateData);

      // Log analytics
      firebaseAnalyticsService.logEvent('chat_message_updated', {
        message_id: messageId,
        update_fields: Object.keys(updates),
        has_content_change: !!updates.content
      });

      return {
        success: true,
        messageId,
        message: 'Message updated successfully',
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Failed to update message:', error);
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  /**
   * Delete message with soft delete option
   */
  async deleteMessage(messageId, softDelete = true) {
    try {
      const messageRef = doc(db, this.collections.messages, messageId);

      if (softDelete) {
        // Soft delete - mark as deleted but keep in database
        await updateDoc(messageRef, {
          deletedAt: serverTimestamp(),
          isDeleted: true,
          deleteReason: 'user_request'
        });
      } else {
        // Hard delete - remove from database
        await deleteDoc(messageRef);
      }

      // Log analytics
      firebaseAnalyticsService.logEvent('chat_message_deleted', {
        message_id: messageId,
        soft_delete: softDelete
      });

      return {
        success: true,
        messageId,
        message: softDelete ? 'Message marked as deleted' : 'Message permanently deleted',
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Failed to delete message:', error);
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  /**
   * Search messages with advanced query capabilities
   */
  async searchMessages(userId, searchOptions = {}) {
    try {
      const {
        query: searchQuery,
        conversationId = null,
        startDate = null,
        endDate = null,
        role = null,
        limit = 100,
        includeDeleted = false
      } = searchOptions;

      if (!searchQuery || searchQuery.trim().length < 2) {
        throw new Error('Search query must be at least 2 characters long');
      }

      let messagesQuery = query(
        collection(db, this.collections.messages),
        where('userId', '==', userId)
      );

      // Apply filters
      if (conversationId) {
        messagesQuery = query(messagesQuery, where('conversationId', '==', conversationId));
      }

      if (role) {
        messagesQuery = query(messagesQuery, where('role', '==', role));
      }

      if (startDate) {
        messagesQuery = query(messagesQuery, where('timestamp', '>=', new Date(startDate)));
      }

      if (endDate) {
        messagesQuery = query(messagesQuery, where('timestamp', '<=', new Date(endDate)));
      }

      if (!includeDeleted) {
        messagesQuery = query(messagesQuery, where('isDeleted', '!=', true));
      }

      const messagesSnapshot = await getDocs(messagesQuery);
      const messages = messagesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Apply search filter
      const searchTerms = searchQuery.toLowerCase().split(/\s+/);
      const filteredMessages = messages.filter(message => {
        const content = message.content.toLowerCase();
        return searchTerms.every(term => content.includes(term));
      });

      // Sort by relevance (simple implementation)
      const sortedMessages = filteredMessages.sort((a, b) => {
        const aRelevance = this.calculateRelevance(a, searchTerms);
        const bRelevance = this.calculateRelevance(b, searchTerms);
        return bRelevance - aRelevance;
      });

      // Log analytics
      firebaseAnalyticsService.logEvent('chat_messages_searched', {
        user_id: userId,
        search_query: searchQuery,
        results_count: sortedMessages.length,
        filters_applied: Object.keys(searchOptions).length - 1 // Exclude query
      });

      return {
        success: true,
        messages: sortedMessages.slice(0, limit),
        total: sortedMessages.length,
        query: searchQuery,
        searchTime: new Date()
      };
    } catch (error) {
      console.error('Failed to search messages:', error);
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  /**
   * Calculate message relevance for search
   */
  calculateRelevance(message, searchTerms) {
    let relevance = 0;
    const content = message.content.toLowerCase();

    searchTerms.forEach(term => {
      if (content.includes(term)) {
        relevance += 1;
        // Bonus for exact matches
        if (content.includes(term + ' ')) {
          relevance += 0.5;
        }
      }
    });

    // Bonus for recent messages
    if (message.timestamp) {
      const messageAge = Date.now() - message.timestamp.toDate().getTime();
      const daysOld = messageAge / (1000 * 60 * 60 * 24);
      if (daysOld < 7) relevance += 0.3;
      if (daysOld < 1) relevance += 0.2;
    }

    return relevance;
  }

  /**
   * Get conversation analytics and insights
   */
  async getConversationAnalytics(conversationId) {
    try {
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

      const analytics = {
        totalMessages: messages.length,
        userMessages: messages.filter(m => m.role === 'user').length,
        assistantMessages: messages.filter(m => m.role === 'assistant').length,
        averageResponseTime: 0,
        totalTokens: 0,
        conversationDuration: 0,
        topics: this.extractTopics(messages),
        sentiment: this.analyzeSentiment(messages),
        language: this.detectLanguage(messages)
      };

      // Calculate response times
      let totalResponseTime = 0;
      let responseCount = 0;
      for (let i = 1; i < messages.length; i++) {
        if (messages[i].role === 'assistant' && messages[i - 1].role === 'user') {
          const responseTime = messages[i].timestamp.toDate() - messages[i - 1].timestamp.toDate();
          totalResponseTime += responseTime;
          responseCount++;
        }
      }
      analytics.averageResponseTime = responseCount > 0 ? totalResponseTime / responseCount : 0;

      // Calculate total tokens
      analytics.totalTokens = messages.reduce((sum, m) => sum + (m.metadata?.tokens || 0), 0);

      // Calculate conversation duration
      if (messages.length > 1) {
        const firstMessage = messages[0];
        const lastMessage = messages[messages.length - 1];
        analytics.conversationDuration = lastMessage.timestamp.toDate() - firstMessage.timestamp.toDate();
      }

      return {
        success: true,
        analytics,
        conversationId,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Failed to get conversation analytics:', error);
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  /**
   * Extract conversation topics using simple keyword analysis
   */
  extractTopics(messages) {
    const topicKeywords = {
      'shopping': ['buy', 'purchase', 'shop', 'store', 'price', 'cost'],
      'expenses': ['spend', 'expense', 'money', 'budget', 'cost', 'payment'],
      'recipes': ['cook', 'recipe', 'food', 'meal', 'ingredient', 'kitchen'],
      'inventory': ['item', 'stock', 'quantity', 'supply', 'product'],
      'budget': ['budget', 'finance', 'money', 'saving', 'expense'],
      'general': ['help', 'question', 'information', 'advice']
    };

    const content = messages.map(m => m.content).join(' ').toLowerCase();
    const topics = [];

    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      const matchCount = keywords.filter(keyword => content.includes(keyword)).length;
      if (matchCount > 0) {
        topics.push({
          name: topic,
          confidence: matchCount / keywords.length,
          keywordMatches: matchCount
        });
      }
    });

    return topics.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Analyze conversation sentiment
   */
  analyzeSentiment(messages) {
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'happy', 'satisfied'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'angry', 'frustrated', 'disappointed'];

    let positiveCount = 0;
    let negativeCount = 0;
    let totalWords = 0;

    messages.forEach(message => {
      const words = message.content.toLowerCase().split(/\s+/);
      totalWords += words.length;

      words.forEach(word => {
        if (positiveWords.includes(word)) positiveCount++;
        if (negativeWords.includes(word)) negativeCount++;
      });
    });

    const sentiment = positiveCount > negativeCount ? 'positive' :
      negativeCount > positiveCount ? 'negative' : 'neutral';

    return {
      overall: sentiment,
      positiveScore: positiveCount / totalWords,
      negativeScore: negativeCount / totalWords,
      neutralScore: (totalWords - positiveCount - negativeCount) / totalWords
    };
  }

  /**
   * Detect conversation language
   */
  detectLanguage(messages) {
    // Simple language detection based on common words
    const languagePatterns = {
      'en': ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for'],
      'es': ['el', 'la', 'de', 'que', 'y', 'en', 'un', 'es', 'se'],
      'fr': ['le', 'la', 'de', 'et', 'en', 'un', 'est', 'que', 'pour'],
      'de': ['der', 'die', 'das', 'und', 'in', 'den', 'von', 'zu', 'mit']
    };

    const content = messages.map(m => m.content).join(' ').toLowerCase();
    const scores = {};

    Object.entries(languagePatterns).forEach(([lang, words]) => {
      scores[lang] = words.filter(word => content.includes(word)).length;
    });

    const detectedLanguage = Object.entries(scores).reduce((a, b) =>
      scores[a[0]] > scores[b[0]] ? a : b
    )[0];

    return {
      detected: detectedLanguage,
      confidence: scores[detectedLanguage] / Math.max(...Object.values(scores)),
      scores
    };
  }

  /**
   * Get service status and limits
   */
  getServiceStatus() {
    return {
      service: 'Enhanced Firebase Chat Service',
      status: 'active',
      collections: this.collections,
      limits: {
        maxMessageLength: this.maxMessageLength,
        maxConversationAge: this.maxConversationAge,
        batchSize: this.batchSize
      },
      features: [
        'Persistent chat storage',
        'Real-time updates',
        'Advanced search and filtering',
        'Message analytics',
        'Sentiment analysis',
        'Topic extraction',
        'Language detection',
        'Soft delete support',
        'Edit history tracking',
        'Analytics integration'
      ]
    };
  }
}

export default new FirebaseChatService();

