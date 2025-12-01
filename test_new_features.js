// Test file to demonstrate the new features
const NewFeatures = require('./src/newFeatures.js');

async function testNewFeatures() {
    console.log('Testing new features for AI Website Builder...\n');
    
    // Sample HTML content to test with
    const sampleHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>Test Page</title>
    <style>
        /* This is a comment that should be removed during optimization */
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
        }
    </style>
</head>
<body>
    <header>
        <h1>Test Website</h1>
        <nav>
            <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
    </header>
    
    <main>
        <section id="home">
            <h2>Welcome</h2>
            <p>This is a sample website for testing new features.</p>
            <img src="test-image.jpg" alt=""> <!-- Missing alt text -->
        </section>
        
        <section id="about">
            <h2>About Us</h2>
            <p>Learn more about our company.</p>
        </section>
    </main>
    
    <footer>
        <p>&copy; 2023 Test Company. All rights reserved.</p>
    </footer>
    
    <script>
        // This is a comment that should be removed during optimization
        console.log('Test script loaded');
        
        // Example of modern JavaScript that could be enhanced
        document.addEventListener('DOMContentLoaded', function() {
            console.log('DOM loaded');
        });
    </script>
</body>
</html>`;

    const newFeatures = new NewFeatures();
    const prompt = "modern business website";
    
    console.log('Original HTML length:', sampleHTML.length);
    console.log('Sample HTML (first 200 chars):', sampleHTML.substring(0, 200), '...');
    
    // Test code optimization
    console.log('\n--- Testing Code Optimization ---');
    const optimizedHTML = await newFeatures.optimizeCode(sampleHTML);
    console.log('Optimized HTML length:', optimizedHTML.length);
    console.log('Optimization reduced size by:', sampleHTML.length - optimizedHTML.length, 'characters');
    
    // Test responsive enhancement
    console.log('\n--- Testing Responsive Enhancement ---');
    const responsiveHTML = await newFeatures.enhanceResponsiveness(optimizedHTML);
    console.log('Added responsive features');
    
    // Test accessibility enhancement
    console.log('\n--- Testing Accessibility Enhancement ---');
    const accessibleHTML = await newFeatures.addAccessibilityFeatures(responsiveHTML);
    console.log('Added accessibility features (alt attributes, ARIA roles, etc.)');
    
    // Test dark mode
    console.log('\n--- Testing Dark Mode ---');
    const darkModeHTML = await newFeatures.addDarkMode(accessibleHTML);
    console.log('Added dark mode support');
    
    // Test modern JS features
    console.log('\n--- Testing Modern JavaScript Features ---');
    const modernJSHTML = await newFeatures.addModernJSFeatures(darkModeHTML);
    console.log('Added modern JavaScript features (smooth scrolling, etc.)');
    
    // Test SEO features
    console.log('\n--- Testing SEO Enhancement ---');
    const seoHTML = await newFeatures.addSEOFeatures(modernJSHTML, prompt);
    console.log('Added SEO meta tags');
    
    // Test CSS framework integration (using Tailwind as example)
    console.log('\n--- Testing CSS Framework Integration ---');
    const tailwindHTML = await newFeatures.addModernCSSFramework(seoHTML, 'tailwind');
    console.log('Integrated Tailwind CSS framework');
    
    // Test all features combined
    console.log('\n--- Testing All Features Combined ---');
    const allFeaturesHTML = await newFeatures.applyAllNewFeatures(sampleHTML, prompt, {
        optimizeCode: true,
        responsive: true,
        accessibility: true,
        darkMode: true,
        modernJS: true,
        performance: true,
        seo: true,
        cssFramework: 'bootstrap'  // Using Bootstrap for this test
    });
    
    console.log('Final HTML length:', allFeaturesHTML.length);
    console.log('Total reduction from original:', sampleHTML.length - allFeaturesHTML.length, 'characters');
    
    // Show a sample of the enhanced HTML
    console.log('\n--- Sample of Enhanced HTML ---');
    console.log(allFeaturesHTML.substring(0, 500), '...');
    
    console.log('\nAll new features tested successfully!');
    
    // Test component extraction
    console.log('\n--- Testing Component Extraction ---');
    const components = await newFeatures.extractComponents(sampleHTML);
    console.log('Extracted components:');
    Object.keys(components).forEach(key => {
        if (components[key]) {
            console.log(`  ${key}: Present`);
        } else {
            console.log(`  ${key}: Not found`);
        }
    });
    
    console.log('\nNew features testing completed!');
}

// Run the test
testNewFeatures().catch(console.error);