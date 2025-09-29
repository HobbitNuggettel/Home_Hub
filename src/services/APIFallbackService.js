/**
 * API Fallback Service
 * Provides robust fallback mechanisms for all API calls
 * with automatic retry, circuit breaking, and comprehensive logging
 */

class APIFallbackService {
  constructor() {
    this.retryConfig = {
      maxRetries: 3,
      initialDelay: 1000, // 1 second
      maxDelay: 10000,    // 10 seconds
      backoffMultiplier: 2
    };

    this.circuitBreaker = {
      failures: 0,
      threshold: 5,
      timeout: 60000, // 1 minute
      state: 'CLOSED', // CLOSED, OPEN, HALF_OPEN
      lastFailTime: null
    };

    this.logs = [];
    this.maxLogs = 100;
  }

  /**
   * Log API activity
   */
  log(level, message, data = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      id: Date.now() + Math.random()
    };

    this.logs.unshift(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Console output with color coding
    const emoji = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      retry: '🔄'
    }[level] || '📝';

    console.log(`${emoji} [API Fallback] ${message}`, data);

    return logEntry;
  }

  /**
   * Get recent logs
   */
  getLogs(limit = 50, level = null) {
    let filtered = this.logs;
    if (level) {
      filtered = this.logs.filter(log => log.level === level);
    }
    return filtered.slice(0, limit);
  }

  /**
   * Clear logs
   */
  clearLogs() {
    this.logs = [];
    this.log('info', 'Logs cleared');
  }

  /**
   * Check circuit breaker state
   */
  checkCircuitBreaker(service) {
    const breaker = this.circuitBreaker;

    // If circuit is OPEN, check if timeout has passed
    if (breaker.state === 'OPEN') {
      const timeSinceLastFail = Date.now() - breaker.lastFailTime;
      if (timeSinceLastFail >= breaker.timeout) {
        this.log('info', `Circuit breaker entering HALF_OPEN state for ${service}`);
        breaker.state = 'HALF_OPEN';
        return true;
      }
      this.log('warning', `Circuit breaker OPEN for ${service}, rejecting request`);
      return false;
    }

    return true;
  }

  /**
   * Record API success
   */
  recordSuccess(service) {
    const breaker = this.circuitBreaker;
    
    if (breaker.state === 'HALF_OPEN') {
      this.log('success', `Circuit breaker CLOSED for ${service}`);
      breaker.state = 'CLOSED';
    }
    
    breaker.failures = 0;
  }

  /**
   * Record API failure
   */
  recordFailure(service, error) {
    const breaker = this.circuitBreaker;
    breaker.failures++;
    breaker.lastFailTime = Date.now();

    this.log('error', `API failure for ${service}`, {
      error: error.message,
      failures: breaker.failures,
      threshold: breaker.threshold
    });

    if (breaker.failures >= breaker.threshold && breaker.state === 'CLOSED') {
      breaker.state = 'OPEN';
      this.log('warning', `Circuit breaker OPEN for ${service}`);
    }
  }

  /**
   * Calculate delay for exponential backoff
   */
  calculateDelay(attempt) {
    const delay = Math.min(
      this.retryConfig.initialDelay * Math.pow(this.retryConfig.backoffMultiplier, attempt),
      this.retryConfig.maxDelay
    );
    return delay;
  }

  /**
   * Sleep for specified milliseconds
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Execute API call with fallbacks
   * @param {Object} config - Configuration object
   * @param {Array} config.providers - Array of provider functions
   * @param {string} config.service - Service name for logging
   * @param {Object} config.params - Parameters to pass to providers
   * @param {boolean} config.enableRetry - Enable retry logic
   * @param {boolean} config.enableCircuitBreaker - Enable circuit breaker
   */
  async executeWithFallback(config) {
    const {
      providers = [],
      service = 'Unknown',
      params = {},
      enableRetry = true,
      enableCircuitBreaker = true
    } = config;

    if (!providers || providers.length === 0) {
      throw new Error('No providers specified');
    }

    // Check circuit breaker
    if (enableCircuitBreaker && !this.checkCircuitBreaker(service)) {
      throw new Error(`Circuit breaker OPEN for ${service}`);
    }

    this.log('info', `Starting ${service} request`, {
      providers: providers.length,
      retryEnabled: enableRetry
    });

    let lastError = null;
    let providerIndex = 0;

    // Try each provider
    for (const provider of providers) {
      const providerName = provider.name || `Provider ${providerIndex + 1}`;
      let attempt = 0;
      const maxAttempts = enableRetry ? this.retryConfig.maxRetries : 1;

      // Retry logic for current provider
      while (attempt < maxAttempts) {
        try {
          this.log('info', `Trying ${providerName} (attempt ${attempt + 1}/${maxAttempts})`);

          const result = await provider(params);

          // Success!
          this.recordSuccess(service);
          this.log('success', `${providerName} succeeded`, {
            provider: providerName,
            attempt: attempt + 1
          });

          return {
            success: true,
            data: result,
            provider: providerName,
            attempts: attempt + 1,
            logs: this.getLogs(10)
          };

        } catch (error) {
          lastError = error;
          attempt++;

          this.log('error', `${providerName} failed`, {
            error: error.message,
            attempt,
            maxAttempts
          });

          // If we have more attempts, wait before retrying
          if (attempt < maxAttempts) {
            const delay = this.calculateDelay(attempt - 1);
            this.log('retry', `Retrying ${providerName} in ${delay}ms`);
            await this.sleep(delay);
          }
        }
      }

      providerIndex++;
      this.log('warning', `${providerName} exhausted all attempts, trying next provider`);
    }

    // All providers failed
    this.recordFailure(service, lastError);
    this.log('error', `All providers failed for ${service}`, {
      totalProviders: providers.length,
      lastError: lastError?.message
    });

    return {
      success: false,
      error: lastError?.message || 'All providers failed',
      attempts: this.retryConfig.maxRetries * providers.length,
      logs: this.getLogs(20)
    };
  }

  /**
   * Reset circuit breaker
   */
  resetCircuitBreaker() {
    this.circuitBreaker.failures = 0;
    this.circuitBreaker.state = 'CLOSED';
    this.circuitBreaker.lastFailTime = null;
    this.log('info', 'Circuit breaker reset');
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      circuitBreaker: {
        state: this.circuitBreaker.state,
        failures: this.circuitBreaker.failures,
        threshold: this.circuitBreaker.threshold
      },
      retryConfig: this.retryConfig,
      recentLogs: this.getLogs(10),
      totalLogs: this.logs.length
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config) {
    if (config.maxRetries) this.retryConfig.maxRetries = config.maxRetries;
    if (config.initialDelay) this.retryConfig.initialDelay = config.initialDelay;
    if (config.maxDelay) this.retryConfig.maxDelay = config.maxDelay;
    if (config.circuitBreakerThreshold) this.circuitBreaker.threshold = config.circuitBreakerThreshold;

    this.log('info', 'Configuration updated', config);
  }
}

// Create singleton instance
export const apiFallbackService = new APIFallbackService();

// Export class for testing
export default APIFallbackService;
