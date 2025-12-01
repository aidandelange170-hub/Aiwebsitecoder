// Client-side JavaScript for the AI Website Builder
document.addEventListener('DOMContentLoaded', function() {
    const promptInput = document.getElementById('prompt-input');
    const generateBtn = document.getElementById('generate-btn');
    const previewFrame = document.getElementById('preview-frame');
    const generatedCode = document.getElementById('generated-code');
    const statusDiv = document.createElement('div');
    statusDiv.id = 'status-info';
    statusDiv.style.cssText = 'margin-top: 10px; padding: 10px; background-color: #e3f2fd; border-radius: 4px; display: none;';
    document.getElementById('input-section').appendChild(statusDiv);
    
    // Function to generate website based on user prompt
    generateBtn.addEventListener('click', async function() {
        const prompt = promptInput.value.trim();
        
        if (!prompt) {
            alert('Please enter a website description');
            return;
        }
        
        // Show loading state
        generateBtn.disabled = true;
        generateBtn.textContent = 'Generating...';
        statusDiv.style.display = 'block';
        statusDiv.innerHTML = '<p>Analyzing your request and searching GitHub for solutions...</p>';
        
        try {
            // Send request to server to generate website
            const response = await fetch('/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ prompt: prompt })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Server error: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Update preview and code display
            previewFrame.srcdoc = data.html;
            generatedCode.textContent = data.html;
            
            // Show status information
            statusDiv.innerHTML = `
                <p><strong>Generation complete!</strong></p>
                <p><strong>Source:</strong> ${data.source || 'N/A'}</p>
                <p><strong>Query used:</strong> ${data.queryUsed || 'N/A'}</p>
                <p><strong>Features detected:</strong> ${data.analysis.features.join(', ') || 'None'}</p>
                <p><strong>Type:</strong> ${data.analysis.type}</p>
            `;
            
        } catch (error) {
            console.error('Error generating website:', error);
            statusDiv.innerHTML = `<p style="color: red;"><strong>Error:</strong> ${error.message}</p>`;
            alert('Error generating website: ' + error.message);
        } finally {
            // Reset button state
            generateBtn.disabled = false;
            generateBtn.textContent = 'Generate Website';
        }
    });
    
    // Add event listener for real-time analysis as user types
    let analysisTimeout;
    promptInput.addEventListener('input', function() {
        clearTimeout(analysisTimeout);
        
        const prompt = promptInput.value.trim();
        if (prompt.length > 10) {
            // Show a hint that the user can click generate
            generateBtn.style.backgroundColor = '#2ecc71';
            
            // Perform analysis after user stops typing
            analysisTimeout = setTimeout(async function() {
                try {
                    const response = await fetch('/analyze', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ prompt: prompt })
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        statusDiv.style.display = 'block';
                        statusDiv.innerHTML = `
                            <p><strong>Analysis:</strong></p>
                            <p><strong>Type:</strong> ${data.analysis.type}</p>
                            <p><strong>Features:</strong> ${data.analysis.features.join(', ') || 'None'}</p>
                            <p><strong>Technologies:</strong> ${data.analysis.technologies.join(', ') || 'None'}</p>
                            <p><strong>Search queries that will be used:</strong></p>
                            <ul>
                                ${data.searchQueries.map(query => `<li>${query}</li>`).join('')}
                            </ul>
                        `;
                    }
                } catch (error) {
                    console.error('Error analyzing prompt:', error);
                }
            }, 1000); // Wait 1 second after user stops typing
        } else {
            generateBtn.style.backgroundColor = '#3498db';
            statusDiv.style.display = 'none';
        }
    });
    
    // Add keyboard shortcut for generating (Ctrl+Enter)
    promptInput.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'Enter') {
            generateBtn.click();
        }
    });
    
    // Add a refresh preview button
    const refreshBtn = document.createElement('button');
    refreshBtn.textContent = 'Refresh Preview';
    refreshBtn.style.cssText = 'margin-left: 10px; background-color: #95a5a6; color: white; padding: 12px 20px; border: none; border-radius: 4px; cursor: pointer; font-size: 1rem; transition: background-color 0.3s;';
    refreshBtn.addEventListener('click', function() {
        previewFrame.src = previewFrame.src; // Reload iframe
    });
    generateBtn.parentNode.appendChild(refreshBtn);
    
    // Add a download button for the generated code
    const downloadBtn = document.createElement('button');
    downloadBtn.textContent = 'Download HTML';
    downloadBtn.style.cssText = 'margin-left: 10px; background-color: #9b59b6; color: white; padding: 12px 20px; border: none; border-radius: 4px; cursor: pointer; font-size: 1rem; transition: background-color 0.3s;';
    downloadBtn.addEventListener('click', function() {
        if (generatedCode.textContent) {
            const blob = new Blob([generatedCode.textContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'generated-website.html';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } else {
            alert('No code to download. Please generate a website first.');
        }
    });
    generateBtn.parentNode.appendChild(downloadBtn);
    
    // Add status check on page load
    fetch('/status')
        .then(response => response.json())
        .then(data => {
            console.log('Server status:', data);
        })
        .catch(error => {
            console.error('Error checking server status:', error);
        });
});