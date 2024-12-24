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
        return res.status(401).json({
            error: {
                message: "Missing bearer authentication in header",
                type: "invalid_request_error",
                param: null,
                code: "invalid_auth"
            }
        });
    }
    const key = authHeader.split(' ')[1];
    if (key !== API_KEY) {
        return res.status(401).json({
            error: {
                message: "Invalid API key",
                type: "invalid_request_error",
                param: null,
                code: "invalid_api_key"
            }
        });
    }
    next();
};

// Models endpoint - handle both paths for compatibility
app.get(['/api/v1/models', '/v1/models'], authenticateKey, (req, res) => {
    res.json({
        data: [
            {
                id: "claude-3-5-sonnet",
                object: "model",
                created: 1677610602,
                owned_by: "puter",
                permission: [{
                    id: "modelperm-1234",
                    object: "model_permission",
                    created: 1677610602,
                    allow_create_engine: false,
                    allow_sampling: true,
                    allow_logprobs: true,
                    allow_search_indices: false,
                    allow_view: true,
                    allow_fine_tuning: false,
                    organization: "*",
                    group: null,
                    is_blocking: false
                }],
                root: "claude-3-5-sonnet",
                parent: null
            }
        ],
        object: "list"
    });
});

// Chat completions endpoint - handle both paths for compatibility
app.post(['/api/v1/chat/completions', '/v1/chat/completions'], authenticateKey, async (req, res) => {
    try {
        const { messages } = req.body;
        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({
                error: {
                    message: "Invalid messages format",
                    type: "invalid_request_error",
                    param: "messages",
                    code: "invalid_messages"
                }
            });
        }

        // Get the last message content
        const lastMessage = messages[messages.length - 1];
        const content = lastMessage.content;

        // Set up SSE for streaming
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // Simulate streaming response (in production, connect to Puter API)
        const words = content.split(' ');
        for (let i = 0; i < words.length; i++) {
            const chunk = {
                id: 'chatcmpl-' + Date.now(),
                object: 'chat.completion.chunk',
                created: Math.floor(Date.now() / 1000),
                model: 'claude-3-5-sonnet',
                choices: [{
                    index: 0,
                    delta: {
                        content: words[i] + ' '
                    },
                    finish_reason: null
                }]
            };
            res.write(`data: ${JSON.stringify(chunk)}\n\n`);
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Send final chunk
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
        res.status(500).json({
            error: {
                message: "Internal server error occurred",
                type: "internal_error",
                param: null,
                code: "internal_error"
            }
        });
    }
});

// Serve static files
app.use(express.static('.'));

const PORT = 3000;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
