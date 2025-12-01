// Configuration file for AI Website Builder
module.exports = {
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost',
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true
    }
  },
  github: {
    apiBase: 'https://api.github.com',
    rateLimitDelay: process.env.GITHUB_RATE_LIMIT_DELAY || 1000, // Delay between requests in ms
    maxRetries: 3,
    timeout: 10000, // 10 seconds timeout
    search: {
      perPage: 10,
      maxPerPage: 30,
      sort: 'stars',
      order: 'desc'
    }
  },
  security: {
    allowedOrigins: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['*'],
    xssProtection: true,
    hsts: true,
    contentTypeOptions: true
  },
  features: {
    enableCaching: process.env.ENABLE_CACHING !== 'false',
    cacheTTL: parseInt(process.env.CACHE_TTL) || 3600, // 1 hour in seconds
    maxPromptLength: parseInt(process.env.MAX_PROMPT_LENGTH) || 1000,
    enableRateLimiting: process.env.ENABLE_RATE_LIMITING !== 'false',
    maxRequestsPerMinute: parseInt(process.env.MAX_REQUESTS_PER_MINUTE) || 60
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined',
    file: process.env.LOG_FILE || './logs/app.log'
  }
};