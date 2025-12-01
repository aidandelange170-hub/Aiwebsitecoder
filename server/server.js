const express = require('express');
const path = require('path');
const GitHubScraper = require('../src/scrap.js');
const NewFeatures = require('../src/newFeatures.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Initialize the GitHub scraper and new features
const scraper = new GitHubScraper();
const newFeatures = new NewFeatures();

// Route to serve the main HTML page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Route to generate website based on prompt
app.post('/generate', async (req, res) => {
    try {
        const { prompt } = req.body;
        
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }
        
        console.log(`Received prompt: ${prompt}`);
        
        // Use enhanced scraping functionality
        const scrapedResult = await scraper.enhancedScrapeForWebsiteSolution(prompt);
        
        // Basic HTML template as fallback
        let htmlContent = scrapedResult.html;
        
        // If no content was found, create a basic template
        if (!htmlContent || htmlContent.trim() === '') {
            htmlContent = generateBasicTemplate(prompt);
        }
        
        // Sanitize the HTML content to prevent XSS
        htmlContent = sanitizeHTML(htmlContent);
        
        // Apply new features based on request options
        const featureOptions = req.body.features || {};
        htmlContent = await newFeatures.applyAllNewFeatures(htmlContent, prompt, featureOptions);
        
        // Send the generated HTML back to the client
        res.json({
            html: htmlContent,
            source: scrapedResult.repo || 'generated',
            description: scrapedResult.description,
            queryUsed: scrapedResult.queryUsed || 'none',
            analysis: scraper.analyzePrompt(prompt),
            enhanced: true
        });
        
    } catch (error) {
        console.error('Error generating website:', error);
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
});

// Route to analyze prompt without generating
app.post('/analyze', async (req, res) => {
    try {
        const { prompt } = req.body;
        
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }
        
        const analysis = scraper.analyzePrompt(prompt);
        const searchQueries = scraper.generateSearchQueries(prompt);
        
        res.json({
            analysis: analysis,
            searchQueries: searchQueries
        });
        
    } catch (error) {
        console.error('Error analyzing prompt:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Route to get scraping status/progress
app.get('/status', (req, res) => {
    res.json({
        status: 'running',
        features: [
            'GitHub code scraping',
            'HTML/CSS/JS extraction',
            'Prompt analysis',
            'Responsive templates',
            'Real-time preview',
            'Code optimization',
            'Modern CSS frameworks (Tailwind, Bootstrap, Bulma)',
            'Performance optimizations',
            'Accessibility enhancements',
            'Dark mode support',
            'Modern JavaScript features',
            'SEO enhancements'
        ],
        endpoints: [
            'GET /',
            'POST /generate',
            'POST /analyze',
            'POST /enhance',
            'GET /features',
            'GET /status'
        ]
    });
});

// Route to enhance existing HTML with new features
app.post('/enhance', async (req, res) => {
    try {
        const { html, prompt, features } = req.body;
        
        if (!html) {
            return res.status(400).json({ error: 'HTML content is required' });
        }
        
        const featureOptions = features || {};
        const enhancedHtml = await newFeatures.applyAllNewFeatures(html, prompt || 'Generated Website', featureOptions);
        
        res.json({
            html: enhancedHtml,
            enhanced: true
        });
        
    } catch (error) {
        console.error('Error enhancing HTML:', error);
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
});

// Route to get available new features
app.get('/features', (req, res) => {
    res.json({
        status: 'active',
        features: [
            'Code optimization',
            'Component extraction',
            'Modern CSS frameworks (Tailwind, Bootstrap, Bulma)',
            'Responsive design enhancement',
            'Performance optimizations',
            'Accessibility enhancements',
            'Dark mode support',
            'Modern JavaScript features',
            'SEO enhancements'
        ],
        endpoints: [
            'GET /',
            'POST /generate',
            'POST /analyze',
            'POST /enhance',
            'GET /features',
            'GET /status'
        ]
    });
});

// Function to sanitize HTML and prevent XSS
function sanitizeHTML(html) {
    if (!html) return html;
    
    // Remove potentially dangerous tags and attributes
    html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    html = html.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
    html = html.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');
    html = html.replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '');
    html = html.replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '');
    
    // Remove dangerous attributes
    html = html.replace(/on\w+="[^"]*"/gi, '');
    html = html.replace(/on\w+='[^']*'/gi, '');
    
    return html;
}

// Function to generate a basic HTML template if scraping fails
function generateBasicTemplate(prompt) {
    const analysis = scraper.analyzePrompt(prompt);
    
    // Generate template based on analysis
    let template = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">`;
    
    // Add responsive meta tag if responsive feature is detected
    if (analysis.features.includes('responsive')) {
        template += `
    <meta name="viewport" content="width=device-width, initial-scale=1.0">`;
    }
    
    template += `
    <title>${prompt}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;`;
    
    // Add responsive styles if needed
    if (analysis.features.includes('responsive')) {
        template += `
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;`;
    } else {
        template += `
            padding: 20px;`;
    }
    
    template += `
        }`;
    
    // Add navigation styles if needed
    if (analysis.features.includes('navigation')) {
        template += `
        
        nav {
            background-color: #333;
            padding: 1rem;
            margin-bottom: 20px;
        }
        
        nav ul {
            list-style: none;
            display: flex;
        }
        
        nav li {
            margin-right: 20px;
        }
        
        nav a {
            color: white;
            text-decoration: none;
        }`;
    }
    
    // Add header styles if needed
    if (analysis.features.includes('header')) {
        template += `
        
        header {
            background-color: #f4f4f4;
            padding: 1rem;
            text-align: center;
            margin-bottom: 20px;
        }`;
    }
    
    // Add footer styles if needed
    if (analysis.features.includes('footer')) {
        template += `
        
        footer {
            background-color: #f4f4f4;
            padding: 1rem;
            text-align: center;
            margin-top: 40px;
        }`;
    }
    
    template += `
    </style>
</head>
<body>`;

    // Add navigation if needed
    if (analysis.features.includes('navigation')) {
        template += `
    <nav>
        <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#services">Services</a></li>
            <li><a href="#contact">Contact</a></li>
        </ul>
    </nav>`;
    }
    
    // Add header if needed
    if (analysis.features.includes('header')) {
        template += `
    <header>
        <h1>${prompt}</h1>
    </header>`;
    }
    
    template += `
    <main>
        <section id="home">
            <h2>Welcome to ${prompt}</h2>
            <p>This is a website generated based on your prompt: "${prompt}".</p>
            <p>Add your content here to build your website.</p>`;
    
    // Add gallery if needed
    if (analysis.features.includes('gallery')) {
        template += `
            <section id="gallery">
                <h3>Gallery</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px;">
                    <div style="background-color: #eee; height: 150px; display: flex; align-items: center; justify-content: center;">Image 1</div>
                    <div style="background-color: #eee; height: 150px; display: flex; align-items: center; justify-content: center;">Image 2</div>
                    <div style="background-color: #eee; height: 150px; display: flex; align-items: center; justify-content: center;">Image 3</div>
                    <div style="background-color: #eee; height: 150px; display: flex; align-items: center; justify-content: center;">Image 4</div>
                </div>
            </section>`;
    }
    
    // Add contact form if needed
    if (analysis.features.includes('contact_form')) {
        template += `
            <section id="contact">
                <h3>Contact Us</h3>
                <form style="max-width: 500px; margin: 20px 0;">
                    <div style="margin-bottom: 15px;">
                        <label for="name" style="display: block; margin-bottom: 5px;">Name:</label>
                        <input type="text" id="name" name="name" style="width: 100%; padding: 8px;">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label for="email" style="display: block; margin-bottom: 5px;">Email:</label>
                        <input type="email" id="email" name="email" style="width: 100%; padding: 8px;">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label for="message" style="display: block; margin-bottom: 5px;">Message:</label>
                        <textarea id="message" name="message" rows="4" style="width: 100%; padding: 8px;"></textarea>
                    </div>
                    <button type="submit" style="background-color: #333; color: white; padding: 10px 20px; border: none; cursor: pointer;">Send</button>
                </form>
            </section>`;
    }
    
    template += `
        </section>
    </main>`;
    
    // Add footer if needed
    if (analysis.features.includes('footer')) {
        template += `
    <footer>
        <p>&copy; 2023 ${prompt}. All rights reserved.</p>
    </footer>`;
    }
    
    template += `
</body>
</html>`;
    
    return template;
}

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Visit http://localhost:${PORT} to use the AI Website Builder`);
});