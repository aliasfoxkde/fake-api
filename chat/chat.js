let selectedModel = 'grok-beta'; // Default model
let menuOpen = false;

// Open/Close Left Menu
function toggleMenu() {
    menuOpen = !menuOpen;
    document.getElementById('left-menu').classList.toggle('active', menuOpen);
}

document.getElementById('menu-btn').addEventListener('click', toggleMenu);
document.getElementById('menu-close-btn').addEventListener('click', toggleMenu);

// Handle theme toggle (dark/light mode)
document.getElementById('theme-toggle').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const themeButton = document.getElementById('theme-toggle');
    themeButton.textContent = document.body.classList.contains('dark-mode') ? 'Light Mode' : 'Dark Mode';
});

// Handle LLM selection
document.getElementById('llm-select').addEventListener('change', (event) => {
    selectedModel = event.target.value;
});

// Handle image upload
document.getElementById('file-upload-btn').addEventListener('click', () => {
    document.getElementById('image-upload').click();
});

document.getElementById('image-upload').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageUrl = e.target.result;
            startChatWithImage(imageUrl);
        };
        reader.readAsDataURL(file);
    }
});

// Start chat with image
async function startChatWithImage(imageUrl) {
    try {
        await authenticateUser();
        const response = await puter.ai.chat("What do you see?", imageUrl);
        puter.print(response.text);
    } catch (error) {
        console.error("Error during image processing:", error);
    }
}

// Start chat and stream response
async function streamResponse(question) {
    try {
        await authenticateUser();
        const response = await puter.ai.chat(question, { model: selectedModel, stream: true });

        let messagesDiv = document.getElementById("messages");
        let loadingMessage = document.createElement("div");
        loadingMessage.classList.add("loading");
        loadingMessage.textContent = "AI is typing...";
        messagesDiv.appendChild(loadingMessage);

        let aiMessageText = "";
        for await (const part of response) {
            loadingMessage.remove();
            aiMessageText += part?.text || "";
        }

        let aiMessage = document.createElement("div");
        aiMessage.classList.add("message", "ai");

        let pre = document.createElement("pre");
        pre.textContent = aiMessageText;
        aiMessage.appendChild(pre);

        let copyButton = document.createElement("button");
        copyButton.classList.add("copy-button");
        copyButton.innerHTML = "📋";
        copyButton.onclick = () => copyToClipboard(aiMessageText);
        aiMessage.appendChild(copyButton);

        messagesDiv.appendChild(aiMessage);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    } catch (error) {
        console.error("Error:", error);
    }
}

// Handle text input and send message
document.getElementById("send-btn").addEventListener("click", () => {
    const inputField = document.getElementById("input");
    const userMessage = inputField.value.trim();
    if (userMessage) {
        let messagesDiv = document.getElementById("messages");
        let userMessageDiv = document.createElement("div");
        userMessageDiv.classList.add("message", "user");

        let pre = document.createElement("pre");
        pre.textContent = userMessage;
        userMessageDiv.appendChild(pre);

        let copyButton = document.createElement("button");
        copyButton.classList.add("copy-button");
        copyButton.innerHTML = "📋";
        copyButton.onclick = () => copyToClipboard(userMessage);
        userMessageDiv.appendChild(copyButton);

        messagesDiv.appendChild(userMessageDiv);
        inputField.value = "";
        messagesDiv.scrollTop = messagesDiv.scrollHeight;

        // Start streaming the response
        streamResponse(userMessage);
    }
});

// Copy message to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Copied to clipboard!');
    });
}

// Authenticate the user
async function authenticateUser() {
    try {
        await puter.auth.signIn({ request_auth: true });
    } catch (error) {
        console.error("Authentication failed:", error);
    }
}
