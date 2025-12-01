// HTML processing utilities for AI Website Builder

// Sanitize HTML content to prevent XSS
function sanitizeHTML(html) {
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
}

// Optimize HTML by minifying it
function minifyHTML(html) {
    if (!html) return html;
    
    return html
        // Remove extra whitespace
        .replace(/\s+/g, ' ')
        // Remove comments
        .replace(/<!--[\s\S]*?-->/g, '')
        // Remove whitespace around tags
        .replace(/\s*(<[^>]+>)\s*/g, '$1')
        // Trim the result
        .trim();
}

// Extract specific elements from HTML
function extractElements(html, selector) {
    if (!html || !selector) return [];
    
    // Simple regex-based extraction (for server-side without DOM)
    const regex = new RegExp(`<${selector}[^>]*>.*?<\/${selector}>`, 'gi');
    return html.match(regex) || [];
}

// Inject content into HTML at specific locations
function injectContent(html, target, content, position = 'replace') {
    if (!html || !target || !content) return html;
    
    switch (position) {
        case 'before':
            return html.replace(new RegExp(`(<${target}[^>]*>)`, 'gi'), `$1${content}`);
        case 'after':
            return html.replace(new RegExp(`(<\/${target}>)`, 'gi'), `${content}$1`);
        case 'replace':
        default:
            return html.replace(new RegExp(`<${target}[^>]*>.*?<\/${target}>`, 'gi'), content);
    }
}

// Validate HTML structure
function validateHTML(html) {
    if (!html) return false;
    
    // Check for basic HTML structure
    const hasDoctype = /<!DOCTYPE[^>]*>/i.test(html);
    const hasHtmlTag = /<html[^>]*>.*<\/html>/i.test(html);
    const hasHeadTag = /<head[^>]*>.*<\/head>/i.test(html);
    const hasBodyTag = /<body[^>]*>.*<\/body>/i.test(html);
    
    return hasDoctype && hasHtmlTag && hasHeadTag && hasBodyTag;
}

module.exports = {
    sanitizeHTML,
    minifyHTML,
    extractElements,
    injectContent,
    validateHTML
};