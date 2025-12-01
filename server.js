const express = require('express');
const path = require('path');
const GitHubScraper = require('./scrap.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Initialize the GitHub scraper
const scraper = new GitHubScraper();

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
        
        // Scrape GitHub for relevant code solutions
        const scrapedResult = await scraper.scrapeForWebsiteSolution(prompt);
        
        // Basic HTML template as fallback
        let htmlContent = scrapedResult.html;
        
        // If no content was found, create a basic template
        if (!htmlContent || htmlContent.trim() === '') {
            htmlContent = generateBasicTemplate(prompt);
        }
        
        // Send the generated HTML back to the client
        res.json({
            html: htmlContent,
            source: scrapedResult.repo || 'generated',
            description: scrapedResult.description
        });
        
    } catch (error) {
        console.error('Error generating website:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Function to generate a basic HTML template if scraping fails
function generateBasicTemplate(prompt) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${prompt}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            line-height: 1.6;
        }
        header {
            background-color: #333;
            color: white;
            padding: 1rem;
            text-align: center;
        }
        main {
            max-width: 800px;
            margin: 20px auto;
            padding: 20px;
        }
        footer {
            text-align: center;
            padding: 20px;
            margin-top: 40px;
            background-color: #f4f4f4;
        }
    </style>
</head>
<body>
    <header>
        <h1>${prompt}</h1>
    </header>
    <main>
        <p>This is a website generated based on your prompt: "${prompt}".</p>
        <p>Add your content here to build your website.</p>
    </main>
    <footer>
        <p>Footer content</p>
    </footer>
</body>
</html>`;
}

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});