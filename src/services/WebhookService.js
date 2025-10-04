class WebhookService {
  constructor() {
    this.webhooks = new Map();
    this.retryAttempts = 3;
    this.retryDelay = 1000; // 1 second
  }

  // Register a webhook
  registerWebhook(name, url, events, options = {}) {
    const webhook = {
      name,
      url,
      events: Array.isArray(events) ? events : [events],
      options: {
        retryAttempts: this.retryAttempts,
        retryDelay: this.retryDelay,
        timeout: 5000,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'HomeHub-Webhook/1.0',
        },
        ...options,
      },
      isActive: true,
      createdAt: Date.now(),
      lastTriggered: null,
      successCount: 0,
      failureCount: 0,
    };

    this.webhooks.set(name, webhook);
    return webhook;
  }

  // Unregister a webhook
  unregisterWebhook(name) {
    return this.webhooks.delete(name);
  }

  // Get webhook by name
  getWebhook(name) {
    return this.webhooks.get(name);
  }

  // Get all webhooks
  getAllWebhooks() {
    return Array.from(this.webhooks.values());
  }

  // Get webhooks by event
  getWebhooksByEvent(event) {
    return Array.from(this.webhooks.values()).filter(
      webhook => webhook.isActive && webhook.events.includes(event)
    );
  }

  // Trigger webhook
  async triggerWebhook(name, data, event) {
    const webhook = this.getWebhook(name);
    if (!webhook || !webhook.isActive) {
      throw new Error(`Webhook ${name} not found or inactive`);
    }

    if (!webhook.events.includes(event)) {
      throw new Error(`Webhook ${name} does not handle event ${event}`);
    }

    const payload = {
      event,
      data,
      timestamp: new Date().toISOString(),
      webhook: {
        name: webhook.name,
        url: webhook.url,
      },
    };

    return this.sendWebhook(webhook, payload);
  }

  // Send webhook with retry logic
  async sendWebhook(webhook, payload) {
    let lastError;
    
    for (let attempt = 1; attempt <= webhook.options.retryAttempts; attempt++) {
      try {
        const response = await fetch(webhook.url, {
          method: 'POST',
          headers: webhook.options.headers,
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(webhook.options.timeout),
        });

        if (response.ok) {
          webhook.lastTriggered = Date.now();
          webhook.successCount++;
          return {
            success: true,
            response: await response.json(),
            attempt,
          };
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        lastError = error;
        
        if (attempt < webhook.options.retryAttempts) {
          await this.delay(webhook.options.retryDelay * attempt);
        }
      }
    }

    webhook.failureCount++;
    throw new Error(`Webhook failed after ${webhook.options.retryAttempts} attempts: ${lastError.message}`);
  }

  // Delay utility
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Trigger webhooks for specific event
  async triggerEvent(event, data) {
    const webhooks = this.getWebhooksByEvent(event);
    const results = [];

    for (const webhook of webhooks) {
      try {
        const result = await this.triggerWebhook(webhook.name, data, event);
        results.push({
          webhook: webhook.name,
          success: true,
          result,
        });
      } catch (error) {
        results.push({
          webhook: webhook.name,
          success: false,
          error: error.message,
        });
      }
    }

    return results;
  }

  // Test webhook
  async testWebhook(name) {
    const webhook = this.getWebhook(name);
    if (!webhook) {
      throw new Error(`Webhook ${name} not found`);
    }

    const testData = {
      test: true,
      message: 'This is a test webhook from Home Hub',
      timestamp: new Date().toISOString(),
    };

    return this.triggerWebhook(name, testData, 'test');
  }

  // Update webhook
  updateWebhook(name, updates) {
    const webhook = this.getWebhook(name);
    if (!webhook) {
      throw new Error(`Webhook ${name} not found`);
    }

    Object.assign(webhook, updates);
    webhook.updatedAt = Date.now();
    
    return webhook;
  }

  // Enable/disable webhook
  toggleWebhook(name, isActive) {
    const webhook = this.getWebhook(name);
    if (!webhook) {
      throw new Error(`Webhook ${name} not found`);
    }

    webhook.isActive = isActive;
    webhook.updatedAt = Date.now();
    
    return webhook;
  }

  // Get webhook statistics
  getWebhookStats(name) {
    const webhook = this.getWebhook(name);
    if (!webhook) {
      throw new Error(`Webhook ${name} not found`);
    }

    return {
      name: webhook.name,
      isActive: webhook.isActive,
      successCount: webhook.successCount,
      failureCount: webhook.failureCount,
      successRate: webhook.successCount + webhook.failureCount > 0 
        ? (webhook.successCount / (webhook.successCount + webhook.failureCount)) * 100 
        : 0,
      lastTriggered: webhook.lastTriggered,
      createdAt: webhook.createdAt,
    };
  }

  // Get all webhook statistics
  getAllWebhookStats() {
    return Array.from(this.webhooks.keys()).map(name => this.getWebhookStats(name));
  }

  // Clear webhook statistics
  clearWebhookStats(name) {
    const webhook = this.getWebhook(name);
    if (!webhook) {
      throw new Error(`Webhook ${name} not found`);
    }

    webhook.successCount = 0;
    webhook.failureCount = 0;
    webhook.lastTriggered = null;
    
    return webhook;
  }

  // Export webhooks configuration
  exportWebhooks() {
    const webhooks = Array.from(this.webhooks.values()).map(webhook => ({
      name: webhook.name,
      url: webhook.url,
      events: webhook.events,
      options: webhook.options,
    }));

    return JSON.stringify(webhooks, null, 2);
  }

  // Import webhooks configuration
  importWebhooks(config) {
    try {
      const webhooks = JSON.parse(config);
      
      webhooks.forEach(webhookConfig => {
        this.registerWebhook(
          webhookConfig.name,
          webhookConfig.url,
          webhookConfig.events,
          webhookConfig.options
        );
      });

      return webhooks.length;
    } catch (error) {
      throw new Error(`Failed to import webhooks: ${error.message}`);
    }
  }

  // Validate webhook URL
  validateWebhookUrl(url) {
    try {
      const urlObj = new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Get webhook health status
  async getWebhookHealth(name) {
    const webhook = this.getWebhook(name);
    if (!webhook) {
      throw new Error(`Webhook ${name} not found`);
    }

    try {
      const response = await fetch(webhook.url, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000),
      });

      return {
        name: webhook.name,
        url: webhook.url,
        isHealthy: response.ok,
        status: response.status,
        responseTime: Date.now(),
      };
    } catch (error) {
      return {
        name: webhook.name,
        url: webhook.url,
        isHealthy: false,
        error: error.message,
        responseTime: Date.now(),
      };
    }
  }

  // Get all webhook health statuses
  async getAllWebhookHealth() {
    const webhooks = this.getAllWebhooks();
    const healthChecks = await Promise.allSettled(
      webhooks.map(webhook => this.getWebhookHealth(webhook.name))
    );

    return healthChecks.map((result, index) => 
      result.status === 'fulfilled' 
        ? result.value 
        : {
            name: webhooks[index].name,
            url: webhooks[index].url,
            isHealthy: false,
            error: result.reason?.message || 'Unknown error',
            responseTime: Date.now(),
          }
    );
  }
}

export default new WebhookService();
