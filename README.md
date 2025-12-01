# AI Website Builder v2.0.0

AI-Powered Website Builder that generates websites from prompts using GitHub code snippets.

## 🚀 Features

- **AI-Powered Generation**: Describe your website and get a fully functional website generated automatically
- **GitHub Code Scraping**: Leverages real GitHub repositories to find the best code examples
- **Responsive Design**: Generates mobile-friendly, responsive websites
- **Security Enhanced**: Includes XSS protection, rate limiting, and input validation
- **Real-time Preview**: See your generated website in real-time
- **Code Download**: Download the generated HTML file
- **Smart Analysis**: Analyzes your prompt to determine the best features and technologies

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Frontend**: HTML, CSS, JavaScript
- **Scraping**: Axios, Cheerio
- **Security**: Helmet, express-rate-limit, xss, validator
- **Configuration**: Custom config system

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## 🚀 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-website-builder
```

2. Install dependencies:
```bash
npm install
```

3. Start the application:
```bash
npm start
```

Or for development with auto-restart:
```bash
npm run dev
```

4. Open your browser and go to `http://localhost:3000`

## 📖 Usage

1. Describe your website in the text area (e.g., "A responsive portfolio website with a gallery and contact form")
2. Click "Generate Website"
3. View the real-time preview
4. Download the generated HTML if satisfied

### Example Prompts

- "A responsive business website with navigation and contact form"
- "A portfolio website with gallery and about section"
- "A blog website with posts and search functionality"
- "A restaurant website with menu and reservation form"

## 🏗️ Project Structure

```
/workspace/
├── config/
│   └── config.js          # Application configuration
├── middleware/
│   └── security.js        # Security middleware
├── server/
│   └── server.js          # Main server file
├── src/
│   └── scrap.js           # GitHub scraping logic
├── utils/
│   └── htmlProcessor.js   # HTML processing utilities
├── public/
│   ├── index.html         # Main HTML file
│   ├── app.js             # Frontend JavaScript
│   └── styles.css         # Frontend styles
├── package.json
└── README.md
```

## 🔧 Configuration

The application uses a configuration file (`config/config.js`) that allows you to customize:

- Server settings (port, host)
- GitHub API settings (rate limits, timeouts)
- Security settings (CORS, rate limiting)
- Feature flags (caching, validation)

You can also use environment variables to override default settings:

```bash
PORT=3001
GITHUB_RATE_LIMIT_DELAY=2000
ENABLE_RATE_LIMITING=true
MAX_REQUESTS_PER_MINUTE=30
```

## 🛡️ Security Features

- **Rate Limiting**: Prevents abuse with 60 requests per minute per IP
- **Input Validation**: Validates and sanitizes all user inputs
- **XSS Protection**: Sanitizes generated HTML to prevent cross-site scripting
- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Adds security headers to HTTP responses

## 📊 API Endpoints

- `GET /` - Main application page
- `POST /generate` - Generate website from prompt
- `POST /analyze` - Analyze prompt without generating
- `GET /status` - Get application status

## 🧪 Testing

Run tests with:
```bash
npm test
```

## 🔄 Update Log

### v2.0.0 - Major Update (December 2025)

#### 🚀 New Features
- **Enhanced Security**: Added rate limiting, input validation, and XSS protection
- **Configuration System**: Added comprehensive config management
- **Retry Logic**: Implemented GitHub API request retry mechanism
- **Better Analysis**: Enhanced prompt analysis with more features and technologies
- **Improved Templates**: Better default templates with more styling options
- **Error Handling**: Comprehensive error handling throughout the application
- **Performance**: Optimized scraping and response times

#### 🔧 Improvements
- **Code Structure**: Reorganized code into logical directories
- **HTML Processing**: Added HTML validation and minification utilities
- **Scraping Logic**: Improved GitHub repository traversal and content extraction
- **Frontend**: Enhanced user interface with better feedback
- **Documentation**: Comprehensive README with usage instructions

#### 🐛 Bug Fixes
- Fixed XSS vulnerabilities in HTML output
- Fixed GitHub API rate limit handling
- Fixed path resolution issues in server.js
- Fixed HTML template generation bugs
- Fixed CORS configuration issues
- Fixed memory leaks in recursive directory traversal

#### 📝 Changes
- Updated package.json with new dependencies and scripts
- Added middleware directory for security and validation
- Added utils directory for utility functions
- Added config directory for application settings
- Updated frontend to work with new backend changes
- Improved error messages and logging

### v1.0.0 - Initial Release
- Basic website generation from GitHub code snippets
- Simple HTML/CSS/JS extraction
- Basic prompt analysis
- Frontend interface with preview

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions, please file an issue in the repository.

## 🙏 Acknowledgments

- GitHub API for providing code repositories
- Express.js for the web framework
- Axios for HTTP requests
- All open-source libraries used in this project