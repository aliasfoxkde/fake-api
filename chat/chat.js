async function streamClaudeResponse(question) {
    try {
        const response = await puter.ai.chat(
            question,
            { model: 'claude-3-5-sonnet', stream: true }
        );

        let messagesDiv = document.getElementById('messages');
        let loadingMessage = document.createElement('div');
        loadingMessage.classList.add('loading');
        loadingMessage.textContent = "AI is typing...";
        messagesDiv.appendChild(loadingMessage);

        let aiMessageText = '';

        // Accumulate AI message in one block
        for await (const part of response) {
            loadingMessage.remove();
            aiMessageText += part?.text || '';
        }

        let aiMessage = document.createElement('div');
        aiMessage.classList.add('message', 'ai');
        
        // Create pre tag for formatted output
        let pre = document.createElement('pre');
        pre.textContent = aiMessageText;
        aiMessage.appendChild(pre);

        // Copy button for the message
        let copyButton = document.createElement('button');
        copyButton.classList.add('copy-button');
        copyButton.innerHTML = '<i class="fa fa-copy"></i>';
        copyButton.onclick = () => copyToClipboard(aiMessageText);
        aiMessage.appendChild(copyButton);

        messagesDiv.appendChild(aiMessage);
        
        // Scroll to bottom only if the content is not scrolled
        if (messagesDiv.scrollHeight - messagesDiv.scrollTop === messagesDiv.clientHeight) {
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }

        // Add a pin to the bottom if there’s a lot of space
        if (messagesDiv.scrollHeight <= messagesDiv.clientHeight) {
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }
    } catch (error) {
        console.error('Error:', error);

        // Check if the error is session/authentication-related
        if (error.error && error.error.includes('no fallback model available') || error.error.includes('authentication')) {
            // Redirect to authentication URL if session is expired or invalid
            alert('Your session has expired. Redirecting for re-authentication...');
            window.location.href = "https://puter.com/?embedded_in_popup=true&request_auth=true";
        } else {
            // Handle other errors gracefully
            alert('An error occurred. Please try again later.');
        }
    }
}

function sendMessage() {
    let inputField = document.getElementById('input');
    let userMessage = inputField.value.trim();

    if (userMessage) {
        let messagesDiv = document.getElementById('messages');
        let userMessageDiv = document.createElement('div');
        userMessageDiv.classList.add('message');
        
        // Create pre tag for formatted output
        let pre = document.createElement('pre');
        pre.textContent = userMessage;
        userMessageDiv.appendChild(pre);

        // Copy button for the message
        let copyButton = document.createElement('button');
        copyButton.classList.add('copy-button');
        copyButton.innerHTML = '<i class="fa fa-copy"></i>';
        copyButton.onclick = () => copyToClipboard(userMessage);
        userMessageDiv.appendChild(copyButton);

        messagesDiv.appendChild(userMessageDiv);
        inputField.value = ''; // Clear input field
        messagesDiv.scrollTop = messagesDiv.scrollHeight; // Scroll to bottom

        streamClaudeResponse(userMessage); // Send the user message to Claude AI
    }
}

// Allow sending message on pressing Enter key
document.getElementById('input').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Message copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy message: ', err);
    });
}
