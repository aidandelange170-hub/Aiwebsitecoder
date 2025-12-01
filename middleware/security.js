// Security middleware for AI Website Builder
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss');
const validator = require('validator');

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // Limit each IP to 60 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Input validation middleware
const validatePrompt = (req, res, next) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ 
      error: 'Prompt is required',
      message: 'Please provide a website description in the prompt field'
    });
  }

  // Validate prompt length
  if (typeof prompt !== 'string' || prompt.length > 1000) {
    return res.status(400).json({ 
      error: 'Invalid prompt length',
      message: 'Prompt must be a string with maximum 1000 characters'
    });
  }

  // Sanitize prompt input
  req.body.prompt = xss(prompt.trim());

  next();
};

// Sanitize HTML content to prevent XSS
const sanitizeHTML = (html) => {
  if (!html) return html;

  // Remove potentially dangerous tags and attributes
  let sanitized = html;
  
  // Remove script tags and their content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove iframe tags
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  
  // Remove object tags
  sanitized = sanitized.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');
  
  // Remove embed tags
  sanitized = sanitized.replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '');
  
  // Remove form tags
  sanitized = sanitized.replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '');
  
  // Remove dangerous attributes
  sanitized = sanitized.replace(/on\w+="[^"]*"/gi, '');
  sanitized = sanitized.replace(/on\w+='[^']*'/gi, '');
  
  // Remove javascript: and data: URIs from attributes
  sanitized = sanitized.replace(/href\s*=\s*["']javascript:[^"']*/gi, '');
  sanitized = sanitized.replace(/src\s*=\s*["']javascript:[^"']*/gi, '');
  
  return sanitized;
};

// CORS middleware
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In production, you'd want to specify allowed origins
    callback(null, true); // For now, allowing all origins
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error occurred:', err);
  
  // Log the error with more details
  const errorDetails = {
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    error: err.message || 'Internal server error'
  };
  
  console.error('Error details:', errorDetails);
  
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  });
};

module.exports = {
  limiter,
  validatePrompt,
  sanitizeHTML,
  corsOptions,
  errorHandler
};