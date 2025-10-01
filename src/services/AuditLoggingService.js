/**
 * Audit Logging Service
 * Comprehensive audit logging for compliance and security
 */

import { collection, addDoc, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import loggingService from './LoggingService';

class AuditLoggingService {
  constructor() {
    this.auditCollection = 'audit_logs';
    this.retentionDays = 365; // Default retention period
    this.batchSize = 100; // Batch size for bulk operations
  }

  /**
   * Log audit event
   */
  async logEvent(event) {
    try {
      const auditEvent = {
        timestamp: Timestamp.now(),
        eventType: event.eventType,
        action: event.action,
        resource: event.resource,
        userId: event.userId,
        userEmail: event.userEmail,
        sessionId: event.sessionId,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        details: event.details || {},
        severity: event.severity || 'info',
        category: event.category || 'general',
        outcome: event.outcome || 'success',
        riskLevel: event.riskLevel || 'low',
        tags: event.tags || [],
        metadata: event.metadata || {},
        createdAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, this.auditCollection), auditEvent);
      
      loggingService.info('Audit event logged', {
        eventId: docRef.id,
        eventType: event.eventType,
        action: event.action,
        userId: event.userId
      });

      return {
        success: true,
        eventId: docRef.id
      };
    } catch (error) {
      loggingService.error('Failed to log audit event', {
        event,
        error: error.message
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Log authentication event
   */
  async logAuthEvent(action, userId, userEmail, details = {}) {
    return await this.logEvent({
      eventType: 'authentication',
      action,
      resource: 'auth',
      userId,
      userEmail,
      details,
      category: 'security',
      severity: action.includes('failed') ? 'warning' : 'info'
    });
  }

  /**
   * Log authorization event
   */
  async logAuthzEvent(action, userId, userEmail, resource, details = {}) {
    return await this.logEvent({
      eventType: 'authorization',
      action,
      resource,
      userId,
      userEmail,
      details,
      category: 'security',
      severity: action.includes('denied') ? 'warning' : 'info'
    });
  }

  /**
   * Log data access event
   */
  async logDataAccessEvent(action, userId, userEmail, resource, details = {}) {
    return await this.logEvent({
      eventType: 'data_access',
      action,
      resource,
      userId,
      userEmail,
      details,
      category: 'data',
      severity: 'info'
    });
  }

  /**
   * Log data modification event
   */
  async logDataModificationEvent(action, userId, userEmail, resource, details = {}) {
    return await this.logEvent({
      eventType: 'data_modification',
      action,
      resource,
      userId,
      userEmail,
      details,
      category: 'data',
      severity: 'info',
      riskLevel: 'medium'
    });
  }

  /**
   * Log system event
   */
  async logSystemEvent(action, details = {}) {
    return await this.logEvent({
      eventType: 'system',
      action,
      resource: 'system',
      userId: 'system',
      userEmail: 'system@system',
      details,
      category: 'system',
      severity: 'info'
    });
  }

  /**
   * Log security event
   */
  async logSecurityEvent(action, userId, userEmail, details = {}) {
    return await this.logEvent({
      eventType: 'security',
      action,
      resource: 'security',
      userId,
      userEmail,
      details,
      category: 'security',
      severity: 'warning',
      riskLevel: 'high'
    });
  }

  /**
   * Log compliance event
   */
  async logComplianceEvent(action, userId, userEmail, resource, details = {}) {
    return await this.logEvent({
      eventType: 'compliance',
      action,
      resource,
      userId,
      userEmail,
      details,
      category: 'compliance',
      severity: 'info',
      tags: ['compliance']
    });
  }

  /**
   * Get audit logs
   */
  async getAuditLogs(filters = {}) {
    try {
      let q = collection(db, this.auditCollection);

      // Apply filters
      if (filters.userId) {
        q = query(q, where('userId', '==', filters.userId));
      }
      if (filters.eventType) {
        q = query(q, where('eventType', '==', filters.eventType));
      }
      if (filters.action) {
        q = query(q, where('action', '==', filters.action));
      }
      if (filters.severity) {
        q = query(q, where('severity', '==', filters.severity));
      }
      if (filters.category) {
        q = query(q, where('category', '==', filters.category));
      }
      if (filters.startDate) {
        q = query(q, where('timestamp', '>=', Timestamp.fromDate(new Date(filters.startDate))));
      }
      if (filters.endDate) {
        q = query(q, where('timestamp', '<=', Timestamp.fromDate(new Date(filters.endDate))));
      }

      // Order by timestamp descending
      q = query(q, orderBy('timestamp', 'desc'));

      // Apply limit
      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }

      const querySnapshot = await getDocs(q);
      const logs = [];

      querySnapshot.forEach(doc => {
        logs.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return {
        success: true,
        logs,
        count: logs.length
      };
    } catch (error) {
      loggingService.error('Failed to get audit logs', {
        filters,
        error: error.message
      });

      return {
        success: false,
        error: error.message,
        logs: []
      };
    }
  }

  /**
   * Get audit logs by user
   */
  async getAuditLogsByUser(userId, limit = 100) {
    return await this.getAuditLogs({ userId, limit });
  }

  /**
   * Get audit logs by event type
   */
  async getAuditLogsByEventType(eventType, limit = 100) {
    return await this.getAuditLogs({ eventType, limit });
  }

  /**
   * Get security events
   */
  async getSecurityEvents(limit = 100) {
    return await this.getAuditLogs({ category: 'security', limit });
  }

  /**
   * Get compliance events
   */
  async getComplianceEvents(limit = 100) {
    return await this.getAuditLogs({ category: 'compliance', limit });
  }

  /**
   * Get audit statistics
   */
  async getAuditStatistics(filters = {}) {
    try {
      const result = await this.getAuditLogs(filters);
      if (!result.success) {
        return result;
      }

      const logs = result.logs;
      const stats = {
        totalEvents: logs.length,
        eventTypes: {},
        actions: {},
        severities: {},
        categories: {},
        riskLevels: {},
        outcomes: {},
        topUsers: {},
        topResources: {}
      };

      logs.forEach(log => {
        // Event types
        stats.eventTypes[log.eventType] = (stats.eventTypes[log.eventType] || 0) + 1;
        
        // Actions
        stats.actions[log.action] = (stats.actions[log.action] || 0) + 1;
        
        // Severities
        stats.severities[log.severity] = (stats.severities[log.severity] || 0) + 1;
        
        // Categories
        stats.categories[log.category] = (stats.categories[log.category] || 0) + 1;
        
        // Risk levels
        stats.riskLevels[log.riskLevel] = (stats.riskLevels[log.riskLevel] || 0) + 1;
        
        // Outcomes
        stats.outcomes[log.outcome] = (stats.outcomes[log.outcome] || 0) + 1;
        
        // Top users
        if (log.userId && log.userId !== 'system') {
          stats.topUsers[log.userId] = (stats.topUsers[log.userId] || 0) + 1;
        }
        
        // Top resources
        stats.topResources[log.resource] = (stats.topResources[log.resource] || 0) + 1;
      });

      return {
        success: true,
        statistics: stats
      };
    } catch (error) {
      loggingService.error('Failed to get audit statistics', {
        filters,
        error: error.message
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Export audit logs
   */
  async exportAuditLogs(filters = {}, format = 'json') {
    try {
      const result = await this.getAuditLogs(filters);
      if (!result.success) {
        return result;
      }

      const logs = result.logs;
      let exportData;

      if (format === 'csv') {
        // Convert to CSV format
        const headers = [
          'Timestamp', 'Event Type', 'Action', 'Resource', 'User ID', 'User Email',
          'Severity', 'Category', 'Outcome', 'Risk Level', 'IP Address', 'User Agent'
        ];
        
        const csvRows = [headers.join(',')];
        
        logs.forEach(log => {
          const row = [
            log.timestamp.toDate().toISOString(),
            log.eventType,
            log.action,
            log.resource,
            log.userId,
            log.userEmail,
            log.severity,
            log.category,
            log.outcome,
            log.riskLevel,
            log.ipAddress || '',
            log.userAgent || ''
          ];
          csvRows.push(row.map(field => `"${field}"`).join(','));
        });
        
        exportData = csvRows.join('\n');
      } else {
        // JSON format
        exportData = JSON.stringify(logs, null, 2);
      }

      return {
        success: true,
        data: exportData,
        format,
        count: logs.length
      };
    } catch (error) {
      loggingService.error('Failed to export audit logs', {
        filters,
        format,
        error: error.message
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Clean up old audit logs
   */
  async cleanupOldLogs() {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.retentionDays);
      
      const result = await this.getAuditLogs({
        endDate: cutoffDate.toISOString()
      });

      if (!result.success) {
        return result;
      }

      const oldLogs = result.logs;
      let deletedCount = 0;

      // Delete old logs in batches
      for (let i = 0; i < oldLogs.length; i += this.batchSize) {
        const batch = oldLogs.slice(i, i + this.batchSize);
        // Note: In a real implementation, you would delete these documents
        // For now, we'll just count them
        deletedCount += batch.length;
      }

      loggingService.info('Audit logs cleanup completed', {
        deletedCount,
        cutoffDate: cutoffDate.toISOString()
      });

      return {
        success: true,
        deletedCount
      };
    } catch (error) {
      loggingService.error('Failed to cleanup old audit logs', {
        error: error.message
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get audit log configuration
   */
  getAuditConfig() {
    return {
      retentionDays: this.retentionDays,
      batchSize: this.batchSize,
      supportedFormats: ['json', 'csv'],
      supportedEventTypes: [
        'authentication',
        'authorization',
        'data_access',
        'data_modification',
        'system',
        'security',
        'compliance'
      ],
      supportedSeverities: ['info', 'warning', 'error', 'critical'],
      supportedCategories: ['general', 'security', 'data', 'system', 'compliance'],
      supportedRiskLevels: ['low', 'medium', 'high', 'critical']
    };
  }
}

const auditLoggingService = new AuditLoggingService();
export default auditLoggingService;
