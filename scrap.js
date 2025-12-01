// GitHub Scraper for AI Website Builder
const axios = require('axios');
const cheerio = require('cheerio');

class GitHubScraper {
    constructor() {
        this.searchEndpoints = {
            code: 'https://api.github.com/search/code',
            repos: 'https://api.github.com/search/repositories'
        };
    }

    async searchCode(query, language = 'html') {
        try {
            const response = await axios.get(this.searchEndpoints.code, {
                params: {
                    q: `${query} language:${language}`,
                    sort: 'stars',
                    order: 'desc',
                    per_page: 10
                },
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'AI-Website-Builder'
                }
            });

            return response.data.items || [];
        } catch (error) {
            console.error('Error searching GitHub code:', error.message);
            return [];
        }
    }

    async searchRepos(query) {
        try {
            const response = await axios.get(this.searchEndpoints.repos, {
                params: {
                    q: query,
                    sort: 'stars',
                    order: 'desc',
                    per_page: 10
                },
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'AI-Website-Builder'
                }
            });

            return response.data.items || [];
        } catch (error) {
            console.error('Error searching GitHub repos:', error.message);
            return [];
        }
    }

    async scrapeCodeContent(downloadUrl) {
        try {
            const response = await axios.get(downloadUrl);
            return response.data;
        } catch (error) {
            console.error('Error scraping code content:', error.message);
            return null;
        }
    }

    async extractHTMLFromRepo(repoFullName) {
        try {
            // Get repository contents
            const contentsUrl = `https://api.github.com/repos/${repoFullName}/contents`;
            const response = await axios.get(contentsUrl, {
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'AI-Website-Builder'
                }
            });

            const contents = response.data;
            let htmlContent = '';

            // Look for HTML files in the repository
            for (const item of contents) {
                if (item.type === 'file' && item.name.endsWith('.html')) {
                    const fileContent = await this.scrapeCodeContent(item.download_url);
                    if (fileContent) {
                        htmlContent += fileContent + '\n\n';
                    }
                } else if (item.type === 'dir') {
                    // Recursively search in subdirectories
                    const subDirContents = await axios.get(item.url, {
                        headers: {
                            'Accept': 'application/vnd.github.v3+json',
                            'User-Agent': 'AI-Website-Builder'
                        }
                    });
                    
                    for (const subItem of subDirContents.data) {
                        if (subItem.type === 'file' && subItem.name.endsWith('.html')) {
                            const fileContent = await this.scrapeCodeContent(subItem.download_url);
                            if (fileContent) {
                                htmlContent += fileContent + '\n\n';
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

    async scrapeForWebsiteSolution(prompt) {
        console.log(`Scraping GitHub for: ${prompt}`);
        
        // Search for relevant repositories
        const repos = await this.searchRepos(prompt);
        
        // Look for HTML/CSS/JS solutions in the top repositories
        for (const repo of repos) {
            console.log(`Examining repository: ${repo.full_name}`);
            
            const htmlContent = await this.extractHTMLFromRepo(repo.full_name);
            if (htmlContent && htmlContent.length > 0) {
                return {
                    repo: repo.full_name,
                    html: htmlContent,
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
                combinedCode += content + '\n\n';
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
}

module.exports = GitHubScraper;

// Example usage:
if (require.main === module) {
    const scraper = new GitHubScraper();
    
    // Example: scrape for a specific website type
    scraper.scrapeForWebsiteSolution('responsive portfolio website')
        .then(result => {
            console.log('Scraped result:', result);
        })
        .catch(err => {
            console.error('Scraping failed:', err);
        });
}