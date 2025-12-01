// Simple test to verify the application structure
const fs = require('fs');
const path = require('path');

console.log('AI Website Builder v2.0.0 - Structure Verification');
console.log('=====================================================');

// Check if all required directories exist
const requiredDirs = [
    'config',
    'middleware', 
    'server',
    'src',
    'utils',
    'public',
    'logs'
];

console.log('\n📁 Checking directories...');
requiredDirs.forEach(dir => {
    const exists = fs.existsSync(path.join(__dirname, dir));
    console.log(`  ${exists ? '✅' : '❌'} ${dir}/`);
});

// Check if all required files exist
const requiredFiles = [
    'config/config.js',
    'middleware/security.js',
    'server/server.js',
    'src/scrap.js',
    'utils/htmlProcessor.js',
    'public/index.html',
    'public/app.js',
    'public/styles.css',
    'package.json',
    'README.md',
    '.env'
];

console.log('\n📄 Checking files...');
requiredFiles.forEach(file => {
    const exists = fs.existsSync(path.join(__dirname, file));
    console.log(`  ${exists ? '✅' : '❌'} ${file}`);
});

// Check package.json content
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
console.log(`\n📦 Version: ${packageJson.version}`);
console.log(`📋 Name: ${packageJson.name}`);

// Check if dependencies are properly defined
console.log('\n🛠️ Dependencies check:');
if (packageJson.dependencies && Object.keys(packageJson.dependencies).length > 0) {
    console.log('  ✅ Dependencies found');
} else {
    console.log('  ❌ No dependencies found');
}

if (packageJson.devDependencies && Object.keys(packageJson.devDependencies).length > 0) {
    console.log('  ✅ Dev dependencies found');
} else {
    console.log('  ❌ No dev dependencies found');
}

console.log('\n🎉 Verification complete!');
console.log('\nTo start the application, run:');
console.log('  npm start');
console.log('\nTo run in development mode:');
console.log('  npm run dev');