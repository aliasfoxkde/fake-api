import express from 'express';
import cors from 'cors';
import { createServer } from 'http';

const app = express();
const httpServer = createServer(app);

// API key for authentication (in a real app, this would be stored securely)
const API_KEY = 'sk-test-123456789';

// Middleware for CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Middleware to check API key
const authenticateKey = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid API key' });
    }
    const key = authHeader.split(' ')[1];
    if (key !== API_KEY) {
        return res.status(401).json({ error: 'Invalid API key' });
    }
    next();
};

// Authenticate to puter
let puterAuthenticated = false;
const authenticatePuter = async () => {
    if (!puterAuthenticated) {
        try {
            await puter.auth.signIn();
            puterAuthenticated = true;
            console.log('Successfully authenticated with puter');
        } catch (error) {
            console.error('Failed to authenticate with puter:', error);
            throw error;
        }
    }
};

// OpenAI-compatible chat completion endpoint
app.post('/v1/chat/completions', authenticateKey, async (req, res) => {
    try {
        // Ensure puter is authenticated
        await authenticatePuter();

        const { messages } = req.body;
        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Invalid messages format' });
        }

        // Get the last message content
        const lastMessage = messages[messages.length - 1];
        const content = lastMessage.content;

        // Set up SSE for streaming
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // Stream the response using puter.ai.chat
        const response = await puter.ai.chat(content, {
            model: 'claude-3-5-sonnet',
            stream: true
        });

        for await (const part of response) {
            // Format response in OpenAI-compatible format
            const chunk = {
                id: 'chatcmpl-' + Date.now(),
                object: 'chat.completion.chunk',
                created: Math.floor(Date.now() / 1000),
                model: 'claude-3-5-sonnet',
                choices: [{
                    index: 0,
                    delta: {
                        content: part?.text || ''
                    },
                    finish_reason: null
                }]
            };
            res.write(`data: ${JSON.stringify(chunk)}\n\n`);
        }

        // Send the final chunk
        const finalChunk = {
            id: 'chatcmpl-' + Date.now(),
            object: 'chat.completion.chunk',
            created: Math.floor(Date.now() / 1000),
            model: 'claude-3-5-sonnet',
            choices: [{
                index: 0,
                delta: {},
                finish_reason: 'stop'
            }]
        };
        res.write(`data: ${JSON.stringify(finalChunk)}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Serve static files
app.use(express.static('.'));

const PORT = 3000;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
