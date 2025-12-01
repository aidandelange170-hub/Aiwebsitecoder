// Newer features for the AI Website Builder
const GitHubScraper = require('./scrap.js');
const fs = require('fs').promises;
const path = require('path');

class NewFeatures {
    constructor() {
        this.scraper = new GitHubScraper();
    }

    // Feature 1: AI-powered code optimization
    async optimizeCode(htmlContent) {
        console.log('Optimizing HTML/CSS/JS code...');
        
        // Basic optimization: remove unnecessary whitespace, minify CSS, etc.
        let optimized = htmlContent;
        
        // Remove extra whitespace
        optimized = optimized.replace(/\s+/g, ' ');
        
        // Optimize CSS if present
        optimized = optimized.replace(/<style>([\s\S]*?)<\/style>/gi, (match, css) => {
            const optimizedCSS = this.optimizeCSS(css);
            return `<style>${optimizedCSS}</style>`;
        });
        
        // Optimize JS if present
        optimized = optimized.replace(/<script>([\s\S]*?)<\/script>/gi, (match, js) => {
            const optimizedJS = this.optimizeJS(js);
            return `<script>${optimizedJS}</script>`;
        });
        
        return optimized;
    }

    optimizeCSS(css) {
        // Remove comments
        css = css.replace(/\/\*[\s\S]*?\*\//g, '');
        // Remove whitespace
        css = css.replace(/\s+/g, ' ').trim();
        // Remove unnecessary spaces around braces and colons
        css = css.replace(/\s*{\s*/g, '{').replace(/\s*;\s*/g, ';').replace(/\s*:\s*/g, ':');
        return css;
    }

    optimizeJS(js) {
        // Basic JS optimization - remove comments and extra whitespace
        try {
            // Remove single line comments
            js = js.replace(/\/\/.*$/gm, '');
            // Remove multi-line comments
            js = js.replace(/\/\*[\s\S]*?\*\//g, '');
            // Remove extra whitespace
            js = js.replace(/\s+/g, ' ').trim();
            return js;
        } catch (e) {
            console.error('Error optimizing JS:', e);
            return js; // Return original if optimization fails
        }
    }

    // Feature 2: Component-based architecture
    async extractComponents(htmlContent) {
        console.log('Extracting components from HTML...');
        
        const components = {
            header: this.extractSection(htmlContent, ['header', 'navbar', 'navigation']),
            footer: this.extractSection(htmlContent, ['footer']),
            sidebar: this.extractSection(htmlContent, ['sidebar', 'aside']),
            main: this.extractSection(htmlContent, ['main', 'content', 'container']),
            sections: this.extractSections(htmlContent)
        };
        
        return components;
    }

    extractSection(html, tags) {
        for (const tag of tags) {
            const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
            const match = html.match(regex);
            if (match) {
                return match[0];
            }
        }
        return null;
    }

    extractSections(html) {
        const sectionRegex = /<(section|div)[^>]*class="[^"]*section[^"]*"[^>]*>([\s\S]*?)<\/\1>/gi;
        const sections = [];
        let match;
        
        while ((match = sectionRegex.exec(html)) !== null) {
            sections.push({
                tag: match[1],
                content: match[0],
                index: match.index
            });
        }
        
        return sections;
    }

    // Feature 3: Modern CSS frameworks integration
    async addModernCSSFramework(htmlContent, framework = 'tailwind') {
        console.log(`Adding ${framework} CSS framework...`);
        
        switch (framework) {
            case 'tailwind':
                return this.addTailwindCSS(htmlContent);
            case 'bootstrap':
                return this.addBootstrapCSS(htmlContent);
            case 'bulma':
                return this.addBulmaCSS(htmlContent);
            default:
                return htmlContent;
        }
    }

    addTailwindCSS(htmlContent) {
        const tailwindCDN = '<link href="https://cdn.tailwindcss.com" rel="stylesheet">';
        
        if (htmlContent.includes('<head>')) {
            return htmlContent.replace('<head>', `<head>\n    ${tailwindCDN}`);
        } else {
            const htmlTag = htmlContent.match(/<html[^>]*>/i);
            if (htmlTag) {
                return htmlContent.replace(htmlTag[0], `${htmlTag[0]}\n  <head>\n    ${tailwindCDN}\n  </head>`);
            }
        }
        
        return htmlContent;
    }

    addBootstrapCSS(htmlContent) {
        const bootstrapCDN = '<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">';
        const bootstrapJS = '<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>';
        
        if (htmlContent.includes('<head>')) {
            htmlContent = htmlContent.replace('<head>', `<head>\n    ${bootstrapCDN}`);
        }
        
        if (htmlContent.includes('</body>')) {
            htmlContent = htmlContent.replace('</body>', `    ${bootstrapJS}\n  </body>`);
        }
        
        return htmlContent;
    }

    addBulmaCSS(htmlContent) {
        const bulmaCDN = '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css">';
        
        if (htmlContent.includes('<head>')) {
            return htmlContent.replace('<head>', `<head>\n    ${bulmaCDN}`);
        } else {
            const htmlTag = htmlContent.match(/<html[^>]*>/i);
            if (htmlTag) {
                return htmlContent.replace(htmlTag[0], `${htmlTag[0]}\n  <head>\n    ${bulmaCDN}\n  </head>`);
            }
        }
        
        return htmlContent;
    }

    // Feature 4: Responsive design enhancement
    async enhanceResponsiveness(htmlContent) {
        console.log('Enhancing responsive design...');
        
        // Add viewport meta tag if not present
        if (!htmlContent.includes('viewport')) {
            const metaTag = '<meta name="viewport" content="width=device-width, initial-scale=1.0">';
            if (htmlContent.includes('<head>')) {
                htmlContent = htmlContent.replace('<head>', `<head>\n    ${metaTag}`);
            }
        }
        
        // Add responsive CSS if not present
        const responsiveCSS = `
            <style>
            /* Responsive design enhancements */
            @media (max-width: 768px) {
                * {
                    box-sizing: border-box;
                }
                body {
                    padding: 10px;
                }
                img {
                    max-width: 100%;
                    height: auto;
                }
                .container {
                    width: 100%;
                    padding: 0 10px;
                }
            }
            </style>`;
        
        if (htmlContent.includes('</head>')) {
            htmlContent = htmlContent.replace('</head>', `  ${responsiveCSS}\n</head>`);
        } else {
            htmlContent += responsiveCSS;
        }
        
        return htmlContent;
    }

    // Feature 5: Performance optimization
    async addPerformanceOptimizations(htmlContent) {
        console.log('Adding performance optimizations...');
        
        // Add performance-related meta tags and scripts
        const performanceTags = `
    <!-- Performance optimizations -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <script>
      // Lazy loading for images
      document.addEventListener("DOMContentLoaded", function() {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target;
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
              imageObserver.unobserve(img);
            }
          });
        });
        
        images.forEach(img => imageObserver.observe(img));
      });
    </script>`;
        
        if (htmlContent.includes('</head>')) {
            htmlContent = htmlContent.replace('</head>', `${performanceTags}\n</head>`);
        }
        
        return htmlContent;
    }

    // Feature 6: Accessibility enhancements
    async addAccessibilityFeatures(htmlContent) {
        console.log('Adding accessibility features...');
        
        // Add accessibility attributes
        htmlContent = htmlContent.replace(/<img([^>]*)>/g, (match, attrs) => {
            if (!attrs.includes('alt=')) {
                return match.replace('<img', '<img alt="image description"');
            }
            return match;
        });
        
        // Add ARIA labels and roles
        htmlContent = htmlContent.replace(/<nav([^>]*)>/g, '<nav$1 role="navigation">');
        htmlContent = htmlContent.replace(/<main([^>]*)>/g, '<main$1 role="main">');
        htmlContent = htmlContent.replace(/<footer([^>]*)>/g, '<footer$1 role="contentinfo">');
        htmlContent = htmlContent.replace(/<header([^>]*)>/g, '<header$1 role="banner">');
        
        // Add skip navigation link
        if (htmlContent.includes('<body>')) {
            htmlContent = htmlContent.replace('<body>', `<body>\n  <a href="#main-content" class="skip-link">Skip to main content</a>`);
        }
        
        return htmlContent;
    }

    // Feature 7: Dark mode support
    async addDarkMode(htmlContent) {
        console.log('Adding dark mode support...');
        
        const darkModeScript = `
    <style>
      /* Dark mode styles */
      [data-theme="dark"] {
        background-color: #1a1a1a !important;
        color: #e0e0e0 !important;
      }
      
      [data-theme="dark"] a {
        color: #64b5f6 !important;
      }
      
      [data-theme="dark"] img {
        filter: brightness(0.8);
      }
    </style>
    
    <script>
      // Dark mode toggle functionality
      function initDarkMode() {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
          document.documentElement.setAttribute('data-theme', 'dark');
        }
        
        // Add toggle button if not present
        if (!document.querySelector('#dark-mode-toggle')) {
          const toggleBtn = document.createElement('button');
          toggleBtn.id = 'dark-mode-toggle';
          toggleBtn.innerHTML = '🌙';
          toggleBtn.style.position = 'fixed';
          toggleBtn.style.top = '20px';
          toggleBtn.style.right = '20px';
          toggleBtn.style.zIndex = '9999';
          toggleBtn.style.padding = '10px';
          toggleBtn.style.border = 'none';
          toggleBtn.style.borderRadius = '50%';
          toggleBtn.style.background = '#f0f0f0';
          toggleBtn.style.cursor = 'pointer';
          
          toggleBtn.onclick = function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
          };
          
          document.body.appendChild(toggleBtn);
        }
      }
      
      // Initialize when DOM is loaded
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDarkMode);
      } else {
        initDarkMode();
      }
    </script>`;
        
        if (htmlContent.includes('</head>')) {
            htmlContent = htmlContent.replace('</head>', `${darkModeScript}\n</head>`);
        } else {
            htmlContent += darkModeScript;
        }
        
        return htmlContent;
    }

    // Feature 8: Modern JavaScript enhancements
    async addModernJSFeatures(htmlContent) {
        console.log('Adding modern JavaScript features...');
        
        const modernJSScript = `
    <script>
      // Modern JavaScript features
      (function() {
        'use strict';
        
        // Smooth scrolling
        if ('scrollBehavior' in document.documentElement.style) {
          document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
              e.preventDefault();
              const target = document.querySelector(this.getAttribute('href'));
              if (target) {
                target.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start'
                });
              }
            });
          });
        }
        
        // Intersection Observer for animations
        if ('IntersectionObserver' in window) {
          const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
          };
          
          const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target);
              }
            });
          }, observerOptions);
          
          // Observe elements with 'animate-on-scroll' class
          document.querySelectorAll('.animate-on-scroll').forEach(el => {
            observer.observe(el);
          });
        }
        
        // Form validation
        document.querySelectorAll('form').forEach(form => {
          form.addEventListener('submit', function(e) {
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
              if (!field.value.trim()) {
                field.classList.add('error');
                isValid = false;
              } else {
                field.classList.remove('error');
              }
            });
            
            if (!isValid) {
              e.preventDefault();
              alert('Please fill in all required fields.');
            }
          });
        });
      })();
    </script>`;
        
        if (htmlContent.includes('</body>')) {
            htmlContent = htmlContent.replace('</body>', `  ${modernJSScript}\n</body>`);
        } else {
            htmlContent += modernJSScript;
        }
        
        return htmlContent;
    }

    // Feature 9: SEO enhancements
    async addSEOFeatures(htmlContent, prompt) {
        console.log('Adding SEO features...');
        
        const analysis = this.scraper.analyzePrompt(prompt);
        const title = prompt || 'Generated Website';
        
        const seoMeta = `
    <!-- SEO Meta Tags -->
    <title>${title}</title>
    <meta name="description" content="A website generated based on the prompt: ${prompt}">
    <meta name="keywords" content="${analysis.type}, ${analysis.features.join(', ')}, website, generator">
    <meta name="robots" content="index, follow">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="A website generated based on the prompt: ${prompt}">
    <meta property="og:type" content="website">
    <link rel="canonical" href="${typeof window !== 'undefined' ? window.location.href : ''}">`;
        
        if (htmlContent.includes('<head>')) {
            htmlContent = htmlContent.replace('<head>', `<head>\n    ${seoMeta}`);
        } else {
            const htmlTag = htmlContent.match(/<html[^>]*>/i);
            if (htmlTag) {
                return htmlContent.replace(htmlTag[0], `${htmlTag[0]}\n  <head>\n    ${seoMeta}\n  </head>`);
            }
        }
        
        return htmlContent;
    }

    // Combined function to apply all new features
    async applyAllNewFeatures(htmlContent, prompt, options = {}) {
        console.log('Applying all new features...');
        
        let enhancedContent = htmlContent;
        
        // Apply features based on options
        if (options.optimizeCode !== false) {
            enhancedContent = await this.optimizeCode(enhancedContent);
        }
        
        if (options.responsive !== false) {
            enhancedContent = await this.enhanceResponsiveness(enhancedContent);
        }
        
        if (options.accessibility !== false) {
            enhancedContent = await this.addAccessibilityFeatures(enhancedContent);
        }
        
        if (options.darkMode !== false) {
            enhancedContent = await this.addDarkMode(enhancedContent);
        }
        
        if (options.modernJS !== false) {
            enhancedContent = await this.addModernJSFeatures(enhancedContent);
        }
        
        if (options.performance !== false) {
            enhancedContent = await this.addPerformanceOptimizations(enhancedContent);
        }
        
        if (options.seo !== false) {
            enhancedContent = await this.addSEOFeatures(enhancedContent, prompt);
        }
        
        if (options.cssFramework) {
            enhancedContent = await this.addModernCSSFramework(enhancedContent, options.cssFramework);
        }
        
        return enhancedContent;
    }
}

module.exports = NewFeatures;