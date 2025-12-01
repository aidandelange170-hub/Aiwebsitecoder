// GitHub Scraper for AI Website Builder
const axios = require('axios');
const cheerio = require('cheerio');
const config = require('../config/config.js');

class GitHubScraper {
    constructor() {
        this.searchEndpoints = {
            code: `${config.github.apiBase}/search/code`,
            repos: `${config.github.apiBase}/search/repositories`
        };
        this.rateLimitDelay = config.github.rateLimitDelay; // Delay between requests to respect rate limits
        this.maxRetries = config.github.maxRetries;
        this.timeout = config.github.timeout;
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Enhanced request function with retry logic
    async makeRequest(url, params = {}, headers = {}) {
        const defaultHeaders = {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'AI-Website-Builder'
        };
        
        const requestConfig = {
            method: 'GET',
            url: url,
            params: params,
            headers: { ...defaultHeaders, ...headers },
            timeout: this.timeout
        };

        for (let attempt = 0; attempt < this.maxRetries; attempt++) {
            try {
                const response = await axios(requestConfig);
                return response;
            } catch (error) {
                console.error(`Request attempt ${attempt + 1} failed:`, error.message);
                
                if (attempt === this.maxRetries - 1) {
                    // Last attempt failed
                    throw error;
                }
                
                // Wait before retrying
                await this.delay(this.rateLimitDelay * (attempt + 1));
            }
        }
    }

    async searchCode(query, language = 'html') {
        try {
            // Add rate limiting delay
            await this.delay(this.rateLimitDelay);
            
            const response = await this.makeRequest(this.searchEndpoints.code, {
                q: `${query} language:${language}`,
                sort: config.github.search.sort,
                order: config.github.search.order,
                per_page: config.github.search.perPage
            });

            return response.data.items || [];
        } catch (error) {
            console.error('Error searching GitHub code:', error.message);
            if (error.response && error.response.status === 403) {
                console.error('Rate limit exceeded. Please try again later.');
            }
            return [];
        }
    }

    async searchRepos(query) {
        try {
            // Add rate limiting delay
            await this.delay(this.rateLimitDelay);
            
            const response = await this.makeRequest(this.searchEndpoints.repos, {
                q: query,
                sort: config.github.search.sort,
                order: config.github.search.order,
                per_page: config.github.search.perPage
            });

            return response.data.items || [];
        } catch (error) {
            console.error('Error searching GitHub repos:', error.message);
            if (error.response && error.response.status === 403) {
                console.error('Rate limit exceeded. Please try again later.');
            }
            return [];
        }
    }

    async scrapeCodeContent(downloadUrl) {
        try {
            // Add rate limiting delay
            await this.delay(this.rateLimitDelay);
            
            const response = await axios.get(downloadUrl, { timeout: this.timeout });
            return response.data;
        } catch (error) {
            console.error('Error scraping code content:', error.message);
            return null;
        }
    }

    async extractHTMLFromRepo(repoFullName) {
        try {
            // Get repository contents
            const contentsUrl = `${config.github.apiBase}/repos/${repoFullName}/contents`;
            const response = await this.makeRequest(contentsUrl);

            const contents = response.data;
            let htmlContent = '';

            // Look for HTML, CSS, and JS files in the repository
            for (const item of contents) {
                if (item.type === 'file') {
                    if (item.name.endsWith('.html') || item.name.endsWith('.htm')) {
                        const fileContent = await this.scrapeCodeContent(item.download_url);
                        if (fileContent) {
                            htmlContent += fileContent + '\n\n';
                        }
                    } else if (item.name.endsWith('.css') || item.name.endsWith('.js')) {
                        // Include CSS and JS files in the HTML
                        const fileContent = await this.scrapeCodeContent(item.download_url);
                        if (fileContent) {
                            if (item.name.endsWith('.css')) {
                                htmlContent += `<style>\n${fileContent}\n</style>\n\n`;
                            } else if (item.name.endsWith('.js')) {
                                htmlContent += `<script>\n${fileContent}\n</script>\n\n`;
                            }
                        }
                    }
                } else if (item.type === 'dir') {
                    // Recursively search in subdirectories
                    await this.delay(this.rateLimitDelay); // Rate limiting
                    const subDirContents = await this.makeRequest(item.url);
                    
                    for (const subItem of subDirContents.data) {
                        if (subItem.type === 'file') {
                            if (subItem.name.endsWith('.html') || subItem.name.endsWith('.htm')) {
                                const fileContent = await this.scrapeCodeContent(subItem.download_url);
                                if (fileContent) {
                                    htmlContent += fileContent + '\n\n';
                                }
                            } else if (subItem.name.endsWith('.css') || subItem.name.endsWith('.js')) {
                                // Include CSS and JS files in the HTML
                                const fileContent = await this.scrapeCodeContent(subItem.download_url);
                                if (fileContent) {
                                    if (subItem.name.endsWith('.css')) {
                                        htmlContent += `<style>\n${fileContent}\n</style>\n\n`;
                                    } else if (subItem.name.endsWith('.js')) {
                                        htmlContent += `<script>\n${fileContent}\n</script>\n\n`;
                                    }
                                }
                            }
                        }
                    }
                }
            }

            return htmlContent;
        } catch (error) {
            console.error('Error extracting HTML from repo:', error.message);
            return '';
        }
    }

    // Enhanced function to process and clean scraped content
    processScrapedContent(content) {
        if (!content) return content;
        
        // Remove common GitHub-specific elements that shouldn't be in the final HTML
        content = content.replace(/<div class="highlight">[\s\S]*?<\/div>/g, '');
        content = content.replace(/<div class="file-wrap">[\s\S]*?<\/div>/g, '');
        
        // Remove common comments
        content = content.replace(/<!-- GitHub specific comment[\s\S]*?-->/g, '');
        
        // Clean up any remaining GitHub-specific URLs
        content = content.replace(/https:\/\/github\.com\/[^"'\s]+/g, '');
        
        // Remove any remaining GitHub UI elements
        content = content.replace(/<div class="[^"]*Box[^"]*">[\s\S]*?<\/div>/g, '');
        content = content.replace(/<div class="[^"]*Border[^"]*">[\s\S]*?<\/div>/g, '');
        
        return content;
    }

    async scrapeForWebsiteSolution(prompt) {
        console.log(`Scraping GitHub for: ${prompt}`);
        
        // Search for relevant repositories
        const repos = await this.searchRepos(prompt);
        
        // Look for HTML/CSS/JS solutions in the top repositories
        for (const repo of repos) {
            console.log(`Examining repository: ${repo.full_name}`);
            
            const htmlContent = await this.extractHTMLFromRepo(repo.full_name);
            if (htmlContent && htmlContent.length > 0) {
                const processedContent = this.processScrapedContent(htmlContent);
                return {
                    repo: repo.full_name,
                    html: processedContent,
                    description: repo.description,
                    stars: repo.stargazers_count,
                    url: repo.html_url
                };
            }
        }

        // If no complete solutions found, search for code snippets
        const codeSnippets = await this.searchCode(prompt);
        
        let combinedCode = '';
        for (const snippet of codeSnippets) {
            const content = await this.scrapeCodeContent(snippet.download_url);
            if (content) {
                combinedCode += this.processScrapedContent(content) + '\n\n';
            }
        }

        return {
            repo: null,
            html: combinedCode,
            description: 'Code snippets from various sources',
            stars: 0,
            url: null
        };
    }
    
    // New function to analyze website requirements from prompt
    analyzePrompt(prompt) {
        const analysis = {
            type: null,
            features: [],
            technologies: [],
            layout: null,
            complexity: 'medium'
        };
        
        const promptLower = prompt.toLowerCase();
        
        // Determine website type
        if (promptLower.includes('portfolio')) analysis.type = 'portfolio';
        else if (promptLower.includes('blog')) analysis.type = 'blog';
        else if (promptLower.includes('ecommerce') || promptLower.includes('shop')) analysis.type = 'ecommerce';
        else if (promptLower.includes('landing')) analysis.type = 'landing';
        else if (promptLower.includes('business')) analysis.type = 'business';
        else if (promptLower.includes('restaurant')) analysis.type = 'restaurant';
        else if (promptLower.includes('agency')) analysis.type = 'agency';
        else if (promptLower.includes('personal')) analysis.type = 'personal';
        else analysis.type = 'general';
        
        // Identify required features
        if (promptLower.includes('responsive') || promptLower.includes('mobile')) analysis.features.push('responsive');
        if (promptLower.includes('navigation') || promptLower.includes('menu')) analysis.features.push('navigation');
        if (promptLower.includes('contact')) analysis.features.push('contact_form');
        if (promptLower.includes('gallery') || promptLower.includes('images')) analysis.features.push('gallery');
        if (promptLower.includes('slider') || promptLower.includes('carousel')) analysis.features.push('slider');
        if (promptLower.includes('footer')) analysis.features.push('footer');
        if (promptLower.includes('header')) analysis.features.push('header');
        if (promptLower.includes('blog') || promptLower.includes('posts')) analysis.features.push('blog');
        if (promptLower.includes('shop') || promptLower.includes('products')) analysis.features.push('products');
        if (promptLower.includes('login') || promptLower.includes('authentication')) analysis.features.push('authentication');
        if (promptLower.includes('dashboard')) analysis.features.push('dashboard');
        if (promptLower.includes('search')) analysis.features.push('search');
        if (promptLower.includes('chat') || promptLower.includes('messaging')) analysis.features.push('chat');
        if (promptLower.includes('map') || promptLower.includes('location')) analysis.features.push('map');
        if (promptLower.includes('video') || promptLower.includes('media')) analysis.features.push('media');
        
        // Identify preferred technologies
        if (promptLower.includes('bootstrap')) analysis.technologies.push('bootstrap');
        if (promptLower.includes('tailwind')) analysis.technologies.push('tailwind');
        if (promptLower.includes('vanilla')) analysis.technologies.push('vanilla_js');
        if (promptLower.includes('react')) analysis.technologies.push('react');
        if (promptLower.includes('vue')) analysis.technologies.push('vue');
        if (promptLower.includes('angular')) analysis.technologies.push('angular');
        if (promptLower.includes('jquery')) analysis.technologies.push('jquery');
        
        // Determine layout
        if (promptLower.includes('single page') || promptLower.includes('one page')) analysis.layout = 'single_page';
        else analysis.layout = 'multi_section';
        
        // Determine complexity
        if (promptLower.includes('simple') || promptLower.includes('basic')) analysis.complexity = 'simple';
        else if (promptLower.includes('complex') || promptLower.includes('advanced')) analysis.complexity = 'complex';
        
        return analysis;
    }
    
    // Function to generate more targeted search queries based on analysis
    generateSearchQueries(prompt) {
        const analysis = this.analyzePrompt(prompt);
        const queries = [];
        
        // Base query
        queries.push(prompt);
        
        // Type-specific queries
        queries.push(`${analysis.type} website`);
        queries.push(`${analysis.type} html template`);
        
        // Feature-specific queries
        if (analysis.features.length > 0) {
            for (const feature of analysis.features) {
                queries.push(`${prompt} ${feature}`);
                queries.push(`${analysis.type} ${feature}`);
            }
        }
        
        // Technology-specific queries
        if (analysis.technologies.length > 0) {
            for (const tech of analysis.technologies) {
                queries.push(`${prompt} ${tech}`);
                queries.push(`${analysis.type} ${tech}`);
            }
        }
        
        // Complexity-specific queries
        queries.push(`${prompt} ${analysis.complexity}`);
        
        return [...new Set(queries)]; // Remove duplicates
    }
    
    // Enhanced scraping function with better analysis
    async enhancedScrapeForWebsiteSolution(prompt) {
        console.log(`Enhanced scraping for: ${prompt}`);
        
        const searchQueries = this.generateSearchQueries(prompt);
        console.log(`Generated search queries: ${searchQueries.join(', ')}`);
        
        // Try each search query in sequence
        for (const query of searchQueries) {
            console.log(`Trying query: ${query}`);
            
            // First try searching for repositories
            const repos = await this.searchRepos(query);
            
            for (const repo of repos) {
                console.log(`Examining repository: ${repo.full_name}`);
                
                const htmlContent = await this.extractHTMLFromRepo(repo.full_name);
                if (htmlContent && htmlContent.length > 0) {
                    const processedContent = this.processScrapedContent(htmlContent);
                    return {
                        repo: repo.full_name,
                        html: processedContent,
                        description: repo.description,
                        stars: repo.stargazers_count,
                        url: repo.html_url,
                        queryUsed: query
                    };
                }
            }
            
            // If no repo solutions found, try searching for code snippets
            const codeSnippets = await this.searchCode(query);
            
            let combinedCode = '';
            for (const snippet of codeSnippets) {
                const content = await this.scrapeCodeContent(snippet.download_url);
                if (content) {
                    combinedCode += this.processScrapedContent(content) + '\n\n';
                }
            }
            
            if (combinedCode && combinedCode.length > 0) {
                return {
                    repo: null,
                    html: combinedCode,
                    description: `Code snippets from query: ${query}`,
                    stars: 0,
                    url: null,
                    queryUsed: query
                };
            }
        }
        
        // If all queries fail, return empty result
        return {
            repo: null,
            html: '',
            description: 'No matching code found',
            stars: 0,
            url: null,
            queryUsed: 'none'
        };
    }
}

module.exports = GitHubScraper;

// Example usage:
if (require.main === module) {
    const scraper = new GitHubScraper();
    
    // Example: scrape for a specific website type
    scraper.enhancedScrapeForWebsiteSolution('responsive portfolio website with contact form')
        .then(result => {
            console.log('Enhanced scraped result:', result);
        })
        .catch(err => {
            console.error('Enhanced scraping failed:', err);
        });
}